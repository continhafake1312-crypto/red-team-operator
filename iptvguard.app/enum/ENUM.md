# Enumeração Profunda — iptvguard.app

**Data:** 2026-08-22
**Operador:** enum specialist
**Proxy:** Tor via proxychains4 (127.0.0.1:9052)

---

## 1. gw.iptvguard.app (API Gateway) — CRÍTICO

### Public Endpoints (sem auth)

| Endpoint | Status | Detalhes |
|----------|--------|----------|
| `GET /api/health` | 200 | `{"status":"ok","commit":"f9a012dd532332d4f36c23801fa1d49d64141194"}` |
| `GET /api/plans` | 200 | Planos expostos: `test_product` (EUR 0/mês, maxPlaylists:10, maxDevices:5, maxFavoriteStars:9999) |
| `GET /api/plans/test_product` | 200 | Mesmo plano por slug |
| `GET /api/public/stats` | 200 | **DADO SENSÍVEL**: `testsTotal: 32533, avgOnlineRate: 91, message: "Statistiques récupérées"` |

### Authenticated Endpoints (401 AUTH_REQUIRED — existem)

| Endpoint | Status | Análise |
|----------|--------|---------|
| `GET/POST /api/playlists` | 401 | CRUD de playlists |
| `GET/POST /api/playlists/1` | 401 | Playlist específica |
| `GET /api/playlists/debug` | 401 | Debug dashboard |
| `GET /api/playlists?limit=1&offset=0` | 401 | Paginação |
| `GET /api/auth/me` | 401 | Current user info |
| `GET /api/admin/users` | 401 | **Lista de usuários admin** |
| `GET /api/admin/verify` | 401 | Admin verify |
| `GET /api/admin/users/stats` | 401 | Stats de usuários |
| `GET /api/admin/crons/status` | 401 | Cron jobs status |
| `GET /api/admin/heroes` | 401 | Gerenciamento de herois |
| `GET /api/admin/quota/stats` | 401 | Quota stats |
| `GET /api/admin/discord/stats` | 401 | Discord stats |
| `GET /api/admin/revenue/overview` | 401 | Revenue overview |

### Não encontrados (404)
- `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`, `/api/auth/logout`
- `/api/auth/forgot`, `/api/auth/reset`, `/api/auth/update-password`
- `/api/checker`, `/api/checker/validate`, `/api/checker/test`
- `/api/channels`, `/api/channel`, `/api/stream`, `/api/streams`
- `/api/v1/*`, `/api/v2/*`
- `/api/users/me`, `/api/user/me`, `/api/profile`
- `/api/providers`, `/api/providers/aliases`
- Todos OpenAPI/Swagger/GraphQL endpoints (404)
- `.env`, `.git/config`, `package.json`, `Dockerfile` (timeout/filtrados)

### Auth Bypass Tests
- **JWT inválido**: 401 (não aceita token qualquer)
- **X-API-Key**: 401
- **Sem auth**: 401
- **OPTIONS**: 204 (CORS liberado)

### \/ Candidatos a Vulnerabilidade
1. **IDOR em /api/plans/test_product**: Rota pública expõe detalhes de plano incluindo `maxFavoriteStars: 9999`
2. **IDOR em /api/public/stats**: Métricas internas expostas (`testsTotal: 32533`, `avgOnlineRate: 91`)
3. **Força bruta de JWT**: /api/playlists e /api/auth/me aceitam tentativas sem rate limit observado
4. **Rate limiting**: Testar se há rate limit nos endpoints 401 (possível enumeração de usuários se houver diferença entre "user exists" e "user not found")

---

## 2. hq.iptvguard.app (BackOffice SPA) — CRÍTICO

### Tech Stack (confirmado via JS)
- **React 18 + Vite** (SPA shell: 959 bytes)
- **Supabase** (Auth + Storage + Realtime)
- **Zustand** (state management, store: `auth-storage`)
- **Axios** (HTTP client)
- **Goober** (CSS-in-JS)
- **JWT Bearer** auth

### Rotas do BackOffice (extraídas do JS bundle)

