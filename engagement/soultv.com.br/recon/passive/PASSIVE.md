# PASSIVE.md — Recon Passivo — soultv.com.br

> Fase 2 (AGENTS.md §5). Mapeamento da attack surface usando apenas fontes passivas
> (DNS, cert, wayback, OSINT, JS analysis). Probes HTTP leves (httpx tech-detect /
> leitura de endpoints públicos) realizados para fingerprint — sem exploração.
>
> Coordenador: `pentest` | Especialista: `recon-passive` | Data: 2026-08-27

---

## 1. Sumário executivo

- **Alvo:** `soultv.com.br` — plataforma de **TV online / streaming ao vivo** ("Soul TV — mais de 200 canais ao vivo no Brasil", filmes, esportes, séries, notícias). Negócio de IPTV/streaming.
- **Stack:** Frontend Angular SPA + backend **Node.js/Express** + **Firebase (GCP, project `tv-iteractiva`)** + **AWS serverless** (api gateway `prod-serverless`) + **Azure Blob Storage** (mídia) + **Cloudflare** (CDN/WAF/DNS/email) + **smartplay.pe/logicahost** (CDN HLS de vídeo).
- **43 subdomínios** enumerados, **34 vivos** (resolvem DNS). Maioria atrás de Cloudflare (proxy); **5 IPs de origem real** (fora CDN) identificados.
- **10 findings preliminares** (P-FIND-P01..P10) para as próximas fases, destacando: **API CMS sem auth + IDOR**, **Firebase config vazada + storage rules v1**, **Azure Blob mídia (leitura pública de objetos)**, **takeover candidate (GitHub Pages)**, **8 painéis admin Angular**, **IPs de origem real para bypass Cloudflare**.

## 2. DNS / WHOIS / e-mail

| Item | Valor |
|------|-------|
| Registrante | `RICARDO FRANCO DE GODOY EPP` (ME) — owner/tech-c NIC-br `RFGEP2` |
| Criado / Expira | 2018-08-14 / 2028-08-14 (changed 2025-08-16) |
| NS | Cloudflare (`irena`, `josh`) |
| MX | Cloudflare Email Routing (`route1/2/3.mx.cloudflare.net`) — sem mailbox própria |
| SPF | `v=spf1 include:_spf.mx.cloudflare.net ~all` (softfail) |
| DMARC | `p=none` (monitor only — **spoofing facilitado**, P-FIND-P09) |
| AXFR | negado (Cloudflare) |
| DKIM | não consultado (deixar para recon ativo se necessário) |
| TXT | 5 Google site-verification + 5 tokens opacos (MS365/Atlassian?) |

> WHOIS: rdap.registro.br / whois.nic.br bloqueiam exits Tor/datacenter (403 Nicbr-Permission-Denied). WHOIS obtido via whois.com. Detalhes em `osint_summary.md`.

## 3. Subdomínios

- **Total únicos:** **43** (`subdomains_all.txt`).
- **Vivos (resolvem):** **34** (`subdomains_live.txt`).
- **Fontes:** subfinder (31), assetfinder (34), amass passive (graph + 152 hosts via theHarvester), wayback CDX (históricos), JS bundles (`prod-serverless`, `media`), theHarvester.
- **Não resolvem (NXDOMAIN, históricos/deprecated):** `customer`, `umiss`, `beta`, `dev-cms`, `playerv`, `prod`, `stream`, `uploads`, e candidatos do theHarvester (`cfapi`, `cfapi3`, `appr`, `playerbeta`, `playerv3`, `liveads`, `video5`) — anotados em `osint_harvester_subs.txt` / `wayback_subdomains.txt` (validar em recon ativo via brute/vhost).
- **crt.sh:** indisponível (502 sobrecarga) — compensado por amass (passive inclui dados de cert).

### 3.1 IP de origem real (fora Cloudflare) — P-FIND-P06

