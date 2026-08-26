# ENUM.md — Enumeração Profunda: pxa.focusconcursos.com.br (38.211.129.213)

> Data: 2026-08-26  
> Alvo: `pxa.focusconcursos.com.br` (38.211.129.213)  
> Stack: Caddy → Laravel + Filament PHP 5.7.6.0 + Livewire  
> Aplicação: "Pixel X App"

---

## 1. Port Scan (nmap -sV -sC -p-)

| Porta | State | Service | Version |
|-------|-------|---------|---------|
| 22/tcp | open | SSH | OpenSSH 9.6p1 Ubuntu-3ubuntu13.18 |
| 80/tcp | open | HTTP | Caddy (redirect → https) |
| 443/tcp | open | HTTPS | Caddy |
| 65532 ports | filtered | - | - |

**Nmap output**: `nmap_full.nmap`, `nmap_full.gnmap`, `nmap_full.xml`

---

## 2. Caddy Version

```
server: Caddy
```

Sem versão específica exposta. Caddy 2.x (moderno).

---

## 3. SSH Banner

```
SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.18
```

---

## 4. Content Discovery

### common.txt (SecLists)
| Path | Status | Size |
|------|--------|------|
| /css | 301 | 162 |
| /favicon.ico | 200 | 0 |
| /fonts | 301 | 162 |
| /images | 301 | 162 |

### raft-large-words / raft-medium-words (SecLists)
| Path | Status | Size | Notes |
|------|--------|------|-------|
| /images | 301 | 162 | |
| /admin | 302 | 426 | → /admin/login |
| /login | 200 | 34309 | Página de login |
| /js | 301 | 162 | |
| /css | 301 | 162 | |
| /profile | 302 | 402 | → /login |
| /logout | 405 | 1011 | Method Not Allowed |
| /new | 302 | 402 | → /login |
| /assets | 301 | 162 | |

### Arquivos Especiais
| Path | Status | Content |
|------|--------|---------|
| /robots.txt | 200 | `User-agent: *\nDisallow:` |
| /manifest.webmanifest | 200 | PWA manifest (Pixel X App) |
| /.env | 403 | Access Denied (bloqueado) |
| /.env.example | 403 | Access Denied (bloqueado) |
| /sitemap.xml | 404 | - |
| /.well-known/security.txt | 404 | - |
| /.well-known/jwks.json | 404 | - |

---

## 5. API Discovery

### Endpoints testados (todos 404)
| Path | Status |
|------|--------|
| /api/ | 404 |
| /api/v1 | 404 |
| /api/v2 | 404 |
| /graphql | 404 |
| /swagger | 404 |
| /openapi.json | 404 |
| /docs | 404 |
| /api-docs | 404 |
| /health | 404 |
| /api/health | 404 |
| /api/status | 404 |
| /api/ping | 404 |
| /api/info | 404 |
| /api/documentation | 404 |
| /api/swagger | 404 |
| /api/graphql | 404 |

Nenhuma API REST tradicional exposta publicamente.

---

## 6. Login Page Analysis

### `/login` — Página Principal
- **Framework**: Filament (Laravel) 5.7.6.0
- **CMS**: Custom "Pixel X App" (Laravel-based)
- **Livewire**: Presente (component-based)
- **CSRF Token**: Presente (meta name="csrf-token")
- **Form Fields**: email (type=email), password (type=password), remember (checkbox)
- **Action**: POST para `Filament\Auth\Pages\Login::authenticate()`
- **Password Reset**: `/password-reset/request`
- **Theme**: Dark mode default
- **Assets via CDN**: cdn.plyr.io, fonts.bunny.net

### `/admin/login` — Painel Admin
- **Status**: 200 (página de login separada!)
- **Framework**: Mesmo Filament (Livewire component)
- **CSRF Token**: `6w38Ni21CwkxFW2feBcKuP6uNqNrfz2mPTqQrY8a`
- **Form Fields**: email, password (mesmo schema)
- **Title**: vazio (diferente do login normal)
- **Livewire path**: `admin/login`

### Redirect Analysis
| Path | Redirect | Notas |
|------|----------|-------|
| /admin | → /admin/login | Painel admin separado |
| /profile | → /login | Requer autenticação |
| /new | → /login | Requer autenticação |
| /logout | 405 Method Not Allowed | POST apenas |

---

## 7. JS Analysis

