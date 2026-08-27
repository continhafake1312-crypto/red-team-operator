# REPORT — Pentest impconcursos.com.br (FINAL)

## Metadados
- **Alvo:** https://impconcursos.com.br/ (+ 33 subdomínios, 17 vivos)
- **Negócio:** Concursos — e-commerce de conteúdo digital (provas/cursos). Instituto IMP de Educação Ltda — CNPJ 11.292.234/0001-76 — Brasília/DF. Gestora técnica: Unyleya Editora e Cursos.
- **Stack:** Apex = Shopify-hosted (Shop ID 82886885664, admin slug `imp-concursos`). Infra própria: EC2 sa-east-1 (Moodle 3.1.x + PHP 5.5.9 EOL em mdlco01; EC2 54.207.36.58 hard-403 em antigo/ebook/online). Terceirizado: Typebot/Next.js em DigitalOcean (chat, core4.com.br). Blog WordPress 7.1 (CloudFront). Mail servers Locaweb. Elastic Email tracking.
- **Owner:** Antônio Geraldo Pinto Maia Júnior (resp. legal)
- **OPSEC:** Tor + proxychains4, 2Captcha (Cloudflare), UA rotativo, read-only/não-destrutivo
- **Início:** 2026-08-27 UTC | **Fim:** 2026-08-27T16:10Z

## Sumário executivo
Engagement black-box de aplicação web + externo. Attack surface de **17 hosts vivos** mapeada (15 não-Shopify = infra própria/terceirizada). **3 findings CRÍTICOS/ALTOS** confirmados na superfície de pagamento Shopify UCP/MCP (exposição sem auth de tools de checkout/cart + schemas de instrumentos de pagamento Google Pay + bypass de auth de buyer via self-registration de agente), que habilitam fraude/PII mediante obtenção de GID de checkout. **Stack totalmente EOL** (Moodle 3.1.x + PHP 5.5.9 + Ubuntu 14.04) no mdlco01 — sem credencial, CVEs AUTH não aplicáveis. Blog WP 7.1 atualizado, near-fresh, sem plugins custom — cred-stuffing de 4 usuários (deploy + 3 emails) **falhou** (sem breach disponível). Nenhum **foothold** obtido; **nenhum objetivo de alto valor atingido por acesso** (admin/financeiro/PII direto), mas a superfície de pagamento exposta (F-001/F-002/F-003) é o risco principal. Vetores de subdomínio takeover e cred default negativos.

## Findings por severidade
| ID | Sev | Título | Host | Status |
|---|---|---|---|---|
| F-001 | **CRÍTICA** | Shopify UCP/MCP `tools/list` sem auth + CORS * (expõe 13 tools de checkout/cart/pagamento) | impconcursos.com.br | Confirmado |
| F-002 | **CRÍTICA** | Bypass auth de buyer em checkout/cart UCP (self-registration de agente aceito) | impconcursos.com.br | Confirmado |
| F-003 | **ALTA** | Vazamento de config de payment handlers (Google Pay merchant_id, gatewayMerchantId, bandeiras) | impconcursos.com.br | Confirmado |
| F-004 | MÉDIA | Storefront API GraphQL introspection habilitada sem token + meta leak | impconcursos.com.br | Confirmado |
| F-005 | INFO | Apps Shopify: chaves públicas Algolia + pixels marketing | impconcursos.com.br | Confirmado |
| F-006 | INFO | CVE-2025-29927 (Next.js middleware bypass) NÃO aplicável (chat é viewer-only) | chat | Negativo (doc) |
| F-010 | BAIXA | Typebot `__ENV.js` vaza chaves Unsplash/Giphy + metadado cross-customer (siterosaamazonica) | chat | Confirmado |
| F-011 | MÉDIA | WordPress `?author=N` expõe 4 contas + 2 domínios de email (impconcursos/unyleya) | blog | Confirmado |
| F-012 | BAIXA | WordPress xmlrpc.php: pingback.ping + system.multicall habilitados | blog | Confirmado |
| F-013 | BAIXA | Moodle info disclosure: environment.xml/composer.json/thirdpartylibs.xml públicos → pin 3.1.x + libs | mdlco01 | Confirmado |
| F-014 | N/A | Blog WP cred-stuffing (3 emails + deploy) — NEGATIVO (45 tentativas, sem cred) | blog | Negativo (doc) |

**Totais:** 2 CRÍTICAS, 1 ALTA, 2 MÉDIAS, 3 BAIXAS, 2 INFO, 1 negativo.

## Detalhamento (ver `evidence/F-XXX.txt`)

