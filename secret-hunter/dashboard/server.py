"""
Servidor web do dashboard — FastAPI com Jinja2 templates.
"""

import json
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from config import DASHBOARD_HOST, DASHBOARD_PORT, DB_PATH, KEY_PRIORITY, GITHUB_TOKENS
from database.db import Database

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent

# Templates & Static
templates = Jinja2Templates(directory=str(BASE_DIR / "dashboard" / "templates"))
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "dashboard" / "static")), name="static")

# DB
db = Database(str(DB_PATH))

# Categories mapping
from scanner.patterns import CATEGORIES

app = FastAPI(
    title="Secret Hunter Dashboard",
    description="Painel de controle para chaves/secrets descobertos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routes ──────────────────────────────────────────────────────────────────

@app.get("/api/stats")
async def api_stats():
    """Estatísticas gerais do dashboard."""
    stats = db.get_dashboard_stats()
    by_type = db.get_stats_by_type()
    recent_scans = db.get_recent_scans(limit=10)
    recent_secrets = db.get_recent_secrets(limit=10)
    valid_secrets = db.get_valid_secrets(limit=10)

    return {
        "stats": stats,
        "by_type": by_type,
        "recent_scans": recent_scans,
        "recent_secrets": recent_secrets,
        "valid_secrets": valid_secrets,
    }


@app.get("/api/secrets")
async def api_secrets(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    key_type: Optional[str] = None,
    validated: Optional[bool] = None,
    is_valid: Optional[bool] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    order_by: str = Query("scan_date"),
    order_desc: bool = Query(True),
):
    """Lista secrets com filtros."""
    secrets = db.get_secrets(
        key_type=key_type,
        validated=validated,
        is_valid=is_valid,
        status=status,
        limit=limit,
        offset=offset,
        order_by=order_by,
        order_desc=order_desc,
        search=search,
    )
    total = db.get_secrets_count(
        key_type=key_type,
        validated=validated,
        is_valid=is_valid,
    )
    return {"secrets": secrets, "total": total, "limit": limit, "offset": offset}


@app.get("/api/secrets/{secret_id}")
async def api_secret_detail(secret_id: int):
    """Detalhe de um secret."""
    secret = db.get_secret(secret_id)
    if not secret:
        return JSONResponse(status_code=404, content={"error": "Secret não encontrado"})
    return {"secret": secret}


@app.get("/api/scans")
async def api_scans(limit: int = Query(20, ge=1, le=100)):
    """Lista scans recentes."""
    scans = db.get_recent_scans(limit=limit)
    return {"scans": scans}


@app.get("/api/types")
async def api_types():
    """Lista tipos de chave disponíveis."""
    counts = db.get_stats_by_type()
    return {
        "types": [
            {
                "key": t["key_type"],
                "name": CATEGORIES.get(t["key_type"], t["key_type"]),
                "count": t["total"],
                "priority": KEY_PRIORITY.get(t["key_type"], 99),
            }
            for t in counts
        ]
    }


@app.get("/api/export")
async def api_export(
    format: str = Query("json"),
    key_type: Optional[str] = None,
    validated: Optional[bool] = None,
    is_valid: Optional[bool] = None,
):
    """Exporta secrets."""
    secrets = db.get_secrets(
        key_type=key_type,
        validated=validated,
        is_valid=is_valid,
        limit=10000,
        order_by="scan_date",
        order_desc=True,
    )

    if format == "csv":
        import csv, io
        output = io.StringIO()
        if secrets:
            writer = csv.DictWriter(output, fieldnames=secrets[0].keys())
            writer.writeheader()
            writer.writerows(secrets)
        return JSONResponse(
            content=output.getvalue(),
            headers={"Content-Disposition": "attachment; filename=secrets.csv"},
        )

    return JSONResponse(content={"secrets": secrets, "total": len(secrets)})


# ── Dashboard Pages ────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/health")
async def health():
    return {"status": "ok", "secrets_count": db.get_secrets_count()}