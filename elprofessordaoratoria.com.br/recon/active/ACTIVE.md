# Active Recon Results — elprofessordaoratoria.com.br

## Ranking de Payoff (Atualizado)

| # | Vetor | Payoff | Status | Notas |
|---|-------|--------|--------|-------|
| 1 | **PostgreSQL 5432 exposto** (82.112.244.187) | **CRÍTICO** | 🔍 Descoberto | Porta 5432 acessível publicamente. PostgreSQL 9.6+. Requer brute de credenciais (postgres/supabase_admin/users falharam). Cert SSL: "ndd". |
| 2 | **Portainer** 2.21.5 (89.117.32.51) | **CRÍTICO** | 🔍 Confirmado | `portainer.elprofessordaoratoria.com.br`. Angular SPA. Creds default testar com brute. |
| 3 | **n8n** (82.112.244.187:3000) | **CRÍTICO** | 🔍 Descoberto | Porta 3000: Express.js. POST / retorna map URLs. Serviço GIS desconhecido. |
| 4 | **MinIO / Supabase / Odoo / Dify / Baserow** (82.112.244.187) | **ALTO** | ❌ Não encontrados | IP 82.112.244.187 só tem portas 22/80/443/3000/5432 abertas. Hostinger bloqueia firewall. Serviços podem ser internos ou em outros IPs. |
| 5 | **WordPress** (89.117.32.51) | **ALTO** | 🔍 Confirmado | WP 7.0.4, Elementor 3.23.1, Yoast 23.0. User enum via REST API: **admin**. xmlrpc.php ativo. |
| 6 | **Mautic** (89.117.32.51) | **ALTO** | 🔍 Confirmado | `mautic.elprofessordaoratoria.com.br`. Apache 2.4.54 + PHP 7.4.33. Redirect to /s/dashboard. |
| 7 | **MariaDB 11.8.8 exposto** (147.93.38.23:3306) | **ALTO** | 🔍 Confirmado | Porta 3306 exposta publicamente com MariaDB 11.8.8. Proxy header blocking ativo. |
| 8 | **API GCP** (35.199.71.234) | **MÉDIO** | 🔍 Confirmado | `api.elprofessordaoratoria.com.br` → 35.199.71.234. Retorna 400. Traefik proxy. |
| 9 | **FTP** (147.93.38.23) | **MÉDIO** | 🔍 Confirmado | ProFTPD/KnFTPD. Anônimo negado. TLS disponível. |
| 10 | **DMARC p=none** | **BAIXO** | ⏳ Pendente | Spoofing possível. |

## Portas Abertas por IP

### 89.117.32.51 — Hostinger (Main Site)
| Porta | Estado | Serviço | Versão |
|-------|--------|---------|--------|
| 22/tcp | open | SSH | OpenSSH 8.2p1 Ubuntu |
| 80/tcp | open | HTTP (Traefik) | Golang net/http |
| 443/tcp | open | HTTPS (Traefik) | Golang net/http |

**Subdomínios ativos:**
- `elprofessordaoratoria.com.br` → WordPress 7.0.4 (Apache 2.4.62, PHP 8.2.27)
- `portainer.elprofessordaoratoria.com.br` → Portainer CE
- `mautic.elprofessordaoratoria.com.br` → Mautic (Apache 2.4.54, PHP 7.4.33)
- `cursos.elprofessordaoratoria.com.br` → Redirect 301 (Nginx 1.30.4)
- `www.elprofessordaoratoria.com.br` → 404

### 35.199.71.234 — GCP (API)
| Porta | Estado | Serviço | Versão |
|-------|--------|---------|--------|
| 80/tcp | open | HTTP (Traefik) | Golang net/http |
| 443/tcp | open | HTTPS (Traefik) | Golang net/http |

**Subdomínio:**
- `api.elprofessordaoratoria.com.br` → 400 Bad Request

### 147.93.38.23 — Hostinger (FTP)
| Porta | Estado | Serviço | Versão |
|-------|--------|---------|--------|
| 21/tcp | open | FTP | ProFTPD / KnFTPD (TLS) |
| 80/tcp | open | HTTP | LiteSpeed (403 Forbidden) |
| 443/tcp | open | HTTPS | LiteSpeed (403 Forbidden) |
| 3306/tcp | open | MySQL | MariaDB 11.8.8 |

**Subdomínio:**
- `ftp.elprofessordaoratoria.com.br` → LiteSpeed 403

