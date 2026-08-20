# PASSIVE RECON REPORT — bagy.com.br

**Data:** 2026-08-20  
**Executor:** recon-passive (OSINT)  
**Metodologia:** 100% passiva (sem toque direto no alvo além de DNS/certificate transparency)

---

## Resumo Executivo

| Métrica | Valor |
|---|---|
| Subdomínios encontrados | **76** |
| Subdomínios resolvidos (DNS) | **71** (~199 records) |
| Subdomínios vivos (HTTP 2xx/3xx) | **38** |
| IPs únicos | **56** |
| E-mails coletados | **7** |
| Pessoas mapeadas | **4** |
| Buckets abertos | **0** |
| Takeover candidates confirmados | **2** (pixel.hotmart.com, bagy-stores-env-lb.elasticbeanstalk.com) |

---

## 1. DNS COMPLETO

### WHOIS (registro.br)
- **Domínio:** bagy.com.br
- **Owner:** Tiago Pires de Assis Amaral (tiago.amaral@bagy.com.br)
- **CNPJ:** 27.357.470/0001-63
- **Criação:** 2016-08-08
- **Expira:** 2030-08-08
- **Nameservers:** emily.ns.cloudflare.com, ned.ns.cloudflare.com
- **Tech Contact:** Dooca Commerce (infra@bagy.com.br)

### DNS Records
| Tipo | Valor |
|---|---|
| **A (bagy.com.br)** | 104.21.65.25, 172.67.139.221 |
| **A (www.bagy.com.br)** | 179.191.168.x, 179.191.169.x (Azion Edge) |
| **AAAA** | 2606:4700:3036::6815:4119, 2606:4700:3033::ac43:8bdd |
| **MX** | Google Workspace (aspmx.l.google.com + alt1-4) |
| **NS** | Cloudflare (emily, ned) |
| **TXT** | SPF (amazonses + google + hubspot + emsd1), Google Site Verifications (10!), Pinterest, Ahrefs, Cursor, DocuSign |
| **DMARC** | p=quarantine; pct=20; rua=mailto:sec-csirt@bagy.com.br |
| **CAA** | Não configurado |
| **AXFR** | Bloqueado (Cloudflare - FORMERR) |

### SPF expandido
```
v=spf1 include:emsd1.com include:_spf.google.com include:amazonses.com include:23564989.spf06.hubspotemail.net ~all
```

---

## 2. SUBDOMÍNIOS

### Fontes usadas
- crt.sh → 0 resultados (rate limited)
- Subfinder → 23 subdomínios
- Amass → timeout após 5min (rerun needed)
- Assetfinder → 4 subdomínios
- TheHarvester → 67 subdomínios
- Findomain → falha (binário corrompido)

**Total combinado: 76 subdomínios únicos** (após dedupe)

### Subdomínios por categoria

| Categoria | Subdomínios |
|---|---|
| **Produção** | www, bagy.com.br, painel, loja, temas |
| **Homologação/Staging** | homolog, homolog-assine, staging, staging-comprar, temas-staging |
| **API** | api-lb, teste-api, elastic |
| **Base Conhecimento** | basedeconhecimento, ajuda, suporte, faq |
| **Checkout/Compra** | checkout, comprar, comprar2, assine, minhaassinatura |
| **Marketing** | on, promo, lp, bio, ig, pixel, materiais, universidade, maratona, bagyshop |
| **Infra** | server, load.server, updates, status, hydrogen, helium |
| **Admin** | painel, admin (implícito via bagysvc) |
| **CDN** | soureicdn, waster-server |
| **Outros** | bagysvc, bagysvchead, bagysvchmg, blog, manuais, site, sites, tm, venda, reserva, metabagy, use, tempos |

