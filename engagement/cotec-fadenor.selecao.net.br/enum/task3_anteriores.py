#!/usr/bin/env python3
"""TASK 3: anteriores.cotec.fadenor.com.br recon"""
import subprocess, time, sys

BASE = "https://anteriores.cotec.fadenor.com.br"
OUT = "/home/ubuntu/engagement/cotec-fadenor.selecao.net.br/enum/anteriores_enum.txt"
SLEEP = 1.2

def curl(url, method="GET", headers=None):
    cmd = ["proxychains4", "-q", "curl", "-sk", "--max-time", "10", "-i"]
    if headers:
        for k, v in headers.items():
            cmd += ["-H", f"{k}: {v}"]
    if method != "GET":
        cmd += ["-X", method]
    cmd += [url]
    return subprocess.run(cmd, capture_output=True, text=True, timeout=15).stdout

results = []

print("=== TASK 3: anteriores.cotec.fadenor.com.br ===")

# Basic recon
# 1. Check base URL
r = curl(BASE)
time.sleep(SLEEP)
lines = r.split('\n')
status = next((l for l in lines if l.startswith("HTTP/")), "UNKNOWN")
title = "N/A"
for l in lines:
    if "<title>" in l:
        title = l.split("<title>")[1].split("</title>")[0]
server = next((l.split("Server: ")[1] for l in lines if "Server:" in l), "N/A")
results.append(f"BASE -> {status}")
results.append(f"Title: {title}")
results.append(f"Server: {server}")
print(f"  BASE -> {status} | Title: {title}")

# 2. Common files
common = [
    "/robots.txt", "/sitemap.xml", "/.git/", "/.git/config", "/.git/HEAD",
    "/composer.json", "/.env", "/.env.backup", "/.env.local",
    "/admin/", "/login", "/wp-admin/", "/wp-login.php",
    "/phpinfo.php", "/info.php", "/test.php",
    "/index.php", "/index.html", "/index.htm",
    "/backup/", "/uploads/", "/upload/",
    "/api/", "/api/v1/", "/api/v2/",
    "/config/", "/config.php", "/db/",
    "/cgi-bin/", "/cgi-bin/php",
    "/server-status", "/server-info",
    "/crossdomain.xml", "/clientaccesspolicy.xml",
    "/package.json", "/.htaccess",
    "/web.config", "/.DS_Store",
    "/README", "/CHANGELOG", "/LICENSE",
]

for p in common:
    url = BASE + p
    r = curl(url)
    time.sleep(SLEEP)
    status = next((l for l in r.split('\n') if l.startswith("HTTP/")), "UNKNOWN")
    body_len = len(r.split('\n\n', 1)[1] if '\n\n' in r else r)
    results.append(f"{p} -> {status} | len={body_len}")
    if "200" in status or "301" in status or "403" in status:
        print(f"  {p} -> {status} [INTERESTING]")
        # Save response
        safe = p.replace('/', '_').replace('.', '_')
        with open(f"/home/ubuntu/engagement/cotec-fadenor.selecao.net.br/enum/ant_{safe}.txt", 'w') as f:
            f.write(r)
    else:
        print(f"  {p} -> {status}")

# 3. Directory enumeration (wordlist-based)
dirs = [
    "/admin", "/backup", "/uploads", "/upload", "/files", "/assets",
    "/css", "/js", "/img", "/images", "/vendor", "/public",
    "/private", "/restricted", "/secure", "/painel", "/painel-admin",
    "/sistema", "/app", "/src", "/dist", "/build", "/tmp",
    "/logs", "/error", "/errors", "/cache", "/temp",
    "/doc", "/docs", "/documentation", "/help",
    "/old", "/new", "/test", "/tests", "/dev", "/development",
    "/staging", "/beta", "/demo", "/sample", "/examples",
    "/inc", "/include", "/includes", "/lib", "/libs",
    "/modules", "/plugins", "/themes", "/template", "/templates",
    "/pages", "/content", "/data", "/database",
    "/sql", "/dump", "/export", "/import",
    "/dashboard", "/manager", "/management",
    "/web", "/webservice", "/ws", "/soap", "/xmlrpc",
    "/login.php", "/user.php", "/users.php",
    "/register.php", "/cadastro.php",
    "/contact.php", "/contato.php",
    "/search.php", "/busca.php",
    "/download.php", "/downloads.php",
    "/sitemap.php", "/rss.php",
    "/feed.php", "/atom.php",
]

for d in dirs:
    url = BASE + d
    r = curl(url)
    time.sleep(SLEEP)
    status = next((l for l in r.split('\n') if l.startswith("HTTP/")), "UNKNOWN")
    body_len = len(r.split('\n\n', 1)[1] if '\n\n' in r else r)
    results.append(f"{d} -> {status} | len={body_len}")
    if status and ("200" in status):
        print(f"  {d} -> {status}")

# Save
with open(OUT, 'w') as f:
    f.write("=== ANTERIORES.COTEC.FADENOR.COM.BR RECON ===\n")
    f.write(f"Target: {BASE}\n")
    f.write(f"Date: {time.ctime()}\n\n")
    for line in results:
        f.write(line + "\n")

print(f"\n[+] Results saved to {OUT}")