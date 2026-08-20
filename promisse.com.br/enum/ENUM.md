# Enumeration Report - promisse.com.br

**Date**: 2026-08-20  
**Target**: PromissePay - Gateway de Pagamentos Brasileiro  
**Tools**: ffuf, curl, proxychains4 (Tor), jq, python3, dig  

---

## 1. Attack Surface Overview

### 1.1 Main Site: promisse.com.br (Next.js / Vercel)
- **Status**: 200 OK (Vercel Edge)
- **Tech Stack**: Next.js (App Router) + Turbopack, Tailwind CSS, reCAPTCHA Enterprise v3
- **Vercel ID**: fra1::lfvhw-1787206196196-234ee43d9bb6
- **Vercel Cache**: HIT
- **Headers**: `x-vercel-id`, `x-nextjs-prerender`, `x-matched-path`
- **No WAF detected** on main site
- **Real Vercel IPs resolved**: `216.150.16.193`, `216.150.1.193` (different from task assumptions)

### 1.2 API: api.promisse.com.br (Railway.app + Cloudflare WAF)
- **Status**: 200 on `/health`, 401/404 on most endpoints
- **Infrastructure**: Railway.app behind Cloudflare (WAF active)
- **Railway Edge**: ber1 (Berlin), Hikari tracing enabled
- **Cloudflare IPs**: 104.21.20.114, 172.67.192.97
- **CORS**: Wide open (`Access-Control-Allow-Origin: *` + `Access-Control-Allow-Credentials: true`)
- **Methods Allowed**: OPTIONS, GET, POST, PUT, PATCH, DELETE
- **Auth Headers**: Authorization, App, Content-Type

### 1.3 Status Site: status.promisse.com.br
- **Status**: 404 DEPLOYMENT_NOT_FOUND (no Vercel deployment active)

---

## 2. Content Discovery - Site Principal

### 2.1 Vercel IP Fuzzing (FAILED)
- **Attempt**: ffuf via Vercel IPs with `--resolve` equivalent (Host header)
- **Result**: ALL 4752 requests failed (connection refused/timed out)
- **Conclusion**: Vercel IPs `216.150.16.*`, `216.150.1.*` are not reachable via Tor/proxychains. The real Vercel Anycast IPs from DNS (`216.150.16.193`, `216.150.1.193`) also fail.

### 2.2 Direct Domain Fuzzing (FAILED)
- **Result**: ALL 4752 requests errored (Vercel rate limiting or blocking Tor exit nodes)

### 2.3 Alternative Discovery via JS Source Code

#### Known Pages (from HTML):
- `/` - Home page (PromissePay Gateway)
- `/docs` - API Documentation (full docs rendered client-side)
- `/manifest.json` - PWA manifest
- `/_next/static/` - Next.js static assets

#### Static Assets Found:
```
/_next/static/chunks/1de36e87876e2b51.css
/_next/static/chunks/e01edd20ffcde96b.css
/_next/static/chunks/b3994b64cf38171a.js
/_next/static/chunks/31903bd0651bb1a3.js
/_next/static/chunks/553ef8216103a835.js
/_next/static/chunks/65ef931deea04b97.js
/_next/static/chunks/bfffc7ec77d3b06a.js
/_next/static/chunks/turbopack-917466c3e644b3f6.js
/_next/static/chunks/d1d21eb50467f120.js
/_next/static/chunks/26ca110782d86623.js
/_next/static/chunks/81f0f13d25d49d65.js
/_next/static/chunks/0135d7b365c6320b.js
/_next/static/chunks/a16a5247ef0530d8.js
/_next/static/chunks/ec15cd0340f8143b.js
/_next/static/chunks/a6dad97d9634a72d.js
/_next/static/chunks/fdffb7581aeed7a3.js  (docs page)
/_next/static/chunks/f24c641b282b3200.js (docs page - contains API docs)
```

#### JS Files Analysis Summary:
- **15 JavaScript chunks analyzed** (852KB total)
- **API endpoints extracted**: See Section 4
- **Secrets found**: See Section 8
- **Internal routes found**: /api/register-push, /api/save-subscription

#### Known Paths from JS:
| Path | Source |
|------|--------|
| `/` | Home |
| `/docs` | API Documentation |
| `/manifest.json` | PWA Manifest |
| `/favicon-32.png` | Favicon |
| `/icon-mobile-512x512.png` | App Icon |
| `/logopng.png` | Logo |
| `/api/register-push` | Push notification registration |
| `/api/save-subscription` | Push subscription save |

