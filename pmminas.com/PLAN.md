# PLAN — pmminas.com

Espelho do todowrite. Fases, especialistas e status. Re-escrito conforme
findings surgem (§1, §19).

## Fases

| # | Fase | Especialista | Status | Notas |
|---|------|--------------|--------|-------|
| 1 | Escopo | coordenador | ✅ done | SCOPE.md criado |
| 2 | Recon passivo + OSINT | recon-passive + osint | ⏳ em andamento | delegado em paralelo |
| 3 | Recon ativo | recon-active | ⏸ pending | depende de fase 2 (IPs reais) |
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

- 2026-08-20T03:01Z — engagement iniciado. Recon passivo + OSINT em
  paralelo (osint é subfase do passivo, mas independente → paraleliza).
- Sem chave 2Captcha no ambiente: se Cloudflare bloquear, rota via Tor
  (NEWNYM) ou subdomínios não-proxied antes de considerar bypass captcha.