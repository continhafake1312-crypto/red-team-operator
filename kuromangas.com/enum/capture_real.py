#!/usr/bin/env python3
"""Capture real /api/* responses by browsing public content routes in a real browser
(CF challenge auto-solved in-browser; invisible-Turnstile token issued per request)."""
import asyncio, json, os
from playwright.async_api import async_playwright

OUT="/home/ubuntu/kuromangas.com/enum/real_responses"
os.makedirs(OUT, exist_ok=True)
UA=("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")

# Public content routes likely to trigger API calls (unauth)
ROUTES=[
  "/mangas","/manga/1","/manga/2","/manga/3","/ranking","/ranking/mangas",
  "/ranking/readers","/ranking/scans","/catalog","/scans","/chapters",
  "/lists","/lists/explore","/events","/badges","/borders","/stickers",
  "/supporters","/profile/1","/profile/2","/users","/manga/1/1","/read/1/1",
  "/scans/1","/users/1","/comments","/continue-reading","/history",
]

async def main():
    caps=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx=await b.new_context(user_agent=UA, viewport={"width":1366,"height":900}, locale="pt-BR")
        pg=await ctx.new_page()
        async def on_resp(resp):
            u=resp.url
            if "/api/" not in u: return
            try: body=await resp.text()
            except Exception as e: body=f"<ERR {e}>"
            h=dict(resp.headers)
            cap={"n":len(caps),"url":u,"status":resp.status,
                 "datakey":h.get("x-kuro-datakey",""),"crypto_version":h.get("x-crypto-version",""),
                 "body":body}
            caps.append(cap)
            with open(os.path.join(OUT,f"cap_{len(caps)-1:03d}.json"),"w") as f:
                json.dump(cap,f,indent=2)
            print(f"[{len(caps)-1:03d}] {resp.status} {u.replace('https://kuromangas.com','')} dk={h.get('x-kuro-datakey','')} body[:60]={body[:60]!r}")
        pg.on("response", on_resp)
        for r in ROUTES:
            try:
                await pg.goto("https://kuromangas.com"+r, wait_until="load", timeout=20000)
            except Exception as e:
                print(f"nav {r}: {e}")
            await pg.wait_for_timeout(2500)
        await b.close()
    with open(os.path.join(OUT,"_index.json"),"w") as f:
        json.dump([{"n":c["n"],"url":c["url"],"status":c["status"],"datakey":c["datakey"]} for c in caps],f,indent=2)
    print(f"\nCaptured {len(caps)} API responses")

asyncio.run(main())
