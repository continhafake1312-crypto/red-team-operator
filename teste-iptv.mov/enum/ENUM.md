# Enumeração Profunda — Fase 5

**Engagement:** teste-iptv.mov
**Data:** 2026-08-22T19:30:00Z
**Especialista:** enum

---

## 1. Resumo Executivo

Enumeração exaustiva realizada em dois domínios prioritários:
- **cliquex.click** (Payoff MÉDIO) — Domínio terceiro que processa leads WhatsApp
- **teste-iptv.mov / playbrasil.top** (Payoff BAIXO) — Landing pages estáticas protegidas por Cloudflare

**Principais descobertas:**
- 2 endpoints WhatsApp ativos no cliquex.click com números diferentes
- Login/painel protegido no cliquex.click (/clk, /login, /login_form, etc.)
- playbrasil.top: 70+ páginas de conteúdo (sitemap), SPA estática
- teste-iptv.mov: 4 páginas estáticas (sitemap), WAF ativo bloqueia enumeração
- Cloudflare WAF impede content discovery ativo em ambos os domínios

---

## 2. cliquex.click — Enumeração Detalhada

### 2.1 Infraestrutura
| Item | Valor |
|------|-------|
| IPs | 104.26.4.201, 104.26.5.201, 172.67.75.55 (Cloudflare) |
| NS | paige.ns.cloudflare.com, tanner.ns.cloudflare.com |
| SSL | Google Trust Services (WE1), válido até 2026-10-23 |
| WAF | Cloudflare (Full Proxy) — desafio ativo na maioria dos paths |

### 2.2 Endpoints WhatsApp Descobertos

| Endpoint | Redirect Final | Telefone | Parâmetros Aceitos |
|----------|---------------|----------|-------------------|
| `/whatsapp-movie` | `https://wa.me/5521975444978?text=Quero%20um%20teste%20IPTV%20MOVIE%20gratuito` | +55 21 97544-4978 | **Nenhum** — todos ignorados |
| `/whatsapp-playbrasil` | `https://wa.me/5511947389731?text=Gostaria%20de%20um%20teste%20IPTV%20gr%C3%A1tis` | +55 11 94738-9731 | **Nenhum** — todos ignorados |

**Testes de parâmetros realizados:** `id`, `lead_id`, `phone`, `token`, `ref`, `source`, `campaign`, `click_id`, `sub_id`, `aff_id`, `utm_*`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
**Resultado:** Todos os parâmetros são **ignorados** — redirect sempre idêntico.

**Testes IDOR:** Sequencial (1-20), UUID, hash — **sem efeito**.

### 2.3 Endpoints de Autenticação/Painel

| Path | Status | Notas |
|------|--------|-------|
| `/login` | 403 (Cloudflare challenge) | Página de login protegida |
| `/login_form` | 403 | |
| `/login?next=%2Fclk` | 403 | Redireciona para /clk após login |
| `/loginerror` | 403 | |
| `/loginflat` | 403 | |
| `/loginimages` | 403 | |
| `/logins` | 403 | |
| `/login2` | 403 | |
| `/clk` | 307 → `/login?next=%2Fclk` | **Click tracker** — requer autenticação |
| `/cdn-cgi/trace` | 200 | Debug Cloudflare — expõe IP do cliente (45.66.35.37) |

### 2.4 Endpoints Bloqueados (403 Cloudflare)
`/api`, `/graphql`, `/swagger.json`, `/openapi.json`, `/.well-known/*`, `/dashboard`, `/panel`, `/aff`, `/track`, `/leads`, `/click`, `/go`, `/redirect`, `/r`, `/link`, `/url`, `/out`, `/lp`, `/landing`, `/offer`, `/campaign`, `/cpa`, `/cpl`, `/lead`, `/sub`, `/subid`, `/pixel`, `/postback`, `/callback`

### 2.5 Content Discovery (feroxbuster)
- Apenas paths de login e Cloudflare internos acessíveis
- Nenhum diretório/arquivo público adicional descoberto
- Wordlist: raft-small-directories.txt

### 2.6 Subdomínios
- **CT Logs (crt.sh):** 0 subdomínios além do apex
- **DNS:** Apenas apex resolvendo

### 2.7 JavaScript Analysis
- Nenhum JS servido pelo cliquex.click (apenas redirects 302/307)
- Tracking WhatsApp feito via GA4 no domínio de destino (playbrasil.top)

### 2.8 Candidatos a Vulnerabilidade — cliquex.click

| ID | Tipo | Endpoint | Detalhes |
|----|------|----------|----------|
| E-001 | Info Disclosure | `/cdn-cgi/trace` | Expõe IP real do cliente, colo, TLS version, HTTP/2 |
| E-002 | Auth Bypass Candidate | `/clk` | Click tracker requer login — testar session fixation, IDOR no parâmetro `next` |
| E-003 | Open Redirect | `/clk?next=` | Verificar se `next` aceita URLs externas após login |
| E-004 | Credential Stuffing | `/login`, `/login_form` | Sem rate limiting visível (Cloudflare challenge apenas) |
| E-005 | Lead Enumeration | `/whatsapp-movie`, `/whatsapp-playbrasil` | Parâmetros ignorados — sem IDOR, mas confirmam existência de leads |

