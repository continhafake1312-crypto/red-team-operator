# Attack Surface Summary — iptvguard.app

**Engagement**: iptvguard.app  
**Fase**: 4 — Consolidação Attack Surface (pós Recon Passivo)  
**Data**: 2026-08-22T19:00:00Z  
**Base**: `recon/passive/PASSIVE.md` + OSINT artifacts

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Domínio base** | iptvguard.app |
| **Subdomínios totais** | 5 |
| **Hosts vivos (HTTPS)** | 4 |
| **IPs de origem real** | 4 (2 Vercel, 1 Railway, 1 IONOS DNS) |
| **Provedores** | Vercel (Next.js, React/Vite), Railway (hikari/Fastify), IONOS (DNS/Email) |
| **Takeover candidates** | 3 (MEDIUM/MEDIUM-HIGH) |
| **Painel admin exposto** | 1 (hq.iptvguard.app — BackOffice) |
| **API Gateway** | 1 (gw.iptvguard.app — Railway) |
| **Cloud buckets** | 0 |
| **Wayback data** | 0 |

---

## Ranking de Payoff (§16) — Ordem de Ataque

| Rank | Alvo | Severidade Potencial | Vetores Prioritários | Status |
|------|------|---------------------|---------------------|--------|
| **1** | **gw.iptvguard.app** | **CRÍTICO** | CNAME takeover (Railway) → interceptação credenciais M3U/Xtream/MAC; IDOR/BOLA em `/api/playlists`; auth bypass; SSRF via playlist URL | 🔴 Recon Ativo |
| **2** | **hq.iptvguard.app** | **CRÍTICO** | CNAME takeover (Vercel) → acesso BackOffice; JWT alg confusion; refresh race; role escalation; cred stuffing | 🔴 Recon Ativo |
| **3** | **iptvguard.app/en/checker** | **ALTO** | SSRF (playlist URL), XXE (M3U/Xtream parse), IDOR (resultados), auth bypass, rate limit abuse, injection | 🟡 Enumeração |
| **4** | **api.iptvguard.app** | **MÉDIO** | GraphQL introspection, Supabase/PostgreSQL exposure, TMDB API key leak, mobile endpoints | 🟡 Enumeração |
| **5** | **www.iptvguard.app** | **MÉDIO** | CNAME takeover (Vercel) → phishing, credential harvesting | 🟢 Recon Ativo |
| **6** | **Origem IPs (4)** | **BAIXO** | Portscan para serviços não-web (SSH, DB, Redis, etc.); vhosts adicionais | 🟢 Recon Ativo |

---

## Detalhamento por Host

### 1. gw.iptvguard.app (API Gateway) — **PRIORIDADE MÁXIMA**
- **Plataforma**: Railway (hikari proxy)
- **CNAME**: `o7po9yq1.up.railway.app` → **TOMEOVER MEDIUM-HIGH**
- **IP origem**: 69.46.46.40
- **Endpoints conhecidos**:
  - `GET /api/health` → 200 OK (`{"status":"ok","timestamp":"...","commit":"0185f71b..."}`)
  - `GET /api/playlists` → 401 AUTH_REQUIRED
  - `/api/auth/*`, `/api/checker/*`, `/api/admin/*` → 404 (não descobertos ainda)
- **Headers de segurança**: CSP strict, HSTS preload, COOP, CORP
- **Payoff**: Handle credenciais sensíveis (URLs M3U, user:pass Xtream, MAC addresses). Takeover = MITM total, cred harvesting, response injection.

### 2. hq.iptvguard.app (BackOffice) — **PRIORIDADE MÁXIMA**
- **Plataforma**: Vercel (React 18 + Vite)
- **CNAME**: `314bc769074d3f73.vercel-dns-017.com` → **TOMEOVER MEDIUM**
- **IP origem**: 64.29.17.65
- **Tech**: Axios 1.13.2, Zustand, Goober, JWT Bearer + auto-refresh
- **API Base**: `https://gw.iptvguard.app/api`
- **Endpoints chamados**: `/api/health`, `/api/playlists` (401), `/api/auth/*`
- **Payoff**: Painel admin exposto publicamente. Takeover = acesso a ferramentas internas, dados de usuários, analytics, playlists monitoradas.

### 3. iptvguard.app (Main + Checker) — **ALTA PRIORIDADE**
- **Plataforma**: Vercel (Next.js 14 App Router)
- **IP origem**: 216.198.79.1
- **Features**: M3U, Xtream Codes, MAC Portal (Stalker), TMDB auto-match, i18n (6 langs)
- **Checker route**: `/en/checker` (e `/pt/checker`, `/fr/checker`, etc.)
- **Payoff**: Funcionalidade core do negócio. Parsers de M3U/Xtream/MAC = vetores SSRF, XXE, injection. IDOR em resultados de check. Auth bypass potencial.

