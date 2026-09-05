# ENUM.md — dfg.com.br / www / api (Nuxt.js marketplace) — Cloudflare-fronted

> Fase 5 (enum). Cloudflare Bot Management bloqueia Tor em HTML (403), MAS **assets _nuxt/*.js bypassam** (200).

## Stack
- Nuxt.js (Vue SSR) — front dfg.com.br/www; api.dfg.com.br = API backend
- Cloudflare (CDN/WAF) — Tor 403 em páginas; _nuxt/*.js servidos sem challenge
- Historicamente ASP.NET WebForms (migrado para Nuxt)

## JS Analysis — 122/123 _nuxt/*.js baixados (1.4M) do live site via Tor
- Build manifest: `/_nuxt/builds/latest.json` → 200 (id=094592ea-... ; prerendered=[])
- 492 paths únicos extraídos (ver `js_endpoints.txt`, `js_all_paths_full.txt`)

### API endpoints (api.dfg.com.br) — 16 endpoints
```
/api/_auth/session              /api/auth/login              /api/auth/register
/api/auth/forgot-password       /api/auth/reset-password     /api/auth/verify-email
/api/auth/send-verification-code /api/auth/validate-recovery-code
/api/auth/passwordless/request  /api/auth/passwordless/consume
/api/auth/employee-letters/verify
/api/items/publish              /api/user/header-summary
/api/client-log                 /api/security/csp-report    /api/telemetry/web-vitals
```
Endpoints adicionais (de strings JS, formato api/):
```
api/admin/impersonation-status  api/cart  api/cart/verify  api/items/  api/items/featured
api/items/last-visited  api/public/  api/public/item-questions/  api/public/items/
api/public/users/  api/search/autocomplete  api/search/listings
api/users/favorites  api/users/favorites/ids  api/users/feedbacks/recent
api/users/notifications  api/users/notifications/read-all
api/banners/  api/banners/home  api/categories/menu  api/analytics/eligibility
```

### ⭐ Domínios/URLs externos descobertos no JS (alto valor)
- **`https://antigo.dfg.com.br/admin/`** e **`/admin/changeadminlevel?Level=`** → **NOVO subdomínio + privilege escalation** (ver old.dfg.com.br/ENUM.md)
- `https://antigo.dfg.com.br/myoffers/`
- `https://antigo.dfg.com.br/user/resetpassword`, `/user/validateemailchange`, `/user/validatewithdrawmethod/`
- **`dfg.local`** — domínio de DEV (referenciado no JS — indica env de desenvolvimento)
- `cdn.dfg.com.br` (assets), `https://www.reclameaqui.com.br/empresa/dfgames/`

### Rotas privadas/significativas (marketplace)
- /user/transactions, /user/emailvalidation, /user/resetpassword, /user/validateemailchange
- /cryptocurrency/sell-bitcoin, /cryptocurrency/buy-bitcoin, /cryptocurrency/prices (cripto trading)
- /criptomoeda/vender-bitcoin, /criptomoeda/comprar-bitcoin, /criptomoeda/cotacoes
- /institutional/sell, /institutional/buy, /institutional/payment-methods
- /assinaturas-e-premium, /premium (assinaturas)
- Categorias: albion-online, apex-legends, blizzard/world-of-warcraft, counter-strike, tibia, dofus, etc. (492 paths)

### Secrets/tokens no JS
- **NENHUM** segredo hardcoded encontrado (Bearer, JWT eyJ, AKIA, api_key, sk_, etc. = todos negativos)
- Bom — app não vaza secrets no client bundle.

## api.dfg.com.br — Cloudflare bloqueia Tor (403 na raiz)
- Endpoints /api/* acessíveis só via CF (sem origin IP conhecido para o Nuxt)
- Próximo (webapp): 2Captcha + headless para testar /api/auth/login (credential stuffing), IDOR /api/public/users/<id>

## Vetores (delegar a webapp/cve)
1. **antigo.dfg.com.br/admin/changeadminlevel?Level=** (privilege escalation) — descoberto via JS
2. **/api/admin/impersonation-status** — endpoint admin (testar IDOR/auth bypass)
3. **/api/public/users/<id>** e /user/{id} perfis — enumeração de usuários + IDOR
4. **/user/login?ReturnUrl=** — open-redirect candidate (do robots/wayback)
5. Credential stuffing em /api/auth/login (acgarzon@dfg.com.br + variantes)
6. dfg.local (dev) — investigar se acessível / vaza config

## Artefatos
`js/` (122 JS files), `js_endpoints.txt`, `js_endpoints_raw.txt`, `js_all_paths_full.txt`, `api_endpoints.txt`, `nuxt_js_list.txt`, `build_meta.json`
