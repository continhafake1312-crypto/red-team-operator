# PASSIVE RECONNAISSANCE REPORT — pitagoras.com.br

**Data**: 2026-08-20  
**Alvo**: Pitágoras (Rede de Ensino) — Grupo Ânima Educação / Kroton  
**Domínio**: pitagoras.com.br  
**Owner**: EDITORA E DISTRIBUIDORA EDUCACIONAL S/A (CNPJ 38.733.648/0001-40)  
**Contato**: tiadm@kroton.com.br  
**Criação**: 1996-11-12 | **Expira**: 2033-11-12  

---

## 1. DNS SUMMARY

| Record | Value |
|--------|-------|
| **A** | 76.223.91.9 (Fastly CDN) |
| **CNAME www** | cogna.edgekey.net → e215064.dscb.akamaiedge.net (Akamai) |
| **NS** | Azure DNS: ns1-06.azure-dns.com, ns2-06.azure-dns.net, ns3-06.azure-dns.org, ns4-06.azure-dns.info |
| **MX** | Proofpoint/FireEye: primary.us.email.fireeyecloud.com + alt1/2/3 |
| **SPF** | includes spf.protection.outlook.com (O365), sparkpostmail.com, a:d.spf.service-now.com |
| **DMARC** | Nenhum registro DMARC explícito encontrado |
| **SOA** | ns1-06.azure-dns.com tiadm.kroton.com.br 2020012400 |
| **AXFR** | Bloqueado em todos os 4 NS (Azure) |
| **Emails / DKIM** | Múltiplos verificadores: Google, Facebook, Atlassian, Miro, Microsoft |

### Provedores de e-mail
- **Microsoft 365** (via spf.protection.outlook.com + MS=ms59552020)
- **SparkPost** (via sparkpostmail.com)
- **ServiceNow** (a:d.spf.service-now.com)
- **Proofpoint/FireEye** (MX primário)

---

## 2. SUBDOMÍNIOS

**Total**: 58 subdomínios únicos (fontes: subfinder, assetfinder, amass + theHarvester)

### 2.1 Resolvedores — 34/58 resolvidos, 21 vivos (HTTP probe)

#### Live hosts (HTTP 200):
| Host | Status | Tech | IP/CDN |
|------|--------|------|--------|
| **lps.pitagoras.com.br** | 200 OK | WordPress 6.x, Elementor 4.1.3, WP Engine, Cloudflare, jQuery 3.7.1 | 141.193.213.10/11 |
| **blog.pitagoras.com.br** | 200 OK | WordPress 6.x, Elementor 3.35.7, WP Rocket 3.21.1, WP Engine, Cloudflare, jQuery 3.4.1 | 141.193.213.10/11 |
| **rematricula.pitagoras.com.br** | 200 OK | Adobe AEM (Fastly), jQuery 3.7.1 | 151.101.3.10 (Fastly) |
| **consultores.pitagoras.com.br** | 200 OK | AWS CloudFront + S3 | 13.227.110.123 |
| **data.notificacao.pitagoras.com.br** | 200 OK | Adobe Experience Cloud (jag server) | 63.140.39.x |
| **data.pos.pitagoras.com.br** | 200 OK | Adobe Experience Cloud (jag server) | 63.140.39.x |
| **data.financeiro.pitagoras.com.br** | 200 OK | Adobe Experience Cloud (jag server) | 63.140.39.x |

#### Redirecionamentos / Parcialmente acessíveis:
| Host | Status | Observação |
|------|--------|------------|
| www.pitagoras.com.br | 403 | Akamai (cogna.edgekey.net) — Access Denied |
| www.blog.pitagoras.com.br | 301 → blog.pitagoras.com.br | WP Engine |
| www.lps.pitagoras.com.br | 301 → lps.pitagoras.com.br | WP Engine |
| lp.pitagoras.com.br | 404 | Cloudflare |
| parceria-uber.pitagoras.com.br | 409 | Cloudflare — Unbounce page |
| cdn.*.pitagoras.com.br (4 hosts) | 403 | CloudFront + S3 (acesso negado) |
| node.pitagoras.com.br | 403 | Unknown (possivelmente Node.js via ELB) |
| d-*.pitagoras.com.br (4 hosts) | 404 | Mail2Easy (IP 13.58.247.178) |

