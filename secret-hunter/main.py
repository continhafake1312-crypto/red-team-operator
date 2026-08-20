"""
╔══════════════════════════════════════════════════════════════════════╗
║                    ███████  ███████  ████████                       ║
║                    ██      ██   ██     ██                          ║
║                    █████   ███████     ██                          ║
║                    ██      ██  ██      ██                          ║
║                    ███████ ██   ██     ██                          ║
║                                                                     ║
║  Secret Hunter — Automated Key Discovery & Validation System        ║
║  Caça chaves expostas no GitHub, valida e exibe em dashboard.       ║
╚══════════════════════════════════════════════════════════════════════╝

Uso:
  python main.py scan          → Executa scan único
  python main.py scan --mode code   → Só Code Search
  python main.py scan --mode commits → Só Commit Search
  python main.py dashboard     → Inicia servidor web
  python main.py scan --watch  → Scan contínuo (a cada N min)
  python main.py validate      → Valida keys pendentes
  python main.py stats         → Mostra estatísticas no terminal
"""

import asyncio
import json
import logging
import os
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

import uvicorn

from config import (
    DB_PATH, DATA_DIR, GITHUB_TOKENS, MIN_DATE,
    MAX_RESULTS_PER_QUERY, MAX_PAGES, KEY_PRIORITY,
    DASHBOARD_HOST, DASHBOARD_PORT, DASHBOARD_RELOAD,
    VALIDATION_MAX_WORKERS,
)
from database.db import Database
from scanner.github_scanner import GitHubScanner
from scanner.patterns import PATTERNS, CATEGORIES
from validators.validator import KeyValidator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("secret-hunter")


# ── Database ─────────────────────────────────────────────────────────────────

