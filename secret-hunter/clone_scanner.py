"""
Scanner FREE v4 — CODE SEARCH FIRST.
  - GitHub Code Search (10 req/min) → baixar SÓ o arquivo com secret
  - raw.githubusercontent.com = download instantâneo (few KB)
  - SEM tarball download (era 1-50MB por repo, lentíssimo)
  - Gists em paralelo (pequenos, alta chance de secret)
  - seen_files persistido em disco
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx
from urllib.parse import quote as urlquote

from patterns import COMPILED_PATTERNS
from scanner import GitHubScanner

logger = logging.getLogger("clone_scanner")

MAX_FILE_SIZE = 500_000          # 500KB por arquivo
DOWNLOAD_TIMEOUT = 8             # 8s por arquivo
CODE_SEARCH_PER_CYCLE = 5         # 5 queries/ciclo (rate 10/min → 2 ciclos/min, varre mais rápido)
MAX_CODE_HITS_PER_CYCLE = 30      # 30 arquivos por ciclo (gather completa em <20s)


class CloneScanner(GitHubScanner):
    """Scanner FREE v4: code search + raw file download. SEM tarballs."""

    def __init__(self, tokens=None, min_date=None):
        super().__init__(tokens=tokens, min_date=min_date)
        self._seen_files_file = Path(__file__).parent / "data" / "seen_files.json"
        self._seen_files = self._load_seen_files()

    def _load_seen_files(self) -> set:
        try:
            if self._seen_files_file.exists():
                data = json.loads(self._seen_files_file.read_text())
                logger.info(f"📋 Dedup: {len(data)} arquivos já vistos")
                return set(data)
        except Exception:
            pass
        return set()

    def _save_seen_files(self):
        try:
            self._seen_files_file.parent.mkdir(parents=True, exist_ok=True)
            items = list(self._seen_files)
            if len(items) > 30000:
                items = items[-20000:]
            self._seen_files_file.write_text(json.dumps(items))
        except Exception:
            pass

    async def _rate_wait(self, resp):
        """Override: NÃO dorme 1.5s. Só dorme se REALMENTE rate limited."""
        if resp.status_code == 403:
            body = resp.text[:500].lower()
            if "scraping" in body or "terms of service" in body:
                if self._current_token:
                    import token_pool
                    token_pool.mark_dead(self._current_token, "scraping ban")
                return
            # Rate limited de verdade — dorme 30s
            reset = int(resp.headers.get("X-RateLimit-Reset", 0))
            if reset > 0:
                w = max(reset - int(time.time()), 0) + 1
                if w > 65:
                    w = 65
                logger.warning(f"⏳ Rate limited, esperando {w}s...")
                await asyncio.sleep(w)
        # NÃO dorme 1.5s entre requests normais!

    async def _fetch_url_fast(self, url: str) -> dict | None:
        """Fetch sem rate_wait lento. Respeita rate limit proativamente."""
        for i in range(3):
            try:
                r = await self.client.get(url, headers=self._headers())
                if r.status_code == 200:
                    return r.json()
                if r.status_code == 403:
                    # Rate limited — dorme até reset
                    reset = int(r.headers.get("X-RateLimit-Reset", 0))
                    rem = int(r.headers.get("X-RateLimit-Remaining", 30))
                    if rem <= 0 and reset > 0:
                        w = max(reset - int(time.time()), 0) + 1
                        logger.warning(f"⏳ Rate limit, esperando {w}s...")
                        await asyncio.sleep(min(w, 60))
                        continue
                    return None
                if r.status_code == 422:
                    # Query too complex or no results
                    return None
                if r.status_code in (404, 451):
                    return None
                if r.status_code >= 500:
                    await asyncio.sleep(1)
                    continue
                return None
            except Exception:
                await asyncio.sleep(0.5)
        return None

    async def search_code_fast(self, query: str, max_pages=1, page_offset=1) -> list:
        """Code search sem rate_wait lento. Filtra docs/READMEs."""
        async def fetch_page(page):
            url = f"https://api.github.com/search/code?q={urlquote(query)}&per_page=100&page={page}&sort=indexed&order=desc"
            data = await self._fetch_url_fast(url)
            if not data or not data.get("items"):
                return []
            results = []
            for item in data["items"]:
                path = item.get("path", "")
                # FILTRA docs/READMEs — são exemplos, não secrets reais
                path_lower = path.lower()
                if path_lower.endswith(".md"):
                    continue
                if path_lower.endswith("readme"):
                    continue
                if "/docs/" in path_lower or "/doc/" in path_lower:
                    continue
                if "example" in path_lower or "sample" in path_lower or "template" in path_lower:
                    continue
                if "test" in path_lower and "config" not in path_lower:
                    continue
                results.append({
                    "repo": item["repository"]["full_name"],
                    "repo_url": item["repository"]["html_url"],
                    "path": item["path"],
                    "html_url": item["html_url"],
                    "pushed_at": item.get("repository", {}).get("pushed_at", ""),
                })
            return results
        tasks = [fetch_page(page_offset + i) for i in range(max_pages)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        all_items = []
        for r in results:
            if isinstance(r, list):
                all_items.extend(r)
        return all_items

    # ── Code search queries (40+ queries, rotativa) ──
    # ── Code search queries (sem stars/extension filters — GitHub ignora) ──
    # Busca de código usa CODE_QUERY_TEMPLATES + _code_queries() herdados do
    # GitHubScanner (cobrem TODOS os tipos de patterns.py + janela rolante de 7 dias
    # via `pushed:>=`). Não há mais uma lista fixa e limitada aqui.

    async def _download_and_scan_file(self, repo: str, path: str, branch: str,
                                       scan_id: str, _hb=None) -> list:
        """Baixa UM arquivo via raw.githubusercontent.com. Instantâneo."""
        raw_url = f"https://raw.githubusercontent.com/{repo}/{branch}/{path}"
        try:
            r = await self.client.get(raw_url, timeout=DOWNLOAD_TIMEOUT)
            if r.status_code != 200:
                return []
            content = r.text
            if _hb:
                _hb()
            if len(content) < 8 or len(content) > MAX_FILE_SIZE:
                return []
            if "\n" not in content and len(content) > 10000:
                return []
            meta = {
                "repo": repo, "path": path,
                "query": "code_search", "scan_id": scan_id,
                "commit_url": "", "author_name": "", "date": "",
            }
            source = f"https://github.com/{repo}/blob/{branch}/{path}"
            # extract() é rápido (<20ms), roda sync no event loop
            return self.extract(content, source, meta)
        except (httpx.TimeoutException, asyncio.TimeoutError):
            return []
        except Exception:
            return []

    async def _scan_gist(self, gist_info: dict, scan_id: str, _hb=None) -> list:
        """Escaneia um gist."""
        findings = []
        files = gist_info.get("files", {})
        if isinstance(files, dict):
            files = list(files.values())
        for finfo in files[:10]:
            raw_url = finfo.get("raw_url", "")
            if not raw_url:
                continue
            try:
                r = await self.client.get(raw_url, timeout=DOWNLOAD_TIMEOUT)
                if r.status_code != 200:
                    continue
                content = r.text
                if _hb:
                    _hb()
                if len(content) < 8 or len(content) > MAX_FILE_SIZE:
                    continue
                if "\n" not in content and len(content) > 10000:
                    continue
                fname = finfo.get("filename", "")
                meta = {
                    "repo": gist_info["repo"], "path": fname,
                    "query": "gist", "scan_id": scan_id,
                    "commit_url": "", "author_name": "", "date": "",
                }
                source = gist_info.get("repo_url", "")
                found = await asyncio.to_thread(self.extract, content, source, meta)
                findings.extend(found)
            except Exception:
                continue
        return findings

    async def search_gists_free(self, max_pages: int = 1) -> list:
        """Busca gists públicos (limitado)."""
        gists = []
        for page in range(1, max_pages + 1):
            try:
                url = f"https://api.github.com/gists/public?per_page=50&page={page}"
                r = await self.client.get(url, headers=self._headers())
                if r.status_code == 200:
                    for g in r.json():
                        gists.append({
                            "repo": f"gist:{g.get('owner', {}).get('login', '?')}/{g.get('id', '')}",
                            "repo_url": g.get("html_url", ""),
                            "gist_id": g.get("id", ""),
                            "files": g.get("files", {}),
                        })
                elif r.status_code == 403:
                    break
            except Exception:
                break
        return gists

    async def run_forever_free(self, on_finding=None, on_cycle=None):
        """Pipeline v4 — CODE SEARCH + RAW DOWNLOAD. Sem tarballs."""
        import threading

        cycle_n = 0
        _state = {"last_activity": time.time()}

        def heartbeat():
            _state["last_activity"] = time.time()

        def watchdog_check():
            gap = time.time() - _state["last_activity"]
            if gap > 300:
                logger.error(f"💀 WATCHDOG: sem atividade há {gap:.0f}s — MATANDO PROCESSO")
                os._exit(2)
            threading.Timer(15, watchdog_check).start()

        threading.Timer(15, watchdog_check).start()

        import token_pool as _tp
        has_tokens = bool(self._seed_tokens) or bool(_tp.get_active())

        if not has_tokens:
            logger.warning("⚠️  Sem GitHub token! Code search não funciona.")

        while True:
            heartbeat()
            cycle_n += 1
            scan_id = f"free-{cycle_n:04d}"
            cycle_start = time.time()
            logger.info(f"🔄 ═══ CICLO {cycle_n} ═══")
            count = 0
            files_scanned = 0
            files_failed = 0

            # ── CODE SEARCH: 2 queries × 1 página = 2 requests/ciclo ──
            code_hits = []
            if has_tokens:
                cq_list = self._code_queries()
                base_idx = (cycle_n - 1) * CODE_SEARCH_PER_CYCLE
                for i in range(CODE_SEARCH_PER_CYCLE):
                    q_idx = (base_idx + i) % len(cq_list)
                    q = cq_list[q_idx]
                    page_offset = ((cycle_n * 7 + i * 13) % 50) + 1
                    try:
                        heartbeat()
                        results = await self.search_code_fast(q, max_pages=1, page_offset=page_offset)
                        heartbeat()
                        new_hits = 0
                        for r in results:
                            file_key = f"{r['repo']}:{r.get('path','')}"
                            if file_key not in self._seen_files:
                                html_url = r.get("html_url", "")
                                if "/blob/" in html_url:
                                    branch = html_url.split("/blob/")[1].split("/")[0]
                                else:
                                    branch = "main"
                                r["branch_hint"] = branch
                                r["file_key"] = file_key
                                code_hits.append(r)
                                self._seen_files.add(file_key)
                                new_hits += 1
                        logger.info(f"  🔍 '{q[:30]}': {len(results)} files (p{page_offset}), {new_hits} novos")
                    except Exception as e:
                        logger.warning(f"  Code search erro: {e}")
                        await asyncio.sleep(2)

            # Salva seen_files a cada 3 ciclos
            if cycle_n % 3 == 0:
                self._save_seen_files()
            if len(self._seen_files) > 30000:
                self._seen_files = set(list(self._seen_files)[-20000:])

            # ── GISTS: a cada 3 ciclos (50 max) ──
            gist_targets = []
            if cycle_n % 3 == 0:
                try:
                    gists = await self.search_gists_free(max_pages=1)
                    heartbeat()
                    for g in gists[:50]:  # Limite de 50 gists por ciclo
                        if g["repo"] not in self._seen_files:
                            gist_targets.append(g)
                            self._seen_files.add(g["repo"])
                    if gist_targets:
                        logger.info(f"  📦 Gists: {len(gist_targets)} novos")
                except Exception:
                    pass

            total_targets = len(code_hits) + len(gist_targets)
            # Limita a 50 alvos por ciclo (gather completa em <30s)
            code_hits = code_hits[:MAX_CODE_HITS_PER_CYCLE]
            gist_targets = gist_targets[:10]
            total_targets = len(code_hits) + len(gist_targets)
            if total_targets == 0:
                logger.info(f"  ⏳ 0 alvos novos — esperando 5s")
                if on_cycle:
                    try:
                        await on_cycle(cycle_n, count)
                    except Exception:
                        pass
                await asyncio.sleep(5)
                continue

            logger.info(f"  🎯 {len(code_hits)} code + {len(gist_targets)} gists = {total_targets} alvos")

            # ── Download + scan em paralelo (30 workers) ──
            sem = asyncio.Semaphore(30)

            async def process_code_hit(hit):
                nonlocal count, files_scanned, files_failed
                heartbeat()
                async with sem:
                    heartbeat()
                    try:
                        findings = await self._download_and_scan_file(
                            hit["repo"], hit.get("path", ""),
                            hit.get("branch_hint", "main"), scan_id, heartbeat
                        )
                        heartbeat()
                        files_scanned += 1
                        for f in findings:
                            count += 1
                            if on_finding:
                                await on_finding(f)
                    except Exception:
                        files_failed += 1

            async def process_gist(gist_info):
                nonlocal count, files_scanned, files_failed
                heartbeat()
                async with sem:
                    heartbeat()
                    try:
                        findings = await self._scan_gist(gist_info, scan_id, heartbeat)
                        heartbeat()
                        files_scanned += 1
                        for f in findings:
                            count += 1
                            if on_finding:
                                await on_finding(f)
                    except Exception:
                        files_failed += 1

            tasks = [process_code_hit(h) for h in code_hits]
            tasks += [process_gist(g) for g in gist_targets]
            if tasks:
                async def hb_loop():
                    while True:
                        heartbeat()
                        await asyncio.sleep(3)
                hb_task = asyncio.create_task(hb_loop())
                try:
                    await asyncio.wait_for(
                        asyncio.gather(*tasks, return_exceptions=True),
                        timeout=40  # 40s máximo para 30 downloads
                    )
                except asyncio.TimeoutError:
                    logger.warning(f"  ⏰ Timeout no gather ({len(tasks)} tasks em 40s)")
                hb_task.cancel()

            heartbeat()
            elapsed = time.time() - cycle_start
            logger.info(f"  ✅ Ciclo {cycle_n}: {files_scanned} files, {count} findings, "
                        f"{files_failed} falhou, {elapsed:.1f}s")

            if on_cycle:
                try:
                    await on_cycle(cycle_n, count)
                except Exception as e:
                    logger.warning(f"on_cycle erro: {e}")

            heartbeat()
            await asyncio.sleep(0.5)

    async def close(self):
        self._save_seen_files()
        await super().close()
