# PASSIVE Recon — ice.bet.br

**Date:** 2026-09-03 UTC
**Operator:** recon-passive
**Target:** ice.bet.br (OIG GAMING BRAZIL LTDA — CNPJ 55.459.453/0001-72)

---

## 1. DNS & Infra Foundation

| Record | Value |
|--------|-------|
| **Registrant** | OIG GAMING BRAZIL LTDA |
| **CNPJ** | 55.459.453/0001-72 |
| **Responsável** | Daniel Martins de Brito (danielpiaui@gmail.com) |
| **Nameservers** | igor.ns.cloudflare.com, love.ns.cloudflare.com (**Cloudflare**) |
| **A (Cloudflare)** | 104.18.12.221, 104.18.13.221 |
| **AAAA** | 2606:4700::6812:cdd, 2606:4700::6812:ddd |
| **MX** | ProtonMail (mail.protonmail.ch, mailsec.protonmail.ch) |
| **SPF** | `include:amazonses.com include:_spf.protonmail.ch ~all` |
| **DMARC** | `p=quarantine` |
| **CAA** | ❌ None (vulnerável) |
| **DNSSEC** | ❌ Não configurado |
| **AXFR** | 🔒 Bloqueado (Cloudflare) |
| **Created** | 2025-08-01 |
| **Hosting** | Vercel (frontend) + Cloudflare (CDN) + AWS (backend) |

---

## 2. Subdomínios

### Fontes consultadas
- crt.sh: 53 entries
- subfinder: 36 entries
- assetfinder: 81 entries
- gau: 11 additional
- **Total únicos: 38 subdomínios**

### Todos os subdomínios (arquivo: `subdomains_all.txt`)
admin-develop, admin-snake, admin, api-dev, api, bet-hint, betslip, blog, cdn.blog, communication-unsubscribe, develop, docs, face-recognition{1-5}, geo-dev, geo, geolocation, grafana-dev, grafana, gtm, ice.bet.br, imgix, loki, popok, proxy-dev, slots-euro, slots, snake, sports, status, track, unavailable, unsubscribe, unsubscribed, www

### Subdomínios vivos (arquivo: `subdomains_live.txt`) — 35 resolvidos, ~30 HTTPS vivos

---

## 3. Tech Stack & Fingerprint

### Main Site (ice.bet.br)
- **Framework:** Next.js (App Router + Turbopack)
- **Frontend:** React + Webpack + Turbopack
- **Backend:** Node.js
- **Hosting:** Vercel (x-vercel-id: gru1::...)
- **CDN:** Cloudflare + Vercel Edge
- **Status:** 200 OK
- **Content:** 943KB página principal (grande - app PWA)
- **Favicon hash (mmh3):** -1900209942

### Blog (blog.ice.bet.br) — 200 OK
- **Stack:** Next.js + React + Node.js + Webpack
- **Hosting:** Amazon S3 (+ CloudFront)
- **Title:** "ICE Blog — Apostas Esportivas e Cassino"

### Face Recognition (face-recognition{1-5}.ice.bet.br) — 200 OK
- **Stack:** Next.js + React + Node.js + Webpack
- **Hosting:** Amazon CloudFront + Cloudflare
- **Content:** 95KB each (face recognition KYC modules)

### Admin (admin.ice.bet.br) — 401 Unauthorized
- **Auth:** Basic Auth (realm="Login")
- **Hosting:** Amazon CloudFront (Cloudflare in front)
- **Favicon hash:** not found

### Admin Develop (admin-develop.ice.bet.br) — 401
- Same pattern as admin

### Develop (develop.ice.bet.br) — 401
- Behind Vercel (x-vercel-id: gru1)
- Returns 103 Early Hints (Next.js)

### Sports API (sports.ice.bet.br) — 200 OK
- **Response:** `{"service":"sports-management","ok":true}`
- Backend API service, JSON

### Status Page (status.ice.bet.br) — 200 OK
- **Stack:** Caddy server + UIKit + jQuery 3.7.1
- **Title:** "Ice Status"
- **Favicon hash:** -687502042
- **Hosting:** UptimeRobot (stats.uptimerobot.com CNAME)

