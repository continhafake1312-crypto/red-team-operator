# ENUM — Deep Enumeration nerix.com.br

**Data**: 2026-08-23  
**Operador**: enum (specialist)  
**Alvo**: nerix.com.br — Plataforma SaaS e-commerce multi-tenant

---

## 1. SOURCE MAPS

**Veredito**: ❌ NÃO DISPONÍVEIS

Todos os 8 source maps `.js.map` retornaram HTTP 200 mas contêm o HTML do SPA (5.2KB). O servidor Cloudflare trata `.js.map` como rota SPA catch-all.

### Bundles testados:
| Bundle | .map HTTP | Conteúdo |
|--------|-----------|----------|
| index-DweF7uBg.js.map | 200 (5240B) | SPA HTML (catch-all) |
| vendor-Dy5IKjqd.js.map | 200 (5240B) | SPA HTML |
| router-vendor-DSrk6AUX.js.map | 200 (5240B) | SPA HTML |
| oauth-vendor-C69S00M4.js.map | 200 (5240B) | SPA HTML |
| charts-vendor-DxdaS3nJ.js.map | 200 (5240B) | SPA HTML |
| socket-vendor-DnJ_NaQw.js.map | 200 (5240B) | SPA HTML |
| i18n-vendor-BA0TChVn.js.map | 200 (5240B) | SPA HTML |
| dnd-vendor-D0IRJvDX.js.map | 200 (5240B) | SPA HTML |

---

## 2. JS BUNDLE DEEP ANALYSIS

### 2.1 Secrets/Keys

**Nenhum secret hardcoded encontrado.** Variáveis de ambiente são referenciadas por nome (VITE_*), resolvidas em build-time. Valores não expostos.

### 2.2 Env Vars Referenciadas

| Variável | Contexto |
|----------|----------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_FACEBOOK_APP_ID` | Facebook App ID |
| `VITE_CDN_BASE` | CDN base URL |
| `VITE_SAAS_DOMAIN` | Domínio SaaS principal |
| `VITE_BASE_DOMAIN` | Domínio base |
| `VITE_ADMIN_DOMAIN` | admin.nerix.com.br |
| `VITE_DOCS_DOMAIN` | docs.nerix.com.br |
| `VITE_CHECKOUT_DOMAIN` | Domínio de checkout |
| `VITE_STORE_BASE_DOMAINS` | Base domains de lojas |
| `VITE_QUIZ_EDITOR_DOMAIN` | Editor de quiz |
| `VITE_QUIZ_PUBLISHED_DOMAIN` | Quiz publicado |
| `VITE_SALES_EDITOR_DOMAIN` | Editor de sales pages |
| `VITE_CLONE_EDITOR_DOMAIN` | Clone page editor |
| `VITE_PUBLISHED_PAGES_DOMAIN` | Páginas publicadas |

### 2.3 Service Worker (nerix.com.br)

| Aspecto | Valor |
|---------|-------|
| Versão | `v5` |
| Cache Name | `nerix-pwa-v5` |
| Source files | `/src/main.tsx`, `/src/App.tsx` |
| API strategy | Pular cache (network-only) |
| Assets strategy | Network First |
| Push notifications | Suportado com dedup (5s window) |
| GCM Sender ID | `103953800507` (Firebase) |

### 2.4 PWA Manifest

- `start_url`: `/store`
- `version`: `2.0.1`
- `theme_color`: `#2563eb`
- Icons: CDN (cdn.nerix.com.br/LOGOS NERIX/NERIX-AURA1.png)

---

## 3. INTERNAL ROUTES (React Router)

