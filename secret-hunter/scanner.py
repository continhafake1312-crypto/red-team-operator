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
        rem = int(resp.headers.get("X-RateLimit-Remaining", 5))
        if rem < 5:
            reset = int(resp.headers.get("X-RateLimit-Reset", time.time()))
            w = max(reset - time.time(), 0) + 2
            logger.warning(f"⏳ Rate limit baixo ({rem}), esperando {w:.0f}s...")
            await asyncio.sleep(w)
        else:
            await asyncio.sleep(0.3)

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
            url = f"https://api.github.com/search/code?q={httpx.utils.quote(query)}&per_page=100&page={page}"
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

    async def search_commits(self, pattern: str, max_pages=3) -> list:
        results = []
        query = f"{pattern} committer-date:>={self.min_date}"
        for page in range(1, max_pages + 1):
            url = f"https://api.github.com/search/commits?q={httpx.utils.quote(query)}&per_page=100&page={page}"
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

    async def run(self, mode="both", scan_id=None) -> list:
        self._seen.clear()
        all_findings = []

        queries = [
            '"AKIA"', '"sk-proj-" OR "sk-ant-"', '"ghp_" OR "gho_"',
            '"glpat-" OR "xoxb-"', '"mongodb+srv://"',
            '"postgresql://" OR "mysql://"', '"-----BEGIN OPENSSH PRIVATE KEY-----"',
            '"npm_" OR "dckr_pat_"', '"SG." OR "key-"', '"dop_v1_"',
            '"NRAK-" OR "squ_" OR "hf_"',
            '"AIza" + "key"', '"sk_live_"',
            '"AccountKey="', '"DB_PASSWORD" + ".env"',
        ]

        if mode in ("code", "both"):
            for q in queries:
                logger.info(f"[Code] {q[:60]}...")
                results = await self.search_code(q, max_pages=3)
                for i in range(0, len(results), 5):
                    batch = results[i:i + 5]
                    contents = []
                    for r in batch:
                        if r.get("git_url"):
                            c = await self._fetch_text(r["git_url"])
                            contents.append(c)
                        else:
                            contents.append(None)
                    for r, c in zip(batch, contents):
                        if c:
                            meta = {**r, "query": q, "scan_id": scan_id}
                            findings = self.extract(c, r.get("html_url", ""), meta)
                            all_findings.extend(findings)
                    await asyncio.sleep(0.3)

        if mode in ("commits", "both"):
            patterns = ['AKIA', 'ghp_', 'glpat-', 'xoxb-', 'sk-proj-', 'sk-ant-',
                        'mongodb+srv://', '-----BEGIN', 'dckr_pat_', 'npm_', 'hf_']
            for p in patterns:
                logger.info(f"[Commit] {p}...")
                results = await self.search_commits(p, max_pages=2)
                for r in results:
                    diff = await self._fetch_text(
                        r["commit_url"].replace("github.com", "api.github.com/repos").replace("/commit/", "/commits/"),
                        accept="application/vnd.github.v3.diff"
                    )
                    if diff:
                        added = "\n".join(l[1:] for l in diff.split("\n") if l.startswith("+") and not l.startswith("+++"))
                        if added.strip():
                            meta = {**r, "query": p + " (commit)", "scan_id": scan_id}
                            findings = self.extract(added, r.get("commit_url", ""), meta)
                            all_findings.extend(findings)
                    await asyncio.sleep(0.3)

        # Dedup
        seen_kv = set()
        uniq = []
        for f in all_findings:
            k = f["key_value"]
            if k not in seen_kv:
                seen_kv.add(k)
                uniq.append(f)
        return uniq

    async def close(self):
        await self.client.aclose()