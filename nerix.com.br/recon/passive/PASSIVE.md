# PASSIVE RECON + OSINT — nerix.com.br

**Data**: 2026-08-23T00:30Z  
**Operador**: recon-passive  
**Alvo**: nerix.com.br — Plataforma SaaS de e-commerce multi-tenant (React/Vite)

---

## 1. DNS COMPLETO

### WHOIS (registro.br)
| Campo | Valor |
|-------|-------|
| Domínio | nerix.com.br |
| Proprietário | JOAO PAULO ROTERS |
| CNPJ/CPF | 57.917.756/0001-17 |
| Email | jprotersiza@gmail.com |
| Criação | 2025-10-28 |
| Expira | 2026-10-28 |
| NS | dana.ns.cloudflare.com / uriah.ns.cloudflare.com |

### Registros DNS
| Tipo | Valor |
|------|-------|
| **NS** | dana.ns.cloudflare.com, uriah.ns.cloudflare.com |
| **A** | 104.21.52.111 (Cloudflare), 172.67.198.51 (Cloudflare) |
| **AAAA** | 2606:4700:3037::ac43:c633, 2606:4700:3036::6815:346f |
| **MX** | mx1.hostinger.com (priority 5), mx2.hostinger.com (priority 10) |
| **SPF** | `v=spf1 include:_spf.mail.hostinger.com ~all` |
| **DMARC** | `v=DMARC1; p=none` — **SEM PROTEÇÃO** |
| **TXT** | brevo-code:097d65fb7f2f10b244779979d5199a84 (Brevo/Sendinblue) |
| **AXFR** | ❌ Negado (Cloudflare) |
| **DKIM** | ❌ Nenhum seletor configurado |

### Domínios similares
| Domínio | IPs | Provável uso |
|---------|-----|-------------|
| nerix.com | 99.83.248.72, 75.2.0.44 | AWS (possível redirect) |
| nerix.net | 144.91.87.2 | Hetzner? |
| nerix.org | 23.227.38.65 | Shopify |
| nerix.io | 76.223.54.146, 13.248.169.48 | AWS |
| nerix.dev | 192.64.119.73 | DNS |

---

## 2. SUBDOMÍNIOS

### Totais
| Fonte | Quantidade |
|-------|-----------|
| subfinder | 9 (8 subdomínios + root) |
| assetfinder | 10 |
| crt.sh | 0 (bloqueado) |
| amass | 0 (timeout) |
| OTX | 0 |
| Hackertarget | 9 |
| CertSpotter | 6 (multi-SAN cert) |
| **Consolidado (dedup)** | **10 subdomínios únicos** |

### Lista completa

| Subdomínio | IP | Status HTTP | Tech Stack |
|------------|---|------------|------------|
| **nerix.com.br** | 104.21.52.111 / 172.67.198.51 (CF) | 200 - "Nerix" | React SPA (Vite), PWA, Google Fonts, CF |
| **admin.nerix.com.br** | 104.21.52.111 / 172.67.198.51 (CF) | 200 - "Nerix" | React SPA, Cloudflare |
| **app.nerix.com.br** | 104.21.52.111 / 172.67.198.51 (CF) | 200 - "Nerix" | React SPA, Cloudflare |
| **api.nerix.com.br** | 104.21.52.111 / 172.67.198.51 (CF) | 404 - "Error" | API com headers de segurança (CORS, RateLimit, CSP) |
| **cdn.nerix.com.br** | 104.21.52.111 / 172.67.198.51 (CF) | 404 - "Not Found" | Cloudflare NEL |
| **docs.nerix.com.br** | 104.21.52.111 / 172.67.198.51 (CF→Vercel) | 308→200 | Mintlify (Next.js), Vercel |
| **links.nerix.com.br** | 3.174.83.65/97/98/126 (AWS CloudFront) | 400 - Bad Request | Resend (email platform), CloudFront |
| **pay.nerix.com.br** | 104.21.52.111 / 172.67.198.51 (CF) | 200 - "Nerix" | React SPA, Google Fonts |
| **quiz.nerix.com.br** | 104.21.52.111 / 172.67.198.51 (CF) | 200 - "Nerix" | React SPA, Cloudflare |
| **status.nerix.com.br** | 104.21.52.111 / 172.67.198.51 (CF) | 200 - "Status Nerix" | React SPA, Cloudflare |

