# PLAN.md — cfcdigitaloficial.com.br

## Status Atual
- **Fase:** 3/9 — Recon Ativo (EM ANDAMENTO) + CVE Research (EM ANDAMENTO) + Subdomain Takeover (EM ANDAMENTO)
- **Progresso:** ✅ Fase 1 (Escopo) -> ✅ Fase 2 (Recon Passivo + OSINT) -> 🔄 Fase 3 (Recon Ativo) -> 🔄 Fase 4 (CVE Research)

## Ranking de Payoff (Atualizado)

| # | Vetor | Prioridade | Status | Payoff Esperado |
|---|-------|-----------|--------|----------------|
| 1 | **Subdomain Takeover** — pixel.cfcdigitaloficial.com.br (CNAME→pixel.hotmart.com NXDOMAIN) | 🔴 **CRÍTICA** | ⏳ Em análise | Takeover completo, phishing/SEO/malware |
| 2 | **File Manager Advanced** — plugin WP com histórico de RCE/LFI | 🔴 **CRÍTICA** | ⏳ Em pesquisa | RCE não autenticado, acesso shell |
| 3 | **Elementor Form Submissions** — POST data de formulários expostos | 🔴 **ALTA** | ⏳ Em pesquisa | PII de clientes, dados financeiros |
| 4 | **Elementor + Elementor Pro** — CVEs conhecidos (XSS, IDOR, upload) | 🔴 **ALTA** | ⏳ Em pesquisa | Acesso admin, XSS persistente |
| 5 | **LiteSpeed Cache** — CVEs de bypass/auth disclosure | 🟡 **MÉDIA** | ⏳ Em pesquisa | Bypass de segurança, info leak |
| 6 | **MetForm** — Upload de arquivos potencial | 🟡 **MÉDIA** | ⏳ Em pesquisa | RCE via upload, info disclosure |
| 7 | **WordPress REST API** (346 rotas) — Enumeração massiva | 🟡 **MÉDIA** | ✅ Completo | Mapeamento de attack surface |
| 8 | **stape.cfcdigitaloficial.com.br** — GTM Server-Side no GCP | 🟡 **MÉDIA** | ⏳ Em análise | Info disclosure / metrics |
| 9 | **Email Spoofing** — DMARC p=none, SPF ~all | 🟢 **BAIXA** | ✅ Confirmado | Phishing plausível |
| 10 | **WHOIS pessoal** — Rafael Felipe, cfcdigital@outlook.com.br | 🟢 **BAIXA** | ✅ Confirmado | Social engineering |
| 11 | **HostGator direct IP** — 108.179.241.231 sem CDN | 🟢 **BAIXA** | ⏳ Em análise | Acesso direto, vhost discovery |
| 12 | **Wordfence** — scan issues endpoint exposto | 🟢 **BAIXA** | ⏳ Em pesquisa | Info disclosure |

## Backlog de Vetores

### Ativos
| # | Vetor | Prioridade | Status | Observação |
|---|-------|-----------|--------|------------|
| V1 | Recon Ativo (portscan, nmap, wafw00f, vhosts) | 🔴 Alta | 🔄 Subagente general-2 | |
| V2 | CVE Research (File Manager, Elementor, LiteSpeed) | 🔴 Alta | 🔄 Subagente general-4 | |
| V3 | Subdomain Takeover pixel.cfcdigitaloficial.com.br | 🔴 Alta | 🔄 Subagente general-3 | |
| V4 | Exploitation (assim que CVEs forem confirmados) | 🔴 Alta | ⏳ Aguardando CVE research | |
| V5 | Content Discovery + JS endpoints | 🟡 Média | ⏳ Após recon ativo | |
| V6 | Brute force wp-admin | 🟡 Média | ⏳ Após recon ativo | |
| V7 | SQLi nos formulários | 🟡 Média | ⏳ Após content discovery | |

### Completos
| # | Vetor | Resultado | Data |
|---|-------|-----------|------|
| Escopo | Criação SCOPE.md + estrutura | Concluído | 2026-09-13 |
| Recon Passivo | DNS, subdomínios, OSINT, WAYBACK, Cloud | 6 subdomínios, WP 7.1, Elementor, 346 rotas REST | 2026-09-13 |
| REST API Map | 346 rotas mapeadas, 20+ namespaces | File Manager Advanced, Elementor, MetForm, etc. | 2026-09-13 |

### Pausados
| # | Vetor | Motivo | Gatilho de Retorno |
|---|-------|--------|-------------------|
| — | — | — | — |

## Ordem de Execução Planejada
1. ✅ Escopo (SCOPE.md + estrutura)
2. ✅ Recon Passivo + OSINT
3. 🔄 Recon Ativo (portscan, vhosts, WAF, CMS enum)
4. 🔄 CVE Research (File Manager, Elementor, LiteSpeed, MetForm)
5. 🔄 Subdomain Takeover + stape GTM check
6. ⏳ Consolidar Attack Surface (recon/SUMMARY.md)
7. ⏳ Enumeração Profunda (content discovery, JS)
8. ⏳ Ataque Webapp (SQLi, IDOR, XSS, uploads)
9. ⏳ Exploit (PoC validação)
10. ⏳ Pós-Exploração (se foothold)
11. ⏳ Screenshots (evidências visuais)
12. ⏳ Relatório Final