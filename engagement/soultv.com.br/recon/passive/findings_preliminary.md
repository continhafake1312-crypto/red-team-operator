# Findings preliminares — Recon Passivo (soultv.com.br)

> Detalhes para validação nas próximas fases (webapp / cloud / enum). Não explorados além de read-only/probe leve.

## P-FIND-P01 — API CMS sem autenticação + IDOR em `cms.soultv.com.br/v1`
- Host: `https://cms.soultv.com.br` (atrás de Cloudflare)
- Endpoint `GET /v1/categories` → 200, lista categorias públicas (sem auth).
- Endpoint `GET /v1/init_session` → 200 `{"success":true,"data":"OK"}` (sem auth).
- Endpoint `GET /v1/brand/{id}` → **200 para múltiplos IDs** (1,2,3,4,5,100,200,289,290,291,292,293,295,300). Retorna: nome do canal, imagens, posição, `url_live_streaming` (HLS), `is_premium`, `category`, etc. → **IDOR / enumeração de catálogo completo sem auth**.
- Endpoint `GET /v1/account` → 401 (auth requerida) — endpoints autenticados existem (account/usuarios/pagamentos? mapear).
- Histórico (wayback 2022): resposta de `cms.soultv.com.br/v1/init_session` vazou **token de sessão** base64 `MDMfJzcgIlY3Qi0hOyI8Cl9BVUFTVkRYRlNFQX1cRFVCVFVE` + `tv_id=devicep7t6dwzvjc` + `is_anonymous:true`. Estrutura de sessão anônima → entender geração de token (possível fraqueza JWT/custom).
- **Ação webapp:** enumerar `/v1/brand/1..N`, `/v1/*` (content discovery na API), testar `/v1/account` IDOR com tokens anônimos, fuzz de parâmetros, verificar auth bypass.

## P-FIND-P02 — Firebase (GCP) config vazada em JS + storage rules v1
- Firebase Web Config completa extraída do bundle `pay.soultv.com.br` e `ppv.soultv.com.br`:
  - `apiKey: AIzaSyB0l9KbAzmvwoV31dD8Nr6P3FJfujc1Xcc`
  - `authDomain: tv-iteractiva.firebaseapp.com`
  - `databaseURL: https://tv-iteractiva.firebaseio.com` (Realtime Database)
  - `projectId: tv-iteractiva`
  - `storageBucket: tv-iteractiva.appspot.com` (Google Cloud Storage)
  - `messagingSenderId: 313933643044`
  - `appId: 1:313933643044:web:0ac6f0612ef37abe5947b1`
  - `measurementId: G-SNG4K1B767`
- Realtime DB `.json?shallow=true` → **401 Permission denied** (não está aberto — seguro em leitura anônima).
- Firebase Storage `firebasestorage.googleapis.com/v0/b/tv-iteractiva.appspot.com/o` → **400 "Listing objects disallowed for rules_version=1"** → bucket existe, regras v1 (antigas), list bloqueado. Objetos individuais = 403 (auth).
- `identitytoolkit.googleapis.com/v1/accounts:signUp?key=...` → **403** via REST (provável restrição de referer/IP no console). Testar com SDK Firebase JS (contexto web) na fase webapp.
- **Ação cloud/webapp:** tentar signUp/signIn via Firebase Web SDK real (do app legítimo), enumerar coleções Firestore/RTDB após auth anônima, validar rules de Firestore/Storage (upload, path traversal, ACL), verificar Storage CORS.

## P-FIND-P03 — Azure Blob Storage de mídia (leitura pública de objetos)
- Conta: `stsoultvbrs` (Azure Blob) — vazada via `cms.soultv.com.br/v1/brand/290`.
- Container `media` (e provavelmente outros) com **leitura anônima de blobs individuais** (200 em `media/brand/Kanuca_TV_100x100.png`, 61KB). Listagem de container (`?restype=container&comp=list`) = 404 (bloqueada).
- Espelhado por `media.soultv.com.br` (Cloudflare → mesmo storage): `media.soultv.com.br/media/brand/...` = 200.
- **Ação cloud:** mapear path structure via API cms (`/v1/brand/{id}` retorna paths), enumerar containers do account `stsoultvbrs` (media, public, uploads, videos, thumbnails, backup, etc.), testar upload/SAS leak, CORS do blob service, versões/ snapshots.

## P-FIND-P04 — Takeover candidate: `testad.soultv.com.br` (GitHub Pages)
- `testad.soultv.com.br` → **CNAME `kevinzuniga.github.io`** (GitHub Pages, IPs 185.199.108-111.153). HTTP 200 serve "IMA HTML5 Simple Demo" (página de teste de anúncios do Google).
- O repo `kevinzuniga.github.io` pertence a um terceiro (kevinzuniga). Se o projeto/owner do domínio não controla esse repo, há risco de **subdomain takeover** (CNAME dangling) — atacante que crie o repo/página poderia servir conteúdo arbitrário em `testad.soultv.com.br`.
- **Ação cloud:** validar se `kevinzuniga` é controlado pela empresa (relacionado a "test ads") ou se é CNAME órfão. Comparar com `kevinzuniga.github.io` (404 "There isn't a GitHub Pages site here" = takeover; 200 com conteúdo = em uso por terceiro = takeover igualmente crítico).

