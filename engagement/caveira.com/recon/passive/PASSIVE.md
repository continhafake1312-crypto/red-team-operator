# PASSIVE.md — Recon Passivo + OSINT — caveira.com

**Engagement:** caveira.com
**Fase:** 2 (Recon Passivo + OSINT)
**Data:** 2026-08-27 (UTC)
**Operador:** recon-passive (subagente)
**OPSEC:** Tor ativo (socks5 127.0.0.1:9050). IP Tor confirmado: `150.40.127.65` (não o IP real). Todos os probes ativos ao alvo via `proxychains4`. Fontes externas (crt.sh, wayback, theHarvester, GitHub API) consultadas passivamente.

---

## 1. Resumo do Domínio (WHOIS / DNS / Infra)

| Campo | Valor |
|-------|-------|
| Domínio | caveira.com |
| Registrar | GoDaddy.com, LLC |
| WHOIS Server | whois.godaddy.com |
| Registry Expiry | 2033-04-19 (registro de longo prazo) |
| Updated | 2026-04-16 |
| Status | clientDelete/Renew/Transfer/Update Prohibited |
| Registrant | REDACTED (WHOIS privacy) |
| NS | elmo.ns.cloudflare.com, zelda.ns.cloudflare.com (Cloudflare) |
| MX | mx364.umbler.com, mx128.umbler.in, mx783.umbler.com.br, mx240.umbler.co.uk (Umbler/RedeHost) |
| Email hosting | Umbler (RedeHost AS53057, BR) |
| A (apex) | 104.26.5.188, 104.26.4.188, 172.67.74.203 (Cloudflare CDN) |
| AAAA (apex) | 2606:4700:20::ac43:4acb, ::681a:4bc, ::681a:5bc (Cloudflare) |
| DMARC | (não encontrado / não configurado) |
| AXFR | Negado em ambos NS (esperado, Cloudflare) |

**Infra:** Site principal atrás de Cloudflare CDN. Email hospedado na Umbler (BR). Stack WordPress + Elementor + PHP/MySQL. Marca "Projeto Caveira" / "Caveira Pass" — serviço de streaming/pass.

**Entity relacionada (OSINT):** `soultv.com.br` (SoulTV) — mesma marca/infraestrutura (encontrada via amass graph). Usa Cloudflare NS (irena, josh) + Cloudflare MX. Múltiplos subdomínios (cms, app, pay, panel, player, video01/02, srt01, etc.). **Priorizar como alvo secundário/relacionado.**

---

## 2. Subdomínios — Enumeração Exaustiva

**Fontes:** subfinder, assetfinder, amass (passive), theHarvester, wayback (gau + CDX API). crt.sh indisponível no momento (timeout).

**Total únicos:** 14 subdomínios de `caveira.com` (+ 2 não-resolvente do theHarvester: appva, homo).

### 2.1 Subdomínios vivos (httpx — 11 vivos de 14)

| Subdomínio | Status | IP (origem real) | CDN | Título | Tech stack |
|------------|--------|------------------|-----|--------|------------|
| caveira.com | 200 | 104.26.4.188 | Cloudflare | Caveira Pass - Projeto Caveira | WordPress 7.1, Elementor 4.2.2, Yoast SEO 28.3, Site Kit 1.186.0, PHP, MySQL, GTM, Adobe Fonts, Swiper, jQuery 3.7.1 |
| www.caveira.com | — | (não resolve) | — | — | (NXDOMAIN/apex redirect) |
| aplicativo.caveira.com | 200 | 172.67.74.203 | Cloudflare | Projeto Caveira | Cloudflare, Netlify, jsDelivr |
| app.caveira.com | 200 | 54.232.119.62 | — (Netlify direto) | Projeto Caveira | HSTS, Netlify, jsDelivr |
| app2.caveira.com | 200 | 162.159.140.98 | Cloudflare (front) | Projeto Caveira | AWS, Cloudflare Bot Mgmt, HTTP/3, jsDelivr (CNAME DigitalOcean App Platform) |
| plataforma.caveira.com | 200 | 54.232.119.62 | — (Netlify) | Projeto Caveira | HSTS, Netlify, jsDelivr |
| panel.caveira.com | 200 | 54.232.119.62 | — (Netlify) | **Painel Caveira** | HSTS, Netlify |
| panel-homo.caveira.com | 404 | 104.26.4.188 | Cloudflare | — | Cloudflare, Netlify (via proxy) |
| homologacao.caveira.com | (sem httpx 200, A=CF) | 104.26.4.188 | Cloudflare | — | (CF proxy) |
| skull.homo.caveira.com | **404** | 54.232.119.62 | — (Netlify) | — | Netlify — **TAKEOVER CANDIDATE** |
| stape.caveira.com | 400 | 34.95.159.178 | — (Google/Stape.io) | — | Google (Stape.io server-side GTM) |
| loja.caveira.com | 200 | 185.133.35.21 | Cloudflare (Loja Nuvem) | Loja online de Projeto Caveira | Cloudflare Bot Mgmt, Browser Insights, HSTS |
| teste.caveira.com | 200 | **165.227.4.115** | **NENHUMA (IP direto DO)** | Teste | **Apache 2.4.58, WordPress 7.1, Elementor 3.32.2, PHP, MySQL, Ubuntu** |
| api.homo.caveira.com | — | (não resolve) | — | — | NXDOMAIN |

