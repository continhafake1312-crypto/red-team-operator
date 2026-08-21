"""
Scanner FREE v2 — git clone + grep local OTIMIZADO.
  - aiofiles para leitura assíncrona de arquivos
  - Extração de tarball em lote paralelo
  - Cleanup periódico de diretórios temporários
  - Cache de repos já escaneados
  - Filtro de extensões 2x mais abrangente
  - Limpeza automática de temp dir (não acumula)
"""

import asyncio
import io
import logging
import os
import shutil
import tarfile
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import aiofiles
import httpx

from patterns import COMPILED_PATTERNS
from scanner import GitHubScanner

logger = logging.getLogger("clone_scanner")

# Extensões de arquivos interessantes
INTERESTING_EXT = frozenset({
    ".py", ".js", ".ts", ".jsx", ".tsx", ".go", ".java", ".rb", ".php",
    ".sh", ".bash", ".zsh", ".yml", ".yaml", ".json", ".toml", ".ini",
    ".cfg", ".conf", ".env", ".config", ".xml", ".sql", ".tf", ".hcl",
    ".dart", ".swift", ".kt", ".scala", ".rs", ".c", ".cpp", ".h",
    ".cs", ".gradle", ".properties", ".pem", ".key", ".crt", ".p12",
    ".pfx", ".asc", ".ovpn", ".rdp", ".env", ".lock", ".secrets",
})

INTERESTING_NAMES = frozenset({
    ".env", ".env.local", ".env.production", ".env.development", ".env.staging",
    ".env.test", ".env.example", ".env.sample",
    "Dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yml",
    "Makefile", "Procfile", ".gitconfig", ".npmrc", ".pypirc", ".netrc",
    "credentials", ".ssh/config", "id_rsa", "id_ed25519", "wp-config.php",
    "config.php", "settings.py", "local_settings.py", "application.yml",
    "application.properties", "database.yml", "secrets.yml", "credentials.yml",
    ".htpasswd", ".aws/credentials", ".google/credentials.json",
    ".env.enc", "vault.env", ".env.prod",
})

SKIP_DIRS = frozenset({
    ".git", "node_modules", "__pycache__", ".venv", "venv", "env",
    "dist", "build", "target", ".idea", ".vscode", "vendor",
    "bower_components", ".next", ".nuxt", "coverage", ".pytest_cache",
    ".mypy_cache", ".tox", "eggs", "*.egg-info", ".eggs",
    "Pods", "Carthage", "DerivedData", "gradle", ".gitlab",
    "site-packages", "node_modules", "bower_components", "jspm_packages",
    "typings", "lib", "libs", "assets", "fonts", "images",
})

MAX_FILE_SIZE = 2_000_000         # 2MB por arquivo (só pula minified gigante)
MAX_REPO_SIZE = 50_000_000        # 50MB — sem filtro de tamanho, o watchdog cuida
BINARY_CHECK_BYTES = 512
CLEANUP_INTERVAL = 300
MAX_CLONE_AGE = 600
REPO_SCAN_TIMEOUT = 30            # 30s por repo
MAX_FILES_PER_REPO = 9999        # sem limite (deadline corta por tempo)
MAX_TARBALL_MEMBERS = 99999      # sem limite (deadline corta por tempo)


