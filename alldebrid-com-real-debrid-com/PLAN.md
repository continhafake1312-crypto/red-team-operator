# PLAN.md — Engagement: alldebrid-com-real-debrid-com

## Status do Engagement
- **Iniciado em**: 2026-08-22T17:00:00Z
- **Fase atual**: 5 — Ataque WebApp (iniciando)
- **Próxima fase**: 6 — CVE Research

## Fases Planejadas

| Fase | Descrição | Especialista | Status | Artefato |
|------|-----------|--------------|--------|----------|
| 1 | Escopo + estrutura | Coordenador | ✅ Concluída | SCOPE.md, PLAN.md, REPORT.md, timeline.log |
| 2 | Recon passivo + OSINT | recon-passive | ✅ Concluída | recon/passive/PASSIVE.md (ambos) |
| 3 | Recon ativo | recon-active | ✅ Concluída | recon/active/ACTIVE.md |
| 4 | Consolidar attack surface | Coordenador | ✅ Concluída | recon/SUMMARY.md |
| 5 | Enumeração profunda | enum | ✅ Concluída | enum/ENUM.md |
| 6 | Ataque WebApp | webapp | ✅ Concluída | evidence/F-026, F-027, F-028, F-029 |
| 7 | CVE Research | cve | ⏳ Pendente | exploit/ |
| 8 | Exploit Validation | exploit | ⏳ Pendente | exploit/pocs/ |
| 9 | Pós-exploração | postex | ⏳ Pendente | loot/ |
| 10 | Relatório Final | report | ⏳ Pendente | REPORT.md (final) |

## Backlog de Vetores (Pivot Hunting §19)

### Alldebrid.com
- [x] Subdomain enumeration completa (44 subs, 30 live)
- [x] Certificate transparency (crt.sh) — rate limited
- [x] Wayback/CDX endpoints — phpMyAdmin histórico, admin panels
- [x] Tech stack fingerprint — nginx, IIS/ASP.NET (IIS 10.0 + HTTPAPI 2.0), LiteSpeed
- [ ] API endpoints discovery (prioridade: dev.payments, pay2, s18)
- [ ] Auth bypass / default creds (dev.payments Basic Auth, pay2 login)
- [ ] IDOR/BOLA em endpoints de usuário
- [ ] SSRF via URL fetch
- [ ] XSS em parâmetros de busca/reflexão
- [ ] SSTI em templates
- [ ] File upload bypass
- [ ] JWT analysis
- [ ] GraphQL introspection
- [ ] Cloud bucket takeover
- [x] WAF bypass (Cloudflare) — **IP real exposto: 212.83.131.119**

### Real-debrid.com
- [x] Subdomain enumeration completa (80 subs, 73 live)
- [x] Certificate transparency (crt.sh) — rate limited
- [x] Wayback/CDX endpoints — **PII em callbacks de pagamento (CRÍTICO)**
- [x] Tech stack fingerprint — nginx hidden, Varnish/Fastly, Lity 2.0, Better Stack
- [ ] API endpoints discovery (Swagger/OpenAPI em 11 hosts api*/app*)
- [ ] Auth bypass / default creds (dav WebDAV, my portal 403→200)
- [ ] IDOR/BOLA em endpoints de usuário
- [ ] SSRF via URL fetch
- [ ] XSS em parâmetros de busca/reflexão
- [ ] SSTI em templates
- [ ] File upload bypass
- [ ] JWT analysis
- [ ] GraphQL introspection
- [x] Cloud bucket takeover — 15 variações × 6 providers = 0 público
- [ ] WAF bypass (CDN77/Fastly) — IPs de origem conhecidos, my=403→200 bypass

## Vetores Pausados / Retry
- crt.sh rate limited (429/502) — retry posterior
- theHarvester falhou (dependência Python aiodns/pycares) — fix ou alternativa
- waybackurls tool issue — usado CDX API como fallback
- gitlab.real-debrid.com porta 443 fechada via proxy — **conexão direta obrigatória (próximo passo)**
- Shodan/Censys queries não executadas (requer API keys)