### Subdomínios Vivos (38)
```
bagy.com.br
www.bagy.com.br
painel.bagy.com.br
loja.bagy.com.br
temas.bagy.com.br
on.bagy.com.br
status.bagy.com.br
ig.bagy.com.br
manuais.bagy.com.br
minhaassinatura.bagy.com.br
updates.bagy.com.br
basedeconhecimento.bagy.com.br
blog.bagy.com.br
sites.bagy.com.br
site.bagy.com.br
checkout.bagy.com.br
promo.bagy.com.br
assine.bagy.com.br
bio.bagy.com.br
materiais.bagy.com.br
homolog.bagy.com.br
homolog-assine.bagy.com.br
temas-staging.bagy.com.br
ajuda.bagy.com.br
suporte.bagy.com.br
api-lb.bagy.com.br
soureicdn.bagy.com.br
waster-server.bagy.com.br
metabagy.bagy.com.br
server.bagy.com.br
elastic.bagy.com.br
helium.bagy.com.br
teste-api.bagy.com.br
comprar.bagy.com.br
comprar2.bagy.com.br
bagyshop.bagy.com.br
tm.bagy.com.br
www.tm.bagy.com.br
```

---

## 3. IPs REAIS DESCOBERTOS (56)

### Por provedor

| Provedor | IPs | Subdomínios |
|---|---|---|
| **Azion Edge** (179.191.168-169.x) | 179.191.168.{17,33,41,49,57,65,73}, 179.191.169.{49,57,73,81,89,97,113} | www, loja, temas, temas-staging, minhaassinatura |
| **Cloudflare** (104.21.x, 172.67.x) | 104.21.65.25, 172.67.139.221 | bagy.com.br, blog, promo, checkout, on, bagysvc, sites, site |
| **Cloudflare** (GitBook) | 104.18.40.47, 172.64.147.209 | ajuda, suporte |
| **Cloudflare** (SoureCDN) | 104.18.26.21, 104.18.27.21 | soureicdn, waster-server |
| **Google Cloud** | 35.244.147.218, 35.247.248.40, 35.227.98.237, 35.215.230.115, 35.199.71.234 | api-lb, elastic, metabagy, staging-comprar, server |
| **Google Services** (216.239.x.x) | 216.239.{32,34,36,38}.21 | comprar, comprar2, bagyshop, tm |
| **Google Hosted** (ghs) | 142.251.133.83, 172.217.29.243 | helium, teste-api, www.tm |
| **GoCache** | 170.82.173.{10,30}, 170.82.174.{10,30} | homolog, homolog-assine |
| **Zendesk** | 216.198.53.2, 216.198.54.2 | basedeconhecimento |
| **HubSpot** | 199.60.103.{29,227} | materiais |
| **Atlassian Statuspage** | 13.227.110.{14,46,92,121} | status |
| **GitHub Pages** | 185.199.{108,109,110,111}.153 | manuais |
| **AWS (AnnounceKit)** | 3.234.124.213, 3.209.251.73 | updates |
| **Fastly** | 151.101.1.195, 151.101.65.195 | ig |
| **Stape** | sae.stape.io, lsae.stape.io | server, load.server |

---

## 4. TECH STACK DETALHADO

### Principal (www.bagy.com.br / painel.bagy.com.br)
- **WAF:** Azion Edge Firewall (www), Cloudflare (painel)
- **CDN:** Azion Edge (www), Cloudflare, Webflow CDN
- **CMS:** Webflow
- **JS Framework:** jQuery 3.5.1
- **Fonts:** Google Font API, Google Hosted Libraries
- **Analytics:** Google Tag Manager
- **CDN libs:** cdnjs, jsDelivr
- **Headers:** HSTS (includeSubDomains), X-Content-Type-Options, CSP

### Blog (on.bagy.com.br)
- **CMS:** WordPress 7.0.4
- **Page Builder:** Elementor 3.23.1
- **Theme:** Oxygen
- **Database:** MySQL
- **Cache:** X-Powered-By: Apiki WP Cloud Services V2
- **JS:** jQuery 3.7.1
- **Security:** X-XSS-Protection, HSTS preload

### Loja (loja.bagy.com.br)
- **WAF:** Azion Edge
- **Platform:** Dooca Store / Tray Tecnologia
- **Server:** azion webserver