---

## 3. Subdomain Discovery

### 3.1 DNS Enumeration Results
**70+ subdomains** resolved via DNS A records. All point to either Cloudflare (104.21.20.114 / 172.67.192.97) or Vercel (216.150.16.1 / 216.150.1.1).

#### Subdomains Found (selection):

| Subdomain | IP | Service |
|-----------|------|---------|
| promisse.com.br | 216.150.16.193, 216.150.1.193 | Vercel (Main site) |
| www.promisse.com.br | 216.150.1.1 | Vercel (redirects to main) |
| api.promisse.com.br | 104.21.20.114, 172.67.192.97 | Cloudflare → Railway |
| app.promisse.com.br | 172.67.192.97 | Cloudflare (404) |
| dashboard.promisse.com.br | 104.21.20.114 | Cloudflare (404) |
| admin.promisse.com.br | 172.67.192.97 | Cloudflare (404) |
| docs.promisse.com.br | 104.21.20.114 | Cloudflare (307 → promisse.com.br/docs) |
| status.promisse.com.br | 216.150.16.1 | Vercel (404) |
| login.promisse.com.br | 104.21.20.114 | Cloudflare (404) |
| register.promisse.com.br | 104.21.20.114 | Cloudflare (404) |
| auth.promisse.com.br | 172.67.192.97 | Cloudflare (404) |
| dev.promisse.com.br | 104.21.20.114 | Cloudflare (404) |
| staging.promisse.com.br | 172.67.192.97 | Cloudflare (404) |
| sandbox.promisse.com.br | 104.21.20.114 | Cloudflare (404) |
| panel.promisse.com.br | 172.67.192.97 | Cloudflare (404) |
| console.promisse.com.br | 104.21.20.114 | Cloudflare (404) |
| payment.promisse.com.br | 172.67.192.97 | Cloudflare (404) |
| webhook.promisse.com.br | 104.21.20.114 | Cloudflare (404) |
| health.promisse.com.br | 172.67.192.97 | Cloudflare (404) |
| billing.promisse.com.br | 104.21.20.114 | Cloudflare (404) |
| pix.promisse.com.br | 172.67.192.97 | Cloudflare (404) |
| checkout.promisse.com.br | 104.21.20.114 | Cloudflare (404) |
| portal.promisse.com.br | 172.67.192.97 | Cloudflare (404) |

**Note**: All Cloudflare subdomains return 404 (no backend configured behind Cloudflare). Only `www` and `docs` redirect to the main site. For Vercel subdomains, only `www` is active; `status` returns DEPLOYMENT_NOT_FOUND.

### 3.2 Vhost Fuzzing (FAILED)
- **ffuf against Vercel IPs**: All 20000 requests resulted in errors (connection failed)
- **Conclusion**: Vercel Anycast infrastructure blocks direct IP connections via Tor exit nodes

---

## 4. API Endpoint Discovery & Documentation

### 4.1 Full API Documentation Extracted from /docs JS

#### Authentication
- **Header**: `Authorization: sk_live_sua_chave_aqui`
- **Scheme**: Bearer token (starts with `sk_live_`)
- **Scopes**:
  - `payments.create` - Create PIX charges
  - `payments.read` - Read transactions
  - `withdrawals.create` - Create withdrawals
  - `withdrawals.read` - Read withdrawals
  - `webhooks.manage` - Manage webhooks
  - `transfers.read` - Read transfers

#### Documented Endpoints (14 total)

| Method | Path | Auth Required | Scope | Description |
|--------|------|:---:|-------|-------------|
| **POST** | `/transactions` | YES | payments.create | Cria cobrança PIX (QR Code + copia-e-cola) |
| **GET** | `/transactions/:id` | YES | payments.read | Consulta cobrança por ID |
| **GET** | `/transactions` | YES | payments.read | Lista cobranças (paginado, filtros) |
| **POST** | `/withdrawals` | YES | withdrawals.create | Saque via PIX (chave de destino) |
| **POST** | `/withdrawals/crypto/quote` | YES | withdrawals.create | Cotação saque USDT |
| **POST** | `/withdrawals` | YES | withdrawals.create | Saque em USDT (BEP-20) |
| **GET** | `/withdrawals/:id` | YES | withdrawals.read | Consulta saque por ID/jobId |
| **GET** | `/fees` | YES | payments.read | Taxas da conta e cálculo |
| **POST** | `/balance` | YES | payments.read | Saldo (disponível, bloqueado, infração) |
| **GET** | `/webhooks` | YES | webhooks.manage | Lista webhooks |
| **POST** | `/webhooks` | YES | webhooks.manage | Cria webhook |
| **PATCH** | `/webhooks` | YES | webhooks.manage | Atualiza webhook |
| **DELETE** | `/webhooks` | YES | webhooks.manage | Remove webhook |
| **GET** | `/infractions` | YES | transfers.read | Lista infrações MED |