### 2.2 IPs de origem real descobertos (fora de CDN)
- **teste.caveira.com → 165.227.4.115** (DigitalOcean droplet direto, SEM Cloudflare) — **ALVO PRIORITÁRIO** para recon ativo (bypass de WAF/CDN implícito).
- app.caveira.com / plataforma.caveira.com / panel.caveira.com / skull.homo → 54.232.119.62 (Netlify AWS SA-EAST-1)
- stape.caveira.com → 34.95.159.178 (Google Cloud / Stape.io)

### 2.3 Favicon hashes (mmh3, para Shodan correlation)
- caveira.com: 0 (default/empty)
- panel.caveira.com / app.caveira.com / aplicativo.caveira.com: **23476686** (Netlify app favicon — mesmo app)
- loja.caveira.com: 839520333
- teste.caveira.com: 0

---

## 3. Cloud Buckets

S3 (20 variações de naming: caveira, caveira-com, projetocaveira, caveira-pass, caveira-backup, caveira-assets, etc.) e Azure Blob (caveira, projetocaveira, caveirapass) consultados.
**Resultado:** Nenhum bucket público existente (todos `NoSuchBucket` / vazio).

Nenhum bucket S3/Azure/GCP exposto encontrado via naming variations.

---

## 4. Takeover Candidates

| Subdomínio | CNAME | Status | Veredicto |
|------------|-------|--------|-----------|
| **skull.homo.caveira.com** | strong-naiad-3ab1bd.netlify.app | 404 "Not Found" direto Netlify | **ALTO — validar claim do site Netlify** |
| panel-homo.caveira.com | panel-caveira-com.netlify.app (via CF proxy) | 404 | Baixo (proxied Cloudflare) |
| app.caveira.com | app-caveira-com.netlify.app | 200 | Não vulnerável (claimado) |
| plataforma.caveira.com | app-caveira-com.netlify.app | 200 | Não vulnerável |
| panel.caveira.com | panel-caveira-com.netlify.app | 200 | Não vulnerável ("Painel Caveira") |
| app2.caveira.com | orca-app-aznfk.ondigitalocean.app | 200 | Não vulnerável |
| loja.caveira.com | projetocaveira.lojavirtualnuvem.com.br | 200 | Não vulnerável (SaaS) |
| stape.caveira.com | saf.stape.io | 400 | SaaS gerenciado |

**Priorizar:** `skull.homo.caveira.com` → tentar claim `strong-naiad-3ab1bd` no Netlify (fase ativa/cloud).

---

## 5. OSINT Highlights

### Empresa / Marca
- **Projeto Caveira / Caveira Pass** — serviço de streaming/pass ("Tudo em um só lugar!").
- **Entidade relacionada:** `soultv.com.br` (SoulTV) — mesma marca/infra. Múltiplos subdomínios (cms, app, pay, panel, player, video01/02, srt01, grade, ppv, cast, legendas, web, reports, etc.).

### Pessoas / Usuários
- **WordPress authors (caveira.com)** via wayback: `leotavares`, `lionstone` — enumeração de usuários WordPress confirmada (fase ativa: brute-force/credential stuffing direcionado).
- **Desenvolvedor:** `kevinzuniga` (GitHub) — `testad.soultv.com.br` CNAMEa para `kevinzuniga.github.io`; repo `kevinzuniga/soultv-ima-test`.
- `staycanuca` (GitHub) — `repository.soultv`.

