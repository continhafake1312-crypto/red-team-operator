# PASSIVE.md — Recon Passivo (Fase 2) — cursosprepare.com

> Engajamento: pentest black-box externo | Alvo: `cursosprepare.com` (Wix managed)
> Janela: iniciada 2026-08-27T03:25Z | Concluída: 2026-08-27T04:35Z
> OPSEC: proxychains4/Tor em fontes externas; alvo Wix/Google Cloud bloqueia Tor exit (403 em www) — fingerprint via apex/direto conforme coordenador já estabelecera.

---

## 1. Resumo executivo

| Métrica | Valor |
|---|---|
| Subdomínios descobertos (fontes passivas) | **3** (apex, www, www3-histórico) |
| Subdomínios VIVOS | **2** (apex + www) |
| IPs de origem real (fora CDN Wix) | `34.149.87.45` (Google Cloud — www via CNAME cdn1.wixdns.net); apex em range Wix `185.230.63.107/.171/.186` |
| Tech stack | Wix (Pepyaka) + React + Lodash + Google Cloud CDN + HSTS + HTTP/3; TPA apps: Wix Stores, Wix Bookings, Wix Members, Wix Online Programs, Wix Pricing Plans |
| Cloud buckets públicos | **Nenhum** (S3: nenhum bucket existe; GCP: inconclusivo por geo-block Tor; Azure: nenhum) |
| Subdomain takeover candidates | **Nenhum** (www→Wix CDN gerenciado, sem dangling) |
| Emails confirmados | **1** (`cursoprepare@cursoprepare.com`) + 40 candidatos (padrão Google Workspace, não validados) |
| Pessoas (equipe) | **17** nomes + função (incl. dono Luis Guilherme Leite Martins) |
| Empresa | Prepare Cursos Preparatórios LTDA — CNPJ 48.908.380/0001-93 — Santa Maria/RS |
| Wayback URLs | 432 (apex); apenas subdomínio `www` histórico |
| Wix site ID (live) | `dcffb6fe-b153-4b2e-bd44-5de8281fcb28` (metaSiteId), `874f21d1-94df-4a61-ab4b-4b1fd286f157` (siteId) |

**Attack surface tradicional é mínima** (Wix managed, sem infra própria, 2 hosts, sem takeover, sem buckets). O **valor do engagement está em**: (a) Wix APIs/TPA apps (Stores, Bookings, Online Programs, Members) — IDOR/enumeration; (b) OSINT rico (17 pessoas, CNPJ, email Google Workspace) — phishing/cred-stuffing; (c) 30 cursos em `challenge-page/<UUID>` — acesso não-autorizado; (d) fluxo de pagamentos/matrícula (`/payment-request-page`, `/inscricao`).

---

## 2. DNS completo

Fontes: `dns_full.txt`, `amass_subs.txt`.

- **WHOIS (cursosprepare.com):** Registrant Name **Luis Guilherme Leite Martins**; Rua Dr Bozano, 1147, sala 315, Santa Maria, RS, 97015-003, BR. Email/telefone protegidos por proxy Wix (`cursosprepare.com@wix-domains.com`, `+1.4159496022`). Criado 2020-05-23, expira 2028-05-23. Registrar Wix.com Ltd.
- **NS:** ns14.wixdns.net, ns15.wixdns.net
- **MX:** Google Workspace — `aspmx.l.google.com`, alt1..alt4.aspmx.l.google.com
- **TXT/SPF:** (ver `dns_full.txt`)
- **DMARC:** `_dmarc.cursosprepare.com` — (sem registro / não configurado — anotar para hardening)
- **CAA:** (ver dns_full)
- **AXFR:** tentado contra ns14/ns15.wixdns.net — **negado** (Wix não permite transfer).
- **Apex A:** 185.230.63.107 / .171 / .186 (ASN 58182 WIX_COM, 185.230.60.0/22)
- **www:** CNAME `cdn1.wixdns.net` → `td-ccm-neg-87-45.wixdns.net` → **34.149.87.45** (Google Cloud)
- **Sem wildcard DNS** (brute-force de 5000 nomes: apenas `www` resolve)

---

## 3. Subdomínios — fontes passivas

| Fonte | Resultado |
|---|---|
| subfinder (-all -recursive) | 0 |
| assetfinder | 0 |
| amass (passive) | apex + www + domínio relacionado `pgfconcursos.com` (estacionado) |
| crt.sh | bloqueado via Tor (429/502) — inconclusivo |
| certspotter (SSLMate CT) | **cursosprepare.com, www.cursosprepare.com** (1 cert SAN) |
| Hackertarget / RapidDNS / AlienVault OTX | www |
| theHarvester | **www3.cursosprepare.com** (histórico, NÃO resolve hoje) + balancers Wix |
| dnsx brute-force (5000) | www |

**Subdomínios vivos:**
- `cursosprepare.com` (apex) → 185.230.63.171 → HTTP 301 → www
- `www.cursosprepare.com` → 34.149.87.45 (Google Cloud) → HTTP 200