#### Inalcançáveis (No route to host):
- `200.209.69.x` range: www.ead, www.ua, www.legado, metaframe, crm, exchange, www.fapnew, www.uberlandia, teste.portalonline.ua, pedidosweb, www.ged, www.videoteca, pos — **Rede legado/protegida (possível rede interna/ex-Correio?)**

---

## 3. TECH STACK

### Infraestrutura CDN/Cloud
| Provedor | Hosts |
|----------|-------|
| **Akamai** | www.pitagoras.com.br (cogna.edgekey.net → e215064.dscb.akamaiedge.net) |
| **Fastly** | rematricula.pitagoras.com.br, pitagoras.com.br (A record) |
| **CloudFront** (AWS) | cdn.pos, cdn.financeiro, cdn.notificacao, consultores |
| **Cloudflare** | lps, blog, lp, parceria-uber, www.blog, www.lps |
| **Azure DNS** | Nameservers oficiais |

### CMS / Frameworks
| App | Host | Detalhes |
|-----|------|----------|
| **WordPress** | lps.pitagoras.com.br | Elementor 4.1.3, WP Engine, WP Rocket (blog), plugins: genesis-blocks, elementor, page-scroll-to-id, rate-my-post, table-of-contents-plus, advanced-ads |
| **WordPress** | blog.pitagoras.com.br | Elementor 3.35.7, WP Engine, WP Rocket 3.21.1 |
| **Adobe AEM** | rematricula.pitagoras.com.br | Adobe Experience Manager via Fastly CDN |
| **Adobe Experience Cloud** | data.*.pitagoras.com.br | Servidor "jag" — Adobe Data Services/Adobe CDN |
| **SparkPost** | materiais.pitagoras.com.br | PostClick Marketing Platform |
| **Unbounce** | parceria-uber.pitagoras.com.br | Landing page builder |
| **Mail2Easy** | d-*.pitagoras.com.br | Serviço de e-mail marketing (4 subdomínios, EC2 13.58.247.178) |

### Infraestrutura legada (possível ativo interno)
- Range **200.209.69.200-236** — vários hosts sem rota pública (possível ASN brasileiro, rede interna)

---

## 4. OSINT

### Emails
- Nenhum email público encontrado via theHarvester (sem API keys para maioria das fontes)
- Email de contato WHOIS: `tiadm@kroton.com.br`

### Hosts adicionais encontrados
- `autodiscover.pitagoras.com.br` → aponta para Microsoft 365 (autodiscover.outlook.com)
- `videoteca.pitagoras.com.br` → 186.202.11.97 (Brasil, AS possible)
- `wwws.pitagoras.com.br` — possivelmente um erro de digitação ou staging
- `blogi.pitagoras.com.br` — variante do blog
- Variações com typos: `consultoresy`, `academia-tech2`, `d-appu`, `matriculasg`, `metaframenewr`, `parceria-uberr`

### Verificações de terceiros
- **Google** (FQoh3Mw... + pM0D5uK2...)
- **Facebook** (1b10ekmxvtr...)
- **Atlassian** (4mlsoPWj...)
- **Miro** (d6f16a502fea...)
- **Microsoft 365** (MS=ms59552020)

---

## 5. CLOUD BUCKETS

| Bucket | Resultado |
|--------|-----------|
| pitagoras.s3.amazonaws.com | Sem acesso |
| pitagoras-*.s3.amazonaws.com | Sem resposta |
| pitagoras.blob.core.windows.net | Sem resposta |

