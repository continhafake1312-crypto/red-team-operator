# Attack Surface — promisse.com.br (PromissePay)

**Data**: 2026-08-20T05:55 UTC  
**Classificação**: Gateway de Pagamentos Brasileiro (PIX, boleto, cartão)  
**Infra**: Vercel (main) + Railway.app (API) + Cloudflare (DNS/WAF) + GoDaddy (registro)

---

## Ranking de Payoff

### 🔴 ALTA PRIORIDADE — MÁXIMO PAYOFF

| # | Alvo | Host | Vetor | Payoff | Detalhe |
|---|------|------|-------|--------|---------|
| 1 | **API** | api.promisse.com.br | **IDOR/BOLA/Auth Bypass** | 🔴 Crítico | CORS permissivo (`*`+credentials), REST endpoints documentados (PIX cobranças, saques, saldo, webhooks). Railway.app backend. |
| 2 | **API Docs** | promisse.com.br/docs | **Information Disclosure** | 🔴 Crítico | Documentação completa da API exposta publicamente sem auth. Spec de todos endpoints, schemas, exemplos. |
| 3 | **Site Principal** | promisse.com.br (via Vercel IPs) | **Full Fuzzing sem WAF** | 🔴 Alto | 6 IPs Vercel reais sem WAF. Permite fuzzing agressivo, bypass de rate limiting do Cloudflare. |
| 4 | **Status** | status.promisse.com.br | **Deployment Takeover** | 🔴 Alto | Deployment Vercel removido mas DNS ainda aponta. Retorna `DEPLOYMENT_NOT_FOUND`. Possível retomada de deployment. |

### 🟡 MÉDIA PRIORIDADE

| # | Alvo | Host | Vetor | Payoff | Detalhe |
|---|------|------|-------|--------|---------|
| 5 | **Frontend** | promisse.com.br | **JS Analysis** | 🟡 Médio | Chunks Next.js (`/_next/static/chunks/`) podem conter endpoints, chaves de API, tokens embutidos. |
| 6 | **reCAPTCHA** | promisse.com.br | **Cross-site Abuse** | 🟡 Médio | Chave Enterprise `6LffCt4sAAAAAI5Ft_mB-V4SVxdggrUMFnPGNeqa` exposta no HTML. |
| 7 | **Railway** | api.promisse.com.br | **Bypass Cloudflare** | 🟡 Médio | Railway edge em `ber1`. Possível descobrir IP real via shodan/censys/subdomain fuzzing. |
| 8 | **Wildcard DNS** | *.promisse.com.br | **Subdomain Fuzzing** | 🟡 Médio | Wildcard ativo mas todos vão para Cloudflare. Possível encontrar subdomínio real não-proxied. |
| 9 | **CORS** | api.promisse.com.br | **CSRF/CORS Abuse** | 🟡 Médio | `Access-Control-Allow-Origin: *` com `Access-Control-Allow-Credentials: true` vulnerável a ataques cross-origin. |

### 🟢 BAIXA PRIORIDADE

| # | Alvo | Vetor | Payoff |
|---|------|-------|--------|
| 10 | Pessoas (Joãozinho/João Pedro F. Neves) | OSINT/Social Engineering | Baixo |
| 11 | Domínio novo (2025-12-05) | Pouco histórico para wayback/crt.sh | Info |
| 12 | Sem MX/SPF | Sem spoofing via email | Info |
| 13 | HSTS ativo | Mitiga SSL stripping | Info |
| 14 | TLS 1.0/1.1 na API | PCI non-compliant | Info |

---

## Infraestrutura Detalhada

### Site Principal (promisse.com.br)
| Componente | Detalhe |
|------------|---------|
| **Hosting** | Vercel (Edge network) |
| **Framework** | Next.js (App Router, Turbopack, RSC) |
| **IPs Reais** | 216.150.16.129, 216.150.1.129, 216.150.1.65, 216.150.16.65, 216.150.1.1, 216.150.16.1 |
| **WAF** | ❌ Nenhum (bypass Cloudflare total) |
| **CDN** | Cloudflare (DNS only) + Vercel |
| **SSL** | TLS 1.2/1.3, Vercel edge cert |

### API (api.promisse.com.br)
| Componente | Detalhe |
|------------|---------|
| **Hosting** | Railway.app (não Vercel!) |
| **Edge** | Railway Berlin (`ber1`) |
| **WAF** | ✅ Cloudflare (Rate limiting, challenge) |
| **IPs (CF)** | 104.21.20.114, 172.67.192.97 |
| **IP Real** | ❌ Não descoberto |
| **CORS** | `*` + `Access-Control-Allow-Credentials: true` + methods: OPTIONS,GET,POST,PUT,PATCH,DELETE + headers: Authorization, App, Content-Type |

### Status (status.promisse.com.br)
| Componente | Detalhe |
|------------|---------|
| **Hosting** | Vercel |
| **Status** | Deployment removido/suspenso (`DEPLOYMENT_NOT_FOUND`) |
| **Takeover** | Potencial (DNS ainda aponta para Vercel) |

---

## Objetivos de Alto Valor

- [x] **Acesso interno (foothold)** — API Railway endpoint com CORS permissivo, sem WAF no site principal
- [x] **Acesso administrativo (admin/RCE)** — Docs expostos podem conter secrets
- [x] **Acesso financeiro (PIX/pagamentos)** — API de gateway de pagamentos
- [x] **Acesso a dados/PII (clientes)** — API endpoints de consulta de saldo/dados

---

## Próximo Passo Imediato

**Enumeração Profunda (Fase 5)** — delegar ao especialista `enum`:
1. Fuzzing de diretórios/arquivos no site principal (Vercel IP, sem WAF)
2. Análise de JS chunks do Next.js
3. Enumeração de endpoints da API via /docs e fuzzing
4. Testes básicos de autenticação/autorização nos endpoints da API
5. Tentativa de descoberta do IP real do Railway
6. Fuzzing de subdomínios wildcard para encontrar endpoints não-proxied