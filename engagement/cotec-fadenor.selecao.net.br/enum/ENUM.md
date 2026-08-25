# Enumeração Profunda — ifes25-semproxy.selecao.net.br

## Sumário
- **Diretórios encontrados**: 25+ (admin, login, uploads, vendor, data, etc.)
- **Arquivos PHP**: 8+ (uploads/*.php, todos 403)
- **Arquivos JS**: 9+ (CDN static + admin webpack bundle)
- **Endpoints API**: 1 crítico (JWKS), 2 endpoints de login
- **Parâmetros**: 15 testados, nenhum vulnerável a LFI
- **LFI confirmado**: Não
- **Server path leaked**: SIM - `/home/impacta/proseleta/v2/` no JS bundle

## Diretórios Descobertos

### Acessíveis (200/301)
| Caminho | Status | Descrição |
|---------|--------|-----------|
| `/` | 200 | Homepage - site público IFES ProSeleta |
| `/Login` | 200 | Página de login (alias) |
| `/Index` | 200 | Homepage (alias) |
| `/admin/login/` | 200 | **Admin panel** - ProSeleta backend (Laravel) |
| `/robots.txt` | 200 | Disallow: /admin/, /painel/, /uploads/ |
| `/.well-known/jwks.json` | 200 | **JWKS pública - JWT RS256** |
| `/build/` | 301 | Redireciona |
| `/css/` | 301 | Redireciona |
| `/js/` | 301 | Redireciona |
| `/img/` | 301 | Redireciona |
| `/images/` | 301 | Redireciona |
| `/fonts/` | 301 | Redireciona |
| `/dist/` | 301 | Redireciona |
| `/data/` | 301 | Redireciona |

### Bloqueados (403)
| Caminho | Descrição |
|---------|-----------|
| `/uploads/` | Uploads - existe mas bloqueado |
| `/uploads/editor/` | Editor de conteúdo |
| `/vendor/` | Vendor directory (Laravel) |
| `/plugins/` | Plugins |
| `/data/` | Data directory |

### Requerem Autenticação (302)
| Caminho | Redireciona para |
|---------|-----------------|
| `/admin/` | `/admin/login/` |
| `/admin/logs/` | `/admin/login/` |
| `/admin/clientes/` | `/admin/login/` |
| `/admin/concursos/` | `/admin/login/` |
| `/admin/candidatos/` | `/admin/login/` |
| `/inscricao/` | `/login/` |
| `/login/` | Homepage (com redir param) |

### Páginas Funcionais
| Caminho | Descrição |
|---------|-----------|
| `/index/abertos/` | Inscrições Abertas |
| `/index/1/` | Em andamento |
| `/index/2/` | Homologado |
| `/index/3/` | Finalizado |
| `/index/4/` | Suspenso |
| `/index/5/` | Cancelado |
| `/index/todos/?busca=X` | Busca de processos |
| `/informacoes/46/` | Info processo seletivo #46 |
| `/noticias/` | Notícias |
| `/painel/` | Área do candidato |
| `/login/esqueci/` | Recuperar senha |

## Endpoints de Interesse

### Admin Login - `/admin/login/`
- **Framework**: Laravel (webpack, axios, CSRF)
- **Autenticação**: email + senha + hCaptcha
- **hCaptcha presente**: SIM
- **CSRF Token**: Presente (meta tag e cookie XSRF-TOKEN)
- **CORS**: `Access-Control-Allow-Origin: *`
- **Cookies**: `XSRF-TOKEN` (Laravel encriptado), `laravel_session` (httponly)

### Candidate Login - `/login/logar/` (POST)
- **Framework**: PHP nativo (PHPSESSID)
- **Autenticação**: CPF + senha
- **Rate limiting**: 302 redirect em credenciais inválidas

## LFI Test Results
**NEGATIVO** - Nenhum dos 15 parâmetros testados apresentou LFI:
- Testados: page, pag, file, template, include, path, dir, documento, arquivo, download, img, id, cat, time
- Payloads: /etc/passwd, php://filter, wrappers, path traversal
- Todos endpoints retornaram conteúdo idêntico ao original
- Provável que os parâmetros sejam ignorados ou processados apenas em actions autenticadas

## API Endpoints
| Endpoint | Status | Notas |
|----------|--------|-------|
| `/.well-known/jwks.json` | **200** | **JWT Public Key exposta!** Alg: RS256, Kid: 2026-08-06-01 |
| `/api/` | 404 | N/A |
| `/api/v1/` | 404 | N/A |
| `/swagger.json` | 404 | N/A |
| `/graphql` | 404 | N/A |

## JS com Informações Sensíveis
- **Server path leaked**: `/home/impacta/proseleta/v2/` no bundle app.js
- **Vendor path**: `/home/impacta/proseleta/v2/vendor/impactaweb/laravel-crud/`
- **Sass paths**: resources/sass/{app,banca,lgpd,site}.scss
- **Bibliotecas identificadas**: axios, select2, summernote, inputmask, jQuery

## Server Info
- **Server**: Apache/2.4.41 (Ubuntu)
- **PHP**: PHPSESSID presente (session-based auth no frontend)
- **Laravel**: Admin panel (session + cookie-based auth)
- **JWT**: Implementado (chave pública exposta em /.well-known/jwks.json)
- **CDN**: static-cdn.selecao.net.br (separado, Apache)
- **Database**: MySQL 8.0.32 (de contexto anterior)
- **Plataforma**: ProSeleta by Impacta Soluções Web

## Próximos Passos

### 1. ⚠️ CRÍTICO - JWT Attack
A chave pública JWT está exposta em `/.well-known/jwks.json`. Se o servidor aceitar JWTs com `alg: "none"` ou se houver um `kid` injection, é possível forjar tokens.

**Tentativas sugeridas**:
- `jwt_tool` com ataque de algoritmo none
- `jwt_cracker`/`hashcat` para força bruta (se HS256 usado em algum lugar)
- `kid` injection (path traversal no kid field)
- Substituir a chave pública pela nossa própria (se o servidor busca a chave do URL no kid)

### 2. Brute Force Admin Login
- **Email/password** com hCaptcha
- Testar credenciais comuns: admin@ifes.edu.br, admin@proseleta.com.br, admin/123456
- Se hCaptcha for bypassável, tentar força bruta de senhas fracas

### 3. Forgot Password Testing
- `/admin/recuperar-senha` - Testar
- `/login/esqueci/` - Testar enumeração de usuários
- Verificar se há vazamento de informações (existência de conta)

### 4. Authenticated Recon
- Se conseguir acesso ao admin, explorar:
  - File upload em `/uploads/` e `/uploads/editor/`
  - LFI em funcionalidades de download/visualização de documentos
  - SQL injection em campos de busca/filtro
  - SSTI se estiver usando Blade templates
  - RCE via upload de arquivo

### 5. SQL Injection
- Testar `/index/todos/?busca=X` no parâmetro `busca`
- Testar `/informacoes/46/` no ID
- Testar parâmetros POST no login
- WAF: Nenhum (backend direto), MySQL 8.0.32

### 6. Subdomain Enumeration
- Verificar subdomínios: static-cdn.selecao.net.br já identificado
- Procurar outros subdomínios que possam ter APIs diferentes

### 7. Upload Analysis
- `/uploads/` e `/uploads/editor/` retornam 403
- Tentar bypass de restrição: headers (X-Forwarded-For, X-Original-URL), métodos HTTP alternativos
- Se autenticado, testar upload de shell

### 8. CORS Abuse
- `Access-Control-Allow-Origin: *` presente
- Verificar se `Access-Control-Allow-Credentials: true` também está habilitado
- Testar se cookies de sessão podem ser roubados via CORS

## Screenshots
- main_page: `https://ifes25-semproxy.selecao.net.br/` - Homepage IFES
- admin_login: `https://ifes25-semproxy.selecao.net.br/admin/login` - Admin ProSeleta login
- (screenshots saved in gowitness output directory)

---
*Gerado em: 2026-08-25 17:30 BRT*
*Ferramentas: ffuf, curl, waybackurls, gowitness, grep, strings*
*Wordlists: common.txt, raft-large-directories.txt, DirBuster-2.3-medium.txt*