# ENUM.md — Enumeração Profunda (Fase 5) — www.cursosprepare.com

> Engajamento: pentest black-box externo | Alvo: `cursosprepare.com` (Wix managed)
> OPSEC: proxychains4/Tor; bypass App Armor via `--resolve www.cursosprepare.com:443:185.230.63.171`

## 1. Resumo executivo

| Métrica | Valor |
|---|---|
| Host prioritário | `www.cursosprepare.com` (via apex IP bypass) |
| Content discovery (ffuf) | 22 paths 200/301 (ver `content_discovery.txt`) |
| JS bundles baixados | ~16 bundles (ver `js/`) |
| APIs Wix mapeadas | dynamicmodel, access-tokens, members, GraphQL storefront |
| Challenge-pages | 30 cursos pagos → todos 200 sem auth |
| Members | **300 membros vazados sem auth** |
| Tokens vazados | metaSiteId, svSession, mediaAuthToken (JWT), 17 app instances |
| Findings | F-001 (Crítica), F-002 (Alta), F-003 (Alta), + info |

## 2. APIs Wix mapeadas (`wix_api_probe.txt`)

| Endpoint | Status | Notas |
|---|---|---|
| `/_api/v2/dynamicmodel` | **200 (86KB)** | Vaza tokens (F-002) |
| `/_api/v1/access-tokens` | **200 (86KB)** | Vaza tokens (F-002) |
| `/_api/members/v1/members` | **403→200 via bypass** | Vaza 300 membros (F-001) |
| `/_api/members/v1/members/me` | 400 | UNAUTHENTICATED |
| `/_api/members/v1/members/current` | 400 | UNAUTHENTICATED |
| `/_api/members/v1/profiles` | 404 | |
| `/_api/wix-ecommerce-storefront-web/v1` | 404 | |
| `/_api/wix-bookings-web/v1` | 404 | |
| `/_api/wix-online-programs-web/v1` | 404 | |
| `/_api/pricing-plans/v1` | 404 | |
| `/_api/graphql`, `/graphql/` | 404/301 | |
| `/_serverless/pricing-plans-tpa-router` | 200 | |
| `/_partials/` | 403 | |

## 3. Tokens vazados (F-002) — `api/app_instances.txt`
- `metaSiteId`: `dcffb6fe-b153-4b2e-bd44-5de8281fcb28`
- `siteOwnerId`: `f6283dba-6561-4bbc-873f-b2dcecda1f5d`
- `mediaAuthToken` (JWT, aud `urn:service:file.upload`, exp 24h)
- `svSession`, `ctToken`, `visitorId`, `hs`
- 17 TPA app instance tokens (Wix Bookings Services, Subscriptions, system apps)

## 4. Members (F-001) — `api_members_all.json`
- **300 membros** vazados sem auth
- Campos: id, contactId, nickname (nome real), slug, photo.url (Google/Facebook), createdDate, updatedDate
- 171 com foto (159 Google, 12 Facebook)
- Range cadastro: 2024-07-17 a 2026-08-09
- Notáveis: Fábio Campelo (proprietario), Ana Paula Leite Martins (diretora), Luis Guilherme Leite Martins (dono), "Cursos Prepare" (marca)

## 5. Challenge-pages (F-003) — `challenge_pages_status.txt`
- 30 cursos pagos, todos HTTP 200 sem auth, 1.1-1.2MB cada
- HTML contém refs a member/login/locked/premium/paid (gating client-side)
- Títulos em `challenges_list.tsv` (cursos para prefeituras RS, Brigada Militar, Fundatec, Legalle)
- **Pendente webapp**: confirmar se conteúdo pago é exposto no HTML ou carregado via API autenticada

## 6. Content discovery (`content_discovery.txt`)
Paths 200: `/pricing-plans`, `/challenge-page`, `/participant-page`, `/politicas`, `/quem-somos`, `/contratos`, `/cursosead`, `/equipeprepare`, `/cart-page`, `/simuladobm`, `/simuladopp`, `/aulasgratuitas`, `/realizados`, `/plans-pricing`, `/checkout`, `/payment-request-page`, `/thank-you-page`, `/.well-known/apple-developer-merchantid-domain-association` (Apple Pay), `/_partials` (301).

## 7. GraphQL (`graphql_schema_storefront.json`)
- Schema Wix Stores storefront (325KB) — contém queries/mutations para catálogo, carrinho, checkout.
- **Pendente webapp**: testar introspection ativa, queries sensíveis (listOrders, member data), batch attacks.

## 8. JS findings (`js_keys.txt`)
4 Sentry DSNs Wix expostos (Wixpress):
- `https://760a5dce5978409b86a97e1ccd21aa7a@sentry.wixpress.com/154`
- `https://76e577208263430cb7ab8e220bd84349@sentry.wixpress.com/806`
- `https://831e1d96e7944c6aae0c9ed9d6babd35@sentry.wixpress.com/5896`
- `https://e0ad700df5e446b5bfe61965b613e52d@sentry.wixpress.com/715`

## 9. Candidates a vuln para webapp (priorizados)

| Rank | Vetor | URL/param | Especialista |
|---|---|---|---|
| 1 | Confirmar exposure de conteúdo pago (F-003) | 30 challenge-page/<UUID> | webapp |
| 2 | GraphQL introspection + queries sensíveis | GraphQL storefront | webapp |
| 3 | mediaAuthToken upload abuse (F-002) | aud file.upload | webapp |
| 4 | svSession reuse em APIs autenticadas | members/me, checkout | webapp |
| 5 | IDOR member por UUID (acessar perfil individual) | `/_api/members/v1/members/<UUID>` | webapp |
| 6 | `/cursosead` auth bypass | portal EAD | webapp |
| 7 | `/payment-request-page` IDOR | payment request | webapp |
| 8 | Wix Stores checkout/cart manipulation | GraphQL/Storefront | webapp |
| 9 | Wix Bookings IDOR | bookings slots/services | webapp |

## 10. Limitações
- Members API retornou 403 no re-verify pós-enum (tokens expiram/rotacionam); o enum obteve os 300 via dynamicmodel tokens. Webapp deve re-obter tokens antes de testar.
- Sem ENUM.md previamente; este doc consolidado agora.

*Fase 5 consolidada. Findings F-001/F-002/F-003 documentados em evidence/. Próximo: delegar webapp para validar vetores.*
