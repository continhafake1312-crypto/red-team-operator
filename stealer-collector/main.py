#!/usr/bin/env python3
"""
stealer-collector — Coletor e parser automatizado de stealer logs
========================================================================
Fontes: Telegram (canais públicos de logs vazados), Pastebin, arquivos locais
Uso:    python main.py [comando] [opções]

Comandos:
  scrape    Coleta logs dos canais Telegram configurados
  watch     Modo watch: coleta continuamente a cada N segundos
  import    Importa logs de um arquivo ou diretório local
  search    Busca credenciais ou cookies no banco
  stats     Estatísticas do banco
  export    Exporta credenciais como JSON
  config    Exibe ou edita a configuração atual
"""

import sys
import asyncio
import argparse
from pathlib import Path

from config import load_config, save_config, CONFIG_DIR
from storage.database import Database
from parsers import parse_log


def cmd_scrape(args):
    async def _run():
        from collectors.telegram_collector import TelegramCollector
        db = Database()
        collector = TelegramCollector(db=db)
        await collector.connect()
        count = await collector.run_all()
        print(f"\n[+] Done. {count} logs collected.")
        db.close()
        await collector.close()

    asyncio.run(_run())


def cmd_watch(args):
    async def _run():
        from collectors.telegram_collector import TelegramCollector
        db = Database()
        collector = TelegramCollector(db=db)
        await collector.connect()
        cfg = load_config()
        await collector.watch(interval=args.interval or cfg.get("poll_interval", 60))

    asyncio.run(_run())


def cmd_import(args):
    db = Database()
    path = Path(args.path)
    count = 0

    if path.is_file():
        files = [path]
    elif path.is_dir():
        files = list(path.rglob("*"))
    else:
        print(f"[!] Path not found: {path}")
        return

    for f in files:
        if not f.is_file() or f.stat().st_size == 0:
            continue
        if f.suffix not in ('.txt', '.log', '.csv', '.json', ''):
            continue
        try:
            text = f.read_text(errors="replace")
            if len(text) < 20:
                continue
            from hashlib import sha256
            raw_hash = sha256(text.encode()).hexdigest()[:32]
            result = db.save_raw_log(
                source="local",
                raw_content=text,
                source_url=str(f),
                file_name=f.name,
                file_size=f.stat().st_size,
                hash_val=raw_hash,
            )
            if result:
                lid = result["id"] if hasattr(result, '__getitem__') else result[0]
                parse_log(text, db, lid)
                db.mark_parsed(lid)
                count += 1
        except Exception as e:
            print(f"[!] Error importing {f}: {e}")

    print(f"[+] Imported {count} logs from {path}")
    db.close()


def cmd_search(args):
    db = Database()

    if args.type == "creds":
        rows = db.search_credentials(query=args.query, domain=args.domain, limit=args.limit)
        print(f"[+] {len(rows)} credentials found:")
        for r in rows:
            print(f"  {r['url']} | {r['username']}:{r['password']}")

    elif args.type == "cookies":
        rows = db.search_cookies(domain=args.domain, limit=args.limit)
        print(f"[+] {len(rows)} cookies found:")
        for r in rows:
            print(f"  {r['domain']} | {r['name']}={r['value'][:60]}")

    else:
        print(f"[!] Unknown type: {args.type}")

    db.close()


def cmd_stats(args):
    db = Database()
    s = db.stats()
    print("=== Statistics ===")
    for k, v in s.items():
        print(f"  {k}: {v}")
    db.close()


def cmd_export(args):
    db = Database()
    data = db.export_creds_json(limit=args.limit)
    if args.output:
        Path(args.output).write_text(data)
        print(f"[+] Exported to {args.output}")
    else:
        print(data)
    db.close()


