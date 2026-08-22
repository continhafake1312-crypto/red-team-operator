# Enumeration Report: iptvgear.site

## 1. WPScan Results

**Status**: Parcialmente bloqueado pelo Cloudflare WAF.
- WPScan identificou: Cloudflare, `cf-mitigated: challenge`, LiteSpeed Server
- NÃO foi possível completar o fingerprinting completo (plugins, themes, users) devido ao rate limiting e WAF

**Tech Stack Identificado (httpx)**:
- CMS: **WordPress 6.7.7**
- Page Builder: **WPBakery** (js_composer)
- Framework: **Redux Framework 4.5.11**
- Slider: **Slider Revolution 6.2.22**
- Cache: **WP Rocket**, **LiteSpeed Cache**
- SEO: **RankMath SEO**
- Security: **Wordfence**, **Cloudflare WAF**
- Backup/Security: **Jetpack**
- Forms: **Contact Form 7**
- Server: **LiteSpeed**, **PHP**, **MySQL**
- E-commerce: **OpenCart** (em /shop/)

## 2. WP REST API Endpoints Acessíveis

**22 namespaces descobertos** (482 rotas):

### Namespaces Críticos:

| Namespace | Rotas | Status |
|-----------|-------|--------|
| `/wp/v2` | 118 rotas | Parcialmente público |
| `/jetpack/v4` | 192 rotas | Requer auth |
| `/rankmath/v1` | 52 rotas | Parcialmente público |
| `/wordfence/v1` | 9 rotas | Requer auth |
| `/wpcom/v2` | 65 rotas | Requer auth |
| `/contact-form-7/v1` | 6 rotas | Bloqueado (`wpcf7_forbidden`) |
| `/wp-rocket/v1` | 5 rotas | Requer auth |
| `/wp-site-health/v1` | 8 rotas | Acessível (info de sistema) |
| `/wp-block-editor/v1` | 4 rotas | Requer auth |
| `/jetpack-boost/v1` | 4 rotas | Requer auth |
| `/oembed/1.0` | 2 rotas | Público |
| `/my-jetpack/v1` | 15 rotas | Requer auth |

### Endpoints Públicos Confirmados:

| Endpoint | Status | Conteúdo |
|----------|--------|----------|
| `/wp-json/` | **200 OK** | Root REST API (396KB) |
| `/wp-json/wp/v2/posts` | **200** | `[]` (vazio) |
| `/wp-json/wp/v2/pages` | **200** | Sem páginas públicas |
| `/wp-json/wp/v2/comments` | **200** | `[]` (vazio) |
| `/wp-json/wp/v2/categories` | **200** | Categorias expostas (ID 18: sem nome) |
| `/wp-json/wp/v2/tags` | **200** | Tags expostas (ID 5: sem nome) |
| `/wp-json/wp/v2/types` | **200** | Post types (post, page, etc) |
| `/wp-json/wp/v2/statuses` | **200** | Status disponíveis |
| `/wp-json/wp/v2/taxonomies` | **200** | Taxonomias |
| `/wp-json/wp/v2/users` | **401** | `rest_user_cannot_view` |
| `/wp-json/wp/v2/users/1` | **401** | `rest_user_invalid_id` |
| `/wp-json/wp/v2/users/me` | **401** | `rest_not_logged_in` |
| `/wp-json/rankmath/v1/` | **200** | Namespace info |
| `/wp-json/wp-site-health/v1/` | **200** | Namespace info |
| `/wp-json/wp-rocket/v1/` | **200** | Namespace info |
| `/wp-json/wordfence/v1/` | **200** | Namespace info |
| `/wp-json/wp-block-editor/v1/` | **200** | Namespace info |

### Endpoints Protegidos (401/403):
- `/wp/v2/settings` - `rest_forbidden`
- `/wp/v2/plugins` - `rest_cannot_view_plugins`
- `/wp/v2/themes` - `rest_cannot_view_themes`
- `/contact-form-7/v1/contact-forms` - `wpcf7_forbidden`
- `/wordfence/v1/config` - `rest_forbidden_context`
- `/jetpack/v4/settings` - `rest_forbidden`
- `/wpcom/v2/admin-color` - `rest_forbidden`

## 3. Users Descobertos

