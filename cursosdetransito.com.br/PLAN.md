# PLAN.md — cursosdetransito.com.br

## Status do Engagement
- **Início**: 2026-09-13T20:12:00Z
- **Fase atual**: 3 — Recon Ativo + 5 — Enumeração
- **Modo**: Autônomo

## Fases (ordem adaptativa)
| # | Fase | Status | Especialista | Observação |
|---|------|--------|-------------|------------|
| 1 | Escopo | ✅ | pentest | Estrutura criada |
| 2 | Recon Passivo + OSINT | ✅ | recon-passive, osint | Subdomínios, DNS, wayback, cert.sh, whois completos |
| 3 | Recon Ativo | 🔄 EM PROGRESSO | recon-active | Scan AWS ELB IPs |
| 4 | Consolidar Attack Surface | ✅ | pentest | SUMMARY.md criado |
| 5 | Enumeração Profunda | ⏳ | enum | Pendente — iniciar scan feroxbuster/gobuster |
| 6 | Ataque Webapp | ⏳ | webapp | Pendente — prioritário: WooCommerce API, SQLi, auth bypass |
| 7 | CVE Research | ⏳ | cve | Pendente — Elementor 3.29.2, FluentForm 6.0.3, Apache 2.4.58 |
| 8 | Exploit | ⏳ | exploit | Se aplicável |
| 9 | Pós-Exploração | ⏳ | postex | Se foothold |
| 10 | Relatório | ⏳ | report | Ao final |

## Backlog de Vetores (caçada contínua §19)
| # | Vetor | Prioridade | Status | Gatilho |
|---|-------|-----------|--------|---------|
| 1 | WooCommerce REST API — testar endpoints sem auth (produtos, pedidos, clientes) | 🔴 CRÍTICA | ⏳ | Próximo passo |
| 2 | WordPress REST API — brute force users (suporte, ibac-dev, dev_alisson) | 🔴 CRÍTICA | ⏳ | Próximo passo |
| 3 | FluentForm / FluentCRM — testar endpoints de formulário e dados | 🟠 ALTA | ⏳ | Próximo passo |
| 4 | Directory listing /wp-content/uploads/ — buscar arquivos sensíveis | 🟠 ALTA | ⏳ | Próximo passo |
| 5 | /certificados/ + /certificados/validar.php — testar injeção | 🟠 ALTA | ⏳ | Próximo passo |
| 6 | CVE Research — Elementor 3.29.2, Apache 2.4.58, FluentForm 6.0.3 | 🟠 ALTA | ⏳ | Próximo passo |
| 7 | wp-file-manager-pro — buscar vulnerabilidades | 🟡 MÉDIA | ⏳ | Após enum |
| 8 | Default creds (wp-admin, painel, certificados) | 🟡 MÉDIA | ⏳ | Após enum |
| 9 | SQLi em parâmetros GET/POST (via gau) | 🟡 MÉDIA | ⏳ | Após enum |
| 10 | Subdominios vivos — scan de portas AWS ELBs | 🟡 MÉDIA | ⏳ | Em progresso |