### 4. api.iptvguard.app — **MÉDIA PRIORIDADE**
- **Parte do main app** (Next.js API routes ou subdomain separado Vercel)
- **Possíveis endpoints**: GraphQL, Supabase, TMDB, auth mobile
- **Payoff**: Integração mobile (iOS/Android), Supabase/PostgreSQL, chaves TMDB.

### 5. www.iptvguard.app — **MÉDIA PRIORIDADE**
- **Plataforma**: Vercel (redirect only)
- **CNAME**: `13da536e8c63027a.vercel-dns-017.com` → **TOMEOVER MEDIUM**
- **IP origem**: 64.29.17.1
- **Payoff**: Phishing vector via takeover (www subdomain trusted).

### 6. IPs de Origem — **BAIXA PRIORIDADE**
| IP | Provedor | Hosts |
|----|----------|-------|
| 216.198.79.1 | Vercel | iptvguard.app |
| 64.29.17.1 | Vercel | www.iptvguard.app |
| 64.29.17.65 | Vercel | hq.iptvguard.app |
| 69.46.46.40 | Railway | gw.iptvguard.app |

---

## Vetores de Ataque Mapeados (Matriz §19)

| Vetor | Alvo | Status | Próxima Ação |
|-------|------|--------|--------------|
| **CNAME Takeover** | gw/hq/www | Recon passivo identificado | Recon ativo: verificar se CNAME targets retornam 404 genérico do provedor |
| **JWT Auth Bypass** | hq (BackOffice) | Endpoint auth conhecido | Enum: descobrir `/api/auth/login`; testar alg:none, RS256→HS256, kid injection |
| **IDOR/BOLA** | gw `/api/playlists` | Endpoint protegido (401) | Obter auth válido ou bypass; testar object ID manipulation |
| **SSRF via Playlist** | iptvguard.app/checker | Funcionalidade conhecida | Enum: mapear parâmetros; testar URLs internas (169.254.169.254, localhost, metadata) |
| **XXE/Injection** | iptvguard.app/checker | Parsers M3U/Xtream/MAC | Enum: analisar JS do checker; testar payloads XXE, SQLi, command injection |
| **Rate Limit Abuse** | checker + API | Desconhecido | Testar limites em `/api/health`, checker submissions, auth endpoints |
| **Cred Stuffing** | hq login | 0 breach creds; emails padrão | Testar `contact@`, `admin@`, `mouhamadou@` + senhas comuns |
| **Mobile App Analysis** | iOS/Android/TV | Fora escopo inicial | Se web falhar: baixar APK/IPA, analisar endpoints hardcoded, keys |
| **Supply Chain** | Vercel/Railway/TMDB | Dependências conhecidas | CVE research em versões (Next.js 14, hikari, Railway agent) |
| **Discord Social Eng** | Equipe | Ativo (197 members) | Mapear team, assessar phishing, engenharia social |

---

## Gaps para Preencher no Recon Ativo (Fase 3)

1. **Portscan completo** nos 4 IPs origem (TCP/UDP top 1000 + full 65535)
2. **WAF detection** (wafw00f) — Vercel edge WAF + Railway hikari
3. **VHost enumeration** nos IPs origem — services não-web expostos
4. **TLS analysis** — cipher suites, cert transparency, pinning
5. **DNS zone walk** — subdomínios internos, staging, dev
6. **Content discovery** em todos hosts — diretórios, arquivos, backups
7. **JS analysis** no checker e BackOffice — endpoints ocultos, secrets, rotas admin
8. **API schema discovery** — OpenAPI/Swagger, GraphQL introspecção

---

## Próximos Passos Imediatos

1. **Delegar Fase 3 (Recon Ativo)** ao `recon-active` — exaustivo nos 4 IPs + hosts
2. **Delegar Fase 5 (Enumeração)** ao `enum` — após recon ativo, foco em checker/BackOffice/API
3. **Testar takeover** ativamente nos 3 CNAMEs
4. **Auth testing** no BackOffice assim que enumeração achar login endpoint

---

## Referências
- `recon/passive/PASSIVE.md` — Recon passivo completo
- `recon/passive/osint_*.txt` — OSINT artifacts
- `PLAN.md` — Backlog de vetores e fases
- `REPORT.md` — Findings consolidados
- `timeline.log` — Cronologia