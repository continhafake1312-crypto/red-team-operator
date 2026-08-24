# JS Deep Enumeration Report

## Summary

- **Total chunks downloaded**: 71 (38 www + 33 marketplacee)
- **Total size**: ~5.2MB
- **Page-specific chunks analyzed**: 19 unique to www, 7 unique to marketplacee
- **Secrets found**: 0 hardcoded secrets (client_secret, API keys, JWT, etc.)
- **API endpoints discovered**: 30+ from decompiled code
- **New findings**: Turnstile captcha reference, full storefront API, internal auth routes

## Chunks Analysis

### www.stormapplications.com (38 chunks, 2.7MB)

| Chunk | Type | Size | Interesting Content |
|-------|------|------|-------------------|
| 0bahtdi58m7qr | Shared | 38KB | **API core module** - base URL `https://api-beta.stormapplications.com`, auth token mgmt (`storm_token`) |
| 2e10e1_qcr786 | Shared | 92KB | Wallet API config (`NEXT_PUBLIC_WALLET_API_URL` → `https://wallet.stormapplications.com`), auth routes |
| 2obe8y1b2wcyi | Login | 26KB | Turnstile captcha bridge, login form |
| 07kpy4vctbuzx | Tutoriais | 54KB | Auth sub-routes (`/auth/settings`, `/auth/servidores`, etc.) |
| 0qxqk56wwh_lo | Bot-discord | 58KB | Bot de vendas Discord page |
| 0zhfw-qevbde8 | Shared | 45KB | Webhook endpoints: `/apps/{id}/webhooks/outbound/secret`, outbound webhook testing |
| 368_7nuvtyq9v | Tutoriais | 60KB | Tutorial: "Passo 1 — Credenciais" with OAuth token+client_secret instructions |
| 39qu4ys24veye | Shared | 324KB | Discord OAuth UI (`"https://discord.com/oauth2/authorize"`), payment configs |
| 3xodg197dq0e2 | Tutoriais | 33KB | OAuth settings, profile management |
| 3vpjo0vo2hrt4 | Shared (www) | 82KB | Discord server IDs (guild IDs) |
| 1d5rakdowyqiy | Shared | 135KB | Discord bot services, emoji management |
| 2a9tg-xjw6aqf | Shared | 335KB | Discord IDs, Next.js internals |

### marketplacee.stormapplications.com (33 chunks, 2.5MB)

| Chunk | Type | Size | Interesting Content |
|-------|------|------|-------------------|
| 3y_ukoepnxiga | Exclusive | 43KB | **Storefront API service** — full CRUD for storefronts, carts, orders, products, panels |
| 26u6uj_ypisnc | Login | 29KB | Auth flow: Cloudflare Turnstile, email auth, Discord redirect |
| 2e_clcd-wht1g | Exclusive | 99KB | Cart & order UI for marketplace |
| 2qzbtu2fa8ejy | Exclusive | 42KB | User menu, Discord linking |
| 42x0_dknnj7mi | Exclusive | 2KB | Storefront token management |
| 1z72o200b4hn7 | Exclusive | 60KB | Marketplace locale storage key |

## Secrets Search Results

### Discord client_secret: ❌ NOT FOUND
- No hardcoded Discord client_secret found in any chunk
- The known client_id `1479423351880683551` is NOT in any frontend chunk (server-side config)
- References to `client_secret` are UI labels / error messages only
- Values are stored server-side in database, fetched via API

### API Keys / JWT / AWS / Stripe: ❌ NOT FOUND
- No `sk_live_`, `sk_test_`, `pk_live_`, `rk_live_` Stripe keys
- No `AKIA` AWS keys
- No JWT tokens (`eyJ...`)
- No hardcoded `Authorization` tokens

### Webhooks: ⚠️ PARTIAL
- Webhook testing endpoints identified:
  - `POST /apps/{id}/webhooks/outbound/secret` (generate secret)
  - `GET|POST /apps/{id}/webhooks/outbound` (test webhook)
- Discord webhook URL format referenced: `https://discord.com/api/webhooks/...`
- No actual webhook URLs hardcoded

## API Endpoints Discovered

### Base URL: `https://api-beta.stormapplications.com`
### Auth Token: `storm_token` (cookie + localStorage)

### Auth Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Login |
| `/auth/login/verify` | POST | Verify login |
| `/auth/register` | POST | Register |
| `/auth/password/request-reset` | POST | Password reset request |
| `/auth/password/reset` | POST | Password reset |
| `/auth/me` | GET | Current user |
| `/auth/email` | POST | Email auth |
| `/auth/email/verify` | POST | Verify email |
| `/orders/auth` | POST | Order auth |
| `/apps/auth` | POST | App auth |

