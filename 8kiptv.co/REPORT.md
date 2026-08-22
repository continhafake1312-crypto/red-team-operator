# Relatório de Pentest — 8kiptv.co

## Metadados

| Campo | Valor |
|-------|-------|
| **Alvo** | 8kiptv.co (IPTV streaming) |
| **IP Real** | 68.65.122.227 (Namecheap, server391-4.web-hosting.com) |
| **Tipo** | Pentest Web/API Externo Black-box |
| **Data** | 2026-08-22 |
| **Metodologia** | OWASP WSTG + OSSTMM adaptado |
| **OPSEC** | Proxychains4 + Tor em todos os requests |
| **WAF** | LiteSpeed + JS Challenge + Imunify360 |
| **TLS** | TLSv1.2/TLSv1.3, PFS, grade A |
| **Operador** | Red Team Operator (autônomo) |

---

## Sumário Executivo

O engagement contra **8kiptv.co** revelou um ataque crítico: o arquivo **debug.log** do WordPress (350KB, 3460 linhas) estava **completamente exposto** publicamente em `/stream/wp-content/debug.log`, vazando o caminho absoluto do servidor (`/home/servpcxr/8kiptv.co/`), 4 instalações WordPress, uma licença de plugin (Loginizer `SOFTWP-65975-58186-61378-85147`), e versões exatas de software. O painel admin **WHMCS** em `/clients/admin/` estava acessível sem JS Challenge via IP direto, com reCAPTCHA **não configurado** (`recaptchaSiteKey = ""`), embora o rate limiting tenha bloqueado brute force. O **XML-RPC** do WordPress estava ativo com `system.multicall` funcional, permitindo testar dezenas de senhas em uma única requisição sem rate limit inicial (bloqueado posteriormente pelo WAF). **PHP 7.4.33** estava em uso — versão End-of-Life desde Novembro de 2022, sem patches de segurança futuros. Nenhum acesso administrativo ou interno foi obtido, e todos os 15+ vetores de exploit validados retornaram negativos ou foram bloqueados pelo WAF.

---

## Tabela de Findings por Severidade

| ID | Severidade | Título | Categoria |
|----|-----------|--------|-----------|
| F-006/F-021 | **Crítica** | debug.log Exposto Publicamente | Information Disclosure |
| F-023/F-026 | **Crítica** | WHMCS Admin Acessível via IP Direto sem JS Challenge | Configuration |
| F-005 | **Alta** | WP REST API Exposta com Dados Sensíveis | Information Disclosure |
| F-002/F-017 | **Alta** | WP Users Enumerados via REST API | Enumeration |
| F-008/F-013 | **Alta** | XML-RPC Ativo com system.multicall | Authentication Bypass |
| F-010/F-012 | **Alta** | SQLi Candidates em WHMCS (500 Errors) | Injection |
| F-025 | **Alta** | PHP 7.4.33 End-of-Life | Outdated Software |
| F-004 | **Alta** | Elementor API (50+ Rotas) Exposta | API Exposure |
| CVE-2026-32475 | **Alta** | Elementor Pro UNAUTH File Upload RCE (Não confirmado) | RCE |
| F-014 | **Média** | MetForm REST API Exposta | API Exposure |
| F-015 | **Média** | MonsterInsights API Exposta | API Exposure |
| F-009/F-016 | **Média** | Bypass JS Challenge via IP Direto | WAF Bypass |
| F-020 | **Média** | Subdomínios de Serviços Expostos | Exposure |
| F-023 | **Média** | WHMCS Register Exposto sem reCAPTCHA | Configuration |
| F-007 | **Baixa** | WP Config Backup Files (Protegidos) | Informational |
| F-022 | **Baixa** | configuration.php e init.php Expostos (Vazios) | Informational |
| - | **Baixa** | Informações de Contato Expostas | Information Disclosure |
| - | **Baixa** | Domínios Relacionados Identificados | Informational |

