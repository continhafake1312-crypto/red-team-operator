# Passive Reconnaissance Report: real-debrid.com

**Engagement:** alldebrid-com-real-debrid-com  
**Date:** 2026-08-22T18:25:00Z  
**Operator:** recon-passive specialist  

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total Subdomains Enumerated | 80 |
| Live HTTP/HTTPS Hosts | 73 |
| Unique Origin IPs | 35+ |
| Unique ASNs | 8 |
| Tech Stack Components | 5 |

---

## 1. DNS Enumeration & Subdomains

### Sources Used
- **subfinder**: 55 subdomains
- **amass (passive)**: 60+ subdomains + DNS relationships
- **assetfinder**: 0 additional
- **crt.sh**: Rate limited (429/502) - skipped
- **Consolidated**: 80 unique subdomains

### Subdomain Categories

| Category | Count | Examples |
|----------|-------|----------|
| Download CDN nodes | 45+ | `*.download.real-debrid.com` (geo-distributed) |
| API endpoints | 5 | `api.real-debrid.com`, `api-2`, `api-10` |
| App/Management | 8 | `app.real-debrid.com`, `app-2..10`, `my.real-debrid.com` |
| CDN/Static | 3 | `cdn.real-debrid.com`, `fcdn.real-debrid.com`, `stream.real-debrid.com` |
| Infrastructure | 9 | `gitlab`, `ns0`, `pve-etix3`, `status`, `mx1`, `mx2`, `dav`, `www`, `download` |

### Download CDN Geography (Live Hosts)
| Region | Subdomains | IPs | Provider |
|--------|------------|-----|----------|
| US-West (LAX) | lax1, lax5 | 143.244.49.165 | CDN77 (AS60068) |
| US-East (NYK) | nyk1 | 138.199.40.33 | CDN77 |
| US-Midwest (CHI) | chi1, chi4, chi7, chi8 | 212.102.58.115-121 | CDN77 |
| US-Dallas | dal1 | 79.127.231.131 | CDN77 |
| US-Denver | den1, den2 | 212.102.45.193-194 | CDN77 |
| US-Miami | mia1, mia5 | 156.146.42.164-165 | CDN77 |
| US-Seattle | sea1, sea2 | 138.199.12.145-146 | CDN77 |
| Canada (SCL) | scl1 | 79.127.209.209 | CDN77 |
| Brazil (SAO) | sao1 | 152.233.19.97 | CDN77 |
| France (HIT) | 20-23, 40-45, 4.torrents | 94.140.5.2-10, 54 | HITS (AS197816) / CDNEXT (AS212238) |
| Netherlands | cdn, my, www, api, app | 81.85.62.11, 18 | XTNETWORK (AS211571) |
| Hong Kong | hkg1 | 212.102.42.49 | CDN77 |
| Japan | tyo1 | 143.244.40.65 | CDN77 |
| Singapore | sgp1, sgpo1 | 138.199.46.113, 15.235.230.251 | CDN77 / OVH (AS16276) |
| Australia | syd1, syd3, syd4 | 79.127.135.145, 143.244.62.194-195 | CDN77 |
| Israel | tlv1 | 169.150.227.34 | CDN77 |
| South Africa | jnb1 | 169.150.246.137 | CDN77 |
| India | mum1, mum2 | 172.236.171.234, 172.236.181.67 | Linode (AS63949) |
| Romania | 123-4, 129-4 | 91.134.74.168, 175 | (unknown) |
| France (OVH) | 32.download | 46.166.189.129 | (unknown) |
| France (Online) | 101, 86.download | 162.19.37.147, 208 | Online.net |

---

## 2. Live Host Fingerprinting (httpx)

### Status Code Distribution
| Status | Count | Hosts |
|--------|-------|-------|
| 200 | 11 | API/App documentation endpoints |
| 302 | 2 | `www.real-debrid.com` → `real-debrid.com`, `status` → Better Uptime |
| 401 | 1 | `dav.real-debrid.com` (WebDAV - Basic Auth) |
| 403 | 57 | All download CDN nodes + `cdn.real-debrid.com` + `my.real-debrid.com` |
| 503 | 1 | `fcdn.real-debrid.com` (Fastly/Varnish) |

### Technology Stack

| Host Group | Technologies | Web Server |
|------------|--------------|------------|
| **Main Site** (`real-debrid.com`, `www`) | HSTS, Google Analytics (UA-13126051-2), jQuery, X-Frame-Options: SAMEORIGIN | N/A (hidden) |
| **API Docs** (`api*`, `app*`) | jQuery, X-Cached header | N/A (hidden) |
| **Download CDN** (`*.download`) | Lity 2.0 (lightbox library) | Lity 2.0 |
| **CDN** (`cdn.real-debrid.com`) | HTML5, generic error page | N/A |
| **Fastly CDN** (`fcdn.real-debrid.com`) | HTTP/3, Varnish | Varnish |
| **WebDAV** (`dav.real-debrid.com`) | Basic Auth | N/A |
| **Status Page** (`status.real-debrid.com`) | Better Uptime (SaaS), HSTS, HTTP/3, CSP, Feature-Policy | Better Stack |

