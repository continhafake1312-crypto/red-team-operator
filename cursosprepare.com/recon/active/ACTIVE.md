# recon/active/ACTIVE.md — Fase 3: Recon Ativo — cursosprepare.com

> Especialista recon-active. OPSEC: proxychains4 + Tor (socks4 via nmap `--proxies`, socks5 via curl/ncat) em TODOS os scans. Exit IP inicial 192.42.116.142. Rate-limited, UA Chrome real. Concluído em 2026-08-27.

## 1. Origem dos hosts — CDN/managed vs origem real

| Host | IP | ASN | Classificação |
|---|---|---|---|
| `cursosprepare.com` (apex) | 185.230.63.171 | AS58182 WIX_COM | **Managed Wix** (Pepyaka edge), **sem Google LB** — edge Wix direto |
| `www.cursosprepare.com` | 34.149.87.45 | AS15169 Google Cloud | **Google Cloud LB** na frente do edge Wix (CNAME cdn1.wixdns.net) |

**Conclusão:** Ambos os IPs são **infra gerenciada** (Wix + Google Cloud). **NÃO há "origem própria" do cliente** — a attack surface tradicional (portscan/SMB/DB/admin ports) é virtualmente nula. O valor real está na camada de aplicação Wix (roteamento, APIs, IDOR) — delegada a `enum`/`webapp`.

## 2. Portscan (todas as portas comuns + custom)

Scanner: `nmap -sT --proxies socks4://127.0.0.1:9050` (Tor). Lista: 66 portas (web/db/mail/admin/cloud).

### www — 34.149.87.45 (Google Cloud LB)
| Porta | Estado | Serviço | Detalhe |
|---|---|---|---|
| 80/tcp | open | http | Google LB (`via: 1.1 google`, `glb-x-seen-by`). Sem Host header → 403. |
| 443/tcp | open | https | TLS, HTTP/2 + HTTP/3 (alt-svc). SNI exigido. |
| demais (64) | filtered | — | Wix LB blackhole (RST/filtro). |

### apex — 185.230.63.171 (Wix edge)
| Porta | Estado | Serviço | Detalhe |
|---|---|---|---|
| 80/tcp | open | http | Wix edge (`X-Seen-By`). Sem Host header → 403, Content-Length 0. |
| 443/tcp | open | https | TLS, HTTP/2. SNI exigido. |
| 445/tcp | open | "microsoft-ds" | **FALSO POSITIVO**: aceita TCP (3-way handshake OK) mas **não responde** a SMB negotiate nem HTTP GET — blackhole do Wix LB. SMB2 negotiation failed. **Não é SMB real, não explorável.** |
| demais (63) | filtered | — | — |

Artefatos: `nmap_34.149.87.45.txt`, `nmap_34.149.87.45_sv.txt`, `nmap_185.230.63.171.txt`, `nmap_185.230.63.171_sv.txt`.

## 3. Fingerprint web (com Host header correto / SNI)

### www.cursosprepare.com — HTTP/2 200 (via apex IP bypass)
- **Server:** `Pepyaka` (edge Wix)
- **Via:** `1.1 google` (Google Cloud LB)
- **CDN/cache:** Varnish/Fastly (`x-served-by: cache-mrs10569-MRS`, `server-timing: ...fastly_g`, `x-cache: HIT`)
- **HTTP/3:** `alt-svc: h3=":443"; ma=2592000, h3-29=...`
- **Stack:** Wix.com Website Builder (MetaGenerator), React/SPA, parastorage/wixstatic assets
- **Title:** `Cursos Prepare | Concurso | Aula de Reforço | Cursos`
- **Emails visíveis no HTML:** `cursoprepare@cursoprepare.com`, **`exemplo@meusite.com`** (placeholder Wix default — info), múltiplos Sentry DSNs Wix (ver PASSIVE.md)
- **Cookies:** `ssr-caching`, `sec-fetch-unsupported` (Path=/; Secure; SameSite=Lax)
- **Security headers:** HSTS `max-age=31556952`, `X-Content-Type-Options: nosniff`. **Ausentes:** CSP, X-Frame-Options (Wix usa frame-busting JS), Referrer-Policy (apex não; www root 403 sim).
- **Favicon mmh3 hash:** `-914567545` (PNG 192x192 RGBA)
- **Wix metaSiteId** (no redirect apex): `dcffb6fe-b153-4b2e-bd44-5de8281fcb28`

### cursosprepare.com (apex) — HTTP/2 301 → https://www.cursosprepare.com/
- Headers Wix: `x-meta-site-id`, `x-wix-cache-control: public, max-age=86400`, `server-timing: dc;desc=ireland-phy` (edge Wix em Ireland). Sem `via: 1.1 google`.