---

## 3. playbrasil.top — Enumeração Detalhada

### 3.1 Infraestrutura
| Item | Valor |
|------|-------|
| IPs | Cloudflare edge (mesmo range do cliquex.click) |
| SSL | Google Trust Services (WE1), válido até 2026-09-23 |
| Tech Stack | Static HTML + vanilla JS (`/assets/js/app.js`), Google Analytics (G-DTBP0DRQN6), Google Fonts |
| WAF | Cloudflare (rate limiting ativo — 429 em muitos paths) |

### 3.2 Sitemap — 75 URLs Descobertas
- `/` — Homepage
- `/termos` — Termos de Uso
- `/privacidade` — Política de Privacidade
- `/iptv/` — Página principal IPTV
- **69 artigos** em `/iptv/*` — Guias por dispositivo, preços, apps, etc.

### 3.3 Endpoints Acessíveis (200 OK)
```
/assets/img/teste-iptv-og.jpg
/assets/img/teste-iptv.webp
/assets/core/theme.css
/assets/core/main.css
/assets/modules/enhancements.css
/assets/modules/components.css
/assets/js/app.js
/manifest.json
/favicon.svg
/termos
/privacidade
/iptv/
/ (homepage)
```

### 3.4 Endpoints Rate Limited (429)
```
/wp-admin, /error, /database, /iptv/tmp, /iptv/language, /iptv/wp-content,
/iptv/search, /iptv/scripts, /iptv/css, /iptv/components, /rss, /template,
/engine, /archives, /customer, /ads, /app, /Library, /templates_c, /blocks,
/chat, /log, /cp, /awstats, /templets, /manager, /photos, /customavatars,
/ru, /it, /mobile, /new, /script, /2009, /articles, /public, /calendar,
/contacts, /a, /product_compare, /clientscript, /library, /poll
```

### 3.5 JavaScript Analysis — `/assets/js/app.js`

**Funcionalidades:**
- Header scroll effect
- FAQ Accordion
- Smooth scroll para anchors
- Mobile menu toggle
- Back-to-top button
- **WhatsApp Click Tracking (GA4 event `whatsapp_click`)**

**GA4 Event `whatsapp_click` parameters:**
```javascript
{
  button_location: 'header' | 'hero' | 'final_cta' | 'plan_cta' | 'faq_cta' | 'footer' | 'floating' | 'content_cta',
  page_path: window.location.pathname,
  page_title: document.title,
  link_url: link.href
}
```

**Detecção de localização do botão:** Baseada em seletores CSS (`.btn-header`, `.hero-section`, `.section-cta-final`, `.section-plans`, `.btn-plan`, `.section-faq`, `footer`, `.back-to-top`)

**Nenhum endpoint API, chave secreta, token JWT, AWS key ou endpoint interno descoberto no JS.**

### 3.6 robots.txt
```
User-agent: *
Allow: /
Disallow: /assets/
Disallow: /private/
Crawl-delay: 1
Sitemap: https://playbrasil.top/sitemap.xml
```

### 3.7 manifest.json (PWA)
- Name: "PlayBrasil - Teste IPTV Grátis"
- Shortcuts: "Solicitar Teste IPTV" → `/?action=solicitar-teste`
- Icons: apenas favicon.svg em múltiplos tamanhos

### 3.8 Candidatos a Vulnerabilidade — playbrasil.top

| ID | Tipo | Endpoint | Detalhes |
|----|------|----------|----------|
| E-006 | Info Disclosure | `/cdn-cgi/trace` | Mesmo do cliquex.click — expõe IP cliente |
| E-007 | Rate Limit Bypass | Múltiplos paths 429 | Cloudflare rate limiting — testar header evasão, IP rotation |
| E-008 | Path Enumeration | Paths 429 vs 404 | Diferenciação permite mapear estrutura WordPress-like |
| E-009 | XSS/Injection | Parâmetros `action=solicitar-teste` | Testar em `/?action=` e outros query params |

---

## 4. teste-iptv.mov — Enumeração Detalhada

### 4.1 Infraestrutura
| Item | Valor |
|------|-------|
| IPs | 104.21.71.23, 172.67.142.73 (Cloudflare) |
| SSL | Google Trust Services (WE1), válido até 2026-10-07 |
| Tech Stack | Static HTML inline (SPA com anchors), Google Analytics (G-EN9WN676XZ), Google Fonts |
| WAF | Cloudflare Full Proxy — **bloqueia toda enumeração ativa** |

### 4.2 Sitemap — 4 URLs
- `/`
- `/termos-de-uso.html`
- `/politica-de-privacidade.html`
- `/reembolso.html`