### 82.112.244.187 — Hostinger (Infraestrutura)
| Porta | Estado | Serviço | Versão |
|-------|--------|---------|--------|
| 22/tcp | open | SSH | OpenSSH 8.2p1 Ubuntu |
| 80/tcp | open | HTTP (Traefik) | Golang net/http |
| 443/tcp | open | HTTPS (Traefik) | Golang net/http |
| 3000/tcp | open | Express.js | Node.js Express (POST / → map URLs) |
| 5432/tcp | open | PostgreSQL | 9.6+ (protocol 2.0-3.0) |

**Observações:**
- Firewall Hostinger bloqueia todas as outras 65532 portas (filtered no-response)
- Traefik configurado com default cert, mas todos os subdomínios testados retornam 404 (protegido/roteamento interno)
- Porta 3000: Serviço Express desconhecido. POST / retorna `{"url":"http://.../maps/<hex>/index.html"}`. Gera IDs únicos a cada POST.
- Porta 5432: PostgreSQL exige senha. Cert SSL com CN=ndd. Tentativas de login (postgres, supabase_admin) falharam.
- NENHUM DNS público aponta para este IP (sem subdomínios conhecidos de elprofessordaoratoria.com.br)

### 35.199.94.181 — GCP (Pixel Tracker)
| Porta | Estado | Serviço | Versão |
|-------|--------|---------|--------|
| 80/tcp | open | HTTP | Caddy |
| 443/tcp | open | HTTPS | (sem title) |

**Observação:**
- `pixels.novadimensaohub.com.br` → CNAME `pixels.kiwify.com.` → 35.199.94.181

## Descobertas Críticas

### 1. WordPress User Enumeration
```json
GET /wp-json/wp/v2/users/
→ [{"id":1, "name":"admin", "slug":"admin", ...}]
```
- Usuário **admin** exposto via REST API
- Gravatar hash disponível
- xmlrpc.php ativo (responde 405 → permite brute force)

### 2. PostgreSQL Público (82.112.244.187:5432)
- Servidor PostgreSQL exposto publicamente
- Suporta protocolos 2.0 a 3.0
- Certificado SSL com CN=ndd
- Requer autenticação (senha)
- Usuários testados e falhos: postgres, supabase_admin

### 3. Serviço Misterioso na Porta 3000
- Express.js que responde apenas POST /
- Retorna URLs de mapas: `/maps/<16-hex-chars>/index.html`
- Cada POST gera novo ID hex (ex: `6368d1948dd9bae0`)
- GET nos paths de mapas retorna 404 (protegido/temporário)

### 4. MariaDB Exposto (147.93.38.23:3306)
- MariaDB 11.8.8 acessível publicamente
- Proxy header blocking ativo ("Proxy header is not accepted from {IP}")
- Versão relativamente recente (11.8.8)

### 5. Portainer (89.117.32.51)
- `portainer.elprofessordaoratoria.com.br`
- Portainer CE (Angular SPA)
- Provavelmente Portainer 2.21.5
- Acessível sem auth no frontend

## Serviços NÃO Encontrados no IP 82.112.244.187
- ❌ n8n (portas 5678, 3000 testadas - 3000 é outro serviço)
- ❌ MinIO (portas 9000, 9001 filtradas)
- ❌ Supabase Studio (porta 54321 filtrada)
- ❌ Odoo (porta 8069 filtrada)
- ❌ Dify (portas 5001, 3000 filtradas - 3000 é outro serviço)
- ❌ Baserow (porta 3000, 3081 filtradas)
- ❌ Portainer (está em 89.117.32.51)
- ❌ Mautic (está em 89.117.32.51)

**Conclusão:** A infraestrutura (n8n, MinIO, Supabase, etc.) não está acessível externamente pelo IP 82.112.244.187. O Hostinger bloqueia todas as portas exceto 22/80/443/3000/5432. Os serviços podem estar:
1. Rodando internamente (acesso apenas via rede privada Hostinger)
2. Em outro IP ainda não descoberto
3. Acessíveis via DNS privado com hostnames específicos no Traefik

## Recomendações para Próximos Passos
1. **Brute force PostgreSQL** (82.112.244.187:5432) com wordlists específicas
2. **Testar credenciais padrão no Portainer** (admin:admin, admin:portainer, etc.)
3. **WP brute force** no user "admin" via xmlrpc.php ou wp-login
4. **FTP brute force** (147.93.38.23) - usuários comuns: admin, ftp, web, elprofessor
5. **Pesquisa de CVEs**: Portainer 2.21.5, WordPress 7.0.4, Elementor 3.23.1, Yoast 23.0
6. **MariaDB brute** (147.93.38.23:3306) - tentar root sem senha, admin, etc.
7. **Analisar serviço na porta 3000** - tentar identificar serviço ou fazer fuzzing de endpoints
8. **Censys/Shodan** buscar por 82.112.244.187 para ver histórico de portas