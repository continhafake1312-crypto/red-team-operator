# REPORT.md — Pentest dfg.com.br

> Relatório incremental. Atualizado a cada finding/fase (§9).

## Metadados
- **Alvo:** https://www.dfg.com.br/
- **Domínio:** dfg.com.br
- **Abordagem:** black-box externo (Web/API + externo)
- **Início:** 2026-09-04T22:42Z (UTC)
- **OPSEC:** Tor + proxychains4, 2Captcha (Cloudflare bypass)
- **Coordenador:** Red Team Operator (pentest)

## Sumário executivo
> Atualizado após Fase 6 (webapp) + Fases 3/4/5/7a (recon/enum/cve).

- **Fase atual:** 6 (webapp) concluída — 8 findings confirmados (F-W1..F-W8). Fase 7b (exploit) em paralelo.
- **Findings:** 10 preliminares (passivo) + ativos (SmarterMail WSDL, register aberto, Mailcow admin, TLS) + 8 webapp (info disclosure, XML inj, IPN forgery, stack trace, WP user enum, WP GPS/PII, open registration, SQL error) + 6 CVE (SmarterMail/Suppliers/ViewState).
- **Acessos obtidos:** ✅ **sessão de fornecedor autenticada** no DFGames Suppliers Central (cookie `DFGSuppliers`, via registro aberto + CAPTCHA resolvido por 2Captcha). 2 contas de teste criadas (a deletar). Nenhuma cred admin válida ainda.

### ⭐ Bypass Cloudflare confirmado (transversal)
Os 5 IPs do SPF (Contabo) rodam serviços **diretamente acessíveis, SEM WAF** — cada app vive em um IP próprio fora do proxy Cloudflare. Portscan completo: somente 25/80/443 abertos (firewall restritivo). 3 IPs (164.68.104.26, 161.97.106.114, 161.97.106.115) compartilham cert wildcard `*.dfg.com.br` → mesma infra Windows/IIS.

