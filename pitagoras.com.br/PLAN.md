# PLAN — Pitágoras (pitagoras.com.br)

## Estado atual
- **Fase**: 1 — Escopo (iniciando)
- **Última atualização**: 2026-08-20T05:37:00Z

## Backlog de vetores
| # | Vetor | Status | Motivo pausa | Gatilho retorno |
|---|-------|--------|--------------|-----------------|
| — | — | — | — | — |

## Fases planejadas

### Fase 1 — Escopo ✓
- [x] SCOPE.md criado
- [x] Estrutura de diretórios criada
- [x] PLAN.md criado
- [x] REPORT.md criado
- [x] timeline.log criado

### Fase 2 — Recon passivo + OSINT ✓
- [x] Delegar ao especialista `recon-passive`
- [x] DNS, subdomínios, certificados (crt.sh)
- [x] Wayback machine, OSINT, breaches
- [x] Cloud buckets, takeover candidates
- [x] Consolidar em `recon/passive/PASSIVE.md`
- [x] Resultado: 58 subs, 34 resolvidos, 21 vivos, WordPress/AEM/CloudFront/O365

### Fase 3 — Recon ativo (⬅️ PRÓXIMA)
- [ ] Delegar ao especialista `recon-active` ← ENVIANDO AGORA
- [ ] Portscan nos IPs reais (76.223.91.9, 13.58.247.178, 141.193.213.10/11, 200.209.69.0/24)
- [ ] Fingerprint de versões, WAF, vhosts
- [ ] Verificar takeover candidates ativamente
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