Artefatos: `www_bypass.txt`, `whatweb_www.txt`, `whatweb_apex.txt`, `httpx_*.txt` (httpx local = client não recon; fingerprint via whatweb/curl).

## 4. WAF detection

- **wafw00f (ambos hosts):** `Google Cloud App Armor (Google Cloud)` — generic detection: nenhum WAF adicional.
- **Comportamento observado:** App Armor atua **somente no path do Google Cloud LB** (IP www 34.149.87.45). O **edge Wix (IP apex 185.230.63.171)** não passa pelo Google LB → **sem App Armor nesse caminho** (confirmação: header `via: 1.1 google` ausente no apex; 200 servido diretamente).
- Artefatos: `waf_www.txt`, `waf_apex.txt`.

## 5. TLS assessment

| Atributo | Valor |
|---|---|
| CA / issuer | Let's Encrypt — `CN=YR2` (intermediate) |
| Subject CN | `cursosprepare.com` |
| SAN | `cursosprepare.com`, `www.cursosprepare.com` (apex e www **compartilham** o mesmo cert) |
| Validade | 2026-06-20 → 2026-09-18 (90 dias, auto-renovado por Wix) |
| Versões | **TLS 1.2 e TLS 1.3** suportados. TLS 1.0/1.1 não aceitos (modern). |
| Cipher TLS1.2 | `ECDHE-RSA-CHACHA20-POLY1305` (strong, AEAD, PFS) |
| Cipher TLS1.3 | `TLS_AES_256_GCM_SHA384` (strong) |
| HSTS | presente, `max-age=31556952` (~1 ano). Sem `includeSubDomains`/`preload` (hardening menor). |

**Avaliação:** TLS robusto, sem ciphers fracos, sem protocols legados. Nenhuma vulnerabilidade TLS relevante. Artefatos: `tls_www_cert.txt`, `tls_apex_cert.txt`, `tls_www_ciphers.txt`, `tls_www_neg.txt`. (nmap `ssl-enum-ciphers` não executa via proxy; ciphers enumerados via `openssl s_client`.)

## 6. Vhost fuzzing

- Lista curada de 69 nomes (admin/api/blog/dev/staging/painel/conta/loja/members/booking/pay/ead/cursos/login... + DNS infra) testados via `curl --resolve <vhost>:443:<IP>` em ambos os IPs.
- **34.149.87.45 (Google Cloud):** TODOS os vhosts com SNI ≠ `cursosprepare.com|www` → **000 (TLS RST)** — Google LB rejeita SNI desconhecido. Apenas `www` responde (403 neste circuito — Tor block).
- **185.230.63.171 (Wix):** TODOS → 000, **exceto `www.cursosprepare.com` → 200 (3.27 MB, site completo)**.
- **Nenhum vhost adicional descoberto.** Consistente com DNS sem wildcard (passive: 5000 nomes, só www resolve). A attack surface de vhost é só `cursosprepare.com` + `www.cursosprepare.com`.
- Artefatos: `vhosts_34.149.87.45.txt`, `vhosts_185.230.63.171.txt`.

## 7. ★ Bypass do block Tor em www — STATUS: RESOLVIDO (sem 2Captcha)

### Problema
`www.cursosprepare.com` via IP Google Cloud (34.149.87.45) sofre **bloqueio Tor intermittente pela App Armor**:
- Homepage `/` → frequentemente **403** (App Armor, `via: 1.1 google`, `glb-x-seen-by`). TLS reset em alguns exits.
- Algumas rotas de conteúdo passam (ex.: `/cursosead` chegou a 200 uma vez) — bloqueio **seletivo por path/exit/caching**, não absoluto.
- whatweb (circuito diferente) obteve 403 em `/` também.

### Solução adotada (limpa e confiável) — Roteamento via edge Wix (apex IP)
Acessar o conteúdo de `www` usando o **edge Wix direto** (IP apex 185.230.63.171) com `Host: www.cursosprepare.com` (`curl --resolve www.cursosprepare.com:443:185.230.63.171`). Este caminho **não atravessa o Google Cloud LB / App Armor** → **200 estável**:

