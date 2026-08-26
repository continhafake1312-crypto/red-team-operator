# ENUM.md — Enumeração Profunda: www3.focusconcursos.com.br

**Data:** 2026-08-26
**Alvo:** www3.focusconcursos.com.br (Next.js App Router)
**CDN:** static.sistemaead.com.br (Amazon S3 + CloudFront, MIA50-P7)
**Dominio real:** faculdadefocus.com.br (multi-tenant)

---

## Sumário Executivo

www3.focusconcursos.com.br é um **aplicativo Next.js puramente redirector**. Ele não serve conteúdo próprio — todas as requisições são reescritas pelo middleware para a rota `/redirect`, que por sua vez faz redirect client-side para `https://faculdadefocus.com.br` (controlado pela env var `NEXT_PUBLIC_DEFAULT_SITE`). A aplicação real está em **faculdadefocus.com.br**, uma arquitetura multi-tenant com várias rotas de e-commerce e carrinho.

---

## 1. Content Discovery

### ffuf (common.txt — 4752 paths)
**Resultado:** TODOS os paths retornam HTTP 200 com ~490KB (página de redirect).
Nenhum diretório ou arquivo único foi encontrado — o middleware Next.js captura 100% das requisições.

### ffuf (raft-large-words)
Pendente — baixa probabilidade de success devido ao middleware catch-all.

---

## 2. Next.js Routes Descobertas

### App Router (RSC)
| Rota | Arquivo JS | Descrição |
|------|-----------|-----------|
| `/redirect` | `app/redirect/page-*.js` | Página de redirect → faculdadefocus.com.br |
| `/` | `app/layout-*.js` | Layout raiz (contém track-resolution) |
| `/404` | `app/not-found-*.js` | Página not found |
| `/500` | `app/global-error-*.js` | Global error boundary |

### Pages Router
| Rota | Descrição |
|------|-----------|
| `/_app` | App wrapper |
| `/_error` | Error page |

### Next.js Internals
| Rota | Descrição |
|------|-----------|
| `/_not-found` | Rota interna 404 (Next.js 14+) |
| `/_next/image` | Image optimization |
| `/_next/static/media/` | Static media assets |

### Rewrites Internos (do Build Manifest)
| Source | Destination |
|--------|-------------|
| `/.well-known/assetlinks.json` | `/api/well-known/assetlinks` |
| `/.well-known/apple-app-site-association` | `/api/well-known/apple-app-site-association` |
| `/favicon.ico` | `/api/favicon` |

---

## 3. API Endpoints

### www3.focusconcursos.com.br
| Endpoint | Método | Resposta | Descrição |
|----------|--------|----------|-----------|
| `/api/track-resolution` | POST | 204 No Content | Tracking de resolução de tela |
| `/api/track-resolution` | GET | 405 Method Not Allowed | Apenas POST |
| `/.well-known/assetlinks.json` | GET | 200 JSON | Endpoint de verificação de app links |
| `/.well-known/apple-app-site-association` | GET | 200 JSON | Endpoint de verificação de app links |

### faculdadefocus.com.br (aplicação real)
| Endpoint | Resposta | Descrição |
|----------|----------|-----------|
| `/api/track-resolution` | POST 405 | Same endpoint, método restrito |
| `/admin` | 307 → `/login?session_expired=true` | Painel admin protegido |
| `/swagger` | 200 (via middleware rewrite) | Swagger API docs (EXISTE!) |
| `/api-docs` | 200 (via middleware rewrite) | API documentation (EXISTE!) |

---

## 4. JS Analysis Findings

### Arquivo: `page-954584b17acab0db.js` (Redirect Page)
```javascript
// CÓDIGO DO REDIRECT — CRÍTICO
(0, s.redirect)(a.env.NEXT_PUBLIC_DEFAULT_SITE || "https://faculdadefocus.com.br")
```

**Descoberta:** A env var `NEXT_PUBLIC_DEFAULT_SITE` controla o destino. Valor padrão: `https://faculdadefocus.com.br`.

