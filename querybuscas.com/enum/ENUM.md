# ENUM.md — Enumeração Profunda (Fase 5) — querybuscas.com

> Fase 5 do engagement. Content discovery, de-minify de JS, param mining, API docs,
> fuzz /api/admin. Tráfego via Tor (socks5://127.0.0.1:9050); IP rotacionado (NEWNYM) quando
> Cloudflare rate-limitava (api host). Nenhuma ação destrutiva; apenas enumeração.
> Atualizado em 2026-09-04.

---

## 1. Sumário executivo

| Métrica | Valor |
|--------|-------|
| Hosts enumerados | 2 prioritários (apex + api); bot (502 down) + bot2 (401 global) sumarizados |
| JS de-minified | `app.min.js` (live 1524 linhas) + `app.min.wayback.js` (1432 linhas) + `common.js` + `login.js` |
| Endpoints API confirmados | apex: 14 (auth×5, consultas×3, pagamento×4, user/modulos, telegram/data, admin) · api: 4 (admin, auth/login, auth/verify, health) |
| Endpoints NOVOS | `/api/pagamento/verificar-externa`, `/api/pagamento/verificar-renovacao` (em /pages/pagamento) |
| Catálogo PII | 38 módulos (32 consultas + 6 geradores + ULP credenciais vazadas) |
| API docs | NENHUMA (sem Swagger/OpenAPI/GraphQL) |
| Param mining | 6 endpoints; 1 oráculo de enum de usuários pré-auth confirmado |
| Vuln candidates (enum) | 5 (F-E1..F-E5) |
| Correções ao SUMMARY | 2 (rate gerar-pix é per-IP não global; /api/admin existe em ambos hosts) |

**Destaque:** descoberto endpoint **`/api/pagamento/verificar-externa`** pré-auth, sem
rate-limit, que funciona como **oráculo de enumeração de usuários** (respostas distintas
para username inexistente vs ausente). O login usa erro genérico, mas este endpoint vaza
existência de contas. Confirmado também que **`/api/admin` existe em AMBOS os apps**
(apex 47B + api 42B), e que o rate limit de `/api/gerar-pix` é **per-IP** (bypass via Tor),
não global como reportado na Fase 3.

---

## 2. Por host

### 2.1 apex — querybuscas.com (App A)

#### Endpoints API (todos confirmados, body vazio `{}`)
| Método | Endpoint | Status (sem auth) | Params/Notas |
|--------|----------|-------------------|--------------|
| POST | /api/auth/login | 400 "Usuário e senha são obrigatórios." (66B) | {username, password} rate 5/window; **Turnstile no apex** |
| POST | /api/auth/logout | **200 `{"success":true}` (16B)** | **funciona sem auth** (CSRF logout) |
| POST | /api/auth/pre-register | 400 (66B) | {username, password>=6} rate 3/window → preRegisterToken |
| POST | /api/auth/complete-reset | 400 (66B) | {username, password} + Turnstile |
| GET | /api/auth/verify | 401 (47B) | retorna user.tipo/plano/diasRestantes |
| POST | /api/consultas/nonce | 401 (47B) | → {nonce, sig} rate 10/IP |
| POST | /api/consultas/verificar-humano | 401 (47B) | {token:Turnstile} |
| GET | /api/consultas/<rota>?q=<valor> | 401 (47B) | **rota PII** + headers X-QB-Nonce/X-QB-Sig |
| GET | /api/user/modulos | 401 (47B) | GET-only; {modulos:[{rota,limiteUsado,limiteTotal,unlimited,enabled}]} |
| GET | /api/telegram/data/<md5> | 400/404 | 32-hex=404 not_found_or_expired; não-MD5=400 invalid_id |
| POST | /api/gerar-pix | 400 "Plano inválido." (46B) | {plano} **rate PER-IP** (gerar-pix-ip) |
| POST | /api/pagamento/verificar | 400 "Token obrigatório." (49B) | {token} formato específico |
| POST | /api/pagamento/verificar-externa | 400 "Username obrigatório." (52B) / 404 "Usuário não encontrado." (55B) | **{username} PRE-AUTH, sem rate-limit** |
| POST | /api/pagamento/verificar-renovacao | 401 "Autenticação necessária." (57B) | (novo) |
| GET | /api/admin | 401 (47B) | **NOVO: admin API existe no apex também**; /api/admin/* catch-all 401 |

#### Páginas /pages/
- **200 (públicas):** `/pages/checkout`, `/pages/modulos`, `/pages/termos`, `/pages/comprar`, `/pages/pagamento`
- **302 (auth):** `/pages/admin`, `/pages/dashboard`, `/pages/consultas/<rota>`
- SPA fallback (404 69541B): todo o resto (login, registro, cliente, etc. são client-side)

#### JS findings (app.min.js de-minified → `apex/app.min.beautified.js`)
- **Catálogo MODULOS (38 módulos)** com `rota`:
  - Consultas (32): Cpf, Nome, NomeAbreviado, Telefone, Email, Rg, Mae, Pai, Cnh, Placa,
    PlacaNacional, HistoricoVeicular, Score, Parentes, Foto, Cns, Titulo, Pis, Nis, Pix,
    ChavePix, Certidao, Cep, Renavam, Frota, Chassi, Motor, Empregos, Cnpj, Socios,
    Funcionarios, Vacinas, Obito, Bin, Ulp
  - Geradores (6): gerador-renda, gerador-score, gerador-cnpj, gerador-profissoes,
    gerador-foto-assinatura, Leads
  - **Ulp** = "Busca em base de credenciais vazadas por domínio, usuário, senha, CPF ou e-mail"
    (categoria "credenciais") — ALTO VALOR (oráculo de credential stuffing / breach search)
- **Fluxo de consulta (fetch hook):** intercepta `/api/(consultas|geradores)/`, `/geradores/`,
  `/api/telegram/data/`; adiciona `X-QB-Nonce` + `X-QB-Sig` (de `/api/consultas/nonce`);
  em 403 + `{requireCaptcha, siteKey, action}` → Turnstile → POST verificar-humano → refaz.
- **Endpoint unificado:** `/api/geradores/<rota>` NÃO existe (404) — geradores usam
  `/api/consultas/<rota>` (gerador-renda, etc.). O pattern `/geradores/` no hook é dead code.
- **Turnstile sitekey NÃO hardcoded** — vem do server (campo siteKey na resposta 403). Boa higiene.
- **Nenhum secret/token/IP hardcoded.**
- localStorage: `userData`, `modulosFavoritos`, `qb_pagamento_context` (preRegisterToken),
  `qb_just_redirected`. Constantes: `PLANO_SEM_PLANO="sem-plano"`.
- statusMessage codes: `NoPlan`, `PlanExpired` (403) — p/ enum de estados.
- Suporte: `https://t.me/suportequerybuscas`, `https://t.me/querybuscasofc`.

### 2.2 api — api.querybuscas.com (App B)

| Método | Endpoint | Status (sem auth) | Notas |
|--------|----------|-------------------|-------|
| GET | / (login) | 200 (4307B) | login page, **sem Turnstile** (melhor alvo brute force) |
| POST | /api/auth/login | 401 "Usuário ou senha incorretos." (genérico) | rate 5/window, sem captcha |
| GET | /api/auth/verify | 401 (42B) | retorna user.tipo → redirect admin/cliente |
| GET | /api/admin | 401 (42B) | /api/admin/* catch-all 401 |
| GET | /health | 200 `{"ok":true,"clients":13,"ts":"..."}` | **info disclosure** (F-A5) |
| GET | /pages/admin | 302 (/) | limpa `api_painel_token` |
| GET | /pages/cliente | 302 (/) | limpa `api_painel_token` |

- API docs: nenhum. robots.txt = Cloudflare managed. sitemap = 404. /pages/ só tem admin+cliente (auth).
- Cookie `api_painel_token` (cookie-based, não JWT).

### 2.3 bot / bot2
- bot.querybuscas.com → 502 (origin down) — sem alteração vs Fase 3.
- bot2.querybuscas.com → 401 global (size 0) em todas rotas/métodos (/, /health, /api, /webhook,
  /bot, /status, /api/admin, /login). Middleware de auth global; esquema não descoberto
  (provável IP allowlist via CF-Connecting-IP ou header secreto).

---

## 3. Candidatos a vulnerabilidade (Fase 5)

| # | Vuln | Endpoint | Host | Sev | Detalhe | Próximo passo (webapp) |
|---|------|----------|------|-----|---------|------------------------|
| **F-E1** | **Enumeração de usuários pré-auth** | `POST /api/pagamento/verificar-externa` | apex | **Alta** | 400 "Username obrigatório" / 404 "Usuário não encontrado" / [diferente se existe]; **sem rate-limit** (sem headers x-ratelimit) | brute force usernames (lista BR) p/ mapear contas; alimentar brute de login no api host |
| **F-E2** | **IDOR /api/telegram/data/<md5>** | `GET /api/telegram/data/<md5>` | apex | Alta | oracle de formato (32-hex=404); token conhecido expirou; se MD5(user_id/timestamp/chat_id) previsível → recupera dados Telegram | investigar origem do MD5; testar MD5 de user_ids sequenciais |
| **F-E3** | **BOLA/IDOR consultas PII** | `GET /api/consultas/<rota>?q=<valor>` | apex | **Crítica** | 38 módulos PII (CPF/score/parentes/PIX/ULP...); após auth + bypass Turnstile (2captcha) | auth brute no api host → cookie válido? testar se cookie apex==api; bypass Turnstile; testar q em múltiplos; IDOR via user_id |
| **F-E4** | **CSRF logout** | `POST /api/auth/logout` | apex | Baixa | 200 sem auth/token (só limpa cookie) | report (baixo impacto) |
| **F-E5** | **Rate limit per-IP (não global)** | `POST /api/gerar-pix` | apex | Info | scope=`gerar-pix-ip` — bypass via rotação Tor NEWNYM | corrigir SUMMARY; abuse pagamento esgotando cota por IP |

### Adicionais (reconfirmação/refino)
- **F-A2 (Alta) expandido:** `/api/admin` existe em **ambos** apex+api (não só api); catch-all 401
  impede enum de sub-rotas sem cred admin. Após auth admin → enumerar users/modules/config/stats/export.
- **F-A5 (Média) reconfirmado:** `/health` vaza clients:13 + ts.
- **Mass-assignment candidate:** `/api/auth/verify` retorna `user.tipo`; login redirect por tipo
  → testar injetar `tipo`/`isAdmin` em pre-register/profile (privesc client→admin).

---

## 4. Correções ao recon/SUMMARY

1. **Rate limit /api/gerar-pix:** SUMMARY reportou "GLOBAL 30/window". Confirmado **PER-IP**
   (`scope:"gerar-pix-ip"`, `retryAfterSeconds` decrescente por IP). Bypass via Tor NEWNYM.
2. **/api/admin:** SUMMARY citava só api host. Confirmado existe **também no apex** (47B 401).
3. **robots.txt apex:** Fase 2 leu disallow `/api/`,`/pages/admin`,`/telegram/`; agora é
   Cloudflare managed (Allow: /). Possível versão wayback/cache na Fase 2.

---

## 5. API docs / GraphQL
- **Nenhum** em ambos hosts: /swagger, /swagger.json, /openapi.json, /api-docs, /api/docs,
  /graphql, /api/graphql, /.well-known/openapi.json → 404. Não há GraphQL nem OpenAPI/Swagger.

---

## 6. Próximos passos para webapp (Fase 6) — priorizados

1. **Auth brute force no api host login** (sem Turnstile, rate 5/window — rotacionar Tor a cada 5).
   Wordlist de usernames via **F-E1** (verificar-externa enum) + senhas BR comuns. Cookie `api_painel_token`.
2. **F-E1:** mapear usernames válidos via `/api/pagamento/verificar-externa` (sem rate limit).
3. **F-E2:** investigar origem do token MD5 do Telegram; testar previsibilidade.
4. **F-E3:** após auth — bypass Turnstile via 2captcha (chave em ~/.config/opencode/.2captcha_key),
   obter nonce/sig, executar `/api/consultas/<rota>?q=`; testar BOLA/IDOR (variar user_id, q).
5. **/api/admin:** após auth admin (privesc mass-assignment ou cred encontrada) — enumerar
   sub-rotas (users CRUD, export PII, config leak de chaves upstream/Turnstile sitekey).
6. **Mass-assignment:** testar escalar `user.tipo` client→admin em pre-register/perfil.
7. **Pagamento:** testar ativar plano sem pagar (manipular token/verificar-externa).

---

## 7. Artefatos brutos (enum/)

### enum/apex/
- `app.min.js` / `app.min.beautified.js` — JS live de-minified (1524 linhas)
- `app.min.wayback.js` / `app.min.wayback.beautified.js` — JS wayback de-minified (1432 linhas)
- `analytics.js`, `attribution.js`, `pixel.js` — JS auxiliares
- `js_endpoints.txt` — extração completa de endpoints/params/constantes do app.min.js
- `content_discovery.txt` — /api/ + /pages/ fuzz + testes diretos
- `params.txt` — param mining por endpoint + candidatos a vuln
- `apex_api_fuzz.csv` — GET /api/ fuzz
- `apex_admin_fuzz.csv` — GET /api/admin/ fuzz (catch-all 401)
- `apex_pages_fuzz.csv` — GET /pages/ fuzz
- `apex_api_post_fuzz2.csv` — POST /api/ fuzz
- `apex_vext_params.csv` — param-name fuzz verificar-externa

### enum/api/
- `common.js` / `common.beautified.js`, `login.js` / `login.beautified.js`
- `content_discovery.txt` — /api/ + /pages/ + /health
- `admin_fuzz.txt` — análise do catch-all 401 + sub-rotas prováveis
- `api_api_fuzz2.csv` — GET /api/ slow fuzz
- `api_pages_fuzz.csv` — GET /pages/ fuzz

### enum/ (raiz)
- `api_wordlist.txt` — wordlist combinada (seclists api + custom admin/debug)
- `ENUM.md` — este documento

---

*Fase 5 concluída pelo especialista enum em 2026-09-04. Tráfego via Tor (IPs: 45.95.169.32,
176.65.148.3). Cloudflare rate-limitou o api host durante fuzz agressivo — mitigado com
NEWNYM + fuzz lento (-t 3, -p 0.8). Nenhuma ação destrutiva.*
