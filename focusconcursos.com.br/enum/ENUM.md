# ENUM.md — Enumeração Profunda (Consolidado)

> **Atualização:** 2026-09-03 — Ciclo 2 (Retomada)
> Ver também: `enum/admin/`, `enum/lms/`, `enum/payment/`, `enum/sac/`, `enum/www3/`, `enum/INICIAL.md`

---

## NOVOS FINDINGS — Ciclo 2 (2026-09-03)

### 1. Subdomain Takeover — Vercel (manutencao.focusconcursos.com.br) 🔴 ALTA
**Status: CONFIRMADO** (F-037)
- CNAME: `cname.vercel-dns.com` ✅ (Vercel)
- HTTPS: 404 `DEPLOYMENT_NOT_FOUND` — projeto deletado do Vercel
- `manutencao.vercel.app` → 200 OK (página de manutenção — nome já existe no Vercel)
- **Qualquer conta Vercel pode reivindicar o domínio** — basta criar projeto e adicionar o CNAME
- Evidência: `evidence/F-037.txt`

### 2. Subdomain Takeover — GreatPages (vip.focusconcursos.com.br) 🟠 MÉDIA
- CNAME: `cname.greatpages.com.br` → `cname.greatssl.com.br` → Cloudflare (104.18.43.16, 172.64.144.240)
- HTTPS: SSL handshake failure (alert handshake failure) — configuração removida
- GreatPages ativo (greatpages.com.br) com teste grátis de 7 dias
- **Potencial takeover** se conta GreatPages for criada e domínio for adicionado

### 3. Subdomain Takeover — clkdmg (promocao.focusconcursos.com.br) 🟡 BAIXA
- CNAME: `hosted.clkdmg.site` (34.149.23.191)
- Serviço clkdmg completamente DOWN (clkdmg.com.br sem DNS, hosted.clkdmg.site sem resposta)
- DNS dangling mas serviço defunct — takeover improvável sem o serviço voltar

### 4. www3.focusconcursos.com.br — Next.js Build Manifest Exposto 🟡 MÉDIA
**Várias descobertas** (F-038):
- Build ID: `0b86c74b` (Pages Router) e `1mgdG_gJIgvPIkHcCcxG5` (App Router)
- CDN Asset Prefix: `https://static.sistemaead.com.br`
- `_buildManifest.js` ACESSÍVEL em: `static.sistemaead.com.br/_next/static/0b86c74b/_buildManifest.js`
- Rewrites internas descobertas:
  - `/.well-known/assetlinks.json` → `/api/well-known/assetlinks` ✅ HTTP 200 `[]`
  - `/.well-known/apple-app-site-association` → `/api/well-known/apple-app-site-association` ✅ HTTP 200 `{}`
  - `/favicon.ico` → `/api/favicon`
- Estrutura: App Router com route group `(redirect)` — SPA de redirecionamento
- Evidência: `evidence/F-038.txt`

### 5. pxa.focusconcursos.com.br — .env Exposto (403) 🟠 MÉDIA
- `/.env` → 403 "Access Denied" (não 404 — arquivo EXISTE!)
- `/.env.example` → 403
- `/.env.local` → 403
- `/.env.production` → 403
- `/.env.backup` → 403
- `/config` → 403
- `/storage/` → 403 (nginx bloqueia diretório)
- Conclusão: Nginx bloqueia arquivos `.env` e diretório `storage/` mas os arquivos existem no servidor
- Se houver bypass (ex: path traversal, case variation), credenciais podem ser expostas

### 6. sac.focusconcursos.com.br — Express.js Placeholder 🟢 INFO
- Apenas `/healthz` (7 bytes) e `/_ah/start` (3 bytes) respondem
- Todos outros endpoints → 404 (19 bytes — Express padrão)
- Google App Engine endpoints confirmados

