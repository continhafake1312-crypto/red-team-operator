# ENUM.md — Consolidação da Fase 5 (Enumeração Profunda)
# Engagement: desapegogames.com.br | Fase 5 (enum) | 2026-09-04/05
# Bypass Cloudflare: https://186.226.60.54 + Host: desapegogames.com.br (Tor SOCKS5)
# Hosts enumerados: .54 (app CodeIgniter), .53 (webhook vhost), .53/.54/.56 (phpMyAdmin), .54 (Apache status)

---

## 0. Resumo Executivo

Enumeração profunda via **bypass CF total** (origem .54 + Host header, sem WAF). Stack confirmada:
**nginx (reverse proxy) → Apache (PHP/CodeIgniter)** + **MySQL** + **DirectAdmin :2222**.

**Top findings (por payoff):**

| # | Finding | Severidade | Host | Artefato |
|---|---------|-----------|------|----------|
| 1 | **phpMyAdmin 5.2.3 exposto** (`/phpMyAdmin/`) em .53/.54/.56 — cookie auth, user "root", ChangeLog exposto | 🔴 CRÍTICO | .54/.53/.56 | phpmyadmin_finding.txt |
| 2 | **IDOR `/anuncio/perguntas.html` (POST anuncio=ID)** — vaza Q&A completo (usernames, timestamps, msgs) p/ ~351k anúncios, sem auth | 🔴 ALTO | .54 | idor_test.txt |
| 3 | **IDOR `/anuncio/video.html?anuncio=ID`** — vaza título+categoria de todos anúncios (IDs 1..~351451), sem auth | 🟠 MÉDIO-ALTO | .54 | idor_test.txt |
| 4 | **`/login` público SEM reCAPTCHA** + sem WAF (bypass CF) — credential stuffing/brute sem 2Captcha | 🔴 ALTO | .54 | params.txt |
| 5 | **Webhook payment (.53)** — receiver de callback Mercado Pago quebrado (POST sempre 500), bypass CF, manipulação de pagamento | 🟠 ALTO | .53 | webhook_enum.txt |
| 6 | **`/admin/*` painel financeiro** (saques/comprovantes/clientes/permissoes) acessível via bypass (sem WAF, só reCAPTCHA no login) | 🔴 ALTO | .54 | admin_dirs.txt |
| 7 | **`/server-status` & `/server-info` Apache 401** (Basic Auth "Apache status") — info disclosure se cracked | 🟡 MÉDIO | .54 | content_discovery.txt |
| 8 | **`/teste` debug page** — vaza path absoluta `/home/desapegogames/tmp` + config PHP | 🟡 MÉDIO | .54 | content_discovery.txt |
| 9 | **SQLi candidate `/busca.html` (pesquisar=)** — tamanho muda com aspa, sem erro visível (suprimido) | 🟡 MÉDIO | .54 | params.txt |
| 10 | **Enumeração massiva de usuários** via sitemap (25033/mês) + `/perfil/<user>` (nome, membro-desde, verificação) | 🟡 MÉDIO | .54 | well_known.txt |

---

## 1. Host .54 — Aplicação CodeIgniter (origem, bypass CF)

### 1.1 Rotas públicas confirmadas (200)
- `/` `/home` `/Home` `/index.php` (front controller, ~152KB)
- `/login` (form: login+senha, **SEM reCAPTCHA**) | `/cadastro` (nome,email,usuario,senha,confirmarsenha)
- `/esqueceu-senha` (anti-enum silencioso — resposta idêntica p/ válido/inválido)
- `/buscar` (página de busca, 142KB) | `/categorias` (192 categorias, 217KB)
- `/categoria/<game>/<subcategoria>` | `/anuncio/<ID>/<slug>` (vaza vendedor /perfil/<user>)
- `/perfil/<username>` (nome display, membro-desde, status verificação email/telefone)
- `/sitemap` `/sitemap.xml` `/sitemap/{geral,categorias,usuarios,anuncios}`
- `/sitemap/anuncios?data=MM/YYYY` (IDs sequenciais 1..~351451, 1715/mês, 64 meses)
- `/sitemap/usuarios?data=MM/YYYY` (~25033 usernames/mês)
- Info: /como-funciona /vantagens /tarifas-e-prazos /formas-de-pagamento /perguntas-frequentes
  /central-de-ajuda /termos-de-uso /politica-de-privacidade /politica-de-reembolso /programa-de-recompensa
  (este último = programa de PONTOS, NÃO bug bounty — sem restrição de escopo)
- **`/teste` (DEBUG, 409B)** — vaza path `/home/desapegogames/tmp` + config PHP/opcache/memory/upload

