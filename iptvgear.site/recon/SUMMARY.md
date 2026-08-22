# Summary — Attack Surface iptvgear.site

## Ranking de Payoff (§16)

| Prioridade | Alvo | Vetor | Tipo | Payoff |
|------------|------|-------|------|--------|
| 🔥 **ALTO** | 103.160.107.175:6969 | FTP Anônimo (ProFTPD 1.3.1) | Network | Leitura/escrita arquivos, CVE RCE |
| 🔥 **ALTO** | iptvgear.site | WordPress + WooCommerce | Webapp | Admin, DB, dados financeiros |
| 🟡 **MÉDIO** | 103.160.107.175:6667 | Dovecot IMAP AUTH=PLAIN | Network | Cred stuffing, emails |
| 🟡 **MÉDIO** | GCP Buckets (15 encontrados) | Cloud — geo-restrito | Cloud | Dados backup/assets |
| 🟢 **BAIXO** | iptvgear.com | WordPress via Cloudflare | Webapp | Info adicional |
| 🟢 **BAIXO** | iptvgear.net | Host header injection bypass | Webapp | Bypass Cloudflare |

## Attack Surface

### Network (103.160.107.175 — omega.herosite.pro)
- **6969/tcp**: ProFTPD 1.3.1 — FTP anônimo ✅ (acesso confirmado)
- **6667/tcp**: Dovecot IMAP — AUTH=PLAIN (credenciais texto plano)

### Web (Cloudflare)
- **iptvgear.site**: WordPress + WooCommerce + Jetpack + Wordfence → Cloudflare
- **iptvgear.com**: WordPress → Cloudflare (301 redirect)

### Cloud
- **15 GCP buckets** (geo-restritos — 403 AccessDenied)
- **0 S3/Azure** encontrados

### Credenciais conhecidas
- **Email**: info@iptvgear.com (público)

### OSINT
- **Domínios relacionados**: iptvgear.net (SolidHosting), iptvgear.com
- **Hosting**: omega.herosite.pro (SolidHosting — provedor de hospedagem)
- **Tech Stack**: WordPress, WooCommerce, Jetpack, RankMath SEO, Wordfence, WP Rocket, LiteSpeed Cache, Contact Form 7, LiteSpeed Server, Cloudflare
- **DMARC**: p=none (sem proteção contra spoofing)
- **SPF**: ElasticEmail + Google Workspace
- **WHOIS**: privacidade ativada

## Próximo Passo Imediato
1. 🔴 **CVE research ProFTPD 1.3.1** — buscar RCE para obtenção de foothold
2. 🔴 **Enum/WPScan iptvgear.site** — enumerar WordPress
3. 🟡 **Tentar bypass Cloudflare** via Host header + IP real
4. 🟡 **Tentar FTP file download** via PORT mode com servidor custom