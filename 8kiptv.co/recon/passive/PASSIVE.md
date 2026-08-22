# PASSIVE RECONNAISSANCE / OSINT REPORT

**Target:** 8kiptv.co (IPTV streaming)
**Date:** 2026-08-22
**Engagement:** /home/ubuntu/8kiptv.co/
**Analyst:** recon-passive agent

---

## 1. SUMÁRIO EXECUTIVO

| Item | Count |
|------|-------|
| Subdomínios totais | 2 |
| Subdomínios vivos | 2 (8kiptv.co, www.8kiptv.co) |
| IPs de origem real | 1 (68.65.122.227 - Namecheap shared hosting) |
| CDN | Nenhum (LiteSpeed WAF apenas, não Cloudflare) |
| CMS | WordPress 6.9.x + WHMCS 8.x |
| Users WordPress | 2 (admin, admin1) |
| E-mails encontrados | 1 (support@8kiptv.co) |
| Telefone | +1 (210) 725-7388 |
| Telefone WHOIS | +354.4212434 (Iceland - proxy) |
| Buckets cloud | Nenhum |
| Takeover candidates | Nenhum |
| Endpoints sensíveis | /clients/admin/, /stream/wp-admin/, /stream/wp-login.php, /stream/wp-json/ |
| Debug log exposto | /stream/wp-content/debug.log (350KB+) |
| Domínios relacionados | apollomanagementgroups.com, demo9.all2u-services.com |

**Prioridade**: ALTA - Múltiplas exposures críticas: debug log, WHMCS admin, WP admin/users, caminho do servidor revelado.

---

## 2. DNS / WHOIS HIGHLIGHTS

### WHOIS
| Campo | Valor |
|-------|-------|
| Domínio | 8kiptv.co |
| Registrador | Namecheap Inc (IANA ID: 1068) |
| Criação | 2025-03-13T21:18:57Z |
| Expiração | 2027-03-13T23:59:59Z |
| Última atualização | 2026-03-01T14:56:18Z |
| Status | clientTransferProhibited |
| Registrante (privado) | Withheld for Privacy ehf, Kalkofnsvegur 2, Reykjavik, Iceland |
| E-mail de contato | b24e852f74204666a4824632e0db6ea8.protect@withheldforprivacy.com |
| Telefone | +354.4212434 |
| Nameservers | dns1.namecheaphosting.com, dns2.namecheaphosting.com |
| DNSSEC | unsigned |

### DNS Records
| Tipo | Valor |
|------|-------|
| A | 68.65.122.227 |
| AAAA | Nenhum |
| MX | mx1-hosting.jellyfish.systems (5), mx2 (10), mx3 (20) |
| NS | dns1.namecheaphosting.com, dns2.namecheaphosting.com |
| TXT | v=spf1 +a +mx +ip4:68.65.122.190 include:spf.web-hosting.com ~all |
| DMARC | v=DMARC1; p=none; (SEM PROTEÇÃO) |
| DKIM | Ativo (selector: default) com chave RSA 2048-bit |
| CNAME | www → 8kiptv.co |
| SOA | Presente (padrão Namecheap) |
| HINFO | RFC8482 (bloqueio de consultas ANY) |

### Reverse DNS
68.65.122.227 → **server391-4.web-hosting.com** (Namecheap shared hosting)

### IP Details (Shodan InternetDB)
- **Hostname**: server391-4.web-hosting.com
- **Portas abertas**: 21 (FTP), 80 (HTTP), 443 (HTTPS), 2077 (WebDAV), 2096 (cPanel), 8888
- **Software**: LiteSpeed Web Server, OpenResty 1.31.1.1, Nginx, PHP 8.1.34, Bootstrap 3.3.7
- **Tags**: self-signed, eol-product (end-of-life PHP?)
- **CVEs associados**: CVE-2013-2220, CVE-2019-8331, CVE-2007-3205, CVE-2018-14040, CVE-2018-14042, CVE-2018-20677, CVE-2016-10735, CVE-2018-20676

