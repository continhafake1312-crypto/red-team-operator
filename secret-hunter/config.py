"""
Configuração central do Secret Hunter v2.
Todas as configs podem ser sobrescritas via variáveis de ambiente.
"""

import os
from pathlib import Path

# ─── Diretórios ──
BASE_DIR = Path(__file__).parent.resolve()
DATA_DIR = BASE_DIR / "data"

# ─── GitHub ──
GITHUB_TOKENS = [
    t.strip() for t in os.environ.get("GITHUB_TOKENS", "").split(",") if t.strip()
]
GITHUB_RATE_LIMIT_PAUSE = float(os.environ.get("GITHUB_RATE_LIMIT_PAUSE", "1.0"))

# ─── Scanner ──
MIN_DATE = os.environ.get("SCANNER_MIN_DATE", "2026-01-01")
SCAN_MODE = os.environ.get("SCAN_MODE", "all")
MAX_RESULTS_PER_QUERY = int(os.environ.get("MAX_RESULTS_PER_QUERY", "1000"))
MAX_PAGES = int(os.environ.get("MAX_PAGES", "5"))

# ─── Validação ──
VALIDATION_TIMEOUT = int(os.environ.get("VALIDATION_TIMEOUT", "15"))
VALIDATION_MAX_WORKERS = int(os.environ.get("VALIDATION_MAX_WORKERS", "20"))

# ─── Dashboard ──
DASHBOARD_HOST = os.environ.get("DASHBOARD_HOST", "0.0.0.0")
DASHBOARD_PORT = int(os.environ.get("DASHBOARD_PORT", "8080"))
DASHBOARD_RELOAD = os.environ.get("DASHBOARD_RELOAD", "true").lower() == "true"