**Potencial vulnerabilidade:** Open redirect se for possível manipular a env var via HTTP headers ou configuração.

### Arquivo: `layout-e48e777dbde820a7.js` (Root Layout)
```javascript
fetch("/api/track-resolution", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resolution: e }),
  keepalive: true
})
```

### Nenhum segredo/credencial encontrado nos JS
- ✅ Nenhum JWT hardcoded
- ✅ Nenhuma AWS key (AKIA)
- ✅ Nenhum token Bearer

### Chunks de UI
A aplicação utiliza **shadcn/ui** + **Radix UI** com componentes:
Acordion, AlertDialog, Avatar, Badge, Button, Calendar, Card, Carousel, Checkbox, Collapsible, Combobox, Command, DataTable, Dialog, DropdownMenu, Form, Input, Label, NavigationMenu, Popover, Progress, Select, Separator, Sheet, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip

**Observação:** Presença de `DataTable` sugere que há CRUD com dados tabulares (potencial IDOR).

---

## 5. CORS / Middleware Findings

### CORS — VULNERABILIDADE CRÍTICA
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Token, g-repatch
```
**CORS wildcard** em TODOS os endpoints. Qualquer site pode fazer requisições cross-origin.

### Middleware — Rewrite Universal
Toda requisição para www3 recebe:
```
x-middleware-rewrite: /redirect
```
O middleware está configurado para capturar **TODOS** os paths e reescrever para `/redirect`.

### Middleware — faculdadefocus.com.br
```
x-middleware-rewrite: /faculdadefocus/<path>
```
O middleware do faculdadefocus usa o slug do cookie `@faculdadefocus:slug` para determinar o tenant.

### CVE-2025-29927 — Testado
**Resultado:** NÃO VULNERÁVEL. O middleware continua reescrevendo mesmo com o header `x-middleware-subrequest: true`.

---

## 6. Build Manifest Analysis

### Router Filter (16 itens estáticos, 4 dinâmicos)
O Build Manifest revela filtros de roteamento que confirmam a existência de:
- 16 páginas estáticas (provavelmente do pages router)
- 4 páginas dinâmicas (do app router, tipo `[domain]`)

### SSG Manifest
Nenhuma página SSG/ISR. Todas as páginas são SSR ou renderizadas no client.

---

## 7. faculdadefocus.com.br — Descobertas Adicionais

### JWT Token (CRÍTICO)
```
Cookie: @faculdadefocus:appToken
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
        .eyJ1aWQiOjMsImlhdCI6MTYxOTU0NjkzNH0
        .jU3_W8wfSTQPdFHnrYq9wL4LQXS2sbU7GNctg-ks4PQ
```
**Decodificado:**
- **Header:** `{"alg":"HS256","typ":"JWT"}`
- **Payload:** `{"uid":3,"iat":1619546934}`

**Interpretação:**
- `uid=3` — usuário anônimo/padrão gerado automaticamente
- `iat=1619546934` — abril 2021 (token antigo)
- Assinatura HS256 com segredo desconhecido
- Setado em TODAS as respostas, expira em 1 ano

### Arquitetura Multi-tenant
```
Route Group: [domain]
├── (ecommerce)/page     → Página de e-commerce
├── (ecommerce)/layout   → Layout de e-commerce
├── (cart)/layout        → Layout de carrinho
└── (public)/layout      → Layout público
```
O cookie `@faculdadefocus:slug` determina qual tenant é servido (`slug=faculdadefocus` por padrão).

### Headers de Segência — AUSENTES
- ❌ Content-Security-Policy
- ❌ X-Content-Type-Options
- ❌ X-Frame-Options
- ❌ Strict-Transport-Security
- ❌ Referrer-Policy

---

## 8. Recomendações de Ataque (Prioridade)

### 🔴 ALTA PRIORIDADE — faculdadefocus.com.br

#### 1. JWT Attack
- **Testar JWT none attack**: alterar alg para "none", remover assinatura
- **Testar JWT weak secret**: usar crackstation, john, hashcat com wordlists comuns
- **Testar uid enumeration**: trocar uid=3 para uid=1,2,4,5... e acessar recursos
- **Testar se é possível obter token de admin**: tentar escalar privilégio

#### 2. Swagger/API-Docs Exploitation
- Acessar `https://faculdadefocus.com.br/swagger` e `https://faculdadefocus.com.br/api-docs` com o JWT obtido
- Extrair documentação completa da API
- Identificar endpoints de criação/leitura/edição de dados

