# PLAN.md — centraldeconcursos.com.br

> Espelho do todowrite. Backlog de fases, especialistas e vetores.

## Fases (§5)

| # | Fase | Especialista | Status | Entregável |
|---|------|--------------|--------|------------|
| 1 | Escopo + estrutura | pentest | ✅ concluída | SCOPE.md, pastas |
| 2 | Recon passivo + OSINT | recon-passive (+osint) | ⏳ pendente | recon/passive/PASSIVE.md |
| 3 | Recon ativo | recon-active | ⏳ pendente | recon/active/ACTIVE.md |
| 4 | Consolidar attack surface | pentest | ⏳ pendente | recon/SUMMARY.md |
| 5 | Enumeração profunda | enum | ⏳ pendente | enum/<host>/ENUM.md |
| 6 | Ataque webapp | webapp | ⏳ pendente | evidence/F-XXX.txt |
| 7 | CVE research + exploit | cve + exploit | ⏳ pendente | exploit/ |
| 8 | Pós-exploração (se foothold) | postex | ⏳ pendente | loot/ |
| 9 | Relatório final | report | ⏳ pendente | REPORT.md final |

## Ranking de payoff (§16) — atualizado após cada fase

| Payoff | Vetor | Host | Status | Notas |
|--------|-------|------|--------|-------|
| ALTO | TBD | centraldeconcursos.com.br | pendente | após recon |
| ALTO | TBD | TBD | pendente | após recon |
| MÉDIO | TBD | TBD | pendente | após recon |

## Backlog de vetores (§19) — matriz de fallback

| Vetor | Status | Motivo da pausa | Gatilho de retorno |
|-------|--------|-----------------|--------------------|
| (preencher conforme fases avançam) | | | |

## Decisões do coordenador
- 2026-08-27T03:23Z — Engagement iniciado. Tor OK (IP saída
  185.220.101.110). Chave 2Captcha em ~/.config/opencode/.2captcha_key.
  Próximo: delegar Fase 2 (recon passivo + OSINT).
