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
> Atualizado após Fase 3 (recon ativo) + Fase 4 (consolidação SUMMARY.md).

- **Fase atual:** 4 (consolidação) concluída — iniciando Fase 5 (enum) + Fase 7a (cve) em paralelo.
- **Findings:** 10 preliminares (passivo) + achados ativos (SmarterMail WSDL admin, register.aspx aberto, Mailcow admin, TLS correlation).
- **Acessos obtidos:** nenhum até o momento.

### ⭐ Bypass Cloudflare confirmado (transversal)
Os 5 IPs do SPF (Contabo) rodam serviços **diretamente acessíveis, SEM WAF** — cada app vive em um IP próprio fora do proxy Cloudflare. Portscan completo: somente 25/80/443 abertos (firewall restritivo). 3 IPs (164.68.104.26, 161.97.106.114, 161.97.106.115) compartilham cert wildcard `*.dfg.com.br` → mesma infra Windows/IIS.

### Top payoff (ativo)
1. **SmarterMail Free 15.7 build 6970** (164.68.104.26) — sem WAF, `/Services/` expõe **10 web services SOAP .asmx com WSDL público** (svcUserAdmin, svcDomainAdmin, svcServerAdmin...) → info disclosure admin API. CVEs históricos (path traversal/RCE/auth bypass).
2. **Suppliers portal** (161.97.106.115) — sem WAF, `register.aspx` **aberto** (qualquer um cria conta), `requests-xml.aspx` (XXE candidate), ViewState + AjaxControlToolkit 4.1.40412.0 (deserialization).
3. **DFGames Admin login** (161.97.106.114 / old.dfg) — sem WAF, credential stuffing direto.
4. **Mailcow admin** (77.237.241.198) — sem WAF, default creds `admin`/`moohoo`, SOGo exposto.
5. **portaldfg WordPress** (Cloudflare) — plugins desatualizados (WooCommerce 10.9.4, Elementor 4.2.3, Fluent Forms 6.2.6), admin `drfranciscogeovane`.

## Tabela de findings

| ID | Sev | Título | Host | Evidência | Status |
|----|-----|--------|------|-----------|--------|
| F-P1 | Alto | SPF vaza 5 IPs de origem real (bypass CF) | dfg.com.br SPF | recon/passive/PASSIVE.md | confirmado (ativo) |
| F-A1 | Alto | SmarterMail 15.7 direto + WSDL SOAP admin exposto | 164.68.104.26 | recon/active/smartermail_services.txt | confirmado |
| F-A2 | Alto | Suppliers register.aspx aberto + XXE candidate | 161.97.106.115 | recon/active/suppliers_probe.txt | confirmado — webapp valida |
| F-A3 | Alto | DFGames Admin login direto sem WAF | 161.97.106.114 | recon/active/admin114_probe.txt | confirmado — webapp cred stuffing |
| F-A4 | Alto | Mailcow admin direto (default admin/moohoo) | 77.237.241.198 | recon/active/mailcow_admin.txt | confirmado — webapp valida default creds |
| F-A5 | Info | 3 IPs compartilham cert wildcard *.dfg.com.br (mesma infra) | origens | recon/active/tls_origins.txt | confirmado (pivoting) |
| F-P5 | Alto | portaldfg WP + plugins desatualizados + admin conhecido | portaldfg.com.br | recon/active/wpscan_portaldfg.txt | cve/webapp valida |
| F-P4 | Alto | suppliers ASP.NET WebForms legado (AjaxControlToolkit 4.1.40412.0) | suppliers | recon/passive/PASSIVE.md | cve/webapp valida |
| F-P3 | Médio | DMARC p=none → spoofing | dfg.com.br | recon/passive/dns_dmarc.txt | confirmado |
| F-P6 | Médio | /user/login?ReturnUrl= open-redirect | dfg.com.br | recon/passive/wayback_auth.txt | webapp valida |
| F-P7 | Médio | /user/{id} perfis públicos → enum + IDOR | dfg.com.br | recon/passive/wayback_*.txt | enum/webapp valida |
| F-P8 | Info | astarium.com afiliado (mesmos NS CF + Mailcow compartilhado) | astarium.com | recon/active/astarium_*.txt | investigar |
| F-P10 | Médio | 5 emails/identidades p/ credential stuffing (acgarzon, garzon.servicos, drfranciscogeovane, salesmgr@dfgames, postmaster) | dfg/portaldfg | recon/passive/osint_emails.txt | exploit/webapp valida |

## Attack surface consolidada
> Ver `recon/SUMMARY.md` para o detalhe completo (ranking de payoff ordenado).

- **5 hosts de origem real** (sem WAF): SmarterMail (164.68.104.26), Suppliers (161.97.106.115), DFGames Admin/old.dfg (161.97.106.114), Mailcow (77.237.241.198), SMTP relay (5.189.143.90).
- **Hosts Cloudflare-fronted:** dfg/www (Nuxt), api (Nuxt), cdn, portaldfg (WordPress).
- **Portas expostas:** 25/80/443 em todos os IPs de origem (firewall restritivo).
- **Stack:** Cloudflare (WAF) + Nuxt.js + ASP.NET WebForms (IIS/Windows) + SmarterMail + Mailcow + WordPress.
- **Afiliados:** portaldfg.com.br (brand), astarium.com (infra email/NS compartilhados).

## Acessos obtidos
- (nenhum)

## Objetivos de alto valor
- (nenhum atingido ainda)

## Cronologia
> Ver `timeline.log` para a cronologia completa ISO8601.

## Evidências
> Em `evidence/F-XXX.txt`.
