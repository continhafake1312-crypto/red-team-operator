# PLAN.md — Plano de Engagement

## Alvo: ice.bet.br
**Início:** 2026-09-03  
**Status:** EM ANDAMENTO  
**Fase atual:** 1 - Escopo

---

## Fases

| # | Fase | Status | Especialista | Entregáveis |
|---|------|--------|-------------|-------------|
| 1 | Escopo | ✅ CONCLUÍDO | — | SCOPE.md, estrutura de pastas |
| 2 | Recon Passivo + OSINT | ⏳ PENDENTE | recon-passive, osint | recon/passive/PASSIVE.md |
| 3 | Recon Ativo | ⏳ PENDENTE | recon-active | recon/active/ACTIVE.md |
| 4 | Consolidar Attack Surface | ⏳ PENDENTE | — | recon/SUMMARY.md |
| 5 | Enumeração Profunda | ✅ CONCLUÍDO | enum | enum/ENUM.md |
| 6 | Ataque Webapp | ⏳ PENDENTE | webapp | evidence/F-*.txt |
| 7 | CVE Research + Exploit | ⏳ PENDENTE | cve, exploit | exploit/ |
| 8 | Pós-Exploração | ⏳ PENDENTE | postex | loot/ |
| 9 | Relatório | ⏳ PENDENTE | report | REPORT.md final |

---

## Backlog de Vetores (Caçada Contínua §19)

| # | Vetor | Host | Payoff | Status |
|---|-------|------|--------|--------|
| 1 | API Tenant Bypass (X-Tenant-ID: ice) | api.ice.bet.br | 🔴 Bypass de tenant, acesso a /v1/games | **NOVO** |
| 2 | Payload CMS Admin Exposto | blog.ice.bet.br | 🔴 Admin panel + REST APIs públicas | **NOVO** |
| 3 | Redtrack.io via Kong (Host: localhost) | track.ice.bet.br | 🔴 Painel de afiliados interno | **NOVO** |
| 4 | Redtrack.io API (token required) | api.redtrack.io | 🔴 API de tracking com auth | **NOVO** |
| 5 | Sports API Data Exposure | sports.ice.bet.br | 🟠 24 sports, 474 ligas, 10 eventos | **NOVO** |
| 6 | KYC Upload Abuse | face-recognition[1-5] | 🟠 Upload de documentos | **NOVO** |
| 7 | Kong Admin API (SSRF) | 216.238.112.42 | 🟠 Acesso a admin do Kong | **NOVO** |
| 8 | Blog Admin Cred Brute Force | blog.ice.bet.br | 🟠 /admin/login | **NOVO** |
| 9 | Blog Media Upload Abuse | blog.ice.bet.br | 🟠 /admin/media | **NOVO** |
| 10 | Sentry Abuse (event injection) | sentry.redtrack.dev | 🟡 Injeção de eventos falsos | **NOVO** |
| 11 | SSH Brute / CVE | 216.238.112.42 | 🟡 OpenSSH 9.6p1 | **NOVO** |

## Descobertas Prioritárias

### 🔴 Crítico
1. **api.ice.bet.br**: X-Tenant-ID: ice bypassa tenant — /v1/games, /v1/health, /v1/countries expostos
2. **blog.ice.bet.br**: Payload CMS admin acessível (/admin), REST APIs públicas (/api/posts, /api/media, /api/authors)
3. **track.ice.bet.br (Kong)**: Host: localhost → Redtrack.io SPA com Sentry DSN, Braintree, HubSpot

### 🟠 Alto
4. **api.redtrack.io**: API retorna 401 "API token required" em /campaigns, /offers, /sources, /networks
5. **sports.ice.bet.br**: 24 esportes, 474 ligas, 10 eventos — scraping sem auth
6. **face-recognition[1-5]**: Next.js SPAs referenciando api.ice.bet.br

### 🟡 Médio
7. **status.ice.bet.br**: UptimeRobot/Caddy — apenas página pública
8. **imgix.ice.bet.br**: Página estática — SSRF testado sem sucesso
9. **docs.ice.bet.br**: Cloudflare Access — bloqueado

### Chaves Vazadas
- Sentry DSN: `a164fc1c2a7f2e4a486b1a6b8b4ae70c` (sentry.redtrack.dev)
- GTM: `GTM-NHDD75H`
- HubSpot Portal: `7519541`
- CSRF Token: `CGxmT5qWK3N2ABEk9J3IKqNrE6i5If9on8z18kRb` (status.ice.bet.br)

## Histórico

- **2026-09-03 05:54 UTC** — Estrutura criada, SCOPE.md escrito, inicio do engagement.
- **2026-09-03 06:45 UTC** — Recon ativo concluído — ACTIVE.md.
- **2026-09-03 07:10 UTC** — Enumeração profunda concluída — ENUM.md.