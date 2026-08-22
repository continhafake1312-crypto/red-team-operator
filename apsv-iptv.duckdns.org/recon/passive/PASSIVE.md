# PASSIVE RECON - apsv-iptv.duckdns.org

**Date:** 2026-08-22T21:38-22:00Z  
**Analyst:** recon-passive (automated)

---

## 1. DNS / WHOIS

### Target: apsv-iptv.duckdns.org
- **A Record:** `56.125.111.53` (Amazon AWS, US)
- **NS:** duckdns.org (free dynamic DNS)
- **No MX, no CNAME, no TXT (empty)**
- **No AXFR** (transfer not allowed)
- **DuckDNS wildcard:** All `*.apsv-iptv.duckdns.org` resolve to **same IP** (89 subdomains tested)

### Associated: telaviva.com.br (main brand domain)
- **A Record:** `162.214.99.39` (Unified Layer/Bluehost, US)
- **NS:** `ns1.teletime.com.br`, `ns2.teletime.com.br` (Teletime - Brazilian hosting)
- **MX:** Google Workspace (Gmail)
- **SPF:** includes multiple IPs/services
- **Subdomains:**
  - `www.telaviva.com.br` → telaviva.com.br
  - `cdn.telaviva.com.br` → `telaviva.b-cdn.net` (BunnyCDN, pull zone 2489850)
  - `mail.telaviva.com.br` → telaviva.com.br
  - `cpanel.telaviva.com.br` → 162.214.99.39 **(cPanel exposed!)**
  - `whm.telaviva.com.br` → 162.214.99.39 **(WHM exposed!)**
  - `webmail.telaviva.com.br` → 162.214.99.39
  - `ftp.telaviva.com.br` → 162.214.99.39

### Associated: telaviva.net
- **A Record:** `51.116.99.197` (GoDaddy, US)
- **NS:** GoDaddy (ns05/ns06.domaincontrol.com)
- **Created:** 2025-12-24 (new domain)

---

## 2. SUBDOMAINS

| Source | Count | Notes |
|--------|-------|-------|
| DNS brute (apsv-iptv) | 89 wildcard | All → 56.125.111.53 (DuckDNS wildcard) |
| DNS brute (telaviva.com.br) | 8 | cpanel, whm, webmail, ftp, cdn, mail, www, ftp |
| subfinder (apsv-iptv) | 0 | No results for DuckDNS |
| amass (apsv-iptv) | 0 | No passive assets |
| assetfinder (apsv-iptv) | 0 | No results |
| crt.sh | 0 | 502 Bad Gateway (Tor blocked) |
| theHarvester | 0 | Timed out |

**Total unique subdomains (apsv-iptv):** 1 host + 89 wildcard variants → single origin  
**Total unique subdomains (telaviva.com.br):** 8

---

## 3. LIVE HOSTS & TECH STACK

### Host 1: `https://apsv-iptv.duckdns.org` (56.125.111.53)
**Status:** ✅ 200 OK  
**Title:** "TelaViva - Filmes, Séries e TV ao Vivo sem Anúncios"  
**Server:** nginx/1.24.0 (Ubuntu)  
**Tech Stack:**
- Next.js (React framework) - Build ID: `mrsgR3tjtoUyPea4KRSkS`
- Node.js backend
- React + webpack frontend
- Capacitor.js (mobile app wrapper - iOS/Android)
- **Favicon mmh3 hash:** `2306000272` (signed: -1988967024)
- **APIs:** RESTful with JWT auth
- **Analytics:** PostHog (self-hosted), Google Tag Manager (GTM-N9FW87DM)
- **Error tracking:** Sentry
- **CDN/Bucket:** None detected (direct to origin)
- **Security headers:** HSTS, X-Frame-Options, X-Content-Type-Options, CSP (partial)

### Host 2: `https://telaviva.com.br` (162.214.99.39)
**Status:** ✅ 200 OK  
**Title:** "Home - TELA VIVA News"  
**Server:** nginx  
**Tech Stack:**
- **WordPress** (news portal covering audiovisual market)
- WP Rocket 3.21.3 (caching)
- Rank Math SEO
- Contact Form 7
- Akismet
- Complianz (GDPR)
- Google Site Kit
- Performance Lab
- TagDiv theme (Cloud Library/Composer)
- jQuery 3.7.1, Bootstrap
- PHP (requirements: 7.4 or 8.3+)
- MySQL/MariaDB
- **Security headers:** HSTS, X-Frame-Options, X-Content-Type-Options

### Host 3: `https://telaviva.b-cdn.net` (BunnyCDN edge)
**Status:** ✅ 200 OK  
**Server:** BunnyCDN  
**Pull Zone:** 2489850  
**Purpose:** CDN cache for telaviva.com.br WordPress assets

### Host 4: `https://telaviva.net` (51.116.99.197)
**Status:** Not probed in depth (new domain, GoDaddy)

---

## 4. OSINT