## P-FIND-P05 — Múltiplos painéis admin/CMS Angular expostos
Todos atrás de Cloudflare, todos Angular SPA (polyfills+main+runtime). Alvos de auth bypass/default creds/IDOR:
- `tcommerce.soultv.com.br` → "TcommerceAdmin" (TV commerce / ads admin)
- `grade.soultv.com.br` → "SoulTv Grade CMS" (grade de programação)
- `interaction.soultv.com.br` → "SoulTV Interactions CMS"
- `legendas.soultv.com.br` → "SoulTV Subtitles CMS" (legendas)
- `ads-policy.soultv.com.br` → "Soul TV - Ads Policy CMS"
- `ppv.soultv.com.br` & `reports.soultv.com.br` → "Soultvreports" (BI/reports)
- `pay.soultv.com.br` / `test-pay` → "Soul TV" (pagamento, Firebase)
- `cms.soultv.com.br` → 404 root (API only em /v1)
- `test-cms`, `tcommerce-test`, `test-pay`, `test-tv`, `stage`, `web-dev-ads`, `tv-dev-ads` → ambientes de **test/homolog/dev** (frequentemente menos protegidos que prod).
- **Ação webapp/enum:** content discovery em cada SPA (rotas Angular), extração de endpoints dos bundles JS (pay/ppv já mostraram cms.soultv.com.br/v1 e prod-serverless.soultv.com.br/v1), testar default creds, auth bypass, IDOR nas APIs.

## P-FIND-P06 — Origens reais (bypass Cloudflare) — para recon ativo
- IP de origem fora da CDN (não proxy Cloudflare):
  - `srt01.soultv.com.br` → 189.1.168.171 (Maxihost/BR) — servidor SRT
  - `video.soultv.com.br` → 198.178.126.25 (HVC-AS/US)
  - `video01.soultv.com.br` → 34.95.200.150 (Google Cloud)
  - `video02.soultv.com.br` → 160.202.130.243 (SMART-AS) — nginx 1.7.5 + **HTTP 401 Digest auth**
- IPs Cloudflare Spectrum (8.47.69.0/24, 8.6.112.0/24) associados a app/cms/dev-cms (proxy L4).
- **Ação recon ativo:** portscan completo nesses IPs de origem (bypass WAF/CDN), fingerprint serviços de streaming (SRT 1935, RTMP, HLS, HTTP), brute/cred default no nginx Digest (video02), vhost discovery nos IPs Cloudflare Spectrum.

## P-FIND-P07 — WordPress histórico (wayback) — validar se removido
- `www.soultv.com.br` foi **WordPress 5.9.3** em 2022 (wp-admin, wp-login, wp-json, plugins: Elementor, Essential Addons, ElementsKit, Exclusive Addons, Limit Login Attempts Reloaded). Atualmente `www` é Angular SPA (Express) e retorna o index.html para TODAS as rotas (catch-all) → wp-login/wp-admin/wp-json devolvem 200 mas é o SPA shell (200 false-positive).
- `/forgetpassword` (wayback 2026-05-11, 200) — rota do app atual de recuperação de senha.
- **Ação webapp:** confirmar WP removido; se subdomain legado WP ainda ativo (testar `prod`, `beta`, `dev-cms` que wayback mostrou), wpscan; explorar catch-all (alta taxa de falsos positivos — filtrar por conteúdo).

## P-FIND-P08 — API Gateway `prod-serverless.soultv.com.br` (Cloudflare + AWS CloudFront)
- `https://prod-serverless.soultv.com.br/v1/*` → 403 `{"message":"Forbidden"}` sem auth. Backend serverless (AWS). 
- Referenciado nos bundles pay/ppv como `https://prod-serverless.soultv.com.br/v1`.
- **Ação webapp/enum:** mapear rotas (via JS bundles), testar auth com tokens anônimos do app, fuzz de endpoints, CORS.

## P-FIND-P09 — DMARC permissivo (spoofing)
- DMARC `p=none` (apenas monitor). SPF `~all` (softfail). MX via Cloudflare (sem mailbox própria).
- **Ação:** phishing/spoofing de `@soultv.com.br` facilitado (fora do escopo técnico web, mas vale notar no relatório).

## P-FIND-P10 — JS bundles — endpoints/secrets a extrair (fase enum)
- Bundles obtidos: `pay` (main.d752450f2e7cf33c28c5.js, 865KB), `ppv` (main.3b1fdd29724d00e86269.js, 2.1MB), `tcommerce` (main-PCLEP4D7.js, 75KB), `tcommerce polyfills`.
- Já extraído: Firebase config, endpoints cms.soultv.com.br/v1 + prod-serverless.soultv.com.br/v1.
- **Ação enum:** deep string extraction nos 2 bundles grandes (pay/ppv) — rotas Angular, mapeamento completo de rotas de API, tokens hardcoded, outras chaves (Stripe/MercadoPago/PagSeguro/PayPal?), analytics IDs, feature flags.
