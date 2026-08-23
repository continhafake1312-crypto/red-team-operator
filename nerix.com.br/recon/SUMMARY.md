# Attack Surface — Summary nerix.com.br

**Data**: 2026-08-23  
**Base**: Recon passivo + OSINT completo (PASSIVE.md)

---

## Attack Surface Total

| Categoria | Quantidade |
|-----------|-----------|
| Subdomínios únicos | 10 |
| Hosts vivos (HTTP 200) | 7 (nerix, admin, app, pay, quiz, status, docs) |
| Hosts com redirect/404 | 3 (api, cdn, links) |
| IPs Cloudflare (anycast) | 104.21.52.111, 172.67.198.51 |
| IPs origem real (fora CF) | 3.174.83.65/97/98/126 (AWS CloudFront) |
| S3 Buckets (existentes) | 1 (nerix-prod, 403 AccessDenied) |
| Portas documentadas | 443 (HTTPS) |
| APIs documentadas | REST + WebSocket (socket.io), Pix API |
| Integrações externas | Google OAuth, Stripe, Brevo, Resend, WebSockets |

---

## Ranking de Payoff (§16)

### 🔴 ALTA PRIORIDADE (atacar primeiro)

| # | Vetor | Alvo | Por quê |
|---|-------|------|---------|
| 1 | **Port scan IPs reais** | `links.nerix.com.br` → 3.174.83.0/24 | Único host fora do Cloudflare. Se porta 80/443 sem CF, bypass total da proteção. Pode expor painéis admin, APIs internas, ou serviços AWS (S3, EC2, etc.) |
| 2 | **Forced browsing / content discovery** | `admin.nerix.com.br` | Subdomínio admin dedicado — rotas de painel administrativo, login, dashboard |
| 3 | **S3 Bucket enumeration** | `nerix-prod` (s3.amazonaws.com) | Bucket existe. Testar PUT, path enumeration, ACLs, list objects via diferentes métodos |
| 4 | **API testing** | `api.nerix.com.br` | API REST documentada (83 endpoints). Testar auth `X-nerixkey`, rate limit bypass, IDOR, SQLi, NoSQLi |
| 5 | **Stripe key exposure** | JS bundles | `sk_live_*` pattern visto no código — verificar se secret key vaza em source maps ou JS |
| 6 | **DMARC/SPF spoofing** | DNS | `p=none` + `~all` — email spoofing trivial. Phishing de funcionários/clientes |

### 🟡 MÉDIA PRIORIDADE

| # | Vetor | Alvo | Por quê |
|---|-------|------|---------|
| 7 | **WebSocket analysis** | `nerix.com.br` (socket.io) | Tempo-real — pode expor dados sensíveis, mensagens internas, notificações |
| 8 | **Auth bypass (painéis)** | admin, app, pay subdomínios | Default creds, Google OAuth misconfig, token manipulation |
| 9 | **Vhost fuzzing** | IPs Cloudflare | Descobrir outros hosts virtuais no mesmo IP |
| 10 | **PWA manifest analysis** | `/manifest.json?v=2.0.1` | Pode revelar rotas, scopes, endpoints adicionais |
| 11 | **Docs sitemap analysis** | `docs.nerix.com.br` sitemap | 83 páginas — pode revelar endpoints não documentados, versões de API |
| 12 | **Google OAuth misconfig** | OAuth callback | Testar CSRF, redirect_uri bypass, token leakage |
| 13 | **Brevo email config** | DNS TXT record | `brevo-code` exposto — testar se pode ser usado para enviar emails falsos |

### 🔵 BAIXA PRIORIDADE

| # | Vetor | Alvo | Por quê |
|---|-------|------|---------|
| 14 | **CSP/CORS analysis** | api.nerix.com.br | Headers de segurança — testar se permite origens não autorizadas |
| 15 | **Subdomain takeover** | nerix.com, nerix.net, nerix.org, nerix.io | Domínios similares — verificar se CNAME aponta para serviços extintos |
| 16 | **Shodan search** | Favicon hash 1229986882 | Buscar IPs expostos associados ao mesmo favicon |
| 17 | **cdn.nerix.com.br** | CDN subdomain | 404 — assets podem estar migrados, verificar se serviu algo útil antes |

---

## Subdomínios Detalhados

| Subdomínio | IP | Status | Tech | Notas |
|------------|-----|--------|------|-------|
| **nerix.com.br** | CF anycast | 200 - "Nerix" | React/Vite, PWA, Google Fonts | Principal SPA |
| **admin.nerix.com.br** | CF anycast | 200 - "Nerix" | React/Vite | Painel admin? |
| **app.nerix.com.br** | CF anycast | 200 - "Nerix" | React/Vite | App principal |
| **api.nerix.com.br** | CF anycast | 404 - "Error" | REST API + Headers seg | `X-nerixkey` auth |
| **cdn.nerix.com.br** | CF anycast | 404 - "Not Found" | Cloudflare NEL | CDN de assets |
| **docs.nerix.com.br** | CF → Vercel | 308→200 | Mintlify/Next.js | 83 páginas docs |
| **links.nerix.com.br** | **3.174.83.0/24** 🔴 | 400 - "Bad Request" | AWS CloudFront, Resend | **Fora do Cloudflare** |
| **pay.nerix.com.br** | CF anycast | 200 - "Nerix" | React/Vite | Pagamentos |
| **quiz.nerix.com.br** | CF anycast | 200 - "Nerix" | React/Vite | Quiz/engajamento |
| **status.nerix.com.br** | CF anycast | 200 - "Status Nerix" | React/Vite | Status page |

---

## OSINT Highlights

- **Proprietário**: JOAO PAULO ROTERS / jprotersiza@gmail.com / (41) 9958-7276
- **CNPJ**: 57.917.756/0001-17 — **BAIXADO** (extinção em 11/02/2026)
- **Redes**: Instagram (@nerix_oficial, @nerix_), LinkedIn, Discord, WhatsApp
- **Email config**: Brevo (brevo-code no DNS TXT), MX Hostinger
- **Domínios similares**: nerix.com (AWS), nerix.net (Hetzner), nerix.org (Shopify), nerix.io (AWS), nerix.dev

---

## Próximos Passos (Recon Ativo)

1. Port scan em `links.nerix.com.br` (3.174.83.0/24) — descobrir serviços expostos sem CF
2. WAF fingerprint em todos os subdomínios
3. Vhost fuzzing nos IPs Cloudflare
4. TLS/certificate enumeration
5. Content discovery em admin.nerix.com.br, app.nerix.com.br, pay.nerix.com.br
6. S3 bucket enumeration (nerix-prod)
7. API endpoint discovery via ffuf