### Email addresses discovered
| Email | Context |
|-------|---------|
| contato@telaviva.com.br | RSS feed, SEO config, contact |
| fernando@telaviva.com.br | WP site (whatweb) |
| mariana@telaviva.com.br | WP site (whatweb) |
| patricia.linger@telaviva.com.br | WP site (whatweb) |
| danilo.paulo@teletime.com.br | Hosting staff (Teletime) |
| eduardo.vasconcelos@teletime.com.br | Hosting staff (Teletime) |
| henrique.juliao@teletime.com.br | Hosting staff (Teletime) |
| samuca@teletime.com.br | Hosting staff (Teletime) |
| comercial@teletime.com.br | Hosting staff (Teletime) |
| financeiro@teletime.com.br | Hosting staff (Teletime) |
| eventos@teletime.com.br | Hosting staff (Teletime) |
| pressi@pressi.com.br | Third-party |
| trafego@convergecom.com.br | Third-party |

### People (whatweb extraction from telaviva.com.br)
- Fernando (@telaviva.com.br)
- Mariana (@telaviva.com.br)
- Patricia Linger (@telaviva.com.br)
- Danilo Paulo (@teletime.com.br)
- Eduardo Vasconcelos (@teletime.com.br)
- Henrique Julião (@teletime.com.br)
- Samuel "Samuca" (@teletime.com.br)

### LinkedIn
- LinkedIn verification token found on telaviva.com.br TXT records

