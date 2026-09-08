# PLAN — focusconcursos.com.br

**Início:** 2026-08-26 (reset do zero)
**Fim:** 2026-08-26
**Metodologia:** AGENTS.md + pentest-methodology skill
**OPSEC:** Tor + proxychains4 ativo

**Status:** 🔄 **RETOMADO** — 2026-09-03 — 2Captcha configurado — Caçada profunda

---

## Fases

### Fase 1: Escopo ✅
- [x] Criar estrutura de diretórios
- [x] SCOPE.md
- [x] PLAN.md
- [x] REPORT.md (inicial)
- [x] timeline.log

### Fase 2: Recon Passivo + OSINT ✅
- [x] DNS completo (WHOIS, NS, MX, SPF, DMARC, AXFR)
- [x] Subdomínios (subfinder, amass, crt.sh, assetfinder, wayback) — 70 subs, 28 vivos
- [x] Tech stack (whatweb, httpx, favicon hash) — AWS, Laravel, Next.js, Express, Caddy
- [x] Wayback Machine (endpoints históricos, JS, parâmetros) — 216 URLs
- [x] OSINT (emails, pessoas, breaches, GitHub, theHarvester) — 4 emails, 5 GitHub repos, 2 externos
- [x] Cloud buckets (S3/Azure/GCP naming variations) — fc-static PÚBLICO, fc-backup/upload/files/dev/prod existentes
- [x] Subdomain takeover candidates (CNAME dangling) — manutencao (Vercel), promocao (clkdmg), link (short.io)

### Fase 3: Recon Ativo ✅
- [x] Portscan (nmap via proxychains4) — 13 IPs, 2 hosts diretos (Caddy+SSH, Golang)
- [x] Fingerprint de serviços e versões — n8n v1.120.4, MySQL 8.0.42, Nginx 1.31.1
- [x] Detecção de WAF (wafw00f) — 5 com WAF, 9 sem WAF
- [x] Descoberta de IP real (bypass CDN) — 2 IPs diretos (38.211.129.213, 18.233.104.160)
- [x] Enumeração de vhosts (ffuf) — 3 vhosts no Golang (blog, noticias, vc)
- [x] TLS/certificate analysis — SANs extras: cursosfocus.com.br, focusonline.com.br

### Fase 4: Consolidar Attack Surface ✅
- [x] recon/SUMMARY.md com ranking de payoff (§16) — 22 entradas ranqueadas
- [x] Re-priorizar plano baseado em findings

### Fase 5: Enumeração Profunda ✅
- [x] Content discovery (ffuf/gobuster) em 10 hosts — admin, lms, payment, www3, focusconcursos, noticias, pxa, sac, integration
- [x] JS analysis (endpoints, chaves, tokens) — 36 bundles Next.js, 11 bundles Filament/Livewire, 5 bundles S3
- [x] Param mining (GET/POST) — wayback params
- [x] API endpoints — n8n, CKFinder, Payment, Integration, noticias, www3, sac
- [x] CMS detection — Laravel (admin, lms, integration), Filament (pxa), Next.js (www3, noticias, focusconcursos), Express.js (sac, pagina)

### Fase 6: Ataque Webapp ✅
- [x] Auth bypass / default creds — admin, lms, pxa, n8n: todas falharam
- [x] IDOR/BOLA — payment /api/v1/transactions (GET bloqueado)
- [x] SQLi / NoSQLi — admin, lms, pxa, sac: nenhum vulnerável
- [x] SSTI / Command Injection — não aplicável
- [x] SSRF — n8n webhook test (nenhum exposto)
- [x] XSS — não testado (sem inputs em alvos sem auth)
- [x] Upload — CKFinder: error 109 bloqueado (S3 deletado)
- [x] JWT — HS256, none/None falhou, brute sem sucesso
- [x] GraphQL — www3, noticias: não encontrado
- [x] Mass assignment — payment: POST aceita campos extras (500 interno)

### Fase 7: CVE Research + Exploit ✅
- [x] Mapear CVEs por serviço/versão — 25+ CVEs mapeados para 14 serviços
- [x] Baixar PoCs aplicáveis — 4 PoCs baixados (n8n, Next.js, NextSploit)
- [x] Validar PoCs não-destrutivos — n8n (❌ não-explorável), Next.js bypass (❌ não confirmado), CKFinder (✅ ampliado)

