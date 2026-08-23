# PASSIVE RECONNAISSANCE REPORT — genhubs.com

**Date:** 2026-08-23  
**Tools:** subfinder, amass, assetfinder, dnsx, httpx, whatweb, theHarvester, waybackurls, dnsrecon, urlscan.io, GitHub API, Discord API, WHOIS, dig, curl  

---

## 1. NUMERICAL SUMMARY

| Metric | Count |
|---|---|
| Subdomains found (total unique) | **4** |
| Subdomains resolved (with IPs) | **4** |
| Live hosts (HTTP/HTTPS responding) | **4** |
| Origin IPs (non-CDN) | **1** (156.67.222.30 — AS47583 Hostinger, SG) |
| Cloudflare IPs | 104.26.12.132, 104.26.13.132, 172.67.73.143 |
| Wayback URLs found | **0** |
| Emails discovered | **0** |
| People/contacts mapped | **2** (instantsx, GitHub users) |
| Cloud buckets found | **0** |
| Subdomain takeover candidates | **0** |
| GitHub repos with secrets | **0** |

---

## 2. SUBDOMAINS & DNS

### Found Subdomains
| Subdomain | Status | IP | Tech |
|---|---|---|---|
| `genhubs.com` | 200 OK | 104.26.12.132 | Cloudflare, Next.js, React, Node.js, webpack |
| `beta.genhubs.com` | 526 Invalid SSL | 172.67.73.143 | Cloudflare |
| `rb.genhubs.com` | 520 Unknown error | 104.26.12.132 | Cloudflare |
| `z.genhubs.com` | 502 Bad gateway | 104.26.13.132 | Cloudflare |

### DNS Records
- **Nameservers:** dilbert.ns.cloudflare.com / kristin.ns.cloudflare.com
- **MX Records:** NONE
- **TXT/SPF/DMARC/DKIM:** NONE
- **CNAME Records:** NONE
- **Zone Transfer:** Blocked (Cloudflare)
- **DNSSEC:** unsigned

### Origin IPs (outside Cloudflare)
- **156.67.222.30** — AS47583 (Hostinger), Singapore. Hosts: maruai789.com, interstaruae.com, truemoversandpackers.com, etc. No direct HTTP response (timeout). Possibly legacy origin server or unrelated shared hosting.

---

## 3. TECH STACK PER HOST

### genhubs.com (main)
- **Server:** Cloudflare (reverse proxy)
- **Framework:** Next.js (React, Node.js)
- **X-Powered-By:** Next.js
- **Build tool:** webpack with Turbopack
- **CDN/Proxy:** Cloudflare with Network Error Logging (NEL)
- **Title:** "Genhubs - Roblox Cookie & Tools"
- **Favicon hash (mmh3):** -2126873921

### Subdomains (beta, rb, z)
- All behind Cloudflare only
- No additional tech fingerprint (all return error pages)
- Favicon hashes vary: -1926939057, 1829540431, -152616661

---

## 4. OSINT HIGHLIGHTS

### Business Profile
- **Domain:** "Genhubs - Roblox Cookie & Tools"
- **Purpose:** Roblox account cookie theft/trading platform
- **Monetization:** Sells tools/services via `/api/shop` endpoint
- **Site features:** Cookie checker, cookie IP-lock bypass, account recovery, account face-unlock, combo formatter, email account adder, auto solve captcha, reativo tool

### Discord Community
- **Server:** "Gen Hub" (discord.gg/RaSp35KHbf)
- **Inviter:** `instantsx#0`
- **Features:** COMMUNITY, AGE_VERIFICATION_LARGE_GUILD, NEWS, TIERLESS_BOOSTING
- **Primary channel:** moderator-only

### Persons of Interest
| Handle | Platform | Notes |
|---|---|---|
| `instantsx` | Discord / GitHub | Discord server inviter, GitHub user |
| `Instantxs` | GitHub | Similar handle, likely same person |

### Emails Found
None directly discovered via passive sources. Site obfuscates contact behind Discord and GoDaddy privacy WHOIS.

