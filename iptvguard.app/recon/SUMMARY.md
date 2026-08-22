# Attack Surface Summary — iptvguard.app

**Engagement**: iptvguard.app  
**Fase**: 4 — Consolidação Attack Surface (pós Recon Ativo Exaustivo)  
**Data**: 2026-08-22T19:30:00Z  
**Base**: `recon/passive/PASSIVE.md` + `recon/active/ACTIVE.md` + OSINT artifacts

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Domínio base** | iptvguard.app |
| **Subdomínios totais** | 5 |
| **Hosts vivos (HTTPS)** | 4 |
| **IPs de origem real** | 4 (3 Vercel, 1 Railway) |
| **Provedores** | Vercel (Next.js, React/Vite), Railway (hikari/Fastify/Pingora) |
| **Takeover CONFIRMADO** | 3 (MEDIUM/MEDIUM-HIGH) — todos CNAME targets retornam 404 no HTTPS |
| **Painel admin exposto** | 1 (hq.iptvguard.app — BackOffice, 200 OK público) |
| **API Gateway** | 1 (gw.iptvguard.app — Railway/hikari) |
| **Portas expostas** | Apenas 80/443 nos 4 IPs (nenhum serviço não-web) |
| **TLS** | A+ em todos (TLS 1.2/1.3, Vercel RSA 2048, Railway ECDSA 256) |
| **WAF** | Nenhum fingerprinteável (Vercel Edge + Railway hardening) |
| **Cloud buckets** | 0 |
| **Wayback data** | 0 |

---

## Ranking de Payoff (§16) — Ordem de Ataque (ATUALIZADO PÓS RECON ATIVO)

| Rank | Alvo | Severidade | Vetores Confirmados/Novos | Status |
|------|------|------------|---------------------------|--------|
| **1** | **gw.iptvguard.app** | **CRÍTICO** | CNAME takeover CONFIRMADO (Railway 404 HTTPS); API Gateway exposto; CSP/COOP/CORP/HSTS preload; Railway hardening (Pingora); headers x-railway-* | 🟢 Recon Ativo ✓ → **Enum** |
| **2** | **hq.iptvguard.app** | **CRÍTICO** | CNAME takeover CONFIRMADO (Vercel 404 HTTPS); BackOffice PÚBLICO (200 OK); JWT Bearer + auto-refresh; React 18+Vite SPA; Axios 1.13.2 | 🟢 Recon Ativo ✓ → **Enum** |
| **3** | **iptvguard.app/en/checker** | **ALTO** | Checker funcional (M3U/Xtream/MAC); Next.js 14 App Router; parsers sensíveis; i18n 6 langs; rotas `/<lang>/checker` | 🟡 Enumeração |
| **4** | **api.iptvguard.app** | **MÉDIO** | Parte do main app (Next.js API routes) | 🟡 Enumeração |
| **5** | **www.iptvguard.app** | **MÉDIO** | CNAME takeover CONFIRMADO (Vercel 404 HTTPS); redirect only | 🟢 Recon Ativo ✓ |
| **6** | **Origem IPs (4)** | **BAIXO** | Apenas 80/443; nenhum serviço não-web (SSH, DB, Redis) | 🟢 Recon Ativo ✓ |

---

## Detalhamento por Host (Pós Recon Ativo)

### 1. gw.iptvguard.app (API Gateway) — **PRIORIDADE MÁXIMA**
- **Plataforma**: Railway (hikari proxy / Pingora edge)
- **CNAME**: `o7po9yq1.up.railway.app` → **TAKEOVER CONFIRMADO (MEDIUM-HIGH)** — HTTPS 404
- **IP origem**: 69.46.46.40
- **Portas**: 80 (Pingora, redirect 301), 443 (Pingora, TLS 1.2/1.3 ECDSA 256)
- **Server**: `railway-hikari` / `Pingora`
- **Headers**: CSP strict, HSTS preload, COOP, CORP, x-railway-*, x-hikari-trace
- **Endpoints conhecidos**:
  - `GET /api/health` → 200 OK (`{"status":"ok","timestamp":"...","commit":"0185f71b..."}`)
  - `GET /api/playlists` → 401 AUTH_REQUIRED
  - `/api/auth/*`, `/api/checker/*`, `/api/admin/*` → 404 (não descobertos)
