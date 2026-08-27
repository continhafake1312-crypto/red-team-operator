# ENUM.md — Consolidação da Enumeração Profunda (Fase 5)

> Engagement: caveira.com | Data: 2026-08-27

## Sumário Executivo

A enumeração profunda revelou uma attack surface significativamente maior que o esperado:
além do WordPress em `teste.caveira.com` (com DB down), descobriu-se uma **API Laravel**
em `api.caveira.com` (backend do SPA "Projeto Caveira"), múltiplas SPAs Quasar/Vue.js
em Netlify, e uma rota de **personificação de usuário** (`/profile/personification/:access_token`)
que é vetor potencial de ATO/IDOR. A API Laravel está atrás de AWS ALB + nginx 1.18.0.

---

## 1. Hosts Prioritários — Tabela Consolidada

| Host | Stack | Endpoints | Plugins WP | JS Endpoints | APIs | Payoff |
|------|-------|-----------|------------|--------------|------|--------|
| teste.caveira.com (165.227.4.115) | WP 7.1 + Apache 2.4.58 + PHP + Elementor | wp-login, xmlrpc, wp-json (401), wp-admin | elementor 3.32.0, elementor-pro 3.28.0, ACF 6.5.1, code-snippets 3.7.0, wp-fail2ban 5.4.1 | assets JS/CSS estáticos | wp-json protegida (miniOrange) | ALTO (CVE-2026-32475, mas DB down) |
| api.caveira.com | Laravel + nginx 1.18.0 + AWS ALB | /api/v1/auth/login (POST), /api/v1/* | N/A | N/A | REST API Laravel, JSON, CSRF (XSRF-TOKEN), sessão cifrada (caveira_session) | ALTO (auth bypass, IDOR, enum) |
| plataforma.caveira.com | Quasar (Vue.js) SPA em Netlify | Rotas Vue (50+), Efí Pay | N/A | app.6db72a12.js (51KB), vendor.db5a5887.js (4MB) | api.caveira.com/api/v1 | ALTO (SPA analysis, secrets em JS) |
| app.caveira.com / aplicativo.caveira.com | Idêntico a plataforma.caveira.com | Mesmas rotas | N/A | Mesmo bundle | Mesma API | MÉDIO (duplicado) |
| orca-app-aznfk.ondigitalocean.app (app2 origem) | Quasar SPA em DigitalOcean App Platform | Mesmas rotas, build diferente | N/A | app.98296088.js (38KB), vendor.190a7c29.js (1.8MB) | Mesma API | ALTO (bypass CDN, origem direta) |
| panel.caveira.com | SPA Netlify (Painel Caveira) | Login form | N/A | (a analisar) | ? | MÉDIO |
| loja.caveira.com | Loja Nuvem e-commerce | Bloqueia Tor (403) | N/A | N/A | N/A | BAIXO |
| caveira.com (apex) | WP 7.1 + Elementor + Cloudflare + Wordfence | WP padrão | Yoast 28.3, Site Kit 1.186.0 | N/A | wp-json | MÉDIO (proteção CF+Wordfence) |

---

## 2. Plugins WordPress Confirmados (teste.caveira.com)

| Plugin | Versão | Método de Detecção | CVE Relevante |
|--------|--------|---------------------|---------------|
| **Elementor (Free)** | **3.32.0** | JS header `/*! elementor - v3.32.0 - 18-09-2025 */` + readme.txt `Stable tag: 3.32.2` | Patchstack advisories |
| **Elementor Pro** | **3.28.0** | JS header `/*! elementor-pro - v3.28.0 - 23-03-2025 */` | **CVE-2026-32475 (RCE, CVSS 9.0) — VULNERÁVEL (≤4.2.1)** |
| Advanced Custom Fields | 6.5.1 | readme.txt `Stable tag: 6.5.1` | Verificar |
| Code Snippets | 3.7.0 | readme.txt `Stable tag: 3.7.0` | Verificar |
| WP fail2ban | 5.4.1 | readme.txt `Stable tag: 5.4.1` | N/A (segurança) |
| miniOrange API Authentication | (versão desconhecida) | Probe 401 em /wp-json/ | CVE-2025-39545 (possível) |

**Observação:** O readme do Elementor Pro está truncado (sem "Stable tag") — versão obtida
via header do arquivo JS `frontend.min.js`. O readme.txt do Elementor Free reporta `Stable tag:
3.32.2` mas o JS carregado é `v3.32.0` (build de 18-09-2025) — discrepância de versão.

---

## 3. Endpoints de API Descobertos

### api.caveira.com (Laravel REST API)

- **Base URL:** `https://api.caveira.com/api/v1`
- **Auth:** `POST /api/v1/auth/login` — aceita `email` + `password` (mín. 6 chars),
  retorna erros de validação Laravel (`{"errors":{"password":[...]}}`)
