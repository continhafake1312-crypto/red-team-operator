# RELATÓRIO DE PENTEST — focusconcursos.com.br

**Início:** 2026-08-26  
**Fim:** Em andamento  
**Alvo:** https://focusconcursos.com.br  
**Tipo:** Web/API Externo Black-Box  
**Modo:** Autônomo (§13) — Reset do zero por ordem do operador  
**Metodologia:** AGENTS.md + pentest-methodology skill  
**OPSEC:** Tor + proxychains4 ativo (IP: 107.189.30.236)  
**2Captcha:** Configurado

---

## Resumo Executivo

Pentest black-box em andamento contra o ecossistema focusconcursos.com.br. Fases 1-5 concluídas, Fase 6 (Ataque Webapp) em andamento.

**Até o momento:** 70 subdomínios mapeados, 28 vivos, 13 IPs de origem real. Três hosts críticos sem WAF identificados. **CKFinder exposto sem auth** revela bucket S3 (`focus-library`) com 1249+ arquivos públicos. Painel admin apresenta CKFinder acessível, n8n tem user enumeration. API de pagamentos expõe schema completo sem auth. 20 findings catalogados (7 Críticos, 7 Altos, 5 Médios, 1 Info).

---

## Resumo por Severidade

### 🔴 Crítica (7)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-001 | SSH Exposto (Porta 22) + Caddy sem WAF | 38.211.129.213 (pxa) | ✅ Confirmado |
| F-002 | JWT Cookie sem HttpOnly/Secure | focusconcursos.com.br | ✅ Confirmado |
| F-003 | CORS Wildcard (Access-Control-Allow-Origin: *) | www3, sac, focusconcursos, pagina | ✅ Confirmado |
| F-017 | MySQL 8.0.42 Exposto Publicamente (porta 6034) | 18.233.104.160 | ✅ Confirmado |
| F-018 | Redis Exposto Publicamente (porta 6035) | 18.233.104.160 | ✅ Confirmado |
| F-019 | n8n Workflow v1.120.4 Exposto (dev mode) | 18.233.104.160:80 | ✅ Confirmado |
| **F-021** | **CKFinder Connector Exposto sem Auth (S3 Leak)** | **admin.focusconcursos.com.br** | **✅ Novo** |

### 🟠 Alta (7)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-004 | Backend Golang Exposto sem WAF | 18.233.104.160 | ✅ Confirmado |
| F-005 | Caddy + pxa sem WAF | 38.211.129.213 | ✅ Confirmado |
| F-006 | nginx/1.31.1 Versão Exposta | vc.focusconcursos.com.br | ✅ Confirmado |
| F-007 | 6 Hosts sem Security Headers | admin, lms, www3, payment, focusconcursos, mobile | ✅ Confirmado |
| F-008 | XSRF-TOKEN sem HttpOnly | admin, lms, pxa, integration | ✅ Confirmado |
| F-009 | Certificado TLS Expirado (*.focusonline.com.br) | AWS ALB | ✅ Confirmado |
| **F-022** | **Payment API Transaction Schema Disclosure** | **payment.focusconcursos.com.br** | **✅ Novo** |

### 🟡 Média (5)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-010 | Traefik DEFAULT CERT | apilms.focusconcursos.com.br | ✅ Confirmado |
| F-011 | 3 Painéis Admin Expostos | admin, lms, pxa | ✅ Confirmado |
| F-012 | HSTS Ausente no ALB (10 IPs) | AWS ALB Pool | ✅ Confirmado |
| F-013 | Info Leak via Headers | vário | ✅ Confirmado |
| F-020 | n8n Dev Mode sem Sentry DSN | 18.233.104.160 | ✅ Confirmado |
| **F-023** | **n8n User Enumeration (admin@focusconcursos.com.br)** | **18.233.104.160** | **✅ Novo** |

### 🟢 Baixa / Info (4)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-014 | Domínios Extras via SANs | cursosfocus.com.br, focusonline.com.br | ✅ Confirmado |
| F-015 | Takeover Candidates | manutencao, promocao, link | ✅ Confirmado |
| F-016 | ALB DNS Exposto | loadbalancer-concursos-...elb.amazonaws.com | ✅ Confirmado |
| **F-024** | **Admin Logout Server Error (Info Disclosure)** | **admin.focusconcursos.com.br** | **✅ Novo** |

---

## Detalhamento dos Findings

