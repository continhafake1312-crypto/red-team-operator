# ACTIVE — Recon Ativo degraucultural.com.br

**Fase:** 3 (recon ativo)
**Data:** 2026-08-27 (início 04:06Z, fim ~05:00Z UTC)
**Alvo:** degraucultural.com.br
**OPSEC:** TODOS os scans/requests via Tor + proxychains4 (socks5 127.0.0.1:9050) ou curl `--proxy socks5h` (Tor). IP de saída Tor. IP real do operador nunca tocou o alvo. Rate-limited, UA rotativo, stealth. Sem DoS.

---

## 1. Sumário executivo

| Métrica | Valor |
|---|---|
| IPs de origem real testados | 19 (Vercel/GCP/AWS/Render) |
| Hosts vivos (httpx ativo) | 35 (dos 40 do passivo) |
| Hosts **diretos (sem Cloudflare)** | 11 (Vercel) + 2 redirect (AWS) |
| Hosts atrás de Cloudflare | ~22 |
| Portas expostas nos IPs reais | **Apenas 80/443** (cloud-managed; sem SSH/DBs extras) |
| WAF confirmado | Cloudflare em degraucultural.com.br, api, api-hml, antigo, admin(edge 522) |
| **IP real do admin.degraucultural.com.br** | **NÃO descoberto — origem DOWN (522)**. Não está nos IPs Vercel/GCP/AWS/Render. DNS=Cloudflare (104.26.x). Origin offline. |
| **Backends Render vazados (bypass CF!)** | **5** — via CSP do apex + JS bundles |
| TLS/SANs revelando hosts | degimage/deglink/degspf/landingpage (mesmo AWS host) |

**MAIOR VETOR:** Os backends de API em Render (`*.onrender.com`) foram vazados via header CSP do site apex e via bundles JS do CRM/dashboard/homolog. Eles **bypassam o Cloudflare do cliente** (WAF) e expõem endpoints de auth diretamente (login, signup, school, JWT). Estes são o alvo prioritário para webapp/auth-bypass/default-creds.

---

## 2. WAF / CDN (wafw00f)

| Host | WAF | Detalhe |
|---|---|---|
| degraucultural.com.br | **Cloudflare** | confirmado |
| api.degraucultural.com.br | **Cloudflare** | 401 normal → 403 sob payload SQLi (WAF ativo) |
| antigo.degraucultural.com.br | **Cloudflare** | confirmado |
| admin.degraucultural.com.br | Cloudflare (edge) | **522 — origin inalcançável** (timeout) |

Artefato: `waf_cf.txt`. 2Captcha configurado para bypass quando necessário (chave fora do repo).

---

## 3. IPs de origem real — portas e natureza

Port-scan (curl-based via Tor, portas comuns 21/22/25/80/443/3000/4443/5432/6379/8000/8080/8443/9000/9200/27017 etc.): **somente 80/443 abertos em todos os 19 IPs**. Nenhum SSH/DB/serviço extra exposto (cloud-managed: Vercel, Render, GCP, AWS).

### Natureza real de cada bloco (corrigido vs. passivo)

| Bloco/IP | ARIN label | Natureza real (confirmada ativamente) |
|---|---|---|
| 216.150.1.0/24, 216.150.16.0/24, 66.33.60.0/24, 76.76.21.0/24 (Vercel, 13 IPs) | Vercel | **TRUE ORIGEM DIRETA (sem CF)** — cert LE `no-sni.vercel-infra.com` default, `<host>` cert c/ SNI. Servem os apps não-CF: crm, crm-hml, dashboard, homolog, staging, questoes, homolog.questoes, pagamento, demo.pagamento, demo.concursos, concursos |
| 216.24.57.7 / 216.24.57.15 | Render (RS-1125) | **Na verdade Cloudflare EDGE** (server:cloudflare, cf-ray). Servem api(401)/apex(200)/antigo(200)/api-hml(401) via CF. **live** = erro CF 1000 "DNS points to prohibited IP" (registro CF aponta p/ IP CF). NÃO é origem utilizável para bypass |
| 3.132.6.138 / 3.133.227.151 | AWS (AT-88-Z) | **Misto**: servem degimage/deglink/degspf/landingpage **direto** (302 redirect, sem CF — cert SAN degspf/degimage/deglink/landingpage); e via SNI=api/apex retornam resposta Cloudflare (CF edge nesse bloco AWS). Origem real do redirect service = AWS |
| 34.68.161.129 | GCP (GOOGL) | CF edge — serve concurso/mkt (RD Station CNAME) e apex via CF. 443/80 abertos mas responde como CF |
| 34.151.202.32 | GCP | gtm (Stape.io server-side GTM) — não responde direto (400 via CF normal). Filtrado direto |

