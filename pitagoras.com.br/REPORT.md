# Relatório de Pentest — Pitágoras (pitagoras.com.br)

**Cliente**: Pitágoras (Ânima Educação)
**Tipo**: Web/API — Externo black-box
**Início**: 2026-08-20
**Status**: EM ANDAMENTO

---

## Sumário Executivo

*Relatório incremental — atualizado a cada fase/finding.*

### Resumo de Findings

| Severidade | Quantidade | Descrição |
|-----------|-----------|-----------|
| Crítica | 0 | — |
| Alta | 0 | — |
| Média | 2 | Takeover candidates: parceria-uber (Unbounce), dev.blog (AWS ELB) |
| Baixa | 1 | Range legado 200.209.69.x exposto |
| Info | 5 | WordPress LP/blog, Adobe AEM, AEM Experience Cloud, O365 autodiscover, Mail2Easy EC2 |

### Acessos Obtidos
- Nenhum até o momento.

### Objetivos de Alto Valor Atingidos
- [ ] Acesso interno (foothold)
- [ ] Acesso administrativo (admin/RCE)
- [ ] Acesso financeiro (pagamentos/transações)
- [ ] Acesso a dados/PII (usuários/clientes)

---

## Findings Detalhados

### F-001 — Takeover candidate: parceria-uber (Unbounce)
**Severidade**: Média
**Alvo**: parceria-uber.pitagoras.com.br → fe3f50844f9247fdbaf76d638d58e5a3.unbouncepages.com
**Status**: Pendente verificação ativa — confirmar se conta Unbounce está ativa.
**Evidência**: CNAME apontando para unbouncepages.com (ativo 409 — recurso bloqueado).

### F-002 — Takeover candidate: dev.blog (AWS ELB)
**Severidade**: Média
**Alvo**: dev.blog.pitagoras.com.br → cogna-blogs-228897538.us-east-1.elb.amazonaws.com
**Status**: Pendente verificação — testar se ELB existe.
**Evidência**: CNAME apontando para ELB da AWS.

### F-003 — Range legado exposto (200.209.69.200-236)
**Severidade**: Baixa
**Alvo**: Vários hosts (www.ead, crm, exchange, metaframe, etc.) — sem rota atualmente
**Status**: Monitorar — possível rede interna/ex-provedor.

### Info — WordPress LP/Blog (lps/blog.pitagoras.com.br)
- WordPress 6.x + Elementor + WP Engine + Cloudflare
- Plugins: rate-my-post, advanced-ads, table-of-contents-plus, WP Rocket
- Superfície para wpscan e enumeração de CVEs.

### Info — Adobe AEM (rematricula.pitagoras.com.br)
- Adobe Experience Manager via Fastly CDN
- Alto valor: AEM histórico de CVEs (RCE, XXE, bypass).

### Info — Adobe Experience Cloud (data.*.pitagoras.com.br)
- data.notificacao, data.pos, data.financeiro — servidores "jag"
- Possível dados sensíveis.

### Info — Microsoft 365 (autodiscover.pitagoras.com.br)
- Autodiscover exposto no DNS
- Força bruta de creds possível.

### Info — Mail2Easy EC2 (d-*.pitagoras.com.br → 13.58.247.178)
- 4 subdomínios: d-iaap, d-krlk, d-mlmq, d-rbtc
- Servidor EC2 exposto, porta 80/443.

---

## Evidências
- `recon/passive/PASSIVE.md` — relatório completo de recon passivo
- `evidence/` — pendente (fases ativas)

## Timeline
- 2026-08-20T05:37:00Z — Início do engagement
- 2026-08-20T05:38:00Z — Recon passivo concluído — 58 subdomínios, 21 vivos, WordPress/AEM/CloudFront/O365 identificados