### 🔴 F-001: SSH Exposto (Porta 22) + Caddy sem WAF
**Host:** 38.211.129.213 (pxa.focusconcursos.com.br)  
**Severidade:** Crítica  
**Detalhe:** Servidor Caddy que hospeda o Pixel X App (pxa.focusconcursos.com.br) tem porta SSH (22) aberta publicamente. Sem WAF ou CDN na frente. Acesso direto ao servidor via IP real.  
**Vetores:** SSH brute-force, CVE OpenSSH, enumeração de usuários, acesso shell potencial.  
**Evidência:** `recon/active/nmap_webports_38.211.129.213.*`

### 🔴 F-002: JWT Cookie sem HttpOnly/Secure
**Host:** focusconcursos.com.br (principal)  
**Severidade:** Crítica  
**Detalhe:** Cookie `@focusconcursos:appToken` contém JWT (`eyJ...`) sem flags HttpOnly, Secure ou SameSite. Acessível via JavaScript no frontend. Validade de 1 ano.  
**Impacto:** Qualquer XSS no domínio pode extrair o token JWT e comprometer sessões.  
**Evidência:** `recon/active/headers_focusconcursos.com.br.txt`

### 🔴 F-003: CORS Wildcard (*)
**Hosts:** www3.focusconcursos.com.br, sac.focusconcursos.com.br, focusconcursos.com.br, pagina.focusconcursos.com.br  
**Severidade:** Crítica  
**Detalhe:** Headers `Access-Control-Allow-Origin: *` permitem que qualquer site faça requisições cross-origin e leia respostas.  
**Impacto:** Exfiltração de dados via requisições cross-site. CSRF em APIs.  
**Evidência:** `recon/active/HEADERS_ANALYSIS.md`

### 🔴 F-017: MySQL 8.0.42 Exposto Publicamente
**Host:** 18.233.104.160:6034  
**Severidade:** Crítica  
**Detalhe:** MySQL 8.0.42 rodando na porta 6034 exposto diretamente na internet. Auth plugin mysql_native_password. Thread ID válido obtido (serviço ativo).  
**Impacto:** Força bruta de credenciais, acesso a banco de dados de produção (alunos, transações, dados sensíveis).  
**Evidência:** `enum/18.233.104.160/nmap_6034_6035.txt`

### 🔴 F-018: Redis Exposto Publicamente
**Host:** 18.233.104.160:6035  
**Severidade:** Crítica  
**Detalhe:** Redis key-value store exposto na porta 6035. Requer autenticação (NOAUTH required).  
**Impacto:** Sessões de usuário, cache de dados sensíveis expostos. Se credencial for fraca, acesso total.  
**Evidência:** `enum/18.233.104.160/nmap_6034_6035.txt`

### 🔴 F-019: n8n Workflow Automation Exposto (v1.120.4)
**Host:** 18.233.104.160:80  
**Severidade:** Crítica  
**Detalhe:** n8n v1.120.4 rodando em modo development. API REST em /api/v1/ requer X-N8N-API-KEY. Workflows, credenciais, executions expostos se chave for obtida.  
**Impacto:** Automação de workflows, acesso a integrações (email, DB, cloud), pivoting.  
**Evidência:** `enum/18.233.104.160/n8n_endpoints.txt`

### 🔴 F-021: CKFinder Connector Exposto sem Autenticação (S3 Leak)
**Host:** admin.focusconcursos.com.br  
**Severidade:** Crítica  
**Detalhe:** O endpoint `/ckfinder/connector` está acessível publicamente sem autenticação. CKFinder expõe 2 resource types (Arquivos + Imagens) apontando para bucket S3 `focus-library` na região `sa-east-1`. 1.249+ arquivos enumeráveis. ACL 1023 (Full Control). Bucket S3 permite leitura pública dos arquivos sem autenticação.  
**Impacto:** Leitura de 1249+ arquivos (imagens, documentos, PDFs), exposição de bucket S3, potencial exfiltração de dados internos.  
**Vetores:** Enumeração de arquivos, download de documentos sensíveis, upload se autenticação for obtida.  
**Evidência:** `evidence/F-021.txt`

### 🟠 F-022: Payment API Transaction Schema Disclosure
**Host:** payment.focusconcursos.com.br  
**Severidade:** Alta  
**Detalhe:** POST em `/api/v1/transactions` sem autenticação retorna validação completa do schema, revelando todos os campos da transação: customer (id, name, email, phone, CPF), address (street, number, neighborhood, zipcode, city, UF), items (product_id, name, price), payment_method, installments, card_hash.  
**Impacto:** Schema completo exposto permite crafting de payloads maliciosos. Informações sensíveis (CPF, telefone) identificadas como campos obrigatórios. Potencial criação de transações fraudulentas.  
**Evidência:** `evidence/F-022.txt`

