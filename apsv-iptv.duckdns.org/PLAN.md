# PLAN — apsv-iptv.duckdns.org

## Engagement Overview
- **Target**: apsv-iptv.duckdns.org
- **Status**: EM ANDAMENTO
- **Início**: 2026-08-22T21:38:00Z

## Fases (ordem obrigatória, adaptativa ao perfil)

### [ ] Fase 1 — Escopo (CONCLUÍDA)
- [x] Criar estrutura de diretórios
- [x] SCOPE.md
- [x] PLAN.md
- [x] REPORT.md
- [x] timeline.log

### [ ] Fase 2 — Recon passivo + OSINT
- Especialista: `recon-passive`
- DNS, subdomínios, crt.sh, wayback, tech stack, OSINT, buckets
- Saída: `recon/passive/PASSIVE.md`

### [ ] Fase 3 — Recon ativo
- Especialista: `recon-active`
- Portscan, fingerprint, vhosts, WAF, TLS
- Saída: `recon/active/ACTIVE.md`

### [ ] Fase 4 — Consolidar attack surface
- `recon/SUMMARY.md` com ranking de payoff
- Re-priorizar conforme findings

### [ ] Fase 5 — Enumeração profunda
- Especialista: `enum`
- Content discovery, JS analysis, APIs, CMS
- Saída: `enum/ENUM.md`

### [ ] Fase 6 — Ataque webapp
- Especialista: `webapp`
- OWASP Top 10, auth bypass, injection, IDOR, SSRF, XSS
- Saída: `evidence/F-XXX.txt`

### [ ] Fase 7 — CVE research + exploit
- Especialistas: `cve` / `exploit` (se versões vulneráveis ou creds)
- PoCs, validação não-destrutiva

### [ ] Fase 8 — Pós-exploração (se foothold)
- Especialista: `postex`
- Loot, pivoting

### [ ] Fase 9 — Relatório final
- Especialista: `report`
- REPORT.md consolidado

## Backlog de vetores (§19)
*(Atualizado conforme findings)*

## Ranking de payoff (§16)
*(Atualizado em recon/SUMMARY.md após recon ativo)*

## Observações
- duckdns.org → DNS dinâmico, IP real pode mudar
- Provável IPTV pirata/streaming → pode ter APIs de usuários/pagamentos