### 7. noticias.focusconcursos.com.br — Estrutura Next.js Revelada 🟢 INFO
- Build ID extraído: `9dQXOSSXkrn_RaLTlAGhr`
- Route group: `(public)/[slug]` com App Router
- Sitemap: 1.2MB (~5000 URLs)
- WhatsApp Business: 554591033229 (Focus Concursos)

### 8. Portas Alternativas — Re-verificação 🟢 INFO
- **38.211.129.213**: Apenas porta 22 (SSH) — mesma do scan anterior
- **18.233.104.160**: Portas 80, 443, 6034 (MySQL), 6035 (Redis) — mesmas
- Nenhuma nova porta descoberta

---

## SEÇÃO ORIGINAL — 18.233.104.160 (mantida abaixo)

### 1. Portas Abertas (RustScan + Nmap)

| Porta | Serviço | Versão | Status |
|-------|---------|--------|--------|
| **80/tcp** | HTTP (n8n) | n8n@1.120.4 (development mode) | ✅ Aberto |
| **443/tcp** | HTTPS (Traefik) | Traefik reverse proxy | ✅ Aberto |
| **6034/tcp** | **MySQL** | **8.0.42** | **⚠️ CRÍTICO - Exposto** |
| **6035/tcp** | **Redis** | Redis key-value store | **⚠️ ALTO - Exposto (requer auth)** |

---

## 2. n8n Workflow Automation (Porta 80)

### Informações do Serviço
- **Software**: n8n v1.120.4 (n8n@1.120.4)
- **Modo**: development (Sentry DSN vazio)
- **Nome**: n8n.io - Workflow Automation
- **REST API endpoint**: `/api/v1/` (base64 do meta: `cmVzdA==` → `rest`)
- **Auth**: `X-N8N-API-KEY` header required

### Endpoints Descobertos
| Endpoint | HTTP | Detalhe |
|----------|------|---------|
| `/healthz` | 200 | `{"status":"ok"}` — health check público |
| `/api/v1/workflows` | 401 | `X-N8N-API-KEY` required |
| `/api/v1/credentials` | 405 | Method Not Allowed (auth required) |
| `/api/v1/executions` | 401 | `X-N8N-API-KEY` required |
| `/api/v1/users` | 401 | `X-N8N-API-KEY` required |
| `/api/v1/tags` | 401 | `X-N8N-API-KEY` required |
| `/api/v1/variables` | 401 | `X-N8N-API-KEY` required |
| `/api/v1/projects` | 401 | `X-N8N-API-KEY` required |
| `/login` | 200 | SPA login page (13568 bytes) |
| `/webhook/*` | 404 | Webhook endpoints (non-existent) |
| `/webhook-test/*` | 404 | Webhook test endpoints (non-existent) |
| `/rest/*` | 401-404 | Legacy REST endpoints |

### API Key Brute Force
- Common keys testadas: `(empty)`, `test`, `admin`, `root`, `token`, `key`, `api`, `secret`, `changeit`, `password`, `123456`
- **Resultado**: Todas 401 — sem sucesso
- **Potencial vector**: Buscar API key em JS bundles do frontend, GitHub dorks, ou configs vazadas

---

## 3. noticias.focusconcursos.com.br (Next.js SSR)

### Tech Stack
- **Framework**: Next.js (SSR com App Router)
- **Cache**: Vercel-like caching (x-nextjs-cache: HIT, x-nextjs-prerender: 1)
- **Rotas App Router**: `/app/(public)/` e `/app/layout`

### Content Discovery (common.txt + raft-large-words.txt)
#### Rotas Públicas (200)
| Rota | Tamanho | Descrição |
|------|---------|-----------|
| `/` (index) | 347 KB | Home page |
| `/noticias` | 202 KB | Lista de notícias |
| `/provas` | **5.1 MB** | Provas anteriores (dados massivos) |
| `/organizadoras` | **1.0 MB** | Organizadoras de concursos |
| `/videos` | 62 KB | Página de vídeos |
| `/galerias` | 62 KB | Galerias |
| `/feed` | 43 KB | RSS/Feed |
| `/login` | 52 KB | Página de login |
| `/favicon.ico` | 15 KB | Favicon |

