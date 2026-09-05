#!/usr/bin/env python3
"""Bulk probe API paths via curl_cffi (CF bypass). Saves results to JSON+txt."""
import sys, json, time
from curl_cffi import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = "https://ggmax.com.br"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
PROXY = {"https": "socks5h://127.0.0.1:9050"}
CL = open("/tmp/cf_clearance.txt").read().strip()

def probe(path):
    url = BASE + path
    headers = {"User-Agent": UA, "Cookie": "cf_clearance=" + CL, "Accept": "application/json,text/plain,*/*"}
    try:
        r = requests.get(url, headers=headers, proxies=PROXY, impersonate="chrome", timeout=20, allow_redirects=False)
        body = r.text
        return {"path": path, "status": r.status_code, "size": len(body),
                "ct": r.headers.get("content-type",""), "loc": r.headers.get("location",""),
                "body": body[:600], "full_size": len(body)}
    except Exception as e:
        return {"path": path, "error": str(e)}

def main():
    paths = [l.strip() for l in open(sys.argv[1]) if l.strip() and not l.startswith("#")]
    out_json = sys.argv[2]
    print(f"[*] Probing {len(paths)} paths with 8 threads", file=sys.stderr)
    results = []
    done = 0
    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = {ex.submit(probe, p): p for p in paths}
        for f in as_completed(futures):
            done += 1
            r = f.result()
            results.append(r)
            if "error" in r:
                print(f"[{done}/{len(paths)}] ERR {r['path']}: {r['error']}", file=sys.stderr)
            else:
                print(f"[{done}/{len(paths)}] {r['status']} {r['size']:>7} {r['path']}", file=sys.stderr)
    # sort by status then path
    results.sort(key=lambda x: (x.get("status",999), x["path"]))
    with open(out_json, "w") as fh:
        json.dump(results, fh, ensure_ascii=False)
    # also a simple txt report
    with open(out_json + ".txt", "w") as fh:
        for r in results:
            if "error" in r:
                fh.write(f"ERR  {r['path']}: {r['error']}\n")
            else:
                fh.write(f"{r['status']} {r['size']:>7}  {r['path']}\n")
                if r["status"] not in (404,) and r["size"] < 400:
                    fh.write(f"     body: {r['body'][:200]}\n")
    print(f"[+] Done. {len(results)} results in {out_json}", file=sys.stderr)

if __name__ == "__main__":
    main()