**Nenhum bucket público encontrado**. Buckets CloudFront estão restritos (403).

---

## 6. TAKEOVER CANDIDATES

| Host | CNAME | Risco | Nota |
|------|-------|-------|------|
| **parceria-uber.pitagoras.com.br** | `fe3f50844f9247fdbaf76d638d58e5a3.unbouncepages.com` | **MÉDIO** | Unbounce — se conta cancelada, takeover possível. Ativo (409 Cloudflare) |
| **dev.blog.pitagoras.com.br** | `cogna-blogs-228897537.us-east-1.elb.amazonaws.com` | **MÉDIO** | AWS ELB — verificar se o ELB ainda existe |
| **materiais.pitagoras.com.br** | `kroton.postclickmarketing.com` | **BAIXO** | SparkPost/PostClick — ativo (404) |
| **cdn.*.pitagoras.com.br** | CloudFront → S3 | **BAIXO** | S3 retorna 403 (não 404) — bucket ainda existe |
| **lps/blog** (wp.wpenginepowered.com) | WP Engine | **BAIXO** | WP Engine ativo |
| **d-*.pitagoras.com.br** | mail2easy.com.br | **BAIXO** | Mail2Easy ativo (404) |

---

## 7. WAYBACK MACHINE

- **Status**: Apenas 15 URLs arquivadas (páginas principais apenas)
- **Sem endpoints sensíveis** encontrados (admin, api, login, etc.)
- **Cobertura limitada** — Wayback Machine não tem histórico significativo do domínio
- **Sugestão**: tentar Archive.is / outros crawlers na fase ativa

---

## 8. LIMITAÇÕES

1. **theHarvester** sem API keys para SecurityScorecard, BuiltWith, Shodan, Censys — muitas fontes não consultadas
2. **crt.sh** retornou vazio (incomum) — pode ser rate limit ou bloqueio. Repetir na fase ativa
3. **Wayback Machine** sem cobertura significativa
4. A maioria dos subdomínios legados (200.209.69.x) estão inacessíveis — podem ser internos ou desativados
5. **Sem chave Shodan/Censys** — não foi possível fazer varredura complementar
6. Sem DMARC explícito (SPF ~all, mas sem proteção DMARC)

---

## 9. ACHADOS DE ALTO VALOR

1. **WordPress + Elementor** (lps, blog) — Superfície de ataque clássica: plugins (rate-my-post, advanced-ads, table-of-contents-plus) podem ter CVEs
2. **Adobe AEM** (rematricula) — AEM é notoriamente complexo e com histórico de CVEs (RCE, XXE, ACL bypass)
3. **Adobe Experience Cloud** (data.*) — Serviço de dados da Adobe
4. **CloudFront com S3** — verificar configuração de permissões (403 vs 404)
5. **Mail2Easy** (EC2) — 4 subdomínios num único servidor 13.58.247.178
6. **Autodiscover O365** — sem proteção extra contra ataques de força bruta
7. **Range 200.209.69.x** — possível rede interna exposta

---

## 10. PRÓXIMOS PASSOS RECOMENDADOS

1. **Recon ativo**: nmap/masscan nos ranges identificados (76.223.91.9, 13.58.247.178, 141.193.213.10/11, 200.209.69.200-240, 63.140.39.x)
2. **Força bruta de subdomínios** com wordlists maiores (SecLists) + DNS brute force
3. **Verificar WAF** com wafw00f (Cloudflare detectado + Akamai Kona)
4. **Scan WordPress** com wpscan em lps/blog
5. **Adobe AEM** — enumerar endpoints AEM (crx/packmgr, etc.)
6. **CloudFront/S3** — testar bucket enumeration com nomes derivados
7. **Re-avaliar takeover** — testar registro de parceria-uber no Unbounce
8. **Analisar JS** dos sites vivos em busca de endpoints/api keys