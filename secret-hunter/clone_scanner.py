"""
Scanner SEM CUSTOS de API — git clone + grep local.

Estratégia:
1. Descobrir repos recentes via Search Repos API (10 req/min grátis, sem token)
2. git clone --depth 1 (não consome API!)
3. Escanear arquivos localmente com regex (0 requests)
4. Baixar diffs de commits via raw.githubusercontent.com (não consome API)

Fluxo de requests de API por ciclo:
- Search repos: 1-2 requests (10/min grátis)
- git clone: 0 requests (protocolo git)
- grep local: 0 requests
- raw diffs: 0 requests (não conta como API)
TOTAL: ~1-2 requests/ciclo (antes eram ~200+)
"""

import asyncio
import logging
import os
import re
import shutil
import tempfile
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote

import httpx

from patterns import PATTERNS
from scanner import GitHubScanner

logger = logging.getLogger("clone_scanner")

# Extensões de arquivos interessantes (não escaneia tudo)
INTERESTING_EXT = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".go", ".java", ".rb", ".php",
    ".sh", ".bash", ".zsh", ".yml", ".yaml", ".json", ".toml", ".ini",
    ".cfg", ".conf", ".env", ".config", ".xml", ".sql", ".tf", ".hcl",
    ".dart", ".swift", ".kt", ".scala", ".rs", ".c", ".cpp", ".h",
}
# Arquivos sem extensão que interessam
INTERESTING_NAMES = {
    ".env", ".env.local", ".env.production", ".env.development",
    "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
    "Makefile", "Procfile", ".gitconfig", ".npmrc", ".pypirc",
    "credentials", ".ssh/config", "id_rsa", "id_ed25519",
}
# Diretórios para ignorar (não escanear)
SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", "env",
    "dist", "build", "target", ".idea", ".vscode", "vendor",
    "bower_components", ".next", ".nuxt", "coverage",
}
# Tamanho máximo de arquivo para escanear (500KB — evita arquivos gigantes)
MAX_FILE_SIZE = 500_000


