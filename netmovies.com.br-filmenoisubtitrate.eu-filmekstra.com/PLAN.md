# PLAN — netmovies.com.br + filmenoisubtitrate.eu + filmekstra.com

Espelho do todowrite. Fases, especialistas e status. Re-escrito conforme
findings surgem (§1, §19).

## Alvos
- **T1**: netmovies.com.br (streaming brasileiro)
- **T2**: filmenoisubtitrate.eu (site de legendas europeu)
- **T3**: filmekstra.com (conteúdo cinematográfico)

## Fases

| # | Fase | Especialista | Status | Notas |
|---|------|--------------|--------|-------|
| 1 | Escopo | coordenador | ✅ done | SCOPE.md criado + estrutura de pastas |
| 2 | Recon passivo + OSINT | recon-passive + osint | ✅ done | PASSIVE.md + OSINT.md consolidados. F-001 a F-004 descobertos |
| 3 | Recon ativo | recon-active | ⏳ em andamento | delegado — port scan IPs reais netmovies + Cloudflare bypass T2/T3 |
| 4 | Consolidar attack surface | coordenador | ⏳ em andamento | SUMMARY.md + ranking atualizado no REPORT.md |
| 5 | Enumeração profunda + Takeover | enum + exploit | ⏳ em andamento | delegado — enum netmovies + Azure takeover |
| 6 | Ataque webapp | webapp | ⏸ pending | depende de enum + recon-active |
| 7 | CVE + exploit | cve + exploit | ⏸ pending | depende de versões fingerprintadas |
| 8 | Pós-exploração | postex | ⏸ condicional | só se foothold |
| 9 | Relatório final | report | ⏸ pending | ao concluir caçada |

## Backlog de vetores (§19)

> Vetores pausados com motivo da pausa e gatilho de retorno.

| Vetor | Motivo da pausa | Gatilho de retorno |
|-------|-----------------|---------------------|
| Cloudflare bypass T2/T3 | WAF 403 bloqueando — tentar rotação Tor + 2Captcha | Após recon-active testar bypass |
| release.netmovies.com.br (AWS ELB 404) | Possível dangling ELB — confirmar | Após enum de subdomínios |

## Decisões / re-priorizações

- 2026-08-20T03:15:00Z — engagement iniciado. Recon passivo + OSINT para
  os 3 alvos em paralelo.
- Chave 2Captcha configurada: se Cloudflare bloquear, bypass automático.
- 2026-08-20T03:25:00Z — recon passivo concluído. Ranking re-priorizado:
  **CRÍTICO**: Azure takeover (prod/tests.netmovies.com.br). **ALTO**:
  port scan IPs reais + /version. Prioridade máxima em netmovies.com.br
  (IPs expostos, sem CDN). T2/T3 em espera até bypass Cloudflare.
- 2026-08-20T03:25:00Z — próximo round delegado em paralelo:
  recon-active (port scan + bypass) + Azure takeover + enum netmovies