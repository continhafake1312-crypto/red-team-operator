# ACTIVE RECON — apsv-iptv.duckdns.org

**Date:** 2026-08-22T22:00-22:15Z  
**Analyst:** recon-active (automated)  
**OPSEC:** proxychains4 (Tor exit: 192.42.116.60, Netherlands)

---

## 1. HOST 1: 56.125.111.53 (apsv-iptv.duckdns.org — Main Target)

**AWS EC2** (sa-east-1, São Paulo), hostname: `ec2-56-125-111-53.sa-east-1.compute.amazonaws.com`

### Port Scan (Full TCP - rustscan + nmap -sV -sT)
| Port | State | Service | Version |
|------|-------|---------|---------|
| 22/tcp | OPEN | SSH | OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 |
| 80/tcp | OPEN | HTTP | nginx 1.24.0 (Ubuntu) → redirect to HTTPS |
| 443/tcp | OPEN | HTTPS | nginx 1.24.0 (Ubuntu) |

### UDP Scan (top 50)
- No open UDP ports detected (all filtered/no-response - typical AWS)

### Web Stack
- **Server:** nginx 1.24.0 (Ubuntu)
- **Framework:** Next.js (Build ID: mrsgR3tjtoUyPea4KRSkS)
- **Runtime:** Node.js
- **Frontend:** React + webpack + Capacitor.js (mobile wrapper)
- **Backend:** REST API with JWT auth
- **Analytics:** PostHog (self-hosted), Google Tag Manager (GTM-N9FW87DM)
- **Error Tracking:** Sentry

