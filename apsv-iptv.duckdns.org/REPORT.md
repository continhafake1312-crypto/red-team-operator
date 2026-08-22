# REPORT — apsv-iptv.duckdns.org

## Resumo Executivo
Pentest Web/API black-box contra `apsv-iptv.duckdns.org` (TelaViva IPTV).
**Status: CRÍTICO — Acesso Admin total obtido via default credentials.**

## Acessos Obtidos
- **Admin JWT**: `admin:admin123` → role `ADMIN`, 999 max connections, sem expiração de assinatura
- **Refresh Token**: Válido e funcional
- **Dashboard Admin**: Acesso a /admin/dashboard + /api/admin/dashboard
- **Usuários**: Lista completa (4 usuários: admin, paulinha, felipe, revendedor)
- **Canais**: 487 canais (catálogo completo + stream URLs)
- **VOD**: Catálogo de filmes/séries com sources de terceiros
- **EPG**: Guia de programação completo
- **Config**: Sistema completo de configurações (incluindo chaves secretas)

## Tabela de Findings

| ID | Severidade | Tipo | Host | Status |
|----|-----------|------|------|--------|
| F-001 | 🔴 CRÍTICA | Default Credentials | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-002 | 🔴 CRÍTICA | Config Disclosure | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-007 | 🟠 ALTA | Admin Routes Exposed | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-003 | 🟡 MÉDIA | Public Channel List | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-004 | 🟡 MÉDIA | CORS Wildcard | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-005 | 🟡 MÉDIA | Log Disclosure | apsv-iptv.duckdns.org | ✅ Confirmado |
| F-006 | ⬜ BAIXA | Weak Rate Limiting | apsv-iptv.duckdns.org | ✅ Confirmado |

## Ataques Realizados (sem sucesso)
- `alg=none` / `alg=None` / `alg=NONE` — Rejeitados
- JWT secret brute (20+ common secrets) — Não quebrado
- `x-middleware-subrequest: true` (CVE-2025-29927) — Não funcionou
- KID injection (path traversal, SQLi) — Rejeitados
- NoSQLi no login — Rejeitado (validação de schema)
- SSTI/Command injection — Rejeitados
- IDOR em `/api/users/{username}` — Não encontrado (precisa UUID)
- Auth bypass (X-Forwarded-For, params, method override) — Rejeitados
- Registro de usuário — Desabilitado (REGISTRATION_ENABLED=false)

## Chaves Expostas (rotacionar URGENTE)
1. **RESEND_API_KEY**: `re_hLbDh5BD_G9coRPt9agoCBDgDMTFTKXkt` — Email API
2. **TURNSTILE_SECRET_KEY**: `0x4AAAAAAERQpJIYAwZ4vTdmiwJ9DmTrOhA` — Cloudflare Turnstile
3. **TMDB_API_KEY**: JWT (`eyJhbGciOiJIUzI1NiJ9...`) — TMDB Movie DB
4. **POSTHOG_KEY**: `phx_J2HyNsLEdrCG7pGwBETi9sX2ig2UjqMeStWQkbCvEnJkY9mk` — Analytics

## Usuários Encontrados
| Username | Role | Email | Status |
|----------|------|-------|--------|
| admin | ADMIN | admin@telaviva.local | ACTIVE |
| paulinha | ADMIN | paulinha.telaviva@gmail.com | ACTIVE |
| felipe | ADMIN | josephfelipegusmao09@gmail.com | ACTIVE |
| revendedor | RESELLER | joao@revenda.com | ACTIVE |

## Timeline
Ver `timeline.log` para histórico completo.

## Estatísticas
- Subdomínios encontrados: 0
- Hosts vivos: 1 (apsv-iptv), 1 (telaviva.com.br - WordPress)
- Findings: 7 (2 Críticas, 1 Alta, 3 Médias, 1 Baixa)
- Acessos obtidos: Admin JWT + 4 contas de usuário + 3 user sessions com refresh tokens
- Dados acessados: 487 canais, VOD, EPG, config, logs, payments, users