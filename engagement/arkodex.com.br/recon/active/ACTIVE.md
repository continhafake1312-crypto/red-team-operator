# ACTIVE.md — Recon Ativo arkodex.com.br
**Data:** 2026-08-26T05:35 UTC  
**Operador:** recon-active  
**Alvo:** arkodex.com.br — Plataforma de bots Discord/WhatsApp/Telegram  

---

## Sumário Executivo

Realizado scan ativo de portas, fingerprint de serviços, análise TLS, enumeração DNS, vhost fuzzing e probe web nos hosts do escopo. O IP de origem real (34.46.128.254) está protegido por Caddy — apenas 3 portas abertas e sem bypass de Host header. O ataque surface principal é o CloudFront/CDN que expõe ~48 endpoints API.

---

## 1. Host: 34.46.128.254 — GCP (ORIGEM REAL)

### 🔴 Port Scan (1-65535)
| Porta | State | Service | Version |
|-------|-------|---------|---------|
| 53/tcp | Open | DNS | PowerDNS Authoritative Server 4.9.3 |
| 80/tcp | Open | HTTP | BaseHTTPServer 0.6 (Python 3.12.13) + Caddy reverse proxy |
| 443/tcp | Open | HTTPS | SSL handshake fails — tlsv1 alert internal error |

**NOTA:** Nmap SYN scan mostrou 65532 filtered ports (no-response), indicando firewall restritivo no GCP.

### HTTP (porta 80)
- **Caddy** responde com `403 Forbidden` para qualquer requisição direta ao IP, independente do Host header
- **Server header:** `BaseHTTP/0.6 Python/3.12.13`, `Via: 1.0 Caddy`
- **Body:** `forbidden` (10 bytes, text/plain)
- Caddy configurado para rejeitar tráfego que não vem via CloudFront/Cloudflare

### HTTPS (porta 443)
- **TLS handshake:** `tlsv1 alert internal error` — certificado ausente/quebrado
- Nenhum certificado TLS foi servido
- Serviço HTTPS não funcional

### DNS (porta 53)
- **PowerDNS Authoritative Server 4.9.3**
- Hospeda zonas DNS para:
  - `arkodex.com.br` -> 34.46.128.254
  - `cloud.arkodex.com` -> 34.46.128.254
  - `arkanostore.com.br` -> 34.46.128.254
  - `arksteam.mginex.site` -> 34.46.128.254
- **Todos** usam `parking1.unstoppabledomains.com` / `parking2.unstoppabledomains.com` como NS
- **AXFR:** Bloqueado
- **Recursion:** Não disponível
- **CH version.bind:** Bloqueado

### Vhost Fuzzing (50 subdomínios)
- Nenhum vhost adicional descoberto apontando para 34.46.128.254
- Todos os Host headers testados retornaram 403

### Análise de Risco
- 🔴 **PowerDNS 4.9.3** — versão relativamente recente, mas DNS server exposto publicamente (possível amplification attack, info disclosure)
- 🔴 **Python 3.12.13 + BaseHTTP 0.6** — versão recente do Python, BaseHTTP é uma lib leve/desatualizada
- 🟡 **Caddy** — sem versão específica identificada, mas Caddy é conhecido por ser seguro por padrão
- 🟢 **IP atrás de firewall GCP** — apenas 3 portas abertas, bem configurado

---

## 2. Host: arkodex.com.br — CloudFront/CDN

### Web Fingerprint (whatweb + curl)
| Item | Valor |
|------|-------|
| URL Principal | `https://arkodex.com.br` |
| Status | 200 OK |
| Server | Caddy (via 1.1 Caddy) |
| CDN | AWS CloudFront (99.83.186.151 / 75.2.96.173) |
| PaaS | discloud.com (X-Powered-By) |
| AWS Region | eu-central-1 |
| AWS Instance ID | `i-00fca36e644f15358` (site-config, services, docs) / `i-0147a504247b58069` (api/me, products) |
| Tech | React + Vite SPA |
| Framework | Inter font, Google Fonts |
| Analytics | Google Ads AW-17703692532 |
| Favicon Hash | 2072059234 |
| HSTS | max-age=15552000; includeSubDomains |
| CSP | Restritiva (`default-src 'self'`) |
| WAF | Nenhum detectado (wafw00f) |
| Rate Limit | 120 req/60s por endpoint |