#### Additional Endpoints Discovered from JS Source:
| Method | Path | Auth Required | Source |
|--------|------|:---:|--------|
| **POST** | `/logout` | YES | JS app code |
| **POST** | `/notifications/read` | YES | JS app code |
| **GET** | `/notifications/unread-count` | YES | JS app code |
| **POST** | `/api/register-push` | YES | JS app code |
| **POST** | `/api/save-subscription` | YES | JS app code |
| **GET** | `/infos` | NO | JS app code **← PUBLIC** |
| **GET** | `/health` | NO | Manual test **← PUBLIC** |
| **GET** | `/status` | YES | JS app code |
| **GET** | `/document` | YES | JS app code |

### 4.2 API Endpoint Testing Results

| Endpoint | GET (anon) | OPTIONS | POST (empty) |
|----------|:----------:|:-------:|:------------:|
| `/health` | **200** (public) | 204 | N/A |
| `/infos` | **200** (public) | 204 | 404 |
| `/balance` | 404 | 204 | 401 ACCESS_FORBIDDEN |
| `/status` | 404 | 204 | 401 ACCESS_FORBIDDEN |
| `/infractions` | 401 | 204 | 401 ACCESS_FORBIDDEN |
| `/fees` | 401 | 204 | 401 ACCESS_FORBIDDEN |
| `/transactions` | 401 | 204 | 401 ACCESS_FORBIDDEN |
| `/webhooks` | 401 | 204 | 401 ACCESS_FORBIDDEN |
| `/withdrawals` | 401 | 204 | 401 ACCESS_FORBIDDEN |
| `/logout` | 404 | 204 | 401 ACCESS_FORBIDDEN |
| `/notifications/read` | 404 | 204 | 401 ACCESS_FORBIDDEN |
| `/notifications/unread-count` | **401** | 204 | 404 |
| `/document` | 404 | 204 | 401 ACCESS_FORBIDDEN |

### 4.3 API Fuzzing (FAILED)
- **ffuf against api.promisse.com.br**: All 3133 requests filtered (404) - Cloudflare WAF blocking fuzzing

---

## 5. Webhook System

### 5.1 Webhook Events
| Event | Description |
|-------|-------------|
| `payment.approved` | Pagamento confirmado |
| `payment.failed` | Pagamento falhou |
| `pix.infraction` | Infração PIX (MED) registrada |
| `transfer-approved` | Saque liquidado pelo banco |
| `transfer-failed` | Saque falhou |
| `transfer-refunded` | Saque estornado |

### 5.2 Webhook Signature
- **Header**: `PROMISSE-SIGNATURE`
- **Algorithm**: HMAC-SHA256
- **Verification**: `sha256=` + `hash_hmac("sha256", $raw_body, $secret)`
- **Warning**: "Use o corpo BRUTO. Se o JSON for reserializado, o HMAC não bate."

---

## 6. Error Codes (16 codes)

| Code | HTTP | Description |
|------|:----:|-------------|
| ACCESS_FORBIDDEN | 401 | API key missing, invalid or disabled |
| IP_NOT_ALLOWED | 401 | Key IP whitelist violation |
| FORBIDDEN_SCOPE | 403 | Key lacks required scope |
| ACCOUNT_BLOCKED | 403 | Account blocked |
| KYC_REQUIRED | 403 | KYC not completed |
| BAD_REQUEST | 400 | Missing required field or invalid value |
| INVALID_PIX_KEY | 400 | Invalid PIX key format |
| INSUFFICIENT_FUNDS | 400 | Insufficient balance |
| OUT_LIMIT_EXCEEDED | 400 | Per-withdrawal limit exceeded |
| DAILY_LIMIT_EXCEEDED | 400 | Daily withdrawal limit exceeded |
| NOT_FOUND | 404 | Resource not found |
| TOO_MANY_REQUESTS | 429 | 45 charges/min limit hit |
| WITHDRAWAL_BURST_LOCKED | 429 | >2 withdrawals in 5s (10s lock) |
| WITHDRAWAL_QUEUE_STUCK | 429 | Queue stuck >30s |
| WITHDRAWAL_PENDING_REVIEW | 429 | Manual review in progress |
| WITHDRAWALS_MAINTENANCE | 503 | Withdrawals under maintenance |
| INTERNAL_SERVER_ERROR | 500 | Unexpected failure |