def cmd_config(args):
    cfg = load_config()

    if args.show:
        import json
        print(json.dumps(cfg, indent=2))
        return

    if args.set:
        key, val = args.set.split("=", 1)
        key = key.strip()
        val = val.strip()

        if key == "api_id":
            cfg["api_id"] = val
        elif key == "api_hash":
            cfg["api_hash"] = val
        elif key == "phone":
            cfg["phone"] = val
        elif key == "poll_interval":
            cfg["poll_interval"] = int(val)
        elif key.startswith("channel+"):
            if val not in cfg["channels"]:
                cfg["channels"].append(val)
                print(f"[+] Channel added: {val}")
        elif key.startswith("channel-"):
            if val in cfg["channels"]:
                cfg["channels"].remove(val)
                print(f"[-] Channel removed: {val}")
        else:
            print(f"[!] Unknown key: {key}")
            return

        save_config(cfg)
        print(f"[+] Config updated: {key} = {val}")


def cmd_list_dialogs(args):
    async def _run():
        from collectors.telegram_collector import TelegramCollector
        collector = TelegramCollector()
        await collector.connect()
        await collector.list_dialogs()
        await collector.close()

    asyncio.run(_run())


def cmd_web_login(args):
    async def _run():
        from collectors.web_collector import WebCollector
        collector = WebCollector()
        await collector.launch()
        ok = await collector.login_flow()
        if ok:
            await collector.list_and_select()
        await collector.close()

    asyncio.run(_run())


def cmd_list_channels(args):
    cfg = load_config()
    print(f"=== {len(cfg['channels'])} configured channels ===")
    for i, ch in enumerate(cfg["channels"], 1):
        print(f"  {i:3d}. {ch}")
    print(f"\nConfig file: {CONFIG_DIR / 'config.json'}")


def main():
    parser = argparse.ArgumentParser(
        description="stealer-collector: coleta e parseia stealer logs de Telegram, pastebin e arquivos locais"
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_scrape = sub.add_parser("scrape", help="Coleta logs dos canais Telegram")
    p_scrape.set_defaults(func=cmd_scrape)

    p_watch = sub.add_parser("watch", help="Modo contínuo")
    p_watch.add_argument("--interval", type=int, default=60, help="Intervalo entre ciclos (s)")
    p_watch.set_defaults(func=cmd_watch)

    p_import = sub.add_parser("import", help="Importa logs de arquivo/diretório")
    p_import.add_argument("path", help="Arquivo ou diretório com logs")
    p_import.set_defaults(func=cmd_import)

    p_search = sub.add_parser("search", help="Busca no banco")
    p_search.add_argument("--type", choices=["creds", "cookies"], default="creds")
    p_search.add_argument("--query", help="Texto para buscar")
    p_search.add_argument("--domain", help="Filtrar por domínio")
    p_search.add_argument("--limit", type=int, default=50)
    p_search.set_defaults(func=cmd_search)

    p_stats = sub.add_parser("stats", help="Estatísticas do banco")
    p_stats.set_defaults(func=cmd_stats)

    p_export = sub.add_parser("export", help="Exporta credenciais")
    p_export.add_argument("--limit", type=int, default=1000)
    p_export.add_argument("--output", help="Arquivo de saída")
    p_export.set_defaults(func=cmd_export)

    p_config = sub.add_parser("config", help="Gerencia configuração")
    p_config.add_argument("--show", action="store_true", help="Mostrar config")
    p_config.add_argument("--set", help="Definir chave=valor")
    p_config.set_defaults(func=cmd_config)

    p_dialogs = sub.add_parser("list-dialogs", help="Listar diálogos do Telegram e selecionar canais")
    p_dialogs.set_defaults(func=cmd_list_dialogs)

    p_web = sub.add_parser("web-login", help="Login via web.telegram.org (Playwright, sem API ID)")
    p_web.set_defaults(func=cmd_web_login)

    p_channels = sub.add_parser("channels", help="Listar canais configurados")
    p_channels.set_defaults(func=cmd_list_channels)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()