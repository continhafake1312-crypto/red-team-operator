# PLAN.md — painelrevenda.vip

## Estratégia Geral
Alvo é uma plataforma de revenda IPTV (Elite IPTV). Negócio de alta sensibilidade (pagamentos PIX, dados de clientes, credenciais de revendedores). Prioridade: acesso a painel admin, credenciais de revenda, vazamento de dados financeiros/PII.

## Fases

### ✅ Fase 1: Escopo ✅ (CONCLUÍDA)
- [x] SCOPE.md criado
- [x] Estrutura de pastas criada
- [x] Primeiro contato com o alvo: LiteSpeed, React SPA, IP 186.194.52.218

### ⬜ Fase 2: Recon Passivo + OSINT (PENDENTE)
- [ ] Acionar recon-passive
- [ ] Subdomínios (crt.sh, subfinder, amass, assetfinder)
- [ ] DNS completo (NS, MX, TXT, A, AAAA, CNAME)
- [ ] Tech stack (whatweb, httpx, favicon hash)
- [ ] Wayback (waybackurls) → endpoints, JS, params
- [ ] Cloud buckets (S3/Azure/GCP)
- [ ] OSINT (emails, pessoas, breaches, GitHub)
- [ ] Subdomain takeover (CNAME dangling)

### ⬜ Fase 3: Recon Ativo (PENDENTE)
- [ ] Acionar recon-active
- [ ] Portscan completo (rustscan + nmap -sV -sC)
- [ ] Fingerprint de serviços
- [ ] Vhosts enumeration
- [ ] WAF detection (wafw00f)
- [ ] TLS/SSL analysis
- [ ] Bypass CDN → IP real se aplicável

### ⬜ Fase 4: Consolidar Attack Surface (PENDENTE)
- [ ] Criar recon/SUMMARY.md com ranking de payoff

### ⬜ Fase 5: Enumeração Profunda (PENDENTE)
- [ ] Acionar enum
- [ ] Content discovery (ffuf/gobuster)
- [ ] JS analysis (endpoints, chaves, tokens)
- [ ] Param mining
- [ ] API endpoints (Swagger/OpenAPI/GraphQL)
- [ ] CMS/stack analysis

### ⬜ Fase 6: Ataque Webapp (PENDENTE)
- [ ] Acionar webapp
- [ ] Auth bypass / default creds
- [ ] IDOR/BOLA
- [ ] SQLi/NoSQLi/SSTI/Cmd injection
- [ ] SSRF, XSS, Upload
- [ ] JWT analysis
- [ ] GraphQL endpoints

### ⬜ Fase 7: CVE Research + Exploit (PENDENTE)
- [ ] Acionar cve + exploit
- [ ] CVE mapping por versão
- [ ] PoC validation

### ⬜ Fase 8: Pós-exploração (PENDENTE — se foothold)
- [ ] Acionar postex

### ⬜ Fase 9: Relatório (PENDENTE)
- [ ] Acionar report

## Backlog de Vetores (para caçada contínua §19)
| Vetor | Status | Notas |
|-------|--------|-------|
| Admin panel login | Pendente | Provavelmente /admin, /painel, /login |
| Default creds | Pendente | admin:admin, painel:painel |
| API endpoints | Pendente | Descobrir via JS analysis |
| PII leakage | Pendente | Structured data já expõe contato |
| PIX payment bypass | Pendente | Se houver integração PIX no painel |
| Google Analytics ID | Pendente | G-WXM0W94JF7 — pode revelar mais propriedades |
| WhatsApp API | Pendente | wa.me/5577981123639 |

## Prioridades Atuais
1. Descobrir TODOS os subdomínios
2. Encontrar painel de login admin
3. Mapear APIs internas
4. Identificar versões de software para CVE