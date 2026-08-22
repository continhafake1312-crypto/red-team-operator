# Passive Reconnaissance Report — tempfiles.com.ar

**Engagement**: tempfiles.com.ar  
**Date**: 2026-08-22  
**Operator**: recon-passive  
**Target URL**: https://tempfiles.com.ar/V8OoztG

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| **Total subdomains enumerated** | 8 |
| **Resolved (alive)** | 4 |
| **Live HTTP/HTTPS hosts** | 3 |
| **Real origin IPs discovered** | 3 (198.245.60.66, 181.45.232.2, 37.187.113.35) |
| **Cloud buckets found** | 3 (AWS S3, GCP, Azure) |
| **Subdomain takeover candidates** | 0 |
| **AXFR zone transfer** | SUCCESS (both NS) |
| **Whois registrant** | PIRELLI SIMON LEONARDO (CUIT: 20312399246) |

---

## 2. DNS Enumeration

### 2.1 Authoritative Records

```
tempfiles.com.ar.    10800  IN  SOA  tempfiles.com.ar. tempfiles.com.ar. 0 10800 3600 604800 10800
tempfiles.com.ar.    7200   IN  NS   ns1.argenpoll.com.ar.
tempfiles.com.ar.    7200   IN  NS   ns2.argenpoll.com.ar.
tempfiles.com.ar.    10800  IN  A    198.245.60.66
```

- **No MX records** — no email service configured
- **No TXT/SPF/DMARC records** — email spoofing possible
- **AXFR allowed** on both `ns1.argenpoll.com.ar` and `ns2.argenpoll.com.ar` (zone transfer successful)

### 2.2 AXFR Output (ns1.argenpoll.com.ar)

```
tempfiles.com.ar.     10800  IN  SOA  tempfiles.com.ar. tempfiles.com.ar. 0 10800 3600 604800 10800
tempfiles.com.ar.     10800  IN  NS   ns1.argenpoll.com.ar.
tempfiles.com.ar.     10800  IN  NS   ns2.argenpoll.com.ar.
tempfiles.com.ar.     10800  IN  A    198.245.60.66
ns1.tempfiles.com.ar. 10800  IN  A    181.45.232.2
ns2.tempfiles.com.ar. 10800  IN  A    193.70.122.52
www.tempfiles.com.ar. 10800  IN  A    198.245.60.66
```

### 2.3 AXFR Discrepancy

| Nameserver | ns2.tempfiles.com.ar IP |
|------------|------------------------|
| ns1.argenpoll.com.ar | 193.70.122.52 |
| ns2.argenpoll.com.ar | 37.187.113.35 |
| Live resolution | 37.187.113.35 |

**Finding**: Inconsistent A record for ns2 between authoritative NS — possible misconfiguration or stale record.

---

## 3. Subdomain Enumeration

### 3.1 Sources Used