### Public Routes
| Route | Descrição |
|-------|-----------|
| `/` | Home |
| `/login` | Login |
| `/create-store` | Criar loja |
| `/store` | Dashboard loja |
| `/docs` | Documentação |
| `/privacy` | Política privacidade |
| `/terms` | Termos de uso |
| `/forgot-password` | Recuperar senha |
| `/impersonate` | Impersonation |
| `/wallet-terms` | Termos carteira |
| `/buyer-privacy` | Privacidade comprador |
| `/content-policy` | Política conteúdo |
| `/cookies` | Política cookies |
| `/copyright-policy` | Política copyright |
| `/payments-policy` | Política pagamentos |
| `/purchase-terms` | Termos compra |
| `/refund-policy` | Política reembolso |
| `/accept-invite` | Aceitar convite |
| `/push-debug` | Debug push |

### App Routes (Store Dashboard)
| Route | Descrição |
|-------|-----------|
| `/store/affiliates` | Afiliados |
| `/store/analytics` | Analytics |
| `/store/apps` | Apps/Integrações |
| `/store/builder` | Builder |
| `/store/builder/clone-page` | Clonar página |
| `/store/builder/create-storefront` | Criar storefront |
| `/store/builder/infractions` | Infrações |
| `/store/builder/integrations` | Integrações builder |
| `/store/builder/my-sales` | Minhas vendas |
| `/store/builder/products` | Produtos builder |
| `/store/builder/quiz` | Quiz builder |
| `/store/builder/sales-pages` | Sales pages |
| `/store/builder/wallet` | Wallet builder |
| `/store/builder/whatsapp-recovery` | WhatsApp recovery |
| `/store/cart-goals` | Metas carrinho |
| `/store/categories` | Categorias |
| `/store/conversations` | Conversas |
| `/store/coupons` | Cupons |
| `/store/customers` | Clientes |
| `/store/discord-bot` | Discord bot |
| `/store/domains` | Domínios |
| `/store/gateways` | Gateways pagamento |
| `/store/infractions` | Infrações |
| `/store/integrations` | Integrações |
| `/store/loyalty` | Loyalty |
| `/store/manual-charges` | Cobranças manuais |
| `/store/marketing/rules` | Regras marketing |
| `/store/order-bumps` | Order bumps |
| `/store/orders` | Pedidos |
| `/store/products` | Produtos |
| `/store/reviews` | Avaliações |
| `/store/settings/*` | Configurações |
| `/store/team` | Time |
| `/store/theme` | Tema |
| `/store/wallet` | Carteira |
| `/store/whatsapp-recovery` | WhatsApp recovery |

---

## 4. API ENDPOINTS

### 4.1 Documentados na Docs (38 endpoints)

#### Main API (21 endpoints)
```
DELETE /api/public/categories/all
DELETE /api/public/products/all
GET    /api/public/affiliates
GET    /api/public/categories
GET    /api/public/coupons
GET    /api/public/customers
GET    /api/public/customers/top
GET    /api/public/orders
GET    /api/public/orders/{orderNumber}
GET    /api/public/products
GET    /api/public/products/{id}
GET    /api/public/products/{id}/keys
GET    /api/public/reviews
GET    /api/public/store
POST   /api/public/affiliates/requests/{id}/approve
POST   /api/public/categories
POST   /api/public/coupons
POST   /api/public/orders
POST   /api/public/orders/{orderNumber}/check-payment
POST   /api/public/products
POST   /api/public/products/{id}/variants
POST   /api/public/reviews/{id}/approve
PUT    /api/public/products/{id}
```

#### Infoprodutos API (17 endpoints)
```
GET    /api/public/infoproducts/v1/customers
GET    /api/public/infoproducts/v1/me
GET    /api/public/infoproducts/v1/offers/{offerId}
GET    /api/public/infoproducts/v1/orders
GET    /api/public/infoproducts/v1/orders/{orderId}
GET    /api/public/infoproducts/v1/orders/{orderId}/delivery
GET    /api/public/infoproducts/v1/products
GET    /api/public/infoproducts/v1/products/{productId}
GET    /api/public/infoproducts/v1/products/{productId}/coupons
GET    /api/public/infoproducts/v1/products/{productId}/offers
GET    /api/public/infoproducts/v1/products/{productId}/order-bumps
PATCH  /api/public/infoproducts/v1/offers/{offerId}
PATCH  /api/public/infoproducts/v1/products/{productId}
POST   /api/public/infoproducts/v1/checkouts
POST   /api/public/infoproducts/v1/orders/{orderId}/check-payment
POST   /api/public/infoproducts/v1/products
POST   /api/public/infoproducts/v1/products/{productId}/offers
```

