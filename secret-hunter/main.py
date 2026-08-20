#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║   ███████  ███████  ████████  ███████  ███████                    ║
║   ██      ██   ██     ██     ██   ██  ██                          ║
║   █████   ███████     ██     ███████  ███████                     ║
║   ██      ██  ██      ██     ██  ██       ██                      ║
║   ███████ ██   ██     ██     ██   ██  ███████                     ║
║                                                                  ║
║   ⚡ Secret Hunter v1.0 — Automated Key Discovery & Validation    ║
║   🔍 Caça chaves expostas no GitHub (2026+), valida e dashboard   ║
╚══════════════════════════════════════════════════════════════════╝

Uso:
  python main.py scan              → Scan único
  python main.py scan --watch      → Scan contínuo (30 min)
  python main.py dashboard         → Inicia dashboard web
  python main.py validate          → Valida keys pendentes
  python main.py stats             → Estatísticas no terminal
"""

import asyncio
import logging
import os
import sys
import time
import uuid
from pathlib import Path

# Garante que o diretório atual está no path
sys.path.insert(0, str(Path(__file__).parent))

# Configura logging para mostrar INFO
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)

import store
from patterns import PATTERNS, CATEGORIES


def banner():
    print("""
╔══════════════════════════════════════════════════════════════════╗
║   ███████  ███████  ████████  ███████  ███████                    ║
║   ██      ██   ██     ██     ██   ██  ██                          ║
║   █████   ███████     ██     ███████  ███████                     ║
║   ██      ██  ██      ██     ██  ██       ██                      ║
║   ███████ ██   ██     ██     ██   ██  ███████                     ║
║                                                                  ║
║   ⚡ Secret Hunter v1.0 — Automated Key Discovery & Validation    ║
╚══════════════════════════════════════════════════════════════════╝
""")


def get_tokens():
    raw = os.environ.get("GITHUB_TOKENS", "")
    return [t.strip() for t in raw.split(",") if t.strip()]


async def run_scan(mode="both"):
    from scanner import GitHubScanner

    tokens = get_tokens()
    if not tokens:
        print("⚠️  GITHUB_TOKENS vazio! Set: export GITHUB_TOKENS='ghp_xxx,ghp_yyy'")
        print("   Gere tokens em: https://github.com/settings/tokens\n")

    min_date = os.environ.get("SCANNER_MIN_DATE", "2026-01-01")
    scan_id = uuid.uuid4().hex[:12]
    start = time.time()

    print("─" * 60)
    print(f"🔍 SECRET HUNTER — Scan [{scan_id[:8]}]")
    print(f"📅 Data mínima: {min_date}")
    print(f"🎯 Modo: {mode}  |  📋 Patterns: {len(PATTERNS)}  |  🔑 Tokens: {len(tokens)}")
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

        print("─" * 60)
        print(f"✅ SCAN CONCLUÍDO [{scan_id[:8]}]")
        print(f"   Total: {len(findings)}  |  Novos: {new_count}  |  Repos: {len(repos)}  |  Tempo: {elapsed:.1f}s")
        print("─" * 60)

        # Auto-valida
        if new_count > 0:
            print(f"🔍 Validando {min(new_count, 50)} keys novas...")
            await run_validate(limit=50)

        return scan_id
    except Exception as e:
        store.update_scan_log(scan_id, {"status": "failed", "error": str(e)[:500], "duration_seconds": time.time()-start})
        print(f"❌ Erro: {e}")
        raise


async def run_forever(mode="both"):
    """
    Pipeline contínuo 24h — caça, salva E valida em paralelo.
    - Scanner cicla pelas queries para sempre (sem pausas)
    - Cada key encontrada é salva no banco na hora
    - Worker paralelo valida keys pendentes continuamente
    """
    from scanner import GitHubScanner
    from validator import KeyValidator
    import collections

    tokens = get_tokens()
    if not tokens:
        print("⚠️  GITHUB_TOKENS vazio! Set: export GITHUB_TOKENS='ghp_xxx'")

    min_date = os.environ.get("SCANNER_MIN_DATE", "2026-01-01")
    scan_id = uuid.uuid4().hex[:12]

    print("─" * 60)
    print(f"🔄 SECRET HUNTER — PIPELINE CONTÍNUO 24h [{scan_id[:8]}]")
    print(f"📅 Data mínima: {min_date}  |  🔑 Tokens: {len(tokens)}")
    print("⚡ Caça → Salva → Valida (tudo em paralelo, sem pausas)")
    print("─" * 60)

    store.save_scan_log({
        "scan_id": scan_id, "scan_type": f"continuous_{mode}",
        "query": f"forever mode={mode}", "pattern_count": len(PATTERNS),
        "status": "running",
    })

    # Fila de validação (keys novas vão pra cá)
    val_queue = collections.deque(maxlen=1000)
    total_found = 0
    total_new = 0
    repos_seen = set()
    start = time.time()

    # Validador persistente (reutiliza conexões)
    validator = KeyValidator()
    val_busy = False

    async def on_finding_cb(f):
        """Salva cada key na hora + enfileira pra validação imediata."""
        nonlocal total_new
        sid = store.save_secret(f)
        if sid:
            total_new += 1
        if f.get("repo_name"):
            repos_seen.add(f["repo_name"])
        if sid and f.get("key_type"):
            val_queue.append((sid, f.get("validator_type", f["key_type"]), f["key_value"]))
        print(f"  💎 [{f['key_type']}] {f['key_name']}: {f['masked_value']}  ← {f.get('repo_name','?')}")
        # Drena a fila DURANTE o ciclo a cada 10 findings (não só no fim)
        if len(val_queue) >= 10:
            await drain_validation_queue()

    async def on_cycle_cb(cycle_n, count):
        # Drena fila de validação ao fim de cada ciclo
        await drain_validation_queue()
        # Atualiza log do scan a cada ciclo
        store.update_scan_log(scan_id, {
            "total_found": total_new, "new_found": total_new,
            "repos_scanned": len(repos_seen),
            "duration_seconds": time.time() - start,
            "status": "running",
        })

    async def drain_validation_queue():
        """Valida todas as keys pendentes na fila (em paralelo)."""
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
        # ── Revalida pendentes antigas (keys que nunca foram validadas) ──
        pending = store.get_unvalidated(limit=1000)
        if pending:
            print(f"  🔄 Revalidando {len(pending)} keys pendentes antigas...")
            for p in pending:
                val_queue.append((p["id"], p.get("validator_type") or p["key_type"], p["key_value"]))
            await drain_validation_queue()

        # USA run_forever (3 fontes: Events API + repos novos + commit window)
        await scanner.run_forever(mode=mode, on_finding=on_finding_cb, on_cycle=on_cycle_cb)
        await drain_validation_queue()

    except asyncio.CancelledError:
        print("\n👋 Encerrando pipeline...")
    except Exception as e:
        print(f"❌ Erro no pipeline: {e}")
        store.update_scan_log(scan_id, {"status": "failed", "error": str(e)[:500]})
    finally:
        # Drena fila final
        await drain_validation_queue()
        await scanner.close()
        await validator.close()
        elapsed = time.time() - start
        store.update_scan_log(scan_id, {
            "total_found": total_found, "new_found": total_new,
            "repos_scanned": len(repos_seen), "duration_seconds": elapsed,
            "status": "stopped",
        })
        print(f"\n📊 Pipeline parado: {total_new} keys novas em {elapsed:.0f}s")


async def run_validate(limit=50):
    from validator import KeyValidator

    secrets = store.get_secrets(validated=False, limit=limit)
    if not secrets:
        print("✅ Nenhuma key pendente para validar.")
        return

    print(f"🔍 Validando {len(secrets)} keys...")
    v = KeyValidator()
    items = [(s["id"], s["key_type"], s["key_value"]) for s in secrets]
    results = await v.validate_batch(items, max_workers=8)

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
    print(f"  🔑 Total de Keys:    {stats['total_secrets']}")
    print(f"  ✅ Válidas:          {stats['valid']}")
    print(f"  ❌ Inválidas:        {stats['invalid']}")
    print(f"  ⏳ Pendentes:        {stats['pending']}")
    print(f"  📦 Repositórios:    {stats['unique_repos']}")
    print(f"  📊 Tipos:           {stats['unique_types']}")
    print(f"  🔍 Scans totais:    {stats['total_scans']}")
    print(f"  ⚡ Últimas 24h:     {stats['recent_24h']}")

    if by_type:
        print("\n─" * 50)
        print(f"  {'Tipo':<20} {'Total':>6} {'Valid':>6} {'Válid':>6}  Categoria")
        print("─" * 50)
        for t in by_type:
            print(f"  {t['key_type']:<20} {t['total']:>6} {t['validated_count']:>6} {t['valid_count']:>6}  {CATEGORIES.get(t['key_type'], '')}")

    recent = store.get_secrets(limit=10)
    if recent:
        print("\n🆕  Últimos Secrets:")
        for s in recent:
            mark = "✅" if s["is_valid"]==1 else "❌" if s["is_valid"]==0 else "⏳"
            print(f"  {mark} [{s['key_type']}] {s['key_name']} — {(s.get('source') or '')[:60]}")
    print()


def run_dashboard():
    from server import run_server
    host = os.environ.get("DASHBOARD_HOST", "0.0.0.0")
    port = int(os.environ.get("DASHBOARD_PORT", "8080"))
    run_server(host=host, port=port)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Secret Hunter — Key Discovery & Validation")
    sub = parser.add_subparsers(dest="cmd")

    sp = sub.add_parser("scan", help="Executa scan no GitHub")
    sp.add_argument("--mode", choices=["code","commits","both"], default="both")
    sp.add_argument("--watch", action="store_true", help="Modo contínuo")
    sp.add_argument("--interval", type=int, default=30, help="Intervalo (min)")

    sub.add_parser("dashboard", help="Inicia dashboard web")
    vp = sub.add_parser("validate", help="Valida keys pendentes")
    vp.add_argument("--limit", type=int, default=50)
    sub.add_parser("stats", help="Mostra estatísticas")

    args = parser.parse_args()
    banner()

    if args.cmd == "scan":
        if args.watch:
            print(f"🔄 Pipeline contínuo 24h — caça, salva e valida em paralelo (Ctrl+C para parar)\n")
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