### Key Findings
- **All download nodes return 403 Forbidden** - likely require authentication/token
- **API/App endpoints serve identical documentation** (296KB HTML, jQuery-based)
- **WebDAV endpoint (`dav`) requires Basic Auth** - potential for credential testing
- **Fastly CDN (`fcdn`)** returns 503 - misconfigured or rate limited
- **Status page** hosted on Better Uptime (Better Stack) - SaaS, low takeover risk

---

## 3. OSINT & Corporate Intelligence

### WHOIS
- **Registrar:** OVH sas (France)
- **Created:** 2009-07-18 (17+ years old)
- **Expires:** 2028-07-18
- **Registrant:** REDACTED FOR PRIVACY (Country: FR)
- **Nameservers:** ns0-ns4.real-debrid.com (self-hosted)

### DNS Security
- **SPF:** `v=spf1 mx ip4:94.140.4.8/31 ip4:81.85.62.8/31 ip6:2a10:13c0:ef1c::8 ip6:2a10:13c0:ef1c::9 ip6:2a10:13c0:ef2c::8 ip6:2a10:13c0:ef2c::9 ~all` (SoftFail - permissive)
- **DMARC:** `v=DMARC1; p=quarantine; rua=mailto:dmarc@real-debrid.com;` (Quarantine policy)
- **AXFR:** Failed (properly disabled)
- **DNSSEC:** Unsigned

### Email Intelligence
- **Contact email:** `support@real-debrid.com` (found in API docs)
- **DMARC reports:** `dmarc@real-debrid.com`
- **Registrar abuse:** `abuse@ovh.net`

### GitHub Recon
**20+ public repositories** referencing real-debrid API:
- Client libraries: Python, Node.js, Kotlin, Go
- Stremio addons, download managers, UI wrappers
- No hardcoded secrets/tokens found in code search
- Most are third-party integrations

### Favicon Hash (Shodan Correlation)
- **MD5:** `c9b5f41ff1f268ff3e442aeb35abdc90`
- Consistent across `real-debrid.com`, `api.real-debrid.com`
- Use for Shodan: `http.favicon.hash:c9b5f41ff1f268ff3e442aeb35abdc90`

---

## 4. Cloud Infrastructure & Buckets

### Cloud Provider Footprint
| Provider | ASN | Use Case |
|----------|-----|----------|
| **CDN77** (AS60068) | Primary CDN - 15+ download nodes globally |
| **HITS** (AS197816) | Core infrastructure (main IPs) |
| **CDNEXT** (AS212238) | Download nodes (94.140.5.0/24) |
| **XTNETWORK** (AS211571) | Core infrastructure (81.85.62.0/24) |
| **Akamai/Linode** (AS63949) | Mumbai nodes |
| **OVH** (AS16276) | Singapore (sgpo1), Registrar |
| **Fastly** | `fcdn.real-debrid.com` (w2.shared.global.fastly.net) |
| **Better Stack** | Status page hosting |

### S3/GCS/Azure Bucket Checks
**Tested 15 naming variations** across AWS (3 regions), Scaleway, Azure Blob, GCS:
- `real-debrid`, `realdebrid`, `real-debrid-{assets,backup,cdn,static,media,upload,files,data,logs,config,db,prod,stage,dev}`
- **Results:** All 404 (not found) or 403 (exists but private)
- **No public buckets discovered**

---

## 5. Subdomain Takeover Assessment

### CNAME Analysis
| Subdomain | CNAME Target | Risk |
|-----------|--------------|------|
| `status.real-debrid.com` | `statuspage.betteruptime.com` | **LOW** - Better Uptime SaaS, active |
| `fcdn.real-debrid.com` | `w2.shared.global.fastly.net` | **LOW** - Fastly shared, not claimable |
| `api-*.real-debrid.com` | `api.real-debrid.com` → `real-debrid.com` | **NONE** - Internal |
| `app-*.real-debrid.com` | `app.real-debrid.com` → `real-debrid.com` | **NONE** - Internal |
| `www.real-debrid.com` | `real-debrid.com` | **NONE** - Apex |
| `dav.real-debrid.com` | `real-debrid.com` | **NONE** - Apex |
| `my.real-debrid.com` | `real-debrid.com` | **NONE** - Apex |

**No vulnerable dangling CNAMEs found.**

### Notable Non-Resolving/Dead
- `gitlab.real-debrid.com` → Resolves to 94.140.4.19 but **port 443 closed/refused** (proxychains DNS issue)
- `stream.real-debrid.com` - Not probed (not in httpx results)
- `download.real-debrid.com` - Not probed (apex redirect?)

