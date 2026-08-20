#!/usr/bin/env python3
"""Content discovery + API-doc probing + well-known via a real browser session
(CF cleared by navigating to an /api/ url first)."""
import asyncio, json, os
from playwright.async_api import async_playwright
UA=("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
OUT="/home/ubuntu/kuromangas.com/enum"
os.makedirs(OUT, exist_ok=True)

# content / api-doc / well-known paths to probe (on apex)
PATHS=[
 "/robots.txt","/sitemap.xml","/manifest.json","/manifest.webmanifest",
 "/security.txt","/.well-known/security.txt","/.well-known/openid-configuration",
 "/.well-known/assetlinks.json","/.well-known/change-password","/.well-known/openapi.json",
 "/.git/config","/.git/HEAD","/.env","/backup","/config","/package.json",
 "/api","/api/","/api/v1","/api/v4","/api/v4.8","/api/health","/api/version",
 "/api/status","/api/metrics","/api/openapi.json","/api/swagger.json","/api/swagger-ui",
 "/api/swagger","/api/docs","/api/graphql","/api/graphiql","/api/introspect",
 "/api/admin","/api/internal","/api/panel","/api/dashboard","/api/dev","/api/debug",
 "/api/actuator","/actuator","/actuator/env","/actuator/health",
 "/swagger","/swagger-ui","/swagger-ui.html","/docs","/graphql","/graphiql",
 "/api/auth/me","/api/users/me","/api/payments/list","/api/webhooks","/api/webhook",
]
# also re-capture encrypted public responses
POSTS=[
 ("auth/request-reset","POST",{"email":"a@b.c"}),
 ("auth/request-reset","POST",{"email":"x@y.z"}),
 ("auth/reset-password","POST",{"token":"fake","newPassword":"Fake1Pass","confirmPassword":"Fake1Pass"}),
 ("auth/login","POST",{"email":"a@b.c","password":"Wrong1"}),
]

async def main():
    results=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True, args=["--no-sandbox","--disable-blink-features=AutomationControlled"])
        ctx=await b.new_context(user_agent=UA, viewport={"width":1366,"height":900})
        pg=await ctx.new_page()
        await pg.goto("https://kuromangas.com/api/mangas/genres", wait_until="load", timeout=30000)
        await pg.wait_for_timeout(6000)
        for path in PATHS:
            url="https://kuromangas.com"+path
            r=await pg.evaluate("""async (u)=>{
              try{const r=await fetch(u,{credentials:'include',redirect:'follow'});
                let body='';try{body=await r.text()}catch(e){body='<err>'}
                return {status:r.status,ct:r.headers.get('content-type'),final:r.url,len:body.length,body:body.slice(0,400)}}
              catch(e){return {err:String(e)}}}""", url)
            r["path"]=path; results.append(r)
            sec = "_v_secure" in (r.get("body") or "")
            interstitial = "Just a moment" in (r.get("body") or "") or "Performing security" in (r.get("body") or "")
            tag = "SEC" if sec else ("CF" if interstitial else ("SPA" if "<title>Kuro Mang" in (r.get("body") or "") or "Kuro Mang" in (r.get("body") or "")[:200] else ""))
            print(f"{r.get('status')} {tag:3} {path:40} ct={r.get('ct','')[:24]:24} len={r.get('len',0):6} body[:60]={r.get('body','')[:60]!r}")
        with open(os.path.join(OUT,"content_discovery_apex.json"),"w") as f: json.dump(results,f,indent=2)
        # capture encrypted public responses
        enc_caps=[]
        for ep,method,payload in POSTS:
            url="https://kuromangas.com/api/"+ep
            r=await pg.evaluate("""async ([u,p])=>{
              try{const r=await fetch(u,{method:'POST',credentials:'include',headers:{'x-crypto-version':'v4.8','content-type':'application/json'},body:JSON.stringify(p)});
                let body='';try{body=await r.text()}catch(e){body='<err>'}
                return {status:r.status,dk:r.headers.get('x-kuro-datakey'),cv:r.headers.get('x-crypto-version'),body:body}}
              catch(e){return {err:String(e)}}}""", [url,payload])
            r["ep"]=ep; enc_caps.append(r)
            sec = "_v_secure" in (r.get("body") or "")
            print(f"POST {r.get('status')} {'SEC' if sec else '   '} dk={r.get('dk')!s:<12} {ep}  body[:80]={r.get('body','')[:80]!r}")
        with open(os.path.join(OUT,"real_responses","enc_public_posts.json"),"w") as f: json.dump(enc_caps,f,indent=2)
        await b.close()
asyncio.run(main())
