# ACTIVE.md — Recon Ativo — soultv.com.br

> Fase 3 (AGENTS.md §5). Fingerprint ativo (rate-limited, stealth via Tor/proxychains4) da attack surface.
> Especialista: `recon-active` | Coordenador: `pentest` | Data: 2026-08-27
>
> **OPSEC:** TODOS os scans/probes via `proxychains4` → Tor (exits: 45.66.35.38/NL, 192.42.116.16, 185.220.100.243). IP real do operador NUNCA usado contra o alvo. Rate limiting, UA rotativo, não-destrutivo (login FTP anônimo apenas confirmado; nenhum brute/escrita).

---

## 1. Sumário executivo

- **5 IPs de origem real** (fora Cloudflare) reconfirmados; **4 escaneados** (testad = GitHub Pages, delegado ao especialista cloud — não re-scaneado).
- **Origem mais valiosa: `video02.soultv.com.br` (160.202.130.243)** = **Wowza Streaming Engine 4.8.0** + **nginx/1.7.5** (2014, antigo) expondo:
  - **Wowza Engine Manager (8088)** — UI admin (Spring Security login) → cred-brute candidate.
  - **Wowza REST API (8087, Restlet-Framework/2.2.2)** — Digest → cred-brute + info disclosure candidate.
  - **FTP anônimo (21, Pure-FTPd [privsep][TLS])** — **login anônimo permitido** (`Any password will work`) → **HIGH**.
  - HTTP providers (80/443/554/1935) com nginx/1.7.5 + Digest realm "Wowza Media Systems".
  - TLS cert (443) CN=`video06.logicahost.com.br` (Let's Encrypt) → vaza hoster **LogicaHost**.
  - CORS misconfig: `Access-Control-Allow-Origin: *` + `Allow-Credentials: true` em todos os providers.
- **srt01 (189.1.168.171)**: **OpenSSH 8.2p1 Ubuntu-4ubuntu0.13** + RTMP 1935.
- **video (198.178.126.25)** e **video01 (34.95.200.150 / GCP)**: sem portas TCP abertas no range testado (firewalled; **SRT/UDP-only** — UDP não scanneável via Tor socks).
- **29 hosts web Cloudflare-fronted** fingerprintados (httpx): todos atrás de **Cloudflare WAF**; `prod-serverless` também atrás de **Cloudfront (AWS)**. TLS edge com **3DES/SWEET32** e **TLS 1.0/1.1** habilitados (grade **C**).
- **8+ painéis admin Angular** reconfirmados vivos (tcommerce/grade/interaction/legendas/ads-policy/ppv/reports/pay) + ambientes dev/test/stage. `test-cms` = **522** (origem Cloudflare indisponível).
- **CVE candidates** priorizados para `cve`: nginx 1.7.5, Wowza 4.8.0, Restlet 2.2.2, Pure-FTPd (anon), OpenSSH 8.2p1 (regreSSHion CVE-2024-6387).

## 2. Hosts de origem real (fora CDN) — serviços/versões

| Host | IP | ASN | Portas TCP abertas | Serviços/versões | Finding-chave |
|------|----|-----|--------------------|------------------|---------------|
| `video02.soultv.com.br` | 160.202.130.243 | 18022 SMART-AS-AP | 21,80,443,554,1935,8084,8087,8088 | **Wowza SE 4.8.0**, **nginx/1.7.5**, Pure-FTPd, Restlet 2.2.2 | FTP anônimo + Engine Manager + REST API (A-FIND-01/02/03) |
| `srt01.soultv.com.br` | 189.1.168.171 | 262287 Maxihost BR | 22,1935 | OpenSSH 8.2p1 Ubuntu-4ubuntu0.13; RTMP | SSH cred-brute/regreSSHion (A-FIND-06) |
| `video.soultv.com.br` | 198.178.126.25 | 29802 HVC-AS US | (nenhuma TCP) | firewalled; SRT/UDP streaming | apenas UDP — não explorável via TCP |
| `video01.soultv.com.br` | 34.95.200.150 | 396982 Google Cloud | (nenhuma TCP) | firewalled (GCP firewall); SRT/UDP | apenas UDP |
| `testad.soultv.com.br` | 185.199.108-111.153 | GitHub Pages | — | CNAME `kevinzuniga.github.io` | takeover candidate (P-FIND-P04 → cloud) |

> **Limitação TCP-UDP:** SRT/HLS usam UDP; scan UDP através de socks Tor não é viável (sem raw sockets). video/video01 permanecem como streaming-only, baixo payoff para exploração direta.

## 3. Detalhe — video02 (160.202.130.243) — Wowza Streaming Engine

### 3.1 Porta 8088 — Wowza Streaming Engine Manager (A-FIND-01)
- `GET /enginemanager/` → 302 → `/enginemanager/ftu/welcome.htm` (200, 5332B) → `/enginemanager/login.htm` (200, 8617B).
- Login form Spring Security: `POST j_spring_security_check`, campos `j_username`/`j_password`, `authType` ∈ {digest, basicAuth}, `host` (permite apontar manager p/ outro servidor Wowza — possível SSRF/abuso).
- Headers de segurança presentes (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection). Cookie `JSESSIONID` HttpOnly.
- Copyright "2007–2020 Wowza Media Systems". Favicon mmh3 = `-1756699139` (Shodan correlation p/ localizar outras instâncias Wowza).
- **Cred default/brute candidate** (admin/admin testado → 401; não é default, mas brute/dictionary via webapp/exploit).

### 3.2 Porta 8087 — Wowza REST API v2 (A-FIND-02)
- `Server: Restlet-Framework/2.2.2`. Resposta 401 em XML: `<error><wowzaServer>4.8.0</wowzaServer><code>401/>...`.
- `WWW-Authenticate: Digest realm="Wowza"`. Auth Basic OU Digest aceitos.
- Endpoints REST v2 (requerem auth): `/v2/servers`, `/v2/servers/_defaultServer_/status`, `/v2/servers/_defaultServer_/vhosts`, `/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications`.
- CORS: `Access-Control-Allow-Origin: *` + `Allow-Credentials: true` + métodos OPTIONS/GET/PUT/DELETE/POST → se creds obtidas, leitura/escrita de config de servidor (applications, streams, transmissões) via browser cross-origin.
- **Wowza 4.8.0** → CVE research (path traversal em REST API histórico, info disclosure, possíveis RCE em managers antigos).

### 3.3 Porta 21 — Pure-FTPd anônimo (A-FIND-03)
- Banner: `220---------- Welcome to Pure-FTPd [privsep] [TLS] ----------` (server port 21, 50 users max, 15min idle).
- `USER anonymous` / `PASS <qualquer>` → **`230 Anonymous user logged in / Any password will work`**.
- CWD `/` (root). Listagem via PASV/EPSV através de Tor socks instável (conexão de dados não completou de forma confiável) — root aparenta vazio, mas **enumeração profunda deve ser feita por especialista network/exploit** com cliente FTP socks-capable (lftp/curl com socks) ou via circuito não-Tor autorizado.
- **Risk:** se write habilitado, upload de conteúdo/abuso de storage; se houver dirs acessíveis, leak de mídia/configs/recordings.
- Pure-FTPd [privsep][TLS] → CVE research (CVE-2017-... pure-ftpd histórico).

### 3.4 Portas 80/443/554/1935 — HTTP providers (Wowza/ nginx 1.7.5)
- `Server: nginx/1.7.5` (lançado 2014 — extremamente antigo). `WWW-Authenticate: Digest realm="Wowza Media Systems"`.
- TLS (443): cert **CN=video06.logicahost.com.br**, SAN apenas esse nome, **Let's Encrypt** (YE1, ECDSA, vál. 2026-08-25 → 2026-11-23). Vaza hoster **LogicaHost** (confirma CDN HLS "logicahost" do recon passivo). vhost `Host: video06.logicahost.com.br` → 401 (servidor responde por esse nome).
- nginx 1.7.5 → CVE research (CVE-2014-813, CVE-2015-... range, buffer overflow histórico, etc.).

### 3.5 Porta 8084
- TCP aberto, sem banner HTTP/sem resposta a `GET /` (segura conexão). Possivelmente Wowza Stream Manager (HTTP, path-específico) ou serviço interno. Marcar para probe direcionado do especialista network.

### 3.6 CORS misconfig (todos os providers)
- `Access-Control-Allow-Origin: *` + `Access-Control-Allow-Credentials: true` simultâneo (80/8087) — combinação perigosa: credenciais Wowza (Digest) podem ser exercidas cross-origin de qualquer origem maliciosa.

## 4. Cloudflare-fronted (29 hosts web) — httpx tech-detect

Artefato: `httpx_web_clean.txt` (limpo), `httpx_web_live.txt` (bruto com cores).

### 4.1 Aplicação principal (Angular SPA, Express/Node) — mesma app em múltiplos hosts
| Host | Status | Title | Stack |
|------|--------|-------|-------|
| `www` `app` `web` `stage` `web-dev-ads` | 200 (~150KB) | Soul TV \| Assista TV ao Vivo... | Express, Node.js, Angular, GA, GTM, VWO, Cloudflare |

### 4.2 Painéis admin Angular (cred-brute / auth bypass targets)
| Host | Status | Title | Stack |
|------|--------|-------|-------|
| `tcommerce` `tcommerce-test` | 200 (~71KB) | TcommerceAdmin | Cloudflare, Angular |
| `grade` | 200 | SoulTv Grade CMS | Bootstrap:1 |
| `interaction` | 200 | SoulTV Interactions CMS | Bootstrap:1 |
| `legendas` | 200 | SoulTV Subtitles CMS | Bootstrap:1 |
| `ads-policy` | 200 | Soul TV - Ads Policy CMS | Cloudflare |
| `ppv` `reports` | 200 (~31KB) | Soultvreports | Bootstrap:1, Firebase, HSTS (BI/reports) |
| `pay` `test-pay` | 200 (~9KB) | Soul TV | Firebase, HSTS (pagamento) |

### 4.3 Player / TV legado (AngularJS)
| Host | Status | Stack |
|------|--------|-------|
| `tv` | 200 | AngularJS, Firebase:4.6.0, jQuery:2.2.4, GA, GTM, cdnjs |
| `test-tv` | 200 | AngularJS, Firebase, jQuery:2.2.4, HSTS |
| `tv-dev-ads` | 200 | AngularJS, Firebase:4.6.0, jQuery:2.2.4 |
| `tv-legacy` | 200 | AngularJS, jQuery:2.2.4 (sem Firebase) |

### 4.4 APIs / outros
| Host | Status | Notas |
|------|--------|-------|
| `cms` | 404 (root) | API em `/v1` (P-FIND-P01) |
| `api-tcommerce` `api-tcommerce2` | 404 (532B) | APIs tcommerce (enumerar /v1) |
| `prod-serverless` | 403 | AWS CloudFront + Cloudflare (P-FIND-P08) |
| `media` | 404 | proxy Cloudflare → Azure Blob (P-FIND-P03) |
| `player` `soultv` `soultv.soultv` | 404 | vazio/legado |
| `cast` | 200 (801B) | small page |
| `test-cms` | **522** | **origem Cloudflare indisponível** (host down/origin error) — reconfirmar |
| `soultv.com.br` (apex) | 301 | → www |

## 5. WAF / TLS

### 5.1 WAF (wafw00f) — `waf_clean.txt`
- `www`, `cms`, `tcommerce` → **Cloudflare (Cloudflare Inc.)**.
- `prod-serverless` → **Cloudflare** and/or **Cloudfront (Amazon)** (camada dupla WAF).
- Todos os demais hosts web herdam Cloudflare (mesmos edge IPs 104.26.10.237/104.26.11.237/172.67.72.183).
- **Bypass Cloudflare confirmado**: hosts de origem real (video02/srt01) são alcançáveis diretamente por IP, fora do WAF → ataque direto no Wowza/FTP/SSH sem WAF intermediário.

### 5.2 TLS — `tls_www_443.txt`, `tls_video02_443.txt`, `video02_tls_cert.txt`
- **www (edge Cloudflare):** cert Cloudflare-managed (Issuer **Google Trust Services WE1**, ECDSA, 90d). SAN `soultv.com.br, *.soultv.com.br`. Cipher suites: **TLS 1.0/1.1/1.2/1.3** habilitados; **3DES_EDE_CBC_SHA presente (SWEET32, grade C)**; cipher preference server (1.0/1.1) / client (1.2/1.3). `least strength: C`.
  - **Finding (Baixa-Média):** TLS 1.0/1.1 legados + 3DES — herdados da config Cloudflare; vale report (hardening).
- **video02 (443):** cert próprio `CN=video06.logicahost.com.br` (Let's Encrypt YE1, ECDSA, 90d) — **info disclosure do hostname real do hoster**.

## 6. Findings ativos (A-FIND-*) — para próximas fases

| ID | Sev est. | Host | Resumo | Próxima fase |
|----|----------|------|--------|-------------|
| A-FIND-01 | **Alta** | video02:8088 | Wowza Streaming Engine Manager exposto (Spring Security login); UI admin de streaming acessível diretamente (bypass Cloudflare) | exploit (cred brute/dictionary; testar combos admin/soultv/admin123, wowza defaults) |
| A-FIND-02 | **Alta** | video02:8087 | Wowza REST API (Restlet 2.2.2, v2) com Digest; exposição de config de servidor/apps/streams se cred obtida; **CORS *+credentials** | cve (Wowza 4.8.0, Restlet 2.2.2) + exploit (cred brute → dump config) |
| A-FIND-03 | **Alta** | video02:21 | Pure-FTPd **anonymous login permitido** (qualquer senha); root aparente vazio — enum profunda pendente | network (lftp+socks: listar recursivo, testar write, buscar dirs de mídia/recordings/configs) |
| A-FIND-04 | **Média-Alta** | video02 | **nginx/1.7.5** (2014) — extremamente antigo em todos os HTTP providers | cve (nginx 1.7.5 historical CVEs) |
| A-FIND-05 | **Média** | video02:443 | TLS cert vaza hostname real `video06.logicahost.com.br` (hoster LogicaHost) — pivot/OSINT | osint (enumerar outros clientes logicahost, Shodan por cert) |
| A-FIND-06 | **Média** | srt01:22 | OpenSSH 8.2p1 Ubuntu-4ubuntu0.13 exposto — cred-brute + **CVE-2024-6387 (regreSSHion)** candidate (afeta ≤9.6p1) | cve + network (slow brute com threshold, validar regreSSHion) |
| A-FIND-07 | **Média** | video02 | CORS `*` + `Allow-Credentials:true` nos providers Wowza (80/8087) | webapp (avaliar abuso cross-origin com creds) |
| A-FIND-08 | **Baixa** | www (edge) | TLS 1.0/1.1 + 3DES (SWEET32) habilitados — grade C | report (hardening TLS) |
| A-FIND-09 | Info | video/video01 | Streaming SRT/UDP-only, firewalled em TCP — baixo payoff | network (scan UDP autorizado, se escopo permitir) |
| A-FIND-10 | Info | test-cms | HTTP 522 — origem Cloudflare indisponível (host down) | monitorar / reconfirmar |

## 7. Ranking de payoff (consolida passivo + ativo) — para `recon/SUMMARY.md`

| Payoff | Alvo | Vetor |
|--------|------|-------|
| **ALTO** | `cms.soultv.com.br/v1` | API sem auth + IDOR `/v1/brand/{id}` (catálogo + URLs de streaming) — P-FIND-P01 |
| **ALTO** | Firebase `tv-iteractiva` (config vazada + storage rules v1) | signUp anon via SDK, enum Firestore/Storage — P-FIND-P02 |
| **ALTO** | `testad.soultv.com.br` → `kevinzuniga.github.io` | subdomain takeover — P-FIND-P04 |
| **ALTO** | **video02 (160.202.130.243)** — Wowza 4.8.0 | FTP anônimo (A-FIND-03) + Engine Manager cred-brute (A-FIND-01) + REST API (A-FIND-02) — bypass Cloudflare |
| **ALTO** | 8+ painéis admin Angular (dev/test/stage: tcommerce-test, test-pay, test-tv, tv-dev-ads, stage, web-dev-ads) | auth bypass / default creds / IDOR — P-FIND-P05 |
| **MÉDIO** | Azure Blob `stsoultvbrs` container `media` | leitura pública de blobs — P-FIND-P03 |
| **MÉDIO** | `prod-serverless.soultv.com.br/v1` (Cloudflare+CloudFront) | API gateway 403 → mapear rotas via JS — P-FIND-P08 |
| **MÉDIO** | video02 nginx 1.7.5 / Restlet 2.2.2 / srt01 OpenSSH 8.2p1 | CVE research (regreSSHion, nginx históricos, Wowza) — A-FIND-04/06 |
| **MÉDIO** | JS bundles pay/ppv (2,9MB) | endpoints + chaves de pagamento — P-FIND-P10 |
| **BAIXO** | www TLS 1.0/1.1 + 3DES / DMARC p=none | hardening — A-FIND-08 / P-FIND-P09 |
| **BAIXO** | video/video01 (SRT/UDP) | não-TCP, baixo payoff — A-FIND-09 |

## 8. Próximos passos (delegar)

1. **cve**: mapear CVEs para nginx 1.7.5, Wowza Streaming Engine 4.8.0, Restlet-Framework 2.2.2, Pure-FTPd [privsep][TLS], OpenSSH 8.2p1 (regreSSHion CVE-2024-6387). Priorizar UNAUTH RCE / path traversal Wowza REST / info disclosure.
2. **exploit**: cred-brute no Wowza Engine Manager (8088) e REST API (8087) — dicionário focado (admin/soultv/wowza + variações); validar info disclosure da REST API após auth.
3. **network**: enumeração FTP anônima profunda no video02:21 (lftp+socks: recursivo, testar write-only? read, buscar recordings/mídia/configs); SSH srt01 cred-brute lento (threshold); probe direcionado video02:8084.
4. **enum**: content discovery em cada painel Angular (rotas lazy), extrair endpoints/keys dos bundles pay/ppv, fuzz `/v1/*` em cms e prod-serverless, enumerar `/v1/brand/1..N`.
5. **webapp**: auth bypass/default creds nos painéis admin (foco dev/test/stage); IDOR/BOLA em `/v1/account`, APIs de pagamentos/assinantes; JWT/Firebase auth bypass; SSRF nos URLs de imagem/stream.
6. **cloud**: validar takeover `testad`/`kevinzuniga.github.io`; enumerar containers Azure `stsoultvbrs`; Firebase Storage rules; auth anônima via SDK.
7. **screenshots**: Engine Manager login (8088), painéis admin (tcommerce/grade/ppv), FTP anon session (se viável).

## 9. Artefatos brutos (`recon/active/`)

```
Ports/scans:   ports_video02.txt ports_streaming_summary.txt ports_streaming_high.txt nmap_streaming_versions.txt(.log) nmap_top_realips.* nmap_full_*.log(incompletos, Tor throttle)
Probes:        direct_ip_probe.txt video02_port_probe.txt video02_enginemanager_headers.txt video02_enginemanager.html video02_em_login.htm video02_em_paths.txt video02_restapi_root.txt video02_restapi_root_body.txt video02_restapi_admin_test.txt video02_8084_banner.txt video02_8084_http.txt
FTP:           video02_ftp_anon.txt video02_ftp_list_root.txt video02_ftp_stat.txt video02_ftp_curl_root.txt video02_ftp_dirs.txt
TLS:           tls_www_443.txt tls_www_443.log tls_video02_443.txt video02_tls_cert.txt
WAF:           waf_detection.txt waf_clean.txt
httpx:         httpx_web_live.txt httpx_web_clean.txt httpx_web_live.log hosts_web.txt
Vhosts:        vhosts_video02.csv(.log) video02_vhost_logicahost.txt sub_prefixes.txt
Outros:        portlist.txt scan_ip.sh scan_*.sh scan_*.log (artefatos de processo)
Consolidação:  ACTIVE.md (este)
```

## 10. Limitações

- **Tor throughput**: nmap -sT -p- via proxychains/Tor gerou falsos "closed" (throttle + paralelismo); substituído por `nc -z` via proxychains (confiável, open<1s). Outro engagement concorrente na mesma box saturava Tor (load ~6), degradando throughput — scans -p- completos não finalizaram no tempo.
- **UDP não escaneado**: SRT/HLS usam UDP; raw sockets indisponíveis via socks Tor → video/video01 permanecem streaming-only não-caracterizados em UDP.
- **FTP listing instável**: conexão de dados PASV/EPSV via Tor socks não completou listing confiável — root parece vazio; enumeração profunda pendente (especialista network com cliente FTP socks-capable).
- **Cred default não confirmada**: admin/admin no Wowza = 401 (não é default); brute delegado a exploit (OPSEC: não fiz brute em recon).
