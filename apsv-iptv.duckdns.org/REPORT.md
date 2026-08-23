# REPORT — apsv-iptv.duckdns.org

## Resumo Executivo

Pentest Web/API black-box contra `apsv-iptv.duckdns.org` (TelaViva IPTV).
**Resultado crítico**: acesso ADMIN total ao sistema via credenciais padrão.
Painel admin expõe chaves de API sensíveis, logs de usuários, e catálogo completo.

**Status**: EM ANDAMENTO — pivoting para telaviva.com.br

## Acessos Obtidos

| Recurso | Credencial | Role | Status |
|---------|-----------|------|--------|
| JWT API (apsv-iptv) | admin:admin123 | ADMIN (superusuário) | ✅ Confirmado |
| Dashboard admin | admin:admin123 | Admin | ✅ Confirmado |
| Config API | Bearer token | Admin | ✅ Confirmado |

## Tabela de Findings

| ID | Severidade | Tipo | Host | Status |
|----|-----------|------|------|--------|
| F-001 | 🟥 Crítica | Default Credentials → Admin | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-002 | 🟥 Crítica | Config API expõe chaves sensíveis | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-007 | 🟧 Alta | Rotas administrativas expostas | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-003 | 🟡 Média | 487 canais públicos sem auth | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-004 | 🟡 Média | CORS wildcard (*) | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-005 | 🟡 Média | Logs com IPs reais expostos | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-006 | ⬜ Baixa | Rate limit fraco (10k/26s) | apsv-iptv.duckdns.org | ✅ Confirmado |

## Detalhamento

### F-001: Default Credentials → JWT Admin
**Alvo**: apsv-iptv.duckdns.org
**Severidade**: Crítica

Credenciais `admin:admin123` concedem acesso ADMIN total ao sistema.
- JWT admin obtido com role `ADMIN`, `maxConnections: 999`, sem expiração
- Dashboard admin com todas as funcionalidades: canais, VOD, EPG, usuários, pagamentos, logs
- Catálogo completo: 487 canais com URLs de stream
- VOD: filmes/séries com sources

**Evidência**: `evidence/F-001.txt` | **Loot**: `loot/admin-jwt.txt`

### F-002: Config API Expondo Chaves Sensíveis
**Alvo**: apsv-iptv.duckdns.org
**Severidade**: Crítica

Endpoint `/api/admin/config` expõe:
- `RESEND_API_KEY` — email API (phishing/spoofing)
- `TURNSTILE_SECRET_KEY` — bypass de CAPTCHA
- `TMDB_API_KEY` — API externa
- `POSTHOG_KEY` — analytics tracking
- `CORS_ORIGIN: *` — CORS aberto

**Evidência**: `evidence/F-002.txt`

### F-007: Rotas Administrativas Expostas
**Alvo**: apsv-iptv.duckdns.org
**Severidade**: Alta

8+ rotas admin expostas: `/api/admin/config`, `/api/admin/users`, `/api/admin/channels`, `/api/admin/vod`, `/api/admin/epg`, `/api/admin/payments`, `/api/admin/logs`, `/admin/dashboard`, etc.

### F-003: 487 Canais Públicos
**Alvo**: apsv-iptv.duckdns.org
**Severidade**: Média

Endpoint `/api/channels/verified` retorna 487 canais com URLs de stream sem autenticação.

### F-004: CORS Wildcard
**Alvo**: apsv-iptv.duckdns.org
**Severidade**: Média

`Access-Control-Allow-Origin: *` permite qualquer site fazer requisições cross-origin.

### F-005: Logs com IPs Reais
**Alvo**: apsv-iptv.duckdns.org
**Severidade**: Média

Dashboard admin exibe IPs reais de usuários (faixa brasileira), violando privacidade (LGPD).

### F-006: Rate Limit Fraco
**Alvo**: apsv-iptv.duckdns.org
**Severidade**: Baixa

Rate limit de 10.000 requisições a cada 26s (~23k/min) facilita scraping e brute-force.

## Pendentes / Em Andamento
- 🔄 CVE research — Exim 4.99.5, OpenSSH 7.4, Dovecot, Pure-FTPd
- 🔄 Testar RESEND_API_KEY para spoofing
- 🔄 Decodificar JWT secret (força bruta)

## Concluído (Pivoting telaviva.com.br)
| ID | Severidade | Tipo | Host | Status |
|----|-----------|------|------|--------|
| F-001 | ⬜ Info | WordPress version 7.0.4 (latest), TagDiv Newspaper, 10+ plugins | telaviva.com.br | ✅ Confirmado |
| F-002 | ⬜ Info | cPanel/WHM expostos, Roundcube webmail | telaviva.com.br | ✅ Confirmado |
| F-003 | ⬜ Info | Pure-FTPd sem anonymous | telaviva.com.br | ✅ Confirmado |
| F-004 | ⬜ Info | Exim 4.99.5 — não é open relay | telaviva.com.br | ✅ Confirmado |
| F-005 | ⬜ Info | PowerDNS 4.9.16, Google MX, SPF configurado | telaviva.com.br | ✅ Confirmado |
| F-006 | 🟡 Média | OpenSSH 7.4 em porta 22022 (versão antiga) | telaviva.com.br | ✅ Confirmado |
| F-007 | ⬜ Info | Credencial admin:admin123 NÃO reusada em nenhum serviço | telaviva.com.br | ✅ Confirmado |
| F-008 | ⬜ Info | BunnyCDN pull zone configurado corretamente | telaviva.com.br | ✅ Confirmado |

## Estatísticas
- Subdomínios encontrados: 1 (apsv-iptv) + 89 wildcard + 8 (telaviva.com.br)
- Hosts vivos: 2 (apsv-iptv.duckdns.org, telaviva.com.br)
- Findings confirmados: 7 (2 críticas, 1 alta, 3 médias, 1 baixa)
- Acessos obtidos: 1 (JWT admin com role ADMIN)

## Timeline
Ver `timeline.log` para histórico completo.