### Base de Conhecimento (basedeconhecimento.bagy.com.br)
- **Platform:** Zendesk Guide
- **Proxy:** Zendesk Zorg (Envoy)
- **Auth:** Cloudflare Bot Management

### Status (status.bagy.com.br)
- **Platform:** Atlassian Statuspage
- **CDN:** Amazon CloudFront
- **JS:** jQuery 3.5.1, reCAPTCHA, bowser

### Manuais (manuais.bagy.com.br)
- **Platform:** GitHub Pages (tray-tecnologia.github.io)
- **Framework:** VuePress 1.6.4
- **CDN:** Fastly, Varnish

### Updates (updates.bagy.com.br)
- **Platform:** AnnounceKit
- **Infra:** AWS ALB (us-east-1)

### App (ig.bagy.com.br)
- **Platform:** Firebase, Mapbox GL JS
- **CDN:** Fastly, Unpkg, Google Hosted Libraries

### Materiais (materiais.bagy.com.br)
- **Platform:** HubSpot CMS Hub
- **JS:** jQuery 1.7.1

### Minha Assinatura (minhaassinatura.bagy.com.br)
- **Server:** Apache HTTP Server
- **Framework:** Bootstrap
- **CDN:** Azion Edge

---

## 5. OSINT — EMPRESA E PESSOAS

### Empresa
| Campo | Valor |
|---|---|
| **Razão Social** | BAGY SOLUCOES DE COMERCIO DIGITAL LTDA |
| **Nome Fantasia** | BAGY |
| **CNPJ** | 27.357.470/0001-63 |
| **Situação** | ATIVA (MATRIZ) |
| **Endereço** | Rua Bernardo Figueiredo, 33 — Andar 13 — Serra — Belo Horizonte/MG — 30.220-140 |
| **Telefone** | (11) 3544-0444 |
| **Capital Social** | R$ 29.581.752,00 |
| **Fundação** | 2017 por Pedro Rabelo |
| **Setor** | E-commerce SaaS (plataforma de criação de lojas virtuais) |

### Pessoas Identificadas

| Nome | Cargo/Vínculo | E-mail | Fonte |
|---|---|---|---|
| **Tiago Pires de Assis Amaral** | Owner (WHOIS) / Sócio | tiago.amaral@bagy.com.br | WHOIS Registro.br |
| **Pedro Rabelo** | Fundador (2017) | — | Artigos blog bagy |
| **Dooca Commerce** | Tech Contact (infra) | infra@bagy.com.br | WHOIS Registro.br |
| — | Contato DMARC | sec-csirt@bagy.com.br | DMARC DNS |
| — | Contato Financeiro | contabilidade_email@locaweb.com.br | ReceitaWS |
| — | Imprensa | imprensa@locawebcompany.com.br, imprensa@lwsa.tech | HTML scraping |
| — | Suporte | suporte@bagy.com.br | Página pública |

### E-mails Coletados (7)
```
suporte@bagy.com.br
tiago.amaral@bagy.com.br
infra@bagy.com.br
sec-csirt@bagy.com.br
contabilidade_email@locaweb.com.br
imprensa@locawebcompany.com.br
imprensa@lwsa.tech
```

### Redes Sociais
- LinkedIn: /company/bagy
- Instagram: @bagy.com.br
- Facebook: /bagy.com.br
- YouTube: UCV_nTXrfQ7Cn_JVfFLp-pTQ
- ReclameAqui: /empresa/bagy
- Crunchbase: /organization/bagy

### GitHub
- **bagy** org: Não encontrada no GitHub
- **converta** org: Não encontrada no GitHub
- **tray-tecnologia** org: Mantenedor do manuais.bagy.com.br (GitHub Pages)
- `nicolas-azevedo-bagy`: Usuário GitHub com repo "Bagy"
- `tiago-searchstax`, `TiagoAmaralVwds`: Possíveis contas de Tiago Amaral
- Vários repositórios públicos com nome "Bagy" (desafios técnicos, projetos pessoais)

---

