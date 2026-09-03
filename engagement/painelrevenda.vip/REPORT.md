# RELATÓRIO DE PENTEST — painelrevenda.vip

## Metadados
- **Alvo:** painelrevenda.vip (Elite IPTV — Revenda IPTV)
- **IP:** 186.194.52.218
- **Início:** 2026-09-03T04:50:00Z
- **Término:** Em andamento
- **Tipo:** Black-box externo
- **Classificação:** Confidencial

## Sumário Executivo
Teste de penetração black-box na plataforma de revenda IPTV "Elite IPTV". O objetivo é identificar vulnerabilidades que possam comprometer a confidencialidade, integridade ou disponibilidade dos sistemas, com foco em acesso administrativo ao painel de revenda, dados financeiros (PIX) e PII de clientes/revendedores.

### Descobertas da Fase de Exploração de Rede (network specialist)
O servidor 186.194.52.218 expõe **8 portas de serviços** diretamente na internet, incluindo **MySQL (3306) — extremamente crítico**. Embora nenhuma credencial padrão tenha funcionado, a simples exposição do banco de dados de produção na internet é uma falha grave de segurança. Múltiplos serviços de email (Exim, Dovecot) e FTP também estão expostos, expandindo a superfície de ataque. O Cloudflare protege o tráfego HTTP/HTTPS mas não os demais serviços.

## Findings (Incremental)

| ID | Severidade | Título | Status |
|----|-----------|--------|--------|
| F-001 | 🔴 CRÍTICA | MySQL (MariaDB 10.11.17) publicamente exposto | ✅ Confirmado |
| F-002 | 🟠 ALTA | FTP (ProFTPD) publicamente exposto | ✅ Confirmado |
| F-005 | 🟠 ALTA | Múltiplos serviços sensíveis expostos (8 portas) | ✅ Confirmado |
| F-003 | 🟡 MÉDIA | Exim 4.99.5 SMTP exposto com VRFY | ✅ Confirmado |
| F-004 | 🟡 MÉDIA | Dovecot IMAP/POP3 exposto | ✅ Confirmado |
| F-006 | 🟡 MÉDIA | Subdomain takeover candidate (smmbrasil.net) | ✅ Confirmado |
| F-007 | 🔵 BAIXA | Roundcube Webmail protegido por Cloudflare | ⏳ Parcial |

## Attack Surface Consolidada

### Serviços Expostos (186.194.52.218)
| Porta | Serviço | Versão | Risco | Status Auth |
|-------|---------|--------|-------|-------------|
| 21/tcp | ProFTPD | (desconhecida) | 🟠 ALTO | ❌ Nenhuma credencial |
| 25/tcp | Exim SMTP | 4.99.5 | 🟡 MÉDIO | N/A (relay) |
| 80/tcp | OpenResty HTTP | 1.31.1.1 | 🟢 NORMAL | N/A |
| 110/tcp | Dovecot POP3 | DA (DirectAdmin) | 🟡 MÉDIO | ❌ admin:admin falhou |
| 143/tcp | Dovecot IMAP | DA (DirectAdmin) | 🟡 MÉDIO | ❌ admin:admin falhou |
| 443/tcp | OpenResty HTTPS | 1.31.1.1 | 🟢 NORMAL | N/A (Cloudflare) |
| 587/tcp | Exim Submission | 4.99.5 | 🟡 MÉDIO | N/A |
| 993/tcp | Dovecot IMAPS | DA (DirectAdmin) | 🟡 MÉDIO | ❌ admin:admin falhou |
| 3306/tcp | **MariaDB MySQL** | **10.11.17-cll-lve-log** | **🔴 CRÍTICO** | **❌ 28 combos falharam** |

## Acessos Obtidos
*Nenhum acesso obtido até o momento.*

### Tentativas realizadas:
1. **MySQL (3306)**: 28 combinações de credenciais comuns testadas — todas falharam
2. **FTP (21)**: 8 combinações testadas + anonymous — todas falharam
3. **IMAPS (993)**: admin:admin — autenticação falhou
4. **POP3S (995)**: admin:admin — autenticação falhou
5. **CVE-2012-2122**: ~300 tentativas — MariaDB 10.11.17 não é vulnerável

## Cronologia
- **2026-09-03T04:50:00Z** — Início do engagement
- **2026-09-03T04:50:00Z** — Criação da estrutura e SCOPE.md/PLAN.md/REPORT.md
- **2026-09-03T04:51:00Z** — Fase 2: Recon passivo concluído (subdomínios, DNS, tech stack, OSINT)
- **2026-09-03T04:58:00Z** — Fase 3: Recon ativo concluído (portscan, vhosts, CF bypass, TLS)
- **2026-09-03T04:59:00Z** — Fase network: serviços expostos mapeados e testados
- **2026-09-03T04:59:00Z** — F-001: MySQL (MariaDB 10.11.17) confirmado exposto
- **2026-09-03T04:59:00Z** — F-002: ProFTPD confirmado exposto, anonymous negado
- **2026-09-03T04:59:00Z** — F-004: Dovecot DA confirmado (IMAP/POP3)
- **2026-09-03T04:59:00Z** — F-003: Exim 4.99.5 confirmado, VRFY aceito
- **2026-09-03T04:59:00Z** — F-005: Scan completo de portas (22 serviços testados)
- **2026-09-03T04:59:00Z** — F-006: Takeover candidate smmbrasil.net verificado
- **2026-09-03T04:59:00Z** — F-007: Roundcube protegido por Cloudflare
- **2026-09-03T04:59:00Z** — Fase de exploração de rede concluída