| Rota | Descrição |
|------|-----------|
| `/signin` | Login |
| `/users` | Lista de usuários |
| `/settings` | Configurações |
| `/providers` | Gerenciamento providers |
| `/revenue` | Receita |
| `/tv-scheduler` | Programação TV |
| `/iceberg` | Iceberg view |
| `/vector` | Vector view |
| `/monitoring` | Monitoramento |
| `/playlist-debug` | Debug playlists |
| `/checker-analytics` | Analytics do checker |
| `/early-users` | Early users |
| `/system/stats` | Sistema stats |
| `/diagnostics/health` | Diagnóstico saúde |
| `/diagnostics/matching-stats` | Matching stats |
| `/explorer/heroes` + `/explorer/heroes/new` | Gerenciar herois |
| `/explorer/lists` + `/explorer/lists/new` | Gerenciar listas |
| `/explorer/avatars` | Gerenciar avatares |
| `/admin/verify` | Admin verify |
| `/admin/users` + `/admin/users/stats` + `/admin/users/cleanup-orphans` | CRUD users |
| `/admin/heroes` + sub-rotas config | CRUD herois + config |
| `/admin/providers/aliases` + `/admin/providers/aliases/list` + `/admin/providers/normalize-playlists` + `/admin/providers/normalize/test` | Providers |
| `/admin/playlists/debug-dashboard` | Debug playlists |
| `/admin/push/subscribe` + `/admin/push/preferences` + `/admin/push/test` + `/admin/push/unsubscribe` + `/admin/push/vapid-key` + `/admin/push/logs/mark-viewed` | Push notifications |
| `/admin/quota/stats` | Quota |
| `/admin/recommendations/lists` + `/admin/recommendations/lists/upload-backdrop` | Recommendations |
| `/admin/revenue/overview` + `/admin/revenue/plans` | Revenue |
| `/admin/tmdb/search-multilingual` | TMDB search |
| `/admin/tv-scheduler/assign` + `/admin/tv-scheduler/assign-bulk` + `/admin/tv-scheduler/import-match` + `/admin/tv-scheduler/livesoccertv-vps` + `/admin/tv-scheduler/templates` | TV Scheduler |
| `/admin/discord/stats` | Discord stats |
| `/admin/crons/logs/cleanup` + `/admin/crons/status` | Cron jobs |
| `/api/broadcast` | Broadcast API |
| `/auth/update-password` | Update password |
| `/admin/avatars` | Avatars admin |

### Configurações Sensíveis do JS

**Supabase:**
- **URL**: `https://tcdvagdagetvrvolzcry.supabase.co`
- **Storage**: `${supabaseUrl}/storage/v1/object/public/{bucket}`
- **Auth**: PKCE flow, `sb-auth-token` storage key
- **Refresh**: Auto-refresh de sessão a cada 5 minutos se expirando

**Integrações:**
- **TMDB**: `https://image.tmdb.org/t/p/w500{poster_path}`
- **PostHog**: `https://app.posthog.com`, `https://us.i.posthog.com`, `https://eu.i.posthog.com`
- **Sentry**: `https://sentry.io/organizations/`
- **UI Avatars**: `https://ui-avatars.com/api/?name={name}`

**Axios Config:**
- Base URL: Provavelmente `https://gw.iptvguard.app/api/` (inferido do `preconnect` no HTML)
- Transform request: JSON serialization automático
- Interceptors: Bearer token injection

**JWT Flow:**
- `access_token` + `refresh_token` + `expires_in`
- Token parsing: `JSON.parse(atob(token.split(".")[1])).exp`
- Refresh automático se `exp - now < 300s`

**Admin API Calls (via Axios - extraídos do JS):**
- `GET /admin/heroes/{id}` — carrega heroi
- `POST /admin/heroes/upload-image` — upload imagem
- `GET /admin/recommendations/lists/{listId}` — carrega lista
- `GET /admin/recommendations/items/{itemId}` — carrega item
- `DELETE /admin/recommendations/lists/{listId}/items/{itemId}` — deleta item

