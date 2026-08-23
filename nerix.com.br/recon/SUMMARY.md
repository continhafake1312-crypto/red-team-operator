# Attack Surface — Summary nerix.com.br

**Data**: 2026-08-23  
**Base**: Recon passivo + OSINT + Recon ativo

---

## Attack Surface Total

| Categoria | Quantidade |
|-----------|-----------|
| Subdomínios únicos | 10 |
| Hosts vivos (HTTP 200) | 7 (nerix, admin, app, pay, quiz, status, docs) |
| Hosts com redirect/404 | 3 (api, cdn, links) |
| IPs Cloudflare (anycast) | 104.21.52.111, 172.67.198.51 |
| IPs origem real (fora CF) | 3.174.83.65/97/98/126 (AWS CloudFront, us-east-1) |
| S3 Buckets (existentes) | 1 (nerix-prod, completamente fechado) |
| Portas abertas (AWS) | 80/tcp, 443/tcp (apenas CloudFront) |
| TLS issues | 1 (cdn.nerix.com.br — SWEET32) |
| DMARC | p=none (sem proteção anti-spoofing) |
| APIs documentadas | REST (83 endpoints) + WebSocket (socket.io) + Pix API |
| Integrações externas | Google OAuth, Stripe, Brevo (Sendinblue), Resend |

---

## Ranking de Payoff (§16) — Atualizado Pós-Recon Ativo

### 🔴 ALTA PRIORIDADE (atacar primeiro)

| # | Vetor | Alvo | Por quê | Achados |
|---|-------|------|---------|---------|
| 1 | **Email spoofing PoC** | DMARC p=none + SPF ~all | Sem proteção anti-spoofing. Enviar email como admin@nerix.com.br via SMTP relay. Pode permitir phishing de clientes/funcionários | DMARC p=none, SPF ~all, sem DKIM |
| 2 | **Resend API abuse** | `links.nerix.com.br` | Único host sem Cloudflare. Sem WAF. Serviço de email (Resend). Testar injeção, envio não autorizado, IDOR em links de rastreamento | CNAME: links1.resend-dns.com, AWS CloudFront GRU3, 400 Bad Request |
| 3 | **Brevo email misconfig** | brevo-code no DNS TXT | `brevo-code:097d65fb7f2f10b244779979d5199a84` exposto. Testar contra API Brevo para envio de email indevido | Código de 32 hex no DNS público |
| 4 | **API testing (100+ endpoints)** | `api.nerix.com.br` + JS bundles | 100+ endpoints mapeados dos JS bundles + 38 da docs. Auth via X-nerixkey (nrk_live_*). Testar IDOR, SQLi, NoSQLi, rate limit bypass | CSP, CORS, RateLimit headers. Admin, auth, store, builder, whatsapp, shop-editor, affiliates, integrations, notifications endpoints |
| 5 | **JS Analysis completed** | JS bundles | 9 bundles baixados, 100+ endpoints extraídos, nenhum secret/API key hardcoded | Source maps indisponíveis (SPA catch-all) |

### 🟡 MÉDIA PRIORIDADE

| # | Vetor | Alvo | Por quê |
|---|-------|------|---------|
| 6 | **CDN TLS vuln (SWEET32)** | cdn.nerix.com.br | CVE-2016-2183 — ataque man-in-the-middle em sessões SSL/TLS com ciphers 3DES |
| 7 | **WebSocket analysis** | nerix.com.br (socket.io) | Bloqueado via Tor. Testar de IP real |
| 8 | **Auth bypass (painéis)** | admin, app, pay | 31 endpoints de auth mapeados nos JS. Login Google/Facebook/Discord |
| 9 | **IDOR candidates** | API pública | UUID orders, ID products, pagination params |
| 10 | **PWA / Service Worker** | /service-worker.js, manifest.json | v5, push notifications, Firebase GCM ID exposto |
| 11 | **Google OAuth misconfig** | OAuth callback | CSRF, redirect_uri bypass, token leakage |

### 🔵 BAIXA PRIORIDADE

| # | Vetor | Alvo | Por quê |
|---|-------|------|---------|
| 12 | **CSP/CORS analysis** | api.nerix.com.br | Headers de segurança — testar origens não autorizadas |
| 13 | **Subdomain takeover** | nerix.com, net, .org, .io | Domínios similares — CNAME dangling |
| 14 | **Shodan search** | Favicon hash 1229986882 | Buscar IPs expostos associados |

---

## Subdomínios Detalhados