#### Rotas Redirecionadas (307)
| Rota | Destino | Descrição |
|------|---------|-----------|
| `/admin` | `/login?callbackUrl=%2Fadmin` | Painel admin (autenticado) |
| `/editais` | `/` | Redireciona para home |
| `/questoes` | `/` | Redireciona para home |
| Variações de `/admin*` | `/login*` | Múltiplas variações (admin1, admin2, admincp, etc.) |

#### API Endpoints
| Endpoint | HTTP | Resposta |
|----------|------|----------|
| `/api/auth/me` | **200** | `{"user":null}` — público, sem auth! |
| `/api/products/click` | **405** | Method not allowed |
| `/api/` | 308 | Redirect |
| `/api/v1` | 404 | Not found |
| `/api/graphql` | 404 | Not found |
| `/swagger` | 404 | Not found |
| `/openapi.json` | 404 | Not found |

### Rotas Internas do Next.js (via sitemap.xml)
- **4.785 URLs** no sitemap
- Padrão: `/noticias/<slug-do-concurso>`
- Exemplos: `/noticias/unesp-publica-edital-com-salario-de-r-65-mil-para-nivel-medio`

### Robots.txt
- Disallow: `/admin`, `/api`
- Allow: `/` para todos os bots exceto IA crawlers (GPTBot, ChatGPT-User, ClaudeBot, etc.)
- Host: `https://noticias.focusconcursos.com.br`
- Sitemap: `/sitemap.xml`

---

## 4. vc.focusconcursos.com.br (nginx/1.31.1)

| Aspecto | Detalhe |
|---------|---------|
| **Server** | nginx/1.31.1 |
| **Status** | 301 redirect |
| **Redirect** | `https://focusconcursos.com.br/produtos` |
| **Header** | `alt-svc: h3=":443"; ma=2592000` (HTTP/3) |
| **Nota** | Nginx 1.31.1 é versão muito recente (2025+) |

---

## 5. apilms.focusconcursos.com.br

| Aspecto | Detalhe |
|---------|---------|
| **Status** | 503 para TODOS os endpoints testados |
| **Servidor** | Traefik (por trás do proxy) |
| **Body** | "20 bytes" — resposta padrão Traefik 503 |
| **Nota** | Serviço offline ou bloqueado |

---

## 6. Vhosts Test

| Vhost | Status | Observação |
|-------|--------|------------|
| `blog.focusconcursos.com.br` | **301** → noticias | Blog redireciona para notícias |
| `www3`, `admin`, `lms`, `payment`, `integration`, `api`, `app`, `portal`, `aluno`, `dev`, `test`, `staging`, `cdn`, etc. | **503** | Todos atrás do Traefik, retornando 503 |

---

## 7. JS Analysis (noticias.focusconcursos.com.br)

### Bundles Baixados: 36 arquivos (1.7MB total)
- `/js_bundles/` — todos os chunks do Next.js

### Rotas/Endpoints Extraídos dos JS
```
/admin                     → Painel administrativo
/api/auth/me               → API pública de autenticação
/api/products/click        → Tracking de cliques em produtos
/editais                   → Editais de concursos
/noticias                  → Notícias
/organizadoras             → Organizadoras
/provas                    → Provas
/questoes                  → Questões
/videos                    → Vídeos
```

### Assets Externos Identificados
| Asset | URL |
|-------|-----|
| **S3 Blog** | `https://s3.us-east-1.amazonaws.com/s3.blog.focusconcursos.com.br/` |
| **S3 GrupoFocus** | `https://s3.us-east-1.amazonaws.com/s3.grupofocus.com.br/` |
| **Faculdade Focus** | `https://faculdadefocus.com.br/produtos?group=graduacao` |
| **Método Focus** | `https://metodo.focusconcursos.com.br` |
| **Focus Concursos** | `https://focusconcursos.com.br/produtos` |

