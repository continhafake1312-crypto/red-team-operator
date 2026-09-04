# SUMMARY.md — Attack Surface Consolidada — querybuscas.com

> Consolidado das Fases 2 (passivo) + 3 (ativo). Ranking de payoff para próximas fases.
> Atualizado em 2026-09-04 após Fase 3 (recon-active).

---

## 1. Attack surface

### Hosts vivos (4 — todos Cloudflare-proxied)
| Host | Role | Status | Stack |
|------|------|--------|-------|
| querybuscas.com | apex — marketing SPA + app principal (consultas, telegram, pagamento, auth) | 200 | Node.js/Express + Cloudflare (Turnstile/Insights) + HTTP/3 |
| api.querybuscas.com | api — painel admin/cliente (app separado) | 200 | Node.js (hidden) + Cloudflare + HSTS preload + HTTP/3 |
| bot.querybuscas.com | bot — backend Telegram | 502 (origin down) | Cloudflare (origin inacessível) |
| bot2.querybuscas.com | bot2 — API/bot autenticado | 401 (auth global) | Cloudflare (origin vivo, auth middleware) |
| www.querybuscas.com | — | sem DNS | não configurado |

**IPs Cloudflare edge:** 104.21.91.102, 172.67.215.155 (IPv4); 2606:4700:3032::6815:5b66, 2606:4700:3037::ac43:d79b (IPv6)
**IP de origem real:** NÃO descoberto (Cloudflare bem configurado; técnicas passivas+ativas esgotadas via Tor sem API keys). Candidato não confirmado: 37.59.176.223 (OVH FR).

### Portas expostas (Cloudflare edge — não origin)
13 portas CDN padrão: 80, 443, 8080, 8443, 8880, 2052, 2053, 2082, 2083, 2086, 2087, 2095, 2096

### Vhosts
Exatamente 4 configurados (apex, api, bot, bot2). Demais hostnames → Cloudflare 530 (err 1016). Nenhum vhost oculto.

### WAF / TLS
- WAF: Cloudflare em todos os hosts.
- TLS: Let's Encrypt YE2 wildcard `*.querybuscas.com` (Sep 2 – Dec 1 2026); TLSv1.3 AES_256_GCM; TLSv1.2 ECDHE-ECDSA-CHACHA20-POLY1305; TLSv1.1 desabilitado. HSTS só no api (apex sem HSTS).

### Cloud
S3/DO/Azure/GCP buckets: **ausentes**. Backblaze: falso positivo (API exige auth). Nenhum bucket exposto.

---

## 2. Arquitetura (2 apps separados, mesmo user DB)

| Atributo | apex (App A) | api (App B) |
|----------|-------------|-------------|
| Função | marketing + consultas PII + telegram + pagamento + auth | painel admin/cliente + /api/admin + /health |
| JSON | `{"success":...}` | `{"ok":...}` |
| x-powered-by | Express | oculto |
| HSTS | ausente | preload |
| CSP | rica (FB/GA/Turnstile/qrserver) | strict (script-src 'self') |
| Turnstile no login | sim | **não** (melhor alvo brute force) |
| Cookie sessão | (não capturado) | `api_painel_token` |
| /health | não | sim (vaza clients:13) |

Auth: cookie-based (`credentials:include`), NÃO JWT. Login aceita username OU email.
`/api/auth/verify` → `user.tipo` (admin/client). Redirect: admin→/pages/admin, client→/pages/cliente.

---

## 3. Endpoints chave

### Auth
- `POST /api/auth/login` {username, password} — rate 5/window
- `GET /api/auth/verify` — retorna user.tipo
- `POST /api/auth/pre-register` — rate 3/window (muito apertado)
- `POST /api/auth/complete-reset` — reset senha (Turnstile)
- `POST /api/auth/logout`

### Consultas PII (apex, precisam auth + Turnstile)
- `GET /api/consultas/nonce` — rate 10/window per IP
- `POST /api/consultas/verificar-humano` — Turnstile verification
- `GET /api/user/modulos` — lista módulos acessíveis (enum permissões)

### Telegram (apex)
- `GET /api/telegram/data/<md5>` — IDOR oracle (invalid_id vs not_found_or_expired)
- `/telegram/data/` — 302 redirect (rota real)

### Pagamento (apex)
- `POST /api/gerar-pix` — rate 30/window GLOBAL
- `POST /api/pagamento/verificar` — verifica status

### Admin (api host)
- `GET /api/admin` — 401 (endpoint admin existe!)
- `/pages/admin`, `/pages/cliente` — painéis (302 sem auth)

### Info disclosure (api host)
- `GET /health` → `{"ok":true,"clients":13,"ts":"..."}` (vaza clients + ts)

---

## 4. Rate limits (thresholds p/ brute force)

| Scope | Limit | Endpoint |
|-------|-------|----------|
| auth-login | 5/window | /api/auth/login |
| auth-pre-register | 3/window | /api/auth/pre-register |
| consultas-ip | 10/window per IP | /api/consultas/{nonce,verificar-humano} |
| gerar-pix-global | 30/window GLOBAL | /api/gerar-pix |