#### Pix API
- `/api-pix/visao-geral`
- `/api-pix/llm`

### 4.2 Extraídos dos JS Bundles (100+ endpoints)

#### Auth (31 endpoints)
```
POST /api/auth/login
POST /api/auth/login/google
POST /api/auth/login/facebook
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/change-password
POST /api/auth/change-password/request-code
POST /api/auth/verify-code
POST /api/auth/send-verification-code
GET  /api/auth/check-email
GET  /api/auth/check-username
GET  /api/auth/me
GET  /api/auth/profile
GET  /api/auth/cross-domain-token
GET  /api/auth/current-store
POST /api/auth/google/exchange
POST /api/auth/link/google
POST /api/auth/unlink/google
POST /api/auth/discord/link-token
POST /api/auth/unlink/discord
GET  /api/auth/sessions
DELETE /api/auth/sessions/{id}
GET  /api/auth/2fa/status
POST /api/auth/2fa/enable
POST /api/auth/2fa/disable
POST /api/auth/2fa/setup
POST /api/auth/2fa/login-verify
GET  /api/auth/notifications
GET  /api/auth/notifications/all
POST /api/auth/notifications/read-all
GET  /api/auth/account-notices
GET  /api/auth/impersonation/check
POST /api/auth/impersonation/end
```

#### Admin (39 endpoints)
```
GET    /api/v1/admin/accounts
GET    /api/v1/admin/stores
GET    /api/v1/admin/sales
GET    /api/v1/admin/stats
GET    /api/v1/admin/platform-logs
GET    /api/v1/admin/activity-logs
GET    /api/v1/admin/notifications
GET    /api/v1/admin/visit-logs
GET    /api/v1/admin/visit-logs/by-state
GET    /api/v1/admin/visit-logs/stats
GET    /api/v1/admin/banned-ips
POST   /api/v1/admin/banned-ips/
GET    /api/v1/admin/wallet-identities
GET    /api/v1/admin/withdrawals
GET    /api/v1/admin/impersonation/start
GET    /api/v1/admin/infractions
GET    /api/v1/admin/inspect/http
GET    /api/v1/admin/account-notices
GET    /api/v1/admin/analytics/churn
GET    /api/v1/admin/analytics/duplicates
GET    /api/v1/admin/analytics/funnel
GET    /api/v1/admin/analytics/ranking
GET    /api/v1/admin/analytics/revenue
GET    /api/v1/admin/stores/daily-metrics
GET    /api/v1/admin/stores/totals
GET    /api/v1/admin/finance/overview
GET    /api/v1/admin/finance/provider-costs
GET    /api/v1/admin/sales-page-templates
GET    /api/v1/admin/builder/overview
GET    /api/v1/admin/builder/account-ranking
GET    /api/v1/admin/builder/product-ranking
GET    /api/v1/admin/builder/activity
GET    /api/v1/admin/builder/analytics
GET    /api/v1/admin/builder/products
GET    /api/v1/admin/builder/quizzes
GET    /api/v1/admin/builder/cloned-pages
GET    /api/v1/admin/builder/sales-pages
GET    /api/v1/admin/builder/duplicate-accounts
POST   /api/v1/admin/wallets/reset-all
```