| Rota | Via www Google IP (Tor) | Via apex Wix IP (Tor) — BYPASS |
|---|---|---|
| `/` | 403 (intermittente) | **200** (3.27 MB) |
| `/cursosead` | 403 / às vezes 200 | **200** (1.42 MB) |
| `/payment-request-page` | 403 | **200** (879 KB) |
| `/_api/members/v1/members` | 403 | **403** (auth-gated, **endpoint existe** — alvo webapp) |
| `/_api/wix-ecommerce-storefront-web/v1/current-cart` | 403 | 404 (path/method incorreto — enum deve mapear schema real) |
| `/afiliados`, `/agenda`, `/book-online` | 403 | 404 (rotas wayback inexistentes hoje) |
| `/_api/` | 403 | 301 → `https://www.cursosprepare.com/_api` |

### NEWNYM
- Tentado via tor controlport (sem CookieAuthentication configurada para auth em branco) — rotação não confirmada. Exit chegou a receber "Too Many Requests" da api.ipify.org. **Não foi necessário** pois o bypass via apex IP resolve o acesso.

### Recomendação para próximas fases
- **`enum` e `webapp`: rotear TODOS os requests de `www.cursosprepare.com` via `--resolve www.cursosprepare.com:443:185.230.63.171`** (proxychains + UA Chrome real). Isto entrega conteúdo 200 confiável e contorna App Armor. **2Captcha não necessário.**
- Persistência do block no path Google (34.149.87.45) só importa se o Wix edge parar de servir o site — improvável.
- Artefato: `www_bypass.txt`.

## 8. Findings preliminares (ativos)

| ID | Severidade | Descrição |
|---|---|---|
| FA-1 | **Info→Alto (para enum/webapp)** | **Bypass do WAF App Armor via edge Wix (apex IP)**: `https://www.cursosprepare.com/` servido por 185.230.63.171 (Wix) contorna Google Cloud Armor. Habilita enum/webapp via Tor. (Não é vuln do cliente — é característica da arquitetura Wix/Google, mas útil operacionalmente.) |
| FA-2 | Info | Porta **445/tcp aberta no apex** (blackhole Wix LB, sem SMB real) — falso positivo de portscan; documentado. |
| FA-3 | Info | **`/_api/members/v1/members` → 403** (auth-gated, não 404): endpoint Wix Members existe e requer auth — **alvo de auth bypass/IDOR para webapp**. |
| FA-4 | Baixa | TLS HSTS sem `includeSubDomains`/`preload` (hardening menor). |
| FA-5 | Baixa | Email placeholder Wix `exemplo@meusite.com` visível no HTML (default não-customizado). |
| FA-6 | Info | Apex edge em Ireland (`dc;desc=ireland-phy`); www cache em Marselha (Fastly `cache-mrs10569-MRS`) — geodistribuição Wix/Fastly/Google. |

## 9. Versões vulneráveis candidates para CVE research
- **Stack = Wix managed SaaS** — não há versão de software cliente exposta para CVE tradicional (Pepyaka é edge interno Wix; Let's Encrypt cert é padrão).
- **Pepyaka / Wix edge:** sem CVE público aplicável (software proprietário Wix).
- **Google Cloud Armor:** WAF gerenciado Google — sem CVE acionável.
- **Let's Encrypt/YR2:** apenas CA, não aplicável.
- **Recomendação:** CVE research deve focar em **Wix TPA apps** (Stores, Bookings, Members, Online Programs, Pricing Plans) — conhecidos por lógicas de IDOR/auth — repassar ao `cve`/`webapp` em vez de versão de host. Sem candidatos de CVE de infraestrutura para o `cve` aqui.

## 10. Resumo operacional para o coordenador
- **Hosts diretos:** 2 (`cursosprepare.com` 185.230.63.171 Wix; `www.cursosprepare.com` 34.149.87.45 Google Cloud). Ambos managed.
- **Portas expostas além de 80/443:** nenhuma real (445 = falso positivo blackhole).
- **WAF:** Google Cloud App Armor (somente no path www/Google). **Bypass: apex Wix IP**.
- **TLS:** Let's Encrypt, TLS1.2/1.3, ciphers fortes, HSTS. Sem findings TLS.
- **Vhosts:** nenhum além de apex+www.
- **Bypass Tor www:** RESOLVIDO via apex IP `--resolve` (200 estável). 2Captcha não necessário.
- **Alvo webapp confirmado:** `/_api/members/v1/members` (403), rotas `/cursosead`, `/payment-request-page`, `/challenge-page/<UUID>` (do passive) — todas acessíveis via bypass.
- **Próximos passos:** Fase 5 (enum) — mapear schema das APIs Wix (`/_api/wix-ecommerce-storefront-web/`, `wix-bookings-web/`, `members/v1/`), content discovery, JS analysis; **usar apex IP `--resolve`**. Fase 6 (webapp) — IDOR em Online Programs/Stores/Bookings/Members/Payment, auth bypass em /cursosead e /_api/members.
