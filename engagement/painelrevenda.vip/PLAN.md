# PLAN.md — painelrevenda.vip (Atualizado)

## Ranking de Payoff Atual (2026-09-03)

| # | Prioridade | Vetor | Payoff | Status |
|---|------------|-------|--------|--------|
| **P0** | 🔴 IMMEDIATE | **MariaDB 10.11.17** (3306) | Acesso total ao banco de dados | ✅ Testado (28 combos, CVE-2012-2122) ❌ Falhou |
| **P1** | 🔴 CRITICAL | **Exim 4.99.5** (25/587) | RCE remoto potencial | ⬇️ CVE research pendente |
| **P2** | 🔴 CRITICAL | **ProFTPD** (21) | Acesso a arquivos do servidor | ✅ Testado (anonymous + 8 combos) ❌ Falhou |
| **P3** | 🟠 HIGH | **Enumeração Web** — admin panel, API, endpoints | Acesso ao painel | ⬇️ Pendente |
| **P4** | 🟠 HIGH | **Roundcube** — cred-stuffing, CVEs | Acesso a webmails | 🔵 Bloqueado por Cloudflare |
| **P5** | 🟠 HIGH | **CVE Exploit** — Exim, MariaDB, ProFTPD, Dovecot | RCE/info disclosure | ⬇️ Pendente |
| **P6** | 🟡 MEDIUM | **Dovecot** brute-force | Acesso caixas postais | ✅ Testado ❌ Falhou |
| **P7** | 🟡 MEDIUM | **Cloudflare bypass + Webapp** | Acesso ao painel admin | ⬇️ Pendente |
| **P8** | 🟡 MEDIUM | **Subdomain takeover** smmbrasil.net | Sequestro de subdomínio | 🔍 Verificado, não confirmado |
| **P9** | 🟡 MEDIUM | **SNMP** (161/udp) info disclosure | Info do sistema | ⬇️ Pendente |
| **P10** | 🟢 LOW | **Domínios relacionados** (smartplay.club, etc.) | Attack surface expandida | 🔍 Parcial |

## Fases

### ✅ Fase 1: Escopo (CONCLUÍDO)
- [x] SCOPE.md criado
- [x] Estrutura de pastas criada

### ✅ Fase 2: Recon Passivo + OSINT (CONCLUÍDO)
- [x] Subdomínios: 27 encontrados, 8 vivos
- [x] DNS completo, tech stack, wayback
- [x] OSINT: emails, pessoas, contatos
- [x] Cloud buckets: nenhum público
- [x] Subdomain takeover candidate: smmbrasil.net
- [x] Domínios relacionados: eliteiptv.one, revendaiptv.pro, iptvrevenda.org, smartplay.club

### ✅ Fase 3: Recon Ativo (CONCLUÍDO)
- [x] Port scan: 10 portas TCP, 5 UDP
- [x] Versões: MariaDB 10.11.17, Exim 4.99.5, OpenResty 1.31.1.1
- [x] Vhosts: 7 confirmados
- [x] Cloudflare bypass: ✅ Funciona (intermitente)
- [x] TLS: Let's Encrypt, sem vulnerabilidades
- [x] SNMP detectado (161/udp)

### ✅ Fase 4: Attack Surface Consolidada (CONCLUÍDO)
- [x] SUMMARY.md com ranking de payoff

### 🔄 Fase 5: Enumeração Profunda (EM ANDAMENTO)
- [ ] Content discovery (ffuf) — admin, api, login, dashboard
- [ ] JS analysis — endpoints, tokens, API routes
- [ ] Param mining
- [ ] API endpoints (Swagger/GraphQL)
- [ ] Enumeração dos domínios relacionados

### 🔄 Fase 6: CVE Research (EM ANDAMENTO)
- [ ] Exim 4.99.5 CVEs
- [ ] MariaDB 10.11.17 CVEs
- [ ] ProFTPD CVEs
- [ ] Roundcube CVEs
- [ ] LiteSpeed/OpenResty CVEs

### ⬜ Fase 7: Ataque Webapp (PENDENTE)
- [ ] Auth bypass / default creds no painel
- [ ] IDOR/BOLA em APIs
- [ ] SQLi/NoSQLi
- [ ] JWT analysis
- [ ] SSRF, XSS, Upload

### ⬜ Fase 8: Exploit Validation (PENDENTE)
- [ ] Validar PoCs de CVEs aplicáveis
- [ ] Se acesso: postex

### ⬜ Fase 9: Relatório Final (PENDENTE)
- [ ] REPORT.md completo
- [ ] timeline.log final
- [ ] commit + push final

## Backlog de Vetores (Caçada Contínua §19)

| Vetor | Status | Motivo Pausa | Gatilho Retorno |
|-------|--------|--------------|-----------------|
| MariaDB brute-force rockyou | ⏸️ PAUSADO | 28 combos falharam, rate-limit | Se encontrar user/senha válido via OSINT |
| FTP brute-force | ⏸️ PAUSADO | 8 combos falharam | Se encontrar credencial válida |
| MySQL CVE-2012-2122 | ❌ FECHADO | MariaDB 10.x não vulnerável | N/A |
| Cloudflare bypass | 🔄 ATIVO | Bypass funciona intermitente | Rotação Tor IP |
| Roundcube cred-stuffing | ⏸️ PAUSADO | Bloqueado por Cloudflare | Se bypass Cloudflare persistente |
| SNMP community | ⬇️ PENDENTE | — | Iniciar scan |
| smartplay.club (app/player/revenda) | ⬇️ PENDENTE | — | Iniciar enumeração |
| Subdomain takeover | ⏸️ PAUSADO | CNAME ativo, não confirmado | Se CNAME expirar |
| Admin panel discovery | 🔄 ATIVO | Fuzzing pendente | Iniciar ffuf |