**Total**: 10 subdomínios  
**Vivos (200)**: 7 (nerix, admin, app, pay, quiz, status, docs)  
**Vivos (redirect/404)**: 3 (api, cdn, links)  

---

## 3. IPs DE ORIGEM REAL (FORA CLOUDFLARE)

| Subdomínio | IPs Reais | Infra |
|------------|----------|-------|
| **links.nerix.com.br** | 3.174.83.65, 3.174.83.97, 3.174.83.98, 3.174.83.126 | AWS CloudFront (us-east-1) |
| **docs.nerix.com.br** | Via Cloudflare → Vercel (Cloudflare proxied) | Vercel (Mintlify) |

**Potencial bypass CF**: links.nerix.com.br está **fora do Cloudflare** — expõe IPs AWS reais (3.174.83.0/24). Pode ser utilizado para pivoting ou enumeração da ASN AWS.

**Favicon hash (Shodan)**: `1229986882` — `http.favicon.hash:1229986882`

---

## 4. TECH STACK DETALHADO

### nerix.com.br (e admin/app/pay/quiz)
- **Frontend**: React 18+ (Vite bundler)
- **JS bundles identificados**:
  - `/assets/index-DweF7uBg.js` (entry point)
  - `/assets/vendor-Dy5IKjqd.js` (core vendor ~8.6MB)
  - `/assets/router-vendor-DSrk6AUX.js` (React Router)
  - `/assets/oauth-vendor-C69S00M4.js` (Google OAuth)
  - `/assets/charts-vendor-DxdaS3nJ.js` (Gráficos/Charts)
  - `/assets/socket-vendor-DnJ_NaQw.js` (WebSocket client)
  - `/assets/i18n-vendor-BA0TChVn.js` (i18n internacionalização)
  - `/assets/dnd-vendor-D0IRJvDX.js` (Drag & Drop)
- **Tema**: dark/light mode (store-theme-storage no localStorage)
- **PWA**: Sim (manifest.json v2.0.1, service worker)
- **CDN assets**: https://cdn.nerix.com.br/ (logo, icons)
- **Ícone favicon**: `https://cdn.nerix.com.br/Nerix%20Logo%20Principal.png`
- **PWA icon**: `https://cdn.nerix.com.br/LOGOS%20NERIX/NERIX-AURA1.png`
- **Store URL**: `/store` (start_url no manifest)

### Integrações identificadas (do JS)
| Tecnologia | Detalhe |
|------------|---------|
| **Google OAuth** | VITE_GOOGLE_CLIENT_ID, Google Sign-In (GSI) |
| **Stripe** | `sk_live_*`, `pk_test_*` (padrões encontrados) |
| **WebSockets** | `socket.io` |
| **Google Analytics** | G-XXXXXXXXXX |
| **Google Tag Manager** | GTM-XXXXXXX |
| **Google Fonts** | Inter, Plus Jakarta Sans, Poppins, Montserrat, Roboto |
| **Fontsource** | @fontsource/geist-sans |
| **Flag Icons** | flag-icons (cdn.jsdelivr.net) |
| **i18n** | Internacionalização (pt-BR padrão) |

### docs.nerix.com.br
- **Plataforma**: Mintlify (Next.js-based documentation)
- **Infra**: Vercel (headers: x-vercel-id, x-vercel-project-id, x-vercel-cache)
- **Sitemap**: 83 páginas documentadas

### status.nerix.com.br
- **Tipo**: Página de status separada (não é o mesmo SPA)

### links.nerix.com.br
- **Provedor**: Resend (email marketing platform)
- **CNAME**: `links1.resend-dns.com` → `dnimfezcq57tg.cloudfront.net`
- **Infra**: AWS CloudFront (POP: GRU3-P9 - São Paulo)
- **Status**: 400 Bad Request (protegido)

### api.nerix.com.br
- Headers de segurança: CSP, CORS, RateLimit, HSTS (15552000s)
- **Auth**: Header `X-nerixkey` (ou `nerixkey`) com formato `nrk_live_*`

---

## 5. OSINT

