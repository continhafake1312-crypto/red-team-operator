# PLAN — focusconcursos.com.br

**Início:** 2026-08-26 (reset do zero)
**Metodologia:** AGENTS.md + pentest-methodology skill
**OPSEC:** Tor + proxychains4 ativo

---

## Fases

### Fase 1: Escopo ⬜
- [ ] Criar estrutura de diretórios
- [ ] SCOPE.md
- [ ] PLAN.md
- [ ] REPORT.md (inicial)
- [ ] timeline.log

### Fase 2: Recon Passivo + OSINT ⬜
- [ ] DNS completo (WHOIS, NS, MX, SPF, DMARC, AXFR)
- [ ] Subdomínios (subfinder, amass, crt.sh, assetfinder, wayback)
- [ ] Tech stack (whatweb, httpx, favicon hash)
- [ ] Wayback Machine (endpoints históricos, JS, parâmetros)
- [ ] OSINT (emails, pessoas, breaches, GitHub, theHarvester)
- [ ] Cloud buckets (S3/Azure/GCP naming variations)
- [ ] Subdomain takeover candidates (CNAME dangling)

### Fase 3: Recon Ativo ⬜
- [ ] Portscan (nmap via proxychains4 — rate limited)
- [ ] Fingerprint de serviços e versões
- [ ] Detecção de WAF (wafw00f)
- [ ] Descoberta de IP real (bypass CDN)
- [ ] Enumeração de vhosts (ffuf)
- [ ] TLS/certificate analysis

### Fase 4: Consolidar Attack Surface ⬜
- [ ] recon/SUMMARY.md com ranking de payoff (§16)
- [ ] Re-priorizar plano baseado em findings

### Fase 5: Enumeração Profunda ✅
- [x] Content discovery (ffuf/gobuster) em hosts prioritários
- [x] JS analysis (endpoints, chaves, tokens)
- [x] Param mining (GET/POST)
- [x] API endpoints (Swagger, OpenAPI, GraphQL)
- [x] CMS detection (wpscan, joomscan, droopescan)

### Fase 6: Ataque Webapp 🔄
- [x] Auth bypass / default creds — *Parcial (testes login admin)*
- [x] IDOR/BOLA — *Payment API schema exposto*
- [ ] SQLi / NoSQLi
- [ ] SSTI / Command Injection
- [ ] SSRF
- [ ] XSS (reflected/stored/DOM)
- [x] Upload bypass — *CKFinder file upload discovery*
- [ ] JWT manipulation
- [ ] GraphQL introspection/IDOR
- [ ] Mass assignment

### Fase 7: CVE Research + Exploit ✅
- [x] Mapear CVEs por serviço/versão (NVD, GHSA, Exploit-DB) — **5 críticos, 14+ CVEs mapeados**
- [x] Baixar PoCs aplicáveis — **4 PoCs clonados (CVE-2026-21858, CVE-2025-68613, CVE-2025-29927, NextSploit)**
- [x] **VALIDAR PoCs** — **Concluída (F-025 a F-030)**
- [x] **CVE-2025-29927** — Testado em 3 hosts, não confirmado vulnerável
- [x] **CVE-2026-21858** — n8n sem form endpoint exposto, não explorável
- [x] **CKFinder Ampliação** — Subdiretórios descobertos, S3 direto confirmado
- [x] **MySQL/Redis Brute** — Senhas comuns falharam, serviços permanecem expostos
- [x] **JWT Analysis** — Token decodificado, none/None ataque testado
- [x] **SSH Brute** — Apenas publickey, sem vetor via senha

### Fase 8: Pós-Exploração ⬜ (se foothold)
- [ ] Privesc
- [ ] Loot collection
- [ ] Pivoting

### Fase 9: Relatório Final ⬜
- [ ] Consolidar REPORT.md
- [ ] Verificar evidências
- [ ] timeline.log completo

---

## Backlog de Vetores (Caçada Contínua §19)
*Vetores identificados mas não priorizados, com motivo da pausa e gatilho de retorno.*

| # | Vetor | Motivo da Pausa | Gatilho de Retorno |
|---|-------|-----------------|---------------------|
| — | — | — | — |

---

## Objetivos de Alto Valor (Prioridade de Payoff)
1. **Acesso admin** — painel administrativo (RCE / dados sensíveis)
2. **Acesso financeiro** — API de pagamentos (transações)
3. **Acesso a dados** — PII de alunos/usuários (LMS, banco de dados)
4. **Acesso a infra** — credenciais AWS, chaves de API, tokens
5. **Acesso a email** — webmail corporativo (pivoting)