---

## 5. Catálogo PII (70+ módulos — ALTO VALOR)

CPF, CNPJ, CNH, RG, TITULO_ELEITOR, CNS, NIS, PIS, RENAVAM, PLACA, CHASSI, MARCA,
MODELO, COR, FROTA, BIN, NOME, NOME_FANTASIA, NOME_MAE, NOME_PAI, NOME_ABREVIADO,
DATA_NASCIMENTO, IDADE, SEXO, RACA, ESTADO_CIVIL, ESCOLARIDADE, TIPO_SANGUINEO,
PROFISSAO, OCUPACAO, CARGO, CLASSE_SOCIAL, FOTO, OBITO, TELEFONE, EMAIL, CHAVEPIX,
ENDERECOS, CEP, CIDADE, MUNICIPIO, PARENTES, SCORE, RENDA, SALARIO, CAPITAL_SOCIAL,
BANCO, AGENCIA, CONTA, INSS, RECEBE_INSS, EMPRESAS, EMPREGOS, ADMISSAO, DEMISSAO,
SITUACAO, STATUS_RECEITA, PROPRIETARIOS (sócios), LEADS, etc.

---

## 6. Ranking de payoff (consolidado Fase 2+3)

| Rank | Vetor | Payoff | Esforço | Host | Fase |
|------|-------|--------|---------|------|------|
| 1 | **Auth bypass / default creds no login api** (sem Turnstile!) | Crítica (acesso painel) | Baixo | api | webapp |
| 2 | **IDOR /api/telegram/data/<md5>** (enum tokens) | Alta (vazamento Telegram) | Médio | apex | webapp |
| 3 | **IDOR/BOLA /api/consultas/*** (consultas PII) | Crítica (vazamento PII 70+ módulos) | Médio | apex | webapp |
| 4 | **/api/admin** endpoint | Crítica (admin API) | Médio | api | webapp |
| 5 | **IDOR /api/user/modulos** (enum permissões) | Alta (mapa módulos) | Baixo | apex | webapp |
| 6 | **Mass-assignment** role (user.tipo) | Alta (privesc client→admin) | Médio | api+apex | webapp |
| 7 | **Manipulação pagamento PIX** | Média (ativar sem pagar) | Médio | apex | webapp |
| 8 | **auth-pre-register abuse** | Média | Alto (3/window) | apex | webapp |
| 9 | **bot2 auth bypass** | Média | Alto | bot2 | webapp |
| 10 | **SSRF/origin leak** via webapp | Alta (bypass CF) | Alto | apex | webapp |
| 11 | **/health info disclosure** | Baixa (monitor) | Baixo | api | report |
| 12 | **HSTS ausente apex** | Baixa | Baixo | apex | report |

---

## 7. Próximas fases

1. **enum (Fase 5):** content discovery (rotas SPA /pages/*, /api/*), de-minify app.min.js,
   param mining (/api/consultas/*, /api/telegram/data/*), descobrir mais endpoints admin.
2. **webapp (Fase 6):** auth brute force no api login (sem Turnstile), IDOR telegram data,
   BOLA consultas (após Turnstile bypass com 2captcha), /api/admin, cookie tampering.
3. **cve (Fase 7):** sem versão específica (Express genérico). Sem CVE direto por enquanto.
4. **report (Fase 9):** consolidar F-P1..F-P11 + F-A1..F-A12.

---

## 8. Findings consolidados (22 total: 11 passivos + 12 ativos)

### Crítica
- F-P1 / F-A1: Plataforma PII (70+ módulos sensíveis)

### Alta
- F-P2: /pages/admin existe (302 auth)
- F-P3: api.querybuscas.com app de API com login
- F-P4: bot2 401 (API/bot autenticado)
- F-P6: /api/telegram/data/<md5> IDOR candidate
- F-A2: /api/admin endpoint existe (api host)
- F-A3: /api/telegram/data IDOR oracle confirmado
- F-A4: api login sem Turnstile (melhor alvo brute force)

### Média
- F-P5: bot 502 (origin down)
- F-P7: endpoints pagamento PIX
- F-A5: /health info disclosure (clients count)
- F-A6: bot2 401 global auth middleware
- F-A7: gerar-pix rate limit GLOBAL (DoS cota)

### Baixa / Info
- F-P8: apex sem HSTS
- F-P9: sem SPF/DMARC/MX
- F-P10: favicon hash -491867804
- F-P11: bots Telegram (OSINT)
- F-A8: bot 502 origin down
- F-A9: apex sem HSTS (reconf)
- F-A10: api_painel_token cookie
- F-A11: 2 apps separados mesmo user DB
- F-A12: IP origem real não descoberto

---

*Consolidado em 2026-09-04 após Fases 2+3. Detalhes em `passive/PASSIVE.md` e `active/ACTIVE.md`.*
