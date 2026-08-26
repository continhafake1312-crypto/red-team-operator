# ENUM.md — Enumeração Profunda

> **Alvo:** vumpe.com (clipador.vumpe.com prioritário)
> **Data:** 2026-08-26
> **Agente:** enum
> **OPSEC:** Tor (127.0.0.1:9050) via proxychains4

---

## Sumário Executivo

- **107 chunks JS baixados (5.1 MB)** do Next.js (buildId: `f38PtoqtgBHA12_uIMJrq`)
- **API Next.js interna** — SSR routes detectadas mas não expostas diretamente (`isAPIRoute`)
- **PostHog self-hosted exposto** → `/ingest/decide` sem autenticação retorna config internas
- **Nenhuma chave/secret/token hardcoded** no JS client-side
- **S3 bucket** `social-tracker-bucket-production` existe mas bloqueado (403)
- **mcl4.ruyter.com** — clone de staging do MCL na Vercel
- **Rotas internas** descobertas: `/webhooks/`, `/webhooks/test`, `/users`, `/member`

---

## 1. JS Analysis — Chunks do Next.js

### Build Info
- **Build ID:** `f38PtoqtgBHA12_uIMJrq`
- **Framework:** Next.js 15 (App Router + Pages Router)
- **Bundler:** Webpack
- **UI:** Stitches CSS-in-JS, Tailwind, Framer Motion
- **HTTP:** fetch, ky, got
- **Monitoramento:** Sentry (vercel-production, release `cb96e609e674c722ce040c16f65fb3facc8af665`)

### Chunks Críticos Baixados

| Arquivo | Tamanho | Conteúdo |
|---------|---------|----------|
| `37a763b4-7ffcde70cc38befd.js` | 488 KB | Shared chunk — PDF/encoding libs |
| `e78312c5-c3cb187591c51666.js` | 328 KB | Shared chunk |
| `ea88be26-8f2a9e89f3b3104a.js` | 300 KB | Shared chunk |
| `6988-80d73bfa6f0ad9a0.js` | 300 KB | Shared chunk |
| `8691-681a03f291987fd3.js` | 252 KB | UI components (medals, icons, clips) |
| `framework-6b865f47de8e935a.js` | 188 KB | Next.js framework (router, prefetch) |
| `main-ee0fa7b422b6dc78.js` | 132 KB | Main app bundle (router, API handler) |
| `483-67f10497a0e2047c.js` | 216 KB | Shared chunk |
| `1771-be2f100c680e25c1.js` | 204 KB | Shared chunk |
| `6763fea0-552c47ad25ca7182.js` | 224 KB | Shared chunk |

### API Endpoints no Código

No `main-ee0fa7b422b6dc78.js`, encontrados strings de rota:

```
/api              → String literal (rota reservada)
/api/             → String literal
/isAPIRoute       → Função que valida se rota é API
```

No `_buildManifest.js`, regex de roteamento exclui `/api`:

```
/((?!_next/static|_next/image|favicon.ico|assets|logo|lottie-files|api|ingest).*)
```

### Providers/Libs Identificados

| Lib | Uso |
|-----|-----|
| fetch | HTTP requests |
| ky | HTTP requests (lightweight fetch wrapper) |
| got | HTTP requests |
| Sentry | Error tracking (DSN server-side) |
| PostHog | Analytics (self-hosted) |
| Hoory | Customer support chat (app.hoory.com) |
| TikTok embed | Embed de vídeos |
| Instagram embed | Embed de posts |
| Google Fonts | Fontes |
| Cloudflare Turnstile | CAPTCHA (`challenges.cloudflare.com/turnstile`) |

### Chaves/Tokens/Senhas

**Nenhuma chave AWS, JWT, Bearer token, ou connection string encontrada nos chunks client-side.** Todos os secrets são server-side (Next.js API Routes ou env vars).

---

## 2. API Discovery

### Rota Exposta: PostHog Ingestion API

**Endpoint:** `/ingest/decide`
**Método:** POST
**Status:** 200 (sem auth)
**Resposta:**
```json
{
  "errorsWhileComputingFlags": false,
  "featureFlags": {},
  "featureFlagPayloads": {},
  "config": { "enable_collect_everything": true },
  "requestId": "850d85bf-1769-4ca9-a4cc-0a1a7cdd9702",
  "sessionRecording": false,
  "isAuthenticated": false
}
```
- **Severidade: Média** — PostHog self-hosted exposto, sem auth no `/decide`
- `enable_collect_everything: true` — captura todos os eventos

**Endpoints PostHog adicionais:**
- `/ingest/static/` → 200 (static assets)
- `/ingest/array/` → 404
- `/ingest/decide` → 200
- `/ingest/e/` → ? (capture)
- `/ingest/s/` → ? (static)

### Rotas /api/ testadas (TODAS 404)

```
/api/auth/session → 404    /api/auth/callback → 404
/api/auth/providers → 404  /api/user → 404
/api/users → 404           /api/profile → 404
/api/offerings → 404       /api/orders → 404
/api/payments → 404        /api/checkout → 404
/api/webhook → 404         /api/health → 404
/api/graphql → 404         /api/trpc → 404
/api/swr → 404             /api/api-docs → 404
/api/swagger → 404         /api/openapi.json → 404
```

> **Conclusão:** APIs Next.js são SSR-only. Não expostas via client-side. Requerem autenticação via NextAuth/session.

