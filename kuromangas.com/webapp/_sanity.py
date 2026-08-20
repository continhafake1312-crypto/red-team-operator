#!/usr/bin/env python3
"""Quick sanity test: launch chromium, clear CF, hit /api/health, decrypt."""
import asyncio, json, time, sys
from playwright.async_api import async_playwright
sys.path.insert(0, "/home/ubuntu/kuromangas.com/webapp")
from webapp_attack import clear_cf, api_fetch, decrypt_cap, BASE

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await b.new_context(user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", viewport={"width":1366,"height":900}, locale="pt-BR")
        pg = await ctx.new_page()
        ok, body = await clear_cf(pg, ctx)
        print("CF cleared:", ok, "health body:", (body or "")[:200])
        if ok:
            r = await api_fetch(pg, "GET", "health")
            print("health fetch status:", r["status"], "dk:", r.get("dk"), "body[:80]:", r.get("body","")[:80])
            plain, err = decrypt_cap(r)
            print("decrypted:", (plain or err)[:300])
        cookies = await ctx.cookies()
        print("cookies:", [c["name"] for c in cookies])
        await b.close()

asyncio.run(main())
