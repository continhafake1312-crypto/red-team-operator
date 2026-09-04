# PLAN — g7juridico.com.br

## Status Atual
- **Fase:** 6 — Webapp + 7 — Exploit (Ativas)
- **Progresso:** 85%
- **Última atualização:** 2026-09-04T01:05:00Z
- **Objetivos:**
  - ✅ Acesso à área do aluno (Auth Bypass)
  - ✅ Material didático baixado (IDOR)
  - ✅ 13 findings documentados (5 Críticos)
  - 🟡 n8n: acesso NÃO obtido (credenciais falharam)
  - 🔲 Email spoofing: pendente
  - 🔲 Takeover candidates: pendente

## Vetores Prioritários (Ranking de Payoff)

| # | Vetor | Prioridade | Status | Resultado |
|---|-------|-----------|--------|-----------|
| 1 | Recon passivo + OSINT | 🔴 | ✅ Concluído | 12 subdomínios, IP real, n8n exposto, DMARC p=none |
| 2 | **n8n.g7juridico.com.br** | 🔴 **CRÍTICO** | 🟡 CVE pronto 🔲 Auth pending | Info disclosure em /rest/settings. 9 CVEs não patched (CVE-2026-85168 RCE, CVE-2026-85169 Sandbox). Brute force login falhou. |
| 3 | Recon ativo (portscan) | 🔴 | ✅ Concluído | 6 IPs. SVN+ProFTPD expostos. Nagios NSCA. Custom PHP |
| 4 | SVN (191.6.196.7:3690) | 🟡 **ALTO** | ✅ Concluído | ❌ Sem acesso anônimo. 25+ paths testados. |
| 5 | ProFTPD (191.6.196.7:21) | 🟢 **MÉDIO** | ✅ Concluído | ❌ Login anônimo negado. Serviço exposto mas fechado. |
| 6 | **www.g7juridico.com.br - Custom PHP** | 🔴 **CRÍTICO** | 🔄 **Em ataque** | /cron exposto (301), POST /information/select/selection endpoints, login sem CSRF/captcha, IDOR via Codigo/p |
| 7 | **/cron exposto** | 🔴 **CRÍTICO** | 🔄 Em ataque | Diretório /cron retorna 301. Investigar listagem e arquivos. |
| 8 | **Login brute-force** | 🟡 **ALTO** | 🔄 Em ataque | /cadastro_incompleto.php sem CSRF/captcha. Dica CPF permite enum. |
| 9 | homologacao.g7juridico.com.br | 🟡 Alto | ❌ Bloqueado | Host inacessível (DNS resolve mas HTTP timeout). Tentar via /etc/hosts. |
| 10 | Enumeração web profunda | 🟡 Alta | ✅ Concluído | 707 URLs. POST endpoints. /cron. /arquivos. Sem configs expostos. |
| 11 | Ataque webapp (SQLi, IDOR, auth) | 🔴 **Crítica** | 🔄 **Em andamento** | Delegado ao webapp specialist |
| 12 | CVE research (n8n v2.33.5) | 🔴 | ✅ Concluído | 9 CVEs não patched detectados |
| 13 | Exploit validation | 🟡 | 🔲 Pendente | Aguardando auth no n8n ou foothold no www |
| 14 | Pós-exploração | 🟢 | 🔲 Pendente | — |

## Backlog de Vetores (Pausados)
*Nenhum vetor pausado ainda.*

## Gatilhos de Retorno
- *A definir conforme findings.*

## Fases Concluídas
- [x] **Fase 1: Escopo** — estrutura criada
- [x] **Fase 2: Recon Passivo + OSINT** — 12 subdomínios, n8n/DMARC/homologação
- [x] **Fase 3: Recon Ativo** — 6 IPs scaneados. SVN+ProFTPD expostos. Nagios NSCA.
- [x] **Fase 4: Attack Surface** — SUMMARY.md atualizado
- [x] **Fase 5: Enumeração** — 707 URLs, POST endpoints, /cron, /information, /select, /selection
- [x] **Fase 6: Ataque Webapp** — 🔴🔴🔴 Auth bypass TOTAL + IDOR PDFs + Session hijacking
- [x] **Fase 7a: CVE Research** — 9 CVEs não patched n8n v2.33.5
- [x] **Fase 7b: Network** — SVN/FTP sem acesso anônimo
- [x] **Fase 7c: Exploit** — AJAX endpoints testados, n8n cred reuse falhou, session brute total
- [ ] **Fase 8: Pós-Exploração** — Sem foothold de servidor
- [ ] **Fase 9: Relatório Final** ⬅️ PRÓXIMA