| Host | IP | ASN/Owner | Serviço detectado |
|------|----|-----------|-------------------|
| `srt01.soultv.com.br` | 189.1.168.171 | 262287 Maxihost (BR) | SRT streaming (não HTTP) |
| `video.soultv.com.br` | 198.178.126.25 | 29802 HVC-AS (US) | streaming (não HTTP std) |
| `video01.soultv.com.br` | 34.95.200.150 | 396982 Google Cloud | streaming (não HTTP std) |
| `video02.soultv.com.br` | 160.202.130.243 | 18022 SMART-AS-AP | nginx/1.7.5, **401 Digest auth** |
| `testad.soultv.com.br` | 185.199.108-111.153 | GitHub Pages (Fastly) | CNAME `kevinzuniga.github.io` (**takeover candidate**, P-FIND-P04) |

Outros hosts (28) → Cloudflare proxy (104.26.10.237 / 104.26.11.237 / 172.67.72.183 / 2606:4700:20::*). IPs Cloudflare Spectrum (8.47.69.0/24, 8.6.112.0/24) também presentes para app/cms/dev-cms.

## 4. Tech stack por host (httpx tech-detect)

| Host | Status | Title | Tech |
|------|--------|-------|------|
| www.soultv.com.br | 200 | Soul TV...200 canais | Express, Node.js, Angular SPA, Firebase, GA, GTM, VWO, Cloudflare |
| app / web / stage / web-dev-ads | 200 | idem (mesmo app) | idem |
| pay.soultv.com.br | 200 | Soul TV | Firebase, HSTS, Cloudflare (Angular SPA, bundle exposto) |
| test-pay.soultv.com.br | 200 | Soul TV | idem |
| ppv.soultv.com.br | 200 | Soultvreports | Bootstrap, Firebase, HSTS (Angular BI) |
| reports.soultv.com.br | 200 | Soultvreports | idem |
| grade.soultv.com.br | 200 | SoulTv Grade CMS | Bootstrap, Cloudflare |
| interaction.soultv.com.br | 200 | SoulTV Interactions CMS | Bootstrap, Cloudflare |
| legendas.soultv.com.br | 200 | SoulTV Subtitles CMS | Bootstrap, Cloudflare |
| ads-policy.soultv.com.br | 200 | Soul TV - Ads Policy CMS | Cloudflare |
| tcommerce.soultv.com.br | 200 | TcommerceAdmin | Cloudflare (Angular) |
| tcommerce-test.soultv.com.br | 200 | TcommerceAdmin | Cloudflare |
| tv.soultv.com.br | 200 | (SPA) | AngularJS, Firebase 4.6.0, jQuery 2.2.4, GA, GTM |
| test-tv.soultv.com.br | 200 | (SPA) | AngularJS, Firebase 4.6.0, jQuery 2.2.4 |
| tv-dev-ads / tv-legacy | 200 | (SPA) | AngularJS, Firebase, jQuery 2.2.4 |
| cast.soultv.com.br | 200 | (200, 801b) | Cloudflare |
| cms.soultv.com.br | 404 root (API em /v1) | Not Found | Cloudflare (API) |
| player.soultv.com.br | 404 | — | Cloudflare |
| soultv.soultv.com.br | 404 | — | Cloudflare, HSTS |
| prod-serverless.soultv.com.br | 403 | Forbidden | **Cloudflare + AWS CloudFront** (api gateway) |
| media.soultv.com.br | 200 | (media objects) | Cloudflare (proxy p/ Azure Blob) |
| test-cms.soultv.com.br | (sem HTTP std) | — | Cloudflare (provável API/legado) |
| testad.soultv.com.br | 200 | IMA HTML5 Simple Demo | GitHub Pages (CNAME kevinzuniga.github.io) |
| video02.soultv.com.br | 401 | (Digest) | nginx/1.7.5 (real origin) |
| video / video01 / srt01 | (sem HTTP std) | — | streaming servers (real origin) |

### Favicon hashes (mmh3, prontos para Shodan correlation) — `favicon_hashes.txt`
- `www`/`app`: mmh3 `-194194531` (Soul TV brand favicon)
- `pay`: `-1591349269`
- CMS panels (`ads-policy`/`grade`/`interaction`/`legendas`/`ppv`/`tcommerce`): `-526407297` (provável favicon Angular/bootstrap comum)
- `cms`: `-909858089` | `tv`: `914564862`

## 5. Cloud — buckets / storage / takeover