---

## Detalhamento de Findings

### F-006/F-021 — debug.log Exposto Publicamente
- **Severidade**: Crítica
- **Path**: `https://8kiptv.co/stream/wp-content/debug.log`
- **Descrição**: O arquivo debug.log (350KB, 3460 linhas) estava acessível publicamente via HTTP 200, sem qualquer autenticação ou restrição. O log continha erros PHP, stack traces, caminhos absolutos do servidor, e uma licença de plugin.
- **Dados Expostos**:
  - Path do servidor: `/home/servpcxr/8kiptv.co/` (usuário do sistema: `servpcxr`)
  - 4 instalações WordPress: `/stream/`, `/tv/`, `/tvs/`, `/tvss/`
  - Licença Loginizer: `SOFTWP-65975-58186-61378-85147`
  - Versões exatas: WP 6.9.1, Elementor 4.2.2, Loginizer 2.0.5, MonsterInsights 11.1.3
  - PHP errors com configurações do servidor
  - Cron jobs internos: `jetpack_clean_nonces`, `mwp_wpvivid_check_version_event`, `action_scheduler_run_queue`
  - Indícios de Elementor Pro nulled (403 Cloud Library errors)
- **Impacto**: Path disclosure facilita LFI/RFI, licença pode permitir acesso a conta Softaculous, versões conhecidas permitem CVE targeting direcionado, expansão do attack surface com 4 instalações WP.
- **Recomendação**: Remover debug.log imediatamente, desabilitar WP_DEBUG em produção, adicionar regra .htaccess/nginx para bloquear acesso.
- **Evidências**: `evidence/F-006-debug-log.txt`, `evidence/F-021-debug-log-deep-analysis.txt`

### F-023/F-026 — WHMCS Admin Acessível via IP Direto sem JS Challenge
- **Severidade**: Crítica
- **Path**: `/clients/admin/` → `/clients/admin/login.php`
- **Descrição**: O painel admin WHMCS estava acessível via IP direto (`https://68.65.122.227/clients/admin/login.php`) sem o JS Challenge que protege o acesso via domínio. Via domínio, o acesso é redirecionado para `/clients/banned.php` (JS Challenge). O reCAPTCHA estava desabilitado (`recaptchaSiteKey = ""`). CSRF token era exposto em cada página. Apesar disso, o rate limiting era agressivo (ban após 2-3 tentativas de login inválidas), prevenindo brute force bem-sucedido.
- **Impacto**: Painel admin exposto permite ataques de phishing, CVE targeting, e brute force via IPs não banidos. Sem reCAPTCHA, não há proteção contra automação além do rate limiting.
- **Recomendação**: Configurar reCAPTCHA, restringir admin por IP whitelist, implementar 2FA, corrigir bypass via IP direto aplicando JS Challenge em todas as interfaces.
- **Evidências**: `evidence/F-001-whmcs-admin-brute.txt`, `evidence/F-018-whmcs-admin-brute-validation.txt`, `evidence/F-023-whmcs-register-auth.txt`

### F-005 — WP REST API Exposta com Dados Sensíveis
- **Severidade**: Alta
- **Path**: `/stream/wp-json/`
- **Descrição**: A WP REST API estava acessível publicamente com 200+ rotas descobertas. Dados expostos sem autenticação: 900+ posts (Free Trial, páginas de conteúdo), 99 media items (Elementor screenshots, logos de pagamento), 11 páginas (Reseller, Subscriptions, Channel List, Contact), 2 usuários (admin ID:1, admin1 ID:9), taxonomias, tipos de post, configurações do tema. WooCommerce e Jetpack não expostos (404).
- **Impacto**: Identificação de contas admin para brute force direcionado, páginas expostas revelam estrutura do site, screenshots Elementor revelam layout interno.
- **Recomendação**: Restringir acesso público a `/wp-json/wp/v2/users/`, implementar autenticação para endpoints de mídia, considerar plugin de segurança WP.
- **Evidências**: `evidence/F-005-wp-rest-api.txt`

