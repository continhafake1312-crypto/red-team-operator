# PIVOT_KEOTO.md — Expansão de Escopo Keoto

> **Gerado em:** 2026-08-26T02:27 UTC
> **Alvos:** keoto.com, seller-api.keoto.com
> **Contexto:** Backend da Vumpe (seller-api.keoto.com) → Domínio keoto.com

---

## 1. Informações do Domínio keoto.com

| Campo | Valor |
|-------|-------|
| **Domínio** | keoto.com |
| **Registro Criação** | 2015-07-21 |
| **Expiração** | 2027-07-21 |
| **Registrar** | GoDaddy |
| **Nameservers** | `achiel.ns.cloudflare.com`, `katja.ns.cloudflare.com` |
| **A Record** | 216.150.1.1 (Vercel proxy) |
| **MX** | `smtp.google.com` (Google Workspace) |
| **SPF** | `v=spf1 include:_spf.google.com -all` |
| **DNSSEC** | unsigned |
| **Status** | ok |

### TXT Records (verificações de domínio)
- `google-site-verification` (3 registros)
- `atlassian-domain-verification` (Jira/Confluence)
- `anthropic-domain-verification` (Claude)
- `slack-domain-verification`
- `figma-domain-verification`
- `facebook-domain-verification`

**→ Uso corporativo intenso: Google, Atlassian, Anthropic, Slack, Figma, Facebook**

---

## 2. Subdomínios Descobertos

| Subdomínio | IPs | Infra | Status | Conteúdo |
|------------|-----|-------|--------|----------|
| **keoto.com** | 216.150.1.1 | Vercel | 307 → www | Root redirect |
| **www.keoto.com** | 216.150.x.x | Vercel | 200 | Site principal "Seja Pago Para Postar Vídeos na Internet" |
| **seller-api.keoto.com** | 104.26.x.x, 172.67.x.x | **Cloudflare** | 200 | "Keoto API" (9 bytes) |
| **campaigns.keoto.com** | 104.26.x.x, 172.67.x.x | **Cloudflare** | 200 | Next.js — Keoto Clips Marketplace (`/campaigns/marketplace`) |
| **dashboard.keoto.com** | 104.26.x.x, 172.67.x.x | **Cloudflare** | 307 → /login | Painel Keoto Clips (Next.js) |
| **marcas.keoto.com** | 216.150.x.x | **Vercel** | 307 → /login | **Portal de Marcas** (Next.js App Router) |
| **hometeste.keoto.com** | 216.150.x.x | **Vercel** | 200 | **AMBIENTE DE TESTE/STAGING** (Next.js Turbopack) |
| **checkout.keoto.com** | 216.150.x.x | Vercel | 404 | Checkout (desabilitado?) |
| **support.keoto.com** | 216.150.x.x | Vercel | 200 | Central de Ajuda Keoto |
| **fila.keoto.com** | 18.229.x.x | **queue-it.net** | 404 | Fila virtual (Queue-It) — protege contra picos |
| **hometeste.keoto.com** | 216.150.x.x | Vercel | 200 | Help Center / Central de Ajuda (Next.js Turbopack) |
| **ruyter.keoto.com** | — | — | 000 | Não resolve |

### Domínios relacionados descobertos
- `keotomarcas.com` — OG tag no portal de marcas (não resolve por DNS atualmente)
- `keoto-home.vercel.app` — OG image URL (deploy Vercel da home)
- `keoto.com.br` — email `suporte@keoto.com.br` no rodapé da Central de Ajuda

---

## 3. Tech Stack

### keoto.com / www.keoto.com
- **Infra:** Vercel
- **Framework:** Next.js
- **Servidor:** Vercel
- **Título:** "Seja Pago Para Postar Vídeos na Internet"
- **Headers:** `x-vercel-id`, `x-matched-path`, `x-nextjs-prerender`, `x-nextjs-stale-time`, `access-control-allow-origin`
- **SSL:** Let's Encrypt (Google Trust Services for *.keoto.com wildcard)

