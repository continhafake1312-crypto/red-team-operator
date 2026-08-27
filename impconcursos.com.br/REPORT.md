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
| F-010 | BAIXA | Typebot viewer `__ENV.js` vaza chaves Unsplash/Giphy + metadado cross-customer (Vercel project name `siterosaamazonica`) | chat.impconcursos.com.br | Confirmado |
| F-011 | MÉDIA | WordPress user enum via `?author=N` — 4 contas + domínios e-mail (impconcursos/unyleya) | blog.impconcursos.com.br | Confirmado |
| F-012 | BAIXA | WordPress xmlrpc.php expõe pingback.ping + system.multicall (brute amplification / SSRF pingback) | blog.impconcursos.com.br | Confirmado |
| F-013 | BAIXA | Moodle info disclosure: environment.xml/composer.json/thirdpartylibs.xml públicos → pin Moodle 3.1.x + libs (mapeamento CVE) | mdlco01.impconcursos.com.br | Confirmado |

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

### Fase 6b (webapp read-only enum — não-Shopify) — findings F-010..F-013
- **F-010 (BAIXA)** — `evidence/F-010.txt` — `chat.impconcursos.com.br/__ENV.js` vaza
  `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`, `NEXT_PUBLIC_GIPHY_API_KEY` (consumíveis — quota theft),
  `NEXT_PUBLIC_SMTP_FROM`/`NEXT_PUBLIC_VIEWER_URL` (revela provedor core4.com.br) e
  `NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME=siterosaamazonica` (metadado cross-customer de outro
  tenant do provedor Typebot). Builder API (`/api/typebots`) auth-gated (401); publicTypebot IDs são
  slugs high-entropy não-enumeráveis (IDOR por enumeração inviável). Vetor esgotado. Detalhes em
  `enum/chat/nextjs_routes.txt`, `enum/chat/env_leak.txt`, `enum/chat/typebot_public.txt`.
- **F-011 (MÉDIA)** — `evidence/F-011.txt` — `blog.impconcursos.com.br` (WordPress 7.1,
  tema twentytwentythree, sem plugins extras, near-fresh install) — enumeração de usuários via
  `?author=N` revela **4 contas** com slugs derivados de e-mail: `deploy` (admin id=1),
  `wagner.santos@impconcursos.com.br`, `alessandro.moura@unyleya.com.br`,
  `wallace.silva@unyleya.com.br`. A REST `/wp-json/wp/v2/users` filtra corretamente (só id=1),
  mas o redirect `?author=` expõe todos os autores. Confirma domínios impconcursos/unyleya para
  cred-stuffing (handoff exploit). Detalhes em `enum/blog/wp_authors.txt`, `enum/blog/wp_version.txt`,
  `enum/blog/wp_content.txt`, `enum/blog/wp_json_routes.txt`.
- **F-012 (BAIXA)** — `evidence/F-012.txt` — `blog.impconcursos.com.br/xmlrpc.php` expõe 80 métodos
  via `system.listMethods`: `pingback.ping` (SSRF/pingback amplification) e `system.multicall`
  (brute-force amplification — contorna rate-limit per-request). Métodos wp.*/metaWeblog.*/blogger.*
  auth-gated mas habilitam brute via multicall. Detalhes em `enum/blog/xmlrpc_methods.txt`.
- **F-013 (BAIXA)** — `evidence/F-013.txt` — `mdlco01.impconcursos.com.br` (Moodle 3.1.x EOL +
  PHP 5.5.9 EOL) serve publicamente `/admin/environment.xml` (matriz de compatibilidade), `/composer.json`
  (behat 1.30.2) e `/lib/thirdpartylibs.xml` (bibliotecas) → pin cirúrgico da versão Moodle 3.1.x +
  deps para mapeamento de CVE. Sem IDOR/auth-bypass: user/profile/course/view exigem login (uniform 303);
  login/forgot_password uniformes (sem account enum); self-enrollment/guest desabilitados; sem
  backups/git/.env/sql vazados. Web services habilitados (token-gated). Detalhes em
  `enum/mdlco01/moodle_version.txt`, `enum/mdlco01/moodle_content.txt`, `enum/mdlco01/idor_enum.txt`.

### Tentativas de exploit negativas (sem novo finding confirmado)
- **Blog WordPress — cred-stuffing `deploy` via xmlrpc `system.multicall`** (exploit, paralelo):
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
