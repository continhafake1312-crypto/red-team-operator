# Attack Surface Summary — pitagoras.com.br

**Data**: 2026-08-20  
**Cliente**: Pitágoras (Ânima Educação / Kroton)  
**Domínio**: pitagoras.com.br

---

## Ranking de Payoff

| # | Prioridade | Vetor | Alvo | Payoff Esperado |
|---|-----------|-------|------|-----------------|
| 1 | **🔥 CRÍTICO** | **WordPress + Elementor + WP Engine** | lps.pitagoras.com.br | RCE via plugin vuln, DB access, admin takeover |
| 2 | **🔥 CRÍTICO** | **Adobe AEM** | rematricula.pitagoras.com.br | AEM RCE/XXE/bypass — múltiplos CVEs conhecidos |
| 3 | **🔴 ALTO** | **WordPress + Elementor 3.35.7** | blog.pitagoras.com.br | RCE, admin access |
| 4 | **🟠 MÉDIO** | **AEM Experience Cloud** | data.*.pitagoras.com.br | Dados sensíveis de alunos/matrículas |
| 5 | **🟠 MÉDIO** | **Golang net/http (Mail2Easy)** | 13.58.247.178 | Info disclosure, data exposure |
| 6 | **🟠 MÉDIO** | **Takeover candidate** | parceria-uber.pitagoras.com.br | Unbounce takeover para phishing |
| 7 | **🟠 MÉDIO** | **Takeover candidate** | dev.blog.pitagoras.com.br | AWS ELB takeover |
| 8 | **🟠 MÉDIO** | **Microsoft 365 Autodiscover** | autodiscover.pitagoras.com.br | Força bruta, cred stuffing |
| 9 | **🟡 BAIXO** | **CloudFront + S3 buckets** | consultores/cdn.*.pitagoras.com.br | Bucket data exposure |
| 10 | **🟡 BAIXO** | **Range legado** | 200.209.69.200-236 | Potencial rede interna/pivoting |
| 11 | **🟡 BAIXO** | **AWS ELB redirect** | pitagoras.com.br (76.223.91.9) | Mapeamento infraestrutura |

---

## Superfície de Ataque

### Hosts Diretos (origem real)
| Host | IP | CDN/WAF | Portas Abertas |
|------|-----|---------|---------------|
| pitagoras.com.br (A record) | 76.223.91.9 | AWS Global Accelerator | 80, 81, 443, 8080, 8081 |
| d-*.pitagoras.com.br (Mail2Easy) | 13.58.247.178 | Direto (AWS EC2) | 80 (Golang), 443 |
| lps/blog.pitagoras.com.br | 141.193.213.10-11 | Cloudflare + WP Engine | 80, 443, 2052-2096, 8080, 8443, 8880 |
| www.pitagoras.com.br | 23.45.14.83 | Akamai Kona | 443 (403 Access Denied) |
| rematricula.pitagoras.com.br | 151.101.3.10 | Fastly | 80, 443 |
| consultores.pitagoras.com.br | 13.227.110.123 | CloudFront + S3 | 443 |
| data.*.pitagoras.com.br | 63.140.39.x | Adobe CDN | 443 |

### Subdomínios Vivos (21)
WordPress (lps/blog), Adobe AEM (rematricula), Adobe Experience Cloud (data.*), CloudFront+S3 (cdn.*, consultores), Mail2Easy (d-*), Marketing (parceria-uber, materiais), Node.js (node), Autodiscover (O365)

### Produtos e Tecnologias
1. **WordPress** — lps.pitagoras.com.br (Elementor 4.1.3, WP Engine, Cloudflare)
2. **WordPress** — blog.pitagoras.com.br (Elementor 3.35.7, WP Rocket 3.21.1, WP Engine, Cloudflare)
3. **Adobe AEM** — rematricula.pitagoras.com.br (Fastly)
4. **Adobe Experience Cloud** — data.*.pitagoras.com.br
5. **Microsoft 365** — autodiscover.pitagoras.com.br
6. **Mail2Easy** — d-*.pitagoras.com.br (Golang, EC2 us-east-2)
7. **Unbounce** — parceria-uber.pitagoras.com.br
8. **SparkPost** — materiais.pitagoras.com.br
9. **AWS ELB + Global Accelerator** — pitagoras.com.br
10. **Akamai Kona** — www.pitagoras.com.br

### TLS Certificate (76.223.91.9:443)
- Domínios relacionados: **anhanguera.com, unopar.com.br, uniderp.br, kroton.com.br, unime.edu.br, stoodi.com.br, unic.com.br, uniban.br, faculdadepitagoras.com.br, biblioteca-virtual.com, kampusapp.com.br, portalpos.com.br, vestibulares.br, aquitemanglo.com.br, cogna.com.br** (+ de 50 domínios)

### Ataque Imediato Recomendado
| Ordem | Ação | Subagente |
|-------|------|-----------|
| 1 | **WPScan** em lps/blog.pitagoras.com.br | enum |
| 2 | **AEM enumeration** em rematricula.pitagoras.com.br | enum |
| 3 | **CVE Research** — Elementor 4.1.3, AEM, WP Rocket | cve |
| 4 | **Webapp attack** — WordPress admin bypass, AEM ACL bypass | webapp |
| 5 | **CloudFront/S3** — bucket enumeration | cloud |