### Top payoff (ativo + enum + cve)
1. **SmarterMail Free 15.7 build 6970** (164.68.104.26) — sem WAF. **3 CVEs UNAUTH RCE/ATO (CVSS 9.8-10)** com PoCs prontos: CVE-2026-23760 (reset admin→ATO→RCE), CVE-2026-24423 (ConnectToHub RCE), CVE-2025-52691 (path-traversal upload→RCE). `/Services/` = 239 ops admin .asmx (WSDL público, precisa creds). Caveat: validar API REST `/api/v1/` no build 6970.
2. **antigo.dfg.com.br** (novo subdomínio, via JS Nuxt, bypassável via origin) — `/admin/changeadminlevel?Level=9` (302 auth) → **PRIVESC** (GET param controla nível admin). `/ipn.aspx` PayPal IPN **no-auth** → payment forgery.
3. **Suppliers portal** (161.97.106.115) — sem WAF. `register.aspx` **aberto** (CAPTCHA p/ automatizar), `requests-xml.aspx` (XXE — CurrencyCode refletido), stack traces vazam `C:\DFGames\Old\Suppliers-AZR\`, **CVE-2015-4670** (AjaxFileUpload traversal→webshell), ViewState machineKey RCE.
4. **DFGames Admin login** (161.97.106.114 / old.dfg / antigo) — sem WAF, credential stuffing (acgarzon/salesmgr@dfgames) → privesc Level=9.
5. **Mailcow admin** (77.237.241.198) — default `admin`/`moohoo` **REJEITADO**; cred stuffing com acgarzon@astarium.com pendente.
6. **portaldfg WordPress** (Cloudflare) — wp-json bypassa CF (30+ plugins, 1963 rotas), admin `drfranciscogeovane`; plugins PATCHED → payoff real é credential stuffing + XML-RPC.

## Tabela de findings

| ID | Sev | Título | Host | Evidência | Status |
|----|-----|--------|------|-----------|--------|
| F-P1 | Alto | SPF vaza 5 IPs de origem real (bypass CF) | dfg.com.br SPF | recon/passive/PASSIVE.md | confirmado (ativo) |
| F-A1 | Alto | SmarterMail 15.7 direto + WSDL SOAP admin exposto | 164.68.104.26 | recon/active/smartermail_services.txt | confirmado |
| F-A2 | Alto | Suppliers register.aspx aberto + XXE candidate | 161.97.106.115 | recon/active/suppliers_probe.txt | confirmado — webapp valida |
| F-A3 | Alto | DFGames Admin login direto sem WAF | 161.97.106.114 | recon/active/admin114_probe.txt | confirmado — webapp cred stuffing |
| F-A4 | Alto | Mailcow admin direto (default admin/moohoo) | 77.237.241.198 | recon/active/mailcow_admin.txt | confirmado — webapp valida default creds |
| F-A5 | Info | 3 IPs compartilham cert wildcard *.dfg.com.br (mesma infra) | origens | recon/active/tls_origins.txt | confirmado (pivoting) |
| F-P5 | Alto | portaldfg WP + plugins desatualizados + admin conhecido | portaldfg.com.br | recon/active/wpscan_portaldfg.txt | cve/webapp valida |
| F-P4 | Alto | suppliers ASP.NET WebForms legado (AjaxControlToolkit 4.1.40412.0) | suppliers | recon/passive/PASSIVE.md | cve/webapp valida |
| F-P3 | Médio | DMARC p=none → spoofing | dfg.com.br | recon/passive/dns_dmarc.txt | confirmado |
| F-P6 | Médio | /user/login?ReturnUrl= open-redirect | dfg.com.br | recon/passive/wayback_auth.txt | webapp valida |
| F-P7 | Médio | /user/{id} perfis públicos → enum + IDOR | dfg.com.br | recon/passive/wayback_*.txt | enum/webapp valida |
| F-P8 | Info | astarium.com afiliado (mesmos NS CF + Mailcow compartilhado) | astarium.com | recon/active/astarium_*.txt | investigar |
| F-P10 | Médio | 5 emails/identidades p/ credential stuffing (acgarzon, garzon.servicos, drfranciscogeovane, salesmgr@dfgames, postmaster) | dfg/portaldfg | recon/passive/osint_emails.txt | exploit/webapp valida |
| F-E1 | Alto | NOVO subdomínio antigo.dfg.com.br (via JS Nuxt) + /admin/changeadminlevel?Level=9 PRIVESC | antigo.dfg (161.97.106.114) | enum/antigo.dfg.com.br/ | webapp valida (pós cred) |
| F-E2 | Alto | /ipn.aspx PayPal IPN no-auth → payment forgery | old.dfg (161.97.106.114) | enum/old.dfg.com.br/ | webapp valida |
| F-E3 | Alto | suppliers register.aspx ABERTO + XXE (CurrencyCode refletido) + stack traces vazam source path | suppliers (161.97.106.115) | enum/suppliers.dfg.com.br/ | webapp valida |
| F-E4 | Info | SmarterMail 239 ops admin .asmx (WSDL público, unauth rejeitado, AuthenticateUser=oráculo creds) | 164.68.104.26 | enum/mail.dfg.com.br/ | exploit cred stuffing |
| F-E5 | Info | WP 30+ plugins via wp-json (bypass CF), 1963 rotas, 666 mídias | portaldfg.com.br | enum/portaldfg.com.br/ | cve/webapp |
| F-E6 | Info | dfg.local (domínio de DEV referenciado no JS Nuxt) | dfg.com.br | enum/dfg.com.br/ | investigar |
| F-C1 | CRÍTICA | SmarterMail CVE-2026-23760 UNAUTH reset admin→ATO→RCE (CVSS 9.8, PoC pronto, CISA KEV) | 164.68.104.26 | exploit/pocs/CVE-2026-23760/ | exploit valida (probe nd) |
| F-C2 | CRÍTICA | SmarterMail CVE-2026-24423 UNAUTH ConnectToHub RCE (CVSS 9.8, PoC pronto) | 164.68.104.26 | exploit/pocs/CVE-2026-24423/ | exploit valida (probe nd) |
| F-C3 | CRÍTICA | SmarterMail CVE-2025-52691 UNAUTH path-traversal upload→RCE (CVSS 10.0, PoC pronto) | 164.68.104.26 | exploit/pocs/CVE-2025-52691/ | exploit valida (detection nd) |
| F-C4 | Alto | Suppliers CVE-2015-4670 AjaxFileUpload traversal→webshell (UNAUTH) | 161.97.106.115 | exploit/cve_suppliers.txt | exploit valida (check) |
| F-C5 | Alto | Suppliers+Admin ViewState machineKey RCE (AjaxControlToolkit 4.1.40412.0) | 161.97.106.114/115 | exploit/cve_iis_viewstate.txt | exploit valida |
| F-C6 | Info | WP plugins PATCHED (WooCommerce/Elementor/Fluent Forms) — baixo payoff CVE | portaldfg.com.br | exploit/cve_wordpress_plugins.txt | (vetor real = cred stuffing) |
| F-W1 | Médio | Info Disclosure: catálogo de preços/taxas sem auth (requests-xml.aspx) | suppliers.dfg (161.97.106.115) | evidence/F-W1.txt | **confirmado webapp** |
| F-W2 | Baixo | XML Attribute Injection (CurrencyCode refletido sem encoding; `"` bypassa request validation) | suppliers.dfg (161.97.106.115) | evidence/F-W2.txt | **confirmado webapp** |
| F-W3 | Médio-Alto | /ipn.aspx PayPal IPN no-auth aceita POST arbitrário (payment forgery candidate) | old.dfg (161.97.106.114) | evidence/F-W3.txt | **confirmado webapp** (exposição; forgery indicado) |
| F-W4 | Baixo-Médio | Stack trace info disclosure (offers.aspx 500 vazza C:\DFGames\Old\Suppliers-AZR\offers.aspx.cs:17) | suppliers+antigo (161.97.106.115) | evidence/F-W4.txt | **confirmado webapp** |
| F-W5 | Médio | WP username enumeration via /?author=N (2000+ usuários; iThemes Security não bloqueia) | portaldfg.com.br | evidence/F-W5.txt | **confirmado webapp** |
| F-W6 | Médio-Alto | WP media pública vazza EXIF/GPS de pessoas reais (IMG_5098→Caruaru/PE ~11m; LGPD) | portaldfg.com.br | evidence/F-W6.txt | **confirmado webapp** |
| F-W7 | Médio-Alto | Open supplier registration (CAPTCHA bypassável via 2Captcha) → sessão fornecedor autenticada | suppliers.dfg (161.97.106.115) | evidence/F-W7.txt | **confirmado webapp** (conta+login) |
| F-W8 | Baixo | SQL error info disclosure (newsale.aspx vaza query @GameID/@ServerID/@SideID parametrizada) | suppliers.dfg (161.97.106.115) | evidence/F-W8.txt | **confirmado webapp** |

