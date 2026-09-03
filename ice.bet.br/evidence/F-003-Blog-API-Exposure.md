# F-003: Blog CMS API Exposure — Informações Sensíveis Expostas

**Alvo:** `https://blog.ice.bet.br/api/*`
**Severidade:** 🟠 Alta
**Timestamp:** 2026-09-03T07:19:00Z

## Descoberta

O blog ice.bet.br roda **Next.js + Payload CMS**. Vários endpoints REST API estão **publicamente acessíveis** sem autenticação, expondo dados internos do CMS.

## Endpoints Confirmados como Públicos

### 1. `/api/access` — ✅ EXPÕE ESTRUTURA DE PERMISSÕES
```json
{
  "collections": {
    "users": { "fields": { "sessions": { "read": true } } },
    "authors": { "read": true },
    "categories": { "read": true },
    "media": { "read": true },
    "posts": { "read": { "permission": true, "where": {"_status": {"equals": "published"}} } },
    "redirects": { "read": true },
    "search": { "read": true }
  }
}
```
**Revela:** estrutura completa de permissões, campos legíveis, e que a collection `users` expõe `sessions` (id, createdAt, expiresAt) como leitura pública.

### 2. `/api/posts` — ✅ 11 posts publicados
- Retorna conteúdo completo de todos os posts, incluindo:
  - Conteúdo HTML/rich text
  - Metadados (title, description, og:image)
  - Autores com IDs internos
  - Categorias com IDs
  - FAQ items
  - Match data (homeTeam, awayTeam, odds)
  - Datas de criação/atualização

### 3. `/api/media` — ✅ 13 mídias (2 páginas)
- URLs de imagens no CDN (`cdn.blog.ice.bet.br`)
- BlurDataURLs (base64)
- Tamanhos e dimensões
- Metadados completos

### 4. `/api/categories` — ✅ Categorias expostas
- IDs internos, nomes, slugs

### 5. `/api/authors` — ✅ Autores expostos
- Nomes, bios, roles, links sociais, credenciais

### 6. `/api/redirects` — ✅ Redirects expostos
- Regras de redirect (from → to)
- Tipos de redirect

### 7. `/api/search` — ✅ Search index exposto
- 10+ documentos indexados
- Prioridades de busca
- Relações com posts

## Endpoints Protegidos (403)
- `/api/users` — ✅ Bloqueado
- `/api/users/sessions` — ✅ Bloqueado
- `/api/graphql` — ✅ Bloqueado

## Reprodução

```bash
# Acessar estrutura de permissões
$ curl -s https://blog.ice.bet.br/api/access | jq '.collections | keys'

# Listar todos os posts (via webfetch)
$ webfetch https://blog.ice.bet.br/api/posts
# Retorna conteúdo completo de 11 posts

# Listar mídias
$ webfetch https://blog.ice.bet.br/api/media
# Retorna 13 mídias com URLs de CDN
```

## Impacto

🟠 **ALTO**
- A exposição de `/api/access` revela a estrutura de segurança do CMS
- Acesso a posts permite scraping completo de conteúdo
- URLs de CDN expostas podem ser usadas para ataques de hotlinking
- Metadados expostos (IDs internos, timestamps) auxiliam ataques de IDOR
- Autores expostos permitem OSINT sobre a equipe editorial

## Próximo passo

- Verificar se há IDOR nos endpoints de posts individuais (`/api/posts/1`, `/api/posts/2`)
- Buscar por posts com `_status: draft` que possam vazar conteúdo não publicado
- Verificar se sessions de usuários são acessíveis via outros meios
- Explorar relacionamentos entre coleções para obter mais dados