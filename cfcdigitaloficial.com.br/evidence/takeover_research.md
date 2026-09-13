# Subdomain Takeover & Exposure Research
## Target: cfcdigitaloficial.com.br
## Date: 2026-09-13

---

## 1. pixel.cfcdigitaloficial.com.br — HIGH PRIORITY TAKEOVER CANDIDATE

### DNS Evidence
```
$ dig +short pixel.cfcdigitaloficial.com.br CNAME
pixel.hotmart.com.

$ dig +short pixel.hotmart.com
(empty — NXDOMAIN)

$ host pixel.hotmart.com 8.8.8.8
Host pixel.hotmart.com not found: 3(NXDOMAIN)
```

**Status: CONFIRMED DANGLING CNAME**
- CNAME `pixel.cfcdigitaloficial.com.br` → `pixel.hotmart.com`
- `pixel.hotmart.com` resolves to **nothing** (NXDOMAIN)
- Any service that claims `pixel.hotmart.com` can take over this subdomain

### Background: What was pixel.hotmart.com?
From Wayback Machine (last snapshot: Sep 9, 2024), `pixel.hotmart.com` served as a **pixel injection/iframe injection service** for Hotmart's tracking system. It had two modes:
1. **Super Pixel** (`v=spx`): Injects an iframe pointing to `pixel.hotmart.com/super/?eventData=...`
2. **Legacy Pixel** (default): Injects a user-provided iframe URL with event tracking

The service was part of Hotmart's ad tracking/conversion pixel infrastructure. Based on the NXDOMAIN status, Hotmart has **discontinued or migrated** this service.

### Hotmart Infrastructure
- Hotmart.com uses AWS DNS (ns-*.awsdns-*.com)
- Hotmart main site: 13.32.16.0/24 (AWS CloudFront)
- pixel.hotmart.com was **not** on AWS CloudFront (no CloudFront alias records)
- Likely hosted on a separate platform (possibly Heroku, Render, or custom infra)

### Takeover Feasibility
- **Hotmart account creation**: Users can freely create accounts at hotmart.com
- However, Hotmart's pixel service appears to have been a managed service, not user-configurable through account settings
- The CNAME target `pixel.hotmart.com` does not point to any known cloud provider's default domain (no `cloudfront.net`, `herokuapp.com`, `github.io`, etc.)
- **Hypothesis**: Hotmart decommissioned the subdomain internally without removing the DNS record, or the target infrastructure was retired
- **Attempted**: Cannot register `pixel.hotmart.com` as a subdomain of hotmart.com through normal account creation

### Risk
Since the CNAME target is a bare `pixel.hotmart.com` without a cloud-provider-specific domain pattern, the takeover vector depends on whether someone can claim that specific hostname. Hotmart controls the `hotmart.com` zone (via AWS Route53). The dangling would need to be exploited by:
- Convincing Hotmart's DNS administrators that they should point it elsewhere
- OR finding a cloud service that allows claiming `pixel.hotmart.com` by proving DNS control
- **SSL certificate issuance** for `pixel.cfcdigitaloficial.com.br` could be possible via Let's Encrypt if you control the domain

---

## 2. stape.cfcdigitaloficial.com.br — GCP EXPOSURE (NO TAKEOVER)

### DNS Evidence
```
$ dig +short stape.cfcdigitaloficial.com.br
35.199.71.234

$ dig -x 35.199.71.234 +short
234.71.199.35.bc.googleusercontent.com.
```

- **IP**: 35.199.71.234 (Google Cloud Platform — `bc.googleusercontent.com`)
- GCP customer-owned IP (Google Cloud customer, not Google-owned service)
- **All HTTP endpoints return 404 Not Found** (including /, /healthz, /metrics, /collect, /robots.txt, /admin, /login, /gtm, /.env, /version)

### Analysis
The server is running a GCP VM/LB that returns 404 for all paths. This is **not** a dangling DNS scenario — the IP is active and belongs to GCP. However:
- The service appears to be **non-functional or misconfigured** (every endpoint → 404)
- This could be a **decommissioned GTM server-side container** that was left running
- The Stape platform (stape.io) is a GTM Server-Side hosting provider
- If this was managed through Stape's infrastructure, the container may have been deleted but the DNS record survives
- **No information disclosure** found in any tested endpoint

### Risk Assessment
- **DNS takeover**: NOT possible (IP is live on GCP)
- **Data exposure**: None detected (all 404)
- **Recommendation**: Verify with cfcdigitaloficial.com.br if this service is still needed

---

## 3. email.cfcdigitaloficial.com.br — PARTIAL DANGLING RISK

### DNS Evidence
```
$ dig +short email.cfcdigitaloficial.com.br CNAME
email2.api-mail.com.

$ dig +short email2.api-mail.com A
104.236.254.28
72.14.182.88

$ dig cfcdigitaloficial.com.br MX +short
0 mail.cfcdigitaloficial.com.br.
10 mxa.api-mail.com.
10 mxb.api-mail.com.
```

### Infrastructure Analysis
- CNAME target: `email2.api-mail.com`
- **IP 104.236.254.28**: DigitalOcean (DO-13)
- **IP 72.14.182.88**: Linode (Akamai/Linode)
- `api-mail.com` itself resolves to SellFlux CRM (sellflux.com, a Brazilian CRM platform)
- `api-mail.com` is behind Cloudflare (elle.ns.cloudflare.com / roman.ns.cloudflare.com)

### What's actually running?
- HTTP on port 80: Redirect to HTTPS
- HTTPS on port 443: **Express.js** server (`X-Powered-By: Express`)
  - Headers show: `token-projeto`, `token-adm` (project/admin token auth — likely a SellFlux API)
  - Response: `<div></div>` (empty div — root endpoint)
  - All common endpoints: `Cannot GET /...` (404)
- SMTP (port 25, 587): **Closed**

### Analysis
The email subdomain is **NOT dangling** — the CNAME target `email2.api-mail.com` still resolves to active IPs (DO + Linode). However:
- `api-mail.com` appears to have been **rebranded/repurposed** as SellFlux CRM
- The Express server running shows a SellFlux-like API (token headers)
- The email service functionality (SMTP) is **not running**
- MX records show primary mail at `mail.cfcdigitaloficial.com.br` with backups at `mxa.api-mail.com` and `mxb.api-mail.com`
- **Risk**: If SellFlux/api-mail.com changes their infrastructure or drops the email2 subdomain, this becomes dangling

### SMTP Test
```
$ nc -w 2 email.cfcdigitaloficial.com.br 25
Connection timed out

$ nc -w 2 email.cfcdigitaloficial.com.br 587
Connection timed out
```

---

## 4. Summary of Findings

| Subdomain | Type | Status | Risk |
|-----------|------|--------|------|
| pixel.cfcdigitaloficial.com.br | CNAME → NXDOMAIN | **DANGLING** 🔴 | HIGH |
| stape.cfcdigitaloficial.com.br | A → 35.199.71.234 (GCP) | Live but dead | LOW |
| email.cfcdigitaloficial.com.br | CNAME → email2.api-mail.com | Active Express API | LOW |

### Recommendations
1. **IMMEDIATE**: Remove the CNAME record for `pixel.cfcdigitaloficial.com.br` — it currently points to an NXDOMAIN
2. **MEDIUM**: Verify `stape.cfcdigitaloficial.com.br` is still needed — all endpoints return 404
3. **LOW**: Monitor `email.cfcdigitaloficial.com.br` — if `api-mail.com` infrastructure changes, this could become dangling

---

*Research conducted 2026-09-13. DNS state verified via Google DNS (8.8.8.8).*