# SUMMARY.md — Attack Surface Consolidada — centraldeconcursos.com.br

> Fase 4 (§5, §16). Consolidação das Fases 2 (passivo) + 3 (ativo).
> Ranking de payoff (ALTO/MÉDIO/BAIXO) para priorizar Fases 5-7.
> Data: 2026-08-27T05:35Z UTC

## Metadados do alvo
- **Empresa:** EDITORA CENTRAL DE CONCURSOS LTDA — CNPJ 61.632.659/0001-55 (SP)
- **Sócio-administrador:** Igor Muniz Paez Velazquez (entrou 2025-06-04 — provável aquisição)
- **Plataforma vendor:** SEDUCAR PLATAFORMA DE ENSINO LTDA (CNPJ 53.979.887/0001-78, Gabriel Moraes) — LMS white-label
- **Cross-tenant:** concursos.* → degraucultural.com.br (outro cliente Seducar, família Martins)
- **CDN/WAF:** Cloudflare (apex + OWA + API + demo). Apps Seducar em Vercel. API em Render. demo.* em Heroku.
- **Negócio:** Concursos/cursos preparatórios (área do aluno, carrinho, pagamentos via Vindi, PII de candidatos)

## Attack surface em números
| Métrica | Valor |
|---|---|
| Subdomínios únicos | 54 |
| Hosts vivos | 44 |
| IPs de origem real (não-CF) | 13 (todos de terceiros/edge — Vercel/Render/dnzdns/RD Station; IP real do Exchange NÃO descoberto) |
| Apps Seducar (Vercel, Nuxt) | crm, crm-hml, dashboard, homolog, staging, questoes, homolog.questoes, pagamento |
| Emails confirmados | 7 (+ 6 inferidos) |
| Pessoas | 8 |
| Orgs GitHub | 4 (Seducar, Seducar-EAD, Seducar-V3, maisquestoes) |
| Buckets cloud | 6 existentes (4 GCP + 2 Azure), todos privados |
| URLs wayback | 50.418 (30.343 paths, 1.958 JS) |
| Takeover confirmado | 0 |
| DMARC | p=none (spoofable) |

## Stack tecnológica
- **Apex:** Nuxt.js (Vue.js/Node.js) via Cloudflare. Legado ASP/.NET migrado (404 hoje).
- **API:** Express on Render, multi-tenant Seducar (`api.*`, `api-hml.*`)
- **CRM/dashboard/questões/pagamento:** Seducar Nuxt em Vercel (Nuxt 2 buildManifest + Nuxt 3 buildId)
- **Email:** Exchange 2019 on-prem (OWA `/owa/`) via Cloudflare; MX=Pensomail; Salesforce MC; Mailgun; Akna
- **Pagamentos:** Vindi (incl. sandbox-app.vindi.com.br vazio no CSP de prod!)
- **Outros:** GTM Server (Stape.io), Kaltura, Hotjar, Dinamize, RD Station

## TOP achados de recon ( candidatos a finding )
1. **Exchange OWA 2019 CU15 May25HU exposto** (`mail/pda/pop/webmail → /owa/`) — `x-owa-version: 15.2.1748.26`, 4 CAS (I3SI-WIN-CAS09/10/11/12), **3 SUs de segurança atrasado** (Jun/Jul/Ago 2026). Endpoints: OWA, ECP, autodiscover (NTLM/OAuth/WS-Security), EWS, ActiveSync, mapi, OAB. CVE candidates: ProxyShell/ProxyNotShell/ProxyLogon (provavelmente patched no CU15) + CVEs dos 3 SUs faltantes.
2. **`/health` info disclosure** no `api.*` (Render Express) — vaza env/appKey.
3. **`_buildManifest.js` (Nuxt 2) + `/_nuxt/builds/latest.json` (Nuxt 3) vazados** em todos os apps Seducar — rotas internas enumeráveis.
4. **`staging` vaza `nuxt.config`** — `appDomain=homolog.degraucultural.com.br` (cross-tenant), appUrl=Render, mainApiUrl=api.maisquestoes.com.br. **vercel.live preview/dev mode habilitado**.
5. **CSP do apex/staging vaza backends** — Vindi (prod+sandbox!), Render APIs, maisquestoes, degraucultural, Kaltura.
6. **demo.* = 500 Heroku** com `auth.strategy=local` cookie (debug).
7. **DMARC p=none** — spoofable.
8. **6 buckets cloud existentes** (GCP cdc/cdc-prod/cdc-dev/concursos + Azure cdc/concursos) — privados, validar object-level.
9. **API multi-tenant** — `/` retorna 401 `{"error":"Escola não encontrada"}` (tenant resolvido por subdomínio, header `x-brand: central` em questoes.*). Host header bypass bloqueado por CF WAF.

## Ranking de payoff (§16) — priorização para Fases 5-7