def init_db():
    """Inicializa banco e diretórios."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "logs").mkdir(exist_ok=True)
    db = Database(str(DB_PATH))
    logger.info(f"📦 Banco inicializado: {DB_PATH}")
    return db


# ── Scanner ──────────────────────────────────────────────────────────────────

async def run_scan(db: Database, mode: str = "both", watch: bool = False):
    """Executa scan completo."""
    if not GITHUB_TOKENS:
        logger.warning(
            "⚠️  Nenhum GITHUB_TOKEN configurado!\n"
            "    Defina GITHUB_TOKENS no .env ou export.\n"
            "    Ex: export GITHUB_TOKENS='ghp_token1,ghp_token2'"
        )

    scan_id = uuid.uuid4().hex[:12]
    scan_log = {
        "scan_id": scan_id,
        "scan_type": f"github_{mode}",
        "query": f"mode={mode}, date>{MIN_DATE}",
        "pattern_count": len(PATTERNS),
        "total_found": 0,
        "new_found": 0,
        "repos_scanned": 0,
        "duration_seconds": 0.0,
        "status": "running",
    }
    db.save_scan_log(scan_log)
    start_time = time.time()

    logger.info("─" * 60)
    logger.info(f"🔍 SECRET HUNTER v1.0 — Scan iniciado [{scan_id[:8]}]")
    logger.info(f"📅 Buscando keys a partir de: {MIN_DATE}")
    logger.info(f"🎯 Modo: {mode}")
    logger.info(f"📋 Patterns carregados: {len(PATTERNS)}")
    logger.info(f"🔑 Tokens configurados: {len(GITHUB_TOKENS)}")
    logger.info("─" * 60)

    try:
        scanner = GitHubScanner(tokens=GITHUB_TOKENS)

        total_found = 0
        repos_set = set()

        async def progress_callback(scan_type: str, count: int):
            nonlocal total_found
            total_found += count

        findings = await scanner.run_scan(mode=mode, progress_callback=progress_callback)

        # Salva findings no banco
        new_count = 0
        for finding in findings:
            sid = db.save_secret(finding)
            if sid and sid > 0:
                new_count += 1
            repo = finding.get("repo_name", "")
            if repo:
                repos_set.add(repo)

        elapsed = time.time() - start_time

        # Atualiza scan log
        db.update_scan_log(scan_id, {
            "total_found": len(findings),
            "new_found": new_count,
            "repos_scanned": len(repos_set),
            "duration_seconds": elapsed,
            "status": "completed",
        })

        logger.info("─" * 60)
        logger.info(f"✅ SCAN CONCLUÍDO [{scan_id[:8]}]")
        logger.info(f"   Total encontrado: {len(findings)}")
        logger.info(f"   Novos no banco:   {new_count}")
        logger.info(f"   Repositórios:     {len(repos_set)}")
        logger.info(f"   Tempo:            {elapsed:.1f}s")
        logger.info("─" * 60)

        await scanner.close()

    except Exception as e:
        elapsed = time.time() - start_time
        db.update_scan_log(scan_id, {
            "duration_seconds": elapsed,
            "status": "failed",
            "error": str(e)[:500],
        })
        logger.exception(f"❌ Scan failed: {e}")

    return scan_id


# ── Validador ────────────────────────────────────────────────────────────────

async def run_validation(db: Database, limit: int = 50):
    """Valida keys pendentes no banco."""
    secrets = db.get_secrets(validated=False, limit=limit)
    if not secrets:
        logger.info("✅ Nenhuma key pendente para validar.")
        return

    logger.info(f"🔍 Validando {len(secrets)} keys...")
    validator = KeyValidator()

    batch = [(s["id"], s["key_type"], s["key_value"]) for s in secrets]
    results = await validator.validate_batch(batch, max_concurrent=VALIDATION_MAX_WORKERS)

    valid_count = 0
    invalid_count = 0

    for db_id, result in results:
        is_valid = result.get("is_valid")
        msg = result.get("message", "")
        raw = result.get("raw", "")
        db.update_validation(db_id, is_valid=is_valid, message=msg, raw=raw)

        if is_valid is True:
            valid_count += 1
        elif is_valid is False:
            invalid_count += 1

    await validator.close()

    logger.info(f"✅ Validação concluída: {valid_count} válidas, {invalid_count} inválidas, {len(secrets) - valid_count - invalid_count} não testáveis")
    return {"valid": valid_count, "invalid": invalid_count, "total": len(secrets)}


# ── Stats ────────────────────────────────────────────────────────────────────

def show_stats(db: Database):
    """Exibe estatísticas no terminal."""
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich import box

    console = Console()

    stats = db.get_dashboard_stats()
    by_type = db.get_stats_by_type()

    # Stats gerais
    grid = Table.grid(expand=True)
    grid.add_column()
    grid.add_column()

    stats_text = (
        f"🔑  Total de Keys:    [bold cyan]{stats['total_secrets']}[/]\n"
        f"✅  Válidas:          [bold green]{stats['valid']}[/]\n"
        f"❌  Inválidas:        [bold red]{stats['invalid']}[/]\n"
        f"⏳  Pendentes:        [bold yellow]{stats['pending']}[/]\n"
        f"📦  Repositórios:     [bold]{stats['unique_repos']}[/]\n"
        f"📊  Tipos de Keys:    [bold]{stats['unique_types']}[/]\n"
        f"🔍  Total de Scans:   [bold]{stats['total_scans']}[/]\n"
        f"⚡  Últimas 24h:      [bold]{stats['recent_24h']}[/] novos"
    )
    console.print(Panel(stats_text, title="📊  Secret Hunter — Stats", border_style="cyan"))

    # Por tipo
    if by_type:
        table = Table(title="Keys por Tipo", box=box.ROUNDED)
        table.add_column("Tipo", style="cyan")
        table.add_column("Total", justify="right")
        table.add_column("Validadas", justify="right")
        table.add_column("Válidas", justify="right")
        table.add_column("Categoria", style="green")

        for t in by_type:
            cat_name = CATEGORIES.get(t["key_type"], t["key_type"])
            table.add_row(
                t["key_type"],
                str(t["total"]),
                str(t["validated_count"]),
                f"[green]{t['valid_count']}[/green]" if t['valid_count'] else "0",
                cat_name,
            )
        console.print(table)

    # Últimos secrets
    recent = db.get_recent_secrets(limit=10)
    if recent:
        console.print("\n[bold]🆕  Últimos Secrets Encontrados:[/]")
        for s in recent:
            prefix = "✅" if s.get("is_valid") else "❌" if s.get("is_valid") is False else "⏳"
            console.print(f"  {prefix} [{s['key_type']}] {s['key_name']} — {s.get('source', '')[:60]}")
    console.print()


# ── Dashboard Server ─────────────────────────────────────────────────────────

def start_dashboard(db: Database):
    """Inicia servidor web do dashboard."""
    logger.info(f"🌐 Iniciando dashboard em http://{DASHBOARD_HOST}:{DASHBOARD_PORT}")

    # Injeta o db no módulo do dashboard
    import dashboard.server as dash_server
    dash_server.db = db

    uvicorn.run(
        "dashboard.server:app",
        host=DASHBOARD_HOST,
        port=DASHBOARD_PORT,
        reload=DASHBOARD_RELOAD,
        log_level="info",
    )


# ── CLI ──────────────────────────────────────────────────────────────────────

def print_banner():
    banner = """