| Subdomínio | IPs | Status | Tech | Notas |
|-----------|-----|--------|------|-------|
| **nerix.com.br** | CF anycast | 200 - "Nerix" | React/Vite, PWA, Google Fonts | SPA principal |
| **admin.nerix.com.br** | CF anycast | 200 - "Nerix" | React/Vite | Painel admin (catch-all SPA) |
| **app.nerix.com.br** | CF anycast | 200 - "Nerix" | React/Vite | App principal (catch-all SPA) |
| **api.nerix.com.br** | CF anycast | 404 - "Error" | REST API + Headers seg | X-nerixkey auth, RateLimit |
| **cdn.nerix.com.br** | CF anycast | 404 - "Not Found" | Cloudflare NEL | **SWEET32 TLS 🐞** |
| **docs.nerix.com.br** | CF → Vercel | 308→200 | Mintlify/Next.js | 83 páginas docs completas |
| **links.nerix.com.br** | **3.174.83.0/24** 🔴 | 400 - "Bad Request" | AWS CloudFront, Resend | **Fora do Cloudflare, sem WAF** |
| **pay.nerix.com.br** | CF anycast | 200 - "Nerix" | React/Vite | Pagamentos (catch-all SPA) |
| **quiz.nerix.com.br** | CF anycast | 200 - "Nerix" | React/Vite | Quiz/engajamento (catch-all SPA) |
| **status.nerix.com.br** | CF anycast | 200 - "Status Nerix" | React/Vite | Status page |

---

## OSINT Highlights

- **Proprietário**: JOAO PAULO ROTERS / jprotersiza@gmail.com / (41) 9958-7276
- **CNPJ**: 57.917.756/0001-17 — **BAIXADO** (extinção em 11/02/2026)
- **Redes**: Instagram (@nerix_oficial, @nerix_), LinkedIn, Discord (discord.gg/Zn29zjE6SR), WhatsApp +55 41 99956-6175
- **Email config**: Brevo (brevo-code:097d65fb7f2f10b244779979d5199a84), MX Hostinger, DMARC p=none
- **Domínios similares**: nerix.com (AWS), nerix.net (Hetzner), nerix.org (Shopify), nerix.io (AWS), nerix.dev

---

## TLS Summary

| Host | Issuer | Expiry | Ciphers | Grade |
|------|--------|--------|---------|-------|
| *.nerix.com.br | Google Trust Services | 2026-10-15 | TLS 1.2/1.3 | **A** |
| cdn.nerix.com.br | Google Trust Services | 2026-11-09 | **3DES (SWEET32)**, TLS 1.0-1.3 | **C** 🐞 |
| docs.nerix.com.br | Let's Encrypt | 2026-10-06 | TLS 1.2/1.3 | **A** |
| links.nerix.com.br | Amazon ECDSA 256 M04 | 2027-02-14 | TLS 1.2/1.3 | **A** |

---

## Próximos Passos (WebApp Phase)

1. 🔴 **Testar API com X-nerixkey** — Obter/prever chave válida (`nrk_live_*`) para acessar endpoints autenticados. 100+ endpoints mapeados
2. 🔴 **IDOR testing** — `/api/public/orders/{orderNumber}` (UUID), `/api/public/products/{id}` (numérico), `/api/public/infoproducts/v1/orders/{orderId}`
3. 🔴 **SQLi/NoSQLi** — `/api/public/products?category_id=1`, `/api/public/customers/top?limit=`
4. 🔴 **Auth endpoints** — Testar `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/2fa/*`
5. 🟡 **Rate limit bypass** — Testar X-Forwarded-For, X-Real-IP spoofing nos rate limits
6. 🟡 **Upload abuse** — `/api/products/upload-image`, `/api/mansao-privilege/stories/upload`, `/api/public/customer/upload/review-image`
7. 🟡 **Shop Editor RCE** — `/api/shop-editor/fs/create-file`, `fs/delete`, `fs/move` (file operations)
8. 🟡 **WhatsApp admin** — `/api/whatsapp/admin/*` sem auth
9. 🟡 **WebSocket from real IP** — Testar socket.io de IP residencial (Tor bloqueado)
10. 🟡 **Mass assignment** — Campos extras em POST `/api/public/products`, `/api/public/orders`
11. 🟡 **CORS misconfiguration** — Testar origens arbitrárias
12. 🔵 **Email spoofing** — Testar envio como admin@nerix.com.br (DMARC p=none)
13. 🔵 **Brevo API abuse** — Testar brevo-code contra API Brevo

### Concluídos na Enum Profunda
- ✅ **Source maps** — Não disponíveis (5.2KB SPA HTML cada, catch-all)
- ✅ **JS bundle analysis** — 9 bundles baixados (incluindo status.nerix.com.br). 100+ endpoints extraídos, 0 secrets hardcoded
- ✅ **Docs scraping** — 83/83 páginas baixadas. 38 endpoints documentados mapeados
- ✅ **API endpoint discovery** — 100+ endpoints via JS + 38 via docs. ffuf: 1 hit (.well-known/http-opportunistic)
- ✅ **WebSocket probe** — Bloqueado por Cloudflare (Tor). Socket.IO v3/v4 confirmado
- ✅ **Special files** — service-worker.js (v5), manifest.json (v2.0.1), robots.txt analisados
- ✅ **R2 buckets** — Todos retornam 500 (inexistentes/bloqueados)