Artefatos: `subdomains_all.txt`, `subdomains_live.txt`, `dnsx_bruteforce_5k.txt`, `certspotter_subs.txt`, `extra_sources_subs.txt`, `theharvester.{json,xml}`.

---

## 4. Fingerprint / Tech stack

`httpx -tech-detect` (`httpx_live.txt`):

| Host | Status | Server | IP | Tech |
|---|---|---|---|---|
| https://cursosprepare.com | 301→www | Pepyaka | 185.230.63.171 | Google Cloud CDN, HSTS, HTTP/3, Lodash, React, Wix |
| https://www.cursosprepare.com | 200 | Pepyaka | 34.149.87.45 | Google Cloud CDN, HSTS, HTTP/3, Lodash, React, Wix |

**Favicon mmh3 hash** (`favicon_hash.txt`, para Shodan correlation):
- apex favicon: **1066732016** (12154 bytes — favicon real do site)
- www favicon: 298740160 (306 bytes — provável default/redirect Wix)
- → Recomendado: `shodan search http.favicon.hash:1066732016` quando houver API key, para descobrir outros ativos da marca.

---

## 5. Wix-specific findings (HIGH VALUE)

`wix_artifacts.txt`:
- **metaSiteId (live):** `dcffb6fe-b153-4b2e-bd44-5de8281fcb28`
- **siteId (live):** `874f21d1-94df-4a61-ab4b-4b1fd286f157`
- **metaSiteId histórico (wayback 2026-04):** `4efed923-849a-4ac1-89ee-6da911368879` (config antiga — possível migração/config exposta)
- **siteId histórico:** `57632586-5b1e-4a5a-8b1a-9395cac1aab4`
- **Sentry DSN exposto:** `0fd2930120484402ac9adfb9e05cacd5@o37417.ingest.sentry.io` (org Wix compartilhada — baixo risco direto, mas confirma stack)
- **TPA apps instalados:** Wix Stores (1380b703…, 27 refs), Wix Bookings (13d21c63…, rev 440), Wix Members (14cffd81…), Wix Members Area (14ce28f7…), Wix Online Programs, Wix Pricing Plans, + ~12 outros apps (revisões em `wix_artifacts.txt`).

**Vetores Wix para próximas fases:**
- Wix Stores API (`/_api/wix-ecommerce-storefront-web/`): carrinho, produtos, **IDOR de pedidos/clientes**
- Wix Bookings API (`/_api/wix-bookings-web/`): agendamentos, IDOR
- Wix Members API (`/_api/members/v1/`): perfis, IDOR de membros
- Wix Online Programs: **30 cursos** em `/challenge-page/<UUID>` (UUIDs enumerados em `sm_online-programs.xml`) — testar acesso não-autorizado a conteúdo pago
- `_partials*` e `/pro-gallery-webapp/v1/galleries/*` bloqueados no robots.txt (alvo para enum)

---

## 6. OSINT — Empresa / Pessoas / Emails

`osint_company.txt`, `osint_people.txt`, `osint_emails.txt`:

- **Empresa:** Prepare Cursos Preparatórios LTDA — **CNPJ 48.908.380/0001-93** — rodapé "© 2023 por ABC Programas Extra Curriculares". Santa Maria/RS. Tel/WhatsApp **(55) 99100-9544**.
- **Dono:** Luis Guilherme Leite Martins (Coordenador Pedagógico; = registrante WHOIS). Diretora: Ana Paula Martins. Secretária: Sidimar Ferreira Dutra.
- **Equipe completa (17 pessoas)** com funções e disciplinas em `osint_people.txt` (professores: Camila Morás, Alana Roos, Claudio Pacheco Luz, Giovani Stefanello, Nathália Facco Rocha, Alessandra Londero, Katia Vasconcellos, Ana Paula, Geanine Perez, Paola Mortari, Assis Nunes, Samuel Campos; webmaster Victória Borgmann).
- **Email confirmado:** `cursoprepare@cursoprepare.com` (mailto no site). Domínio de email **`cursoprepare.com`** (Google Workspace, sem website, registrado 2021-07-13, Squarespace/Google Domains) — domínio relacionado fora do escopo atual mas pertencente ao mesmo negócio.
- **Emails candidatos (40):** `osint_emails.txt` — padrões `nome.sobrenome@cursoprepare.com` / `@cursosprepare.com`. **NÃO validados** (SMTP RCPT = ação ativa — delegar a webapp/credential-phase).
- **Breaches:** theHarvester sem API keys (Censys/HIBP/DeHashed/Hunter/Intelx indisponíveis). Recomendado delegar ao especialista `osint` com API keys, ou h8mail, para verificação de `cursoprepare@cursoprepare.com` + 17 pessoas em breaches.
- **GitHub:** code search requer login (webfetch bloqueado). Dorks a tentar manualmente: `org:prepare`, `"cursoprepare.com" password`, `"cursosprepare" AKIA`, `cursosprepare filetype:env`.

---

## 7. Cloud / Buckets / Takeover

`cloud_buckets.txt`, `takeover_candidates.txt`:

- **S3:** testados 20 nomes (`cursosprepare`, `cursos-prepare`, `cursoprepare`, `-assets`, `-backup`, `-media`, etc.) → **NoSuchBucket** para todos. Nenhum bucket público.
- **GCP storage:** `cursosprepare`, `cursos-prepare`, `prepare`, `cursoprepare` → **AccessDenied "service not available in your location"** (geo-block do Tor) — **inconclusivo**. Re-testar via IP não-Tor ou com API key na fase cloud.
- **Azure Blob:** genérico `prepare` → 400 (nome inválido); demais não testados por naming pouco provável.
- **Subdomain takeover:** www → CNAME Wix CDN (ativo, não dangling). Nenhum outro subdomínio resolve. **Sem takeover candidates.**
- Recomendação: subdelegar ao especialista `cloud` para validar buckets GCP (sem Tor) e enum de naming com domínio `cursoprepare`.

---

## 8. Wayback / Content discovery

`wayback_apex.txt` (432 URLs), `wayback_all_paths.txt` (331 paths), `wayback_highlights.txt`, `sm_*.xml` (sitemaps live):

**Páginas/rotas sensíveis:**
- `/payment-request-page` — Wix Payment Request (potencial IDOR de cobrança)
- `/cursosead` — portal EAD (HIGH VALUE, conteúdo pago/autenticado)
- `/afiliados`, `/inscreva-se`, `/inscricao`, `/agenda`, `/book-online` — fluxos de negócio
- `/equipeprepare`, `/equipe-litoral`, `/nossaequipe`, `/quem-somos` — OSINT (já explorado)
- `/politicas`, `/politica-de-devolu`
- 30 `/challenge-page/<UUID>` (cursos on-line — UUIDs expostos no sitemap)
- 9 `/product-page/<slug>` (Wix Stores), 7 `/category/`, múltiplas `/service-page/<cidade>` (RS)

**Sitemaps live (enum pronto para Fase 5):**
- `online-programs-sitemap.xml` (30 challenge-page), `store-products-sitemap.xml` (9), `store-categories-sitemap.xml` (7), `pricing-plans-sitemap.xml` (1), `pages-sitemap.xml` (6), `member-profiles_p_first-chunk-sitemap.xml` (vazio — sem leak de PII por sitemap).

**Robots.txt:** Allow `/`, Disallow `*?lightbox=`, `/_partials*`, `/pro-gallery-webapp/v1/galleries/*`. Bloqueia PetalBot.

---

## 9. Limitações

- **crt.sh** indisponível via Tor (429/502) — CT coverage complementada por certspotter (1 cert SAN = apex+www).
- **GCP buckets** inconclusivos (geo-block Tor) — necessitam re-teste sem Tor.
- **Google/GitHub code search** bloqueados (429/login) — dorks OSINT manuais pendentes.
- **WWW bloqueia Tor exit (403)** — fingerprint/extração de conteúdo Wix feita via conexão direta (mesma abordagem do coordenador), apex que não bloqueia mas 301→www.
- **DNS sem wildcard** — brute-force limitado a 5000 nomes (lista maior timeout); attack surface Wix naturalmente pequena.
- Breaches/emails não validados por falta de API keys (HIBP/DeHashed/Hunter/Intelx) — delegar a `osint`.

---

## 10. Próximos passos recomendados (Fase 3 — recon ativo)

1. **Wix APIs (HIGH PAYOFF):** fingerprint ativo dos endpoints Wix (`/_api/wix-ecommerce-storefront-web/`, `/_api/wix-bookings-web/`, `/_api/members/v1/`) — vazar schema, testar IDOR em pedidos/membros/agendamentos.
2. **Online Programs IDOR:** 30 `challenge-page/<UUID>` (UUIDs em `sm_online-programs.xml`) — testar acesso não-autorizado a conteúdo de cursos pagos.
3. **Payment request IDOR:** `/payment-request-page` — enumerar IDs de cobrança.
4. **Cursosead portal:** fingerprint do portal EAD (`/cursosead`) — auth bypass / acesso a material.
5. **Wix CVEs:** pesquisar CVEs Wix Stores/Bookings/Members para as revisões de apps (`wix_artifacts.txt`).
6. **Members area:** `/pricing-plans/plans-pricing`, login Wix Members — auth bypass, JWT, mass assignment.
7. **Bypass do bloq. Tor em www:** usar 2Captcha + UA real, ou proxy residencial, para enumeração ativa via www.
8. **OSINT aprofundado:** delegar a `osint` para validar 40 emails (SMTP RCPT) + verificar 17 pessoas em breaches + GitHub dorks manuais.
9. **Cloud:** delegar a `cloud` para re-teste GCP buckets sem Tor + naming com `cursoprepare`.
10. **DMARC ausente** — finding de hardening (baixo), documentar.

---

*Fase 2 concluída. Artefatos brutos em `/home/ubuntu/cursosprepare.com/recon/passive/`. Atualizar `PLAN.md` com vetores Wix priorizados.*
