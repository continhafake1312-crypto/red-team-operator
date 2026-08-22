# Enumeração - focusconcursos.com.br

## Sumário da Enumeração

- **Data**: 2026-08-22
- **Ferramentas**: ffuf, curl, python3
- **Wordlists**: raft-large-directories, raft-large-files, common.txt
- **Sem WAF** nos 5 hosts prioritários (confirmado na fase de recon)

---

## 1. integration.focusconcursos.com.br (🔴 PRIORIDADE MÁXIMA)

### Stack: Laravel/PHP API — Nginx
- **Resposta padrão**: `{"status":"ok"}` (HTTP 200, Content-Type: application/json)
- **Nenhum endpoint adicional encontrado** além da raiz
- **Laravel debug NÃO exposto**: _debugbar, _ignition, clockwork, routes, .env, artisan — todos 404
- **Nenhuma rota API** acessível nos testes (/api, /api/v1, /api/v2, /docs, /swagger, /graphql)
- **/.git** não exposto

### Endpoints descobertos
| Endpoint | Status | Tamanho | Observação |
|----------|--------|---------|------------|
| `/` | 200 | 15 bytes | `{"status":"ok"}` |
| `/robots.txt` | 200 | 24 bytes | Padrão `Disallow: /` |
| `/index.php` | 200 | 15 bytes | `{"status":"ok"}` |
| `/.htaccess` | 200 | 603 bytes | Config Apache |
| `/favicon.ico` | 200 | 0 bytes | Vazio |
| `/web.config` | 200 | 1183 bytes | Config IIS |

### Conclusão
- **Ataque**: NÃO prioritário. Superfície extremamente limitada. Apenas endpoint raiz com `{"status":"ok"}`.
- Sem debug exposto, sem rotas adicionais.
- **Recomendação**: Tentar brute-force de parâmetros POST ou headers específicos para encontrar API endpoints internos. Testar métodos HTTP alternativos (PUT, PATCH, DELETE) e variações de Content-Type.

---

## 2. admin.focusconcursos.com.br (🔴 PRIORIDADE MÁXIMA)

### Stack: Laravel/PHP Admin — Nginx
- **MaterializeCSS**, CSRF Token presente, layout de login
- `/mix-manifest.json` confirma assets compilados com Laravel Mix

### Endpoints descobertos
| Endpoint | Status | Tamanho | Observação |
|----------|--------|---------|------------|
| `/` | 200 | ~5.6KB | Página de login do admin |
| `/login` | 200 | 5630 bytes | Formulário de login (POST /login) |
| `/password/reset` | 200 | ~5.6KB | Página de recuperação de senha |
| `/logout` | 500 | 1558 bytes | **INTERNAL SERVER ERROR** — Laravel error page (CSRF? Método GET não permitido?) |
| `/mix-manifest.json` | 200 | JSON | Assets: js/main.js, js/vendor.js, js/manifest.js, CKEditor, css |
| `/images/` | 301 | 178 bytes | Directory listing? (redirect) |
| `/js/` | 301 | 178 bytes | Directory listing? (redirect) |
| `/css/` | 301 | 178 bytes | Directory listing? (redirect) |
| `/robots.txt` | 200 | 26 bytes | `Disallow: /` |
| `/.htaccess` | 200 | 584 bytes | Config Apache |
| `/.gitignore` | 200 | 63 bytes | Arquivo .gitignore |
| `/favicon.ico` | 200 | 0 bytes | Vazio |

### CSRF Token
- Token rotativo presente no HTML: `OCy2P27ltcqH6UZaJzsqwHt3Ar54udrAzkZiuka7`
- Presente em meta tag e input hidden

### Assets (do mix-manifest.json)
- `/js/main.js?id=57d6a7994e1cbc535ad5`
- `/js/manifest.js?id=3c768977c2574a34506e`
- `/js/vendor.js?id=4459e2e88f2c7938a3b9`
- `/css/app.css?id=d88f19b9278bd8269203`
- `/CKEditor/ckeditor.js?id=1535d78d95f6b0493b4e`
- `/CKEditor/config.js?id=04f57bac9d4eca8c606f`
- `/CKEditor/styles.js?id=4ac0fce18925efb2b751`
- `/CKEditor/contents.css?id=51fea4d61f8d18d9bd8d`