### Imgix (imgix.ice.bet.br) — 200 OK
- **Service:** Imgix Image Processing CDN
- **Title:** "Imgix - Image Processing On-Demand, Served By CDN"

### Communication Unsubscribe (communication-unsubscribe.ice.bet.br) — 200
- **Title:** "Descadastro — ICE"
- Unsubscribe landing page

### Unavailable (unavailable.ice.bet.br) — 200
- Same as main site (ICE BET) — maintenance/unavailable page

### API (api.ice.bet.br) — 400 Bad Request
- `{"statusCode":400,"error":"Bad Request","message":"Tenant identification is required"}`

### API Dev (api-dev.ice.bet.br) — 400 Bad Request
- Same response as API

### Slots (slots.ice.bet.br) — 400
- `{"statusCode":400,"error":"Bad Request","message":"Tenant identification is required"}`
- Requires Tenant header

### Track (track.ice.bet.br) — 403 Forbidden
- **Server:** Kong API Gateway 
- **CNAME:** hh1yo.ttrk.io (Tune tracking)
- **Headers:** X-Kong-Upstream-Latency, X-Kong-Proxy-Latency, X-Kong-Request-Id
- **CORS:** `Access-Control-Allow-Origin: *` ⚠️
- Redirects to `/disabled.html`

### Bet Hint / Betslip (bet-hint/betslip.ice.bet.br) — 404
- JSON response
- **CORS:** `Access-Control-Allow-Origin: *` ⚠️

### CDN Blog (cdn.blog.ice.bet.br) — 403
- Amazon S3 bucket (sa-east-1 region)
- Behind CloudFront

### Grafana & Loki — Timeout (ELB blocked)
- **CNAME:** dualstack.k8s-monitori-lokigraf-*.sa-east-1.elb.amazonaws.com
- AWS EKS monitoring stack (Grafana + Loki)
- Access restricted (security groups)

### Popok — Timeout (ELB blocked)
- **CNAME:** k8s-apps-popoking-*.sa-east-1.elb.amazonaws.com
- "Popoking" game application on AWS EKS

---

## 4. AWS Infra Mapeada

### S3 Buckets
| Bucket | Region | Access |
|--------|--------|--------|
| **ice-game** | sa-east-1 | ✅ Objects public (403 listing) |
| **ice-game-dev** | sa-east-1 | 403 (exists) |
| *Others tested* | - | 404 not found |

### S3 Endpoints (hardcoded in JS)
- `https://ice-game.s3.sa-east-1.amazonaws.com/logos/favicon.png`
- `https://ice-game.s3.sa-east-1.amazonaws.com/` (used as preconnect)

### AWS ELBs (EKS/Kubernetes)
- `k8s-apps-popoking-0fb116d2db-490437497.sa-east-1.elb.amazonaws.com` — **Popoking app**
- `k8s-monitori-lokigraf-8922f80654-351181799.sa-east-1.elb.amazonaws.com` — **Grafana + Loki**
- `k8s-monitori-lokigraf-4226ae1329-1586334385.sa-east-1.elb.amazonaws.com` — **Grafana Dev**

### CloudFront Distributions
- `dn7t5r2ntmbc3.cloudfront.net` (cdn.blog.ice.bet.br)
- admin.ice.bet.br behind CloudFront
- admin-develop.ice.bet.br behind CloudFront

---

## 5. OSINT Findings

### Company Info
- **Nome:** OIG GAMING BRAZIL LTDA
- **CNPJ:** 55.459.453/0001-72
- **Responsável:** Daniel Martins de Brito
- **Email:** danielpiaui@gmail.com

### Emails Encontrados
- danielpiaui@gmail.com (WHOIS contact)
- protonmail-verification (confirms @protonmail usage)
- AWS SES used for transactional emails

### Apple App Store
- **App ID:** 6796556572
- **App Name:** Ice Bet (inferido do manifest)
- **Deep links:** Via PWA manifest

