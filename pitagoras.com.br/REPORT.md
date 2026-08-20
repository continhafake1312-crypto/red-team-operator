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
| Alta | 3 | CMS/plugins expostos: WordPress + Elementor (lps/blog), Adobe AEM (rematricula) |
| Média | 7 | Takeover candidates (parceria-uber/dev.blog), Golang server EC2, O365 autodiscover, AEM Experience Cloud, AWS ELB redirect, Mail2Easy |
| Baixa | 1 | Range legado 200.209.69.x |
| Info | 5 | TLS cert SANs (+50 domínios Ânima), WAF map, Akamai redirect, WP Engine infra |

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
**Status**: Vulnerabilidade parcial — página Unbounce deletada (404), Cloudflare na frente
**Evidência**: enum/cloud/evidence/C-005.txt

### F-002 — Takeover CONFIRMADO: dev.blog (AWS ELB) 🔴
**Severidade**: Alta
**Alvo**: dev.blog.pitagoras.com.br → cogna-blogs-228897537.us-east-1.elb.amazonaws.com
**Status**: **CONFIRMADO** — ELB não existe (NXDOMAIN)
**Evidência**: enum/cloud/evidence/C-004.txt
**Impacto**: Atacante pode registrar ELB com mesmo nome e hijack do subdomínio

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

### F-005 — CloudFront + S3 consultores.pitagoras.com.br (INFO)
- Landing page system pública (200 OK) via CloudFront
- Bucket privado descoberto: gestao-lp-sp-assets-1f0f2b2a1e.s3.sa-east-1.amazonaws.com
- API Gateway: xqnjjuz66h.execute-api.sa-east-1.amazonaws.com (Policoders)
- Evidência: enum/cloud/evidence/C-001.txt, C-003.txt

### F-006 — CloudFront CDN subdomínios (INFO)
- cdn.pos, cdn.financeiro, cdn.notificacao — 403 Forbidden (S3 privados)
- 3 distribuições CloudFront mapeadas
- Evidência: enum/cloud/evidence/C-002.txt

---

## Evidências
- `recon/passive/PASSIVE.md` — relatório completo de recon passivo
- `recon/active/ACTIVE.md` — relatório de recon ativo
- `enum/cloud/CLOUD.md` — relatório de enumeração cloud
- `enum/cloud/evidence/C-001.txt` a `C-006.txt` — evidências cloud

## Timeline
- 2026-08-20T05:37:00Z — Início do engagement
- 2026-08-20T05:38:00Z — Recon passivo concluído — 58 subdomínios, 21 vivos, WordPress/AEM/CloudFront/O365 identificados
- 2026-08-20T05:55:00Z — Recon ativo concluído — Portscan em 4 ranges, AWS ELB, Golang, WP Engine, Akamai, Cloudflare. TLS cert SANs revelam +50 domínios Ânima Educação.
- 2026-08-20T06:XX:00Z — Cloud enum concluída — dev.blog takeover CONFIRMADO, parceria-uber parcial, 4 CloudFront ID mapeados