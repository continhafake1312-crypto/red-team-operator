# PLAN — pgfconcursos.com

## Status do engagement
**Fase atual:** 1 (Escopo) ✓ → 2 (Recon passivo) ⏳

## Fases (§5)
1. ✅ **Escopo** — SCOPE.md + estrutura criados.
2. ⏳ **Recon passivo + OSINT** — subagente `recon-passive` (delega
   `osint`, `cloud`). DNS, subdomínios, crt.sh, wayback, tech stack,
   emails, pessoas, breaches, buckets, takeover candidates.
3. ⬜ **Recon ativo** — subagente `recon-active`. Portscan todas as
   portas, fingerprint versões, vhosts, WAF, TLS, IP real.
4. ⬜ **Consolidar attack surface** — `recon/SUMMARY.md` + ranking payoff.
5. ⬜ **Enumeração profunda** — subagente `enum`. Content discovery,
   JS analysis, param mining, API (Swagger/GraphQL), CMS scan.
6. ⬜ **Ataque webapp** — subagente `webapp`. OWASP Top 10.
7. ⬜ **CVE research + exploit** — subagentes `cve` + `exploit`.
8. ⬜ **Pós-exploração** — subagente `postex` (se foothold).
9. ⬜ **Relatório** — subagente `report`. REPORT.md final.

## Ranking de payoff (re-priorizado a cada finding — §16)
| Prioridade | Vetor | Status | Notas |
|---|---|---|---|
| ALTA | Painel admin / default creds | pendente | a confirmar stack |
| ALTA | PII de alunos (cadastro/pagamentos) | pendente | negócio = concursos |
| ALTA | Upload de arquivos → RCE | pendente | PHP 7.3.33 EOL |
| MÉDIA | LFI / path traversal | pendente | PHP+LiteSpeed |
| MÉDIA | SQLi em endpoints de busca/login | pendente | |
| MÉDIA | Subdomínios esquecidos / takeover | pendente | |
| BAIXA | Info disclosure / headers | pendente | |

## Backlog de vetores (§19)
| Vetor | Estado | Motivo pausa | Gatilho retorno |
|---|---|---|---|
| — | — | — | — |

## Notas
- Stack: Hostinger / LiteSpeed / PHP 7.3.33. PHP 7.3 EOL (dez/2021) →
  muitos CVEs potenciais. Confirmar apps: WordPress? Moodle? Moodle
  (cursos) é comum em sites de concursos.
- 2Captcha disponível mas alvo aparentemente sem Cloudflare no front.