### TLS Assessment
| Property | Value |
|----------|-------|
| Certificate CN | testandoem.duckdns.org (Let's Encrypt) |
| SAN | DNS:testandoem.duckdns.org |
| Public Key | EC P-256 (ECDSA) |
| Signature | ecdsa-with-SHA384 |
| Valid | 2026-08-22 to 2026-11-20 |
| TLS 1.2 Ciphers | ECDHE-ECDSA-AES128-GCM-SHA256, ECDHE-ECDSA-AES256-GCM-SHA384, ECDHE-ECDSA-CHACHA20-POLY1305 |
| TLS 1.3 Ciphers | TLS_AKE_AES128_GCM_SHA256, TLS_AKE_AES256_GCM_SHA384, TLS_AKE_CHACHA20_POLY1305 |
| Min TLS Version | TLS 1.2 (no 1.0/1.1) |
| Heartbleed | Not vulnerable |
| Cipher Strength | ALL A-rated |
| Cipher Preference | Client (not server) |

### WAF Detection
- **No WAF detected** — direct origin access (no Cloudflare, no WAF)

### Vhost Fuzzing
- **0 unique vhosts found** — all subdomains return identical response (DuckDNS wildcard)
- Nginx only responds to configured Host headers

### Security Headers (Good)
| Header | Value |
|--------|-------|
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| X-XSS-Protection | 1; mode=block |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |
| Content-Security-Policy | Strict (self + GTM + Clarity + PostHog + fonts) |
| Cache-Control | s-maxage=60, stale-while-revalidate |

### Rate Limiting
- X-RateLimit-Limit: 10000
- X-RateLimit-Reset: 26s

### Findings
1. **OpenSSH 9.6p1 exposed** — Port 22 accessible from Internet. Recent version but worth monitoring for CVEs
2. **No WAF** — Direct origin access enables unrestricted probing
3. **TLS cert mismatch** — Cert issued to `testandoem.duckdns.org` (different domain). Possibly the same DuckDNS account or shared IP
4. **Rate limit reasonable** — 10k req/26s window allows moderate brute-force

---

## 2. HOST 2: 162.214.99.39 (telaviva.com.br — WordPress / Bluehost / Teletime)

**Hostname:** `dedi-4639510.teletime.com.br`

### Port Scan (Full TCP - rustscan + nmap -sV -sC)
| Port | State | Service | Version |
|------|-------|---------|---------|
| 21/tcp | OPEN | FTP | Pure-FTPd (TLS enabled, user 2/50) |
| 26/tcp | OPEN | SMTP | Exim smtpd 4.99.5 |
| 53/tcp | OPEN | DNS | NSID: dedi-4639510.teletime.com.br |
| 80/tcp | OPEN | HTTP | nginx (WordPress) |
| 110/tcp | OPEN | POP3 | Dovecot pop3d |
| 143/tcp | OPEN | IMAP | Dovecot imapd (CAPA: AUTH=PLAIN, LOGIN) |
| 443/tcp | OPEN | HTTPS | nginx (WordPress + cPanel) |
| 465/tcp | OPEN | SMTPs | Exim smtpd 4.99.5 |
| 587/tcp | OPEN | SMTP | Exim smtpd 4.99.5 (submission) |
| 993/tcp | OPEN | IMAPs | Dovecot imapd |
| 995/tcp | OPEN | POP3s | Dovecot pop3d |
| 2082/tcp | OPEN | cPanel | nginx (infowave) |
| 2083/tcp | OPEN | cPanel SSL | nginx (radsec) — "Login do cPanel" |
| 2086/tcp | OPEN | WHM | nginx (gnunet) |
| 2087/tcp | OPEN | WHM SSL | nginx (eli) — "Login no WHM" |
| 2095/tcp | OPEN | cPanel Webmail | nginx (nbx-ser) |
| 2096/tcp | OPEN | cPanel Webmail SSL | nginx (nbx-dir) |
| 22022/tcp | OPEN | SSH | OpenSSH 7.4 (protocol 2.0) — custom port |

### Web Stack (telaviva.com.br)
- **CMS:** WordPress (news portal: "TELA VIVA News")
- **Server:** nginx
- **Plugins:** WP Rocket 3.21.3, Rank Math SEO, Contact Form 7, Akismet, Complianz (GDPR), Google Site Kit, Performance Lab, TagDiv theme
- **PHP:** 7.4 or 8.3+
- **Database:** MySQL/MariaDB
- **CDN:** telaviva.b-cdn.net (BunnyCDN, pull zone 2489850)

### cPanel/WHM (CRITICAL — exposed admin panels)
| Service | URL | Status |
|---------|-----|--------|
| cPanel | https://cpanel.telaviva.com.br:2083 | 200 OK — "Login do cPanel" |
| WHM | https://whm.telaviva.com.br:2087 | 200 OK — "Login no WHM" |
| Webmail | https://webmail.telaviva.com.br:2096 | 200 OK — RoundCube |
| phpPgAdmin | Referenced in whatweb (via WHM) | Potentially exposed |

### TLS Assessment
- Same Let's Encrypt cert across all subdomains (dedi-4639510.teletime.com.br SANs)
- TLS via nmap timed out through proxychains — full assessment pending

### WAF Detection
- **No WAF detected** — origin directly accessible

### SMTP Banners (Information Disclosure)
- **Exim 4.99.5** — version disclosed in banners
- **Commands:** AUTH STARTTLS HELO EHLO MAIL RCPT DATA BDAT NOOP QUIT RSET HELP
- **LIMITS:** MAILMAX=1000, RCPTMAX=50000

### FTP
- **Pure-FTPd** with TLS — anonymous login: 530 (requires auth)

### Findings — CRITICAL
1. **cPanel/WHM exposed to Internet** — Ports 2083/2087 accessible from anywhere. Brute-force / default creds risk
2. **phpPgAdmin referenced** — potential database admin exposure
3. **Exim 4.99.5** — Check for known CVEs (many historical Exim vulns)
4. **OpenSSH 7.4** — Older version (released 2016). Multiple CVEs since
5. **WordPress plugins** — WP Rocket 3.21.3, Contact Form 7 — check for known vulns
6. **xmlrpc.php exposed** — WordPress XML-RPC brute-force vector
7. **FTP (21) and all mail services (25,110,143,587,993,995) exposed** — broad attack surface
8. **DNS (53/tcp)** — Zone transfer risk assessment needed

---

## 3. HOST 3: 51.116.99.197 (telaviva.net — OUT OF SCOPE)

**NOT a TelaViva property.** This GoDaddy-hosted domain serves a different website.

| Port | Service | Version |
|------|---------|---------|
| 80/tcp | HTTP | Microsoft IIS 10.0 |
| 443/tcp | HTTPS | Microsoft-HTTPAPI/2.0 |

- **TLS Cert:** `checkin.icreate-campaign.com` (Let's Encrypt) — unrelated
- **Title (port 80):** Hebrew characters (יום פהוא) — unrelated site
- **Title (port 443):** "Not Found"
- **Conclusion:** De-prioritize. Not part of TelaViva infra. Possibly parked/sinkholed.

---

## 4. SERVICE PROBING SUMMARY

### 162.214.99.39 — Service Banners
| Service | Banner/Info |
|---------|-------------|
| FTP (21) | Pure-FTPd [privsep] [TLS] — "You are user 2 of 50" |
| SMTP (26) | Exim 4.99.5 — "We do not authorize the use of this service to send unsolicited email" |
| SMTP (587) | Exim 4.99.5 — same as 26 |
| POP3 (110) | Dovecot ready |
| IMAP (143) | Dovecot — CAPA: AUTH=PLAIN, LOGIN, STARTTLS |
| DNS (53) | NSID: dedi-4639510.teletime.com.br |
| SSH (22022) | OpenSSH 7.4 |

### 56.125.111.53 — Service Banners
| Service | Banner/Info |
|---------|-------------|
| SSH (22) | OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 |

---

## 5. SCREENSHOTS

Saved to `recon/active/screenshots/`:
- `https---apsv-iptv.duckdns.org-443.jpeg` (TelaViva IPTV landing page)
- `https---telaviva.com.br-443.jpeg` (WordPress news portal)
- `https---cpanel.telaviva.com.br-443.jpeg` (cPanel Login page)
- `https---whm.telaviva.com.br-443.jpeg` (WHM Login page)

---

## 6. ARTIFACTS GENERATED

| File | Description |
|------|-------------|
| `rustscan_56.125.111.53.txt` | Full TCP port scan + nmap -sV -sC |
| `rustscan_162.214.99.39.txt` | Full TCP port scan + nmap -sV -sC |
| `rustscan_51.116.99.197.txt` | Full TCP port scan (host down) |
| `nmap_deep_56.125.111.53.txt` | nmap -sT -sV -sC on open ports |
| `nmap_deep_162.214.99.39.txt` | nmap -sT -sV -sC on open ports |
| `nmap_deep_51.116.99.197.txt` | nmap -sT -sV -sC on open ports (+Pn) |
| `nmap_ssh_56.125.111.53.txt` | nmap -sV on 22,80,443 |
| `tls_56.125.111.53.txt` | TLS cert + cipher enumeration |
| `tls_162.214.99.39.txt` | TLS cert + cipher enumeration |
| `tls_51.116.99.197.txt` | TLS cert + cipher enumeration |
| `wafw00f_all.txt` | WAF detection (no WAF found) |
| `vhosts_56.125.111.53.json` | Vhost fuzzing (0 results - wildcard) |
| `vhosts_56.125.111.53.txt` | Vhost fuzzing log |
| `services_162.214.99.39.txt` | Service banners (FTP, SMTP, IMAP, POP3, SSH) |
| `whatweb_all.txt` | whatweb fingerprinting |
| `screenshots/` | Gowitness screenshots (4 hosts) |