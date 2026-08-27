# Cloud Validation — soultv.com.br (especialista cloud)

> Fase: validação cloud (pós recon passivo). Date(UTC): 2026-08-27T04:35Z
> OPSEC: proxychains4 + Tor (exits rotacionados: 185.246.188.74, 86.54.28.49,
> 192.42.116.59/144/106). Nenhum artefato existente modificado. Canários não persistidos.

## Resumo de findings cloud

| ID | Severidade | Vetor | Confirmação | Evidência |
|----|-----------|-------|-------------|-----------|
| C-001 | **HIGH**   | Subdomain takeover / controle por terceiro (`testad.soultv.com.br` → `kevinzuniga.github.io`) | CONFIRMADO (repo público de terceiro controla conteúdo no subdomínio da soultv) | evidence/C-001.txt |
| C-002 | **MEDIUM** | Azure Blob `stsoultvbrs/media` leitura pública de blobs (sem list/sem write) | CONFIRMADO (não gravável) | evidence/C-002.txt |
| C-003 | **MEDIUM** | Firebase `tv-iteractiva` config vazada + Email/Password auth REST (cred-stuffing) | CONFIRMADO (anon OFF, RTDB/Storage secured, Firestore inconclusivo/Tor) | evidence/C-003.txt |

## Detalhe

### C-001 — Subdomain takeover (HIGH)
- `testad.soultv.com.br` CNAME → `kevinzuniga.github.io` (GitHub Pages, 185.199.108-111.153).
- HTTP 200 serve "IMA HTML5 Simple Demo" — conteúdo do repo `kevinzuniga/soultv-ima-test`
  (público, owner `kevinzuniga` = GitHub User terceiro, 12 repos em espanhol/LATAM).
- Repo tem `CNAME: testad.soultv.com.br`, pushed 2025-10-20 (coincide c/ `last-modified` HTTP).
- soultv **NÃO controla** o repo (conta GitHub `SoulTv` ≠ owner; org `soultv` = Not Found).
- Estado: **não open-claimable agora** (repo ativo serve 200), mas kevinzuniga controla 100%
  do conteúdo servido no subdomínio da soultv → phishing/malware em subdomínio legítimo.
- Vetor B: se repo/CNAME removido → vira 404 "There isn't a GitHub Pages site here" →
  dangling open-to-claim por qualquer atacante (precondition CNAME já aponta p/ github.io).
- Recomendação: remover o CNAME do DNS soultv; hospedar teste IMA em infra própria.
- NÃO claimado (per OPSEC).

### C-002 — Azure Blob mídia leitura pública (MEDIUM)
- Account `stsoultvbrs`; container `media` = anonymous BLOB READ (blobs 200 se path conhecido,
  ex.: `media/brand/Kanuca_TV_100x100.png` 200/61KB). List anônima 404 (access=Blob, não
  Container). PUT canário 404 (NÃO gravável → não escalou para Crítica). Account-level list 404.
- 29 containers candidatos testados (backups, uploads, static, public, videos, thumbnails,
  logs, config, …) → todos 404 (não enumeráveis anonimamente; Azure não vaza existence).
- CORS desabilitado (403). SAS/AccountKey NÃO vazados em JS bundles (pay/ppv/tcommerce/grade/www).
- Risco: assets de branding (logos de canais) acessíveis; paths vazam via CMS API pública
  `/v1/brand/{id}` (P01). Sem dados sensíveis confirmados em `media`. Sem dump completo (list off).
- Recomendação: tornar container private + servir via CDN/SAS temporária; auditar demais
  containers via portal Azure.

### C-003 — Firebase config vazada + cred-stuffing surface (MEDIUM)
- Project `tv-iteractiva`; apiKey `AIzaSyB0l9KbAzmvwoV31dD8Nr6P3FJfujc1Xcc` VÁLIDA (responde).
- **Anon auth OFF** (`ADMIN_ONLY_OPERATION` no signUp). **Email/Password auth ON + REST
  alcançável** (`INVALID_LOGIN_CREDENTIALS` no signInWithPassword) → brute-force /
  credential-stuffing via apiKey vazada, sem app/CAPTCHA. Contas lidadam com pagamentos →
  valor financeiro. Firebase rate-limit existe mas evadível c/ rotação de IP.
- RTDB 401 (secured). Storage: list 400 (rules v1), object read 403, upload 403 — secured.
- Firestore: 403 edge do Google sob Tor em 4 exits → INCONCLUSIVO. Provável default-deny;
  validar na fase webapp via Firebase Web SDK real (contexto pay/ppv, fora Tor).
- Recomendação: restringir apiKey a HTTP referrers soultv no GCP console; reCAPTCHA
  Enterprise / 2FA / lockout no login; upgrade Storage rules p/ v2 (defesa em profundidade).

## Naming variations re-confirmação (item #4)
- Recon passivo: 224 nomes × 5 providers = 0 públicos (cloud_buckets.txt).
- Spot-check (cloud): S3 `soultv*`/`tv-iteractiva` → 404 (403 p/ tv-iteractiva = existe p/ privado).
  GCP `soultv-com-br`/`soultv-media` 404 NoSuchBucket; `tv-iteractiva`/`soultv.appspot.com`/
  `stsoultvbrs`/`soultv-prod` 403 AccessDenied (existem, privados — não públicos). Firebase
  storage bucket `tv-iteractiva.appspot.com` já validado (C-003).
- Docker Registry v2: `prod-serverless.soultv.com.br/v2/_catalog` 403 (auth required),
  `registry.soultv.com.br` não resolve (000). Sem registry anônimo.
- **Conclusão: nenhum bucket público adicional além do Azure `media` (já em C-002).**

## Limitações / próximos passos
- Firestore não validável via Tor (edge block). → Delegar webapp: testar Firestore via
  Firebase Web SDK real a partir de pay.soultv.com.br / ppv.soultv.com.br (legítimo, fora Tor).
- Azure: containers além de `media` não enumeráveis anonimamente — só auditáveis com credencial
  da conta (fora de escopo black-box).
- Firebase apiKey: testar se está referrer-restricted (testar signIn c/ referer estranho p/
  diferenciar `API_KEY_HTTP_REFERRER` de `INVALID_LOGIN_CREDENTIALS`) — recomendado webapp.
