# Attack Surface — marketroblox.store / marketroblox.com

**Data:** 2026-08-24T04:22:00Z  
**Fonte:** Recon passivo (fase 2) concluído

## Visão Geral

| Métrica | Valor |
|---------|-------|
| Domínios no escopo | marketroblox.store (redirect), **marketroblox.com (alvo real)** |
| Subdomínios totais | 26 (10 .store + 16 .com) |
| Hosts vivos | 5 (2 únicos + 3 Cloudflare) |
| IPs | 4 Cloudflare (104.21.95.93, 172.67.144.20, 104.21.24.108, 172.67.218.86) |
| IP real (origem) | **Não descoberto** (atrás de Cloudflare) |
| Stack principal | **PHP 7.4.33** (EOL), Bootstrap, jQuery, SweetAlert2 |
| CMS | Custom marketplace (não WordPress) |

## Ranking de Payoff (§16)

| Prioridade | Alvo | Host | Vetor | Payoff Potencial |
|------------|------|------|-------|------------------|
| 🔴 **CRÍTICO** | `/.env` | marketroblox.com | Força bruta/.git exposure | Credenciais DB, API keys, secrets |
| 🔴 **CRÍTICO** | `/.git/config` | marketroblox.com | Git exposure | Código fonte, DB creds |
| 🔴 **CRÍTICO** | `/cpanel` (200) | marketroblox.com | Default creds / CVE | Acesso total ao hosting |
| 🔴 **ALTO** | `/admin` (302) | marketroblox.com | Auth bypass, default creds | Acesso admin do marketplace |
| 🔴 **ALTO** | PHP 7.4.33 (EOL) | marketroblox.com | CVE research | RCE / code execution |
| 🟡 **MÉDIO** | `/api` (301) | marketroblox.com | Enum endpoints, IDOR | Dados de usuários, ordens |
| 🟡 **MÉDIO** | `/administrator` (302) | marketroblox.com | Auth bypass | Painel admin secundário |
| 🟡 **MÉDIO** | `bot.marketroblox.store` (526) | marketroblox.store | SSL misconfig | Info disclosure |
| 🟡 **MÉDIO** | `shopclonev7` (526) | marketroblox.store | SSL misconfig | Versão/stack info |
| 🟢 **BAIXO** | `/mod/` | marketroblox.com | Directory listing / LFI | Module source |
| 🟢 **BAIXO** | `/logs`, `/error`, `/debug` | marketroblox.com | Info disclosure | Debug info |
| 🟢 **BAIXO** | SweetAlert2 10.15.6 | marketroblox.com | XSS vectors | DOM XSS |
| 🟢 **BAIXO** | /mod/js/main.js, /public/client/js/main.js | marketroblox.com | JS analysis | API endpoints, keys |

## Estratégia de Ataque

1. ~~**Fase 3 (Recon Ativo):** Focar em bypass Cloudflare, portscan, WAF detection, vhost discovery~~ ✅
2. ~~**Fase 5 (Enum):** Content discovery profundo, JS analysis, param mining~~ ✅
3. **▶ Fase 6 (WebApp):** Order IDOR, Buy mass assignment, cPanel brute force, Admin auth bypass, PHP CVEs, SQLi
4. **Fase 7 (CVE):** PHP 7.4.33 + LiteSpeed CVEs
5. **Fase 8 (Exploit):** Validar PoCs não-destrutivos
6. **Fase 9 (Relatório):** Consolidar REPORT.md final

## Notas

- Domínio registrado em 2026-08-01 (< 1 mês) — sem histórico, sem wayback
- Cloudflare bloqueia requests não-humanos (526 SSL errors em alguns subdomínios)
- Sem email servers (MX vazio) — sem SPF/DMARC
- Sem buckets S3 abertos
- Sem CNAME dangling para takeover

**Próximo passo:** Delegar recon ativo para descoberta de IP real, portscan completo e fingerprint de serviços.