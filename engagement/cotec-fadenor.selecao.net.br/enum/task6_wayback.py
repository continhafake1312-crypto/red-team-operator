#!/usr/bin/env python3
"""TASK 6: Wayback Machine explores"""
import subprocess, time

OUT = "/home/ubuntu/engagement/cotec-fadenor.selecao.net.br/enum/wayback_results.txt"
SLEEP = 2

results = []

domains = ["suporte.selecao.net.br", "proxy-auth.selecao.net.br"]

# Try waybackurls if available
# Also try direct wayback machine API
for domain in domains:
    print(f"\n[>] Wayback Machine: {domain}")
    
    # Wayback CDX API
    url = f"http://web.archive.org/cdx/search/cdx?url=*.{domain}&output=json&fl=original,statuscode,timestamp&limit=100"
    cmd = ["curl", "-sk", "--max-time", "30", url]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=35)
    time.sleep(SLEEP)
    
    if r.stdout and len(r.stdout) > 10:
        results.append(f"\n=== Wayback CDX: {domain} ===")
        results.append(r.stdout[:5000])
    else:
        results.append(f"\n=== Wayback CDX: {domain} -> No results ===")
    
    # Try waybackurls tool
    cmd2 = ["waybackurls", domain]
    r2 = subprocess.run(cmd2, capture_output=True, text=True, timeout=30)
    time.sleep(SLEEP)
    
    if r2.stdout and len(r2.stdout) > 5:
        results.append(f"\n=== WaybackURLs: {domain} ===")
        results.append(r2.stdout[:5000])
    else:
        results.append(f"\n=== WaybackURLs: {domain} -> No results ===")

with open(OUT, 'w') as f:
    f.write("=== WAYBACK MACHINE RESULTS ===\n")
    f.write(f"Date: {time.ctime()}\n")
    for line in results:
        f.write(line + "\n")

print(f"\n[+] Results saved to {OUT}")