# RELATÓRIO DE PENTEST — focusconcursos.com.br

**Início:** 2026-08-21T00:00:00Z  
**Fim:** 2026-08-22T00:00:00Z  
**Alvo:** https://focusconcursos.com.br  
**Tipo:** Web/API Externo Black-Box  
**Modo:** Autônomo (§13)  
**Metodologia:** AGENTS.md + pentest-methodology skill  
**OPSEC:** Tor + proxychains4 ativo

---

## Resumo Executivo

Pentest black-box completo contra o ecossistema focusconcursos.com.br. Foram identificados **20+ subdomínios ativos**, mapeados em 9 IPs AWS/Cloudflare. A stack principal é **Laravel** (admin, lms, integration), **Symfony** (payment), **Next.js** (www3, noticias), **Express** (sac, pagina) e **Microsoft Exchange** (webmail).

**Resultado:** Foram identificadas **2 vulnerabilidades Críticas**, **3 Altas**, **5 Médias** e **5 Baixas/Info**. Nenhum foothold foi obtido (RCE, admin access, ou dados extraídos). A proteção geral é razoável, mas com falhas pontuais graves.

---

## Resumo por Severidade

### 🔴 Crítica (2)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-009 | Symfony Debug Error Exposto | payment.focusconcursos.com.br | ✅ Confirmado |
| F-014 | Payment API Sem Autenticação | payment.focusconcursos.com.br | ✅ Confirmado |

### 🟠 Alta (3)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-012 | API Schema Disclosure (Prettus Validator) | payment.focusconcursos.com.br | ✅ Confirmado |
| F-015 | CKFinder Acessível Sem Auth (Read-Only) | admin.focusconcursos.com.br | ✅ Confirmado |
| F-016 | Admin Dashboard Público | admin.focusconcursos.com.br | ✅ Confirmado |

### 🟡 Média (5)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-003 | CORS Aberto (Access-Control-Allow-Origin: *) | www3.focusconcursos.com.br | ✅ Confirmado |
| F-018 | Logout Endpoint — Server Error 500 Consistente | admin.focusconcursos.com.br | ✅ Confirmado |
| F-019 | S3 Bucket "focus-library" Não Encontrado | admin.focusconcursos.com.br | ✅ Confirmado |
| F-010 | API Routes Expostas (Next.js) | www3.focusconcursos.com.br | ✅ Confirmado |
| F-011 | Next.js .rsc Bypass (estrutura interna) | www3.focusconcursos.com.br | ✅ Confirmado |

### 🟢 Baixa / Info (5)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-001 | Nginx Version Disclosure (1.31.1) | vc.focusconcursos.com.br | ✅ Confirmado |
| F-006 | Laravel Sanctum Ativo (APP_DEBUG=false) | integration.focusconcursos.com.br | ✅ Confirmado |
| F-020 | Credential Stuffing — Nenhuma Credencial Válida | admin.focusconcursos.com.br | ✅ Testado |
| F-007 | Config Files Expostos (.htaccess, web.config) | integration/admin.fc | ✅ Confirmado |
| F-005 | Bucket S3 "fc" Existe (acesso negado) | AWS S3 | ✅ Confirmado |

---

## Detalhamento dos Findings

### 🔴 F-009: Symfony Debug Error Exposto
**Host:** payment.focusconcursos.com.br  
**Severidade:** Crítica  
**Endpoint:** `/docs` retorna 500 com `Symfony\Component\Debug\Exception\FatalErrorException`  
**Reprodução:** `GET /docs` → HTTP 500 com JSON contendo nome da exception e mensagem  
**Impacto:** Vazamento de framework (+ componentes instalados), estrutura do servidor, possibilidade de forçar stack traces completas  
**Evidência:** `evidence/F-009.txt`, `evidence/F-002-symfony-debug-exposure.md`

### 🔴 F-014: Payment API Sem Autenticação
**Host:** payment.focusconcursos.com.br  
**Severidade:** Crítica  
**Endpoint:** `POST /api/v1/transactions` aceita requisições sem qualquer header de autenticação  
**Reprodução:** POST sem token → 200/422 dependendo do payload, sem exigir auth  
**Impacto:** Qualquer pessoa na internet pode tentar criar transações financeiras. Schema completo de validação exposto  
**Evidência:** `evidence/F-014.txt`, `evidence/F-014-payment-api-unauthenticated.txt`

