# PLAN — Engagement cursosprepare.com

> Espelho do todowrite. Backlog de vetores, status, prioridades. Atualizado continuamente.

## Fases (§5)
| # | Fase | Especialista | Status | Notas |
|---|---|---|---|---|
| 1 | Escopo + estrutura | pentest | ✅ concluída | SCOPE.md criado |
| 2 | Recon passivo + OSINT | recon-passive (+osint) | ⏳ pendente | delegar |
| 3 | Recon ativo | recon-active | ⏳ pendente | |
| 4 | Consolidar attack surface (SUMMARY.md) | pentest | ⏳ pendente | ranking payoff §16 |
| 5 | Enumeração profunda | enum | ⏳ pendente | |
| 6 | Ataque webapp | webapp | ⏳ pendente | |
| 7 | CVE research + exploit | cve + exploit | ⏳ pendente | |
| 8 | Pós-exploração | postex | ⏳ pendente | se foothold |
| 9 | Relatório | report | ⏳ pendente | |

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