| Source | Subdomains Found |
|--------|-----------------|
| AXFR (ns1) | 4 (tempfiles, www, ns1, ns2) |
| AXFR (ns2) | 4 (same) |
| Subfinder (all sources) | 4 (bapq, njmy, tiqv, hpcd) |
| crt.sh (historical) | 1 (hpcd — Let's Encrypt certs from 2018) |
| Assetfinder | 0 |
| Waybackurls | 0 |

### 3.2 Complete Subdomain List

| Subdomain | Source | Resolved | IP | HTTP Status |
|-----------|--------|----------|-----|-------------|
| tempfiles.com.ar | AXFR, crt.sh | ✅ | 198.245.60.66 | 403 Forbidden |
| www.tempfiles.com.ar | AXFR | ✅ | 198.245.60.66 | 301 → HTTPS |
| ns1.tempfiles.com.ar | AXFR | ✅ | 181.45.232.2 | 200 OK |
| ns2.tempfiles.com.ar | AXFR | ✅ | 37.187.113.35 | No response |
| bapq.tempfiles.com.ar | Subfinder | ❌ | — | — |
| njmy.tempfiles.com.ar | Subfinder | ❌ | — | — |
| tiqv.tempfiles.com.ar | Subfinder | ❌ | — | — |
| hpcd.tempfiles.com.ar | Subfinder, crt.sh | ❌ | — | — |

### 3.3 Historical Subdomain (hpcd)

- **100+ Let's Encrypt certificates** issued between 2016-2018 for `hpcd.tempfiles.com.ar`
- Common names included: `abkd.granovita.com.ar`, `aklq.brianwhigham.com`
- Subdomain no longer resolves (likely decommissioned)

---

## 4. Live Host Fingerprinting

### 4.1 tempfiles.com.ar (198.245.60.66)

| Attribute | Value |
|-----------|-------|
| **HTTP Status** | 403 Forbidden (all paths) |
| **Web Server** | Apache/2.2.15 (CentOS) |
| **PHP Version** | 5.3.3 (EOL since 2014) |
| **Frameworks** | Bootstrap, jQuery 1.11.0 |
| **Cookies** | PHPSESSID, language |
| **Analytics** | Google Analytics UA-78115986-1 |
| **Headers** | X-Powered-By: PHP/5.3.3, X-UA-Compatible: IE=edge |
| **Location** | Canada (GeoIP) |

**Note**: All paths including `/`, `/V8OoztG`, `/admin`, `/login`, `/.git`, `/.env` return 403. The file hosting functionality may be on a different endpoint or require authentication.

### 4.2 www.tempfiles.com.ar (198.245.60.66)

| Attribute | Value |
|-----------|-------|
| **HTTP Status** | 301 Moved Permanently → https://tempfiles.com.ar/ |
| **Web Server** | Apache/2.2.15 (CentOS) |
| **Location** | Canada (GeoIP) |

### 4.3 ns1.tempfiles.com.ar (181.45.232.2)

| Attribute | Value |
|-----------|-------|
| **HTTP Status** | 200 OK |
| **Web Server** | Apache/2.2.22 (Ubuntu) |
| **Framework** | Materialize CSS |
| **Application** | **ArgenPool Miner** — Cryptocurrency mining pool (web-based) |
| **Supported Coins** | XMR, ETN, GRFT, KRB, SUMO, BCN, COAL, BTN, FNO, ITNS, SUP, MSR, DERO, IRD, FBF, CREP, XHV, XTL, DCY, IPBC, AEON, DSH, TRTL, FCN, XDN, QUZ |
| **Analytics** | Google Analytics UA-116922981-1 |
| **SSL Certificate** | CN=miner.argenpoll.com.ar (Let's Encrypt YR1) |
| **Location** | Argentina (GeoIP) |

**Critical Finding**: `ns1.tempfiles.com.ar` serves a completely different application (cryptocurrency mining pool) with SSL certificate for `miner.argenpoll.com.ar`. This is a **shared nameserver hosting unrelated service**.

### 4.4 ns2.tempfiles.com.ar (37.187.113.35)

- No HTTP/HTTPS response (port 80/443 closed or filtered)
- IP differs from AXFR record on ns1 (193.70.122.52)

---

## 5. Technology Stack Summary

| Host | Web Server | OS | Language/Framework | Version | Risk |
|------|------------|-----|-------------------|---------|------|
| tempfiles.com.ar | Apache | CentOS | PHP | 2.2.15 / 5.3.3 | **HIGH** (EOL PHP, old Apache) |
| www.tempfiles.com.ar | Apache | CentOS | — | 2.2.15 | MEDIUM |
| ns1.tempfiles.com.ar | Apache | Ubuntu | Materialize CSS | 2.2.22 | MEDIUM (old Apache) |

**Vulnerable Components**:
- **PHP 5.3.3** — EOL since Aug 2014, multiple unpatched CVEs
- **Apache 2.2.15** — EOL since Jul 2017, multiple CVEs
- **Apache 2.2.22** — EOL since Jul 2017
- **jQuery 1.11.0** — XSS vulnerabilities (CVE-2015-9251, CVE-2019-11358)

---

## 6. OSINT Findings

### 6.1 Registrant Information

```
Registrant: PIRELLI SIMON LEONARDO
CUIT/CUIL: 20312399246
Contact ID: 20312399246
Created: 2013-10-17
```

**Domains owned by same registrant**:
- tempfiles.com.ar (registered 2016-05-18, expires 2027-05-18)
- argenpoll.com.ar (registered 2017-01-13, expires 2027-01-13)

### 6.2 Related Infrastructure

| Domain | Relationship |
|--------|--------------|
| argenpoll.com.ar | Same registrant, authoritative NS for tempfiles.com.ar |
| miner.argenpoll.com.ar | SSL cert on ns1.tempfiles.com.ar (ArgenPool Miner) |
| granovita.com.ar | Historical cert common name for hpcd.tempfiles.com.ar |
| brianwhigham.com | Historical cert common name for hpcd.tempfiles.com.ar |

### 6.3 Google Analytics Tracking

| Property ID | Host | Notes |
|-------------|------|-------|
| UA-78115986-1 | tempfiles.com.ar | Main file hosting |
| UA-116922981-1 | ns1.tempfiles.com.ar | ArgenPool Miner |

Both properties likely owned by same entity (same registrant).

### 6.4 No Email/Contact Data Found

- No MX records
- No emails in website content
- No GitHub repositories referencing domain (API auth required)
- No breach data accessible without APIs

---

## 7. Cloud Storage Enumeration

### 7.1 AWS S3

| Bucket | Status | Region |
|--------|--------|--------|
| `tempfiles` | **EXISTS** (403 Forbidden) | us-east-1 |
| tempfiles-com-ar | Not found (404) | — |
| tempfiles-ar | Not found (404) | — |
| tempfiles-backup | Not found (404) | — |
| tempfiles-assets | Not found (404) | — |
| tempfiles-static | Not found (404) | — |
| tempfiles-media | Not found (404) | — |
| tempfiles-uploads | Not found (404) | — |

### 7.2 Google Cloud Storage

| Bucket | Status |
|--------|--------|
| `tempfiles` | **EXISTS** (403 Forbidden) |
| tempfiles-com-ar | Not found (404) |
| tempfiles-ar | Not found (404) |
| tempfiles-backup | Not found (404) |

### 7.3 Azure Blob Storage

| Account | Status |
|---------|--------|
| `tempfiles` | **EXISTS** (400 Bad Request — account exists) |
| tempfilescomar | Not found |
| tempfilesar | Not found |
| tempfilesbackup | Not found |
| tempfilesassets | Not found |

**Finding**: The bucket/account name `tempfiles` exists on all three major cloud providers but has no public access (403/400). Not vulnerable to public enumeration.

---

## 8. Subdomain Takeover Assessment

| Subdomain | CNAME Target | Status | Vulnerable |
|-----------|--------------|--------|------------|
| tempfiles.com.ar | — | A record | No |
| www.tempfiles.com.ar | — | A record | No |
| ns1.tempfiles.com.ar | — | A record | No |
| ns2.tempfiles.com.ar | — | A record | No |
| bapq.tempfiles.com.ar | — | NXDOMAIN | N/A |
| njmy.tempfiles.com.ar | — | NXDOMAIN | N/A |
| tiqv.tempfiles.com.ar | — | NXDOMAIN | N/A |
| hpcd.tempfiles.com.ar | — | NXDOMAIN | N/A |

**Result**: No CNAME records found. No subdomain takeover vectors identified.

---

## 9. Wayback Machine / Historical Analysis

| Source | Results |
|--------|---------|
| waybackurls (tempfiles.com.ar) | 0 URLs |
| waybackurls (tempfiles.com.ar/V8OoztG) | 0 URLs |
| Archive.org CDX API | Rate limited (429) |
| crt.sh historical | 100+ certs for hpcd.tempfiles.com.ar (2016-2018) |

**Limitation**: Archive.org rate limiting prevented full historical enumeration. crt.sh shows historical subdomain `hpcd` with certificates for unrelated domains (`granovita.com.ar`, `brianwhigham.com`), suggesting shared hosting or compromise in 2018.

---

## 10. SSL/TLS Certificate Analysis

### 10.1 tempfiles.com.ar
- **Issuer**: Let's Encrypt (YR2)
- **Validity**: 2026-07-20 → 2026-10-18
- **SAN**: tempfiles.com.ar only
- **Key**: RSA 2048-bit

### 10.2 ns1.tempfiles.com.ar
- **Issuer**: Let's Encrypt (YR1)
- **Validity**: 2026-08-08 → 2026-11-06
- **SAN**: miner.argenpoll.com.ar only
- **Key**: RSA 2048-bit
- **Mismatch**: Certificate CN ≠ requested hostname (ns1.tempfiles.com.ar)

---

## 11. Favicon Hashes (for Shodan Correlation)

| Host | MMH3 Hash |
|------|-----------|
| tempfiles.com.ar | 1289789017 |
| www.tempfiles.com.ar | 0 (no favicon) |
| ns1.tempfiles.com.ar | 0 (no favicon) |

---

## 12. Raw Artifacts (in `/recon/passive/`)

| File | Description |
|------|-------------|
| `dns_full.txt` | Complete dig output (ANY, MX, TXT, NS, AXFR, DMARC, SPF) |
| `whois_full.txt` | WHOIS for tempfiles.com.ar |
| `whois_argenpoll.txt` | WHOIS for argenpoll.com.ar |
| `subfinder.txt` | Subfinder output (4 subdomains) |
| `assetfinder.txt` | Assetfinder output (empty) |
| `crtsh_raw.json` | crt.sh raw JSON (502 error on recent query) |
| `crtsh.txt` | Extracted subdomains from crt.sh (empty due to 502) |
| `subdomains_all.txt` | All 8 subdomains (deduped) |
| `subdomains_resolved.txt` | dnsx resolution output (4 resolved) |
| `subdomains_live.txt` | httpx live host output (3 live) |
| `waybackurls.txt` | waybackurls output (empty) |
| `wayback_cdx.json` | Archive.org CDX API (429 rate limit) |
| `whatweb.txt` | whatweb fingerprint output |
| `ssl_certs.txt` | Full SSL certificate details |
| `favicon_hash.txt` | MMH3 hashes |
| `s3_buckets.txt` | AWS S3 bucket enumeration |
| `azure_buckets.txt` | Azure Blob Storage enumeration |
| `gcp_buckets.txt` | GCP bucket enumeration |
| `cname_check.txt` | CNAME records for all subdomains |
| `sensitive_paths.txt` | Common path checks (all 403) |
| `target_page.html` | Response for /V8OoztG |
| `main_page.html` | Response for / |
| `ns1_page.html` | ArgenPool Miner HTML |
| `subdomains_live_summary.txt` | This summary table |

---

## 13. Limitations & Gaps

1. **Archive.org rate limited** — Could not retrieve historical URLs
2. **crt.sh returning 502** — Only historical data from earlier query available
3. **GitHub API requires auth** — Could not search for code/secrets
4. **theHarvester broken** — Python dependency conflict (aiodns/pycares)
5. **No Shodan/Censys API keys** — Could not correlate favicon hashes or scan IPs
6. **Subfinder outdated** — v2.6.6 (current is v2.15.0)
7. **Target path /V8OoztG returns 403** — Actual file hosting endpoint not identified

---

## 14. Preliminary Findings for Active Recon

### High Priority Targets
1. **tempfiles.com.ar (198.245.60.66)** — EOL PHP 5.3.3 + Apache 2.2.15, file hosting with 403 on all paths
2. **ns1.tempfiles.com.ar (181.45.232.2)** — ArgenPool Miner web app, Apache 2.2.22 Ubuntu, crypto mining pool functionality

### Recommended Active Recon Steps
1. **Port scan** all 3 origin IPs (nmap/masscan)
2. **Vhost enumeration** on 198.245.60.66 and 181.45.232.2
3. **Content discovery** on tempfiles.com.ar (ffuf) — find actual file upload/download endpoints
4. **CMS/Framework scanning** — wpscan not applicable, but check for PHP frameworks
5. **JS analysis** on ns1.tempfiles.com.ar (miner page) — check for API endpoints, wallet handling
6. **SSL/TLS testing** — test for weak ciphers, cert validation on ns1 (hostname mismatch)
7. **DNS zone transfer** already successful — enumerate all records for related domains

### Potential Attack Surface
- **PHP 5.3.3** — Multiple remote code execution vulnerabilities
- **Apache 2.2.x** — Multiple CVEs (Optionsbleed, etc.)
- **File upload functionality** — If found, test for unrestricted upload, path traversal
- **ArgenPool Miner** — Wallet address handling, pool URL injection, Stratum protocol abuse
- **Cloud buckets** — `tempfiles` bucket exists on AWS/GCP/Azure — test for misconfiguration
- **NS discrepancy** — ns2 IP mismatch between nameservers

---

## 15. Next Phase Recommendation

**Proceed to Active Recon (Phase 3)** with focus on:
1. Full port scan of 3 origin IPs
2. Service enumeration and version detection
3. Virtual host discovery on shared IPs
4. Web application mapping (find actual file hosting endpoints)
5. Vulnerability scanning for identified EOL software

**Timeline**: Ready for recon-active agent.
