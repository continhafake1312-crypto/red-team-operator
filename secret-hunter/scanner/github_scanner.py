"""
Scanner do GitHub — busca por chaves expostas usando GitHub Code Search, Commit Search e Gist Search.

Estratégias:
1. Code Search: patterns em arquivos (mais abrangente, sem filtro de data direto)
2. Commit Search: busca em commits recentes (suporta filtro de data!)
3. Gist Search: busca em gists públicos
4. Repo Scan: clona repositórios promissores e escaneia localmente
"""

import asyncio
import hashlib
import logging
import re
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple
from urllib.parse import quote

import httpx

from config import (
    GITHUB_TOKENS,
    GITHUB_RATE_LIMIT_PAUSE,
    MAX_RESULTS_PER_QUERY,
    MAX_PAGES,
    MIN_DATE,
)
from scanner.patterns import PATTERNS, CATEGORIES

logger = logging.getLogger(__name__)


class GitHubScanner:
    """Scanner que busca secrets no GitHub usando múltiplas estratégias."""

    def __init__(self, tokens: Optional[List[str]] = None):
        self.tokens = tokens or GITHUB_TOKENS
        self.token_index = 0
        self.rate_limits = {t: {"remaining": 5000, "reset": 0} for t in self.tokens if t}
        self.session = httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={"Accept": "application/vnd.github.v3+json"},
        )
        self._results_cache: Dict[str, bool] = {}  # cache de key_value para evitar duplicatas

    def _get_token(self) -> Optional[str]:
        """Rotaciona tokens para balanceamento de carga."""
        if not self.tokens:
            return None
        token = self.tokens[self.token_index % len(self.tokens)]
        self.token_index += 1
        return token

    def _headers(self) -> Dict[str, str]:
        """Headers com autenticação."""
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "SecretHunter/1.0",
        }
        token = self._get_token()
        if token:
            headers["Authorization"] = f"token {token}"
        return headers

    async def _rate_limit_wait(self, response: httpx.Response):
        """Espera se necessário baseado nos headers de rate limit."""
        remaining = int(response.headers.get("X-RateLimit-Remaining", 1))
        reset = int(response.headers.get("X-RateLimit-Reset", 0))

        if remaining < 5:
            wait_time = max(reset - time.time(), 1) + 1
            logger.warning(f"Rate limit baixo ({remaining}), esperando {wait_time:.0f}s...")
            await asyncio.sleep(wait_time)
        else:
            await asyncio.sleep(GITHUB_RATE_LIMIT_PAUSE)

    async def search_code(self, query: str, max_pages: int = MAX_PAGES) -> List[Dict[str, Any]]:
        """
        GitHub Code Search.
        Retorna lista de resultados com metadados.
        """
        results = []
        page = 1

        while page <= max_pages:
            try:
                encoded_query = quote(query)
                url = (
                    f"https://api.github.com/search/code"
                    f"?q={encoded_query}&per_page=100&page={page}&sort=indexed&order=desc"
                )

                resp = await self.session.get(url, headers=self._headers())
                await self._rate_limit_wait(resp)

                if resp.status_code == 403:
                    logger.warning("403 Forbidden — rate limit ou token inválido. Aguardando...")
                    await asyncio.sleep(60)
                    continue
                elif resp.status_code == 422:
                    logger.warning(f"422 Unprocessable para query: {query[:80]}... Pulando.")
                    break
                elif resp.status_code != 200:
                    logger.error(f"GitHub API error {resp.status_code}: {resp.text[:200]}")
                    break

                data = resp.json()
                items = data.get("items", [])
                if not items:
                    break

                for item in items:
                    results.append({
                        "type": "code",
                        "repo": item.get("repository", {}).get("full_name", ""),
                        "repo_url": item.get("repository", {}).get("html_url", ""),
                        "path": item.get("path", ""),
                        "html_url": item.get("html_url", ""),
                        "sha": item.get("sha", ""),
                        "git_url": item.get("git_url", ""),
                    })

                logger.debug(f"Code search page {page}: {len(items)} items")
                page += 1

                if len(items) < 100:
                    break

            except httpx.TimeoutException:
                logger.warning("Timeout no code search, retrying...")
                await asyncio.sleep(5)
                continue
            except Exception as e:
                logger.error(f"Erro no code search: {e}")
                break

        return results

    async def search_commits(self, pattern: str, since: str = MIN_DATE) -> List[Dict[str, Any]]:
        """
        GitHub Commit Search — busca commits que adicionam um pattern específico.
        Suporta filtro de data nativamente.
        """
        results = []
        page = 1

        # A query busca pelo texto e filtra por data
        query = f"{pattern} committer-date:>={since}"
        max_pages = min(MAX_PAGES, 5)  # commit search é mais pesado

        while page <= max_pages:
            try:
                encoded = quote(query)
                url = (
                    f"https://api.github.com/search/commits"
                    f"?q={encoded}&per_page=100&page={page}&sort=author-date&order=desc"
                )

                resp = await self.session.get(
                    url,
                    headers={
                        **self._headers(),
                        "Accept": "application/vnd.github.cloak-preview+json",
                    },
                )
                await self._rate_limit_wait(resp)

                if resp.status_code != 200:
                    logger.warning(f"Commit search error {resp.status_code}: {resp.text[:200]}")
                    break

                data = resp.json()
                items = data.get("items", [])
                if not items:
                    break

                for item in items:
                    commit = item.get("commit", {})
                    author = commit.get("author", {})
                    committer = commit.get("committer", {})

                    results.append({
                        "type": "commit",
                        "repo": item.get("repository", {}).get("full_name", ""),
                        "repo_url": item.get("repository", {}).get("html_url", ""),
                        "commit_url": item.get("html_url", ""),
                        "sha": item.get("sha", ""),
                        "message": commit.get("message", ""),
                        "author_name": author.get("name", "") or committer.get("name", ""),
                        "author_email": author.get("email", "") or committer.get("email", ""),
                        "date": author.get("date", "") or committer.get("date", ""),
                        "score": item.get("score", 0),
                    })

                page += 1
                if len(items) < 100:
                    break

            except Exception as e:
                logger.error(f"Erro no commit search: {e}")
                break

        return results

    async def search_gists(self, query: str) -> List[Dict[str, Any]]:
        """Busca em gists públicos."""
        results = []
        page = 1

        while page <= 5:
            try:
                encoded = quote(query)
                url = f"https://api.github.com/gists?per_page=100&page={page}"

                resp = await self.session.get(url, headers=self._headers())
                await self._rate_limit_wait(resp)

                if resp.status_code != 200:
                    break

                items = resp.json()
                if not items:
                    break

                for item in items:
                    if any(
                        pattern.lower() in (item.get("description", "") or "").lower()
                        for pattern in query.replace('"', "").split()
                    ):
                        results.append({
                            "type": "gist",
                            "gist_id": item.get("id", ""),
                            "gist_url": item.get("html_url", ""),
                            "description": item.get("description", ""),
                            "owner": item.get("owner", {}).get("login", ""),
                            "files": list(item.get("files", {}).keys()),
                            "created_at": item.get("created_at", ""),
                            "updated_at": item.get("updated_at", ""),
                        })

                page += 1
                if len(items) < 100:
                    break

            except Exception as e:
                logger.error(f"Erro no gist search: {e}")
                break

        return results

    async def fetch_file_content(self, git_url: str) -> Optional[str]:
        """Baixa o conteúdo de um arquivo via GitHub API."""
        try:
            resp = await self.session.get(git_url, headers=self._headers())
            await asyncio.sleep(0.3)
            if resp.status_code == 200:
                data = resp.json()
                import base64
                content = data.get("content", "")
                if content:
                    return base64.b64decode(content).decode("utf-8", errors="replace")
            return None
        except Exception as e:
            logger.debug(f"Erro ao buscar arquivo: {e}")
            return None

    async def fetch_commit_diff(self, commit_url: str) -> Optional[str]:
        """Baixa o diff de um commit."""
        try:
            # Converte URL de HTML para API
            api_url = commit_url.replace("github.com", "api.github.com/repos").replace("/commit/", "/commits/")
            resp = await self.session.get(
                api_url,
                headers={
                    **self._headers(),
                    "Accept": "application/vnd.github.v3.diff",
                },
            )
            await asyncio.sleep(0.3)
            if resp.status_code == 200:
                return resp.text
            return None
        except Exception as e:
            logger.debug(f"Erro ao buscar diff: {e}")
            return None

    def extract_keys_from_content(
        self, content: str, source: str, metadata: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Aplica todos os padrões de regex no conteúdo e extrai as chaves encontradas.
        Retorna lista de dicts prontos para salvar no DB.
        """
        findings = []
        content_hash = hashlib.sha256(content.encode()).hexdigest()

        for pattern in PATTERNS:
            try:
                regex = pattern["regex"]
                matches = re.finditer(regex, content, re.MULTILINE)
                for match in matches:
                    group_idx = pattern.get("group", 0)
                    if isinstance(group_idx, int):
                        value = match.group(group_idx) if match.lastindex and match.lastindex >= group_idx else match.group(0)
                    else:
                        value = match.group(0)

                    if not value or len(value) < 8:
                        continue

                    # Valida entropia mínima (se exigido)
                    min_entropy = pattern.get("entropy_min", 0)
                    if min_entropy > 0:
                        from scanner.entropy import shannon_entropy
                        if shannon_entropy(value) < min_entropy:
                            continue

                    # Verifica se tem contexto necessário
                    context_req = pattern.get("context_required", [])
                    if context_req:
                        content_lower = content.lower()
                        if not any(ctx.lower() in content_lower for ctx in context_req):
                            continue

                    # Filtro de data (se metadata tiver data)
                    date_found = metadata.get("date", metadata.get("date_found", ""))
                    if date_found and MIN_DATE:
                        try:
                            if date_found[:10] < MIN_DATE[:10]:
                                continue
                        except:
                            pass

                    # Máscara para exibição
                    masked = self._mask_value(value)

                    # Evita duplicatas dentro do mesmo scan
                    key_hash = hashlib.md5(value.encode()).hexdigest()
                    if key_hash in self._results_cache:
                        continue
                    self._results_cache[key_hash] = True

                    finding = {
                        "key_type": pattern["category"],
                        "key_name": pattern["name"],
                        "key_value": value,
                        "masked_value": masked,
                        "confidence": pattern["confidence"],
                        "context": content[max(0, match.start() - 100):match.end() + 100],
                        "source": source,
                        "file_path": metadata.get("path", ""),
                        "commit_url": metadata.get("commit_url", ""),
                        "author": metadata.get("author", metadata.get("author_name", "")),
                        "date_found": date_found[:10] if date_found else "",
                        "repo_name": metadata.get("repo", ""),
                        "search_query": metadata.get("query", ""),
                        "validated": False,
                        "is_valid": None,
                    }
                    findings.append(finding)

                    # Se é um pattern de contexto (requer extração de grupo específica)
                    if pattern.get("type") == "context" and pattern.get("extract_group"):
                        # Patterns como password=, api_key= etc já foram capturados
                        pass

            except re.error as e:
                logger.debug(f"Regex error no pattern {pattern['name']}: {e}")
                continue

        return findings

    def _mask_value(self, value: str) -> str:
        """Mascara o valor para exibição segura."""
        if len(value) <= 8:
            return "****"
        return value[:4] + "****" + value[-4:]

    async def run_code_scan(self, queries: List[str], max_pages: int = 3) -> List[Dict[str, Any]]:
        """
        Scan completo via Code Search.
        Para cada query, busca resultados e extrai keys.
        """
        all_findings = []

        for query in queries:
            logger.info(f"Code search: {query[:80]}...")
            results = await self.search_code(query, max_pages=max_pages)

            batch_size = 5  # processa em lote para não sobrecarregar
            for i in range(0, len(results), batch_size):
                batch = results[i:i + batch_size]
                tasks = []

                for result in batch:
                    if result.get("git_url"):
                        tasks.append(self.fetch_file_content(result["git_url"]))

                contents = await asyncio.gather(*tasks, return_exceptions=True)

                for result, content in zip(batch, contents):
                    if isinstance(content, str) and content:
                        metadata = {
                            **result,
                            "query": query,
                        }
                        findings = self.extract_keys_from_content(content, result.get("html_url", ""), metadata)
                        all_findings.extend(findings)
                        if findings:
                            logger.info(f"  → {len(findings)} keys em {result.get('path', '')}")

                await asyncio.sleep(0.5)  # pausa entre lotes

        return all_findings

    async def run_commit_scan(self, patterns: List[str]) -> List[Dict[str, Any]]:
        """
        Scan via Commit Search — busca por padrões em commits recentes.
        """
        all_findings = []

        for pattern in patterns[:20]:  # limita a 20 patterns por vez
            logger.info(f"Commit search: {pattern[:60]}...")
            results = await self.search_commits(pattern)
            if not results:
                continue

            for result in results:
                diff = await self.fetch_commit_diff(result.get("commit_url", ""))
                if diff:
                    metadata = {
                        **result,
                        "query": pattern,
                    }
                    # Foca em linhas adicionadas (que começam com +)
                    added_lines = "\n".join(
                        line[1:] for line in diff.split("\n")
                        if line.startswith("+") and not line.startswith("+++")
                    )
                    if added_lines.strip():
                        findings = self.extract_keys_from_content(
                            added_lines, result.get("commit_url", ""), metadata
                        )
                        all_findings.extend(findings)

                await asyncio.sleep(0.3)

        return all_findings

    async def run_scan(
        self,
        mode: str = "both",
        custom_queries: Optional[List[str]] = None,
        progress_callback=None,
    ) -> List[Dict[str, Any]]:
        """
        Executa scan completo.

        Args:
            mode: "code" | "commits" | "both"
            custom_queries: Queries personalizadas (usa defaults se None)
        """
        self._results_cache.clear()
        all_findings = []

        # Queries default — busca por padrões comuns de exposição
        default_queries = [
            'AWS_ACCESS_KEY_ID" || "AKIA',
            '"sk-proj-" OR "sk-ant-"',
            '"ghp_" OR "gho_" OR "ghu_" OR "ghr_"',
            '"glpat-" OR "xoxb-"',
            '"mongodb+srv://" OR "mongodb://"',
            '"postgresql://" OR "postgres://"',
            '"-----BEGIN OPENSSH PRIVATE KEY-----"',
            '"npm_" OR "dckr_pat_"',
            '".env" + "DB_PASSWORD"',
            '"AWS_SECRET_ACCESS_KEY"',
            '"api_key" + "sk_live"',
            '"SG." + "sendgrid"',
            '"key-" + "mailgun"',
            '"AccountKey=" + "DefaultEndpointsProtocol"',
            '"AIza" + "api"',
            '"dop_v1_"',
            '"NRAK-"',
            '"squ_"',
            '"hf_"',
            '"connection_string" + "Server=tcp:"',
            '"password" + "root" + "host"',
        ]
        queries = custom_queries or default_queries

        # ── Code Search ──
        if mode in ("code", "both"):
            logger.info("🚀 Iniciando Code Search...")
            findings = await self.run_code_scan(queries, max_pages=MAX_PAGES)
            all_findings.extend(findings)
            if progress_callback:
                await progress_callback("code", len(findings))
            logger.info(f"✓ Code Search: {len(findings)} keys encontradas")

        # ── Commit Search ──
        if mode in ("commits", "both"):
            logger.info("🚀 Iniciando Commit Search...")
            # Patterns mais específicos para commit search
            commit_patterns = [
                'AKIA', 'sk-proj-', 'sk-ant-', 'ghp_', 'glpat-', 'xoxb-',
                'mongodb+srv://', 'mongodb://', 'postgresql://', 'redis://',
                '-----BEGIN', 'npm_', 'dckr_pat_', 'SG.', 'key-',
                'AIza', 'dop_v1_', 'hf_', 'NRAK-', 'squ_',
                'AccountKey=', 'sk_live_', 'pk_live_',
            ]
            findings = await self.run_commit_scan(commit_patterns)
            all_findings.extend(findings)
            if progress_callback:
                await progress_callback("commits", len(findings))
            logger.info(f"✓ Commit Search: {len(findings)} keys encontradas")

        # Remove duplicatas pelo key_value
        seen = set()
        unique = []
        for f in all_findings:
            if f["key_value"] not in seen:
                seen.add(f["key_value"])
                unique.append(f)

        return unique

    async def close(self):
        await self.session.aclose()