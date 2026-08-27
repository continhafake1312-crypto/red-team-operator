# PLAN.md — centraldeconcursos.com.br

> Espelho do todowrite. Backlog de fases, especialistas e vetores.

## Fases (§5)

| # | Fase | Especialista | Status | Entregável |
|---|------|--------------|--------|------------|
| 1 | Escopo + estrutura | pentest | ✅ concluída | SCOPE.md, pastas |
| 2 | Recon passivo + OSINT | recon-passive (+osint) | ✅ concluída | recon/passive/PASSIVE.md |
| 3 | Recon ativo | recon-active | ✅ concluída | recon/active/ACTIVE.md |
| 4 | Consolidar attack surface | pentest | ✅ concluída | recon/SUMMARY.md |
| 5 | Enumeração profunda | enum | ✅ concluída | enum/ENUM.md (24 endpoints /api/v1/) |
| 6 | Ataque webapp | webapp | ✅ concluída | F-006 a F-013 (+F-010 negativo) |
| 7 | CVE research + exploit | cve + exploit | ✅ concluída | exploit/cve_research.md + F-014/F-015(neg)/F-016(neg) |
| 8 | Pós-exploração (se foothold) | postex | ⏭️ N/A | sem foothold — pulada |
| 9 | Relatório final | report | ✅ concluída | REPORT.md final (681 linhas) |

## Ranking de payoff (§16) — atualizado após cada fase

| Payoff | Vetor | Host | Status | Notas |
|--------|-------|------|--------|-------|
| ALTO | API multi-tenant: IDOR/BOLA cross-tenant + /health info disclosure | api.centraldeconcursos.com.br (Render+CF) | pendente | testar contexto Degrau (Host header/tenant param) |
| ALTO | Exchange OWA on-prem exposto: cred-stuffing + ProxyShell/ProxyNotShell | webmail/mail/pda/pop.* → /owa/ | pendente | descobrir IP real (bypass CF) + fingerprint versão |
| ALTO | Seducar Vercel apps: auth bypass + _buildManifest.js rotas + staging vaza nuxt.config | crm/crm-hml/dashboard/homolog/staging.* | pendente | cross-tenant appDomain=homolog.degraucultural |
| ALTO | App Nuxt principal + legado ASP (admin/carrinho/aluno) | centraldeconcursos.com.br apex | pendente | /SCCAdmin/, /Carrinho/, /ar/, /usuario/ |
| ALTO | Cross-tenant Seducar (concursos→degraucultural) | concursos.* | pendente | validar isolamento de tenant no backend |
| MÉDIO | Seducar questões/pagamento (Vercel Nuxt) | questoes/pagamento.* | pendente | IDOR, param mining |
| MÉDIO | demo.* 500 Server Error | demo.* | pendente | stack trace / info disclosure |
| MÉDIO | Cloud buckets (4 GCP + 2 Azure) privados | cdc* / concursos buckets | pendente | object-level misconfig / signed URL |
| MÉDIO | Cred-stuffing 7 emails (OWA + CRM) | webmail/CRM Seducar | pendente | DMARC p=none spoofable |
| BAIXO | cenimage/cenlink/censpf/landingpage (dnzdns) | dnzdns privado | pendente | baixo payoff |
| BAIXO | *.email.* (Salesforce MC/Akamai) | terceiro | fora escopo | apenas fingerprint |
| BAIXO | gtm/load.gtm (Stape.io/GTM Server) | terceiro | pendente | pode vazar containers |

## Backlog de vetores (§19) — matriz de fallback

| Vetor | Status | Motivo da pausa | Gatilho de retorno |
|-------|--------|-----------------|--------------------|
| (preencher conforme fases avançam) | | | |

## Decisões do coordenador
- 2026-08-27T03:23Z — Engagement iniciado. Tor OK (IP saída
  185.220.101.110). Chave 2Captcha em ~/.config/opencode/.2captcha_key.
  Próximo: delegar Fase 2 (recon passivo + OSINT).