### Rotas Páginas (HTTP Status)

| Rota | Status | Observação |
|------|--------|------------|
| `/profile` | 200 | SSG — vazio sem auth |
| `/subscriptions` | 200 | SSG — vazio sem auth |
| `/register` | 200 | SSG — formulário |
| `/offerings` | 307 | Redirect → login |
| `/orders` | 307 | Redirect → login |
| `/login` | 200 | Página de login |
| `/signup` | 200 | Página de cadastro |
| `/help-center` | 200 | Conteúdo público |

### Rotas de API Descobertas em Page Chunks

Via análise de strings em chunks de páginas:

```
/webhooks/          → Rota de webhooks
/webhooks/test      → Teste de webhook
/users              → Lista de usuários
/member             → Membro individual
/members/           → Lista de membros
/offerings          → Ofertas
/offerings/         → Oferta individual
/orders             → Pedidos
/subscriptions      → Assinaturas
/profile            → Perfil
/dashboard          → Dashboard
/clips/marketplace  → Marketplace
/clips/championships → Campeonatos
/clips/ranking      → Ranking
```

---

## 3. Content Discovery

### mcl.vumpe.com + up-mcl.vumpe.com
- **Wordlist:** SecLists common.txt (4752 entradas)
- **Resultado:** Todos os paths retornam 403 (Next.js 404 page)
- **Conclusão:** Sites puramente estáticos, sem conteúdo oculto

### S3 Bucket: social-tracker-bucket-production

| Operação | Resultado |
|----------|-----------|
| `ListObjectsV2` | AccessDenied |
| `GetBucketAcl` | AccessDenied |
| `GetBucketPolicy` | AccessDenied |
| `GET /index.html` | 403 |
| `GET /public/` | 403 |
| `GET /.env` | 403 |
| `GET /credentials.json` | 403 |
| `GET /backup.sql` | 403 |
| `GET /thumbnails/` | 403 |
| `GET /admin/` | 403 |

> **Conclusão:** Bucket existe mas está 100% bloqueado. Pode conter dados se alguma Config errada for encontrada (presigned URLs, ACL específicas).

---

## 4. Rotas Especiais

### Manager Login Impersonation
```
/manager-login/[impersonatedBy]/[uuid]/[code]
```
- Rota de impersonação de usuário via manager
- UUID + code como parâmetros
- **Potencial IDOR** se uuid/code forem enumeráveis ou guessable

### TikTok Verification
```
/tiktok-verification-vumpe               → 200
/tiktokxwgqmeTyIkpnFQUJ23ofA5ic52PwTArG.txt → 200 (arquivo de verificação)
```
- Verificação legítima do TikTok
- Confirma integração com TikTok API

### Auth Callbacks
```
/auth/[platformId]/callback
/auth/advertiser/login
```
- OAuth callback (TikTok/Instagram)
- Login de anunciante

---

## 5. Subdomínios e Ambientes de Staging

### mcl4.ruyter.com — STAGING/CLONE
```
CNAME: 013c700d3940c7a9.vercel-dns-016.com → Vercel (216.150.1.193, 216.150.16.193)
```
- Clone do MCL (Método Clipador Lucrativo)
- Mesma infra Vercel
- Potencial para testar vulnerabilidades sem afetar produção

### app.hoory.com / uat.hoory.com
- Hoory — plataforma de customer support chat
- UAT disponível (uat.hoory.com)

---

## 6. Resumo de Achados para Webapp

### Prioridade ALTA
1. **PostHog ingestion exposto** — `/ingest/decide` sem auth, `enable_collect_everything: true`
2. **Manager impersonation** — `/manager-login/[impersonatedBy]/[uuid]/[code]` — IDOR potencial
3. **Cloudflare Turnstile** — CAPTCHA pode ser bypassado
4. **Staging environment** — `mcl4.ruyter.com` — testar vulnerabilidades sem impacto

### Prioridade MÉDIA
5. **Auth bypass** — Rotas autenticadas retornam SSG vazio (200) em vez de 401 — potencial mass assignment
6. **Webhook routes** — `/webhooks/`, `/webhooks/test` — SSRF potencial
7. **S3 bucket** — monitorar mudanças de permissão
8. **Sentry** — tracing ativo, possibilidade de info leak via erros

### Prioridade BAIXA
9. **TikTok/Instagram OAuth** — CSRF no callback
10. **CORS misconfig** — mcl/up-mcl com wildcard CORS

---

## Artefatos Gerados

| Arquivo | Descrição |
|---------|-----------|
| `js_chunks/` | 107 chunks JS baixados (5.1 MB) |
| `js_endpoints.txt` | Endpoints de API extraídos do JS |
| `js_keys.txt` | Chaves/tokens/senhas (vazio — nenhum encontrado) |
| `api_discovery_clipador.json` | Fuzz API em `/` (all 403) |
| `api_discovery_clipador2.json` | Fuzz API em `/api/` (all 403) |
| `api_discovery_v1.json` | Fuzz API em `/v1/` (all 403) |
| `content_discovery_mcl.json` | Content discovery mcl.vumpe.com |
| `content_discovery_upmcl.json` | Content discovery up-mcl.vumpe.com |
| `bucket_s3.txt` | Resultados S3 bucket |
| `ENUM.md` | Este relatório |

---

**Próximo passo:** webapp — testar auth bypass, IDOR, mass assignment, PostHog exploitation.