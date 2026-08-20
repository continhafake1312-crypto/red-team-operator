# PASSIVE RECONNAISSANCE REPORT
**Engagement:** netmovies.com.br + filmenoisubtitrate.eu + filmekstra.com
**Date:** 2026-08-20
**Agent:** recon-passive

---

## 1. netmovies.com.br (T1)

### Overview
- **Organization:** Encripta S.A. (CNPJ: 15.182.829/0001-20)
- **Responsible:** Marcelo Spinasse Nunes (dns@encripta.com.br)
- **Domain age:** ~23 years (created 2003-11-28)
- **Registrar:** Registro.br
- **Infrastructure:** AWS (Route53 + ELB) + Azure (Web Apps - defunct)
- **CDN:** NONE - Direct AWS IPs exposed (no Cloudflare)

### Subdomain Discovery
| Source | Count |
|--------|-------|
| subfinder | 3 |
| amass | 42 (incl. ASN/IPs) |
| assetfinder | 3 |
| Deduplicated subdomains | **5 unique** |

### Live Subdomains & IPs
| Subdomain | IP/CNAME | Status |
|-----------|----------|--------|
| netmovies.com.br | 56.126.19.14, 18.229.14.249 | Live (200 Next.js) |
| www.netmovies.com.br | CNAME -> AWS ELB -> 56.126.19.14, 18.229.14.249 | Live (200 Next.js) |
| release.netmovies.com.br | CNAME -> AWS ELB -> 54.207.149.97, 54.232.212.222 | Live (404) |
| prod.netmovies.com.br | CNAME -> ottvssite-netmovies.azurewebsites.net | **DANGLING (NXDOMAIN)** |
| tests.netmovies.com.br | CNAME -> ottvssite-netmovies-tests.azurewebsites.net | **DANGLING (NXDOMAIN)** |

### Tech Stack
- **Framework:** Next.js (React) - SSR/SSG with i18n (pt, en, es)
- **Version:** v1.1.0 (build: 2026-07-23)
- **Hosting:** AWS (sa-east-1 - São Paulo) - ELB on EC2/EKS
- **Email:** Office 365 (MX + SPF), Zendesk (SPF)
- **Analytics:** Google Analytics (UA-53493266-3, AW-11147095540)
- **Legacy:** Previously ASP.NET on IIS (now migrated to Next.js)

### DNS Records
- **SPF:** include:spf.protection.outlook.com, include:mail.zendesk.com
- **DMARC:** p=none (no enforcement), reports to abuse@mailbiz.com.br
- **MX:** netmovies-com-br.mail.protection.outlook.com (Office 365)
- **SOA:** AWS Route53

### CDN/WAF Analysis
- **NOT behind Cloudflare** - direct AWS IPs visible
- **No WAF detected** - origin IPs exposed (56.126.19.14, 18.229.14.249)

### Information Disclosure (CRITICAL)
- **/version endpoint**: Exposes Next.js build version (v1.1.0), timestamp, buildId (`spotyHtoSHjLwhBUfq4k9`), GA IDs, verification tokens
- **robots.txt**: Disallows /version (confirming intentional hiding attempt)
- **Error pages**: ASP.NET Help/Oops may leak stack traces
- **Old site structure**: /default.aspx, /painelblogs/ (legacy paths still accessible)

