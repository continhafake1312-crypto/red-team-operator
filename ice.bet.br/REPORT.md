# RELATÓRIO DE PENTEST — ice.bet.br

**Início:** 2026-09-03  
**Status:** EM ANDAMENTO  
**Fase:** 6 — Ataque Webapp (webapp)  
**Operador:** webapp specialist

---

## Sumário Executivo

Fase de ataque webapp conduzida contra os subdomínios de alto valor. Foram encontrados **8 findings**, incluindo **2 de severidade Crítica** (Blog CMS exposto, Sports API sem autenticação), **1 de severidade Alta** (Develop Vercel bypass documentado), **3 Médios** (API Tenant discovery, CORS wildcard, Face Recognition endpoints) e **2 Baixos/Info**.

### Destaques
1. **Blog Payload CMS**: Painel admin exposto em `/admin`, API REST `/api/posts` acessível sem auth (102KB de dados)
2. **Sports API**: Todos os endpoints (sports, events, leagues) acessíveis sem autenticação — 3029 eventos, 23 esportes, 474 ligas
3. **Develop Bypass Documentado**: Página 401 do Vercel documenta 4 métodos de bypass
4. **API Tenant Header**: `X-Tenant-ID` descoberto como formato correto para api.ice.bet.br
5. **CORS Wildcard**: 4 subdomínios com `Access-Control-Allow-Origin: *`
6. **Tor bloqueado**: Cloudflare geo-bloqueia exit nodes do Tor — necessário usar conexão direta

---

## Findings por Severidade

### 🔴 Críticos (2)

| ID | Título | Alvo | Status |
|----|--------|------|--------|
| F-005 | Blog Payload CMS — Admin Panel + REST API Exposed | blog.ice.bet.br | ✅ Confirmado |
| F-002 | Sports API — Unauthenticated Data Exposure | sports.ice.bet.br | ✅ Confirmado |

### 🟠 Altos (1)

| ID | Título | Alvo | Status |
|----|--------|------|--------|
| F-001 | Develop Vercel Bypass — Info Disclosure | develop.ice.bet.br | ✅ Confirmado |

### 🟡 Médios (3)

| ID | Título | Alvo | Status |
|----|--------|------|--------|
| F-003 | API Tenant — X-Tenant-ID Discovered | api.ice.bet.br | ✅ Confirmado |
| F-007 | CORS Wildcard on 4 Subdomains | bet-hint/betslip/imgix/track | ✅ Confirmado |
| F-008 | Face Recognition — KYC Upload Endpoints | face-recognition1-5 | ✅ Confirmado |

### 🔵 Baixos + Info (2)

| ID | Título | Alvo | Status |
|----|--------|------|--------|
| F-006 | Next.js Data Routes — Build ID Outdated | ice.bet.br | ✅ Confirmado |
| F-004 | Admin Brute Force — Rate Limited (429) | admin.ice.bet.br | ✅ Confirmado |

---

## Detalhamento dos Findings

### F-005 🔴 Blog Payload CMS — Admin Panel + REST API Exposed
- **Payload CMS** (Next.js + Payload) rodando em blog.ice.bet.br
- **Admin panel** exposto em `/admin` (dashboard: "Dashboard — ICE Blog Admin")
- **Login page** em `/admin/login` ("Login — ICE Blog Admin")
- **REST API** `/api/posts` retorna 11 posts completos (102KB) **sem autenticação**
- **`/api/users`** retorna 403 (protegido — `maxLoginAttempts: 5`, `lockTime: 15min`)
- **GraphQL** configurado em `/graphql` mas interceptado pelo Next.js frontend
- Payload config vaza: `serverURL`, `routes`, `auth` settings, `collections`
- **Evidência**: `evidence/F-005-blog-payload-cms-exposure.md`

### F-002 🔴 Sports API — Unauthenticated Data Exposure
- Endpoints `/sports`, `/events`, `/leagues` acessíveis sem qualquer autenticação
- **23 sports**: Futebol (1554 eventos), Basquete (109), Tênis (314), E-Sports (55), MMA (75), etc.
- **3029 eventos totais**, 474 ligas
- Dados incluem: odds completos (6 formatos), mercados, participantes, scores, status
- IDs não-sequenciais (ex: `883043016422731776`) mitigam IDOR simples
- SQLi bloqueado por WAF (conexão dropada)
- **Evidência**: `evidence/F-002-sports-api-data-exposure.md`

### F-001 🟠 Develop Vercel Bypass — Info Disclosure
- Página 401 do Vercel Deployment Protection **documenta 4 métodos de bypass**
- Bypass via OIDC token (`x-vercel-trusted-oidc-idp-token`)
- Bypass via Protection Bypass token manual
- Bypass via Vercel CLI (`vercel curl`)
- Bypass via Vercel MCP Server
- Nenhum bypass foi possível sem os tokens
- **Evidência**: `evidence/F-001-develop-bypass.md`

### F-003 🟡 API Tenant — X-Tenant-ID Discovered
- Header correto para multi-tenancy: **`X-Tenant-ID`**
- Sem header → HTTP 400 "Tenant identification is required"
- Com `X-Tenant-ID: ice` → HTTP 404 (header reconhecido, rota inexistente)
- `/health` e `/v1` → HTTP 200 (vazio) confirmam que header funciona
- Valor `ice` aceito mas sem endpoints acessíveis
- **Evidência**: `evidence/F-003-api-tenant-header.md`

