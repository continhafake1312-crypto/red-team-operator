# HTTP Headers Analysis — focusconcursos.com.br

**Date:** 2026-08-26 16:07 UTC
**Method:** proxychains4 curl (HEAD + OPTIONS + full response)

---

## 1. Server Header Versions (Info Disclosure)

| Host | Server Header | Version Leak? |
|------|--------------|---------------|
| admin | nginx | No |
| lms | nginx | No |
| pxa | (none) | No |
| www3 | (none - Next.js) | No |
| payment | nginx | No |
| integration | nginx | No |
| sac | cloudflare | No |
| noticias | (none - Next.js) | No |
| webmail | (empty response) | N/A |
| **vc** | **nginx/1.31.1** | **YES** |
| focusconcursos.com.br | (none - Next.js/CloudFront) | No |
| cdn | gocache | No |
| lps | cloudflare | No |
| 18.233.104.160 | (none) | No |
| 38.211.129.213 | Caddy | No |
| mobile | nginx | No |
| email | Caddy | No |
| pagina | cloudflare | No |

**⚠️ nginx/1.31.1** on `vc.focusconcursos.com.br` — 1.31.1 is a mainline/dev version.

---

## 2. Security Headers Check

| Host | HSTS | X-Frame-Options | X-Content-Type-Options | X-XSS-Protection | CSP |
|------|------|-----------------|------------------------|------------------|-----|
| admin | ❌ | ❌ | ❌ | ❌ | ❌ |
| lms | ❌ | ❌ | ❌ | ❌ | ❌ |
| **pxa** | **✅** (63072000, preload) | **✅** SAMEORIGIN | **✅** nosniff | **✅** 1; mode=block | ❌ |
| www3 | ❌ | ❌ | ❌ | ❌ | ❌ |
| payment | ❌ | ❌ | ❌ | ❌ | ❌ |
| integration | ❌ | ❌ | ❌ | ❌ | ❌ |
| sac | ⚠️ (2592000) | ❌ | ❌ | ❌ | ❌ |
| **noticias** | **✅** (63072000, sub) | **✅** SAMEORIGIN | **✅** nosniff | ❌ | ❌ |
| webmail | — | — | — | — | — |
| vc | ❌ (301 redirect only) | ❌ | ❌ | ❌ | ❌ |
| focusconcursos | ❌ | ❌ | ❌ | ❌ | ❌ |
| cdn | ❌ | ❌ | ❌ | ❌ | ❌ |
| lps | ❌ | ❌ | ❌ | ❌ | ❌ |
| **18.233.104.160** | ❌ | **✅** SAMEORIGIN | **✅** nosniff | ✅ (0) | ✅ (full) |
| 38.211.129.213 | ❌ | ❌ | ❌ | ❌ | ❌ |
| mobile | ❌ | ❌ | ❌ | ❌ | ❌ |
| email | ❌ | ❌ | ❌ | ❌ | ❌ |
| pagina | ⚠️ (2592000) | ❌ | ❌ | ❌ | ❌ |

---

## 3. Cookie Security

| Host | Cookie | HttpOnly | Secure | SameSite | Max-Age |
|------|--------|----------|--------|----------|---------|
| admin | XSRF-TOKEN | ❌ | ❌ | ❌ | 7200s |
| admin | admin_session | **✅** | ❌ | ❌ | 7200s |
| lms | XSRF-TOKEN | ❌ | ❌ | ❌ | 7200s |
| lms | lms_session | **✅** | ❌ | ❌ | 7200s |
| pxa | XSRF-TOKEN | ❌ | ❌ | **✅** lax | 7200s |
| pxa | pixel_x_app_dash_session | **✅** | ❌ | **✅** lax | 7200s |
| integration | XSRF-TOKEN | ❌ | ❌ | **✅** lax | 7200s |
| integration | laravel_session | **✅** | ❌ | **✅** lax | 7200s |
| sac | __cf_bm | **✅** | **✅** | **✅** None | ~30min |
| cdn | __goc_session__ | **✅** | **✅** | **✅** Lax | 7d |
| **focusconcursos** | version | **❌** | **❌** | **❌** | 1y |
| **focusconcursos** | @focusconcursos:slug | **❌** | **❌** | **❌** | 1y |
| **focusconcursos** | @focusconcursos:appToken | **❌** | **❌** | **❌** | 1y |