### campaigns.keoto.com / dashboard.keoto.com
- **Infra:** Cloudflare
- **Framework:** Next.js
- **Embeds:** TikTok, Instagram
- **CSS-in-JS:** Stitches (style engine)

### marcas.keoto.com
- **Infra:** Vercel (IP real: 216.150.16.1)
- **Framework:** Next.js App Router
- **SSL:** Let's Encrypt (RSA 2048)
- **Meta:** "Keoto Marcas — Plataforma de gestão de clips para marcas"
- **Robots:** `noindex, nofollow`

### hometeste.keoto.com (AMBIENTE DE TESTE)
- **Infra:** Vercel
- **Framework:** Next.js **com Turbopack** (sinal de dev/staging)
- **Conteúdo:** "KEOTO - Plataforma de Clipadores e Campanhas" / "Central de Ajuda"
- **Robots:** `noindex`
- **SSL:** Let's Encrypt

### seller-api.keoto.com
- **Infra:** Cloudflare (104.26.0.151, 104.26.1.151, 172.67.69.61)
- **Resposta:** `Keoto API` (text/html, 9 bytes)
- **Servidor:** cloudflare
- **CSP:** Strict (`default-src 'self'`)
- **HSTS:** `max-age=15552000; includeSubDomains`
- **SSL:** Wildcard `*.keoto.com` (Google Trust Services, EC P256)
- **Headers de segurança:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Cross-Origin-Opener-Policy: same-origin`

---

## 4. API Endpoints — seller-api.keoto.com

| Endpoint | Status | Resposta |
|----------|--------|----------|
| `/` | **200** | `Keoto API` |
| `/health` | 404 | — |
| `/status` | 404 | — |
| `/swagger` | 404 | — |
| `/docs` | 404 | — |
| `/openapi.json` | 404 | — |
| `/api` | 404 | — |
| `/v1` | 404 | — |
| `/v1/auth` | 404 | — |
| `/v1/login` | 404 | — |
| `/v1/users` | 404 | — |
| `/graphql` | 404 | — |
| `/admin` | 404 | — |
| `/users` | 404 | — |
| `/api/v1` | 404 | — |
| `/api-docs` | 404 | — |

**→ API responde apenas em `/` com string fixa. Provavelmente roteada por domínio (`seller-api.keoto.com` aponta para ela) e endpoints reais são roteados via path/header.**

---

## 5. Infraestrutura de Rede

### seller-api.keoto.com (Cloudflare)
```
104.26.0.151
104.26.1.151
172.67.69.61
```
Todos Cloudflare — IP real atrás do proxy.

### keoto.com / Vercel
```
216.150.1.1
216.150.16.1
216.150.1.129
216.150.16.129
216.150.1.193
216.150.16.193
216.150.1.65
216.150.16.65
```
Todos Vercel — IP real não exposto diretamente.

### fila.keoto.com (Queue-It)
```
18.229.185.88
18.231.77.38
```
AWS ECB (us-east-1) — Queue-It virtual waiting room.

---

## 6. Mecanismos de Autenticação

### marcas.keoto.com/login
- **Tipo:** Código de 6 dígitos (OTP via email/telefone)
- **Interface:** 6 campos numéricos, botão "Entrar"
- **Link:** "Receber código novamente" (rate-limited)
- **Tecnologia:** Next.js App Router

### dashboard.keoto.com/login
- **Tipo:** Mesma interface Keoto Clips (Next.js)
- **SSP (Server-Side Props):** Coleta IP, localização, device fingerprint (Sentry)
- **Sentry:** `sentry-environment=vercel-production`, `sentry-public_key=a984315c66b694d26d3903b0083b10e1`

---

## 7. Ranking de Payoff (Prioridades)

| Prioridade | Alvo | Vetor | Payoff |
|------------|------|-------|--------|
| 🔴 **CRÍTICA** | **hometeste.keoto.com** | **Ambiente de teste com Turbopack** — staging tends to be less locked down, may have debug endpoints, env exposure, test creds | Acesso admin / creds |
| 🔴 **CRÍTICA** | **seller-api.keoto.com** | **Backend API** — provavelmente conecta ao DB, bucket S3, etc. | Acesso a dados |
| 🔴 **CRÍTICA** | **marcas.keoto.com** | **Portal de marcas (gestão de pagamentos)** — OTP 6-dígitos pode ser brute-forceable, bypass, intercept | Acesso a campanhas/pagamentos |
| 🟠 **ALTA** | **dashboard.keoto.com** | **Painel de creators** — gerenciamento de clips, dados financeiros | Acesso creator |
| 🟠 **ALTA** | **campaigns.keoto.com** | **Marketplace de campanhas** — interação entre marcas e clipadores | Dados de campanhas |
| 🟡 **MÉDIA** | **support.keoto.com** | **Central de Ajuda** — pode conter docs internos, guias de API | Info disclosure |
| 🟡 **MÉDIA** | **queue-it.net** | **fila.keoto.com** — Queue-It pode ter bypass | Bypass de rate limit |

---

## 8. Recomendações de Exploração Imediata

### 1. 🎯 hometeste.keoto.com (TEST ENV)
- [ ] Explorar content discovery no staging (paths comuns de debug)
- [ ] Verificar `.env`, `.env.local`, `_next/static/` por vazamentos
- [ ] Procurar endpoints de API diferentes do production
- [ ] Testar creds padrão / admin de teste

### 2. 🎯 seller-api.keoto.com
- [ ] Fuzz de headers/origins para bypass de CSP/routing
- [ ] Testar API com diferentes Content-Types (JSON, XML)
- [ ] Testar endpoints comuns de REST: `/api/` + `X-API-Key` header
- [ ] Verificar se aceita diferentes métodos HTTP (PUT, PATCH, DELETE)
- [ ] Testar bypass Cloudflare via IP real (Shodan/Censys)

### 3. 🎯 marcas.keoto.com (Login OTP)
- [ ] Analisar JS do login (chunks App Router: `app/(feed)/login/page-*.js`)
- [ ] Testar rate limit do OTP (tentar brute-force 6 dígitos?)
- [ ] Verificar vazamento de resposta no código (diferença entre código válido/inválido)
- [ ] Testar CSRF no endpoint de login

### 4. 🎯 dashboard.keoto.com
- [ ] Analisar Next.js chunks JS por endpoints internos
- [ ] Verificar `_buildManifest.js` por rotas internas escondidas
- [ ] Testar IDOR após login `/users/<id>`, `/campaigns/<id>`

### 5. Domínios relacionados
- [ ] Verificar `keoto.com.br` (email encontrado) — pode ser outro ataque
- [ ] Verificar `keotomarcas.com` (mencionado em OG tags)
- [ ] Google Workspace — testar enumeration de emails (suporte@, admin@, etc.)

---

## 9. Artefatos Salvos

- `recon/active/PIVOT_KEOTO.md` — este relatório
- `/tmp/subfinder_keoto.txt` — subdomínios (subfinder)
- `/tmp/assetfinder_keoto.txt` — subdomínios (assetfinder)
- `/tmp/all_subs_keoto.txt` — subdomínios consolidados

---

## Anexo: Fluxo do Aplicativo (mapeado)

```
Usuário → www.keoto.com (Vercel)
         → marcas.keoto.com/login (Vercel — Portal Marcas)
         → dashboard.keoto.com/login (Cloudflare — Painel Creator)
         → campaigns.keoto.com (Cloudflare — Marketplace)
              ↓
         seller-api.keoto.com (Cloudflare — Backend API)
              ↓
         [Database / S3 / Serviços internos]
         
Proteções:
  - Cloudflare (seller-api, campaigns, dashboard)
  - Queue-It (fila.keoto.com — anti-bot/pico)
  - Vercel (keoto.com, www, marcas, checkout, support, hometeste)
  - OTP 6 dígitos (marcas.keoto.com)
  - Sentry monitoring (dashboard)
  - CSP strict (seller-api)
  - HSTS
```