### Candidates a Vulnerabilidade
1. **/logout → 500**: Provar GET vs POST. Se GET retorna erro, pode ser CSRF no logout ou método não implementado corretamente. Testar com POST.
2. **Password reset page**: `/password/reset` acessível sem autenticação. Testar email enumeration, rate limiting.
3. **login**: Testar SQL injection, bruteforce, default credentials.
4. **Laravel endpoints não encontrados**: /_debugbar, /_ignition, /clockwork, /telescope, /horizon, /nova — todos 404. Mas verificar novamente com diferentes paths.
5. **CKEditor**: Config exposta em `/CKEditor/config.js`. Verificar versão e CVEs.

### Recomendação para Ataque
- **ALTA prioridade**: Login bruteforce, password reset abuse
- **Testar POST /logout** para confirmar 500 é CSRF-related
- **Analisar JS** (main.js, vendor.js) para endpoints internos
- **Verificar CKEditor** vulnerabilidades

---

## 3. lms.focusconcursos.com.br (🔴 PRIORIDADE MÁXIMA)

### Stack: Laravel/PHP LMS — Nginx
- **MaterializeCSS**, CSRF Token presente
- Formulário de login **comentado** no HTML — login redireciona para `focusconcursos.com.br/lms-auto-login`

### Endpoints descobertos
| Endpoint | Status | Tamanho | Observação |
|----------|--------|---------|------------|
| `/` | 200 | ~6.4KB | Página LMS (login desabilitado) |
| `/login` | 200 | 6399 bytes | Formulário comentado, redirect para /lms-auto-login |
| `/logout` | 500 | 1558 bytes | **INTERNAL SERVER ERROR** — Laravel error page |
| `/images/` | 301 | 178 bytes | Directory listing |
| `/js/` | 301 | 178 bytes | Directory listing |
| `/css/` | 301 | 178 bytes | Directory listing |

### CSRF Token
- `6jaB5Ig1niAQMVyx705beKxy9i48rDKNLoTUWOWu`

### Observações
- **Login desabilitado**: Comentado no HTML, redireciona para o site principal
- **Botão "Entrar com a conta Focus Concursos"**: aponta para `https://focusconcursos.com.br/lms-auto-login`
- Social login com Google (comentado)

### Candidates a Vulnerabilidade
1. **/lms-auto-login endpoint**: Verificar se existe em focusconcursos.com.br e como funciona
2. **/logout 500**: Mesmo comportamento do admin — verificar CSRF
3. **API endpoints**: Testar /api, /api/v1, /api/modulos, /api/cursos, /api/alunos

### Recomendação
- MÉDIA prioridade — login funcionalidade desabilitada reduz superfície
- Investigar /lms-auto-login no foco principal

---

## 4. payment.focusconcursos.com.br (🟡 PRIORIDADE ALTA)

### Stack: Symfony/Laravel API — Nginx
- **CRÍTICO**: Erro 500 em `/docs` EXPÕE Symfony/Laravel Debug

### Endpoints descobertos
| Endpoint | Status | Tamanho | Observação |
|----------|--------|---------|------------|
| `/` | 200 | 15 bytes | `{"status":"ok"}` |
| `/docs` | 500 | 120 bytes | **SYMFONY FATAL ERROR EXPOSED** |
| `/health` | 404 | JSON | `NotFoundHttpException` |
| `/status` | 404 | JSON | `NotFoundHttpException` |

### Erro Symfony em /docs
```
HTTP/2 500
content-type: application/json
server: nginx
cache-control: no-cache, private

{"exception":"Symfony\\Component\\Debug\\Exception\\FatalErrorException","message":"Internal Server Error","track":null}
```

### Framework Detection
- `Symfony\Component\Debug\Exception\FatalErrorException` — **Symfony Debug Component**
- `Symfony\Component\HttpKernel\Exception\NotFoundHttpException` — **Symfony HttpKernel**
- Respostas sempre `Content-Type: application/json`
- **Cache-Control: no-cache, private** — desativa cache

