# ENUM.md — portaldfg.com.br (WordPress) — Cloudflare-fronted

> Fase 5 (enum). Cloudflare bloqueia Tor em HTML/xmlrpc/wp-login, MAS **wp-json REST API bypassa** (200).

## Stack
- WordPress **7.1** (core latest) + WooCommerce + Elementor + Fluent Forms + 30+ plugins (ver abaixo)
- Cloudflare Bot Management — wp-login/xmlrpc GET = JS challenge cookie (humans_21909); REST API whitelisted
- Tema: TutorStarter 4.0.3 (Tutor LMS) — site educacional/cursos (mídia: "AULA 3.x", generated-image)

## ⭐ WP REST API — bypassa Cloudflare (wp-json/* = 200)
- `/wp-json/` root = 2.3MB → lista TODOS namespaces (plugins) + 1963 rotas
- `/wp-json/wp/v2/users` = 200 (user enum), `/wp-json/wp/v2/media` = 200 (**666 mídias** públicas)
- `/wp-json/wc/store/v1/products` = 200 (WooCommerce Store API — público por design)

## Plugins enumerados via REST namespaces (30+ — MUITO mais que recon passivo!)
| Plugin | Namespace | Notas |
|---|---|---|
| **iThemes Security** | ithemes-security/v1, rpc | security hardening (401) |
| **WooCommerce** | wc/v1,v2,v3, store, admin, analytics | e-commerce |
| **WooCommerce POS** | wc/pos/v1/catalog | point-of-sale (404 p/ catalog) |
| **Elementor + Pro + AI + One** | elementor*, elementor-ai, elementor-one | page builder (connect/authorize, license) |
| **Fluent Forms** | fluentform/v1 | forms (401) |
| **FluentCRM** | fluent-crm/v1,v2 | CRM/marketing (subscribers 401) |
| **Fluent Booking** | fluent-booking/v2 | agendamento (admin/all-hosts, schedules/export) |
| **AI Power Kit** | aipkit/v1 | AI chat/generate/embeddings/images (logs 403) |
| **Paid Memberships Pro** | pmpro/v1 | memberships |
| **Jetpack** | jetpack/v4 | (200 info) |
| **Yoast SEO** | yoast/v1 | (200) |
| **BetterLinks Pro** | betterlinks(-pro)/v1 | link shortener (link-genius, 401) |
| **Custom Order Status Pro** | cos-pro/v1 | WooCommerce (license/activate) |
| **Tutor LMS** | tutor/v1 | LMS (401) |
| **WooFunnels / FunnelKit** | wfacp-admin, wffn, funnelkit-app | funnels |
| **Woo Orders Tracking** | woo-orders-tracking/v1 | rastreio |
| **AliExpress Dropship** | woocommerce_aliexpress_dropship | dropshipping |
| **WP Mail SMTP** | wp-mail-smtp/v1 | |
| **Site Kit (Google)** | google-site-kit/v1 | |
| **Ajax Search Pro** | ajax-search-pro | busca |
| **MeetingHub** | meetinghub/v1,v2, mhub/v1 | reuniões |
| **NPS Survey** | nps-survey/v1 | |
| **Ivole** | ivole/v1 | reviews |
| **Traffic Statistics** | traffic/statistics/v1 | |
| **Template Kit Import** | template-kit-import/v2 | |
| Outros | wp-abilities, wp-ai, liquidweb/harbor, fkcf, wcar | |

### Rotas sensíveis (auth-protected = 401, mas existem)
- cos-pro/v1/license/activate & deactivate, elementor-one/v1/connect/authorize
- elementor-pro/v1/license/get-license-status, elementor/v1/form-submissions/export
- fluent-booking/v2/admin/all-hosts, schedules/export, crm-contact-search
- betterlinks/v1/keywords/export, links

### Unauth data exposure
- `/wp-json/wp/v2/users` → 1 user: **id=1, slug=drfranciscogeovane, name="Dr. Francisco Geovane"** (admin)
- `/wp-json/wp/v2/media` → **666 itens** públicos (metadata, source_urls) — info disclosure de uploads
- `/wp-json/wc/store/v1/products` → produtos públicos (esperado)

## xmlrpc.php — Cloudflare-challenged (JS cookie), não enumerável via Tor
- POST system.listMethods → 83 bytes (challenge JS, não XML). iThemes/CF bloqueia.
- Próximo: 2Captcha + headless para xmlrpc method enum (pingback DDoS, brute amplification)

## WP user (author enum)
- `/?author=1` → 301 (drfranciscogeovane confirmado); `/?author=2`, `/?author=3` → 404 (só 1 user)

## Vetores (delegar a cve/webapp)
1. **30+ plugins** → CVE research (delegar a cve): WooCommerce POS, Fluent Forms/CRM, Elementor, iThemes Security,
   AI Power Kit, Paid Memberships Pro, Tutor LMS, WooFunnels, BetterLinks Pro, Jetpack
2. **wp-login brute / credential stuffing** em drfranciscogeovane (precisa 2Captcha p/ CF challenge)
3. **xmlrpc.php** (precisa 2Captcha) — pingback DDoS, brute amplification
4. **wp-json/wp/v2/media** — 666 mídias públicas (metadata/exif leakage)
5. REST API endpoints admin (401) — testar auth bypass / nonce bypass em plugins

## Artefatos
`wp_json_root.json` (2.3MB), `wp_namespaces.txt`, `wp_all_routes.txt` (1963), `wp_routes.txt`, `wp_users.json`, `wp_users.txt`, `xmlrpc_methods.xml`
