# ACTIVE.md — Recon Ativo — Ciclo 3 — focusconcursos.com.br

**Data:** 2026-09-08 (executado do zero, 100% Tor-routed; retomado após abort do agente anterior ~70%)
**Operador:** recon-active specialist
**OPSEC:** todos os scans/requests via Tor (SOCKS5 127.0.0.1:9050 / privoxy 8118) — verificação de saída
Tor confirmada durante a fase (185.220.100.246 / 45.84.107.76 / 91.206.26.26 rotativos). Sem tráfego direto.
**Artefatos-fonte:** portmap_*.txt, scan_*.log, whatweb_all.txt, httpx_all.txt, tls_summary.txt, tls_full_san.txt,
docs_api_probe.txt, docs_refined.txt, vhosts3_*.json, banner_results.txt, waf_wafw00f.csv/stdout, waf_wafw00f_summary.txt.

---

## 1. Sumário Executivo

- **Rede direta mapeada:** 9 IPs de origem real (+1 novo: 107.20.109.109) + 11 IPs de cluster/CDN.
  Únicos serviços: HTTP(80)/HTTPS(443) em TODOS + **SSH(22) no pxa 38.211.129.213**.
  Nenhum outro listener dentro do top300 de frequência nmap (nem 8443, 3306, Redis
  6379, Mongo 27017, Elastic 9200, memcached 11211, SMTP/LDAP/etc.) — perímetro enxuto.
- **Stack confirmada:** AWS ALB (Laravel+nginx) ×2 pares, ALB Next.js cluster ×6 IPs,
  Træfik+nginx/1.31.1+Next.js no nó Go 18.233.104.160, Caddy no pxa, GoCache CDN
  (170.82.173/174.30), CloudFront na torre ludicrous/HighLevel e no sistemaead.com.br,
  **nginx/1.18.0 (Ubuntu)** no NOVO host teste.grupofocus.com.br (Laravel, XSRF-TOKEN vivo).
- **3 NOVOS VHOSTS (16:4x via DNS/SNI cross-checks):** `docs.grupofocus.com.br` (GitBook
  **API DOCS** → 307 /api.grupofocus.com.br/), `teste.grupofocus.com.br` (Laravel QA em IP
  novo 107.20.109.109; 302 → **domínio NOVO `faculdadefocus.com.br`**), `loja.grupofocus.com.br`
  (app Next.js no cluster; 200 489361B).
- **EC2 34.230.151.3** (origem www3/aplicação Next.js) **e 107.20.109.109** têm defesa anti-recon:
  SYN-blackhole para todos os exits Tor quando acontecem bursts de connect-scan; reschedules.
- **Vhosts:** somente os 43 hosts conhecidos + 3 concealed (docs/teste/loja) — sem vhosts
  administrativos/staging internos (absentes at HTTP level).
- **WAF:** CORE (admin/lms/mobile/payment/integration/www3/apex/focus/media/static/prod/
  s3/ead.grupofocus/pxa) NÃO tem WAF (nem Cloudflare nem AWS WAF) — superfície Laravel/Next
   crua, só atrás do ELB. Apenas a torre CloudFront (ludicrous/HighLevel + sistemaead) e
  Cloudfront do apex têm shielding. **Sem challenges JS** → 2Captcha desnecessário até aqui.
- **API/docs:** nenhum OpenAPI/Swagger real exposto em hosts vivos nos 21 paths (A-005);
  MAS `docs.grupofocus.com.br` = **GitBook "api.grupofocus.com.br"** (site oficial de docs);
  mobile /docs responde `{"message":""}` (stub Laravel); payment /docs = 500 com exceção
  Laravel tipada; www3/focusconcursos SPA Next.js devolvem 200-catch-all.

---

## 2. Hosts diretos — Inventário consolidado (IP/ASN/Portas/Serviços/Versões/TLS)

Fontes: portmap_*.txt (top300 redo), banner_results.txt, tls_full_san.txt/tls_summary.txt, whatweb_all.txt, httpx_all.txt.