- **Bucket naming variations `soultv*`**: 224 nomes × 5 providers (S3, GCP, Azure) — **0 públicos** (`cloud_buckets.txt`). Nenhum bucket `soultv-*` encontrado.
- **Firebase/GCP storage** `tv-iteractiva.appspot.com`: existe, regras **v1** (list bloqueado), objetos individuais 403 (auth). (P-FIND-P02)
- **Azure Blob** account `stsoultvbrs`, container `media`: **leitura pública de blobs individuais** (200); listagem de container 404. (P-FIND-P03)
- **Realtime DB** `tv-iteractiva.firebaseio.com`: 401 anônimo (seguro). 
- **Subdomain takeover candidate**: `testad.soultv.com.br` → CNAME `kevinzuniga.github.io` (GitHub Pages). (P-FIND-P04)

## 6. OSINT resumido (detalhe: `osint_summary.md`)

- Owner: **RICARDO FRANCO DE GODOY EPP** (ME). Empresa técnica/produto: **Iteractiva** (Firebase project `tv-iteractiva`).
- theHarvester: 152 hosts, **0 e-mails, 0 LinkedIn, 0 breaches** (sem API keys → coleta limitada a DNS/cert; BuiltWith/Censys/Shodan/HIBP/GitHub indisponíveis sem credenciais).
- GitHub: API 401 sem token. Search web exige login. Ponto de OSINT: usuário GitHub `kevinzuniga` (relacionado ao CNAME de testad).
- Limitação: rdap.registro.br e whois.nic.br bloqueiam exits Tor/datacenter.

## 7. Wayback highlights (`wayback_*.txt`, `wayback_unique.txt` = 2227 URLs)

- **WordPress 5.9.3 histórico** em www (2022): wp-admin, wp-login, Elementor, Essential Addons, ElementsKit, Exclusive Addons, Limit Login Attempts Reloaded. Atualmente removido (www = Angular SPA com catch-all que devolve index.html em qualquer path → **falsos positivos 200**). (P-FIND-P07)
- **Token de sessão vazado** (2022) em `cms.soultv.com.br/v1/init_session` (base64 `MDMfJzcgIlY3Qi0hOyI8Cl9BVUFTVkRYRlNFQX1cRFVCVFVE`, tv_id `devicep7t6dwzvjc`, is_anonymous true). (P-FIND-P01)
- `/login?ref=%2Fplayer%2Fchannel%2F...%2Fvideo%2F...` — app de streaming com player por canal/vídeo.
- `/forgetpassword` (2026-05-11, 200) — recuperação de senha do app atual.
- 173 JS files, endpoints `/v1/brand/290`, `/v1/categories`, `/v1/account`, `wp-json/wp/v2/pages/*`.
- Subdomínios históricos: `beta`, `dev-cms`, `playerv`, `prod`, `stream`, `uploads`, `customer`, `umiss` (NXDOMAIN hoje).

## 8. Findings preliminares (10) — ver `findings_preliminary.md`

| ID | Severidade est. | Resumo | Fase |
|----|----|--------|------|
| P-FIND-P01 | **Alta** | API cms.soultv.com.br/v1 sem auth + IDOR em /v1/brand/{id} (catálogo completo + URLs de streaming) | webapp/enum |
| P-FIND-P02 | **Alta** | Firebase config completa vazada em JS + storage rules v1 (projeto tv-iteractiva) | cloud/webapp |
| P-FIND-P03 | **Média** | Azure Blob `stsoultvbrs` container `media` leitura pública de objetos | cloud |
| P-FIND-P04 | **Alta** | Subdomain takeover candidate testad.soultv.com.br → kevinzuniga.github.io | cloud |
| P-FIND-P05 | **Alta** | 8+ painéis admin Angular (tcommerce/grade/interaction/legendas/ads-policy/ppv/reports/pay) + ambientes dev/test/stage | webapp/enum |
| P-FIND-P06 | **Alta** | 5 IPs de origem real (bypass Cloudflare) para recon ativo | recon-active |
| P-FIND-P07 | **Média** | WordPress histórico (5.9.3) — confirmar remoção; SPA catch-all gera falsos 200 | enum/webapp |
| P-FIND-P08 | **Média** | API gateway prod-serverless.soultv.com.br/v1 (Cloudflare+CloudFront, 403 sem auth) | webapp/enum |
| P-FIND-P09 | **Baixa** | DMARC p=none + SPF softfail → spoofing de @soultv.com.br facilitado | report |
| P-FIND-P10 | Info | JS bundles pay/ppv (2,9MB) com endpoints + chaves a extrair (pagamentos?) | enum |