#### Core Store (50+ endpoints)
```
GET/POST /api/products
GET/PUT/DELETE /api/products/{id}
POST   /api/products/bulk-patch
POST   /api/products/reorder
POST   /api/products/upload-image
GET    /api/products/reviews/
GET    /api/products/reviews/all
POST   /api/products/reviews/manual
GET/POST /api/categories
PATCH  /api/categories/order/update
GET/POST /api/orders
GET    /api/orders/{id}
POST   /api/orders/manual-pix
GET    /api/orders/dashboard-stats
GET    /api/orders/export
GET    /api/orders/pix-stats
GET    /api/orders/revenue-summary
GET/POST /api/customers
POST   /api/customers/block
GET/POST /api/coupons
GET/POST /api/domains
POST   /api/domains/subdomain
GET/POST /api/conversations
GET    /api/checkout-fields
GET/POST /api/notifications
POST   /api/notifications/test
GET    /api/notifications/email-templates
GET/POST /api/order-bumps
POST   /api/order-bumps/reorder
GET/POST /api/stores
POST   /api/stores/create
GET    /api/stores/my-stores
GET    /api/templates
GET    /api/themes
GET    /api/api-keys
GET    /api/shadow-keys
GET    /api/settings
GET    /api/team
POST   /api/team/invite
GET    /api/team/invites
POST   /api/team/invites/cancel
GET    /api/team/members
GET    /api/team/permissions
GET    /api/team/my-permissions
GET/POST /api/webhooks/
GET    /api/store-api-webhooks
```

#### Stores (Extended - 30+ endpoints)
```
GET    /api/stores/activity-logs
GET/POST /api/stores/affiliates
GET    /api/stores/affiliates/commission-tiers
POST   /api/stores/affiliates/apply-commission
GET    /api/stores/affiliates/contest
GET    /api/stores/affiliates/contest/leaderboard
GET/POST /api/stores/affiliates/materials
GET/POST /api/stores/affiliates/requests
GET    /api/stores/affiliates/settings
GET/POST /api/stores/affiliates/withdrawals
GET    /api/stores/analytics
GET    /api/stores/analytics/chat
GET    /api/stores/analytics/summary
GET    /api/stores/chat-shortcuts
GET/POST /api/stores/checkout-links
GET/POST /api/stores/conversations
GET/POST /api/stores/discord/*
GET    /api/stores/notifications
POST   /api/stores/notifications/read-all
GET/POST /api/stores/price-schedules
GET    /api/stores/sidebar-navigation
GET    /api/stores/visit-logs/by-state
GET    /api/stores/user-notifications
```

#### Builder (15+ endpoints)
```
GET/POST /api/builder/api-keys
GET    /api/builder/assets/fetch
POST   /api/builder/assets/image
GET/POST /api/builder/cloned-pages
POST   /api/builder/cloned-pages/clone
GET    /api/builder/dashboard
GET/POST /api/builder/integrations/{name}
GET    /api/builder/orders
GET    /api/builder/orders/export
GET/POST /api/builder/products
GET/POST /api/builder/quiz-funnels
GET    /api/builder/revenue-summary
GET/POST /api/builder/sales-pages
GET    /api/builder/wallet
GET    /api/builder/wallet/infractions
POST   /api/builder/whatsapp/recovery
```

#### WhatsApp (10+ endpoints)
```
POST   /api/whatsapp/admin/connect
POST   /api/whatsapp/admin/disconnect
GET    /api/whatsapp/admin/pairing-code
POST   /api/whatsapp/admin/reconnect
GET    /api/whatsapp/admin/settings
GET    /api/whatsapp/admin/status
POST   /api/whatsapp/admin/test
POST   /api/whatsapp/recovery/track-click
GET/POST /api/whatsapp/store/recovery/flows
GET    /api/whatsapp/store/automations/overview
GET    /api/whatsapp/store/automations/rules
GET/POST /api/whatsapp/store/automations/numbers/
```

#### Shop Editor (5 endpoints)
```
POST   /api/shop-editor/file
POST   /api/shop-editor/fs/create-file
POST   /api/shop-editor/fs/create-page
POST   /api/shop-editor/fs/delete
POST   /api/shop-editor/fs/move
GET    /api/shop-editor/local/token
GET    /api/shop-editor/tree
```

#### Payment Methods (4 endpoints)
```
GET    /api/payment-methods
POST   /api/payment-methods/efi/certificate
POST   /api/payment-methods/stripe/connect
GET    /api/payment-methods/stripe/status
```

