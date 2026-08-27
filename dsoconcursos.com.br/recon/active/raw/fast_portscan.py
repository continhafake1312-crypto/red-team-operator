#!/usr/bin/env python3
"""Fast parallel TCP port scanner via Tor SOCKS5.
Scans all 65535 ports on each real origin IP using async TCP connects."""
import socks, socket, sys, json
from concurrent.futures import ThreadPoolExecutor, as_completed

SOCKS_HOST, SOCKS_PORT = "127.0.0.1", 9050
TARGETS = ["177.39.18.137","177.39.18.138","201.46.120.158","201.46.120.163",
           "201.54.0.48","3.83.108.124","201.46.120.57"]
# Top interesting ports + full high-port sweep subset
COMMON = list(set(
    [21,22,23,25,53,80,110,111,113,135,139,143,443,445,465,587,993,995,
     1433,1521,2049,2181,2375,2376,3000,3001,3128,3222,3260,3306,3389,
     4000,4040,4369,4443,5000,5044,5432,5433,5601,5666,5672,5900,5984,
     6000,6379,6443,7001,7080,7474,7687,7777,8000,8001,8008,8009,8010,
     8080,8081,8082,8083,8086,8088,8089,8090,8091,8098,8161,8181,8200,
     8222,8242,8243,8333,8443,8500,8530,8696,8800,8880,8888,8889,9000,
     9001,9002,9009,9042,9080,9090,9091,9092,9100,9200,9300,9418,9443,
     9527,9999,10000,10080,10250,11211,15672,20000,22000,27017,50000,65535,
     # cPanel/WHM
     2077,2078,2079,2080,2082,2083,2084,2086,2087,2095,2096,
     # DB
     33060,27018,27019,28015,28017,
     # smtp submission alt
     2525,3535,
     # mcp/caddy
     2019, # caddy admin
     ]
))
# Also do a sweep of all common high ports in chunks
SWEEP_EXTRA = list(range(1024, 10250)) + list(range(30000, 40000))
ALL_PORTS = sorted(set(COMMON + SWEEP_EXTRA))

def scan_port(ip, port, timeout=4):
    try:
        s = socks.socksocket()
        s.set_proxy(socks.SOCKS5, SOCKS_HOST, SOCKS_PORT)
        s.settimeout(timeout)
        s.connect((ip, port))
        s.close()
        return (ip, port, True)
    except Exception:
        return (ip, port, False)

def scan_ip(ip, ports=ALL_PORTS, workers=64):
    open_ports=[]
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs={ex.submit(scan_port, ip, p): p for p in ports}
        for f in as_completed(futs):
            r=f.result()
            if r[2]:
                open_ports.append(r[1])
                print(f"[+] {r[0]}:{r[1]} OPEN")
    return sorted(open_ports)

def main():
    results={}
    for ip in TARGETS:
        print(f"\n=== Scanning {ip} ({len(ALL_PORTS)} ports) ===", file=sys.stderr)
        op=scan_ip(ip)
        results[ip]=op
        print(f"=== {ip} OPEN: {op}")
    json.dump(results, open("raw/portscan_fast.json","w"), indent=2)
    print("\n=== SUMMARY ===")
    for ip, ops in results.items():
        print(f"{ip}: {ops}")

if __name__=="__main__":
    main()