### Chaves/Secrets Encontrados
- **AWS Keys**: Nenhuma encontrada nos JS
- **JWT Tokens**: Nenhum encontrado
- **API Keys/Secrets**: Nenhum encontrado diretamente nos bundles

### S3 Buckets (Cloud Findings)
```
s3.blog.focusconcursos.com.br (no prefix s3.)
  ├── /noticias/images/<uuid>.webp
  └── /noticias/youtube/thumbnails/<uuid>.jpg

s3.grupofocus.com.br (no prefix s3.)
  └── /admin/4/products/<product-id>.webp
```

---

## 8. Bancos Expostos (CRÍTICO)

### MySQL 8.0.42 (Porta 6034) — ⚠️ EXPOSIÇÃO CRÍTICA
- **MySQL 8.0.42** exposto diretamente na internet
- Auth Plugin: `mysql_native_password`
- Certificado SSL auto-assinado: `MySQL_Server_8.0.42_Auto_Generated_Server_Certificate`
- Thread ID válido obtido: 552886 (serviço ativo)
- **Risco**: Força bruta, credenciais default, dump de dados

### Redis (Porta 6035) — ⚠️ EXPOSIÇÃO ALTA
- Redis key-value store exposto
- Resposta: `-NOAUTH Authentication required.`
- **Risco**: Se credenciais fracas, acesso total a dados em cache/sessões

---

## 9. Candidates a Vulnerabilidade

| # | Tipo | Alvo | URL/Porta | Criticidade |
|---|------|------|-----------|-------------|
| V-01 | **MySQL Exposto** | 18.233.104.160:6034 | MySQL 8.0.42 público | 🔴 Crítica |
| V-02 | **Redis Exposto** | 18.233.104.160:6035 | Redis key-value store público | 🔴 Alta |
| V-03 | **n8n API Key Brute** | 18.233.104.160:80 | `/api/v1/workflows` | 🔴 Alta |
| V-04 | **n8n Webhook SSRF** | 18.233.104.160:80 | `/webhook/*` POST | 🔴 Alta |
| V-05 | **n8n Dev Mode** | 18.233.104.160:80 | Development mode sem DSN | 🟡 Média |
| V-06 | **API Auth Público** | noticias | `/api/auth/me` sem auth | 🟡 Média |
| V-07 | **S3 Bucket Enum** | AWS S3 | `s3.blog.focusconcursos.com.br` | 🟡 Média |
| V-08 | **Admin Panel Exposto** | noticias | `/admin` → `/login` | 🟡 Média |
| V-09 | **Info Disclosure** | noticias | Sitemap 4785 URLs (data mining) | 🔵 Baixa |
| V-10 | **IDOR em /api/products/click** | noticias | `/api/products/click` POST | 🔴 Alta (testar) |

---

## 10. Próximos Passos Recomendados

1. **🔴 Imediato**: Validar acesso ao MySQL 8.0.42 (6034) — tentar `root` sem senha, credenciais comuns
2. **🔴 Imediato**: Validar acesso ao Redis (6035) — tentar auth bypass, senhas comuns
3. **🔴 n8n**: Buscar API key no código JS do n8n (assets/), tentar webhook test injection, verificar CVE-2024-xxxx para n8n < 1.20
4. **🔴 Webapp**: Testar IDOR em `/api/products/click`, SSRF em `/api/*`
5. **🟡 Webapp**: Testar login bypass em `/login` e `/admin`
6. **🟡 Cloud**: Enumerar buckets S3 (`s3.blog.focusconcursos.com.br`, `s3.grupofocus.com.br`)
7. **🟡 Webapp**: Explorar `/provas` (5MB) e `/organizadoras` (1MB) para data scraping / info disclosure
8. **🔵 CVE Research**: Pesquisar CVEs para n8n 1.120.4, Nginx 1.31.1, Traefik