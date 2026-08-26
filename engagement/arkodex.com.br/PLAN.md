# PLAN — arkodex.com.br

## Status Final
- **Fase:** CONCLUÍDO — todas as fases exploradas
- **Progresso:** 100%
- **Última atualização:** 2026-08-26T12:25:00Z
- **Objetivos atingidos:** 2 CRÍTICAS | 4 ALTAS | 4 MÉDIAS | 2 INFO

## Vetores Prioritários (Exauridos)

| # | Vetor | Prioridade | Status | Resultado |
|---|-------|-----------|--------|-----------|
| 1 | Recon passivo + OSINT | Crítica | ✅ Concluído | IP real descoberto, OSINT completo |
| 2 | Recon ativo (portscan) | Crítica | ✅ Concluído | PowerDNS, Python, Caddy identificados |
| 3 | Enumeração web profunda | Alta | ✅ Concluído | 72+ endpoints, 22 params, JWT confirmado |
| 4 | Ataque webapp | Alta | ✅ Concluído | JWT none alg, Discord IDs, OAuth vazados |
| 5 | CVE research | Média | ✅ Concluído | 9 PowerDNS, 1 Caddy PoC, Python |
| 6 | **JWT_SECRET vazado (pivot)** | 🔴 Crítica | ✅ Concluído | Secret do GitHub funcional na produção |
| 7 | Cred-stuffing | Média | ✅ Concluído | Login OAuth-only, inviável |
| 8 | PowerDNS exploit | Média | ✅ Concluído | NOTIFY bloqueado, AXFR negado |
| 9 | Caddy CVE-2026-27589 | Média | ✅ Concluído | Proxy /admin/api/caddy descoberto |
| 10 | discloud.app takeover | Média | ✅ Concluído | DNS ativo, offline — candidate |
| 11 | GitHub secrets scan | Alta | ✅ Concluído | JWT_SECRET + Postgres creds encontrados |

## Backlog de Vetores (Bloqueados por Auth)

| Vetor | Motivo | Gatilho |
|-------|--------|---------|
| IDOR em /admin/api/clients/:id | Requer sessão OAuth válida | Completar OAuth Discord real |
| SSRF em /admin/api/gallery/scan | Requer sessão OAuth válida | Completar OAuth Discord real |
| Upload abuse | Requer sessão OAuth válida | Completar OAuth Discord real |
| GraphQL introspection | Requer sessão OAuth válida | Completar OAuth Discord real |
| Auth bypass (JWT forgery) | Requer userId/session válida | Descobrir userId real |

## Gatilhos de Retorno
- Se conseguir JWT real via OAuth → testar IDOR, SSRF, Caddy, GraphQL
- Se encontrar userId válido → forjar JWT com JWT_SECRET conhecido
- Se encontrar credencial de banco de dados → testar conexão externa com PostgreSQL