### GitHub
- No public repositories found for "telaviva" or "apsv-iptv"
- Reference found: `iptv-org.github.io/channels/br/TelaViva` (public IPTV channel list - not the target's own repo)

### Google Analytics / Tracking
- GA4 ID: `G-R0M3BHZV88`
- GTM ID: `GTM-N9FW87DM`
- PostHog endpoint: `https://app.posthog.com`
- Sentry (referenced in JS)
- Microsoft Clarity (from CSP)

---

## 5. CLOUD BUCKETS / CDN

### S3 Buckets (all 404 - no public exposure)
- `apsv-iptv[-*]` on AWS S3: All Not Found
- `telaviva[-*]` on AWS S3: All Not Found

### BunnyCDN
- `telaviva.b-cdn.net` (pull zone 2489850) - actively serving WP content
- CNAME: `cdn.telaviva.com.br` → `telaviva.b-cdn.net`

### Takeover Candidates
- **None found** - no dangling CNAMEs detected

---

## 6. WAYBACK MACHINE

- **apsv-iptv.duckdns.org:** No historical captures found (new/obscure domain)
- **56.125.111.53:** No captures on IP
- **telaviva.com.br:** Not queried (different target scope)

---

## 7. SENSITIVE ENDPOINTS DISCOVERED

### apsv-iptv.duckdns.org

#### API Endpoints (documented)
| Endpoint | Status | Auth | Notes |
|----------|--------|------|-------|
| `/api/health` | 200 | Public | Health check (DB, Redis, memory) |
| `/api/app/seo-config` | 200 | Public | SEO config (GA4, GTM, org info) |
| `/api/channels` | 401 | JWT | Channel listing |
| `/api/channels/live` | 401 | JWT | Live channels |
| `/api/channels/all` | 401 | JWT | All channels |
| `/api/vod` | 401 | JWT | VOD content |
| `/api/epg` | 401 | JWT | EPG data |
| `/api/payments` | 401 | JWT | Payment info |
| `/api/` | 404 | - | API root redirect |
| `/api/v1`, `/api/v2`, `/api/user`, `/api/auth`, etc. | 404 | - | Non-existent but return JSON |

#### Web Routes (from robots.txt)
| Route | robots.txt | Purpose |
|-------|-----------|---------|
| `/` | Allow | Landing page |
| `/filmes` | Allow | Movies catalog |
| `/series` | Allow | Series catalog |
| `/live-tv` | Allow | Live TV |
| `/baixar` | Allow | Download app |
| `/verificados` | Allow | Verified channels |
| `/blog` | Allow | Blog |
| `/filmes-dublados` | Allow | Dubbed movies |
| `/tv-online` | Allow | Online TV |
| `/canais-abertos` | Allow | Open channels |
| `/futebol-online` | Allow | Football live |
| `/privacidade` | Allow | Privacy policy |
| **`/admin`** | **Disallow** | Admin panel |
| **`/revendedor`** | **Disallow** | Reseller panel |
| **`/api/`** | **Disallow** | API endpoints |
| **`/perfil`** | **Disallow** | User profile |
| **`/login`** | **Disallow** | Login page |
| **`/register`** | **Disallow** | Registration |
| **`/reset-password`** | **Disallow** | Password reset |
| **`/forgot-password`** | **Disallow** | Forgot password |

#### JS-Discovered Routes (not in robots.txt)
| Route | Notes |
|-------|-------|
| `/auth/refresh` | Token refresh |
| `/channels/verification/stats` | Channel verification stats |
| `/channels/verified` | Verified channel list |
| `/i/v1/logs` | Internal logging endpoint |
| `/i/v1/metrics` | Internal metrics |
| `/config` | Configuration |
| `/watch/` | Watch page |
| `/replay/` | Replay page |

#### Rate Limiting
- `X-RateLimit-Limit: 10000`
- `X-RateLimit-Remaining: 9996` (fresh)
- `X-RateLimit-Reset: 26` seconds

#### API Response Pattern
```json
{"success":false,"statusCode":401,"message":"Token inválido ou expirado","timestamp":"..."}
```

### telaviva.com.br

#### WordPress Exposed Endpoints
| Endpoint | Status | Notes |
|----------|--------|-------|
| `/wp-json/` | 200 | REST API (namespaces: akismet, cf7, rank-math, wp-rocket, complianz, google-site-kit, tagdiv, performance-lab, optimization-detective, mcp) |
| `/xmlrpc.php` | 200 | XML-RPC exposed (brute-force vector) |
| `/wp-login.php` | 200 | Login page |
| `/wp-admin/` | 302 | Admin redirect |
| `/readme.html` | 200 | WP version info |
| `/license.txt` | 200 | GPL license |
| `/wp-content/` | 200 | Directory accessible |
| `/wp-content/plugins/` | 200 | Plugins dir |
| `/wp-content/themes/` | 200 | Themes dir |
| `/wp-content/upgrade/` | 301 | Upgrade dir |

---

## 8. ADDITIONAL OBSERVATIONS

### Infra Relationship
```
apsv-iptv.duckdns.org (Next.js IPTV app)
  → 56.125.111.53 (AWS, US)
  → Organization/App: TelaViva

telaviva.com.br (WordPress news portal)
  → 162.214.99.39 (Bluehost, US)
  → CDN: telaviva.b-cdn.net (BunnyCDN)
  → DNS/Hosting: Teletime (teletime.com.br)
  → Organization: TELA VIVA News

telaviva.net (parked/landing?)
  → 51.116.99.197 (GoDaddy, US)
```

### Interesting Notes
- **apsv-iptv** is the **IPTV application frontend** (Next.js SPA) with JWT-based authentication
- **telaviva.com.br** is the corporate **news portal** (WordPress) about TV/midia market
- Both belong to the **TelaViva brand** (Brazilian IPTV service)
- The IPTV app is hosted **directly on AWS** (not behind Cloudflare), IP `56.125.111.53`
- `cpanel.telaviva.com.br` and `whm.telaviva.com.br` are **exposed** externally
- `xmlrpc.php` exposed on WordPress - potential for brute-force or DDoS amplification
- No S3 buckets, no Firebase, no cloud secrets found in JS
- No historical wayback data for the DuckDNS host
- All `*.apsv-iptv.duckdns.org` subdomains are wildcard DNS (no actual virtual hosting)

### Potential Attack Vectors
1. **JWT API** - Token-based auth on `/api/*` - test for JWT alg confusion, token leakage
2. **Rate limiting** - Low reset window (26s), possible bypass
3. **WordPress** - XML-RPC brute force, WP REST API enumeration, plugin CVEs
4. **cPanel/WHM exposed** - Test for default creds, known cPanel CVEs
5. **BunnyCDN pull zone** - Test for origin bypass, cache poisoning
6. **No WAF detected** - Direct origin access (56.125.111.53)
7. **DuckDNS** - Dynamic DNS, possible subdomain takeover if abandoned

---

## 9. LIMITATIONS

- **crt.sh** returns 502 via Tor (blocked exit nodes) - tried direct but also blocked
- **theHarvester** timed out on multiple runs
- **Wayback CDX API** returned no data for DuckDNS domain
- **GitHub API** requires authentication for code search (rate-limited unauthenticated)
- **No Shodan/Censys API keys** found in environment (favicon hash prepared: `2306000272`)

---

## 10. ARTIFACTS GENERATED

| File | Description |
|------|-------------|
| `dns_full.txt` | Combined DNS query results |
| `subdomains_brute*.txt` | DNS brute force results (apsv-iptv + telaviva) |
| `httpx_live.json` | Tech detection JSON |
| `whatweb_live.txt` | whatweb results (apsv-iptv) |
| `whatweb_telaviva.txt` | whatweb results (telaviva.com.br) |
| `js_*.txt` | JavaScript analysis (API endpoints, routes, secrets) |
| `seo_config.json` | SEO configuration (GA4/GTM IDs) |
| `api_paths.txt` | API endpoint status codes |
| `wp_*.txt` | WordPress enumeration |
| `emails_found.txt` | Email addresses discovered |
| `s3_buckets.txt` | S3 bucket probe results |
| `bunnycdn_*.txt` | BunnyCDN investigation |
| `crtsh_*.txt`| CRT.sh attempts (mostly blocked) |
| `wayback_*.txt` | Wayback machine results (empty) |
| `ip_whois_*.txt` | IP WHOIS records |
| `evidence/` | Downloaded HTML, JS files, favicon |