# PLAN.md — BuscaPrime

## Meta
Teste de intrusão black-box completo em buscaprime.com.br

## Status Atual
**Fase Atual:** 6 — Ataque Webapp (login brute force, SQLi, fuzzing) concluído parcialmente

## Fases e Especialistas

| Fase | Especialista | Status | Observação |
|------|-------------|--------|-----------|
| 1. Escopo | — | ✅ Concluído | SCOPE.md criado |
| 2. Recon Passivo + OSINT | recon-passive + osint | ✅ Concluído | 12 subdomínios, API exposta, cPanel |
| 3. Recon Ativo | recon-active | ✅ Concluído | Servidor origem mapeado, port scan |
| 4. Consolidar Attack Surface | — | ✅ Concluído | SUMMARY.md com ranking de payoff |
| 5. Enumeração Profunda | enum | ✅ Concluído | Fuzzing no servidor origem |
| 6. Ataque Webapp | webapp | 🔄 Parcial | Login testado (SQLi, SSTI, brute force) |
| 7. CVE Research + Exploit | cve + exploit | 🔄 Pendente | gocache, openresty, Yampi CVEs |
| 8. Pós-Exploração | postex | ⏳ Pendente | Se foothold |
| 9. Relatório | report | 🔄 Em andamento | REPORT.md atualizado |

## Backlog de Vetores (caçada contínua §19)

### Ativos
- [ ] **VD-01**: Brute force no login (/auth/login) — Laravel CSRF protegido
- [ ] **VD-02**: SQLi no campo password (não validado como email) — testar com sqlmap
- [ ] **VD-03**: Cloudflare bypass — encontrar IP real de app/painel via shodan/censys
- [ ] **VD-04**: API /api/public/dataset/v3/people/basic — acessar via Cloudflare bypass
- [ ] **VD-05**: Metronic 7.0.5 CVEs — pesquisar vulnerabilidades conhecidas
- [ ] **VD-06**: cPanel (mail) — brute force FTP/IMAP, verificar MySQL público
- [ ] **VD-07**: gocache + openresty CVEs — pesquisar vulnerabilidades conhecidas
- [ ] **VD-08**: Yampi checkout — SSRF, IDOR em pedidos, manipulação de carrinho
- [ ] **VD-09**: /account/sales — endpoint potencialmente vulnerável (acessível sem auth)

### Pausados (motivo + gatilho de retorno)
- **Cloud buckets** — todos retornaram resposta vazia (Azure/S3 não configurados)
- **Wayback well-known** — todos 404 atualmente

### Exauridos
- Subdomínios (12 encontrados — todos mapeados)
- DNS zone transfer (fechado)
- Vhosts (servidor origem bloqueia vhosts não autorizados)

## Priorização de Payoff (§16)
| Rank | Alvo | Payoff | Status | Nota |
|------|------|--------|--------|------|
| 1 | seguro.buscaprime.com.br | 🔴 Crítico | 🔄 Em progresso | Servidor origem — login, SQLi, cPanel |
| 2 | API /api/public/dataset/... | 🔴 Crítico | 🔍 Cloudflare blocked | Precisa bypass CF |
| 3 | app.buscaprime.com.br | 🟠 Alto | 🔍 Cloudflare blocked | Metronic 7.0.5 CVEs |
| 4 | mail.buscaprime.com.br | 🟡 Médio | 🔍 Investigando | cPanel, FTP, MySQL |
| 5 | Yampi checkout | 🟡 Médio | 🔍 Investigando | IDOR, SSRF |

## Credenciais / Acessos Obtidos
(nenhum até o momento)

## Evidências
- F-001: Servidor origem exposto
- F-002: Login exposto
- F-003: API dados públicos
- F-004: Info empresa
- F-005: cPanel exposto
- F-006: Yampi tokens

---
**Última atualização:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")