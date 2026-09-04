# PLAN — g7juridico.com.br

## Status Atual
- **Fase:** 1 — Escopo
- **Progresso:** 5%
- **Última atualização:** 2026-09-03T15:45:00Z
- **Objetivos:** Nenhum atingido ainda

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
- [x] **Fase 2: Recon Passivo + OSINT** — 12 subdomínios, n8n/DMARC/homologação críticos
- [x] **Fase 3: Recon Ativo** — 6 IPs scaneados. SVN+ProFTPD expostos. Custom PHP confirmado
- [x] **Fase 4: Consolidar Attack Surface** — SUMMARY.md atualizado com ranking de payoff
- [ ] **Fase 5: Enumeração Profunda** 🟡 Delegado a enum (www + homologação)
- [ ] **Fase 6: Ataque Webapp** 🔲 Aguardando enum
- [ ] **Fase 7: CVE Research + Exploit** 🔴 n8n cve delegado / SVN+FTP delegado a network
- [ ] **Fase 8: Pós-Exploração**
- [ ] **Fase 9: Relatório Final**