#### 3. Auth Bypass — /admin
- Tentar acessar `/admin` com o JWT de uid=3
- Testar bypass via headers: `x-middleware-subrequest`, `x-forwarded-host`, etc.
- Testar bypass via cookies manipulados: `@faculdadefocus:slug=admin`

#### 4. Multi-tenant Enumeration
- Tentar diferentes valores para `@faculdadefocus:slug` (focusconcursos, faculdade, etc.)
- Tentar Host header injection: `Host: outrodominio.com.br`
- Tentar path traversal: `/faculdadefocus/../../admin`

#### 5. CORS Exploitation
- Construir PoC de exploração cross-origin para exfiltrar dados
- Testar se cookies são enviados em requisições cross-origin (withCredentials)

#### 6. Endpoints Internos (.well-known)
- Acessar `/.well-known/assetlinks.json` e `/.well-known/apple-app-site-association`
- Extrair informações sobre o aplicativo e possíveis endpoints internos
- Testar SSRF via parâmetros nos handlers

### 🟡 MÉDIA PRIORIDADE — www3.focusconcursos.com.br

#### 7. Open Redirect
- Verificar se `NEXT_PUBLIC_DEFAULT_SITE` pode ser sobrescrito via query params ou headers
- Se confirmado, usar para phishing ou bypass de whitelist

---

## 9. Arquivos Gerados

| Arquivo | Descrição |
|---------|-----------|
| `content_discovery_common.txt` | Resultados do ffuf common.txt |
| `nextjs_discovery.txt` | Rotas Next.js descobertas |
| `api_endpoints.txt` | Endpoints de API |
| `js_analysis.txt` | Análise de JavaScript |
| `cors_test.txt` | Testes CORS |
| `middleware_test.txt` | Testes de middleware + CVE |
| `build_manifest_analysis.txt` | Análise do build manifest |
| `faculdadefocus_findings.txt` | Descobertas do faculdadefocus.com.br |
| `buildManifest.js` | Build manifest baixado |
| `manifest.webmanifest.json` | PWA manifest |
| `homepage.html` | Página inicial (redirect page) |
| `faculdade_homepage.html` | Homepage do faculdadefocus |
| `js_*.js` | JavaScript chunks baixados |
| `faculdade_*.js` | JS do faculdadefocus baixados |

---

## 10. Artefatos Brutos

```
/home/ubuntu/focusconcursos.com.br/enum/www3/
├── ENUM.md                          ← Este arquivo
├── content_discovery_common.txt     ← FFUF results
├── nextjs_discovery.txt             ← Next.js routes
├── api_endpoints.txt                ← API endpoints
├── js_analysis.txt                  ← JS analysis
├── cors_test.txt                    ← CORS findings
├── middleware_test.txt              ← Middleware findings
├── build_manifest_analysis.txt      ← Build manifest
├── faculdadefocus_findings.txt      ← Faculdade findings
├── buildManifest.js                 ← Downloaded build manifest
├── manifest.webmanifest.json        ← PWA manifest
├── homepage.html                    ← Homepage (redirect)
├── faculdade_homepage.html          ← Faculdade homepage
├── js_*.js                          ← 12 JS chunks (www3)
├── faculdade_*.js                   ← 4 JS chunks (faculdade)
├── nextjs_sitemap.txt               ← Sitemap attempt
├── nextjs_robots.txt                ← Robots content
├── nextjs_data.txt                  ← Next.js data endpoint
├── cors_headers.txt                 ← CORS headers raw
├── middleware_*.txt                 ← Middleware tests raw
├── api_*.txt                        ← API tests raw
└── js_scripts_src.txt               ← JS src list
```