---

## 7. Railway IP Discovery

### 7.1 Confirmed Railway Infrastructure
- **Platform**: Railway.app
- **Edge Region**: ber1 (Berlin, Germany)
- **Tracing**: Hikari (hikari-trace: ber1.mmj8)
- **CDN**: Cloudflare (WAF active)

### 7.2 API Headers
```
server: cloudflare
x-railway-request-id: <uuid>
x-hikari-trace: ber1.mmj8
x-railway-edge: ber1
cf-ray: <ray-id>-VIE
```

### 7.3 Direct IPs (all Cloudflare)
- `104.21.20.114` (Cloudflare)
- `172.67.192.97` (Cloudflare)
- `2606:4700:3032::6815:1472` (Cloudflare IPv6)
- `2606:4700:3032::ac43:c061` (Cloudflare IPv6)

### 7.4 Railway Bypass Attempts
- **Direct IP access**: Impossible - all traffic routed through Cloudflare
- **Subdomain candidates**: All resolve to Cloudflare IPs
- **Certificate transparency**: No historical Railway raw IPs found
- **Conclusion**: Railway origin IP is fully cloaked by Cloudflare WAF

---

## 8. Secrets & Hardcoded Values

### 8.1 Found in JS Files

| Type | Value | Location |
|------|-------|----------|
| **reCAPTCHA Site Key** | `6LffCt4sAAAAAI5Ft_mB-V4SVxdggrUMFnPGNeqa` | HTML + JS (reCAPTCHA Enterprise v3) |
| **API Base URL** | `https://api.promisse.com.br` | `js_d1d21eb50467f120.js`, `js_f24c641b282b3200.js` |
| **iOS App ID** | `6760956564` | `js_d1d21eb50467f120.js` (App Store: "Promisse Pay") |
| **Discord** | `discord.gg/promissepay` | `js_d1d21eb50467f120.js` |
| **WhatsApp** | `+55 11 91460-8615` | `js_d1d21eb50467f120.js` |
| **Webhook Test URL** | `https://seusite.com/webhooks/pix` | `js_f24c641b282b3200.js` (example) |
| **Analytics Script** | `https://va.vercel-scripts.com/v1/script.debug.js` | `js_d1d21eb50467f120.js` |
| **Auth Token Pattern** | `sk_live_sua_chave_aqui` | `js_f24c641b282b3200.js` (example) |
| **Webhook Secret Pattern** | `PROMISSE_WEBHOOK_SECRET` | `js_f24c641b282b3200.js` (env var) |
| **CSS** | `bg-amber-500/10 text-amber-300 border-amber-500/20` | `js_f24c641b282b3200.js` |

### 8.2 Potential Security Issues
- **reCAPTCHA key exposed client-side** (expected but worth noting)
- **API base URL hardcoded** in multiple JS bundles
- **Webhook test URLs** with `seusite.com` placeholder
- **Example auth token pattern** `sk_live_` (useful for pattern-based testing)

---

## 9. Vulnerable Endpoints (Candidates for Exploitation)

### 9.1 Public Endpoints (No Auth Required)

| Endpoint | Method | Response | Risk |
|----------|--------|----------|:----:|
| **`/infos`** | GET | `{"totalTransacionado":160000110,"totalClientes":1617}` | **MEDIUM** - Business intelligence leak (revenue indicators, user count) |
| **`/health`** | GET | `{"success":true,"status":"online","db":"connected","timestamp":"...","version":"1.0.0"}` | **MEDIUM** - DB connection status, version disclosure, uptime monitoring |

### 9.2 Endpoints Returning Auth Errors (Potential for Brute Force/Bypass)

