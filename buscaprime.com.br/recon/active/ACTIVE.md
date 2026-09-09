# ACTIVE.md — Recon Ativo Consolidado

## Alvo: buscaprime.com.br

---

## 1. SERVIDOR ORIGEM (FORA DO CLOUDFLARE)

### IPs Identificados
| IP | Status | Portas |
|----|--------|--------|
| **170.82.173.30** | ✅ Vivo | 80 (tcpwrapped), 443 (SSL/gocache) — principal |
| **170.82.174.30** | ⚠️ Filtrado | 80/443 filtrados (firewall) |

### Fingerprint de Serviços
- **Porta 443**: `gocache` (proxy HTTP Go) + **openresty** (nginx + LuaJIT)
- **Porta 80**: `tcpwrapped` (possivelmente redireciona para 443)
- **TLS**: Let's Encrypt (YE2), TLSv1.3, AES-256-GCM, X25519

### Análise
- `gocache` é um cache/reverse proxy escrito em Go
- `openresty` (nginx + Lua) roda por trás — potencial para vulnerabilidades conhecidas
- O servidor **não aceita Host headers** diferentes de `seguro.buscaprime.com.br` (retorna 404/400)
- O checkout roda na plataforma **Yampi** (SaaS white-label de checkout)

---

## 2. CHECKOUT (Yampi) — seguro.buscaprime.com.br/cart

### Tecnologias
- **Plataforma**: Yampi Checkout (white-label SaaS) — similar a Loja Integrada/Tray
- **CDN**: cdn.yampi.me, images.yampi.me, awesome-assets.yampi.me
- **Analytics**: Google Analytics, Facebook Pixel, Bing Ads
- **Proteção**: hCaptcha (no checkout)
- **Cookies**: `__goc_session__`, `XSRF-TOKEN`, `bubbstore_checkout`, `lnxweb-tecnologia_cart`
- **Frontend**: Rubik font, Yampi icons, app.css compilado

### Endpoints Testados
| Path | Status |
|------|--------|
| /cart | 200 ✅ |
| /checkout | 302 (redirect) |
| /api, /login, /register, /admin | 404 |
| /webhook, /callback | 404 |

---

## 3. CLOUDFLARE SUBDOMÍNIOS (BLOQUEADOS)

Os subdomínios abaixo passam por Cloudflare e exigem bypass (challenge JavaScript):
- app.buscaprime.com.br (Metronic 7.0.5 admin)
- painel.buscaprime.com.br (login)
- www.buscaprime.com.br
- api.buscaprime.com.br (possível)

---

## 4. PRÓXIMOS PASSOS (RE-PRIORIZADO §19)

Baseado nas descobertas, reordenação da caçada:

### 🔴 Crítico — Atacar agora
1. **Yampi Checkout** — investigar `/cart`, `/checkout`, cookie tampering, CSRF, IDOR, SQLi nos parâmetros
2. **gocache/openresty** — pesquisar CVEs para gocache + openresty; testar path traversal, SSRF
3. **API Pública** — tentar acessar `app.buscaprime.com.br/api/public/dataset/v3/people/basic` via cookie/session válida
4. **Bypass Cloudflare** — tentar CloudFail (encontrar IP real de app/painel) via DNS history, shodan, censys

### 🟠 Alto
5. **Fuzzing direto no servidor origem** — endpoints de API, admin, painel (ffuf em `seguro.buscaprime.com.br`)
6. **XSS/HTML injection** nos parâmetros de consulta (se houver formulários de busca)
7. **Metronic 7.0.5 CVEs** — painel admin vulnerável

### 🟡 Médio
8. **Subdomínios cPanel** — webdisk, cpcontacts, cpcalendars (todos atrás de Cloudflare)
9. **DNS zone transfer** (já testado sem sucesso)

---

**Data:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")