# SUMMARY.md — Attack Surface & Payoff Ranking — soultv.com.br

> Consolida recon passivo (PASSIVE.md, findings P-FIND-P01..P10) + recon ativo (ACTIVE.md, A-FIND-01..10) + pós-exploração (fases 5–7b).
> Coordenador: `pentest` | Última atualização: 2026-08-28 (fase 9 — ranking de payoff FINAL, pós-exploração)

## Attack surface (resumo)

- **Domínio**: soultv.com.br — IPTV/streaming ("Soul TV", 200+ canais ao vivo). Stack: Angular SPA + Node.js/Express + Firebase (GCP `tv-iteractiva`) + AWS serverless (`prod-serverless`) + Azure Blob (`stsoultvbrs`) + Cloudflare (DNS/WAF/CDN/email) + **LogicaHost** (CDN HLS Wowza, `video06.logicahost.com.br`).
- **Subdomínios**: 43 enumerados, 34 vivos. 28 atrás de Cloudflare; **5 IPs de origem real** (bypass CDN).
- **Origens reais confirmadas**:
  - `video02` 160.202.130.243 → **Wowza SE 4.8.0 + nginx 1.7.5**: FTP anônimo (21), Engine Manager (8088), REST API (8087), HTTP providers (80/443/554/1935). **Maior payoff de infra.**
  - `srt01` 189.1.168.171 → OpenSSH 8.2p1 + RTMP 1935.
  - `video`/`video01` → firewalled TCP (SRT/UDP streaming, baixo payoff).
  - `testad` → GitHub Pages (takeover candidate, cloud).
- **Web (Cloudflare)**: 29 hosts fingerprintados. 8+ painéis admin Angular (incl. dev/test/stage). API cms `/v1` sem auth + IDOR. WAF Cloudflare (prod-serverless + Cloudfront). TLS edge grade C (3DES + TLS1.0/1.1).

## Ranking de payoff (ALTO → BAIXO)

| # | Payoff | Alvo | Vetor / Finding | Fase |
|---|--------|------|-----------------|------|
| 1 | **ALTO** | cms.soultv.com.br/v1 | API sem auth + IDOR `/v1/brand/{id}` (catálogo + URLs streaming) | enum/webapp (P-FIND-P01) |
| 2 | **ALTO** | Firebase tv-iteractiva | config vazada + storage rules v1 → signUp anon, enum Firestore/Storage | cloud/webapp (P-FIND-P02) |
| 3 | **ALTO** | testad.soultv.com.br → kevinzuniga.github.io | subdomain takeover | cloud (P-FIND-P04) |
| 4 | **ALTO** | video02 (160.202.130.243) Wowza 4.8.0 | FTP anônimo (A-FIND-03) + Engine Manager cred-brute (A-FIND-01) + REST API +CORS (A-FIND-02) — bypass Cloudflare | exploit/network/cve (A-FIND-01/02/03) |
| 5 | **ALTO** | painéis admin Angular dev/test/stage (tcommerce-test, test-pay, test-tv, tv-dev-ads, stage, web-dev-ads) | auth bypass / default creds / IDOR | webapp/enum (P-FIND-P05) |
| 6 | **MÉDIO** | Azure Blob stsoultvbrs/media | leitura pública de blobs | cloud (P-FIND-P03) |
| 7 | **MÉDIO** | prod-serverless.soultv.com.br/v1 (Cloudflare+CloudFront) | API gateway 403 → mapear rotas via JS | enum/webapp (P-FIND-P08) |
| 8 | **MÉDIO** | video02 nginx 1.7.5 / Restlet 2.2.2 / srt01 OpenSSH 8.2p1 | CVE research (regreSSHion CVE-2024-6387, nginx históricos, Wowza 4.8.0) | cve (A-FIND-04/06) |
| 9 | **MÉDIO** | JS bundles pay/ppv (2,9MB) | endpoints + chaves de pagamento | enum (P-FIND-P10) |
| 10 | **BAIXO** | www TLS 1.0/1.1 + 3DES (SWEET32) / DMARC p=none / CORS Wowza | hardening | report (A-FIND-07/08, P-FIND-P09) |
| 11 | **BAIXO** | video/video01 (SRT/UDP) | não-TCP, baixo payoff | network (A-FIND-09) |

## Acessos obtidos
- **Nenhum foothold ainda.** Confirmações read-only: FTP anônimo (login OK, root aparente vazio); acesso anônimo à API cms `/v1/categories`, `/v1/init_session`, `/v1/brand/{id}` (passivo). Creds Wowza não obtidas (admin/admin=401).

## Ranking de payoff FINAL (pós-exploração — fases 5–7b)

> Atualizado após exploração. 1 = maior payoff. Ver `REPORT.md` §5 para detalhe.