### 🟠 F-012: API Schema Disclosure
**Host:** payment.focusconcursos.com.br  
**Severidade:** Alta  
**Endpoint:** `POST /api/v1/transactions` → retorna erro `Prettus\Validator\Exceptions\ValidatorException` com schema completo  
**Impacto:** Nomes de campos, regras de validação (required, numeric, enum), estrutura de dados exposta  
**Evidência:** `evidence/F-012.txt`, `evidence/F-003-api-schema-disclosure.md`

### 🟠 F-015: CKFinder Acessível Sem Auth
**Host:** admin.focusconcursos.com.br  
**Severidade:** Alta  
**Endpoint:** `/ckfinder/connector?command=Init` → retorna configuração completa sem auth  
**Impacto:** Vazamento de S3 bucket, regra ACL, estrutura de pastas, organização interna  
**Evidência:** `evidence/F-015.txt`

### 🟠 F-016: Admin Dashboard Público
**Host:** admin.focusconcursos.com.br  
**Severidade:** Alta  
**Impacto:** Painel administrativo exposto sem restrição de IP. Login, password reset, assets JS/CSS expostos  
**Evidência:** `evidence/F-016.txt`

---

## Tabela de Hosts e Stack

| Host | Stack | WAF | Status | Prioridade |
|------|-------|-----|--------|------------|
| **focusconcursos.com.br** | AWS ELB (redirect) | ❌ | 301 → www3 | Info |
| **www3.focusconcursos.com.br** | Next.js 14+ / TailwindCSS 3.4.19 | ❌ | 200 | 🟡 Média |
| **noticias.focusconcursos.com.br** | Next.js | ❌ | 200 | 🟢 Baixa |
| **admin.focusconcursos.com.br** | Laravel / MaterializeCSS | ❌ | 200 | 🔴 Alta |
| **lms.focusconcursos.com.br** | Laravel / MaterializeCSS | ❌ | 200 | 🟡 Média |
| **integration.focusconcursos.com.br** | Laravel API | ❌ | JSON 200 | 🟢 Baixa |
| **payment.focusconcursos.com.br** | Symfony / Nginx | ❌ | JSON 200 | 🔴 Crítica |
| **pxa.focusconcursos.com.br** | PixelX | ❌ | 302 → /login | 🟡 Média |
| **sac.focusconcursos.com.br** | Express/Node.js | ✅ Cloudflare | 200 | 🟢 Baixa |
| **pagina.focusconcursos.com.br** | Express/Node.js | ✅ Cloudflare | 200 | 🟢 Baixa |
| **webmail.focusconcursos.com.br** | Microsoft HTTPAPI | ❌ | 301 → /mail | 🟡 Média |
| **vc.focusconcursos.com.br** | Nginx 1.31.1 | ❌ | 301 | 🟢 Baixa |
| **crm.focusconcursos.com.br** | AWS ELB | ❌ | 503 | 🔴 Derrubado |
| **apilms.focusconcursos.com.br** | — | ❌ | 503 | 🔴 Derrubado |
| **email.focusconcursos.com.br** | Caddy | ❌ | 200 | 🟢 Baixa |
| **lps.focusconcursos.com.br** | Nuxt.js/Vue/HighLevel | ✅ Cloudflare | 200 | 🟢 Baixa |

---

## Vetores Explorados

