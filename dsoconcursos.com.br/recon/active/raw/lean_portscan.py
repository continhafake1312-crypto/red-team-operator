#!/usr/bin/env python3
"""Lean fast port scan — only high-value ports, all 7 IPs in parallel."""
import socks, socket, sys, json
from concurrent.futures import ThreadPoolExecutor, as_completed

SOCKS_HOST, SOCKS_PORT = "127.0.0.1", 9050
TARGETS = ["177.39.18.137","177.39.18.138","201.46.120.158","201.46.120.163",
           "201.54.0.48","3.83.108.124","201.46.120.57"]
PORTS = sorted(set([21,22,23,25,53,80,110,143,443,445,465,587,993,995,
    1433,1521,2049,2181,2375,2376,3000,3001,3128,3260,3306,3389,4000,4040,
    4443,5000,5044,5432,5433,5601,5672,5900,5984,6000,6379,6443,7001,7080,
    7474,7687,7777,8000,8001,8008,8009,8010,8080,8081,8082,8083,8086,8088,
    8089,8090,8098,8161,8181,8200,8222,8243,8333,8443,8500,8530,8696,8800,
    8880,8888,8889,9000,9001,9002,9009,9042,9080,9090,9091,9092,9100,9200,
    9300,9418,9443,9527,9999,10000,10080,10250,11211,15672,20000,22000,
    27017,33060,50000,
    # cpanel/whm
    2077,2078,2079,2080,2082,2083,2084,2086,2087,2095,2096,
    # mcp / caddy admin / docker
    2019,5001,5005,5043,
    # smtp alt
    2525,3535,465,
    # db
    27018,27019,28015,28017,1434,
    # additional
    32400, 55443, 60888, 30865, 23424, 54321, 65535,
]))

def scan(args):
    ip, port = args
    try:
        s = socks.socksocket()
        s.set_proxy(socks.SOCKS5, SOCKS_HOST, SOCKS_PORT)
        s.settimeout(4)
        s.connect((ip, port))
        # try to grab banner
        banner=b""
        try:
            s.settimeout(2)
            banner = s.recv(256)
        except: pass
        s.close()
        return (ip, port, True, banner)
    except Exception:
        return (ip, port, False, b"")

def main():
    tasks=[(ip,p) for ip in TARGETS for p in PORTS]
    print(f"[*] {len(tasks)} port probes ({len(TARGETS)} IPs x {len(PORTS)} ports)", file=sys.stderr)
    open_by_ip={ip:[] for ip in TARGETS}
    with ThreadPoolExecutor(max_workers=128) as ex:
        futs=[ex.submit(scan,t) for t in tasks]
        for f in as_completed(futs):
            ip,port,ok,banner=f.result()
            if ok:
                open_by_ip[ip].append((port,banner))
                bn = banner[:80].decode("latin1",errors="ignore").replace("\n"," ").replace("\r"," ") if banner else ""
                print(f"[+] {ip}:{port} OPEN  banner={bn!r}")
    json.dump({ip:[{"port":p,"banner":b.decode("latin1",errors="ignore")[:200]} for p,b in sorted(ops)]
               for ip,ops in open_by_ip.items()}, open("raw/portscan_lean.json","w"), indent=2)
    print("\n=== SUMMARY ===")
    for ip, ops in open_by_ip.items():
        print(f"{ip}: {[p for p,_ in sorted(ops)]}")

if __name__=="__main__":
    main()
