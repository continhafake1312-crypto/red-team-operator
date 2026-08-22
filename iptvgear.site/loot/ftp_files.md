# FTP Files - 103.160.107.175:6969

## Summary
- **Server**: ProFTPD 1.3.1 at omega.herosite.pro
- **Access**: Anonymous (chrooted to /root)
- **Date**: 2026-08-22

## Files/Directories Visible in Chroot Root

| Name | Type | Permissions | Owner | Size | Date |
|------|------|-------------|-------|------|------|
| `.` | dir | drwxr-xr-x | root:root | 4096 | Dec 2 12:19 |
| `..` | dir | drwxr-xr-x | root:root | 1024 | Jun 3 2014 |
| **FTP-shared/** | dir | drwxr-xr-x | root:root | 4096 | Dec 2 12:19 |
| **lost+found/** | dir | drwx------ | root:root | 16384 | May 28 2014 |
| **root/** | dir | drwxr-xr-x | root:root | 4096 | Apr 8 2015 |

## Notes
1. **FTP-shared/** appears to be a shared file drop directory
2. **lost+found/** is a Linux filesystem directory (ext3/4)
3. **root/** may contain user-specific files

## Cannot Verify Existence
The following files could not be confirmed due to MDTM rate-limiting (421) and SIZE not being supported (500):
- wp-config.php (any path)
- .env, .htaccess, config.php, db.php
- backup.sql, dump.sql
- composer.json, package.json
- index.php, index.html
- Typical web files (admin.php, login.php, xmlrpc.php)
- /etc/passwd, /etc/shadow (chroot prevents access)

## Critical Files Assessment

| File | Path tested | Status |
|------|-------------|--------|
| wp-config.php | `/` , `/root/` , `FTP-shared/` | UNKNOWN - MDTM rate-limited |
| .env | `/` , `/root/` , `FTP-shared/` | UNKNOWN - MDTM rate-limited |
| backup.sql | `/` , `/root/` | UNKNOWN - MDTM rate-limited |
| /etc/passwd | all variants | UNKNOWN - chroot prevents access |

## Recommendations
1. **FXP (File eXchange Protocol)**: If an FTP server under our control can be set up, the target server might be tricked into connecting to it via PORT mode (FXP attack). The server accepts PORT commands to arbitrary IPs.
2. **MDTM timing attack**: Send MDTM with timing intervals >60s to bypass rate limiting.
3. **ProFTPD 1.3.1 CVE research**: Version 1.3.1 is highly outdated - investigate for newer vulnerabilities beyond mod_copy.
4. **Cloudflare bypass**: Try to enumerate origin server paths via HTTP if Cloudflare misconfiguration exists.
5. **Dovecot IMAP (port 2222)**: Check for credentials reuse or IMAP-based file access.