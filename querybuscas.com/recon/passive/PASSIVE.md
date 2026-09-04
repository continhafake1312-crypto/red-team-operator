# PASSIVE.md — Recon Passivo + OSINT — querybuscas.com

> Fase 2 do engagement. Apenas fontes passivas + fingerprint de hosts vivos
> (headers/titles/TLS — não há exploração). Todo tráfego via Tor (socks5://127.0.0.1:9050)
> ou fontes passivas (crt.sh, Wayback, gau). IP de saída Tor: 171.25.193.37.

---

## 1. Sumário executivo

| Métrica | Valor |
|--------|-------|
| Subdomínios únicos enumerados | **5** |
| Subdomínios vivos (com registro A) | **4** |
| Subdomínios HTTP acessíveis (não 5xx/404) | **3** (apex, api, bot2) |
| IPs de origem real descobertos | **0** (todos atrás de Cloudflare) |
| Cloud buckets expostos | 0 (S3/DO ausentes; Azure/GCP inconclusivos) |
| Takeover candidates | 0 (sem CNAMEs dangling) |
| Tech stack dominante | Node.js/Express + Cloudflare (CDN/WAF/Turnstile) |
| Alvo de alto valor | **Plataforma de consultas PII** (CPF/CNPJ/CNH/RG/telefone/endereço/parentes/score/veículo/BIN/PIX) |

**Alvo é uma "plataforma de consultas" brasileira (data-broker/PII)** que vende
lookups de dados sensíveis de terceiros (CPF, RG, CNH, telefone, endereço,
parentes, score de crédito, placa/RENAVAM, BIN de cartão, PIX). Pagemento via
PIX, ativação na hora, 40+ módulos. **Corresponde diretamente aos objetivos de
alto valor do SCOPE** (vazamento de PII, acesso a bases/APIs).

---

## 2. DNS completo

Arquivo: `dns_full.txt`

| Registro | Valor |
|----------|-------|
| A (apex) | `104.21.91.102`, `172.67.215.155` (Cloudflare) |
| AAAA (apex) | `2606:4700:3032::6815:5b66`, `2606:4700:3037::ac43:d79b` |
| NS | `logan.ns.cloudflare.com`, `michelle.ns.cloudflare.com` |
| SOA | `logan.ns.cloudflare.com dns.cloudflare.com` |
| MX | **nenhum** (domínio sem serviço de e-mail) |
| TXT | **nenhum** |
| SPF | **nenhum** (ausente → spoofing de e-mail possível, mas sem MX o impacto é limitado) |
| DMARC | **nenhum** (`_dmarc.querybuscas.com` sem TXT) |
| CAA | nenhum |
| DNSSEC | unsigned |
| AXFR | REFUSED (Cloudflare bloqueia zone transfer) |
| Wildcard | **NÃO** — labels aleatórios retornam NXDOMAIN → subdomínios resolvidos são reais |

**WHOIS** (`whois_querybuscas.com.txt`):
- Registrador: NICENIC INTERNATIONAL GROUP CO., LIMITED (Hong Kong)
- Criado: 2026-05-06 (domínio jovem, ~4 meses)
- Expira: 2027-05-06
- Registrant Country: **Peru (PE)**, State: Peru (possível divergência: serviço pt-BR com registrante no Peru)
- Registrant: REDACTED FOR PRIVACY (WHOIS privacy via NICENIC)
- Registrar abuse: abuse@nicenic.net / +852.68581004

---

## 3. Subdomínios (enumeração exaustiva)

Arquivos: `subdomains_all.txt`, `subdomains_live.txt`

### Fontes consultadas
| Fonte | Resultado |
|-------|-----------|
| subfinder (-all -recursive) | apex apenas |
| amass (passive) | timeout (apex/NS apenas) |
| assetfinder | apex apenas |
| crt.sh | wildcard `*.querybuscas.com` (cert wildcard — não revela subs individuais) |
| hackertarget | apex |
| anubis (jldc.me) | bloqueado por Cloudflare (Tor) |
| rapiddns | 404 (API mudou) |
| alienvault OTX | exige autenticação |
| urlscan | 0 resultados |
| threatcrowd | fora do ar |
| dnsdumpster | csrf não extraído (Tor) |
| gau / Wayback CDX | URLs do apex/www |
| **dnsx brute (bitquark 100k)** | **api, bot** |
| **dnsx brute (PT-BR 132 palavras)** | **bot2** ← achado chave |
| dnsx brute (variantes 130) | bot2 (reconfirmado) |
| dnsx brute (combined 653k) | em execução (background) |
| TLS SAN (cert) | wildcard `*.querybuscas.com` (Sectigo/Google/Let's Encrypt) |

### Lista consolidada (5)

| # | Subdomínio | A record | Status HTTP | Observação |
|---|-----------|----------|-------------|-----------|
| 1 | `querybuscas.com` | 104.21.91.102, 172.67.215.155 | 200 | Apex — marketing SPA (Express) |
| 2 | `api.querybuscas.com` | 104.21.91.102, 172.67.215.155 | 200 | "QueryBuscas API — Login" (app separado, HSTS preload) |
| 3 | `bot.querybuscas.com` | 104.21.91.102, 172.67.215.155 | **502** | Origin down/misconfig (Cloudflare BYPASS) |
| 4 | `bot2.querybuscas.com` | 104.21.91.102, 172.67.215.155 | **401** | API/bot autenticado (origin 401) |
| 5 | `www.querybuscas.com` | (nenhum) | 404→SPA | Sem registro DNS (não configurado) |

**Todos os hosts vivos estão por trás dos mesmos 2 IPs Cloudflare
(104.21.91.102 / 172.67.215.155).** O IP de origem real (origin) **não foi
descoberto** por fontes passivas (ver §7 Limitações).

---

## 4. Tech stack por host

Arquivo: `tech_stack.txt`

### querybuscas.com (apex) — marketing SPA
- `server: cloudflare`, `x-powered-by: Express` → **Node.js + Express.js**
- CDN/WAF: **Cloudflare** (cf-ray, cf-cache, cdn-cgi challenge platform)
- Proteção de bot: **Cloudflare Turnstile** (challenges.cloudflare.com) + JS challenge
- Analytics: Facebook Pixel, Google Analytics, Cloudflare Insights, GTM
- Headers de segurança: CSP forte, permissions-policy, referrer-policy,
  x-content-type-options:nosniff, x-frame-options:DENY
- **GAP: sem HSTS no apex** (inconsistente — api host tem HSTS+preload)
- TLS: cert wildcard `*.querybuscas.com`
- Favicon: `/assets/icons/querybot.ico` → **mmh3 hash `-491867804`** (dork Shodan: `http.favicon.hash:-491867804`)

### api.querybuscas.com — API (app separado)
- `server: cloudflare`, sem `x-powered-by` (framework oculto — Node.js provável)
- Título: **"QueryBuscas API — Login"**
- **HSTS: max-age=31536000; includeSubDomains; preload** (forte)
- Assets próprios: `/assets/js/login.js?v=2`, `/assets/js/common.js?v=2`

### bot.querybuscas.com — DOWN
- HTTP 502, body "error code: 502" (16 bytes), Cloudflare BYPASS
- Origin backend inacessível/fora do ar — **candidato para recon-active**

### bot2.querybuscas.com — API/bot autenticado
- HTTP 401, content-length 0, Cloudflare BYPASS
- Origin retorna 401 sem auth → **endpoint de API/bot interno autenticado**
  (provável webhook da API do Telegram / interface bot). Candidato a auth-bypass/IDOR.

### www.querybuscas.com
- Sem registro DNS — não configurado (prober cai no SPA do apex).

### Serviços externos referenciados (CSP)
cdnjs.cloudflare.com, cdn.jsdelivr.net, connect.facebook.net (FB Pixel),
challenges.cloudflare.com (Turnstile), googletagmanager.com,
static.cloudflareinsights.com, fonts.googleapis.com, fonts.gstatic.com,
**api.qrserver.com** (QR codes), google-analytics.com, analytics.google.com,
region1.google-analytics.com, facebook.com.

---

## 5. Endpoints / rotas / JS (Wayback + HTML estático)

Arquivos: `endpoints_catalog.txt`, `wayback_highlights.txt`, `apex_index.html`,
`apex_pages_comprar.html`, `apex_pages_checkout.html`, `apex_pages_termos.html`,
`api_login.html`, `wayback_content/app.min.js`, `wayback_content/assets_js_pixel.js`

### API (provável backend Express em api.querybuscas.com ou proxy do apex)
- `POST /api/auth/login` (apex + api)
- `/api/auth/logout`
- `POST /api/auth/pre-register` (fluxo de checkout)
- `/api/auth/verify`
- `/api/auth/complete-reset` (reset de senha)
- `/api/user/modulos` (retorna módulos acessíveis pelo usuário — **enum de permissões**)
- `/api/gerar-pix` (gera QR/PIX para pagamento)
- `/api/pagamento/verificar` (verifica status de pagamento)
- `/api/telegram/data/<token>` ← token observado `61e7e973214471da2fe33fb992745fef` (32 hex = MD5)

### Páginas (SPA Express no apex)
- `/` (landing: "QueryBuscas - Consultas Rápidas e Completas")
- `/pages/comprar` (planos)
- `/pages/checkout` ("Acesso completo a 40+ módulos · Ativação na hora")
- `/pages/termos` (termos de uso)
- `/pages/admin` → **HTTP 302 (auth-protected)** ← painel admin
- `/pages/dashboard` → HTTP 302 (auth-protected)
- `/pages/pagamento`
- `/pages/consultas/` e `/pages/consultas/Cpf` (consulta de CPF)

### Catálogo de módulos (PII — extraído de app.min.js via Wayback) — ALTO VALOR
BIN (cartão) · CPF · CNPJ · CNH · RG · EMAIL/EMAILS · EMPRESAS · ENDERECOS ·
PARENTES (parentes) · NOME / NOME_FANTASIA / NOME_MAE / NOME_PAI · PLACA /
Placa Nacional · RENAVAM · PROFISSAO · SCORE · Socios · TELEFONE/TELEFONES ·
INSS · "CPF para consultar o PIX". **40+ módulos ativos.**

### Notas Wayback
- Domínio jovem (criado 2026-05) → histórico de archive limitado (snapshot 2026-07-28).
- `app.min.js` e `pixel.js` arquivados; `analytics.js`, `attribution.js`,
  `login.js`, `common.js` **não** arquivados (pegar em enum/ativo).

---

## 6. OSINT

Arquivos: `osint_emails.txt`, `osint_people.txt`, `osint_breaches.txt`,
`osint_github.txt`, `osint_telegram.txt`, `osint_telegram/`

### Empresa / entidade
- Marca: **"QueryBuscas"** (footer: "QueryBuscas © 2024–2026", tagline "Qualidade e Inovação")
- Idioma: pt-BR. Sem CNPJ / razão social / endereço físico divulgados (Terms/footer).
- Registrante WHOIS: Peru, privacy-protected. Registrador: NICENIC (HK).
- Nenhum indivíduo nomeado descoberto.

### Canais de contato (Telegram apenas — sem e-mail)
| Handle | Tipo | Notas |
|--------|------|-------|
| `@querybuscasofc` | canal oficial | "QueryBuscas - Avisos e Atualizações"; bio: "✅ 40 Módulos Ativos | Pagamento Automático | SITE: querybuscas.com | BOT: @QueryBuscas3Bot" |
| `@suportequerybuscas` | suporte | bio: "🌐 SITE: querybuscas.com - 🤖 BOT @QueryBuscas3Bot" |
| `@QueryBuscas3Bot` | bot principal | (bot atual, citado na bio do canal/suporte) |
| `@QueryBuscasBot` | bot alt/antigo | página de contato existe |
| `@QueryBuscas2Bot` | bot alt/antigo | página de contato existe |

### E-mails / pessoas / breaches / GitHub
- **E-mails:** nenhum encontrado (apex, Terms, footer, DuckDuckGo, Bing, crt.sh).
  Contato é Telegram-only. Registrar abuse: abuse@nicenic.net.
- **Breaches:** HaveIBeenPwned/DeHashed/IntelX não consultados (sem API key;
  Tor restrito). Nenhuma credencial vazada via fontes passivas.
- **GitHub:** Code Search API exige autenticação (401); repo search = 0.
  Nenhum org/user "querybuscas". Dorks pendentes para quando houver token.

---

## 7. Cloud & takeover

Arquivo: `cloud_findings.txt`

### Buckets
- **S3:** 36 variações de nome testadas → todas **404 (NoSuchBucket)**. Nenhum bucket.
- **DigitalOcean Spaces:** 404 → não existem.
- **Azure Blob:** `000` (falha de conexão via Tor) → **inconclusivo**.
- **GCP Storage:** `403` com body "AccessDenied: this service is not available
  in your location" → **geo-block do IP Tor, NÃO é ACL de bucket** → inconclusivo.
  Re-verificar fora do Tor no recon-active se necessário.

### Subdomain takeover
- CNAME queries para www, api, bot, dev, app, admin, panel, staging, old, new → **todos vazios**.
- `www` não tem A/CNAME (nada a tomar).
- `bot`/`bot2` são Cloudflare-proxied com A records (origin down/401, não CNAME dangling).
- **Nenhum candidato a takeover** (todos os hosts são A-records Cloudflare, sem CNAMEs dangling).

---

## 8. IPs de origem real — status

**NÃO descoberto por fontes passivas.** Todos os hosts (apex, api, bot, bot2)
resolvem para os mesmos 2 IPs Cloudflare (104.21.91.102 / 172.67.215.155).
Técnicas passivas tentadas e por que falharam:
- **crt.sh / CT logs:** cert é wildcard `*.querybuscas.com` → não revela origin nem subs.
- **viewdns IP history:** retornou ruído (IPs de documentação APNIC) — sem histórico útil.
- **SecurityTrails:** exige credenciais.
- **Shodan/Censys cert search:** sem API key.
- **MX/TXT/SPF:** inexistentes (sem ponta de e-mail que revele origin).

→ **Recomendado para recon-active (Fase 3):** Censys/Shodan search por cert
`*.querybuscas.com` / favicon hash `-491867804`; técnicas de leak de origin
(error-based via /api/telegram, SSRF, headers de debug, DNS history pago);
tentativa de bypass Cloudflare (origin guess, direct-IP host header).

---

## 9. Findings preliminares (para próximas fases)

| # | Finding | Host | Severidade | Próximo passo |
|---|---------|------|-----------|---------------|
| F-P1 | **Plataforma de consultas PII** (40+ módulos: CPF/RG/CNH/telefone/endereço/parentes/score/BIN/PIX) | querybuscas.com | Crítica (alvo de alto valor) | enum → webapp (IDOR/BOLA em /api/user/modulos, /pages/consultas/*) |
| F-P2 | `/pages/admin` existe (HTTP 302 auth) | querybuscas.com | Alta | webapp: auth bypass / default creds no painel admin |
| F-P3 | `api.querybuscas.com` — app de API separado com login | api.querybuscas.com | Alta | enum JS (login.js/common.js); webapp auth bypass, JWT, mass-assignment |
| F-P4 | `bot2.querybuscas.com` — 401 (API/bot autenticado) | bot2.querybuscas.com | Alta | enum: descobrir esquema de auth, IDOR, token brute |
| F-P5 | `bot.querybuscas.com` — 502 (origin down) | bot.querybuscas.com | Média | recon-active: confirmar se origin está realmente down ou é misconfig |
| F-P6 | `/api/telegram/data/<md5>` expõe dados de export Telegram | apex/api | Alta | webapp: IDOR no token, enumeration, vazamento de dados |
| F-P7 | Endpoint de pagamento PIX (`/api/gerar-pix`, `/api/pagamento/verificar`) | apex | Média | webapp: manipulação de pagamento, bypass de ativação |
| F-P8 | Ausência de HSTS no apex (inconsistente com api) | querybuscas.com | Baixa | report misconfig |
| F-P9 | Sem SPF/DMARC/MX | querybuscas.com | Baixa | (sem MX → impacto limitado) |
| F-P10 | `querybuscas.com.ico` favicon hash `-491867804` | — | Info | Shodan correlation quando houver API key |
| F-P11 | Múltiplos bots Telegram (@QueryBuscas3Bot etc.) + canal oficial | — | Info | OSINT de bot / possível webhook enumeration |

---

## 10. Limitações

1. **IP de origem real não descoberto** (tudo Cloudflare-proxied; técnicas passivas esgotadas sem API keys).
2. **Sem API keys** para Shodan, Censys, SecurityTrails, Chaos, GitHub, VirusTotal,
   IntelX, HIBP, DeHashed → subdomain enum e breach/OSINT limitados a fontes gratuitas.
3. **Cloud buckets Azure/GCP inconclusivos** (Tor geo-block). S3/DO confirmados ausentes.
4. **theHarvester não executou** (requer Python ≥3.14; ambiente tem 3.12). OSINT feito
   via DuckDuckGo/Bing/Tor + scraping de páginas Telegram públicas.
5. **Várias fontes de subdomínio indisponíveis** anubis (CF block), rapiddns (404),
   alienvault (auth), threatcrowd (down), dnsdumpster (csrf via Tor).
6. **JS não arquivado** (analytics.js, attribution.js, login.js, common.js) não analisado
   nesta fase (passiva) — deixar para enum (ativo).
7. **Amass passive** deu timeout (fontes gratuitas lentas).
8. **Brute force DNS combinado 653k** ainda em execução em background ao final desta fase
   (sem wildcard, resultado esperado = mesmos subs já encontrados).

---

## 11. Próximos passos recomendados (recon-active — Fase 3)

1. **Descoberta de IP de origem real** (prioridade):
   - Censys/Shodan search por cert `*.querybuscas.com` e favicon hash `-491867804` (precisa API key).
   - Técnicas de leak de origin: error-based (forçar erro em /api/telegram/data com token inválido),
     debug headers, SSRF candidates, DNS history pago.
   - Probing direto de IPs candidatos com `Host: querybuscas.com` (rate-limited).
2. **Portscan nos IPs Cloudflare** (limitado — CF só expõe 80/443/8080/8443) e em
   qualquer IP de origem real descoberto: `nmap -sV -sC -p-`.
3. **vhosts** no IP de origem real (`ffuf -H "Host: FUZZ.querybuscas.com"`).
4. **WAF/TLS fingerprint:** `wafw00f`, `nmap ssl-cert,ssl-enum-ciphers` em todos os hosts.
5. **Re-verificar Azure/GCP buckets** fora do Tor (confirmar inconclusivos).
6. **Confirmar bot.querybuscas.com** (502) — re-testar ao longo do tempo / diferentes exits Tor.
7. **Confirmar www** — pode haver CNAME futuro (takeover watch).

---

## 12. Artefatos brutos (recon/passive/)

DNS: `dns_full.txt`, `dns_a.txt`, `dns_aaaa.txt`, `dns_ns.txt`, `dns_soa.txt`,
`dns_mx.txt`, `dns_txt.txt`, `dns_spf.txt`, `dns_dmarc.txt`, `dns_caa.txt`,
`dns_any.txt`, `dns_axfr.txt`, `whois_querybuscas.com.txt`, `tls_sans.txt`
Subs: `subdomains_all.txt`, `subdomains_live.txt`, `subfinder_all.txt`,
`assetfinder_all.txt`, `amass_all.txt`, `crtsh_subs.txt`, `hackertarget.txt`,
`dnsx_brute_100k.out`, `dnsx_brute_combined.out`, `dnsx_ptbr.out`,
`dnsx_variants.out`, `dnsx_perm.out`
HTTP/tech: `httpx_manual.txt`, `apex_index.html`, `apex_pages_comprar.html`,
`apex_pages_checkout.html`, `apex_pages_termos.html`, `apex_pages_admin.html`,
`apex_pages_dashboard.html`, `api_login.html`, `tech_stack.txt`,
`favicon_querybot.ico`
Wayback: `wayback_urls.txt`, `wayback_urls_all.txt`, `wayback_highlights.txt`,
`gau_all.txt`, `wayback_content/` (app.min.js, pixel.js)
OSINT: `osint_emails.txt`, `osint_people.txt`, `osint_breaches.txt`,
`osint_github.txt`, `osint_telegram.txt`, `osint_telegram/` (5 pages)
Cloud: `cloud_buckets.txt`, `cloud_takeover.txt`, `cloud_findings.txt`
Endpoints: `endpoints_catalog.txt`

---

*Fase 2 concluída por recon-passive em 2026-09-04. Tráfego via Tor (exit 171.25.193.37).
Nenhuma ação destrutiva; apenas fingerprint passivo de hosts vivos.*
