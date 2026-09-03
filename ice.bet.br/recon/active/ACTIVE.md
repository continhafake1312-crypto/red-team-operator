# ACTIVE Recon — ice.bet.br

**Date:** 2026-09-03 UTC
**Operator:** recon-active
**Target:** ice.bet.br (OIG GAMING BRAZIL LTDA)

---

## 1. Hosts Diretos (Fora Cloudflare/CDN)

### AWS EKS — Grafana/Loki (GRUPO 1)
| IP | Serviço | Portas Abertas | Notas |
|----|---------|---------------|-------|
| 54.232.237.3 | AWS ELB (EKS) | ❌ Nenhuma | Security group bloqueia tudo |
| 177.71.251.150 | AWS ELB (EKS) | ❌ Nenhuma | Security group bloqueia tudo |
| 52.67.209.5 | AWS ELB (EKS) | ❌ Nenhuma | Security group bloqueia tudo |
| 54.232.192.197 | AWS ELB (EKS) | ❌ Nenhuma | Security group bloqueia tudo |
| 56.126.34.141 | AWS ELB (EKS) | ❌ Nenhuma | Security group bloqueia tudo |
| 177.71.149.55 | AWS ELB (EKS) | ❌ Nenhuma | Security group bloqueia tudo |

**Veredito:** Todos os 9 IPs AWS EKS respondem a ping mas têm security groups bloqueando todas as portas testadas (22,80,443,3000,3100,8080,8443,9090,9093,9094,6443,10250). Grafana/Loki/Popok não expostos diretamente.

### AWS EKS — Popok (GRUPO 2)
| IP | Serviço | Portas Abertas | Notas |
|----|---------|---------------|-------|
| 18.229.88.26 | AWS ELB (EKS) | ❌ Nenhuma | Security group bloqueia tudo |
| 54.94.51.45 | AWS ELB (EKS) | ❌ Nenhuma | Security group bloqueia tudo |
| 56.125.207.171 | AWS ELB (EKS) | ❌ Nenhuma | Security group bloqueia tudo |

### Kong API Gateway 🟢 DIRETO
| IP | Hostname | Portas Abertas | Serviços |
|----|----------|---------------|----------|
| 216.238.112.42 | `*.vultrusercontent.com` | **22** (SSH), **80** (HTTP), **443** (HTTPS), **8000** (HTTP) | OpenSSH 9.6p1 Ubuntu, Kong API Gateway |