---

## 3. SUBDOMÍNIOS VIVOS

| Domínio | IP | Status | Título | Tech |
|---------|----|--------|--------|------|
| 8kiptv.co | 68.65.122.227 | 301→200 | 8K IPTV – Free Trial 24h Channels, Movies & Sports | LiteSpeed, WordPress, Elementor 4.2.2, PHP 7.4.33 |
| www.8kiptv.co | 68.65.122.227 | 301→301→200 | 8K IPTV – Free Trial 24h Channels, Movies & Sports | LiteSpeed, WordPress, Elementor 4.2.2, PHP 7.4.33 |

### Outros hosts no mesmo IP
- **server391-4.web-hosting.com** (hostname PTR)
- Potencialmente outros sites no mesmo shared hosting (Namecheap)

---

## 4. TECH STACK (DETALHADO POR HOST)

### 8kiptv.co e www.8kiptv.co

| Componente | Versão | Notas |
|------------|--------|-------|
| Web Server | LiteSpeed | WAF ativo (detectado por wafw00f) |
| OpenResty | 1.31.1.1 | Por trás do LiteSpeed |
| PHP | 7.4.33 (WP) / 8.1.34 (Shodan) | Múltiplas versões possíveis |
| WordPress | 6.9.x | Detectado via debug.log (wp-includes/functions.php line 6170 - mensagem added in version 6.9.1) |
| Elementor | 4.2.2 | Page builder |
| Elementor Pro | Detectado | REST API namespace ativo |
| Essential Addons for Elementor | 6.7.3 | Plugin |
| Hello Elementor Theme | 3.4.6 | Tema ativo |
| MonsterInsights | 11.1.3 | Google Analytics plugin |
| WPForms Lite | 1.10.0.4 | Form builder |
| MetForm | 4.2.0 | Form builder |
| Loginizer Security | 2.0.5 | Plugin de segurança (Softaculous license: SOFTWP-65975-58186-61378-85147) |
| UserFeedback Lite | - | Plugin de feedback |
| RankMath SEO | Detectado | REST API ativo |
| Optimole | Detectado | Image optimization (optml/v1) |
| Skyboot Custom Icons | 1.1.0 | Icon pack |
| Click to Chat for WhatsApp | 4.42.1 | WhatsApp plugin |
| Swiper | 8.4.5 | Slider library |
| jQuery | 3.x | JavaScript library |
| Font Awesome | - | Icon library |
| MySQL | - | Banco de dados |
| WHMCS | Template twenty-one | Sistema de billing/assinaturas |
| Bootstrap | 3.3.7 | Shodan detection |

### WHMCS (Billing System)
- URL: https://8kiptv.co/clients/
- Sistema: WHMCS (versão precisa escondida, template "twenty-one")
- Páginas expostas: `/clients/`, `/clients/admin/` (HTTP 200), `/clients/login.php` (HTTP 200)
- Páginas de store: `/clients/index.php?rp=/store/1-connection/1-month` etc.

---

## 5. CLOUD BUCKETS

**Nenhum bucket encontrado** nas seguintes variações e provedores testados:
- AWS S3 (todas as regiões)
- Google Cloud Storage
- Azure Blob Storage

Variações testadas: `8kiptv`, `8kiptv-co`, `8kiptv-co-assets`, `8kiptv-static`, `8kiptv-backup`, `8kiptv-assets`, `8kiptv-media`, `8kiptv-www`, `iptv`, `kiptv`

---

## 6. SUBDOMAIN TAKEOVER CANDIDATES

**Nenhum** candidato identificado.
- www.8kiptv.co é CNAME para 8kiptv.co (não dangling)
- Nenhum CNAME para serviços cloud (S3, Heroku, GitHub Pages, etc.)

---

## 7. OSINT FINDINGS

### E-mails
| E-mail | Fonte | Notas |
|--------|-------|-------|
| support@8kiptv.co | Site (página principal) | E-mail de contato oficial |
| b24e852f74204666a4824632e0db6ea8.protect@withheldforprivacy.com | WHOIS | E-mail de privacidade (Iceland) |