Artefatos: `portprobe_custom.txt`, `portprobe_80_443.txt`, `tls_sans_by_ip.txt`, `render_origin_test.txt`.

---

## 4. Caçada ao IP real do admin.degraucultural.com.br — RESULTADO: ORIGEM DOWN

Artefato: `admin_real_ip_hunt.txt`.

**Metodologia:**
1. `dig admin.degraucultural.com.br` → 104.26.4.50 / 172.67.68.226 / 104.26.5.50 (todos Cloudflare). Confirma admin é CF-proxied (não host direto Vercel).
2. Testado SNI `admin.degraucultural.com.br` em cada IP Vercel → **nenhum apresenta cert** (Vercel não tem admin configurado). Resposta: timeout/empty → Vercel não serve admin.
3. Testado admin em 216.24.57.7/15 (Render/CF) e AWS/GCP → **timeout 000** (mesmo 522 do CF normal). Origin down.
4. Cert Cloudflare para admin (Google Trust Services WE1) = Universal wildcard `degraucultural.com.br + *.degraucultural.com.br` — não revela origin hostname.
5. crt.sh indisponível (502) no passivo — CT logs não consultáveis.

**Conclusão:** `admin.degraucultural.com.br` é um registro Cloudflare-proxied cuja **origem está offline** (CF 522 = "Connection timed out" ao origin). A origem real NÃO está em nenhum dos 19 IPs do passivo. Não há como alcançar o admin enquanto a origem estiver down — bypass de CF não ajuda (origin morto). **Recomendado:** re-testar periodicamente (origem pode voltar); quando voltar, repetir vhost fuzz/SSL SAN; correlacionar favicon hash 1174505144 no Shodan (quando houver API key).

---

## 5. ★ Backends Render VAZADOS — bypass do WAF Cloudflare (ALVO PRIORITÁRIO)

Descobertos via **header CSP do apex** (servido pela edge CF→Vercel) e via **bundles JS** do CRM (React/Vite) e do dashboard/homolog (Vue CLI). Todos são `*.onrender.com` (Render) — bypassam o Cloudflare do cliente. O Render usa Cloudflare próprio (server:cloudflare, cf-ray, header `rndr-id`, `x-render-origin-server: Render`), mas o app real é alcançável.

