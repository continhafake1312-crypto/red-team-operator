# PLAN.md — fernandapessoa.com.br

> Backlog de fases e vetores. Atualizado a cada decisão do coordenador.

## Status das fases

| # | Fase | Especialista | Status | Entregável |
|---|------|--------------|--------|------------|
| 1 | Escopo | pentest | ✅ concluído | SCOPE.md |
| 2 | Recon passivo + OSINT | recon-passive | ✅ concluído | recon/passive/PASSIVE.md |
| 3 | Recon ativo | recon-active | 🏃 em andamento | recon/active/ACTIVE.md |
| 4 | Consolidar attack surface | pentest | ⏳ pendente | recon/SUMMARY.md |
| 5 | Enumeração profunda | enum | ⏳ pendente | enum/ |
| 6 | Ataque webapp | webapp | ⏳ pendente | evidence/ |
| 7 | CVE + exploit | cve/exploit | ⏳ pendente | exploit/ |
| 8 | Pós-ex (se foothold) | postex | ⏳ condicional | loot/ |
| 9 | Relatório | report | ⏳ pendente | REPORT.md |

## Backlog de vetores (§19)

> Caçada contínua — se um vetor falha, caça outro. Mantém motivo da
> pausa + gatilho de retorno.

| Vetor | Host/Alvo | Status | Nota |
|-------|-----------|--------|------|
| (a definir após recon) | — | — | — |

## Ranking de payoff (§16) — atualizado após recon

> ALTO = caminho direto para objetivo de alto valor
> MÉDIO = info disclosure / postura / pivot
> BAIXO = info menor

| Host/Serviço | Vetor | Payoff | Status |
|--------------|-------|--------|--------|
| 187.45.185.33 (cPanel/WHM/Webmail) | Cred-stuffing (default creds, admin/admin) | 🔴 CRÍTICO | Pendente (recon ativo) |
| 187.45.185.33 (mail/envio) | Content discovery em dir listing | 🔴 CRÍTICO | Pendente (recon ativo) |
| 177.44.191.252 (wpp) | Apache/PHP Windows — CVE research + enum | 🔴 CRÍTICO | Pendente (recon ativo) |
| app.fernandapessoa.com.br | Next.js _buildManifest route enum + API | 🟡 ALTO | Pendente |
| loja.fernandapessoa.com.br | WooCommerce 10.7 CVE scan + payment data | 🟡 ALTO | Pendente |
| fernandapessoa.com.br (principal) | WordPress 7.1 — CVE research (vulns conhecidos) | 🟡 ALTO | Pendente |
| 54.165.96.105 (smtp01) | Port scan + SMTP enum | 🟡 MÉDIO | Pendente |
| mautic.fernandapessoa.com.br | Mautic CVE research (503 = CVE candidate) | 🟡 MÉDIO | Pendente |
| github.com/fernandapessoa | trufflehog deep scan (creds em commits) | 🟡 MÉDIO | Pendente |
| portal.fernandapessoa.com.br | Phusion Passenger 6.0.27 version check + CVE | 🟢 BAIXO | Pendente |

## Próxima ação
Delegar Fase 2 (recon passivo + OSINT) ao subagente `recon-passive`.