| IP | ASN | Portas (top300) | Serviço/Banner/Versão |
|---|---|---|---|
| **54.86.140.91** | AS14618 AWS | 80 OPEN, 443 OPEN | AWS **ALB** (awselb/2.0); hosts: admin(302→/login), lms(302→/login), crm(503 162B), payment(200 15B JSON), integration(200 15B JSON), mobile(301→/docs), focusonline.com.br (301); TLS: `*.focusconcursos.com.br` (Amazon RSA 2048 M01), SNI-none → `*.focusonline.com.br` (M03) |
| **44.215.153.56** | AS14618 AWS | 80, 443 | mesmo ELB/cluster do ALB1 (comportamento idêntico sobre top300 e Host fuzz — ver A-002) |
| 50.16.232.142, 52.20.101.235, 3.208.58.6, 13.216.227.217 | AS14618 | 80 (443 em 3 de 4) | membros do mesmo ELB ALB (Laravel targets admin/lms/crm/payment/integration/mobile) |
| **98.84.85.83** | AS14618 AWS | 80, 443 | **ALB Next.js** catch-all 301→:443; Cluster members: 98.94.147.72, 100.52.7.228, 100.57.155.22, 52.2.151.71, 44.217.112.44 — todos 80/443 OPEN |
| **18.233.104.160** | AS14618 AWS | 80, 443 | **Træfik + Node/Next.js** (noticias 200 Next.js HTTP/3, blog 301→noticias, vc 301→/produtos `nginx/1.31.1`, apilms 404 via Træfik "TRAEFIK DEFAULT CERT") |
| **34.230.151.3** | AS14618 AWS | SYN-BLACKHOLED | EC2 origem real (www3 Next.js back-up; TLS SNI `wwwdev.focusconcursos.com.br` respondia 15:06Z — vhost **wwwdev** confirmado no cert); scan TCP bloqueado para todos os exits Tor |
| **107.20.109.109 (NOVO)** | AS14618 AWS | SYN-BLACKHOLED (burst) | `teste.grupofocus.com.br` — **nginx/1.18.0 (Ubuntu)** + Laravel (XSRF-TOKEN); 302→ https://www.faculdadefocus.com.br; TCP-connect burst → SYN-drop; HTTP/curl funcionando com UA-arrotato |
| **38.211.129.213** | AS275714 E-Consulters | 80, 443, **22 SSH** | **Caddy**→Laravel Livewire (pxa 302→https→/login); **SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.19** (Ubuntu 24.04 LTS noble) — banner grab 15:58Z |
| **170.82.173.30 / 170.82.174.30** | AS266444 3L Cloud | 80, 443 | **GoCache CDN** (`gocache` header; `__goc_session__` cookie; `x-amz-bucket-region` leak aponta S3 backend; cdn.focus=403, cdn.grupofocus=404) |
| 13.227.47.21, 13.227.47.104 | AS16509 | 80, 443 | **CloudFront** (distribuições sistemaead/apex) |
| demais (104.18.x/172.64.x, 34.149.23.191, 130.211.50.189, 66.33.60.x, 91.197.243.143) | CF/Google/Vercel/Short.io | web | torres terceiras (HighLevel/ludicrous, clkdmg, short.io, Vercel, Mailgun) — ver PASSIVE.md |

### #SERVICE notes (adicionadas nos portmaps/headers)
- ALB1/ALB2 (54.86 & 44.215 + miembros): `awselb/2.0`, targets nginx/Laravel (PHP-FPM),
  JSON stub `{"message":""}` (payment/integration/mobile após rota). Sem headers de WAF.
- Next-ALB 98.84: awselb/2.0 301→https de TODOS os vhosts Next.js conhecidos (apex/focus/media/
  static/prod/s3/ead.grupofocus + www3/noticias.grupofocus) — same app (489361 bytes), HSTS off.
- Go 18.233: `nginx/1.31.1` no vc; trauma Træfik DEFAULT CERT no apilms; HTTP/3/QUIC anunciado.
- pxa (Caddy 2.x): Caddy 302→https; cookies `laravel_session`? (plaintext ignorado); SSH 9.6p1 Ubuntu24.
- GoCache: `server: gocache`, HTTP/2, backend S3 via x-amz.
- webmail/autodiscover: **Microsoft-HTTPAPI/2.0** (exchange O365, x-feserver headers).
- email.focusconcursos.com.br: **Caddy** (130.211.50.189 → links.mailersend.net).

## 3. Portmap por alvo (top300 TCP-connect, Tor)
- Arquivos: `portmap_<ip>.txt` (cada com `# scan-start/end`, `#SERVICE` notes e, quando
  filtrado sem resposta, `FILTERED(timeout)`) + `portmap_albmembers.txt` (11 IPs cluster).
- `junk/` contém runs anteriores corrompidos (run1-junk/run2) p/ auditoria — NÃO usar.
- Resumo: 80/443 em todos os 8 IPs primários; +22 apenas no pxa; nada além disso.
- `scan_members.log`: 11 hosts cluster: 80/443 confirms; (100.52.7.228 e 50.16.232.142 só 80).