### JS encontrados (12 arquivos baixados)
| JS | Tamanho | Observações |
|----|---------|-------------|
| actions.js | 3.2KB | Filament actions |
| notifications.js | 6.1KB | Filament notifications |
| schemas.js | 2.9KB | Filament schemas |
| support.js | 145KB | Filament support (Alpine.js) |
| tables.js | 22.9KB | Filament tables |
| pretty-json/scripts.js | 1KB | Plugin JSON |
| custom-js.js | 0B | **Vazio** - custom code placeholder |
| echo.js | 91.9KB | **Pusher WebSocket** - contém endpoints |
| app.js | 11.5KB | Filament app |
| livewire.min.js | 243KB | Livewire framework |
| plyr.polyfilled.js | CDN | Plyr player |
| mosko.chat widget | CDN | Chat widget externo |

### Endpoints encontrados via JS (echo.js - Pusher)
```
/broadcasting/auth
/broadcasting/user-auth
/pusher/auth
/pusher/user-auth
/docs/channels/server_api/authenticating_users
/docs/channels/server_api/authorizing-users/
/docs/javascript_quick_start
/pusher
/timeline/v2/
/xhr
/xhr_send
/xhr_streaming
/app/
```
> Nota: /broadcasting/auth, /pusher/auth retornam 404 (GET), mas podem aceitar POST com channel_name e socket_id.

### Análise de Segurança JS
- **Nenhuma chave AWS ou JWT exposta** nos JS baixados
- **Nenhum segredo hardcoded** encontrado
- **custom-js.js está vazio** (0 bytes) - placeholder para customizações
- **Echo.js** usa Pusher para WebSocket real-time

---

## 8. Frameworks & Bibliotecas Detectadas

| Componente | Versão | Detalhes |
|------------|--------|----------|
| Caddy | ? | Servidor web/reverse proxy |
| Laravel | ? | PHP framework (base da app) |
| Filament PHP | 5.7.6.0 | Admin panel framework |
| Livewire | 3.x? | Component-based frontend |
| Alpine.js | via Filament | Reactive UI |
| Pusher JS | via Echo | WebSocket real-time |
| Plyr | 3.7.8 | Media player |
| Formbricks | - | Survey tool |
| Mosko Chat | - | AI chat widget externo |
| Poppins | - | Google Font |

---

## 9. Candidates a Vulnerabilidade

### Alto Payoff
1. **IDOR/BOLA**: Após autenticação, testar `/profile`, `/admin/*` endpoints com IDs numéricos
2. **Falta de rate-limit no login**: Testar brute-force nos endpoints `/login` e `/admin/login`
3. **Admin panel exposto**: `/admin/login` é separado — testar creds padrão/admin
4. **Livewire endpoint injection**: `/livewire-20b400d1/message` — testar manipulação de parâmetros
5. **WebSocket auth bypass**: `/broadcasting/auth` via POST — testar bypass de autenticação Pusher

### Médio Payoff
6. **.env bloqueado mas retorna 403 específico**: Confirmar que está protegido
7. **Formbricks Survey**: Possível data injection via formbricks
8. **Laravel Debug**: Verificar `/debugbar`, `APP_DEBUG` leaks
9. **CVE-2025-29927 (Next.js)**: Não se aplica (Laravel, não Next.js)
10. **Mass assignment**: Testar parâmetros extras no POST de login (`is_admin`, `role`)

### Baixo Payoff
11. **robots.txt vazio**: Sem informações de diretórios bloqueados
12. **cookies**: XSRF-TOKEN e session sem HttpOnly adequado

---

## 10. Artefatos Salvos

| Arquivo | Descrição |
|---------|-----------|
| nmap_full.* | Nmap output (nmap, gnmap, xml) |
| caddy_version.txt | Server header |
| ssh_banner.txt | SSH version banner |
| content_discovery_common.txt | ffuf common.txt results |
| content_discovery_raft.txt | ffuf raft-large-words results |
| content_discovery_medium.txt | ffuf raft-medium-words results |
| api_endpoints.txt | ffuf API wordlist results |
| api_endpoints_manual.txt | Manual API path tests |
| api_endpoints_res.txt | ffuf api-endpoints-res.txt |
| redirect_analysis.txt | Redirect chain analysis |
| homepage.html | Página inicial (redirect to /login) |
| login_page.html | Página /login completa |
| admin_login.html | Página /admin/login |
| admin_login_headers.txt | Headers da resposta admin/login |
| login_analysis.txt | Análise do form de login |
| js_endpoints.txt | Endpoints extraídos dos JS |
| pusher_endpoints.txt | WebSocket/Pusher endpoints test |
| js_*.js | 11 arquivos JS baixados |

---

**Próximos Passos (Recomendados):**
1. Testar brute-force no `/admin/login` com creds padrão
2. Testar IDOR após registrar/conseguir sessão
3. Investigar WebSocket auth bypass
4. Procurar arquivos de configuração Laravel (config/, .env, storage/)