### Credenciais e Secrets (hardcoded/strings no JS)
- `password=a.weak_password` — referência a senha fraca
- `http://example.com:8080/get.php?username=xxx&password=yyy` — padrão de URL IPTV
- `http://provider.tv/live/user/pass` — padrão Xtream
- `token` patterns em toda a base — JWT/session tokens
- `apikey` — API key storage

### \/ Candidatos a Vulnerabilidade
1. **Supabase anon key exposure**: O JS contém a Supabase URL, e se a anon key estiver hardcoded (ou obtível via env), acesso a dados públicos do Supabase é possível
2. **IDOR em admin/heroes/{id}**: IDs sequenciais, testar acesso sem auth
3. **IDOR em admin/recommendations**: Items endpoints
4. **SSRF via normalize-playlists**: Endpoint aceita URLs para normalizar — testar com URLs internas
5. **No rate limiting aparente**: Possível brute force em signin
6. **Storage bucket público**: Verificar `supabase.co/storage/v1/object/public/` — bucket não encontrado mas endpoint existe

---

## 3. iptvguard.app (Checker — Next.js 14) — ALTO

### Tech Stack (confirmado)
- **Next.js 14** (App Router)
- **React 18 + Tailwind**
- **Turbopack** (build)
- **Vercel Analytics + SpeedInsights**

### Rotas do Checker

| Rota | Status | Tamanho |
|------|--------|---------|
| `/en/checker` | 200 | 151KB |
| `/pt/checker` | 200 | 155KB |
| `/fr/checker` | 200 | 159KB |
| `/de/checker` | 200 | 157KB |
| `/tr/checker` | 200 | 155KB |
| `/es/checker` | 200 | 155KB |
| `/it/checker` | 404 | — |
| `/ru/checker` | 404 | — |
| Mais idiomas | 404 | — |

### Checker HTTP Methods
- **GET**: 200 (renderiza página)
- **POST**: 405 (não aceita POST)
- **PUT/DELETE/PATCH**: 405
- **OPTIONS**: 204

### Checker Parameters (todos retornam 200 — client-side processing)
- `?url=...` — URL de playlist
- `?playlist=...` — Playlist URL
- `?m3u=...` — M3U URL
- `?xtream=...` — Xtream URL
- `?mac=...` — MAC address
- `?username=...&password=...` — Credenciais
- `?server=...&port=...` — Server:port
- `?type=m3u|xtream|mac` — Tipo

### Next.js Config (do RSC payload)
```json
{
  "preconnect": ["https://image.tmdb.org", "https://gw.iptvguard.app"],
  "dns-prefetch": ["https://image.tmdb.org", "https://gw.iptvguard.app"],
  "og:image": "https://iptvguard.app/opengraph-image?1498be3e6da0a6ae",
  "manifest": "/site.webmanifest",
  "robots": "noindex"
}
```

### Assets estáticos encontrados
- `/mock/*` — dezenas de imagens mock (backdrops, logos, posters, atores)
- `/screenshots/*` — screenshots do app (dashboard, analytics, explorer, etc.)
- `/logo-mini-light.png`, `/logo_text_dark.png`
- `/site.webmanifest`

### Chunks JS identificados
- 19 chunks JS no total (~12KB-224KB cada)
- Chunks específicos do checker: `2319d73825fc0b9d.js`, `670a9850660317f6.js`
- Nenhum Next.js `_buildManifest.js` acessível (404)

### \/ Candidatos a Vulnerabilidade
1. **SSRF no checker**: Parâmetros `url`, `playlist`, `m3u`, `xtream` são processados client-side, mas possivelmente enviados para a API do gw. Se houver server-side processing → SSRF
2. **XSS no checker**: Se os resultados do checker refletem parâmetros sem sanitização
3. **Open redirect**: Testar se URLs maliciosas são validadas
4. **Next.js RSC leak**: RSC payload (`__next_f`) contém dados de configuração

---

## 4. Supabase — tcdvagdagetvrvolzcry.supabase.co