#### Mansão Privilege (10 endpoints)
```
GET    /api/mansao-privilege/customers
GET    /api/mansao-privilege/products
GET    /api/mansao-privilege/settings
GET/POST /api/mansao-privilege/stories
POST   /api/mansao-privilege/stories/finalize
POST   /api/mansao-privilege/stories/from-url
POST   /api/mansao-privilege/stories/upload
POST   /api/mansao-privilege/stories/upload/chunk
```

#### Push Notifications (7 endpoints)
```
POST   /api/push/cleanup
GET    /api/push/discord-user/{id}
GET    /api/push/preferences
GET    /api/push/public-key
POST   /api/push/subscribe
GET    /api/push/subscription
POST   /api/push/unsubscribe
POST   /api/push/test
```

#### Public/Buyer (20+ endpoints)
```
GET    /api/public/store
GET    /api/public/categories
GET    /api/public/products
GET/POST /api/public/orders
POST   /api/public/orders/{id}/check-payment
GET    /api/public/customer/conversations/
GET    /api/public/customer/reviews
GET    /api/public/customer/reviews/by-order
GET    /api/public/customer/reviews/check/
POST   /api/public/customer/upload/review-image
GET    /api/public/affiliate/dashboard
GET    /api/public/checkout-links
GET/POST /api/public/cloned-pages
GET/POST /api/public/quiz-funnels
GET    /api/public/quiz-funnels/by-host
GET/POST /api/public/sales-pages
GET    /api/public/sales-pages/by-host
GET    /api/public/theme
GET    /api/public/visit-logs/track
GET    /api/public/visit-logs/track-store
POST   /api/public/team/accept-invite
POST   /api/public/team/reject-invite
```

### 4.3 API Test Results

| Endpoint | Método | HTTP | Resposta |
|----------|--------|------|----------|
| `/api/v1` | GET | 401 | `{"message":"Unauthorized"}` |
| `/api/v1/auth/login` | GET | 401 | `{"message":"Unauthorized"}` |
| `/api/v1/admin/accounts` | GET | 401 | `{"message":"Unauthorized"}` |
| `/api/admin` | GET | 403 | Forbidden (HTML) |
| `/api/public/categories` | GET | 200 | `[]` |
| `/api/public/categories?packages=true&include_subcategories=true` | GET | 200 | `[]` |
| `/api/public/products` | GET | 401 | `{"message":"Missing or invalid API key"}` |
| `/api/public/products/all` | GET | 401 | `{"message":"Missing or invalid API key"}` |
| `/api/public/orders` | GET | 401 | `{"message":"Missing or invalid API key"}` |
| `/api/public/store` | GET | 401 | `{"message":"Missing or invalid API key"}` |
| `/api/public/infoproducts/v1/products` | GET | 401 | `{"message":"Missing or invalid API key"}` |
| `/api/public/infoproducts/v1/me` | GET | 401 | `{"message":"Missing or invalid API key"}` |
| `/health` | GET | 200 | 131B (health check endpoint) |

---

## 5. AUTHENTICATION & RATE LIMITS

### Auth Header
```
X-nerixkey: nrk_live_<key>
```
Formato: `nrk_live_*` (também aceito como header `nerixkey`)

### Rate Limits (documentados)
| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Global API | 1200 req | 900s (15 min) |
| Public Categories | 120 req | 60s |
| Public Products | 300 req | 60s |
| Public Orders | 60 req | 60s |
| Infoproducts | 60 req | 60s |
| Unknown paths | 300 req | 60s |

Headers: `RateLimit-Policy`, `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

### CSP (api.nerix.com.br)
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' accounts.google.com
style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com
img-src 'self' data: blob: cdn.nerix.com.br *.r2.dev *.r2.cloudflarestorage.com
connect-src 'self' *.r2.cloudflarestorage.com facebook.com *.facebook.com
frame-src 'self' accounts.google.com
```

---

## 6. DOCS SCRAPING

