# PLAN — Pitágoras (pitagoras.com.br)

## Estado atual
- **Fase**: 1 — Escopo (iniciando)
- **Última atualização**: 2026-08-20T05:37:00Z

## Backlog de vetores
| # | Vetor | Status | Motivo pausa | Gatilho retorno |
|---|-------|--------|--------------|-----------------|
| — | — | — | — | — |

## Fases planejadas

### Fase 1 — Escopo ✓ (criado)
- [x] SCOPE.md criado
- [x] Estrutura de diretórios criada
- [x] PLAN.md criado
- [x] REPORT.md criado
- [x] timeline.log criado

### Fase 2 — Recon passivo + OSINT (⬅️ PRÓXIMA)
- [ ] Delegar ao especialista `recon-passive`
- [ ] DNS, subdomínios, certificados (crt.sh)
- [ ] Wayback machine, OSINT, breaches
- [ ] Cloud buckets, takeover candidates
- [ ] Consolidar em `recon/passive/PASSIVE.md`

### Fase 3 — Recon ativo
- [ ] Delegar ao especialista `recon-active`
- [ ] Portscan em IPs reais
- [ ] Fingerprint de versões, WAF, vhosts
- [ ] Consolidar em `recon/active/ACTIVE.md`

### Fase 4 — Consolidar attack surface
- [ ] Criar `recon/SUMMARY.md` com ranking de payoff

### Fase 5 — Enumeração profunda
- [ ] Delegar ao especialista `enum`

### Fase 6 — Ataque webapp
- [ ] Delegar ao especialista `webapp`

### Fase 7 — CVE + exploit
- [ ] Delegar aos especialistas `cve`/`exploit`

### Fase 8 — Pós-exploração (se foothold)
- [ ] Delegar ao especialista `postex`

### Fase 9 — Relatório final
- [ ] Delegar ao especialista `report`

## Notas
- 2Captcha key disponível para bypass Cloudflare.
- Tor + proxychains4 ativos e verificados.
- Adaptar conforme findings emergirem (§19 — caçada contínua).