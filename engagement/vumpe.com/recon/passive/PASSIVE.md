# Recon Passivo — vumpe.com

> **Data:** 2026-08-26  
> **Alvo:** vumpe.com (https://www.vumpe.com/)  
> **OPSEC:** Tor (127.0.0.1:9050) via proxychains4

---

## 1. Informações do Domínio

### WHOIS
- **Domínio:** vumpe.com
- **Registrado:** 2026-06-22 (~2 meses atrás)
- **Registrar:** GoDaddy.com, LLC
- **Nameservers:** `achiel.ns.cloudflare.com`, `katja.ns.cloudflare.com`
- **Status:** clientDelete/Transfer/RenewProhibited
- **DNSSEC:** unsigned

### DNS Records

| Tipo | Valor |
|------|-------|
| **A** | 104.21.68.192, 172.67.198.10 (Cloudflare) |
| **AAAA** | 2606:4700:3031::ac43:c60a, 2606:4700:3033::6815:44c0 |
| **MX** | mxa.mailgun.org, mxb.mailgun.org (Mailgun) |
| **NS** | achiel.ns.cloudflare.com, katja.ns.cloudflare.com |
| **TXT** | `v=spf1 include:mailgun.org ~all` |
| **DMARC** | `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net` |
| **SOA** | achiel.ns.cloudflare.com dns.cloudflare.com |
| **CNAME** | Nenhum |

> **Zone Transfer:** ❌ Bloqueado (Cloudflare — FORMERR em todos os NS)

---

## 2. Subdomínios Descobertos

**Total:** 18 subdomínios únicos (fontes: subfinder, assetfinder, crt.sh)

### Vivos (6) — Confirmados por HTTPX

| Subdomínio | Status | Tech | Descrição |
|------------|--------|------|-----------|
| **www.vumpe.com** | 200 | Cloudflare, Vercel, Next.js, React, Node.js, Webpack | Landing page principal |
| **vumpe.com** | 308 | Cloudflare | Redirect → www |
| **mcl.vumpe.com** | 200 | Vercel | Landing "Método Clipador Lucrativo" |
| **up-mcl.vumpe.com** | 200 | Vercel | Upsell page |
| **clipador.vumpe.com** | 307 | Vercel | Redirect → /login (app principal) |
| **anunciante.vumpe.com** | 307 | Vercel | Redirect → login (portal anunciante) |

### Mortos (12) — DNS only, sem HTTP response

| Subdomínio | Tipo |
|------------|------|
| mail.vumpe.com | MX record |
| webmail.vumpe.com | cPanel default |
| cpanel.vumpe.com | cPanel default |
| cpcalendars.vumpe.com | cPanel default |
| cpcontacts.vumpe.com | cPanel default |
| webdisk.vumpe.com | cPanel default |
| autodiscover.vumpe.com | cPanel default |
| moda.vumpe.com | (subfinder) |
| www.moda.vumpe.com | (subfinder) |
| kanaya.vumpe.com | (subfinder) |
| www.kanaya.vumpe.com | (subfinder) |

> **Nota:** Os subdomínios cPanel/mail são artefatos do antigo dono do domínio. O domínio mudou de mãos recentemente (registrado Jun/2026). Os subdomínios `moda` e `kanaya` também são legado.

---

## 3. Tech Stack Fingerprint

### www.vumpe.com
- **CDN:** Cloudflare (HTTP/3, Browser Insights)
- **Hosting:** Vercel (x-vercel-id, x-vercel-cache headers)
- **Framework:** Next.js (React)
- **Bundler:** Webpack
- **Linguagem:** Node.js
- **HSTS:** max-age=63072000
- **Robots.txt:** Presente (Content-Signals padrão)

### clipador.vumpe.com / anunciante.vumpe.com / mcl.vumpe.com / up-mcl.vumpe.com
- **Hosting:** Vercel (todos)
- **Servidores:** 216.150.1.65, 216.150.1.193, 216.150.16.193 (Vercel edge)

### Favicon Hash
- **mmh3:** `1079157775`
- **Shodan:** `http.favicon.hash:1079157775`

---

## 4. Stack Identificado no Source (Next.js)

### Plugins/Features identificados
- **Next.js 15** (App Router, React Server Components)
- **Framer Motion** (animações)
- **Tailwind CSS** (utility classes)
- **Lucide Icons** (componentes SVG)
- **next/image** (otimização de imagens Next.js)
- **next/font** (fontes: Bricolage Grotesque, Instrument Sans/Serif, JetBrains Mono)
- **Schema.org** (JSON-LD para Organization e WebSite)

### Metadados
- **Title:** "Vumpe - Corta. Posta. Pix na conta."
- **Description:** "A Vumpe conecta clipadores a campanhas de criadores e marcas..."
- **Locale:** pt_BR
- **Empresa:** Vumpe Tecnologia Ltda · Brasil

### Páginas/Funcionalidades (do HTML)
- Campanhas ativas (dinâmicas, feed via API)
- Simulador de ganhos
- FAQ interativo
- Login/registro (clipador.vumpe.com/login)
- Termos de Uso / Política de Privacidade

---

## 5. Wayback Machine & GAU

### waybackurls — 25 URLs
Endpoints históricos do antigo WordPress (2016-2019):
- `/wp-admin/admin-ajax.php`
- `/xmlrpc.php`
- `/wp-json/` (oEmbed, PUM/v1)
- `/wp-content/plugins/` (AAWP 3.6.8, Content Egg, Cookie Notice, Contact Form 7, Jetpack, Popup Maker)
- `/wp-content/themes/` (Hueman, GeneratePress, Twenty Seventeen)
- `/feed/`, `/robots.txt`
- `/author/admin/`

### gau — 796 URLs
Múltiplas URLs de produtos afiliados (Amazon, eBay):
- `/comprar-ksi-meritos-*` (produtos KSI Meritos)
- `/comprar-napapijri-*` (roupas Napapijri)
- `/comprar-superdry-*` (roupas Superdry)
- `/deportes/`, `/electronica/`, `/hogar/`, `/juguetes/`, `/moda/`
- `/divgdovg/`, `/gridinlux/`, `/yohoolyo/`, `/sportstech/`, `/prismacolor/`
- `/tag/*` (múltiplas tags de categorias)
- `/wp-content/uploads/` (múltiplos uploads 2016-2019)

> **Nota:** Todo o conteúdo do Wayback/GAU é do antigo WordPress (site de afiliados/coupon). O site atual é um Next.js totalmente diferente.

---

## 6. Cloud Buckets

### Testados (acesso público negado)

| Bucket | Serviço | Status |
|--------|---------|--------|
| vumpe.s3.amazonaws.com | AWS S3 | 404 (inexistente) |
| vumpe-assets.s3.amazonaws.com | AWS S3 | 404 |
| vumpe-backup.s3.amazonaws.com | AWS S3 | 404 |
| vumpe-data.s3.amazonaws.com | AWS S3 | 404 |
| vumpe-app.s3.amazonaws.com | AWS S3 | 404 |
| vumpe-api.s3.amazonaws.com | AWS S3 | 404 |
| vumpe-cdn.s3.amazonaws.com | AWS S3 | 404 |
| vumpe-static.s3.amazonaws.com | AWS S3 | 404 |
| vumpe.storage.googleapis.com | GCP | 404 |
| vumpe-assets.storage.googleapis.com | GCP | 404 |
| vumpe.blob.core.windows.net | Azure | 000 (timeout/blocked) |
| vumpe.sfo2.digitaloceanspaces.com | DO | 404 |

### Bucket Vazado no Source Code
```
social-tracker-bucket-production.s3.us-east-1.amazonaws.com
```
- **Status:** 403 AccessDenied (bucket existe, acesso negado à listagem pública)
- **Uso:** Armazena thumbnails de torneios/campanhas (JPEG/PNG)
- **Localização:** us-east-1
- **Potencial:** Pode conter dados sensíveis se configurado incorretamente

---

## 7. Subdomain Takeover

### Resultados subjack
- `vumpe.com` — **Não vulnerável**

### CNAME Analysis
- Nenhum CNAME encontrado nos registros DNS
- Todos os subdomínios vivos apontam para Vercel (edge IPs 216.150.x.x)
- Cloudflare nameservers estão configurados corretamente

---

## 8. Passive SSL/TLS

### Certificados (crt.sh)
- 17 subdomínios certificados (incluindo wildcard `*.vumpe.com`)
- Emissor: Cloudflare SSL (certificados de borda)
- Todos os subdomínios do cPanel possuem certificados (legado)

---

## 9. Observações Gerais

### Infraestrutura Atual
```
Cloudflare (CDN/WAF/DDoS)
  ├── www.vumpe.com → Vercel (Next.js)
  ├── vumpe.com → redirect → www
  ├── clipador.vumpe.com → Vercel (Next.js app)
  ├── anunciante.vumpe.com → Vercel (Next.js app)
  ├── mcl.vumpe.com → Vercel (landing page)
  └── up-mcl.vumpe.com → Vercel (upsell page)
```

### Pontos de Interesse para Recon Ativo
1. **API endpoints** — O Next.js consome dados dinâmicos (campanhas, stats). Procurar `/api/` no JS bundle
2. **S3 Bucket exposto** — `social-tracker-bucket-production` (tentar diferentes métodos de acesso)
3. **clipador.vumpe.com** — App com login (provável autenticação JWT/session)
4. **anunciante.vumpe.com** — Portal do anunciante (possível cadastro CNPJ)
5. **Email DMARC** — `dmarc_rua@onsecureserver.net` (possível vetor de phishing)
6. **Mailgun** — MX aponta para Mailgun (possível painel administrativo)
7. **cPanel legado** — DNS records mortos mas ainda existentes (domain takeover? verificar)

### Estatísticas do Site (via source code)
- **Total de views:** 2.719.646.041
- **Views/segundo:** 77
- **Total pago:** R$ 822.289,46
- **Campanhas ativas:** 4 (R$ 4,00–6,00 por 1000 views)

---

**Artefatos salvos em:** `recon/passive/`
```
whois.txt
dns_any.txt
dnsrecon_std.txt
dnsrecon_axfr.txt
subfinder_raw.txt
assetfinder_raw.txt
crtsh_subdomains.txt
subdomains_all.txt
httpx_tech.txt
whatweb.txt
wayback_urls.txt
gau_urls.txt
favicon_hash.txt
cloud_buckets.txt
subjack_results.txt
github_search.txt
index_head.html
PASSIVE.md
```