### Emails
- Nenhum email público encontrado (WHOIS redacted, wayback das páginas contato/sobre não expuseram emails). Padrões prováveis: `contato@caveira.com`, `@soultv.com.br`.

### GitHub
- Repos "Projeto Caveira": `WesleyBdD/projeto-caveiraa`, `SilassMoura/Projeto-Caveira`, `monteiromkd/Vercel` (Projeto Caveira Infernal), `silvaeverson153-sketch/Projeto-Caveira-2026`. (Maioria parecem projetos pessoais não-oficiais.)
- Repos soultv: `kevinzuniga/soultv-ima-test`, `staycanuca/repository.soultv`, `JulioCesarXY/EPG-SOULTV`, `Salty876/soultv`.
- **GitHub code search exige auth** — secret dorks (`caveira password/api_key/token`) não executados. Recomendado: `trufflehog`/`gitleaks` nos repos acima + auth GitHub para code search.

### Breaches
- Sem emails confirmados para consultar HIBP. theHarvester: 0 emails.

---

## 6. Wayback Highlights

**Total de URLs:** 2160 (gau 1962 + CDX API 2153, dedupe). 201 paths únicos, 296 arquivos JS.

### Endpoints/paths interessantes
- **WordPress admin:** `/wp-admin/`, `/wp-admin/admin-ajax.php`, `/wp-admin/authorize-application.php`, `/wp-login.php` (implícito), `/wp-admin/css/login.min.css`, `/wp-admin/js/user-profile.min.js`, `/wp-admin/js/password-strength-meter.min.js`
- **Login custom:** `/login/`, `/login/login-4.css`, `/login/login-general.js`
- **WP REST:** `/wp-json/` (implícito — user enum via `/wp-json/wp/v2/users`)
- **Plugins WP detectados (via wayback paths):**
  - `elementor-pro` (versão assets 5.5.7, bundle hashes)
  - `click-to-chat-for-whatsapp` (plugin — possível vetor)
  - `site-kit-by-google` (1.186.0)
  - `yoast-seo` (28.3)
- **well-known:** `/.well-known/security.txt`, `/.well-known/openid-configuration`, `/.well-known/nodeinfo`, `/.well-known/assetlinks.json`, `/.well-known/ai-plugin.json` — investigar conteúdo (active phase)
- **Marketing/tracking:** `stape.caveira.com` (Stape.io server-side GTM), Google Tag Manager, fbclid/gclid params
- **Loja:** `loja.caveira.com` (Loja Nuvem e-commerce)
- **App:** `app.caveira.com`, `plataforma.caveira.com` (Netlify SPA "Projeto Caveira")
- **Painel:** `panel.caveira.com` ("Painel Caveira" — login do app)
- Params vazados: `?or=`, `?fbclid=`, `?gad_source=`, `?gclid=`, `?j=` — param mining em fase de enum.

---

## 7. Ranking Preliminar de Hosts (por interesse/payoff)

| Rank | Host | Porquê | Payoff |
|------|------|--------|--------|
| 1 | **teste.caveira.com** (165.227.4.115) | WordPress direto sem CDN/WAF, IP real exposto, test server (provavelmente menos hardened) | **ALTO** — RCE WP/plugin, foothold direto |
| 2 | **panel.caveira.com** ("Painel Caveira") | Painel de login do app Caveira Pass — auth bypass/default creds/IDOR → acesso a contas/usuários | **ALTO** — ATO, dados/PII |
| 3 | **caveira.com** (WordPress 7.1) | Site principal WP + Elementor + múltiplos plugins; user enum (leotavares, lionstone); /wp-admin exposto | **ALTO** — WP RCE, plugin CVEs |
| 4 | **app.caveira.com / plataforma.caveira.com** | SPA Netlify "Projeto Caveira" — API backend, JS analysis, IDOR/BOLA | **ALTO** — API, dados |
| 5 | **loja.caveira.com** | E-commerce Loja Nuvem — pay/financeiro | **MÉDIO** — info disclosure |
| 6 | **skull.homo.caveira.com** | Takeover candidate Netlify (404) | **MÉDIO** — takeover (validar) |
| 7 | **aplicativo.caveira.com** | App mobile/landing (Netlify via CF) | **MÉDIO** — JS/IDOR |
| 8 | **app2.caveira.com** | DigitalOcean App Platform (orca) | **MÉDIO** — API/backend |
| 9 | **panel-homo.caveira.com** | Painel homolog (404 via CF) | **BAIXO** — enumeração |
| 10 | **homologacao.caveira.com** | Homologação (CF proxy) | **BAIXO** — vhosts |
| 11 | **stape.caveira.com** | Stape.io GTM (3rd party) | **BAIXO** — info |
| 12 | **soultv.com.br** (+subdomínios) | Entidade relacionada — expandir escopo se autorizado | **ALTO** (se no escopo) |

