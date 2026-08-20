"""
Scanner GitHub — busca por chaves expostas usando Code Search + Commit Search.
"""

import asyncio
import base64
import hashlib
import logging
import re
import time
import uuid
from typing import Optional

import httpx
from urllib.parse import quote as urlquote

from patterns import PATTERNS

logger = logging.getLogger("scanner")

GITHUB_TOKENS = []
SCANNER_MIN_DATE = "2026-01-01"
MAX_RESULTS = 300


class GitHubScanner:
    def __init__(self, tokens=None, min_date=None):
        self.tokens = tokens or GITHUB_TOKENS
        self._token_idx = 0
        self.min_date = min_date or SCANNER_MIN_DATE
        self._seen = set()
        self.client = httpx.AsyncClient(timeout=25, follow_redirects=True)

    def _headers(self):
        h = {"Accept": "application/vnd.github.v3+json", "User-Agent": "SecretHunter/1.0"}
        if self.tokens:
            t = self.tokens[self._token_idx % len(self.tokens)]
            self._token_idx += 1
            h["Authorization"] = f"token {t}"
        return h

    async def _rate_wait(self, resp):
        # GitHub search API: 30 req/min. Respeita o header de remaining.
        rem = int(resp.headers.get("X-RateLimit-Remaining", 30))
        reset = int(resp.headers.get("X-RateLimit-Reset", 0))
        if rem <= 2 and reset > 0:
            w = max(reset - int(time.time()), 0) + 2
            if w > 70: w = 65  # cap em 65s
            logger.warning(f"⏳ Rate limit search ({rem}), esperando {w}s...")
            await asyncio.sleep(w)
        else:
            # Pausa curta para respeitar ~30 req/min
            await asyncio.sleep(2)

    async def _fetch_url(self, url: str) -> Optional[dict]:
        for _ in range(3):
            try:
                r = await self.client.get(url, headers=self._headers())
                await self._rate_wait(r)
                if r.status_code == 200:
                    return r.json()
                elif r.status_code == 403:
                    logger.warning("403 — esperando 30s...")
                    await asyncio.sleep(30)
                    continue
                elif r.status_code in (422, 404):
                    return None
                return None
            except httpx.TimeoutException:
                await asyncio.sleep(5)
        return None

    async def _fetch_text(self, url: str, accept: str = "") -> Optional[str]:
        h = self._headers()
        if accept:
            h["Accept"] = accept
        for _ in range(3):
            try:
                r = await self.client.get(url, headers=h)
                await self._rate_wait(r)
                if r.status_code == 200:
                    return r.text
                return None
            except httpx.TimeoutException:
                await asyncio.sleep(5)
        return None

    async def search_code(self, query: str, max_pages=5) -> list:
        results = []
        for page in range(1, max_pages + 1):
            url = f"https://api.github.com/search/code?q={urlquote(query)}&per_page=100&page={page}"
            data = await self._fetch_url(url)
            if not data or not data.get("items"):
                break
            for item in data["items"]:
                results.append({
                    "repo": item["repository"]["full_name"],
                    "repo_url": item["repository"]["html_url"],
                    "path": item["path"],
                    "html_url": item["html_url"],
                    "git_url": item.get("git_url", ""),
                })
        return results

    async def search_commits(self, pattern: str, max_pages=3, extra_qualifiers: str = "") -> list:
        results = []
        # Foco em repos PEQUENOS: stars:<5 (coitados, recém-criados, poucos seguidores)
        # Combina pattern + data mínima + filtro de stars baixo
        query_parts = [pattern, f"committer-date:>={self.min_date}"]
        if extra_qualifiers:
            query_parts.append(extra_qualifiers)
        query = " ".join(query_parts)
        for page in range(1, max_pages + 1):
            url = f"https://api.github.com/search/commits?q={urlquote(query)}&per_page=100&page={page}"
            data = await self._fetch_url(url)
            if not data or not data.get("items"):
                break
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

    def extract(self, content: str, source: str, meta: dict) -> list:
        findings = []
        for name, cat, regex, conf, validator in PATTERNS:
            try:
                for m in re.finditer(regex, content, re.MULTILINE | re.IGNORECASE):
                    val = m.group(0) if not m.lastindex else (m.group(1) or m.group(0))
                    if len(val) < 8:
                        continue
                    h = hashlib.md5(val.encode()).hexdigest()
                    if h in self._seen:
                        continue
                    self._seen.add(h)

                    masked = val[:4] + "*" * (len(val) - 8) + val[-4:] if len(val) > 12 else val[:2] + "*" * (len(val) - 4) + val[-2:]
                    ctx = content[max(0, m.start() - 80):m.end() + 80]

                    findings.append({
                        "key_type": cat,
                        "key_name": name,
                        "key_value": val,
                        "masked_value": masked,
                        "confidence": conf,
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

    async def _fetch_file_content(self, result: dict, query: str, scan_id: str):
        """Baixa 1 arquivo e extrai findings (para paralelismo)."""
        if not result.get("git_url"):
            return []
        c = await self._fetch_text(result["git_url"])
        if not c:
            return []
        meta = {**result, "query": query, "scan_id": scan_id}
        return self.extract(c, result.get("html_url", ""), meta)

    async def _fetch_commit_diff(self, result: dict, pattern: str, scan_id: str):
        """Baixa 1 diff de commit e extrai findings (para paralelismo)."""
        if not result.get("commit_url"):
            return []
        diff = await self._fetch_text(
            result["commit_url"].replace("github.com", "api.github.com/repos").replace("/commit/", "/commits/"),
            accept="application/vnd.github.v3.diff"
        )
        if not diff:
            return []
        added = "\n".join(l[1:] for l in diff.split("\n") if l.startswith("+") and not l.startswith("+++"))
        if not added.strip():
            return []
        meta = {**result, "query": pattern + " (commit)", "scan_id": scan_id}
        return self.extract(added, result.get("commit_url", ""), meta)

    # ── Lista gigante de queries (cobre máximo de terreno) ─────────────────
    CODE_QUERIES = [
        # Cloud
        '"AKIA" stars:<10', '"AIza" stars:<10', '"AccountKey=" stars:<10',
        '"sk_live_" stars:<10', '"dop_v1_" stars:<10',
        # AI
        '"sk-proj-" stars:<10', '"sk-ant-" stars:<10', '"hf_" stars:<10',
        # Tokens
        '"ghp_" stars:<10', '"glpat-" stars:<10', '"xoxb-" stars:<10',
        '"npm_" stars:<10', '"dckr_pat_" stars:<10', '"NRAK-" stars:<10',
        '"squ_" stars:<10',
        # DBs
        '"mongodb+srv://" stars:<10', '"postgresql://" stars:<10',
        '"mysql://" stars:<10', '"redis://" stars:<10',
        # Keys
        '"-----BEGIN OPENSSH PRIVATE KEY-----" stars:<10',
        '"-----BEGIN PRIVATE KEY-----" stars:<10',
        # Email/Notif
        '"SG." stars:<10', '"key-" stars:<10',
        # .env files (OURO — repos pequenos expõem muito)
        '"DB_PASSWORD" filename:.env stars:<5',
        '"AWS_SECRET_ACCESS_KEY" filename:.env stars:<5',
        '"AWS_ACCESS_KEY_ID" filename:.env stars:<5',
        '"MONGO_URI" filename:.env stars:<5',
        '"MONGODB_URI" filename:.env stars:<5',
        '"OPENAI_API_KEY" filename:.env stars:<5',
        '"ANTHROPIC_API_KEY" filename:.env stars:<5',
        '"STRIPE_SECRET_KEY" filename:.env stars:<5',
        '"GITHUB_TOKEN" filename:.env stars:<5',
        '"GITLAB_TOKEN" filename:.env stars:<5',
        '"SLACK_TOKEN" filename:.env stars:<5',
        '"SLACK_BOT_TOKEN" filename:.env stars:<5',
        '"DISCORD_TOKEN" filename:.env stars:<5',
        '"TELEGRAM_TOKEN" filename:.env stars:<5',
        '"TWILIO_AUTH_TOKEN" filename:.env stars:<5',
        '"SENDGRID_API_KEY" filename:.env stars:<5',
        '"MAILGUN_API_KEY" filename:.env stars:<5',
        '"JWT_SECRET" filename:.env stars:<5',
        '"SECRET_KEY" filename:.env stars:<5',
        '"DATABASE_URL" filename:.env stars:<5',
        '"REDIS_URL" filename:.env stars:<5',
        '"DIGITALOCEAN_TOKEN" filename:.env stars:<5',
        '"HEROKU_API_KEY" filename:.env stars:<5',
        '"CLOUDFLARE_API_TOKEN" filename:.env stars:<5',
        '"GOOGLE_API_KEY" filename:.env stars:<5',
        '"FIREBASE_API_KEY" filename:.env stars:<5',
        '"AZURE_STORAGE_KEY" filename:.env stars:<5',
        # docker-compose / config files (repos pequenos cometem erro)
        '"password" filename:docker-compose.yml stars:<3',
        '"PASSWORD" filename:docker-compose.yml stars:<3',
        '"password" filename:config.json stars:<3',
        '"password" filename:database.yml stars:<3',
        '"password" filename:settings.py stars:<3',
        '"api_key" filename:settings.py stars:<3',
        '"secret" filename:application.yml stars:<3',
        '"password" filename:application.properties stars:<3',
        # Arquivos de credenciais hardcoded
        '"api_key" extension:py stars:<5',
        '"api_key" extension:js stars:<5',
        '"api_key" extension:ts stars:<5',
        '"api_key" extension:go stars:<5',
        '"api_key" extension:rb stars:<5',
        '"api_key" extension:java stars:<5',
        '"access_key" extension:py stars:<5',
        '"access_token" extension:py stars:<5',
        '"secret_key" extension:py stars:<5',
        # Hardcoded AWS
        '"aws_access_key_id" extension:py stars:<5',
        '"aws_secret_access_key" extension:py stars:<5',
        # Recentemente criados (últimos dias — maior chance de exposição acidental)
        '"AKIA" created:>2026-08-10 stars:<3',
        '"ghp_" created:>2026-08-10 stars:<3',
        '"sk-proj-" created:>2026-08-10 stars:<3',
        '"sk_live_" created:>2026-08-10 stars:<3',
        '"mongodb+srv://" created:>2026-08-10 stars:<3',
        '"-----BEGIN OPENSSH PRIVATE KEY-----" created:>2026-08-10 stars:<3',
        '"DB_PASSWORD" created:>2026-08-10 stars:<3',
    ]

    COMMIT_PATTERNS = [
        'AKIA', 'ghp_', 'glpat-', 'xoxb-', 'sk-proj-', 'sk-ant-',
        'mongodb+srv://', '-----BEGIN', 'dckr_pat_', 'npm_', 'hf_',
        'sk_live_', 'AIza', 'DB_PASSWORD', 'SECRET_KEY', 'OPENAI_API_KEY',
        'STRIPE_SECRET_KEY', 'GITHUB_TOKEN',
    ]

    async def run(self, mode="both", scan_id=None) -> list:
        """Scan único (compatibilidade). Ver run_forever para modo contínuo."""
        findings_all = []
        async for f in self.run_streaming(mode=mode, scan_id=scan_id):
            findings_all.append(f)
        return findings_all

    async def run_streaming(self, mode="both", scan_id=None):
        """Gerador assíncrono: produz findings um a um (streaming)."""
        self._seen.clear()

        if mode in ("code", "both"):
            for q in self.CODE_QUERIES:
                logger.info(f"[Code] {q[:70]}")
                results = await self.search_code(q, max_pages=2)
                logger.info(f"  → {len(results)} arquivos")
                # Baixa arquivos EM PARALELO (lotes de 8) — muito mais rápido
                for i in range(0, len(results), 8):
                    batch = results[i:i + 8]
                    tasks = [self._fetch_file_content(r, q, scan_id) for r in batch]
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
                for i in range(0, len(results), 6):
                    batch = results[i:i + 6]
                    tasks = [self._fetch_commit_diff(r, p, scan_id) for r in batch]
                    done = await asyncio.gather(*tasks, return_exceptions=True)
                    for findings in done:
                        if isinstance(findings, list):
                            for f in findings:
                                yield f

    async def run_forever(self, mode="both", on_finding=None, on_cycle=None):
        """
        Pipeline CONTÍNUO 24h — cicla pelas queries para sempre.
        Cada finding é passado para on_finding (callback) imediatamente.
        on_cycle() é chamado ao completar um ciclo de todas as queries.
        """
        import itertools
        cycle_n = 0
        while True:
            cycle_n += 1
            scan_id = f"cycle-{cycle_n:04d}"
            logger.info(f"🔄 ═══ CICLO {cycle_n} iniciado ═══")
            count = 0
            async for f in self.run_streaming(mode=mode, scan_id=scan_id):
                count += 1
                if on_finding:
                    await on_finding(f)
            logger.info(f"✅ Ciclo {cycle_n}: {count} findings")
            if on_cycle:
                await on_cycle(cycle_n, count)
            # Sem pausa — recomeça imediatamente o próximo ciclo

    async def close(self):
        await self.client.aclose()