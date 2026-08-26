# ENUM.md — focusconcursos.com.br (Site Principal)

**Atualizado:** 2026-08-26
**Tecnologias:** Next.js (App Router + Pages Router), CloudFront (WAF), ALB, static.sistemaead.com.br (CDN)
**Middleware:** x-middleware-rewrite ativo — reescrita para /focusconcursos/{path}

---

## 1. Content Discovery (via ffuf + manual)

### Paths confirmados (200 HTTP)

**Páginas públicas:**
| Path | Título/Descrição |
|------|------------------|
| `/` | Homepage (Focus Concursos) |
| `/produtos` | Página de produtos |
| `/produto/{slug}` | Páginas de produto individuais (4888 URLs no sitemap) |
| `/politica-de-cookies` | Política de cookies |
| `/politica-de-privacidade` | Política de privacidade |
| `/quem-somos` | Quem somos (institucional) |
| `/termos-de-uso` | Termos de uso |
| `/faqs` | Perguntas frequentes |
| `/professores` | Lista de professores |
| `/login` | Página de login |
| `/admin` | Redirect para /login?session_expired=true |

**Área do Aluno:**
| Path | Descrição |
|------|-----------|
| `/aluno` | Dashboard do aluno (protegido) |

**Sitemap/Robots:**
| Path | Status |
|------|--------|
| `/sitemap.xml` | OK — 4888+ URLs |
| `/robots.txt` | OK — Disallow: /admin |
| `/security.txt` | Não encontrado |
| `/.well-known/security.txt` | Não encontrado |
| `/manifest.webmanifest` | OK |

**Asset Links (Android):**
| Path | Conteúdo |
|------|----------|
| `/.well-known/assetlinks.json` | Package: `br.com.grupofocus.focusconcursos` |
| `/.well-known/apple-app-site-association` | Rewrite para API |

### CloudFront Bloqueios
O WAF do CloudFront bloqueia paths comuns de admin/content:
- `/wp-admin` → 307 (redirect, não bloqueado)
- `/admin.php` → 404
- `/.env` → 403 (bloqueado)
- A maioria dos paths genéricos (common.txt) retornam 404/403

---

## 2. Next.js Architecture (via RSC + _buildManifest)

### Build ID: `7a61a8b0`
### CDN: `https://static.sistemaead.com.br/_next/static/`

### App Router Route Groups (RSC vaza estrutura completa):

```
[domain]/
├── (ecommerce)/        → Homepage, produtos (/)
├── (cart)/             → Carrinho (/carrinho)
├── (public)/           → Páginas CMS: /quem-somos, /politica-de-cookies, etc.
└── (dashboard)/
    └── (student)/
        └── aluno/      → Área do Aluno (/aluno)
```

### Pages Router (buildManifest antigo):
| Page | Path |
|------|------|
| `/_app` | App wrapper |
| `/_error` | Error page |

### Rewrites Internos (vazados no _buildManifest):
| Origem | Destino |
|--------|---------|
| `/.well-known/assetlinks.json` | `/api/well-known/assetlinks` |
| `/.well-known/apple-app-site-association` | `/api/well-known/apple-app-site-association` |
| `/favicon.ico` | `/api/favicon` |

### Componentes identificados (via RSC):
- `SearchAlgolia` — busca via Algolia
- `LatestNewsClient` — seção de notícias (fetch de noticias.focusconcursos.com.br)
- `SnippetHtmls` — snippets HTML customizados
- `Providers` — providers globais React

### Hooks customizados detectados:
- `useUser` — hook de autenticação
- `useRouterBFCache` — cache de roteamento

---

## 3. JS Analysis (Bundles em static.sistemaead.com.br)

### Bundles Baixados e Analisados:
- `app/layout-e48e777dbde820a7.js` (5.4KB)
- `app/[domain]/(ecommerce)/page-1572b962c7ee77bd.js` (50KB)
- `app/[domain]/(ecommerce)/layout-8c1c38fb24db7169.js` (43KB)
- `app/[domain]/(cart)/layout-71119ec054dbf6bf.js` (7.6KB)
- `app/[domain]/(public)/layout-2602dce3d2879b3c.js` (0.4KB)
- +20 chunks de funcionalidades

### Secrets/Keys encontradas:
| Tipo | Valor | Risco |
|------|-------|-------|
| **reCAPTCHA v2 Site Key** | `6LcNL34rAAAAAHnpHVQJ0sJ84iZFCyyvYCRbZZcK` | Baixo (chave pública) |
| **Google Tag Manager** | `GTM-WS8RMF` | Baixo (ID público) |

### NÃO encontrado (busca minuciosa):
- ❌ Stripe keys (`sk_live_`, `pk_live_`)
- ❌ AWS Access Keys (`AKIA...`)
- ❌ JWT tokens hardcoded
- ❌ Firebase API keys
- ❌ SendGrid/Mailgun keys
- ❌ Hardcoded API tokens/secretos

### localStorage Usage:
- `@focusconcursos:appToken` — JWT de autenticação
- `@focusconcursos:slug` — slug da instituição
- `sidebarMode` — preferência de layout

### Integrações detectadas:
| Serviço | Detalhe |
|---------|---------|
| Algolia | SearchAlgolia component — busca interna |
| Google reCAPTCHA | v2 (enterprise.js) |
| Google Tag Manager | GTM-WS8RMF |
| Google Analytics | UA (detectado) |
| WhatsApp | wa.me link (55 + número) |
| YouTube | Embed API + lite-youtube-embed |
| Google Maps | Embed API |
| Facebook/Instagram/TikTok/LinkedIn | Social links |

