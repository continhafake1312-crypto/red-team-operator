# PASSIVE.md — Recon Passivo iptvgear.site

## Resumo
- **Domínio**: iptvgear.site
- **Subdomínios encontrados**: 2 (iptvgear.site, www.iptvgear.site)
- **Subdomínios vivos**: 2 (ambos Cloudflare)
- **IPs CDN**: 104.21.45.182, 172.67.218.28 (Cloudflare)
- **IPs fora CDN**: **103.160.107.175 (iptvgear.net)** — NÃO usa Cloudflare
- **Tech Stack**: WordPress + WooCommerce + Jetpack + RankMath SEO + Wordfence + WP Rocket + LiteSpeed Cache + Contact Form 7 + LiteSpeed Server + Cloudflare WAF + Google Trust Services SSL

## Detalhamento

### DNS
- **NS**: Nenhum obtido (Cloudflare oculta)
- **MX**: ElasticEmail + Google Workspace
- **SPF**: inclui ElasticEmail + Google
- **DMARC**: p=none
- **AXFR**: Falhou (protegido)

### Subdomínios
| Subdomínio | IP | CDN? | Status |
|------------|-----|------|--------|
| iptvgear.site | 104.21.45.182 / 172.67.218.28 | Cloudflare | 200 OK |
| www.iptvgear.site | 104.21.45.182 / 172.67.218.28 | Cloudflare | 200 OK |

### Tech Stack (WordPress)
Identificado via whatweb + httpx:
- **CMS**: WordPress 6.x (provável)
- **E-commerce**: WooCommerce
- **Segurança**: Wordfence, Cloudflare WAF
- **SEO**: RankMath SEO
- **Performance**: WP Rocket, LiteSpeed Cache, LiteSpeed Server
- **Formulários**: Contact Form 7
- **CDN**: Cloudflare
- **SSL**: Google Trust Services

### Domínios Relacionados
| Domínio | IP | CDN? | Notas |
|---------|-----|------|-------|
| iptvgear.site | 104.21.45.182 | ✅ Cloudflare | Alvo principal |
| iptvgear.com | 104.21.40.170 | ✅ Cloudflare | Mais antigo (2019) |
| iptvgear.net | 103.160.107.175 | ❌ **Sem Cloudflare** | **Potencial IP real** |

### OSINT
- **Email**: info@iptvgear.com (exposto no site)
- **Pessoas**: Nenhuma (WHOIS com privacidade)
- **Breaches**: Nenhum encontrado
- **GitHub**: Nenhum resultado
- **Domínios relacionados**: iptvgear.com (2019), iptvgear.net (2026, SolidHosting)

### Wayback Machine
- 25 snapshots (2025-03 a 2026-07)
- Apenas 1 captura com HTTP 200 (2025-03-04, página inicial WordPress)
- Demais 403 (Cloudflare bloqueou arquivos históricos)
- **WP REST API exposta** revelou rotas internas:
  - `/free-trial/`
  - `/iptv-affiliate/`
  - `/contact-us/`
  - `/home-3/`

### Cloud Buckets (GCP)
- 15 buckets GCP encontrados (todos geo-restritos → 403 AccessDenied)
- Nada em S3 ou Azure

### Subdomain Takeover
- Nenhum candidato — todos os CNAMEs apontam para Cloudflare ativo

### Limitações
- Cloudflare bloqueia a maior parte do tráfego automatizado
- 2Captcha disponível mas não foi necessário ainda
- Snapshot único do Wayback disponível (19KB)
- iptvgear.net é um vetor prioritário — SEM Cloudflare

## Próximos Passos Imediatos
1. **🔥 PRIORIDADE: Probe direto em iptvgear.net (103.160.107.175)** — sem Cloudflare, potencial IP real de origem
2. Portscan em iptvgear.net para descobrir serviços expostos
3. Bypass Cloudflare via 2Captcha se necessário para /wp-admin
4. Investigar buckets GCP via VPN de outra região
5. Verificar iptvgear.com (WordPress mais antigo, pode ter vulnerabilidades)