- **CSRF:** Cookie `XSRF-TOKEN` (Laravel), `caveira_session` (httponly, cifrada)
- **Infra:** AWS ALB (cookies AWSALB/AWSALBCORS) → nginx 1.18.0 (Ubuntu) → Laravel
- **Auth header:** `Authorization: Bearer <token>`, header custom `Environment: "web"`
- **Token storage:** `localStorage.getItem("token")` (JWT ou token Laravel Sanctum)

### Endpoints inferidos das rotas Vue

| Endpoint SPA | Rota API (provável) | Auth? | Notas |
|--------------|---------------------|-------|-------|
| `/auth/login` | POST /api/v1/auth/login | ❌ | Login (confirmado) |
| `/register` | POST /api/v1/register | ❌ | Registro (testar se habilitado) |
| `/password-recovery` | POST /api/v1/password-recovery | ❌ | Recuperação de senha |
| `/password-recovery/reset/:token` | POST /api/v1/password-recovery/reset | ❌ | Reset com token |
| `/profile` | GET /api/v1/profile | ✅ | Perfil do usuário |
| `/profile/personification/:access_token` | GET /api/v1/profile/personification | ✅ (admin?) | **IMPESSONAÇÃO — IDOR/ATO potencial** |
| `/profile/remove-account` | DELETE /api/v1/profile | ✅ | Remover conta |
| `/email-confirmation` | GET /api/v1/email-confirmation | ❌? | Confirmação de email |
| `/certificate/validate` | GET /api/v1/certificate/validate | ❌? | Validação de certificado |
| `/checkout` | POST /api/v1/checkout | ✅ | Pagamento (Efí Pay) |
| `/inner-checkout/:product_id` | POST /api/v1/checkout/:product_id | ✅ | Checkout produto |
| `/courses` | GET /api/v1/courses | ✅ | Cursos |
| `/teams/:team_id` | GET /api/v1/teams/:team_id | ✅ | Turmas (IDOR?) |
| `/enroll/:token` | POST /api/v1/enroll/:token | ? | Matrícula com token |

---

## 4. Rotas Vue Completas (mapeamento de aplicação)

### Rotas Públicas (sem requiresAuth)
- `/login`, `/register`, `/password-recovery`, `/password-recovery/success`,
  `/password-recovery/reset/:token`, `/email-confirmation`, `/certificate/validate`,
  `/black-friday`, `/charlie`, `/enroll/:token`

### Rotas Autenticadas (requiresAuth: true)
- `/home`, `/questions`, `/discursive-questions`, `/courses`, `/courses/web-viewer`,
  `/flashcards`, `/flashcards/my`, `/flashcards/skull`, `/flashcards/revision/`,
  `/essay`, `/essay/submit`, `/essay/history`, `/mentoring`, `/mind-maps`,
  `/performance`, `/personal-practice-ex`, `/syllabi`, `/smart-laws`, `/smart-summaries`,
  `/squad`, `/teams/:team_id`, `/profile`, `/store`, `/support`, `/reembolso`,
  `/checkout`, `/inner-checkout`, `/contract/:cartId`, `/chat/:uuid?`

### Rota Crítica
- **`/profile/personification/:access_token`** — Personificação de usuário.
  Recebe `access_token` como parâmetro de URL. Se este endpoint permitir que um
  admin "se logue como" outro usuário via token, e se o token for previsível/ Enumeration
  possível, é vetor de ATO (Account Takeover). **Prioridade de investigação.**

---

## 5. JS Analysis — Chaves, Tokens, Segredos