### rotas Sensíveis (robots.txt)
- `/account`
- `/verification`
- `/bonus-history`
- `/deposit-history`
- `/game-history`
- `/copy-history`
- `/wallet`
- `/withdraw-history`
- `/gamblers`
- `/affiliates`
- `/sports/bets`

### Sitemap Endpoints
- `sitemap-main.xml` (main pages)
- `sitemap-providers.xml` (game providers)
- `sitemap-games.xml` (game listing)
- `sitemap-tournaments.xml`
- `sitemap-tags.xml`
- `sitemap-sports.xml`

### GitHub OSINT
- 0 results for "ice.bet.br"
- 0 results for "icebet" (no public repos)

### Breach OSINT
- No confirmed breaches in public sources
- ProtonMail + AWS SES for email suggests mature email security

---

## 6. Wayback / Historical URLs

- **Total URLs archived:** 919 (via GAU)
- **JS files:** 108
- **Sensitive endpoints:** 17
- Key Next.js data routes exposed:
  - `/_next/data/ysCDFWcoE-_61e5-SbE5P/pt/*.json` — API data routes
  - `/_next/static/chunks/*.js` — JS chunks with game logic
  - Game slugs exposed in URLs (aviator-spribe, 7gamesvegas-popok, etc.)

---

## 7. Cloud Bucket & Takeover Assessment

### Subdomain Takeover Candidates
| Subdomain | CNAME Target | Status | Risk |
|-----------|-------------|--------|------|
| proxy-dev.ice.bet.br | ❌ No A/CNAME record | 🔴 **DEAD** — potential takeover | **Médio** |
| unsubscribe.ice.bet.br | ❌ No A/CNAME record | 🔴 **DEAD** — potential takeover | **Médio** |
| unsubscribed.ice.bet.br | ❌ No A/CNAME record | 🔴 **DEAD** — potential takeover | **Médio** |
| cdn.blog.ice.bet.br | cloudfront.net | 🟢 Active (403) | **Baixo** (active) |
| grafana.ice.bet.br | AWS ELB | 🟢 Active (blocked) | **Baixo** (active) |
| track.ice.bet.br | ttrk.io | 🟢 Active (Kong) | **Baixo** (active) |
| status.ice.bet.br | uptimerobot.com | 🟢 Active (200) | **Baixo** (active) |

### Cloud Buckets
| Bucket Name | Status | 
|-------------|--------|
| ice-game (sa-east-1) | ✅ Exists — objects public |
| ice-game-dev | ✅ Exists — 403 |
| icebet / ice.bet.br / etc | ❌ Not found |

---

## 8. Findings Preliminares

### 🔴 Alta Prioridade
1. **S3 Bucket `ice-game` com objetos públicos** — Assets acessíveis sem autenticação. Verificar se há dados sensíveis.
2. **CORS wildcard (`Access-Control-Allow-Origin: *`)** em bet-hint.ice.bet.br e betslip.ice.bet.br — Pode permitir exfiltração cross-origin.
3. **Grafana + Loki expostos (mesmo que bloqueados)** — Nomes DNS e ELBs expõem a stack de monitoração. Verificar no recon ativo se alguma porta alternativa está aberta.

### 🟡 Média Prioridade
4. **Painéis admin com Basic Auth (admin.ice.bet.br)** — 401 realm="Login". Testar creds default/fraco no recon ativo.
5. **API endpoints sem tenant (api, api-dev, slots)** — Retornam erro mas confirmam serviços backend. Testar tenant bypass.
6. **proxy-dev.ice.bet.br sem DNS** — Pode ser takeover candidate se o recurso cloud for recriado.
7. **Kong API Gateway exposto (track.ice.bet.br)** — Headers X-Kong confirmam gateway. Possível exploração.
8. **develop.ice.bet.br com 401 Vercel** — Basic auth? Verificar se há bypass no recon ativo.

