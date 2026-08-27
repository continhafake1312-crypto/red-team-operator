# PASSIVE — Recon Passivo degraucultural.com.br

**Fase:** 2 (recon passivo)
**Data:** 2026-08-27 (início 03:25Z, fim ~04:00Z UTC)
**Alvo:** degraucultural.com.br (https://degraucultural.com.br/)
**OPSEC:** Todas as enumerações a fontes externas via Tor + proxychains4 (socks5 127.0.0.1:9050). IP de saída observado: 45.66.35.28 (Tor). Nenhum request direto ao alvo com IP real do operador. Probe de vivos (httpx/dnsx) feito via Tor.

---

## 1. Sumário executivo

| Métrica | Valor |
|---|---|
| Subdomínios únicos enumerados | **43** |
| Subdomínios resolvidos (DNS) | **40** |
| Hosts vivos (HTTP/S respondendo) | **40/40** |
| Hosts atrás de Cloudflare | ~22 |
| Hosts em origem real (sem Cloudflare) | **~18** |
| IPs de origem real únicos | 17 (fora faixa CF) |
| Emails coletados | 5 |
| Pessoas (WHOIS) | 3 |
| Takeover candidates (CNAME) | 24 CNAMEs (1 Unbounce, 11 Vercel) |
| Wayback URLs (gau+waybackurls) | 10.431 |
| JS wayback | 826 |
| API pública vazada (openapi) | 7 endpoints |

**Plataforma interna identificada:** **Seducar** (seducar.com.br) — plataforma white-label de educação/concursos que opera degraucultural.com.br. Plataforma confirmada via `.well-known/ai-plugin.json` (contact_email: contato@seducar.com.br) e títulos "Seducar - CRM"/"Seducar" em crm/crm-hml/dashboard/homolog.

**Stack dominante:** Nuxt.js (Vue.js) + Vercel + Cloudflare CDN/WAF. App de pagamento em React/Vercel. CRM "Seducar" em Vercel. API backend em Render (atrás de Cloudflare). Site antigo em Joomla/jQuery 1.11.1.

---

## 2. DNS / WHOIS

### WHOIS (registro.br)
- **Domain:** degraucultural.com.br
- **Owner:** Editora Degrau Cultural Ltda.
- **Created:** 1999-03-15 | **Expires:** 2036-03-15 | **Changed:** 2026-03-30
- **Owner-c:** FRM208 — Fernando Ribeiro Martins
- **Tech-c:** GMSPI8 — Gabriel Moraes Sodré Pinto
- **Status:** published

### DNS
- **NS:** derek.ns.cloudflare.com, hope.ns.cloudflare.com (Cloudflare)
- **A (apex/www):** 104.26.4.50, 104.26.5.50, 172.67.68.226 (todos Cloudflare)
- **AAAA:** 2606:4700:20::* (Cloudflare)
- **MX:** Google Workspace (aspmx.l.google.com) + ExactTarget/Salesforce (reply.s12.exacttarget.com)
- **SPF:** `v=spf1 mx include:degspf.degraucultural.com.br include:_spf.google.com include:_spf.octadesk.com include:_spf.rdstation.com.br include:sendgrid.net include:_spf.i-maxpr.com include:spf.mandrillapp.com include:spf_12392.aknamail.com.br include:servers.mcsv.net include:cust-spf.exacttarget.com include:spf.plugcrm.net include:mailgun.org ip4:200.143.5.96/27 ip4:200.143.7.0/24 ip4:187.61.7.32/27 -all`
  - Serviços de email/marketing: Google, Octadesk, RD Station, Sendgrid, i-maxpr, Mandrill/Mailchimp, Akamail, ExactTarget, PlugCRM, Mailgun
- **DMARC:** `v=DMARC1; p=none; sp=none` — **política permissiva** (não enforcing) — ruas para dmarc@degraucultural.com.br, suporte@degraucultural.com.br
- **DKIM (default._domainkey):** não publicado
- **DNSSEC:** não habilitado
- **AXFR:** negado em ambos NS Cloudflare (esperado)
- **TXT adicionais:** google-site-verification, MS=, brevo-code, facebook-domain-verification

### IP ownership (WHOIS dos IPs reais)
| Bloco | Org | Observação |
|---|---|---|
| 216.150.1.0/24, 216.150.16.0/24 | **Vercel** (VERCEL-08/09) | Origem real da maioria dos apps |
| 66.33.60.0/24 | Vercel (VERCEL-02) | homolog, pagamento |
| 76.76.21.0/24 | Vercel (VERCEL-01) | pagamento, demo.pagamento |
| 34.64.0.0/10 | Google LLC (GCP) | concurso, mkt, gtm |
| 3.128.0.0/9 | AWS (AT-88-Z) | deglink, degspf, degimage, landingpage |
| 216.24.57.0/24 | Render (RS-1125) | live |
| 13.110.x | Salesforce (ExactTarget) | email.* |
| 23.73/23.44 | Akamai | image.email |
| 104.17.94/104.18.34/172.64.x | Cloudflare | load.gtm, landings |

---

## 3. Subdomínios — 43 únicos (40 resolvidos)

Fontes: hackertarget (36 c/ IP), assetfinder (5), rapiddns (11), waybackurls, gau, dnsx brute-force (achou **admin.degraucultural.com.br**), certspotter (ruído de SANs compartilhados). crt.sh indisponível (502 Bad Gateway) durante todo o engagement; subfinder retornou 0 (sem API keys configuradas).

### IPs de ORIGEM REAL (fora Cloudflare) — prioridade para recon ativo
| Host | IP(s) | Provider | Tech |
|---|---|---|---|
| crm.degraucultural.com.br | 216.150.1.193 | Vercel | Seducar CRM (200) |
| crm-hml.degraucultural.com.br | 216.150.16.65 | Vercel | Seducar CRM (200) |
| dashboard.degraucultural.com.br | 216.150.16.193 | Vercel | Seducar (200) |
| homolog.degraucultural.com.br | 66.33.60.129 | Vercel | Seducar (200) — ambiente homolog exposto |
| staging.degraucultural.com.br | 216.150.1.1 | Vercel | clone do site (200) — exposto |
| questoes.degraucultural.com.br | 216.150.16.1 | Vercel | Nuxt.js (200) |
| homolog.questoes.degraucultural.com.br | 216.150.16.65 | Vercel | Nuxt.js (200) |
| pagamento.degraucultural.com.br | 76.76.21.164 | Vercel | Nuxt.js/Node (200) — app de pagamento |
| demo.pagamento.degraucultural.com.br | 76.76.21.93 | Vercel | React (200) — redireciona p/ Vercel SSO login |
| concursos.degraucultural.com.br | 216.150.1.1 | Vercel | Nuxt.js (200) |
| demo.concursos.degraucultural.com.br | 216.150.1.65 | Vercel | (302/Server error) |
| concurso.degraucultural.com.br | 34.68.161.129 | GCP | (404) RD Station CNAME |
| mkt.degraucultural.com.br | 34.68.161.129 | GCP | (404) RD Station CNAME |
| gtm.degraucultural.com.br | 34.151.202.32 | GCP | (400) server-side GTM |
| deglink.degraucultural.com.br | 3.132.6.138 | AWS | (404) redirect service |
| degspf.degraucultural.com.br | 3.132.6.138 | AWS | (404) |
| degimage.degraucultural.com.br | 3.133.227.151 | AWS | Nuxt.js (200) imagem/CDN |
| landingpage.degraucultural.com.br | 3.133.227.151 | AWS | Nuxt.js (200) |
| live.degraucultural.com.br | 216.24.57.7/15 | Render | (403) Caddy onrender |

### Hosts atrás de Cloudflare (origem real oculta)
| Host | Status CF | Notas |
|---|---|---|
| degraucultural.com.br | 200 | Site principal Nuxt.js |
| www.degraucultural.com.br | 301→200 | Nuxt.js |
| admin.degraucultural.com.br | **522** | **Painel admin existe mas origem inalcançável** — confirmar origem real |
| api.degraucultural.com.br / api-hml | 401 | Backend (tech "Render") — API protegida |
| antigo.degraucultural.com.br | 200 | Joomla/jQuery 1.11.1 antigo (title "AODF") |
| aulaobb, bolsao, fiscal, informativos, palestra, unidadevirtual, virtual, mta | 525/522 | origin down via CF |
| landings.degraucultural.com.br | 403 (err 1014) | CNAME Unbounce restrito via CF |
| load.gtm.degraucultural.com.br | 400 | Stape.io (server GTM) — Cloudflare Bot Management |
| demo.degraucultural.com.br | Server error | origin error |
| click/cloud/image/view.email.* | 403/404 | Salesforce/Akamai (email infra) |

### IPs de origem real únicos (lista completa)
```
216.150.1.1   216.150.1.65   216.150.1.129  216.150.1.193  (Vercel)
216.150.16.1  216.150.16.65  216.150.16.129 216.150.16.193 (Vercel)
66.33.60.34   66.33.60.129  (Vercel)
76.76.21.93   76.76.21.164  76.76.21.241   (Vercel)
34.68.161.129 34.151.202.32 (GCP)
3.132.6.138   3.133.227.151 (AWS)
216.24.57.7   216.24.57.15  (Render)
```

---

## 4. Tech stack por host (httpx -tech-detect)

| Host | Status | Tech |
|---|---|---|
| degraucultural.com.br / www / virtual / landingpage / degimage | 200/301 | Cloudflare, HSTS, HTTP/3, **Node.js, Nuxt.js, Vercel, Vue.js** |
| concursos / staging | 200/302 | HSTS, Node.js, Nuxt.js, Vercel, Vue.js (staging sem CF, exposto direto) |
| crm / crm-hml | 200 | HSTS, Vercel — "Seducar - CRM" |
| dashboard | 200 | HSTS, Vercel — "Seducar" |
| homolog | 200 | HSTS, Vercel — "Seducar" (homolog) |
| questoes / homolog.questoes | 200 | HSTS, Node.js, Nuxt.js, Vercel, Vue.js |
| pagamento | 200 | HSTS, Node.js, Nuxt.js, Vercel, Vue.js |
| demo.pagamento | 200 | C3.js, HSTS, **React**, Vercel — "Login – Vercel" (SSO) |
| api / api-hml | 401 | Cloudflare, HTTP/3, **Render** |
| antigo | 200 | Bootstrap, Cloudflare, FancyBox, Google Maps, Mixitup, OWL Carousel, WOW, bxSlider, **jQuery UI 1.11.4, jQuery 1.11.1**, parallax.js (Joomla antigo) |
| load.gtm | 400 | Cloudflare Bot Management, HSTS, HTTP/3 |
| image.email | 403 | AkamaiGHost |
| view.email | 302 | HSTS, Microsoft Visual Studio (Salesforce) |

**Favicon mmh3 hash:** 1174505144 (para correlação Shodan quando houver API key)

---

## 5. OSINT

### Empresa
- Editora Degrau Cultural Ltda. (CNPJ não obtido via WHOIS registro.br — buscar Receita/consulta CNPJ no recon ativo se necessário)
- Plataforma operadora: **Seducar** (seducar.com.br)
- Setor: educação/cursos/preparatório para concursos públicos (BR)

### Pessoas
- Fernando Ribeiro Martins (FRM208) — owner-c WHOIS
- Gabriel Moraes Sodré Pinto (GMSPI8) — tech-c WHOIS

### Emails (5)
- contato@seducar.com.br (ai-plugin contact)
- suporte@degraucultural.com.br (DMARC rua)
- dmarc@degraucultural.com.br (DMARC rua)
- rua@dmarc.brevo.com (DMARC rua Brevo)
- unidadevirtual@degraucultural.com.br (theHarvester)

### Breaches
- Não consultado (sem API key HaveIBeenPwned/DeHashed). Recomendado consultar no recon ativo osint com cred-stuffing candidates para os emails acima.

### GitHub
- Busca por `degraucultural`, `"degraucultural.com.br"`, `org:degraucultural` — **sem resultados** (sem repos, sem código, sem organização). Nenhum repositório público associado.

---

## 6. Cloud / Takeover

### Cloud buckets (naming variations)
- S3 (degrau*/degraucultural* em s3.amazonaws.com, s3-us-east-1, s3-sa-east-1): nenhum bucket público encontrado (todos 404/403 não-contáveis).
- Azure Blob: `cultural.blob.core.windows.net` → 400 (request inválido; conta possivelmente existe, mas não confirmado como do alvo).
- GCP: `degraucultural.appspot.com`, `degrau.appspot.com`, `degraucultural-storage.appspot.com`, `degrau-storage.appspot.com` → **403** (apps App Engine existem mas requerem auth; investigar no recon ativo/cloud).

### Takeover candidates (CNAME dangling)
24 CNAMEs resolvidos. Destaques:
- **landings.degraucultural.com.br → unbouncepages.com** (Unbounce) — retorna CF error 1014 (CNAME cross-origin bloqueado). Não é takeover clássico (CF intercepta), mas vale tentar registro de landing em Unbounce se o CNAME não estiver vinculado.
- **Vercel CNAMEs (11):** concursos, crm, crm-hml, dashboard, demo.concursos, demo.pagamento, homolog, homolog.questoes, pagamento, questoes, staging → `*.vercel-dns-016.com` / `cname.vercel-dns.com`. Vercel takeover possível se projeto for desprovisionado (claim de deployment). Hoje todos respondem 200, então ativos.
- **load.gtm → lsam.stape.io** (Stape.io server-side GTM)
- **concurso/mkt → pages.rdstation.com.br** (RD Station landing pages)
- **degimage/deglink/degspf/landingpage → *.dnzdns.com** (shortener/redirect service — possível takeover se dnzdns permitir registro)
- **email.* → exacttarget.com / edgekey.net** (Salesforce/Akamai — não takeover)

Prioridade takeover: **Vercel CNAMEs** (mais provável se algum projeto for removido) e **Unbounce landings**.

---

## 7. Wayback highlights

- **10.431 URLs** (gau: 10.338 + waybackurls: 93), **826 arquivos JS**.
- **robots.txt atual (Nuxt):** expõe estrutura: `Disallow: /area-do-aluno/`, `/auth/`, `/api/`, `/_nuxt/`; `Allow: /api/public/`. Confirma Nuxt.js e áreas sensíveis.
- **`.well-known/ai-plugin.json`** (Seducar plugin) vazou a API pública completa:
  - `/api/public/concursos.json`, `/api/public/cursos.json?variant=online|presencial|live|free`, `/api/public/noticias.json`, `/api/public/apostilas.json`, `/api/public/aprovados.json`, `/api/public/unidades.json`
  - `/search.json`, `/.well-known/openapi.json`, `/llms.txt`, `/llms-full.txt`, `/glossario.json`, `/feed.xml`, `/sitemap.xml`
  - Markdown alternates `/{type}/{slug}.md` e JSON-LD `/{slug}.jsonld`
- **`.well-known/openapi.json`** confirmado: título "Seducar Public Content API", 7 paths públicos.
- **Site antigo (Joomla/ASP):** `/administrator` (Joomla admin), `/admin2/assets/scripts/app-masks.js` (painel admin2 legado), `/LoginCadastro.asp`, `/loginEsqueci.asp`, `/user/password`, `/atendimento/` (chat), `/include/iFdgFcnValidaLogin.js`.
- Sem endpoints `/admin` diretos no novo site Nuxt além de `admin.degraucultural.com.br` (subdomínio).

---

## 8. Findings preliminares (prioridade)

1. **[ALTO] Ambientes homolog/staging expostos diretos (sem Cloudflare):** `homolog.degraucultural.com.br` (66.33.60.129 Vercel, "Seducar"), `staging.degraucultural.com.br` (216.150.1.1 Vercel, clone do site 200), `demo.concursos`, `homolog.questoes` — bypassam WAF Cloudflare. Alto payoff para enumeração/webapp.
2. **[ALTO] CRM "Seducar" exposto direto:** `crm.degraucultural.com.br`, `crm-hml`, `dashboard` em Vercel sem Cloudflare (200). Painel CRM/administrativo — alvo de auth bypass/default creds.
3. **[ALTO] App de pagamento exposto direto:** `pagamento.degraucultural.com.br` (Nuxt.js, 76.76.21.164) e `demo.pagamento` (React, Vercel SSO login). Fluxo financeiro — objetivo de alto valor.
4. **[ALTO] API pública documentada vazada:** `/.well-known/openapi.json` + ai-plugin — 7 endpoints `/api/public/*.json` sem auth (seguindo robots Allow). Mapear para IDOR/param mining em variantes e endpoints não-públicos sob `/api/`.
5. **[MÉDIO] admin.degraucultural.com.br existe (522):** subdomínio admin confirmado mas origem inalcançável via CF. Cairá quando origem real for encontrada — **priorizar descoberta do IP real do admin** no recon ativo.
6. **[MÉDIO] Site antigo (antigo.degraucultural.com.br):** Joomla + jQuery 1.11.1 (vulnerável), `/administrator`, `/admin2/`, `.asp` legacy — potencial de CVEs Joomla/PHP e path traversal.
7. **[MÉDIO] Takeover candidates:** 11 CNAMEs Vercel + Unbounce landings — monitorar/validar no recon ativo.
8. **[MÉDIO] DMARC p=none + DKIM ausente:** spoofing de email facilitado (fora do escopo web, mas informativo).
9. **[BAIXO] GCP appspot apps (403):** degrau/degraucultural.appspot.com existem — investigar IAM/storage no recon ativo/cloud.
10. **[BAIXO] gtm/load.gtm (Stape.io server-side GTM):** possível SSRF/data leakage via GTM server container.

---

## 9. Limitações

- **crt.sh indisponível** (502 Bad Gateway) durante todo o engagement — fonte principal de certs perdida. Recomendado re-tentar posteriormente; pode revelar subdomínios adicionais.
- **subfinder retornou 0** — sem API keys configuradas (sem Chaos/SecurityTrails/Censys/etc). Subdomínios podem existir não descobertos.
- **Shodan/Censys sem API key** — favicon hash (1174505144) preparado para correlação quando key obtida.
- **theHarvester** com fontes limitadas (google/bing-auth/github não suportados sem keys); coleta de emails restrita.
- **Emails/breaches** não aprofundados (sem HIBP/DeHashed) — delegar a fase osint dedicada.
- **Brute force DNS** limitado ao top 100k bitquark; cobriu `admin` mas pode haver subdomínios raros.
- IP real do **admin** e de hosts CF 525/522 não determinado passivamente (origem oculta atrás do Cloudflare). Necessário recon ativo (vhost fuzz, SSL cert SAN, history).

---

## 10. Artefatos brutos (em recon/passive/)

`dns_full.txt`, `whois_full.txt`, `ip_whois.txt`, `host_ip_map.txt`, `subdomains_all.txt` (43), `subdomains_resolved.txt` (40), `subdomains_live.txt` (40), `dnsx_resolved.txt`, `httpx_live.txt`, `httpx_live_clean.txt`, `tech_stack.txt`, `takeover_candidates.txt`, `cloud_buckets.txt`, `osint_emails.txt`, `osint_people.txt`, `osint_github.txt`, `osint_harv5.{json,xml}`, `gau_all.txt` (10338), `wayback_all.txt`, `wayback_sensitive.txt` (650), `wayback_js.txt` (826), `wellknown_ai.json`, `openapi.json`, `robots.txt`, `src_hackertarget.txt`, `src_rapiddns.txt`, `certspotter.json`, `favicon.ico`.

---

## 11. Próximos passos recomendados (recon ativo)

1. **Portscan + vhost fuzz nos IPs de origem real Vercel** (216.150.x, 66.33.60.x, 76.76.21.x) — focar 80/443 e serviços expostos; testar vhosts para descobrir o IP real de `admin.degraucultural.com.br`.
2. **Probe direto aos hosts sem Cloudflare:** crm, crm-hml, dashboard, homolog, staging, questoes, homolog.questoes, pagamento, demo.pagamento, demo.concursos — enumerar conteúdo, auth, parâmetros.
3. **Descobrir origem real do admin** via SSL cert SAN, CT logs (quando crt.sh voltar), vhost brute nos IPs Vercel, e shodan favicon hash 1174505144.
4. **WAF fingerprint** (wafw00f) em degraucultural.com.br e admin — confirmar Cloudflare, preparar 2Captcha.
5. **API pública** (`/api/public/*.json`, `/search.json`) — content discovery em `/api/` (não-público), param mining, IDOR em `cursos.json?variant=` e paths por slug.
6. **Site antigo (antigo)** — fingerprint Joomla versão, wpscan/joomscan, `/administrator` e `/admin2/`, jQuery CVEs.
7. **Vercel takeover validation** nos 11 CNAMEs e **Unbounce** em landings.
8. **GCP appspot** (degrau*.appspot.com 403) — investigar storage/IAM via agente cloud.
9. **TLS scan** (nmap ssl-cert/ssl-enum-ciphers) nos IPs reais.
10. **OSINT dedicada** (breaches, LinkedIn, CNPJ Receita) para pessoas/emails coletadas.