### Pessoa / Empresa
| Campo | Valor |
|-------|-------|
| Nome | JOAO PAULO ROTERS |
| CNPJ | 57.917.756/0001-17 |
| Tipo | MEI (Microempreendedor Individual) — **BAIXADA** desde 11/02/2026 |
| Motivo baixa | Extinção por encerramento liquidação voluntária |
| Capital social | R$ 5.000,00 |
| Data abertura | 31/10/2024 |
| Email | jprotersiza@gmail.com |
| Telefone | (41) 9958-7276 |
| WhatsApp | +55 41 99956-6175 |
| Endereço | Rua Niche Andriole, 78, Brejatuba, Guaratuba - PR, CEP 83.280-000 |
| Simples Nacional | Baixado em 11/02/2026 |

### Redes Sociais / Canais
| Plataforma | Handle/URL |
|------------|-----------|
| Instagram | @nerix_oficial (existente) |
| Instagram | @nerix_ (existente) |
| LinkedIn | /company/nerix (existente) |
| Discord | https://discord.gg/Zn29zjE6SR |
| GitHub | Nenhum repositório público encontrado |

### Emails encontrados
- jprotersiza@gmail.com (proprietário/contato WHOIS)
- brevo-code:097d65fb7f2f10b244779979d5199a84 (Brevo/Sendinblue)

### Breaches
- Email do proprietário não encontrado em bases públicas via proxyonva

---

## 6. CLOUD BUCKETS

### S3 Buckets
| Bucket | URL | Status |
|--------|-----|--------|
| **nerix-prod** | http://nerix-prod.s3.amazonaws.com | **403 Forbidden** (existe) |
| nerix-prod (us-west-1) | redirect → us-east-1 (301) |
| nerix-prod (us-west-2) | redirect → us-east-1 (301) |
| nerix-prod (eu-west-1) | redirect → us-east-1 (301) |
| nerix-prod (sa-east-1) | redirect → us-east-1 (301) |

> **Nota**: Bucket `nerix-prod` existe e está em us-east-1 (confirmado via x-amz-bucket-region). Retorna 403 AccessDenied — **não é público**. Pode conter dados de produção.

### CloudFront
- `links.nerix.com.br` → `dnimfezcq57tg.cloudfront.net` (Resend email platform)

### Takeover Candidates
- Nenhum CNAME dangling encontrado (todos os CNAMEs resolvem)
- `links.nerix.com.br` CNAME (links1.resend-dns.com) resolve → CloudFront

---

## 7. WAYBACK MACHINE HIGHLIGHTS

Apenas **19 URLs** arquivadas (site recente, criado em 2025-10-28):

| URL | Status | Timestamp |
|-----|--------|-----------|
| http://nerix.com.br/ | 200 | Múltiplas |
| http://nerix.com.br/favicon.ico | 200 | 1 captura |
| http://nerix.com.br/robots.txt | 200/302 | 2 capturas |
| http://www.nerix.com.br/robots.txt | 200 | 1 captura |
| http://www.nerix.com.br/static/images/... | 200 | 1 captura |

**Nada relevante** — site muito recente, pouco histórico.

---

## 8. API DOCS ENDPOINTS (83 páginas documentadas)

### API Reference (REST)
| Categoria | Endpoints |
|-----------|----------|
| **Autenticação** | Header `X-nerixkey` (formato `nrk_live_*`) |
| **Rate Limits** | Documentado (não divulgado o limite exato) |
| **Affiliates** | list, approve |
| **Categories** | create, list, delete-all |
| **Coupons** | create, list |
| **Customers** | list, get-top |
| **Orders** | create, get, list, check-payment |
| **Products** | create, get, list, update, delete-all, get-keys, variantes |
| **Reviews** | list, approve |
| **Store** | get |
| **Webhooks** | order-approved |

### API Pix
- `/api-pix/visao-geral`
- `/api-pix/llm`

### Infoprodutos
- `/infoprodutos/webhooks/eventos`

### Guias da plataforma
- Primeiros passos
- Loja e configurações (inclui editor de template)
- Pagamentos e Pix
- Integrações (inclui primeira requisição API)

---

## 9. JS BUNDLE FINDINGS

