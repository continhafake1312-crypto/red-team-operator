# enum/ENUM.md — Enumeração Profunda — ggmax.com.br / keyz.gg

> Fase 5 (enum) consolidada. Content discovery, JS analysis, param mining, API/Soketi/Meilisearch/Coolify/S3/staging enum.
> Data: 2026-09-04 | OPSEC: bypass Cloudflare via 104.238.205.118 + Host header (Tor)

---

## 🔴 TOP FINDINGS (ordenados por impacto)

| # | Finding | Impacto | Hostahead |
|---|---------|---------|----------|
| 1 | **Admin Panel escondido em `/adm`** ("Keyz Admin") — app Nuxt separado + 20+ endpoints admin API em `api.keyz.gg/adm/*` | 🔴 Crítica | keyz.gg + api.keyz.gg |
| 2 | **Admin account enumeration** via POST `/adm/auth` — `thyoity@gmail.com` confirmado como ADMIN ("Invalid password") | 🔴 Crítica | api.keyz.gg |
| 3 | **maintenancePassword `keyzgg@` vazado** no client-side config (bypass client-only) | 🟠 Alta | keyz.gg |
| 4 | **Soketi app key** `65653497fc8e47a67c8971778c64fbc1` + auth user websocket funcional | 🟠 Alta | rt.keyz.gg |
| 5 | **/protected** endpoint admin-only (403 com JWT regular) — alvo JWT forgery admin | 🟠 Alta | api.keyz.gg |
| 6 | **3 bugs 500** (/orders, /avatar/{id}, /tickets/attachments) — possível stack trace | 🟡 Média | api.keyz.gg |
| 7 | **Mercado Pago TEST key** vazada + pix manual key | 🟡 Média | keyz.gg |
| 8 | **OAuth endpoints** (/auth/google, /auth/discord, /auth/twitch) confirmados | 🟡 Média | api.keyz.gg |

---

## 1. JS ANALYSIS — App Nuxt (keyz.gg) — PRIORIDADE MÁXIMA ✅

### 1.1 Secrets vazados (index.html `window.__NUXT__.config.public`)

Arquivo: `enum/js/secrets.txt` + `enum/js/nuxt_config_raw.js`

| Chave | Valor | Notas |
|-------|-------|-------|
| **maintenancePassword** | `keyzgg@` | 🔴 Vazada no client. Check é 100% client-side (compara `a.value === c`, seta localStorage `maintenance_bypass`). Server NÃO valida. |
| **pusherPublicKey** | `65653497fc8e47a67c8971778c64fbc1` | 🔴 Soketi app key (pública por design, mas confirma endpoint) |
| pusherUrl | `https://rt.keyz.gg` | Soketi WSS endpoint |
| paymentCcMpPublicKey | `TEST-e2a43379-e7b6-4ecf-9a04-caf8dcb34104` | Mercado Pago PUBLIC key (prefixo TEST = sandbox) |
| pixManualKey | `pix@keyz.gg` | Email PIX manual |
| googleSignIn.clientId | `283600183040-jvta9bb0aecs5oqk54kvjlf8t4u1etul.apps.googleusercontent.com` | Google OAuth (GIS) |
| discordClientId | `1349127675326890055` | Discord OAuth2 |
| twitchClientId | `xtspokpeihse71artyhr8g50umje51` | Twitch OAuth2 |
| turnstileSitekey | `0x4AAAAAAB69bAQb_RbcPwNZ` | Cloudflare Turnstile |
| apiBaseUrl | `https://api.keyz.gg` | API base |
| frontBaseUrl | `https://keyz.gg` | Front base (usado como redirect_uri OAuth) |
| buildId | `c7802431-186e-4b03-a50c-8f9b7ec65e34` | Nuxt build ID |
| isInMaintenance | `false` | (atualmente OFF) |

### 1.2 Endpoints extraídos dos 23 JS chunks

Arquivo: `enum/js/endpoints_raw.txt` (92 endpoints)

