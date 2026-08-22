#!/usr/bin/env python3
"""Minimal FTP commands per connection to avoid rate limiting."""
import ftplib, time, socket

HOST = "103.160.107.175"
PORT = 6969
MAP = "/home/ubuntu/iptvgear.site/recon/active/ftp_filesystem.txt"

def log(msg=""):
    with open(MAP, "a") as f:
        f.write(msg + "\n")
    print(msg)

def single_cwd_stat(path):
    """One connection, one CWD, one STAT, done."""
    time.sleep(3)
    try:
        ftp = ftplib.FTP()
        ftp.connect(HOST, PORT, timeout=10)
        ftp.login("anonymous", "anonymous@test.com")
        
        if path:
            try:
                res = ftp.sendcmd(f"CWD {path}")
                log(f"CWD {path}: {res}")
            except Exception as e:
                log(f"CWD {path}: {e}")
                ftp.quit()
                return
        
        try:
            pwd = ftp.sendcmd("PWD")
            log(f"PWD: {pwd}")
        except:
            pass
        
        try:
            stat = ftp.sendcmd("STAT")
            log(f"STAT:\n{stat}")
        except Exception as e:
            log(f"STAT: {e}")
        
        ftp.quit()
    except Exception as e:
        log(f"Conn: {e}")

log(f"\n{'='*70}")
log("MINIMAL PER-CONNECTION TESTS")
log(f"{'='*70}")

# Test the entries we can see
for p in ['', 'FTP-shared', 'root', 'lost+found', 'FTP-shared/test']:
    single_cwd_stat(p)

# Try absolute paths
for p in ['/', '/etc', '/www', '/home', '/var/www', '/root']:
    single_cwd_stat(p)

# Test a few key MDTMs with 15s delay
log(f"\n{'='*70}")
log("TARGETED MDTM - 15s DELAY")
log(f"{'='*70}")

for f in ['wp-config.php', '.env', 'index.php', 'passwd', 'FTP-shared/test.txt']:
    time.sleep(15)
    try:
        ftp = ftplib.FTP()
        ftp.connect(HOST, PORT, timeout=10)
        ftp.login("anonymous", "anonymous@test.com")
        try:
            resp = ftp.sendcmd(f"MDTM {f}")
            log(f"MDTM {f}: {resp.strip()}")
        except Exception as e:
            log(f"MDTM {f}: {e}")
        ftp.quit()
    except Exception as e:
        log(f"Conn {f}: {e}")

log(f"\n{'='*70}")
log("DONE")
log(f"{'='*70}")