## 6. CLOUD BUCKETS & TAKEOVER

### Buckets (S3 / GCS / Azure Blob)
Nenhum bucket aberto encontrado. Todos retornaram 403/404.
- `bagy.s3.amazonaws.com` → 403
- `bagy-assets.s3.amazonaws.com` → 404
- `bagy.storage.googleapis.com` → 404

### Takeover Candidates CONFIRMADOS

#### 1. pixel.bagy.com.br (CRÍTICO)
- **CNAME:** pixel.hotmart.com
- **Status:** NXDOMAIN (domínio não existe)
- **Impacto:** Qualquer pessoa pode registrar um subdomínio no Hotmart e hospedar conteúdo malicioso sob `pixel.bagy.com.br`
- **Verificação:** `host pixel.hotmart.com → NXDOMAIN`

#### 2. staging.bagy.com.br (ALTO)
- **CNAME:** bagy-stores-env-lb.us-east-2.elasticbeanstalk.com
- **Status:** DNS não resolve
- **Impacto:** Elastic Beanstalk environment foi deletado. Takeover possível via `aws elasticbeanstalk create-environment` ou registro do CNAME em outro serviço AWS
- **Verificação:** `dig bagy-stores-env-lb.us-east-2.elasticbeanstalk.com → sem registro`

---

## 7. WAYBACK MACHINE / GAU

### Estatísticas
- **GAU:** 6.243 URLs
- **Wayback:** 0 URLs (via waybackurls)
- **Total combinado:** ~6.243 URLs únicas
- **URLs sensíveis:** 1.698
- **Arquivos JS:** 608

### Highlights de URLs Sensíveis

| URL | Observação |
|---|---|
| `bagy.com.br/wp-admin/` | WordPress admin exposto |
| `bagy.com.br/wp-login.php` | WordPress login |
| `bagy.com.br/login` | Página de login Bagy |
| `bagy.com.br/dashboard` | Dashboard |
| `bagy.com.br/Login/GetLoginBagy` | API de login |
| `bagy.com.br/Login/PostCheckActivationKeyandCreateStore` | Criação de loja via chave de ativação |
| `bagy.com.br/Login/PostLoginInstagramLojista` | Login Instagram lojista |
| `bagy.com.br/.well-known/openid-configuration` | OpenID Configuration (SSO) |
| `bagy.com.br/blog/wp-admin/admin-ajax.php` | WordPress AJAX endpoint |
| `bagy.com.br/site/wp-admin/` | Segundo WordPress |
| `bagy.com.br/blog/wp-content/uploads/` | Uploads acessíveis |
| `lojaisaguerra/login` | Loja de terceiro exposta |
| `bagy.com.br/conheca-o-painel` | Painel de administração |

### JS Files de Interesse
- `inline.*.bundle.js` — inline bundles do Webflow
- `main.*.bundle.js` — main bundles
- `vendor.*.bundle.js` — vendor bundles
- `donamy/` — diretório de assets específico

---

## 8. FAVICON HASH

- favicon.ico retorna 404 no bagy.com.br (não encontrado)
- Nenhum favicon hash disponível para correlação Shodan

---

## 9. REDES E PARCEIROS IDENTIFICADOS

| Empresa/Plataforma | Relação | Evidência |
|---|---|---|
| **Cloudflare** | DNS + CDN + WAF | NS, headers cf-ray |
| **Azion** | CDN + Edge Firewall | IPs Azion, x-azion-request-id |
| **Webflow** | CMS/SaaS principal | x-wf-region, Webflow CDN |
| **Google Workspace** | E-mail corporativo | MX records |
| **HubSpot** | Marketing/Materiais | materiais.bagy.com.br CNAME |
| **Zendesk** | Suporte/Base Conhecimento | basedeconhecimento.bagy.com.br CNAME |
| **GitBook** | Ajuda/Suporte docs | ajuda/suporte.bagy.com.br CNAME |
| **Tray Tecnologia** | Plataforma e-commerce | loja.bagy.com.br (dooca.store) |
| **Dooca** | Storefront | front.dooca.store CNAME |
| **GoCache** | CDN (homologação) | homolog, homolog-assine |
| **Atlassian Statuspage** | Status do serviço | status.bagy.com.br |
| **AnnounceKit** | Changelog/Updates | updates.bagy.com.br |
| **Amazon Web Services** | Infra | Elastic Beanstalk, CloudFront, ALB |
| **Hotmart** | Pixel/Rastreamento | pixel.bagy.com.br (TAKEOVER) |
| **LocaWeb** | Contabilidade/Infra | contabilidade_email, imprensa |