### Candidates a Vulnerabilidade
1. **CRÍTICO**: Erro Symfony exposto em `/docs`. Tentar forçar outros erros para obter stack traces:
   - Enviar payloads malformados
   - Testar outros endpoints com dados inválidos
   - Tentar _debugbar, _profiler, _errors
2. **Testar Laravel/Symfony debug endpoints**:
   - `/_profiler/`, `/_wdt/`, `/_errors/`
   - `/app_dev.php`, `/app_dev.php/_profiler`
   - `/config.php`, `/install.php`
3. **API endpoints**: Testar métodos HTTP alternativos em `/docs` (POST, PUT, DELETE, PATCH)
4. **IDOR candidates**: Testar `/orders/{id}`, `/payments/{id}` se encontrados

### Recomendação para Ataque
- **ALTÍSSIMA prioridade**: Symfony Debug exposto = RCE potencial via _profiler ou erros
- Forçar outros endpoints a gerar erros para obter stack trace completo
- Tentar `/_profiler/open?file=...` ou `/_profiler/phpinfo`

---

## 5. www3.focusconcursos.com.br (🟡 PRIORIDADE ALTA)

### Stack: Next.js 14+ (App Router) + TailwindCSS — Nginx
- **SPA com SSR** — Next.js App Router com RSC (React Server Components)
- Build ID: `1787326072020`

### Endpoints descobertos
| Endpoint | Status | Tamanho | Observação |
|----------|--------|---------|------------|
| `/` | 200 | 488296 bytes | Página principal SPA |
| `/api` | 200 | 488299 bytes | Redirecionamento middleware → `/redirect` |
| `/api/auth/login` | 200 | 489369 bytes | Rota API auth |
| `/api/auth/register` | 200 | 489372 bytes | Rota API auth |
| `/api/auth/forgot` | 200 | 489370 bytes | Rota API auth |
| `/api/me` | 200 | 491278 bytes | Rota API usuário |
| `/api/cursos` | 200 | 491034 bytes | Rota API cursos |
| `/api/concursos` | 200 | 491306 bytes | Rota API concursos |
| `/graphql` | 200 | 488303 bytes | Rota GraphQL (provavelmente redireciona) |
| `/api/graphql` | 200 | 491298 bytes | Rota GraphQL API |
| `/robots.txt` | 200 | 88 bytes | `Disallow: /admin` |
| `/manifest.webmanifest` | 200 | 180 bytes | PWA manifest |
| `/sw.js` | 200 | 250 bytes | Service worker |
| `/sitemap.xml` | 200 | 488307 bytes | SPA (rota inexistente) |
| `/_next/static/` | 308 | redirect | Static files |
| `/_next/static/chunks/` | 308 | redirect | JS chunks |
| `/_next/static/css/` | 308 | redirect | CSS files |
| `/_next/data/` | 308 | redirect | SSR data |
| `/wp-admin` | 307 | 35 bytes | WordPress redirect (herdado?) |
| `/App_Data` | 200 | 0 bytes | Vazio |

### Rotas Extraídas do RSC Payload
Baseado na análise do RSC (React Server Components) payload:
- `/redirect` — Página de redirect (componente principal)
- URLs amigáveis para SEO (rota `sitemap.xml` existe como página)

### Assets (JS Chunks)
| Chunk | Tamanho | Observação |
|-------|---------|------------|
| `_next/static/chunks/8720-0ef8b599928893f4.js` | 34KB | Core chunk |
| `_next/static/chunks/1356-64e9d9bba2535b8c.js` | 14KB | Core chunk |
| `_next/static/chunks/4219-64e9d9bba2535b8c.js` | 9 bytes | Quase vazio |
| `_next/static/chunks/app/layout-62bdb042e129c9af.js` | 5KB | Layout component |
| `_next/static/chunks/app/not-found-2bd1a60f329a1ad5.js` | 3KB | 404 page |
| `_next/static/chunks/app/global-error-316cdd2e25088a2c.js` | 28KB | Error boundary |
| `_next/static/css/5b49d5a0a5550b15.css` | TailwindCSS | Stylesheet |