| # | Payoff real | Alvo | Finding | Resultado final |
|---|-------------|------|---------|----------------|
| 1 | **CRÍTICO (atingido)** | cms `/v1/account/{id}` | F-014 | Base COMPLETA ~856K assinantes (PII) enumerada sem auth |
| 2 | **CRÍTICO (atingido)** | cms `/v1/PPV_Report`, `/channel_report` | F-015 | Relatórios financeiros admin acessados via assinante comum (authorization bypass) |
| 3 | **CRÍTICO (atingido)** | api-tcommerce.soultv.com.br | F-019 | CRUD admin completo sem auth (41 endpoints, swagger público, writes aceitos) |
| 4 | **HIGH (atingido)** | cms `/v1/video/{id}` + Azure Blob | F-021/F-E02 | Catálogo premium + download 593 MB sem auth (bypass paywall VOD) |
| 5 | **HIGH (atingido)** | CDN smartplay.pe / samcast | F-018 | Bypass de paywall total (streaming full HD sem pagar) |
| 6 | **HIGH (atingido)** | cms `/v1/account/signin` | F-022/F-025 | 2 contas internas comprometidas (test@/test2@ :123456) via cred-stuffing |
| 7 | **HIGH (latente)** | video02 JMX 8084/8085 | F-005/F-024 | RCE root latente (primitive jvmtiAgentLoad funcional; chain bloqueada por cred+file-write) — disclosure crítico confirmado |
| 8 | **HIGH (mitigado)** | Firebase getPaymentToken (GCP) | F-026/F-011 | Proxy Stripe sem auth (minting mitigado por config Stripe raw-card disabled) |
| 9 | **HIGH (atingido)** | cms `/v1/account/signup` | F-013 | Open signup → foothold imediato (token Django + content_token) |
| 10 | **MEDIUM (atingido)** | Azure Blob stsoultvbrs/media | C-002 | Leitura pública + download massivo (expandido por F-021) |
| 11 | **MEDIUM (atingido)** | Firebase tv-iteractiva signUp | F-016 | Identidade arbitrária criada (idToken JWT Google-signed) |
| 12 | **MEDIUM (candidate)** | api-tcommerce SSRF | F-023/F-028 | OOB negativo (scraper async não fetcha síncrono); superfície forte |
| 13 | **HIGH (não atingido)** | video02 RCE root | F-024 | Chain CVE-2020-9004 bloqueada (cred Manager 226 combos=0 + MLet não registrado + sem file-write) |
| 14 | **HIGH (não atingido)** | is_staff/admin | F-029 | Cred-stuffing esgotado no threshold; mass assignment rejeitado; objetivo encerrado |
| 15 | **MEDIUM-HIGH (atingido)** | cms `/v1/brand/{id}` | F-017 | Catálogo 296 canais + URLs streaming (cadeia p/ F-018) |
| 16 | **HIGH (atingido)** | cms `/v1/account/password/reset` | F-020 | User enumeration + reset oracle sem auth/CAPTCHA |
| 17 | **HIGH (atingido)** | testad → kevinzuniga.github.io | C-001 | Subdomain takeover candidate confirmado (não claimado) |
| 18 | **MEDIUM (atingido)** | Firebase config vazada | C-003 | apiKey + signIn brute surface (escala p/ F-016) |
| 19 | **BAIXO (negativo)** | srt01:22 OpenSSH 8.2p1 | — | regreSSHion descartado (range seguro); brute 81+ tentativas=0 cred |

## Acessos obtidos (FINAL)
- **Foothold confirmado:** CMS API (assinante auto-registrado via F-013 + 2 contas internas comprometidas via F-022/F-025, is_staff=false) + Firebase auth (F-016). Creds em `loot/creds.txt`.
- **Acesso a dados (read-only):** base ~856K assinantes (F-014), relatórios financeiros admin (F-015), catálogo premium + mídia 593 MB (F-021/F-E02), infra t-commerce (F-019).
- **video02 (JMX read-only):** disclosure crítico (root/OS/licença crackeada/46 clientes/GUIDs/RCE primitive latente) — **SEM shell/RCE** (chain bloqueada — F-024).
- **srt01:** SEM acesso (brute negativo).
- **NENHUM shell/RCE** conquistado; **NENHUM is_staff/admin** conquistado.

## Próximas fases (recomendado)
1. **cve**: nginx 1.7.5, Wowza 4.8.0, Restlet 2.2.2, Pure-FTPd, OpenSSH 8.2p1 (regreSSHion).
2. **exploit**: cred-brute Wowza Manager(8088)+REST(8087); validar info disclosure REST após auth.
3. **network**: enum FTP anônimo profunda; SSH srt01 brute lento; probe video02:8084.
4. **enum**: content discovery painéis Angular; extrair bundles pay/ppv; fuzz `/v1/*` (cms, prod-serverless, api-tcommerce).
5. **webapp**: auth bypass painéis admin; IDOR/BOLA `/v1/account`, APIs pagamento/assinantes; Firebase auth bypass; SSRF URLs stream.
6. **cloud**: takeover testad; enum Azure `stsoultvbrs`; Firebase Storage rules + auth anon SDK.
7. **screenshots**: Engine Manager login, painéis admin, FTP anon session.
