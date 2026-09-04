# ACTIVE.md — Recon Ativo (Fase 3) — querybuscas.com

> Fase 3 do engagement. Fingerprint ativo de serviços expostos (rate-limited, stealth).
> TODO tráfego via Tor (socks5://127.0.0.1:9050). Tor exit: 179.43.182.232.
> Nenhuma ação destrutiva; apenas fingerprint, probes e enumeração de superfície.

---

## 1. Sumário executivo

| Métrica | Valor |
|--------|-------|
| Hosts vivos sondados | **4** (apex, api, bot, bot2) — todos Cloudflare-proxied |
| IPs de origem real confirmados | **0** (Cloudflare bem configurado; técnicas esgotadas via Tor) |
| IPs candidatos (não confirmados) | 1 (37.59.176.223 / OVH FR — sem resposta via Tor) |
| WAF | **Cloudflare** em todos os 4 hosts |
| Apps separados | **2** (apex = marketing+main; api = painel admin/cliente) |
| Portas expostas (edge CF) | 13 portas CDN padrão (80,443,8080,8443,8880,2052/53,2082/83,2086/87,2095/96) |
| Vhosts configurados | **4** (apex, api, bot, bot2) — demais → CF 530 err 1016 |
| Endpoints API mapeados | 11+ (auth, consultas, user/modulos, gerar-pix, telegram/data, admin) |
| Rate limits descobertos | **4** (auth-login:5, pre-register:3, consultas-ip:10, gerar-pix-global:30) |
| Cookies de sessão | `api_painel_token` (api host) — cookie-based, NÃO JWT |
| Turnstile no login api | **NÃO** (api login sem captcha — alvo melhor p/ brute force) |
| Findings ativos | 12 (1 Crítica, 4 Alta, 4 Média, 3 Baixa/Info) |

**Alvo confirmado como data-broker PII brasileiro** (40+ módulos de consulta de dados
sensíveis de terceiros). A Fase 3 mapeou a arquitetura completa (2 apps), os endpoints,
rate limits, cookie de sessão, e confirmou que o IP de origem real não é descobrível
neste ambiente (Cloudflare bem configurado + Tor + sem API keys).

---

## 2. Hosts e IPs

| Host | A record (CF) | HTTP | Title | App |
|------|---------------|------|-------|-----|
| querybuscas.com | 104.21.91.102, 172.67.215.155 | 200 | QueryBuscas - Consultas Rápidas e Completas | apex (marketing SPA + main) |
| api.querybuscas.com | 104.21.91.102, 172.67.215.155 | 200 | QueryBuscas API — Login | api (painel admin/cliente) |
| bot.querybuscas.com | 104.21.91.102, 172.67.215.155 | **502** | (origin down) | bot (origin backend down) |
| bot2.querybuscas.com | 104.21.91.102, 172.67.215.155 | **401** | (auth global) | bot2 (API/bot autenticado) |
| www.querybuscas.com | (sem DNS) | — | — | não configurado |

**IPs Cloudflare edge:** 104.21.91.102, 172.67.215.155 (IPv4);
2606:4700:3032::6815:5b66, 2606:4700:3037::ac43:d79b (IPv6).
**IP de origem real: NÃO descoberto** (ver `origin_ip_research.txt`).

---

## 3. WAF

`wafw00f` em todos os 4 hosts → **Cloudflare (Cloudflare Inc.)** confirmado.
Generic detection: negativo (Cloudflare não é detectado por assinatura genérica,
apenas por fingerprint específico). 7 requests por host.

Artefato: `waf_all.txt`

---

## 4. TLS (todos os 4 hosts idênticos)

| Atributo | Valor |
|----------|-------|
| Subject CN | querybuscas.com |
| Issuer | C=US, O=Let's Encrypt, CN=YE2 |
| Validade | Sep 2 2026 – Dec 1 2026 (renovado há 2 dias) |
| SAN | DNS:*.querybuscas.com, DNS:querybuscas.com (wildcard) |
| TLSv1.3 cipher | TLS_AES_256_GCM_SHA384 |
| TLSv1.2 cipher | ECDHE-ECDSA-CHACHA20-POLY1305 (forte, PFS) |
| TLSv1.1 | **desabilitado** (bom) |
| HSTS | **apenas api host** (max-age=31536000; includeSubDomains; preload). Apex **sem HSTS** (inconsistência) |

Cert gerido pela Cloudflare (Advanced Certificate Manager). Todos os hosts servem o
mesmo cert wildcard. Artefato: `tls_all.txt`

---

## 5. Portscan (Cloudflare edge)

`nmap -sT` nos 2 IPs Cloudflare (via proxychains). Ambos idênticos — 13 portas CDN
padrão abertas (Cloudflare proxy, NÃO origin):

```
80/http  443/https  8080/http-proxy  8443/https-alt  8880/cddbp-alt
2052  2053  2082  2083  2086  2087  2095  2096
```

Todas são portas de proxy da Cloudflare (não revelam serviços de origem).
Artefato: `nmap_cf.txt`

---

## 6. Vhosts

Vhost fuzz com **SNI correto** (querybuscas.com) + Host override em 20 nomes comuns:

| Host | HTTP | Tamanho | Notas |
|------|------|---------|-------|
| api.querybuscas.com | 200 | 4307 | api login page (conhecido) |
| bot.querybuscas.com | 502 | 16 | origin down (conhecido) |
| bot2.querybuscas.com | 401 | 0 | auth global (conhecido) |
| querybuscas.com (default) | 200 | 69908 | apex home (conhecido) |
| admin, www, dev, staging, panel, painel, app, bot3, bot4, telegram, webhook, suporte, status, internal, old, new, test, backup | **530** | 17 | **"error code: 1016"** (CF: hostname não configurado) |

**Conclusão: attack surface via Cloudflare = exatamente 4 hostnames.** Nenhum vhost
oculto/admin/dev/staging. Artefato: `vhosts_correct.txt`

---

## 7. Arquitetura (2 apps separados)

```
                    Cloudflare (CDN/WAF/Turnstile)
                    104.21.91.102 / 172.67.215.155
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   querybuscas.com   api.querybuscas.com   bot/bot2.querybuscas.com
   (apex — App A)    (api — App B)         (backends)
        │                  │
   Node.js/Express   Node.js (hidden)
   marketing SPA     painel admin/cliente
   + consultas       + /api/admin
   + telegram data   + /health
   + pagamento       + login (sem Turnstile!)
   + auth           + auth
        │                  │
        └────────┬─────────┘
                 │
          (mesmo user DB — login errors idênticos)
```

**Diferenças entre apps:**
| Atributo | apex (App A) | api (App B) |
|----------|-------------|------------|
| JSON format | `{"success":bool,"message":...}` | `{"ok":bool,"message":...}` |
| x-powered-by | Express | (oculto) |
| HSTS | ausente | preload |
| CSP | rica (FB/GA/Turnstile/qrserver) | strict (`script-src 'self'`) |
| Turnstile no login | sim (consultas/checkout/reset) | **não** |
| Cookie sessão | (não capturado, login falhou) | `api_painel_token` |
| /health | não (SPA 404) | **sim** (200, vaza clients) |
| Erro 404 | `{"success":false,"message":"Endpoint não encontrado."}` | `{"ok":false,"message":"Endpoint não encontrado."}` |

Login error idêntico em ambos ("Usuário ou senha incorretos.") → **mesmo user DB**.

---

## 8. Endpoints mapeados

### apex (querybuscas.com) — App A
| Método | Endpoint | Status (sem auth) | Rate limit | Notas |
|--------|----------|-------------------|------------|-------|
| POST | /api/auth/login | 401 "Usuário ou senha incorretos." | auth-login: 5/window | {username,email-allowed, password} |
| POST | /api/auth/pre-register | 400 "Usuário e senha são obrigatórios." | **auth-pre-register: 3/window** | checkout flow |
| POST | /api/auth/complete-reset | (reset senha, Turnstile) | — | password reset |
| GET | /api/auth/verify | 401 "Não autenticado." | — | retorna user.tipo |
| POST | /api/auth/logout | — | — | |
| GET | /api/user/modulos | 401 "Não autenticado." | — | lista módulos acessíveis |
| GET | /api/consultas/nonce | 401 "Não autenticado." | **consultas-ip: 10/window** | nonce p/ consultas |
| POST | /api/consultas/verificar-humano | 401 "Não autenticado." | consultas-ip: 10/window | Turnstile verification |
| POST | /api/gerar-pix | 400 "Plano inválido." | **gerar-pix-global: 30/window** | GLOBAL (orçamento compartilhado!) |
| POST | /api/pagamento/verificar | 400 "Token obrigatório." | — | verifica status pagamento |
| GET | /api/telegram/data/<md5> | 400 invalid_id / 404 not_found_or_expired | — | **IDOR oracle** (enum de tokens) |
| GET | /telegram/data/ | 302 → / | — | rota real (espera token após) |

### api (api.querybuscas.com) — App B
| Método | Endpoint | Status (sem auth) | Notas |
|--------|----------|-------------------|-------|
| GET | / | 200 | login page (sem Turnstile) |
| GET | **/health** | **200 `{"ok":true,"clients":13,"ts":"..."}`** | **INFO DISCLOSURE** |
| POST | /api/auth/login | 401 "Usuário ou senha incorretos." | rate 5/window, sem Turnstile |
| GET | /api/auth/verify | 401 "Não autenticado." | |
| GET | **/api/admin** | **401 "Não autenticado."** | **endpoint admin existe!** |
| GET | /pages/admin | 302 → / (clears api_painel_token) | painel admin |
| GET | /pages/cliente | 302 → / (clears api_painel_token) | painel cliente |
| GET | /assets/js/login.js | 200 (2087 bytes) | analisado |
| GET | /assets/js/common.js | 200 (2202 bytes) | analisado |

### bot.querybuscas.com
- Todas as rotas → **502** (origin backend down, consistente em 3 tentativas).
- cf-ray: ZRH. Cloudflare não consegue alcançar a origem.

### bot2.querybuscas.com
- **Todas as rotas, métodos, e headers de auth → 401** (content-length 0, sem WWW-Authenticate).
- cf-cache-status: DYNAMIC/BYPASS (origin responde, mas rejeita tudo).
- Testado: X-Telegram-Bot-Api-Secret-Token, Authorization Bearer, X-Api-Key, todos os
  métodos HTTP, paths /webhook /bot /telegram /bot<token> — todos 401.
- **Conclusão: middleware de auth global** (provável IP allowlist via CF-Connecting-IP,
  ou header secreto não adivinhado). Origin está VIVO (diferente do bot).

---

## 9. Rate limits (GOLD para webapp)

| Endpoint | Scope | Limit | Implicação |
|----------|-------|-------|------------|
| /api/auth/login | auth-login | 5/window | brute force auth → 5 tentativas/janela (rotacionar IP/Tor NEWNYM) |
| /api/auth/pre-register | auth-pre-register | **3/window** | MUITO apertado — enum/abuso de registro difícil |
| /api/consultas/{nonce,verificar-humano} | consultas-ip | 10/window per IP | pré-auth, por IP |
| /api/gerar-pix | gerar-pix-global | 30/window | **GLOBAL** (orçamento compartilhado entre todos os usuários!) |

Headers: `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-scope`.

---

## 10. Auth model

- **Cookie-based sessions** (`credentials: 'include'`), NÃO JWT/Bearer.
- Cookie name (api host): **`api_painel_token`** (descoberto via Set-Cookie no redirect
  de /pages/admin — `api_painel_token=; Path=/; Expires=1970` quando não autenticado).
- Cookie name (apex): não capturado (login falhou, sem Set-Cookie).
- Login: `POST /api/auth/login {username, password}` — username aceita username OU
  email (lowercased, regex `a-z0-9._%+@-`).
- `/api/auth/verify` (GET) retorna `user.tipo` ('admin' ou 'client').
- **Role-based redirect**: admin → `/pages/admin`, client → `/pages/cliente` (api host).
- **api login NÃO tem Turnstile** (melhor alvo p/ auth brute force — só rate limit 5/window).
- apex login/consultas/checkout/reset usam Turnstile (`QB_TURNSTILE.pedirCaptcha(siteKey, action)`).

---

## 11. JS analysis (assets fetched)

### api host
- `login.js` (2087 B): flow login, redirect por tipo (admin/cliente), `/api/auth/verify`.
- `common.js` (2202 B): `fetchJSON` com `credentials:'include'`, `maskTokenJS` (tokens
  >12 chars), timezone `America/Sao_Paulo`, `/api/auth/logout`.

### apex
- `app.min.js` (44530 B): **catálogo completo de módulos PII** (70+ campos), endpoints
  `/api/consultas/{nonce,verificar-humano}`, wrapper `QB_TURNSTILE`, `DEFAULT_FAVORITOS
  =["Cpf","Telefone","Nome","Email","Cnpj","Placa"]`, `PLANO_SEM_PLANO="sem-plano"`,
  libs jspdf/jspdf-autotable (PDF de resultados). **Nenhum IP/token/chave hardcoded**
  (boa higiene).
- `analytics.js`: GA4 `G-3B72V1K7J2`.
- `attribution.js`: cookie `_qb_track` (30 dias, UTM/fbclid/ad_id, SameSite=Lax).
- `pixel.js`: FB Pixel `1014974574623928`.

### robots.txt (apex) — disallow explícito
`/api/`, `/pages/admin`, `/pages/dashboard`, `/pages/pagamento`, `/pages/consultas/`,
`/telegram/` (+ Cloudflare AI bot blocks). Confirma paths sensíveis.

### sitemap.xml (apex)
5 URLs públicas: `/`, `/pages/checkout`, `/pages/modulos`, `/pages/termos`, `/pages/comprar`.
Lastmod 2026-08-19.

Artefatos: `api_js.txt`, `apex_appmin_analysis.txt`, `modules_catalog.txt`,
`turnstile_config.txt`, `js_files/`.

---

## 12. Catálogo de módulos PII (70+ campos — ALTO VALOR)

Extraído de `app.min.js` (UPPERCASE tokens) + SHOWCASE da home:

**Identificadores:** CPF, CNPJ, CNH, RG, TITULO_ELEITOR, CNS (cartão saúde),
NIS, PIS, RENAVAM, PLACA, CHASSI, MARCA, MODELO, COR, FROTA, BIN (cartão)

**Pessoa:** NOME, NOME_FANTASIA, NOME_MAE, NOME_PAI, NOME_ABREVIADO, DATA_NASCIMENTO,
MUNICIPIO_NASCIMENTO, IDADE, SEXO, RACA, ESTADO_CIVIL, ESCOLARIDADE, TIPO_SANGUINEO,
PROFISSAO, OCUPACAO, CARGO, CLASSE_SOCIAL, FOTO, OBITO

**Contato:** TELEFONE, TELEFONES, EMAIL, EMAILS, CHAVEPIX (PIX)

**Localização:** ENDERECOS, LOGRADOURO, BAIRRO, CEP, COMPLEMENTO, NUMERO, CIDADE,
MUNICIPIO, ESTADO, SECAO (local de votação)

**Família/Relações:** PARENTES, MAE, PAI

**Financeiro:** SCORE (crédito), RENDA, SALARIO, CAPITAL_SOCIAL, BANCO, AGENCIA, CONTA,
BANCOS, RECEBE_INSS, INSS, PARTICIPACAO (societária)

**Profissional:** EMPRESAS, EMPREGOS, ADMISSAO, DEMISSAO, ATIVIDADE_PRINCIPAL,
RAZAO_SOCIAL, FANTASIA, SITUACAO, STATUS_RECEITA, PROPRIETARIOS (sócios),
REGISTROS, ITENS, LEADS

→ **Data-broker PII extremamente sensível.** Vazamento = impacto CRÍTICO (LGPD/GDPR).
Artefato: `modules_catalog.txt`

---

## 13. Cloud buckets (re-verificação Fase 3)

| Provider | Teste | Resultado |
|----------|-------|-----------|
| Azure Blob | querybuscas.blob.core.windows.net + 6 variantes | **000** (DNS não resolve) → **ausente** |
| GCP Storage | storage.googleapis.com/querybuscas + 5 variantes | **404 NoSuchBucket** → **ausente** |
| Backblaze B2 | querybuscas.s3.*.backblazeb2.com (4 regiões) | **403** "Unauthenticated requests are not allowed for this api" → **falso positivo** (API B2 exige auth p/ qualquer request; mesmo resultado p/ bucket inexistente) |
| S3 / DO | (passivo confirmou ausentes) | ausente |

Artefato: `cloud_buckets_recheck.txt`, `backblaze_check.txt`, `backblaze_falsepositive.txt`

---

## 14. Findings ativos (F-A)

| # | Finding | Host | Severidade | Detalhe | Próximo passo |
|---|---------|------|-----------|---------|---------------|
| F-A1 | **Plataforma PII** (70+ módulos: CPF/RG/CNH/score/renda/parentes/PIX/TITULO_ELEITOR/RACA/OBITO) | apex+api | **Crítica** | data-broker sensível confirmado em prod | enum → webapp (IDOR/BOLA em /api/consultas, /api/user/modulos) |
| F-A2 | `/api/admin` existe no api host (401) | api | **Alta** | endpoint admin confirmado | webapp: auth bypass, default creds, mass-assignment p/ escalar role |
| F-A3 | `/api/telegram/data/<md5>` IDOR oracle | apex | **Alta** | 400 invalid_id vs 404 not_found_or_expired → enum de tokens viável | webapp: brute/enumerate tokens MD5, recuperar dados Telegram |
| F-A4 | **api login sem Turnstile** | api | **Alta** | login page 4307B, sem captcha — só rate limit 5/window | webapp: auth brute force (rotacionar Tor NEWNYM a cada 5) |
| F-A5 | `/health` info disclosure no api host | api | **Média** | `{"ok":true,"clients":13,"ts":"..."}` vaza n° clientes e ts servidor | monitorar atividade; possible timing oracle |
| F-A6 | bot2.querybuscas.com 401 global (auth middleware) | bot2 | **Média** | origin vivo, rejeita tudo (IP allowlist ou header secreto) | enum: descobrir esquema auth (se CF-Connecting-IP spoofable via header) |
| F-A7 | Rate limit gerar-pix GLOBAL (30/window) | apex | **Média** | orçamento compartilhado — DoS/esgotamento de cota possível | webapp: abuse pagamento (negar serviço PIX ou esgotar cota global) |
| F-A8 | bot.querybuscas.com origin down (502) | bot | **Info** | backend offline/misconfig | re-testar periodicamente; se voltar, fingerprint |
| F-A9 | Ausência de HSTS no apex (api tem) | apex | **Baixa** | inconsistência de config | report misconfig |
| F-A10 | api_painel_token cookie (nome descoberto) | api | **Info** | session cookie-based | webapp: cookie theft/fixation, session puzzle |
| F-A11 | 2 apps separados c/ user DB compartilhado | apex+api | **Info** | mesma creds servem ambos | webapp: testar creds em ambos; token reuse |
| F-A12 | IP origem real não descoberto | — | **Info** | Cloudflare bem configurado | precisa Shodan/Censys API key ou probe fora-Tor do candidato OVH |

---

## 15. Ranking de payoff (atualizado — Fase 3)

| Rank | Vetor | Payoff | Esforço | Host | Status |
|------|-------|--------|---------|------|--------|
| 1 | **Auth bypass / default creds no login api** (sem Turnstile!) | Crítica (acesso painel) | Baixo | api | Pronto p/ webapp |
| 2 | **IDOR /api/telegram/data/<md5>** (enum de tokens) | Alta (vazamento Telegram) | Médio | apex | Pronto p/ webapp |
| 3 | **IDOR/BOLA em /api/consultas/*** (consultas PII) | Crítica (vazamento PII) | Médio | apex | Precisa auth + Turnstile bypass |
| 4 | **/api/admin** endpoint (admin API) | Crítica (admin RCE/data) | Médio | api | Precisa auth admin |
| 5 | **IDOR /api/user/modulos** (enum permissões) | Alta (mapa de módulos) | Baixo | apex | Precisa auth |
| 6 | **Mass-assignment** role (user.tipo) | Alta (privesc client→admin) | Médio | api+apex | Precisa auth |
| 7 | **Manipulação pagamento PIX** (/api/gerar-pix, /api/pagamento/verificar) | Média (ativar sem pagar) | Médio | apex | Precisa auth + fluxo checkout |
| 8 | **auth-pre-register abuse** (criar contas) | Média | Alto (3/window) | apex | Rate limit apertado |
| 9 | **bot2 auth bypass** (descobrir esquema) | Média | Alto | bot2 | Esquema auth desconhecido |
| 10 | **SSRF/origin leak** via webapp | Alta (bypass CF) | Alto | apex | Pendente encontrar endpoint SSRF |

---

## 16. Próximos passos recomendados

1. **enum (Fase 5):** content discovery profundo em apex (rotas SPA, /pages/*, /api/*),
   análise JS completa (app.min.js de-minificado), param mining em /api/consultas/*,
   /api/telegram/data/*, /api/gerar-pix.
2. **webapp (Fase 6):**
   - Auth brute force no **api host login** (sem Turnstile, rate 5/window — rotacionar Tor).
   - IDOR em `/api/telegram/data/<md5>` (enum de tokens MD5 — oracle confirmado).
   - BOLA/IDOR em `/api/consultas/*` (após auth + Turnstile bypass com 2captcha).
   - `/api/admin` (após auth) — mass-assignment, admin endpoints.
   - JWT/cookie analysis (api_painel_token — decodificar, testar fixation/tampering).
3. **cve (Fase 7):** Node.js/Express sem versão específica (x-powered-by: Express,
   sem versão). Sem CVE candidate direto — framework genérico. Monitorar se surgir
   versão em stack traces futuros.
4. **OSINT adicional:** GA4 `G-3B72V1K7J2` e FB Pixel `1014974574623928` como
   correlação (se houver acesso ao GA/Ads account).
5. **Origin IP (futuro):** Shodan/Censys API key → buscar favicon hash `-491867804`
   e cert `*.querybuscas.com`. Probe do candidato OVH 37.59.176.223 fora do Tor.

---

## 17. Artefatos brutos (recon/active/)

- `origin_ip_research.txt` — pesquisa de IP de origem real (detalhada)
- `origin_candidates_probe.txt`, `origin_quick_probe.txt`, `origin_verbose.txt`,
  `dnshistory.txt`, `dnshistory2.txt`, `shodan_internetdb.txt`, `crtsh_certs.txt`
- `nmap_cf.txt` — portscan Cloudflare edge
- `nmap_candidates.txt` — portscan candidatos origin (incompleto, Tor lento)
- `httpx_live.txt` — httpx fingerprint hosts vivos
- `whatweb_all.txt` — whatweb fingerprint
- `waf_all.txt` — wafw00f (Cloudflare em todos)
- `tls_all.txt` — openssl s_client (cert + ciphers)
- `vhosts_correct.txt`, `vhosts_focused.txt` — vhost fuzz (4 configurados, resto CF 530)
- `bot_retest.txt` — bot.querybuscas.com 502 (3 tentativas)
- `bot2_probe.txt`, `bot2_auth_scheme.txt` — bot2 401 global (auth investigation)
- `telegram_leak.txt` — /api/telegram/data/ leak test (IDOR oracle)
- `path_probes.txt`, `path_probes_api.txt` — path enumeration
- `post_tests.txt` — POST tests (pagamento, login, rate limits)
- `health_final.txt`, `health_deep.txt` — /health info disclosure (api)
- `wellknown.txt` — .well-known + misc probes
- `origin_leak_headers.txt` — debug header reflection
- `api_js.txt` — JS fetch results
- `apex_appmin_analysis.txt`, `modules_catalog.txt` — app.min.js analysis
- `turnstile_config.txt`, `turnstile_sitekey.txt`, `turnstile_deep.txt`,
  `turnstile_home.txt` — Turnstile investigation (sitekey não literal)
- `favicon_turnstile.txt` — favicon hash (-491867804 confirmado)
- `cloud_buckets_recheck.txt`, `backblaze_check.txt`, `backblaze_falsepositive.txt`
- `js_files/` — JS/static files baixados (app.min.js, login.js, common.js, etc.)

---

*Fase 3 concluída por recon-active em 2026-09-04. Tráfego via Tor (exit 179.43.182.232).
Nenhuma ação destrutiva; apenas fingerprint, probes e enumeração de superfície.
IP de origem real não descoberto (Cloudflare bem configurado + restrições de ambiente).*