### Telefones
| Telefone | Fonte | Notas |
|----------|-------|-------|
| +1 (210) 725-7388 | Site (WhatsApp link: wa.me/12107257388) | Número US-based (Texas?) |
| +354.4212434 | WHOIS | Iceland (proxy/privacy service) |

### Redes Sociais
| Plataforma | Status | Notas |
|-----------|--------|-------|
| Telegram | **Encontrado** | t.me/8kiptv → HTTP 200 (existe) |
| Instagram | 8kiptv → não encontrado (429) | - |
| Facebook | Não encontrado | - |
| Twitter/X | Não encontrado | - |
| LinkedIn | Não encontrado | - |
| YouTube | Não encontrado | - |

### GitHub
**Nenhum resultado** para `8kiptv.co` em code, commits, ou issues search.

### Google Dorks
Os dorks retornaram resultados limitados (proteção anti-bot do Google).
Dorks testados:
- `site:8kiptv.co`
- `"8kiptv.co" password`
- `"8kiptv.co" admin`
- `"8kiptv.co" config`
- `"8kiptv.co" backup`

### Domínios Relacionados
| Domínio | IP | Notas |
|---------|----|-------|
| apollomanagementgroups.com | 104.21.1.11 (Cloudflare) | Site gaming/IPTV relacionado (Bengali/English) |
| demo9.all2u-services.com | 77.37.37.197 | Diferente infraestrutura |

### Credential Stuffing Candidates
- **Usuários WordPress**: `admin`, `admin1`
- **E-mail**: support@8kiptv.co
- **Telefone**: +12107257388
- **WHMCS**: Acessível publicamente (força bruta de login possível)

---

## 8. WAYBACK MACHINE

**Wayback Machine**: O site é muito recente (criação 2025-03-13) e o Archive.org retornou rate-limiting (429). Poucos snapshots disponíveis.

### Endpoints Descobertos via Crawl do Site

#### WHMCS / Billing
- `/clients/` - Portal do cliente WHMCS
- `/clients/admin/` - Admin WHMCS
- `/clients/login.php` - Login WHMCS
- `/clients/register.php` - Registro WHMCS
- `/clients/index.php?rp=/store/` - Páginas de produto/assinatura

#### WordPress Admin / API
- `/stream/wp-admin/` - Admin WordPress
- `/stream/wp-login.php` - Login WordPress
- `/stream/wp-json/` - WordPress REST API
- `/stream/wp-json/wp/v2/users/` - **Enumeração de usuários** (admin, admin1)
- `/stream/wp-json/elementor/v1/` - Elementor API
- `/stream/wp-json/monsterinsights/v1/` - MonsterInsights API
- `/stream/wp-json/wp-site-health/v1/` - Site Health API
- `/stream/xmlrpc.php` - XML-RPC

#### Conteúdo / Páginas
- `/stream/` - Frontend WordPress
- `/stream/channel-list/` - Lista de canais
- `/stream/subscriptions/` - Assinaturas
- `/stream/reseller/` - Revendedor
- `/stream/setup-guide/` - Guia de setup
- `/stream/our-app/` - App page
- `/stream/contact-us/` - Contato

#### WordPress (outros caminhos)
- `/tv/` - WordPress install (caminho do servidor: /home/servpcxr/8kiptv.co/tv/)
- `/tvs/` - Outro WordPress install
- `/tvss/` - Outro WordPress install

#### Arquivos / Recursos
- `/stream/wp-content/debug.log` - **DEBUG LOG EXPOSTO (350KB)** - contém caminhos do servidor, PHP warnings
- `/stream/readme.html` - WordPress info
- `/stream/wp-content/plugins/` - Plugins enumeráveis

#### Aplicativos / Endpoints
- `/tv/our-app/`
- `/tv/privacy-policy/`
- `/tv/refund-policy/`
- `/tv/terms-conditions/`

