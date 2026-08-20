"""
Servidor web — Flask com API REST + dashboard estático.
"""

import asyncio
import logging
import os
import threading
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory

import store

logger = logging.getLogger("server")

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"

app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path="/static")

# ─── Estado global ────────────────────────────────────────────────────
_scan_lock = threading.Lock()
_scan_running = False
_last_scan_id = None


# ─── API ──────────────────────────────────────────────────────────────

@app.route("/api/stats")
def api_stats():
    return jsonify({
        "stats": store.get_dashboard_stats(),
        "by_type": store.get_stats_by_type(),
        "recent_scans": store.get_recent_scans(10),
    })


@app.route("/api/secrets")
def api_secrets():
    args = request.args
    secrets = store.get_secrets(
        key_type=args.get("key_type") or None,
        validated=args.get("validated", type=bool) if args.get("validated") is not None else None,
        is_valid=args.get("is_valid", type=bool) if args.get("is_valid") is not None else None,
        search=args.get("search") or None,
        limit=min(args.get("limit", 50, type=int), 500),
        offset=args.get("offset", 0, type=int),
        order_by=args.get("order_by", "scan_date"),
        order_desc=args.get("order_desc", "true").lower() != "false",
    )
    total = store.count_secrets(
        key_type=args.get("key_type") or None,
        validated=args.get("validated", type=bool) if args.get("validated") is not None else None,
        is_valid=args.get("is_valid", type=bool) if args.get("is_valid") is not None else None,
    )
    return jsonify({"secrets": secrets, "total": total, "limit": len(secrets), "offset": args.get("offset", 0, type=int)})


@app.route("/api/secrets/<int:sid>")
def api_secret_detail(sid):
    s = store.get_secret_by_id(sid)
    if not s:
        return jsonify({"error": "Secret não encontrado"}), 404
    return jsonify({"secret": s})


@app.route("/api/scans")
def api_scans():
    return jsonify({"scans": store.get_recent_scans(20)})


@app.route("/api/scan", methods=["POST"])
def api_scan():
    global _scan_running, _last_scan_id
    if _scan_running:
        return jsonify({"status": "already_running", "message": "Scan já em execução"}), 409

    mode = request.args.get("mode", "both")
    threading.Thread(target=_run_scan_sync, args=(mode,), daemon=True).start()
    return jsonify({"status": "started", "mode": mode})


@app.route("/api/scan/status")
def api_scan_status():
    return jsonify({"status": "running" if _scan_running else "idle", "scan_id": _last_scan_id})


@app.route("/api/validate", methods=["POST"])
def api_validate():
    limit = request.args.get("limit", 50, type=int)
    threading.Thread(target=_run_validation_sync, args=(limit,), daemon=True).start()
    return jsonify({"status": "started", "message": f"Validando até {limit} keys pendentes"})


@app.route("/api/export")
def api_export():
    import csv, io
    fmt = request.args.get("format", "json")
    secrets = store.get_secrets(limit=10000, order_by="scan_date", order_desc=True)
    if fmt == "csv":
        out = io.StringIO()
        if secrets:
            w = csv.DictWriter(out, fieldnames=secrets[0].keys())
            w.writeheader()
            w.writerows(secrets)
        from flask import Response
        return Response(out.getvalue(), mimetype="text/csv",
                         headers={"Content-Disposition": "attachment; filename=secrets.csv"})
    return jsonify({"secrets": secrets, "total": len(secrets)})


@app.route("/health")
def health():
    return jsonify({"status": "ok", "secrets_count": store.count_secrets()})


# ─── Dashboard (sirva o index.html) ──────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(str(STATIC_DIR), "index.html")


# ─── Background workers ──────────────────────────────────────────────

def _run_scan_sync(mode="both"):
    global _scan_running, _last_scan_id
    with _scan_lock:
        if _scan_running:
            return
        _scan_running = True

    try:
        asyncio.run(_run_scan_async(mode))
    except Exception as e:
        logger.exception(f"Scan error: {e}")
    finally:
        _scan_running = False


async def _run_scan_async(mode):
    global _last_scan_id
    import uuid, time
    from scanner import GitHubScanner
    import store as _store

    tokens = os.environ.get("GITHUB_TOKENS", "").split(",")
    tokens = [t.strip() for t in tokens if t.strip()]
    min_date = os.environ.get("SCANNER_MIN_DATE", "2026-01-01")

    scan_id = uuid.uuid4().hex[:12]
    _last_scan_id = scan_id
    start = time.time()

    _store.save_scan_log({
        "scan_id": scan_id, "scan_type": f"github_{mode}",
        "query": f"mode={mode}, date>{min_date}",
        "pattern_count": 56, "status": "running",
    })

    scanner = GitHubScanner(tokens=tokens or None, min_date=min_date)
    try:
        findings = await scanner.run(mode=mode, scan_id=scan_id)
        new = 0
        repos = set()
        for f in findings:
            sid = _store.save_secret(f)
            if sid > 0:
                new += 1
            if f.get("repo_name"):
                repos.add(f["repo_name"])

        elapsed = time.time() - start
        _store.update_scan_log(scan_id, {
            "total_found": len(findings), "new_found": new,
            "repos_scanned": len(repos), "duration_seconds": round(elapsed, 2),
            "status": "completed",
        })
        logger.info(f"✅ Scan {scan_id}: {len(findings)} encontradas, {new} novas, {elapsed:.1f}s")

        # Auto-valida as novas
        if new > 0:
            await _validate_async(limit=new)
    except Exception as e:
        _store.update_scan_log(scan_id, {"status": "failed", "error": str(e)[:500]})
        logger.exception(f"Scan failed: {e}")
    finally:
        await scanner.close()


def _run_validation_sync(limit=50):
    try:
        asyncio.run(_validate_async(limit))
    except Exception as e:
        logger.exception(f"Validation error: {e}")


async def _validate_async(limit=50):
    from validator import KeyValidator
    import store as _store

    pending = _store.get_secrets(validated=False, limit=limit)
    if not pending:
        logger.info("Nenhuma key pendente para validar.")
        return

    logger.info(f"🔍 Validando {len(pending)} keys...")
    v = KeyValidator()
    items = [(s["id"], s["key_type"], s["key_value"]) for s in pending]
    results = await v.validate_batch(items, max_workers=10)

    valid = invalid = 0
    for db_id, r in results:
        is_v = r.get("is_valid")
        _store.update_validation(db_id, is_v, r.get("message", ""))
        if is_v is True:
            valid += 1
        elif is_v is False:
            invalid += 1

    await v.close()
    logger.info(f"✅ Validação: {valid} válidas, {invalid} inválidas, {len(pending) - valid - invalid} não testáveis")


def start_server(host="0.0.0.0", port=8080):
    print(f"\n🌐  Secret Hunter Dashboard: http://{host}:{port}\n")
    app.run(host=host, port=port, debug=False, threaded=True)
