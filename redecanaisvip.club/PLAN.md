# PLAN — redecanaisvip.club

## Cronograma de Fases

### Fase 1 ✅ Escopo
- [x] Diretório criado
- [x] SCOPE.md
- [x] PLAN.md
- [x] REPORT.md
- [x] timeline.log

### Fase 2 ⬜ Recon Passivo + OSINT
- [ ] Delegar subagente recon-passive
- [ ] Subdomínios (subfinder, amass, crt.sh, certspotter, dnsdumpster)
- [ ] Wayback Machine (gau, waybackurls)
- [ ] Tech stack (wappalyzer, builtwith)
- [ ] OSINT (theHarvester, emails, breaches)
- [ ] IPs reais (bypass CDN)
- [ ] Buckets/cloud
- [ ] Subdomain takeover checks
- [ ] Resultados → recon/passive/PASSIVE.md

### Fase 3 ⬜ Recon Ativo
- [ ] Delegar subagente recon-active
- [ ] Portscan (nmap/rustscan)
- [ ] Fingerprint serviços
- [ ] WAF detection (wafw00f)
- [ ] Vhosts discovery (ffuf)
- [ ] TLS scan
- [ ] Resultados → recon/active/ACTIVE.md

### Fase 4 ⬜ Consolidar Attack Surface
- [ ] Escrever recon/SUMMARY.md com ranking de payoff

### Fase 5 ⬜ Enumeração Profunda
- [ ] Delegar subagente enum
- [ ] Content discovery (ffuf/dirsearch)
- [ ] JS analysis (endpoints, keys, secrets)
- [ ] Param mining
- [ ] API endpoints (Swagger, GraphQL)
- [ ] CMS detection (wpscan se WP)
- [ ] robots.txt, sitemap, .well-known
- [ ] Resultados → enum/

### Fase 6 ⬜ Ataque Webapp
- [ ] Delegar subagente webapp
- [ ] Auth bypass / default creds
- [ ] IDOR/BOLA
- [ ] SQLi / NoSQLi / SSTI / CmDi
- [ ] SSRF
- [ ] XSS
- [ ] Upload abuse
- [ ] JWT attacks
- [ ] GraphQL introspection
- [ ] Findings → evidence/F-*.txt

### Fase 7 ⬜ CVE + Exploit
- [ ] Delegar subagentes cve / exploit
- [ ] Mapear CVEs por versão
- [ ] Validar PoCs não-destrutivos
- [ ] Se RCE/default cred → foothold

### Fase 8 ⬜ Pós-exploração (se foothold)
- [ ] Delegar subagente postex
- [ ] Privesc, loot, pivoting

### Fase 9 ⬜ Relatório Final
- [ ] Delegar subagente report
- [ ] REPORT.md final consolidado

## Backlog de Vetores (Caçada §19)
- (inicial) A ser populado conforme achados