# PLAN.md — fernandapessoa.com.br

> Backlog de fases e vetores. Atualizado a cada decisão do coordenador.

## Status das fases

| # | Fase | Especialista | Status | Entregável |
|---|------|--------------|--------|------------|
| 1 | Escopo | pentest | ✅ concluído | SCOPE.md |
| 2 | Recon passivo + OSINT | recon-passive | ⏳ pendente | recon/passive/PASSIVE.md |
| 3 | Recon ativo | recon-active | ⏳ pendente | recon/active/ACTIVE.md |
| 4 | Consolidar attack surface | pentest | ⏳ pendente | recon/SUMMARY.md |
| 5 | Enumeração profunda | enum | ⏳ pendente | enum/ |
| 6 | Ataque webapp | webapp | ⏳ pendente | evidence/ |
| 7 | CVE + exploit | cve/exploit | ⏳ pendente | exploit/ |
| 8 | Pós-ex (se foothold) | postex | ⏳ condicional | loot/ |
| 9 | Relatório | report | ⏳ pendente | REPORT.md |

## Backlog de vetores (§19)

> Caçada contínua — se um vetor falha, caça outro. Mantém motivo da
> pausa + gatilho de retorno.

| Vetor | Host/Alvo | Status | Nota |
|-------|-----------|--------|------|
| (a definir após recon) | — | — | — |

## Ranking de payoff (§16) — atualizado após recon

> ALTO = caminho direto para objetivo de alto valor
> MÉDIO = info disclosure / postura / pivot
> BAIXO = info menor

| Host/Serviço | Vetor | Payoff | Status |
|--------------|-------|--------|--------|
| (a definir após recon) | — | — | — |

## Próxima ação
Delegar Fase 2 (recon passivo + OSINT) ao subagente `recon-passive`.
