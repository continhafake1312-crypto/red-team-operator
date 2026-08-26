# PLAN — arkodex.com.br

## Status Atual
- **Fase:** 1 — Escopo
- **Progresso:** 0%
- **Última atualização:** 2026-08-26T12:00:00Z

## Vetores Prioritários (Ranking)
| # | Vetor | Prioridade | Status | Notas |
|---|-------|-----------|--------|-------|
| 1 | Recon passivo + OSINT | Crítica | Pendente | Mapear toda superfície |
| 2 | Recon ativo (portscan) | Crítica | Pendente | Após recon passivo |
| 3 | Enumeração web profunda | Alta | Pendente | Após mapear hosts vivos |
| 4 | Ataque webapp | Alta | Pendente | Priorizar auth bypass, IDOR |
| 5 | CVE research | Média | Pendente | Conforme versões encontradas |

## Backlog de Vetores Pausados
*Nenhum ainda*

## Gatilhos de Retorno
- Se encontrar credencial válida → pivotar para exploit/webapp
- Se encontrar cloud bucket → acionar cloud specialist
- Se encontrar serviço de rede não-web → acionar network specialist