"""
Servidor web — Flask com API REST + arquivos estáticos.
"""

import asyncio
import json
import logging
import os
import threading
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

from store import (get_dashboard_stats, get_stats_by_type, get_secrets,
                   count_secrets, get_secret_by_id, get_recent_scans)
from patterns import CATEGORIES, get_category_label

logger = logging.getLogger("server")

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
app = Flask(__name__, static_folder=str(STATIC_DIR))

_scan_thread: threading.Thread = None


# ── API ───────────────────────────────────────────────────────────────────

@app.route("/api/stats")
def api_stats():
    stats = get_dashboard_stats()
    by_type = get_stats_by_type()
    scans = get_recent_scans(limit=10)
    recent = get_secrets(limit=10, order_by="scan_date", order_desc=True)
    return jsonify({"stats": stats, "by_type": by_type, "recent_scans": scans, "recent_secrets": recent})


@app.route("/api/secrets")
def api_secrets():
    args = request.args
    secrets = get_secrets(
        key_type=args.get("key_type"),
        validated={"true": True, "false": False}.get(args.get("validated")),
        is_valid={"true": True, "false": False}.get(args.get("is_valid")),
        search=args.get("search"),
        limit=int(args.get("limit", 50)),
        offset=int(args.get("offset", 0)),
        order_by=args.get("order_by", "scan_date"),
        order_desc=args.get("order_desc", "true").lower() != "false",
    )
    total = count_secrets(
        key_type=args.get("key_type"),
        validated={"true": True, "false": False}.get(args.get("validated")),
        is_valid={"true": True, "false": False}.get(args.get("is_valid")),
    )
    return jsonify({"secrets": secrets, "total": total})


@app.route("/api/secrets/<int:sid>")
def api_secret_detail(sid):
    s = get_secret_by_id(sid)
    if not s:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"secret": s})


@app.route("/api/scans")
def api_scans():
    return jsonify({"scans": get_recent_scans(limit=int(request.args.get("limit", 20)))})


@app.route("/api/types")
def api_types():
    types = get_stats_by_type()
    return jsonify({
        "types": [
            {"key": t["key_type"], "name": get_category_label(t["key_type"]),
             "count": t["total"], "priority": 0}
            for t in types
        ]
    })


@app.route("/api/export")
def api_export():
    secrets = get_secrets(limit=10000)
    return jsonify({"secrets": secrets, "total": len(secrets)})


@app.route("/api/scan", methods=["POST"])
def api_scan():
    global _scan_thread
    if _scan_thread and _scan_thread.is_alive():
        return jsonify({"error": "Scan já em execução"}), 409

    def _run():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            from main import run_scan_sync
            run_scan_sync(mode="both")
        finally:
            loop.close()

    _scan_thread = threading.Thread(target=_run, daemon=True)
    _scan_thread.start()
    return jsonify({"status": "started", "message": "Scan iniciado em background"})


# ── Serve Static SPA ─────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(STATIC_DIR, path)


# ── Start ──────────────────────────────────────────────────────────────────

def start(host="0.0.0.0", port=8080, debug=False):
    logger.info(f"🌐 Dashboard: http://{host}:{port}")
    app.run(host=host, port=port, debug=debug, threaded=True, use_reloader=False)