### Parâmetros Identificados
- `rp` (WHMCS route)
- `ver` (CSS/JS versioning)
- `version` (Loginizer updates)
- `license` (Loginizer license key - **exposed!**)
- `onboarding_key` (MonsterInsights)
- `license_key` (MonsterInsights)

### Caminho do Servidor Revelado
O debug.log expôs: **`/home/servpcxr/8kiptv.co/tv/`** - informações críticas:
- Username do servidor: **servpcxr**
- Estrutura de diretórios: múltiplas instalações WordPress
- Plugin Loginizer license: SOFTWP-65975-58186-61378-85147

---

## 9. LIMITAÇÕES / NOTAS

1. **WHOIS**: Domínio .co usa privacy protection (Withheld for Privacy ehf - Iceland)
2. **Wayback Machine**: Rate-limited pelo Archive.org; site muito recente (2025) com poucas snapshots
3. **Google Dorks**: Proteção anti-bot do Google limitou resultados
4. **Shodan**: API key não configurada; usou InternetDB (público gratuito) como fallback
5. **theHarvester**: Múltiplas sources inválidas (google, yandex, dnsdbfarm); Hunter precisava de API key
6. **Subdomínios**: Apenas 2 encontrados; possivelmente site inteiro no mesmo servidor compartilhado
7. **DNS ANY**: Bloqueado pelo servidor (HINFO RFC8482)
8. **Cloudflare**: Site NÃO está atrás de Cloudflare como inicialmente especulado - está atrás de LiteSpeed WAF em hosting compartido Namecheap
9. **OPSEC**: Todos os requests passivos via curl (sem proxychains4 em ferramentas locais que fazem requests diretos como httpx, subfinder, etc.)

---

## 10. PRÓXIMOS PASSOS RECOMENDADOS (RECON ATIVO)

Por ordem de payoff (ALTO → MÉDIO):

### 🔴 ALTA PRIORIDADE
1. **Debug.log completo**: Fazer download completo (350KB) - buscar credenciais, tokens, API keys, e-mails de usuários
2. **WHMCS brute-force**: `/clients/login.php` - testar credenciais padrão (admin:admin, etc.)
3. **WordPress brute-force**: `/stream/wp-login.php` - users `admin` e `admin1` enumerados
4. **WHMCS admin**: `/clients/admin/` - testar acesso padrão
5. **Bypass WHMCS store**: Testar IDOR nos planos `/clients/index.php?rp=/store/`

### 🟡 MÉDIA PRIORIDADE
6. **Content discovery**: FFUF em `/clients/`, `/stream/`, `/tv/`, `/tvs/`, `/tvss/`
7. **WordPress REST API**: Enumerar users, posts, plugins, temas via `/stream/wp-json/wp/v2/`
8. **Elementor Pro**: Verificar se há exposure de templates ou AJAX actions
9. **Loginizer**: Investigar CVE na versão 2.0.5 (plugin com updater vulnerável)
10. **XML-RPC**: Testar `/stream/xmlrpc.php` para system.listMethods e brute-force
11. **Port scan (nmap)**: Escanear as 6 portas abertas (21, 80, 443, 2077, 2096, 8888) com scripts de serviço
12. **FTP**: Verificar se porta 21 permite acesso anônimo ou força bruta
13. **cPanel**: Verificar porta 2096 para login padrão

### 🟢 BAIXA PRIORIDADE
14. **apollomanagementgroups.com**: Investigar relação - mesmo operador?
15. **demo9.all2u-services.com**: Verificar se está relacionado
16. **Shodan**: Configurar API key para scan completo
17. **Vulnerability scan**: CVEs associados ao IP (CVE-2018-14040, etc.)
18. **Social engineering**: Telefone +12107257388 para OSINT de operador
19. **GitHub**: Buscar por `apollomanagementgroups`, `servpcxr`, `8kiptv`
20. **Telegram**: Investigar t.me/8kiptv - possível canal de suporte/grupo de usuários

---

*Report generated by recon-passive agent (OSINT sub-function)*