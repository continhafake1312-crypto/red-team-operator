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
| F-013 | **Alta** | SSRF `GET /api/proxy/image?url=` + mapeamento interno (backend :5000, PG :5432, Redis :6379) | kuromangas.com | F6 | confirmado |
| F-014 | Média | IDOR/PII: `users/<id>` + `users/<id>/library` vazam histórico/biblioteca (perfis públicos) | kuromangas.com | F6 | confirmado |
| F-015 | Média | Rota DEV "Kuro Dev Hub" (`/dev`) exposta sem auth | kuromangas.com | F6 | confirmado |
| F-016 | Info | Pagamentos via livepix.gg (não Stripe); mass-assignment mitigada; verify por polling | kuromangas.com | F6 | confirmado |
| F-017 | Info | RBAC admin/staff enforced — privesc C-2/C-4/C-8/C-9 NÃO confirmado (mitigado) | kuromangas.com | F6 | confirmado |
| F-018 | Baixa | Bypass Turnstile (visível 2Captcha + invisível browser) → conta automatizada | kuromangas.com | F6 | confirmado |

## Fase 6 (webapp) — sumário

Conta de teste criada (user id=24829, role=user) via bypass do Turnstile visível (2Captcha) +
browser real (managed challenge CF resolvido in-browser). Sessão autenticada + nonce
`X-Session-Nonce` capturados. Decriptor (F-012) usado para decriptar ~50 respostas
autenticadas. **Nenhum segredo/cred/cookie no repo** (chmod 600 em `/tmp`).

### Objetivo #1 — Privesc admin / RBAC bypass: **NÃO alcançado** (sólido)
- C-2 `PUT admin/users/<me>/role {role:admin}` → 403 "Apenas administradores".
- C-8 todos os 24 endpoints `admin/*` (GET) → 403 (mensagens de role específicas).
- C-9 todos os 7 endpoints `staff/*` + `staff/users/<me>/promote-to-uploader` → 403.
- C-4 mass-assignment `PUT users/me/profile` com role/is_master_admin/is_supporter/coins →
  400 "Nenhum campo para atualizar" (allowlist). → F-017.

### Objetivo #2 — Financeiro: **NÃO alcançado** (mitigado)
- Provedor real = **livepix.gg** (não Stripe). `payments/create {planId:"monthly"|"annual"}`
  cria PaymentIntent; `amount` controlado server-side (1000/9600); campos extra (price,
  amount, is_supporter, discount, coupon) ignorados. `verify/<txid>` só poll o provedor
  ("Aguardando confirmação...") — replay não concede supporter. IDOR por txid não
  prático (ObjectIds não enumeráveis); `payments/list` escopado por sessão. → F-016.
- Nenhuma cobrança real (8 intents "pending" nunca confirmados).

### Objetivo #3 — PII / Conteúdo: **parcial**
- F-014: `users/<id>` expõe `recentHistory` + `stats` e `users/<id>/library` expõe a
  biblioteca de qualquer perfil público (por enumeração de ID). Perfis privados
  protegidos (403). E-mail NÃO vazado por `users/<id>`.
- Conteúdo private: mangá `is_private` (id=42) oculta a lista de chapters; nenhum leak de
  `chapter_id` encontrado (comments com chapter_id null; `chapters/recent|updates` filtram
  privados). **Bypass de paywall/conteúdo privado NÃO confirmado** (gating sólido).
- `chapters/<id>` retorna conteúdo (pages) por ID — acesso é "by design" para leitura.

### Outros achados
- F-013 SSRF (Alta): `/api/proxy/image?url=` faz fetch server-side de URLs arbitrárias;
  erro diferencia ECONNREFUSED/ECONNRESET/hangup → port-scan interno cego + fingerprint
  (backend origin 127.0.0.1:5000, PostgreSQL 5432, Redis 6379). Atinge o origin bypassando
  CF (auth ainda exigida). IMDSv1 e file:// não exploráveis.
- F-015 `/dev` (Kuro Dev Hub) — playground de componentes interno exposto sem auth.
- F-018 bypass Turnstile (barreira anti-bot quebrável com custo trivial).
- C-6 open redirect `/login?redirect=`: SPA NÃO redireciona para host externo → NÃO confirmado.

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