### 🟡 F-023: n8n User Enumeration (admin@focusconcursos.com.br)
**Host:** 18.233.104.160:80  
**Severidade:** Média  
**Detalhe:** API `/rest/login` do n8n diferencia entre usuário inexistente ("Invalid email address") e senha incorreta ("Wrong username or password"). admin@focusconcursos.com.br confirmado como usuário ativo. Rate limit de 5/min implementado.  
**Impacto:** Enumeração de usuários válidos para ataques de força bruta direcionados.  
**Evidência:** `evidence/F-023.txt`

### 🟢 F-024: Admin Logout Server Error (Info Disclosure)
**Host:** admin.focusconcursos.com.br  
**Severidade:** Baixa  
**Detalhe:** GET `/logout` retorna HTTP 500 com página de erro Laravel, confirmando stack tecnológico e expondo cookies de sessão mesmo no erro.  
**Impacto:** Confirmação do framework (Laravel/Nginx) e exposição de cookies de sessão.  
**Evidência:** `evidence/F-024.txt`

### 🟠 F-004: Backend Golang Exposto sem WAF
**Host:** 18.233.104.160 (noticias, apilms, vc)  
**Severidade:** Alta  
**Detalhe:** Servidor Golang direto (Traefik) sem CDN, WAF ou proxy reverso. IP real exposto. Roteamento real de vhosts (blog, noticias, vc).  
**Vetores:** Ataque direto ao backend, bypass de restrições do CloudFront, descoberta de APIs internas.  
**Evidência:** `recon/active/ACTIVE.md`

---

## Tabela de Hosts e Stack (Atualizado)

| Host | Stack | WAF | Status | Prioridade |
|------|-------|-----|--------|------------|
| **38.211.129.213** (pxa) | Caddy/Go + SSH | ❌ | 🔴 Crítico | 🔴 #1 |
| **18.233.104.160** (noticias/apilms/vc) | Golang/Traefik | ❌ | 🔴 Crítico | 🔴 #2 |
| **admin.focusconcursos.com.br** | Laravel/Nginx | ❌ | 302 → /login | 🟠 #3 |
| **lms.focusconcursos.com.br** | Laravel/Nginx | ❌ | 302 → /login | 🟠 #4 |
| **pxa.focusconcursos.com.br** | Pixel X App (Caddy) | ❌ | 302 → /login | 🟠 #5 |
| **www3.focusconcursos.com.br** | Next.js | ❌ | 200 | 🟠 #6 |
| **focusconcursos.com.br** | Next.js/CloudFront | ✅ CloudFront | 200 | 🟠 #7 |
| **integration.focusconcursos.com.br** | Laravel API/Nginx | ❌ | 200 JSON | 🟠 #8 |
| **payment.focusconcursos.com.br** | Nginx API | ❌ | 200 JSON | 🟠 #9 |
| **sac.focusconcursos.com.br** | Express.js/Node | ✅ Cloudflare | 200 | 🟡 Média |
| **noticias.focusconcursos.com.br** | Next.js | ❌ | 200 | 🟡 Média |
| **vc.focusconcursos.com.br** | nginx/1.31.1 | ✅ CloudFront | 301 | 🟡 Média |
| **webmail.focusconcursos.com.br** | Microsoft Exchange | ❌ | 301 → /mail | 🟢 Baixa |
| **cdn.focusconcursos.com.br** | GoCache + S3 | 🟡 ELB | 403 | 🟡 Média |

---

## Vetores Explorados (até agora)

| Vetor | Host | Resultado |
|-------|------|-----------|
| Recon passivo (subdomínios, OSINT, wayback) | Todos | ✅ 70 subs, 28 vivos, 4 emails, 1 bucket público, 3 takeover candidates |
| Recon ativo (portscan, WAF, TLS, vhosts) | 13 IPs | ✅ 2 hosts diretos (Caddy+SSH, Golang), 9 hosts sem WAF |
| DNS enum + cert SANs | Todos | ✅ Domínios extras: cursosfocus.com.br, focusonline.com.br |

---

## Cronologia

| Data | Evento |
|------|--------|
| 2026-08-26 | Reset do engagement (ordem do operador) |
| 2026-08-26 | Fase 1: Escopo — estrutura, SCOPE, PLAN, REPORT, timeline |
| 2026-08-26 | Fase 2: Recon Passivo — 70 subdomínios, 28 vivos, fc-static S3 público |
| 2026-08-26 | Fase 3: Recon Ativo — 13 IPs, SSH exposto, JWT leak, CORS wildcard |
| 2026-08-26 | Fase 4: Attack Surface Consolidado — SUMMARY.md com 22 entradas |
| 2026-08-26 | **Fase 5: Enumeração Profunda — EM ANDAMENTO** |
| 2026-08-26 | **Fase 6/7: CVE Research — CONCLUÍDA** — 5 CVEs críticos, 3 com PoC, múltiplos PoCs baixados |

