import asyncio
import re
import hashlib
import time
import sys
import base64
import io
from pathlib import Path

from playwright.async_api import async_playwright, TimeoutError as PWTimeout

try:
    import qrcode
    QR_AVAILABLE = True
except ImportError:
    QR_AVAILABLE = False

from config import load_config, save_config, RAW_DIR
from storage.database import Database
from parsers import parse_log


class WebCollector:
    def __init__(self, db=None, raw_dir=None):
        self.cfg = load_config()
        self.db = db or Database()
        self.raw_dir = Path(raw_dir or RAW_DIR)
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.browser = None
        self.context = None
        self.page = None
        self.playwright = None
        self.logged_in = False

    async def launch(self, headless=True):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=headless,
            args=["--no-sandbox", "--disable-gpu", "--disable-setuid-sandbox"],
        )
        state_file = self.raw_dir / "web_state.json"
        self.context = await self.browser.new_context(
            storage_state=str(state_file) if state_file.exists() else None,
            viewport={"width": 1280, "height": 800},
            locale="en",
        )
        self.page = await self.context.new_page()
        return self.page

    async def login_flow(self):
        print("[*] Abrindo web.telegram.org...")
        await self.page.goto(
            "https://web.telegram.org/k/",
            wait_until="load",
            timeout=60000,
        )
        print("[*] Aguardando renderização (8s)...")
        await asyncio.sleep(8)

        if await self._check_logged_in():
            print("[+] Sessão ativa — já logado.")
            self.logged_in = True
            return True

        print("[*] Extraindo QR da tela...")
        await self._show_qr_from_screenshot()
        try:
            await self.page.wait_for_selector(
                "[class*=ListItem], [class*=dialogs], "
                "[class*=chat-list], [class*=Dialog], "
                "[class*=Message], [class*=message]",
                timeout=120000
            )
            self.logged_in = True
            print("[+] Login detectado!")
        except PWTimeout:
            await self._try_check_login()

        if self.logged_in:
            print("[+] Login OK!")
            await self._save_state()
            return True
        else:
            print("[-] Timeout. Tente novamente.")
            return False

    async def _extract_qr_token(self):
        try:
            token = await self.page.evaluate("""
                () => {
                    try {
                        let links = document.querySelectorAll('a');
                        for (let a of links) {
                            if (a.href && a.href.startsWith('tg://login?token=')) return a.href;
                        }
                        let canvases = document.querySelectorAll('canvas');
                        for (let c of canvases) {
                            if (c.width > 50 && c.height > 50) {
                                return c.toDataURL();
                            }
                        }
                        let imgs = document.querySelectorAll('img[src*=token], img[src*=login]');
                        for (let img of imgs) if (img.src) return img.src;
                    } catch(e) {}
                    return null;
                }
            """)
            if token:
                return token
        except Exception:
            pass

        try:
            html = await self.page.content()
            for pat in [r'tg://login\?token=([A-Za-z0-9_\-]+)',
                        r'exported_qr=([A-Za-z0-9_\-]+)',
                        r'\"token\":\"([A-Za-z0-9_\-]+)\"']:
                m = re.search(pat, html)
                if m:
                    return m.group(1)
        except Exception:
            pass
        return None

    async def _show_qr_from_screenshot(self):
        qr_path = self.raw_dir / "qr_code.png"
        for sel in ["[class*=_qrCanvas]", "[class*=qrCanvas]", "canvas[class*=qr]",
                     "[class*=qrContainer] canvas", "[class*=qrContainer] img"]:
            try:
                elem = await self.page.query_selector(sel)
                if elem:
                    print(f"[*] QR element found: {sel}")
                    await elem.screenshot(path=str(qr_path))
                    break
            except:
                continue
        else:
            print("[*] Looking for QR canvas...")
            try:
                info = await self.page.evaluate('''() => {
                    const canvases = document.querySelectorAll('canvas');
                    for (let i = 0; i < canvases.length; i++) {
                        const c = canvases[i];
                        const ratio = Math.max(c.width, c.height) / Math.min(c.width, c.height) || 1;
                        if (c.width >= 180 && c.width <= 300 && ratio < 1.5) {
                            return i;
                        }
                    }
                    return -1;
                }''')
                if info >= 0:
                    canvases = await self.page.query_selector_all('canvas')
                    if info < len(canvases):
                        await canvases[info].screenshot(path=str(qr_path))
                        print(f"[*] QR canvas #{info} ({canvases[info].get_property('width')})")
                        return
            except Exception:
                pass
            print("[*] Taking full page screenshot...")
            await self.page.screenshot(path=str(qr_path))

        try:
            from PIL import Image
            img = Image.open(qr_path).convert('L')
            w, h = img.size
            disp_w = min(80, w)
            disp_h = min(40, int(h * (disp_w / w) * 0.45))
            img = img.resize((disp_w, disp_h), Image.NEAREST)
            chars = " █"
            for y in range(disp_h):
                line = ""
                for x in range(disp_w):
                    p = img.getpixel((x, y))
                    line += chars[int(p < 128)]
                print(line)
        except Exception as e:
            print(f"[*] PIL error: {e}")
            print(f"[*] QR salvo em: {qr_path}, abra e escaneie")

    async def _screenshot_qr(self):
        png = await self.page.screenshot(full_page=False)
        qr_path = self.raw_dir / "qr_code.png"
        with open(qr_path, "wb") as f:
            f.write(png)
        print(f"[*] Screenshot salvo em: {qr_path}")
        print(f"[*] Abra a imagem e escaneie o QR code")

    async def _check_logged_in(self):
        try:
            url = self.page.url
            if "/a/" in url or "/k/" in url:
                has_dialogs = await self.page.query_selector(
                    "[class*=dialogs], [class*=chat-list], "
                    ".dialogs, [class*=ListItem]"
                )
                return True if has_dialogs else False
        except Exception:
            pass
        try:
            title = await self.page.title()
            if "Telegram" in title:
                return False
        except Exception:
            pass
        return False

    async def _try_check_login(self):
        for _ in range(10):
            try:
                has = await self.page.query_selector(
                    "[class*=dialogs], [class*=chat-list], "
                    ".dialogs, [class*=ListItem]"
                )
                if has:
                    self.logged_in = True
                    return
            except Exception:
                pass
            await asyncio.sleep(3)

    async def _save_state(self):
        state = await self.context.storage_state()
        import json
        with open(self.raw_dir / "web_state.json", "w") as f:
            json.dump(state, f)

    async def get_dialogs(self):
        if not self.logged_in:
            print("[!] Não logado")
            return []
        try:
            await self.page.wait_for_selector(
                "[class*=dialogs], [class*=chat-list], "
                ".dialogs, [class*=ListItem]",
                timeout=15000
            )
            await asyncio.sleep(2)
        except Exception:
            pass

        dialogs = []
        seen = set()
        for selector in [
            "[class*=ListItem]",
            "[class*=dialog-item]",
            "[class*=chat-item]",
            ".dialogs > div > div",
        ]:
            try:
                items = await self.page.query_selector_all(selector)
                if items:
                    for el in items:
                        try:
                            text = await el.inner_text()
                            name = text.split('\n')[0].strip()
                            if name and len(name) > 0 and name not in seen:
                                seen.add(name)
                                dialogs.append({"name": name, "element": el})
                        except Exception:
                            pass
                    if dialogs:
                        break
            except Exception:
                continue

        return dialogs

    async def list_and_select(self):
        dialogs = await self.get_dialogs()
        if not dialogs:
            print("[!] Nenhum diálogo encontrado")
            return 0

        print(f"\n{'='*80}")
        for i, d in enumerate(dialogs, 1):
            print(f"  {i:4d}. {d['name'][:70]}")
        print(f"{'='*80}")

        sel = input("\n[?] Selecione (ex: 1,3,5-12) ou Enter=nenhum: ").strip()
        if not sel:
            print("[-] Nenhum selecionado")
            return 0

        selected = []
        for part in sel.replace(' ', '').split(','):
            if '-' in part:
                a, b = part.split('-', 1)
                for x in range(int(a), int(b) + 1):
                    if 1 <= x <= len(dialogs):
                        selected.append(dialogs[x - 1])
            else:
                x = int(part)
                if 1 <= x <= len(dialogs):
                    selected.append(dialogs[x - 1])

        cfg = load_config()
        channels = set(cfg.get("channels", []))
        total = 0

        for d in selected:
            name = d["name"]
            print(f"\n[*] Coletando: {name}")
            count = await self._scrape_dialog(d)
            total += count
            channels.add(f"web://{name}")

        if total > 0:
            cfg["channels"] = list(channels)
            save_config(cfg)

        print(f"\n[+] {total} mensagens coletadas de {len(selected)} canais")
        return total

    async def _scrape_dialog(self, dialog):
        el = dialog["element"]
        try:
            await el.click()
            await asyncio.sleep(3)
        except Exception:
            return 0

        count = 0
        seen = set()
        for scroll in range(10):
            try:
                msg_els = await self.page.query_selector_all(
                    "[class*=message], [class*=Message], "
                    "[class*=bubble], [class*=Bubble]"
                )
                for msg in msg_els:
                    try:
                        text = await msg.inner_text()
                        text = text.strip()
                        if not text or len(text) < 15 or text in seen:
                            continue
                        seen.add(text)
                        raw_hash = hashlib.sha256(text.encode()).hexdigest()[:32]
                        result = self.db.save_raw_log(
                            source="web.telegram",
                            raw_content=text,
                            source_url=self.page.url,
                            hash_val=raw_hash,
                        )
                        if result:
                            lid = result["id"] if hasattr(result, '__getitem__') else result[0]
                            parse_log(text, self.db, lid)
                            self.db.mark_parsed(lid)
                            count += 1
                    except Exception:
                        pass
                await self.page.evaluate("window.scrollBy(0, 800)")
                await asyncio.sleep(1.5)
            except Exception:
                break

        return count

    async def close(self):
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()