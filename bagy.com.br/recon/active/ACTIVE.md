# ACTIVE RECON — bagy.com.br

**Data:** 2026-08-20 06:00-06:30 UTC
**Escopo:** bagy.com.br (BAGY SOLUÇÕES DE COMÉRCIO DIGITAL LTDA.)
**Stack:** Webflow + WordPress 7.0.4 + Azion Edge + Cloudflare + Google Cloud + Zendesk + HubSpot + Firebase + Atlassian Statuspage

---

## Resumo

| Métrica | Valor |
|---|---|
| Total IPs na lista | 45 |
| IPs scaneados (origin) | 45 |
| Hosts up | 39 |
| Portas abertas totais | ~96 |
| Serviços inesperados | 2 (Golang HTTP em GCP, Traefik default cert) |
| Elasticsearch acessível | **Não** (porta 9200 filtrada) |
| Painéis admin expostos | 1 (painel.bagy.com.br — Cloudflare) |
| WAFs identificados | 4 tipos (Cloudflare, Azion Edge, Fastly, GoCache) |

---

## Hosts de Origem Real x CDN

| Hostname | CDN/Proxy | IP de Origem Real |
|---|---|---|
| www.bagy.com.br | Azion Edge | 179.191.169.81 (anycast) |
| loja.bagy.com.br | Azion Edge | 179.191.169.57 (anycast) |
| temas.bagy.com.br | Azion Edge | 179.191.168.x (anycast) |
| on.bagy.com.br | Cloudflare | 104.21.65.25 (CF IP) |
| painel.bagy.com.br | Cloudflare | 198.202.211.1 (Locaweb) |
| basedeconhecimento.bagy.com.br | Cloudflare → Zendesk | 216.198.53.2 / 216.198.54.2 |
| api-lb.bagy.com.br | Google Cloud LB | 35.244.147.218 |
| server.bagy.com.br | Direto (Golang) | 35.199.71.234 |
| elastic.bagy.com.br | Direto (GCP) | 35.247.248.40 |
| metabagy.bagy.com.br | Direto (GCP) | 35.227.98.237 |
| homolog*.bagy.com.br | GoCache | 170.82.173.x / 170.82.174.x |
| manuais.bagy.com.br | Fastly → GitHub Pages | 185.199.110.153 |
| status.bagy.com.br | CloudFront → Atlassian | 13.227.110.x |
| updates.bagy.com.br | Direto (AnnounceKit) | 3.234.124.213 / 3.209.251.73 |
| ig.bagy.com.br | Firebase (Fastly) | 151.101.1.195 / 151.101.65.195 |
| minhaassinatura.bagy.com.br | Direto (Apache) | DNS aponta Cloudflare |
| materiais.bagy.com.br | Cloudflare → HubSpot | 199.60.103.29 / 199.60.103.227 |

---

## Tabela: IPs | Portas Abertas | Serviços | Web Server | WAF | Notas

### AZION EDGE (14 IPs: 179.191.168-169.x) — Todos respondedores

| IP | Portas Abertas | Serviços | Web Server | WAF | Notas |
|---|---|---|---|---|---|
| 179.191.168.17 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | "There's nothing here yet" (Azion default) |
| 179.191.168.33 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.168.41 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.168.49 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.168.57 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.168.65 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.168.73 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.169.49 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.169.57 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.169.73 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.169.81 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.169.89 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.169.97 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |
| 179.191.169.113 | 80,443,8080,8443 | HTTP/SSL | azion webserver | Azion Edge Firewall | idem |

**TLS:** Azion wildcard cert `CN=azion.com` SAN: `*.azionedge.net, *.azioncdn.net` — válido até 2027-01-17

### GOOGLE CLOUD (5 IPs, 2 up)

| IP | Portas Abertas | Serviços | Web Server | WAF | Notas |
|---|---|---|---|---|---|
| 35.244.147.218 (api-lb) | 80 | HTTP | Google Frontend | GCP LB | 403 Forbidden — todas as outras portas filtradas |
| 35.199.71.234 (server) | 80,443 | HTTP/SSL | Golang net/http | N/D | Traefik default cert — 404 tudo |
| 35.247.248.40 (elastic) | — | — | — | — | Nenhuma porta respondeu |
| 35.227.98.237 (metabagy) | — | — | — | — | Nenhuma porta respondeu |
| 35.215.230.115 (staging) | — | — | — | — | Nenhuma porta respondeu |

### GOCACHE (4 IPs — todos respondedores)

