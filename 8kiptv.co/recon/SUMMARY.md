# Attack Surface Consolidado — 8kiptv.co

## Ranking de Payoff (§16)

Classificado por impacto potencial no objetivo do pentest:

| Prioridade | Vetor | Tipo | Host/Path | Payoff Potencial | Severidade |
|------------|-------|------|-----------|------------------|------------|
| 🥇 1 | **debug.log exposto** | Info Disclosure | `/stream/wp-content/debug.log` | Path servidor completo, licenças, plugins, versões, WP config leak | **Crítica** |
| 🥇 2 | **WHMCS admin login** | Admin Panel | `/clients/admin/` | Acesso admin billing (clientes, pagamentos) | **Crítica** |
| 🥇 3 | **WHMCS billing login** | Auth Bypass/Brute | `/clients/` | Acesso a contas de clientes, faturas | **Crítica** |
| 🥇 4 | **WordPress admin** | Auth Bypass/Brute | `/stream/wp-login.php` | Acesso admin WP (RCE via editor de temas/plugins) | **Crítica** |
| 🥇 5 | **WP users enumerados** | Enumeration | `/stream/wp-json/wp/v2/users/` | admin (ID1), admin1 (ID9) | **Alta** |
| 🥈 6 | **Loginizer 2.0.5 CVEs** | CVE Research | WP plugin | RCE/SQLi se CVE aplicável | **Alta** |
| 🥈 7 | **Elementor API** | API Aberta | `/stream/wp-json/elementor/v1/` | Upload, template injection | **Alta** |
| 🥈 8 | **WooCommerce** | Payment/Creds | WP plugin | Info de pagamentos, clientes | **Alta** |
| 🥈 9 | **Jetpack API** | API | WP plugin | Info disclosure, tokens | **Média** |
| 🥈 10 | **MonsterInsights API** | API | `/stream/wp-json/monsterinsights/v1/` | License keys, analytics config | **Média** |
| 🥉 11 | **Múltiplas instalações WP** | Lateral Movement | `/tv/`, `/tvs/`, `/tvss/` | Possíveis paths com configs diferentes | **Média** |
| 🥉 12 | **LiteSpeed cache** | Tech | Server | Potenciais cache poisoning/dumping | **Baixa** |
| 🥉 13 | **OpenResty JS Challenge** | WAF Bypass | `/stream/` | Bypass via IP real ou subdomínios | **Baixa** |
| 🥉 14 | **Subdomínios/domínios relacionados** | Attack Surface | apollomanagementgroups.com, demo9.all2u-services.com | Novos vetores de pivoting | **Info** |

## Resumo do Attack Surface

### Infraestrutura
- **IP Real**: `68.65.122.227` (Namecheap / server391-4.web-hosting.com) — **NÃO** usa Cloudflare
- **Portas abertas**: 80 (HTTP), 443 (HTTPS) — as demais filtradas por firewall
- **Web Server**: LiteSpeed (proxy) + OpenResty 1.31.1.1 (dominant)
- **WAF**: LiteSpeed WAF + JS Challenge (cloudflare-edge-cache headers no OpenResty)

### Aplicações
1. **WordPress 6.9.1** em `/stream/` com plugins: Elementor 4.2.2, WooCommerce, Jetpack, Loginizer 2.0.5, MonsterInsights
2. **WHMCS 8.x** em `/clients/` com admin em `/clients/admin/`
3. **Instalações secundárias WP**: `/tv/`, `/tvs/`, `/tvss/` (redirecionam para `/stream/`)

### Dados Expostos
- **debug.log** → Full path: `/home/servpcxr/8kiptv.co/`, license: `SOFTWP-65975-58186-61378-85147`, PHP errors
- **WP REST API** → `/stream/wp-json/wp/v2/users/` (users: admin, admin1)
- **Elementor API** → `/stream/wp-json/elementor/v1/`
- **MonsterInsights API** → `/stream/wp-json/monsterinsights/v1/`

### Acessos Conhecidos
- **Contact/WhatsApp**: +1 (210) 725-7388
- **Email**: support@8kiptv.co
- **WP Users**: admin, admin1 (C X D VS)
- **WHOIS proxy**: +354.4212434 (Iceland, Withheld for Privacy)

## Próximas Ações Imediatas (Recomendadas)

1. **Enum** → WPScan contra WP 6.9.1, content discovery em `/clients/` e `/stream/`
2. **Webapp** → Brute force WHMCS admin + WP login, Elementor API exploration
3. **CVE** → Pesquisar CVEs para Loginizer 2.0.5, Elementor 4.2.2, WHMCS 8.x
4. **Exploit** → Validar debug.log exposure, testes de IDOR em WHMCS