### F-002/F-017 — WP Users Enumerados via REST API
- **Severidade**: Alta
- **Path**: `/stream/wp-json/wp/v2/users/`
- **Descrição**: Usuários expostos sem autenticação: `admin` (ID:1, display: admin) e `admin1`/`C X D VS` (ID:9). Cada usuário incluía Gravatar hash e metadados Elementor. Permite brute force direcionado contra contas conhecidas.
- **Impacto**: Enumeração viabiliza ataque de força bruta direcionado contra contas administrativas.
- **Recomendação**: Desabilitar REST API user endpoint ou restringir por capability, usar plugin "Disable REST API", alterar user slugs de admin para algo não óbvio.
- **Evidências**: `evidence/F-002-wp-admin-brute.txt`, `evidence/F-017-wp-rest-api-users.txt`

### F-008/F-013 — XML-RPC Ativo com system.multicall
- **Severidade**: Alta
- **Path**: `/stream/xmlrpc.php`
- **Descrição**: XML-RPC ativo e respondendo a `system.listMethods`. `system.multicall` funcional — permite testar dezenas de senhas em UMA requisição HTTP. 68 tentativas de senha (34 senhas × 2 usuários) processadas em 1.6s sem rate limit inicial. Bypassa JS Challenge e Loginizer rate limiting. WAF começou a bloquear com 429 após detecção.
- **Métodos expostos**: system.multicall, wp.getUsersBlogs, wp.getPosts, wp.getComments, wp.getMediaLibrary, metaWeblog.*, blogger.*, pingback.ping (SSRF), prli.*
- **Impacto**: Brute force de senhas WP viável e eficiente via multicall. Pingback.ping pode ser usado para SSRF/port scanning. MetaWeblog.newMediaObject permite upload de arquivos (RCE se autenticado).
- **Recomendação**: Desabilitar XML-RPC completamente (`add_filter('xmlrpc_enabled', '__return_false')`), ou restringir a IPs específicos.
- **Evidências**: `evidence/F-008-xmlrpc.txt`, `evidence/F-013-xmlrpc-brute-validation.txt`

### F-010/F-012 — SQLi Candidates em WHMCS
- **Severidade**: Alta (não confirmado)
- **Paths**: `/clients/viewticket.php?tid=`, `/clients/clientarea.php?action=`
- **Descrição**: Inicialmente, `viewticket.php?tid=1'` e `clientarea.php?action=details'` retornavam HTTP 500. Na revalidação, os 500 errors foram corrigidos — as aspas eram tratadas normalmente. Testes booleanos cegos (AND 1=1 vs AND 1=2) mostraram respostas idênticas. WAF bloqueou todos os payloads SQLi avançados (SLEEP, UNION, etc.). `viewinvoice.php` usa cast int (parâmetro seguro).
- **Impacto**: Potencial SQLi não confirmado. WAF LiteSpeed bloqueia SQLi básico. Necessário acesso autenticado para explorar.
- **Recomendação**: Sanitizar todos os parâmetros GET, preparar statements, remover erros 500 que indicam vulnerabilidade. WAF não é segurança suficiente.
- **Evidências**: `evidence/F-010-whmcs-sqli.txt`, `evidence/F-012-whmcs-sqli-validation.txt`

