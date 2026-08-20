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
| 2 | Recon passivo + OSINT | recon-passive + osint | ⏳ em andamento | delegado em paralelo para T1+T2+T3 |
| 3 | Recon ativo | recon-active | ⏸ pending | depende de fase 2 (IPs reais, subdomínios) |
| 4 | Consolidar attack surface | coordenador | ⏸ pending | recon/SUMMARY.md + ranking |
| 5 | Enumeração profunda | enum | ⏸ pending | depende de SUMMARY.md |
| 6 | Ataque webapp | webapp | ⏸ pending | depende de enum |
| 7 | CVE + exploit | cve + exploit | ⏸ pending | depende de versões fingerprintadas |
| 8 | Pós-exploração | postex | ⏸ condicional | só se foothold |
| 9 | Relatório final | report | ⏸ pending | ao concluir caçada |

## Backlog de vetores (§19)

> Vetores pausados com motivo da pausa e gatilho de retorno.

*(vazio — será preenchido conforme a caçada)*

## Decisões / re-priorizações

- 2026-08-20T03:15:00Z — engagement iniciado. Recon passivo + OSINT para
  os 3 alvos em paralelo. Estratégia: delegar um task de recon-passive
  cobrindo T1+T2+T3 simultaneamente (mesmo subagente pode processar
  múltiplos domínios).
- Chave 2Captcha configurada: se Cloudflare bloquear, bypass automático.