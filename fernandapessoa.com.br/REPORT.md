# REPORT.md — fernandapessoa.com.br

> Relatório incremental. Atualizado a cada finding pelo coordenador.

## Metadados

- **Alvo:** `fernandapessoa.com.br`
- **Tipo:** Web/API externo black-box
- **Owner do engagement:** Red Team Operator (coordenador)
- **OPSEC:** Tor + proxychains4 + 2Captcha (Cloudflare bypass)
- **Início:** 2026-08-27T03:22Z (UTC)

## Sumário executivo

Engagement iniciado. Fase 1 (Escopo) concluída. Fase 2 (Recon Passivo) concluída — achados críticos:

### 🔴 Achados Críticos Imediatos
1. **Painéis admin expostos SEM Cloudflare** (187.45.185.33): cPanel, WHM, Webmail — ataque direto possível
2. **Directory listing exposto**: `mail.fernandapessoa.com.br` e `envio.fernandapessoa.com.br`
3. **Servidor Windows exposto** (177.44.191.252): Apache 2.4.54, PHP 7.4.33 — sem Cloudflare
4. **Server SMTP AWS** (54.165.96.105) — vetor de SPF/email

### 🟡 Achados Altos
- **Next.js app** (`app.fernandapessoa.com.br`) — portal interno atrás de Cloudflare
- **WooCommerce 10.7** (`loja.fernandapessoa.com.br`) — e-commerce
- **WordPress 7.0.1** com matrículas em múltiplos subdomínios
- **Mautic** — marketing automation (503, pode ser indicador de CVE)
- **7 emails de desenvolvimento** expostos em GitHub
- **19 repositórios GitHub** da organização

## Findings por severidade

| ID | Severidade | Título | Host | Status |
|----|------------|--------|------|--------|
| F-001 | Crítica | Painéis admin (cPanel/WHM/Webmail) expostos SEM Cloudflare | cpanel/whm/webmail.fernandapessoa.com.br (187.45.185.33) | 🔍 recon ativo pendente |
| F-002 | Crítica | Directory listing exposto (mail/enviar) | mail/envio.fernandapessoa.com.br (187.45.185.33) | 🔍 recon ativo pendente |
| F-003 | Crítica | Servidor Windows com Apache/PHP exposto SEM Cloudflare | wpp.fernandapessoa.com.br (177.44.191.252) | 🔍 recon ativo pendente |
| F-004 | Alta | Next.js app com portal interno + _buildManifest.js vazando rotas | app.fernandapessoa.com.br | 🔍 enum pendente |
| F-005 | Alta | WooCommerce 10.7 — e-commerce com dados de pagamento | loja.fernandapessoa.com.br | 🔍 enum pendente |
| F-006 | Média | 7 emails de dev + 19 repos GitHub expostos (creds em commits?) | github.com/fernandapessoa | 🔍 OSINT pendente |
| F-007 | Média | Mautic marketing automation (503 — CVE candidates) | mautic.fernandapessoa.com.br | 🔍 cve pendente |

## Attack surface consolidada
(vide `recon/SUMMARY.md` após recon)

## Acessos obtidos
(nenhum até o momento)

## Objetivos de alto valor
- [ ] Acesso interno (foothold)
- [ ] Acesso administrativo (admin/RCE)
- [ ] Acesso financeiro
- [ ] Acesso a dados/PII

## Cronologia
(vide `timeline.log`)

## Próximos passos
1. 🔴 Recon ativo nos IPs reais: port scan + fingerprint + vhosts em `187.45.185.33`, `177.44.191.252`, `54.165.96.105`, `198.49.75.243`
2. 🔴 Tentativa de cred-stuffing em cPanel/WHM/Webmail (credenciais default)
3. 🟡 Enumeração profunda em app.fernandapessoa.com.br (Next.js routes)
4. 🟡 WooCommerce scan (CVEs, payment leakage)
5. 🟡 GitHub deep scan (trufflehog nos 19 repos)