| IP | Portas Abertas | Serviços | Web Server | WAF | Notas |
|---|---|---|---|---|---|
| 170.82.173.10 | 80,443 | HTTP/SSL | gocache/openresty | GoCache WAF | "400 Bad Request" sem Host header |
| 170.82.173.30 | 80,443 | HTTP/SSL | gocache/openresty | GoCache WAF | idem |
| 170.82.174.10 | 80,443 | HTTP/SSL | gocache/openresty | GoCache WAF | idem |
| 170.82.174.30 | 80,443 | HTTP/SSL | gocache/openresty | GoCache WAF | idem |

**TLS:** GoCache wildcard `CN=*.cdn.gocache.net` — válido até 2027-01-23

### ZENDESK (2 IPs — ambos respondedores)

| IP | Portas Abertas | Serviços | Web Server | WAF | Notas |
|---|---|---|---|---|---|
| 216.198.53.2 | 80,443,8080,8443 | Cloudflare proxy | cloudflare | Cloudflare | Org Zendesk |
| 216.198.54.2 | 80,443,8080,8443 | Cloudflare proxy | cloudflare | Cloudflare | Org Zendesk |

### HUBSPOT (2 IPs — ambos respondedores)

| IP | Portas Abertas | Serviços | Web Server | WAF | Notas |
|---|---|---|---|---|---|
| 199.60.103.29 | 80,443,8080,8443 | Cloudflare proxy | cloudflare | Cloudflare | HubSpot CDN |
| 199.60.103.227 | 80,443,8080,8443 | Cloudflare proxy | cloudflare | Cloudflare | HubSpot CDN |

**TLS:** HubSpot CDN cert `CN=hscoscdn30.net`

### OUTROS (AWS CloudFront, Google Services, Fastly, GitHub Pages, AWS ALB)

| IP | Portas Abertas | Serviços | Web Server | WAF | Notas |
|---|---|---|---|---|---|
| 13.227.110.{14,46,92,121} | 80,443 | CloudFront | Amazon CloudFront | CloudFront | Statuspage? error |
| 216.239.{32,34,36,38}.21 | 80,443 | Google HTTP/GHS | GSE/ghs | Google | Blogger blogs (antigos) |
| 142.251.133.83 | 80,443 | Google HTTP | ghs | Google | Google Hosted |
| 172.217.29.243 | 80,443 | Google HTTP | ghs | Google | Google Hosted |
| 151.101.1.195 | 80,443 | Fastly/Varnish | Varnish | Fastly | Firebase (firebaseapp.com) |
| 151.101.65.195 | 80,443 | Fastly/Varnish | Varnish | Fastly | Firebase (firebaseapp.com) |
| 185.199.{108,109,110,111}.153 | 80,443 | GitHub Pages | GitHub.com | Fastly | manuais.bagy.com.br |
| 3.234.124.213 | 80,443 | HTTP/SSL | — | — | AWS ALB (updates/AnnounceKit) |
| 3.209.251.73 | 80,443 | HTTP/SSL | — | — | AWS ALB (updates/AnnounceKit) |

---

## Painéis Admin / Aplicações Expostos

| URL | Título | Acesso | Screenshot |
|---|---|---|---|
| https://painel.bagy.com.br/ | "Bagy | Crie a sua loja virtual agora" | Cloudflare (198.202.211.1) | Capturado |
| https://minhaassinatura.bagy.com.br/ | "Minha Assinatura" | Apache (Bootstrap) — Cloudflare | Capturado |
| https://updates.bagy.com.br/ | "Bagy - Updates" | AnnounceKit (3.234.124.213) | Capturado |
| https://ig.bagy.com.br/ | "AppClick - Feito Pra Você Crescer" | Firebase (151.101.1.195) | Capturado |
| https://status.bagy.com.br/ | "Bagy Status de Servicos" | Atlassian Statuspage (13.227.110.x) | Capturado |
| https://temas.bagy.com.br/ | "Loja de Temas Bagy" | Nginx — Azion Edge | Capturado |
| https://manuais.bagy.com.br/ | "Manuais Bagy" | GitHub Pages / VitePress | Capturado |

---

## Serviços Inesperados / Versões Vulneráveis

### Golang net/http Server (35.199.71.234 — server.bagy.com.br)
- **Tipo:** Golang net/http server (Go-IPFS json-rpc ou InfluxDB API)
- **Portas:** 80 (HTTP), 443 (HTTPS com Traefik default cert)
- **Comportamento:** Retorna "404 page not found" para todos os endpoints testados
- **Cert TLS:** Auto-assinado Traefik "DEFAULT CERT" (expira 2026-08-21)
- **Risco:** Médio — servidor oculto no GCP sem proteção Cloudflare; identificação precisa pendente