### 🟢 Baixa Prioridade
9. **Sem CAA/DNSSEC** — Permite emissão não autorizada de certificados.
10. **Next.js data routes expostas** — JSON com dados de jogos expostos via `/_next/data/`.
11. **robots.txt com paths sensíveis** — /wallet, /affiliates, /account (mas é público).
12. **Apple App Store ID exposto** — 6796556572.

---

## 9. IPs de Origem Real (fora Cloudflare)

| IP | Serviço | Host |
|----|---------|------|
| 54.232.237.3, 177.71.251.150, 52.67.209.5 | AWS EKS | grafana-dev.ice.bet.br |
| 54.232.192.197, 56.126.34.141, 177.71.149.55 | AWS EKS | grafana.ice.bet.br, loki.ice.bet.br |
| 18.229.88.26, 54.94.51.45, 56.125.207.171 | AWS EKS | popok.ice.bet.br |
| 216.238.112.42 | Kong Gateway | track.ice.bet.br |
| 142.132.149.97 | UptimeRobot | status.ice.bet.br |
| 76.223.121.6, 166.117.85.175 | AWS? | slots-euro.ice.bet.br |
| 3.174.83.35, .47, .97, .42 | AWS/S3 | cdn.blog.ice.bet.br |

**Todos os IPs AWS estão em sa-east-1 (São Paulo).**

---

## 10. Recomendações para Recon Ativo

### Portscan Prioritário
1. **IPs AWS (54.232.x.x, 177.71.x.x, 18.229.x.x, 52.67.x.x)** — Escanear portas comuns (grafana: 3000, loki: 3100, node: 3000, etc.)
2. **Kong Gateway (216.238.112.42)** — Escanear portas admin (8001, 8444) e proxy (8000, 8443)
3. **slots-euro (76.223.121.6)** — Escanear todas as portas (serviço diferente)

### Web Enumeration
4. **admin.ice.bet.br** — Testar creds default (admin:admin, admin:icebet, etc.)
5. **develop.ice.bet.br** — Testar bypass de autenticação Basic
6. **api.ice.bet.br** — Testar tenant header injection
7. **sports.ice.bet.br** — Fuzz endpoints e métodos HTTP
8. **track.ice.bet.br** — Fuzz caminhos Kong (/admin, /status, /api)

### Cloud
9. **S3 ice-game** — Enumerar objetos (com aws-cli ou diretórios comuns)
10. **dead DNS** — proxy-dev, unsubscribe, unsubscribed — verificar takeover

### Next.js
11. Fetch `_buildManifest.js` para obter rotas internas
12. Analisar JS chunks para chaves de API, endpoints internos

---

## 11. Limitações

- theHarvester não funcionou (erro de instalação) — emails podem ser subnotificados
- Shodan/Censys sem API key configurada
- GitHub search sem resultados públicos (pode ter privados)
- Wayback machine retornou poucos snapshots (domínio criado em 2025)
- Grafana/Loki/Popok não respondem (firewall AWS) — precisam de scan ativo
- Tor usado via proxychains4, mas alguns serviços cloud podem detectar IPs Tor

---

## 12. Artefatos Gerados

| Arquivo | Descrição |
|---------|-----------|
| `dns_full.txt` | DNS records completos |
| `subdomains_all.txt` | 38 subdomínios únicos |
| `subdomains_live.txt` | 35 resolvidos + ~30 vivos HTTPS |
| `subdomains_resolved.txt` | Subdomínios com IPs |
| `dns_resolved.txt` | IPs de todos os subdomínios |
| `httpx_probe.txt` | HTTP probe com tech detect |
| `wayback_urls.txt` | 919 URLs do Wayback/GAU |
| `wayback_sensitive.txt` | 17 endpoints sensíveis |
| `wayback_js.txt` | 108 JS files |
| `wayback_api.txt` | 5 API endpoints |
| `crt_sh_raw.txt` | crt.sh raw output |
| `subfinder_raw.txt` | subfinder raw |
| `assetfinder_raw.txt` | assetfinder raw |
| `gau_subs_raw.txt` | gau subdomains |

---

**End of PASSIVE.md**