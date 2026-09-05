# ENUM.md — suppliers.dfg.com.br (DFGames Suppliers Central) — 161.97.106.115

> Fase 5 (enum). Host de origem real (sem WAF). App ASP.NET WebForms legado.

## Stack
- "DFGames Suppliers Central" — ASP.NET WebForms, **AjaxControlToolkit 4.1.40412.0** (2010!), IIS/10.0, ASP.NET 4.0.30319
- TLS: *.dfg.com.br (Sectigo) — mesma infra dos demais IPs dfg

## Content discovery (ffuf common.txt + .aspx) — 18 findings
| Path | Status | Size | Notas |
|---|---|---|---|
| `/Index.aspx` | 200 | 34977 | home — lista jogos (Tibia Coins, DOFUS, Albion, PW, Grand Fantasia...) |
| `/Login.aspx` | 200 | 16258 | login de fornecedor |
| **`/register.aspx`** | 200 | 65017 | **REGISTRO DE FORNECEDOR ABERTO** (ver register_analysis.txt) |
| `/passwordrecovery.aspx` | 200 | — | reset de senha |
| `/errorpage.aspx` | 200 | 16544 | página de erro |
| **`/teste.aspx`** | 200 | 524 | **dev artifact** (página teste vazia, ViewState gen A8ED9A85) |
| `/Image.aspx` | 200 | 6952 | handler de imagem (JPEG default; LFI testado = negativo) |
| `/favicon.ico` | 200 | 5430 | |
| `/offers.aspx` | 500 | 5497 | **quebrado — stack trace** (ver abaixo) |
| `/News.aspx` | 500 | 6734 | **quebrado — ObjectDataSource** (ver abaixo) |
| 301 dirs | | | js, Images, sounds, properties |
| `/newsale.aspx` | 302 | | requer auth (criação de venda, PostBackUrl=?GameID=&ServerID=) |

## register.aspx — Registro de fornecedor ABERTO (NON-DESTRUCTIVE mapping)
- Form: POST ./register.aspx, ViewState generator 799CC77D, EventValidation presente
- Campos: txtEmail, txtPassword, txtConfirmation, txtSupplierName, txtCompany, txtPhone, txtStreet, txtCity, txtState, txtZipCode, ddlCountry (Pix id=100), txtAIM/ICQ/MSN/Skype/Yahoo, txtPaymentInformation, rblPaymentMethods, ckbReceiveEmail
- **CAPTCHA**: ImgValidator$txtValidator (image validator — precisa resolver para registro automatizado)
- Multi-idioma: btnUSA, btnBrazil, btnChina
- **CONFIRMADO ABERTO** — qualquer um acessa o form. Registro automatizado precisa CAPTCHA solve.
- Próximo (webapp): validar se registro completa (CAPTCHA) → área autenticada → IDOR newsale.aspx?GameID/ServerID

## requests-xml.aspx — XXE / XML Injection Candidate
- `GET /requests-xml.aspx?CurrencyCode=BRL` → 200 XML:
  `<?xml?><root><game name="X"><server>Y</server><price code="CC">PRICE</price>...`
- **CRÍTICO**: CurrencyCode é REFLETIDO no atributo `code` do XML de saída (BRL→`code="BRL"`)
  - XML injection candidate (break out do atributo: `CurrencyCode=BRL"><foo>`)
  - XXE candidate (se backend parseia XML construído com o valor)
- INFO DISCLOSURE: vazam TODOS os preços de TODOS os jogos (catálogo completo)
- Próximo (webapp): validar XXE (POST XML body) + XML attr injection + SQLi no price lookup

## Stack traces = INFO DISCLOSURE (detailed errors habilitados)
- **offers.aspx 500**: `ArgumentNullException` em `page_offers.Page_Load` em
  `C:\DFGames\Old\Suppliers-AZR\Suppliers-AZR\offers.aspx.cs:17` (vaza caminho absoluto do source!)
  App: "Suppliers-AZR", legacy "Old" folder. System.Number.StringToNumber (parse null → precisa auth/session)
- **News.aspx 500**: `ObjectDataSource 'odsNews' could not find a non-generic method 'GetNews' that
  has parameters: culture` — vaza nome do datasource (odsNews) + método (GetNews) + param (culture)

## Leaked contact info (anúncios no ViewState/news)
- **Phone: 61-83036060** (DFGames, fornecedores Dofus) + WhatsApp ("whats up")
- **Email: salesmgr@dfgames.com** (referenciado no body)
- Sistema no ar desde 15/03/2008 (beta)

## Vetores (delegar a webapp/cve)
1. **XXE/XML injection** em requests-xml.aspx?CurrencyCode (refletido)
2. **register.aspx aberto** → conta fornecedor → IDOR newsale.aspx?GameID/ServerID
3. **ViewState deserialization** (AjaxControlToolkit 4.1.40412.0 + machineKey brute → RCE) — delegar cve/webapp
4. Stack trace info disclosure (caminho source C:\DFGames\Old\Suppliers-AZR\)
5. teste.aspx dev artifact

## Artefatos
`content_discovery_ffuf.json`, `register_analysis.txt`, `register.aspx.html`, `requests_xml_analysis.txt`, `offers_error.html`, `news_error.html`
