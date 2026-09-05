# ENUM.md — mail.astarium.com (Mailcow) — 77.237.241.198

> Fase 5 (enum). Host de origem real (sem WAF). Mailcow + SOGo.

## Stack
- Mailcow (open-source mail suite), nginx, TLSv1.3 (mail.astarium.com, Let's Encrypt YR1)
- HSTS + headers de segurança presentes (X-Frame-Options, X-Content-Type-Options, etc.)
- SOGo groupware/webmail exposto

## Endpoints enumerados
| Path | Status | Notas |
|---|---|---|
| `/` | 200 | Mailcow "User Login" (mail UI) |
| **`/admin/`** | 200 | "Administrator Login" (painel admin exposto, sem WAF) |
| `/SOGo/` | 302 | → /SOGo/index/ (SOGo groupware/webmail) |
| `/autodiscover/autodiscover.xml` | 200 | autodiscover ativo (POST com email → config mail) |
| `/robots.txt` | 200 | `User-agent: * Disallow: /` |
| `/api/v1/get/status/*` | 200 (empty) | version/info/containers/vmail/solr/doveadm — requer X-API-Key |
| `/api/v1/get/domain/all` | 200 (empty) | requer X-API-Key |
| `/api/v1/get/mailbox/all` | 200 (empty) | requer X-API-Key |

### API — access-control-allow-headers: Accept, Content-Type, X-Api-Key, Origin
- Todos endpoints /api/v1/* retornam 200 com corpo vazio (precisam header X-API-Key).
- Sem API key leakada → não enumerável sem auth.

## Default creds test (NON-DESTRUCTIVE) — `admin`/`moohoo` REJEITADO
- Método: GET /admin/ (csrf_token via JS injection) → POST login_user=admin&pass_user=moohoo&csrf_token → GET /admin/
- Resultado: **LOGIN FALHOU** — página pós-login idêntica à pré-login (39637 B = ainda no login)
- "login_failed":"Login failed" no JS é apenas dicionário i18n (não erro renderizado)
- **Conclusão: default creds foram TROCADAS.**
- Admin login usa csrf_token (JS-injected) + session cookie. Form posts a /admin/ (login_user/pass_user).

## Versão
- Não obtida passivamente (em "VersionModal" via JS/API, requer auth).
- Cached JS (`/cache/<hash>.js`) não contém versão Mailcow direta.

## SOGo
- `/SOGo/` → redirect /SOGo/index/ (200, 2578 B) — login SOGo exposto
- Autodiscover retorna erro "Invalid Request" (precisa POST com email)

## Vetores (delegar a webapp/cve)
1. **Credential stuffing** em /admin/ (acgarzon@astarium.com, admin@astarium.com, garzon.servicos@astarium.com + variantes senha)
2. **Credential stuffing** em /SOGo/ (webmail — mesmas creds de mail?)
3. Mailcow/SOGo CVEs (versão a obter pós-login)
4. API key leakage (se encontrar X-API-Key em configs/git)

## Artefatos
`mailcow_api_probe.txt`, `mailcow_default_creds_test.txt`, `admin_login.html`, `cache_main.js`, `sogo_root.html`
