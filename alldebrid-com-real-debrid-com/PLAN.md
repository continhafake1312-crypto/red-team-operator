# PLAN.md — Engagement: alldebrid-com-real-debrid-com

## Status do Engagement
- **Iniciado em**: 2026-08-22T17:00:00Z
- **Fase atual**: 4 — Enumeração profunda (iniciando)
- **Próxima fase**: 5 — Ataque WebApp

## Fases Planejadas

| Fase | Descrição | Especialista | Status | Artefato |
|------|-----------|--------------|--------|----------|
| 1 | Escopo + estrutura | Coordenador | ✅ Concluída | SCOPE.md, PLAN.md, REPORT.md, timeline.log |
| 2 | Recon passivo + OSINT | recon-passive | ✅ Concluída | recon/passive/PASSIVE.md (ambos) |
| 3 | Recon ativo | recon-active | ✅ Concluída | recon/active/ACTIVE.md |
| 4 | Consolidar attack surface | Coordenador | ✅ Concluída | recon/SUMMARY.md |
| 5 | Enumeração profunda | enum | 🔄 Em andamento | enum/ |
| 6 | Ataque WebApp | webapp | ⏳ Pendente | evidence/F-XXX.txt |
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

## Próximas Ações Imediatas (Enumeração Profunda)
1. **Conexão direta ao GitLab** — `gitlab.real-debrid.com` (94.140.4.19:443) **sem proxy** — testar registro, CI/CD, registry
2. **Credential testing WebDAV** — `dav.real-debrid.com` Basic Auth (wordlist + password spray)
3. **Análise API Documentation** — Baixar 11 páginas de docs, extrair endpoints Swagger/OpenAPI, testar tokens
4. **Bypass my.real-debrid.com 403** — Header manipulation, auth bypass, IDOR enumeration
5. **ASP.NET s18.alldebrid.com** — ViewState MAC validation, MachineKey exposure, deserialization gadgets
6. **dev.payments.alldebrid.com auth bypass** — Default creds, SQLi em Basic Auth, auth bypass
7. **Download CDN Token Analysis** — 403→200 flow reverse engineering, cache poisoning
8. **Postfix/Dovecot enum** — VRFY/EXPN user enumeration, open relay test, auth bypass
9. **Fastly/fcdn cache poisoning** — Varnish header injection, HTTP request smuggling

## Delegação Próxima: enum specialist
- Content discovery (ffuf) em todos os hosts vivos
- JS analysis (endpoints, secrets, API routes)
- Param mining
- API endpoints (Swagger/OpenAPI/GraphQL)
- CMS detection