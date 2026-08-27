# SUMMARY.md — Attack Surface & Payoff Ranking — soultv.com.br

> Consolida recon passivo (PASSIVE.md, findings P-FIND-P01..P10) + recon ativo (ACTIVE.md, A-FIND-01..10).
> Coordenador: `pentest` | Última atualização: 2026-08-27 (fase 3 — recon ativo)

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

## Próximas fases (recomendado)
1. **cve**: nginx 1.7.5, Wowza 4.8.0, Restlet 2.2.2, Pure-FTPd, OpenSSH 8.2p1 (regreSSHion).
2. **exploit**: cred-brute Wowza Manager(8088)+REST(8087); validar info disclosure REST após auth.
3. **network**: enum FTP anônimo profunda; SSH srt01 brute lento; probe video02:8084.
4. **enum**: content discovery painéis Angular; extrair bundles pay/ppv; fuzz `/v1/*` (cms, prod-serverless, api-tcommerce).
5. **webapp**: auth bypass painéis admin; IDOR/BOLA `/v1/account`, APIs pagamento/assinantes; Firebase auth bypass; SSRF URLs stream.
6. **cloud**: takeover testad; enum Azure `stsoultvbrs`; Firebase Storage rules + auth anon SDK.
7. **screenshots**: Engine Manager login, painéis admin, FTP anon session.
