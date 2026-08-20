# ACTIVE RECONNAISSANCE REPORT — pitagoras.com.br

**Data**: 2026-08-20
**Alvo**: Pitágoras (Rede de Ensino) — Grupo Ânima Educação / Kroton

---

## 1. HOSTS DIRETOS (FORA CDN) — PORTSCAN

### 76.223.91.9 — AWS Global Accelerator (Fastly A record)
| Porta | Serviço | Nota |
|-------|---------|------|
| 80/tcp | HTTP (awselb/2.0) | Redireciona para https://76.223.91.9:443 |
| 81/tcp | hosts2-ns | Desconhecido |
| 443/tcp | HTTPS (awselb/2.0) | Redireciona para https://www.anhanguera.com |
| 8080/tcp | http-proxy | Timeout |
| 8081/tcp | blackice-icecap | Desconhecido |

**Server**: `awselb/2.0` (AWS Elastic Load Balancer)
**Redireciona para**: `https://www.anhanguera.com` (Ânima Educação)

#### TLS Certificate (76.223.91.9:443)
- **CN**: anhanguera.com
- **SANs**: pitagoras.com.br, *.pitagoras.com.br, anhanguera.com, *.anhanguera.com, unopar.com.br, *.unopar.com.br, uniderp.br, *.uniderp.com.br, kroton.com.br, *.kroton.com.br, unime.edu.br, stoodi.com.br, posuniderp.com.br, posanhanguera.com.br, posunopar.com.br, unopar.br, unic.com.br, unic.br, uniban.br, faculdadepitagoras.com.br, biblioteca-virtual.com, kampusapp.com.br, portalpos.com.br, vestibulares.br, aquitemanglo.com.br, parceleafaculdade.com.br, faculdadedemacapa.com.br, cogna.com.br, *.cogna.com.br, *.colaboraread.com.br, *.platosedu.com.br, *.universidadekroton.com.br, *.stoodi.com.br
- **Issuer**: Amazon RSA 2048 M01
- **Validade**: 2026-08-07 até 2027-02-20
- **TLS**: 1.2 e 1.3 com ciphers fortes (A)

### 13.58.247.178 — Mail2Easy (AWS EC2 us-east-2)
| Porta | Serviço | Versão | Nota |
|-------|---------|--------|------|
| 80/tcp | HTTP | Golang net/http server (Go-IPFS json-rpc or InfluxDB API) | 404 Not Found |
| 443/tcp | HTTPS | — | SSL/TLS, sem título |

- **Hostname**: ec2-13-58-247-178.us-east-2.compute.amazonaws.com
- **Subdomínios**: d-iaap, d-krlk, d-mlmq, d-rbtc.pitagoras.com.br
- **HTTP**: 404, sem título, servidor Go
- **TLS**: 1.3 somente, ciphers fortes

### 141.193.213.10 — WP Engine (WordPress lps/blog)
| Porta | Serviço | Nota |
|-------|---------|------|
| 80/tcp | HTTP (Cloudflare) | 400 The plain HTTP request was sent to HTTPS port |
| 443/tcp | HTTPS (Cloudflare) | Título vazio |
| 2052/tcp | clearvisn | WP Engine interno |
| 2053/tcp | knetd | WP Engine interno |
| 2082/tcp | infowave | WP Engine (cPanel?) |
| 2083/tcp | radsec | WP Engine (cPanel SSL?) |
| 2086/tcp | gnunet | WP Engine interno |
| 2087/tcp | eli | WP Engine interno |
| 2095/tcp | nbx-ser | WP Engine interno |
| 2096/tcp | nbx-dir | WP Engine interno |
| 8080/tcp | http-proxy | Cloudflare |
| 8443/tcp | https-alt | Cloudflare |
| 8880/tcp | cddbp-alt | WP Engine interno |

- **Cloudflare** na frente em todas as portas HTTP/HTTPS
- Portas 2082-2096 são típicas de cPanel/WHM — indicam infraestrutura compartilhada WP Engine
- **Hosts**: lps.pitagoras.com.br, blog.pitagoras.com.br

### 141.193.213.11 — WP Engine (secundário)
Mesmas portas que 141.193.213.10 (clonado para redundancy/load balancing)

### 200.209.69.200-236 — Range legado (sem rota)
- **Status**: Sem resposta — possivelmente rede interna/protegida/ex-Correio
- **Range**: 200.209.69.200-236 (37 IPs, nenhum acessível)
- **Hosts associados**: www.ead, www.ua, www.legado, metaframe, crm, exchange, fapnew, uberlandia, etc.