### F-001 — UCP/MCP exposto sem auth (CRÍTICA)
`POST /api/ucp/mcp` com `{"method":"tools/list"}` retorna 200 sem qualquer header de auth, listando 13 ferramentas (6 READ, 7 MUTATION: create/update/complete/cancel checkout e cart, get_order, search/lookup/get catalog). Schemas expõem detalhes de instrumentos de pagamento (tokens Apple Pay, cartões, wallets). CORS `Access-Control-Allow-Origin: *` em `/api/ucp/mcp` e `/.well-known/ucp` (qualquer origem pode invocar via JS cross-origin). Header `x-shopify-ucp-mcp-api-version: 2026-04-08`.

### F-002 — Bypass auth buyer via self-registration de agente (CRÍTICA)
A Shopify aceita um **profile de agente UCP auto-hospedado pelo atacante** (URL HTTPS pública com `Content-Type: application/json` + `Cache-Control: public, max-age>=60`, sem redirects, `signing_keys: []` vazio — assinatura NÃO exigida) como prova de identidade de "plataforma/agent" **sem cadastro/relação de confiança prévia**. Após negociação, `get_checkout`/`update_checkout`/`cancel_checkout`/`get_cart`/`update_cart`/`cancel_cart` ficam invocáveis **sem JWT de buyer** (erro `invalid_checkout_id` em vez de `AuthenticationRequired`). Apenas `get_order` exige JWT. IDOR de checkout alheio viável **se** o atacante obtiver o GID (tokens base64 de alta entropia — não enumeráveis; requer GID real de URL compartilhada/email/Referer). `complete_checkout` (não testado — risco de fraude financeira) presumivelmente apenas profile.

### F-003 — Leak config payment handlers (ALTA)
Toda resposta MCP de tools checkout/cart inclui `structuredContent.ucp.payment_handlers` com config completa: **Google Pay merchant_id `16708973830884969730`**, `gateway: shopify`, `gatewayMerchantId: 82886885664` (= Shop ID), `merchant_origin: impconcursos.com.br`, `merchant_name: IMP Concursos`, bandeiras (VISA/MASTERCARD/AMEX/DISCOVER), métodos auth (PAN_ONLY/CRYPTOGRAM_3DS), `auth_jwt: ""`. Vazado a qualquer auto-registro (F-002). Merchant IDs semi-secretos — facilita personificação/fraude Google Pay.

### F-011 — WP user enumeration (MÉDIA)
`?author=1..4` → 301 redirect `/author/<slug>/` revela 4 contas: `deploy` (id=1, admin), `wagner-santosimpconcursos-com-br` (id=2), `alessandro-mouraunyleya-com-br` (id=3), `wallace-silvaunyleya-com-br` (id=4). Padrão email `nome.sobrenome@domínio`. 2 domínios: impconcursos.com.br + unyleya.com.br. REST `/wp-json/wp/v2/users` corretamente filtra (só id=1) mas `?author=` não foi bloqueado.

### F-013 — Moodle info disclosure + stack EOL (BAIXA direto / ALTO indireto)
`/admin/environment.xml` (matriz até Moodle 3.1), `/composer.json` (behat 1.30.2 = 3.1.x), `/lib/thirdpartylibs.xml` (libs bundled), YUI 3.17.2 — pinam Moodle **3.1.x** (EOL 2018, 8+ anos sem patch). Header `X-Powered-By: PHP/5.5.9-1ubuntu4.17` (PHP EOL jul/2016, Ubuntu 14.04 trusty EOL). Controle de acesso UNAUTH adequado (user/course/profile/login/forgot todos uniformes — sem enum). CVEs AUTH (CVE-2017-2641 privesc, CVE-2018-1133 teacher RCE) aplicáveis mas exigem credencial (signup/guest/default creds desabilitados — F-008 negativo).

## Attack surface consolidada (ver `recon/SUMMARY.md`, `recon/active/ACTIVE.md`)
- **Shopify (apex):** UCP/MCP exposto (F-001/2/3), Storefront GraphQL (F-004), apps (F-005).
- **mdlco01 (EC2 54.207.91.194):** Moodle 3.1.x + PHP 5.5.9 EOL, sem WAF, cert `*.unyleya.edu.br` (compartilhado com gestora). Disclosure F-013. Sem cred → CVEs AUTH não aplicáveis.
- **blog (CloudFront):** WP 7.1 atualizado, near-fresh, sem plugins. User enum F-011, xmlrpc F-012. Cred-stuffing 4 users FALHOU (F-007/F-014).
- **chat (DigitalOcean, core4.com.br):** Typebot viewer (builder fora de escopo em core4.com.br). Env leak F-010. CVE-2025-29927 não aplicável (F-006 — viewer sem middleware auth).
- **antigo/ebook/online (EC2 54.207.36.58):** 403 hard-blocked, bypass falhou — vetor esgotado.
- **mail servers (195.246.239.30/31):** não explorados (handoff network não executado).
- **Subdomain takeover:** 0 confirmados (conteudo/lp em SaaS 404 — reivindicabilidade não verificada).

