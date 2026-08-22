# Enumeração Profunda — 8kiptv.co

## 1. Sumário Executivo

- **Domínio**: 8kiptv.co | **IP Real**: 68.65.122.227
- **WAF**: LiteSpeed + Imunify360 (JS Challenge ativo em todos os paths)
- **WordPress 6.9.1** em `/stream/` com **Elementor 4.2.2 + Pro 3.21.1**
- **WHMCS 8.x** em `/clients/` com admin em `/clients/admin/`
- **15+ plugins** identificados via JS/API
- **200+ rotas REST** descobertas no WP-JSON
- **debug.log** exposto: path servidor e licenças vazadas
- **WPScan**: 403 inicial (WAF), bypass com `--random-user-agent` + fresh Tor IP
- **Imunify360**: bloqueia IPs Tor após alguns requests

## 2. WPScan & WordPress Fingerprinting

### Versões Confirmadas
| Componente | Versão | Fonte |
|---|---|---|
| WordPress | 6.9.1 | debug.log, /readme.html, WP API |
| PHP | 7.4.33 | Header x-powered-by |
| LiteSpeed | - | Header Server: LiteSpeed |
| OpenResty | 1.31.1.1 | Recon prévio |

### Plugins Identificados (via JS + API Routes)
| Plugin | Versão | API Routes |
|---|---|---|
| Elementor | 4.2.2 | /elementor/v1/* (40+ rotas) |
| Elementor Pro | 3.21.1 | /elementor-pro/v1/* |
| Elementor One | - | /elementor-one/v1/* |
| Hello Elementor Theme | 3.4.6 | /elementor-hello-elementor/v1/* |
| Essential Addons for Elementor | 6.7.3 | - |
| Metform | 4.2.0 | /metform/v1/* |
| Click-to-Chat WhatsApp | 4.42.1 | /joinchat/v1/* |
| MonsterInsights (GA for WP) | 11.1.3 | /monsterinsights/v1/* |
| OptinMonster | - | /omapp/v1/* (18 rotas) |
| Optimole | - | /optml/v1/* (20 rotas) |
| RankMath SEO | - | /rankmath/v1/* |
| UserFeedback | - | /userfeedback/v1/* |
| WP-Abilities | - | /wp-abilities/v1/* |
| WooCommerce | - | Não expõe REST API |
| Jetpack | - | Jetpack v4 routes (protegidas) |
| Loginizer | 2.0.5 | debug.log (Softaculous license) |

### Users WP
| ID | Username | Display Name | Avatar Gravatar |
|---|---|---|---|
| 1 | admin | admin | 972f477e... |
| 9 | admin1 | C X D VS | b15ff82f... |

### Paths WP Expostos
- `/stream/xmlrpc.php` — XML-RPC **ativado**
- `/stream/readme.html` — readme do WordPress
- `/stream/wp-content/debug.log` — **debug.log exposto** (crítico)
- `/stream/wp-cron.php` — WP-Cron externo ativado

## 3. Content Discovery

### ffuf Results (limitado — Imunify360 bloqueou)
Os scans ffuf via proxychains ficaram limitados a ~1 req/sec e foram bloqueados pelo Imunify360. Os paths a seguir foram verificados manualmente via curl:

### /clients/ (WHMCS - sem JS Challenge)
| Path | Status | Tamanho | Nota |
|---|---|---|---|
| /clients/ | 200 | - | Página principal WHMCS |
| /clients/admin/ | 302 | 0 | Redirect ao login |
| /clients/admin/index.php | 302 | 0 | Login page |
| /clients/admin/configapps.php | 404 | 2446 | Página 404 WHMCS (CSRF token incluso) |
| /clients/admin/systemhealth.php | 404 | 2446 | idem |
| /clients/admin/version.php | 404 | 2446 | idem |
| /clients/admin/license.php | 404 | 2446 | idem |
| /clients/admin/supportannouncements.php | 302 | 0 | Auth required |
| /clients/admin/clients.php | 302 | 0 | Auth required |
| /clients/admin/invoices.php | 302 | 0 | Auth required |
| /clients/admin/orders.php | 302 | 0 | Auth required |
| /clients/admin/transactions.php | 302 | 0 | Auth required |
| /clients/admin/supporttickets.php | 302 | 0 | Auth required |
| /clients/download.php | 404 | 26648 | Full WHMCS page (404 no file) |
| /clients/viewinvoice.php?id=1 | 302 | 0 | Auth required |
| /clients/api/ | 403 | 45 | IP restrito |
| /clients/includes/api.php | 403 | 45 | IP restrito |
| /clients/oauth/ | 302 | 0 | Auth required |
| /clients/register.php | 200 | - | Registro de usuário |
| /clients/clientarea.php | 200 | - | Login |
| /clients/cart.php?a=view | 200 | - | Carrinho |
| /clients/contact.php | 200 | - | Contato |

### /stream/ (WordPress - com JS Challenge)
| Path | Status | Nota |
|---|---|---|
| /stream/ | 200 | Site principal |
| /stream/wp-json/ | 200 | REST API (precisa bypass Imunify360) |
| /stream/xmlrpc.php | 200 | XML-RPC ativo |
| /stream/readme.html | 200 | WordPress readme |
| /stream/wp-content/debug.log | 200 | **debug.log exposto** |
| /stream/wp-cron.php | 200 | WP-Cron externo |
| /stream/wp-login.php | 200 | Login WP |

### Raiz /
| Path | Status | Nota |
|---|---|---|
| / | 301 | Redirect para /stream/ |
| /clients/ | 200 | WHMCS |
| /tv/ | 301 | Redirect p/ /stream/ |
| /tvs/ | 301 | Redirect p/ /stream/ |
| /tvss/ | 301 | Redirect p/ /stream/ |

### Robots / Sitemap / Well-Known
| Path | Status | Nota |
|---|---|---|
| /robots.txt | 404 | Não existe |
| /stream/robots.txt | 404 | Não existe |
| /clients/robots.txt | 404 | Não existe |
| /sitemap.xml | 404 | Não existe |
| /stream/sitemap.xml | 301 | Redirect |
| /.well-known/ | 403 | Bloqueado |

## 4. JS Analysis

### JavaScript files encontrados (via homepage HTML)
- `/stream/wp-content/plugins/click-to-chat-for-whatsapp/new/inc/assets/js/app.js?ver=4.42.1`
- `/stream/wp-content/plugins/elementor-pro/assets/js/elements-handlers.min.js?ver=3.21.1`
- `/stream/wp-content/plugins/elementor-pro/assets/js/frontend.min.js?ver=3.21.1`
- `/stream/wp-content/plugins/elementor/assets/js/frontend.min.js?ver=4.2.2`
- `/stream/wp-content/plugins/essential-addons-for-elementor-lite/assets/front-end/js/view/general.min.js?ver=6.7.3`
- `/stream/wp-content/plugins/google-analytics-for-wordpress/assets/js/frontend-gtag.js?ver=11.1.3`
- `/stream/wp-content/plugins/metform/public/assets/lib/cute-alert/cute-alert.js?ver=4.2.0`
- `/stream/wp-content/themes/hello-elementor/assets/js/hello-frontend.js?ver=3.4.6`
- `/stream/wp-content/uploads/essential-addons-elementor/eael-388.js?ver=1786601151`

### Secrets & Endpoints extraídos (dos JS baixados)
- API endpoints via regex: rotas `/api/v1/`, `elementor/v1/`, `monsterinsights/v1/`, etc
- WP nonces e ajax actions (embutidos no JS do Elementor/plugins)
- Nenhum JWT token ou AWS key encontrado nos JS públicos

## 5. WHMCS Deep Enum

### WHMCS Version
- **8.x** (confirmado: tema blend, CSS com `v=7ebeff`)
- Admin theme: **blend**
- Client theme: **twenty-one**

### CSRF Tokens Capturados
| Path | CSRF Token |
|---|---|
| /clients/admin/configapps.php | c0b4d0f406fddda0407944253349ff781baa61eb |
| /clients/admin/systemhealth.php | 116ae38d46d724bcfd5caf1c18a16b13e00c5bca |
| /clients/admin/version.php | ffb34987e2d05ada4975ea5bfd5f31fea4f972a9 |
| /clients/admin/license.php | a4a6ca0f3ec05a5605b209872a3eab44d03e2dad |
| /clients/ (client area) | 61f686574dc4b0ef6708227323348003d0763133 |

### API
- `/clients/api/` — 403, IP restrito (`Invalid IP 109.70.100.11`)
- `/clients/includes/api.php` — 403, IP restrito
- WHMCS API requer whitelist de IP

### IDOR Candidates
- `/clients/viewinvoice.php?id=N` — requer autenticação (302 sem login)
- `/clients/download.php` — retorna página WHMCS completa, sem arquivo específico
- `/clients/register.php` — registro de usuário (potencial para criar conta)

### WHMCS Products
- Free Trial
- 1 Connection
- 2 Connections
- 3 Connections
- Reseller Plans

### Configurações adicionais
- `whmcsBaseUrl = "/clients"`
- `adminBaseRoutePath = "/admin"`
- `datepickerformat = "dd/mm/yy"`
- `recaptchaSiteKey = ""` (reCAPTCHA **não configurado**)

## 6. WP REST API Enum

### Rotas Públicas Acessíveis

#### WP Core (/wp/v2)
| Rota | Método | Acesso | Dados Expostos |
|---|---|---|---|
| /wp/v2/users | GET | **Público** | admin (ID1), admin1/C X D VS (ID9) |
| /wp/v2/posts | GET | Público | 900+ posts (produtos IPTV) |
| /wp/v2/pages | GET | Público | Pages, incluindo reseller |
| /wp/v2/media | GET | Público | Media library (ex: payment-logo.png) |
| /wp/v2/comments | GET | Público | Vazio (sem comentários) |
| /wp/v2/types | GET | Público | Post types registrados |
| /wp/v2/statuses | GET | Público | Status de posts |
| /wp/v2/taxonomies | GET | Público | Taxonomias |
| /wp/v2/categories | GET | Público | Categorias |
| /wp/v2/tags | GET | Público | Tags |
| /wp/v2/settings | GET | **401** | Requer auth |
| /wp/v2/plugins | GET | **401** | Requer auth |
| /wp/v2/themes | GET | **401** | Requer auth |
| /wp/v2/users/me | GET | **401** | Requer auth |

#### Elementor (/elementor/v1)
| Rota | Método | Nota |
|---|---|---|
| /elementor/v1/globals | GET | 401 (requer auth) |
| /elementor/v1/globals/colors | GET | Protegido |
| /elementor/v1/globals/typography | GET | Protegido |
| /elementor/v1/documents | GET | Protegido |
| /elementor/v1/forms | GET | Protegido |
| /elementor/v1/form-submissions | GET | Protegido |
| /elementor/v1/site-editor/templates | GET | Protegido |
| /elementor/v1/template-library/templates | GET | Protegido |
| /elementor/v1/user-data/current-user | GET | Protegido |
| /elementor/v1/checklist | GET | Protegido |
| /elementor/v1/onboarding | GET | Protegido |

**Total: 40+ rotas Elementor descobertas**

#### MonsterInsights (/monsterinsights/v1)
| Rota | Método | Parâmetros |
|---|---|---|
| /monsterinsights/v1/feedback | POST | - |
| /monsterinsights/v1/onboarding/settings | GET/POST | onboarding_key |
| /monsterinsights/v1/onboarding/connect-url | GET | license_key, onboarding_key |
| /monsterinsights/v1/onboarding/set-license-key | POST | license_key, onboarding_key |
| /monsterinsights/v1/onboarding/delete-onboarding-key | POST | onboarding_key |
| /monsterinsights/v1/popular-posts/themes/{type} | GET | type |
| /monsterinsights/v1/terms/{slug} | GET | slug |
| /monsterinsights/v1/taxonomy/{slug} | GET | slug |

#### OptinMonster (/omapp/v1) — **NOVO**
| Rota | Função |
|---|---|
| /omapp/v1/account/connect | Conexão de conta |
| /omapp/v1/account/sync | Sincronização |
| /omapp/v1/campaigns/refresh | Refresh de campanhas |
| /omapp/v1/me | Dados do usuário |
| /omapp/v1/notifications | Notificações |
| /omapp/v1/settings | Configurações |
| /omapp/v1/plugins | Plugins |
| /omapp/v1/wpforms/forms | WPForms integração |
| /omapp/v1/support | Suporte |
| /omapp/v1/api | API |

#### Optimole (/optml/v1) — **NOVO**
| Rota | Função |
|---|---|
| /optml/v1/connect | Conexão |
| /optml/v1/disconnect | Desconexão |
| /optml/v1/optimizations | Otimizações |
| /optml/v1/insert_images | Inserir imagens |
| /optml/v1/move_image | Mover imagem |
| /optml/v1/number_of_images_and_pages | Contagem |
| /optml/v1/poll_optimized_images | Status otimização |
| /optml/v1/register_service | Registro de serviço |
| /optml/v1/upload_onboard_images | Upload imagens |
| /optml/v1/settings | Configurações |
| /optml/v1/clear_cache_request | Limpar cache |

#### RankMath (/rankmath/v1) — **NOVO**
| Rota | Função |
|---|---|
| /rankmath/v1/an | Analytics |
| /rankmath/v1/links/links | Links |
| /rankmath/v1/links/posts | Posts com links |
| /rankmath/v1/status | Status |

#### UserFeedback (/userfeedback/v1) — **NOVO**
| Rota | Função |
|---|---|
| /userfeedback/v1/surveys | Pesquisas CRUD |
| /userfeedback/v1/settings | Configurações |
| /userfeedback/v1/results-summary | Sumário resultados |
| /userfeedback/v1/search | Busca |
| /userfeedback/v1/addons | Addons |

#### MetForm (/metform/v1) — **NOVO**
| Rota | Função |
|---|---|
| /metform/v1/entries | **Entradas de formulário (leads)** |
| /metform/v1/forms | Formulários |

#### Join.chat (/joinchat/v1) — **NOVO**
| Rota | Função |
|---|---|
| /joinchat/v1/track-click | Rastreamento de clique WhatsApp |

#### WP-Abilities (/wp-abilities/v1) — **NOVO**
| Rota | Função |
|---|---|
| /wp-abilities/v1/abilities | Capacidades WP |
| /wp-abilities/v1/categories | Categorias |

## 7. API Endpoints Descobertos

### WHMCS API
- `/clients/api/` — REST API (IP-restrito)
- `/clients/includes/api.php` — Legacy API (IP-restrito)
- `/clients/oauth/` — OAuth2

### WP REST API
- `/stream/wp-json/` — Index (200+ routes)
- `/stream/xmlrpc.php` — XML-RPC (ativo)
- `/stream/wp-json/wp/v2/*` — Core WP
- `/stream/wp-json/elementor/v1/*` — Elementor
- `/stream/wp-json/elementor-pro/v1/*` — Elementor Pro
- `/stream/wp-json/monsterinsights/v1/*` — MonsterInsights
- `/stream/wp-json/omapp/v1/*` — OptinMonster
- `/stream/wp-json/optml/v1/*` — Optimole
- `/stream/wp-json/rankmath/v1/*` — RankMath
- `/stream/wp-json/metform/v1/*` — MetForm
- `/stream/wp-json/userfeedback/v1/*` — UserFeedback
- `/stream/wp-json/joinchat/v1/*` — Join.chat
- `/stream/wp-json/wp-abilities/v1/*` — WP-Abilities
- `/stream/wp-json/batch/v1` — Batch processing
- `/stream/wp-json/oembed/1.0/*` — oEmbed

### Swagger/OpenAPI/GraphQL
- `/swagger.json` — Bloqueado (Imunify360)
- `/openapi.json` — Bloqueado
- `/graphql` — Bloqueado

## 8. Parâmetros Candidatos a Injeção/IDOR

### WHMCS
- `id` (viewinvoice.php) — IDOR em faturas
- `token` — CSRF token (login bypass)
- `rp` — Route parameter (admin path traversal?)
- `a` — Action parameter (cart, etc)
- `language` — Language switching
- `search` — Search parameter (SQLi candidate)
- `action, module, paymentmethod` — WHMCS common params

### MonsterInsights
- `license_key` — License key (vazamento)
- `onboarding_key` — Onboarding key

### Elementor
- `post` — Post ID
- `term` — Term ID
- `user` — User ID

### WordPress
- `page_id, post, s, category, _wpnonce, action`

## 9. Próximos Passos Recomendados

1. **WAF Bypass**: Usar sessão playwright + cookies para bypass do Imunify360 e executar ffuf agressivo
2. **IDOR Testing**: Testar `/clients/viewinvoice.php?id=N` com IDs sequenciais
3. **Elementor API Auth Bypass**: Testar se endpoints Elementor aceitam requests sem autenticação (CVE research)
4. **MetForm Entries**: `/stream/wp-json/metform/v1/entries` pode expor leads de formulário
5. **debug.log Exploitation**: Usar caminhos e licenças do debug.log para acessar áreas restritas
6. **XML-RPC Brute Force**: Testar login via XML-RPC (velocidade maior que wp-login)
7. **WHMCS Login Brute Force**: Testar credenciais comuns no `/clients/admin/`
8. **OptinMonster API Abuse**: Verificar se `/omapp/v1/settings` ou `/omapp/v1/api` estão abertos
9. **Optimole Upload**: Verificar se `/optml/v1/upload_onboard_images` permite upload arbitrário
10. **RankMath Links**: /rankmath/v1/links pode expor estrutura interna de links