**Fetch calls (API) encontrados:**
```
POST /auth {email, password}                    → login
POST /auth/refresh {refreshToken}                → refresh token
POST /auth/google {token}                        → Google OAuth (GIS credential)
POST /auth/discord {code}                        → Discord OAuth
POST /auth/twitch {code}                         → Twitch OAuth
POST /auth/confirmation                          → email confirmation (400 sem body)
POST /auth/websocket/user {socket_id}            → Soketi user auth (HMAC)
GET  /me                                          → perfil (JWT)
POST /orders {productGoods, coupon?}              → criar pedido
POST /orders/{orderId}/pay {paymentMethod, hasCashback}  → pagar pedido (IDOR candidate)
GET  /tickets                                     → meus tickets
GET  /tickets/{id}                                → ticket por ID (IDOR candidate)
GET  /tickets/attachments/{id}                    → anexo ticket (IDOR download candidate → "File not found")
POST /wishlist {productId}                        → add wishlist
DELETE /wishlist/{id}                             → remove wishlist (IDOR candidate)
GET  /users/recent-transactions                   → minhas transações
GET  /search {q}                                  → busca (proxy Meilisearch)
GET  /coupons/validate {code}                     → validar cupom
GET  /system-parameters                           → config pública (sem secrets)
GET  /pictures/{filename}                         → imagem produto (público)
GET  /icons/{filename}                            → ícone produto (público)
GET  /avatar/{id}                                  → avatar (500 bug)
```

### 1.3 Maintenance bypass (client-side only)
Arquivo: `CS16sRfk.js` — rota `/maintenance`. Lógica:
```js
const {public:{maintenancePassword:c}} = _()  // c = "keyzgg@"
m = async () => {
  a.value === c ? (d.value = btoa(Math.random()), u.push("/"), success())
  : error("Houve um erro")
}
```
- **Server-side enforcement: NENHUM**. O bypass apenas seta `localStorage["maintenance_bypass"]` e navega.
- Se ativarem `isInMaintenance:true`, qualquer um que leia o source pega a senha `keyzgg@` e bypassa.

---

## 2. SOKETI / PUSHER (rt.keyz.gg) ✅

Arquivo: `enum/soketi/soketi_keys.txt`

| Item | Valor |
|------|-------|
| App Key | `65653497fc8e47a67c8971778c64fbc1` |
| Endpoint | `wss://rt.keyz.gg/app/<key>?protocol=7&client=js&version=8.4.0` |
| Cluster | `notifications` |

**Confirmado funcional:**
1. WebSocket connect → `pusher:connection_established` (retorna `socket_id`)
2. Canal público (`test-channel`) → `subscription_succeeded` (SEM auth)
3. POST `/auth/websocket/user` (api.keyz.gg) com JWT+socket_id → 201 `{auth, user_data:{id,email,name}}`
4. `pusher:signin_success` → subscrito em `#server-to-user-<id>`

**IDOR test (BLOCKED):**
- Enviar `user_data` no POST → 400 "property user_data should not exist" (DTO validation)
- user_data é derivado do JWT server-side (não forjável sem JWT forgery)
- `/pusher/auth` e `/pusher/user-auth` → 404 (são rotas frontend, não API)

**Attack surface:** se webapp forjar JWT admin → auth websocket como admin → recebe eventos realtime do admin. Canais públicos podem vazar dados (enumerar nomes: products/orders/notifications).

---

## 3. MEILISEARCH (search.keyz.gg) ✅

Arquivo: `enum/meili/` (dashboard.html, dashboard.js)

| Endpoint | Status | Resultado |
|----------|--------|-----------|
| `/health` | 200 (público) | `{"status":"available"}` |
| `/version` | 401 | precisa Authorization bearer |
| `/stats` | 401 | precisa Authorization bearer |
| `/indexes` | 401 | precisa Authorization bearer |
| `/` (dashboard) | 200 | Mini-dashboard exposto |

- **API key NÃO está no client-side** (não está no `__NUXT__.config.public` nem nos JS chunks).
- Common keys testadas (masterKey, meili, default, test, secret, JWT token, app key) → todas 403 "invalid_api_key"
- `/search` da API faz proxy server-side ao Meilisearch (key é server-side only).
- Dashboard JS referencia `/api/keys` (mini-dashboard pede key manualmente).
- **Para obter a key:** precisaria SSRF/RCE no servidor API, ou leak de config server-side. Não acessível via enum client-side.

---

## 4. ADMIN PANEL (`/adm`) — 🔴 BREAKTHROUGH ✅

### 4.1 App admin (Nuxt separado)

- URL: `https://keyz.gg/adm` → 302 → `/adm/login`
- Título: **"Keyz Admin"**
- Build ID admin: `a1e86b4e-25b0-4853-b633-4107b7248230`
- Base URL: `/adm`, assets em `/adm/d/`
- Config admin (`enum/keyz_app/adm_js/`):
  ```js
  public: {
    adminApiPrefix: "/adm",       // ← prefixo API admin
    apiBaseUrl: "https://api.keyz.gg",
    defaultItemsPerPage: 10
  }
  ```
- Login usa **OTPInput** (TOTP/authenticator_app)

### 4.2 Admin API endpoints (api.keyz.gg/adm/*)