---

## 10. RECOMENDAÇÕES — PRÓXIMOS PASSOS (RECON ATIVO)

### Imediatos (Críticos)
1. **Testar takeover de staging.bagy.com.br** — tentar registrar o Elastic Beanstalk environment ou usar serviço de takeover
2. **Testar takeover de pixel.bagy.com.br** — tentar criar subdomínio no Hotmart
3. **Verificar WordPresses expostos** — `on.bagy.com.br` (WordPress 7.0.4), `/blog/wp-admin/`, `/site/wp-admin/`

### Recon Ativo Priorizado
4. **Port scan** nos IPs reais (Azion, Google Cloud, GoCache, Stape)
5. **Web crawling** aprofundado de www, painel, loja, on, temas
6. **API enumeration** em `api-lb.bagy.com.br:35.244.147.218`
7. **Testar elasticsearch** em `elastic.bagy.com.br:35.247.248.40`
8. **Firebase enumeration** em `ig.bagy.com.br`
9. **Testar Zendesk** em basedeconhecimento.bagy.com.br (IDOR, SSRF, privilege escalation)
10. **Analisar JS bundles** do Webflow (main.*.bundle.js) em busca de endpoints/API keys

### OSINT Adicional
11. **Scraping LinkedIn** da Bagy para mapear funcionários
12. **Buscar CNPJ de sócios** na Receita Federal (Tiago Amaral, Pedro Rabelo)
13. **Verificar vazamentos** no HIBP/Dehashed com e-mails coletados
14. **Analisar Play Store (com.converta.bagy)** — baixar APK e decompilar
15. **Analisar App Store (Bagy Painel de Controle)** — baixar IPA

---

## Anexos (Artefatos Brutos em `/home/ubuntu/bagy.com.br/recon/passive/`)

| Arquivo | Conteúdo |
|---|---|
| `whois.txt` | WHOIS completo |
| `dns_full.txt` | Todos registros DNS |
| `dns_axfr.txt` | Tentativa de zone transfer |
| `subdomains_all.txt` | 76 subdomínios (antes da resolução) |
| `subdomains_resolved.txt` | 199 registros DNS resolvidos |
| `subdomains_live.txt` | 38 hosts vivos com tech detect |
| `tech_stack.txt` | WhatWeb output detalhado |
| `waf_detection.txt` | WAFW00F output |
| `osint_emails.txt` | 7 e-mails coletados |
| `osint_people.txt` | Pessoas mapeadas |
| `osint_organization.txt` | Dados da empresa |
| `osint_github.txt` | GitHub search results |
| `osint_repos.txt` | Repositórios encontrados |
| `osint_breaches.txt` | Breach search |
| `wayback_combined.txt` | ~6.243 URLs (GAU) |
| `wayback_sensitive.txt` | 1.698 URLs sensíveis |
| `wayback_js.txt` | 608 JS files |
| `cloud_buckets.txt` | S3/GCS/Azure scan |
| `takeover_candidates.txt` | 2 takeover confirmados |
| `favicon_hash.txt` | Favicon hash (N/A) |
| `all_ips.txt` | 56 IPs únicos |
| `subfinder_output.txt` | Subfinder raw output |
| `assetfinder_output.txt` | Assetfinder raw output |
| `theharvester_output.txt` | TheHarvester raw output |
| `theHarvester_output.json` | TheHarvester JSON results |

---

*Report gerado automaticamente em 2026-08-20T05:45:00Z*