### api-lb.bagy.com.br (35.244.147.218)
- **Tipo:** Google Cloud Load Balancer com Google Frontend
- **Portas relevantes:** Apenas 80 responde (403 Forbidden)
- **Todas portas filtradas:** 3000, 3306, 5432, 6379, 8080, 8443, 9000, 9090, 9200, 27017
- **Risco:** Baixo — bem configurado, mas LB exposto é alvo de discovery de vhosts

### Elasticsearch (35.247.248.40 — elastic.bagy.com.br)
- **Status:** INACESSÍVEL — porta 9200 filtrada, host não responde nas portas testadas
- **Conclusão:** Elasticsearch não está exposto publicamente

### WordPress 7.0.4 (on.bagy.com.br)
- **Versão:** 7.0.4 (confirmado via MetaGenerator)
- **Elementor:** 3.23.1
- **Risco:** Alto — WordPress 7.0.4 e Elementor 3.23.1 têm CVEs conhecidos

### Traefik Default Cert (35.199.71.234)
- Certificado auto-assinado Traefik DEFAULT CERT exposto
- Hostname interno: `1fb1263c53196c8ab0ab65a5d3885eb1.bffada3eca0e2cab56020eda7c6abf17.traefik.default`
- Indica deployment Kubernetes com Traefik ingress controller

---

## WAFs Identificados

| Host | WAF | Evidência |
|---|---|---|
| www.bagy.com.br | Azion Edge Firewall + Cloudflare | Headers `x-azion-request-id`, `cf-ray` |
| painel.bagy.com.br | Cloudflare | CF headers + `_cfuvid` cookie |
| on.bagy.com.br | Cloudflare | CF headers + challenge |
| loja.bagy.com.br | Azion Edge Firewall | Azion default error page |
| temas.bagy.com.br | Azion (nginx) | Azion + nginx headers |
| basedeconhecimento.bagy.com.br | Cloudflare + Zendesk | CF + Zendesk headers |
| manuais.bagy.com.br | Fastly | wafw00f: Fastly CDN WAF |
| minhaassinatura.bagy.com.br | WAF detectado (genérico) | Conexão bloqueada a nível de pacote |
| homolog*.bagy.com.br | GoCache | gocache server header |
| api-lb.bagy.com.br | Google Cloud LB | Google Frontend |
| materiais.bagy.com.br | Cloudflare + HubSpot | CF + HubSpot |
| status.bagy.com.br | CloudFront + Cloudflare | AWS + CF WAF |

---

## Elasticsearch: NÃO acessível publicamente

- **IP:** 35.247.248.40
- **Porta 9200:** Filtrada (nmap) / Sem resposta (curl)
- **Hostname:** elastic.bagy.com.br — também sem resposta
- **Conclusão:** Elasticsearch não está exposto na Internet

---

## API Endpoints Descobertos

| Endpoint | Método | Resposta | Notas |
|---|---|---|---|
| http://35.244.147.218:80/ | GET | 403 Forbidden | Google Frontend — precisa Host header vhost |
| http://35.199.71.234:80/{path} | GET | 404 page not found | Golang server — todos paths |
| http://35.199.71.234:443/ -k | GET | 404 page not found | HTTPS com Traefik default cert |
| https://basedeconhecimento.bagy.com.br/api/v2/ | GET | Zendesk 404 | API protegida por Cloudflare |
| https://basedeconhecimento.bagy.com.br/hc/pt-br/ | GET | Zendesk Help Center | Acessível (redireciona) |

---

## Vhost Fuzzing

**Resultado:** Nenhum vhost alternativo encontrado via ffuf nos IPs Azion (179.191.169.81) e GCP server (35.199.71.234). Todos os 73 subdomínios testados retornaram 400/404/403 — o conteúdo é roteado por CDN, não por IP direto.

---

## TLS/SSL Assessment

| Host | Cert CN | Validade | TLS Versões | Notas |
|---|---|---|---|---|
| Azion (179.191.x) | azion.com | 2025-12-16 → 2027-01-17 | TLS 1.2, 1.3 (h2) | Wildcard Azion |
| GoCache (170.82.x) | *.cdn.gocache.net | 2026-01-22 → 2027-01-23 | TLS 1.2, 1.3 | Wildcard GoCache |
| server.bagy (35.199.71.234) | TRAEFIK DEFAULT CERT | 2026-08-20 → 2026-08-21 | TLS 1.2 | Self-signed, expira em 1 dia! |
| Zendesk (216.198.x) | cloudflare | — | — | Cloudflare SSL |
| HubSpot (199.60.103.x) | hscoscdn30.net | 2026-07-23 → 2026-10-21 | TLS 1.2, 1.3 | HubSpot CDN |
| GitHub Pages (185.199.x) | *.github.io | 2026-08-02 → 2026-10-31 | TLS 1.2, 1.3 | Let's Encrypt |
| Firebase/Fastly (151.101.x) | firebaseapp.com | 2026-07-20 → 2026-10-18 | TLS 1.3, h3 | Fastly CDN |

