# ENUM.md — mail.dfg.com.br (SmarterMail 15.7) — 164.68.104.26

> Fase 5 (enum). Host de origem real (sem WAF). Maior payoff do engagement.

## Stack
- SmarterMail **Free 15.7 build 6970** (confirmado via /Login.aspx + /Mobile/Login.aspx)
- Microsoft-IIS/10.0, ASP.NET 4.0.30319, Windows Server, TLSv1.2 (*.dfg.com.br Sectigo)

## Login pages (credential stuffing targets)
- `/Login.aspx` (8111 B) — webmail login principal
- `/Mobile/Login.aspx` (15935 B) — webmail mobile (alt)
- `/Default.aspx` (302→login), `/logout.aspx` (302)

## .asmx SOAP admin API — INFO DISCLOSURE (WSDL 100% público)
`/Services/` expõe 10 web services SOAP com WSDL público (sem auth para leitura do contrato).
**239 operações admin** enumeradas (ver `asmx_methods.txt`):
| Service | #ops | Destaque |
|---|---|---|
| svcServerAdmin | 75 | AddSystemAdmin, SetSystemAdminPassword, ListSystemAdmins, StartServices/StopServices, GetSpoolMessageCount, RequestStatus |
| svcDomainAdmin | 41 | Add/DeleteDomain, GetAllDomains, GetAllDomainUsersWithProperties, GetDomainUsers, UpdateDomain |
| svcUserAdmin | 39 | AddUser, GetUser, GetUsers, AuthenticateUser, LoginValidated, GetUserStats, ToggleActiveSync |
| svcMailListAdmin | 29 | AddList, GetSubscriberList, AddSubscriber, SetSubscriberList |
| svcSpamAdmin | 28 | GetSPFSettings, SetAntispamOptions, ListRBLs |
| svcVirusAdmin | 10 | GetAntivirusOptions, GetClamAvSettings |
| svcProductInfo | 4 | GetLicenseInfo, GetProductInfo, SetLicenseKey, ActivateLicenseKey |
| svcAliasAdmin | 6, svcDomainAliasAdmin | 4, svcGlobalUpdate | 3 |

### Unauth SOAP test (info disclosure check)
- Invocados sem AuthUserName/AuthPassword → todos retornam "Failed to log in"/"Invalid login information" (ResultCode -1).
- **Conclusão:** SOAP requer creds sysadmin. Sem unauth info disclosure via SOAP body.
- Mas WSDL público = enumeração completa da API admin (contrato exposto).

## Outros endpoints
- `/sync/` (200 "Unsupported protocol.") — endpoint ActiveSync/sync
- `/EWS/Exchange.asmx` (401) — **Exchange Web Services API** (acesso a mailbox com creds)
- `.well-known/*` (112 entradas, todas 401) — caldav, carddav, autoconfig/mail, assetlinks.json, change-password
- Diretórios (301, listing off): M, Main, mobile, webchat, reporting, public, About, common, errors, sync, temp, usercontrols, masterpages, app_themes, javascript, Services

## Vetores (delegar a webapp/cve/exploit)
1. **Credential stuffing** em /Login.aspx + /Mobile/Login.aspx (acgarzon@dfg.com.br + variantes)
   → mesmas creds autenticam SOAP /Services/ + /EWS (mailbox access)
2. **SmarterMail 15.7 CVEs** (path traversal CVE-2018-16732, auth bypass, RCE) — delegar a cve
3. **/EWS/Exchange.asmx** — com creds, enumeração/leitura/envio de email
4. **SOAP AuthenticateUser/LoginValidated** (svcUserAdmin) — oráculo de validação de creds

## Artefatos
`asmx_methods.txt` (239 ops), `*.wsdl` (10 WSDLs), `asmx_unauth_test.txt`, `smartermail_endpoints.txt`, `content_discovery_ffuf.json`, `mobile_login.html`, `svcProductInfo.asmx_page.html`