| Vetor | Host | Resultado |
|-------|------|-----------|
| Recon passivo (subdomínios, OSINT, wayback) | Todos | ✅ 67 subs, 28 vivos, 7 emails, 11 pessoas, 5 GitHub repos |
| Recon ativo (portscan, WAF, TLS, vhosts) | Todos | ✅ Sem WAF nos hosts críticos |
| Enumeração (ffuf, content discovery) | 5 hosts | ✅ Admin: login+ckfinder; LMS: login; Payment: Symfony; www3: Next.js |
| Auth bypass / default creds | admin, lms, webmail | ❌ Nenhuma credencial válida |
| SQLi | integration, admin, payment | ❌ Nenhum parâmetro vulnerável |
| IDOR | payment (/api/v1/transactions) | ❌ GET bloqueado (500) |
| Mass assignment | payment (/api/v1/transactions) | ⚠️ POST aceita campos extras (mas 500 interno) |
| CVE-2025-29927 (Next.js bypass) | www3 | ❌ Patched |
| CVE-2021-3129 (Ignition RCE) | admin, lms, integration | ❌ Não instalado |
| CVE-2018-15133 (Laravel deserialization) | admin, lms | ❌ APP_KEY não extraído |
| CKFinder upload | admin | ❌ Erro 109 (backend S3 deletado) |
| Cloud buckets | AWS S3 | ⚠️ `focus-library` deletado; `fc` com acesso negado |
| Cred stuffing | admin | ❌ 9 emails × 22 senhas — sem sucesso |
| Symfony profiler/debug | payment | ❌ _profiler retorna 404 (Kernel processa mas rota não existe) |
| GraphQL introspection | www3, payment | ❌ Não encontrado |
| Next.js .rsc bypass | www3 | ⚠️ Confirmado bypass parcial (path single-segment) |

---

## Pós-Exploração

**Não aplicável** — nenhum foothold (RCE, admin access, creds) foi obtido durante o engagement.

---

## Recomendações Prioritárias

### Imediatas (Críticas)
1. **payment.focusconcursos.com.br** — Exigir autenticação em TODOS os endpoints `/api/*` (especialmente `/api/v1/transactions`)
2. **payment.focusconcursos.com.br** — Desabilitar exibição de erros Symfony em produção; usar página de erro customizada
3. **admin.focusconcursos.com.br** — Restringir acesso ao painel admin por IP/VPN; remover CKFinder público

### Curto Prazo (Altas)
4. **admin.focusconcursos.com.br** — Corrigir logout (GET → 500), implementar CSRF e rate limiting no login
5. **Todos os hosts** — Remover `server_tokens` do nginx; ocultar versões
6. **www3.focusconcursos.com.br** — Restringir CORS (`Access-Control-Allow-Origin: *`); proteger rotas `/api/*`
7. **admin.focusconcursos.com.br** — Remover `/mix-manifest.json` de produção ou proteger com auth

### Médio Prazo
8. Implementar DMARC com `p=reject` e relatórios
9. Remover exports de `.htaccess` e `web.config`
10. Monitorar CNAMEs para serviços externos para evitar subdomain takeover
11. Implementar logging e monitoramento de tentativas de brute force

---

## Timeline

| Data | Evento |
|------|--------|
| 2026-08-21 | Início do engagement |
| 2026-08-21 | Recon passivo: 67 subdomínios, 28 vivos, stack mapeada |
| 2026-08-21 | OSINT: CNPJ, 7 emails, 11 pessoas, 5 GitHub repos |
| 2026-08-21 | Recon ativo: sem WAF nos hosts críticos |
| 2026-08-21 | Enumeração profundida: admin (CKFinder), payment (Symfony), www3 (Next.js) |
| 2026-08-21 | Confirmação: F-009 Symfony Debug, F-014 API sem auth |
| 2026-08-22 | Testes de exploração (CVE, cred-stuffing, CKFinder upload) — sem sucesso |
| 2026-08-22 | Consolidação do relatório |

---

## Arquivos de Evidência

Todos em `evidence/` — 30+ arquivos entre `.txt` e `.md`.

## Considerações Finais

O alvo apresenta uma postura de segurança **regular** — proteção razoável contra ataques comuns (SQLi, XSS, CVE-2025-29927), mas com **falhas críticas** na exposição de APIs de pagamento sem autenticação e vazamento de debug de framework. A aplicação Laravel tem configuração adequada (APP_DEBUG=false, CSRF tokens) mas o CKFinder/S3 legado expõe informações internas.

**Próximo passo recomendado:** Re-testar após correções, com foco especial no payment.fc (API auth + debug). Se acesso admin for obtido, pivoting para APIs internas pode revelar dados sensíveis.