class CloneScanner(GitHubScanner):
    """Scanner que usa git clone em vez de API para baixar conteúdo."""

    def __init__(self, tokens=None, min_date=None):
        super().__init__(tokens=tokens, min_date=min_date)
        self._clone_dir = Path(tempfile.gettempdir()) / "secret_hunter_clones"
        self._clone_dir.mkdir(parents=True, exist_ok=True)

    def _scan_file(self, file_path: Path, repo_name: str, scan_id: str) -> list:
        """Escaneia UM arquivo local com todas as regex. Retorna findings."""
        try:
            # Pula arquivos grandes
            if file_path.stat().st_size > MAX_FILE_SIZE:
                return []
            content = file_path.read_text(errors="ignore")
        except Exception:
            return []

        rel_path = str(file_path.relative_to(self._clone_dir))
        meta = {
            "repo": repo_name,
            "path": rel_path,
            "query": "git-clone-local",
            "scan_id": scan_id,
            "commit_url": "",
            "author_name": "",
            "date": "",
        }
        # Usa o extract do parent (com filtro de placeholder)
        return self.extract(content, f"https://github.com/{repo_name}/blob/main/{rel_path}", meta)

    def _scan_repo_local(self, repo_name: str, scan_id: str) -> list:
        """Clona um repo via git e escaneia todos os arquivos localmente."""
        # Diretório do clone
        repo_dir_name = repo_name.replace("/", "_")
        clone_path = self._clone_dir / repo_dir_name

        # Remove se já existe (clone fresh)
        if clone_path.exists():
            shutil.rmtree(clone_path, ignore_errors=True)

        clone_url = f"https://github.com/{repo_name}.git"

        # git clone --depth 1 (shallow, rápido, sem histórico)
        try:
            result = subprocess.run(
                ["git", "clone", "--depth", "1", "--quiet", clone_url, str(clone_path)],
                capture_output=True, timeout=60, text=True
            )
            if result.returncode != 0:
                logger.debug(f"clone fail {repo_name}: {result.stderr[:200]}")
                return []
        except subprocess.TimeoutExpired:
            logger.debug(f"clone timeout {repo_name}")
            shutil.rmtree(clone_path, ignore_errors=True)
            return []
        except Exception as e:
            logger.debug(f"clone err {repo_name}: {e}")
            return []

        # Escaneia todos os arquivos
        all_findings = []
        for root, dirs, files in os.walk(clone_path):
            # Remove dirs pulados IN-PLACE (não desce neles)
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for fname in files:
                fpath = Path(root) / fname
                # Filtra por extensão ou nome especial
                ext = fpath.suffix.lower()
                if ext not in INTERESTING_EXT and fname not in INTERESTING_NAMES and not fname.startswith(".env"):
                    continue
                findings = self._scan_file(fpath, repo_name, scan_id)
                all_findings.extend(findings)

        # Limpa o clone (libera espaço)
        shutil.rmtree(clone_path, ignore_errors=True)
        return all_findings

    async def _scan_repo_async(self, repo_name: str, scan_id: str) -> list:
        """Wrapper async para _scan_repo_local (roda em thread)."""
        return await asyncio.to_thread(self._scan_repo_local, repo_name, scan_id)

    async def run_forever_free(self, on_finding=None, on_cycle=None):
        """
        Pipeline CONTÍNUO SEM CUSTOS de API:
        1. Search repos (10 req/min grátis) → descobre repos novos
        2. git clone --depth 1 → baixa repo (0 requests de API)
        3. grep local → acha secrets (0 requests)

        Cada ciclo usa ~1 request de API (search repos).
        git clone + grep são ILIMITADOS.
        """
        seen_repos = set()
        cycle_n = 0

        while True:
            cycle_n += 1
            scan_id = f"free-{cycle_n:04d}"
            logger.info(f"🔄 ═══ CICLO FREE {cycle_n} ═══")
            count = 0

            # ── Descobrir repos recentes (1 request de API, 10/min grátis) ──
            try:
                languages = [None, "python", "javascript", "typescript", "go", "java",
                             "ruby", "php", "shell", "rust", "kotlin", "swift", "dart"]
                lang = languages[(cycle_n - 1) % len(languages)]
                repos = await self.search_recent_repos(language=lang, hours_back=2, max_pages=1)
                logger.info(f"📦 Search repos ({lang or 'all'}): {len(repos)} resultados")

                # Filtra só repos NOVOS (não duplica trabalho)
                new_repos = [r for r in repos if r["repo"] not in seen_repos][:6]
                for r in new_repos:
                    seen_repos.add(r["repo"])
                logger.info(f"  {len(new_repos)} repos novos p/ clonar")

                if len(seen_repos) > 3000:
                    seen_repos = set(list(seen_repos)[-2000:])

            except Exception as e:
                logger.warning(f"Search repos erro: {e}")
                # Se rate limited, espera mais
                await asyncio.sleep(30)
                continue

            # ── Clonar e escanear CADA repo (em paralelo, 3 por vez) ────────
            sem = asyncio.Semaphore(3)  # 3 clones simultâneos (não sobrecarrega)

            async def scan_one(repo_info):
                nonlocal count
                async with sem:
                    repo = repo_info["repo"]
                    try:
                        findings = await self._scan_repo_async(repo, scan_id)
                        for f in findings:
                            count += 1
                            if on_finding:
                                await on_finding(f)
                        return len(findings)
                    except Exception as e:
                        logger.debug(f"scan err {repo}: {e}")
                        return 0

            tasks = [scan_one(r) for r in new_repos]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            total_files_scanned = sum(r for r in results if isinstance(r, int))
            logger.info(f"  Clonados: {len(new_repos)} repos, {total_files_scanned} findings")

            logger.info(f"✅ Ciclo free {cycle_n}: {count} findings")
            if on_cycle:
                await on_cycle(cycle_n, count)

            # Pausa entre ciclos — search repos permite 10/min, usamos 1/ciclo
            # então podemos rodar ~6 ciclos/min. Pausa de 5s.
            await asyncio.sleep(5)