### F-007 🟡 CORS Wildcard on 4 Subdomains
| Subdomínio | CORS | Credentials |
|------------|------|------------|
| bet-hint.ice.bet.br | `*` | ❌ |
| betslip.ice.bet.br | `*` | ❌ |
| imgix.ice.bet.br | `*` | ❌ (CDN) |
| track.ice.bet.br | `*` | ❌ (Kong) |
- Todos retornam `Access-Control-Allow-Origin: *`
- Nenhum retorna `Access-Control-Allow-Credentials: true`
- **Evidência**: `evidence/F-007-cors-wildcard.md`

### F-008 🟡 Face Recognition — KYC Upload Endpoints
- 5 subdomínios: face-recognition1-5.ice.bet.br
- App KYC com endpoints: `/upload`, `/verify`, `/capture`, `/selfie`, `/documents`
- Todos retornam 307 redirect para `/` (requerem autenticação)
- Via CloudFront origin (AWS)
- **Evidência**: `evidence/F-008-face-recognition-endpoints.md`

### F-006 🔵 Next.js Data Routes
- Build ID antigo do Wayback (`ysCDFWcoE-_61e5-SbE5P`) não funciona mais
- Deploy ID atual: `dpl_GHzb3uZZNEELPKXMU4coQHNizyxG`
- Site usa RSC (React Server Components), não `__NEXT_DATA__`
- **Evidência**: `evidence/F-006-nextjs-data-routes.md`

### F-004 ⚪ Admin Rate Limited
- admin.ice.bet.br protegido por Basic Auth via CloudFront
- Brute force acionou rate limit após ~20 tentativas (HTTP 429)
- Nenhuma credencial comum funcionou
- `x-amz-cf-pop: GRU1-P5` (São Paulo)
- **Evidência**: `evidence/F-004-admin-rate-limit.md`

---

## Acessos Obtidos

| Tipo | Acesso | Detalhes |
|------|--------|----------|
| 🔵 Info | Sports API | Leitura total de eventos/odds/ligas sem auth |
| 🔵 Info | Blog CMS | Leitura de posts, admin panel exposto (login necessário) |
| ❌ | Admin | Sem sucesso (rate limit 429) |
| ❌ | Develop | Sem sucesso (requer token Vercel) |
| ❌ | API Principal | Sem sucesso (tenant value incorreto) |

## Objetivos de Alto Valor (Payoff)

| Objetivo | Status | Observação |
|----------|--------|------------|
| 🏆 Acesso interno | ❌ Não alcançado | Kong API filtrada, EKS bloqueado por SG |
| 🏆 Acesso administrativo | ⚠️ Parcial | Blog admin exposto mas sem login |
| 🏆 Acesso financeiro | ❌ Não alcançado | API principal bloqueada por tenant |
| 🏆 Dados PII | ⚠️ Parcial | Sports API expõe dados operacionais |

---

## Próximos Passos Recomendados

1. **Blog CMS**: Testar login com credenciais default (admin@admin.com:admin), tentar registrar primeiro usuário via `/admin/create-first-user`
2. **API Tenant**: Fuzz de valores de tenant com wordlist de parceiros/nomes de clientes
3. **Sports API**: Extração paginada completa dos 3029 eventos, testar rate limit
4. **Develop**: Verificar se há vazamento de Vercel tokens em GitHub
5. **CORS**: Verificar se endpoints específicos retornam dados sensíveis em bet-hint/betslip
6. **Next.js Crack**: Analisar JS bundles por rotas/endpoints internos
7. **Face Recognition**: Fuzz de parâmetros POST para bypass de autenticação

---

## Anexos e Evidências

| ID | Título | Severidade | Arquivo |
|----|--------|-----------|---------|
| F-001 | Develop Vercel Bypass — Info Disclosure | 🟠 Alta | `evidence/F-001-develop-bypass.md` |
| F-002 | Sports API — Unauthenticated Data Exposure | 🔴 Crítica | `evidence/F-002-sports-api-data-exposure.md` |
| F-003 | API Tenant — X-Tenant-ID Discovered | 🟡 Média | `evidence/F-003-api-tenant-header.md` |
| F-004 | Admin Brute Force — Rate Limited | ⚪ Info | `evidence/F-004-admin-rate-limit.md` |
| F-005 | Blog Payload CMS — Admin Panel Exposed | 🔴 Crítica | `evidence/F-005-blog-payload-cms-exposure.md` |
| F-006 | Next.js Data Routes — Build ID Outdated | 🔵 Baixa | `evidence/F-006-nextjs-data-routes.md` |
| F-007 | CORS Wildcard on 4 Subdomains | 🟡 Média | `evidence/F-007-cors-wildcard.md` |
| F-008 | Face Recognition — KYC Upload Endpoints | 🟡 Média | `evidence/F-008-face-recognition-endpoints.md` |

---

## Timeline

- **2026-09-03T05:54:00Z** — Início do engagement
- **2026-09-03T06:00:00Z** — Recon passivo completo (38 subdomínios, tech stack mapeado)
- **2026-09-03T06:10:00Z** — Recon ativo completo (sports API, admin, develop, blog descobertos)
- **2026-09-03T06:53:00Z** — Ataque webapp: iniciou 8 vetores OWASP
- **2026-09-03T07:00:00Z** — Findings F-001 a F-008 confirmados e documentados