# SUMMARY.md — Attack Surface Consolidado

**Alvo:** arkodex.com.br | **Data:** 2026-08-26 | **Fase:** Pós-recon

---

## Hosts no Escopo

| Host | IP (Real) | CDN/Proxy | Portas Abertas | Stack |
|------|-----------|-----------|----------------|-------|
| **arkodex.com.br** | `34.46.128.254` (GCP — origem) | Cloudflare → AWS CloudFront | 80/443 | Caddy → React/Vite SPA + Python API (discloud.com) |
| **cloud.arkodex.com** | `34.46.128.254` (GCP) | Nenhum | 53(DNS), 80, 443(TLS broken) | PowerDNS 4.9.3 + Caddy + Python 3.12.13 |
| **arkanostore.com.br** | `34.46.128.254` (DNS aponta) | Cloudflare | 80/443 | Cloudflare WAF |
| **arksteam.mginex.site** | `34.46.128.254` (DNS aponta) | Cloudflare | 80/443 | Cloudflare JS Challenge |

---

## Ranking de Payoff (Prioridade de Exploração)

| # | Vetor | Prioridade | Payoff Esperado | Status |
|---|-------|-----------|-----------------|--------|
| 1 | **IDOR em APIs auth** `/api/orders/*`, `/api/clients/*`, `/api/analytics/*` | 🔴 **ALTA** | Dados de clientes, pedidos, billing, admin | Pendente |
| 2 | **Auth bypass** `/api/me`, `/api/payment`, `/api/checkout` | 🔴 **ALTA** | Acesso total ao sistema | Pendente |
| 3 | **JS analysis profundo** do bundle SPA (334KB) | 🔴 **ALTA** | Endpoints internos, chaves, parâmetros | Pendente |
| 4 | **PowerDNS 4.9.3** enumeração (porta 53) | 🟡 **MÉDIA** | Subdomínios adicionais, DNS cache | Pendente |
| 5 | **CVE Research** Python 3.12.13, Caddy, discloud.com | 🟡 **MÉDIA** | CVEs aplicáveis | Pendente |
| 6 | **SSRF** em `/api/gallery`, `/api/sources` | 🟡 **MÉDIA** | Acesso a rede interna | Pendente |
| 7 | **Dados expostos via APIs públicas** | 🟢 **BAIXA** | Info disclosure | Confirmado |
| 8 | **AWS Instance ID exposto** (headers) | 🟢 **BAIXA** | Info auxiliar | Confirmado |

---

## Findings Preliminares

### 🔴 Alta Prioridade
- **F-001: IP Real Bypass CDN** — `34.46.128.254` (GCP) descoberto via GitHub OSINT
- **F-002: API Surface Massiva** — ~48 endpoints mapeados (admin, billing, orders, clients, analytics)
- **F-003: PowerDNS Exposto** — DNS server público na porta 53 (4.9.3)

### 🟡 Média Prioridade
- **F-004: AWS Instance ID vazado** — `i-00fca36e644f15358` e `i-0147a504247b58069` nos headers
- **F-005: TLS Quebrado na Origem** — Porta 443 do GCP sem TLS funcional
- **F-006: Sem SPF/DMARC** — Falsificação de email possível (domínio sem MX)
- **F-007: discloud.com PaaS identificada** — Headers `x-powered-by`

### 🟢 Baixa / Info
- **F-008: Rate limiting** — 120 req/min por endpoint
- **F-009: GitHub repos públicos** — Sr-Ghost/ArkodeX-Pro com templates
- **F-010: Owner exposto** — Luan David (contato.luan.david@gmail.com)

---

## Próximos Passos (em ordem)

1. **🔴 Enumeração Profunda** — JS analysis, content discovery, param mining
2. **🔴 Webapp Attack** — IDOR, auth bypass, SSRF, SQLi/NoSQLi
3. **🟡 CVE Research** — Python 3.12.13, PowerDNS 4.9.3, Caddy, discloud.com
4. **🟡 DNS Enumeration** — Zone walk, brute force via PowerDNS
5. **📋 Report** — Consolidar todos os findings