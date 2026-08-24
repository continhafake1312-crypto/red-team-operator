# PLAN — marketroblox.store

## Plano de Execução

### Fases

| # | Fase | Especialista | Status | Observações |
|---|------|-------------|--------|-------------|
| 1 | Escopo | Coordenador | ✅ Feito | SCOPE.md criado |
| 2 | Recon Passivo + OSINT | recon-passive | ✅ Feito | 26 subdomínios, 5 vivos, PHP 7.4.33, cPanel 200, /.env 403 |
| 3 | Recon Ativo | recon-active | ✅ Feito | LiteSpeed detectado, Cloudflare WAF, /.env e /.git 403 confirmados, cPanel 200. IP real não descoberto |
| 4 | Consolidar Attack Surface | Coordenador | ⏳ Pendente | SUMMARY.md com ranking de payoff |
| 5 | Enumeração Profunda | enum | ✅ Feito | API endpoints mapeados, API key obtida, buy creds leak, Order IDOR, cPanel 2083, Registro aberto |
| 6 | Ataque Webapp | webapp | ✅ Feito | 6 findings (F-001 a F-006): composer exposto, PHPMailer CVE-2024-33572 CRÍTICO, PHP EOL, Guzzle CRLF, headers ausentes, FB SDK EOL |
| 7 | CVE Research | cve | 🔄 Em andamento | PHPMailer CVE-2024-33572, Guzzle CVE-2022-29248 |
| 8 | Exploit Validation | exploit | 🔄 Em andamento | Validar PHPMailer RCE via contact/register/forgot-password |
| 9 | Pós-Exploração | postex | ⏳ Pendente | Se foothold obtido |
| 10 | Relatório Final | report | ⏳ Pendente | REPORT.md completo |

### Backlog de Vetores (Caçada Contínua §19)

| # | Vetor | Status | Motivo Pausa | Gatilho Retorno |
|---|-------|--------|-------------|-----------------|
| 1 | Subdomínios e DNS | ✅ Em execução | — | — |
| 2 | Wayback endpoints | ⏳ Pendente | Aguarda recon passivo | Quando PASSIVE.md pronto |
| 3 | Bypass Cloudflare (IP real) | ⏳ Pendente | Aguarda recon passivo | Quando subdomínios mapeados |
| 4 | Content discovery (ffuf) | ⏳ Pendente | Aguarda recon ativo | Quando ACTIVE.md pronto |
| 5 | JS analysis | ⏳ Pendente | Aguarda enum | Quando SUMMARY.md pronto |
| 6 | Default creds em painéis | ⏳ Pendente | Aguarda enum | Quando endpoints descobertos |
| 7 | SQLi/NoSQLi/SSTI | ⏳ Pendente | Aguarda enum | Quando candidates identificados |
| 8 | IDOR/BOLA | ⏳ Pendente | Aguarda webapp | Quando APIs mapeadas |
| 9 | CVE por versão | ⏳ Pendente | Aguarda fingerprint | Quando versões conhecidas |
| 10 | Cloud buckets | ⏳ Pendente | Aguarda recon passivo | Quando naming patterns |