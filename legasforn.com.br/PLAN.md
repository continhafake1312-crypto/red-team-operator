# PLAN — Engagement Legasforn

## Metodologia
Pentest Web/API Externo Black-box conforme AGENTS.md.

Fases e especialistas delegados:

| Fase | Especialista | Status | Notas |
|------|-------------|--------|-------|
| 1. Escopo | Coordenador | ✅ Concluído | SCOPE.md criado |
| 2. Recon passivo + OSINT | recon-passive | ✅ Concluído | Ver PASSIVE.md — Next.js/Railway/Supabase/MisticPay. API REST completa docs. Coupon CRUD, purchase, wallet endpoints. Sem subdomínios adicionais. |
| 3. Recon ativo | recon-active | ✅ Concluído | ACTIVE.md criado. IP 69.46.46.84:80/443 apenas. Sem WAF. Sem vhosts. TLS grade A. |
| 4. Consolidar attack surface | Coordenador | ✅ Concluído | SUMMARY.md com ranking de payoff criado/revisado. |
| 5. Enumeração profunda | enum | ⏳ Delegado | JS bundle analysis, param fuzzing, rate limit test, Supabase keys extraction |
| 6. Ataque webapp | webapp | ⏳ Pendente | OWASP Top 10 |
| 7. CVE research + exploit | cve / exploit | ⏳ Pendente | Conforme versões |
| 8. Pós-exploração | postex | ⏳ Pendente | Se foothold |
| 9. Relatório | report | ⏳ Pendente | REPORT.md final |

## Backlog de vetores (Pivot Hunting §19)
*Vetores pausados com motivo e gatilho de retorno.*
- (vazio — início do engagement)

## Ranking de payoff (atualizado em SUMMARY.md)
- Pendente — aguardando recon passivo/ativo.