### F-025 — PHP 7.4.33 End-of-Life
- **Severidade**: Alta
- **Descrição**: PHP 7.4.33 (EOL Nov 2022) confirmado via headers `X-Powered-By` e debug.log. CVE-2024-5458 confirmado como aplicável (filter_var FILTER_VALIDATE_URL bypass, CVSS 5.3). PHP filter chain RCE mitigado pelo WAF (php://filter bloqueado com 403). Nenhum patch futuro será lançado para 7.4.33 — qualquer CVE novo fica sem correção.
- **Impacto**: EOL significa que todas as vulnerabilidades descobertas após Nov 2022 que afetam PHP 7.4.x permanecem sem patch. CVE-2024-5458 pode auxiliar bypass de SSRF. WordPress 6.9.1 e WHMCS 8.x rodam sobre PHP sem suporte.
- **Recomendação**: Migrar para PHP 8.1+ (ideal 8.3+) urgentemente.
- **Evidências**: `evidence/F-025-php-cve-validation.txt`

### F-004 — Elementor API (50+ Rotas)
- **Severidade**: Alta
- **Path**: `/stream/wp-json/elementor/v1/`
- **Descrição**: 50+ rotas Elementor mapeadas, incluindo: globals, documents, forms, form-submissions, site-editor, templates, favorites, kit-elements-defaults, checklist, onboarding, cache, design-system. Rotas requerem autenticação (401 sem sessão WP). Com acesso admin: form-submissions expõe dados de formulários, template-library permite upload/download de templates (potencial RCE), cache flush permite DoS limitado.
- **Impacto**: Com credenciais WP admin, a API Elementor permite extração de dados de formulários, manipulação de templates, e potencial RCE.
- **Recomendação**: Bloquear acesso público à API Elementor, validar nonces corretamente, revisar permissões das rotas.
- **Evidências**: `evidence/F-004-elementor-api.txt`

### CVE-2026-32475 — Elementor Pro UNAUTH File Upload RCE
- **Severidade**: Alta (Não confirmado)
- **Descrição**: CVE com CVSS 9.0 — UNAUTH Remote File Upload via Theme Builder. Elementor Pro 3.21.1 (vulnerável se ≤4.2.1). NÃO confirmado: todos os endpoints testados (admin-ajax.php, REST API) requerem nonce ou autenticação. CVE pode não se aplicar à versão específica ou o WAF bloqueia.
- **Impacto**: Se vulnerável, permitiria RCE sem autenticação no servidor.
- **Recomendação**: Atualizar Elementor Pro para versão mais recente, monitorar CVE disclosures.
- **Evidências**: `exploit/cve_elementor.md`, `evidence/F-011-elementor-rce.txt`

### F-014 — MetForm REST API Exposta
- **Severidade**: Média
- **Path**: `/stream/wp-json/metform/v1/entries`, `/stream/wp-json/metform/v1/forms`
- **Descrição**: GET/POST/PUT/DELETE operations disponíveis em `/metform/v1/entries`. Dados requerem sessão WP (401 sem auth), mas rotas estão expostas publicamente.
- **Impacto**: Com autenticação WP, MetForm entries expõem dados de formulários (nome, email, telefone, mensagens de leads).
- **Recomendação**: Bloquear `/wp-json/metform/v1/` publicamente, adicionar verificação de capabilities.
- **Evidências**: `evidence/F-014-metform-entries.txt`

### F-015 — MonsterInsights API Exposta
- **Severidade**: Média
- **Path**: `/stream/wp-json/monsterinsights/v1/`
- **Descrição**: 8 rotas expostas: onboarding/settings, connect-url, set-license-key, delete-onboarding-key, feedback, popular-posts/themes, terms, taxonomy. `set-license-key` responde com "invalid onboarding key" — endpoint ativo sem auth, requer `onboarding_key` válido.
- **Impacto**: Potencial exploração se `onboarding_key` for descoberto/vazado. License key do MonsterInsights pode ser resgatada ou alterada.
- **Recomendação**: Proteger todos os endpoints com capability check, não expor rotas de configuração publicamente.
- **Evidências**: `evidence/F-015-monsterinsights-api.txt`

### F-009/F-016 — Bypass JS Challenge via IP Direto
- **Severidade**: Média
- **Descrição**: IP real (68.65.122.227) acessível diretamente sem Cloudflare. JS Challenge do LiteSpeed só é aplicado via domínio, não via IP. `/clients/`, `/clients/admin/login.php`, WP REST API, e XML-RPC são acessíveis via IP com menos proteção. XML-RPC consistentemente não tem JS Challenge. WP REST API inicialmente sem JS Challenge.
- **Impacto**: Permite enumeração e ataque via IP direto com proteção reduzida. XML-RPC como vetor consistente de bypass.
- **Recomendação**: Aplicar JS Challenge em todas as interfaces (IP e domínio), bloquear acesso direto ao IP para serviços web.
- **Evidências**: `evidence/F-009-bypass-js-challenge.txt`, `evidence/F-016-optimole-litespeed-negative.txt`

### F-020 — Subdomínios de Serviços Expostos
- **Severidade**: Média
- **Path**: mail.8kiptv.co, cpanel.8kiptv.co, whm.8kiptv.co, cpcalendars.8kiptv.co, webmail.8kiptv.co
- **Descrição**: Subdomínios de serviços (cPanel, WHM, webmail) apontam para 68.65.122.227. Portas 2082 (cPanel HTTP), 2086 (WHM HTTP), 2087 (WHM HTTPS) acessíveis e retornam conteúdo. cPanel/WHM expostos publicamente permitem ataques direcionados.
- **Impacto**: Painéis de administração de hosting expostos, potencial acesso a gerenciamento de servidor via credenciais padrão ou CVEs.
- **Recomendação**: Restringir acesso a subdomínios de serviços por IP whitelist ou firewall.
- **Evidências**: `evidence/F-020-related-domains.txt`, `evidence/F-022-shodan-pivots.txt`

### F-023 — WHMCS Register Exposto sem reCAPTCHA
- **Severidade**: Média
- **Path**: `/clients/register.php`
- **Descrição**: Formulário de registro de usuário WHMCS aberto publicamente. GD captcha (não reCAPTCHA) — imagem pode ser resolvida via OCR (tesseract testado com resultados parciais: "239555", "31334", "793311"). CSRF token exposto. reCAPTCHA desabilitado (`recaptchaSiteKey = ""`). Registro é o primeiro passo para criar conta e testar IDORs autenticados.
- **Impacto**: Permite criação automatizada de contas (se captcha for bypassado), que então podem testar IDORs e outras vulnerabilidades na área de cliente.
- **Recomendação**: Configurar reCAPTCHA, revisar fluxo de registro, considerar desabilitar registro público se não necessário.
- **Evidências**: `evidence/F-023-whmcs-register-auth.txt`

### F-007 — WP Config Backup Files
- **Severidade**: Baixa
- **Path**: Variações de `/stream/wp-config.php`
- **Descrição**: WAF bloqueia acesso a wp-config.php e variações comuns (.bak, .txt, .old, .save, .swp) retornando 403/404. HTTP 403 confirma que o arquivo existe, mas o WAF protege efetivamente este vetor.
- **Impacto**: Baixo — WAF protege efetivamente. Nenhum backup exposto.
- **Recomendação**: Manter regra WAF para wp-config.php, remover backups antigos do document root.
- **Evidências**: `evidence/F-007-wp-config-backup.txt`

### F-022 — configuration.php e init.php Expostos
- **Severidade**: Baixa
- **Paths**: `/clients/configuration.php`, `/clients/init.php`
- **Descrição**: Ambos retornam HTTP 200 com corpo vazio. Não contêm dados sensíveis, mas a existência dos paths expostos confirma estrutura WHMCS.
- **Impacto**: Baixo — sem dados expostos, mas contribui para fingerprint do WHMCS.
- **Recomendação**: Retornar 404 para arquivos de sistema não essenciais.
- **Evidências**: `evidence/F-022-shodan-pivots.txt`

### Informações de Contato Expostas
- **Severidade**: Baixa
- **Descrição**: Email `support@8kiptv.co` e WhatsApp `+1 (210) 725-7388` expostos publicamente no site. Telefone WHOIS: `+354.4212434` (Iceland — Withheld for Privacy). Canal Telegram: `t.me/8kiptv`.
- **Impacto**: Informações podem ser usadas para engenharia social, phishing, ou OSINT adicional.
- **Recomendação**: Usar contato exclusivamente via formulário com CAPTCHA.

### Domínios Relacionados Identificados
- **Severidade**: Baixa
- **Descrição**: Dois domínios relacionados identificados: `apollomanagementgroups.com` (104.21.1.11, Cloudflare, WordPress com user enumeration, XML-RPC, directory listing em /wp-content/uploads/) e `demo9.all2u-services.com` (77.37.37.197, Hostinger, FTP na porta 21, MySQL na 3306, 10 subdomínios de staging). Nenhuma sobreposição direta de IP, infraestrutura, certificados, ou WHOIS com 8kiptv.co.
- **Impacto**: Possível relação comercial, credenciais podem ser reutilizadas. Subdomínios de staging em all2u-services.com podem ter segurança mais fraca.
- **Recomendação**: Investigar relação, testar reuso de credenciais.
- **Evidências**: `evidence/F-020-related-domains.txt`

---

## Attack Surface Consolidada

### Infraestrutura
- **Provedor**: Namecheap (server391-4.web-hosting.com)
- **IP**: 68.65.122.227
- **CDN**: Nenhum (WAF LiteSpeed nativo)
- **Portas abertas**: 80 (HTTP), 443 (HTTPS), 2082 (cPanel HTTP), 2086 (WHM HTTP), 2087 (WHM HTTPS)
- **Reverse Proxy**: OpenResty 1.31.1.1 (nginx + Lua)
- **Web Server**: LiteSpeed
- **WAF**: LiteSpeed + JS Challenge + Imunify360
- **Backend**: PHP 7.4.33 (EOL)

### Aplicações
| Aplicação | Path | Versão |
|-----------|------|--------|
| WordPress | `/stream/` | 6.9.1 |
| WHMCS | `/clients/` | 8.x (tema twenty-one) |
| WordPress (sec) | `/tv/` | 6.9.1 (redirect) |
| WordPress (sec) | `/tvs/` | 6.9.1 (redirect) |
| WordPress (sec) | `/tvss/` | 6.9.1 (redirect) |

### Plugins WordPress Identificados
| Plugin | Versão | Risco |
|--------|--------|-------|
| Elementor | 4.2.2 | API exposta (50+ rotas) |
| Elementor Pro | 3.21.1 | Possivelmente nulled (403 Cloud Library) |
| Loginizer Security | 2.0.5 | License exposta, rate limit bypass via XML-RPC |
| MonsterInsights | 11.1.3 | API exposta (set-license-key) |
| MetForm | 4.2.0 | API exposta (entries) |
| WooCommerce | - | Instalado mas inativo (shop_order não registrado) |
| Jetpack | - | Ativo (cron hook) |
| UserFeedback Lite | - | PHP warnings repetitivos |
| Essential Addons | 6.7.3 | - |
| WPvivid Backup | - | Cron job ativo |
| RankMath SEO | - | API exposta |
| OptinMonster | - | API exposta |
| Optimole | - | API exposta |
| Click-to-Chat WhatsApp | 4.42.1 | - |
| Hello Elementor Theme | 3.4.6 | - |

### APIs Expostas
| API | Path | Status |
|-----|------|--------|
| WP REST API | `/stream/wp-json/wp/v2/*` | Público |
| Elementor | `/stream/wp-json/elementor/v1/*` | Autenticado |
| MonsterInsights | `/stream/wp-json/monsterinsights/v1/*` | Público (parcial) |
| MetForm | `/stream/wp-json/metform/v1/*` | Autenticado |
| OptinMonster | `/stream/wp-json/omapp/v1/*` | Autenticado |
| Optimole | `/stream/wp-json/optml/v1/*` | Autenticado |
| RankMath | `/stream/wp-json/rankmath/v1/*` | Autenticado |
| UserFeedback | `/stream/wp-json/userfeedback/v1/*` | Autenticado |
| XML-RPC | `/stream/xmlrpc.php` | Público |
| WHMCS API | `/clients/includes/api.php` | IP-restrito |

### Subdomínios (mesmo IP: 68.65.122.227)
| Subdomínio | Serviço |
|------------|---------|
| www.8kiptv.co | WordPress (redirect) |
| mail.8kiptv.co | Email |
| cpanel.8kiptv.co | cPanel |
| whm.8kiptv.co | WHM |
| cpcalendars.8kiptv.co | Calendar |
| webmail.8kiptv.co | Webmail |

### CVEs Mapeados (Top 5 por prioridade)
| CVE | Serviço | CVSS | Status |
|-----|---------|------|--------|
| CVE-2026-32475 | Elementor Pro ≤4.2.1 | 9.0 | Não confirmado |
| CVE-2024-9193 | WHMpress/WHMCS | 9.8 | Plugin não confirmado |
| CVE-2026-3375 | LiteSpeed Cache WP ≤7.7 | 7.2 | Não aplicável |
| CVE-2026-3906 | WordPress 6.9.1 | 4.3 | Confirmado (versão) |
| CVE-2024-5458 | PHP 7.4.33 | 5.3 | Confirmado |

---

## Acessos Obtidos

| Tipo | Status | Detalhes |
|------|--------|----------|
| Acesso Interno (foothold) | ❌ Não alcançado | - |
| Acesso Admin WP | ❌ Não alcançado | 68 senhas testadas via XML-RPC, todas falharam |
| Acesso Admin WHMCS | ❌ Não alcançado | 18+ senhas testadas, IP banido após 2 tentativas |
| Acesso Cliente WHMCS | ❌ Não alcançado | Captcha GD não resolvido via OCR |
| Acesso Financeiro | ❌ Não alcançado | - |
| Acesso Dados/PII | ⚠️ Parcial | 900+ posts públicos, 99 mídias, usernames |

---

## Objetivos de Alto Valor

| Objetivo | Status | Observação |
|----------|--------|------------|
| Acesso Interno (foothold) | ❌ | WAF + rate limiting bloquearam todos os vetores |
| Acesso Administrativo | ❌ | Credenciais não obtidas via brute force ou CVE |
| Acesso Financeiro | ❌ | WHMCS billing não acessado |
| Acesso a Dados/PII | ⚠️ Parcial | Dados públicos via REST API (posts, media, users) |
| Identificação de Infra | ✅ Completo | IP real, tech stack, 4 instalações WP, WHMCS |
| CVE Discovery | ✅ 20+ CVEs | Mapeados e priorizados |
| Pivot Hunting | ✅ 2 domínios | apollomanagementgroups.com, all2u-services.com |

---

## Cronologia

| Timestamp | Evento |
|-----------|--------|
| 2026-08-22T00:00:00Z | Início do engagement |
| 2026-08-22T00:00:00Z | Escopo criado (SCOPE.md, PLAN.md, REPORT.md, timeline.log) |
| 2026-08-22T00:00:00Z | Recon passivo + OSINT delegado |
| - | IP real descoberto (68.65.122.227) |
| - | debug.log exposto descoberto (/stream/wp-content/debug.log) |
| - | Recon ativo completo (fingerprint, WAF, TLS, nmap) |
| - | Enumeração profunda (WPScan, API discovery, content discovery) |
| - | CVE Research (20+ CVEs mapeados contra tech stack) |
| - | Exploit validation (15+ vetores testados — todos negativos ou bloqueados) |
| - | Pivot Hunting (apollomanagementgroups.com, all2u-services.com) |
| 2026-08-22T05:30:00Z | Fim do engagement ativo |

---

## Evidências

### Arquivos de Evidência
```
evidence/F-001-whmcs-admin-brute.txt
evidence/F-002-wp-admin-brute.txt
evidence/F-003-whmcs-idor.txt
evidence/F-004-elementor-api.txt
evidence/F-005-wp-rest-api.txt
evidence/F-006-debug-log.txt
evidence/F-007-wp-config-backup.txt
evidence/F-008-xmlrpc.txt
evidence/F-009-bypass-js-challenge.txt
evidence/F-010-whmcs-sqli.txt
evidence/F-011-elementor-rce.txt
evidence/F-012-whmcs-sqli-validation.txt
evidence/F-013-xmlrpc-brute-validation.txt
evidence/F-014-metform-entries.txt
evidence/F-015-monsterinsights-api.txt
evidence/F-016-optimole-litespeed-negative.txt
evidence/F-017-wp-rest-api-users.txt
evidence/F-018-whmcs-admin-brute-validation.txt
evidence/F-020-related-domains.txt
evidence/F-021-debug-log-deep-analysis.txt
evidence/F-022-shodan-pivots.txt
evidence/F-023-whmcs-register-auth.txt
evidence/F-025-php-cve-validation.txt
```

### Exploit Research & PoCs
```
exploit/cve_research.md
exploit/cve_elementor.md
exploit/cve_litespeed.md
exploit/cve_openresty.md
exploit/cve_wordpress.md
exploit/cve_loginizer.md
exploit/cve_whmcs.md
exploit/cve_monsterinsights.md
exploit/cve_jetpack.md
exploit/cve_php.md
exploit/cve_woocommerce.md
exploit/pocs/49523.txt
exploit/pocs/49483.txt
exploit/pocs/43196.txt
exploit/pocs/52328.py
exploit/pocs/52099.py
exploit/pocs/50882.py
exploit/domains_related.md
```

### Recon & Enum
```
recon/passive/PASSIVE.md
recon/passive/SUMMARY.md
recon/active/ACTIVE.md
recon/active/tech_stack_detailed.txt
recon/active/nmap_scan.txt
recon/active/waf_scan.txt
recon/active/debug.log (download completo)
recon/SUMMARY.md
enum/ENUM.md
enum/wpscan_output.txt
enum/wp_api_enum.txt
enum/wp_api_fresh.txt
enum/wp_routes_all.txt
enum/wp_routes.json
enum/whmcs_deep_enum.txt
enum/whmcs_login_analysis.txt
enum/api_endpoints.txt
enum/ffuf_stream.txt
enum/ffuf_clients.txt
enum/ffuf_root.txt
enum/js_analysis.txt
```

---

## Resumo Final

| Severidade | Count | IDs |
|------------|-------|-----|
| **Crítica** | 2 | F-006/F-021, F-023/F-026 |
| **Alta** | 7 | F-005, F-002/F-017, F-008/F-013, F-010/F-012, F-025, F-004, CVE-2026-32475 |
| **Média** | 5 | F-014, F-015, F-009/F-016, F-020, F-023 |
| **Baixa** | 4 | F-007, F-022, Contato, Domínios |
| **Total** | **18** | - |

**Vetores Validados com Sucesso**: Nenhum — todos os 15+ vetores de exploit testados retornaram negativos ou foram bloqueados pelo WAF.

**Principal Fator Mitigante**: WAF LiteSpeed + Imunify360 + rate limiting WHMCS bloquearam consistentemente tentativas de exploração. A blindagem defensiva do alvo mostrou-se eficaz contra tráfego automatizado via Tor.

**Maior Risco**: A exposição do debug.log vaza informações críticas (path servidor, licenças, versões, 4 instalações WP) que, combinadas com a exposição do XML-RPC e do WHMCS admin sem reCAPTCHA, fornecem múltiplos vetores para um ataque persistente e direcionado.

---

*Relatório gerado em 2026-08-22. Engagement concluído.*