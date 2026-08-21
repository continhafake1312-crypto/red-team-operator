# Recon Passivo - focusconcursos.com.br

## DNS

- **SOA:** ns-411.awsdns-51.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400
- **NS:** ns-411.awsdns-51.com, ns-1211.awsdns-23.org, ns-571.awsdns-07.net, ns-1638.awsdns-12.co.uk
- **MX:** focusconcursos-com-br.mail.protection.outlook.com (Microsoft 365)
- **DMARC:** `v=DMARC1; p=quarantine; rua=mailto:ti@focusconcursos.com.br;`
- **SPF:** `v=spf1 include:_spf.mailersend.net include:spf.protection.outlook.com include:emsd1.com -all`
- **A (root):** 44.213.166.252, 3.232.97.233, 52.87.39.184, 54.146.63.32, 18.214.43.51, 52.207.129.5
- **AAAA:** None
- **CNAME:** None (root)
- **AXFR:** Failed (NS servers are AWS Route53, expected)
- **Total IPs:** 35 unique IPs

**Subdomínios:**
- **Total encontrados (todas fontes):** 67
- **Resolvidos (DNS):** 29
- **Vivos (HTTP 200/301/302/403/503):** 28

## Tech Stack

| Host | Status | Tech | Server | Title |
|------|--------|------|--------|-------|
| focusconcursos.com.br | 301 | AWS ELB | awselb/2.0 | - |
| www.focusconcursos.com.br | 301 | AWS ELB | awselb/2.0 | - |
| www3.focusconcursos.com.br | 200 | Next.js, Node.js, React, Webpack | - | - |
| noticias.focusconcursos.com.br | 200 | Next.js, Node.js, React, Webpack | - | Notícias Focus Concursos |
| integration.focusconcursos.com.br | 200 | Laravel, PHP, Nginx | nginx | - |
| admin.focusconcursos.com.br | 302 | Nginx | nginx | Redirect to /login |
| lms.focusconcursos.com.br | 302 | Nginx | nginx | Redirect to /login |
| payment.focusconcursos.com.br | 200 | Nginx | nginx | - |
| mobile.focusconcursos.com.br | 301 | Nginx | nginx | Redirect to /docs |
| vc.focusconcursos.com.br | 301 | Nginx 1.31.1 | nginx/1.31.1 | Redirect to /produtos |
| blog.focusconcursos.com.br | 301 | - | - | Redirect to noticias |
| sac.focusconcursos.com.br | 200 | Express, Node.js, Cloudflare, Google Cloud | cloudflare | - |
| pagina.focusconcursos.com.br | 200 | Express, Node.js, Cloudflare, Google Cloud | cloudflare | - |
| lps.focusconcursos.com.br | 200 | Nuxt.js, Vue.js, Node.js, HighLevel, Cloudflare | cloudflare | - |
| lp.focusconcursos.com.br | 404 | Vue.js, Cloudflare, Google Cloud CDN | cloudflare | 404 - Page Not Found |
| aprovacao.focusconcursos.com.br | 404 | Vue.js, Cloudflare, Google Cloud CDN | cloudflare | 404 - Page Not Found |
| metodo.focusconcursos.com.br | 302 | Cloudflare, Google Cloud CDN | cloudflare | Redirect to /home |
| pxa.focusconcursos.com.br | 302 | PixelX App, HSTS | - | Redirect to /login |
| crm.focusconcursos.com.br | 503 | Amazon ELB, AWS | awselb/2.0 | 503 Service Unavailable |
| apilms.focusconcursos.com.br | 503 | - | - | - |
| cdn.focusconcursos.com.br | 403 | GoCache, AWS | - | - |
| webmail.focusconcursos.com.br | 301 | Microsoft HTTPAPI | Microsoft-HTTPAPI/2.0 | Redirect to /mail |
| email.focusconcursos.com.br | 200 | Caddy | - | - |
| email.mail.focusconcursos.com.br | 404 | - | - | - |
| manutencao.focusconcursos.com.br | 404 | Vercel, HSTS | Vercel | - |
| link.focusconcursos.com.br | 302 | Short.io | - | Redirect to / |
| promocao.focusconcursos.com.br | 301 | - | - | - |
| vip.focusconcursos.com.br | 409 | Cloudflare | - | - |
| iiysjm.focusconcursos.com.br | - | - | - | - |
| wwwdev.focusconcursos.com.br | timeout | - | - | - |

