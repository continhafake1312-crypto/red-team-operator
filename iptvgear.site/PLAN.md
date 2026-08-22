# PLAN — iptvgear.site

## Visão Geral
Pentest black-box no alvo iptvgear.site. Metodologia adaptativa conforme §5: recon → enum → webapp → CVE/exploit → pós-ex → relatório.

## Fases

### FASE 1: Escopo ✅
- [x] Criar diretório iptvgear.site
- [x] Criar SCOPE.md, PLAN.md, REPORT.md, timeline.log
- [x] Verificar OPSEC (Tor + proxychains)

### FASE 2: Recon Passivo + OSINT ✅
- [x] Subdomínios: subfinder, crt.sh (2 encontrados — ambos Cloudflare)
- [x] DNS: WHOIS, NS, MX, SPF, DMARC (DMARC p=none)
- [x] Tech stack: WordPress + WooCommerce + Jetpack + RankMath + Wordfence
- [x] Wayback: 25 snapshots, 1 com HTTP 200 (2025-03-04)
- [x] OSINT: 1 email info@iptvgear.com, 0 breaches, 0 GitHub
- [x] Cloud buckets: 15 GCP buckets (geo-restritos)
- [x] Domínios relacionados: iptvgear.net (103.160.107.175 — SEM Cloudflare)
- [x] Consolidar PASSIVE.md

### FASE 3: Recon Ativo ✅
- [x] Portscan 103.160.107.175 (omega.herosite.pro): 6667 (Dovecot), 6969 (FTP)
- [x] Fingerprint: ProFTPD 1.3.1, Dovecot AUTH=PLAIN
- [x] Vhost fuzzing: omega.herosite.pro (SolidHosting)
- [x] WAF detection: Cloudflare WAF confirmado
- [x] TLS: Sem TLS direto (porta 443 fechada)
- [x] Consolidar ACTIVE.md

### FASE 4: Consolidar Attack Surface ✅
- [x] recon/SUMMARY.md com ranking de payoff

### FASE 5: Enumeração Profunda ✅
- [x] WP REST API: 22 namespaces, 482 rotas
- [x] WPScan parcial (Cloudflare bloqueou scan completo)
- [x] User "admin" confirmado via /author/admin/
- [x] Slider Revolution 6.2.22, Redux 4.5.11, WPBakery
- [x] OpenCart /shop/admin/ acessível
- [x] Cloudflare bypass: httpx bypassou parcialmente
- [x] Consolidar ENUM.md

### FASE 6: Ataque Webapp 🟡 (parcial — Cloudflare bloqueia)
- [ ] Auth bypass / default creds — Cloudflare bloqueia requests
- [ ] Slider Revolution CVE-2024-34444 — não validado (CF)
- [ ] OpenCart SQLi (EDB-51940) — não testado (CF)
- [ ] XML-RPC — bloqueado (CF)

### FASE 7: CVE Research + Exploit ✅
- [x] ProFTPD 1.3.1: CVE-2010-4221 (CVSS 10.0 RCE), CVE-2009-0542 (SQLi)
- [x] Slider Revolution 6.2.22: CVE-2024-34444 (CVSS 8.8 UNAUTH XSS)
- [x] OpenCart: EDB-51940 (SQLi), EDB-50942 (Blind SQLi), EDB-50555 (Session)
- [x] PoCs salvos em exploit/pocs/
- [x] exploit/cve_research.md, cve_revslider.md, cve_opencart.md
- [x] OS fingerprint: Debian 5.0 + Plesk (80% confiança)

### FASE 8: Pós-Exploração 🔄 (não aplicado — sem foothold confirmado)
- [ ] CVE-2010-4221 RCE não executado (risco de crash)

### FASE 9: Relatório ✅
- [x] REPORT.md final consolidado com 8 findings
- [x] timeline.log atualizado
- [x] Todos os artefatos no repositório

## Backlog de Vetores (§19)
- (vazio — será preenchido conforme findings surgem)

## Ranking de Payoff (§16)
- (a ser preenchido após recon)