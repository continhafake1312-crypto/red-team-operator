#!/usr/bin/env python3
"""banner_socks.py — soft banner grab for OPEN ports via Tor SOCKS5 (recon-active focusconcursos).
For each '<ip> <port> OPEN' line in given portmap files: TCP connect, read up to 256 bytes, classify.
NO authentication attempts, NO data sent (except TLS ClientHello for 587/465-style nop — none: plain recv).
Writes banner_results.txt and appends '#SERVICE ...' notes to the source portmap file.
"""
import socket, struct, sys, time, re, os

def socks_connect(ip, port, timeout=8):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    s.connect(("127.0.0.1", 9050))
    s.sendall(b"\x05\x01\x00")
    r = s.recv(2)
    if r != b"\x05\x00":
        raise RuntimeError("proxy_auth")
    req = b"\x05\x01\x00\x01" + socket.inet_aton(ip) + struct.pack(">H", port)
    s.sendall(req)
    r = s.recv(10)
    if len(r) < 2 or r[1] != 0:
        raise RuntimeError("no_connect code=%s" % (r[1] if len(r) > 1 else "?"))
    return s

def classify(b):
    txt = b.decode("utf-8", "replace")
    low = txt.lower()
    if b.startswith(b"SSH-"):
        return "SSH: " + txt.split("\n")[0].strip()
    if low.startswith("* ok"):
        return "IMAP: " + txt.splitlines()[0].strip()
    if low.startswith("mysql") or b"\x00mysql" in b:
        mm = re.search(r"(\d+\.\d+\.[\w.-]+)", txt)
        return "MySQL: " + (mm.group(1) if mm else "?")
    if len(b) > 12 and b[4] <= 0x10:
        mm = re.match(r"^(\d+\.\d+\.\d+)", txt[5:])
        if mm:
            return "MySQL-proto: " + mm.group(1)
    if low.startswith("+ok"):
        return "POP3: " + txt.splitlines()[0].strip()
    if low.startswith("220"):
        return "SMTP/FTP: " + txt.splitlines()[0].strip()
    if low.startswith("http/"):
        return "HTTP: " + txt.splitlines()[0].strip()
    if low.startswith("-err"):
        return "Redis: " + txt.replace("\r\n", " ").strip()[:80]
    if b.startswith(b"\x16\x03"):
        return "TLS-greeting (first bytes) " + b[:16].hex()
    if b.startswith(b"\x03\x00\x00"):
        return "RDP-MSRDP"
    return "RAW: " + " ".join("%02x" % c for c in b[:20])

def grab(ip, port):
    try:
        s = socks_connect(ip, port, 10)
    except Exception as e:
        return "CONNECT_FAIL(%s)" % type(e).__name__
    try:
        s.settimeout(7)
        b = s.recv(256)
        if not b:
            return "NO-BANNER(silent-open)"
        return classify(b)
    except socket.timeout:
        return "NO-BANNER(timeout)"
    except Exception as e:
        return "ERR(%s)" % type(e).__name__
    finally:
        s.close()

def main(files):
    out = open("banner_results.txt", "a")
    out.write(f"# banner-grab start {time.strftime('%FT%TZ')} via Tor socks5h; recv-only, no auth\n")
    out.flush()
    seen = set()
    hits = []
    for f in files:
        for line in open(f).read().splitlines():
            m = re.match(r"^(\d+\.\d+\.\d+\.\d+) (\d+) OPEN", line)
            if not m:
                continue
            ip, port = m.group(1), int(m.group(2))
            if (ip, port) in seen:
                continue
            seen.add((ip, port))
            if port in (80, 443):
                continue  # already documented via whatweb/httpx/tls probes
            hits.append((f, ip, port))
    for f, ip, port in hits:
            res = grab(ip, port)
            line = f"#SERVICE {ip} port={port} banner: {res} [{time.strftime('%FT%TZ')}]\n"
            out.write(line); out.flush()
            # append service note to portmap file
            with open(f, "a") as pm:
                pm.write(f"#SERVICE {ip} {port} {res} [{time.strftime('%FT%TZ')}]\n")
            print(line.strip())
    out.write(f"# banner-grab end {time.strftime('%FT%TZ')}\n")
    out.close()

if __name__ == "__main__":
    main(sys.argv[1:])