### Storefront API (marketplace only) — from `3y_ukoepnxiga.js`
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/public/storefront/{slug}` | GET | Get storefront |
| `/public/storefront/{slug}/products` | GET | List products |
| `/public/storefront/{slug}/products/{id}` | GET | Get product |
| `/public/storefront/{slug}/panels/{id}` | GET | Get panel |
| `/public/storefront/{slug}/reviews` | GET | Review highlights |
| `/public/storefront/{slug}/auth/me` | GET | Storefront auth check |
| `/public/storefront/{slug}/auth/email` | POST | Request email code |
| `/public/storefront/{slug}/auth/email/verify` | POST | Verify email code |
| `/public/storefront/{slug}/auth/discord` | GET | Discord login URL generator |
| `/public/storefront/{slug}/auth/discord/link/prepare` | POST | Prepare Discord link |
| `/public/storefront/{slug}/carts` | POST | Create cart |
| `/public/storefront/{slug}/carts/{id}` | GET | Get cart |
| `/public/storefront/{slug}/carts/{id}/items` | POST/PATCH/DELETE | Cart items |
| `/public/storefront/{slug}/carts/{id}/coupon` | POST/DELETE | Coupon mgmt |
| `/public/storefront/{slug}/carts/{id}/checkout` | POST | Checkout |
| `/public/storefront/{slug}/checkout` | POST | Batch checkout |
| `/public/storefront/{slug}/orders/{id}` | GET | Get order |
| `/public/storefront/{slug}/orders/{id}/review` | POST | Review order |
| `/public/storefront/{slug}/coupon/preview` | POST | Preview coupon |
| `/public/storefront/by-domain` | GET | Find by domain |
| `/public/storefront/me/orders` | GET | My orders |

### Admin Storefront Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/apps/{id}/storefront` | GET/PATCH | Admin storefront |
| `/apps/{id}/storefront/categories` | GET/POST | Category CRUD |
| `/apps/{id}/storefront/categories/{id}` | PATCH/DELETE | Category update/delete |
| `/apps/{id}/storefront/products` | PATCH | Set visible products |
| `/apps/{id}/storefront/catalog` | PUT | Sync catalog |
| `/apps/{id}/storefront/slug-check` | GET | Check slug availability |
| `/apps/{id}/storefront/domain/verify` | POST | Domain verification |
| `/apps/{id}/storefront/domain/connect` | POST | Domain connection |

### Webhook Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/apps/{id}/webhooks/outbound/secret` | POST | Generate webhook secret |
| `/apps/{id}/webhooks/outbound` | GET/POST | Test outbound webhook |
| `/wallet/api-webhook` | POST | Wallet webhook |

### Other Endpoints
| Endpoint | Description |
|----------|-------------|
| `/api-keys` | API key management |
| `/blob/upload` | Blob upload (POST) |
| `/orders/auth` | Order auth |
| `/apps/auth` | App auth |

## Internal Route Structure (Next.js Pages)

```
/
/login
/dashboard
/planos
/servicos
/wallet
/bot-de-vendas-discord
/termos
/privacidade
/tutoriais
/tutoriais/comprar-plano
/tutoriais/comprar-membros
/apps
/faturas
/auth
/auth/login
/auth/register
/auth/password/reset
/auth/settings
/auth/servidores
/auth/servers
/auth/team
/auth/membros
/auth/billing
/auth/configurar
/auth/configurar/aparencia
/auth/configurar/conexao
/auth/configurar/confirmacao
/auth/emails
/auth/experiencia
/auth/gifts
/auth/import
/auth/message
/auth/operacao
/auth/push
/auth/backup
/auth/users
/api-keys
```

## Environment Variables Referenced
| Variable | Value/Hint |
|----------|------------|
| `NEXT_PUBLIC_WALLET_API_URL` | `https://wallet.stormapplications.com` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | (not hardcoded, required in `.env.local`) |
| `VITE_*` env vars | Previously found in earlier vendor bundles |
| `PUBLIC_API_BASE_URL` | Referenced in CoinRemitter config |

## External Services Referenced
- **api-beta.stormapplications.com** — Main API backend
- **wallet.stormapplications.com** — Wallet/stripe API
- **blob.stormapplications.com** — CDN for blobs and emojis
- **Cloudflare Turnstile** — Captcha
- **discord.com/api/oauth2** — Discord OAuth
- **discord.com/api/webhooks** — Discord webhooks
- **api.qrserver.com** — QR code generation (PIX)
- **CoinRemitter** — Cryptocurrency payments

## Key Technical Details
- **Framework**: Next.js with Turbopack bundler (no traditional `_buildManifest.js`)
- **Auth**: `storm_token` in localStorage + cookie, `Authorization` header
- **API**: `https://api-beta.stormapplications.com` base URL with path-based routing
- **Console warnings**: INVALID_CLIENT_SECRET, INVALID_WEBHOOK, etc. in error handling
- **Turnstile Bridge**: `/turnstile-bridge` path on www for captcha

## Conclusion
No hardcoded Discord client_secret or other critical secrets found in frontend JS. Secrets are server-side managed through `api-beta.stormapplications.com`. The Discord OAuth client_id (`1479423351880683551`) is not present in any frontend chunk — it's injected server-side or in the API backend environment.