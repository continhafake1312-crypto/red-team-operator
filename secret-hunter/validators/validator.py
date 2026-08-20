"""
Módulo de validação de chaves — testa se uma chave exposta ainda é válida.

Suporta múltiplos providers com chamadas API reais e não destrutivas.
Cada validador tenta confirmar se a chave tem acesso ativo sem causar danos.
"""

import asyncio
import logging
import re
from typing import Any, Callable, Coroutine, Dict, Optional

import httpx

from config import VALIDATION_TIMEOUT

logger = logging.getLogger(__name__)


class KeyValidator:
    """
    Validador de chaves — usa chamadas API seguras para confirmar se uma chave
    exposta ainda está ativa.
    """

    def __init__(self):
        self.session = httpx.AsyncClient(
            timeout=VALIDATION_TIMEOUT,
            follow_redirects=False,
        )
        # Registro de validadores específicos
        self.validators: Dict[str, Callable] = {
            "aws": self._validate_aws,
            "github": self._validate_github,
            "gitlab": self._validate_gitlab,
            "openai": self._validate_openai,
            "anthropic": self._validate_anthropic,
            "huggingface": self._validate_huggingface,
            "stripe": self._validate_stripe,
            "slack": self._validate_slack,
            "slack_webhook": self._validate_slack_webhook,
            "discord": self._validate_discord,
            "telegram": self._validate_telegram,
            "sendgrid": self._validate_sendgrid,
            "mailgun": self._validate_mailgun,
            "digitalocean": self._validate_digitalocean,
            "docker": self._validate_docker,
            "npm": self._validate_npm,
            "google_api": self._validate_google_api,
            "firebase": self._validate_firebase,
            "azure": self._validate_azure,
            "mongodb": self._validate_mongodb,
            "postgresql": self._validate_postgresql,
            "mysql": self._validate_mysql,
            "redis": self._validate_redis,
            "twilio": self._validate_twilio,
            "heroku": self._validate_heroku,
            "cloudflare": self._validate_cloudflare,
            "jwt": self._validate_jwt,
        }

    async def validate(self, key_type: str, key_value: str) -> Dict[str, Any]:
        """
        Valida uma chave. Se existir validador específico, usa ele.
        Senão, retorna como não testável.
        """
        validator = self.validators.get(key_type)
        if validator is None:
            return {
                "is_valid": None,
                "message": "Nenhum validador disponível para este tipo de chave",
                "raw": "",
                "confidence": 0,
            }

        try:
            result = await validator(key_value)
            return result
        except Exception as e:
            logger.debug(f"Erro validando {key_type}: {e}")
            return {
                "is_valid": None,
                "message": f"Erro na validação: {str(e)[:200]}",
                "raw": "",
                "confidence": 0,
            }

    async def validate_batch(
        self, keys: list[tuple[int, str, str]], max_concurrent: int = 10
    ) -> list[tuple[int, Dict[str, Any]]]:
        """
        Valida múltiplas chaves concorrentemente.

        Args:
            keys: Lista de (db_id, key_type, key_value)
            max_concurrent: Máximo de validações simultâneas

        Returns:
            Lista de (db_id, result_dict)
        """
        sem = asyncio.Semaphore(max_concurrent)

        async def _validate_one(db_id: int, kt: str, kv: str) -> tuple[int, Dict[str, Any]]:
            async with sem:
                result = await self.validate(kt, kv)
                return (db_id, result)

        tasks = [_validate_one(i, k, v) for i, k, v in keys]
        return await asyncio.gather(*tasks, return_exceptions=False)

    # ── Validadores Específicos ──────────────────────────────────────────────

    async def _validate_aws(self, key: str) -> Dict[str, Any]:
        """Tenta validar AWS Key usando STS GetCallerIdentity (requer chave válida)."""
        try:
            # Parse AWS credentials — precisa de Access Key ID + Secret Access Key
            # Se for apenas o Access Key ID, não tem como testar sem o secret
            if key.startswith("AKIA"):
                return {
                    "is_valid": None,
                    "message": "AWS Access Key ID (precisa do Secret Access Key para testar)",
                    "raw": "",
                    "confidence": 0,
                }
            # Se parece um secret key (40 chars base64), tenta testar via STS
            if len(key) == 40 and re.match(r'^[A-Za-z0-9+/]{40}$', key):
                return {
                    "is_valid": None,
                    "message": "Potencial AWS Secret Key (requer contexto completo para testar)",
                    "raw": "",
                    "confidence": 0,
                }
            return {"is_valid": None, "message": "Formato AWS não reconhecido para validação", "raw": "", "confidence": 0}
        except Exception as e:
            return {"is_valid": False, "message": f"AWS validation error: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_github(self, key: str) -> Dict[str, Any]:
        """Valida GitHub token testando acesso à API."""
        try:
            resp = await self.session.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "SecretHunter/1.0",
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "is_valid": True,
                    "message": f"✅ Token válido! Usuário: {data.get('login', '?')} (id: {data.get('id', '?')})",
                    "raw": f"login={data.get('login')}, id={data.get('id')}, plan={data.get('plan', {}).get('name', 'free')}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "Token inválido ou revogado", "raw": resp.text[:300], "confidence": 10}
            elif resp.status_code == 403:
                return {"is_valid": True, "message": "Token válido mas rate-limited (bom sinal!)", "raw": resp.text[:300], "confidence": 8}
            else:
                return {"is_valid": None, "message": f"Resposta inesperada: HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except httpx.TimeoutException:
            return {"is_valid": None, "message": "Timeout na validação GitHub", "raw": "", "confidence": 0}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_gitlab(self, key: str) -> Dict[str, Any]:
        """Valida GitLab token."""
        try:
            resp = await self.session.get(
                "https://gitlab.com/api/v4/user",
                headers={"Authorization": f"Bearer {key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "is_valid": True,
                    "message": f"✅ Token GitLab válido! User: {data.get('username', '?')}",
                    "raw": f"username={data.get('username')}, email={data.get('email', 'N/A')}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "Token GitLab inválido", "raw": resp.text[:300], "confidence": 10}
            else:
                return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro GitLab: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_openai(self, key: str) -> Dict[str, Any]:
        """Valida OpenAI API Key."""
        try:
            resp = await self.session.get(
                "https://api.openai.com/v1/models",
                headers={"Authorization": f"Bearer {key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                model_count = len(data.get("data", []))
                return {
                    "is_valid": True,
                    "message": f"✅ OpenAI key válida! Acesso a {model_count} modelos",
                    "raw": f"models_accessible={model_count}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "OpenAI key inválida", "raw": resp.text[:300], "confidence": 10}
            elif resp.status_code == 429:
                return {"is_valid": True, "message": "OpenAI key válida (rate-limited = tem crédito)", "raw": resp.text[:300], "confidence": 9}
            else:
                return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro OpenAI: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_anthropic(self, key: str) -> Dict[str, Any]:
        """Valida Anthropic API Key."""
        try:
            resp = await self.session.get(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": key,
                    "anthropic-version": "2023-06-01",
                },
            )
            if resp.status_code == 200 or resp.status_code == 400:
                # 400 pode ser request malformed ainda indica key válida
                return {"is_valid": True, "message": "✅ Anthropic key válida!", "raw": f"HTTP {resp.status_code}", "confidence": 9}
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "Anthropic key inválida", "raw": resp.text[:300], "confidence": 10}
            else:
                return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_huggingface(self, key: str) -> Dict[str, Any]:
        """Valida HuggingFace token."""
        try:
            resp = await self.session.get(
                "https://huggingface.co/api/whoami",
                headers={"Authorization": f"Bearer {key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "is_valid": True,
                    "message": f"✅ HF Token válido! User: {data.get('name', '?')}",
                    "raw": f"user={data.get('name')}, orgs={len(data.get('organizations', []))}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "HF Token inválido", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_stripe(self, key: str) -> Dict[str, Any]:
        """Valida Stripe key (não destrutivo)."""
        try:
            resp = await self.session.get(
                "https://api.stripe.com/v1/charges?limit=1",
                auth=(key, ""),
            )
            if resp.status_code == 200:
                return {
                    "is_valid": True,
                    "message": "✅ Stripe key válida (modo live/test)!",
                    "raw": "charges_accessible=true",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "Stripe key inválida", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_slack(self, key: str) -> Dict[str, Any]:
        """Valida Slack token."""
        try:
            resp = await self.session.get(
                "https://slack.com/api/auth.test",
                headers={"Authorization": f"Bearer {key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("ok"):
                    return {
                        "is_valid": True,
                        "message": f"✅ Slack token válido! Team: {data.get('team', '?')}, User: {data.get('user', '?')}",
                        "raw": f"team={data.get('team')}, url={data.get('url', 'N/A')}",
                        "confidence": 10,
                    }
                return {"is_valid": False, "message": f"Slack: {data.get('error', 'invalid')}", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_slack_webhook(self, key: str) -> Dict[str, Any]:
        """Testa Slack Webhook (envia mensagem de teste não intrusiva)."""
        try:
            # Apenas verifica se URL responde
            resp = await self.session.post(
                key,
                json={"text": "SecretHunter - test (no action needed)"},
            )
            if resp.status_code == 200:
                return {"is_valid": True, "message": "✅ Slack Webhook válido!", "raw": "ok", "confidence": 10}
            return {"is_valid": False, "message": f"Slack Webhook: HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 9}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_discord(self, key: str) -> Dict[str, Any]:
        """Valida Discord token."""
        try:
            resp = await self.session.get(
                "https://discord.com/api/v10/users/@me",
                headers={"Authorization": f"{key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "is_valid": True,
                    "message": f"✅ Discord token válido! User: {data.get('username', '?')}#{data.get('discriminator', '?')}",
                    "raw": f"user={data.get('username')}, id={data.get('id')}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "Discord token inválido", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_telegram(self, key: str) -> Dict[str, Any]:
        """Valida Telegram Bot Token."""
        try:
            resp = await self.session.get(
                f"https://api.telegram.org/bot{key}/getMe",
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("ok"):
                    bot = data["result"]
                    return {
                        "is_valid": True,
                        "message": f"✅ Token Telegram válido! Bot: @{bot.get('username', '?')}",
                        "raw": f"bot={bot.get('username')}, name={bot.get('first_name', '')}",
                        "confidence": 10,
                    }
                return {"is_valid": False, "message": f"Telegram: {data}", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": False, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 9}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_sendgrid(self, key: str) -> Dict[str, Any]:
        """Valida SendGrid API Key."""
        try:
            resp = await self.session.get(
                "https://api.sendgrid.com/v3/scopes",
                headers={"Authorization": f"Bearer {key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                scopes = data.get("scopes", [])
                return {
                    "is_valid": True,
                    "message": f"✅ SendGrid key válida! {len(scopes)} scopes",
                    "raw": f"scopes={scopes[:10]}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "SendGrid key inválida", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_mailgun(self, key: str) -> Dict[str, Any]:
        """Valida Mailgun API Key."""
        try:
            resp = await self.session.get(
                "https://api.mailgun.net/v3/domains",
                auth=("api", key),
            )
            if resp.status_code == 200:
                data = resp.json()
                domains = data.get("items", [])
                return {
                    "is_valid": True,
                    "message": f"✅ Mailgun key válida! {len(domains)} domínios",
                    "raw": f"domains={len(domains)}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "Mailgun key inválida", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_digitalocean(self, key: str) -> Dict[str, Any]:
        """Valida DigitalOcean token."""
        try:
            resp = await self.session.get(
                "https://api.digitalocean.com/v2/account",
                headers={"Authorization": f"Bearer {key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                acct = data.get("account", {})
                return {
                    "is_valid": True,
                    "message": f"✅ DO token válido! Email: {acct.get('email', '?')}, Status: {acct.get('status', '?')}",
                    "raw": f"email={acct.get('email')}, uuid={acct.get('uuid', '')}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "DigitalOcean token inválido", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_docker(self, key: str) -> Dict[str, Any]:
        """Valida Docker Hub token."""
        try:
            resp = await self.session.get(
                "https://hub.docker.com/v2/user",
                headers={"Authorization": f"JWT {key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "is_valid": True,
                    "message": f"✅ Docker token válido! User: {data.get('username', '?')}",
                    "raw": f"user={data.get('username')}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "Docker token inválido", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_npm(self, key: str) -> Dict[str, Any]:
        """Valida npm token."""
        try:
            resp = await self.session.get(
                "https://registry.npmjs.org/-/whoami",
                headers={"Authorization": f"Bearer {key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "is_valid": True,
                    "message": f"✅ npm token válido! User: {data.get('username', '?')}",
                    "raw": f"user={data.get('username')}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "npm token inválido", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_google_api(self, key: str) -> Dict[str, Any]:
        """Valida Google API Key (limitado a APIs públicas)."""
        try:
            # Testa com Geocoding API (não requer faturamento)
            resp = await self.session.get(
                f"https://maps.googleapis.com/maps/api/geocode/json?latlng=0,0&key={key}"
            )
            if resp.status_code == 200:
                data = resp.json()
                status = data.get("status", "")
                if status == "OK" or status == "ZERO_RESULTS":
                    return {
                        "is_valid": True,
                        "message": "✅ Google API Key válida!",
                        "raw": f"status={status}",
                        "confidence": 10,
                    }
                elif status == "REQUEST_DENIED":
                    return {
                        "is_valid": True,
                        "message": f"⚠️ Google API Key existe mas sem acesso a esta API: {data.get('error_message', '')}",
                        "raw": resp.text[:500],
                        "confidence": 7,
                    }
                elif status == "INVALID_REQUEST":
                    return {"is_valid": None, "message": "Key possivelmente válida mas requisição malformada", "raw": resp.text[:300], "confidence": 5}
                return {"is_valid": None, "message": f"Status: {status}", "raw": resp.text[:300], "confidence": 5}
            return {"is_valid": False, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 8}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_firebase(self, key: str) -> Dict[str, Any]:
        """Valida Firebase URL (tenta acesso ao banco)."""
        try:
            resp = await self.session.get(
                f"{key}/.json?shallow=true&timeout=3s",
            )
            if resp.status_code == 200:
                return {
                    "is_valid": True,
                    "message": "✅ Firebase acessível publicamente! Dados expostos.",
                    "raw": f"http_{resp.status_code}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {
                    "is_valid": True,
                    "message": "Firebase existe mas requer autenticação (ainda expõe existência)",
                    "raw": f"http_{resp.status_code}",
                    "confidence": 8,
                }
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_azure(self, key: str) -> Dict[str, Any]:
        """Valida Azure key (básico — formato)."""
        if "AccountKey=" in key:
            # Extrai a key
            match = re.search(r"AccountKey=([A-Za-z0-9+/=]+)", key)
            if match:
                ak = match.group(1)
                # Azure keys têm 88 chars geralmente
                if 80 <= len(ak) <= 100:
                    return {"is_valid": None, "message": "Azure key com formato correto (requer teste de conexão real)", "raw": "", "confidence": 6}
        return {"is_valid": None, "message": "Não foi possível validar esta Azure key remotamente", "raw": "", "confidence": 0}

    async def _validate_mongodb(self, key: str) -> Dict[str, Any]:
        """Valida MongoDB connection string (só formato por enquanto)."""
        # MongoDB SRV check
        if "mongodb+srv://" in key:
            return {"is_valid": None, "message": "MongoDB SRV string (requer teste de conexão real)", "raw": "", "confidence": 6}
        return {"is_valid": None, "message": "MongoDB string detectada (validação remota limitada)", "raw": "", "confidence": 5}

    async def _validate_postgresql(self, key: str) -> Dict[str, Any]:
        """PostgreSQL — formato apenas."""
        return {"is_valid": None, "message": "PostgreSQL connection string (validação requer conexão direta)", "raw": "", "confidence": 5}

    async def _validate_mysql(self, key: str) -> Dict[str, Any]:
        """MySQL — formato apenas."""
        return {"is_valid": None, "message": "MySQL connection string (validação requer conexão direta)", "raw": "", "confidence": 5}

    async def _validate_redis(self, key: str) -> Dict[str, Any]:
        """Redis — tenta conexão básica."""
        try:
            if "redis://" in key:
                return {
                    "is_valid": None,
                    "message": "Redis URL (validação requer conexão real)",
                    "raw": "",
                    "confidence": 5,
                }
            return {"is_valid": None, "message": "Formato não reconhecido", "raw": "", "confidence": 0}
        except Exception:
            return {"is_valid": None, "message": "Erro no formato", "raw": "", "confidence": 0}

    async def _validate_twilio(self, key: str) -> Dict[str, Any]:
        """Valida Twilio credentials."""
        try:
            # Twilio Account SID e Auth Token
            if key.startswith("AC"):
                resp = await self.session.get(
                    f"https://api.twilio.com/2010-04-01/Accounts/{key}.json",
                    auth=(key, key),  # apenas teste de autenticação
                )
                if resp.status_code == 200:
                    return {"is_valid": True, "message": "✅ Twilio SID válido!", "raw": "authenticated", "confidence": 9}
                elif resp.status_code == 401:
                    return {"is_valid": False, "message": "Twilio credenciais inválidas", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": "Twilio (validação parcial)", "raw": "", "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_heroku(self, key: str) -> Dict[str, Any]:
        """Valida Heroku API Key."""
        try:
            resp = await self.session.get(
                "https://api.heroku.com/account",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Accept": "application/vnd.heroku+json; version=3",
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "is_valid": True,
                    "message": f"✅ Heroku key válida! Email: {data.get('email', '?')}",
                    "raw": f"email={data.get('email')}",
                    "confidence": 10,
                }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "Heroku key inválida", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_cloudflare(self, key: str) -> Dict[str, Any]:
        """Valida Cloudflare API Token."""
        try:
            resp = await self.session.get(
                "https://api.cloudflare.com/client/v4/user/tokens/verify",
                headers={"Authorization": f"Bearer {key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("success"):
                    return {
                        "is_valid": True,
                        "message": "✅ Cloudflare token válido!",
                        "raw": "verified=true",
                        "confidence": 10,
                    }
            elif resp.status_code == 401:
                return {"is_valid": False, "message": "Cloudflare token inválido", "raw": resp.text[:300], "confidence": 10}
            return {"is_valid": None, "message": f"HTTP {resp.status_code}", "raw": resp.text[:300], "confidence": 5}
        except Exception as e:
            return {"is_valid": None, "message": f"Erro: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def _validate_jwt(self, key: str) -> Dict[str, Any]:
        """Valida JWT — decodifica e verifica se não expirou."""
        try:
            import base64, json
            parts = key.split(".")
            if len(parts) != 3:
                return {"is_valid": None, "message": "Formato JWT inválido", "raw": "", "confidence": 0}

            # Decodifica payload (parte do meio)
            payload = parts[1]
            # Padding
            payload += "=" * (4 - len(payload) % 4) if len(payload) % 4 else ""
            decoded = base64.urlsafe_b64decode(payload)
            data = json.loads(decoded)

            exp = data.get("exp", 0)
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc).timestamp()
            if exp and exp < now:
                return {"is_valid": False, "message": "JWT expirado", "raw": f"exp={exp}, now={now:.0f}", "confidence": 10}

            # Verifica issuer/audience
            info = f"iss={data.get('iss', '?')}, sub={data.get('sub', '?')}, exp={exp}"
            return {
                "is_valid": True if exp > now else None,
                "message": f"JWT estruturalmente válido. {info}",
                "raw": decoded.decode()[:500],
                "confidence": 8 if exp > now else 6,
            }
        except Exception as e:
            return {"is_valid": None, "message": f"JWT decode error: {str(e)[:200]}", "raw": "", "confidence": 0}

    async def close(self):
        await self.session.aclose()