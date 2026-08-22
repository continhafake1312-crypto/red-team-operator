# RECON PASSIVE - SUMMARY

## Resumo
- Subdomínios: 2 (8kiptv.co, www.8kiptv.co)
- IP real: 68.65.122.227 (server391-4.web-hosting.com - Namecheap)
- WAF: LiteSpeed (NÃO Cloudflare como especulado)
- CMS: WordPress 6.9.x + WHMCS billing (multiple installs: /tv/, /tvs/, /tvss/, /stream/)
- WHMCS: /clients/ com /clients/admin/ acessível
- Wordpress users: admin (ID1), admin1 (ID9)
- Debug log EXPOSTO: /stream/wp-content/debug.log (350KB)
- WHMCS admin accessible: /clients/admin/ (HTTP 200)
- WP login: /stream/wp-login.php (HTTP 200)
- Caminho servidor: /home/servpcxr/8kiptv.co/tv/
- Loginizer license exposed: SOFTWP-65975-58186-61378-85147
- E-mail: support@8kiptv.co
- Telefone: +1 (210) 725-7388 (WhatsApp)
- WHOIS privacy: Withheld for Privacy ehf (Iceland)
- Telegram: t.me/8kiptv (exists)
- Domínios relacionados: apollomanagementgroups.com, demo9.all2u-services.com
- Buckets/Takeovers: Nenhum
- Tech: LiteSpeed, PHP, WordPress, Elementor 4.2.2, WHMCS, MonsterInsights, RankMath, MySQL
- Portas abertas (Shodan): 21, 80, 443, 2077, 2096, 8888
- CVEs associados: CVE-2018-14040, CVE-2018-14042, CVE-2018-20677, e outros

## Risk Score: CRÍTICO (8.5/10)
- Debug log exposto (info disclosure - credenciais possíveis)
- WHMCS admin acessível sem autenticação aparente
- WP users enumerados (brute-force facil)
- Caminho do servidor revelado
- Múltiplas instalações WP sem isolamento

## Recomendações Imediatas
1. Download do debug.log completo
2. Brute-force WHMCS /clients/login.php
3. Brute-force WP /stream/wp-login.php (users: admin, admin1)
4. Verificar WHMCS admin /clients/admin/
5. IDOR test nos planos WHMCS
6. Content discovery via FFUF em /clients/ e /stream/
7. Port scan completo (nmap) nas portas abertas
8. Shodan API key para scan completo
9. Telegram channel investigation
10. OSINT no telefone +12107257388