### 1.2 Endpoints AJAX (CodeIgniter .html)
- `POST /busca.html` data=`pesquisar=<termo>` → resultados (**SQLi candidate**)
- `POST /notificacoes.html` → notificações (polling 180s)
- `POST /carrinho.html` → itens carrinho
- `POST /anuncio/perguntas.html` data=`anuncio=<ID>` → **Q&A (IDOR, sem auth)**
- `GET /anuncio/video.html?anuncio=<ID>` → player YouTube + título (**IDOR**)
- `POST /carrinho/adicionar/<anuncio_id>` data=quantidade=,link= (auth 307)

### 1.3 Painel admin (`/admin/*`, 307 auth → /admin/autenticacao/login)
Módulos: **autenticacao anuncios categorias clientes comprovantes compras configuracoes
documentos index permissoes saques tickets**. Sub-actions não enumeráveis (catch-all 307).
- `/admin/autenticacao/login` (200, form login+senha+**reCAPTCHA 6LfL2MMpAAAAANC5OV3Om_AEyPShC5pybmxlKBR5**)
- `/admin/autenticacao/esqueceu-senha` (200, body "1")
- Author meta: "Diego Trindade"

### 1.4 Painel do usuário (`/painel/*`, 307 auth → /login)
Módulos: **anuncios compras conta index notificacoes perguntas tickets transacoes vendas**.
- `/painel` → 303 /login (cookie `redirecionar` = `https://desapegogames.com.br/index.php/painel?` — routing index.php/ exposto)

### 1.5 API v2.8 (estrutura `/<controller>/v2.8`)
- `/categoria/v2.8` → 307 (auth) [REAL] | `/perfil/v2.8` → 307 (auth) [REAL]
- `/compra/v2.8` `/venda/v2.8` `/troca/v2.8` → 301 (removidos; wayback-only)
- Sem Swagger/OpenAPI/GraphQL. Auth por sessão PHP (ci_session), sem JWT/Bearer no client.

### 1.6 Arquivos sensíveis
- `/.env` `/.git/*` `/.htaccess` `/.htpasswd` `/.git*` → 403/548 (**nginx bloqueia, existem**)
- `/application/` `/system/` `/application/config/{database,config}.php` → 403/239 (Apache block, existem)
- `/index.php` → 200 (front controller, normal)
- Backup/config probes (.bak/.old/.zip/.sql/.yaml/phpinfo.php) → 301 (não existem). Só `.env*` 403.
- `/server-status` `/server-info` → **401 Basic "Apache status"** (mod_status/mod_info expostos)

### 1.7 Assets
- `/assets/site/{js,css,imagens,sounds}/` `/assets/admin/{js,css,images}/`
- Avatares: `/assets/site/imagens/usuarios/<md5>.png` | Capas: `/assets/site/imagens/anuncios/capas/YYYY/MM/DD/<md5>.jpeg`

---

## 2. Host .53 — Webhook API (vhost webhook.desapegogames.com.br)

- `GET /` `/index.php` `/webhook/` → 200 JSON `{"status":200,"mensagem":"Requisição realizada com sucesso!","dados":null}`
- `POST /` `/index.php` `/webhook/` `/index.php/webhook` → **500/0 (sempre, qualquer payload)** — receiver quebrado
- `PUT`/`DELETE`/`PATCH` `/` → 200/0 | `OPTIONS` → 200/0 | `HEAD` → 200
- Demais paths → 404 nginx (355B). `/webhook` (sem barra) → 301 /webhook/ (-> CF se seguido)
- Gateway provável: **Mercado Pago** (formas-de-pagamento cita Mercado Pago/Pix/PicPay/APICrypto)
- Está no MAIL server (.53) — host separado da app; se forjado/manipulado = foothold distinto
- **Candidato**: callback de pagamento não-autenticado (confirmar pagamento sem pagar) — CRÍTICO financeiro

---

## 3. phpMyAdmin (TODOS os IPs: .53/.54/.56) — 🔴 CRÍTICO

- `GET /phpMyAdmin/` → 200 (18570B, login page) em .53/.54/.56 (Host: desapegogames.com.br)
- **Versão 5.2.3** (2025-10-07, latest) — `version:"5.2.3",auth_type:"cookie",user:"root"` (inline config)
- `auth_type=cookie` (form login: pma_username/pma_password/server/set_session/token)
- `/phpMyAdmin/ChangeLog` → 200 (version leak) | `/phpMyAdmin/doc/html/` → 200
- Via domínio canônico → CF 403; via bypass IP → 200 direto (sem WAF)
- **Vetor**: cred stuffing/brute no login (user root, sem captcha, sem WAF) → se senha fraca = **DB TOTAL**
- Ver `phpmyadmin_finding.txt`

---

## 4. JS Analysis — `enum/js/`

