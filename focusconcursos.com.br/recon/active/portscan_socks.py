#!/usr/bin/env python3
"""TCP connect scanner over Tor SOCKS5 (127.0.0.1:9050) — recon-active (focusconcursos).
Classifies: OPEN / CLOSED(refused) / FILTERED(timeout) / BLOCKED.
Gentle: bounded concurrency, no SYN flood, per-port connect only.
Usage:
  python3 portscan_socks.py ports IP PORT_FILE MAXCONNS
  python3 portscan_socks.py range IP START END MAXCONNS
  python3 portscan_socks.py list IP_LIST_FILE PORTS_COMMA MAXCONNS
"""
import socket, struct, sys, time, re, concurrent.futures, threading

TMO = 10  # per-port SOCKS connect timeout (s), overridable via argv

def sock5_connect(ip, port, timeout):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    try:
        s.connect(("127.0.0.1", 9050))
        s.sendall(b"\x05\x01\x00")            # ver5, NMETHODS=1, NO AUTH
        r = s.recv(2)
        if r != b"\x05\x00":
            return (port, "PROXY_AUTH_FAIL")
        req = b"\x05\x01\x00\x01" + socket.inet_aton(ip) + struct.pack(">H", port)
        s.sendall(req)
        r = s.recv(10)
        if len(r) < 2:
            return (port, "FILTERED(tor-hndshk)")
        code = r[1]
        m = {0:"OPEN",1:"FILTERED(general)",2:"BLOCKED(exit-policy)",
             3:"FILTERED(net-unreach)",4:"BLOCKED(host-unreach)",
             5:"CLOSED(refused)",6:"FILTERED(ttl)",7:"CLOSED(unsupported)"}
        if code in m:
            return (port, m[code])
        return (port, f"FILTERED(code{code})")
    except socket.timeout:
        return (port, "FILTERED(timeout)")
    except Exception as e:
        return (port, f"ERR({type(e).__name__})")
    finally:
        try:
            s.close()
        except:
            pass

lock = threading.Lock()

def scan_target(ip, ports, max_conns, tag=""):
    fname = f"portmap{'_'+tag if tag else ''}_{ip}.txt"
    newf = not (path.isfile(fname) if (path := __import__("os").path) else False)
    out = open(fname, "a")
    if newf:
        out.write(f"# scan-start {ip} {time.strftime('%FT%TZ')} tmo={TMO}s conns={max_conns} (Tor socks5h 9050)\n")
    out.flush()
    def fut_only(p):
        return sock5_connect(ip, p, TMO)
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_conns) as ex:
        for i, res in enumerate(ex.map(fut_only, ports)):
            port, status = res
            if not status.startswith("CLOSED"):
                out.write(f"{ip} {port} {status}\n"); out.flush()
            if i % 500 == 0:
                with lock:
                    out.write(f"# progress {ip} {i} {time.strftime('%FT%TZ', time.gmtime())}\n"); out.flush()
    out.write(f"# scan-end {ip} {time.strftime('%FT%TZ')}\n"); out.flush()
    out.close()
    print(f"DONE {ip}")

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "ports":
        ip, pf, mc = sys.argv[2], sys.argv[3], int(sys.argv[4])
        TMO = int(sys.argv[5]) if len(sys.argv) > 5 else TMO
        with open(pf) as f:
            ports = [int(x) for x in re.split(r"[,\s]+", f.read()) if x.strip()]
        scan_target(ip, ports, mc)
    elif mode == "range":
        ip, a, b, mc = sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
        TMO = int(sys.argv[6]) if len(sys.argv) > 6 else TMO
        scan_target(ip, range(a, b + 1), mc)
    elif mode == "list":
        ips, pl, mc = sys.argv[2], sys.argv[3], int(sys.argv[4])
        TMO = int(sys.argv[5]) if len(sys.argv) > 5 else TMO
        ports = [int(x) for x in pl.split(",")]
        with open(ips) as f:
            hosts = [l.split()[0] for l in f if l.strip()]
        for h in hosts:
            scan_target(h, ports, mc)