Arquivo: `enum/api/admin_endpoints.txt`

**Auth flow (2-step com TOTP):**
```
POST /adm/auth {email, password}
  → se password ok: retorna {validation} token
  → "Missing access permission" (não-admin) | "Invalid password" (admin, senha errada) | "Invalid user" (sem conta)

POST /adm/auth/confirm {email, code, type:"authenticator_app", validation}
  → type DEVE ser "authenticator_app" (TOTP, não email/SMS)
  → retorna admin JWT (accessToken + refreshToken)

POST /adm/auth/refresh {refreshToken}   → renova admin token
GET  /adm/me                            → perfil admin (401 sem admin token)
```

**Endpoints admin CRUD confirmados (401 = precisam admin JWT):**
| Endpoint | Acesso | Função |
|----------|--------|--------|
| `/adm/me` | 401 | Perfil admin |
| `/adm/users` | 401 | 🔴 CRUD usuários (PII total) |
| `/adm/users/roles` | 401 | 🔴 Gerenciar roles |
| `/adm/orders` | 401 | Todos pedidos |
| `/adm/manual-payments` | 401 | 🔴 Aprovar pagamentos manuais |
| `/adm/payment-parameters` | 401 | 🔴 Config pagamentos (Mercado Pago keys?) |
| `/adm/transactions` | 404 GET (sub-path) | Transações financeiras |
| `/adm/system-parameters` | 401 | Config do sistema |
| `/adm/products` | 401 | CRUD produtos |
| `/adm/coupons` | 401 | 🔴 CRUD cupons (criar cupons de desconto!) |
| `/adm/categories` | 401 | CRUD categorias |
| `/adm/tickets` | 401 | Todos tickets |
| `/adm/tickets/categories` | 401 | Categorias de ticket |
| `/adm/reviews` | 401 | Moderar reviews |
| `/adm/faqs` | 401 | CRUD FAQs |
| `/adm/institutionals` | 401 | CRUD institucional |
| `/adm/suppliers` | 401 | CRUD fornecedores |
| `/adm/product-suggestions` | 401 | Sugestões de produto |
| `/adm/order-delivery-error-logs` | 401 | Logs de erro de entrega |
| `/adm/canned-messages` | 401 | Mensagens prontas |

**Endpoints admin em JS (404 GET — provavelmente POST/create ou sub-path com ID):**
`/adm/blog`, `/adm/control-cashback`, `/adm/control-wallet`, `/adm/featured-platforms`, `/adm/featured-products`, `/adm/monitoring-parameters`, `/adm/product-banners`, `/adm/sku`, `/adm/tags`, `/adm/transactions`

### 4.3 🔴 Admin account enumeration (CRÍTICO)

POST `/adm/auth` distingue 3 respostas:

| Resposta | Significado | Exemplos testados |
|----------|-------------|-------------------|
| `Invalid user` | Conta não existe | contato@keyz.gg, keyz@ggmax.com.br, admin@admin.com |
| `Missing access permission` | Conta existe, NÃO é admin | admin@keyz.gg, admin@ggmax.com.br, contato@ggmax.com.br, suporte@ggmax.com.br, test@test.com |
| `Invalid password` | 🔴 **CONTA ADMIN** (senha errada) | **thyoity@gmail.com** ✅ |

**Confirmed admin account: `thyoity@gmail.com`** (Thiago Yoithi Vaz da Rocha — owner da empresa).

Contas que existem mas NÃO são admin: `admin@keyz.gg`, `admin@ggmax.com.br`, `contato@ggmax.com.br`, `suporte@ggmax.com.br`, `test@test.com`.

---

## 5. API api.keyz.gg — Content Discovery ✅

Arquivos: `enum/api/content_disc_api_*.json`, `content_disc_api_*.log`

### 5.1 Endpoints públicos (200, sem auth)

| Endpoint | Notas |
|----------|-------|
| `/products` | Lista produtos (33KB JSON) |
| `/products/{slug}` | Detalhe produto |
| `/categories` | Categorias (689b) |
| `/reviews` | 🔴 PII — 6 nomes vazados |
| `/faqs` | FAQs (8.6KB) |
| `/blogs` | Blog posts (681b) |
| `/search?q=` | Busca (proxy Meilisearch) |
| `/system-parameters` | Config pública (SEO, métodos pagamento — sem secrets) |
| `/coupons/validate?code=` | Validação de cupom (404 inválido, 400 sem code) |
| `/pictures/{filename}` | Imagem produto (público) |
| `/icons/{filename}` | Ícone produto (público) |

### 5.2 Endpoints auth (401 sem JWT)

