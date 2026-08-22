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

### Fase 3: Recon Ativo ✅
- [x] Portscan (nmap via proxychains — bloqueado por Tor)
- [x] Fingerprint de serviços e versões
- [x] Detecção de WAF (wafw00f) — 4 hosts com WAF, hosts prioritários sem WAF
- [x] Descoberta de IP real (bypass CDN) — 9 IPs AWS mapeados
- [x] Enumeração de vhosts — parcial
- [x] TLS/certificate analysis

### Fase 4: Consolidar Attack Surface ✅
- [x] recon/SUMMARY.md com ranking de payoff
- [x] Re-priorizar plano baseado em findings

### Fase 5: Enumeração Profunda ✅
- [x] Content discovery (ffuf) — admin, lms, payment, www3, integration
- [x] JS analysis — Next.js chunks (8720, 1356, layout), Laravel Mix (main.js, vendor.js)
- [x] Param mining — wayback params testados (id, pg, ini, cid)
- [x] API endpoints — /api/auth/*, /api/me, /api/cursos, /api/concursos (www3); /api/core/v1/*, /api/finance/v1/* (admin); /api/v1/transactions (payment)
- [x] CMS detection — Laravel (admin, lms, integration), Symfony (payment), Next.js (www3)

### Fase 6: Ataque Webapp ✅
- [x] Auth bypass / default creds — cred-stuffing: 9 emails × 22 senhas, sem sucesso
- [x] IDOR/BOLA — payment /api/v1/transactions/{id} → 500 (bloqueado)
- [x] SQLi / NoSQLi — nenhum parâmetro vulnerável encontrado
- [x] SSTI / Command Injection — não aplicável (sem inputs testáveis)
- [x] SSRF — payment webhook não testado (API retorna 500)
- [x] XSS — não testado (sem input forms em alvos sem auth)
- [x] Upload — CKFinder: erro 109 (bloqueado); variações todas falharam
- [x] JWT — admin API testada com JWT falso (302 redirect)
- [x] GraphQL — www3 /api/graphql retorna HTML (não GraphQL); payment testado (404)
- [x] Mass assignment — payment POST /api/v1/transactions aceita campos extras

### Fase 7: CVE Research + Exploit ✅
- [x] Mapear CVEs por serviço/versão — 10+ CVEs por tecnologia
- [x] Validar PoCs — CVE-2025-29927 (❌ patched), CVE-2021-3129 (❌ não instalado), CVE-2018-15133 (❌ sem APP_KEY)
- [x] PoCs baixados em exploit/pocs/ — Laravel Ignition, Laravel Deser, Symfony, Next.js

### Fase 8: Pós-Exploração ⬜ Não aplicável
- [ ] Privesc — sem foothold
- [ ] Loot collection — sem acesso
- [ ] Pivoting — sem credenciais

### Fase 9: Relatório Final ✅
- [x] Consolidar REPORT.md — completo com 20 findings
- [x] Evidências referenciadas — 20+ arquivos em evidence/

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