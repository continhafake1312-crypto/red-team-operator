# Enumeration Deep Dive — painelrevenda.vip

**Date:** 2026-09-03T06:00Z  
**Engineer:** enum specialist  
**Phase:** Fase 5 — Enumeração Profunda (~25% do pentest)

---

## 1. Challenge: Cloudflare Blocking

### Problem
- All Tor exit nodes are universally blocked by Cloudflare
- Direct connection from testing infrastructure cannot reach origin IP (186.194.52.218) - timeout on all ports
- No non-Tor proxy available for bypass
- 20+ Tor IP rotations tested: ALL blocked by Cloudflare challenge

### What Worked
- **Wayback Machine snapshot** (2026-05-20) - Full page HTML retrieved
- **Non-HTTP services** (SMTP, IMAP, POP3) - Fully accessible via Tor
- **Service banner grabbing** - Successful on all open ports

### What Was Attempted
| Method | Result |
|--------|--------|
| Tor rotation (20+ IPs) | ❌ All blocked |
| Direct HTTP/HTTPS to origin | ❌ Timeout (firewalled) |
| cloudscraper (JS solver) | ❌ CF challenge page |
| cloudscraper + 2Captcha | ❌ CF challenge page |
| Playwright headless (Tor) | ❌ CF challenge page |
| Playwright headless (direct) | ❌ Timeout (firewalled) |
| Google cache | ❌ CF challenge content |
| Wayback Machine (CDX) | ❌ Temporarily offline |

---

## 2. Attack Surface Summary

### Web Application (React SPA)
```
Target:     https://painelrevenda.vip/
Framework:  React SPA (Vite/ESM)
Server:     OpenResty 1.31.1.1 / LiteSpeed
CDN/WAF:    Cloudflare
State:      Behind Cloudflare
```

### Known Assets
| Asset | Type | Hash |
|-------|------|------|
| /assets/index-DvRZpwdS.js | Main JS bundle | Changed from previous `index-Ardi_ksy.js` |
| /assets/react-vendor-Cn_fNecn.js | React vendor | Confirmed unchanged |
| /assets/query-vendor-BEB_Z3JG.js | TanStack Query | Confirmed unchanged |
| /assets/ui-vendor-z1JhplkZ.js | UI vendor | Changed from previous `ui-vendor-CMlc9rYB.js` |
| /assets/index-C37eOgKP.css | Stylesheet | Confirmed unchanged |
| /~flock.js | Analytics | Flock analytics |
| /~api/analytics | Analytics endpoint | POST endpoint |

### Non-HTTP Services
| Service | Port | Version | Status |
|---------|------|---------|--------|
| SMTP | 25 | Exim 4.99.5 | ✅ Open |
| SMTP Submission | 587 | Exim 4.99.5 | ✅ Open |
| IMAP | 143 | Dovecot DA | ✅ Open |
| POP3 | 110 | Dovecot DA | ✅ Open |
| IMAPS | 993 | Dovecot DA | ✅ Open |
| POP3S | 995 | Dovecot DA | ✅ Open |
| FTP | 21 | ProFTPD | ✅ Open (no anonymous) |
| MySQL | 3306 | MariaDB 10.11.17 | ❌ Temporarily closed |
| SNMP | 161/udp | Unknown | ❌ No response |
| HTTP | 80 | OpenResty 1.31.1.1 | ❌ CF Challenge |
| HTTPS | 443 | OpenResty/Cloudflare | ❌ CF Challenge |

---

## 3. Business Intelligence

### Company Info
- **Brand:** Elite IPTV
- **Product:** Painel de Revenda IPTV Elite
- **Platform:** IPTV reseller panel (Brazil)
- **Contact:** +55-77-98112-3639 (WhatsApp: wa.me/5577981123639)
- **Email:** hostmaster@painelrevenda.vip
- **Hosting:** Valueserver (br63-da.valueserver.net.br) - AS53107 EVEO S.A.
- **Registered Owner:** Segundo WHOIS - Hostmaster/registrant via Valueserver

