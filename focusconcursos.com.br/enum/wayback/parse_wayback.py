#!/usr/bin/env python3
"""Parse wayback_endpoints.txt -> per-host route indices + JS inventory + api candidates."""
import re, sys, collections, urllib.parse, os, json

BASE = "/home/ubuntu/red-team-operator/focusconcursos.com.br/enum"
SRC = "/home/ubuntu/red-team-operator/focusconcursos.com.br/recon/passive/wayback_endpoints.txt"

hosts = collections.defaultdict(set)      # host -> set of (host,path)
paths_by_host = collections.defaultdict(collections.Counter)
js = []                                    # host|url
api = []                                   # host|path|method? (path contains /api)
params_mined = collections.defaultdict(collections.Counter)

def norm_host(netloc):
    h = netloc.lower()
    if ':' in h: h = h.split(':')[0]
    if h.startswith('www.'): h = h[4:]
    return h

for line in open(SRC, encoding='utf-8', errors='replace'):
    u = line.strip()
    if not u: continue
    p = urllib.parse.urlsplit(u)
    h = norm_host(p.netloc)
    path = p.path or '/'
    if len(path) > 200: path = path[:200]
    hosts[h].add(path)
    # strip id-like trailing segments into param-styled pattern to cluster
    paths_by_host[h][path] += 1
    if re.search(r'\.(js|mjs|jsx)(\?|$)', path):
        js.append(f"{h}|{path}")
    if 'api' in path.lower():
        api.append(f"{h}|{path}")

out = os.path.join(BASE, 'wayback')
os.makedirs(out, exist_ok=True)
with open(out + '/hosts.txt', 'w') as f:
    for h in sorted(hosts, key=lambda x: -len(hosts[x])):
        f.write(f"{h} {len(hosts[h])}\n")
for h in sorted(hosts):
    name = h.replace('www.', '').replace('.', '_')
    with open(f"{out}/paths_{name}.txt", 'w') as f:
        for pth in sorted(hosts[h]):
            f.write(pth + '\n')
with open(out + '/js_files.txt', 'w') as f:
    f.write('\n'.join(sorted(set(js))))
with open(out + '/api_paths.txt', 'w') as f:
    f.write('\n'.join(sorted(set(api))))
# global unique path tokens for wordlist seeding
tok = collections.Counter()
for h, s in hosts.items():
    for pth in s:
        for seg in pth.split('/'):
            seg = seg.strip('-_.')
            if seg and not seg.isdigit() and len(seg) > 2 and '%' not in seg:
                tok[seg.lower()] += 1
with open(out + '/tokens.txt', 'w') as f:
    for w, c in tok.most_common(400):
        f.write(f"{w} {c}\n")
print(f"hosts: {len(hosts)}; js: {len(set(js))}; api-lines: {len(set(api))}")
print("top hosts:")
for h in sorted(hosts, key=lambda x: -len(hosts[x]))[:25]:
    print(f"  {h} {len(hosts[h])}")