**Detalhes Kong:**
- **22/tcp**: OpenSSH 9.6p1 (Ubuntu 3ubuntu13.14) — Linux
- **80/tcp**: Kong (404 "no Route matched with those values" sem Host header)
- **443/tcp**: Kong SSL (Let's Encrypt — track.ice.bet.br)
- **8000/tcp**: Kong proxy (same as 80)
- **8001/admin API**: 🔴 FILTRADO (não exposto externamente)
- **8444/admin SSL**: 🔴 FILTRADO

**Vhost routing (Kong):**
- `Host: track.ice.bet.br` → 403 Forbidden → redirect `/disabled.html` ✅
- Outros Host headers → 404 "no Route matched" 

### Slots-euro (AWS Global Accelerator)
| IP | Serviço | Portas Abertas | Notas |
|----|---------|---------------|-------|
| 76.223.121.6 | AWS Global Accelerator | **443/tcp** (awselb/2.0) | 404 todos paths |
| 166.117.85.175 | AWS Global Accelerator | **443/tcp** (awselb/2.0) | 404 todos paths |

### CDN Blog (CloudFront Origins)
| IP | Portas | Notas |
|----|--------|-------|
| 3.174.83.35, .47, .97, .42 | 80/tcp, 443/tcp | CloudFront origin servers (gru3) — direto não responde |

### Status Page (UptimeRobot) 🟢 DIRETO
| IP | Serviço | Portas | Notas |
|----|---------|--------|-------|
| 142.132.149.97 | UptimeRobot (psp-clients-primary) | **443/tcp** | Caddy + PHP (Laravel/sessions) |

---

## 2. Hosts Cloudflare (com CDN)

| Subdomínio | Status | Serviço | Tech Stack |
|------------|--------|---------|------------|
| **ice.bet.br** | 200 OK | Next.js + Vercel + Cloudflare | Next.js (Turbopack), React, x-vercel-id: gru1, x-powered-by: Next.js |
| **admin.ice.bet.br** | 401 | CloudFront + Cloudflare | Basic Auth realm="Login", CloudFront GRU1 |
| **admin-develop.ice.bet.br** | 401 | CloudFront + Cloudflare | Basic Auth realm="Login", CloudFront GRU1 |
| **admin-snake.ice.bet.br** | 401 | CloudFront + Cloudflare | Basic Auth realm="Login" |
| **develop.ice.bet.br** | 401 | Vercel Deployment Protection | Next.js + Vercel, retorna 103 Early Hints + 401 |
| **api.ice.bet.br** | 400 | Next.js API | JSON `{"message":"Tenant identification is required"}`, CORS credentials |
| **api-dev.ice.bet.br** | 400 | Next.js API | Same as api |
| **sports.ice.bet.br** | 200 ✅ | Sports Management API | JSON `{"service":"sports-management","ok":true}` |
| **slots.ice.bet.br** | 400 | Slots API | `{"message":"Tenant identification is required"}` |
| **slots-euro.ice.bet.br** | 404 (via CF) | AWS ELB behind CF | awselb/2.0 |
| **track.ice.bet.br** | 403 | **Kong API Gateway** | CORS wildcard, Kong headers |
| **blog.ice.bet.br** | 200 ✅ | Payload CMS + Next.js | CSP ativo, x-powered-by: Next.js + Payload |
| **face-recognition1-5** | 200 ✅ | Next.js KYC apps | ~94KB each, CloudFront |
| **communication-unsubscribe** | 200 ✅ | Unsubscribe page | HTML simples, 6KB, fontes Google |
| **docs.ice.bet.br** | 302 | **Cloudflare Access** | SSO protegido, redirect para login Cloudflare Access |
| **status.ice.bet.br** | 200 ✅ | UptimeRobot Status Page | Caddy + PHP (sessions), Sentry, jQuery 3.7.1 |
| **imgix.ice.bet.br** | 200 ✅ | Imgix CDN | CORS wildcard, cross-origin-resource-policy |
| **geo.ice.bet.br** | - | Timeout | AWS backend |
| **geo-dev.ice.bet.br** | - | Timeout | AWS backend |
| **geolocation.ice.bet.br** | - | Timeout | AWS backend |
| **bet-hint.ice.bet.br** | 404 | - | CORS wildcard |
| **betslip.ice.bet.br** | 404 | - | CORS wildcard |
| **grafana.ice.bet.br** | ⏱️ Timeout | AWS ELB (EKS) | Security group bloqueia |
| **grafana-dev.ice.bet.br** | ⏱️ Timeout | AWS ELB (EKS) | Security group bloqueia |
| **loki.ice.bet.br** | ⏱️ Timeout | AWS ELB (EKS) | Security group bloqueia |
| **popok.ice.bet.br** | ⏱️ Timeout | AWS ELB (EKS) | Security group bloqueia |
| **cdn.blog.ice.bet.br** | 403 | S3 + CloudFront | S3 bucket (sa-east-1) |
| **unavailable.ice.bet.br** | 200 | Same as main site | PWA offline page |
| **gtm.ice.bet.br** | - | - | Google Tag Manager |
| **snake.ice.bet.br** | 404 | - | - |

---

## 3. Port Scan Summary

### Kong Gateway (216.238.112.42) — Scan completo (1-65535)
```
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 9.6p1 Ubuntu 3ubuntu13.14
80/tcp   open  http     Kong API Gateway
443/tcp  open  ssl/http Kong API Gateway (Let's Encrypt)
8000/tcp open  http     Kong API Gateway (alt port)
```

### AWS EKS IPs (9 IPs) — Scan portas comuns
```
TODAS as portas filtradas (security groups)
Nmap: 9 IPs up, 0 portas abertas no range testado
```

### Slots-euro (76.223.121.x, 166.117.85.x)
```
76.223.121.6:  443/tcp open  awselb/2.0 (AWS Global Accelerator)
166.117.85.175: 443/tcp open  awselb/2.0 (AWS Global Accelerator)
```

### CDN Blog (3.174.83.x)
```
3.174.83.35:  80/tcp, 443/tcp  (CloudFront origin - gru3)
3.174.83.47:  80/tcp, 443/tcp  (CloudFront origin - gru3)
3.174.83.97:  80/tcp, 443/tcp  (CloudFront origin - gru3)
3.174.83.42:  80/tcp, 443/tcp  (CloudFront origin - gru3)
```

---

## 4. Web Fingerprint Detail

### Auth Tests — admin.ice.bet.br
- **Mecanismo:** Basic Auth (realm="Login") via CloudFront
- **Creds testadas (TODAS 401):** admin:admin, admin:icebet, admin:ice, admin:123456, admin:password, icebet:icebet, icebet:admin, admin:P@ssw0rd, admin:Admin123, admin:icebet2025, dev:dev, developer:developer, root:root, admin:changeme
- **Bypass headers testados (TODOS 401):** X-Original-URL, X-Rewrite-URL, X-Custom-IP-Authorization, X-Forwarded-For, X-Forwarded, X-Real-IP, X-Originating-IP
- **Infra:** CloudFront (x-amz-cf-pop: GRU1-P5, x-cache: Error from CloudFront)
- **Veredito:** 🔴 Nenhuma cred default funcionou. Basic Auth forte.

### Develop (develop.ice.bet.br) — Vercel Protection
- **Não é Basic Auth** — é Vercel Deployment Protection!
- Retorna 103 Early Hints (link de fontes) + 401
- Página 401 contém instruções explícitas de bypass:
  - `x-vercel-set-bypass-cookie=true` parameter
  - `x-vercel-trusted-oidc-idp-token` header
  - Vercel MCP Server authentication
- **Infra:** Vercel (x-vercel-id: gru1), Cloudflare
- **Veredito:** 🟡 Potencial bypass via Vercel Protection Bypass token

### Sports API (sports.ice.bet.br)
- **Endpoints descobertos:**
  | Path | Status | Tamanho | Conteúdo |
  |------|--------|---------|----------|
  | `/` | 200 | 41B | `{"service":"sports-management","ok":true}` |
  | `/sports` | 200 | 3.3KB | Lista de esportes |
  | `/events` | 200 | 36KB | Eventos esportivos |
  | `/leagues` | 200 | 92KB | Ligas/leagues data |
  | Outros | 404 | 21B | - |
- **Veredito:** 🔴 API funcional com dados reais expostos! Próximo passo: enumerar.

### API (api.ice.bet.br)
- 400: `{"statusCode":400,"error":"Bad Request","message":"Tenant identification is required"}`
- Tenant header testado (`Tenant: ice`, `X-Tenant: ice`) — ainda 400
- CORS: Access-Control-Allow-Credentials: true
- **Veredito:** 🟡 Precisa descobrir formato correto do Tenant header

### Docs (docs.ice.bet.br)
- 302 → Cloudflare Access login (`https://fernando-b23.cloudflareaccess.com/cdn-cgi/access/login/docs.ice.bet.br`)
- Protected resource: `.well-known/cloudflare-access-protected-resource/`
- **Veredito:** 🔴 Cloudflare Zero Trust — requer SSO válido

---

## 5. WAF Detection

| Host | WAF Detectado |
|------|---------------|
| ice.bet.br | ✅ Cloudflare |
| admin.ice.bet.br | ✅ Cloudflare + CloudFront |
| blog.ice.bet.br | ✅ Cloudflare |
| track.ice.bet.br | ❌ Nenhum (Kong) |
| status.ice.bet.br | ❌ Nenhum (Caddy) |

---

## 6. TLS/SSL Summary

| Host | Cert | Ciphers | Notas |
|------|------|---------|-------|
| ice.bet.br | Wildcard *.ice.bet.br (Google Trust) | TLS 1.2/1.3, Grade A | Cloudflare proxy |
| admin.ice.bet.br | Same wildcard | Same | |
| sports.ice.bet.br | sports.ice.bet.br + *.sports.ice.bet.br (Google Trust) | Same | Cert separado do wildcard |
| track.ice.bet.br | track.ice.bet.br (Let's Encrypt) | TLS 1.2/1.3, Grade A | RSA 4096, DH 2048 |
| status.ice.bet.br | status.ice.bet.br (Let's Encrypt) | TLS 1.2/1.3, Grade A | EC cert |

---

## 7. Next.js Internals

### Build ID não encontrado (Turbopack — sem buildId estático)
### Sitemaps expõem rotas internas:
- **sitemap-main.xml** (43KB) — páginas principais, games tags, providers
- **sitemap-games.xml** (2.6MB) — TODOS os jogos listados (centenas)
- **sitemap-providers.xml** (17KB) — providers de jogos

### Rotas sensíveis do sitemap:
- `/affiliates/panel` — Painel de afiliados
- `/account` — Conta do usuário
- `/wallet` — Carteira
- `/withdraw-history`, `/deposit-history` — Histórico financeiro
- `/game-history`, `/bonus-history`, `/copy-history`
- `/verification` — Verificação KYC
- `/gamblers` — Lista de jogadores?
- `/sports/bets` — Apostas esportivas
- Games tags: `/games/tag/slots/`, `/games/tag/crash/`, etc.
- Providers: `ice-games`, `pgsoft`, `spribe`, `pragmaticexternal`, `evolution`, etc.

### Next.js Data Routes (do Wayback):
- `/_next/data/ysCDFWcoE-_61e5-SbE5P/pt.json` — Dados de rota
- `/_next/data/ysCDFWcoE-_61e5-SbE5P/pt/casino.json`
- `/_next/data/ysCDFWcoE-_61e5-SbE5P/pt/sports/*.json`
- `/_next/data/ysCDFWcoE-_61e5-SbE5P/pt/games/tag/*.json`
- These são URLs do WAYBACK — verificar se ainda funcionam

---

## 8. Subdomain Takeover Assessment

| Subdomain | DNS A | DNS CNAME | HTTP Status | Risco |
|-----------|-------|-----------|-------------|-------|
| **proxy-dev.ice.bet.br** | ❌ NXDOMAIN | ❌ NXDOMAIN | Timeout | 🟡 Médio — dead DNS |
| **unsubscribe.ice.bet.br** | ❌ NXDOMAIN | ❌ NXDOMAIN | Timeout | 🟡 Médio — dead DNS |
| **unsubscribed.ice.bet.br** | ❌ NXDOMAIN | ❌ NXDOMAIN | Timeout | 🟡 Médio — dead DNS |

**Nota:** Sem CNAME conhecido, takeover não pode ser validado sem identificar qual serviço cloud era usado.

---

## 9. Findings Preliminares

### 🔴 Crítico
1. **Sports API com dados expostos** — `/sports`, `/events`, `/leagues` retornam dados reais sem auth
2. **Kong Gateway exposto** — SSH na porta 22, proxy nas portas 80/443/8000
3. **Develop (Vercel) com bypass documentado** — Página de erro ensina como bypassar proteção

### 🟡 Alto
4. **API sem tenant — precisa de enumeração** — Descobrir formato do Tenant header
5. **Cloudflare Access em docs** — SSO, mas se tiver bypass via token
6. **CORS wildcard em track, bet-hint, betslip, imgix** — Exfiltração cross-origin
7. **Dead subdomains (proxy-dev, unsubscribe, unsubscribed)** — Potencial takeover
8. **S3 bucket ice-game** — Objetos públicos (pendente enumeração)

### 🟢 Médio
9. **Next.js Turbopack sem buildId estático** — Dificulta cache busting mas chunks são imutáveis
10. **Sitemaps expõem todas as rotas de jogo** — Enumeração trivial
11. **Status page (UptimeRobot) com Sentry** — Pode vazar errors/stacktraces
12. **SSH no Kong (OpenSSH 9.6p1)** — Versão recente, mas verificar CVEs

---

## 10. Artefatos Gerados

| Arquivo | Descrição |
|---------|-----------|
| `nmap_eks.txt` | Portscan AWS EKS (9 IPs) |
| `nmap_kong.txt` | Portscan Kong (portas comuns) |
| `nmap_kong_full.txt` | Portscan Kong (1-65535) |
| `nmap_slots_euro.txt` | Portscan slots-euro |
| `nmap_cdnblog.txt` | Portscan CDN blog IPs |
| `httpx_probe.txt` | httpx probe (salvo parcial) |
| `whatweb_results.txt` | whatweb fingerprint |
| `vhosts_aws.txt` | Vhost fuzzing AWS/Kong |
| `waf.txt` | WAF detection |
| `tls.txt` | TLS scan results |
| `auth_tests.txt` | Basic Auth test results |
| `buildmanifest.txt` | Next.js build manifest |
| `headers_detail.txt` | Headers detalhados + bodies |
| `takeover_check.txt` | Subdomain takeover checks |
| `sports_api.txt` | Sports API endpoints |
| **`ACTIVE.md`** | Este arquivo (consolidação) |

---

## 11. Próximos Passos (Recomendados para Enum/Webapp)

### 🔴 Imediato (Enumeração)
1. **Sports API** — Extrair dados de `/sports`, `/events`, `/leagues` (enum)
2. **API Tenant bypass** — Fuzz formatos de Tenant header (enum)
3. **Develop (Vercel bypass)** — Testar `x-vercel-set-bypass-cookie` e `x-vercel-trusted-oidc-idp-token` (webapp)
4. **S3 bucket ice-game** — Listar objetos (cloud)

### 🟠 Alta
5. **Admin Basic Auth** — Wordlist maior de creds (webapp)
6. **Kong path fuzzing** — Buscar rotas backend (webapp)
7. **Next.js data routes** — Verificar se `/_next/data/*` ainda funciona (enum)
8. **Blog Payload CMS** — Login admin em `/admin`, `/payload` (webapp)

### 🟡 Média
9. **Cloudflare Access bypass (docs)** — SSRF para internal? (webapp)
10. **face-recognition** — Upload abuse, bypass (webapp)
11. **CORS wildcard abuse** — Exfiltração (webapp)

---

*End of ACTIVE.md*
