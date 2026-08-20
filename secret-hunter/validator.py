"""
Validação de chaves contra APIs reais.
"""

import asyncio
import logging
import re

import httpx

logger = logging.getLogger("validator")


class KeyValidator:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10, follow_redirects=False)

    async def validate(self, key_type: str, key_value: str) -> dict:
        handler = getattr(self, f"_validate_{key_type}", None)
        if not handler:
            return {"is_valid": None, "message": "Sem validador para este tipo", "score": 0}
        try:
            return await handler(key_value)
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "score": 0}

    async def validate_batch(self, items: list, max_workers=10) -> list:
        sem = asyncio.Semaphore(max_workers)

        async def _one(db_id, kt, kv):
            async with sem:
                r = await self.validate(kt, kv)
                return db_id, r

        return await asyncio.gather(*[_one(i, k, v) for i, k, v in items])

    # ── Validadores ──────────────────────────────────────────────────

    async def _validate_github(self, key: str) -> dict:
        r = await self.client.get("https://api.github.com/user",
                                   headers={"Authorization": f"Bearer {key}",
                                            "Accept": "application/vnd.github.v3+json"})
        if r.status_code == 200:
            d = r.json()
            return {"is_valid": True, "message": f"✅ Usuário: {d.get('login','?')} (id:{d.get('id','?')})", "score": 10}
        elif r.status_code == 401:
            return {"is_valid": False, "message": "Inválido ou revogado", "score": 10}
        elif r.status_code == 403:
            return {"is_valid": True, "message": "Válido mas rate-limit (bom sinal)", "score": 8}
        return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}

    async def _validate_gitlab(self, key: str) -> dict:
        r = await self.client.get("https://gitlab.com/api/v4/user",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            return {"is_valid": True, "message": f"✅ User: {r.json().get('username','?')}", "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_openai(self, key: str) -> dict:
        r = await self.client.get("https://api.openai.com/v1/models",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            return {"is_valid": True, "message": f"✅ Acesso a {len(r.json().get('data',[]))} modelos", "score": 10}
        elif r.status_code == 429:
            return {"is_valid": True, "message": "Válida (rate-limited = tem crédito)", "score": 9}
        elif r.status_code == 401:
            return {"is_valid": False, "message": "Inválida", "score": 10}
        return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}

    async def _validate_anthropic(self, key: str) -> dict:
        r = await self.client.get("https://api.anthropic.com/v1/messages",
                                   headers={"x-api-key": key, "anthropic-version": "2023-06-01"})
        if r.status_code in (200, 400):
            return {"is_valid": True, "message": "✅ Válida!", "score": 9}
        elif r.status_code == 401:
            return {"is_valid": False, "message": "Inválida", "score": 10}
        return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}

    async def _validate_huggingface(self, key: str) -> dict:
        r = await self.client.get("https://huggingface.co/api/whoami",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            return {"is_valid": True, "message": f"✅ User: {r.json().get('name','?')}", "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_stripe(self, key: str) -> dict:
        r = await self.client.get("https://api.stripe.com/v1/charges?limit=1", auth=(key, ""))
        if r.status_code == 200:
            return {"is_valid": True, "message": "✅ Stripe key válida!", "score": 10}
        elif r.status_code == 401:
            return {"is_valid": False, "message": "Inválida", "score": 10}
        return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}

    async def _validate_slack(self, key: str) -> dict:
        r = await self.client.get("https://slack.com/api/auth.test",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200 and r.json().get("ok"):
            d = r.json()
            return {"is_valid": True, "message": f"✅ Team: {d.get('team','?')} User: {d.get('user','?')}", "score": 10}
        return {"is_valid": False, "message": "Inválido", "score": 9}

    async def _validate_discord(self, key: str) -> dict:
        r = await self.client.get("https://discord.com/api/v10/users/@me",
                                   headers={"Authorization": key})
        if r.status_code == 200:
            d = r.json()
            return {"is_valid": True, "message": f"✅ {d.get('username','?')}#{d.get('discriminator','?')}", "score": 10}
        elif r.status_code == 401:
            return {"is_valid": False, "message": "Inválido", "score": 10}
        return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}

    async def _validate_telegram(self, key: str) -> dict:
        r = await self.client.get(f"https://api.telegram.org/bot{key}/getMe")
        if r.status_code == 200 and r.json().get("ok"):
            bot = r.json()["result"]
            return {"is_valid": True, "message": f"✅ Bot: @{bot.get('username','?')}", "score": 10}
        return {"is_valid": False, "message": "Inválido", "score": 9}

    async def _validate_sendgrid(self, key: str) -> dict:
        r = await self.client.get("https://api.sendgrid.com/v3/scopes",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            return {"is_valid": True, "message": f"✅ {len(r.json().get('scopes',[]))} scopes", "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_mailgun(self, key: str) -> dict:
        r = await self.client.get("https://api.mailgun.net/v3/domains", auth=("api", key))
        if r.status_code == 200:
            return {"is_valid": True, "message": f"✅ {len(r.json().get('items',[]))} domínios", "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_digitalocean(self, key: str) -> dict:
        r = await self.client.get("https://api.digitalocean.com/v2/account",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            acct = r.json().get("account", {})
            return {"is_valid": True, "message": f"✅ Email: {acct.get('email','?')}", "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_npm(self, key: str) -> dict:
        r = await self.client.get("https://registry.npmjs.org/-/whoami",
                                   headers={"Authorization": f"Bearer {key}"})
        if r.status_code == 200:
            return {"is_valid": True, "message": f"✅ User: {r.json().get('username','?')}", "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_docker(self, key: str) -> dict:
        r = await self.client.get("https://hub.docker.com/v2/user",
                                   headers={"Authorization": f"JWT {key}"})
        if r.status_code == 200:
            return {"is_valid": True, "message": f"✅ User: {r.json().get('username','?')}", "score": 10}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_google_api(self, key: str) -> dict:
        r = await self.client.get(f"https://maps.googleapis.com/maps/api/geocode/json?latlng=0,0&key={key}")
        if r.status_code == 200:
            s = r.json().get("status", "")
            if s in ("OK", "ZERO_RESULTS"):
                return {"is_valid": True, "message": "✅ Google API Key válida!", "score": 10}
            elif s == "REQUEST_DENIED":
                return {"is_valid": True, "message": "⚠️ Key existe mas sem permissão a esta API", "score": 7}
        return {"is_valid": None, "message": f"HTTP {r.status_code}", "score": 5}

    async def _validate_twilio(self, key: str) -> dict:
        r = await self.client.get(f"https://api.twilio.com/2010-04-01/Accounts/{key}.json", auth=(key, key))
        if r.status_code == 200:
            return {"is_valid": True, "message": "✅ Twilio SID válido!", "score": 9}
        return {"is_valid": r.status_code == 401 and False, "message": f"HTTP {r.status_code}", "score": 8}

    async def _validate_jwt(self, key: str) -> dict:
        import base64, json
        parts = key.split(".")
        if len(parts) != 3:
            return {"is_valid": None, "message": "Formato JWT inválido", "score": 0}
        try:
            payload = parts[1] + "=" * (4 - len(parts[1]) % 4)
            decoded = json.loads(base64.urlsafe_b64decode(payload))
            exp = decoded.get("exp", 0)
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc).timestamp()
            if exp and exp < now:
                return {"is_valid": False, "message": f"Expirado (exp:{exp}, now:{now:.0f})", "score": 10}
            return {"is_valid": True, "message": f"Válido! iss={decoded.get('iss','?')}, sub={decoded.get('sub','?')}", "score": 8}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro decode: {str(e)[:100]}", "score": 3}

    async def _validate_mongo(self, key: str) -> dict:
        if "mongodb+srv://" in key or "mongodb://" in key:
            return {"is_valid": None, "message": "MongoDB URI (requer conexão direta para testar)", "score": 5}
        return {"is_valid": None, "message": "Formato não reconhecido", "score": 0}

    async def _validate_postgres(self, key: str) -> dict:
        return {"is_valid": None, "message": "PostgreSQL URI (requer conexão direta)", "score": 5}

    async def _validate_mysql(self, key: str) -> dict:
        return {"is_valid": None, "message": "MySQL URI (requer conexão direta)", "score": 5}

    async def _validate_redis(self, key: str) -> dict:
        return {"is_valid": None, "message": "Redis URI (requer conexão direta)", "score": 5}

    async def _validate_none(self, key: str) -> dict:
        return {"is_valid": None, "message": "Sem validação remota disponível", "score": 0}

    async def close(self):
        await self.client.aclose()