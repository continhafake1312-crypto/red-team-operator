#!/usr/bin/env python3
"""ggmax.com.br legacy API explorer (CF bypass via curl_cffi chrome impersonation)."""
import sys, json, time, os
from curl_cffi import requests

BASE = "https://ggmax.com.br"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
PROXY = {"https": "socks5h://127.0.0.1:9050"}

def load_clearance():
    for p in ["/tmp/cf_clearance_fresh.txt", "/tmp/cf_clearance.txt"]:
        if os.path.exists(p):
            return open(p).read().strip()
    return ""

CL = load_clearance()

def req(path, method="GET", body=None, content_type=None, extra_headers=None, params=None, timeout=30):
    url = path if path.startswith("http") else BASE + path
    headers = {"User-Agent": UA, "Cookie": "cf_clearance=" + CL, "Accept": "application/json,text/plain,*/*"}
    if content_type:
        headers["Content-Type"] = content_type
    if extra_headers:
        headers.update(extra_headers)
    try:
        r = requests.request(method, url, headers=headers, data=body, params=params,
                             proxies=PROXY, impersonate="chrome", timeout=timeout, allow_redirects=False)
        return {"status": r.status_code, "size": len(r.text), "headers": dict(r.headers),
                "body": r.text, "url": str(r.url)}
    except Exception as e:
        return {"error": str(e), "url": url}

def out(o, max_body=2000):
    if "error" in o:
        print(f"ERR  {o['url']}: {o['error']}")
        return
    body = o.get("body","")
    b = body if len(body) <= max_body else body[:max_body] + f"... [+{len(body)-max_body}B]"
    print(f"HTTP {o['status']}  size={o['size']}  {o['url']}")
    print(b)
    print("-" * 80)

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "/api/announcements"
    method = sys.argv[2] if len(sys.argv) > 2 else "GET"
    body = sys.argv[3] if len(sys.argv) > 3 else None
    ct = sys.argv[4] if len(sys.argv) > 4 else None
    o = req(path, method, body, ct)
    out(o, max_body=10000)