### HTTP → HTTPS Redirect
- `http://arkodex.com.br` -> `308 Permanent Redirect` -> `https://arkodex.com.br`

### Headers de Segurança
- `Strict-Transport-Security: max-age=15552000; includeSubDomains`
- `Content-Security-Policy:` restritiva (ver raw)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `X-XSS-Protection: 1; mode=block`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

### API Endpoints Mapeados (com status)

| Endpoint | Método | Status | Acesso |
|----------|--------|--------|--------|
| `/api/site-config` | GET | 200 OK | Público |
| `/api/services` | GET | 200 OK | Público |
| `/api/docs` | GET | 200 OK | Público |
| `/api/products` | GET | 200 OK | Público |
| `/api/categories` | GET | 200 OK | Público |
| `/api/sources` | GET | 200 OK | Público (vazio) |
| `/api/me` | GET | 401 Unauthorized | Requer auth |
| `/api/analytics` | GET | 404 | Requer auth |
| `/api/overview` | GET | 404 | Requer auth |
| `/api/revenue` | GET | 404 | Requer auth |
| `/api/applications` | GET | 404 | Requer auth |
| `/api/orders` | GET | 404 | Requer auth |
| `/api/checkout` | GET | 404 | Requer auth |
| `/api/clients` | GET | 404 | Requer auth |
| `/api/coupons` | GET | 404 | Requer auth |
| `/api/trials` | GET | 404 | Requer auth |
| `/api/gallery` | GET | 404 | Requer auth |
| `/api/payment` | GET | 404 | Requer auth |
| `/api/config` | GET | 404 | Requer auth |
| `/api/email/test` | GET | 404 | Requer auth |
| `/api/bumpy-tokens` | GET | 404 | Requer auth |

### Rotas SPA (client-side, all 200)
- `/admin/`, `/dashboard/`, `/login`, `/checkout`, `/config`, `/settings`, `/billing`, `/profile`

### Dados Expostos via APIs Públicas
- **`/api/site-config`**: Nome da marca, logo, favicon, SEO meta tags, theme color
- **`/api/services`**: Preço único R$ 9.90, status do serviço
- **`/api/products`**: 1 produto (ArkBot), descrição completa com features, link para GitHub Pages
- **`/api/categories`**: 4 categorias (Discord, WhatsApp, Telegram, Outros)
- **`/api/docs`**: 5 artigos de documentação pública
- **`robots.txt`**: Disallow: /admin, /dashboard

---

## 3. Host: arkanostore.com.br

| Item | Valor |
|------|-------|
| Status | 403 Forbidden |
| Server | Cloudflare |
| WAF | Cloudflare (genérico) |
| Nota | Domínio relacionado, mesma operação, bloqueado para IP do scanner |

---

## 4. Host: arksteam.mginex.site

| Item | Valor |
|------|-------|
| Status | 403 Forbidden + JS Challenge |
| Server | Cloudflare |
| WAF | Cloudflare (JS challenge interativo) |
| Nota | Domínio de Steam/Games, proteção Cloudflare ativa |

---

## 5. Findings Preliminares

### 🟡 Finding PRE-001 — AWS Instance ID Exposto
**Severidade:** Média  
**Descrição:** Os headers HTTP de resposta incluem `x-aws-instance-id` com o ID real da instância EC2 (i-00fca36e644f15358 e i-0147a504247b58069). Isso permite identificar o provider de nuvem e potencialmente a instância exata.  
**Evidência:** Headers HTTP em todas as respostas da API  
**Impacto:** Informação sensível exposta, auxilia ataques direcionados

### 🟡 Finding PRE-002 — AWS Region Exposta
**Severidade:** Média  
**Descrição:** O header `x-aws-region: eu-central-1` expõe a região AWS exata  
**Evidência:** Headers HTTP  
**Impacto:** Auxilia geolocalização de infraestrutura

