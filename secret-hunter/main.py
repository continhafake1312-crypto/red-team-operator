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
            print(f"🔄 Modo contínuo — scan a cada {args.interval} min (Ctrl+C para parar)\n")
            try:
                while True:
                    asyncio.run(run_scan(mode=args.mode))
                    print(f"⏳ Próximo scan em {args.interval} min...\n")
                    time.sleep(args.interval * 60)
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