# PASSIVE Recon Report — marketroblox.store

**Date:** 2026-08-24 UTC
**Target:** https://marketroblox.store (+ https://marketroblox.com)
**OPSEC:** Tor (107.189.7.168) via proxychains4

---

## 1. Domain Overview

| Attribute | Value |
|-----------|-------|
| Registrant | Privacy (Withheld for Privacy ehf, Iceland) |
| Registrar | NameCheap, Inc. |
| Created | 2026-07-05 (.store) / 2026-08-01 (.com) |
| Expires | 2027-07-05 / 2027-08-01 |
| Nameservers | jaziel.ns.cloudflare.com / pearl.ns.cloudflare.com |
| DNSSEC | Unsigned |
| WHOIS Privacy | Full (redacted) |

**Key finding:** `.store` domain is a 301 redirect to `.com`. The real site is `marketroblox.com`.

---

## 2. DNS Records

| Record | Value |
|--------|-------|
| NS | jaziel.ns.cloudflare.com, pearl.ns.cloudflare.com |
| MX | **None** — no mail servers configured |
| TXT | **None** — no SPF, DMARC, DKIM |
| SOA | jaziel.ns.cloudflare.com. dns.cloudflare.com. |
| AXFR | Failed (Cloudflare — expected) |
| CNAME | **None** — all A records direct to Cloudflare |

**Takeaway:** No email infrastructure. No SPF/DMARC means email spoofing possible if MX added. No DNS security posture.

---

## 3. Subdomain Enumeration

### Sources
- **subfinder:** 9 subdomains
- **assetfinder:** 10 subdomains (+ root)
- **amass:** 3 resolved, AS13335 identified
- **crt.sh:** 502 error (Tor/Crloud blocked)

### Total: 26 unique subdomains discovered

### Resolving (Live) — 5 hosts

| Subdomain | IPs | HTTP Status | Tech |
|-----------|-----|-------------|------|
| marketroblox.store | 104.21.95.93, 172.67.144.20 | 301 → marketroblox.com | Cloudflare |
| bot.marketroblox.store | 104.21.95.93, 172.67.144.20 | 526 SSL Error | Cloudflare |
| shopclonev7.marketroblox.store | 104.21.95.93, 172.67.144.20 | 526 SSL Error | Cloudflare |
| marketroblox.com | 104.21.24.108, 172.67.218.86 | 200 OK | **PHP 7.4.33, Bootstrap** |
| www.marketroblox.com | 104.21.24.108, 172.67.218.86 | 200 OK | **PHP 7.4.33, Bootstrap** |

### Non-resolving (cPanel defaults, no A records)
- autodiscover, cpanel, cpcalendars, cpcontacts, mail, webdisk, webmail (both TLDs)
- vpn, ww1, _dc-mx.f586efbd11c2 (marketroblox.com only)

---

## 4. Real IPs / CDN

All traffic protected by **Cloudflare (AS13335)**. No origin IP bypass achieved.

| Logical | IPs | CDN |
|---------|-----|-----|
| marketroblox.store | 104.21.95.93, 172.67.144.20 | Cloudflare |
| marketroblox.com | 104.21.24.108, 172.67.218.86 | Cloudflare |

No historical DNS records found (domain < 1 month old). No SecurityTrails/Crtsh data.

---

## 5. Tech Stack (marketroblox.com)

### Backend
- **PHP 7.4.33** (X-Powered-By header) — outdated, EOL security support ended Nov 2022
- **PHPSESSID** cookie — PHP session management
- Custom marketplace application (likely Laravel/CodeIgniter-style routing)
- `/mod/` directory — custom module framework

### Frontend
- **Bootstrap**
- **jQuery 3.6.0** (also 1.12.4 present — compatibility mode)
- **Font Awesome**, Flaticon, Icofont
- **Slick Slider** (carousel)
- **Venobox** (lightbox)
- **Nice Select** (form enhancements)
- **SweetAlert2 v10.15.6**, Cute Alert, Simple Notify 1.0.4, Notyf
- **Flatpickr** (date picker)
- **Google Fonts**: Saira Semi Condensed

### Infrastructure
- **Cloudflare** (CDN, WAF, SSL termination)
- **jsDelivr** CDN for simple-notify

### Content
- **Multilanguage**: Chinese, Thai, English, Vietnamese
- **Currency**: VND, USD
- **Meta**: "MarketRoblox.com is a trusted marketplace for Roblox accounts, Blox Fruits accounts, gamepasses, and in-game items"

---

## 6. Sensitive Endpoints Found