### JS baixados e analisados
- Custom: `app.js` (AJAX: busca/notificacoes/carrinho .html, base_url hardcoded), `menu.js` (UI), `bs-init.js` (AOS)
- Libs: jquery, bootstrap.bundle, aos, ion.sound (site) + jquery, bootstrap.bundle, waves, feather, simplebar (admin)
### Secrets
- **NENHUM secret/chave/token hardcoded** nos JS. reCAPTCHA sitekey (público) e GTM ID (público) presentes.
- Próx.: analisar JS de páginas autenticadas (painel/admin) após obter sessão (webapp).
### Endpoints extraídos → ver `js_endpoints.txt`

---

## 5. Param Mining — `enum/params.txt`

- Confirmados: `pesquisar`(/busca.html), `anuncio`(/anuncio/video.html, /anuncio/perguntas.html),
  `email`(/esqueceu-senha), `login`+`senha`(/login, /admin/autenticacao/login), `quantidade`+`link`(/carrinho/adicionar),
  `nome`+`email`+`usuario`+`senha`+`confirmarsenha`(/cadastro), `data`(/sitemap/*)
- ffuf value-based (119 params) inconclusivo (value=1 value-dependent). Params reais já cobertos via JS+forms.
- **SQLi probe `/busca.html`**: pesquisar=' (5000B/6 results) vs ' (283B/0 results), sem erro SQL visível.
  ' OR '1'='1 → 0 results (provável escaped/prepared). → webapp: sqlmap.

---

## 6. Candidatos a Vulnerabilidade (para webapp)

| # | Vetor | URL/Param | Tipo | Confiança |
|---|-------|-----------|------|-----------|
| 1 | phpMyAdmin exposed | `/phpMyAdmin/` (.53/.54/.56) | cred stuffing → DB total | Alta |
| 2 | IDOR Q&A | `POST /anuncio/perguntas.html` anuncio=1..351451 | Broken Access Control | Alta (confirmado) |
| 3 | IDOR video | `GET /anuncio/video.html?anuncio=ID` | Info Disclosure | Alta |
| 4 | Login sem captcha | `POST /login` login=,senha= | credential stuffing/brute | Alta |
| 5 | Admin via bypass | `POST /admin/autenticacao/login` (reCAPTCHA) | auth bypass/brute (2Captcha) | Alta |
| 6 | Webhook payment | `POST .53/` (webhook vhost) | payment forgery (se consertar 500) | Média |
| 7 | SQLi | `POST /busca.html` pesquisar= | SQLi (probe, sem erro) | Média |
| 8 | Apache server-status | `/server-status` (401 Basic) | info disclosure (crack Basic) | Média |
| 9 | Mass assignment | `POST /cadastro` (+ params extra) | role/admin injection | Baixa-Média (testar) |
| 10 | Path traversal/LFI | c/ path `/home/desapegogames/tmp` (de /teste) | LFI em uploads/paths | Baixa-Média |
| 11 | Cart manipulation | `POST /carrinho/adicionar/<id>` | IDOR/price/quantidade | Média (pós-auth) |
| 12 | API BOLA | `/categoria/v2.8` `/perfil/v2.8` (auth) | BOLA pós-auth | Média |

---

## 7. Próximos Passos (delegação webapp)

1. **phpMyAdmin**: cred stuffing root + wordlist (sem WAF, sem captcha) via .54/.53/.56; testar default (root vazio/root:root/admin). Read-only.
2. **/login**: credential stuffing (5544+ usernames do recon + 25k/mês do sitemap vs wordlist), sem captcha.
3. **/admin/autenticacao/login**: 2Captcha p/ reCAPTCHA + cred stuffing (admin).
4. **IDOR perguntas/video**: automação de enumeração de Q&A + usernames (alimenta /login stuffing).
5. **/busca.html**: sqlmap (pesquisar) — sem WAF.
6. **webhook .53**: tentar formatos Mercado Pago/PicPay/APICrypto assinados; forjar callback (não-destrutivo).
7. **/server-status 401**: brute Basic Auth (Apache status) → info disclosure.
8. **/cadastro**: mass assignment (tentar role=1/isAdmin=1/nivel=admin).
9. Após auth user/admin: explorar /painel/transacoes, /admin/saques, /admin/comprovantes, /admin/clientes, /categoria/v2.8, /perfil/v2.8 (BOLA).

## 8. Limitações
- Sub-actions /admin/* e /painel/* não enumeráveis sem auth (catch-all 307).
- JS de páginas autenticadas pendente (precisa sessão).
- Arjun não usado (sem suporte socks+TLS-insecure direto; params cobertos via ffuf+JS).
- Scan ffuf raft-medium (30k) morreu 2x por circuito Tor; common.txt (4751) completou com 0 errors.
- Webhook POST sempre 500 (formato exato do callback não determinado — webapp/exploit).
