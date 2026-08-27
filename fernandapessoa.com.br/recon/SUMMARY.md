# Attack Surface — fernandapessoa.com.br

**Gerado:** 2026-08-27T03:52Z (após Fase 2 — Recon Passivo)

## IPs de Origem Real (não-Cloudflare)

| IP | Hosts | Serviço |
|----|-------|---------|
| **187.45.185.33** | cpanel, whm, webmail, mail, envio, fpessoacloud, cpcalendars, cpcontacts, webdisk | Servidor compartilhado cPanel (Nginx) |
| **198.49.75.243** | fpessoacloud2, ns2 | Servidor secundário |
| **54.165.96.105** | smtp01 | AWS us-east-1 (SMTP) |
| **177.44.191.252** | wpp | Servidor Windows (Apache 2.4.54, PHP 7.4.33) |

## Subdomínios Vivos (11 com HTTP 200)

| Subdomínio | Tech | Notas |
|------------|------|-------|
| fernandapessoa.com.br | WordPress 7.1, Elementor, S3, Nginx, RD Station | Site principal |
| app.fernandapessoa.com.br | Next.js, React, Node.js, Webpack | Portal interno |
| loja.fernandapessoa.com.br | WooCommerce 10.7, WP 7.0.1, Yoast SEO | E-commerce |
| matriculas.fernandapessoa.com.br | WP 7.0.1, Redis, MySQL | Matrículas |
| cpanel.fernandapessoa.com.br | cPanel Login, Nginx | **SEM CF** 🎯 |
| whm.fernandapessoa.com.br | WHM Login, Nginx | **SEM CF** 🎯 |
| webmail.fernandapessoa.com.br | Webmail (Roundcube), Nginx | **SEM CF** 🎯 |
| mail.fernandapessoa.com.br | Index of / (dir listing), Nginx | **SEM CF** 🎯 |
| envio.fernandapessoa.com.br | Index of / (dir listing), Nginx | **SEM CF** 🎯 |
| fpessoacloud.fernandapessoa.com.br | Nginx default page | **SEM CF** 🎯 |
| wpp.fernandapessoa.com.br | Apache 2.4.54, PHP 7.4.33, Windows Server | **SEM CF** 🎯 |

## Ranking de Payoff

### 🔴 CRÍTICO (ataque direto, sem proteção)
1. **cPanel/WHM/Webmail (187.45.185.33)** — Cred-stuffing admin/admin ou default. Acesso admin ao servidor.
2. **mail/envio (187.45.185.33)** — Directory listing acessível. Potencial vazamento de arquivos.
3. **wpp (177.44.191.252)** — Servidor Windows exposto. Apache/PHP — CVE candidates.

### 🟡 ALTO (atrás de Cloudflare, mas com vetor claro)
4. **app.fernandapessoa.com.br** — Next.js → _buildManifest.js vaza rotas → enum API endpoints
5. **loja.fernandapessoa.com.br** — WooCommerce 10.7 → CVEs conhecidos, vazamento de dados de pagamento
6. **fernandapessoa.com.br** — WP 7.1 → CVE research (vulns conhecidos de WP 7.x)
7. **GitHub org** — trufflehog scan → credenciais vazadas em commits

### 🟡 MÉDIO
8. **mautic.fernandapessoa.com.br** — 503 → CVE-2024-XXXX (vários RCEs em Mautic)
9. **smtp01 (54.165.96.105)** — SMTP open relay test, port scan
10. **emails dev** — breach check para cred-stuffing

### 🟢 BAIXO
11. **portal.fernandapessoa.com.br** — Phusion Passenger 6.0.27 → info disclosure?

## Ações Imediatas Recomendadas

1. **Port scan** completo em `187.45.185.33` (cPanel, serviços extras)
2. **Port scan** em `177.44.191.252` (Windows)
3. **Port scan** em `54.165.96.105` (SMTP, serviços AWS)
4. **Cred-stuffing** cPanel/WHM/Webmail (admin/admin, admin/123456, root/root)
5. **Content discovery** nos dir listings de mail/envio
6. **GitHub trufflehog** nos 19 repos