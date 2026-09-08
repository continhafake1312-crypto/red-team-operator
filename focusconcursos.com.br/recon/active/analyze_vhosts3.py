#!/usr/bin/env python3
"""analyze_vhosts3.py — post-process raw ffuf3 JSONs (no -ac): per-target baseline subtraction.
Group results by (status,len,words+lines clamp); report hostnames whose response signature
differs from the target's modal baseline (most-common cluster) → distinct enough = real vhost.
"""
import json, os, glob, re, collections

def summarize(path):
    d=json.load(open(path))
    res=d.get('results',[])
    if not res: return (path,0,[],collections.defaultdict(list))
    stats=[]
    for r in res:
        host=r['input'].get('FUZZ','?')
        stats.append((host, r['status'], r['length'], r['words']))
    base=collections.Counter((s,l,w) for _,s,l,w in stats).most_common(1)[0][0]
    others=[]
    for host,s,l,w in stats:
        if (s,l,w)!=base:
            others.append((host,s,l,w))
    return (path,len(res),base,others)

def main():
    for f in sorted(glob.glob('vhosts3_*.json')):
        path,n,base,others=summarize(f)
        print(f"== {path} ({n} req) baseline={base}")
        # show distinct outliers (real/interesting vhost candidates)
        seen=collections.defaultdict(list)
        for host,s,l,w in others:
            seen[(s,l,w)].append(host)
        for key, hosts in seen.items():
            hs=", ".join(hosts[:12]) + ("..." if len(hosts)>12 else "")
            print(f"   [{key[0]} len={key[1]} w={key[2]}] {hs}")

if __name__=="__main__":
    main()