### Secrets/Keys patterns encontrados
| Pattern | Contexto |
|---------|---------|
| `sk_live_*` | Stripe secret key (live) — apenas padrão, valor não hardcoded |
| `pk_test_*` | Stripe publishable key (test) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_FACEBOOK_APP_ID` | Facebook App ID |
| `PROPERTY_ID` | Google Analytics property |
| `NERIX_API` | API key (referência interna) |

### API Routes (do JS)
- Padrão de URL: `https://{subdomain}.{xn(...)}/api/...`
- Parâmetros: `token`, `subdomain`, `primary_domain`
- WebSocket: socket.io
- OAuth callback: `https://{host}/accounts`

### URLs externas embutidas
- `https://accounts.google.com/gsi/client` (Google OAuth)
- `https://cdn.jsdelivr.net/npm/flag-icons/css/flag-icons.min.css`
- `https://fonts.googleapis.com/...`
- `https://fonts.gstatic.com/...`

---

## 10. VULNERABILIDADES / PAYOFF PRELIMINAR

### 🔴 ALTO
| Finding | Detalhe |
|---------|---------|
| **Subdomínio fora do Cloudflare** | `links.nerix.com.br` — IPs AWS reais expostos (3.174.83.0/24) |
| **S3 bucket privado** | `nerix-prod` existe — possível vazamento se misconfigured |
| **DMARC p=none** | Sem proteção — permite spoofing de email |
| **CNPJ baixado** | MEI baixado — empresa operando irregularmente? |
| **Stripe live key pattern** | Código referência `sk_live_*` — se vazar em JS/env, risco financeiro |

### 🟡 MÉDIO
| Finding | Detalhe |
|---------|---------|
| **API rate limits não divulgados** | Podem ser bruteforçados |
| **API Key no Header** | `X-nerixkey` — se interceptada, acesso total à API |
| **WebSockets** | Possível tempo-real com dados sensíveis |
| **PWA com assets no CDN** | cdn.nerix.com.br retorna 404 — assets podem estar desatualizados |
| **Google OAuth** | Se misconfigured, permite account takeover |
| **Brevo code exposto** | brevo-code no DNS TXT — pode ser usado para email spoofing |
| **Sem DKIM** | Permite falsificação de email |

### 🔵 BAIXO
| Finding | Detalhe |
|---------|---------|
| **CSP headers (api subdomain)** | Pode ser explorado se misconfigured |
| **SPF ~all (softfail)** | Permite spoofing mais fácil que -all |
| **2 domínios Cloudflare A record** | Apenas 2 IPs anycast |
| **Nenhum CNAME dangling** | Sem takeover de subdomínio imediato |

---

## 11. LIMITAÇÕES DA FASE PASSIVA

- crt.sh bloqueado (502/erro) — certificados não auditados via essa fonte
- amass timeout no modo passivo (possível bloqueio de rede)
- Shodan API key não configurada (favicon hash calculado: 1229986882)
- Censys consultado sem retorno de dados relevantes
- GitHub search necessita autenticação
- waybackurls retornou 0 URLs (problema de rede Tor) — CDX alternativo usado
- cdn.nerix.com.br retorna 404 (assets referenciados no HTML mas inacessíveis)

---

## 12. PRÓXIMOS PASSOS RECOMENDADOS (RECON ATIVO)

1. **Port scan** nos IPs reais do `links.nerix.com.br` (3.174.83.0/24)
2. **Content discovery** em `nerix.com.br`, `app.nerix.com.br`, `admin.nerix.com.br`
3. **Testar API endpoints** documentados na docs (api.nerix.com.br)
4. **Verificar Stripe key exposure** — tentar detectar se `sk_live_*` está hardcoded
5. **Testar S3 bucket** `nerix-prod` por métodos alternativos (PUT/GET com extensões)
6. **Verificar takeover** de `nerix.com`, `nerix.net`, `nerix.org`, `nerix.io`
7. **WAF fingerprint** via wafw00f
8. **Shodan search** com favicon hash `1229986882`
9. **CertSpotter** para certificados wildcard adicionais
10. **Brute-force de subdomínios** (ffuf/dnsrecon) além dos passivos

---

**Artefatos brutos em**: `/home/ubuntu/nerix.com.br/recon/passive/`