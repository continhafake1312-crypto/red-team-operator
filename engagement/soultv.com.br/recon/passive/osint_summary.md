# OSINT — soultv.com.br

## Domínio / WHOIS
- **Registrante (owner):** `RICARDO FRANCO DE GODOY EPP` (ME/EPP — pessoa jurídica microempresa)
- **owner-c / tech-c:** `RFGEP2` (NIC.br handle) — mesmo contact para owner e tech
- **created:** 2018-08-14  **changed:** 2025-08-16  **expires:** 2028-08-14  **status:** published
- **NS:** `irena.ns.cloudflare.com`, `josh.ns.cloudflare.com` (Cloudflare DNS + CDN + proxy)
- **MX:** Cloudflare Email Routing (`route1/2/3.mx.cloudflare.net`) — não há servidor de e-mail próprio; roteamento via Cloudflare
- **SPF:** `v=spf1 include:_spf.mx.cloudflare.net ~all` (~all = softfail, permissivo)
- **DMARC:** `v=DMARC1; p=none; rua=mailto:dmarc@soultv.com.br; ruf=mailto:dmarc@soultv.com.br` (**p=none = monitor only, sem enforcement** — spoofing de e-mail do domínio possível)
- **Google site-verification:** 5 tokens no TXT (consome múltiplas contas Google Search Console)
- **TXT estranhos:** 5 strings opacas (`37ddggmrgc3ja5lskqtutd7dv8`, etc.) — provavelmente verification tokens de serviços (MS365, Atlassian, etc.)
- **AXFR:** negado nos dois NS Cloudflare (esperado)

> WHOIS obtido via whois.com (registro.br / RDAP rdap.registro.br bloqueia IPs datacenter/Tor — Nicbr-Permission-Denied 403).

## Empresa / Negócio
- **Negócio confirmado:** Plataforma de **TV online / streaming ao vivo** ("Soul TV — TV online grátis: mais de 200 canais ao vivo no Brasil", filmes, esportes, séries, notícias). Possivelmente IPTV/IPTV-like.
- **Backend / projeto:** Firebase project **`tv-iteractiva`** → empresa técnica por trás do produto é **"Iteractiva"** (tv-iteractiva.firebaseio.com / tv-iteractiva.appspot.com / authDomain tv-iteractiva.firebaseapp.com, messagingSenderId 313933643044, appId 1:313933643044:web:0ac6f0612ef37abe5947b1, GA G-SNG4K1B767).
- **Responsável:** Ricardo Franco de Godoy (EPP).

## Pessoas
- **Ricardo Franco de Godoy** — proprietário/contato técnico (WHOIS). Pessoa física/EPP.
- (theHarvester: 0 e-mails, 0 LinkedIn, 0 breaches nos módulos que rodam sem API key).

## E-mails (candidates, não confirmados como existentes)
- `dmarc@soultv.com.br` (do registro DMARC — endereço de relato, possível mailbox monitorado)
- Padrão corporativo provável: `ricardo@soultv.com.br`, `contato@soultv.com.br`, `suporte@soultv.com.br` (não validados — validação de SMTP em recon ativo, com cautela)

## Breaches
- theHarvester não retornou breaches (sem HIBP/DeHashed key). Deixar anotado para OSINT especializado com credenciais de API.

## GitHub
- Busca por código no GitHub API retorna **401** (sem token GITHUB_TOKEN configurado). Search web retorna SPA shell (login exigido para code search).
- Recomendação: configurar `GITHUB_TOKEN` e rodar `github-dorks` + `trufflehog`/`gitleaks` nos repos de "Iteractiva" / "Ricardo Franco de Godoy" / "soultv".
- Encontrado via JS: usuário do GitHub `kevinzuniga` (dono de `kevinzuniga.github.io`, alvo do CNAME `testad.soultv.com.br`) — desenvolvedor possivelmente relacionado ao projeto (test ads). Ponto de OSINT.

## Hosting / Infra (mapeado via DNS + amass + httpx)
- **CDN/WAF:** Cloudflare (proxy ativo na maioria dos hosts). 
- **Cloud app backend:** Firebase (GCP) — projeto tv-iteractiva.
- **API gateway:** `prod-serverless.soultv.com.br` → Cloudflare + AWS CloudFront + (backend serverless AWS). Retorna 403 sem auth.
- **Media storage:** Azure Blob Storage account `stsoultvbrs` (container `media`) + `media.soultv.com.br` (Cloudflare na frente do storage).
- **Streaming HLS:** CDN `smartplay.pe` (account `cdn-tiva-video08-logicahost-com-br`) — provedora de vídeo = LogicaHost (logicahost.com.br).
- **Origens reais (não-Cloudflare):**
  - `srt01.soultv.com.br` → 189.1.168.171 (ASN 262287 — Maxihost Hospedagem de Sites Ltda, BR) — servidor SRT de streaming
  - `video.soultv.com.br` → 198.178.126.25 (ASN 29802 — HVC-AS, US)
  - `video01.soultv.com.br` → 34.95.200.150 (ASN 396982 — Google Cloud)
  - `video02.soultv.com.br` → 160.202.130.243 (ASN 18022 — SMART-AS-AP, BD/US) — nginx/1.7.5, HTTP 401 Digest auth

## Limitações
- rdap.registro.br e whois.nic.br bloqueiam exits Tor/datacenter (WHOIS obtido via whois.com).
- crt.sh retornando 502 (sobrecarga) — subdomínios via certificados não coletados; compensado por amass (Passive/alterações) + subfinder + assetfinder + wayback.
- theHarvester sem API keys (BuiltWith/Hunter/HIBP/DeHashed/SecurityTrails/Censys/Shodan/GitHub) → coleta limitada a fontes livres (DNS, cert). Recomenda-se configurar API keys para OSINT profundo.
- GitHub code search indisponível sem token.
- Shodan/Censys não usados (sem API key). Favicon hashes (mmh3) já calculados e prontos para correlation Shodan.