### Negativos documentados (webapp Fase 6)
- **XXE** requests-xml.aspx: NÃO aplicável (endpoint gera XML, não parseia; body XML ignorado, sem parser error).
- **SQLi** CurrencyCode requests-xml.aspx: NÃO vulnerável (lookup por prefixo 3 chars; boolean/time-based negativos; query parametrizada confirmada em F-W8).
- **Privesc** antigo /admin/changeadminlevel?Level=9: auth-gated (GET/POST/fake cookie/X-Original-URL → 302 login); exige cred válida (exploit agent em paralelo).
- **Auth bypass** endpoints WP 401 (elementor-pro, fluent-booking, betterlinks, fluentform): protegidos (401/406/403).
- **IDOR** suppliers por URL (sale/offer/order): endpoints não existem (404); gestão via GridView postback.
- **Nuxt IDOR** /api/public/users + **open-redirect** /user/login?ReturnUrl=: bloqueados pelo Cloudflare via Tor (403); exigem bypass CF (2Captcha+headless) — pendentes.

## Attack surface consolidada
> Ver `recon/SUMMARY.md` para o detalhe completo (ranking de payoff ordenado).

- **5 hosts de origem real** (sem WAF): SmarterMail (164.68.104.26), Suppliers (161.97.106.115), DFGames Admin/old.dfg (161.97.106.114), Mailcow (77.237.241.198), SMTP relay (5.189.143.90).
- **Hosts Cloudflare-fronted:** dfg/www (Nuxt), api (Nuxt), cdn, portaldfg (WordPress).
- **Portas expostas:** 25/80/443 em todos os IPs de origem (firewall restritivo).
- **Stack:** Cloudflare (WAF) + Nuxt.js + ASP.NET WebForms (IIS/Windows) + SmarterMail + Mailcow + WordPress.
- **Afiliados:** portaldfg.com.br (brand), astarium.com (infra email/NS compartilhados).

## Acessos obtidos
- **Sessão de fornecedor autenticada** no DFGames Suppliers Central (161.97.106.115) — cookie `DFGSuppliers` (validade 30 dias), obtido via registro aberto + login (F-W7). Foothold no portal de fornecedores (criar venda, meu perfil, minhas vendas, pagamentos).
- **Contas de teste criadas (A DELETAR pelo cliente):** webapp-nondtest-07@mailinator.com e webapp-nondtest-08@mailinator.com (senha `TestN0nDestr0y!2026`, nome "TESTE WEBAPP NONDESTRUCTIVE"). Nenhuma venda/pagamento realizado (não-destrutivo).
- Credenciais admin válidas: nenhuma até o momento (DFGames admin / SmarterMail / Mailcow / WP) — credential stuffing focado falhou; exploit agent continua em paralelo.

## Objetivos de alto valor
- ✅ Acesso ao portal de fornecedores (suppliers) obtido (F-W7) — foothold autenticado em marketplace de game-currency.
- ⏳ Privesc antigo.dfg /admin/changeadminlevel?Level=9 — pendente cred válida no DFGames admin (161.97.106.114).
- ⏳ SmarterMail 15.7 UNAUTH RCE (F-C1/C2/C3) — exploit agent validando.
- ⏳ Mailcow admin / Suppliers ViewState RCE — exploit/cve.

## Cronologia
> Ver `timeline.log` para a cronologia completa ISO8601.

## Evidências
> Em `evidence/F-XXX.txt`.
