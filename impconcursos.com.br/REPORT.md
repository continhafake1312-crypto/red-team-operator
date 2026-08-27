# REPORT — impconcursos.com.br

## Metadados
- **Alvo:** https://impconcursos.com.br/
- **Negócio:** Concursos — e-commerce de conteúdo digital (provas/cursos)
- **Stack inicial:** Shopify-hosted (CNAME `shops.myshopify.com`, IPs `23.227.38.32/74`)
- **Owner:** (a confirmar via OSINT/WHOIS)
- **OPSEC:** Tor + proxychains4, 2Captcha para Cloudflare, UA rotativo, read-only
- **Início:** 2026-08-27 UTC

## Sumário executivo
(em construção — consolidado ao final)

## Findings por severidade
| ID | Severidade | Título | Host | Status |
|---|---|---|---|---|
| F-001 | CRÍTICA | Shopify UCP/MCP `tools/list` sem auth (create_checkout/get_checkout) | impconcursos.com.br | Confirmado |
| F-002 | CRÍTICA | Bypass auth buyer via self-registration agent (UCP/MCP) | impconcursos.com.br | Confirmado |
| F-003 | ALTA | Leak Google Pay merchant_id/gatewayMerchantId | impconcursos.com.br | Confirmado |
| F-004 | MÉDIA | GraphQL introspection sem token | impconcursos.com.br | Confirmado |
| F-005 | INFO | Apps/chaves públicas Shopify expostas | impconcursos.com.br | Confirmado |
| F-006 | INFO | CVE-2025-29927 (Next.js middleware bypass) — testado, NÃO aplicável (host é Typebot viewer-only, sem rotas protegidas por middleware) | chat.impconcursos.com.br | Testado (negativo) |

## Detalhamento de findings
- F-001..F-005: ver `evidence/F-001.txt`..`evidence/F-005-info.txt` (fase webapp Shopify).
- **F-006** (INFO): `evidence/F-006.txt` — PoC CVE-2025-29927 executado de forma
  não-destrutiva. `chat.impconcursos.com.br` é o **Typebot VIEWER** (buildId
  `Pd2AJTcTE36UcfIPNJIZ8`); rotas `/dashboard`, `/typebots`, `/api/v1/*` não
  existem como rotas reais (caem no catch-all `[[...publicId]]` → "404 The bot
  doesn't exist"). Nenhuma variação do header `x-middleware-subrequest` produziu
  mudança de comportamento (baseline == bypass, byte-a-byte idêntico). O
  **builder** (com middleware de auth) está no vendor `core4.com.br` (fora do
  escopo). CVE não explorável neste host.

### Tentativas de exploit negativas (sem novo finding confirmado)
- **Blog WordPress — cred-stuffing `deploy` via xmlrpc `system.multicall`**:
  15 senhas testadas (`deploy`, `Imp@2024`, `Impconcursos@123`, `Impconcursos2024`,
  `IMPconcursos@2024`, `Imp@concursos`, `impconcursos`, `Impconcursos1`,
  `deploy123`, `deploy2024`, `password`, `admin`, `moodle`, `unyleya`,
  `ti_admin`) em 5 multicalls (batch 3, gap 3s, via Tor). Todas retornaram
  `faultCode 403` "Nome de usuário ou senha incorretos." **Nenhuma cred válida.**
  Sem sinal de lockout/429. CloudFront CDN (sem WAF/captcha). Usuário `deploy`
  (admin id=1) confirmado via `wp-json/wp/v2/users`. **F-007 não criado** (sem cred).
- **MDLCO01 Moodle — cred default**: 5 tentativas (`admin/admin`, `admin/moodle`,
  `admin/password`, `guest/guest`, `manager/moodle`) em `/login/index.php` (Moodle
  3.1.x, sem logintoken). Todas falharam (loginerrors/errormessage, sem link
  `login/logout.php`). `/login/signup.php` retorna **404** (signup desabilitado).
  **F-008 não criado** (sem cred; signup off).

## Attack surface consolidada
(ver `recon/SUMMARY.md`)

## Acessos obtidos
(a preencher — ver `loot/`)

## Cronologia
(ver `timeline.log`)