### CRÍTICO
| # | Vetor | Host | Especialista | Notas |
|---|-------|------|--------------|-------|
| 1 | Exchange OWA 2019 exposto + 3 SUs atrasado — cred-stuffing/CVE/NTLM relay | mail/pda/pop/webmail → /owa/ | cve + exploit + network | Versão exata confirmada. IP real pendente (Shodan/Censys key). Probe endpoints OWA/ECP/autodiscover. |

### ALTO
| # | Vetor | Host | Especialista | Notas |
|---|-------|------|--------------|-------|
| 2 | API multi-tenant: IDOR/BOLA cross-tenant via JWT/cookie/Origin + /health disclosure | api.* / api-hml.* (Render) | enum + webapp | Tenant por subdomínio; Host bypass bloqueado por CF. Vetor via token claims/cookie. |
| 3 | staging vaza nuxt.config + vercel.live preview + buildManifest rotas | staging.* (Vercel Nuxt) | enum + webapp | cross-tenant appDomain=degrau. JS analysis alto valor. |
| 4 | CRM/dashboard auth bypass + default creds Seducar + buildManifest rotas | crm/crm-hml/dashboard/homolog.* | enum + webapp | Nuxt 2 buildManifest 30111 bytes em dashboard. |
| 5 | Apex rotas API 403 (carrinho/checkout/curso/produto) — param mining + Vindi integration | centraldeconcursos.com.br apex | enum + webapp | CSP vaza Vindi sandbox em prod. JS analysis. |
| 6 | Fluxo pagamento/carrinho — price manipulation / IDOR / coupon / Vindi token | pagamento.* + apex /Carrinho | webapp | Vindi integration. |

### MÉDIO
| # | Vetor | Host | Especialista | Notas |
|---|-------|------|--------------|-------|
| 7 | questoes/homolog.questoes (Nuxt 3) — IDOR de questões/simulados + param mining | questoes.* / homolog.questoes.* | enum + webapp | mainApiUrl=api.maisquestoes.com.br. |
| 8 | concursos cross-tenant (redirect ativo, Host bypass bloqueado) | concursos.* | webapp | rebaixado — validar via token. |
| 9 | demo.* 500 Heroku (auth.strategy=local) — stack trace | demo.* | webapp | Heroku, não Vercel. |
| 10 | Cloud buckets (6 privados) — object-level misconfig / signed URL | cdc* / concursos buckets | cloud | conexão direta (não Tor, GCP geo-bloqueia). |
| 11 | Cred-stuffing 7 emails (OWA + CRM Seducar) | webmail + CRM | exploit | threshold + rate limit. DMARC p=none. |

### BAIXO
| # | Vetor | Host | Notas |
|---|-------|------|-------|
| 12 | 7 hosts 522 (origin down): blog/ead/loja/livraria/mx1/passei/presencial | re-testar depois |
| 13 | cenimage/cenlink/censpf/landingpage (dnzdns privado) | baixo payoff |
| 14 | *.email.* (Salesforce MC/Akamai) | terceiro, fora de escopo |
| 15 | gtm/load.gtm (Stape.io/GTM Server) | pode vazar containers |
| 16 | emkt.* → Akna | terceiro, fora de escopo |

## IPs de origem real (para bypass CDN — todos baixo payoff)
- IPs Vercel/Render = edge multi-tenant (sem bypass útil)
- IP legado `200.99.26.41` = morto/filtered (não é origem atual)
- dnzdns/RD Station/Salesforce/Akamai = terceiros fora de escopo
- **IP real do Exchange = PENDENTE** (precisa Shodan/Censys/SecurityTrails API key, favicon hash -458515647)

## Limitações herdadas (sem API key)
- Shodan / Censys / SecurityTrails — IP real do Exchange não descoberto
- HIBP / DeHashed / IntelX — breaches dos 7 emails não verificados
- GitHub code search (token) — hardcoded secrets não buscados via API
- nuclei — rodando em background (lento via Tor)

## Próximas fases (paralelo onde possível)
1. **Fase 5 (enum)** → `enum` foco: staging, api, crm/dashboard, apex (JS analysis, buildManifest, param mining, content discovery)
2. **Fase 7 (cve)** → `cve` foco: mapear CVEs Exchange 2019 CU15 + 3 SUs faltantes (KB5094140/5103213/5121574) + ProxyShell/ProxyNotShell/CVE-2024-21410/21413 aplicabilidade
3. **Cloud** → `cloud` foco: object-level enum dos 6 buckets (GCP+Azure)
4. **Fase 6 (webapp)** → após enum: IDOR cross-tenant, auth bypass, OWASP no Nuxt/Express, carrinho/Vindi
5. **exploit** → após cve/webapp confirmar: cred-stuffing OWA, CVE PoCs, default creds CRM
6. **network** → se IP real Exchange descoberto: portscan direto, SMTP/IMAP/POP3 fingerprint
