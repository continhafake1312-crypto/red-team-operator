# PLAN.md — Engagement ggmax.com.br

> Backlog de fases e vetores. Atualizado conforme findings surgem.

## Fases (§5)

| # | Fase | Especialista | Status | Notas |
|---|------|-------------|--------|-------|
| 1 | Escopo + estrutura | pentest (coordenador) | ✅ concluído | SCOPE/PLAN/REPORT/timeline criados |
| 2 | Recon passivo + OSINT | recon-passive → osint, cloud | ✅ concluído | 17 subs (13 vivos), 1 IP origem real (104.238.205.118 imgproxy sem WAF), Nuxt.js + Cloudflare, 128 API endpoints, 10 findings preliminares |
| 3 | Recon ativo | recon-active | ⏳ em andamento | Portscan origin, bypass CF, validar SSRF imgproxy, vhost fuzz |
| 4 | Consolidar SUMMARY.md | pentest (coordenador) | ⏳ pendente | |
| 5 | Enumeração profunda | enum | ⏳ pendente | |
| 6 | Ataque webapp | webapp | ⏳ pendente | |
| 7 | CVE + exploit | cve → exploit | ⏳ pendente | |
| 8 | Pós-exploração | postex (se foothold) | ⏳ pendente | |
| 9 | Relatório final | report | ⏳ pendente | |

## Backlog de vetores (§19)

| Vetor | Host/Endpoint | Status | Motivo da pausa | Gatilho de retorno |
|-------|--------------|--------|-----------------|-------------------|
| SSRF imgproxy /plain/{url} | img-origin (104.238.205.118) | Pendente | Aguarda recon ativo | Fase 3 (recon-active) |
| Token reset senha wayback | /recuperar-senha/{token}/{email} | Pendente | Aguarda recon ativo | Fase 3 |
| PII leak /api/accounts/search?q={CPF} | ggmax.com.br | Pendente | Cloudflare bloqueia Tor | Fase 3 (bypass CF) |
| IDOR /conta/pedido/{order_id} | ggmax.com.br | Pendente | Cloudflare bloqueia Tor | Fase 3 (bypass CF) |
| IDOR /api/users/v2/inspect/{user}/order-reviews | api.ggmax.com.br | Pendente | Cloudflare bloqueia Tor | Fase 3 (bypass CF) |
| S3 bucket enum (ggmax sa-east-1) | ggmax.s3.sa-east-1 | Pendente | Bucket privado (403) | Fase 3 ou cloud specialist |
| Discord OAuth ATO | /api/auth/discord | Pendente | Cloudflare bloqueia Tor | Fase 3 (bypass CF) |
| Enumeração de usuários | /perfil/{user}, /profile/{user} | Pendente | Cloudflare bloqueia Tor | Fase 3 (bypass CF) |
| SPF spoofing @ggmax.com.br | — | Pendente | SPF ausente, DMARC p=none | Fase 6 (webapp) |
| staging.ggmax.com.br | staging | Pendente | Cloudflare bloqueia Tor | Fase 3 (bypass CF) |

## Ranking de payoff preliminar (§16 — atualizado após recon passivo)

| Rank | Alvo/Vetor | Payoff | Justificativa |
|------|-----------|--------|---------------|
| 1 | SSRF imgproxy (IP direto 104.238.205.118, sem WAF) | 🔴 Crítica | Acesso direto sem CDN, AWS metadata, rede interna |
| 2 | Token reset senha wayback (/recuperar-senha/{token}/{email}) | 🔴 Crítica | Account takeover se token não expira |
| 3 | PII leak /api/accounts/search?q={CPF} | 🔴 Crítica | Busca de contas por CPF sem auth aparente |
| 4 | IDOR /conta/pedido/{order_id} (IDs curtos) | 🟠 Alta | Enumeração de pedidos de outros usuários |
| 5 | IDOR /api/users/v2/inspect/{user}/order-reviews | 🟠 Alta | Reviews de pedidos de qualquer usuário |
| 6 | Portscan origin 104.238.205.118 | 🟠 Alta | Outros serviços expostos sem WAF |
| 7 | Bypass Cloudflare (2Captcha) para app Nuxt | 🟠 Alta | Enabler para todos os vetores web |
| 8 | S3 bucket enum (ggmax sa-east-1) | 🟡 Média | Vazamento de arquivos/backs |
| 9 | Discord OAuth ATO | 🟡 Média | Account takeover via OAuth |
| 10 | Documentos verificação /conta/verificacoes/documentos | 🟡 Média | CPF/RG uploads — PII |
| 11 | staging.ggmax.com.br | 🟡 Média | Ambiente homologação — menos hardening |
| 12 | SPF spoofing @ggmax.com.br | 🟡 Média | Phishing/cred-stuffing |

## Decisões do coordenador

- 2026-09-04T22:41Z — Engagement iniciado. Chave 2Captcha configurada pelo
  operador. OPSEC verificado (Tor ativo, IP 107.189.31.187 via Tor vs
  18.230.157.93 real). Delegando Fase 2 (recon passivo).
- 2026-09-04T23:05Z — Fase 2 concluída. Attack surface rica: marketplace de
  bens digitais (contas de jogos, gift cards) com PII (CPF, documentos).
  IP de origem real descoberto (104.238.205.118, imgproxy sem WAF) — alvo
  #1. Cloudflare bloqueia Tor — usar 2Captcha. Delegando Fase 3 (recon ativo).
