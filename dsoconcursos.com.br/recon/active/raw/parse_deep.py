#!/usr/bin/env python3
import json, sys
from collections import defaultdict

d = json.load(open("/home/ubuntu/dsoconcursos.com.br/recon/active/raw/deep_probe_raw.json"))

# Group by host
by_host = defaultdict(list)
for r in d:
    by_host[r["host"]].append(r)

# For each host, print all responses
print("# Deep probe — per-host summary (CF-spoof bypass on origin 201.54.0.48 / 3.83.108.124)\n")
for host in sorted(by_host.keys()):
    rs = by_host[host]
    print(f"\n## {host} ({len(rs)} probes)")
    for r in rs:
        status = r["status"]
        meta = r.get("meta",{})
        if isinstance(meta, list):
            meta = {}
        flag = ""
        if status in ("200","201","301","302","307","308"): flag = " **LIVE**"
        if status == "401": flag = " [AUTH]"
        body = (r.get("body_head","") or "")[:250].replace("\n"," ")
        cb = meta.get("caddy_block","")
        loc = meta.get("location","")
        ct = meta.get("content_type","")
        ttl = meta.get("title","")
        print(f"  [{r['method']:7}] {r['path']:50} -> {status}{flag} sz={r['size']} cb={cb} ct={ct}")
        if ttl: print(f"      title: {ttl!r}")
        if loc: print(f"      location: {loc}")
        if body and (ct and ("json" in ct or "text" in ct or r['size'] < 600)) and status not in ("403","404","301","308","302","307"):
            print(f"      body: {body!r}")

# Also extract version info
print("\n\n# ===== KEY VERSION FINDINGS =====")
for r in d:
    body = r.get("body_head","") or ""
    # GitLab version
    if "rev=" in body or "GitLab" in body:
        m = __import__("re").search(r'"gitlab_version":"([^"]+)"', body) or __import__("re").search(r'"version":"([^"]+)"', body)
        if m: print(f"  GitLab version ({r['host']}{r['path']}): {m.group(1)}")
    # Nextcloud version
    if "nextcloud" in body.lower() or "versionstring" in body.lower():
        m = __import__("re").search(r'"versionstring":"([^"]+)"', body) or __import__("re").search(r'"version":"([^"]+)"', body)
        if m: print(f"  Nextcloud version ({r['host']}{r['path']}): {m.group(1)}")
    # Grafana version
    if "grafana" in body.lower():
        m = __import__("re").search(r'"version":"?([^",}]+)"?', body)
        if m: print(f"  Grafana version ({r['host']}{r['path']}): {m.group(1)}")
    # Harbor version
    if "harbor" in body.lower():
        m = __import__("re").search(r'"version":"?([^",}]+)"?', body)
        if m: print(f"  Harbor version ({r['host']}{r['path']}): {m.group(1)}")