### 4.3 Content Discovery (feroxbuster)
- **Rate limiting severo (429)** na maioria dos paths testados
- Auto-filtering detectou página 404-like personalizada
- Apenas homepage e páginas do sitemap retornam 200 consistentemente

### 4.4 Tentativas de Bypass Cloudflare WAF

| Técnica | Resultado |
|---------|-----------|
| User-Agent Chrome 120 completo | **Funciona** — homepage retorna 200 |
| Headers Sec-Ch-Ua, Sec-Fetch-* | **Funciona** |
| Cookie challenge solving | Não testado (requer browser automation) |
| Header evasão (X-Forwarded-For, CF-Connecting-IP) | **Bloqueado** — Cloudflare sanitiza |
| Rate limiting evasion (delay, jitter) | **Parcial** — 429 persiste em paths sensíveis |

### 4.5 JavaScript Analysis
- **Apenas JS inline** na homepage
- GA4 + GTM (G-EN9WN676XZ)
- Tracking WhatsApp via `cliquex.click/whatsapp-movie`
- 10 valores de `button_location` no evento `whatsapp_click`
- **Nenhum endpoint dinâmico, API, chave ou token no JS**

### 4.6 Candidatos a Vulnerabilidade — teste-iptv.mov

| ID | Tipo | Endpoint | Detalhes |
|----|------|----------|----------|
| E-010 | WAF Bypass | `/` | Headers completos de browser real permitem acesso |
| E-011 | Rate Limit | Múltiplos | 429 em paths WordPress-like — enumeração de estrutura |
| E-012 | Info Disclosure | `/cdn-cgi/trace` | Mesmo padrão — expõe IP cliente |

---

## 5. Redirect Chain Completa

```
teste-iptv.mov/ (botão WhatsApp)
    │
    ▼
cliquex.click/whatsapp-movie (302)
    │
    ▼
wa.me/5521975444978?text=... (302)
    │
    ▼
api.whatsapp.com/send/?phone=5521975444978&text=...&type=phone_number&app_absent=0
    │
    ▼
WhatsApp App/Web (abre conversa)

playbrasil.top/ (botão WhatsApp)
    │
    ▼
cliquex.click/whatsapp-playbrasil (302)
    │
    ▼
wa.me/5511947389731?text=... (302)
    │
    ▼
api.whatsapp.com/send/?phone=5511947389731&text=...
    │
    ▼
WhatsApp App/Web
```

**Observação:** cliquex.click atua como **tracker/intermediário** — registra click, depois redireciona. Dois números WhatsApp diferentes para marcas diferentes (IPTV MOVIE vs PlayBrasil).

---

## 6. APIs Descobertas

| Domínio | Endpoint | Tipo | Status |
|---------|----------|------|--------|
| cliquex.click | `/api` | REST? | 403 Cloudflare |
| cliquex.click | `/graphql` | GraphQL | Timeout/Cloudflare |
| cliquex.click | `/swagger.json` | OpenAPI | 403 Cloudflare |
| cliquex.click | `/openapi.json` | OpenAPI | 403 Cloudflare |
| cliquex.click | `/.well-known/openid-configuration` | OIDC | 403 Cloudflare |
| playbrasil.top | — | — | Nenhuma descoberta |
| teste-iptv.mov | — | — | Nenhuma descoberta |

---

## 7. Artefatos Salvos

```
/home/ubuntu/teste-iptv.mov/enum/
├── cliquex.click/
│   ├── ferox_cliquex.txt
│   └── (outros arquivos brutos)
├── teste-iptv.mov/
│   ├── ferox_playbrasil.txt
│   ├── ferox_teste-iptv.txt
│   ├── content_discovery_playbrasil.txt
│   └── (outros arquivos brutos)
└── ENUM.md (este arquivo)
```

---

## 8. Próximos Passos Recomendados (para webapp/cve)

### Prioridade ALTA — cliquex.click
1. **Teste de autenticação em `/login`** — Credential stuffing, password spray, session fixation
2. **Análise de `/clk` pós-login** — Verificar se `next` parameter permite open redirect
3. **Enumeração de leads** — Se `/clk` expõe lista de clicks/leads, testar IDOR
4. **Subdomain takeover** — Monitorar CT logs para novos subdomínios

### Prioridade MÉDIA — playbrasil.top
1. **Bypass rate limiting (429)** — Header evasão, IP rotation via Tor circuits
2. **Teste parâmetro `action=`** — `/?action=solicitar-teste` e outros
3. **Análise de formulários** — Verificar se há forms de lead capture com validação fraca

### Prioridade BAIXA — teste-iptv.mov
1. **Bypass WAF completo** — cloudscraper, curl-impersonate, playwright
2. **Content discovery pós-bypass** — Se WAF for contornado
3. **Monitoramento CT logs** — Para IPs em SAN de certificados futuros

---

## 9. Atualização Timeline

2026-08-22T19:30:00Z — Fase 5 (Enumeração Profunda) concluída para teste-iptv.mov