- **83/83 páginas baixadas** (100%)
- Sitemap URL: `https://docs.nerix.com.br/sitemap.xml`
- Plataforma: Mintlify (Next.js) via Vercel
- API completa mapeada: **38 endpoints** (21 main API + 17 infoproducts)
- Sem secrets nos exemplos (placeholders `SUA_CHAVE_AQUI`)
- Parâmetros body identificados:
  - Product: `name`, `description`, `price`, `category_id`, `images`, `slug`, `status`
  - Order: `customer`, `name`, `coupon_code`
  - Categories: `name`, `description`

---

## 7. WEB/SOCKET

**Status**: ❌ Conexão bloqueada

- Path: `/socket.io`
- Protocol: Socket.IO (client v3/v4)
- Transport: Polling → WebSocket
- Cloudflare: Bloqueia conexões de Tor/exit nodes
- All events: `connect`, `connect_error`, `disconnect`, `ping`, etc.
- Necessário testar de IP residencial/browser real

---

## 8. SPECIAL FILES

| Arquivo | Status | Conteúdo |
|---------|--------|----------|
| `/manifest.json` | 200 | PWA manifest v2.0.1 |
| `/robots.txt` | 200 | Cloudflare managed, bloqueia AI crawlers |
| `/service-worker.js` | 200 | SW v5, network-first, push notifications |
| `/.env` | 200 | SPA catch-all (HTML) |
| `/vite.config.ts` | 200 | SPA catch-all (HTML) |
| `/sitemap.xml` | 200 | SPA catch-all (HTML) |
| `/health` (api) | 200 | 131B health endpoint |

---

## 9. R2 BUCKET TEST

Todos os buckets `*.r2.dev` testados retornam **HTTP 500** (não existem ou bloqueados).

---

## 10. IDOR CANDIDATES (parâmetros enumeráveis)

| Endpoint | Parâmetro | Tipo |
|----------|-----------|------|
| `/api/public/products/{id}` | ID numérico | Path param |
| `/api/public/products/{id}/keys` | ID numérico | Path param |
| `/api/public/products/{id}/variants/{variantId}` | 2 IDs | Path params |
| `/api/public/orders/{orderNumber}` | UUID | Path param |
| `/api/public/orders/{orderNumber}/check-payment` | UUID | Path param |
| `/api/public/infoproducts/v1/products/{productId}` | ID | Path param |
| `/api/public/infoproducts/v1/orders/{orderId}` | ID | Path param |
| `/api/public/infoproducts/v1/offers/{offerId}` | ID | Path param |
| `/api/public/customers/top?limit={n}&page={n}` | limit, page | Query params |
| `/api/public/products?category_id={id}` | category_id | Query param |

---

## 11. PAYLOAD CANDIDATES (Próximos passos suggestidos)

### Alta Prioridade
1. 🔴 **Testar API com X-nerixkey** — Obter chave válida para acessar endpoints autenticados
2. 🔴 **IDOR testing** — `/api/public/orders/{orderNumber}` com UUIDs sequenciais
3. 🔴 **SQLi/NoSQLi** — `/api/public/products?category_id=1` com payloads de injeção
4. 🔴 **Rate limit bypass** — Testar rate limits com headers X-Forwarded-For

### Média Prioridade
5. 🟡 **Auth endpoints** — Testar register/login, brute force, MFA bypass
6. 🟡 **Upload endpoints** — `/api/products/upload-image`, `/api/mansao-privilege/stories/upload`
7. 🟡 **Shop Editor abuse** — `/api/shop-editor/fs/*` (file operations)
8. 🟡 **WhatsApp admin** — Testar `/api/whatsapp/admin/*` sem auth
9. 🟡 **Builder integrations** — Testar webhooks endpoints

### Baixa Prioridade
10. 🔵 **Mass assignment** — Enviar campos extras em POST/PUT de produtos, pedidos
11. 🔵 **CORS test** — Testar origens não autorizadas no CORS
12. 🔵 **Template injection** — `/api/templates/marketplace`, `/api/templates/bases`