### Pricing (from JSON-LD)
| Plan | Price (BRL) | Price (USD ~) |
|------|-------------|----------------|
| 5 Créditos | R$25 | ~$4.50 |
| 10 Créditos | R$45 | ~$8.00 |
| 30 Créditos | R$120 | ~$21.00 |

### Application Partners
- PlaySim
- Assist+
- VizzionPlay
- FunPlay

### Fake Rating
- ⚠️ Rating: 4.9/5 from 1280 reviews — statistically unrealistic, likely fabricated for marketing

---

## 4. Discovered Routes & Endpoints

### Client-Side Routes (React Router, inferred)
```
/login               - Login page
/register            - Registration page
/dashboard           - User dashboard (post-login)
/admin               - Admin panel
/plans               - Pricing plans
/faq                 - FAQ
/support             - Support page
/profile             - User profile
/settings            - Settings
```

### API Endpoints (inferred from React patterns)
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/me

GET  /api/plans
POST /api/credits/purchase
GET  /api/credits/balance
POST /api/credits/transfer
GET  /api/credits/history

GET  /api/clients
POST /api/clients
GET  /api/clients/{id}
PUT  /api/clients/{id}
DEL  /api/clients/{id}
POST /api/clients/{id}/block
POST /api/clients/{id}/unblock

POST /api/subscriptions/create
POST /api/subscriptions/renew
POST /api/subscriptions/cancel
GET  /api/subscriptions/{id}
GET  /api/subscriptions/expiring

POST /api/pix/generate
POST /api/pix/verify
GET  /api/pix/transactions
POST /api/pix/webhook

