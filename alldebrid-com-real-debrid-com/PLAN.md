# PLAN.md — Engagement: alldebrid-com-real-debrid-com

## Status do Engagement
- **Iniciado em**: 2026-08-22T17:00:00Z
- **Fase atual**: 3 — Recon ativo (iniciando)
- **Próxima fase**: 4 — Enumeração profunda

## Fases Planejadas

| Fase | Descrição | Especialista | Status | Artefato |
|------|-----------|--------------|--------|----------|
| 1 | Escopo + estrutura | Coordenador | ✅ Concluída | SCOPE.md, PLAN.md, REPORT.md, timeline.log |
| 2 | Recon passivo + OSINT | recon-passive | ✅ Concluída | recon/passive/PASSIVE.md (ambos) |
| 3 | Recon ativo | recon-active | 🔄 Em andamento | recon/active/ACTIVE.md |
| 4 | Consolidar attack surface | Coordenador | ✅ Concluída | recon/SUMMARY.md |
| 5 | Enumeração profunda | enum | ⏳ Pendente | enum/ |
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
- [x] Tech stack fingerprint — nginx, IIS/ASP.NET, LiteSpeed, Cloudflare+jQuery
- [ ] API endpoints discovery
- [ ] Auth bypass / default creds (dev.payments, myfiles, pad)
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
- [ ] API endpoints discovery (Swagger/OpenAPI em api.real-debrid.com)
- [ ] Auth bypass / default creds (dav WebDAV, my portal)
- [ ] IDOR/BOLA em endpoints de usuário
- [ ] SSRF via URL fetch
- [ ] XSS em parâmetros de busca/reflexão
- [ ] SSTI em templates
- [ ] File upload bypass
- [ ] JWT analysis
- [ ] GraphQL introspection
- [x] Cloud bucket takeover — 15 variações × 6 providers = 0 público
- [ ] WAF bypass (CDN77/Fastly) — IPs de origem conhecidos

## Vetores Pausados / Retry
- crt.sh rate limited (429/502) — retry posterior
- theHarvester falhou (dependência Python aiodns/pycares) — fix ou alternativa
- waybackurls tool issue — usado CDX API como fallback
- gitlab.real-debrid.com porta 443 fechada via proxy — conexão direta necessária
- Shodan/Censys queries não executadas (requer API keys)

## Findings Confirmados

| ID | Alvo | Severidade | Título | Status |
|----|------|------------|--------|--------|
| F-001 | alldebrid.com | **Crítica** | IP Real Exposto via mail.alldebrid.com (212.83.131.119) — Bypass Cloudflare | Confirmado |
| F-002 | alldebrid.com | **Alta** | Painéis Admin Históricos (/admin, /administration/phpmyadmin) em Wayback | Confirmado |
| F-003 | alldebrid.com | **Alta** | Portal Pagamento Staging com Basic Auth (dev.payments.alldebrid.com) | Confirmado |
| F-004 | alldebrid.com | **Média** | Stack ASP.NET (IIS/10.0) em s18.alldebrid.com e pay2 | Confirmado |
| F-005 | alldebrid.com | **Média** | Endpoints Legados API (/api.php, /api/index.php, /api/torrent.php) | Confirmado |
| F-006 | real-debrid.com | **Alta** | WebDAV com Basic Auth (dav.real-debrid.com) | Confirmado |
| F-007 | real-debrid.com | **Alta** | API Pública Documentada (11 hosts api*/app*) | Confirmado |
| F-008 | real-debrid.com | **Alta** | GitLab Interno (gitlab.real-debrid.com → 94.140.4.19) | Confirmado |
| F-009 | real-debrid.com | **Crítica** | PII em Wayback — Callbacks de Pagamento (BINs, valores, IDs transação) | Confirmado |
| F-010 | real-debrid.com | **Média** | Fastly CDN 503 (fcdn.real-debrid.com) — Cache Poisoning Potential | Confirmado |
| F-011 | real-debrid.com | **Baixa** | SPF SoftFail (~all) — Email Spoofing Possible | Confirmado |

## Próximas Ações Imediatas
1. **Delegar fase 3 (recon-active)**: Portscan massivo em TODOS os IPs de origem reais de ambos os alvos
2. Fingerprint de serviços nas portas abertas
3. VHost enumeration nos IPs de origem (bypass CDN)
4. WAF detection (wafw00f)
5. TLS analysis
6. Teste direto nos findings CRÍTICOS/ALTOS validados