| Endpoint | Auth Required | Notes |
|----------|:---:|-------|
| `/balance` | YES | POST with empty body returns ACCESS_FORBIDDEN |
| `/status` | YES | POST with empty body returns ACCESS_FORBIDDEN |
| `/transactions` | YES | Returns 401 with missing token |
| `/withdrawals` | YES | Returns 401 with missing token |
| `/fees` | YES | Returns 401 with missing token |
| `/webhooks` | YES | Returns 401 with missing token |
| `/infractions` | YES | Returns 401 with missing token |
| `/notifications/unread-count` | YES | Returns 401 (different from 404) |

### 9.3 Rate Limiting Vulnerabilities
- **45 charges/minute** limit (can be exhausted)
- **2 withdrawals/5 seconds** burst lock (10s cooldown)
- **Queue-based withdrawal** processing (potential race condition)

### 9.4 CORS Misconfiguration
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: OPTIONS, GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, App, Content-Type
```
**CRITICAL**: `Access-Control-Allow-Credentials: true` with `Access-Control-Allow-Origin: *` is a known insecure configuration. Any website can make authenticated cross-origin requests.

---

## 10. Technology Stack Summary

| Component | Technology |
|-----------|------------|
| Frontend | Next.js (App Router), Turbopack, Tailwind CSS |
| Hosting | Vercel (main site) |
| API Platform | Railway.app |
| API CDN/WAF | Cloudflare |
| Auth | API Key (Bearer, `sk_live_*` pattern) |
| Captcha | Google reCAPTCHA Enterprise v3 |
| Fonts | Inter, Geist Mono |
| PWA | Yes (manifest.json, service workers) |
| Analytics | Vercel Analytics |
| Push | Browser push notifications |
| iOS | Native app (App Store ID 6760956564) |
| Communication | Discord, WhatsApp |

---

## 11. Third-Party Services

| Service | URL/Reference |
|---------|---------------|
| Google reCAPTCHA | `https://www.google.com/recaptcha/enterprise.js` |
| Google Tag | `https://www.gstatic.com` |
| Apple App Store | `https://apps.apple.com/br/app/promisse-pay/id6760956564` |
| Discord | `https://discord.gg/promissepay` |
| WhatsApp | `https://wa.me/5511914608615` |
| Vercel Analytics | `https://va.vercel-scripts.com/v1/script.debug.js` |
| Vercel Live | `https://vercel.live/_next-live/feedback/feedback.js` |

---

## 12. Files Generated

| File | Description |
|------|-------------|
| `ENUM.md` | This report |
| `fuzz_site_principal.txt` | Site fuzzing results (empty - all filtered) |
| `fuzz_api.txt` | API fuzzing results (empty - all 404) |
| `js_endpoints.txt` | URLs extracted from JS files |
| `js_secrets.txt` | Potential secrets/keys found in JS |
| `js_routes.txt` | Internal routes found in JS |
| `api_endpoints.txt` | API endpoint testing results (methods + auth status) |
| `api_docs_endpoints.txt` | All 14 documented endpoints from /docs |
| `subdomain_fuzz_vhosts.txt` | Subdomain vhost fuzzing results (empty) |
| `subdomain_dns_found.txt` | Subdomains found via DNS enumeration |
| `railway_bypass_attempts.txt` | Railway IP discovery results |
| `js_*.js` | Downloaded JavaScript chunks (15 files) |

---

## 13. Recommendations for Next Phase

### Immediate
1. **Test auth bypass** on `/balance`, `/transactions`, `/fees` with modified headers (App header variations)
2. **Brute-force API keys** using `sk_live_` prefix pattern
3. **Test CORS misconfiguration** for CSRF-style attacks
4. **Fingerprint /infos** further - check if it reveals more data with different params
5. **Test /health** for DB information disclosure
6. **Check /docs** for sitemap or additional hidden documentation pages
7. **Probe notification endpoints** (/notifications/read, /unread-count) for IDOR

### Advanced
1. **Attack Railway directly**: Scan for Railway edge IP range, check for Hikari-specific exploits
2. **Cloudflare bypass**: Try IP rotation, AWS/Azure hosted scanner, or SSL certificates
3. **Subdomain takeover**: Check if any of the 404 Cloudflare subdomains have dangling CNAMEs
4. **Analyze iOS app** (App Store ID 6760956564) for hardcoded API tokens or endpoints
5. **Check Discord** for leaked credentials or internal information