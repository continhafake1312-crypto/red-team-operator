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
| 2 | **n8n.g7juridico.com.br (CRÍTICO)** | 🔴 **CRÍTICO** | 🔄 Em andamento | n8n v2.33.5 exposto, DigitalOcean, sem WAF. Alvo prioritário! |
| 3 | Recon ativo (portscan, fingerprint) | 🔴 Crítica | 🔄 Em andamento | 6 IPs únicos para scan |
| 4 | homologacao.g7juridico.com.br (ALTO) | 🟡 Alto | 🔲 Pendente | Staging exposto, mesmo IP da produção |
| 5 | WordPress (www) - WPScan + enum | 🟡 Alto | 🔲 Pendente | Apache/2.4.29, sem WAF, IP real exposto |
| 6 | Enumeração web profunda | 🟡 Alta | 🔲 Pendente | Content discovery, JS, API, CMS |
| 7 | Ataque webapp (auth, IDOR, injeção) | 🟡 Alta | 🔲 Pendente | — |
| 8 | CVE research | 🟢 Média | 🔲 Pendente | — |
| 9 | Exploit validation | 🟢 Média | 🔲 Pendente | — |
| 10 | Pós-exploração (se foothold) | 🟢 Baixa | 🔲 Pendente | — |

## Backlog de Vetores (Pausados)
*Nenhum vetor pausado ainda.*

## Gatilhos de Retorno
- *A definir conforme findings.*

## Fases Concluídas
- [x] **Fase 1: Escopo** — estrutura criada
- [x] **Fase 2: Recon Passivo + OSINT** — 12 subdomínios, n8n/DMARC/homologação críticos
- [ ] **Fase 3: Recon Ativo** ⬅️ PRÓXIMA
- [ ] **Fase 4: Consolidar Attack Surface** — SUMMARY.md criado
- [ ] **Fase 5: Enumeração Profunda**
- [ ] **Fase 6: Ataque Webapp**
- [ ] **Fase 7: CVE Research + Exploit**
- [ ] **Fase 8: Pós-Exploração**
- [ ] **Fase 9: Relatório Final**