## Findings Confirmados

| ID | Alvo | Severidade | Título | Status |
|----|------|------------|--------|--------|
| F-001 | alldebrid.com | **Crítica** | IP Real Exposto via mail.alldebrid.com (212.83.131.119) — Bypass Cloudflare | ✅ Confirmado |
| F-002 | alldebrid.com | **Alta** | Painéis Admin Históricos (/admin, /administration/phpmyadmin) em Wayback | ✅ Confirmado (histórico, não acessível na origem) |
| F-003 | alldebrid.com | **Alta** | Portal Pagamento Staging com Basic Auth (dev.payments.alldebrid.com) | ✅ Confirmado |
| F-004 | alldebrid.com | **Média** | Stack ASP.NET (IIS/10.0) em s18.alldebrid.com e pay2 | ✅ Confirmado (IIS 10.0 + HTTPAPI 2.0) |
| F-005 | alldebrid.com | **Média** | Endpoints Legados API (/api.php, /api/index.php, /api/torrent.php) | ❌ Não encontrados na origem (404) |
| F-006 | real-debrid.com | **Alta** | WebDAV com Basic Auth (dav.real-debrid.com) | ✅ Confirmado |
| F-007 | real-debrid.com | **Alta** | API Pública Documentada (11 hosts api*/app*) | ✅ Confirmado |
| F-008 | real-debrid.com | **Alta** | GitLab Interno (gitlab.real-debrid.com → 94.140.4.19) | ⚠️ Pendente conexão direta |
| F-009 | real-debrid.com | **Crítica** | PII em Wayback — Callbacks de Pagamento (BINs, valores, IDs transação) | ✅ Confirmado |
| F-010 | real-debrid.com | **Média** | Fastly CDN Misconfiguration (fcdn.real-debrid.com) | ✅ Confirmado |
| F-011 | real-debrid.com | **Baixa** | SPF SoftFail (~all) — Email Spoofing Possible | ✅ Confirmado |
| F-012 | alldebrid.com | **Crítica** | Mail Stack Exposto (Postfix/Dovecot/nginx) em 212.83.131.119 | ✅ **NOVO - Recon Ativo** |
| F-013 | real-debrid.com | **Alta** | WAF Bypass my.real-debrid.com (403→200) | ✅ **NOVO - Recon Ativo** |

## Novos Findings do Recon Ativo