**⚠️ CRITICAL:** `@focusconcursos:appToken` is a **JWT** (`eyJhbGciOiJIUzI1NiIs...`) set without HttpOnly/Secure/SameSite flags — accessible via JavaScript. 1-year expiry.

---

## 4. CORS Misconfigurations

| Host | ACAO | ACAM | ACAH | Vulnerable? |
|------|------|------|------|-------------|
| admin | ❌ (405) | — | — | ❌ |
| lms | ❌ (405) | — | — | ❌ |
| pxa | ❌ (405) | — | — | ❌ |
| **www3** | **✅ *** | **GET,POST,PUT,DELETE,OPTIONS** | Content-Type, Authorization, Token, g-repatch | **⚠️ WILDCARD** |
| payment | ❌ (405) | — | — | ❌ |
| integration | ❌ (405) | — | — | ❌ |
| **sac** | **✅ *** | **GET,HEAD,PUT,PATCH,POST,DELETE** | (via vary) | **⚠️ WILDCARD** |
| noticias | ❌ (405) | — | — | ❌ |
| webmail | — | — | — | — |
| vc | ❌ (301) | — | — | ❌ |
| **focusconcursos** | **✅ *** | **GET,POST,PUT,DELETE,OPTIONS** | Content-Type, Authorization, Token, g-repatch | **⚠️ WILDCARD** |
| cdn | ❌ (403) | — | — | ❌ |
| lps | ❌ (200, no ACAO) | — | — | ❌ |
| 18.233.104.160 | ❌ (404) | — | — | ❌ |
| 38.211.129.213 | ❌ (302) | — | — | ❌ |
| mobile | ❌ (405) | — | — | ❌ |
| email | ❌ (200, no ACAO) | — | — | ❌ |
| **pagina** | **✅ *** | **GET,HEAD,PUT,PATCH,POST,DELETE** | (via vary) | **⚠️ WILDCARD** |

**4 hosts with wildcard CORS (`Access-Control-Allow-Origin: *`):** www3, sac, focusconcursos.com.br, pagina

---

## 5. Interesting/Info-Leaking Headers

| Header | Hosts | Significance |
|--------|-------|-------------|
| `x-powered-by: Next.js` | www3, noticias, vc, focusconcursos | Framework disclosure |
| `x-powered-by: Express` | sac, pagina | Framework disclosure |
| `x-middleware-rewrite` | www3 (`/redirect`), focusconcursos (`/focusconcursos/`) | Internal route leak |
| `server: nginx/1.31.1` | vc | **Version disclosure** |
| `x-amz-bucket-region: sa-east-1` | cdn | S3 region disclosure |
| `x-amz-cf-pop: MIA50-P7` | vc, focusconcursos | CloudFront edge location |
| `x-cloud-trace-context` | sac, pagina | Google Cloud trace ID |
| `x-nextjs-prerender: 1` | noticias | Static prerender indicator |
| `x-gocache-cachestatus` | cdn | Cache backend info |
| `via: 1.1 google` | lps | Google proxy in path |
| `via: CloudFront` | vc, focusconcursos | CloudFront CDN |

---

## 6. Summary by Severity

### 🔴 CRITICAL
- **JWT in cookie without HttpOnly/Secure/SameSite** — `focusconcursos.com.br` and `vc.focusconcursos.com.br` set `@focusconcursos:appToken` (JWT) accessible via JS, 1-year expiry
- **CORS wildcard on 4 production hosts** — `www3`, `sac`, `focusconcursos.com.br`, `pagina` allow any origin

### 🟠 HIGH
- **nginx/1.31.1 version disclosure** on `vc.focusconcursos.com.br`
- **6 hosts missing ALL security headers** (admin, lms, www3, payment, focusconcursos, mobile)
- **XSRF-TOKEN cookies without HttpOnly** on admin, lms, pxa, integration

### 🟡 MEDIUM
- **HSTS short max-age** on `sac` and `pagina` (2592000 = ~30d, should be 63072000)
- **S3 bucket region leaked** on `cdn` (sa-east-1)
- **CloudFront edge location leaked** on vc, focusconcursos

### 🔵 INFO
- Next.js, Express, Laravel framework disclosures
- Internal middleware rewrite paths exposed
- goCache cache status headers