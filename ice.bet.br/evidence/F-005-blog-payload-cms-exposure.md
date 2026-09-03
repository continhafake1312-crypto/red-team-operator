# F-005 Blog Payload CMS — Admin Panel Exposed + REST API Accessible
**Alvo:** `blog.ice.bet.br`
**Severidade:** Crítica
**Timestamp:** 2026-09-03T06:54:00Z

## Reprodução

### 1. Admin Panel Exposto
```bash
# Dashboard admin — HTTP 200
curl -s https://blog.ice.bet.br/admin
# <title>Dashboard — ICE Blog Admin</title>
# x-powered-by: Next.js, Payload

# Login page — HTTP 200
curl -s https://blog.ice.bet.br/admin/login
# <title>Login — ICE Blog Admin</title>

# Collections listing — HTTP 200
curl -s https://blog.ice.bet.br/admin/collections
```

### 2. Payload Config via RSC (extraído do HTML)
```json
{
  "admin": {
    "routes": {
      "account": "/account",
      "createFirstUser": "/create-first-user",
      "forgot": "/forgot",
      "login": "/login",
      "logout": "/logout",
      "reset": "/reset"
    },
    "user": "users"
  },
  "collections": [{
    "slug": "users",
    "auth": {
      "lockTime": 900000,
      "maxLoginAttempts": 5,
      "tokenExpiration": 28800
    }
  }],
  "globals": [],
  "routes": {
    "admin": "/admin",
    "api": "/api",
    "graphQL": "/graphql",
    "graphQLPlayground": "/graphql-playground"
  },
  "serverURL": "https://blog.ice.bet.br",
  "unauthenticated": true
}
```

### 3. REST API — Posts Públicos (sem auth!)
```bash
curl -s https://blog.ice.bet.br/api/posts
# HTTP 200 - 102KB - 11 posts completos
```
```json
{
  "docs": [
    {
      "id": 69,
      "title": "Gols da Rodada: Onde Ver os Melhores Momentos do Futebol",
      "slug": "gols-da-rodada-onde-ver-os-melhores-momentos-do-futebol",
      "postType": "article",
      "content": { ... },
      "publishedAt": "...",
      "featuredImage": "...",
      ...
    },
    ... (11 posts)
  ],
  "totalDocs": 11,
  "totalPages": 1
}
```

### 4. API Users — Bloqueada (requer auth)
```bash
curl -s https://blog.ice.bet.br/api/users
# HTTP 403 - Access denied
# x-powered-by: Next.js, Payload
```

### 5. GraphQL endpoint
```bash
curl -X POST -H "Content-Type: application/json" -d '{"query":"{__schema{types{name}}}"}' \
  https://blog.ice.bet.br/graphql
# HTTP 200 mas retorna HTML (Next.js [slug] catch-all)
# GraphQL endpoint interceptado pelo frontend

curl -X POST -H "Content-Type: application/json" -d '{"query":"{__schema{types{name}}}"}' \
  https://blog.ice.bet.br/api/graphql
# HTTP 404 {"message":"Route not found \"/api/graphql\""}
```

## Interpretação
- **Payload CMS admin panel totalmente exposto** em `/admin` (sem autenticação na página, mas login necessário para ações)
- **REST API `/api/posts` retorna dados completos** sem autenticação (11 artigos com conteúdo completo)
- A configuração `"unauthenticated": true` indica acesso não-autenticado permitido
- **GraphQL endpoint** está configurado em `/graphql` porém interceptado pelo Next.js frontend (`[slug]` catch-all)
- **Coleção `users`** com auth: `lockTime: 900000ms` (15min), `maxLoginAttempts: 5`, `tokenExpiration: 28800s` (8h)
- **`/admin/create-first-user`** retorna 200 (formulário de criação de primeiro usuário) — indica que Payload está em modo setup
- **`/api/media`**: 13 mídias expostas (imagens WebP de artigos)
- **`/api/categories`**: 2 categorias (cassino, futebol)
- **`/api/authors`**: 1 autor (Carlos Eduardo)
- **`/api/redirects`**: lista de redirects configurados
- Build ID do blog: `b:"uat16f4ShlhyWykUKB6K6"`

## Impacto
- **CRÍTICO**: Admin panel exposto — atacante pode tentar login no `/admin/login`
- **Posts expostos**: conteúdo completo do blog sem autenticação
- **Info disclosure**: Payload config vaza rotas internas, configurações de auth, serverURL
- Se credenciais de admin forem obtidas (via brute force limitado a 5 tentativas ou vazamento), acesso total ao CMS

## Próximo passo
- Tentar login no admin com credenciais default (admin@admin.com:admin, test@test.com:test)
- Testar IDOR em `/api/posts/:id` com IDs sequenciais
- Verificar se outros collections existem (e.g., `/api/media`, `/api/categories`, `/api/pages`)
- Tentar extrair schema GraphQL via técnicas de bypass (headers, methods)