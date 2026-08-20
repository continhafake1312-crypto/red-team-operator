#!/usr/bin/env python3
"""Probe many /api/* endpoints from a real browser session (CF cleared) to find
auth-required vs public, error vs encrypted (_v_secure) responses."""
import asyncio, json, os
from playwright.async_api import async_playwright
UA=("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
OUT="/home/ubuntu/kuromangas.com/enum/real_responses"
os.makedirs(OUT,exist_ok=True)

GET_EPS=["mangas/genres","mangas/1","chapters/recent","users/ranking","lists/explore",
"events/active","mangas/people","lists/tags/popular","notifications/count","caps/semana",
"caps/h","anilist/status","payments/supporter-status","scans/me/my-scans","users/search",
"users/me/profile","mangas/check-duplicate","uploads/editor","user/channel","proxy/image",
"mangas/1/similar","mangas/1/chapters","chapters/1","chapters/1/details","lists/1",
"scans/1","scans/1/mangas","users/1","users/1/library","comments/manga/1","stickers/recent",
"stickers/favorites","stickers/folders","users/ranking","shop/titles/1/purchase",
"admin/verify-access","staff/users","admin/users","admin/settings"]

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx=await b.new_context(user_agent=UA, viewport={"width":1366,"height":900})
        pg=await ctx.new_page()
        # solve CF by navigating to an api url first
        await pg.goto("https://kuromangas.com/api/mangas/genres", wait_until="load", timeout=30000)
        await pg.wait_for_timeout(6000)
        results=[]
        for ep in GET_EPS:
            url="https://kuromangas.com/api/"+ep
            r=await pg.evaluate("""async (u)=>{
              try{const r=await fetch(u,{credentials:'include',headers:{'x-crypto-version':'v4.8'}});
                let body='';try{body=await r.text()}catch(e){body='<err>'}
                return {status:r.status,dk:r.headers.get('x-kuro-datakey'),cv:r.headers.get('x-crypto-version'),ct:r.headers.get('content-type'),body:body}}
              catch(e){return {err:String(e)}}}""", url)
            r["ep"]=ep
            results.append(r)
            sec = "_v_secure" in (r.get("body") or "")
            print(f"{r.get('status')} {'SEC' if sec else '   '} dk={r.get('dk')!s:<20} {ep}  body[:80]={r.get('body','')[:80]!r}")
        with open(os.path.join(OUT,"probe_all.json"),"w") as f: json.dump(results,f,indent=2)
        # POST auth/login to see error format
        for ep,method,payload in [
            ("auth/login","POST",{"email":"nonexistent@example.invalid","password":"WrongPass1"}),
            ("auth/request-reset","POST",{"email":"nonexistent@example.invalid"}),
            ("auth/register","POST",{"username":"testbot123","email":"nonexistent@example.invalid","password":"BadPass1","confirmPassword":"BadPass1","turnstileToken":"invalidtoken"}),
        ]:
            url="https://kuromangas.com/api/"+ep
            r=await pg.evaluate("""async ([u,p])=>{
              try{const r=await fetch(u,{method:'POST',credentials:'include',headers:{'x-crypto-version':'v4.8','content-type':'application/json'},body:JSON.stringify(p)});
                let body='';try{body=await r.text()}catch(e){body='<err>'}
                return {status:r.status,dk:r.headers.get('x-kuro-datakey'),cv:r.headers.get('x-crypto-version'),body:body}}
              catch(e){return {err:String(e)}}}""", [url,payload])
            r["ep"]=ep;r["method"]=method
            print(f"{r.get('status')} POST {'SEC' if '_v_secure' in (r.get('body') or '') else '   '} dk={r.get('dk')!s:<20} {ep}  body[:120]={r.get('body','')[:120]!r}")
            with open(os.path.join(OUT,f"post_{ep.replace('/','_')}.json"),"w") as f: json.dump(r,f,indent=2)
        await b.close()
asyncio.run(main())
