# SUMMARY.md — Attack Surface Consolidado — Ciclo 3 (2026-09-08)

**Alvo:** focusconcursos.com.br (+ ecossistema: grupofocus.com.br, focusonline.com.br, sistemaead.com.br, **faculdadefocus.com.br [NOVO]**)
**Estado:** Fase 1 (escopo) ✔ · Fase 2 (recon passivo + OSINT + cloud) ✔ · Fase 3 (recon ativo) ✔ · Fase 4 (consolidação) ✔ — este arquivo.
**OPSEC:** 100% Tor-routed (socks5h 9050 / privoxy 8118), UA rotativo, rate-limit; DNS via DoH; sem commit git; 2Captcha NÃO usado (zero desafios).
**Fonte de detalhes:** `recon/passive/PASSIVE.md`, `recon/active/ACTIVE.md`, `evidence/P-001..P-012`, `evidence/A-001..A-005`.

---

## 1. Sumário da Attack Surface

- **43 hosts web vivos** (114 subdomínios passivos de 5 domínios) — 33 já nos mapas passivos anteriores
  e novos no ativo: **docs/grupofocus (GitBook), teste.grupofocus, loja.grupofocus, faculdadefocus.com.br → pendente**.
- **10 IPs diretos + 11 membros de clusters**: AWS ALB ×2 (Laravel/nginx ×6 IP), ALB Next.js ×6,
  Træfik/Go 18.233.104.160, GoCache ×2, CloudFront ×2, EC2 origem ×2 (34.230.151.3, 107.20.109.109 — ambos SYN-blackhole anti-Tor).
- **Portas (top300):** 80/443 em todos + **SSH 22 (OpenSSH 9.6p1 Ubuntu-24.04)** apenas no pxa
  (E-Consulters AS275714) — zero outro listeners (3306/6379/27017/9200/11211/8443… nada).
- **WAF:** CORE Laravel/Next SEM WAF; Cloudfront (Amazon) no apex/www/focusonline/sistemaead;
  Cloudflare na torre ludicrous/HighLevel + docs GitBook; ELB/GoCache consistem em proxies, não WAF.
  **Sem desafios JS → 2Captcha não obrigatório.**
- **Buckets:** fc-static (5 objs public GET), focus-library (sa-east-1), **arquivos.grupofocus.com.br** e
  s3.grupofocus.com.br (us-east-1, per-object 200 público, list 403) + focus.fra1.digitaloceanspaces (403).
  WAYBACK `_next/image` leaks: `s3/us-east-1/arquivos.grupofocus/admin/4/teachers…` e
  `s3.grupofocus.com.br/admin/4/products/thumbnails…` → **admin user id 4 existente**.
- **Credencial default:** `laravel-acl` (org própria GitHub) seedea `superadmin@domain.com` / `password` (P-007).
- **Domain takeover:** manutencao (Vercel `DEPLOYMENT_NOT_FOUND` — HIGH), vip (Cloudflare err 1001 — MEDIUM).
- **API:** 0 OpenAPI/Swagger público (A-005, 903 req, 21 paths × 43 hosts); mobile /docs = stub
  `{"message":""}`; **payment /docs 500 com exceção Laravel tipada** (`track` field custom);
  crm = 503 ELB target-down completo; **docs.grupofocus GitBook API DOCS = a fonte oficial de rotas**.

## 2. Matriz de Surface (por escalonamento de payoff)

