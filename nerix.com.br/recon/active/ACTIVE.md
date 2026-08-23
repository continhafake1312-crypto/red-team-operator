# Active Recon — nerix.com.br

**Data**: 2026-08-23  
**Metodologia**: `recon-active` (Skill pentest-methodology)  
**Proxy**: proxychains4 (Tor 9052) obrigatório para todos os requests  
**Bypass CF**: cloudscraper + 2Captcha  

---

## PASSO 1: Port scan IPs reais (links.nerix.com.br)

### Alvo: 3.174.83.0/24 (4 IPs confirmados: .65, .97, .98, .126)

| IP | Portas Abertas | Serviço | Banner |
|-----|---------------|---------|--------|
| 3.174.83.65 | 80/tcp, 443/tcp | Amazon CloudFront | `*.gru3.r.cloudfront.net` |
| 3.174.83.97 | 80/tcp, 443/tcp | Amazon CloudFront | `*.gru3.r.cloudfront.net` |
| 3.174.83.98 | 80/tcp, 443/tcp | Amazon CloudFront | `*.gru3.r.cloudfront.net` |
| 3.174.83.126 | 80/tcp, 443/tcp | Amazon CloudFront | `*.gru3.r.cloudfront.net` |

**Ferramentas**: rustscan (port discovery), nmap -sT -sV -sC (service enum via proxychains)  
**Resultado**: Apenas portas 80 e 443 abertas. **Nenhum outro serviço** (SSH, SMTP, DB, etc.) exposto.  
**Observação**: Porta 80 faz redirect 301 → HTTPS. HTTPS retorna "ERROR: The request could not be satisfied" sem o header Host correto.

**CloudFront Edge**: GRU3 (São Paulo, Brasil) — `server-3-174-83-*.gru3.r.cloudfront.net`  
**CNAME**: `links.nerix.com.br → links1.resend-dns.com` (Resend email service)

---

## PASSO 2: WAF fingerprint

| Subdomínio | WAF Detectado | Notas |
|------------|--------------|-------|
| nerix.com.br | Cloudflare | - |
| admin.nerix.com.br | Cloudflare | - |
| app.nerix.com.br | Cloudflare | - |
| api.nerix.com.br | Cloudflare | Rate limiting headers presentes |
| cdn.nerix.com.br | Cloudflare | - |
| docs.nerix.com.br | Cloudflare | - |
| **links.nerix.com.br** | **NENHUM WAF** | **Sem Cloudflare!** AWS CloudFront direto |
| pay.nerix.com.br | Cloudflare | - |
| quiz.nerix.com.br | Cloudflare | - |
| status.nerix.com.br | Cloudflare | - |

---

## PASSO 3: WhatWeb / HTTP fingerprint

| Subdomínio | Status | Tech Stack | Headers Notáveis |
|------------|--------|-----------|-----------------|
| nerix.com.br | 200 | React/Vite SPA | Cloudflare headers |
| admin.nerix.com.br | 200 | React/Vite SPA | Cloudflare headers |
| app.nerix.com.br | 200 | React/Vite SPA | Cloudflare headers |
| api.nerix.com.br | 404 | REST API + Cloudflare | CSP, HSTS, COOP, CORP, RateLimit, X-Frame-Options: SAMEORIGIN |
| cdn.nerix.com.br | 404 | Cloudflare | "Not Found" — CDN vazia |
| docs.nerix.com.br | 308→200 | Vercel + Mintlify/Next.js | HSTS, X-Frame-Options: DENY, Vercel headers |
| **links.nerix.com.br** | **400** | **Resend API (AWS CloudFront)** | **x-amz-cf-pop: GRU3-P9, Via: CloudFront** |
| pay.nerix.com.br | 200 | React/Vite SPA | Cloudflare headers |
| quiz.nerix.com.br | 200 | React/Vite SPA | Cloudflare headers |
| status.nerix.com.br | 200 | React/Vite SPA | "Status Nerix" |

---

## PASSO 4: TLS enumeration

| Subdomínio | Cert SANs | Issuer | Validade | Public Key | Cipher Grade |
|------------|----------|--------|----------|-----------|-------------|
| *.nerix.com.br | `*.nerix.com.br`, `nerix.com.br` | Google Trust Services (WE1) | 2026-07-17 → 2026-10-15 | EC 256 | **A** |
| cdn.nerix.com.br | `cdn.nerix.com.br`, `88f2f390.sni.cloudflaressl.com` | Google Trust Services (WE1) | 2026-08-11 → 2026-11-09 | EC 256 + RSA 2048 | **C** (3DES SWEET32) 🔴 |
| docs.nerix.com.br | `docs.nerix.com.br` | Let's Encrypt (YE1) | 2026-07-06 → 2026-10-06 | EC 256 | **A** |
| **links.nerix.com.br** | `links.nerix.com.br` | **Amazon ECDSA 256 M04** | 2026-08-01 → 2027-02-14 | EC 256 | **A** |