### Wayback Machine Highlights
- 1113 URLs archived
- Historical ASP.NET endpoints: /default.aspx, /painelblogs/, /Help/Oops
- Content URLs: /filmes/* (movie listing pages)
- Old subdomain: i3.netmovies.com.br (no longer active)

### Cloud Buckets
- No public AWS S3, Azure Blob, or GCP buckets found
- All variations returned connection timeout

### Takeover Candidates
| Subdomain | Type | Severity | Details |
|-----------|------|----------|---------|
| prod.netmovies.com.br | Azure Web App CNAME | **HIGH** | ottvssite-netmovies.azurewebsites.net → NXDOMAIN |
| tests.netmovies.com.br | Azure Web App CNAME | **HIGH** | ottvssite-netmovies-tests.azurewebsites.net → NXDOMAIN |

### Favicon Hash (for Shodan)
```
mmh3: -1854505842
```

---

## 2. filmenoisubtitrate.eu (T2)

### Overview
- **Registrar:** Immaterialism Limited
- **Registrant:** NOT DISCLOSED (EURid privacy)
- **Nameservers:** Cloudflare (tessa.ns.cloudflare.com, noel.ns.cloudflare.com)
- **Hosting:** Cloudflare proxied
- **Tech Contact:** Immaterialism Limited (tld-eurid@immateriali.sm)

### Subdomain Discovery
| Source | Count |
|--------|-------|
| subfinder | 0 |
| amass | 19 |
| assetfinder | 1 |
| Deduplicated subdomains | **3** (including mail catch-all) |

### Live Subdomains & IPs
| Subdomain | IP | Status |
|-----------|-----|--------|
| filmenoisubtitrate.eu | 172.67.154.22, 104.21.34.32 | Cloudflare 403 (WAF block) |
| www.filmenoisubtitrate.eu | 172.67.154.22, 104.21.34.32 | Cloudflare 403 (WAF block) |
| mail.filmenoisubtitrate.eu | 172.67.154.22, 104.21.34.32 | Cloudflare catch-all |

### Tech Stack
- **CDN/WAF:** Cloudflare (blocking automated traffic - 403)
- **No MX records** - no email infrastructure detected
- **No TXT/SPF/DMARC** - no DNS security
- **Title:** "Access denied | filmenoisubtitrate.eu used Cloudflare to restrict access"

### Wayback Machine
- Only 1 URL archived (minimal historical footprint)

### Cloud Buckets
- No public cloud storage detected

### Takeover Candidates
- None identified (standard Cloudflare setup)

### Favicon Hash (for Shodan)
```
mmh3: -1788250127
```

---

## 3. filmekstra.com (T3)

### Overview
- **Registrar:** Tucows Domains Inc.
- **Registrant:** REDACTED FOR PRIVACY (St. Kitts and Nevis - KN)
- **Domain age:** ~15 days (created 2026-08-05) - VERY RECENT
- **Nameservers:** Cloudflare (aryanna.ns.cloudflare.com, benedict.ns.cloudflare.com)
- **DNSSEC:** unsigned

### Subdomain Discovery
| Source | Count |
|--------|-------|
| subfinder | 0 |
| amass | 7 |
| assetfinder | 1 |
| Deduplicated subdomains | **3** (including mail catch-all) |

### Live Subdomains & IPs
| Subdomain | IP | Status |
|-----------|-----|--------|
| filmekstra.com | 104.21.93.242, 172.67.216.224 | Cloudflare 403 (WAF block) |
| www.filmekstra.com | 104.21.93.242, 172.67.216.224 | Cloudflare 403 (WAF block) |
| mail.filmekstra.com | 104.21.93.242, 172.67.216.224 | Cloudflare catch-all |

### Tech Stack
- **CDN/WAF:** Cloudflare (blocking automated traffic - 403)
- **No MX records** - no email infrastructure
- **No TXT/SPF/DMARC** - no DNS security
- **Title:** "Access denied | filmekstra.com used Cloudflare to restrict access"

### Wayback Machine
- 0 URLs archived (domain too recent)

### Cloud Buckets
- No public cloud storage detected

### Takeover Candidates
- None identified (standard Cloudflare setup, domain too recent for legacy infra)

### Notes
- Domain registered in St. Kitts & Nevis (offshore/privacy jurisdiction)
- Very recent creation suggests this may be a new project or parked domain
- Registrar Tucows + WHOIS privacy = minimal OSINT

### Favicon Hash (for Shodan)
```
mmh3: -220521769
```

---

## OSINT Summary

### netmovies.com.br
- **Company:** Encripta S.A. (CNPJ 15.182.829/0001-20) - Brazilian legal entity
- **Contact:** dns@encripta.com.br | Marcelo Spinasse Nunes
- **Email providers:** Office 365, Zendesk
- **Security contact:** abuse@mailbiz.com.br (DMARC reports)
- **Analytics:** Google (UA-53493266-3, AW-11147095540)
- **Social proof:** Facebook DB verification tag, Google site verification

### filmenoisubtitrate.eu
- Limited OSINT - EURid privacy + Immaterialism registrar
- Technical contact: Immaterialism Limited (San Marino based)
- Likely a privacy-bought domain

### filmekstra.com
- Very limited OSINT - WHOIS privacy via Tucows
- Registrant country: St. Kitts and Nevis (privacy/offshore jurisdiction)
- New domain (15 days old) - potentially suspicious or just new

---

## Actionable Findings (Priority)

### 🔴 CRITICAL
1. **Azure Web App Subdomain Takeover** - prod.netmovies.com.br and tests.netmovies.com.br
   - CNAMEs point to deleted Azure Web Apps
   - Any Azure subscriber can claim these names
   - Full subdomain control of prod.netmovies.com.br

### 🟠 HIGH
2. **Origin IP Exposure** - netmovies.com.br NOT behind Cloudflare
   - IPs 56.126.19.14, 18.229.14.249 directly reachable
   - DDoS, direct attacks possible bypassing any potential WAF
   - Both IPs are AWS (sa-east-1)

3. **/version Information Disclosure** 
   - Exposes build version, timestamp, buildId, GA tokens
   - robots.txt explicitly disallows it (knowingly exposed)

### 🟡 MEDIUM
4. **DMARC p=none** - No email spoofing protection (netmovies.com.br)
5. **ASP.NET legacy paths** - /default.aspx, /painelblogs/, /Help/Oops may still leak info
6. **No SPF/DMARC for T2/T3** - Email impersonation possible

### 🔵 INFO
7. filmenoisubtitrate.eu and filmekstra.com behind Cloudflare (WAF blocking)
8. filmekstra.com is very new (15 days) - monitor for infrastructure buildup
9. netmovies.com.br SPF includes Zendesk (internal support system)
10. filmenoisubtitrate.eu registrar = Immaterialism (San Marino) - potential DMCA haven

---

## Next Steps for Active Recon

1. **netmovies.com.br:**
   - Port scan origin IPs (56.126.19.14, 18.229.14.249) - nmap
   - Vulnerability scan Next.js v1.1.0
   - Check /painelblogs/ and legacy ASP.NET paths
   - Directory brute force (ffuf/gobuster)
   - Test Azure takeover (register Azure Web Apps)
   - Check release.netmovies.com.br AWS ELB for dangling ELB
   - JS endpoints analysis from Next.js chunks

2. **filmenoisubtitrate.eu:**
   - Bypass Cloudflare WAF (IP rotation, change user-agent, 2Captcha)
   - Find origin IP (Censys/Shodan historical data, favicon hash)
   - Port scan if origin IP found
   - Subdomain brute force (common names + permutations)

3. **filmekstra.com:**
   - Same as filmenoisubtitrate.eu (both Cloudflare)
   - Wait for SSL certificate issuance (new domain) then monitor crt.sh
   - Monitor for infrastructure expansion

---

*Report generated by recon-passive agent on 2026-08-20*