# ENUM.md — old.dfg.com.br / antigo.dfg.com.br (DFGames Admin) — 161.97.106.114 + 161.97.106.115

> Fase 5 (enum). Hosts de origem real (sem WAF). ⭐ descoberta de antigo.dfg.com.br (novo subdomínio).

## Stack
- DFGames Admin + legado — ASP.NET WebForms, IIS/10.0, ASP.NET 4.0.30319
- TLS: *.dfg.com.br (Sectigo) — mesma infra

## ⭐ CRÍTICO: antigo.dfg.com.br — NOVO subdomínio (descoberto via JS Nuxt)
- "antigo" = "old/legacy" em PT. **NÃO estava no recon passive/active**.
- DNS: Cloudflare-fronted (172.67.72.166...) — Tor bloqueado (403). Bypass via origin IP.
- Serve **conteúdo diferente por IP de origem**:

### antigo.dfg.com.br em 161.97.106.114 (DFGames Admin host)
| Path | Status | Notas |
|---|---|---|
| `/` | 302 | → /login.aspx?ReturnUrl=/ |
| `/login.aspx` | 200:3991 | Admin login (txtUsuario/txtSenha, seleção de letras anti-keylogger) |
| **`/admin/`** | 302 | AUTH-PROTECTED → /login.aspx?ReturnUrl=/admin/ |
| **`/admin/changeadminlevel?Level=1`** | 302 | → /login.aspx?ReturnUrl=/admin/changeadminlevel?Level=1&Level=1 |
| **`/admin/changeadminlevel?Level=9`** | 302 | **PRIVILEGE ESCALATION candidate** (GET param controla admin level!) |
| `/myoffers/` | 302 | auth-protected |
| `/user/resetpassword` | 302 | auth-protected |
| `/user/validateemailchange` | 302 | auth-protected |
| `/user/validatewithdrawmethod/<id>` | 302 | auth-protected (ID no path) |

> **/admin/changeadminlevel?Level=** é o VETOR DE MAIOR VALOR: parâmetro GET que define o nível admin.
> Após auth (ou auth bypass/IDOR/session), chamar /admin/changeadminlevel?Level=9 → escala para admin.
> Delegar a webapp: validar post-login (Level param → admin escalation).

### antigo.dfg.com.br em 161.97.106.115 (suppliers host) — legado marketplace
| Path | Status | Notas |
|---|---|---|
| `/index.aspx` | 200:33149 | legado DFGames marketplace (AjaxControlToolkit 4.1.40412.0) |
| `/login.aspx` | 200:14629 | login marketplace |
| `/register.aspx` | 200:50597 | registro marketplace (diferente do suppliers 65017) |
| `/passwordrecovery.aspx` | 200:15427 | reset senha |
| `/requests-xml.aspx?CurrencyCode=BRL` | 200:1202 | mesmo endpoint XXE/XML do suppliers |
| `/newsale.aspx` | 302 | requer auth |
| `/offers.aspx` | 500 | quebrado (stack trace C:\DFGames\Old\Suppliers-AZR\) |
| `/admin.aspx`, `/manage.aspx` | 404 | custom 404 (3746) |

## old.dfg.com.br em 161.97.106.114 (mesmo app do antigo/admin)
- `/login.aspx` (200, 3991) — "DFGames Login — Administração", seleção de letras anti-keylogger
- **`/ipn.aspx`** (200:0, **NO AUTH**) — **PayPal IPN endpoint!**
  - Aceita POST (payment_status, mc_gross, receiver_email, txn_id) → retorna 200 vazio
  - **Payment forgery candidate**: se não verifica assinatura PayPal, atacante forja notificação de pagamento
  - Delegar a webapp: validar se ipn.aspx verifica VERIFIED/INVALID com PayPal
- Content discovery: 302 é CATCH-ALL (forms auth redireciona TUDO, até paths inexistentes → /login.aspx?ReturnUrl=)
  → não é possível distinguir páginas reais via 302. Confirmados reais: /login.aspx, /ipn.aspx

## Vetores (delegar a webapp/cve/exploit)
1. **/admin/changeadminlevel?Level=** (antigo.dfg.com.br em 114) — **PRIVILEGE ESCALATION** (GET param)
   → após credential stuffing (admin/acgarzon/salesmgr@dfgames), escalar Level=9
2. **/ipn.aspx** PayPal IPN — **payment forgery** (sem auth, POST)
3. Credential stuffing em /login.aspx (admin login, seleção de letras dificulta brute mas não cred vazada)
4. ViewState deserialization (AjaxControlToolkit 4.1.40412.0, machineKey brute)
5. XXE em /requests-xml.aspx (mesmo do suppliers, legado marketplace em 115)

## Artefatos
`antigo_dfg_findings.txt`, `login_admin.html`, `antigo_114_login.html`, `antigo_root.html`
