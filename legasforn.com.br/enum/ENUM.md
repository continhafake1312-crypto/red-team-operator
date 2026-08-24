# Enumeração Profunda — legasforn.com.br

**Data:** 2026-08-24T16:45-16:55 UTC  
**Operador:** especialista enum  
**Alvo:** legasforn.com.br (https://legasforn.com.br)  
**IP:** 69.46.46.84 (Railway edge — mia1, iah1, ams1)

---

## 1. JS Analysis — Chaves/Crendenciais/Supabase

### Supabase
- **Nenhuma chave Supabase (anon_key, service_role, project_ref) encontrada nos bundles JS estáticos.** A aplicação usa RSC (React Server Components) que executa queries no servidor — as credenciais Supabase nunca são expostas ao cliente.
- CSP confirma: `connect-src https://*.supabase.co wss://*.supabase.co`
- O Supabase project ID não pôde ser extraído dos bundles. Possível enumerar via DNS ou tentando subdomínios comuns de Supabase.

### API Keys
- **Nenhuma chave `lf_live_*` real encontrada.** Apenas o placeholder `lf_live_sua_chave_aqui` na documentação da API.
- Formato confirmado: `lf_live_` prefix (ex.: `lf_live_XXXXXXXXXX`)
- Exemplo de código nos RSC docs: `const KEY = process.env.LEGAS_API_KEY`

### JWTs
- Nenhum JWT (`eyJ...`) encontrado nos bundles estáticos (tokens são gerados server-side).

### AWS / Outras clouds
- Nada encontrado.

### WebSocket URLs
- Nenhuma URL WebSocket explícita nos bundles. CSP indica `wss://*.supabase.co` para realtime.

### Build ID / Framework
- **Build ID:** `hv73pRcFZE5UedoOmEjHt`
- **Framework:** Next.js App Router + Turbopack
- **React:** Server Components (RSC)
- **Bundler:** Turbopack

### Chunks identificados (todos baixados e analisados)
```
/_next/static/chunks/01.u0~zd-itc2.js          (36KB)
/_next/static/chunks/0dvj8a~b-e4tj.js           (51KB)
/_next/static/chunks/0mdqj77cljqk-.js           (30KB)
/_next/static/chunks/0ie~g8-jc-qxo.js           (135KB)
/_next/static/chunks/0n60tyy4gh-c8.js           (55KB)
/_next/static/chunks/08ac9nne7_bvm.js           (21KB)
/_next/static/chunks/0t29fg91-4ll..js           (22KB)
/_next/static/chunks/0p7n56xqlgf1s.js           (55KB)
/_next/static/chunks/0c7kflumrhiam.js           (127KB)
/_next/static/chunks/06-.hwso7f.0k.js           (18KB)
/_next/static/chunks/07c5-3d9eklxp.js           (7KB)
/_next/static/chunks/0nmu9tm-yttdn.js           (31KB)
/_next/static/chunks/00wobk6izr8i9.js           (138KB)
/_next/static/chunks/0166dhd3-frqg.js           (226KB)
/_next/static/chunks/0x5qe8i600d0~.js           (44KB)
/_next/static/chunks/turbopack-035~yyi.1xr9h.js (11KB)
/_next/static/chunks/03~yq9q893hmn.js           (113KB)
```

---

## 2. Rotas Internas do Next.js (RSC Payloads)

### Rotas mapeadas via RSC data endpoints (`/_next/data/hv73pRcFZE5UedoOmEjHt/*.json`)

**Todas as rotas RSC são acessíveis SEM autenticação** — as páginas renderizam via RSC payload mesmo que o conteúdo exija auth.

#### Páginas públicas (RSC payload 200):
| Rota | Descrição |
|------|-----------|
| `/` | Home |
| `/loja` | Catálogo |
| `/loja/lovable` | Loja Lovable (credenciais IA) |
| `/loja/valorant` | Contas Valorant |
| `/loja/valorant/cheats` | **NOVO** — Cheats/softwares Valorant |
| `/loja/valorant/full-acesso` | **NOVO** — Contas full access |
| `/loja/valorant/nfa` | **NOVO** — Contas NFA |
| `/loja/fortnite` | Contas Fortnite |
| `/loja/roblox` | Contas Roblox |
| `/loja/steam` | Contas Steam |
| `/loja/steam/categorias` | **NOVO** — Steam por categorias |
| `/loja/league-of-legends` | Contas LoL |
| `/loja/genshin-impact` | Contas Genshin |
| `/loja/clash-royale` | Contas CR |
| `/loja/brawl-stars` | Contas BS |
| `/loja/rocket-league` | Contas RL |
| `/loja/epic-games` | Contas Epic |
| `/loja/ea` | Contas EA |
| `/loja/ubisoft` | Contas Ubisoft |
| `/ganhar` | Afiliados/Revenda |
| `/ganhar/painel` | **NOVO** — Painel do afiliado (público 200) |
| `/ganhar/revendedor` | **NOVO** — Página de revendedor (público 200) |
| `/ranking` | Ranking de revendedores |
| `/vip` | Programa VIP |
| `/marketplace` | Marketplace |
| `/termos` | Termos de uso |
| `/docs/api` | Documentação da API |
| `/carteira` | Wallet/carteira (200, mas pode requerer login client-side) |
| `/auth/login` | Login page |
| `/auth/sign-up` | Registro |

#### Rotas autenticadas (307 redirect):
| Rota | Destino |
|------|---------|
| `/dashboard` | `/auth/login?redirect=/dashboard` |
| `/dashboard/api` | `/auth/login?redirect=/dashboard/api` |

#### Rotas 404:
| Rota | Observação |
|------|------------|
| `/painel` | 404 (não existe) |
| `/checkout` | 404 via RSC |

### URLs externas descobertas
- Twitter/X: `https://twitter.com/legasforn`
- Instagram: `https://instagram.com/legasforn` (alternate)
- Discord Comunidade: `https://discord.gg/p2v7Z2e79z`
- Discord Suporte: `https://discord.gg/rJxmA3EEBW`
- Instagram: `https://www.instagram.com/legasforn/`
- Riot Games: `https://www.riotgames.com/pt-br`

---

## 3. OpenAPI / Endpoints

### OpenAPI Spec
- URL: `/api/v1/openapi.json`
- Download: `enum/openapi_spec.json` (14.190 bytes)
- Servers: `https://legasforn.com/api/v1`
- Auth: Bearer token (header `Authorization: Bearer {key}`)

### 17 Endpoints Documentados

| Método | Rota | Escopo | Sample IDs |
|--------|------|--------|------------|
| GET | `/api/v1/games` | read | — |
| GET | `/api/v1/accounts?game=` | read | — |
| GET | `/api/v1/accounts/{id}` | read | `xFoVPEt` |
| GET | `/api/v1/accounts/{id}/skins` | read | `xFoVPEt` |
| POST | `/api/v1/verify` | read | — |
| POST | `/api/v1/purchase` | purchase | — |
| GET | `/api/v1/wallet` | read | — |
| GET | `/api/v1/stats` | read | — |
| POST | `/api/v1/wallet/deposit` | deposit | — |
| GET | `/api/v1/wallet/deposit/{id}` | read | `dep_1718` |
| GET | `/api/v1/orders` | read | — |
| GET | `/api/v1/orders/{id}` | read | `a1b2c3d4-` |
| POST | `/api/v1/orders/{id}/refund` | purchase | — |
| GET | `/api/v1/coupons` | coupons | — |
| POST | `/api/v1/coupons` | coupons | — |
| GET | `/api/v1/coupons/{code}` | coupons | — |
| DELETE | `/api/v1/coupons/{code}` | coupons | — |

### Sample Account Credentials (da documentação)
```
"password": "senha-secreta"
"email_password": "senha-do-email"
"twofa_secret": "BASE32SECRET"
```

---

## 4. Content Discovery

### /api/v1/ — Nenhum endpoint não documentado encontrado
Testados: admin, debug, swagger, graphql, playground, metrics, health, status, config, backup, logs, test, internal, private, secret, hidden → todos 404.

### /.well-known/ — Nada exposto
security.txt, openid-configuration, change-password, assetlinks.json, apple-app-site-association → todos 404.

### robots.txt — Paths bloqueados
```
Disallow: /api/   (mas API responde 200/401)
Disallow: /auth/  (mas auth responde 200)
Disallow: /conta, /carteira, /pedido/, /checkout/, /painel-
```

### Rate Limit — Não foi possível disparar
- With valid auth: Não testado (sem token válido)
- Without auth: Sempre 200 (sem rate limit no endpoint público /api/v1)
- Com fake Bearer: Sempre 401 (sem rate limit ativado — apenas validação de token falha)
- X-Forwarded-For spoofing: Sem diferença (não parece ser rate-limited por IP)
- **Conclusão:** Rate limit de 120/min é **por token**, não por IP. Sem token válido, não é possível testar.

---

## 5. Param Fuzzing

### Parâmetros testados (com fake Bearer — todos retornaram 401)
```
GET /api/v1/games?debug, admin, all, secret, internal, key, format, pretty, 
                  limit, offset, page, sort, order, filter, include, expand
GET /api/v1/accounts?game=valorant&priceFrom, priceTo, order, sort, 
                     available, status, page, limit
```
**Resultado:** Todos 401 — sem token válido para testar resposta real.  
**Recomendação:** Testar com token válido na fase de ataque webapp.

---

## 6. Rate Limit Test

### Conclusões
| Aspecto | Resultado |
|---------|-----------|
| Rate limit por IP | **Não observado** — 12+ requests consecutivas sem auth = todas 200 |
| Rate limit por token | **Provável** — 120 req/min por token (documentado no OpenAPI) |
| Rate limit com fake token | **Não observado** — fake tokens recebem 401 sem contagem de rate |
| X-Forwarded-For bypass | **Não necessário** — rate não é por IP |
| Retry-After header | **Nunca observado** — nenhuma request atingiu 429 |

**Detalhe importante:** A API documenta `429 RateLimited` com header `Retry-After`. O rate limit REAL só será testável com um token válido.

---

## 7. Candidatos a Vulnerabilidade

### 🟢 Potencial Baixo-Médio (requer token válido)
1. **IDOR em accounts** → `GET /api/v1/accounts/{id}` com IDs sequenciais/numeráveis
2. **IDOR em orders** → `GET /api/v1/orders/{id}` acessar pedidos de outros usuários
3. **Coupon abuse** → Criar cupons com alto desconto via `POST /api/v1/coupons`
4. **Purchase tampering** → Adicionar `couponCode` não autorizado no `POST /api/v1/purchase`
5. **Refund abuse** → `POST /api/v1/orders/{id}/refund` - reembolsar pedidos já entregues
6. **Idempotency-Key bypass** → Testar se chave de idempotência previne duplicação
7. **Deposit amount tampering** → `POST /api/v1/wallet/deposit` com valores negativos ou zero
8. **Mass assignment** → Campos extras em `POST /api/v1/coupons` (ex: `expiresAt`, `maxUses` não previstos)

### 🟡 Requer token com escopo específico
9. **Auth bypass** → `/dashboard`, `/dashboard/api` requerem login — testar SQLi/NoSQLi
10. **Next.js RSC data exposure** → Rota `/_next/data/{buildId}/**` expõe dados públicos. Confirmar se dados sensíveis transitam no RSC
11. **Sitemap incompleto** → `/loja/valorant/cheats`, `/ganhar/painel`, `/ganhar/revendedor` NÃO estão no sitemap

### ℹ️ Informação
12. **Supabase project ID** → Não encontrado. Tentar enumerar via DNS: `[project].supabase.co`
13. **MisticPay** → Gateway de PIX, aparece no CSP. Testar integridade de fluxo

---

## 8. Attack Surface Resumido

| Categoria | Descobertas nesta fase |
|-----------|----------------------|
| Rotas novas | 6 novas: `/loja/steam/categorias`, `/loja/valorant/cheats`, `/loja/valorant/full-acesso`, `/loja/valorant/nfa`, `/ganhar/painel`, `/ganhar/revendedor` |
| URLs externas | Twitter, Instagram (alt), Discord suporte |
| Build ID | `hv73pRcFZE5UedoOmEjHt` |
| RSC payloads | 20+ páginas com dados completos acessíveis via `/_next/data/{buildId}/` |
| Sample IDs | Account: `xFoVPEt`, Order: `a1b2c3d4-`, Deposit: `dep_1718` |
| Rate limit | Por token (120/min), não por IP. Não confirmado por falta de token válido |
| Supabase keys | Não encontradas no client bundle (server-side only) |
| Credenciais no JS | Nenhuma credencial real encontrada |
| OpenAPI spec | Completa, 17 endpoints, baixada |

---

## 9. Próximos Passos (Webapp Attack)

1. **Obter token válido** — Registrar em `/auth/sign-up`, gerar chave em `/dashboard/api`
2. **Testar IDOR** com token válido em accounts/orders com IDs sequenciais
3. **Testar coupon abuse** — Criar cupons com `type: percent`, `discount: 100`
4. **Testar purchase flow** — Manipular `couponCode`, testar idempotência
5. **Testar auth bypass** — SQLi/NoSQLi em `/auth/login`, `/auth/sign-up`
6. **Testar fluxo PIX** — MisticPay gateway, integridade de valor
7. **Testar Supabase** — Se project ID for descoberto, testar anon key RLS bypass
8. **Fuzz param com token válido** — priceFrom, priceTo, sort, order em accounts