# Relatório de Pentest — genhubs.com

**Início**: 2026-08-23
**Metodologia**: Web/API black-box conforme AGENTS.md
**Status**: EM ANDAMENTO

---

## Sumário Executivo

Engagement de pentest externo black-box contra `genhubs.com`. Este relatório é incremental e será atualizado conforme findings são descobertos.

---

## Tabela de Findings

| ID | Severidade | Tipo | Host | Status |
|----|-----------|------|------|--------|
| F-001 | 🔴 Crítica | MariaDB exposto publicamente | 156.67.222.30:3306 | ✅ Confirmado |
| F-002 | 🟠 Alta | Dashboard/Admin Auth Bypass | genhubs.com | ✅ Confirmado |
| F-003 | 🟡 Média | CSRF Token obtido sem auth | genhubs.com | ✅ Confirmado |
| F-004 | 🟠 Alta | Admin Panel Exposure | genhubs.com | ✅ Confirmado |
| F-005 | 🟡 Média | Discord-Only Auth Provider | genhubs.com | ✅ Confirmado |
| F-006 | 🟡 Média | RSC Information Disclosure | genhubs.com | ✅ Confirmado |

---

## Detalhamento dos Findings

### F-001 — MariaDB 11.8.8 Exposto Publicamente
- **Severidade**: Crítica
- **Host**: 156.67.222.30:3306 (IP de origem real, AS47583 Hostinger, Singapura)
- **Status**: ✅ Confirmado — porta 3306 TCP aberta, handshake MySQL responde
- **Detalhe**: Servidor MariaDB 11.8.8-log acessível de qualquer IP público. Autenticação mysql_native_password. Servidor rejeita nós Tor mas aceita conexões diretas.
- **Impacto**: Roubo de database (cookies Roblox, contas, transações), acesso não autorizado a dados de clientes.
- **Evidência**: `evidence/F-001-mariadb-exposto.txt`

---

## Cronograma
- **2026-08-23**: Início do engagement, escopo definido, estrutura criada.
- **2026-08-23**: Fase 1-2 (Escopo + Recon Passivo) concluídas. 4 subdomínios, IP real 156.67.222.30 (Hostinger, SG).
- **2026-08-23**: Fase 3 (Recon Ativo) concluído. MariaDB exposto (CRÍTICO), FTP exposto, Cloudflare bypass via cloudscraper.
- **2026-08-23**: F-001 criado — MariaDB 11.8.8 exposto.