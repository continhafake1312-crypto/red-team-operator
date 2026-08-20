# Enumeration Report — elprofessordaoratoria.com.br

**Date**: 2026-08-20  
**Operator**: enum specialist  
**Target**: elprofessordaoratoria.com.br (Hostinger 89.117.32.51 + GCP 35.199.71.234)

---

## 1. WordPress — elprofessordaoratoria.com.br

### Technology Stack
- **CMS**: WordPress (via wpscan)
- **Web Server**: Apache 2.4.62 (Debian)
- **PHP**: 8.2.27
- **IP**: 89.117.32.51 (Hostinger)

### Usuários Enumerados (via `/wp-json/wp/v2/users`)

| ID | Username | Display Name | Slug |
|----|----------|-------------|------|
| 1  | `admin`  | admin       | admin |
| 2  | `Gabriel`| Gabriel     | admin2 |

### Plugins Detectados (wpscan + passive)
| Plugin | Versão | Notas |
|--------|--------|-------|
| Elementor | 3.23.1 | Confirmado via body class |
| Yoast SEO | 23.0 | Confirmado via wp-json output |
| WP Rocket | Desconhecida | Performance/caching |
| HFCM (Header Footer Code Manager) | Desconhecida | Injeção de scripts |
| Happy Elementor Addons | Desconhecida | Page builder extensions |
| GDPR Cookie Consent | Desconhecida | Cookie compliance |
| Form Masks for Elementor | Desconhecida | Form masking |

### Paths Sensíveis Encontrados
- **`/wp-json/wp/v2/users/`** — 200, expõe dados completos de usuários (nome, slug, avatar, meta)
- **`/xmlrpc.php`** — 200, XML-RPC habilitado (pingback, brute force, DoS)
- **`/readme.html`** — 200, readme do WordPress exposto
- **`/wp-cron.php`** — 200, WP-Cron externo habilitado
- **`/robots.txt`** — Permite tudo, sitemap index exposto
- **`/wp-content/plugins/`** — Directory listing? (não confirmado)
- **`/wp-content/uploads/`** — Acessível (upload dir)
- **`/?author=1`** — Redireciona para `/author/admin/`

### wpscan Output
- Scan completed (aborted durante media brute force)
- 10835 requests, 3.874 MB received
- Sem API token → sem dados de vulnerabilidade
- Must Use Plugins detectado
- Nenhum backup ou DB export encontrado

### CVEs Candidates
- Elementor 3.23.1 + Happy Addons → XSS, file inclusion (pesquisar)
- XML-RPC ativo → pingback DDoS, brute force
- Yoast SEO 23.0 → pesquisar CVEs
- WP Rocket cache → path disclosure potencial

---

## 2. Portainer — portainer.elprofessordaoratoria.com.br

### Technology Stack
- **Software**: Portainer CE 2.21.5
- **Framework**: Angular SPA
- **Server**: Hostinger (89.117.32.51)
- **InstanceID**: 3ca33b66-7ef2-4a2a-971a-5e10edef581e

### Endpoints Descobertos

#### Públicos (sem auth)
| Endpoint | Method | Status | Resposta |
|----------|--------|--------|----------|
| `/api/status` | GET | 200 | `{"Version":"2.21.5","InstanceID":"...","DemoEnvironment":{"enabled":false}}` |
| `/#!/init/admin` | GET | 200 | Página de setup admin (SPA) |

