# Recon Summary — painelrevenda.vip

## Attack Surface Consolidada

### Hosts Diretos (Origem Real — Fora CDN)

| Host | IP | Provedor | Status |
|------|-----|----------|--------|
| painelrevenda.vip | **186.194.52.218** | EVEO S.A. (AS53107) | ✅ Ativo |
| eliteiptv.one | **186.194.52.218** | EVEO S.A. | ✅ Ativo |
| revendaiptv.pro | **186.194.52.218** | EVEO S.A. | ✅ Ativo |
| smartplay.club | **186.194.52.218** | EVEO S.A. | ✅ Ativo |
| iptvrevenda.org | - | - | ❌ DNS SERVFAIL |

### Portas Abertas (TCP+UDP)

**TCP (10 portas confirmadas):** 21(ProFTPD), 25(Exim 4.99.5), 80(LiteSpeed), 110(Dovecot POP3), 143(Dovecot IMAP), 443(OpenResty/LiteSpeed+Cloudflare), 587(Exim 4.99.5), 993(Dovecot IMAPS), 995(Dovecot POP3S), 3306(MariaDB 10.11.17)

**UDP (5 portas):** 53(DNS), 123(NTP), 161(SNMP), 1900(UPnP), 5060(SIP)

### Serviços Expostos por Risco

| Risco | Serviço | Versão | Porta |
|-------|---------|--------|-------|
| 🔴 **CRÍTICO** | MariaDB (MySQL) | **10.11.17** | **3306/tcp** |
| 🔴 **CRÍTICO** | ProFTPD | **?** | **21/tcp** |
| 🔴 **ALTO** | Exim (SMTP) | **4.99.5** | **25,587/tcp** |
| 🔴 **ALTO** | Dovecot (IMAP/POP3) | ? | 110,143,993,995/tcp |
| 🟡 **MÉDIO** | SNMP | ? | 161/udp |
| 🟡 **MÉDIO** | Roundcube Webmail | ? | webmail.painelrevenda.vip |
| 🟡 **MÉDIO** | DNS | ? | 53/udp |

---

## Ranking de Payoff (Prioridade de Exploração)

| # | Prioridade | Vetor | Payoff |
|---|------------|-------|--------|
| **P0** | 🔴 **IMMEDIATE** | **MariaDB 10.11.17** (3306) — CVE-2012-2122, brute-force | Acesso total ao banco de dados |
| **P1** | 🔴 **CRITICAL** | **ProFTPD** (21) — anonymous login, CVEs | Acesso a arquivos do servidor |
| **P2** | 🔴 **CRITICAL** | **Exim 4.99.5** (25,587) — CVE-2024-39929, outros | RCE remoto potencial |
| **P3** | 🟠 **HIGH** | **Roundcube** — cred-stuffing, CVE-2024-37383 | Acesso a webmails |
| **P4** | 🟠 **HIGH** | **Dovecot** (110,143,993,995) — brute-force | Acesso a caixas postais |
| **P5** | 🟡 **MEDIUM** | **Subdomain takeover** — smmbrasil.net | Sequestro de subdomínio |
| **P6** | 🟡 **MEDIUM** | **SNMP** (161/udp) — info disclosure | Informações do sistema |
| **P7** | 🟡 **MEDIUM** | **Admin panel** — admin.painelrevenda.vip | Acesso administrativo |
| **P8** | 🟡 **MEDIUM** | **API endpoints** — api.painelrevenda.vip | Dados da API |

---

## Resumo de Fases

| Fase | Status | Artefatos |
|------|--------|-----------|
| Fase 1: Escopo | ✅ Concluído | SCOPE.md, PLAN.md |
| Fase 2: Recon Passivo + OSINT | ✅ Concluído | PASSIVE.md, 12 artefatos |
| **Fase 3: Recon Ativo** | **✅ Concluído** | **ACTIVE.md, 13 artefatos** |
| Fase 4: Enumeração | ⏳ Pendente | - |
| Fase 5: Ataque Webapp | ⏳ Pendente | - |
| Fase 6: CVE/Exploit | ⏳ Pendente | - |

---

**Atualizado em:** 2026-09-03T05:27Z  
**Próxima ação recomendada:** Delegar enum para fuzzing de admin/api/webmail + testar MariaDB externo