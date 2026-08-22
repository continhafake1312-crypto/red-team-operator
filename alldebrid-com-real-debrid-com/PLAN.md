# PLAN.md — Engagement: alldebrid-com-real-debrid-com

## Status do Engagement
- **Iniciado em**: 2026-08-22T17:00:00Z
- **Fase atual**: 1 — Escopo (concluída)
- **Próxima fase**: 2 — Recon passivo + OSINT

## Fases Planejadas

| Fase | Descrição | Especialista | Status | Artefato |
|------|-----------|--------------|--------|----------|
| 1 | Escopo + estrutura | Coordenador | ✅ Concluída | SCOPE.md, PLAN.md, REPORT.md, timeline.log |
| 2 | Recon passivo + OSINT | recon-passive | ⏳ Pendente | recon/passive/PASSIVE.md |
| 3 | Recon ativo | recon-active | ⏳ Pendente | recon/active/ACTIVE.md |
| 4 | Consolidar attack surface | Coordenador | ⏳ Pendente | recon/SUMMARY.md |
| 5 | Enumeração profunda | enum | ⏳ Pendente | enum/ |
| 6 | Ataque WebApp | webapp | ⏳ Pendente | evidence/F-XXX.txt |
| 7 | CVE Research | cve | ⏳ Pendente | exploit/ |
| 8 | Exploit Validation | exploit | ⏳ Pendente | exploit/pocs/ |
| 9 | Pós-exploração | postex | ⏳ Pendente | loot/ |
| 10 | Relatório Final | report | ⏳ Pendente | REPORT.md (final) |

## Backlog de Vetores (Pivot Hunting §19)

### Alldebrid.com
- [ ] Subdomain enumeration completa
- [ ] Certificate transparency (crt.sh)
- [ ] Wayback/CDX endpoints
- [ ] Tech stack fingerprint
- [ ] API endpoints discovery
- [ ] Auth bypass / default creds
- [ ] IDOR/BOLA em endpoints de usuário
- [ ] SSRF via URL fetch
- [ ] XSS em parâmetros de busca/reflexão
- [ ] SSTI em templates
- [ ] File upload bypass
- [ ] JWT analysis
- [ ] GraphQL introspection
- [ ] Cloud bucket takeover
- [ ] WAF bypass (Cloudflare)

### Real-debrid.com
- [ ] Subdomain enumeration completa
- [ ] Certificate transparency (crt.sh)
- [ ] Wayback/CDX endpoints
- [ ] Tech stack fingerprint
- [ ] API endpoints discovery
- [ ] Auth bypass / default creds
- [ ] IDOR/BOLA em endpoints de usuário
- [ ] SSRF via URL fetch
- [ ] XSS em parâmetros de busca/reflexão
- [ ] SSTI em templates
- [ ] File upload bypass
- [ ] JWT analysis
- [ ] GraphQL introspection
- [ ] Cloud bucket takeover
- [ ] WAF bypass (Cloudflare)

## Vetores Pausados / Retry
*(Será preenchido conforme execução)*

## Findings Confirmados
*(Será preenchido conforme execução)*

## Próximas Ações Imediatas
1. Delegar fase 2 (recon-passive) para ambos os alvos
2. Aguardar resultados e consolidar em SUMMARY.md
3. Delegar fase 3 (recon-active)