| Endpoint | Status | Note |
|----------|--------|------|
| `/admin` | 302 | Redirects to login |
| `/api` | 301 | API endpoint exists |
| `/cpanel` | **200** | cPanel redirect page accessible |
| `/administrator` | 302 | Admin area |
| `/logs` | 302 | Log viewer? |
| `/error` | 302 | Error handler |
| `/debug` | 302 | Debug mode |
| `/` | 301 | API redirect |
| `/.env` | **403** | Exists but blocked |
| `/.git/config` | **403** | Exists but blocked |
| `/vendor/phpunit` | 403 | PHPUnit accessible (403 vs 404) |
| `/storage` | 404 | |
| `/config` | 404 | |
| `/backup` | 404 | |
| `/wp-admin` | 404 | Not WordPress |
| `/phpinfo.php` | 404 | |
| `/graphql` | 404 | |
| `/swagger` | 404 | |

**High-value targets for active recon:** `/admin`, `/cpanel`, `/.env`, `/.git/config`, `/api`

---

## 7. OSINT Findings

### Emails
- **WHOIS:** `9173630ba068479597dbf51d676342d1.protect@withheldforprivacy.com` (privacy protected, Iceland)
- **No emails found** in HTML/JS source of marketroblox.com
- **theHarvester:** Impacted by Tor rate limiting, no results beyond WHOIS

### GitHub
- **No public repositories** found (GitHub API requires authentication for code search)

### Google Dorks (recommended for manual)
```
site:marketroblox.com
site:marketroblox.store
"marketroblox" password
"marketroblox" config
"marketroblox" admin
"marketroblox" .env
ext:sql marketroblox
```

### Google Verification
- `RcpXozWDMlAZOM1bBa1rbTxHY914totSNjKukJwTmSg` (Google Search Console)

---

## 8. Cloud Storage Buckets

Checked variations on AWS S3 (us-east-1):
- marketroblox, marketroblox-assets, marketroblox-backup, marketroblox-storage
- marketroblox-dev, marketroblox-prod, marketroblox-files
- mktroblox, mktroblox-assets, robloxmarket

**All returned 404 — no open S3 buckets found.**

Note: Did not test Azure Blob (`marketroblox.blob.core.windows.net`) or GCP Storage buckets.

---

## 9. Takeover Assessment

| Check | Result |
|-------|--------|
| CNAME records | **None found** — all A records |
| Dangling DNS | **None** — no external CNAME targets |
| Risk Level | **Low** |

All subdomains point directly to Cloudflare A records (AS13335). No takeover opportunity identified.

---

## 10. Wayback Machine

- **No snapshots found** for either domain
- **Reason:** Both domains registered < 1 month ago (2026-07-05 / 2026-08-01)
- **Wayback URLs:** Empty

---

## 11. Favicon Hash

- **mmh3 hash:** 1921763431
- Used for Shodan/Censys correlation (no API keys configured for either)

---

## 12. Limitations / Caveats

| Limitation | Impact |
|------------|--------|
| **Cloudflare WAF** | Blocks many automated queries (526 errors, JS challenges) |
| **Tor rate limiting** | Slowed theHarvester, crt.sh returns 502 |
| **No Shodan API key** | Cannot perform favicon/port correlation |
| **No Censys API key** | Cannot search cert/IP data |
| **Domain age < 1 month** | No historical DNS, No Wayback, No crt.sh certs |
| **GitHub API unauthenticated** | Cannot search org/repos without token |
| **WHOIS privacy** | Registrant data redacted behind Icelandic proxy |

---

## 13. Executive Summary

- **Total subdomains discovered:** 26 (10 .store + 11 .com + 5 live)
- **Live hosts:** 5 (2 unique sites — .store redirect + .com main)
- **Origin IPs:** 4 Cloudflare IPs (no real origin bypassed)
- **Tech stack:** PHP 7.4.33, Bootstrap, jQuery, Cloudflare
- **OSINT:** Minimal — privacy protected, domain too new
- **Cloud buckets:** None found open
- **Takeover candidates:** None
- **Wayback:** Empty (domain too new)

### Key Attack Surface for Active Recon

| Priority | Target | Reason |
|----------|--------|--------|
| 🔴 HIGH | `/admin` | Admin panel login |
| 🔴 HIGH | `/cpanel` | cPanel login accessible |
| 🔴 HIGH | `/.env` + `/.git/config` | 403 (exists — may be bruteforceable?) |
| 🟡 MEDIUM | `/api` | API endpoint — test auth/IDOR |
| 🟡 MEDIUM | `/mod/` | Custom module framework |
| 🟡 MEDIUM | PHP 7.4.33 | EOL — known CVEs |
| 🟢 LOW | bot/shopclonev7 | 526 SSL errors — misconfigured |
| 🟢 LOW | Multilanguage/Currency | VND suggests Vietnam hosting? |

### Recommended Next Steps (Recon Ativo)
1. Port scan (nmap) on Cloudflare IPs + origin bypass attempts
2. Brute-force /.env and /.git paths
3. Discover vhosts/real origin IP
4. WAF detection (wafw00f)
5. FFUF content discovery on marketroblox.com
6. JS analysis of `/mod/js/main.js` and `/public/client/js/main.js`
7. Directory brute-force on `/admin`, `/api`, `/cpanel`
8. Test for CVEs on PHP 7.4.33 + SweetAlert2 10.15.6