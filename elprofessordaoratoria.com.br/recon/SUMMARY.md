# Attack Surface Summary — elprofessordaoratoria.com.br

## Ranking de Payoff (atualizado)

| # | Vetor | Payoff | Status | Notas |
|---|-------|--------|--------|-------|
| 1 | **Portainer** 2.21.5 (Docker UI) | **CRÍTICO** | 🔍 Testando | Creds default falharam. Preciso de CVE research ou brute. |
| 2 | **n8n** (82.112.244.187) | **CRÍTICO** | ⏳ Aguardando | RCEs conhecidos, precisa confirmar porta |
| 3 | **MinIO** (82.112.244.187) | **ALTO** | ⏳ Aguardando | S3 storage interno |
| 4 | **Supabase** (82.112.244.187) | **ALTO** | ⏳ Aguardando | Backend Firebase-like |
| 5 | **Odoo** (82.112.244.187) | **ALTO** | ⏳ Aguardando | ERP com CVEs |
| 6 | **Mautic** (login + password reset) | **ALTO** | 🔍 Testando | Creds default falharam, password reset disponível |
| 7 | **Dify / Baserow** (82.112.244.187) | **ALTO** | ⏳ Aguardando | AI platform + no-code DB |
| 8 | **API GCP** (35.199.71.234) | **MÉDIO** | 🔍 Testando | 404 todos endpoints |
| 9 | **FTP** (147.93.38.23) | **MÉDIO** | 🔍 Testando | Anônimo negado, brute? |
| 10 | **WordPress** (Elementor/Yoast) | **MÉDIO** | ⏳ Aguardando | wpscan pendente |
| 11 | **Subdomain takeover** | **BAIXO** | ⏳ Aguardando | Candidates fracos |
| 12 | **DMARC p=none** | **BAIXO** | ⏳ Aguardando | Spoofing possível |

## IPs de Origem Real

| IP | Provider | Serviços |
|---|----------|----------|
| `89.117.32.51` | Hostinger | Main site (WP), portainer, mautic, cursos, www |
| `35.199.71.234` | GCP | api.elprofessordaoratoria.com.br |
| `147.93.38.23` | Hostinger | ftp.elprofessordaoratoria.com.br |
| `82.112.244.187` | Hostinger | n8n, MinIO, Supabase, Odoo, Dify, Baserow, CRM, S3 |
| `35.199.94.181` | GCP | pixels.novadimensaohub.com.br |

## Tech Stack

- **Main**: WordPress, PHP 8.2.27, Apache 2.4.62 (Debian), Elementor 3.23.1, Yoast SEO 23.0
- **Portainer**: 2.21.5 (Angular SPA)
- **Mautic**: Unknown version (PHP 7.4.33, Apache 2.4.54)
- **API**: GCP (Google Cloud Run? App Engine?)
- **FTP**: LiteSpeed

## Observações OPSEC

- **Cloudflare**: NÃO detectado. IPs reais diretamente acessíveis.
- **Tor**: Bloqueado pela Hostinger. Conexões via IP real do operador no momento.
- **Rate limiting**: Aplicar com cautela para evitar bloqueio do IP do operador.