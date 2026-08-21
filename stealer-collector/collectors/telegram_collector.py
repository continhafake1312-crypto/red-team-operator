import asyncio
import re
import hashlib
import time
import sys
from pathlib import Path
from datetime import datetime

from telethon import TelegramClient
from telethon.errors import ChannelPrivateError, FloodWaitError
from telethon.tl.types import Message, MessageMediaDocument, Channel, Chat, User
from telethon.tl.functions.messages import GetDialogsRequest

from config import load_config, save_config, RAW_DIR
from storage.database import Database
from parsers import parse_log


class TelegramCollector:
    def __init__(self, db=None, raw_dir=None):
        self.cfg = load_config()
        self.db = db or Database()
        self.raw_dir = Path(raw_dir or RAW_DIR)
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.client = None
        self.session_file = str(self.raw_dir / "telegram_session")

    async def connect(self):
        api_id = self.cfg["api_id"]
        api_hash = self.cfg["api_hash"]

        if not api_id or not api_hash:
            raise ValueError(
                "Configure api_id and api_hash in ~/.stealer-collector/config.json\n"
                "Get credentials at https://my.telegram.org/apps"
            )

        self.client = TelegramClient(
            self.session_file, int(api_id), api_hash,
            proxy=self.cfg.get("proxy"),
        )
        await self.client.connect()

        if await self.client.is_user_authorized():
            me = await self.client.get_me()
            print(f"[+] Sessão ativa — logado como {me.first_name} ({me.phone})")
            return

        print("[*] Login via QR Code:")
        print("    1. Abra o Telegram no seu celular")
        print("    2. Vá em Settings > Devices > Scan QR")
        print("    3. Escaneie o código abaixo:\n")

        try:
            qr_login = await self.client.qr_login()
            await qr_login.wait(timeout=120)
            me = await self.client.get_me()
            print(f"\n[+] Logado como {me.first_name} ({me.phone})")
        except TimeoutError:
            print("\n[!] QR expirou. Tente novamente.")

    def _entity_from_link(self, link):
        match = re.search(r't\.me/(?:joinchat/)?([\w+_/-]+)', link)
        if not match:
            return None
        return match.group(1)

    async def scrape_channel(self, channel_link, limit=None):
        entity = self._entity_from_link(channel_link)
        if not entity:
            print(f"[!] Invalid link: {link}")
            return 0

        try:
            channel = await self.client.get_entity(entity)
            print(f"[+] Scraping: {channel.title} ({channel_link})")
        except ChannelPrivateError:
                print(f"[!] Private channel or banned: {channel_link}")
                return 0
        except FloodWaitError as e:
            print(f"[!] Flood wait {e.seconds}s")
            await asyncio.sleep(e.seconds)
            return 0
        except Exception as e:
            print(f"[!] Error accessing {channel_link}: {e}")
            return 0

        count = 0
        limit = limit or self.cfg.get("max_messages_per_channel", 500)
        async for msg in self.client.iter_messages(channel, limit=limit):
            try:
                if self._process_message(msg, channel):
                    count += 1
            except Exception as e:
                print(f"[!] Error processing message {msg.id}: {e}")

        print(f"[+] {count} logs collected from {channel.title}")
        return count

    def _process_message(self, msg, channel):
        content = None
        file_name = None
        file_size = None

        if msg.text and len(msg.text) > 20:
            content = msg.text

        elif msg.document:
            file_name = getattr(msg.document, 'attributes', None)
            if file_name:
                for attr in file_name:
                    if hasattr(attr, 'file_name'):
                        file_name = attr.file_name
                        break
                else:
                    file_name = None

            file_size = getattr(msg.document, 'size', 0)
            mime = getattr(msg.document, 'mime_type', '')
            if mime and 'text' not in mime and file_size > 500_000:
                return False

            content = self._download_file(msg)
            if not content:
                return False

        if not content:
            return False

        raw_hash = hashlib.sha256(content.encode()).hexdigest()[:32]
        channel_name = getattr(channel, 'username', str(channel.id))

        result = self.db.save_raw_log(
            source="telegram",
            raw_content=content,
            source_url=f"https://t.me/{channel_name}/{msg.id}",
            channel=channel_name,
            message_id=msg.id,
            file_name=file_name,
            file_size=file_size,
            hash_val=raw_hash,
        )

        if result:
            raw_log_id = result["id"] if hasattr(result, '__getitem__') else result[0]
            parse_log(content, self.db, raw_log_id)
            self.db.mark_parsed(raw_log_id)

        return True

    def _download_file(self, msg):
        try:
            ext = ".txt"
            if msg.document and hasattr(msg.document, 'mime_type'):
                mt = msg.document.mime_type or ''
                if 'zip' in mt or 'rar' in mt or '7z' in mt or 'gzip' in mt:
                    print(f"[!] Skipping archive: {msg.id}")
                    return None

            fname = f"raw_{msg.id}_{int(time.time())}.txt"
            fpath = self.raw_dir / fname
            self.client.download_media(msg, file=str(fpath))
            if fpath.exists() and fpath.stat().st_size > 0:
                data = fpath.read_text(errors='replace')
                fpath.unlink()
                return data
        except Exception as e:
            print(f"[!] Download failed msg {msg.id}: {e}")
        return None

    async def list_dialogs(self):
        await self._ensure_connected()
        dialogs = await self.client.get_dialogs()
        log_candidates = []
        print(f"\n{'='*80}")
        print(f"{'#':>4} | {'TIPO':<10} | {'NOME':<40} | {'USERNAME':>20} | {'MEMBROS':>8} | {'LOGS':>5}")
        print(f"{'='*80}")

        for i, d in enumerate(dialogs, 1):
            entity = d.entity
            tipo = type(entity).__name__
            nome = getattr(entity, 'title', getattr(entity, 'first_name', '')) or ''
            username = getattr(entity, 'username', '') or ''
            membros = 0
            if hasattr(entity, 'participants_count'):
                membros = entity.participants_count
            elif hasattr(entity, 'broadcast'):
                membros = '(canal)'

            has_logs = self._check_log_dialog(d)
            flag = ' <--' if has_logs else ''
            log_candidates.append((d, has_logs))

            uname_str = f"@{username}" if username else '(privado)'
            nome = nome[:40]
            print(f"{i:4d} | {tipo:<10} | {nome:<40} | {uname_str:>20} | {str(membros):>8} | {'SIM' if has_logs else '':>5}{flag}")

        print(f"{'='*80}")
        print(f"\n[*] {len(dialogs)} diálogos encontrados")
        if not log_candidates:
            return

        sel = input("\n[?] Selecione os canais (ex: 1,3,5-12) ou Enter=nenhum: ").strip()
        if not sel:
            print("[-] Nenhum canal selecionado")
            return

        cfg = load_config()
        channels = set(cfg.get("channels", []))

        ranges = []
        for part in sel.replace(' ', '').split(','):
            if '-' in part:
                a, b = part.split('-', 1)
                ranges.extend(range(int(a), int(b) + 1))
            else:
                ranges.append(int(part))

        added = 0
        for idx in ranges:
            if 1 <= idx <= len(dialogs):
                d = log_candidates[idx - 1][0]
                entity = d.entity
                link = self._make_link(entity)
                name = getattr(entity, 'title', getattr(entity, 'first_name', '')) or ''
                if link:
                    if link not in channels:
                        channels.add(link)
                        print(f"  [+] {link} — {name}")
                        added += 1
                else:
                    print(f"  [!] Sem link público: {name} (adicione manualmente)")

        if added:
            cfg["channels"] = list(channels)
            save_config(cfg)
            print(f"\n[+] {added} canais adicionados ao config ({len(channels)} total)")
        else:
            print("[-] Nenhum canal novo adicionado")

    def _make_link(self, entity):
        username = getattr(entity, 'username', None)
        if username:
            return f"https://t.me/{username}"
        return None

    def _check_log_dialog(self, dialog):
        msg = dialog.message
        if msg and msg.text and len(msg.text) > 100:
            text = msg.text
            if re.search(r'(?:redline|vidar|stealer|password|login|cookie|'
                         r'combo|leak|dump|cred|token|wallet|url:|pass:)',
                         text, re.IGNORECASE):
                return True
        return False

    async def _ensure_connected(self):
        if not self.client or not self.client.is_connected():
            await self.connect()

    async def run_all(self, channels=None):
        channels = channels or self.cfg.get("channels", [])
        total = 0
        for link in channels:
            try:
                total += await self.scrape_channel(link)
            except FloodWaitError as e:
                print(f"[!] Rate limited, waiting {e.seconds}s")
                await asyncio.sleep(e.seconds)
            except Exception as e:
                print(f"[!] Error scraping {link}: {e}")
        print(f"\n[+] Total: {total} logs collected from {len(channels)} channels")
        return total

    async def watch(self, channels=None, interval=60):
        channels = channels or self.cfg.get("channels", [])
        print(f"[*] Watching {len(channels)} channels every {interval}s")
        while True:
            for link in channels:
                try:
                    await self.scrape_channel(link, limit=10)
                except Exception as e:
                    print(f"[!] Error: {e}")
            print(f"[*] Sleeping {interval}s...")
            await asyncio.sleep(interval)

    async def close(self):
        if self.client:
            await self.client.disconnect()