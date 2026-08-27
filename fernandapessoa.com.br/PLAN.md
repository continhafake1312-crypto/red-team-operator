# PLAN.md — fernandapessoa.com.br

> Backlog de fases e vetores. Atualizado a cada decisão do coordenador.

## Status das fases

| # | Fase | Especialista | Status | Entregável |
|---|------|--------------|--------|------------|
| 1 | Escopo | pentest | ✅ concluído | SCOPE.md |
| 2 | Recon passivo + OSINT | recon-passive | ✅ concluído | recon/passive/PASSIVE.md |
| 3 | Recon ativo | recon-active | ✅ concluído | recon/active/ACTIVE.md |
| 4 | Consolidar attack surface | pentest | ✅ concluído | recon/SUMMARY.md |
| 5 | Enumeração profunda | enum | 🏃 em andamento | enum/ |
| 6 | Ataque webapp | webapp | 🏃 em andamento | evidence/ |
| 7 | CVE + exploit | cve/exploit | 🏃 em andamento | exploit/ |
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
| 187.45.185.33 (WHM) | Cred-stuffing — **SEM WAF** 🚨 | 🔴 CRÍTICO | 🏃 webapp |
| 187.45.185.33 (cPanel:2083) | Cred-stuffing default creds (admin/admin, cpanel/cpanel) | 🔴 CRÍTICO | 🏃 webapp |
| 187.45.185.33 (Roundcube webmail) | CVEs Roundcube conhecidos + cred-stuffing | 🔴 CRÍTICO | 🏃 webapp/exploit |
| 187.45.185.33 (Exim 4.99.5:587) | CVE RCE research (Exim) | 🟡 ALTO | 🏃 cve |
| 187.45.185.33 (mail/envio: dir listing) | Content discovery em dir listing | 🔴 CRÍTICO | 🏃 enum |
| 177.44.191.252 (2000,5060) | SIP/VoIP appliance — CVEs | 🟡 ALTO | ⏳ pendente |
| 54.165.96.105 (Postfix+Dovecot) | SMTP relay test, CVE research | 🟡 MÉDIO | ⏳ pendente |
| app.fernandapessoa.com.br | Next.js _buildManifest route enum + API | 🟡 ALTO | ⏳ enum pendente |
| loja.fernandapessoa.com.br | WooCommerce 10.7 CVE scan + payment data | 🟡 ALTO | ⏳ pendente |
| fernandapessoa.com.br (principal) | WordPress 7.1 — CVE research | 🟡 ALTO | ⏳ pendente |
| github.com/fernandapessoa | trufflehog deep scan (creds em commits) | 🟡 MÉDIO | ⏳ pendente |

## Próxima ação
Delegar Fase 2 (recon passivo + OSINT) ao subagente `recon-passive`.
