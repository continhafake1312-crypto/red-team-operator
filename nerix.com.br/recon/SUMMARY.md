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
| 4 | **API testing via docs** | `api.nerix.com.br` + docs.nerix.com.br | 83 endpoints documentados. Auth via X-nerixkey. Testar IDOR, SQLi, NoSQLi, rate limit bypass | CSP, CORS, RateLimit headers. Endpoints: customers, orders, products, affiliates, coupons, reviews, webhooks, Pix |
| 5 | **Stripe key exposure** | JS source maps (admin/app/pay) | `sk_live_*` pattern visto offline. Extrair source maps para encontrar chaves reais de Stripe, API keys, Google OAuth secrets | Source maps disponíveis nos bundles Vite |

### 🟡 MÉDIA PRIORIDADE

| # | Vetor | Alvo | Por quê |
|---|-------|------|---------|
| 6 | **CDN TLS vuln (SWEET32)** | cdn.nerix.com.br | CVE-2016-2183 — ataque man-in-the-middle em sessões SSL/TLS com ciphers 3DES. Impacto baixo (CDN estática), mas sinaliza postura de segurança |
| 7 | **WebSocket analysis** | nerix.com.br (socket.io) | Tempo-real — possível dados sensíveis (notificações, transações) |
| 8 | **Auth bypass (painéis)** | admin, app, pay | Default creds, Google OAuth misconfig, token manipulation |
| 9 | **Docs scraping** | docs.nerix.com.br | Extrair TODAS as 83 páginas — mapear API completo, encontrar endpoints não documentados |
| 10 | **PWA manifest analysis** | /manifest.json?v=2.0.1 | Rotas, scopes, endpoints adicionais |
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

## Próximos Passos (Enum Profunda)

1. 🔴 **Email spoofing** — Testar envio de email como admin@nerix.com.br (DMARC p=none)
2. 🔴 **Source map extraction** — Extrair .map dos bundles JS (/assets/*.js.map) para secrets
3. 🔴 **Scraping docs** — Extrair 83 páginas da documentação para mapear API completo
4. 🟡 **WebSocket probe** — Conectar ao socket.io para análise de tráfego
5. 🟡 **API endpoint discovery** — Fuzzing paramétrico na api.nerix.com.br
6. 🟡 **Brevo API abuse** — Testar brevo-code contra API Sendinblue/Brevo
7. 🟡 **cdn SSL test** — Confirmar SWEET32 + TLS 1.0