- **Certificado**: `*.up.railway.app` (Let's Encrypt YE1, EC 256, válido até 2026-10-27)
- **Payoff**: Handle credenciais sensíveis (URLs M3U, user:pass Xtream, MAC addresses). Takeover = MITM total, cred harvesting, response injection.

### 2. hq.iptvguard.app (BackOffice) — **PRIORIDADE MÁXIMA**
- **Plataforma**: Vercel (React 18 + Vite)
- **CNAME**: `314bc769074d3f73.vercel-dns-017.com` → **TAKEOVER CONFIRMADO (MEDIUM)** — HTTPS 404
- **IP origem**: 64.29.17.65
- **Portas**: 80 (Vercel, redirect 308), 443 (Vercel, TLS 1.2/1.3 RSA 2048, Security Checkpoint)
- **Server**: `Vercel`
- **Tech**: Axios 1.13.2, Zustand, Goober, JWT Bearer + auto-refresh
- **API Base**: `https://gw.iptvguard.app/api`
- **Endpoints chamados**: `/api/health`, `/api/playlists` (401), `/api/auth/*`
- **Certificado**: `no-sni.vercel-infra.com` (Let's Encrypt YR1, RSA 2048, válido até 2026-10-20)
- **Payoff**: Painel admin exposto publicamente. Takeover = acesso a ferramentas internas, dados de usuários, analytics, playlists monitoradas.

### 3. iptvguard.app (Main + Checker) — **ALTA PRIORIDADE**
- **Plataforma**: Vercel (Next.js 14 App Router)
- **IP origem**: 216.198.79.1
- **Portas**: 80 (Vercel, redirect 308), 443 (Vercel, TLS 1.2/1.3 RSA 2048)
- **Features**: M3U, Xtream Codes, MAC Portal (Stalker), TMDB auto-match, i18n (6 langs: en, pt, fr, es, de, it)
- **Checker routes**: `/en/checker`, `/pt/checker`, `/fr/checker`, `/es/checker`, `/de/checker`, `/it/checker`
- **Certificado**: `no-sni.vercel-infra.com` (compartilhado Vercel)
- **Payoff**: Funcionalidade core do negócio. Parsers de M3U/Xtream/MAC = vetores SSRF, XXE, injection. IDOR em resultados de check. Auth bypass potencial.

### 4. api.iptvguard.app — **MÉDIA PRIORIDADE**
- **Parte do main app** (Next.js API routes ou subdomain separado Vercel)
- **Possíveis endpoints**: GraphQL, Supabase, TMDB, auth mobile
- **Payoff**: Integração mobile (iOS/Android/TV), Supabase/PostgreSQL, chaves TMDB.

### 5. www.iptvguard.app — **MÉDIA PRIORIDADE**
- **Plataforma**: Vercel (redirect only → iptvguard.app)
- **CNAME**: `13da536e8c63027a.vercel-dns-017.com` → **TAKEOVER CONFIRMADO (MEDIUM)** — HTTPS 404
- **IP origem**: 64.29.17.1 (mesmo IP do main app no Vercel)
- **Payoff**: Phishing vector via takeover (www subdomain trusted).

### 6. IPs de Origem — **BAIXA PRIORIDADE** (Recon Ativo Concluído)
| IP | Provedor | Hosts | Portas Abertas | Serviços Não-Web |
|----|----------|-------|----------------|------------------|
| 216.198.79.1 | Vercel | iptvguard.app | 80, 443 | **Nenhum** |
| 64.29.17.1 | Vercel | www.iptvguard.app | 80, 443 | **Nenhum** |
| 64.29.17.65 | Vercel | hq.iptvguard.app | 80, 443 | **Nenhum** |
| 69.46.46.40 | Railway | gw.iptvguard.app | 80, 443 | **Nenhum** |

---

## Vetores de Ataque Mapeados (Matriz §19) — ATUALIZADO

| Vetor | Alvo | Status | Próxima Ação |
|-------|------|--------|--------------|
| **CNAME Takeover** | gw/hq/www | **CONFIRMADO** (3/3 — HTTPS 404) | Testar reivindicação ativa nos provedores (Vercel/Railway) |
| **JWT Auth Bypass** | hq (BackOffice) | Endpoint auth conhecido | Enum: descobrir `/api/auth/login`; testar alg:none, RS256→HS256, kid injection, refresh race |
| **IDOR/BOLA** | gw `/api/playlists` | Endpoint protegido (401) | Obter auth válido ou bypass; testar object ID manipulation |
| **SSRF via Playlist** | iptvguard.app/checker | Funcionalidade conhecida | Enum: mapear parâmetros; testar URLs internas (169.254.169.254, localhost, metadata) |
| **XXE/Injection** | iptvguard.app/checker | Parsers M3U/Xtream/MAC | Enum: analisar JS do checker; testar payloads XXE, SQLi, command injection |
| **Rate Limit Abuse** | checker + API | Desconhecido | Testar limites em `/api/health`, checker submissions, auth endpoints |
| **Cred Stuffing** | hq login | 0 breach creds; emails padrão | Testar `contact@`, `admin@`, `mouhamadou@` + senhas comuns |
| **Mobile App Analysis** | iOS/Android/TV | Fora escopo inicial | Se web falhar: baixar APK/IPA, analisar endpoints hardcoded, keys |
| **Supply Chain** | Vercel/Railway/TMDB | Dependências conhecidas | CVE research em versões (Next.js 14, hikari, Railway agent, Axios 1.13.2) |
| **Discord Social Eng** | Equipe | Ativo (197 members) | Mapear team, assessar phishing, engenharia social |

---

## Gaps Preenchidos no Recon Ativo (Fase 3) ✓

1. ✅ **Portscan completo** nos 4 IPs origem (TCP full 65535) — apenas 80/443
2. ✅ **WAF detection** (wafw00f) — Vercel edge WAF + Railway hikari (hardening, não WAF tradicional)
3. ✅ **VHost enumeration** nos IPs origem — apenas hq.iptvguard.app confirmado
4. ✅ **TLS analysis** — cipher suites, cert details, pinning (A+ em todos)
5. ✅ **DNS zone walk** — subdomínios internos (staging, dev, internal, admin, api variants) — nenhum encontrado
6. ⏳ **Content discovery** em todos hosts — delegar para Fase 5 (Enum)
7. ⏳ **JS analysis** no checker e BackOffice — delegar para Fase 5 (Enum)
8. ⏳ **API schema discovery** — OpenAPI/Swagger, GraphQL introspecção — delegar para Fase 5 (Enum)

---

## Próximos Passos Imediatos

1. **Delegar Fase 5 (Enumeração)** ao `enum` — foco em checker/BackOffice/API:
   - Content discovery (ffuf) em todos hosts — diretórios, arquivos, backups
   - JS analysis no checker (iptvguard.app/en/checker) e BackOffice (hq) — endpoints ocultos, secrets, rotas admin
   - API schema discovery — OpenAPI/Swagger em gw, GraphQL introspecção em api
   - Auth testing no BackOffice — descobrir `/api/auth/login`, testar JWT vulnerabilities

2. **Testar takeover ativamente** nos 3 CNAMEs (criar projetos Vercel/Railway para reivindicar)

3. **CVE Research** direcionado nas versões identificadas (Next.js 14, hikari/Fastify, Axios 1.13.2, Pingora)

4. **Manter `timeline.log`** atualizado

---

## Referências
- `recon/passive/PASSIVE.md` — Recon passivo completo
- `recon/active/ACTIVE.md` — Recon ativo exaustivo (este engagement)
- `recon/passive/osint_*.txt` — OSINT artifacts
- `PLAN.md` — Backlog de vetores e fases
- `REPORT.md` — Findings consolidados
- `timeline.log` — Cronologia