| Endpoint | Método | Notas |
|----------|--------|-------|
| `/me` | GET | Perfil (JWT user 270) |
| `/orders` | GET | 🔴 **500 Internal server error** (bug!) |
| `/orders` | POST | Cria pedido (requer `productGoods` array) |
| `/orders/{id}/pay` | POST | Paga pedido (IDOR candidate) |
| `/tickets` | GET | Meus tickets |
| `/tickets/{id}` | GET | Ticket por ID (404 "not found" para IDs 1,2) |
| `/tickets/attachments` | GET | 🔴 500 (bug) |
| `/tickets/attachments/{id}` | GET | "File not found" — IDOR download candidate |
| `/wishlist` | GET/POST | Wishlist |
| `/wishlist/{id}` | DELETE | Remove item (IDOR candidate) |
| `/users/recent-transactions` | GET | Transações (userId param parece ignorado — server usa JWT) |
| `/protected` | GET | 🔴 **403 com JWT regular = ADMIN-ONLY** (alvo JWT forgery) |
| `/avatar/{id}` | GET | 🔴 500 (bug, com e sem auth) |

### 5.3 Auth endpoints

| Endpoint | Método | Body | Notas |
|----------|--------|------|-------|
| `/auth` | POST | `{email, password}` | Login → accessToken + refreshToken (HS256) |
| `/auth/refresh` | POST | `{refreshToken}` | Renova tokens |
| `/auth/google` | POST | `{token}` | Google GIS credential → 400 "Token not found" |
| `/auth/discord` | POST | `{code}` | Discord OAuth code → 400 "Code not found" |
| `/auth/twitch` | POST | `{code}` | Twitch OAuth code → 400 "Code not found" |
| `/auth/confirmation` | POST | (email confirmation) | 400 sem body |
| `/auth/websocket/user` | POST | `{socket_id}` | Soketi user auth |

### 5.4 JWT structure (HS256)
```
Access:  {email, sub, iat, exp(1h), aud:"https://keyz.gg/", iss:"https://api.keyz.gg/"}  ← SEM role claim
Refresh: {sub, iat, exp(7d), aud, iss}  ← sem email
```
- **None-alg attack: BLOCKED** ("jwt signature is required")
- Role é derivado server-side (DB lookup por sub) — não está no JWT
- Para forjar admin: brute force do secret HS256 (mesmo secret assina access+refresh)

### 5.5 Observações
- **API é case-insensitive** (/Products, /PRODUCTS, /products = mesmo resultado) — comportamento incomum.
- CORS: ACAO * em tudo.
- **Sem GraphQL/Swagger/OpenAPI** (todos 404).
- Param mining em `/search` e `/coupons/validate`: nenhum parâmetro além dos conhecidos altera comportamento.

---

## 6. STAGING (staging.ggmax.com.br) ✅

Arquivo: `enum/staging/staging_common.json`

- **Locked down no nginx** (403 para quase tudo).
- Único path que não 403: `/api` → 301 redirect → Cloudflare challenge page (não acessível).
- `.env`, `robots.txt`, `/api/products` etc → 403 nginx.
- Staging provavelmente requer header/token específico ou IP allowlist. Sem acesso.

---

## 7. S3 BUCKETS ✅

Arquivo: `enum/s3/`

| Bucket | Região | Status |
|--------|--------|--------|
| `ggmax` | sa-east-1 | 🔴 Existe, **privado** (AccessDenied listing + object access) |
| `keyz` | sa-east-1 | 🔴 Existe, **privado** (AccessDenied) |

- `build.ggmax.com.br` (CloudFront + S3 ggmax): todos paths comuns (.env, backup, .git/HEAD, logs, config) → 403.
- Sem acesso público a objetos. Brute force de paths não funcionou.
- Cloud specialist pode tentar: permutação de keys, versioning, ACL misconfig.

---

## 8. COOLIFY (coolify.keyz.gg) ✅

Arquivos: `enum/coolify/` (coolify_login.html, app.js, manifest.json, livewire.js)

| Item | Valor |
|------|-------|
| Stack | Laravel + Livewire (PHP) |
| Livewire version | **3.15.12** |
| `/api/v1/health` | 200 "OK" (exposto) |
| `/api/v1/version` | 401 (precisa auth) |
| `/login` | Login exposto (creds comuns falharam) |
| Build manifest | `/build/manifest.json` acessível (Laravel Vite) |

- **Sem versão explícita do Coolify nos assets estáticos** (é server-side, em `/api/v1/version` que precisa auth).
- Livewire 3.15.12 → checar CVEs (CVE-2024-55953 file upload manipulation?).
- Login brute force é vetor para webapp (controla TODA a infra: deploys, DBs, env vars).