## Wayback Machine Highlights

- **Total URLs históricas:** 54
- **Endpoints sensíveis:** 6 (well-known endpoints)
  - `/.well-known/ai-plugin.json`
  - `/.well-known/assetlinks.json`
  - `/.well-known/dnt-policy.txt`
  - `/.well-known/gpc.json`
  - `/.well-known/security.txt`
  - `/.well-known/trust.txt`
- **JS/JSON files históricos:** 3
- **Endpoints notáveis com parâmetros:**
  - `?pg=turmas&ini=0&cid=1` (pagination parameter)
  - `?pg=noticias&id=891-893` (IDOR potencial)
  - `?a_aid=folhadirigidaafiliado&a_bid=73d672s1` (affiliate tracking)
  - `?_rsc=1ivib` (Next.js RSC)
- **Observação:** Poucas URLs no Wayback (54 apenas). Domínio relativamente jovem ou com pouca indexação.

## Cloud Buckets

- **S3 Scanner:** Nenhum bucket público acessível encontrado
  - "fc" retornou status "invalid" (bucket existe mas não é público)
- **Fingerprint:** CDN principal via GoCache (cdn.focusconcursos.com.br -> cdn.focusconcursos.com.br.cdn.gocache.net)
- **Assets storage:** Possível uso de armazenamento AWS (ELB, EC2)

## Takeover Candidates (subjack)

- **Subjack:** Nenhum takeover detectado (main domain not vulnerable)
- **CNAMEs para serviços externos (monitorar):**
  - `sac.focusconcursos.com.br` -> `brand.ludicrous.cloud` (Ludicrous)
  - `pagina.focusconcursos.com.br` -> `brand.ludicrous.cloud` (Ludicrous)
  - `lp.focusconcursos.com.br` -> `sites.ludicrous.cloud` (Ludicrous)
  - `metodo.focusconcursos.com.br` -> `sites.ludicrous.cloud` (Ludicrous)
  - `promocao.focusconcursos.com.br` -> `hosted.clkdmg.site`
  - `pxa.focusconcursos.com.br` -> `dns.pixelx.app` (PixelX)
  - `link.focusconcursos.com.br` -> `cname.short.io` (Short.io)
  - `email.focusconcursos.com.br` -> `links.mailersend.net` (MailerSend)
  - `email.mail.focusconcursos.com.br` -> `mailgun.org` (Mailgun)
  - `vip.focusconcursos.com.br` -> `cname.greatpages.com.br`
  - `cdn.focusconcursos.com.br` -> `cdn.focusconcursos.com.br.cdn.gocache.net` (GoCache)
  - `webmail.focusconcursos.com.br` -> `outlook.office.com` (Microsoft 365)

## Observações de Segurança

- **DMARC:** `p=quarantine` — boa prática, mas sem relatórios agregados configurados
- **SPF:** Inclui MailerSend, Outlook, e emsd1.com — surface para spoofing se algum domínio expirar
- **Headers de Segurança:**
  - HSTS presente em: pxa, noticias, manutencao, sac, pagina
  - X-Frame-Options: SAMEORIGIN em pxa, noticias
  - X-XSS-Protection presente em pxa
  - Access-Control-Allow-Origin em www3 (CORS aberto)
- **Cookies:** HttpOnly em sessões (admin_session, lms_session, laravel_session)
- **Informações vazadas:** Versão do nginx (1.31.1) exposta via vc.focusconcursos.com.br

## OSINT

### Empresa
- **Razão Social:** RWR CURSOS PREPARATÓRIOS PARA CONCURSOS LTDA (Focus Concursos / Grupo Focus)
- **CNPJ:** 19.594.970/0001-90
- **Endereço:** Rua Maranhão, nº 924, Centro, sala 305, Cascavel - PR
- **Proprietário:** Ruy Wagner Astrath (CPF ***.093.878-**)
- **Site:** https://focusconcursos.com.br