### Nenhum secret hardcodeado encontrado nos bundles app.js analisados
- `localStorage.getItem("token")` / `setItem("token")` — JWT/token em localStorage ( XSS → token theft )
- `Bearer ${t}` — Authorization header dinâmico
- `Environment: "web"` — header custom para distinguir plataforma (web vs mobile)

### Source Maps
- Não detectados `.js.map` nos bundles analisados (build de produção minificado)

---

## 6. Outras Descobertas

| Item | Detalhe | Impacto |
|------|---------|---------|
| **WordPress DB Error** | `teste.caveira.com` retorna "Error establishing a database connection" em TODAS as páginas dinâmicas (HTTP 500) | Info disclosure + DoS. Bloqueia exploit do CVE-2026-32475 (forms precisam de DB) |
| **nginx 1.18.0 (Ubuntu)** | Reverse proxy em api.caveira.com | Versão antiga (2020) — CVE research necessário |
| **AWS ALB** | Cookies AWSALB/AWSALBCORS em api.caveira.com | Infra cloud AWS |
| **DigitalOcean Spaces CDN** | `caveira.sfo3.cdn.digitaloceanspaces.com` | Storage de assets (loader.gif) — verificar listing público |
| **Google Tag Manager** | `GTM-WNCHB9GD` em plataforma.caveira.com e app2 origem | Tracking ID exposto |
| **Efí Pay (EfiPay)** | SDK de pagamento carregado nas SPAs (`payment-token-efi.min.js`) | Integração de pagamento — alvo de alto valor |
| **Quasar Framework** | SPAs em Vue.js/Quasar (`#q-app`, `quasar`) | Framework SPA padrão |

---

## 7. Ranking de Payoff Atualizado

| # | Vetor | Host | Severidade | Probabilidade | Notas |
|---|-------|------|------------|----------------|-------|
| 1 | **Personificação/ATO** via `/profile/personification/:access_token` | api.caveira.com | Crítica | Média | Testar se token é enumerável/previsível |
| 2 | **Auth bypass / cred stuffing** em `/api/v1/auth/login` | api.caveira.com | Alta | Média | Laravel validation revela campos; testar rate limit, default creds, bypass |
| 3 | **CVE-2026-32475** Elementor Pro 3.28.0 RCE | teste.caveira.com | Crítica | Baixa (DB down) | Versão vulnerável confirmada; exploit bloqueado por DB error |
| 4 | **IDOR em endpoints autenticados** (teams, courses, profile) | api.caveira.com | Alta | Média | IDs sequenciais prováveis (team_id, product_id) |
| 5 | **Subdomain takeover** skull.homo.caveira.com | skull.homo.caveira.com | Alta | Alta | Já confirmado (C-001), claim pendente |
| 6 | **Register habilitado** | api.caveira.com | Média | Alta | Se /register aceita signup → acesso autenticado à plataforma |
| 7 | **Password recovery enum** | api.caveira.com | Média | Média | Testar se /password-recovery revela emails válidos |
| 8 | **Certificate validation bypass** | api.caveira.com | Média | Média | /certificate/validate pode aceitar certificados falsos |
| 9 | **nginx 1.18.0 CVEs** | api.caveira.com | Média | Baixa | Versão antiga, mas PoCs config-dependentes |
| 10 | **WordPress DB Error** | teste.caveira.com | Baixa | Confirmada | Info disclosure + disponibilidade |

---

## 8. Próximos Passos Recomendados

1. **Testar `/api/v1/register`** — se registro habilitado, obter conta autenticada → mapear
   todos os endpoints autenticados → caçar IDOR/ATO
2. **Testar `/api/v1/password-recovery`** — email enumeration via timing/response
3. **Investigar `/profile/personification/:access_token`** — estrutura do token, enumerabilidade
4. **Enumerar endpoints da API Laravel** com ffuf (Content-Type: application/json)
5. **Testar auth bypass** no login (SQLi, NoSQLi, mass assignment)
6. **CVE research nginx 1.18.0** — verificar CVEs aplicáveis
7. **Re-monitorar DB do WordPress** — se voltar, explorar CVE-2026-32475
8. **Analisar panel.caveira.com** — "Painel Caveira" (login do app Caveira Pass)

---

*Consolidação escrita em 2026-08-27T15:00Z pelo coordenador (cota de subagentes esgotada).*