| # | Alvo / Surface | Tipo | Por quê | Fase |
|---|---|---|---|---|
| 1 | **docs.grupofocus.com.br** (GitBook API docs) | API inventory oficial | 307→`/api.grupofocus.com.br/`; parâmetros + HMACs + staging URLs + rotas internas | enum→webapp imediato |
| 2 | **teste.grupofocus.com.br** (107.20.109.109) | Laravel QA (nginx/1.18.0 ANTIGO, XSRF ativo) | QA/direct-eco 302→faculdadefocus.com.br; cred default + debug partial candidate | enum+webapp |
| 3 | **admin / lms /login** (ALB1, sem WAF) | Auth Laravel+Materialize | `superadmin@domain.com/password` single-shot (P-007); mass assignment; Livewire? | webapp |
| 4 | **wwwdev.focusconcursos.com.br** (EC2 34.230.151.3, SNI-only) | DEV environment (cert SAN confirmado) | deepHost/SNI enumeration; pode vazar configs/staging | enum-web |
| 5 | **mobile /docs** (stub Laravel API) | Params/headers API | `{"message":""}` — rotas API param-mining; /api/* sweep | enum+webapp |
| 6 | **Next.js cluster** (www3/apex/focus/media/static/prod/s3.loja.grupofocus + ead.grupofocus) | Next.js apps | CVE-2025-29927 middleware bypass; `_next/image` bucket-path leak (admin/4/*) | enum+webapp |
| 7 | **pxa (Laravel Livewire)** | Auth Livewire (Plyr 3.7.8, Alpine.js) + **SSH 22 OpenSSH 9.6p1** | Livewire component-call bypass/upload; network-phase p/ SSH (threshold) | webapp+network |
| 8 | **payment/integration APIs** (Laravel stubs, `track` field) | API param-mining + error-based dumper |
| 8 | **payment / /integration /apilms** (Laravel API) | Rotas API erradas; `track` error field; apilms rotas atrás de traefik default-cert | enum+webapp |
| 9 | **Buckets** arquivos/s3.grupofocus + fc-static | S3 public objects + region leak via GoCache | cloud |
| 10 | **crm (503)** + **faculdadefocus.com.br (novo)** | retry targets both die | enum (re-probe) |
| 11 | **Takeover** manutencao (Vercel HIGH) / vip (CF err) | dangling CNAME (P-001) | cloud |
| 12 | **O365 webmail** + **GitBook** | info/OAUTH paths (produto ONU) — baixo | [info] |

## 3. Inventário detalhado (por cluster — superset p/ enum-web)

### A) ALB-Laravel cluster (AS14618; sem WAF; **priority HIGH**)
- IPs: 54.86.140.91, 44.215.153.56, 50.16.232.142, 52.20.101.235, 3.208.58.6, 13.216.227.217 (todos 80/443)
- Hosts: **admin** (302→/login; Materialize), **lms** (302→/login), **payment** `{"message":""}` / `/docs` 500-Laravel-exceção-tipa,
  **integration** `{"message":""}` / 404 HTML; **mobile** (301→/docs `{"message":""}`); **crm** 503 (target-down);
  focusonline.com.br (301; SNI-none → `*.focusonline.com.br` M03).
- flex-Laravel: awselb/2.0 catch-all **301→https igual p/ qualquer Host** (A-002); TLS `*.focusconcursos.com.br` M01.

### B) Next.js ALB cluster (6 IPs; sem WAF; HIGH)
- IPs: 98.84.85.83, 98.94.147.72, 100.52.7.228, 100.57.155.22, 52.2.151.71, 44.217.112.44 (todos 80/443)
- Hosts: www3.focusconcursos + apex/focus/media/static/prod/s3/ead.grupofocus + **loja** (novo) + noticias.grupofocus
- App uniforme (489361B Next.js+React+Webpack); `_next/image` leaks S3 paths admin/4/*; P-008.

### C) Nó Go (18.233.104.160 — Træfik; sem WAF; HIGH)
- **noticias** Next.js HTTP/3 (LE YR2), **blog** 301→noticias, **vc** (nginx/1.31.1 301→/produtos),
  **apilms** 404/19B "TRAEFIK DEFAULT CERT" (Route router existe); grupofocus.com.br LE cert também.
- **outliers de vhosts descobertos (ffuf3 + DoH)**: `teste`(301/178), `docs`(301/167), `cdn`(404/331 GoCache size)

### D) pxa (38.211.129.213 — E-Consulters; sem WAF; HIGH)
- Caddy 2.x; Laravel+Livewire(plyr 3.7.8, Alpine.js); 302→https→/login.
- **SSH 22 OPEN** (SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.19 = Ubuntu 24.04 noble) — **única porta não-website** OTW.

### E) APIs/CDN/Bonsofens (MEDIUM)
- **GoCache** cdn.focusconcursos (170.82.174.30→403) / cdn.grupofocus (170.82.173.30→404): backend S3;
  `x-amz-bucket-region` leak; objects GET per-path 200.
- **GitBook**: docs.grupofocus.com.br → GitBook "page" (407c07d121-hosting.gitbook.io) — CF protecting; API docs!

### F) EC2 anti-scanner / QA (MEDIUM-HIGH — re-probe estratégicos)
- 34.230.151.3 — www3 origin; wwwdev vhost por SNI; Anti-Tor SYN-drop em burst.
- **107.20.109.109 — teste.grupofocus.com.br** (QA Laravel, XSRF ativo, 302→faculdadefocus.com.br novo domínio).

### G) Torre 3ª-party (LOW, mas secundário)
- ludicrous/HighLevel (sac/pagina/lps/lp/metodo/aprovacao), short.io (link), clkdmg (promocao),
  Vercel (manutencao — 404 dangling project), Mailgun (email.mail), MailerSend (email focus Caddy), O365 (webmail/autodiscover)

### H) sistemaead.com.br (CloudFront tower + aluno/ticket/empreenda Next.js — MEDIUM)
- 13.227.47.x; Next.js app 516551B idêntico ×3; SaaS escopa paralelo.

## 4. Cloud & Takeover recap (desde Fase 2)

- fc-static (5 specimens public GET), focus-library (sa-east)…, arquivos.grupofocus.com.br e s3.grupofocus.com.br
  (us-east-1, 200 on per-object direct, list blocked-but-flaky), focus.fra1.digitaloceanspaces 403.
- **S3 admin/4/teachers e admin/4/products/thumbnails** referência interna via _next/image wayback → indica admin id=4 functional.
- Takeover: manutencao (Vercel — HIGH, one-receipt), vip (CF err 1001 — MEDIUM).

## 5. OSINT highlights (desde Fase 2)
- `laravel-acl` (org própria) usa seed padrão `superadmin@domain.com` / `password` (P-007) — o alvo executa stack clone Laravel this stack.
- CNPJ ZASS E-COMMERCE LTDA (FOCUS CONCURSOS) 19.594.970/0001-90 Cascavel/PR (P-003); sem breach pública.

## 6. Findings index (P = passivo, A = ativo-2026-09-08-ciclo3)
- P-001 takeover-vercel | P-002 alb-cluster | P-003 cnpj | P-004 bucket-signature | P-005 wayback-s3 | P-006 DNS/DMARC |
  P-007 laravel-acl-defaults | P-008 nextjs-image-leak | P-009 ip-asn | P-010 gocache | P-011 domain-verification | P-012 s3-grupofocus-direct
- **A-001** portscan-redo (top300, Tor conns4; portas limpas; pxa SSH 9.6p1; anti-scan AWS)
- **A-002** vhost-discovery (catch-alls; **3 vhosts novos**: docs/teste/loja; privoxy 6877B noise caveat)
- **A-003** WAF detection (43 hosts; COMPLETA core-exterior surfaces; zero desafios JS)
- **A-004** hidden-vhosts (GitBook/teste/loja + faculdadefocus.com.br + fingerprint teste)
- **A-005** docs/api probe 43×21 (0 specs; payment 500 exception; crm 503; webmail O365)

## 7. Ranking de payoff p/ próxima fase (enum-web + webapp)

1. **docs GitBook** (API oficial) → 2. teste QA Laravel → 3. wwwdev EC2 (SNI-enum) → 4. admin/lms login default
   cred single-shot → 5. mobile /docs + /api/* params → 6. pxa Livewire attack surface → 7. loja Next.js checkout
   8. Next.js CVE-2025-29927 + _next/image bucket sweep → 9. apilms routes → 10. GoCache bucket paths → 11. crm retry → 12. focusonline tower.

## 8. Limitações consolidadas
- 34.230.151.3 e 107.20.109.109 SYN-blackhole p/ Tor em bursts — superfície TCP não enumerável (vía SNI+HTTP OK).
- Portscan top300 apenas; Tor exit variance; wafw00f attribution em CDNs híbridos; sem wordlist vhost >223.
- SaaS torre ludicrous/HighLevel é 3rd-party (brand.ludicrous.cloud) — camada de testes limitada pela terceirização (SaaS).

## 9. Hand-off (próximas ações)
- enum/webapp SEGUIR #1-#7 acima; cve: foco Next.js 15 CVE-2025-29927 + nginx/1.18/1.31 + OpenSSH 9.6p1,
  Livewire v2/v3 — atravessar CHECK, e cloud: buckets e takeover manutencao HIGH VIP runtime.
- Timeline e evidências em EngDir/timeline.log + evidence/ (P-001..P-012, A-001..A-005).

*Ciclo 3 — Fases 3-4 fechadas em 2026-09-08T16:50Z.*
