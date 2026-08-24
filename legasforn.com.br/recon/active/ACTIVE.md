# Recon Ativo — legasforn.com.br

**Data:** 2026-08-24T16:35-16:42 UTC
**Operador:** especialista recon-active
**Alvo:** legasforn.com.br (https://legasforn.com.br)
**IP:** 69.46.46.84 (Railway edge proxy)
**OPSEC:** proxychains4 (Tor) em TODOS os scans

---

## 1. Port Scan

| Porta | Estado | Serviço | Detalhes |
|-------|--------|---------|----------|
| 80/tcp | Open | HTTP → HTTPS redirect | Railway edge |
| 443/tcp | Open | HTTPS | Railway edge (railway-hikari) |

**Nenhuma outra porta exposta.** Railway bloqueia todo tráfego não-HTTP.
Nmap -sV -sC não completou (timeout por rate limit do Railway), mas rustscan confirmou apenas 80/443.

## 2. HTTP/HTTPS Fingerprint

| Ferramenta | Resultado |
|------------|-----------|
| **whatweb** | Next.js (App Router), railway-hikari, HSTS (63072000s; includeSubDomains; preload), X-Frame-Options DENY, X-XSS-Protection 1; mode=block, CSP restritivo |
| **httpx** | 200 OK, Next.js, railway-hikari |
| **Headers** | `x-nextjs-cache`, `x-nextjs-prerender`, `x-nextjs-stale-time`, `x-railway-request-id`, `x-hikari-trace`, `x-railway-edge` |

### Security Headers
- **HSTS:** `max-age=63072000; includeSubDomains; preload` ✓
- **CSP:** Restritivo (connect-src: *.supabase.co, *.misticpay.com, hCaptcha, GA, FB)
- **X-Frame-Options:** `DENY` ✓
- **X-Content-Type-Options:** `nosniff` ✓
- **X-XSS-Protection:** `1; mode=block` ✓
- **Referrer-Policy:** presente ✓

### CSP `connect-src` revela dependências (confirmado):
- `*.supabase.co` + `wss://*.supabase.co` — Supabase
- `*.misticpay.com` — MisticPay (PIX)
- `api.hcaptcha.com`, `js.hcaptcha.com`, `newassets.hcaptcha.com` — hCaptcha
- `www.googletagmanager.com`, `*.google-analytics.com` — Google Analytics
- `www.facebook.com` — Facebook Pixel

## 3. WAF Detection

| Ferramenta | Resultado |
|------------|-----------|
| **wafw00f** | **Nenhum WAF detectado** |

**Conclusão:** Railway não implementa WAF por padrão. A aplicação depende de rate limiting próprio (120 req/min). Sem proteção contra Web Application Firewall.

## 4. TLS/SSL

| Item | Detalhe |
|------|---------|
| **Certificado** | Let's Encrypt (YE1) |
| **SAN** | `*.up.railway.app`, `up.railway.app` |
| **Chave** | EC 256-bit (ecdsa-with-SHA384) |
| **Validade** | 2026-07-29 → 2026-10-27 |
| **TLS 1.2** | ECDHE_ECDSA_WITH_AES_128_GCM_SHA256, AES_256_GCM_SHA384, CHACHA20_POLY1305 |
| **TLS 1.3** | TLS_AKE_WITH_AES_128_GCM_SHA256, AES_256_GCM_SHA384, CHACHA20_POLY1305 |
| **Grade** | **A** (apenas ciphers fortes) |
| **HSTS** | Ativo (63072000s, includeSubDomains, preload) |

**Issues:** Certificado em nome do Railway (*.up.railway.app), não do domínio legasforn.com.br — é esperado para edge proxy, mas pode indicar que o TLS termina no edge da Railway.

## 5. Vhost Fuzzing

| Parâmetro | Resultado |
|-----------|-----------|
| **Wordlist** | subdomains-top1million-5000.txt (5000 entradas) |
| **Hosts descobertos** | **0** (todos 404) |
| **Conclusão** | Nenhum vhost além de legasforn.com.br responde ao IP 69.46.46.84 |

## 6. Directory/Path Fuzzing

### Raiz (/) — common.txt
| Rota | Status | Descrição |
|------|--------|-----------|
| `/loja` | 200 | Catálogo de jogos (público) |
| `/marketplace` | 200 | Marketplace |
| `/vip` | 200 | Programa VIP |
| `/dashboard` | 307 | Redireciona para `/auth/login?redirect=/dashboard` |
| `/robots.txt` | 200 | Robots.txt |
| `/sitemap.xml` | 200 | Sitemap |

### API v1 (/api/v1/) — common.txt
| Rota | Status | Descrição |
|------|--------|-----------|
| `/api/v1/accounts` | 401 | Requer auth (Bearer) |
| `/api/v1/coupons` | 401 | CRUD de cupons |
| `/api/v1/games` | 401 | Lista jogos |
| `/api/v1/orders` | 401 | Lista pedidos |
| `/api/v1/purchase` | 405 | POST only — compra |
| `/api/v1/stats` | 401 | Estatísticas |

### Backups (Common-DB-Backups.txt)
Nenhum arquivo de backup ou DB exposto encontrado.

### Falsos Positivos (Next.js catch-all redirects)
- `/.git/logs/` → 308 redirect (Next.js trata como rota, não é .git real)
- `/cgi-bin/` → 308 redirect (idem)
- `/api/v1/.git/logs/`, `/api/v1/cgi-bin/`, `/api/v1/render/https://www.google.com` — todos 308 redirects do Next.js

## 7. Subdomain DNS Brute Force

| Ferramenta | Wordlist | Subdomínios encontrados |
|------------|----------|------------------------|
| **dnsx** | subdomains-top1million-5000.txt | **0** |

**Conclusão:** O DNS do domínio está configurado no HostGator DNS Parking, que só responde para o registro A do apex. Nenhum subdomínio DNS resolvível além do principal.

## 8. HTTP Response Headers (Confirmados)

```
HTTP/2 200
server: railway-hikari
x-frame-options: DENY
x-xss-protection: 1; mode=block
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-security-policy: <restritivo>
permissions-policy: <presente>
x-nextjs-cache: HIT/MISS
x-nextjs-prerender: 1
x-nextjs-stale-time: 30
x-railway-request-id: <uuid>
x-hikari-trace: <trace>
x-railway-edge: mia1 | iah1
```

## 9. Findings Preliminares

### 🔴 Médio-Alto
1. **API endpoints expostos sem auth retornam 401 mas confirmam existência** — endpoints como /api/v1/coupons, /api/v1/orders, /api/v1/stats estão mapeados e acessíveis (retornam 401, não 404). Confirma que a lista de endpoints do PASSIVE.md está correta.

2. **Sem WAF** — Railway não tem WAF integrado. A única proteção é rate limiting (120 req/min). Vulnerável a brute force, fuzzing agressivo, e ataques de aplicação.

3. **Rate limit de 120 req/min pode ser contornado** — taxa baixa para um rate limit. Testes com rotação de tokens ou IP (via Tor) podem ampliar a taxa efetiva.

### 🟡 Médio
4. **Next.js catch-all routes** — rotas como /.git/logs/ e /cgi-bin/ retornam 308 redirect, mas NÃO são repositórios git reais. É comportamento padrão do Next.js App Router com catch-all segments.

5. **Certificado TLS em nome do Railway** — o certificado é `*.up.railway.app`, não `legasforn.com.br`. Indica que a aplicação está rodando em um domínio *.up.railway.app com domínio customizado apontado via CNAME. Isso é normal para Railway, mas impede verificação de identidade visual.

### 🟢 Baixo
6. **HSTS preload** — Configuração correta de HSTS com preload. Seguro.

7. **Security headers** — X-Frame-Options, X-XSS-Protection, CSP todos configurados. Postura de segurança boa.

8. **Nenhum backup/dump exposto** — sem arquivos de backup ou DB acessíveis publicamente.

9. **Nenhum subdomínio resolvível** — attack surface limitado ao domínio principal.

## 10. Próximos Passos Recomendados (Enum + Webapp)

1. **Testar rate limit** — verificar se 120 req/min é por IP ou por token; testar bypass com header injection (X-Forwarded-For)
2. **Fuzz de parâmetros** nos endpoints /api/v1/accounts, /api/v1/coupons (injection, IDOR)
3. **Testar autenticação** — SQLi, NoSQLi, Mass Assignment em /auth/login e /auth/sign-up
4. **Analisar bundle JS** em produção para extrair Supabase project URL, anon key, e possíveis endpoints internos
5. **Fluxo PIX (MisticPay)** — testar integridade de valores, replay de transação, bypass de confirmação
6. **Testar IDOR** em /api/v1/orders/{id}, /api/v1/accounts/{id}
7. **Analisar se o Next.js middleware pode ser bypassado** (acesso direto a rotas _next/static, layouts internos)
8. **Verificar se o openapi.json revela mais endpoints**