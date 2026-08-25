#!/usr/bin/env python3
"""TASK 5: Admin routes without auth"""
import subprocess, time

BASE = "https://ifes25-semproxy.selecao.net.br"
OUT = "/home/ubuntu/engagement/cotec-fadenor.selecao.net.br/enum/admin_routes.txt"
SLEEP = 1.2

def curl(url, method="GET", headers=None, data=""):
    cmd = ["proxychains4", "-q", "curl", "-sk", "--max-time", "10", "-i"]
    if method != "GET":
        cmd += ["-X", method]
    if headers:
        for k, v in headers.items():
            cmd += ["-H", f"{k}: {v}"]
    if data and method in ["POST", "PUT"]:
        cmd += ["-d", data]
    cmd += [url]
    return subprocess.run(cmd, capture_output=True, text=True, timeout=15).stdout

results = []

admin_routes = [
    "/admin/logs/", "/admin/clientes/", "/admin/concursos/", "/admin/candidatos/",
    "/admin/", "/admin/login", "/admin/dashboard", "/admin/home",
    "/admin/users", "/admin/usuarios", "/admin/config", "/admin/settings",
    "/admin/api", "/admin/backup", "/admin/export", "/admin/import",
    "/admin/upload", "/admin/media", "/admin/files",
    "/admin/logs", "/admin/clientes", "/admin/concursos", "/admin/candidatos",
]

print("=== TASK 5: Admin Routes Scan ===")

for route in admin_routes:
    url = BASE + route
    for method in ["GET", "POST", "PUT"]:
        headers = {}
        if method == "POST" or method == "PUT":
            headers = {"Content-Type": "application/json"}
        
        r = curl(url, method=method, headers=headers)
        time.sleep(SLEEP)
        status = "UNKNOWN"
        for line in r.split('\n'):
            if line.startswith("HTTP/"):
                status = line.strip()
        body = r.split('\n\n', 1)[1] if '\n\n' in r else r
        body_len = len(body)
        
        # Check for differences
        is_json = "application/json" in r.lower()
        has_form = "form" in r.lower() and ("input" in r.lower() or "password" in r.lower())
        has_api = "api" in route.lower()
        
        results.append(f"{method} {route} -> {status} | len={body_len} | json={is_json} | form={has_form}")
        print(f"  {method} {route} -> {status}")

# Test with Accept: application/json
print("\n[>] Testing with Accept: application/json")
for route in ["/admin/logs/", "/admin/clientes/", "/admin/concursos/", "/admin/candidatos/"]:
    url = BASE + route
    headers = {"Accept": "application/json"}
    r = curl(url, method="GET", headers=headers)
    time.sleep(SLEEP)
    status = "UNKNOWN"
    for line in r.split('\n'):
        if line.startswith("HTTP/"):
            status = line.strip()
    body_len = len(r)
    results.append(f"GET {route} [Accept: application/json] -> {status} | len={body_len}")
    print(f"  JSON {route} -> {status}")

with open(OUT, 'w') as f:
    f.write("=== ADMIN ROUTES WITHOUT AUTH ===\n")
    f.write(f"Target: {BASE}\n\n")
    for line in results:
        f.write(line + "\n")

print(f"\n[+] Results saved to {OUT}")