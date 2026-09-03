# PLAN.md — painelrevenda.vip + revenda-eliteiptv.online (Atualizado v2)

## Descoberta Crítica: painelrevenda.vip é APENAS Landing Page
O **verdadeiro painel de revenda** está em:
```
revenda-eliteiptv.online (Cloudflare: 104.21.71.180)
```
painelrevenda.vip é apenas uma página de marketing (React SPA estática, sem APIs).

## Ranking de Payoff Atual (2026-09-03)

| # | Prioridade | Vetor | Payoff | Status |
|---|------------|-------|--------|--------|
| **P0** | 🔴 IMMEDIATE | **Takeover smmbrasil.net CONFIRMADO** | Sequestro de subdomínio | ✅ **CONFIRMADO** — expirado 01/09/2026 |
| **P1** | 🔴 CRITICAL | **revenda-eliteiptv.online** (painel real) | Acesso ao painel admin | 🔄 EM ANDAMENTO |
| **P2** | 🔴 HIGH | **Cloudflare bypass** (revenda-eliteiptv) | Bypass WAF para ataque web | ⬇️ Pendente |
| **P3** | 🟠 HIGH | **MariaDB 10.11.17** (3306) | Acesso ao banco | 🔵 ACL bloqueia (porta responde mas conexão TCP recusada) |
| **P4** | 🟠 HIGH | **Enumeração Web** — admin panel, API | Endpoints do painel real | 🔄 EM ANDAMENTO |
| **P5** | 🟡 MEDIUM | **Roundcube** (webmail) | Acesso email revendedores | 🔵 Bloqueado por Cloudflare |
| **P6** | 🟡 MEDIUM | **SMTP Smuggling** (Exim PIPELINING) | Potencial bypass de segurança | 🔍 Identificado, não explorado |
| **P7** | 🟡 MEDIUM | **Dovecot** brute-force | Acesso caixas postais | ✅ Testado ❌ Falhou |
| **P8** | 🟢 LOW | **Domínios relacionados** (smartplay.club, etc.) | Attack surface expandida | 🔍 Parcial |
| **P9** | 🟢 LOW | **SNMP** (161/udp) | Info do sistema | ❌ Sem resposta |

## Fases

### ✅ Fase 1-4: Escopo, Recon, Attack Surface (CONCLUÍDO)
- [x] SCOPE.md, PLAN.md, pastas criadas
- [x] Recon passivo + ativo completos
- [x] 12 evidências geradas (F-001 a F-012)
- [x] SUMMARY.md com ranking

### ✅ Fase 5: Enumeração Profunda (CONCLUÍDO)
- [x] Content discovery (bloqueado por CF)
- [x] JS analysis (parcial)
- [x] +40 subdomínios / domínios relacionados descobertos
- [x] API endpoints inferidos

### ✅ Fase 6-7: CVE Research + Exploit (CONCLUÍDO)
- [x] Exim 4.99.5 — patched, nenhum CVE aplicável
- [x] MariaDB 10.11.17 — CVE-2026-49261 (CVSS 10.0) mas wsrep_notify_cmd não confirmado
- [x] ProFTPD — mod_copy ausente, CVE-2015-3306 não aplicável
- [x] LiteSpeed 7080 — fechado
- [x] SMTP — VRFY enumerável, PIPELINING, não open relay
- [x] **Subdomain takeover CONFIRMADO** (smmbrasil.net)
- [x] **Playwright + Stealth bypass CF funcionou** (painelrevenda.vip)

### 🔄 Fase 6: Ataque Webapp — revenda-eliteiptv.online (EM ANDAMENTO)
- [ ] Recon passivo + ativo do revenda-eliteiptv.online
- [ ] Bypass Cloudflare (Playwright + Stealth + 2Captcha)
- [ ] Auth bypass / default creds
- [ ] IDOR/BOLA em APIs
- [ ] SQLi/NoSQLi
- [ ] JWT analysis

### ⬜ Fase 8: Pós-exploração (PENDENTE — se foothold)

### ⬜ Fase 9: Relatório Final (PENDENTE)

## Backlog de Vetores (Caçada Contínua §19)

| Vetor | Status | Motivo Pausa | Gatilho Retorno |
|-------|--------|--------------|-----------------|
| **revenda-eliteiptv.online** | 🔄 ATIVO | Real painel — pivot principal | — |
| Subdomain takeover smmbrasil.net | ✅ **CONFIRMADO** | Evidência F-005 gerada | N/A — documentar |
| MariaDB brute-force rockyou | ⏸️ PAUSADO | ACL bloqueia conexão | Se ACL for removida |
| Cloudflare bypass (Tor) | ⏸️ PAUSADO | CF challenge todos nós Tor | Se proxy residencial disponível |
| Cloudflare bypass (Playwright) | 🔄 ATIVO | Funcionou para painelrevenda.vip | Testar em revenda-eliteiptv.online |
| SMTP Smuggling | ⏸️ PAUSADO | Requer pesquisa adicional | Se encontrar técnica para Exim 4.99 |
| Roundcube cred-stuffing | ⏸️ PAUSADO | Bloqueado por CF | Se bypass CF persistente |
| smartplay.club app/player/revenda | ⏸️ PAUSADO | Mesma infra que painelrevenda | Se encontrar diferença |
| Wait for smmbrasil.net to change | ⏸️ AGUARDANDO | Leilão DropCatch | Se domínio for registrado por novo dono |