# PLAN — cotec-fadenor.selecao.net.br

## Estado Atual
✅ **Fase 1: Escopo** — COMPLETA
✅ **Fase 2: Recon Passivo + OSINT** — COMPLETA
✅ **Fase 3: Recon Ativo** — COMPLETA
✅ **Fase 4: Consolidar Attack Surface** — COMPLETA
✅ **Fase 5: Enumeração Profunda** — COMPLETA
✅ **Fase 5b: Network Attack (MySQL)** — COMPLETA
✅ **Fase 6: Ataque Webapp** — COMPLETA (7 vulnerabilidades confirmadas)
✅ **Fase 7: CVE Research + Exploit** — COMPLETA (CVE-2021-3129 patched)
✅ **Fase 8: Pós-Exploração** — N/A (sem foothold)
✅ **Fase 9: Relatório Final** — COMPLETA
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