# REPORT.md — Pentest dfg.com.br

> Relatório incremental. Atualizado a cada finding/fase (§9).

## Metadados
- **Alvo:** https://www.dfg.com.br/
- **Domínio:** dfg.com.br
- **Abordagem:** black-box externo (Web/API + externo)
- **Início:** 2026-09-04T22:42Z (UTC)
- **OPSEC:** Tor + proxychains4, 2Captcha (Cloudflare bypass)
- **Coordenador:** Red Team Operator (pentest)

## Sumário executivo
> Atualizado após Fase 2 (recon passivo).

- **Fase atual:** 2 (Recon passivo) concluída — iniciando Fase 3 (Recon ativo).
- **Findings preliminares (passivo):** 10 (F-P1..F-P10) — 2 altos pendentes de confirmação.
- **Acessos obtidos:** nenhum até o momento.

### Destaques de alto valor (passivo)
- **SPF vaza 5 IPs de origem real (Contabo/RackNerd)** → bypass total de Cloudflare (F-P1).
- **mail.dfg.com.br = SmarterMail/IIS/Windows exposto direto** sem WAF (F-P2) → brute force, CVE, enum mailboxes.
- **suppliers.dfg.com.br = ASP.NET WebForms legado** + `requests-xml.aspx` (XXE candidate) + `register.aspx` (F-P4).
- **portaldfg.com.br (afiliado) = WordPress + WooCommerce + Elementor + Fluent Forms** + admin `drfranciscogeovane` (F-P5).
- **DMARC p=none** → spoofing de dfg.com.br (phishing) (F-P3).
- 4 emails + 2 pessoas para credential stuffing (F-P10).

## Tabela de findings

| ID | Severidade | Título | Host | Evidência | Status |
|----|-----------|--------|------|-----------|--------|
| F-P1 | Alto | SPF vaza 5 IPs de origem real (bypass Cloudflare) | dfg.com.br SPF | recon/passive/PASSIVE.md | preliminar (passivo) |
| F-P2 | Alto | SmarterMail/IIS exposto direto sem WAF | mail.dfg.com.br (164.68.104.26) | recon/passive/PASSIVE.md | preliminar — recon-active fingerprinta versão |
| F-P3 | Médio | DMARC p=none → spoofing de dfg.com.br | dfg.com.br DMARC | recon/passive/dns_dmarc.txt | confirmado |
| F-P4 | Alto | suppliers.dfg.com.br ASP.NET WebForms legado + XXE candidate | suppliers.dfg.com.br | recon/passive/PASSIVE.md | preliminar — enum/webapp valida |
| F-P5 | Alto | portaldfg.com.br WordPress + plugins + admin conhecido | portaldfg.com.br | recon/passive/portaldfg_*.txt | preliminar — wpscan/webapp valida |
| F-P6 | Médio | /user/login?ReturnUrl= open-redirect candidate | dfg.com.br | recon/passive/wayback_auth.txt | preliminar — webapp valida |
| F-P7 | Médio | /user/{id} perfis públicos → enum + IDOR | dfg.com.br | recon/passive/wayback_*.txt | preliminar — enum/webapp valida |
| F-P8 | Info | astarium.com afiliado (mesma infra Contabo) | astarium.com | recon/passive/origin_ips_whois.txt | investigar |
| F-P9 | Info | favicon hash 1823553973 → Shodan correlation | www.dfg.com.br | recon/passive/favicon_www.ico | pendente API Shodan |
| F-P10 | Médio | 4 emails para credential stuffing | dfg.com.br/portaldfg | recon/passive/osint_emails.txt | preliminar — exploit/webapp valida |

## Attack surface consolidada
> Será preenchida em recon/SUMMARY.md (Fase 4). Panorâmico da Fase 2:

- **8 hosts vivos** (*.dfg.com.br) — 5 atrás de Cloudflare, 2 origem real Windows (Contabo).
- **5 IPs de origem real** vazados via SPF: 164.68.104.26, 5.189.143.90, 161.97.106.114, 161.97.106.115, 77.237.241.198.
- **Stack principal:** Cloudflare (WAF/CDN) + Nuxt.js (marketplace) + ASP.NET WebForms legado (suppliers) + SmarterMail/IIS (mail).
- **Afiliados:** portaldfg.com.br (WordPress), astarium.com (infra email compartilhada).
- **Empresa:** GARZON SERVIÇOS DE INFORMATICA LTDA (CNPJ 08.222.462/0001-65), Brasília/DF.

## Acessos obtidos
- (nenhum)

## Objetivos de alto valor
- (nenhum atingido ainda)

## Cronologia
> Ver `timeline.log` para a cronologia completa ISO8601.

## Evidências
> Em `evidence/F-XXX.txt`.
