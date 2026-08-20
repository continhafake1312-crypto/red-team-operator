"""
Configuração central do Secret Hunter.

Todas as configurações podem ser sobrescritas via variáveis de ambiente.
"""

import os
from pathlib import Path

# ─── Diretórios ──────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.resolve()
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "secrets.db"
LOG_DIR = DATA_DIR / "logs"

# ─── GitHub ──────────────────────────────────────────────────────────────────
# Múltiplos tokens para maior throughput (round-robin)
GITHUB_TOKENS = os.environ.get(
    "GITHUB_TOKENS",
    ""
).split(",") if os.environ.get("GITHUB_TOKENS") else []

# Rate limiting – pausa entre requests (segundos) para respeitar limites
GITHUB_RATE_LIMIT_PAUSE = float(os.environ.get("GITHUB_RATE_LIMIT_PAUSE", "0.5"))

# ─── Scanner ─────────────────────────────────────────────────────────────────
# Data mínima para keys: apenas resultados a partir desta data (YYYY-MM-DD)
MIN_DATE = os.environ.get("SCANNER_MIN_DATE", "2026-01-01")

# Modo de scan: "all" | "code" | "commits" | "gist"
SCAN_MODE = os.environ.get("SCAN_MODE", "all")

# Máximo de resultados por busca (GitHub max = 1000 com paginação)
MAX_RESULTS_PER_QUERY = int(os.environ.get("MAX_RESULTS_PER_QUERY", "500"))

# Número máximo de páginas a buscar por query
MAX_PAGES = int(os.environ.get("MAX_PAGES", "10"))

# ─── Validação ───────────────────────────────────────────────────────────────
# Timeout para validação de cada key (segundos)
VALIDATION_TIMEOUT = int(os.environ.get("VALIDATION_TIMEOUT", "10"))

# Número máximo de workers de validação simultâneos
VALIDATION_MAX_WORKERS = int(os.environ.get("VALIDATION_MAX_WORKERS", "10"))

# ─── Dashboard ───────────────────────────────────────────────────────────────
DASHBOARD_HOST = os.environ.get("DASHBOARD_HOST", "0.0.0.0")
DASHBOARD_PORT = int(os.environ.get("DASHBOARD_PORT", "8080"))
DASHBOARD_RELOAD = os.environ.get("DASHBOARD_RELOAD", "true").lower() == "true"

# ─── Categorias e prioridades ────────────────────────────────────────────────
KEY_PRIORITY = {
    "aws": 1,
    "gcp": 1,
    "azure": 1,
    "openai": 1,
    "stripe": 1,
    "github_token": 1,
    "gitlab_token": 1,
    "slack": 1,
    "discord": 1,
    "telegram": 1,
    "mongodb": 1,
    "postgresql": 1,
    "mysql": 1,
    "redis": 1,
    "ssh_private_key": 1,
    "jwt_secret": 2,
    "firebase": 2,
    "twilio": 2,
    "sendgrid": 2,
    "mailgun": 2,
    "digitalocean": 2,
    "cloudflare": 2,
    "npm_token": 2,
    "docker": 2,
    "heroku": 2,
    "generic_api": 3,
    "base64": 3,
    "password": 3,
    "env_file": 3,
}