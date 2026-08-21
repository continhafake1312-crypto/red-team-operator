# PLAN — focusconcursos.com.br

## Metodologia
Pentest Web/API Externo Black-Box autônomo. Metodologia conforme AGENTS.md e pentest-methodology skill.

## Fases

### Fase 1: Escopo ✅
- [x] Criar estrutura de diretórios
- [x] SCOPE.md
- [x] PLAN.md
- [x] REPORT.md (inicial)
- [x] timeline.log

### Fase 2: Recon Passivo + OSINT 🔄
- [ ] Subdomínios (subfinder, amass, crt.sh, wayback)
- [ ] Tech stack (wappalyzer, whatweb)
- [ ] Wayback Machine (endpoints históricos)
- [ ] OSINT (emails, vazamentos, GitHub, redes sociais)
- [ ] Buckets cloud / subdomain takeover candidates

### Fase 3: Recon Ativo
- [ ] Portscan (nmap all ports)
- [ ] Fingerprint de serviços e versões
- [ ] Detecção de WAF (wafw00f)
- [ ] Descoberta de IP real (bypass CDN)
- [ ] Enumeração de vhosts
- [ ] TLS/certificate analysis

### Fase 4: Consolidar Attack Surface
- [ ] recon/SUMMARY.md com ranking de payoff
- [ ] Re-priorizar plano baseado em findings

### Fase 5: Enumeração Profunda
- [ ] Content discovery (ffuf/dirsearch)
- [ ] JS analysis (endpoints, API keys, tokens)
- [ ] Param mining
- [ ] API endpoints (Swagger/OpenAPI/GraphQL)
- [ ] CMS detection + fingerprint

### Fase 6: Ataque Webapp
- [ ] Auth bypass / default creds
- [ ] IDOR/BOLA
- [ ] SQLi / NoSQLi
- [ ] SSTI / Command Injection
- [ ] SSRF
- [ ] XSS
- [ ] Upload vulnerabilities
- [ ] JWT analysis
- [ ] GraphQL introspection/attacks

### Fase 7: CVE Research + Exploit
- [ ] Mapear CVEs por serviço/versão
- [ ] Validar PoCs não-destrutivos

### Fase 8: Pós-Exploração (se aplicável)
- [ ] Privesc
- [ ] Loot collection
- [ ] Pivoting

### Fase 9: Relatório Final
- [ ] Consolidar REPORT.md
- [ ] Galeria de screenshots
- [ ] Evidências referenciadas

## Backlog de Vetores (Caçada Contínua §19)
*Vetores identificados mas não priorizados, com motivo da pausa e gatilho de retorno.*

| # | Vetor | Motivo da Pausa | Gatilho de Retorno |
|---|-------|-----------------|---------------------|
| — | — | — | — |

## Objetivos de Alto Valor (Prioridade de Payoff)
1. Acesso interno (foothold via aplicação/infra)
2. Acesso administrativo (painel admin/RCE)
3. Acesso financeiro (pagamentos/transações)
4. Acesso a dados/PII (vazamento de dados de alunos/usuários)