# PLAN — iptvgear.site

## Visão Geral
Pentest black-box no alvo iptvgear.site. Metodologia adaptativa conforme §5: recon → enum → webapp → CVE/exploit → pós-ex → relatório.

## Fases

### FASE 1: Escopo ✅
- [x] Criar diretório iptvgear.site
- [x] Criar SCOPE.md, PLAN.md, REPORT.md, timeline.log
- [x] Verificar OPSEC (Tor + proxychains)

### FASE 2: Recon Passivo + OSINT 🔄 (delegado)
- [ ] Subdomínios: subfinder, amass, crt.sh, assetfinder
- [ ] DNS: WHOIS, NS, MX, SPF, DMARC, AXFR
- [ ] Tech stack: httpx, whatweb, favicon hash
- [ ] Wayback: waybackurls
- [ ] OSINT: theHarvester, emails, breaches, GitHub
- [ ] Cloud buckets: S3/Azure/GCP naming variations
- [ ] Subdomain takeover candidates
- [ ] Consolidar PASSIVE.md

### FASE 3: Recon Ativo (pendente)
- [ ] Portscan hosts reais
- [ ] Fingerprint serviços/versões
- [ ] Vhost fuzzing
- [ ] WAF detection
- [ ] TLS assessment
- [ ] Consolidar ACTIVE.md

### FASE 4: Consolidar Attack Surface (pendente)
- [ ] Escrever recon/SUMMARY.md com ranking de payoff

### FASE 5: Enumeração Profunda (pendente)
- [ ] Content discovery (ffuf/gobuster)
- [ ] JS analysis (endpoints/chaves/tokens)
- [ ] Param mining
- [ ] API discovery (Swagger/GraphQL)
- [ ] CMS enum se aplicável

### FASE 6: Ataque Webapp (pendente)
- [ ] Auth bypass / default creds
- [ ] IDOR/BOLA
- [ ] SQLi / NoSQLi / SSTI
- [ ] SSRF
- [ ] XSS
- [ ] Upload
- [ ] JWT attacks
- [ ] GraphQL abuse
- [ ] Mass assignment

### FASE 7: CVE Research + Exploit (pendente)
- [ ] Mapear CVEs por versão
- [ ] Clonar PoCs
- [ ] Validar exploits

### FASE 8: Pós-Exploração (se foothold)
- [ ] Privesc
- [ ] Loot collection
- [ ] Pivoting

### FASE 9: Relatório (pendente)
- [ ] Consolidar REPORT.md final

## Backlog de Vetores (§19)
- (vazio — será preenchido conforme findings surgem)

## Ranking de Payoff (§16)
- (a ser preenchido após recon)