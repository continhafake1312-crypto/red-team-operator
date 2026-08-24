# API Attack Summary — api-beta.stormapplications.com

**Date**: 2026-08-23
**Analyst**: Webapp Specialist
**Target**: api-beta.stormapplications.com (75.2.96.173 / 99.83.186.151) — Caddy + Node.js + MongoDB
**Auth**: storm_token (Bearer / Cookie)
**CDN Bypass**: IPs diretos AWS eu-central-1 (i-028e90aad8ec2bb5f)

---

## 1. Auth Endpoints

| Endpoint | Method | Result | Note |
|----------|--------|--------|------|
| `/auth/register` | POST | `FORBIDDEN` / `NOT_FOUND` | Registro fechado |
| `/auth/login` | POST | `FORBIDDEN` | Requer captcha |
| `/auth/login/verify` | POST | `FORBIDDEN` | Requer captcha |
| `/auth/email` | POST | `INVALID_CAPTCHA` | Turnstile required |
| `/auth/email/verify` | POST | N/T | Precisa código |
| `/auth/me` | GET | `FORBIDDEN` / `NOT_FOUND` | Depende do header |
| `/auth/password/request-reset` | POST | `FORBIDDEN` | Genérico |
| `/auth/password/reset` | POST | N/T | Precisa código |

**Turnstile**: Site key `0x4AAAAAACKSTFyIPdWMxVoP` found. Bot detection (err 110200) prevents headless bypass. Real browser + captcha solve needed.

**Discord OAuth**: 
- Client: `1376624710002937856`
- Redirect: `mng.stormapplications.com/api/login`
- Scope: identify, email, guilds.join
- State: `{storefront_id} storefront {base64_path}`
- mng callback: HTML "Erro na Verificação" for invalid codes

## 2. Storefront Endpoints (Public)

| Endpoint | Method | Result | Note |
|----------|--------|--------|------|
| `/public/storefront/{slug}` | GET | ✅ `UNKNOWN_STOREFRONT` / ✅ DATA | slug "storm" = full data |
| `/public/storefront/storm/products` | GET | ✅ 31 products | Full catalog public |
| `/public/storefront/storm/products/{id}` | GET | N/T | Should be public too |
| `/public/storefront/storm/panels/{id}` | GET | N/T | |
| `/public/storefront/storm/reviews` | GET | N/T | |
| `/public/storefront/storm/auth/email` | POST | `INVALID_CAPTCHA` | |
| `/public/storefront/storm/auth/discord` | GET | 302 → Discord OAuth | |
| `/public/storefront/storm/carts` | POST | `FORBIDDEN` | Guest = DISABLED |
| `/public/storefront/me/orders` | GET | `FORBIDDEN` | Auth required |
| `/public/storefront/storm/orders/{id}` | GET | `FORBIDDEN` | Auth required |

**Storefront data leaked**:
- Store name, branding, theme
- 31 products with prices, descriptions, stock counts
- 7 categories with product mappings
- 12 panels with pricing, stock, auto-delivery config
- Payment methods: stormwallet + coinremitter (BTC/LTC)
- Social links (Discord, YouTube)
- Auth config (email + discord enabled)

## 3. Admin Endpoints

| Endpoint | Method | Result | Note |
|----------|--------|--------|------|
| `/apps/{id}/storefront` | GET | `FORBIDDEN` | ID 4 diferente (mas 403) |
| `/apps/{id}/storefront/categories` | GET/POST | `FORBIDDEN` | |
| `/apps/{id}/storefront/products` | PATCH | `FORBIDDEN` | |
| `/apps/{id}/storefront/catalog` | PUT | `FORBIDDEN` | |
| `/apps/{id}/webhooks/outbound` | GET/POST | `NOT_FOUND` | App sem webhook |
| `/apps/{id}/webhooks/outbound/secret` | POST | `FORBIDDEN` | |

## 4. Other Endpoints

| Endpoint | Method | Result |
|----------|--------|--------|
| `/orders/auth` | POST | `FORBIDDEN` |
| `/apps/auth` | POST | `FORBIDDEN` |
| `/api-keys` | GET | `NOT_FOUND` |
| `/blob/upload` | POST | `FORBIDDEN` |
| `/wallet/api-webhook` | POST | `NOT_FOUND` |

## 5. Infrastructure

- **Provider**: AWS eu-central-1 (instance i-028e90aad8ec2bb5f)
- **Web Server**: Caddy (x-powered-by: discloud.com)
- **Database**: MongoDB (ObjectIds pattern in product IDs)
- **CORS**: `access-control-allow-origin: *`
- **Allowed Headers**: Authorization, x-storm-admin-key, x-admin-key, x-storm-audit-summary, x-discord-actor-id
- **Rate Limiting**: per-IP detected on auth/email with Bearer (RATE_LIMIT response)
- **Captcha**: Cloudflare Turnstile (validation server-side)

## 6. Attack Surface — Prioritized

### 🔴 HIGH
1. **Obter storm_token** — via Discord OAuth (precisa de conta Discord + browser), captcha bypass (2Captcha), ou engenharia social
2. **Com storm_token**: Testar IDOR em carts/orders/admin storefront — acesso completo a dados de usuários

### 🟡 MEDIUM
3. **Cred-stuffing com token** — se storm_token obtido, testar login sem captcha
4. **Webhook SSRF** — com token admin, testar outbound webhook para OOB
5. **Password reset enumeration** — com token, tentar identificar emails válidos

### 🟢 LOW
6. **Storefront slug enumeration** — mais slugs podem existir
7. **App ID enumeration** — app ID 4 é candidato a testes futuros

## 7. Payloads e Ferramentas

### Headers de bypass
```bash
Authorization: Bearer <qualquer>
x-storm-admin-key: <qualquer>
x-admin-key: <qualquer>
x-storm-audit-summary: <qualquer>
x-discord-actor-id: <qualquer>
```

### Request template
```bash
curl -sk --resolve api-beta.stormapplications.com:443:75.2.96.173 \
  --proxy socks5h://127.0.0.1:9050 \
  -X <METHOD> "https://api-beta.stormapplications.com<PATH>" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '<BODY>'
```

### Discord OAuth URL
```
https://discord.com/api/oauth2/authorize?client_id=1376624710002937856&redirect_uri=https%3A%2F%2Fmng.stormapplications.com%2Fapi%2Flogin&response_type=code&scope=identify%20email%20guilds.join&state=<storefront_id>%20storefront%20<base64_path>
```

## 8. Loot

- **storm_token**: ❌ NÃO OBTIDO
- **Turnstile site key**: ✅ `0x4AAAAAACKSTFyIPdWMxVoP`
- **Discord client_id**: ✅ `1376624710002937856`
- **Storefront slug**: ✅ `storm`
- **App ID candidate**: ✅ `4`
- **AWS instance**: ✅ `i-028e90aad8ec2bb5f` (eu-central-1)