---

## 4. JWT Analysis (CRÍTICO)

### Cookie: `@focusconcursos:appToken`

**Header decodificado:**
```json
{"alg":"HS256","typ":"JWT"}
```

**Payload decodificado:**
```json
{"institution":4,"iat":1516239022}
```

### Análise:
| Aspecto | Valor | Severidade |
|---------|-------|------------|
| Algoritmo | HS256 (HMAC-SHA256) | - |
| Payload | `institution: 4` (Focus Concursos) | - |
| iat | `1516239022` (genérico, placeholder) | Info |
| **HttpOnly** | **❌ AUSENTE** | **CRÍTICO** |
| **Secure** | **❌ AUSENTE** | **Alto** |
| **CORS** | **`Access-Control-Allow-Origin: *`** | **CRÍTICO** |
| **Expiração** | **1 ano (!)** | **Alto** |
| Cookie Path | `/` (todo o site) | Médio |

### Impacto:
1. **Roubo via XSS**: Qualquer XSS no domínio foco pode roubar o JWT (sem HttpOnly)
2. **Roubo via CORS**: CORS wildcard permite que site malicioso faça fetch autenticado para a API
3. **Token eterno**: 1 ano de validade — uma vez roubado, acesso prolongado
4. **Cookie compartilhado**: Path=/ significa que todos os subdomínios recebem o cookie

---

## 5. API Discovery

### Endpoints Reais Encontrados:
| Endpoint | Método | Descoberta |
|----------|--------|------------|
| `/api/track-resolution` | (via JS) | JS bundle analysis |
| `/api/well-known/assetlinks` | GET | _buildManifest rewrite |
| `/api/well-known/apple-app-site-association` | GET | _buildManifest rewrite |
| `/api/favicon` | GET | _buildManifest rewrite |

### Falsos Positivos (catch-all do Next.js):
Todos os paths `/api/*` retornam 200 pois o Next.js App Router trata como rotas dinâmicas (domain/slug public layout).

### Swagger/OpenAPI:
- ❌ `/openapi.json` — Não encontrado
- ❌ `/swagger` — Não encontrado
- ❌ `/api-docs` — Não encontrado
- ❌ `/graphql` — Rota Next.js (HTML, não GraphQL real)

---

## 6. Security Headers & CORS

### CORS (CRÍTICO):
```
access-control-allow-origin: *
access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
access-control-allow-headers: Content-Type, Authorization, Token, g-repatch
```

### Headers de Segurança (AUSENTES):
- ❌ `Content-Security-Policy`
- ❌ `X-Content-Type-Options`
- ❌ `X-Frame-Options`
- ❌ `Strict-Transport-Security`
- ❌ `Referrer-Policy`

---

## 7. S3 Buckets & CDN

### Buckets detectados (via HTML/RSC):
| Bucket | Conteúdo |
|--------|----------|
| `arquivos.grupofocus.com.br` | Images (institution), photos, banners, products |
| `s3.blog.focusconcursos.com.br` | News images, audios |
| `s3.grupofocus.com.br` | Banners, products |
| `fc-static.s3.amazonaws.com` | (conhecido anteriormente) |

### CDN:
| Domínio | Função |
|---------|--------|
| `static.sistemaead.com.br` | Next.js static assets (JS/CSS) — **SEM WAF** |
| `s3.us-east-1.amazonaws.com` | Mídia (imagens, áudios) |

---

## 8. CMS Detection

Não identificado CMS tradicional. O site é Next.js headless com conteúdo gerenciado via API própria (RSC mostra dados serializados diretamente no HTML).

---

## 9. Candidates a Vulnerabilidade

| # | Tipo | Alvo | Payoff |
|---|------|------|--------|
| 1 | **JWT sem HttpOnly** | Roubo de sessão via XSS | **Crítico** |
| 2 | **CORS wildcard** | Acesso cross-origin a API | **Crítico** |
| 3 | **JWT sem Secure flag** | Potencial vazamento em HTTP | **Alto** |
| 4 | **JWT 1 ano expiração** | Janela longa de ataque | **Alto** |
| 5 | **Missing security headers** | Clickjacking, MIME sniffing | **Alto** |
| 6 | **Next.js middleware rewrite** | CVE-2025-29927 (bypass de middleware) | **Alto** |
| 7 | **static.sistemaead.com.br sem WAF** | Acesso direto a JS bundles | **Médio** |
| 8 | **Cookie path=/ (todo domínio)** | Acesso entre subdomínios | **Médio** |
| 9 | **CORS accepta Authorization header** | Bypass de autenticação via origem arbitrária | **Alto** |

---

## 10. Arquivos Gerados

| Arquivo | Conteúdo |
|---------|----------|
| `content_discovery_common.json` | ffuf results (0 hits — WAF bloqueia) |
| `script_sources.txt` | Todos os src de scripts da homepage |
| `sitemap_urls.txt` | 4888 URLs do sitemap |
| `nextjs_build.txt` | Build info + rotas Next.js |
| `js_analysis.txt` | Análise de JS bundles |
| `jwt_analysis.txt` | Análise do JWT |
| `api_discovery.txt` | API endpoints |
| `cors_test.txt` | Teste CORS |
| `robots.txt` | robots.txt |
| `ENUM.md` | Este arquivo (consolidação) |