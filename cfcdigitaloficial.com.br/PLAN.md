# PLAN.md — cfcdigitaloficial.com.br

## Status Atual
- **Fase:** 5/9 — Enumeração Profunda (EM ANDAMENTO) + Ataque Webapp (AGENDADO)
- **Progresso:** ✅ Fase 1 (Escopo) → ✅ Fase 2 (Recon Passivo) → ✅ Fase 3 (Recon Ativo + Takeover) → ✅ Fase 4 (CVE Research) → 🔄 Fase 5 (Enum Profunda)

## Ranking de Payoff (Atualizado — 18:20 UTC)

| # | Vetor | Prioridade | Status | Payoff |
|---|-------|-----------|--------|--------|
| 1 | **File Manager RCE** (CVE-2020-25213) | 🔴 **CRÍTICA** | ⏳ Pendente de bypass | RCE shell |
| 2 | **cPanel/WHM/Webmail** (creds defaults) | 🔴 **CRÍTICA** | ⏳ Pendente | Acesso total hospedagem |
| 3 | **WordPress Admin** (user "Rafael" conhecido) | 🔴 **ALTA** | ⏳ Pendente | Acesso admin WP |
| 4 | **FTP Anonymous** (Pure-FTPd) | 🔴 **ALTA** | ⏳ Pendente (Tor limitando) | Acesso a arquivos |
| 5 | **MySQL externo** (3306) | 🟡 **ALTA** | ⏳ Pendente | Dados do site |
| 6 | **Subdomain Takeover** (pixel) | 🔴 **ALTA** | ✅ Confirmado | Controle subdomínio |
| 7 | **LiteSpeed Auth Bypass** (CVE-2024-28000/44000) | 🟡 **MÉDIA** | ⏳ Identificar versão | Bypass auth |
| 8 | **MetForm Info Disclosure** (CVE-2022-1442) | 🟡 **MÉDIA** | ⏳ Pendente | PII clientes |
| 9 | **Elementor Pro SVG Upload** (CVE-2024-1521) | 🟡 **MÉDIA** | ⏳ Pendente | XSS persistente |
| 10 | **Email Spoofing** (SPF ~all) | 🟡 **MÉDIA** | ✅ Confirmado | Phishing |
| 11 | **ModSecurity Bypass** | 🟡 **MÉDIA** | ✅ Confirmado | Acesso endpoints |
| 12 | **SMTP Exim 4.100** → CVEs | 🟡 **MÉDIA** | ⏳ Pendente | Exploit SMTP |
| 13 | **BIND 9.16.23** → CVEs | 🟢 **BAIXA** | ⏳ Pendente | DNS exploit |
| 14 | **Astra 4.9.0** desatualizado | 🟢 **BAIXA** | ✅ Confirmado | CVEs tema |
| 15 | **Tor IPs em RBL** | 🟢 **BAIXA** | ✅ Confirmado | Bloqueio |

## Backlog de Vetores

### Ativos
| # | Vetor | Prioridade | Status | Observação |
|---|-------|-----------|--------|------------|
| V1 | Enumeração Profunda (content discovery, ffuf, JS) | 🟡 Média | 🔄 Subagente general-5 | Rodando 8 turns |
| V2 | Brute force wp-admin (user rafael) | 🔴 Alta | ⏳ Após enum | |
| V3 | Brute force cPanel (creds comuns) | 🔴 Alta | ⏳ Após enum | |
| V4 | FTP Anonymous (via proxy alternativo) | 🔴 Alta | ⏳ Após enum | |
| V5 | File Manager bypass ModSecurity | 🔴 Alta | ⏳ Após enum | |
| V6 | SQLi em formulários Elementor/MetForm | 🟡 Média | ⏳ Após enum | |
| V7 | IDOR em wp-json/elementor/* | 🟡 Média | ⏳ Após enum | |
| V8 | SSRF em Elementor / image URLs | 🟡 Média | ⏳ Após enum | |

### Completos
| # | Vetor | Resultado | Data |
|---|-------|-----------|------|
| Escopo | SCOPE.md + estrutura | ✅ Concluído | 13/09 |
| Recon Passivo | 6 subdomínios, WP+Elementor, 346 rotas REST | ✅ Concluído | 13/09 |
| Recon Ativo | 14 portas, 8 vhosts, WP 7.1, user Rafael | ✅ Concluído | 13/09 |
| Takeover Research | pixel DANGLING, stape 404, email ativo | ✅ Concluído | 13/09 |
| CVE Research | 80+ CVEs, 3 PoCs, File Manager RCE (10.0) | ✅ Concluído | 13/09 |

### Pausados
| # | Vetor | Motivo | Gatilho de Retorno |
|---|-------|--------|-------------------|
| — | — | — | — |

## Ordem de Execução Planejada
1. ✅ Escopo
2. ✅ Recon Passivo + OSINT
3. ✅ Recon Ativo + Takeover + CVE Research
4. 🔄 Enumeração Profunda (content discovery, JS)
5. ⏳ Ataque Webapp (SQLi, IDOR, XSS, uploads, brute force)
6. ⏳ Exploit (File Manager RCE, PoC validação)
7. ⏳ Pós-Exploração (se foothold)
8. ⏳ Screenshots e Relatório Final

## VHosts Descobertos
| VHost | Descrição | Acessível |
|-------|-----------|-----------|
| cfcdigitaloficial.com.br | Principal | ✅ |
| www.cfcdigitaloficial.com.br | WWW redirect | ✅ |
| **cpanel.cfcdigitaloficial.com.br** | **cPanel login** | ✅ (ModSecurity block) |
| **whm.cfcdigitaloficial.com.br** | **WHM login** | ✅ |
| **webmail.cfcdigitaloficial.com.br** | **Roundcube Webmail** | ✅ |
| mail.cfcdigitaloficial.com.br | Mail services | ✅ |
| email.cfcdigitaloficial.com.br | SellFlux API | ✅ |
| webdisk.cfcdigitaloficial.com.br | WebDisk | 🔐 (401) |
| autoconfig.cfcdigitaloficial.com.br | Auto-config email | ✅ |
| stape.cfcdigitaloficial.com.br | GTM SS (GCP) | ✅ (404) |
| pixel.cfcdigitaloficial.com.br | **DANGLING** | ⛔ NXDOMAIN |