### Breach Intelligence
- No emails extracted to check against breach databases
- Site business model (Roblox cookie theft) suggests involvement in credential-stuffing ecosystems
- theHarvester HaveIBeenPwned module failed (no API key)

---

## 5. INTERESTING ENDPOINTS (from SPA source)

### Dashboard routes (client-side, Next.js SPA)
```
/dashboard/account-face-unlock
/dashboard/account-recovery
/dashboard/combo-fomatter
/dashboard/cookie-checker
/dashboard/cookie-ip-lock-bypass
/dashboard/cookie-logout
/dashboard/email-account
/dashboard/reactive
/services/auto-solve-captcha
/tools/extension-solve-captcha
```

### API endpoints (discovered from source)
```javascript
fetch("/api/shop")     // POST - product listing/purchase
headers["x-csrf-token"]  // CSRF protection using cookie
```

### External services
- **Discord:** https://discord.com/invite/RaSp35KHbf
- **Favicon:** /favicon.ico?favicon.7bd78564.ico

---

## 6. CLOUD / TAKEOVER CANDIDATES

**Result:** NONE found

All tested bucket name variations for S3, Azure Blob, and GCP returned 403/404. No accessible storage endpoints identified.

No CNAME records exist for any subdomain, eliminating dangling CNAME takeover vectors.

---

## 7. WAYBACK MACHINE HIGHLIGHTS

**Result:** No historical data available.

The Wayback Machine returned zero snapshots for genhubs.com. Possible reasons:
- Domain registered 2023-01-18 (relatively new)
- Robots.txt may block crawling
- Cloudflare challenge pages prevent archiving

---

## 8. ADDITIONAL OBSERVATIONS

### GitHub Code/Repos
- No direct code references to `genhubs.com` found on GitHub
- Search for "genhubs" returns unrelated projects (different "GenHub" platforms)
- No leaked credentials, API keys, or configs found

### URLScan.io
- 9 results found
- Associated domains: maruai789.com (same IP: 156.67.222.30)
- All scans show Cloudflare-protected responses

### Security Headers
- Server: cloudflare
- X-Powered-By: Next.js
- CF-Ray: present (CDN node identification)
- Cloudflare challenge platform active (JS challenge on /cdn-cgi/)

### CSRF Protection
- Uses cookie-based CSRF token (`csrf-token`)
- Token sent as `x-csrf-token` header on POST requests

---

## 9. LIMITATIONS & CONSTRAINTS

| Limitation | Impact |
|---|---|
| Cloudflare WAF | Blocks automated scanning, rate limits API calls |
| GoDaddy WHOIS privacy | No registrant contact details |
| No Wayback data | No historical endpoint/parameter discovery |
| Missing API keys (Shodan, Censys, VirusTotal, etc.) | Reduced OSINT depth |
| theHarvester missing keys | Many modules disabled |
| Tor/proxychains4 latency | Slower scans, some timeouts |
| Site is SPA (Next.js) | Traditional crawlers get 404 on API-like paths |

---

## 10. RECOMMENDED NEXT STEPS (Active Recon)

1. **Bypass Cloudflare** using 2captcha (key available, balance $1.14) for direct origin IP discovery
2. **Port scan** origin IP 156.67.222.30 (if reachable) for exposed services
3. **Brute-force subdomains** with larger wordlists (ffuf, gobuster, puredns via Cloudflare-aware resolvers)
4. **Enumerate API endpoints** via JS file analysis (fetch all Next.js chunks, extract routes)
5. **Test for IDOR/broken auth** in `/api/shop` and dashboard endpoints
6. **Discord server recon** — join the Gen Hub server, observe traffic, gather member info
7. **Social engineering** — engage via Discord to extract tech stack details and personnel
8. **Check Pastebin/paste sites** for leaked genhubs databases or credentials
9. **Investigate AS47583 (Hostinger)** — scan 156.67.222.0/24 for adjacent servers
10. **SSL certificate transparency** — monitor crt.sh for new certificates (currently empty)