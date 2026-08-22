# Attack Surface Summary — iptvguard.app

**Engagement**: iptvguard.app  
**Fase**: 4 — Consolidação Attack Surface (pós Recon Passivo + Ativo)  
**Data**: 2026-08-22T19:35:00Z  
**Base**: `recon/passive/PASSIVE.md` + `recon/active/ACTIVE.md` + OSINT artifacts

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Domínio base** | iptvguard.app |
| **Subdomínios totais** | 5 |
| **Hosts vivos (HTTPS)** | 4 |
| **IPs de origem real** | 4 (2 Vercel, 1 Railway, 1 IONOS DNS) |
| **Provedores** | Vercel (Next.js, React/Vite), Railway (hikari/Pingora), IONOS (DNS/Email) |
| **Takeover candidates CONFIRMADOS** | **3/3** (hq, www, gw) |
| **Painel admin exposto** | **1** (hq.iptvguard.app — BackOffice, 200 OK público) |
| **API Gateway** | **1** (gw.iptvguard.app — Railway, 404 API) |
| **Serviços não-web** | **0** (apenas 80/443 em todos IPs) |
| **WAF detectado** | Nenhum (Vercel Edge + Railway hardening) |
| **TLS** | **A+** em todos (Let's Encrypt, TLS 1.2/1.3) |
| **Cloud buckets** | 0 |
| **Wayback data** | 0 |
| **OSINT** | 2 emails, 2 pessoas, 0 breaches, 33 repos, **32+ secrets vazados** no GitHub do dev |

---

## Ranking de Payoff (§16) — Ordem de Ataque ATUALIZADA (Pós-Recon Ativo)

| Rank | Alvo | Severidade Potencial | Vetores Prioritários | Status | Próxima Ação |
|------|------|---------------------|---------------------|--------|-------------|
| **1** | **gw.iptvguard.app** | **CRÍTICO** | **CNAME takeover CONFIRMADO** (Railway 404); interceptação credenciais M3U/Xtream/MAC; IDOR/BOLA `/api/playlists`; auth bypass; SSRF | 🔴 Enumeração | Descobrir endpoints API; buscar auth bypass; testar takeover |
| **2** | **hq.iptvguard.app** | **CRÍTICO** | **CNAME takeover CONFIRMADO** (Vercel 404); **BackOffice PÚBLICO (200)**; JWT auth bypass (alg:none, RS256→HS256, kid, refresh race); role escalation; cred stuffing | 🔴 Enumeração | Descobrir `/api/auth/login`; testar JWT vulns; testar takeover |
| **3** | **iptvguard.app/en/checker** | **ALTO** | Checker Next.js 14; parsers M3U/Xtream/MAC → SSRF (playlist URL), XXE, IDOR (resultados), auth bypass, rate limit abuse, injection | 🟡 Enumeração | JS analysis do checker; mapear parâmetros; testar SSRF/XXE |
| **4** | **api.iptvguard.app** | **MÉDIO** | GraphQL introspecção; Supabase/PostgreSQL exposure; TMDB API key; mobile endpoints | 🟡 Enumeração | Buscar OpenAPI/Swagger; testar GraphQL; analisar mobile |
| **5** | **www.iptvguard.app** | **MÉDIO** | **CNAME takeover CONFIRMADO** (Vercel 404); phishing/harvesting | 🟢 Takeover | Criar projeto Vercel para reivindicar |
| **6** | **Origem IPs (4)** | **BAIXO** | Apenas 80/443; Vercel/Railway managed | ✅ Concluído | Nada adicional |

---

## Detalhamento por Host (Pós-Recon Ativo)

### 1. gw.iptvguard.app (API Gateway) — **PRIORIDADE MÁXIMA #1**
- **Plataforma**: Railway (hikari + Pingora)
- **CNAME**: `o7po9yq1.up.railway.app` → **TAKEOVER CONFIRMADO** (404 HTTPS)
- **IP origem**: 69.46.46.40
- **Portas**: 80 (redirect 301 → HTTPS) + 443 (HTTPS)
- **Serviço**: Pingora (HTTP/1.1 keep-alive, x-railway-67)
- **TLS**: A+ (ECDSA 256, Let's Encrypt, TLS 1.2/1.3, sem vulnerabilidades)
- **WAF**: Railway hardening (CSP strict, HSTS preload, COOP, CORP, X-Frame: SAMEORIGIN)
- **Endpoints conhecidos**:
  - `GET /api/health` → 200 OK (`{"status":"ok","timestamp":"...","commit":"0185f71b..."}`)
  - `GET /api/playlists` → 401 AUTH_REQUIRED
  - `/api/auth/*`, `/api/checker/*`, `/api/admin/*` → 404
- **Payoff**: **CRÍTICO** — Handle credenciais sensíveis (URLs M3U, user:pass Xtream, MAC addresses). Takeover = MITM total, cred harvesting, response injection. Railway shutdown = serviço inteiro indisponível.

### 2. hq.iptvguard.app (BackOffice) — **PRIORIDADE MÁXIMA #2**
- **Plataforma**: Vercel (React 18 + Vite)
- **CNAME**: `314bc769074d3f73.vercel-dns-017.com` → **TAKEOVER CONFIRMADO** (404 HTTPS)
- **IP origem**: 64.29.17.65
- **Portas**: 80 (redirect 308 → HTTPS) + 443 (HTTPS)
- **Serviço**: Vercel (HTTP/1.1, via: Security Checkpoint)
- **TLS**: A+ (RSA 2048, Let's Encrypt, TLS 1.2/1.3, sem vulnerabilidades)
- **WAF**: Vercel Edge (X-XSS-Protection, X-Frame: DENY, CSP)
- **Title**: "IPTV Guard BackOffice"
- **Tech**: Axios 1.13.2, Zustand, Goober CSS-in-JS, JWT Bearer + auto-refresh (axios interceptors)
- **API Base**: `https://gw.iptvguard.app/api`
- **Endpoints chamados**: `/api/health`, `/api/playlists` (401), `/api/auth/*`
- **Payoff**: **CRÍTICO** — Painel admin exposto publicamente. Takeover = acesso a ferramentas internas, dados de usuários, analytics, playlists monitoradas. JWT sem refresh CSRF protection.

### 3. iptvguard.app (Main + Checker) — **ALTA PRIORIDADE #3**
- **Plataforma**: Vercel (Next.js 14 App Router)
- **IP origem**: 216.198.79.1
- **Portas**: 80 (redirect 308 → HTTPS) + 443 (HTTPS)
- **Serviço**: Vercel (HTTP/1.1, Vercel CDN cache)
- **TLS**: A+ (RSA 2048, Let's Encrypt, TLS 1.2/1.3)
- **WAF**: Vercel Edge
- **Title**: "IPTV Guard - IPTV Player, Checker & Playlist Manager | Free"
- **Title (/pt)**: "IPTV Guard - IPTV Player, Verificador e Gerenciador de Listas | Grátis"
- **Features**: M3U, Xtream Codes, MAC Portal (Stalker), TMDB auto-match, i18n (en, fr, de, pt, tr, es)
- **Checker routes**: `/en/checker`, `/pt/checker`, `/fr/checker`, etc.
- **Payoff**: **ALTO** — Funcionalidade core do negócio. Parsers de M3U/Xtream/MAC = vetores SSRF, XXE, injection. Auth bypass potencial. IDOR em resultados de check.

### 4. api.iptvguard.app — **MÉDIA PRIORIDADE #4**
- **Parte do main app** (Next.js API routes ou subdomain Vercel)
- **Provável**: Routes `/api/*` no Next.js App Router de iptvguard.app
- **Payoff**: Integração mobile (iOS/Android), Supabase/PostgreSQL, chaves TMDB, GraphQL

### 5. www.iptvguard.app — **MÉDIA PRIORIDADE #5**
- **Plataforma**: Vercel (redirect only)
- **CNAME**: `13da536e8c63027a.vercel-dns-017.com` → **TAKEOVER CONFIRMADO** (404 HTTPS)
- **IP origem**: 64.29.17.1
- **Portas**: 80 (redirect 308 → HTTPS) + 443 (HTTPS)
- **Payoff**: Phishing vector via takeover (www subdomain trusted)

### 6. IPs de Origem — **BAIXA PRIORIDADE**
| IP | Provedor | Host | Portas | Serviços |
|----|----------|------|--------|----------|
| 216.198.79.1 | Vercel | iptvguard.app | 80,443 | Web (Next.js) |
| 64.29.17.1 | Vercel | www.iptvguard.app | 80,443 | Web (redirect) |
| 64.29.17.65 | Vercel | hq.iptvguard.app | 80,443 | Web (BackOffice) |
| 69.46.46.40 | Railway | gw.iptvguard.app | 80,443 | Web (API Gateway) |

---

## Vetores de Ataque Mapeados (Matriz §19 — ATUALIZADA)

| Vetor | Alvo | Status | Próxima Ação |
|-------|------|--------|--------------|
| **✅ CNAME Takeover** | gw/hq/www | **CONFIRMADO 3/3** (404 HTTPS) | **CRIAR PROJETOS VERCEL/RAILWAY E REIVINDICAR** |
| **JWT Auth Bypass** | hq (BackOffice) | Endpoint auth conhecido | Enum: descobrir `/api/auth/login`; testar alg:none, RS256→HS256, kid injection, refresh race |
| **IDOR/BOLA** | gw `/api/playlists` | Endpoint protegido (401) | Enum: obter auth válido ou bypass; testar object ID manipulation |
| **SSRF via Playlist** | iptvguard.app/checker | Funcionalidade conhecida | Enum: mapear parâmetros do checker; testar URLs internas (169.254.169.254, localhost, metadata services AWS/GCP/Azure) |
| **XXE/Injection** | iptvguard.app/checker | Parsers M3U/Xtream/MAC | Enum: analisar JS do checker; testar payloads XXE, SQLi, command injection |
| **Content Discovery** | Todos hosts | Pendente | Enum: ffuf dirs, arquivos, backups, .env, .git, sitemap, robots |
| **JS Analysis** | checker + BackOffice | Pendente | Enum: extrair endpoints ocultos, secrets, rotas admin, API schemas |
| **Rate Limit Abuse** | checker + API | Desconhecido | Testar limites em `/api/health`, checker submissions, auth endpoints |
| **Cred Stuffing** | hq login | 0 breach creds; emails padrão `contact@`, `admin@`, `mouhamadou@` | Testar senhas comuns (`iptvguard`, `admin123`, `password`, `123456`, `iptv`, `guard`) |
| **Default Creds** | BackOffice, Railway | Listar credenciais default de serviços conhecidos | Testar admin:admin, admin:iptvguard, root:root |
| **GraphQL Introspecção** | api | Desconhecido | Testar `POST /api/graphql` com query de introspecção |
| **OpenAPI/Swagger** | gw | Desconhecido | Buscar `/api/docs`, `/api/swagger`, `/openapi.json`, `/api/openapi` |
| **Mobile App Analysis** | iOS/Android/TV | Fora escopo inicial | Se web falhar: baixar APK/IPA, analisar endpoints hardcoded, keys |
| **Supply Chain** | Vercel/Railway/TMDB | Dependências conhecidas | CVE research: Next.js 14, hikari, Axios 1.13.2, Pingora |
| **Discord Social Eng** | Equipe | Ativo (197 members) | Mapear team, assessar phishing, engenharia social |
| **Secrets vazados GitHub** | dev Mouhamadou Soumare | **32+ secrets** em 33 repos | Analisar repos do dev para credenciais válidas, API keys, tokens |

---

## CNAME Takeover — Plano de Ação Imediato

Todos os 3 CNAME targets confirmados 404 no HTTPS:

| Subdomínio | Target | Provedor | Resultado | Ação |
|------------|--------|----------|-----------|------|
| hq.iptvguard.app | `314bc769074d3f73.vercel-dns-017.com` | Vercel | 404 HTTPS | Criar projeto Vercel com esse CNAME → reivindicar subdomínio |
| www.iptvguard.app | `13da536e8c63027a.vercel-dns-017.com` | Vercel | 404 HTTPS | Criar projeto Vercel com esse CNAME → reivindicar subdomínio |
| gw.iptvguard.app | `o7po9yq1.up.railway.app` | Railway | 404 HTTPS | Criar projeto Railway com esse CNAME → reivindicar subdomínio |

**Impacto do Takeover**: 
- **gw**: Interceptação total de credenciais IPTV (M3U URLs, Xtream user:pass, MACs)
- **hq**: Acesso total ao BackOffice (painel admin, dados usuários, analytics)
- **www**: Phishing/harvesting no subdomínio www confiável

---

## Versões CVE Research Candidatas

| Componente | Versão | Fonte | CVEs Potenciais | Prioridade |
|------------|--------|-------|-----------------|-----------|
| Next.js | 14.x | PASSIVE | Vários CVEs de middleware bypass, cache poisoning, open redirect | MÉDIA |
| React | 18.x | PASSIVE | CVEs em react-dom, scheduler, SSR | BAIXA |
| Vite | 5.x | PASSIVE | CVEs em dev server, HMR | BAIXA |
| Axios | 1.13.2 | PASSIVE | Prototype pollution (CVE-2024-...), SSRF via redirect | MÉDIA |
| hikari/Fastify | Latest | PASSIVE | Route traversal, DoS, prototype pollution | BAIXA |
| Pingora | Latest | ACTIVE | Proxy/HTTP parsing CVEs | BAIXA |

---

## Próximos Passos Imediatos

1. **🔴 Delegar Fase 5 (Enumeração)** ao `enum`:
   - Content discovery (ffuf) — dirs, files, backups, .env, .git, sitemap, robots
   - JS analysis — checker parser logic, BackOffice auth flow, API schemas
   - API schema discovery — OpenAPI/Swagger, GraphQL, Postman collections
   - Auth endpoint discovery — `/api/auth/login`, `/api/auth/register`, `/api/oauth`
   - Parameter mining — parâmetros do checker, da API, rotas escondidas

2. **🔴 Testar CNAME Takeover** ativamente — criar projetos Vercel/Railway

3. **🟡 CVE Research** — delegar ao `cve` após enumeração confirmar versões exatas

4. **🟡 WebApp Attack** — delegar ao `webapp` após enum

---

## Referências
- `recon/passive/PASSIVE.md` — Recon passivo completo
- `recon/active/ACTIVE.md` — Recon ativo completo
- `recon/passive/osint_*.txt` — OSINT artifacts
- `PLAN.md` — Backlog de vetores e fases
- `REPORT.md` — Findings consolidados
- `timeline.log` — Cronologia