| Backend Render | Origem do vazamento | Stack | Função |
|---|---|---|---|
| **api-site-hkm9.onrender.com** | CSP apex (`connect-src`) | AdonisJS | API principal do site (401 `{"error":"Escola não encontrada"}` — multi-tenant p/ escola). rndr-id 609047ac. /health → 200 |
| **api-site-hml.onrender.com** | CSP apex | AdonisJS | HML do acima. rndr-id 2383cea3 |
| **seducar-api-website.onrender.com** | CSP apex | AdonisJS (poppinss) | API website Seducar. 404 root. Stack trace vaza `/opt/render/project/src/...` |
| **seducar-api-website-hml.onrender.com** | CSP apex | AdonisJS | HML — **error dump 55KB** vaza stack + paths `/opt/render/project/src/node_modules/...` |
| **api-crm-h4ww.onrender.com** | JS bundle CRM (`crm_index.js`) | AdonisJS | **Backend do CRM** — auth/user/* . rndr-id ce0beee2 |
| **api-qf9p.onrender.com** | JS bundle dashboard/homolog (`homolog_index.js`) | AdonisJS | **Backend principal dashboard/homolog**. /health → 200. Stack trace vazado |
| **api-ia-analysis.onrender.com** | JS bundle homolog | NestJS | API de IA (404 root) |

### Endpoints de auth descobertos (via JS bundles) — alvo de auth bypass / default creds

**CRM (`api-crm-h4ww.onrender.com`):**
- `auth/user/login` (GET 404 = POST-only), `auth/user/signup`, `auth/user/password`, `auth/user/profile`, `auth/user/validate`, `auth/user/logs` (**401 Unauthorized access** = endpoint existe, requer auth), **`auth/user/school` → 400 `{"message":"Domínio não informado"}`** (identifica escola por domínio/parâmetro)
- Biblioteca de autorização: **CASL** (roles: admin, administrador, authorized, authenticatedOnly)

**Dashboard/Homolog (`api-qf9p.onrender.com`):**
- `auth/login`, `auth/users/login`, `auth/register`, `auth/forgot-password`, `auth/reset-password`, `auth/verify/`, `auth/teacher/Login`, `auth/customer`, `auth/user/*`
- **Auth via JWT** (`auth/jwt/jwtService`, `auth/jwt/useJwt`)
- Módulos: customer, teacher, user (login/register/forgot/reset/confirmation)

**Observações:**
- AdonisJS expõe **stack traces completos** em rotas 404 (`{"message":"E_ROUTE_NOT_FOUND","stack":"HttpException..."}`) → info disclosure de estrutura/framework.
- `seducar-api-website-hml` retorna página de erro AdonisJS 55KB com paths internos `/opt/render/project/src/...`.
- Render CF bloqueia Host headers arbitrários (403) — o CRM identifica a escola via parâmetro/domínio passado pelo frontend (header custom ou body), não via Host.

Artefatos: `leaked_render_backends.txt`, `crm_backend_probe.txt`, `api_qf9p_school_probe.txt`, `render_backend_api_probe.txt`, `crm_index.js`, `homolog_index.js`, `seducar_hml_errdump.html`.

---

## 6. CSP do apex — vazamentos adicionais (connect-src)

Header CSP de `degraucultural.com.br` revela toda a infra de backend/third-party:
- **Render APIs:** api-site-hkm9.onrender.com, api-site-hml.onrender.com, seducar-api-website.onrender.com, seducar-api-website-hml.onrender.com (acima)
- **MaisQuestões (plataforma de questões):** `api.maisquestoes.com.br`, `auth-v2.maisquestoes.com.br` (auth API — alvo auth separado)
- **Pagamento Vindi:** `app.vindi.com.br`, `sandbox-app.vindi.com.br` (recorrente — fluxo financeiro)
- **Google Analytics/GTM, Facebook, TikTok, Hotjar, WebPushs, Dinamize, Rtmscl, Kaltura, BunnyCDN, MediaDelivery, Iconify**
- **Sites irmãos:** `*.centraldeconcursos.com.br` (sister brand — possível escopo ampliado)
- `x-powered-by: Nuxt`, `x-vercel-id`, `csrf_token` cookie (Nuxt CSRF)

---

## 7. Hosts diretos (sem Cloudflare) — fingerprint detalhado

Todos em Vercel (cert Let's Encrypt por host, `server: Vercel`, `x-vercel-id`, `x-vercel-cache`). Bypass do WAF — alvo de enum/webapp direto.

| Host | IP Vercel | Status | Stack | Notas |
|---|---|---|---|---|
| **crm.degraucultural.com.br** | 216.150.1.193 | 200 | React + Vite (`/assets/index-*.js`), title "Seducar - CRM" | SPA. Backend `api-crm-h4ww.onrender.com` (Render). Auth/user/* , school por domínio |
| **crm-hml.degraucultural.com.br** | 216.150.16.65 | 200 | React + Vite, "Seducar - CRM" | HML do CRM |
| **dashboard.degraucultural.com.br** | 216.150.16.193 | 200 | Vue CLI (`/js/chunk-vendors.*.js`, `/js/index.*.js`), "Seducar" | SPA. Backend `api-qf9p.onrender.com`. /api/* → 404 (server-side) |
| **homolog.degraucultural.com.br** | 66.33.60.129 | 200 | Vue CLI (`chunk-vendors.js`, `index.js` — 3.7MB), "Seducar" | **AMBIENTE HOMOLOG EXPOSTO** (sem CF). Backend `api-qf9p.onrender.com` (mesmo do prod?) |
| **staging.degraucultural.com.br** | 216.150.1.1 | 200 | Nuxt.js, "Degrau Cultural..." (504KB — clone do site) | **STAGING EXPOSTO** (sem CF) |
| **questoes.degraucultural.com.br** | 216.150.16.1 | 200 | Nuxt.js (21KB) | app de questões |
| **homolog.questoes.degraucultural.com.br** | 216.150.16.65 | 200 | Nuxt.js | HML questões |
| **pagamento.degraucultural.com.br** | 76.76.21.164 | 200 | Nuxt.js (2KB) | **app de pagamento** — fluxo financeiro (Vindi) |
| **demo.pagamento.degraucultural.com.br** | 76.76.21.93 | 302 | React | redireciona p/ `vercel.com/sso-api` (Vercel deployment protection SSO) |
| **demo.concursos.degraucultural.com.br** | 216.150.1.65 | 404 | Vercel | sem deployment |
| **concursos.degraucultural.com.br** | 216.150.1.1 | 302 | Vercel | → degraucultural.com.br |
| **degimage.degraucultural.com.br** | 3.133.227.151 (AWS) | 302 | redirect svc (sem CF) | → degraucultural.com.br. CSP `frame-ancestors *.degimage...` |
| **landingpage.degraucultural.com.br** | 3.133.227.151 (AWS) | 302 | redirect svc (sem CF) | → degraucultural.com.br |
| **deglink / degspf** | 3.132.6.138 (AWS) | 404/302 | redirect svc | base do shortener |

**CRM = SPA React/Vite** (index-S7rijOWh.js); **dashboard/homolog = SPA Vue CLI** (chunk-vendors); ambos client-routed (todas rotas retornam 200 = index.html). Conteúdo real via API (Render).

---

## 8. Hosts atrás de Cloudflare — status

| Host | Status | Notas |
|---|---|---|
| degraucultural.com.br / www | 200 / 301→200 | Nuxt.js na Vercel (atrás CF) |
| **admin.degraucultural.com.br** | **522** | **origin DOWN** — ver §4 |
| api.degraucultural.com.br / api-hml | 401 | `{"error":"Escola não encontrada"}` — Render backend (`x-render-origin-server: Render`). Origin = api-site-hkm9/hml.onrender.com (vazado) |
| antigo.degraucultural.com.br | 200 | Joomla + jQuery 1.11.1 + jQuery UI 1.11.4 (legado, CVEs). Title "AODF". `/administrator`, `/admin2/`, `.asp` legacy (do wayback) |
| demo.degraucultural.com.br | 500 | server error (origin) |
| aulaobb, bolsao, fiscal, informativos, palestra, unidadevirtual | 525 | origin down via CF |
| mta | 522 | origin down |
| landings | 403 (CF 1014) | CNAME Unbounce cross-origin bloqueado |
| live | 403 (CF 1000) | "DNS points to prohibited IP" — registro CF aponta p/ IP CF (misconfig) |
| load.gtm | 400 | Stape.io server-side GTM + Cloudflare Bot Management |
| image.email | 403 | AkamaiGHost (Salesforce email) |

---

## 9. TLS / SANs

- **Vercel IPs:** cert default `no-sni.vercel-infra.com` (LE); com SNI=<host> → cert LE do host. SNI=admin → sem cert (admin não é Vercel).
- **Render/CF IPs (216.24.57.x):** cert Cloudflare (Google Trust Services WE1) — apex+api+*.api (advanced) ou universal *.degraucultural.com.br.
- **AWS redirect (3.133.227.151):** cert SAN = **degspf + degimage + deglink + landingpage** (mesmo host — shortener/redirect service). Confirma 4 subdomínios no mesmo servidor.
- **Cloudflare certs (admin/antigo):** universal wildcard — não revelam origins.
- **api cert (CF advanced):** `degraucultural.com.br + api.degraucultural.com.br + *.api.degraucultural.com.br` — confirma api é domínio dedicado (Advanced Cert Manager no CF).

Artefato: `tls_sans_by_ip.txt`.

---

## 10. Findings preliminares (prioridade para próximas fases)

| # | Sev | Finding | Próximo passo |
|---|---|---|---|
| F-A1 | **CRÍTICO** | Backends Render vazados (`api-crm-h4ww`, `api-qf9p`, `api-site-hkm9/hml`, `seducar-api-website*/hml`, `api-ia-analysis`) **bypassam Cloudflare** e expõem endpoints de auth (login/signup/school/JWT) | **webapp**: auth bypass / default creds / JWT none/weak-secret em `auth/user/login`, `auth/users/login`, `auth/teacher/Login`, `auth/customer` |
| F-A2 | **ALTO** | CRM (`api-crm-h4ww`) endpoint `auth/user/school` → 400 "Domínio não informado" — escola identificada por domínio (header/param). `auth/user/logs` → 401 (existe). CASL RBAC (admin/administrador) | webapp: enumerar escolas/domínios, testar IDOR em logs/profile, privesc p/ admin role |
| F-A3 | **ALTO** | Stack traces AdonisJS vazados em rotas 404 (`api-qf9p`, `seducar-api-website*`) + error dump 55KB no HML (`/opt/render/project/src/...`) | info disclosure — framework/paths confirmados. Útil p/ LFI/path traversal e CVE AdonisJS |
| F-A4 | **ALTO** | Ambientes homolog/staging expostos diretos (sem CF): `homolog`, `staging`, `crm-hml`, `homolog.questoes`, `demo.*` | enum: content discovery, JS, env vars, configs de HML podem vazar creds/secrets |
| F-A5 | **ALTO** | CRM + dashboard/homolog SPAs diretos (sem CF) com bundles JS expondo toda a API surface | enum: análise profunda dos JS (`crm_index.js` 284KB, `homolog_index.js` 3.7MB) p/ todos endpoints, chaves, tokens |
| F-A6 | **ALTO** | `auth-v2.maisquestoes.com.br` + `api.maisquestoes.com.br` — plataforma de auth/questões separada (Seducar/maisquestões). NestJS-style | webapp: auth separada, possível SSO/JWT cross-domain |
| F-A7 | **ALTO** | App de pagamento `pagamento.degraucultural.com.br` (Nuxt, direto sem CF) + Vindi (`app.vindi.com.br`, `sandbox-app.vindi.com.br`) | webapp: fluxo de pagamento, bypass de cobrança, IDOR em assinaturas |
| F-A8 | **MÉDIO** | `antigo.degraucultural.com.br` Joomla + jQuery 1.11.1 + jQuery UI 1.11.4 (legado) — CVEs conhecidos. `/administrator`, `/admin2/`, `.asp` | webapp/CVE: joomscan, Joomla version → RCE/admin bypass; jQuery CVEs |
| F-A9 | **MÉDIO** | `admin.degraucultural.com.br` origin DOWN (522) — painel admin existe mas inacessível. Origin não está nos IPs conhecidos | re-testar periodicamente; quando voltar, vhost fuzz + favicon hash Shodan |
| F-A10 | **MÉDIO** | `centraldeconcursos.com.br` é sister brand (no CSP) — possível escopo ampliado de Seducar white-label | confirmar escopo c/ coordenador; se in, recon próprio |
| F-A11 | **BAIXO** | 7 hosts CF 525/522 (aulaobb, bolsao, fiscal, informativos, palestra, unidadevirtual, mta) — origins down | monitorar; podem voltar |
| F-A12 | **BAIXO** | `live.degraucultural.com.br` misconfig CF (DNS aponta p/ IP CF → erro 1000). `load.gtm` Stape.io server-side GTM | info; possível SSRF via GTM container |
| F-A13 | **INFO** | Apenas 80/443 expostos nos IPs reais (cloud-managed). Sem SSH/DBs expostos. `x-render-origin-server: Render`, `rndr-id` headers confirmam Render. | — |

---

## 11. Artefatos brutos (em recon/active/)

`waf_cf.txt`, `httpx_active.txt`, `tls_sans_by_ip.txt`, `admin_real_ip_hunt.txt`, `render_origin_test.txt`, `render_backend_api_probe.txt`, `leaked_render_backends.txt`, `crm_backend_probe.txt`, `api_qf9p_school_probe.txt`, `seducar_panels_probe.txt`, `seducar_hml_errdump.html`, `portprobe_custom.txt`, `portprobe_80_443.txt`, `direct_probe_<host>.txt` (14 hosts), `crm_index.js`, `homolog_index.js`.

---

## 12. Próximos passos recomendados

1. **enum (prioridade MÁXIMA):** análise profunda dos bundles JS (`crm_index.js`, `homolog_index.js` 3.7MB, dashboard chunk-vendors) → extrair TODOS os endpoints de API, headers custom (school domain), chaves/tokens, estrutura de requests. Content discovery nos hosts diretos (crm, dashboard, homolog, staging, pagamento, questoes).
2. **webapp (auth bypass):** POST em `auth/user/login` (CRM), `auth/users/login` / `auth/teacher/Login` / `auth/customer` (dashboard) direto nos backends Render (`api-crm-h4ww.onrender.com`, `api-qf9p.onrender.com`) — bypass CF. Testar default creds (admin/admin, seducar/seducar), JWT none/weak secret, mass assignment p/ role=admin.
3. **webapp (school enumeration):** descobrir como o frontend passa o "domínio" p/ `auth/user/school` (header custom? body?); enumerar escolas/domínios; IDOR em `auth/user/logs`, `auth/user/profile`.
4. **webapp (pagamento):** fluxo Vindi em `pagamento.degraucultural.com.br` — bypass de cobrança, IDOR assinaturas.
5. **CVE/webapp (antigo):** joomscan + Joomla version fingerprint → admin bypass/RCE; jQuery 1.11.1 CVEs; path traversal em `.asp` legacy.
6. **webapp (maisquestões):** auth-v2.maisquestoes.com.br — JWT/SSO cross-domain.
7. **cve:** AdonisJS version (via stack trace) → CVEs; Vercel/Render platform CVEs.
8. **re-test admin:** agendar re-probe de `admin.degraucultural.com.br` (origin pode voltar).
9. **osint/cloud:** validar GCP appspot apps (degrau*.appspot.com 403) via agente cloud; correlacionar favicon hash 1174505144 no Shodan quando houver key.
