# PLAN.md — Engagement querybuscas.com

> Backlog de fases e vetores. Atualizado conforme findings surgem.

## Fases (§5)

| # | Fase | Especialista | Status | Notas |
|---|------|-------------|--------|-------|
| 1 | Escopo + estrutura | pentest (coordenador) | ✅ concluído | SCOPE/PLAN/REPORT/timeline criados |
| 2 | Recon passivo + OSINT | recon-passive → osint, cloud | ✅ concluído | 5 subs (4 vivos), PII platform, 0 origin IPs |
| 3 | Recon ativo | recon-active | ✅ concluído | 2 apps, /api/admin, login sem Turnstile, IDOR oracle |
| 4 | Consolidar SUMMARY.md | pentest (coordenador) | ✅ concluído | 22 findings, ranking payoff |
| 5 | Enumeração profunda | enum | ✅ concluído | JS de-minified, user enum oracle, 38 módulos PII |
| 6 | Ataque webapp | webapp | ⏳ em andamento | auth brute force, IDOR, BOLA, mass-assignment |
| 7 | CVE + exploit | cve → exploit | ⏳ pendente | |
| 8 | Pós-exploração | postex (se foothold) | ⏳ pendente | |
| 9 | Relatório final | report | ⏳ pendente | |

## Backlog de vetores (§19)

| Vetor | Host/Endpoint | Status | Motivo da pausa | Gatilho de retorno |
|-------|--------------|--------|-----------------|-------------------|
| Auth bypass /pages/admin | querybuscas.com | Pendente | Aguarda enum/webapp | Fase 6 |
| IDOR /api/telegram/data/<md5> | apex/api | Pendente | Token observado | Fase 6 (webapp) |
| IDOR /api/user/modulos | apex | Pendente | Requer auth | Fase 6 (webapp) |
| Auth bypass api.querybuscas.com | api | Pendente | App separado | Fase 6 (webapp) |
| bot2 auth bypass/IDOR | bot2.querybuscas.com | Pendente | 401 scheme unknown | Fase 5/6 |
| Bypass pagamento PIX | /api/gerar-pix | Pendente | | Fase 6 (webapp) |
| Descoberta IP origem real | — | Em andamento | Cloudflare bloqueia | Fase 3 (recon-active) |
| Azure/GCP buckets | — | Pausado | Tor geo-block | Re-verificar fora do Tor |

## Ranking de payoff preliminar (§16 — atualizado após recon passivo)

| Rank | Alvo/Vetor | Payoff | Justificativa |
|------|-----------|--------|---------------|
| 1 | /pages/admin (auth bypass) | 🔴 Crítica | Painel admin = acesso total PII |
| 2 | /api/telegram/data/<md5> (IDOR) | 🔴 Crítica | Vazamento direto de dados |
| 3 | api.querybuscas.com (auth bypass/JWT) | 🔴 Alta | API = acesso programático a todos módulos |
| 4 | /api/user/modulos (IDOR/enum) | 🟠 Alta | Enum de permissões + dados PII |
| 5 | bot2.querybuscas.com (auth bypass) | 🟠 Alta | API/bot interno autenticado |
| 6 | /pages/consultas/* (IDOR/BOLA) | 🟠 Alta | Consultas PII diretas |
| 7 | /api/gerar-pix (bypass pagamento) | 🟡 Média | Acesso sem pagar |
| 8 | bot.querybuscas.com (502) | 🟡 Média | Origin down — investigar |
| 9 | IP origem real (bypass CF) | 🟡 Média | Habilita ataques diretos |

## Decisões do coordenador

- 2026-09-04T03:14Z — Engagement iniciado. Chave 2Captcha configurada.
  OPSEC verificado (Tor ativo, IP 185.100.87.250 via Tor vs 18.230.157.93 real).
  Delegando Fase 2 (recon passivo).