## 9. Próximos passos recomendados (recon ativo / próximas fases)

1. **recon-active**: portscan completo (TODAS as portas) nos 5 IPs de origem real (srt01, video, video01, video02, + IPs Cloudflare Spectrum 8.47.69.0/8.6.112.0) — bypass Cloudflare; fingerprint SRT/RTMP/HLS; cred/brute no nginx Digest (video02); vhost discovery nos IPs de origem.
2. **cloud**: validar takeover `testad.soultv.com.br`/`kevinzuniga.github.io`; enumerar containers do Azure account `stsoultvbrs` (media, public, uploads, videos, backup, etc.); testar SAS leak/CORS/versões; validar Firebase Storage rules (upload, path traversal) via SDK; tentar auth anônima Firebase via SDK web.
3. **enum**: content discovery em cada painel Angular (rotas lazy-loaded), extrair TODOS os endpoints/keys dos bundles pay/ppv (pagamentos, JWTs), fuzz `/v1/*` em cms.soultv.com.br e prod-serverless; testar `/v1/account` IDOR com sessão anônima; enumerar `/v1/brand/1..N`.
4. **webapp**: auth bypass / default creds nos 8 painéis admin (foco em dev/test/stage: tcommerce-test, test-pay, test-cms, test-tv, stage, web-dev-ads, tv-dev-ads); IDOR/BOLA nas APIs de account/pagamentos/assinantes; JWT/firebase auth bypass; SSRF nas URLs de imagem/stream.
5. **osint** (delegar com API keys): configurar GITHUB_TOKEN + trufflehog/gitleaks nos repos "Iteractiva"/"Ricardo Franco de Godoy"/"soultv"; HIBP/DeHashed para breaches de e-mails `@soultv.com.br`; Shodan/Censys correlation via favicon hashes; LinkedIn (Ricardo Franco de Godoy).
6. Confirmar/remediar DMARC `p=none`.

## 10. Artefatos brutos gerados (`recon/passive/`)

DNS: `dns_ns.txt dns_mx.txt dns_txt.txt dns_dmarc.txt dns_a.txt dns_aaaa.txt dns_axfr_*.txt dns_root_any.txt dnsx_resolve.txt dnsx_final.txt`
WHOIS: `whois_com.html whois_nicbr.txt(0)`
Subdomínios: `subfinder.txt assetfinder.txt amass.txt(amass.err) crt.json crt_subs.txt(0) subdomains_all.txt subdomains_live.txt real_origin_ips.txt wayback_subdomains.txt osint_harvester_subs.txt`
Wayback: `wayback_all.txt wayback_cdx.txt wayback_subs.txt wayback_full.txt wayback_unique.txt wayback_admin.txt wayback_admin-cms.txt wayback_login.txt wayback_api.txt wayback_api-docs.txt wayback_config.txt wayback_js.txt wayback_sourcemap.txt`
httpx/tech: `httpx_live.txt httpx.err`
Favicon: `favicon_hashes.txt fav_*.ico`
JS: `js_bundles/* js_endpoints.txt`
Cloud: `cloud_buckets.txt cloud_buckets.log cloud_buckets.py`
Panels: `panel_*.html www_home.html www_wplogin.html www_wpusers.json`
OSINT: `osint_summary.md osint_harvester.log osint_harvester_hosts.txt osint_harvester_subs.txt gh_*.json ghsearch_*.html`
Consolidação: `PASSIVE.md findings_preliminary.md js_endpoints.txt`

## 11. Limitações

- crt.sh 502 (sobrecarga) — subdomínios de cert não coletados (compensado por amass passive).
- rdap.registro.br / whois.nic.br bloqueiam exits Tor/datacenter → WHOIS via whois.com.
- theHarvester sem API keys → e-mails/breaches/LinkedIn vazios; GitHub search 401 sem token.
- Shodan/Censys sem API key (favicon hashes prontos para correlation quando obtida).
- Origens reais (video/srt/video01) não respondem em HTTP/HTTPS std — portscan necessário em recon ativo.
- www SPA catch-all → content discovery em www terá alta taxa de falsos positivos (filtrar por conteúdo).