### User "admin" Confirmado:
- **Author archive**: `/author/admin/` → **200 OK** (redirect 301→301→200)
- Página de autor existe com conteúdo do site
- REST API user enumeration bloqueada (`wp_user_cannot_view`, `rest_user_invalid_id`)
- `?author=N` enumeration: todos retornam 404

### Emails Associados:
- `info@iptvgear.com` (confirmado via recon passivo)

### User Enumeration Vetores:
- `/author/admin/` → confirmado
- Gravatar não é confiável (default image para todos)
- Feed RSS não expõe autores

## 4. Cloudflare Bypass

### Resultados:

**Cloudflare (104.21.45.182, 172.67.218.28)**:
- Site protegido por Cloudflare WAF + Challenge (Turnstile)
- **httpx conseguiu bypass parcial** → respostas REST API obtidas
- Tor + proxychains: Cloudflare Challenge (Human verification)
- curl direto: Sempre bloqueado (403/JS Challenge)

**IP Real (103.160.107.175 - omega.herosite.pro)**:
- **INACESSÍVEL** - portas 80, 443, 8080, 8443, etc: timeout
- Firewall bloqueando todo tráfego externo
- IP responde apenas via Cloudflare proxy

**Bypass Obtido**:
- httpx conseguindo bypass do Cloudflare (provavelmente User-Agent + HTTP/3)
- WP REST API parcialmente acessível
- `/author/admin/` funcional
- `/shop/` e `/shop/admin/` acessíveis

## 5. Candidatos a Vulnerabilidade

### Críticos:

1. **WordPress 6.7.7** - Verificar CVEs conhecidos
2. **Slider Revolution 6.2.22** - **Alto risco**: Versão antiga (última: 6.7+) com CVEs conhecidos de RCE e upload arbitrário
3. **Redux Framework 4.5.11** - Verificar CVEs
4. **WPBakery** - Page builder com histórico de vulnerabilidades

### Médio:

5. **OpenCart em /shop/** - Admin panel exposto em `/shop/admin/`
6. **WP REST API** - Namespaces expostos com informações do sistema
7. **Category/Tag IDs expostos** - ID 18 (category), ID 5 (tag) sem nomes
8. **Contact Form 7** - Endpoint REST existe mas bloqueado
9. **Wordfence exposto** - Namespace `/wordfence/v1` com rotas de autenticação

### Baixo:

10. **Author "admin"** - Usuário enumerável via author archive
11. **readme.html** - Confirma versão do WordPress
12. **license.txt** - Expõe informações do WordPress
13. **Sitemap XML** - Páginas expostas para crawling
14. **Application Passwords** - Desabilitado (bom, não vulnerável)
15. **/.env** - Bloqueado (403 LiteSpeed)
16. **wp-config.php** - Bloqueado (Wordfence)

## 6. Próximos Passos Recomendados

### Imediatos:

1. **Slider Revolution 6.2.22**: Pesquisar exploit (RCE via upload de arquivos)
2. **Brute Force**: WP Login via Tor + proxy rotation (admin:password list)
3. **OpenCart Admin**: Testar `/shop/admin/` com credenciais default (admin:admin, admin:12345)
4. **XML-RPC**: Testar com proxychains + Tor
5. **XSS Testing**: Formulários de contato, comentários

### Curto Prazo:

6. **Plugin Enumeration**: Testar mais plugins via `/wp-content/plugins/{slug}/readme.txt`
7. **REST API Abuse**: Testar endpoints autenticados com tokens padrão
8. **WPScan Full**: Executar com delays maiores e --force via proxychains
9. **Nuclei**: Se disponível, rodar templates WordPress
10. **Subdomain Enumeration**: Verificar subdomínios (acessar escopo expandido)

### Longo Prazo:

11. **OpenCart Audit**: Verificar versão e CVEs conhecidos
12. **Cloudflare Bypass Continuado**: Testar com cloudscraper, flareSolverr
13. **Google Dorking**: `site:iptvgear.site inurl:wp-content`
14. **Wayback Machine**: Quando online, buscar endpoints históricos
15. **Social Engineering**: info@iptvgear.com para spear phishing

---

*Relatório gerado em 2026-08-21 durante engajamento de pentest autorizado.*