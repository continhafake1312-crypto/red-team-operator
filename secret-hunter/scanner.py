"""
Scanner GitHub — v2 otimizado.
  - raw.githubusercontent.com para conteúdo (GRÁTIS, sem API calls)
  - Parallel page fetching
  - Cache de repo trees com TTL
  - Gist scanning (novo!)
  - Token rotation inteligente (weighted by rate limit)
  - Exponential backoff em retries
"""

import asyncio
import hashlib
import json
import logging
import re
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

import httpx
from urllib.parse import quote as urlquote

from patterns import COMPILED_PATTERNS
import token_pool

logger = logging.getLogger("scanner")

GITHUB_TOKENS = []
SCANNER_MIN_DATE = "2026-01-01"
MAX_RESULTS = 300

# Cache de repo trees: {(repo, branch): [files], ttl}
_tree_cache = {}
_TREE_CACHE_TTL = 600  # 10 min

# raw.githubusercontent.com base (0 API requests!)
RAW_BASE = "https://raw.githubusercontent.com"


class GitHubScanner:
    def __init__(self, tokens=None, min_date=None):
        self._seed_tokens = tokens or GITHUB_TOKENS
        if self._seed_tokens:
            token_pool.set_seed_tokens(self._seed_tokens)
        self._token_idx = 0
        self._token_stats = {}  # token → remaining rate
        self.min_date = min_date or SCANNER_MIN_DATE
        self._seen = set()
        self._load_seen()
        # Cliente com keepalive e pool de conexões
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0, connect=10.0),
            follow_redirects=True,
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=30),
        )

    _SEEN_FILE = Path(__file__).parent / "data" / "seen_hashes.json"

    def _load_seen(self):
        try:
            if self._SEEN_FILE.exists():
                self._seen = set(json.loads(self._SEEN_FILE.read_text()))
                logger.info(f"📋 Dedup: {len(self._seen)} hashes carregados")
        except Exception:
            pass

    def _save_seen(self):
        try:
            self._SEEN_FILE.parent.mkdir(parents=True, exist_ok=True)
            to_save = list(self._seen)[-50000:] if len(self._seen) > 50000 else list(self._seen)
            self._SEEN_FILE.write_text(json.dumps(to_save))
        except Exception:
            pass

    def _headers(self):
        h = {"Accept": "application/vnd.github.v3+json", "User-Agent": "SecretHunter/2.0"}
        active = token_pool.get_active()
        if active:
            # Token rotation: prefere tokens com mais rate limit
            idx = self._token_idx % len(active)
            t = active[idx]
            self._token_idx += 1
            self._current_token = t
            h["Authorization"] = f"token {t}"
        else:
            self._current_token = None
        return h

    async def _rate_wait(self, resp):
        if resp.status_code == 403 and self._current_token:
            body = resp.text[:500].lower()
            if "scraping" in body or "terms of service" in body:
                logger.warning(f"🚫 Token banido: {self._current_token[:15]}...")
                token_pool.mark_dead(self._current_token, "scraping ban")
                return
        rem = int(resp.headers.get("X-RateLimit-Remaining", 30))
        reset = int(resp.headers.get("X-RateLimit-Reset", 0))
        if self._current_token:
            self._token_stats[self._current_token] = rem
        if rem <= 2 and reset > 0:
            w = max(reset - int(time.time()), 0) + 2
            if w > 70:
                w = 65
            logger.warning(f"⏳ Rate limit ({rem}), esperando {w}s...")
            await asyncio.sleep(w)
        else:
            await asyncio.sleep(1.5)

    async def _fetch_url(self, url: str, retries=3) -> Optional[dict]:
        for i in range(retries):
            try:
                r = await self.client.get(url, headers=self._headers())
                await self._rate_wait(r)
                if r.status_code == 200:
                    return r.json()
                elif r.status_code in (422, 404):
                    return None
                elif r.status_code == 403:
                    w = min(10 * (2 ** i), 40)
                    logger.warning(f"403 — esperando {w}s...")
                    await asyncio.sleep(w)
                    continue
                elif r.status_code in (429, 502, 503, 504):
                    # Retry rápido: 2s, 4s, 8s = max 14s total (não estoura watchdog)
                    w = min(2 * (2 ** i), 8)
                    logger.warning(f"{r.status_code} retry {i+1}/{retries} em {w}s")
                    await asyncio.sleep(w)
                    continue
                return None
            except httpx.TimeoutException:
                w = min(3 * (2 ** i), 15)
                await asyncio.sleep(w)
        return None

    async def _fetch_text(self, url: str, accept: str = "", retries=3) -> Optional[str]:
        h = self._headers()
        if accept:
            h["Accept"] = accept
        for i in range(retries):
            try:
                r = await self.client.get(url, headers=h)
                await self._rate_wait(r)
                if r.status_code == 200:
                    return r.text
                return None
            except httpx.TimeoutException:
                await asyncio.sleep(min(5 * (2 ** i), 60))
        return None

    # ── Search: parallel pages ──

    async def search_code(self, query: str, max_pages=5) -> list:
        """Busca code com páginas paralelas."""
        async def fetch_page(page):
            url = f"https://api.github.com/search/code?q={urlquote(query)}&per_page=100&page={page}"
            data = await self._fetch_url(url)
            if not data or not data.get("items"):
                return []
            return [{
                "repo": item["repository"]["full_name"],
                "repo_url": item["repository"]["html_url"],
                "path": item["path"],
                "html_url": item["html_url"],
                "git_url": item.get("git_url", ""),
                "sha": item.get("sha", ""),
            } for item in data["items"]]

        tasks = [fetch_page(p) for p in range(1, max_pages + 1)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        all_items = []
        for r in results:
            if isinstance(r, list):
                all_items.extend(r)
        return all_items

    async def search_commits(self, pattern: str, max_pages=3, extra_qualifiers: str = "") -> list:
        """Busca commits com páginas paralelas."""
        query_parts = [pattern, f"committer-date:>={self.min_date}"]
        if extra_qualifiers:
            query_parts.append(extra_qualifiers)
        query = " ".join(query_parts)

        async def fetch_page(page):
            url = f"https://api.github.com/search/commits?q={urlquote(query)}&per_page=100&page={page}"
            data = await self._fetch_url(url)
            if not data or not data.get("items"):
                return []
            results = []
            for item in data["items"]:
                repo = item.get("repository", {}) or {}
                commit = item.get("commit", {}) or {}
                author = (commit.get("author") or {}) or (commit.get("committer") or {})
                results.append({
                    "repo": repo.get("full_name", ""),
                    "repo_url": repo.get("html_url", ""),
                    "commit_url": item.get("html_url", ""),
                    "sha": item.get("sha", ""),
                    "author_name": author.get("name", ""),
                    "date": author.get("date", ""),
                })
            return results

        tasks = [fetch_page(p) for p in range(1, max_pages + 1)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        all_items = []
        for r in results:
            if isinstance(r, list):
                all_items.extend(r)
        return all_items

    # ── File content via RAW (GRÁTIS!) ──

    async def _fetch_raw_content(self, repo: str, path: str, branch: str = "main") -> Optional[str]:
        """Usa raw.githubusercontent.com — ZERO custo de API."""
        url = f"{RAW_BASE}/{repo}/{branch}/{urlquote(path)}"
        return await self._fetch_text(url)

    async def _fetch_commit_diff(self, commit_url: str) -> Optional[str]:
        """Baixa diff de commit via API."""
        diff_url = commit_url.replace("github.com", "api.github.com/repos")
        diff_url = diff_url.replace("/commit/", "/commits/")
        return await self._fetch_text(diff_url, accept="application/vnd.github.v3.diff")

    # ── Events API ──

    async def fetch_public_events(self, max_pages=5) -> list:
        """PushEvents em tempo real."""
        events = []
        etag = getattr(self, "_events_etag", None)

        async def fetch_page(page):
            url = f"https://api.github.com/events?per_page=100&page={page}"
            h = self._headers()
            if etag and page == 1:
                h["If-None-Match"] = etag
            try:
                r = await self.client.get(url, headers=h)
                if r.status_code == 304:
                    return []
                if r.status_code != 200:
                    return []
                if page == 1 and r.headers.get("ETag"):
                    self._events_etag = r.headers["ETag"]
                await self._rate_wait(r)
                items = []
                for ev in r.json():
                    if ev.get("type") != "PushEvent":
                        continue
                    payload = ev.get("payload", {}) or {}
                    repo = (ev.get("repo") or {}).get("name", "")
                    head_sha = payload.get("head", "")
                    if not repo or not head_sha:
                        continue
                    items.append({
                        "repo": repo,
                        "repo_url": f"https://github.com/{repo}",
                        "commits": [{"sha": head_sha, "url": f"https://github.com/{repo}/commit/{head_sha}"}],
                        "author": ((ev.get("actor") or {}).get("login", "")),
                        "created_at": ev.get("created_at", ""),
                        "event_id": ev.get("id", ""),
                    })
                return items
            except Exception:
                return []

        # Páginas paralelas
        tasks = [fetch_page(p) for p in range(1, max_pages + 1)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for r in results:
            if isinstance(r, list):
                events.extend(r)
        return events

    # ── Repos recém-criados ──

    async def search_recent_repos(self, language=None, max_pages=3) -> list:
        """Repos criados recentemente."""
        since = (datetime.now(timezone.utc) - timedelta(days=2)).strftime("%Y-%m-%d")
        q = f"created:>{since} stars:<5"
        if language:
            q += f" language:{language}"

        async def fetch_page(page):
            url = f"https://api.github.com/search/repositories?q={urlquote(q)}&sort=updated&order=desc&per_page=100&page={page}"
            data = await self._fetch_url(url)
            if not data or not data.get("items"):
                return []
            return [{
                "repo": item["full_name"],
                "repo_url": item["html_url"],
                "default_branch": item.get("default_branch", "main"),
                "pushed_at": item.get("pushed_at", ""),
                "created_at": item.get("created_at", ""),
                "stars": item.get("stargazers_count", 0),
            } for item in data["items"]]

        tasks = [fetch_page(p) for p in range(1, max_pages + 1)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        repos = []
        for r in results:
            if isinstance(r, list):
                repos.extend(r)
        return repos

    async def fetch_repo_files(self, repo: str, branch: str = "main") -> list:
        """Lista arquivos de um repo via API (cacheado)."""
        cache_key = (repo, branch)
        now = time.time()
        if cache_key in _tree_cache:
            cached = _tree_cache[cache_key]
            if now - cached["time"] < _TREE_CACHE_TTL:
                return cached["files"]

        url = f"https://api.github.com/repos/{repo}/git/trees/{branch}?recursive=1"
        data = await self._fetch_url(url)
        if not data or not data.get("tree"):
            return []

        interest_ext = {".env", ".yml", ".yaml", ".json", ".ini", ".conf", ".cfg", ".toml", ".py", ".js", ".ts", ".sh"}
        interest_names = {"config", "settings", "secrets", "credentials", "application", "database", ".env"}
        files = []
        for item in data["tree"]:
            if item.get("type") != "blob":
                continue
            path = item.get("path", "")
            low = path.lower()
            if any(low.endswith(ext) for ext in interest_ext) or any(n in low for n in interest_names):
                files.append({
                    "path": path,
                    "sha": item.get("sha", ""),
                    "repo": repo,
                    "branch": branch,
                })

        result = files[:25]  # limita a 25 por repo
        _tree_cache[cache_key] = {"files": result, "time": now}
        # Limpeza do cache
        if len(_tree_cache) > 200:
            old_keys = [k for k, v in _tree_cache.items() if now - v["time"] > _TREE_CACHE_TTL]
            for k in old_keys:
                del _tree_cache[k]
        return result

    # ── Gist scanning ──

    async def search_gists(self, language=None, max_pages=2) -> list:
        """Busca gists públicos recentes com keywords de secret."""
        q = "api_key OR password OR secret OR token OR key"
        if language:
            q += f" language:{language}"

        async def fetch_page(page):
            url = f"https://api.github.com/gists/public?per_page=100&page={page}"
            r = await self.client.get(url, headers=self._headers())
            await self._rate_wait(r)
            if r.status_code != 200:
                return []
            results = []
            for gist in r.json():
                desc = (gist.get("description") or "").lower()
                if not any(kw in desc for kw in ["key", "token", "secret", "password", "api", "credential", "config"]):
                    # Mesmo sem descrição, pode ter segredo — vamos escanear
                    pass
                files_info = []
                for fname, fdata in (gist.get("files") or {}).items():
                    files_info.append({
                        "filename": fname,
                        "raw_url": fdata.get("raw_url", ""),
                        "language": fdata.get("language", ""),
                    })
                results.append({
                    "id": gist.get("id", ""),
                    "url": gist.get("html_url", ""),
                    "description": gist.get("description", ""),
                    "owner": (gist.get("owner") or {}).get("login", ""),
                    "files": files_info,
                    "created_at": gist.get("created_at", ""),
                    "updated_at": gist.get("updated_at", ""),
                })
            return results

        tasks = [fetch_page(p) for p in range(1, max_pages + 1)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        gists = []
        for r in results:
            if isinstance(r, list):
                gists.extend(r)
        return gists

    # ── Placeholder detection ──

    _PLACEHOLDER_RE = re.compile(
        r"(?i)"
        r"^(?:your|my|the|replace|example|sample|test|placeholder|dummy|changeme|"
        r"change|fake|mock|todo|fixme|none|null|nil|empty|blank|xxx+|foo|bar|baz|"
        r"insert|put|enter|paste|add|set|get|define|fill|provide|supply|"
        r"required|optional|default|value|string|text|key|token|secret|password|"
        r"super|actual|real|new|old|temp|local|global|config|setting|"
        r"api_key|access_key|client_id|client_secret|app_key|private_key|public_key|"
        r"property|credential|auth|oauth|bearer|some|any|this|that|"
        r"private|public|internal|external|opaque|admin|root|user|guest|"
        r"openai|anthropic|google|aws|azure|gcp|github|gitlab|slack|stripe|"
        r"postgres|mysql|redis|mongo|akia"
        r")[-_a-z0-9]*$"
    )
    _PLACEHOLDER_SUBSTR = re.compile(
        r"(?i)"
        r"(?:_here|_placeholder|_example|_sample|_test|_dummy|_fake|_mock|_todo|"
        r"_change_me|your_|my_|the_|example_|sample_|test_|placeholder_|dummy_|"
        r"replace[-_]|insert[-_]|put_your|paste_your|enter_your|fill_your|provide_your|"
        r"replace_this|change_this|your[-]|<your|\$\{|\{\{|"
        r"with[-_a]*long[-_]random|one[-_]time[-_]value|"
        r"abcdefgh|0123456789|aabbccdd)"
    )
    _CODE_PATTERNS = re.compile(
        r"(?i)"
        r"(?:"
        r"^[A-Z][a-z]+[A-Z][a-z]+(?:[A-Z][a-z]+)*$"
        r"|^[A-Z]{2,}_[A-Z_]+$"
        r"|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        r"|^\$.*"
        r")"
    )

    def _is_placeholder(self, val: str) -> bool:
        v = val.strip("'\"").lower()
        if len(v) < 8:
            return False
        if self._PLACEHOLDER_RE.match(v):
            return True
        if self._PLACEHOLDER_SUBSTR.search(v):
            return True
        if self._CODE_PATTERNS.match(val.strip("'\"")):
            return True
        return False

    def extract(self, content: str, source: str, meta: dict) -> list:
        findings = []
        # Proteção contra regex catastrophic backtracking:
        # Pula arquivos minified gigantes (1 linha > 50KB = bundle JS)
        if "\n" not in content and len(content) > 50_000:
            return findings
        # Pula arquivos muito grandes no geral (mesmo com newlines)
        if len(content) > 500_000:
            return findings

        for name, cat, rx, conf, validator in COMPILED_PATTERNS:
            try:
                for m in rx.finditer(content):
                    val = m.group(0) if not m.lastindex else (m.group(1) or m.group(0))
                    if len(val) < 8:
                        continue
                    if conf <= 7 and self._is_placeholder(val):
                        continue
                    digest = hashlib.md5(val.encode()).hexdigest()
                    if digest in self._seen:
                        continue
                    self._seen.add(digest)
                    if len(self._seen) % 500 == 0:
                        self._save_seen()

                    masked = val[:4] + "*" * (len(val) - 8) + val[-4:] if len(val) > 12 else val[:2] + "*" * (len(val) - 4) + val[-2:]
                    ctx = content[max(0, m.start() - 80):m.end() + 80]

                    findings.append({
                        "key_type": cat,
                        "key_name": name,
                        "key_value": val,
                        "masked_value": masked,
                        "confidence": conf,
                        "validator_type": validator,
                        "context": ctx,
                        "source": source,
                        "file_path": meta.get("path", ""),
                        "commit_url": meta.get("commit_url", ""),
                        "author": meta.get("author_name", ""),
                        "date_found": (meta.get("date", "") or "")[:10],
                        "repo_name": meta.get("repo", ""),
                        "search_query": meta.get("query", ""),
                        "validated": 0,
                        "is_valid": None,
                        "scan_id": meta.get("scan_id", ""),
                    })
            except re.error:
                continue
        return findings

    # ── Content fetchers ──

    async def _scan_raw_file(self, repo: str, path: str, branch: str, meta_base: dict) -> list:
        """Baixa arquivo via raw.githubusercontent.com e escaneia."""
        content = await self._fetch_raw_content(repo, path, branch)
        if not content:
            return []
        meta = {**meta_base, "path": f"{repo}/{path}", "repo": repo}
        source = f"https://github.com/{repo}/blob/{branch}/{path}"
        return self.extract(content, source, meta)

    async def _scan_commit(self, commit_info: dict, meta_base: dict) -> list:
        """Baixa diff de commit e escaneia."""
        diff = await self._fetch_commit_diff(commit_info["commit_url"])
        if not diff:
            return []
        added = "\n".join(l[1:] for l in diff.split("\n") if l.startswith("+") and not l.startswith("+++"))
        if not added.strip():
            return []
        meta = {**meta_base, **commit_info}
        return self.extract(added, commit_info.get("commit_url", ""), meta)

    async def _scan_gist(self, gist: dict, meta_base: dict) -> list:
        """Escaneia arquivos de um gist."""
        findings = []
        for finfo in gist.get("files", []):
            if not finfo.get("raw_url"):
                continue
            content = await self._fetch_text(finfo["raw_url"])
            if not content:
                continue
            meta = {**meta_base,
                    "path": finfo.get("filename", ""),
                    "repo": f"gist:{gist.get('owner','')}/{gist.get('id','')}",
                    "author_name": gist.get("owner", "")}
            findings.extend(self.extract(content, gist.get("url", ""), meta))
        return findings

    # ── Queries ──

    CODE_QUERIES = [
        '"AKIA" stars:<10', '"AIza" stars:<10', '"AccountKey=" stars:<10',
        '"sk_live_" stars:<10', '"dop_v1_" stars:<10',
        '"sk-proj-" stars:<10', '"sk-ant-" stars:<10', '"hf_" stars:<10',
        '"ghp_" stars:<10', '"glpat-" stars:<10', '"xoxb-" stars:<10',
        '"npm_" stars:<10', '"dckr_pat_" stars:<10',
        '"mongodb+srv://" stars:<10', '"postgresql://" stars:<10',
        '"mysql://" stars:<10', '"redis://" stars:<10',
        '"-----BEGIN OPENSSH PRIVATE KEY-----" stars:<10',
        '"-----BEGIN PRIVATE KEY-----" stars:<10',
        '"SG." stars:<10', '"key-" stars:<10',
        '"DB_PASSWORD" filename:.env stars:<5',
        '"AWS_SECRET_ACCESS_KEY" filename:.env stars:<5',
        '"MONGO_URI" filename:.env stars:<5',
        '"OPENAI_API_KEY" filename:.env stars:<5',
        '"ANTHROPIC_API_KEY" filename:.env stars:<5',
        '"STRIPE_SECRET_KEY" filename:.env stars:<5',
        '"GITHUB_TOKEN" filename:.env stars:<5',
        '"SECRET_KEY" filename:.env stars:<5',
        '"JWT_SECRET" filename:.env stars:<5',
        '"CLOUDFLARE_API_TOKEN" filename:.env stars:<5',
        '"api_key" extension:py stars:<5',
        '"api_key" extension:js stars:<5',
        '"api_key" extension:ts stars:<5',
        '"api_key" extension:go stars:<5',
        '"AKIA" created:>2026-08-10 stars:<3',
        '"ghp_" created:>2026-08-10 stars:<3',
        '"sk_live_" created:>2026-08-10 stars:<3',
        '"mongodb+srv://" created:>2026-08-10 stars:<3',
        '"DB_PASSWORD" created:>2026-08-10 stars:<3',
    ]

    COMMIT_PATTERNS = [
        'AKIA', 'ghp_', 'glpat-', 'sk-proj-', 'sk-ant-',
        'mongodb+srv://', '-----BEGIN', 'dckr_pat_', 'npm_', 'hf_',
        'sk_live_', 'AIza', 'DB_PASSWORD', 'SECRET_KEY', 'OPENAI_API_KEY',
        'STRIPE_SECRET_KEY', 'GITHUB_TOKEN', 'JWT_SECRET', 'CLOUDFLARE_API_TOKEN',
    ]

    # ── Run ──

    async def run(self, mode="both", scan_id=None) -> list:
        findings_all = []
        async for f in self.run_streaming(mode=mode, scan_id=scan_id):
            findings_all.append(f)
        return findings_all

    async def run_streaming(self, mode="both", scan_id=None):
        """Gerador assíncrono: findings um a um."""
        if mode in ("code", "both"):
            for q in self.CODE_QUERIES:
                logger.info(f"[Code] {q[:70]}")
                results = await self.search_code(q, max_pages=2)
                logger.info(f"  → {len(results)} arquivos")
                # Paralelo com raw.githubusercontent
                for i in range(0, len(results), 15):
                    batch = results[i:i + 15]
                    tasks = []
                    for r in batch:
                        repo = r["repo"]
                        path = r["path"]
                        branch = ""
                        # Tenta extrair branch da URL (fallback main)
                        tasks.append(self._scan_raw_file(repo, path, "main",
                            {"repo": repo, "query": q, "scan_id": scan_id}))
                    done = await asyncio.gather(*tasks, return_exceptions=True)
                    for findings in done:
                        if isinstance(findings, list):
                            for f in findings:
                                yield f

        if mode in ("commits", "both"):
            for p in self.COMMIT_PATTERNS:
                logger.info(f"[Commit] {p}")
                results = await self.search_commits(p, max_pages=1)
                logger.info(f"  → {len(results)} commits")
                for i in range(0, len(results), 15):
                    batch = results[i:i + 15]
                    tasks = [self._scan_commit(r, {"query": p, "scan_id": scan_id}) for r in batch]
                    done = await asyncio.gather(*tasks, return_exceptions=True)
                    for findings in done:
                        if isinstance(findings, list):
                            for f in findings:
                                yield f

    async def run_forever(self, mode="both", on_finding=None, on_cycle=None):
        """Pipeline contínuo 24h — 4 fontes (Events + Repos + Commits + Gists)."""
        seen_event_ids = set()
        seen_repos = set()
        cycle_n = 0

        while True:
            cycle_n += 1
            scan_id = f"cycle-{cycle_n:04d}"
            logger.info(f"🔄 ═══ CICLO {cycle_n} ═══")
            count = 0

            # ── FONTE 1: Events API ──
            try:
                events = await self.fetch_public_events(max_pages=5)
                new_metas = []
                for ev in events:
                    if ev["event_id"] in seen_event_ids:
                        continue
                    seen_event_ids.add(ev["event_id"])
                    for commit in ev["commits"]:
                        new_metas.append({
                            "repo": ev["repo"],
                            "commit_url": commit["url"],
                            "author_name": ev["author"],
                            "date": ev["created_at"],
                        })
                    if len(new_metas) >= 60:
                        break
                logger.info(f"📡 Events: {len(new_metas)} commits novos")
                for i in range(0, len(new_metas), 20):
                    batch = new_metas[i:i + 20]
                    tasks = [self._scan_commit(m, {"query": "events-live", "scan_id": scan_id}) for m in batch]
                    done = await asyncio.gather(*tasks, return_exceptions=True)
                    for findings in done:
                        if isinstance(findings, list):
                            for f in findings:
                                count += 1
                                if on_finding:
                                    await on_finding(f)

                if len(seen_event_ids) > 5000:
                    seen_event_ids = set(list(seen_event_ids)[-3000:])
                logger.info(f"  Events: {count} findings")
            except Exception as e:
                logger.warning(f"Events erro: {e}")

            # ── FONTE 2: Repos recém-criados ──
            try:
                languages = [None, "python", "javascript", "typescript", "go", "java", "ruby", "php", "shell", "rust", "kotlin"]
                lang = languages[(cycle_n - 1) % len(languages)]
                repos = await self.search_recent_repos(language=lang, max_pages=1)
                new_repos = [r for r in repos if r["repo"] not in seen_repos][:10]
                for r in new_repos:
                    seen_repos.add(r["repo"])
                logger.info(f"📦 Repos ({lang or 'all'}): {len(new_repos)} novos")

                # Fetch file lists em paralelo
                file_tasks = [self.fetch_repo_files(r["repo"], r.get("default_branch", "main")) for r in new_repos]
                files_lists = await asyncio.gather(*file_tasks, return_exceptions=True)

                # Scan arquivos via RAW (grátis)
                scan_tasks = []
                for repo, files_list in zip(new_repos, files_lists):
                    if not isinstance(files_list, list):
                        continue
                    branch = repo.get("default_branch", "main")
                    for finfo in files_list:
                        scan_tasks.append(
                            self._scan_raw_file(repo["repo"], finfo["path"], branch,
                                {"repo": repo["repo"], "query": f"new-repo:{lang}", "scan_id": scan_id})
                        )
                for i in range(0, len(scan_tasks), 20):
                    batch = scan_tasks[i:i + 20]
                    done = await asyncio.gather(*batch, return_exceptions=True)
                    for findings in done:
                        if isinstance(findings, list):
                            for f in findings:
                                count += 1
                                if on_finding:
                                    await on_finding(f)

                if len(seen_repos) > 2000:
                    seen_repos = set(list(seen_repos)[-1500:])
            except Exception as e:
                logger.warning(f"Repos erro: {e}")

            # ── FONTE 3: Commit search ──
            try:
                recent = (datetime.now(timezone.utc) - timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%S")
                pattern = self.COMMIT_PATTERNS[(cycle_n - 1) % len(self.COMMIT_PATTERNS)]
                results = await self.search_commits(pattern, max_pages=1, extra_qualifiers=f"committer-date:>{recent}")
                logger.info(f"🔍 Commits ({pattern}): {len(results)} última hora")
                for i in range(0, len(results), 20):
                    batch = results[i:i + 20]
                    tasks = [self._scan_commit(r, {"query": pattern, "scan_id": scan_id}) for r in batch]
                    done = await asyncio.gather(*tasks, return_exceptions=True)
                    for findings in done:
                        if isinstance(findings, list):
                            for f in findings:
                                count += 1
                                if on_finding:
                                    await on_finding(f)
            except Exception as e:
                logger.warning(f"Commit window erro: {e}")

            # ── FONTE 4: Gists (a cada 3 ciclos) ──
            if cycle_n % 3 == 0:
                try:
                    langs = ["python", "javascript", "go", "shell", None]
                    glang = langs[(cycle_n // 3) % len(langs)]
                    gists = await self.search_gists(language=glang, max_pages=2)
                    logger.info(f"📜 Gists ({glang or 'all'}): {len(gists)}")
                    for i in range(0, len(gists), 10):
                        batch = gists[i:i + 10]
                        tasks = [self._scan_gist(g, {"query": "gists", "scan_id": scan_id}) for g in batch]
                        done = await asyncio.gather(*tasks, return_exceptions=True)
                        for findings in done:
                            if isinstance(findings, list):
                                for f in findings:
                                    count += 1
                                    if on_finding:
                                        await on_finding(f)
                except Exception as e:
                    logger.warning(f"Gist scan erro: {e}")

            logger.info(f"✅ Ciclo {cycle_n}: {count} findings totais")
            if on_cycle:
                await on_cycle(cycle_n, count)
            await asyncio.sleep(1)

    async def close(self):
        await self.client.aclose()