### Fase 8: Pós-Exploração ⬜
- [ ] Privesc — **PULADO** — sem foothold
- [ ] Loot collection — **PULADO** — sem acesso
- [ ] Pivoting — **PULADO** — sem credenciais

### Fase 9: Relatório Final ✅
- [x] Consolidar REPORT.md — 27 findings (8 Críticas, 7 Altas, 6 Médias, 6 Baixas)
- [x] Verificar evidências — 30+ arquivos em evidence/
- [x] timeline.log completo

---

## 🆕 Ciclo 2 — Caçada Profunda (2026-09-03) — ✅ CONCLUSÃO EXPLOIT
**2Captcha chave configurada:** `3ff6b7b9...`

### Resultados do Exploit (Ciclo 2)
| # | Vetor | Resultado | Finding |
|---|-------|-----------|---------|
| 3 | **MySQL brute — wordlist BR** | ❌ 137 senhas brasileiras/empresa, 10+ usuários — todas falharam | F-035 |
| 4 | **Redis brute — wordlist BR** | ❌ 50+ senhas testadas — todas WRONGPASS | F-035 |
| 5 | **n8n API key brute + SSRF** | ❌ 50+ chaves, todas 401 — endpoint /api/v1/credentials descoberto | F-033 |
| 6 | **JWT key confusion** | **✅ SECRET ENCONTRADO: "your-256-bit-secret"** (via scraped-JWT-secrets.txt) | **F-031 🔴 CRÍTICO** |
| 7 | **S3 novos objetos** | ✅ Bucket arquivos.grupofocus.com.br descoberto (objetos públicos) | F-034 🟠 |
| 8 | Takeover confirmation | ✅ manutencao takeover confirmado (F-037, por outro agente) | F-037 |
| — | CVE-2026-21858 re-test | ❌ Nenhum form endpoint novo encontrado | F-032 |
| — | CVE-2025-29927 re-test | ❌ Não confirmado (patched ou WAF interfere) | F-032 |

## Backlog de Vetores (Caçada Contínua §19 — Atualizado)

| # | Vetor | Motivo da Pausa | Gatilho de Retorno |
|---|-------|-----------------|---------------------|
| 1 | MySQL brute (6034) | 137 senhas testadas (BR/empresa), nenhuma funcionou | Credencial vazada em breach/GitHub/docs |
| 2 | Redis brute (6035) | 50+ senhas testadas, todas WRONGPASS | Credencial vazada |
| 3 | n8n API key brute | 50+ chaves testadas, todas 401 | Chave vazada em GitHub/JS/breach |
| 4 | n8n form/webhook | Nenhum form exposto (CVE-2026-21858) | Criação de workflow admin = acesso |
| 5 | CKFinder upload | Requer sessão admin | Sessão admin obtida via JWT forjado |
| 6 | SSH pxa (22) | Publickey only | Chave privada vazada |
| 7 | ~~JWT (appToken)~~ | ~~HS256, brute comum falhou~~ | **✅ RESOLVIDO — Secret "your-256-bit-secret"** |
| 8 | Next.js CVE-2025-29927 | Provável patched (>=14.2.25) | Nova CVE ou bypass |
| 9 | CVE-2026-21858 (n8n) | Sem form endpoint exposto | Workflow com webhook criado |
| 10 | **JWT Forjado — validar impacto** | Secret conhecido, testar endpoints reais | Imediato — verificar se JWT forjado acessa APIs protegidas |

## Objetivos de Alto Valor — Status Atual
1. ~~Acesso admin~~ ❌ — Nenhum foothold (mas JWT forjável agora)
2. ~~Acesso financeiro~~ ❌ — Schema exposto mas transações bloqueadas
3. ~~Acesso a dados/PII~~ ❌ — MySQL creds não obtidos
4. ~~Acesso a infra (AWS)~~ ❌ — S3 público sem creds
5. ~~Acesso a email~~ ❌ — Webmail sem creds
6. **🆕 JWT Forjável** ✅ — Secret "your-256-bit-secret" encontrado! Token HS256 completamente forjável.