---

## 2. WAF DETECTION

| Host | WAF | Nota |
|------|-----|------|
| www.pitagoras.com.br | **Não detectado** (Akamai Kona — WAF não identificado pelo wafw00f) | 403 Access Denied |
| lps.pitagoras.com.br | **Cloudflare** | Confirmado |
| blog.pitagoras.com.br | **Cloudflare** | Confirmado |
| rematricula.pitagoras.com.br | **Não detectado** | Fastly na frente |
| consultores.pitagoras.com.br | **Cloudfront (Amazon)** | WAF AWS |

---

## 3. WEB FINGERPRINT (HOSTS DIRETOS)

### 76.223.91.9:80
- **Server**: awselb/2.0
- **Redirect**: 301 → https://76.223.91.9:443/
- **Location**: https://www.anhanguera.com

### 76.223.91.9:443
- **Server**: awselb/2.0
- **Redirect**: 301 → https://www.anhanguera.com:443/
- **Tech**: Amazon ELB, Amazon Web Services

### 13.58.247.178:80
- **HTTP**: 404 Not Found
- **Server**: Go net/http
- **Headers**: X-Content-Type-Options: nosniff

### 13.58.247.178:443
- **TLS**: v1.3 only
- **No SSL cert info returned**

---

## 4. TAKEOVER VERIFICATION

| Candidato | Status | Resultado |
|-----------|--------|-----------|
| parceria-uber.pitagoras.com.br | Pendente | Unbounce — 409 (Cloudflare) |
| dev.blog.pitagoras.com.br | Pendente | AWS ELB — verificar se ELB existe |
| materiais.pitagoras.com.br | Pendente | SparkPost/PostClick |

---

## 5. VERSÕES CANDIDATAS A CVE

| Host | Tecnologia | Versão | Potencial CVEs |
|------|-----------|--------|----------------|
| lps.pitagoras.com.br | WordPress | 6.x | Múltiplos |
| lps.pitagoras.com.br | Elementor | 4.1.3 | CVE-2024-..., RCE |
| blog.pitagoras.com.br | Elementor | 3.35.7 | CVE-2024-... |
| blog.pitagoras.com.br | WP Rocket | 3.21.1 | CVE-2024-... |
| rematricula.pitagoras.com.br | Adobe AEM | ? | Diversos CVEs AEM |
| blog.pitagoras.com.br | Rate My Post | ? | CVE potencial |
| lps.pitagoras.com.br | Advanced Ads | ? | CVE potencial |

---

## 6. RANKING DE PAYOFF

| Prioridade | Alvo | Vetor | Payoff |
|-----------|------|-------|--------|
| **ALTO** | rematricula.pitagoras.com.br | Adobe AEM enumeration | Acesso admin, RCE potencial |
| **ALTO** | lps.pitagoras.com.br | WordPress + Elementor + Cloudflare bypass | RCE, admin, DB |
| **ALTO** | blog.pitagoras.com.br | WordPress + Elementor 3.35.7 + WP Rocket | RCE, admin |
| **MÉDIO** | 13.58.247.178 | Golang net/http (Go-IPFS/InfluxDB) | Info disclosure, data |
| **MÉDIO** | 76.223.91.9 | AWS ELB probe | Descoberta de rotas |
| **MÉDIO** | parceria-uber.pitagoras.com.br | Unbounce takeover | Redirecionamento, phishing |
| **MÉDIO** | dev.blog.pitagoras.com.br | AWS ELB takeover | Redirecionamento |
| **MÉDIO** | data.*.pitagoras.com.br | Adobe Experience Cloud | Dados sensíveis |
| **MÉDIO** | autodiscover.pitagoras.com.br | O365 brute force | Acesso email |
| **BAIXO** | consultores.pitagoras.com.br | CloudFront + S3 enumeration | Bucket data |
| **BAIXO** | cdn.*.pitagoras.com.br | CloudFront + S3 | Info disclosure |
| **BAIXO** | 200.209.69.200-236 | Legacy range | Pivoting potencial |

---

## 7. PRÓXIMOS PASSOS

1. **Enumeração WordPress** (wpscan) em lps/blog.pitagoras.com.br
2. **Adobe AEM enumeration** em rematricula.pitagoras.com.br (crx/packmgr, /etc, /bin, /content)
3. **CloudFront/S3 enumeration** em consultores/cdn.*
4. **Verificar takeover** do parceria-uber (Unbounce)
5. **Webapp attack** nos hosts com maior payoff
6. **CVE research** para Elementor 4.1.3, Adobe AEM, plugins WP