---

## Findings de CVE — Prioridades de Exploração

### 🥇 CVE-2026-21858 — n8n UNAUTH RCE (CVSS 10.0) 🔴 CRÍTICO
| Campo | Valor |
|:------|:------|
| **Serviço** | n8n v1.120.4 |
| **Host** | 18.233.104.160:80 |
| **Descrição** | UNAUTH remote file access via form-based workflows (>=1.65.0 < 1.121.0). Workflows expostos com formulários permitem path traversal. |
| **Aplicável** | ✅ **SIM** — v1.120.4 está no range vulnerável |
| **Pré-condições** | Nenhuma (UNAUTH) |
| **PoC** | ✅ `exploit/pocs/CVE-2026-21858/exploit.py` |
| **Ação** | Executar PoC para confirmar file read/RCE |

### 🥇 CVE-2025-29927 — Next.js Middleware Bypass (CVSS 9.1) 🔴 CRÍTICO
| Campo | Valor |
|:------|:------|
| **Serviço** | Next.js 14+ |
| **Host** | www3.focusconcursos, noticias.focusconcursos, focusconcursos |
| **Descrição** | Authorization bypass via `x-middleware-subrequest` header. Permite acessar rotas protegidas pelo middleware. |
| **Aplicável** | ✅ **SIM** — headers `x-middleware-rewrite` confirmam middleware ativo |
| **Pré-condições** | Nenhuma (UNAUTH) |
| **PoC** | ✅ `exploit/pocs/CVE-2025-29927/` e `exploit/pocs/NextSploit/` |
| **Ação** | Testar bypass em rotas admin/protegidas |

### 🥇 Laravel Debug/Pulse RCE 🔴 CRÍTICO (A TESTAR)
| Campo | Valor |
|:------|:------|
| **Serviço** | Laravel (admin, lms, integration, pxa) |
| **Descrição** | Múltiplas vulnerabilidades possíveis: Ignition RCE (CVE-2021-3129), Laravel Pulse RCE (Sploit 52319), Debug Mode RCE (Sploit 49424) |
| **Aplicável** | ⚠️ **A testar** — debug mode parece desligado, mas Pulse pode estar ativo |
| **Ação** | Testar `/_ignition/execute-solution`, `/pulse`, `vendor/phpunit/...` |

### 🥈 CKFinder File Upload 🟠 ALTO
| Campo | Valor |
|:------|:------|
| **Serviço** | CKFinder 3.x em admin.focusconcursos |
| **Descrição** | CKFinder ativo com ACP 1023 (full access) para upload de arquivos. deniedExtensions vazio. Upload de arquivos arbitrários possível com sessão admin. |
| **Aplicável** | ✅ **SIM** — CKFinder ativo e configurado |
| **Ação** | Obter sessão admin e fazer upload de shell |

### 🥈 n8n Pyodide/Code Node Sandbox Bypass 🟠 ALTO
| Campo | Valor |
|:------|:------|
| **Serviço** | n8n v1.120.4 |
| **CVE** | CVE-2025-68668 (CVSS 9.9), CVE-2025-68697 (CVSS 7.1) |
| **Descrição** | Authenticated RCE via Python Code Node (Pyodide) ou Code Node (helper functions) |
| **Ação** | Obter credenciais n8n e testar sandbox bypass |

---

## PoCs Baixados

| PoC | Caminho | Uso |
|:----|:--------|:----|
| CVE-2026-21858 | `exploit/pocs/CVE-2026-21858/exploit.py` | Testar n8n UNAUTH RCE |
| CVE-2025-68613 | `exploit/pocs/CVE-2025-68613/` | Nuclei template para n8n |
| CVE-2025-29927 | `exploit/pocs/CVE-2025-29927/exploit-test.js` | Testar Next.js middleware bypass |
| NextSploit | `exploit/pocs/NextSploit/NextSploit.py` | Scanner automático Next.js |
| Laravel Pulse RCE | `searchsploit -x php/webapps/52319.py` | Laravel Pulse RCE |
| Laravel Debug RCE | `searchsploit -x php/webapps/49424.py` | Laravel Debug RCE |

---

## Próximos Passos

1. ✅ Recon Passivo + OSINT
2. ✅ Recon Ativo
3. ✅ Attack Surface Consolidado
4. ✅ Enumeração Profunda
5. ✅ **CVE Research** — 5 críticos, 3 com PoC
6. 🔄 **Ataque Webapp + Exploit** — validar CVEs identificados
7. ⬜ Pós-Exploração (se foothold)
8. ⬜ Relatório Final

---

*Relatório incremental — atualizado ao final de cada fase.*