---

## 6. Wayback Machine Analysis

### CDX API Results
- **~2,000+ captured URLs** (mostly payment callback URLs with sensitive PII)
- **Historical endpoints:**
  - `/401.php` (2013) - Legacy error handler
  - `/403`, `/404` - Custom error pages
  - `/?lang=*` with CSRF tokens - Language selection
  - `/?RETURNMAC=*&hostedCheckoutId=*` - Payment processor callbacks (exposes transaction IDs)
  - `/.well-known/*` - Security.txt, OpenID, assetlinks (all 404)

### Sensitive Data Exposure
**Payment callback URLs in Wayback contain:**
- Transaction amounts (300-1600)
- Merchant references
- Card types (Visa/MasterCard/CB)
- Transaction IDs
- Country codes (USA, FRA, CAN, MEX, GBR, etc.)
- BIN prefixes (first 6 digits of cards)
- **Recommendation:** Request Wayback purge for payment URLs

### No Admin/Internal Endpoints Found
- No `/admin`, `/api/internal`, `/debug`, `/actuator`, `/.git`, `/.env` in archive

---

## 7. Attack Surface Summary

### High Priority Targets (Active Recon)
1. **`dav.real-debrid.com` (401 Basic Auth)** - WebDAV, credential testing
2. **`api.real-debrid.com` / `app.real-debrid.com`** - Public API docs, enumerate endpoints
3. **`gitlab.real-debrid.com`** - GitLab instance (port 443 closed, investigate)
4. **`my.real-debrid.com` (403)** - User portal, likely auth bypass opportunities
5. **Download CDN nodes** - Token/auth mechanism analysis

### Credentialed/Post-Auth Targets
- API token generation (documented in API docs)
- User dashboard (`my.real-debrid.com`)
- WebDAV access (`dav.real-debrid.com`)

### Infrastructure Targets
- **CDN77 edge nodes** - 35+ IPs, potential for cache poisoning, header injection
- **Fastly** (`fcdn`) - 503 error, investigate configuration
- **Self-hosted nameservers** - ns0-ns4.real-debrid.com

---

## 8. Artifacts Generated

| File | Description |
|------|-------------|
| `subdomains_all.txt` | 80 consolidated unique subdomains |
| `subdomains_live.txt` | 73 live HTTPS hosts |
| `dnsx.json` | Full DNS resolution (A, AAAA, CNAME) for all 80 |
| `httpx.json` | HTTP probe results with tech detect for 73 hosts |
| `tech_stack.txt` | Per-host technology fingerprint |
| `dns_full.txt` | WHOIS, MX, SPF, DMARC, NS, Netblocks, ASNs |
| `whois.txt` | Raw WHOIS output |
| `cname_records.txt` | CNAME chains for takeover analysis |
| `cloud_buckets.txt` | Cloud storage bucket checks (15 variations × 6 providers) |
| `wayback_cdx.json` | Wayback CDX API raw output |
| `wayback_sensitive.txt` | Empty (no sensitive paths found) |
| `github_repos.txt` | 20 GitHub repositories using real-debrid API |

---

## 9. Limitations & Gaps

1. **crt.sh** - Rate limited (429/502), certificate transparency data incomplete
2. **theHarvester** - Python dependency conflict (aiodns/pycares), OSINT emails/breaches not collected
3. **waybackurls** - No output (tool issue), used CDX API instead
4. **gitlab.real-debrid.com** - Port 443 unreachable via proxychains (DNS resolves to 94.140.4.19)
5. **Google dorks** - Not automated (requires browser/CAPTCHA handling)
6. **Shodan/Censys** - Queries not executed (requires API keys), favicon hash documented for manual query

---

## 10. Recommended Next Steps (Active Recon)

1. **Port scan** all 35+ origin IPs (nmap -sS -p- -T4)
2. **API enumeration** - Swagger/OpenAPI spec from `api.real-debrid.com`
3. **WebDAV brute force** - `dav.real-debrid.com` with common credentials
4. **Download token analysis** - Reverse engineer 403→200 auth flow on CDN nodes
5. **GitLab investigation** - Direct connect to 94.140.4.19:443 (bypass proxy)
6. **fcdn.debug** - Investigate Fastly 503, check for cache poisoning
7. **SPF/DMARC** - SoftFail SPF allows spoofing, test email delivery
8. **JS analysis** - Download and analyze API docs JS for hidden endpoints
9. **Payment callback cleanup** - Request Wayback removal of PII URLs

---

## Timeline Entry
```
2026-08-22T18:25:00Z | passive-recon | COMPLETE | real-debrid.com | 80 subs, 73 live, 35+ IPs, 8 ASNs, WebDAV auth, API docs, CDN77/Fastly, no takeover, payment PII in Wayback
```