### Pessoas Mapeadas (11)
| Nome | Cargo | Contato |
|------|-------|---------|
| Ruy Wagner Astrath | Proprietário | - |
| Luis (funcionário/dev) | Tech Lead / Desenvolvedor | luis@focusconcursos.com.br, luis@grupofocus.com.br, luiscvel28@gmail.com |
| Prof. Carlos André | Professor | - |
| Prof. Roberto | Professor | - |
| Prof. Ronaldo | Professor | - |
| Prof. Pedro | Professor | - |
| Prof. Lucas | Professor | - |
| Prof. Gustavo | Professor | - |
| Prof. Jader | Professor | - |
| Prof. Alexander | Professor | - |
| Prof. Sávio | Professor | - |

### Emails Encontrados (7)
| Email | Fonte | Cargo/Serviço |
|-------|-------|---------------|
| financeiro@grupofocus.com.br | theHarvester/Google | Financeiro |
| sac@grupofocus.com.br | theHarvester/Google | SAC Grupo Focus |
| sac@focusconcursos.com.br | WHOIS/Google | SAC Focus Concursos |
| secretaria@faculdadefocus.com.br | theHarvester | Secretaria Faculdade Focus |
| luiscvel28@gmail.com | GitHub | Dev (Luis) |
| luis@grupofocus.com.br | GitHub | Dev Grupo Focus |
| luis@focusconcursos.com.br | GitHub | Dev Focus Concursos |

### Breaches / Cred-stuffing Candidates
- Nenhum vazamento público confirmado para os emails listados
- **Cred-stuffing candidates:** 7 emails para testar nos painéis de login
- **Senhas comuns sugeridas:** Focus@2024, Focus@2025, Focus@2026, focus123, grupofocus, Cascavel2024, Cascavel2025

### Repositórios GitHub (5 públicos)
| Repo | Descrição | Tecnologia |
|------|-----------|-----------|
| laravel-acl | ACL para Laravel | Laravel/PHP |
| laravel-modular-skeleton | Modular Laravel skeleton | Laravel/PHP |
| front-end-test | Teste front-end | JavaScript |
| back-end-test | Teste back-end | PHP |
| sambatech-laravel | Integração SambaTech/Laravel | Laravel/PHP |
- **Secrets vazados:** Nenhum — apenas placeholders .env.example
- **Tecnologia confirmada:** Laravel + PHP no backend, Next.js + React no frontend

### Google Dorks Highlights
- Diretórios expostos: nenhum encontrado
- Documentos PDF/DOC/XLS: alguns PDFs de materiais de estudo (públicos)
- Painéis admin: admin.focusconcursos.com.br (confirmado), lms.focusconcursos.com.br (confirmado)

### Login Panels Identified
1. https://admin.focusconcursos.com.br/login
2. https://lms.focusconcursos.com.br/login
3. https://webmail.focusconcursos.com.br/mail
4. https://oauth.focusconcursos.com.br/
5. https://pxa.focusconcursos.com.br/login

## Recomendações para recon ativo

1. **Port scanning:** Focar nos IPs 18.233.104.160 (vários subdomínios), 54.152.191.245 (admin/lms/payment), 34.232.87.139 (lms/payment/mobile)
2. **Web enumeration prioritária:**
   - `admin.focusconcursos.com.br` — painel admin (provável bypass/auth testing)
   - `lms.focusconcursos.com.br` — LMS (login page, session handling)
   - `integration.focusconcursos.com.br` — Laravel (debug, route enumeration)
   - `payment.focusconcursos.com.br` — pagamento (IDOR, parameter tampering)
   - `pxa.focusconcursos.com.br` — PixelX dashboard
   - `sac.focusconcursos.com.br` — atendimento (Express/Node)
   - `www3.focusconcursos.com.br` — Next.js (SSR, API routes)
3. **Directories/files:** Buscar `/api`, `/graphql`, `/swagger`, `/console`, `/backup`, `.env`, `.git`
4. **IDOR testing:** Nos parâmetros `?pg=noticias&id=` e `?pg=turmas&ini=`
5. **Bucket enumeration:** Investigar bucket "fc" (S3, pode ser privado com acesso negado)
6. **CNAME monitoring:** Re-verificar takeovers periodicamente (ludicrous.cloud, clkdmg.site, greatpages.com.br)
7. **WAF detection:** wafw00f no admin/lms (Cloudflare detectado em vários hosts)