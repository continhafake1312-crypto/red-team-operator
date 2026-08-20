"""
Servidor web — Flask + API REST + dashboard estático.
"""

import asyncio
import logging
import threading
from pathlib import Path

from flask import Flask, send_from_directory, jsonify, request, Response

import store
from patterns import CATEGORIES

logger = logging.getLogger(__name__)

BASE = Path(__file__).parent
STATIC = BASE / "static"

app = Flask(__name__, static_folder=str(STATIC), static_url_path="")

# Scan em background
_scan_thread = None
_scan_running = False


# ── Páginas ──────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(str(STATIC), "index.html")


# ── API ───────────────────────────────────────────────────────────────

@app.route("/api/stats")
def api_stats():
    stats = store.get_dashboard_stats()
    by_type = store.get_stats_by_type()
    scans = store.get_recent_scans(10)
    return jsonify({
        "stats": stats,
        "by_type": by_type,
        "recent_scans": scans,
        "categories": CATEGORIES,
    })


@app.route("/api/secrets")
def api_secrets():
    key_type = request.args.get("key_type") or None
    search = request.args.get("search") or None
    validated = request.args.get("validated")
    is_valid = request.args.get("is_valid")
    limit = min(int(request.args.get("limit", 50)), 500)
    offset = int(request.args.get("offset", 0))

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
    return jsonify({"status": "running" if _scan_running else "idle"})


@app.route("/api/validate", methods=["POST"])
def api_validate():
    """Valida keys pendentes."""
    limit = int(request.args.get("limit", 50))

    def _bg():
        try:
            loop = asyncio.new_event_loop()
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
    secrets = store.get_secrets(key_type=key_type, limit=10000)

    if fmt == "csv":
        import csv, io
        out = io.StringIO()
        if secrets:
            w = csv.DictWriter(out, fieldnames=secrets[0].keys())
            w.writeheader()
            w.writerows(secrets)
        return Response(out.getvalue(), mimetype="text/csv",
                        headers={"Content-Disposition": "attachment; filename=secrets.csv"})

    return jsonify({"secrets": secrets, "total": len(secrets)})


@app.route("/health")
def health():
    return jsonify({"status": "ok", "secrets": store.count_secrets()})


# ── Lógica async (rodada em thread separada) ─────────────────────────

async def _do_scan(mode="both"):
    from scanner import GitHubScanner
    import time, uuid, os

    scan_id = uuid.uuid4().hex[:12]
    start = time.time()
    tokens = os.environ.get("GITHUB_TOKENS", "").split(",")
    tokens = [t.strip() for t in tokens if t.strip()]

    store.save_scan_log({
        "scan_id": scan_id, "scan_type": f"github_{mode}",
        "query": f"mode={mode}", "pattern_count": 65,
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

    # Auto-valida em seguida
    await _do_validate(50)


async def _do_validate(limit=50):
    from validator import KeyValidator

    secrets = store.get_secrets(validated=False, limit=limit)
    if not secrets:
        return

    v = KeyValidator()
    items = [(s["id"], s["key_type"], s["key_value"]) for s in secrets]
    results = await v.validate_batch(items, max_workers=8)
    for db_id, r in results:
        store.update_validation(db_id, r.get("is_valid"), r.get("message", ""))
    await v.close()


def run_server(host="0.0.0.0", port=8080):
    print(f"\n🌐  Dashboard: http://{host}:{port}\n")
    app.run(host=host, port=port, debug=False, threaded=True)