class CloneScanner(GitHubScanner):
    """Scanner FREE: git clone (codeload) + grep local com aiofiles."""

    def __init__(self, tokens=None, min_date=None):
        super().__init__(tokens=tokens, min_date=min_date)
        self._clone_dir = Path(tempfile.gettempdir()) / "secret_hunter_clones"
        self._clone_dir.mkdir(parents=True, exist_ok=True)
        self._last_cleanup = time.time()
        # Pool único pra scan in-memory (não precisa de extract pool separado)
        self._scan_pool = ThreadPoolExecutor(max_workers=6, thread_name_prefix="scan")

    def _cleanup_old(self):
        """Remove clones antigos (temp dir não cresce infinitamente)."""
        now = time.time()
        if now - self._last_cleanup < CLEANUP_INTERVAL:
            return
        self._last_cleanup = now
        try:
            for entry in self._clone_dir.iterdir():
                if entry.is_dir():
                    age = now - entry.stat().st_mtime
                    if age > MAX_CLONE_AGE:
                        shutil.rmtree(entry, ignore_errors=True)
        except Exception:
            pass

    async def _is_binary_async(self, file_path: Path) -> bool:
        """Checa se é binário (async)."""
        try:
            async with aiofiles.open(file_path, "rb") as f:
                chunk = await f.read(BINARY_CHECK_BYTES)
            return b"\x00" in chunk
        except Exception:
            return True

    async def _scan_file_async(self, file_path: Path, repo_name: str, scan_id: str) -> list:
        """Escaneia UM arquivo com aiofiles."""
        try:
            # Pula arquivos não-regulares (FIFO/socket/device/symlink)
            if not file_path.is_file() or os.path.islink(file_path):
                return []
            stat = await aiofiles.os.stat(file_path)
            if stat.st_size > MAX_FILE_SIZE or stat.st_size < 8:
                return []
            import stat as _stat
            if not _stat.S_ISREG(stat.st_mode):
                return []
        except Exception:
            return []

        if await self._is_binary_async(file_path):
            return []

        try:
            async with aiofiles.open(file_path, "r", errors="ignore") as f:
                content = await f.read()
        except Exception:
            return []

        if not content or len(content) < 8:
            return []

        try:
            rel_path = str(file_path.relative_to(self._clone_dir))
        except ValueError:
            rel_path = str(file_path)

        meta = {
            "repo": repo_name, "path": rel_path,
            "query": "git-clone-local", "scan_id": scan_id,
            "commit_url": "", "author_name": "", "date": "",
        }
        return self.extract(content, f"https://github.com/{repo_name}", meta)

    def _collect_files(self, extract_path: Path) -> list[Path]:
        """Coleta arquivos interessantes do diretório extraído."""
        files = []
        try:
            for root, dirs, filenames in os.walk(extract_path, followlinks=False):
                # Filtra diretórios a pular in-place (mais rápido)
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                # Resolve symlinks perigosos (não segue)
                dirs[:] = [d for d in dirs if not os.path.islink(os.path.join(root, d))]
                for fname in filenames:
                    fpath = Path(root) / fname
                    # PULA arquivos não-regulares (symlinks, fifos, sockets, devices)
                    try:
                        if not fpath.is_file() or os.path.islink(fpath):
                            continue
                    except OSError:
                        continue
                    ext = fpath.suffix.lower()
                    if ext not in INTERESTING_EXT and fname not in INTERESTING_NAMES and not fname.startswith(".env"):
                        continue
                    files.append(fpath)
                    # LIMITA arquivos por repo (evita repos enormes travarem)
                    if len(files) >= MAX_FILES_PER_REPO:
                        return files
        except Exception:
            pass
        return files

    def _extract_tarball_sync(self, content: bytes, extract_path: Path) -> bool:
        """Extrai tarball em SYNC (pra rodar em executor e ser cancelável)."""
        try:
            tf = tarfile.open(fileobj=io.BytesIO(content), mode="r:gz")
            try:
                tf.extractall(extract_path, filter="data")
            except (TypeError, ValueError):
                tf.extractall(extract_path)
            tf.close()
            return True
        except Exception:
            return False

    def _scan_tarball_inmemory(self, content: bytes, repo_name: str, scan_id: str,
                                 deadline: float = 0, _hb=None) -> list:
        """
        Escaneia tarball IN-MEMORY — sem extrair pro disco.
        Cancelável por deadline (tempo).
        """
        if not deadline:
            deadline = time.time() + 30

        all_findings = []
        files_scanned = 0
        try:
            tf = tarfile.open(fileobj=io.BytesIO(content), mode="r:gz")
            for member in tf:
                # ÚNICO corte: tempo. Sem limites de contagem.
                if time.time() > deadline:
                    break

                # Só processa arquivos regulares (pula dirs, symlinks, devices)
                if not member.isfile():
                    continue

                # Pula arquivos gigantes (minified JS de 2MB+ = backtracking)
                if member.size > MAX_FILE_SIZE or member.size < 8:
                    continue

                fname = os.path.basename(member.name)
                ext = os.path.splitext(fname)[1].lower()

                # Filtro: só arquivos interessantes
                is_interesting = (
                    ext in INTERESTING_EXT
                    or fname in INTERESTING_NAMES
                    or fname.startswith(".env")
                )
                if not is_interesting:
                    continue

                # Pula dirs conhecidos (node_modules, .git, etc)
                parts = member.name.split("/")
                if any(p in SKIP_DIRS for p in parts):
                    continue

                # Lê conteúdo do arquivo diretamente do tarball (in-memory)
                try:
                    fobj = tf.extractfile(member)
                    if fobj is None:
                        continue
                    raw = fobj.read()
                    # Pula binários
                    if b"\x00" in raw[:512]:
                        continue
                    content_str = raw.decode("utf-8", errors="ignore")
                    if len(content_str) < 8:
                        continue
                except Exception:
                    continue

                files_scanned += 1
                if _hb and files_scanned % 5 == 0:
                    _hb()  # heartbeat a cada 5 arquivos (mesmo dentro da thread)

                meta = {
                    "repo": repo_name, "path": member.name,
                    "query": "git-clone-local", "scan_id": scan_id,
                    "commit_url": "", "author_name": "", "date": "",
                }
                findings = self.extract(content_str, f"https://github.com/{repo_name}", meta)
                if findings:
                    all_findings.extend(findings)

            tf.close()
        except Exception:
            pass
        return all_findings

    async def _scan_repo_tarball(self, repo_name: str, scan_id: str) -> list:
        """Baixa tarball + escaneia IN-MEMORY (usa self._scan_pool)."""
        return await self._scan_repo_tarball_with_pool(self._scan_pool, repo_name, scan_id)

    async def _scan_repo_tarball_with_pool(self, pool, repo_name: str, scan_id: str, _hb=None) -> list:
        """Baixa tarball + escaneia IN-MEMORY com pool específico."""
        self._cleanup_old()
        repo_dir_name = repo_name.replace("/", "_").replace("\\", "_")

        # Tenta main, depois master
        for branch in ("main", "master"):
            tarball_url = f"https://codeload.github.com/{repo_name}/tar.gz/refs/heads/{branch}"
            try:
                async with self.client.stream("GET", tarball_url) as r:
                    if r.status_code != 200:
                        continue
                    if r.headers.get("content-length"):
                        size = int(r.headers["content-length"])
                        if size > MAX_REPO_SIZE:
                            return []
                    content = await r.aread()
                    if len(content) > MAX_REPO_SIZE:
                        return []

                if _hb:
                    _hb()
                loop = asyncio.get_event_loop()
                deadline = time.time() + REPO_SCAN_TIMEOUT - 5
                findings = await loop.run_in_executor(
                    pool,
                    self._scan_tarball_inmemory, content, repo_name, scan_id, deadline, _hb,
                )
                if _hb:
                    _hb()
                return findings
            except Exception:
                continue

        return []

    def _scan_file_sync(self, file_path: Path, repo_name: str, scan_id: str) -> list:
        """Versão sync para rodar em thread pool."""
        try:
            # CRÍTICO: pula arquivos não-regulares (FIFO/socket/device/symlink)
            # senão read_text() trava pra sempre esperando I/O
            if not file_path.is_file() or os.path.islink(file_path):
                return []
            stat = file_path.stat()
            if stat.st_size > MAX_FILE_SIZE or stat.st_size < 8:
                return []
            # Pula arquivos especiais explicitamente
            import stat as _stat
            if not _stat.S_ISREG(stat.st_mode):
                return []
        except Exception:
            return []

        # Binary check
        try:
            with open(file_path, "rb") as f:
                chunk = f.read(BINARY_CHECK_BYTES)
            if b"\x00" in chunk:
                return []
        except Exception:
            return []

        try:
            content = file_path.read_text(errors="ignore")
        except Exception:
            return []

        if not content or len(content) < 8:
            return []

        try:
            rel_path = str(file_path.relative_to(self._clone_dir))
        except ValueError:
            rel_path = str(file_path)

        meta = {
            "repo": repo_name, "path": rel_path,
            "query": "git-clone-local", "scan_id": scan_id,
            "commit_url": "", "author_name": "", "date": "",
        }
        return self.extract(content, f"https://github.com/{repo_name}", meta)

    async def run_forever_free(self, on_finding=None, on_cycle=None):
        """Pipeline FREE contínuo otimizado."""
        import threading

        seen_repos = set()
        cycle_n = 0
        _state = {"last_cycle": 0, "last_activity": time.time()}

        def heartbeat():
            _state["last_activity"] = time.time()

        def watchdog_check():
            """Roda em thread separada a cada 15s. Mata se sem atividade 300s."""
            gap = time.time() - _state["last_activity"]
            if gap > 300:
                logger.error(f"💀 WATCHDOG: sem atividade há {gap:.0f}s — MATANDO PROCESSO")
                os._exit(2)
            threading.Timer(15, watchdog_check).start()

        threading.Timer(15, watchdog_check).start()

        while True:
            heartbeat()
            cycle_n += 1
            scan_id = f"free-{cycle_n:04d}"
            cycle_start = time.time()
            logger.info(f"🔄 ═══ CICLO FREE {cycle_n} ═══")
            count = 0
            repos_scanned_ok = 0
            repos_failed = 0

            # Descobre repos
            try:
                languages = [None, "python", "javascript", "typescript", "go", "java",
                             "ruby", "php", "shell", "rust", "kotlin", "swift", "dart"]
                lang = languages[(cycle_n - 1) % len(languages)]
                repos = await self.search_recent_repos(language=lang, max_pages=2)
                heartbeat()  # heartbeat após busca (pode demorar com 504 retries)
                logger.info(f"📦 Search repos ({lang or 'all'}): {len(repos)} resultados")

                new_repos = []
                for r in repos:
                    if r["repo"] in seen_repos:
                        continue
                    if r.get("stars", 0) > 5:
                        continue
                    new_repos.append(r)
                    if len(new_repos) >= 60:  # 60 por ciclo (era 40)
                        break
                for r in new_repos:
                    seen_repos.add(r["repo"])

                if len(seen_repos) > 5000:
                    seen_repos = set(list(seen_repos)[-3000:])
            except Exception as e:
                logger.warning(f"Search erro: {e}")
                await asyncio.sleep(10)
                continue

            # Se API instável (0 repos), espera mais antes de tentar de novo
            if not new_repos:
                logger.warning(f"⚠️  0 repos novos (API instável?) — esperando 20s...")
                if on_cycle:
                    try:
                        await on_cycle(cycle_n, count)
                    except Exception as e:
                        logger.warning(f"on_cycle erro: {e}")
                await asyncio.sleep(20)
                continue

            # Scan paralelo com semaphore (mesmo tamanho do pool p/ não estourar)
            # POOL NOVO a cada ciclo: se threads do ciclo anterior travaram, não afeta este
            cycle_pool = ThreadPoolExecutor(max_workers=10, thread_name_prefix=f"c{cycle_n}")
            sem = asyncio.Semaphore(10)

            async def scan_one(repo_info):
                nonlocal count, repos_scanned_ok, repos_failed
                repo = repo_info["repo"]
                heartbeat()  # heartbeat antes de pegar o semáforo
                async with sem:
                    heartbeat()  # cada repo escaneado = heartbeat
                    try:
                        findings = await asyncio.wait_for(
                            self._scan_repo_tarball_with_pool(cycle_pool, repo, scan_id, heartbeat),
                            timeout=REPO_SCAN_TIMEOUT,
                        )
                        heartbeat()
                        repos_scanned_ok += 1
                        for f in findings:
                            count += 1
                            if on_finding:
                                await on_finding(f)
                        return len(findings)
                    except asyncio.TimeoutError:
                        repos_failed += 1
                        logger.warning(f"⏰ TIMEOUT {repo} (>{REPO_SCAN_TIMEOUT}s) — pulando")
                        return 0
                    except Exception as e:
                        repos_failed += 1
                        logger.debug(f"scan err {repo}: {e}")
                        return 0

            tasks = [scan_one(r) for r in new_repos]
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

            heartbeat()

            # Mata o pool do ciclo (não espera threads presas)
            cycle_pool.shutdown(wait=False, cancel_futures=True)

            heartbeat()

            elapsed = time.time() - cycle_start
            logger.info(f"  Ciclo free {cycle_n}: {len(new_repos)} repos, {count} findings, "
                        f"{repos_scanned_ok} ok, {repos_failed} falhou, {elapsed:.1f}s")
            if on_cycle:
                try:
                    await on_cycle(cycle_n, count)
                except Exception as e:
                    logger.warning(f"on_cycle erro: {e}")

            heartbeat()

            await asyncio.sleep(0.5)

    async def close(self):
        self._scan_pool.shutdown(wait=False, cancel_futures=True)
        await super().close()