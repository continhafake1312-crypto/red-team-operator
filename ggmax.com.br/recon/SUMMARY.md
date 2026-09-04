# recon/SUMMARY.md — Attack Surface Consolidada — ggmax.com.br

> Fases 2+3 (recon passivo + ativo) consolidadas. Ranking de payoff (§16).

---

## Metadados

| Campo | Valor |
|-------|-------|
| **Alvo** | `ggmax.com.br` (white-label de `keyz.gg`) |
| **Empresa** | GGMAX TECNOLOGIA DA INFORMACAO LTDA (CNPJ 46.018.667/0001-12) |
| **Owner** | Thiago Yoithi Vaz da Rocha (thyoity@gmail.com) |
| **Stack** | Nuxt.js (Vue SSR) + NestJS (Express) + Cloudflare WAF + BunnyCDN + AWS |
| **IP origem real** | `104.238.205.118` (nginx/1.24.0, SEM WAF) |
| **Domínio real** | `keyz.gg` (revelado pelo cert TLS SAN) |

---

## Attack Surface

### Hosts vivos (13)

| Host | IP | WAF/CDN | Stack | Via CF | Via bypass |
|------|-----|---------|-------|--------|------------|
| ggmax.com.br | 172.66.155.81 | Cloudflare | Nuxt.js | 403 challenge | 200 (NestJS "Hello World") |
| www.ggmax.com.br | 104.20.42.25 | Cloudflare | Nuxt.js | 403 challenge | 200 |
| api.ggmax.com.br | 172.66.155.81 | Cloudflare | NestJS API | 403 block | 200 |
| staging.ggmax.com.br | 172.66.155.81 | Cloudflare | Staging | 403 block | 403 nginx |
| search.ggmax.com.br | 104.20.42.25 | Cloudflare | — | 200 (block page) | 200 |
| find.ggmax.com.br | 172.66.155.81 | Cloudflare | — | 200 (block page) | 200 |
| cron.ggmax.com.br | 172.66.155.81 | Cloudflare | — | 403 block | 200 |
| status.ggmax.com.br | 104.20.42.25 | Cloudflare | — | 403 block | 200 |
| cdn/img/bcdn | 193.162.131.x | BunnyCDN | CDN | — | — |
| build.ggmax.com.br | 13.32.16.58 | CloudFront+S3 | Nuxt builds | 403 | — |
| **img-origin.ggmax.com.br** | **104.238.205.118** | **NENHUM** | nginx + imgproxy | 404 | 404 |

### Painéis admin expostos (via origin 104.238.205.118, sem WAF)

| Painel | Vhost | Status | Payoff |
|--------|-------|--------|--------|
| **Coolify** | coolify.keyz.gg | 🔴 Login exposto (creds comuns falharam) | Controle TOTAL da infra (deploys, servers, DBs, env vars) |
| **Meilisearch** | search.keyz.gg | 🟠 Dashboard exposto (precisa API key) | Busca de produtos/usuários — PII |
| **Soketi** | rt.keyz.gg | 🟡 Realtime exposto (CORS aberto) | WebSocket subscription injection |

### Portas abertas no origin (104.238.205.118)

| Porta | Serviço | Versão | CVE candidate |
|-------|---------|--------|---------------|
| 22 | SSH | OpenSSH 9.6p1 Ubuntu 3ubuntu13.11 | CVE-2024-6387 (regreSSHion)? |
| 80 | HTTP | nginx/1.24.0 → redirect 443 | — |
| 443 | HTTPS | nginx/1.24.0 + imgproxy + vhosts | — |

### Credenciais obtidas

| Email | Senha | Status | User ID | Role |
|-------|-------|--------|---------|------|
| test@test.com | test | ✅ Válido (JWT obtido) | 270 | Regular |
| thyoity@gmail.com | — | Conta existe (Invalid password) | ? | ? (provável admin) |

---

## Ranking de payoff (§16)

| Rank | Alvo/Vetor | Payoff | Status | Próxima fase |
|------|-----------|--------|--------|-------------|
| 1 | Bypass CF + origin (toda infra sem WAF) | 🔴 Crítica | Confirmado | Enabler |
| 2 | Coolify admin — controle total infra | 🔴 Crítica | Login exposto, creds falharam | webapp (brute force) |
| 3 | JWT obtido + username enumeration | 🔴 Alta | Foothold confirmado | webapp (JWT forgery admin) |
| 4 | API api.keyz.gg — IDOR /orders, /tickets | 🟠 Alta | Endpoints mapeados | webapp (IDOR com JWT) |
| 5 | Meilisearch — dados indexados | 🟠 Alta | Precisa API key | enum (encontrar key) |
| 6 | SSH 22 — OpenSSH 9.6p1 | 🟠 Alta | CVE-2024-6387? | cve (verificar aplicabilidade) |
| 7 | OAuth redirect_uri attacks | 🟡 Média | Client IDs extraídos | webapp |
| 8 | Soketi — subscription injection | 🟡 Média | CORS aberto | webapp |
| 9 | /orders 500 bug — stack trace | 🟡 Média | Bug confirmado | webapp |
| 10 | Coupons brute force | 🟡 Média | Endpoint funcional | webapp |
| 11 | S3 bucket ggmax (sa-east-1) | 🟡 Média | Privado (403) | cloud |
| 12 | staging environment | 🟡 Média | Existe (403 nginx) | enum |
| 13 | SPF spoofing @ggmax.com.br | 🟡 Média | SPF ausente, DMARC p=none | webapp |
| 14 | PII /reviews (nomes vazados) | 🟡 Média | 6 nomes confirmados | — |

---

## Próximas fases

### Fase 5 (enum) — em andamento
- Content discovery profundo na API api.keyz.gg (ffuf raft, common, API)
- JS analysis do app Nuxt (keyz.gg) — endpoints, chaves, tokens
- Encontrar Meilisearch API key (no app config, env, build)
- Encontrar Soketi/Pusher app keys
- Enumerar endpoints admin (path diferentes)
- Brute force de cupons (/coupons/validate)
- S3 bucket enumeration (paths comuns)

### Fase 6 (webapp) — pendente
1. JWT forgery admin (HS256 key brute com jwt_tool)
2. IDOR /orders/{id}, /tickets/{id}, /users/recent-transactions?userId=
3. Coolify login brute force (com CSRF token)
4. OAuth redirect_uri attacks (Google/Discord/Twitch)
5. Mass assignment POST /auth (role/admin field)
6. /search template injection (SSTI)
7. /orders 500 — vazar stack trace
8. Coupons brute force

### Fase 7 (CVE + exploit)
- OpenSSH 9.6p1 → CVE-2024-6387 (regreSSHion)
- Coolify → CVEs
- Meilisearch → CVEs
- nginx 1.24.0 → CVEs

---

*Consolidado em 2026-09-04 pelo coordenador pentest (Fase 4).*
