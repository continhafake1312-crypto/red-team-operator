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

    # Mapeia key_type (categoria) → nome do método validador
    _TYPE_MAP = {
        "mongodb": "mongo",
        "postgresql": "postgres",
        "gcp": "google_api",
    }

    async def validate(self, key_type: str, key_value: str) -> dict:
        handler_name = self._TYPE_MAP.get(key_type, key_type)
        handler = getattr(self, f"_validate_{handler_name}", None)
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

    async def _validate_aws(self, key: str) -> dict:
        """
        AWS Access Key (AKIA...) — testa via STS GetCallerIdentity (sem SDK, HTTP puro).
        AWS Secret Key — não pode testar isolada (precisa do Access Key ID), marca como pendente.
        """
        # AWS Access Key ID (AKIA + 16 chars)
        if key.startswith("AKIA") and len(key) == 20:
            # Não dá pra validar Access Key ID sem a Secret Key — STS exige ambas.
            # Mas podemos checar formato e marcar como "reconhecido"
            return {
                "is_valid": None,
                "message": "AWS Access Key ID (precisa da Secret Key p/ validar via STS)",
                "score": 5
            }
        # AWS Secret Key (40 chars base64) — precisa do Access Key ID
        if len(key) == 40:
            return {
                "is_valid": None,
                "message": "AWS Secret Key (precisa do Access Key ID p/ validar via STS)",
                "score": 5
            }
        return {"is_valid": None, "message": "Formato AWS não reconhecido", "score": 0}

    async def _validate_generic(self, key: str) -> dict:
        """Generic secrets/passwords — não têm API para validar, marca como detectado."""
        return {"is_valid": None, "message": "Secret genérico (sem API de validação)", "score": 3}

    async def _validate_password(self, key: str) -> dict:
        """Passwords em config — não têm API para validar, marca como detectado."""
        return {"is_valid": None, "message": "Password hardcoded (sem API de validação)", "score": 3}

    async def _validate_ssh(self, key: str) -> dict:
        """SSH private key — valida formato (cabeçalho PEM)."""
        if "BEGIN" in key and "PRIVATE KEY" in key:
            return {"is_valid": True, "message": "✅ Chave SSH privada válida (formato PEM)", "score": 8}
        return {"is_valid": None, "message": "Formato SSH não reconhecido", "score": 0}

    async def _validate_pgp(self, key: str) -> dict:
        """PGP private key — valida formato."""
        if "BEGIN PGP PRIVATE KEY" in key:
            return {"is_valid": True, "message": "✅ Chave PGP privada válida (formato)", "score": 8}
        return {"is_valid": None, "message": "Formato PGP não reconhecido", "score": 0}

    async def _validate_mongo(self, key: str) -> dict:
        """MongoDB URI — conecta via pymongo em thread separada (não trava event loop)."""
        if "mongodb" not in key:
            return {"is_valid": None, "message": "Formato não reconhecido", "score": 0}
        return await asyncio.to_thread(self._mongo_sync, key)

    def _mongo_sync(self, key: str) -> dict:
        try:
            import pymongo
            client = pymongo.MongoClient(key, serverSelectionTimeoutMS=8000, connectTimeoutMS=8000)
            dbs = client.list_database_names()
            total_cols = 0
            sample_cols = []
            for db_name in dbs[:5]:
                try:
                    cols = client[db_name].list_collection_names()
                    total_cols += len(cols)
                    sample_cols.extend(cols[:3])
                except Exception:
                    pass
            client.close()
            if dbs:
                return {
                    "is_valid": True,
                    "message": f"✅ MongoDB vivo! {len(dbs)} DBs ({', '.join(dbs[:4])}), {total_cols} cols",
                    "score": 10
                }
            return {"is_valid": True, "message": "✅ Conectou (DB vazia)", "score": 9}
        except Exception as e:
            return self._db_error(e)

    async def _validate_postgres(self, key: str) -> dict:
        """PostgreSQL URI — conecta via psycopg2 em thread."""
        return await asyncio.to_thread(self._postgres_sync, key)

    def _postgres_sync(self, key: str) -> dict:
        try:
            import psycopg2
            conn = psycopg2.connect(key, connect_timeout=8)
            cur = conn.cursor()
            cur.execute("SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema')")
            n = cur.fetchone()[0]
            cur.execute("SELECT current_user, current_database()")
            user, db = cur.fetchone()
            conn.close()
            return {"is_valid": True, "message": f"✅ Postgres vivo! user={user}, db={db}, {n} tabelas", "score": 10}
        except ImportError:
            return {"is_valid": None, "message": "psycopg2 não instalado", "score": 5}
        except Exception as e:
            return self._db_error(e)

    async def _validate_mysql(self, key: str) -> dict:
        """MySQL URI — conecta via pymysql em thread."""
        return await asyncio.to_thread(self._mysql_sync, key)

    def _mysql_sync(self, key: str) -> dict:
        try:
            import pymysql
            from urllib.parse import urlparse
            u = urlparse(key.replace("mysql://", "mysql://"))
            conn = pymysql.connect(
                host=u.hostname, port=u.port or 3306, user=u.username,
                password=u.password, database=(u.path or "/")[1:] if u.path else None,
                connect_timeout=8
            )
            cur = conn.cursor()
            cur.execute("SELECT current_user(), database()")
            user, db = cur.fetchone()
            cur.execute("SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('information_schema','mysql','performance_schema','sys')")
            n = cur.fetchone()[0]
            conn.close()
            return {"is_valid": True, "message": f"✅ MySQL vivo! user={user}, db={db}, {n} tabelas", "score": 10}
        except ImportError:
            return {"is_valid": None, "message": "pymysql não instalado", "score": 5}
        except Exception as e:
            return self._db_error(e)

    async def _validate_redis(self, key: str) -> dict:
        """Redis URI — conecta via redis-py em thread."""
        return await asyncio.to_thread(self._redis_sync, key)

    def _redis_sync(self, key: str) -> dict:
        try:
            import redis
            r = redis.Redis.from_url(key, socket_connect_timeout=8)
            r.ping()
            info = r.info()
            n_keys = r.dbsize()
            return {"is_valid": True, "message": f"✅ Redis vivo! v={info.get('redis_version','?')}, {n_keys} keys", "score": 10}
        except ImportError:
            return {"is_valid": None, "message": "redis não instalado", "score": 5}
        except Exception as e:
            return self._db_error(e)

    def _db_error(self, e: Exception) -> dict:
        """Classifica erros de conexão DB."""
        msg = str(e)
        if any(x in msg.lower() for x in ["authentication", "auth failed", "access denied", "password", "noauth", "wrong number"]):
            return {"is_valid": False, "message": f"❌ Auth falhou: {msg[:150]}", "score": 9}
        if any(x in msg.lower() for x in ["timeout", "refused", "connect", "unreachable", "resolve"]):
            return {"is_valid": None, "message": f"Timeout/sem conexão: {msg[:100]}", "score": 5}
        return {"is_valid": None, "message": f"Erro: {msg[:150]}", "score": 3}

    async def _validate_none(self, key: str) -> dict:
        return {"is_valid": None, "message": "Sem validação remota disponível", "score": 0}

    async def close(self):
        await self.client.aclose()