### Middleware
- Headers: `x-middleware-rewrite: /redirect`
- Vary: `rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch`
- Powerd By: Next.js
- CORS headers: `access-control-allow-origin: *`

### Service Worker
- Cache name: `newlms-v1`
- Cache: `["/", "/offline"]`

### Candidates a Vulnerabilidade
1. **API routes**: /api/auth/* e /api/cursos, /api/concursos expõem rotas do backend
2. **GraphQL**: /api/graphql — testar query de schema introspection
3. **Next.js middleware**: Verificar se redirecionamento pode ser bypassado
4. **SSR data**: `/_next/data/[buildID]/...` pode expor dados server-side
5. **Source maps**: Verificar `/_next/static/chunks/*.js.map`
6. **robots.txt**: `Disallow: /admin` sugere rota /admin existe
7. **/api/me**: Potencial IDOR se retornar dados de usuário

### Recomendação para Ataque
- **ALTÍSSIMA prioridade**: Analisar JS chunks em busca de endpoints, secrets, tokens
- Testar GraphQL introspection: `{"query":"{__schema{types{name}}}"}`
- Explorar `/api/me` e `/api/auth/*`
- Verificar `/admin` e `/wp-admin`
- Baixar source maps para obter código fonte

---

## Resumo de Vulnerabilidades Candidates

### 🚨 CRÍTICO — Ação Imediata
1. **payment.focusconcursos.com.br/docs → Symfony FatalErrorException** (500)
   - Framework detection: Symfony Debug + HttpKernel
   - Tentar `_profiler`, `_wdt`, `_errors`, `app_dev.php`
   - RCE potential via Symfony Profiler

### 🔴 ALTA — Prioridade para Ataque
2. **admin.focusconcursos.com.br** — Login admin exposto, password reset, /logout with 500
3. **admin.focusconcursos.com.br** — CKEditor config exposto em /CKEditor/config.js
4. **www3.focusconcursos.com.br** — API routes expostas (/api/auth/*, /api/me, /api/cursos, /api/graphql)
5. **www3.focusconcursos.com.br** — GraphQL endpoint /api/graphql
6. **www3.focusconcursos.com.br** — Disallow: /admin no robots.txt

### 🟡 MÉDIA — Verificar
7. **admin/lms focusconcursos.com.br** — /logout returning 500 (CSRF or method not allowed)
8. **lms.focusconcursos.com.br** — /lms-auto-login redirect
9. **payment.focusconcursos.com.br** — Testar todos os métodos HTTP em todos endpoints
10. **integration.focusconcursos.com.br** — Tentar parameter brute-force

### ⚪ BAIXA — Informacional
11. **Todos os hosts** — robots.txt com `Disallow: /`
12. **www3.focusconcursos.com.br** — Service worker com cache "newlms-v1"
13. **admin.focusconcursos.com.br** — CSRF Token rotativo

---

## Priorização Refinada para Ataque WebApp

```
1. payment.focusconcursos.com.br  🚨 — Symfony Debug exposto (RCE vetor)
2. www3.focusconcursos.com.br      🔴 — API routes + GraphQL
3. admin.focusconcursos.com.br     🔴 — Login admin + CKEditor
4. lms.focusconcursos.com.br      🟡 — LMS auto-login investigação
5. integration.focusconcursos.com.br 🟡 — Minimal surface, brute params
```

---

## Notas Técnicas

- **Sem WAF** confirmado em todos 5 hosts (WAFW00F)
- **Nginx** como servidor web em todos hosts
- **Laravel** no admin, lms; **Symfony/Laravel** no payment; **Next.js** no www3
- **TLSv1.2** com ECDHE-RSA-AES128-GCM-SHA256
- **Certificado**: CN=*.focusconcursos.com.br (válido)
- **IPs**: 54.152.191.245, 34.232.87.139, 34.199.149.171, 34.195.7.174, 98.86.135.135, 32.194.246.132, 18.233.104.160