╔══════════════════════════════════════════════════════════════╗
║     ███████  ███████  ████████  ███████  ███████            ║
║     ██      ██   ██     ██     ██   ██  ██                 ║
║     █████   ███████     ██     ███████  ███████             ║
║     ██      ██  ██      ██     ██  ██       ██             ║
║     ███████ ██   ██     ██     ██   ██  ███████             ║
║                                                              ║
║     ⚡ Automated Key Discovery & Validation System v1.0      ║
║     🔍 Scanning GitHub for exposed secrets since 2026+       ║
╚══════════════════════════════════════════════════════════════╝
"""
    print(banner)


async def async_main():
    """Entry point assíncrono."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Secret Hunter — Automated Key Discovery & Validation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python main.py scan              → Scan completo (code + commits)
  python main.py scan --mode code  → Só Code Search
  python main.py scan --watch      → Scan contínuo a cada 30min
  python main.py dashboard         → Dashboard web
  python main.py validate          → Valida keys pendentes
  python main.py stats             → Estatísticas no terminal
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Comandos")

    # scan
    scan_parser = subparsers.add_parser("scan", help="Executar scan no GitHub")
    scan_parser.add_argument("--mode", choices=["code", "commits", "both"], default="both")
    scan_parser.add_argument("--watch", action="store_true", help="Modo contínuo")
    scan_parser.add_argument("--interval", type=int, default=30, help="Intervalo em minutos")

    # dashboard
    subparsers.add_parser("dashboard", help="Iniciar dashboard web")

    # validate
    validate_parser = subparsers.add_parser("validate", help="Validar keys pendentes")
    validate_parser.add_argument("--limit", type=int, default=50, help="Máx de keys a validar")

    # stats
    subparsers.add_parser("stats", help="Mostrar estatísticas")

    args = parser.parse_args()

    print_banner()
    db = init_db()

    if args.command == "scan":
        if args.watch:
            logger.info(f"🔄 Modo contínuo — scan a cada {args.interval} minuto(s)")
            while True:
                await run_scan(db, mode=args.mode)
                logger.info(f"⏳ Próximo scan em {args.interval}min...")
                await asyncio.sleep(args.interval * 60)
        else:
            await run_scan(db, mode=args.mode)

    elif args.command == "dashboard":
        start_dashboard(db)

    elif args.command == "validate":
        await run_validation(db, limit=args.limit)

    elif args.command == "stats":
        show_stats(db)

    else:
        parser.print_help()


def main():
    """Wrapper síncrono."""
    asyncio.run(async_main())


if __name__ == "__main__":
    main()