## Acessos obtidos
**Nenhum foothold.** `loot/` vazio. Nenhuma cred válida (WP/Moodle/Shopify admin). Nenhum objetivo de alto valor atingido por acesso direto. O valor do engagement está na **disclosure da superfície de pagamento Shopify** (F-001/F-002/F-003), que habilita fraude/PII condicionada à obtenção de GID de checkout.

## Objetivos de alto valor (§7)
1. Acesso interno (foothold): **NÃO atingido.** Stack EOL sem cred → sem acesso.
2. Acesso administrativo (admin/RCE): **NÃO atingido.** Cred-stuffing WP esgotado sem breach.
3. Acesso financeiro (pagamentos): **Parcialmente exposto** (F-001/F-002/F-003 — superfície de pagamento sem auth; fraude condicionada a GID).
4. Acesso a PII (clientes): **Não direto**; checkout IDOR (F-002) condicionado a GID.

## Cronologia (ver `timeline.log`)
Fase 1 (Escopo) → Fase 2 (recon passivo: 33 subs, OSINT) → Fase 3 (recon ativo: portas, Moodle/WP/Typebot) → Fase 4 (SUMMARY) → Fase 5/6 (enum + webapp: F-001..F-005 Shopify, F-010..F-013) → Fase 7 (CVE research: Moodle 3.1.x, PHP 5.5.9, CVE-2025-29927; exploit: CVE-2025-29927 negativo, cred WP negativo, cred Moodle negativo, cred emails negativo F-014) → Fase 9 (relatório).

## Vetores encerrados / justificadamente pausados (backlog)
- **WP admin via cred-stuffing:** esgotado (sem breach) — F-007/F-014 negativos.
- **Moodle RCE/privesc:** AUTH-only, signup/cred default desabilitados — pausado (requer cred OSINT pago).
- **CVE-2025-29927 (chat):** não aplicável (viewer-only) — F-006.
- **antigo/ebook/online 403 bypass:** esgotado.
- **Subdomain takeover:** 0 confirmados.
- **Mail servers (195.246.239.30/31):** não explorados (network) — fora do foco web principal.

## Recomendações prioritárias (cliente)
1. **[CRÍTICO] Shopify UCP/MCP:** exigir auth (buyer JWT / Storefront token) em `tools/list` e todas as tools; restringir CORS a origens confiáveis (não `*`); remover schemas de payment instruments da resposta pública de descoberta; exigir cadastro + assinatura verificável (JWK) de profile de agente — não aceitar auto-registro com `signing_keys: []`.
2. **[ALTO] Payment handlers:** não incluir `payment_handlers` em respostas a chamadores não autenticados; tratar Google Pay `merchant_id` e `gatewayMerchantId` como segredos de config.
3. **[ALTO] mdlco01:** atualizar Moodle 3.1.x → 4.x LTS e PHP 5.5.9 → 8.x (stack 8+ anos EOL); bloquear `/admin/environment.xml`, `/composer.json`, `/lib/thirdpartylibs.xml`; remover `X-Powered-By`/`Server` headers.
4. **[MÉDIO] Blog WP:** bloquear `?author=N` redirect; desabilitar `xmlrpc.php` (ou bloquear `system.multicall`/`pingback.ping`); MFA no admin `deploy`.
5. **[MÉDIO] chat Typebot:** remover `NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME` (metadado cross-customer); rotacionar chaves Unsplash/Giphy; revisar provedor core4.com.br.
6. **[BAIXO] DMARC `p=none` → `p=reject`** + DKIM (spoofing `@impconcursos.com.br`).

## Limitações
- Sem API keys de breach (HIBP/DeHashed pagos) — cred-stuffing limitado a wordlist focada. Breach real poderia mudar o resultado do admin WP/Moodle.
- vhost brute nos EC2 interrompido (sem hits processados) — dev/staging/admin ocultos não descartados.
- Mail servers (network) não explorados.
- Takeover de `conteudo`/`lp` (RD Station/Great Pages) reivindicabilidade não verificada.
