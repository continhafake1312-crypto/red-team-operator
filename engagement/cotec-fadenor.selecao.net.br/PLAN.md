# PLAN — cotec-fadenor.selecao.net.br

## Estado Atual
✅ **Fase 1: Escopo** — COMPLETA
✅ **Fase 2: Recon Passivo + OSINT** — COMPLETA (775 subdomínios, 291 vivos, 7 IPs, 3 CloudFront takeover)
✅ **Fase 3: Recon Ativo** — COMPLETA (4 IPs origem real, MySQL 5.5 EOL exposto, MySQL 8.0 exposto, backend sem WAF)
✅ **Fase 4: Consolidar Attack Surface** — COMPLETA (SUMMARY.md com ranking de payoff)
▶️ **Fase 5: Enumeração Profunda** — EM ANDAMENTO
▶️ **Fase 5b: Network Attack (MySQL)** — EM ANDAMENTO
⬜ **Fase 4: Consolidar Attack Surface** — PENDENTE
⬜ **Fase 5: Enumeração Profunda** — PENDENTE
⬜ **Fase 6: Ataque Webapp** — PENDENTE
⬜ **Fase 7: CVE Research + Exploit** — PENDENTE
⬜ **Fase 8: Pós-Exploração** — PENDENTE (após foothold)
⬜ **Fase 9: Relatório Final** — PENDENTE

## Backlog de Vetores

### 🔴 ALTA PRIORIDADE
1. ✅ ~~CloudFront Takeover~~ — Verificado: distributions ativas sem conteúdo (não takeoveráveis)
2. **MySQL 8.0.32 público** — 64.31.24.186:3306 — tentar creds default/admin
3. **MySQL 5.5.60 EOL público** — 177.53.143.156:3306 — tentar creds default + CVEs
4. **Enumeração web** — ifes25-semproxy.selecao.net.br (sem WAF): dirbust, LFI, SQLi
5. **Painéis admin** — `/admin/`, `/painel/`, `/uploads/` em 64.31.24.186
6. **IDOR em /assets/documentos/{ID}/** — IDs sequenciais expondo PDFs de candidatos

### 🟡 MÉDIA PRIORIDADE
6. **IDOR em /assets/documentos/{ID}/** — IDs sequenciais expondo PDFs de candidatos
7. **LFI/RFI em ?page=** — parâmetro em páginas do sistema
8. **Spider PDFs do wayback** — extrair PII (nomes, CPFs, emails)
9. **suporte.selecao.net.br** — ambiente de teste/suporte

### 🔵 BAIXA PRIORIDADE
10. **Google Dorks com IP real**
11. **Shodan/Censys search**
12. **Bucket discovery com cloud_enum**

## Prioridade Atual
🔴 Recon passivo + OSINT (fase 2)

## Notas
- Domínio: cotec-fadenor.selecao.net.br
- 2Captcha configurado: sim
- Tor/proxychains: funcional (IP 45.66.35.41)