---

## Ranking de Payoff

| # | Asset | Tipo | Prioridade | Razão |
|---|---|---|---|---|
| 1 | server.bagy.com.br (35.199.71.234) | Golang server oculto | **ALTA** | Serviço exposto sem CDN; Traefik default cert; pode conter API interna |
| 2 | on.bagy.com.br (WP 7.0.4 + Elementor 3.23.1) | CMS público | **ALTA** | WordPress 7.0.4 com Elementor — CVEs conhecidos |
| 3 | painel.bagy.com.br (198.202.211.1) | Painel admin | **MÉDIA** | Atrás de Cloudflare mas com IP de origem conhecido (Locaweb) |
| 4 | api-lb.bagy.com.br (35.244.147.218) | API Load Balancer | **MÉDIA** | GCP LB exposto; vhost discovery pode revelar APIs internas |
| 5 | updates.bagy.com.br (AWS ALB) | AnnounceKit | **MÉDIA** | AWS ALB público |
| 6 | homolog*.bagy.com.br (GoCache) | Homologação | **MÉDIA** | Ambientes de staging sem Cloudflare |
| 7 | minhaassinatura.bagy.com.br | Área de assinantes | **MÉDIA** | Apache com Bootstrap — default credentials? |
| 8 | temas.bagy.com.br (nginx) | Loja de temas | **MÉDIA** | Nginx na Azion |
| 9 | materiais.bagy.com.br (HubSpot) | Materiais | **BAIXA** | HubSpot CMS — pouco ataque |
| 10 | basedeconhecimento.bagy.com.br (Zendesk) | Knowledge base | **BAIXA** | Zendesk padrão |

---

## Recomendações para Enum/Webapp

1. **server.bagy.com.br** — Focar enum no Golang server:
   - Fuzzing de paths com wordlist API comum
   - Testar POST/PUT em todos endpoints
   - Verificar se Traefik dashboard está exposto em /dashboard/

2. **WordPress (on.bagy.com.br)** — Escanear com WPScan:
   - Plugins vulneráveis (Elementor 3.23.1)
   - Users enumeration
   - XML-RPC

3. **painel.bagy.com.br** — Bypass de Cloudflare:
   - Tentar acessar direto via IP de origem 198.202.211.1
   - Buscar subdomínios que não passam por Cloudflare

4. **api-lb.bagy.com.br** — Fuzzing de vhosts/endpoints:
   - Testar `Host: api.bagy.com.br`, `api-lb.bagy.com.br`, `api.internal`
   - Verificar GraphQL playground (/graphql, /graphiql)

5. **homolog*.bagy.com.br (GoCache)** — Testar com Host headers corretos:
   - Fuzzing de vhosts no GoCache
   - Buscar endpoints de admin/staging

---

## Arquivos de Output

```
recon/active/
├── nmap/
│   ├── nmap_azion.txt        # Scan Azion 14 IPs
│   ├── nmap_gcp.txt          # Scan GCP 5 IPs (2 up)
│   ├── nmap_gocache.txt      # Scan GoCache 4 IPs
│   ├── nmap_hubspot.txt      # Scan HubSpot 2 IPs
│   ├── nmap_zendesk.txt      # Scan Zendesk 2 IPs
│   └── nmap_other.txt        # Scan outros 18 IPs
├── httpx/
│   └── httpx_all.txt
├── whatweb/
│   ├── whatweb_azion.txt
│   └── whatweb_gcp_gocache.txt
├── vhosts/
│   ├── vhosts_azion_169.81.json
│   └── vhosts_gcp_server.json
├── waf/
│   └── waf_all.txt
├── tls/
│   ├── tls_azion.txt
│   ├── tls_ciphers.txt
│   └── tls_gcp_gocache.txt
├── probes/
│   ├── probes_elastic.txt
│   ├── probes_api.txt
│   ├── probes_golang.txt
│   └── probes_zendesk.txt
└── screenshots/
    ├── https---painel.bagy.com.br-.jpeg
    ├── https---on.bagy.com.br-.jpeg
    ├── https---minhaassinatura.bagy.com.br-.jpeg
    ├── https---updates.bagy.com.br-.jpeg
    ├── https---ig.bagy.com.br-.jpeg
    ├── https---temas.bagy.com.br-.jpeg
    ├── https---status.bagy.com.br-.jpeg
    └── https---manuais.bagy.com.br-.jpeg
```