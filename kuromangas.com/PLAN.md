# PLAN.md — engagement/kuromangas.com

Espelho do todowrite. Fases em ordem (§5). Re-priorizado conforme findings.

## Fases

- [x] F1 — Escopo (estrutura + SCOPE.md) — 2026-08-20T16:05Z
- [ ] F2 — Recon passivo + OSINT (subagente `recon-passive`)
- [ ] F3 — Recon ativo (subagente `recon-active`)
- [ ] F4 — Consolidar `recon/SUMMARY.md` (ranking de payoff §16)
- [ ] F5 — Enumeração profunda (subagente `enum`)
- [ ] F6 — Ataque webapp (subagente `webapp`)
- [ ] F7 — CVE + exploit (subagentes `cve`/`exploit`) — se aplicável
- [ ] F8 — Pós-ex (subagente `postex`) — se foothold
- [ ] F9 — Relatório final (subagente `report`)

## Ranking de payoff (§16) — atualizado conforme findings

| Vetor | Payoff | Status | Notas |
|------|--------|--------|-------|
| Bypass Cloudflare / IP real | ALTO | pendente | site provável CF |
| Subdomínios não-proxied | ALTO | pendente | |
| Painel admin exposto | ALTO | pendente | |
| Credenciais vazadas (OSINT) | MÉDIO | pendente | |
| Takeover de subdomínio | MÉDIO | pendente | |
| API não-autorizada (mangás/users) | MÉDIO | pendente | |
| Wayback JS/rotas sensíveis | MÉDIO | pendente | |

## Backlog de vetores (§19)

(vazio — preenchido conforme a caçada avança)
