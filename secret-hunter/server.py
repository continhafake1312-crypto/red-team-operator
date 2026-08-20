"""
Servidor web v2 — Flask + API REST + Dashboard integrado.
  - Dashboard moderno responsivo (Tailwind-style classes via CSS custom)
  - API paginada com filtros por tipo, status, busca
  - Scan/Validate em background threads
  - Export JSON/CSV
  - CORS headers
"""

import asyncio
import csv
import io
import json
import logging
import os
import threading
import time
import uuid
from pathlib import Path

from flask import Flask, jsonify, request, Response, send_from_directory

import store
from patterns import CATEGORIES

logger = logging.getLogger(__name__)

BASE = Path(__file__).parent
STATIC = BASE / "static"

app = Flask(__name__, static_folder=str(STATIC), static_url_path="")

# CORS global
_scan_thread = None
_scan_running = False


@app.after_request
def add_cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp


@app.route("/")
def index():
    return send_from_directory(str(STATIC), "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(str(STATIC), path)


# ── API ──

@app.route("/api/stats")
def api_stats():
    stats = store.get_dashboard_stats()
    by_type = store.get_stats_by_type()
    scans = store.get_recent_scans(10)
    try:
        import token_pool
        pool_stats = token_pool.stats()
    except Exception:
        pool_stats = {}
    return jsonify({
        "stats": stats,
        "by_type": by_type,
        "recent_scans": scans,
        "categories": CATEGORIES,
        "token_pool": pool_stats,
    })


@app.route("/api/secrets")
def api_secrets():
    key_type = request.args.get("key_type") or None
    search = request.args.get("search") or None
    validated = request.args.get("validated")
    is_valid = request.args.get("is_valid")
    limit = min(int(request.args.get("limit", 50)), 500)
    offset = int(request.args.get("offset", 0))
    order_by = request.args.get("order_by", "scan_date")
    order_desc = request.args.get("order_desc", "true") != "false"

    v = None
    if validated == "true":
        v = True
    elif validated == "false":
        v = False

    iv = None
    if is_valid == "true":
        iv = True
    elif is_valid == "false":
        iv = False

    secrets = store.get_secrets(
        key_type=key_type, validated=v, is_valid=iv,
        search=search, limit=limit, offset=offset,
        order_by=order_by, order_desc=order_desc,
    )
    total = store.count_secrets(key_type=key_type, validated=v, is_valid=iv)
    return jsonify({"secrets": secrets, "total": total, "limit": limit, "offset": offset})


@app.route("/api/secrets/<int:sid>")
def api_secret(sid):
    s = store.get_secret_by_id(sid)
    if not s:
        return jsonify({"error": "não encontrado"}), 404
    return jsonify({"secret": s})


@app.route("/api/scans")
def api_scans():
    return jsonify({"scans": store.get_recent_scans(int(request.args.get("limit", 20)))})


@app.route("/api/scan", methods=["POST"])
def api_run_scan():
    global _scan_thread, _scan_running
    if _scan_running:
        return jsonify({"status": "running", "message": "Scan já em execução"}), 409

    mode = request.args.get("mode", "both")
    _scan_running = True

    def _bg():
        global _scan_running
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(_do_scan(mode))
        except Exception as e:
            logger.exception(f"Scan error: {e}")
        finally:
            _scan_running = False

    _scan_thread = threading.Thread(target=_bg, daemon=True)
    _scan_thread.start()
    return jsonify({"status": "started", "message": f"Scan {mode} iniciado"})


@app.route("/api/scan/status")
def api_scan_status():
    return jsonify({
        "status": "running" if _scan_running else "idle",
        "total": store.count_secrets(),
    })


@app.route("/api/validate", methods=["POST"])
def api_validate():
    """Valida keys pendentes em background."""
    limit = int(request.args.get("limit", 50))

    def _bg():
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(_do_validate(limit))
        except Exception as e:
            logger.exception(f"Validate error: {e}")

    t = threading.Thread(target=_bg, daemon=True)
    t.start()
    return jsonify({"status": "started", "message": f"Validando até {limit} keys"})


@app.route("/api/export")
def api_export():
    fmt = request.args.get("format", "json")
    key_type = request.args.get("key_type") or None
    validated = request.args.get("validated")
    is_valid = request.args.get("is_valid")

    v = None
    if validated == "true": v = True
    elif validated == "false": v = False
    iv = None
    if is_valid == "true": iv = True
    elif is_valid == "false": iv = False

    secrets = store.get_secrets(key_type=key_type, validated=v, is_valid=iv, limit=10000)

    if fmt == "csv":
        out = io.StringIO()
        if secrets:
            w = csv.DictWriter(out, fieldnames=secrets[0].keys())
            w.writeheader()
            w.writerows(secrets)
        return Response(
            out.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=secrets.csv"},
        )

    return jsonify({"secrets": secrets, "total": len(secrets)})


@app.route("/health")
def health():
    return jsonify({"status": "ok", "secrets": store.count_secrets()})


@app.route("/api/revalidate/<int:sid>", methods=["POST"])
def api_revalidate(sid):
    """Revalida um secret específico."""
    s = store.get_secret_by_id(sid)
    if not s:
        return jsonify({"error": "não encontrado"}), 404

    def _bg():
        import asyncio
        from validator import KeyValidator
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        v = KeyValidator()
        result = loop.run_until_complete(v.validate(s["key_type"], s["key_value"]))
        loop.run_until_complete(v.close())
        store.update_validation(sid, result.get("is_valid"), result.get("message", ""))

    t = threading.Thread(target=_bg, daemon=True)
    t.start()
    return jsonify({"status": "started", "message": "Revalidando..."})


# ── Background logic ──

async def _do_scan(mode="both"):
    from scanner import GitHubScanner
    scan_id = uuid.uuid4().hex[:12]
    start = time.time()
    tokens = os.environ.get("GITHUB_TOKENS", "").split(",")
    tokens = [t.strip() for t in tokens if t.strip()]

    store.save_scan_log({
        "scan_id": scan_id, "scan_type": f"github_{mode}",
        "query": f"mode={mode}", "pattern_count": len(__import__('patterns').PATTERNS),
        "status": "running",
    })

    scanner = GitHubScanner(tokens=tokens, min_date=os.environ.get("SCANNER_MIN_DATE", "2026-01-01"))
    findings = await scanner.run(mode=mode, scan_id=scan_id)
    await scanner.close()

    new_count = 0
    repos = set()
    for f in findings:
        sid = store.save_secret(f)
        if sid:
            new_count += 1
        if f.get("repo_name"):
            repos.add(f["repo_name"])

    store.update_scan_log(scan_id, {
        "total_found": len(findings), "new_found": new_count,
        "repos_scanned": len(repos), "duration_seconds": time.time() - start,
        "status": "completed",
    })

    if new_count > 0:
        await _do_validate(50)


async def _do_validate(limit=50):
    from validator import KeyValidator
    secrets = store.get_secrets(validated=False, limit=limit)
    if not secrets:
        return
    v = KeyValidator()
    items = [(s["id"], s["key_type"], s["key_value"]) for s in secrets]
    results = await v.validate_batch(items, max_workers=20)
    for db_id, r in results:
        store.update_validation(db_id, r.get("is_valid"), r.get("message", ""))
    await v.close()


def run_server(host="0.0.0.0", port=8080):
    print(f"\n🌐  Dashboard: http://{host}:{port}")
    print(f"📊  API: http://{host}:{port}/api/stats\n")
    app.run(host=host, port=port, debug=False, threaded=True)