## 4. TLS/SANs (resumo — detalhe em tls_full_san.txt)
- `*.focusconcursos.com.br` / `*.grupofocus.com.br` — Amazon RSA 2048 M01 (ALBs).
- `*.focusonline.com.br` — M03 (SNI-none no ALB1-A).
- Let's Encrypt (YR1/YR2/YE1/YE2): noticias, vc, grupofocus.com.br raiz, pxa, cdn.*.
- `sistemaead.com.br` (CloudFront M04) sobre 13.227.47.21.
- **wwwdev.focusconcursos.com.br** — EC2 34.230.151.3 (SAN do cert do origin; host ainda não
  alcançável por Tor — alvo forte p/ enum-web — dev environment!)

## 5. WAF por host (wafw00f — A-003)
- Estes hosts NÃO têm WAF (exceto as torres CF/Cloudfront de terceiros): admin, lms, mobile,
  payment, integration, apilms, www3, apex/focus/media/static/prod/s3/ead.grupofocus, pxa, blog,
  noticias, wwwdev, teste-grupofocus (novo, sem scan WAF — dedução por origem direta).
- Cloudfront (Amazon): focusconcursos.com.br, www, focusonline.com.br, sistemaead (+3 sub).
- Cloudflare: lp, lps, metodo, aprovacao, sac (torre ludicrous/HighLevel), docs.grupofocus
  (GitBook sob Cloudflare) e vip (err 1001).
- AWS ELB: crm, cdn.* (attribution only, sem WAF real).
- **Sem challenge JS/CAPTCHA em nenhum host testado via Tor** (A-003 + cf-ray smokes).

## 6. Vhost discovery (ffuf3 com/sem -ac) — ver A-002
- ALB1-B e Next-ALB: catch-all 301→:443 (134B) para QUALQUER Host (verificado por curl
  manual sobre Tor 16:3x) — **Host-fuzz não diferencia vhosts na camada ALB**; só as
  reverb dos hosts conhecidos aparecem; sem novos vhosts via quantitative fuzz.
- Go/traefik também catch-all + outliers conhecidos; outliers `teste`/`docs`/`cdn`/`www`
  confirmados por DNS-over-Tor (DoH) como vhosts REAIS (GitBook/Laravel/GoCache paths).
- GoCache: 403/404 bucket-path; nada novo.
- EC2 34.230 + teste host: anti-Tor SYN-drop (burst).
- **NOVOS VHOSTS (DoH/SNI):** `docs.grupofocus.com.br` (GitBook API docs), `teste.grupofocus.com.br`
  (Laravel QA — nginx/1.18.0), `loja.grupofocus.com.br` (Next.js cluster).

## 7. Painéis admin / login (fingerprint inicial)
| URL base | Rota | Observação |
|---|---|---|
| https://admin.focusconcursos.com.br | /login | Laravel + Materialize; sem WAF; candidata cred default laravel-acl |
| https://lms.focusconcursos.com.br | /login | Laravel; idem |
| https://pxa.focusconcursos.com.br | /login | Laravel Livewire (Plyr 3.7.8, Alpine.js); **SSH 22 exposto no host** |
| https://mobile.focusconcursos.com.br | /docs | JSON `{"message":""}` — rota API stub |
| https://payment / integration | / | `{"message":""}` 15B — stubs Laravel |
| https://crm.focusconcursos.com.br | / | 503 ELB (target-down) — mesma ALB herdando rota crm |
| https://sac / pagina / lps / lp / metodo / aprovacao | / | torre ludicrous/HighLevel (CF) |
| https://webmail/autodiscover | O365 | Microsoft-HTTPAPI/2.0 |
| https://teste.grupofocus.com.br | / (e /apix) | **Laravel (nginx/1.18.0 / 107.20.109.109)** — QA env; XSRF-TOKEN; 302 → faculdadefocus.com.br |
| https://docs.grupofocus.com.br | /api.grupofocus.com.br/ | **GitBook API DOCS (site oficial)** — CF-fronted; 307-redirect inicial |
| https://loja.grupofocus.com.br | / | Next.js app (489361B) no mesmo cluster de apex/focus/media |
| (passive) | `superadmin@domain.com`/`password` | default do laravel-acl usado/forkeado (OSINT P-007) — testar em admin/lms/pxa SEM cred-stuffing |

## 8. Findings preliminares (evidence A-XXX)
- **A-001** Portscans redo: portas limpas p/ enum-web; pxa SSH revelado; anti-scan AWS.
- **A-002** Vhost: 3 novos vhosts (docs/teste/loja) + domínio NOVO faculdadefocus.com.br +
  novo IP 107.20.109.109; catch-all ALBs; anti-Tor SYN-drop nos EC2s.