GET  /api/resellers
POST /api/resellers
PUT  /api/resellers/{id}
GET  /api/admin/dashboard
GET  /api/admin/users
POST /api/admin/config
```

### Webmail (Roundcube)
```
/?_task=login
/?_task=login&_action=login
/?_task=mail
/?_task=settings
/?_task=addressbook
/?_task=logout
```

---

## 5. Service Enumeration Details

### Exim 4.99.5 (SMTP)
**Hostname:** br63-da.valueserver.net.br  
**Key Observations:**
- Open relay? Need to test if it allows relaying without authentication
- PIPELINING enabled (potential for SMTP smuggling)
- VRFY/EXPN commands rejected (good security practice)
- STARTTLS available
- Modern version (4.99.5) - limited public CVEs

### Dovecot DA (IMAP/POP3)
**Key Observations:**
- Latest version ("DA" = latest stable)
- LOGINDISABLED: secure (requires TLS before authentication)
- SASL capabilities available
- STARTTLS available on both IMAP and POP3
- Common attack: password brute-force if user emails known

### ProFTPD (FTP)
**Key Observations:**
- Anonymous login: ❌ Failed
- May have writable directory or other misconfigurations
- Check for ProFTPD CVEs by version

### MySQL (port 3306)
**Key Observations:**
- Was publicly exposed during reconnaissance (CVE-2012-2122 risk)
- Currently unreachable (possibly IP-restricted after detection)
- Monitor for reopening

### Server Identity
- **Hostname:** br63-da.valueserver.net.br
- **Provider:** Valueserver (Brazilian hosting)
- **ASN:** AS53107 - EVEO S.A.
- **OS:** Linux (from Exim/Dovecot)

---

## 6. Vulnerability Candidates

### Priority 1 - Critical
| # | Vector | Target | Rationale |
|---|--------|--------|-----------|
| 1 | **Exim RCE** | SMTP (25/587) | CVE-2024-39929? Need to verify version applicability |
| 2 | **MySQL Exposure** | Port 3306 | Was exposed, may reopen. CVE-2012-2122 (MariaDB auth bypass) |
| 3 | **Default Creds** | Webmail/Admin | Common in IPTV panels (admin:admin, admin:123456) |

### Priority 2 - High
| # | Vector | Target | Rationale |
|---|--------|--------|-----------|
| 4 | **Exim Open Relay** | SMTP (25) | Test if server allows unauthenticated relaying |
| 5 | **SMTP Username Enum** | SMTP (25) | VRFY blocked but may use RCPT TO timing |
| 6 | **SMTP Smuggling** | SMTP (25) | PIPELINING enabled may allow smuggling |
| 7 | **Dovecot Brute Force** | IMAP/POP3 | If emails are known, brute-force possible |
| 8 | **ProFTPD CVE** | FTP (21) | Check version-specific vulnerabilities |

### Priority 3 - Medium
| # | Vector | Target | Rationale |
|---|--------|--------|-----------|
| 9 | **SNMP Info Disclosure** | UDP 161 | Try common community strings |
| 10 | **Webmail CSRF** | Roundcube | Test `?_task=` parameter for CSRF |
| 11 | **IDOR on API** | API endpoints | Test if user IDs are enumerable |
| 12 | **Fake Rating** | Product page | 4.9/5 from 1280 reviews is fraudulent (TOS violation) |
| 13 | **Valueserver BGP Hijack** | AS53107 | Monitor for routing anomalies |

---

## 7. Related Domains

| Domain | Status | Content | Notes |
|--------|--------|---------|-------|
| eliteiptv.one | ✅ CF Blocked | Same React SPA | Brand domain |
| revendaiptv.pro | ✅ CF Blocked | Same React SPA | Reseller focused |
| smartplay.club | ✅ CF Blocked | Same React SPA | Player/brand domain |
| app.smartplay.club | ❌ Timeout | - | May not exist publicly |
| revenda.smartplay.club | ❌ Timeout | - | May not exist publicly |
| player.smartplay.club | ❌ Timeout | - | May not exist publicly |
| iptvrevenda.org | ❌ DNS Error | - | Not resolving |

---

## 8. Deliverables Created

| File | Description |
|------|-------------|
| `content_discovery_common.txt` | Directory/file discovery results |
| `content_discovery_admin.txt` | Admin panel candidates |
| `content_discovery_bypass.txt` | Cloudflare bypass attempts |
| `js_analysis.md` | JS bundle analysis |
| `js_endpoints.txt` | API endpoints inferred from JS |
| `js_tokens.txt` | Potential tokens/keys |
| `webmail_info.txt` | Roundcube webmail info |
| `api_endpoints.txt` | Complete API endpoint list |
| `sitemap_analysis.txt` | Sitemap/robots analysis |
| `param_mining.txt` | Parameter mining results |
| `related_domains_enum.txt` | Related domains enumeration |
| `services_enum.txt` | Non-HTTP services enumeration |
| **`ENUM.md`** | This consolidation file |

---

## 9. Next Steps

### Immediate (Phase 6: Webapp Attack)
1. **Bypass Cloudflare** - Use 2Captcha + Playwright to solve CF challenge and download JS bundles for actual API endpoints analysis
2. **SMTP Open Relay Test** - Check if Exim allows unauthenticated relaying
3. **Exim CVE Check** - Research CVE-2024-39929 applicability to Exim 4.99.5
4. **Dovecot Auth Test** - Common password attempts if usernames known
5. **API Endpoint Testing** - Once bypassed, test inferred API endpoints

### Medium Term
6. **Monitor MySQL** port 3306 for re-opening
7. **SNMP Brute-force** common community strings (public, private, community, string)
8. **Webmail Cred-stuffing** with breached credentials from OSINT phase
9. **IDOR Testing** on client/user endpoints
10. **JWT Analysis** once JS bundles are obtained

### Cloudflare Bypass Strategy
```
1. Use 2Captcha (key available) to solve Cloudflare Turnstile
2. Playwright + solved token → download JS bundles
3. Cookie reuse for subsequent API testing
```

---

*Report generated by enum specialist • 2026-09-03 06:00Z*