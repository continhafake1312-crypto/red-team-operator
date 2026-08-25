# PLAN — cotec-fadenor.selecao.net.br

## Estado Atual
✅ **Fase 1: Escopo** — COMPLETA
✅ **Fase 2: Recon Passivo + OSINT** — COMPLETA (775 subdomínios, 291 vivos, 7 IPs, 3 CloudFront takeover)
▶️ **Fase 3: Recon Ativo** — EM ANDAMENTO
⬜ **Fase 4: Consolidar Attack Surface** — PENDENTE
⬜ **Fase 5: Enumeração Profunda** — PENDENTE
⬜ **Fase 6: Ataque Webapp** — PENDENTE
⬜ **Fase 7: CVE Research + Exploit** — PENDENTE
⬜ **Fase 8: Pós-Exploração** — PENDENTE (após foothold)
⬜ **Fase 9: Relatório Final** — PENDENTE

## Backlog de Vetores

### 🔴 ALTA PRIORIDADE
1. **CloudFront Takeover** — 3 distribuições sem resposta: `d1z8y3jujvsfs0.cloudfront.net`, `d1pbfbzf0n5t4w.cloudfront.net`, `dz77ct0klqxpz.cloudfront.net`
2. **Apache 2.4.41 CVE scan** — IP 64.31.24.186 (backend ProSeleta), CVEs: CVE-2021-41773, CVE-2021-42013, path traversal
3. **Bypass Cloudflare** — via `ifes25-semproxy.selecao.net.br` direto ao backend 64.31.24.186
4. **Proxy scan** — IPs 177.53.143.156 e 177.71.249.114 (proxies de autenticação)
5. **anteriores.cotec.fadenor.com.br** (143.244.178.136) — VPS Vultr, fora Cloudflare

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