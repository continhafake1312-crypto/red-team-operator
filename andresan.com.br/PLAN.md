# Plano — andresan.com.br

## Fases (status)
- [x] F1 — Escopo (estrutura + SCOPE.md)
- [ ] F2 — Recon passivo + OSINT  → `recon-passive`
- [ ] F3 — Recon ativo  → `recon-active`
- [ ] F4 — Consolidar SUMMARY.md (coordenador)
- [ ] F5 — Enumeração profunda  → `enum`
- [ ] F6 — Ataque webapp  → `webapp`
- [ ] F7 — CVE + exploit  → `cve`/`exploit`
- [ ] F8 — Pós-ex (se foothold)  → `postex`
- [ ] F9 — Relatório final  → `report`

## Ranking de payoff (atualizado após cada fase)
1. (pendente recon)

## Backlog de vetores (§19)
- (pendente — caçada contínua após cada vetor não-renderizante)

## Notas de delegação aninhada
- recon-passive → osint (após subdomínios), cloud (buckets/takeover)
- enum → webapp (ao achar endpoint vulnável)
- webapp → exploit/cve (ao confirmar vuln)
- cve → exploit (PoC não-destrutivo)
- exploit → postex (após foothold)
