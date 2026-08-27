# PLAN — Engagement cursosprepare.com

> Espelho do todowrite. Backlog de vetores, status, prioridades. Atualizado continuamente.

## Fases (§5)
| # | Fase | Especialista | Status | Notas |
|---|---|---|---|---|
| 1 | Escopo + estrutura | pentest | ✅ concluída | SCOPE.md criado |
| 2 | Recon passivo + OSINT | recon-passive (+osint) | ✅ concluída | PASSIVE.md + SUMMARY.md |
| 3 | Recon ativo | recon-active | ✅ concluída | bypass App Armor resolvido |
| 4 | Consolidar attack surface (SUMMARY.md) | pentest | ✅ concluída | ranking payoff final |
| 5 | Enumeração profunda | enum | ✅ concluída | Wix APIs, members, challenges |
| OSINT+ | Validar emails/breaches/GitHub | osint | ✅ concluída | 4 emails validados, 16 padrões |
| 6 | Ataque webapp | webapp | ✅ concluída | F-001..F-005 |
| 7 | CVE research + exploit | cve + exploit | ✅ concluída | nenhum CVE; cred-stuffing inviável |
| 8 | Pós-exploração | postex | ⏭️ N/A | sem foothold (Wix SaaS) |
| 9 | Relatório | report | ✅ concluída | REPORT.md final |

**STATUS: ENGAGEMENT COMPLETO** — 5 findings (1 Crítica, 2 Altas, 2 Baixas), sem foothold.

## Contexto do alvo (plano emerge do recon)
- **Stack:** Wix managed (server Pepyaka), Google Cloud no www.
- **Wix site ID:** `dcffb6fe-b153-4b2e-bd44-5de8281fcb28` → vetores Wix-API.
- **Email:** Google Workspace → OSINT emails, phishing cred-stuffing candidates.
- **WWW bloqueia Tor:** usar 2Captcha / UA real / apex / subdomínios.

## Ranking de payoff preliminar (§16) — re-priorizar após cada fase
| Payoff | Vetor | Notas |
|---|---|---|
| Alto | Subdomínio takeover / dangling CNAME | Wix DNS, possível dangling |
| Alto | OSINT credenciais vazadas + Google Workspace login | cred-stuffing |
| Alto | Cloud buckets (S3/Azure/GCP) da marca | backups/PII |
| Médio | Wix APIs/CVEs (site ID) | Wix-specific vulns |
| Médio | Wayback endpoints/JS vazados | rotas admin, params |
| Médio | Subdomínios internos fora Wix | hosts próprios |
| Baixo | OWASP Top 10 no site Wix | managed, reduzido |

## Backlog de vetores (§19) — caçada contínua
| Vetor | Status | Motivo pausa / gatilho retorno |
|---|---|---|
| — | — | a ser preenchido conforme fases avançam |