#### Requer Auth (401 sem JWT)
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/endpoints` | GET | 401 |
| `/api/users` | GET | 401 |
| `/api/settings` | GET | 401 |
| `/api/stacks` | GET | 401 |
| `/api/registries` | GET | 401 |
| `/api/resource_controls` | POST | 405 |

#### Auth Endpoint
| Endpoint | Method | Status | Notas |
|----------|--------|--------|-------|
| `/api/auth` | POST | 422/200 | 422 para credenciais inválidas, 200 para válidas |
| `/api/auth` | GET | 405 | Method not allowed |

### Credenciais Testadas (todas falharam)
- admin:admin → 422 "Access denied"
- admin:portainer, admin:password, admin:password123, admin:changeme, admin:123456, admin:docker, admin:letmein, admin:toor
- administrator:admin, administrator:portainer, administrator:password
- portainer:admin, portainer:portainer, portainer:password

### Directory Busting (ffuf)
Apenas `/index.html` (301) encontrado.

### CVE Research (Portainer 2.21.5)
- Verificar CVE-2024-... para bypass de auth ou RCE
- Portainer CE 2.21.5 é recente, verificar changelog entre 2.21.x
- Portainer expõe Docker API via `/api/docker/<id>/containers/json` (precisa auth)

---

## 3. Mautic — mautic.elprofessordaoratoria.com.br

### Technology Stack
- **Software**: Mautic (Marketing Automation)
- **PHP**: 7.4.33
- **Web Server**: Apache 2.4.54 (Debian)
- **IP**: 89.117.32.51 (Hostinger)

### Versão
Não foi possível determinar versão exata. A página de login não expõe versão.
Métodos alternativos:
- `/composer.json` → 403 (bloqueado)
- `/composer.lock` → 403 (bloqueado)
- `/upgrade.php` → 403 (bloqueado)
- `/vendor/version` → 404
- `/robots.txt` → 200, permite rastreamento de paths do Mautic

### Endpoints Descobertos

#### Públicos
| Endpoint | Method | Status | Notas |
|----------|--------|--------|-------|
| `/s/login` | GET | 200 | Página de login (CSRF token rotativo) |
| `/s/login_check` | POST | 302/200 | Login handler (302 com creds inválidas) |
| `/passwordreset` | GET | 200 | Password reset form |
| `/installer` | GET | 302 | Redireciona (Mautic installer) |
| `/.env` | GET | **200** | `.env.test` exposto com credenciais! |
| `/robots.txt` | GET | 200 | Disallow: /addons/, /plugins/, /app/, /vendor/ |
| `/.git/logs/` | GET | 301 | Git directory listing exposto |

#### Bloqueados (403)
| Endpoint | Notas |
|----------|-------|
| `/composer.json` | Bloqueado (HTAccess?) |
| `/composer.lock` | Bloqueado |
| `/upgrade.php` | Bloqueado |
| `/api/*` | API endpoints bloqueados |

### `.env.test` Exposto — **CRÍTICO**
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=mautictest
DB_USER=root
DB_PASSWD=
MAUTIC_DB_PREFIX=test_
MAUTIC_ENV=test
MAUTIC_ADMIN_USERNAME=admin
MAUTIC_ADMIN_PASSWORD=mautic
```

### Git Exposure — **ALTO**
- `/.git/logs/` — directory listing acessível (301 redirect)
- `/.git/HEAD` — 404 (bloqueado)
- `/.git/config` — 404 (bloqueado)
- Pode haver outros arquivos git acessíveis

### Login Attempts
- **admin:mautic** (creds do .env.test) → 302 redirect (login rejeitado)
- **admin:admin** → 302 redirect (login rejeitado)
- CSRF token coletado e utilizado corretamente
- Cookie de sessão é emitido mesmo em falha de login

### Directory Busting (ffuf)
- `/.env` (200) — EXPOSED!
- `/.git/logs/` (301) — Git exposure
- `/installer` (302) — Mautic installer
- `/css`, `/js`, `/images` (301) — diretórios assets
- Múltiplos falsos positivos (301) para paths inexistentes

---

## 4. API GCP — api.elprofessordaoratoria.com.br

### Technology Stack
- **Provider**: Google Cloud Platform (GCP)
- **IP**: 35.199.71.234 (GCP)
- **IPv6**: 2600:1901:0:17b4::
- **Service**: Cloud Run / App Engine (suspeito)
- **TLS**: Google CA

### Métodos HTTP Testados

| Método | `/` | `/api` | `/v1` | `/graphql` | `/health` | `/status` |
|--------|-----|--------|-------|------------|-----------|-----------|
| GET | 400 | 400 | 400 | 400 | 400 | 400 |
| POST | 400 | 400 | 400 | 400 | 400 | 400 |
| OPTIONS | 400 | 400 | 400 | 400 | 400 | 400 |
| PUT | 404 | 404 | 404 | 404 | 404 | 404 |
| DELETE | 404 | 404 | 404 | 404 | 404 | 404 |
| PATCH | 404 | 404 | 404 | 404 | 404 | 404 |

### Headers Identificados
- `x-robots-tag: noindex, nofollow`
- `trace-id: <uuid>` (GCP characteristic)

### Endpoints com Resposta Diferente (ffuf)
| Path | Status | Tamanho | Notas |
|------|--------|---------|-------|
| `/` | 400 | 0B | Requisição base rejeitada |
| `/healthz` | 200 | 2B | Health check endpoint! |
| `/a` | 200 | 0B | Rota curinga? |
| `/robots.txt` | 200 | 26B | "User-agent: * Disallow: /" |

### Análise
- API não retorna corpo de resposta (ou retorna vazio)
- Requer autenticação específica (Bearer token, x-api-key?)
- `/healthz` é endpoint comum de GCP Cloud Run
- Possível API GraphQL ou REST sem documentação pública
- Rate limiting ativo (400 para requests sem headers corretos)

---

## Candidates a Vulnerabilidade

### WordPress
| Tipo | Path | Evidência |
|------|------|-----------|
| **Info Disclosure** | `/wp-json/wp/v2/users/` | Expõe todos os usuários do WordPress |
| **Brute Force** | `/xmlrpc.php` | XML-RPC habilitado, permite brute force de credenciais |
| **Path Disclosure** | `/readme.html` | Confirma versão do WordPress |
| **Info Disclosure** | `/wp-cron.php` | WP-Cron exposto externamente |

### Portainer
| Tipo | Path | Evidência |
|------|------|-----------|
| **Info Disclosure** | `/api/status` | Expõe versão, InstanceID, configuração do sistema |
| **Auth Bypass?** | `/#!/init/admin` | Página de setup admin acessível (verificar se expirada) |
| **Brute Force** | `/api/auth` | POST endpoint sem rate limiting aparente |

### Mautic
| Tipo | Path | Evidência |
|------|------|-----------|
| **CRÍTICO - Config Exposure** | `/.env` | `.env.test` expõe credenciais de banco e admin |
| **ALTO - Git Exposure** | `/.git/logs/` | Directory listing do git acessível |
| **Password Reset** | `/passwordreset` | Funcionalidade de reset disponível |
| **Médio - Installer** | `/installer` | Installer do Mautic acessível |

### API GCP
| Tipo | Path | Evidência |
|------|------|-----------|
| **Info Disclosure** | `/robots.txt` | "Disallow: /" confirma que é um web service |
| **Health Check** | `/healthz` | Endpoint de health check público (2B response) |
| **Low - Rota curinga** | `/a` | Retorna 200 com 0 bytes |

---

## Próximos Passos Recomendados

1. **WordPress**: Brute force via xmlrpc.php com usuários admin/Gabriel
2. **Portainer**: Pesquisar CVE-2024-xxxx para Portainer 2.21.5 + brute force mais agressivo
3. **Mautic**: Tentar acessar `.git/` (indexação de diretório), tentar versão por arquivos JS, brute force com admin:mautic / admin:admin / admin2:password
4. **Mautic DB**: Verificar se o `.env.test` corresponde ao produção (DB root sem senha)
5. **API GCP**: Fuzzing com headers de autenticação comuns, testar mais endpoints REST