**cdn.nerix.com.br**: TLS Grade C — suporta `TLS_RSA_WITH_3DES_EDE_CBC_SHA` (SWEET32 vulnerability).

---

## PASSO 5: Vhost fuzzing

- **Alvo**: IPs Cloudflare (104.21.52.111, 172.67.198.51) + AWS IPs
- **Wordlist**: subdomains-top1million-5000.txt + 10 subdomínios conhecidos
- **Ferramenta**: ffuf via proxychains4
- **Resultado**: **Nenhum vhost adicional descoberto**. Apenas os 10 subdomínios conhecidos são servidos.

---

## PASSO 6: Content discovery

### admin.nerix.com.br / app.nerix.com.br / pay.nerix.com.br / quiz.nerix.com.br / status.nerix.com.br
- **Todas as rotas** retornam o mesmo SPA catch-all (len=4661 bytes / 487 words)
- **Exceção**: `/robots.txt` → 200 (6138 bytes) — Cloudflare Managed Content + SPA HTML
- **Nenhuma rota de admin/dashboard/login** encontrada (client-side routing via React)
- `.well-known/` paths retornam SPA catch-all (sem server-side handling)

### api.nerix.com.br
- **Cloudflare** bloqueia todas as tentativas de content discovery (403 JS Challenge)
- Exceção: `/robots.txt` → 200 (Cloudflare managed content)

### links.nerix.com.br
- **Todas as rotas** retornam 400 Bad Request (Resend API)
- Resend precisa de headers específicos (API key, formato de requisição)

---

## PASSO 7: S3 bucket enumeration

| Teste | URL | Resultado |
|-------|-----|-----------|
| HEAD `nerix-prod.s3.amazonaws.com` | `https://nerix-prod.s3.amazonaws.com` | 404 Not Found |
| GET (root) | `https://nerix-prod.s3.amazonaws.com` | NoSuchBucket |
| PUT test file | `PUT /test_<timestamp>.txt` | **AccessDenied** |
| GET ?acl | `/?acl` | **AccessDenied** |
| GET ?versions | `/?versions` | **AccessDenied** |
| GET ?publicAccessBlock | `/?publicAccessBlock` | **AccessDenied** |
| us-east-1 endpoint | `s3.us-east-1.amazonaws.com` | NoSuchBucket |

**Status**: Bucket **existe** (PUT/Acl retornam AccessDenied, não NoSuchBucket) mas **totalmente bloqueado**. Sem listagem pública. Sem write público.

---

## PASSO 8: DNS Records

| Registro | Valor |
|----------|-------|
| SPF | `v=spf1 include:_spf.mail.hostinger.com ~all` |
| DMARC | `v=DMARC1; p=none` |
| MX | mx1.hostinger.com, mx2.hostinger.com |
| CNAME links.nerix.com.br | `links1.resend-dns.com` |
| A (nerix.com.br) | 172.67.198.51, 104.21.52.111 |

---

## Cloudflare Bypass Attempts

| Método | Resultado |
|--------|-----------|
| cloudscraper + 2Captcha (admin/app/api/pay/quiz/status) | ❌ 403 — "Just a moment..." |
| Direct IP (104.21.52.111, 172.67.198.51) via curl | ❌ SSL handshake falha (CF firewall) |
| AWS IPs como proxy para CF subdomínios | ❌ CloudFront não roteia para CF |
| **links.nerix.com.br** (sem CF) | ✅ Acessível diretamente (400 Bad Request) |

---

## Artefatos

| Diretório | Arquivos |
|-----------|---------|
| `scans/` | `rustscan_aws_all_ports.txt`, `nmap_aws_full_sVC.txt`, `nmap_aws_sV_service.txt`, `nmap_subdomains_443.txt`, `nmap_aws_65_allports.txt` |
| `waf/` | `waf_all_hosts.txt` |
| `tls/` | `tls_all_hosts.txt` |
| `vhost/` | `ffuf_vhost_links.json`, `ffuf_vhost_cf.json` |
| `web/` | `whatweb_all_hosts.txt`, `httpx_all_hosts_v2.txt` |
| `content/` | `ffuf_admin.json`, `ffuf_app.json`, `ffuf_pay.json`, `ffuf_api.json`, `cloudscraper_probe.txt`, `cloudscraper_api.txt`, `s3_enum.txt`, `robots_txt.txt`, `cf_direct_test.txt`, `links_probe.txt`, `docs_sitemap.txt`, `dns_records.txt`, `origin_bypass_test.txt`, `cf_bypass.txt` |