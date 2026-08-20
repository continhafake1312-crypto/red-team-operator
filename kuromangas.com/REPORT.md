# REPORT.md — engagement/kuromangas.com

Relatório incremental (§9). Atualizado a cada fase/finding.

## Sumário executivo

Site de mangás `kuromangas.com` — pentest Web/API externo black-box.
Engagement iniciado em 2026-08-20. Stack: SPA Vite + React 18 + TypeScript
PWA; backend API REST em `/api` (versão `v4.8`); Cloudflare (CDN+WAF) com
Turnstile invisível gating `/api/*` por-request; Stripe para pagamentos.

**Bypass de WAF**: Cloudflare hard-blocks Tor por ASN; bypass via Playwright
chromium local + 2Captcha resolve managed challenge + Turnstile por-request.
IP real do origin **não descoberto** (sem API keys Shodan/Censys).

**Achado crítico de base (F-001/F-002)**: chave de criptografia da API
hardcoded no bundle JS (`VITE_API_ENCRYPTION_KEY`); respostas da API vêm
cifradas com CryptoJS Rabbit (response-only), chave derivada de
`KEY + MD5(date + "kuromangas.com::v2" + "x9_4v2_b")[0:8]` — 100%
reproduzível. Decriptor implementado e **validado contra respostas reais**
(`/api/health`, `/api/auth/request-reset`). Desbloqueia todo o ataque à API
(scraping em massa, inversão de schema admin/users).

**Mapa da API**: 237 endpoints `/api/*` mapeados via bundle mining (74 admin,
18 staff, 5 payments, 30 users, 19 scans, 26 chapters, 1 SSRF proxy).

## Findings

| ID | Severidade | Título | Host | Fase | Status |
|----|-----------|--------|------|------|--------|
| F-001 | **Crítica** | Chave de criptografia API hardcoded no client (`VITE_API_ENCRYPTION_KEY`) | kuromangas.com | F3 | confirmado |
| F-002 | Crítica | Crypto response-only Rabbit quebrado (decorre de F-001) | kuromangas.com | F3 | confirmado |
| F-003 | Alta | Painel admin completo exposto no bundle (32 rotas `/admin/*`) | kuromangas.com | F3 | confirmado (acesso a validar) |
| F-004 | Alta | Rotas DEV expostas (`/dev/*`, `/read/dev`, `/read/*-preview`) | kuromangas.com | F3 | confirmado (acesso a validar) |
| F-005 | Média | Open Redirect candidate (`/login?redirect=`) | kuromangas.com | F2 | a validar |
| F-006 | Alta | IDOR/BOLA candidates (`/read`, `/manga`, `/profile` — IDs sequenciais) | kuromangas.com | F2 | a validar |
| F-008 | Alta | Stripe (pagamentos) — mass-assignment/replay candidate | kuromangas.com | F3 | a validar |
| F-009 | Baixa | Legacy TLS 1.0/1.1 habilitado (Cloudflare) | kuromangas.com | F3 | info |
| F-010 | Baixa | HSTS não observado no origin | kuromangas.com | F3 | info |
| F-011 | Alta | Dev identity leak (`daviscardi1@gmail.com`) — credential-stuffing lead | kuromangas.com | F2 | info |
| F-012 | Crítica | Decriptor Rabbit funcional validado vs responses reais | kuromangas.com | F5 | confirmado |

### Candidatos a vuln para validação na fase webapp (F6)

| ID | Sev | Vetor | Endpoint |
|----|-----|-------|----------|
| C-1 | Alta | SSRF | `GET /api/proxy/image?url=<URL>` (IMDSv1, internal scan, file://) |
| C-2 | Crítica | Privesc admin | `PUT /api/admin/users/${id}/role {role:"admin"}` |
| C-3 | Alta | Mass-assignment payments | `POST /api/payments/create {planId}` + `verify/${id}` replay |
| C-4 | Alta | Mass-assignment profile | `PUT /api/users/me/profile {role,is_master_admin,is_supporter,...}` |
| C-5 | Alta | IDOR/BOLA | `/api/mangas/${id}`, `/api/chapters/${id}`, `/api/users/${id}/library`, `/api/notifications/${id}` |
| C-6 | Média | Open redirect | `/login?redirect=//evil.com` etc. |
| C-7 | Média/Alta | Rotas DEV | `/dev/*`, `/read/dev`, `/read/*-preview` |
| C-8 | Crítica | Admin RBAC bypass | 74 endpoints `admin/*` sem validação backend |
| C-9 | Alta | Staff privesc | `staff/users/${id}/promote-to-uploader` por user |
| C-10 | Média | Stripe/anilist OAuth replay | `payments/verify/${id}`, `anilist/oauth/start` |
| C-11 | Média/Alta | Upload abuse | `chapters/upload/*`, `novel/upload-bulk-zip` (zip-slip, stored XSS) |

## Cronologia resumida

- 2026-08-20T16:05Z — Engagement iniciado. Estrutura + escopo.
- 2026-08-20T16:35Z — F2 recon passivo: 12 subs/4 vivos (todos CF), IP real pendente, dev email, IDOR/open-redirect candidates.
- 2026-08-20T16:52Z — F3 recon ativo: F-001/F-002 chave crypto API hardcoded, F-003 admin panel, F-004 dev routes, stack Vite+React SPA.
- 2026-08-20T17:14Z — F5 enum: 237 endpoints /api mapeados, decriptor Rabbit validado vs responses reais, candidatos C-1..C-12.