- **A-003** WAF: core sem WAF → webapp pode atacar direto após enum; sem challenges.
- **A-005** docs/config API probe2: 0 SPEC nas 43 hosts; mobile stub; payment 500 exceção
  Laravel; Next.js SPA catch-all; webmail 401 O365; crm 503 target down.
- EC2 anti-scan/anti-Tor behavior — documentado (A-001/A-002).

## 9. LIMITAÇÕES
1. **EC2 34.230.151.3 e 107.20.109.109 (teste.grupofocus) SYN-blackhole** — superfície TCP
   desconhecida nos bursts; HTTP/TLS por hostname funcionam; re-verificar depois de cooldown.
2. top300-only (não full 65535) — listeners raros podem passar batidos. Tor throughput
   limita; com conns ganhos ~4/s.
3. Tor exit rotação → respostas variáveis em filtros; privoxy gateway page (6877B) contamina
   runs de volume — mitiga com verificação manual em suspeitas (feito).
4. wafw00f product attribution impreciso em CDN híbridos (GoCache/ELB confusion).
5. Træfik router TLS-side certificado genérico: interno `apilms` — a topologia real segue
   por enumeração SNI (enum-web), não active-phase.
6. 2Captcha não usada (sem challenges); reativar se CF turnstile aparecer em enum-web.
7. Vhost sweep wordlist 223 (não 1000s) — deep-path enumeration em enum-web cobrirá o resto.

## 10. Hipóteses / next-step p/ enum-web (ordered by payoff)
1. **docs.grupofocus.com.br (GitBook API DOCS)** — documentação oficial da API da empresa:
   mapear rotas,AMPLE par âmetros, regras de HMAC/AUTH, staging URLs, exemplos de keys.
   → payoff CHECK-POINT: rotas documentadas + serviços internos → enum/API inventory completam.
2. **teste.grupofocus.com.br (Laravel QA, nginx/1.18.0, 107.20.109.109)** — ambiente de TESTE
   não coberto por passivo: full fingerprint + rota discovery + se Livewire/sanctum começa;
   + REDIRECT para **faculdadefocus.com.br** (novo domínio — rodar mini re-passivo).
3. **wwwdev.focusconcursos.com.br** (EC2 origin) — enumerar com SNI/Host a nível HTTP
   (dev environment! pode vaze configs/staging routes).
4. **admin/lms /login** — cred default `superadmin@domain.com/password` (laravel-acl seed
   confirmado no OSINT) → NÃO brute; single-shot POST via Tor.
5. **mobile /docs** — stub diz que rota existe; enumerable `?swagger`/`?api` params,
   headers accept; se nada, focar `/api/*` discovery.
6. **pxa /login (Livewire)** — vulnerabilidades de Livewire (component call bypass/upload),
   plus Plyr 3.7.8 hooks; SSH 22 no host para network-phase (threshold limit).
7. **loja.grupofocus.com.br (Next.js)** — app "LOJA" (e-commerce) — pode ter carrinho API/pagamento tímida.
8. **Next.js cluster (www3/apex/media/static/prod/s3/ead.grupofocus)** —
   Next.js middleware bypass CVE-2025-29927; `_next/image` (sitemap leak: internal buckets admin/4/*).
9. **apilms (traefik default-cert host)** — rotas API unauthorized? `403 vs 404` com rotas.
10. **GoCache edge misconfig** — bucket origin arquivos.grupofocus / s3.grupofocus
   (x-amz-bucket-region leak); cloud sub-phase já cobre bucket listing.
11. **crm 503 path** — host existe; route list down; probe alternate paths (dashboard/admin etc)
   quando ALB target sobe (retry).
12. **payment/integration stubs** — param mining em {"message":""} (error-code tracking field).
13. **focusonline.com.br** — segundo ALB tower: full app map (301s → mesmos 6 IPs).

## Timeline hook-up
Timeline final append (APEND, nunca sobrescrever) acontece no fim da fase; evidências A-001..A-005
arquivadas em EngDir/evidence/.

Artifacts relevantes em recon/active/: portmap_*.txt, top300.txt, scan_*.log, junk/(archives),
whatweb_all.txt, httpx_all.txt, docs_refined.txt, docs_probe2.sh, banner_results.txt,
waf_wafw00f.csv, waf_wafw00f_summary.txt, waf_headers.txt, vhosts3_*.json (10), analyze_vhosts3.py,
tls_summary.txt, tls_full_san.txt, vhost_wordlist2.txt, subdomains_all_copy.txt, notes...