### 🟡 Finding PRE-003 — discloud.com PaaS Identificada
**Severidade:** Baixa  
**Descrição:** O header `x-powered-by: discloud.com` revela o provedor de hospedagem  
**Evidência:** Headers HTTP  
**Impacto:** Possíveis CVEs na plataforma discloud.com

### 🟡 Finding PRE-004 — PowerDNS Público Exposto
**Severidade:** Média  
**Descrição:** Servidor PowerDNS Authoritative Server 4.9.3 exposto na porta 53 do IP de origem (34.46.128.254). Serve zonas DNS para múltiplos domínios.  
**Evidência:** nmap + dig queries  
**Impacto:** DNS amplification, enumeração de subdomínios de outros dominios hospedados

### 🟡 Finding PRE-005 — TLS Quebrado na Origem
**Severidade:** Média  
**Descrição:** Porta 443 no IP de origem (34.46.128.254) responde com erro interno de TLS, sem certificado válido  
**Evidência:** openssl s_client + nmap  
**Impacto:** Indica configuração incompleta/incorreta do Caddy para HTTPS

### 🟢 Finding PRE-006 — Rate Limiting Implementado
**Severidade:** Informativo  
**Descrição:** 120 requisições por minuto por endpoint (headers `ratelimit-limit`, `ratelimit-remaining`, `ratelimit-reset`)  
**Evidência:** Headers HTTP em todas as respostas da API  
**Impacto:** Proteção contra brute force, mas limitante para testes

---

## 6. Ranking de Payoff Atualizado

| Prioridade | Alvo | Payoff Potencial | Nota |
|------------|------|------------------|------|
| 🔴 **ALTA** | `/api/*` endpoints públicos | Dados estruturados de produtos, serviços e docs expostos | `/api/products`, `/api/services`, `/api/site-config`, `/api/docs` |
| 🔴 **ALTA** | `/api/*` endpoints auth (IDOR) | Acesso a dados de clientes, pedidos, analytics, billing | `/api/analytics`, `/api/orders`, `/api/clients`, `/api/revenue` |
| 🟡 **MÉDIA** | Auth bypass em APIs | Acesso total ao painel admin | JWT manipulation, session hijacking |
| 🟡 **MÉDIA** | PowerDNS (34.46.128.254:53) | Enumeração de domínios, possível cache poisoning | DNS server exposto |
| 🟡 **MÉDIA** | 34.46.128.254 — CVE Python 3.12.13 | Possível RCE/info disclosure via Python | BaseHTTP/0.6 desatualizado? |
| 🟡 **MÉDIA** | AWS Instance ID exposto | Ataque direcionado à EC2 | ID exposto em headers |
| 🟢 **BAIXA** | discloud.com CVEs | Escalate via plataforma PaaS | - |
| 🟢 **BAIXA** | TLS broken on origin | SSL Stripping possível | HTTPS não funcional |

---

## 7. Próximos Passos Recomendados (para enum/webapp)

1. **🔴 Enumeração Profunda:**
   - Content discovery nos endpoints SPA (/admin/*, /dashboard/*) com ffuf/gobuster
   - JS analysis do bundle `assets/index-BiE5S8wc.js` (334KB) para encontrar mais endpoints/parametros
   - Testar IDOR nos endpoints auth (`/api/me` com diferentes IDs, `/api/orders/1`, etc.)
   - Fuzz de parametros nos endpoints públicos

2. **🔴 Webapp Testing:**
   - Auth bypass: tentar `Authorization: Bearer null`, `none` algorithm JWT, SQLi no login
   - Testar SSRF em `/api/gallery`, `/api/sources` (se aceitarem URLs)
   - SQLi/NoSQLi nos endpoints de busca
   - Mass assignment: tentar `isAdmin=true` em POST/PUT
   - Testar file upload se existir endpoint

3. **🟡 CVE Research:**
   - PowerDNS 4.9.3: CVE-2023-50387 (KeyTrap), CVE-2023-50868 (NSEC3)
   - Python 3.12.13: verificar CVEs recentes
   - discloud.com: buscar vulnerabilidades conhecidas

4. **🟡 DNS:**
   - Tentar zone walk no PowerDNS
   - Enumerar mais subdomínios via DNS brute force

---

*Documento gerado em 2026-08-26T05:35 UTC pelo agente recon-active*