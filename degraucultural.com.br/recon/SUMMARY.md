# SUMMARY — Attack Surface degraucultural.com.br (recon passivo + ativo)

**Atualizado:** 2026-08-27 (após Fase 3 — recon ativo)
**Alvo:** degraucultural.com.br (Editora Degrau Cultural / plataforma Seducar white-label)
**OPSEC:** Todo tráfego via Tor + proxychains4. IP real do operador nunca tocou o alvo.

---

## Attack surface consolidada

### Origem real (fora Cloudflare) — bypass do WAF

**A. Apps Vercel diretos (sem CF) — 11 hosts:**
`crm`, `crm-hml`, `dashboard`, `homolog`, `staging`, `questoes`, `homolog.questoes`, `pagamento`, `demo.pagamento`, `demo.concursos`, `concursos` (+ `degimage`/`landingpage`/`deglink`/`degspf` redirect svc em AWS).
- Stack: Nuxt.js / React+Vite (CRM) / Vue CLI (dashboard/homolog). Portas: 80/443 apenas.
- CRM (crm/crm-hml) = React/Vite SPA, "Seducar - CRM".
- Dashboard/Homolog = Vue CLI SPA, "Seducar" — **homolog exposto**.
- Staging = clone Nuxt do site exposto.

**B. ★ Backends Render VAZADOS (bypass CF — ALVO #1):**
Descobertos via CSP do apex + bundles JS:
| Backend | Stack | Função |
|---|---|---|
| `api-crm-h4ww.onrender.com` | AdonisJS | backend CRM (auth/user/* , school por domínio, CASL RBAC) |
| `api-qf9p.onrender.com` | AdonisJS | backend dashboard/homolog (auth/login, auth/users/login, auth/teacher/Login, auth/customer, JWT) |
| `api-site-hkm9.onrender.com` | AdonisJS | API site prod (401 "Escola não encontrada", /health 200) |
| `api-site-hml.onrender.com` | AdonisJS | HML do acima |
| `seducar-api-website.onrender.com` / `-hml` | AdonisJS | API website (stack trace vaza /opt/render/...) |
| `api-ia-analysis.onrender.com` | NestJS | API IA |

Todos bypassam o Cloudflare do cliente (Render usa CF próprio, mas app alcançável; `rndr-id` + `x-render-origin-server: Render`).

### Atrás de Cloudflare
- `degraucultural.com.br` / `www` — Nuxt/Vercel (edge CF).
- `api.degraucultural.com.br` / `api-hml` — 401, origin Render (api-site-hkm9/hml).
- **`admin.degraucultural.com.br` — 522 ORIGIN DOWN** (não está nos IPs conhecidos; CF-proxied; origin offline). Re-testar periodicamente.
- `antigo.degraucultural.com.br` — Joomla + jQuery 1.11.1 (legado, CVEs).
- 7 hosts 525/522 origin down (aulaobb, bolsao, fiscal, informativos, palestra, unidadevirtual, mta).
- `landings` (Unbounce CF 1014), `live` (CF 1000 misconfig), `load.gtm` (Stape.io).

### Portas nos IPs reais
**Apenas 80/443** em todos os 19 IPs (Vercel/GCP/AWS/Render). Sem SSH/DBs extras (cloud-managed).

### WAF
Cloudflare em degraucultural.com.br, api, api-hml, antigo, admin(edge). 2Captcha pronto p/ bypass.

### TLS/SANs
- Vercel: cert LE por host (default `no-sni.vercel-infra.com`).
- AWS redirect: cert SAN = degspf/degimage/deglink/landingpage (mesmo host).
- CF apex/api: advanced cert `degraucultural.com.br + api + *.api`.

---

## Ranking de PAYOFF (prioridade para enum/webapp)

| Rank | Alvo | Vetor | Payoff |
|---|---|---|---|
| 1 | **`api-crm-h4ww.onrender.com`** (CRM backend, bypass CF) | auth/user/login, auth/user/school, auth/user/logs (401), CASL RBAC | **auth bypass / default creds / privesc admin** |
| 2 | **`api-qf9p.onrender.com`** (dashboard backend, bypass CF) | auth/login, auth/users/login, auth/teacher/Login, auth/customer, JWT | **auth bypass / JWT none-weak / mass-assign role** |
| 3 | **`crm` / `crm-hml` / `dashboard` / `homolog`** (SPAs diretos sem CF) | bundles JS expondo API surface; homolog/staging expostos | enum JS → todos endpoints/keys; creds de HML |
| 4 | **`pagamento.degraucultural.com.br`** + Vindi | fluxo financeiro, bypass cobrança, IDOR assinaturas | alto (financeiro) |
| 5 | **`antigo.degraucultural.com.br`** | Joomla + jQuery 1.11.1 legado, /administrator, /admin2/, .asp | CVE RCE/admin bypass |
| 6 | **`api-site-hkm9/hml.onrender.com`** (API site) | 401 multi-tenant, /health, AdonisJS stack trace | info + tenant enum |
| 7 | **`auth-v2.maisquestoes.com.br` / `api.maisquestoes.com.br`** | auth/questões separada (Seducar/maisquestões) | auth cross-domain |
| 8 | `admin.degraucultural.com.br` | painel admin (522 down) | alto QUANDO voltar |
| 9 | `staging.degraucultural.com.br` | clone Nuxt exposto | enum |
| 10 | `seducar-api-website-hml.onrender.com` | error dump 55KB (paths) | info disclosure |

---

## Findings preliminares (severidade)

- **CRÍTICO:** Backends Render vazados bypass CF + endpoints auth expostos (F-A1).
- **ALTO:** CRM `auth/user/school` multi-tenant + `auth/user/logs` 401 + CASL RBAC (F-A2); stack traces AdonisJS + error dump paths (F-A3); homolog/staging expostos (F-A4); bundles JS expõe API (F-A5); maisquestões auth (F-A6); pagamento+Vindi (F-A7).
- **MÉDIO:** antigo Joomla/jQuery legado (F-A8); admin down (F-A9); centraldeconcursos sister brand (F-A10).
- **BAIXO/INFO:** hosts CF down, live misconfig, GTM SSRF, portas só 80/443.

Detalhes: `recon/passive/PASSIVE.md`, `recon/active/ACTIVE.md`.

---

## Próximas fases

1. **enum** — análise JS profunda (crm_index.js, homolog_index.js 3.7MB, dashboard chunks) + content discovery nos hosts diretos.
2. **webapp** — auth bypass/default-creds/JWT nos backends Render (bypass CF); school enumeration; pagamento; antigo Joomla.
3. **cve** — AdonisJS version, Joomla version, jQuery 1.11.1.
4. **re-test admin** — agendar re-probe (origin pode voltar).
5. **cloud/osint** — GCP appspot, favicon Shodan, breaches.