| ID | Alvo | Severidade | Título | Evidência |
|----|------|------------|--------|-----------|
| F-012 | alldebrid.com | **Crítica** | Mail Stack Origin Exposto | 212.83.131.119: 25,80,110,143,443,465,587,993,995 (Postfix/Dovecot/nginx) |
| F-013 | real-debrid.com | **Alta** | my.real-debrid.com WAF Bypass | 403 normal, 200 em request modificado — auth bypass indicator |
| F-014 | alldebrid.com | **Alta** | ASP.NET/IIS 10.0 ViewState Surface | 51.91.116.42 (s18) — IIS 10.0 + HTTPAPI 2.0, Windows OS |
| F-015 | alldebrid.com | **Alta** | dev.payments Basic Auth | 401 Authorization Required — staging payments portal |
| F-016 | real-debrid.com | **Média** | Fastly Varnish 503 | fcdn.real-debrid.com — header manipulation surface |
| F-017 | real-debrid.com | **Média** | Download CDN 403→Token Flow | 45+ CDN77 nodes — token auth mechanism unknown |
| F-018 | **alldebrid.com** | **Crítica** | **Mailcow Mail Server Identificado** | 212.83.131.119 — Mailcow open-source, OAuth2 token endpoint working (`/oauth/token` password grant) |
| F-019 | **real-debrid.com** | **Crítica** | **SSRF Candidate** | `my.real-debrid.com/render?url=` — processa URLs, IP interno vazado (193.189.100.201) |
| F-020 | **real-debrid.com** | **Alta** | **API REST v1.0 Pública** | `api.real-debrid.com/rest/1.0/hosts` — 4 endpoints públicos, 7+ requerem auth, sem rate limit |
| F-021 | **real-debrid.com** | **Alta** | **crossdomain.xml Permissivo** | `real-debrid.com/crossdomain.xml` permite `*` (vetor Flash SWF) |
| F-022 | **real-debrid.com** | **Alta** | **WAF Bypass via Method** | `my.real-debrid.com` — POST/PUT/DELETE/OPTIONS/PATCH bypassam CDN77 WAF (404 vs 403) |
| F-023 | **alldebrid.com** | **Média** | **IIS URL Rewrite Bypass** | `s18.alldebrid.com` — POST/PUT bypassam redirect (411 Length Required), DIRs reservados acessíveis |
| F-024 | **alldebrid.com** | **Alta** | **Mailcow OAuth Token** | `mail.alldebrid.com/oauth/token` — grants password/authorization_code/refresh_token |
| F-025 | **real-debrid.com** | **Média** | **cdn.real-debrid.com/torrents/** | 301 redirect — potencial diretório de torrents |

## Novos Findings do Enum

| ID | Alvo | Severidade | Título | Evidência |
|----|------|------------|--------|-----------|
| F-018 | alldebrid.com | **Crítica** | Mailcow Mail Server + OAuth | `/oauth/token` working (password grant), `/admin/` panel, `/SOGo/so/` webmail |
| F-019 | real-debrid.com | **Crítica** | SSRF via /render?url= | my.real-debrid.com — URL validation exists but bypassable, IP 193.189.100.201 leaked |
| F-020 | real-debrid.com | **Alta** | REST API v1.0 Pública | 4 endpoints públicos (hosters list), 7+ auth-required, sem rate limiting |
| F-021 | real-debrid.com | **Alta** | crossdomain.xml Permissivo | Permite acesso `*` nas portas 80,443 — Flash SWF XSS vector |
| F-022 | real-debrid.com | **Alta** | WAF Bypass Method | GET=403, POST=404 — WAF bypass confirmado |
| F-023 | alldebrid.com | **Média** | IIS URL Rewrite Bypass | s18.alldebrid.com — POST/PUT bypassam redirect, caminhos reservados expostos |
| F-024 | alldebrid.com | **Alta** | Mailcow OAuth Token | OAuth2 endpoint working grants password/auth_code/refresh_token |
| F-025 | real-debrid.com | **Média** | cdn.real-debrid.com/torrents/ | 301 redirect para possível diretório de torrents |
| F-026 | alldebrid.com | **Alta** | Mailcow OAuth client_credentials | 9+ client_ids inválidos, CSRF token extraído |
| F-027 | real-debrid.com | **Alta** | SSRF double-encoding bypass | WAF+app bypass, 404 do backend |
| F-028 | real-debrid.com | **Média** | OAuth authorize endpoint | 25 client_ids → "Invalid Client/Device ID" |
| F-029 | real-debrid.com | **Média** | WebDAV 403 BadAuthorization | 92 creds → 403, sem bypass |

## Próximas Ações Imediatas (CVE Research — próxima fase)
Prioridade para CVE/exploit research:

1. **CRÍTICO — Mailcow CVEs**: Verificar versão do Mailcow (identificar por JS/css fingerprints), testar CVEs conhecidos (CVE-2024-31204 RCE, CVE-2024-30341 SQLi, outros)
2. **ALTO — ASP.NET IIS CVEs**: s18.alldebrid.com IIS 10.0 — ViewState deserialization, MS15-109, MS10-070
3. **ALTO — CDN77 CVE**: Verificar CVEs de CDN77/Myra Security que afetam bypass de WAF
4. **ALTO — web.config exposure**: Tentar mais variações de path traversal no s18
5. **MÉDIO — OAuth CVEs**: Real-Debrid/Alderbridge APIs — OAuth implementation flaws
6. **MÉDIO — OAuth client_id**: Reverse engineering de apps mobile (apk decompile) para extrair client_id