#!/usr/bin/env python3
"""
ggmax.com.br Playwright+Tor CF bypass — reusable session helper.

Usage modes:
  --setup          : Launch Chromium, solve CF challenge, dump state to cf_state.json
  --probe <path>   : Reuse saved state, GET https://ggmax.com.br<path>
  --probe-get <u>  : GET arbitrary URL on ggmax.com.br domain
  --list <file>    : Read newline-separated paths from <file>, GET each, dump JSON to <file>.out.json
  --raw <url>      : GET arbitrary URL (full)
  --method M --body B --content-type C : override method/body/CT (with --probe path)

Output: prints JSON {"status":..., "size":..., "body":..., "headers":...}
State: cf_state.json (cookies, localStorage, cf_clearance) — reloaded if fresh.
"""

import argparse
import json
import os
import sys
import time
import asyncio
from pathlib import Path

STATE_FILE = str(Path(__file__).parent / "cf_state.json")
BASE = "https://ggmax.com.br"

async def setup(args):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--disable-features=IsolateOrigins,site-per-process",
            ],
            proxy={"server": "socks5://127.0.0.1:9050"},
        )
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            viewport={"width": 1366, "height": 768},
            locale="pt-BR",
        )
        # Mask webdriver
        await ctx.add_init_script(
            "Object.defineProperty(navigator,'webdriver',{get:()=>undefined});"
            "window.chrome={runtime:{}};"
        )
        page = await ctx.new_page()
        print(f"[*] Navigating to {BASE}/", file=sys.stderr)
        await page.goto(BASE + "/", wait_until="domcontentloaded", timeout=90000)

        # Click turnstile iframes periodically while waiting
        async def click_turnstile():
            for f in page.frames:
                if "challenges.cloudflare.com" in (f.url or ""):
                    try:
                        await f.locator("body").click(timeout=500)
                    except Exception:
                        pass

        # Wait for CF challenge to resolve (max ~240s, very generous)
        solved = False
        start = time.time()
        for i in range(120):
            try:
                await click_turnstile()
            except Exception:
                pass
            await asyncio.sleep(2)
            title = await page.title()
            if "moment" not in title.lower() and "just a" not in title.lower():
                # Try a quick API probe to ensure session is good
                try:
                    r = await page.request.get(BASE + "/api/announcements", timeout=15000)
                    if r.status in (200, 400, 401, 404):
                        solved = True
                        print(f"[*] CF solved after ~{int(time.time()-start)}s — title='{title}', probe={r.status}", file=sys.stderr)
                        break
                except Exception as e:
                    print(f"[!] Probe failed: {e}", file=sys.stderr)
            if i % 10 == 0:
                print(f"[*] Waiting CF... {int(time.time()-start)}s title='{title}'", file=sys.stderr)

        if not solved:
            print("[!] CF challenge not solved within timeout", file=sys.stderr)
            await browser.close()
            return 1

        # Save state
        state = await ctx.storage_state()
        with open(STATE_FILE, "w") as fh:
            json.dump(state, fh)
        print(f"[+] State saved to {STATE_FILE}", file=sys.stderr)
        # Also confirm with a final probe
        r = await page.request.get(BASE + "/api/announcements")
        body = await r.text()
        print(f"[+] Final probe /api/announcements: {r.status} ({len(body)}B)", file=sys.stderr)
        # save cf_clearance separately for easy reuse
        for c in state.get("cookies", []):
            if c.get("name") == "cf_clearance":
                with open("/tmp/cf_clearance_fresh.txt", "w") as fh:
                    fh.write(c["value"])
                print(f"[+] cf_clearance saved to /tmp/cf_clearance_fresh.txt", file=sys.stderr)
        await browser.close()
    return 0


async def probe(args):
    from playwright.async_api import async_playwright
    if not Path(STATE_FILE).exists():
        print("[!] No state file. Run with --setup first.", file=sys.stderr)
        return 1
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            proxy={"server": "socks5://127.0.0.1:9050"},
        )
        ctx = await browser.new_context(
            storage_state=STATE_FILE,
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        )
        # Quick health check — refresh state if needed
        page = await ctx.new_page()
        url = args.url if args.url else (BASE + args.path)
        method = args.method or "GET"
        headers = {}
        if args.content_type:
            headers["Content-Type"] = args.content_type
        if args.header:
            for h in args.header:
                k, _, v = h.partition(":")
                headers[k.strip()] = v.strip()

        try:
            r = await page.request.fetch(
                url,
                method=method,
                headers=headers,
                data=args.body,
                timeout=30000,
            )
            body = await r.text()
            all_headers = await r.all_headers()
            print(json.dumps({
                "status": r.status,
                "size": len(body),
                "url": url,
                "headers": dict(all_headers),
                "body": body[:50000],
            }, ensure_ascii=False))
        except Exception as e:
            print(json.dumps({"error": str(e), "url": url}))

        # If status was 403 (CF block) — try a re-solve
        if r.status == 403:
            print("[!] Got 403 — CF blocked. Try re-running --setup.", file=sys.stderr)

        # update state in case cookies changed
        state = await ctx.storage_state()
        with open(STATE_FILE, "w") as fh:
            json.dump(state, fh)
        await browser.close()
    return 0


async def batch(args):
    """Probe a list of paths from a file. Output JSON array."""
    from playwright.async_api import async_playwright
    if not Path(STATE_FILE).exists():
        print("[!] No state file. Run with --setup first.", file=sys.stderr)
        return 1
    paths = [l.strip() for l in open(args.list) if l.strip() and not l.startswith("#")]
    print(f"[*] Probing {len(paths)} paths", file=sys.stderr)
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            proxy={"server": "socks5://127.0.0.1:9050"},
        )
        ctx = await browser.new_context(
            storage_state=STATE_FILE,
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        )
        page = await ctx.new_page()
        results = []
        for i, path in enumerate(paths):
            url = BASE + path
            try:
                r = await page.request.get(url, timeout=20000)
                body = await r.text()
                # truncate body to save space
                body_short = body if len(body) < 1500 else body[:1500]
                results.append({
                    "path": path,
                    "status": r.status,
                    "size": len(body),
                    "body": body_short,
                })
                print(f"[{i+1}/{len(paths)}] {path} -> {r.status} ({len(body)}B)", file=sys.stderr)
            except Exception as e:
                results.append({"path": path, "error": str(e)})
                print(f"[{i+1}/{len(paths)}] {path} -> ERR {e}", file=sys.stderr)
            # gentle rate limit
            await asyncio.sleep(0.15)
        # save state
        state = await ctx.storage_state()
        with open(STATE_FILE, "w") as fh:
            json.dump(state, fh)
        out_file = args.list + ".out.json"
        with open(out_file, "w") as fh:
            json.dump(results, fh, ensure_ascii=False)
        print(f"[+] Results saved to {out_file}", file=sys.stderr)
        await browser.close()
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--setup", action="store_true")
    ap.add_argument("--probe", action="store_true")
    ap.add_argument("--list")
    ap.add_argument("--url")
    ap.add_argument("--path", default="")
    ap.add_argument("--method")
    ap.add_argument("--body")
    ap.add_argument("--content-type")
    ap.add_argument("--header", action="append")
    args = ap.parse_args()
    if args.setup:
        sys.exit(asyncio.run(setup(args)))
    elif args.list:
        sys.exit(asyncio.run(batch(args)))
    elif args.probe:
        sys.exit(asyncio.run(probe(args)))
    else:
        ap.print_help()
        sys.exit(2)


if __name__ == "__main__":
    main()