| Endpoint | Status | Observação |
|----------|--------|------------|
| `/rest/v1/` | 401 | Requer auth |
| `/rest/v1/health` | 401 | Requer auth |
| `/auth/v1/health` | 401 | Requer auth |
| `/auth/v1/user` | 401 | Requer auth |
| `/storage/v1/object/public/` | 400 | **Bucket não encontrado** (`NoSuchBucket`) |
| `/realtime/v1/` | 401 | Requer auth |

---

## 5. Summary de Artefatos

| Categoria | Quantidade |
|-----------|------------|
| Hosts enumerados | 5 (gw, hq, iptv, api, www) |
| Endpoints API descobertos | ~40+ |
| Rotas admin descobertas (JS) | ~60+ |
| JS files baixados (hq) | 1 (1.5MB) + 4 auxiliares |
| JS files baixados (iptv) | 19 chunks + 19 checker-specific (3.2MB total) |
| Supabase URL | 1 |
| Integrações terceiras (TMDB, PostHog, Sentry) | 4 |
| Rotas checker | 6 idiomas (6/12 testados) |

---

## 6. Próximos Passos (Fase 6 — WebApp)

### Prioridade 1 — Auth Bypass/Ataque (gw.iptvguard.app)
1. **Força bruta de JWT**: Testar tokens Supabase válidos contra `/api/auth/me` e `/api/playlists`
2. **Supabase signup**: Tentar `POST /auth/v1/signup` no Supabase para criar conta e obter JWT
3. **Session hijacking**: Se conseguir JWT, testar acesso a `/api/admin/users`, `/api/admin/heroes`
4. **Testar tokens de sessão existentes**: Provar diferentes patterns de JWT

### Prioridade 2 — Supabase Exploitation
1. **Obter anon key** via engenharia reversa mais profunda do JS ou via GitHub do dev
2. **Com anon key**: Acessar `rest/v1/` com `apikey` header
3. **Listar buckets**: `storage/v1/bucket`
4. **Tentar RLS bypass**: Injeção SQL via filtros do Supabase

### Prioridade 3 — IDOR Testing (hq.iptvguard.app)
1. Provar `/admin/heroes/1`, `/admin/heroes/2`, etc. com JWT válido
2. Provar `/admin/users/1`
3. Provar `/admin/recommendations/lists/1`
4. Provar `/admin/tv-scheduler/templates/1`

### Prioridade 4 — SSRF via Checker
1. Se o checker POST para `gw.iptvguard.app/api/playlists`, interceptar com proxy
2. Testar URLs internas: `http://169.254.169.254/`, `http://localhost/`, `http://127.0.0.1/`
3. Testar protocolos: `file:///`, `gopher://`, `dict://`

### Prioridade 5 — Discord Recon
1. Entrar no Discord do beta (já identificado)
2. Buscar convites, tokens, URLs internas
3. Engenharia social via Discord

---

## Timeline

| Time | Evento |
|------|--------|
| 20:35 | Início — verificação de conectividade |
| 20:36 | FFUF scans iniciados (gw, hq, iptv) |
| 20:37 | Home pages baixadas, JS URLs extraídos |
| 20:38 | JS do hq baixado (1.5MB) |
| 20:39 | GW API probe — 50+ endpoints testados |
| 20:40 | JS analysis hq — 60+ rotas admin descobertas |
| 20:41 | Supabase URL encontrada no JS |
| 20:42 | Auth bypass tests — /api/plans é público |
| 20:43 | Deep JS analysis — Supabase config, Zustand stores |
| 20:44 | HQ auth endpoint test (GET=200 SPA, POST=405) |
| 20:45 | HQ admin routes probe (todas 200 SPA shell) |
| 20:46 | Checker routes probe (6 idiomas OK) |
| 20:47 | Checker parameters test (todos 200) |
| 20:48 | GW extended API discovery — /api/plans/test_product, /api/admin/users |
| 20:49 | Supabase direct probe (401 geral) |
| 20:50 | Checker JS download (19 arquivos) |
| 20:51 | Checker JS analysis — PostHog, Sentry, regex patterns |
| 20:52 | /api/public/stats descoberto (público!) |
| 20:53 | Admin endpoints GW confirmados (401) |
| 20:54 | Compilação do relatório |