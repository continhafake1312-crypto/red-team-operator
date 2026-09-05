# ENUM.md — Fase 5 Consolidação — dfg.com.br

> Enumeração profunda de cada host vivo. Fase 5 (§5). OPSEC: Tor + proxychains4, IPs de origem diretos.

## Sumário executivo

| Host (origem) | Descobertas-chave | Payoff |
|---|---|---|
| **mail.dfg.com.br** (164.68.104.26) | 10 .asmx SOAP WSDL público (**239 ops admin**); /EWS/Exchange.asmx (401); unauth SOAP rejeitado | ⭐⭐⭐ |
| **suppliers.dfg.com.br** (161.97.106.115) | register.aspx ABERTO; requests-xml.aspx XXE/XML-inj (CurrencyCode refletido); stack traces vazam `C:\DFGames\Old\Suppliers-AZR\`; teste.aspx dev artifact | ⭐⭐⭐ |
| **old.dfg.com.br / antigo.dfg.com.br** (161.97.106.114) | ⭐ **NOVO subdomínio antigo.dfg.com.br**; `/admin/changeadminlevel?Level=` (PRIVILEGE ESCALATION); `/ipn.aspx` PayPal IPN (no auth, payment forgery) | ⭐⭐⭐ |
| **mail.astarium.com** (77.237.241.198) | Mailcow API (X-API-Key needed); default admin/moohoo **REJEITADO**; SOGo + autodiscover expostos | ⭐⭐ |
| **dfg-nuxt** (Cloudflare) | 122 JS baixados (CF bypass em _nuxt/*.js); 16 API endpoints + 492 paths; descoberta antigo.dfg.com.br + dfg.local; nenhum secret hardcoded | ⭐⭐ |
| **portaldfg.com.br** (Cloudflare) | WP REST API bypassa CF; **30+ plugins** enumerados (vs 5 no recon); 666 mídias públicas; xmlrpc CF-challenged | ⭐⭐ |

---

## Descobertas de MAIOR VALOR (acionáveis para webapp/exploit/cve)

### 1. ⭐ antigo.dfg.com.br — NOVO subdomínio + Privilege Escalation
- Descoberto via análise de JS do Nuxt (não estava no recon).
- `antigo.dfg.com.br/admin/changeadminlevel?Level=9` (em 161.97.106.114, auth-protected) → **GET param controla nível admin**.
- Após credential stuffing (acgarzon/salesmgr@dfgames), escalar Level=9 → admin total.
- Próximo: webapp valida post-login.

### 2. SmarterMail 15.7 — 239 operações admin .asmx (WSDL público)
- WSDL 100% público (info disclosure do contrato admin completo).
- SOAP calls requerem sysadmin creds (acgarzon@dfg.com.br via /Login.aspx credential stuffing).
- /EWS/Exchange.asmx (401) → mailbox access com creds.
- AuthenticateUser/LoginValidated (svcUserAdmin) = oráculo de validação de creds.
- Próximo: cve (SmarterMail 15.7 CVEs) + exploit (cred stuffing).

### 3. suppliers register.aspx ABERTO + requests-xml.aspx XXE
- Registro de fornecedor aberto (CAPTCHA needed p/ automatizar).
- `requests-xml.aspx?CurrencyCode=` reflete no XML → XXE/XML injection candidate.
- Próximo: webapp valida XXE (POST XML) + XML attr injection + SQLi price lookup.

### 4. /ipn.aspx — PayPal IPN (payment forgery, no auth)
- old.dfg.com.br (161.97.106.114) — aceita POST, 200 vazio, sem auth.
- Se não verifica VERIFIED/INVALID com PayPal → forjar pagamentos.
- Próximo: webapp valida.

### 5. portaldfg — 30+ plugins WordPress (REST API bypassa CF)
- iThemes Security, WooCommerce POS, Fluent Forms/CRM, Elementor, AI Power Kit, Paid Memberships Pro,
  Tutor LMS, WooFunnels, BetterLinks Pro, Jetpack, AliExpress Dropship, WP Mail SMTP, etc.
- 666 mídias públicas. Admin drfranciscogeovane (id=1).
- Próximo: cve research nos 30+ plugins + webapp (wp-login via 2Captcha).

### 6. Stack traces = info disclosure (suppliers)
- offers.aspx 500 → `C:\DFGames\Old\Suppliers-AZR\Suppliers-AZR\offers.aspx.cs:17` (caminho source)
- News.aspx 500 → ObjectDataSource odsNews/GetNews(culture) (data layer)
- detailed errors habilitados (IIS customErrors off).

---

## Endpoints/rotas por host (resumo)

### SmarterMail (164.68.104.26)
- Login: /Login.aspx, /Mobile/Login.aspx
- API: /Services/*.asmx (10 SOAP, WSDL público), /EWS/Exchange.asmx (401), /sync/ (ActiveSync)
- .well-known/* (401): caldav, carddav, autoconfig/mail, assetlinks.json

### Suppliers (161.97.106.115)
- /index.aspx, /login.aspx, /register.aspx (ABERTO), /passwordrecovery.aspx
- /requests-xml.aspx?CurrencyCode= (XXE/XML-inj), /Image.aspx (handler), /teste.aspx (dev)
- /offers.aspx (500 stack trace), /News.aspx (500), /newsale.aspx (302 auth)

### old.dfg / antigo (161.97.106.114)
- /login.aspx (admin, anti-keylogger), /ipn.aspx (PayPal, no auth)
- antigo: /admin/, /admin/changeadminlevel?Level=, /myoffers/, /user/resetpassword, /user/validateemailchange, /user/validatewithdrawmethod/<id> (tudo 302 auth)

### Mailcow (77.237.241.198)
- /admin/ (login, default creds rejected), /SOGo/, /autodiscover/autodiscover.xml
- /api/v1/get/* (empty, need X-API-Key)

### Nuxt (dfg/www/api) — Cloudflare
- 16 /api/* endpoints (auth, cart, items, search, users, admin/impersonation-status)
- 492 paths (categorias de jogos, crypto, institutional, user/*)
- dfg.local (dev), antigo.dfg.com.br refs, cdn.dfg.com.br

### portaldfg (WordPress) — Cloudflare
- wp-json/* (REST API, 1963 rotas, 30+ plugins), wp/v2/users (1 admin), wp/v2/media (666)
- xmlrpc.php (CF-challenged), wp-login.php (CF-challenged)

---

## Próximos passos para webapp (Fase 6) — priorizados
1. **Privilege escalation**: antigo.dfg.com.br/admin/changeadminlevel?Level=9 (pós cred stuffing em 114)
2. **XXE/XML injection**: suppliers.dfg/antigo /requests-xml.aspx?CurrencyCode=
3. **Payment forgery**: old.dfg.com.br/ipn.aspx (PayPal IPN sem verificação?)
4. **Credential stuffing**: SmarterMail /Login.aspx, DFGames admin /login.aspx, Mailcow /admin/, WP wp-login
   - acgarzon@dfg.com.br, salesmgr@dfgames.com, admin@astarium.com, drfranciscogeovane + variantes senha
5. **register.aspx**: suppliers — completar registro (CAPTCHA) → IDOR newsale.aspx?GameID/ServerID
6. **IDOR**: Nuxt /api/public/users/<id>, /user/{id} perfis; WP REST /wp-json/wp/v2/*
7. **ViewState deserialization**: AjaxControlToolkit 4.1.40412.0 (suppliers/antigo) — machineKey brute

## Próximos passos para cve (Fase 7) — priorizados
1. SmarterMail Free 15.7 build 6970 (path traversal, auth bypass, RCE)
2. WordPress 30+ plugins (WooCommerce POS, Fluent Forms/CRM, Elementor, AI Power Kit, Paid Memberships Pro, Tutor LMS, iThemes Security, BetterLinks Pro, Jetpack)
3. Mailcow + SOGo (versão a obter pós-login)
4. AjaxControlToolkit 4.1.40412.0 (2010, deserialization)
5. IIS/10.0 + ASP.NET 4.0.30319 (ViewState)

## Próximos passos para network
- mail3.dfg.com.br (5.189.143.90:25) — SMTP open-relay/enum (VRFY/EXPN/RCPT TO)

---

## Artefatos por host (em enum/<host>/)
- mail.dfg.com.br: asmx_methods.txt (239 ops), *.wsdl (10), asmx_unauth_test.txt, smartermail_endpoints.txt, content_discovery_ffuf.json, mobile_login.html
- suppliers.dfg.com.br: register_analysis.txt, requests_xml_analysis.txt, offers_error.html, news_error.html, content_discovery_ffuf.json, register.aspx.html
- old.dfg.com.br: antigo_dfg_findings.txt, login_admin.html, antigo_114_login.html, antigo_root.html
- mail.astarium.com: mailcow_api_probe.txt, mailcow_default_creds_test.txt, admin_login.html, cache_main.js
- dfg-nuxt: js/ (122 files), js_endpoints.txt, api_endpoints.txt, js_all_paths_full.txt, build_meta.json, ENUM.md
- portaldfg.com.br: wp_json_root.json (2.3MB), wp_namespaces.txt, wp_all_routes.txt (1963), wp_users.txt