---

## 9. OAUTH FLOWS ✅

| Provider | Flow | Redirect URI |
|----------|------|--------------|
| Google | GIS (accounts.google.com/gsi/client) → credential JWT → POST /auth/google {token} | frontBaseUrl (https://keyz.gg) |
| Discord | OAuth2 authorize (`discord.com/api/oauth2/authorize?client_id=...`) → code → POST /auth/discord {code} | frontBaseUrl + callback |
| Twitch | OAuth2 authorize (`twitch.tv/oauth2/authorize?client_id=...&redirect_uri=frontBaseUrl+...`) → code → POST /auth/twitch {code} | frontBaseUrl + callback |

**Attack vectors (webapp):**
- redirect_uri manipulation (se API não validar strict)
- state parameter bypass (CSRF no OAuth)
- account takeover via OAuth (linkar conta social de vítima)
- Google credential replay

---

## 10. Candidatos a Vulnerabilidade (para Fase 6 webapp)

### 🔴 Alta prioridade
1. **JWT forgery admin (HS256 brute)** — secret comum assina access+refresh. Se quebrar, forjar JWT `sub=<admin_id>` → acesso /protected + /adm/* (mas /adm/* usa auth separada com TOTP).
2. **Admin auth bypass /adm/auth/confirm** — testar se `validation` token é predicível ou se há bypass do TOTP (rate limit no code 6-digit?).
3. **/protected endpoint** — alvo direto para JWT admin (403 com regular).
4. **IDOR /orders/{id}/pay** — pagar/cancelar pedidos de outros usuários.
5. **IDOR /tickets/attachments/{id}** — download anexos de tickets alheios.
6. **IDOR /wishlist/{id} DELETE** — remover itens de outros.
7. **OAuth redirect_uri / state** — account takeover.
8. **Coolify login brute** — controle total da infra.

### 🟡 Média
9. **/orders 500 bug** — vazar stack trace (testar SQLi/error injection em params).
10. **/avatar/{id} 500** — bug, possível info leak.
11. **/tickets/attachments 500** — bug.
12. **Coupons brute force** — /coupons/validate com wordlist maior (cupons ativos = desconto).
13. **Mass assignment POST /auth** — injetar role/admin field no register.
14. **/search injection** — SSTI/NoSQLi/SQLi no param q (LIKE wildcard já confirmado).
15. **Soketi public channel enum** — canais que vazam dados.
16. **SPF spoofing @ggmax.com.br** — phishing.

### Próximos passos webapp
1. jwt_tool/hashcat brute force do HS256 secret (rockyou)
2. Se secret quebrar: forjar admin JWT → testar /protected + /me role
3. IDOR enumeration em /orders/{id}/pay, /tickets/attachments/{id} (IDs sequenciais)
4. Admin auth flow: brute force senha thyoity@gmail.com + TOTP bypass (rate limit?)
5. OAuth redirect_uri tests com URLs alternativas
6. /orders 500 → payloads para leak de stack trace
7. Coupons brute com SecLists coupon/promo wordlists

---

## Artefatos gerados (enum/)

```
enum/
├── ENUM.md                      (este arquivo)
├── js/
│   ├── secrets.txt              (todos secrets vazados)
│   ├── nuxt_config_raw.js       (config pública Nuxt crua)
│   ├── endpoints_raw.txt        (92 endpoints dos JS)
│   ├── api_paths_raw.txt
│   └── secrets_raw.txt
├── keyz_app/
│   ├── app_common.json          (content discovery app Nuxt)
│   ├── adm_login.html           (admin login page)
│   ├── adm_manifest.json        (admin build manifest)
│   └── adm_js/                  (7 admin JS chunks)
├── api/
│   ├── admin_endpoints.txt      (33 admin endpoints testados)
│   ├── content_disc_api_common.json
│   ├── content_disc_api_raft.json
│   ├── content_disc_api_apiendpoints.json
│   ├── params_search.json       (vazio = nenhum param novo)
│   ├── params_coupons.json
│   └── coupons_4digit.json
├── staging/
│   └── staging_common.json      (só /api 301)
├── coolify/
│   ├── coolify_login.html
│   ├── app.js, manifest.json, livewire.js, dashboard
├── meili/
│   ├── dashboard.html, dashboard.js
├── soketi/
│   └── soketi_keys.txt
└── s3/
    (enum S3 — buckets privados)
```

---

*Consolidado em 2026-09-04 pelo especialista enum (Fase 5).*