---

## 8. Limitações da Fase Passiva

- **crt.sh** indisponível (timeout 522) — subdomínios podem estar subenumerados. Repetir quando serviço estabilizar.
- **GitHub code search** exige autenticação — dorks de secret não executados.
- **Emails** não expostos publicamente (WHOIS privacy + wayback sem leaks).
- **Shodan/Censys** sem API key configurada — favicon hashes preparados para lookup futuro.
- **Cloud buckets** apenas naming variations (sem enumeração de IAM keys vazadas — necessário OSINT de commits GitHub).
- Alguns subdomínios (www, api.homo, appva, homo) não resolvem (NXDOMAIN/sem A).

---

## 9. Próximos Passos Recomendados (Fase 3 — Recon Ativo)

1. **Portscan + fingerprint** em `165.227.4.115` (teste.caveira.com) — IP direto, prioridade máxima. nmap -sV -sC todas as portas.
2. **Portscan** nos IPs Netlify/AWS (54.232.119.62, 162.159.140.98) — confirmar serviços expostos.
3. **WordPress enum ativa** em caveira.com e teste.caveira.com: `wpscan --url ... --enumerate u,p,t` (usuários leotavares/lionstone já conhecidos).
4. **Vhost enumeration** via Cloudflare (caveira.com apex e demais) — ffuf Host header.
5. **WAF detection** (`wafw00f`) em caveira.com / aplicativo.caveira.com (Cloudflare).
6. **TLS scan** (nmap ssl-cert, ssl-enum-ciphers) nos hosts diretos.
7. **Validar takeover** skull.homo.caveira.com → claim Netlify `strong-naiad-3ab1bd`.
8. **Delegar cloud** para validação de takeover + DigitalOcean App Platform fingerprint.
9. **Consolidar** entity soultv.com.br — se no escopo, enumeração própria.

---

## 10. Artefatos Produzidos (recon/passive/)

| Arquivo | Descrição | Tamanho |
|---------|-----------|--------|
| dns_full.txt | WHOIS + DNS records + amass graph | 388 linhas |
| sub_subfinder.txt | subfinder raw | 12 |
| sub_assetfinder.txt | assetfinder raw | 11 |
| sub_amass.txt | amass graph (caveira + soultv) | 297 |
| sub_crtsh.txt | crt.sh (vazio - timeout) | 0 |
| subdomains_all.txt | subdomínios únicos consolidados | 16 |
| subdomains_resolved.txt | dnsx resolved (A/AAAA/CNAME) | 49 |
| subdomains_live.txt | httpx live hosts + tech detect | 11 |
| techstack.txt | httpx + whatweb + favicon hash | 23 |
| cloud_buckets.txt | S3/Azure probing | 61 |
| wayback_gau.txt | gau raw | 1962 |
| wayback_api.txt | CDX API raw | 2153 |
| wayback_all.txt | wayback consolidado | 2160 |
| wayback_paths.txt | paths únicos | 201 |
| wayback_js.txt | arquivos JS | 296 |
| wayback_html.txt | URLs HTML (sample) | 50 |
| osint_harvester_raw.txt | theHarvester output | 264 |
| osint_emails.txt | emails (vazio) | 0 |
| osint_people.txt | pessoas/empresa | 19 |
| osint_github.txt | repos GitHub | 17 |
| osint_github_repos.txt | repos raw | — |
| osint_breaches.txt | breaches/creds | 9 |
| osint_wpusers.txt | WP users | 2 |
| takeover_candidates.txt | análise takeover | 42 |
| **PASSIVE.md** | este documento | — |

---

*Fase 2 concluída. Aguardando delegação para Fase 3 (recon ativo).*
