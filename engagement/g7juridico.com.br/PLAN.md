# PLAN — g7juridico.com.br

## Status Atual
- **Fase:** 1 — Escopo
- **Progresso:** 5%
- **Última atualização:** 2026-09-03T15:45:00Z
- **Objetivos:** Nenhum atingido ainda

## Vetores Prioritários (Ranking de Payoff)

| # | Vetor | Prioridade | Status | Resultado |
|---|-------|-----------|--------|-----------|
| 1 | Recon passivo + OSINT | 🔴 Crítica | ✅ Concluído | 12 subdomínios, IP real, n8n exposto, sem WAF, DMARC p=none |
| 2 | **n8n.g7juridico.com.br (CRÍTICO)** | 🔴 **CRÍTICO** | 🔄 Em andamento | n8n v2.33.5 exposto, /rest/settings vaza info, DigitalOcean, sem WAF. Webhook/CVE/brute-force em andamento |
| 3 | Recon ativo (portscan, fingerprint) | 🔴 Crítica | ✅ Concluído | 6 IPs scaneados. SVN+ProFTPD expostos em 191.6.196.7. Nagios NSCA em 138.197.78.17:8000. Custom PHP confirmado |
| 4 | **SVN (191.6.196.7:3690) - CRÍTICO** | 🔴 **CRÍTICO** | 🔄 Em andamento | Subversion exposto. Código fonte/credenciais potencialmente acessíveis |
| 5 | **ProFTPD (191.6.196.7:21) - ALTO** | 🟡 **ALTO** | 🔄 Em andamento | FTP exposto. Anonymous login potencial |
| 6 | homologacao.g7juridico.com.br (ALTO) | 🟡 Alto | 🔲 Pendente | Staging exposto, sem WAF, clone da produção |
| 7 | www.g7juridico.com.br - Custom PHP | 🟡 Alto | 🔲 Pendente | Custom PHP (NÃO WordPress). /area-do-aluno/, /login-cadastro. WAF provável (mod_security) |
| 8 | Enumeração web profunda | 🟡 Alta | 🔄 Em andamento | Content discovery, JS, API, parâmetros (www+homologação) |
| 9 | Ataque webapp (auth, IDOR, injeção) | 🟡 Alta | 🔲 Pendente | — |
| 10 | CVE research (n8n v2.33.5) | 🔴 Crítica | 🔄 Em andamento | — |
| 11 | Exploit validation | 🟡 Média | 🔲 Pendente | — |
| 12 | Pós-exploração (se foothold) | 🟢 Baixa | 🔲 Pendente | — |

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