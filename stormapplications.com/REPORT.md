# Relatório de Pentest — stormapplications.com

## Metadados

| Campo | Valor |
|-------|-------|
| Alvo | `stormapplications.com` (StorM Applications) |
| URL | `https://www.stormapplications.com/` |
| CNPJ | `56.913.071/0001-30` |
| Tipo | Black-box Web/API Externo |
| Início | `2026-08-23T00:00:00Z` |
| Status | **Pausado — aguardando próximos passos** |
| Empresa | StorM Applications — plataforma de bots Discord com vendas PIX/tickets/verificação |
| Stack | Next.js + Vercel + Cloudflare (frontend) / Discloud + AWS + Caddy (backend) |

## Sumário Executivo

Este pentest black-box no domínio **stormapplications.com** identificou **10 findings** distribuídos entre Crítico (1), Alto (3), Médio (3), Baixo (1) e Informativo (2). O reconhecimento passivo mapeou 13 subdomínios, 10 hosts vivos, e revelou uma infraestrutura dividida entre frontend Next.js (Vercel/Cloudflare) e backend Discloud (AWS eu-central-1 com Caddy reverse proxy).

**Achado mais crítico (F-006):** O endpoint `/status` em `api-beta.stormapplications.com` expõe dados internos completos do backend Discloud — 28.664 usuários, 643 apps, 106+ IDs de bots Discord (incluindo bot com permissão ADMINISTRATOR), preços de planos e addons, e configuração de OAuth (redirect_uri). Acesso via bypass de 403 com header `Authorization: Bearer <qualquer>`.

**Bypass de autenticação (F-002):** O middleware Caddy/Discloud aceita **qualquer** valor nos headers `Authorization: Bearer`, `x-storm-admin-key` ou `x-admin-key` como bypass do bloqueio 403 do Cloudflare, permitindo acesso ao backend.

**CORS misconfiguration (F-001):** `Access-Control-Allow-Origin: *` combinado com exposição de headers internos de autenticação (`x-storm-admin-key`, `x-admin-key`, `x-storm-audit-summary`, `x-discord-actor-id`) possibilita ataques CSRF contra usuários autenticados.

**Acesso administrativo não foi obtido** — o painel admin (`/admin`) em `api-beta.stormapplications.com` retorna `ADMIN_AUTH_REQUIRED`, indicando proteção adicional além do bypass 403. A autenticação é via Discord OAuth, cujo client_secret não foi encontrado em repositórios públicos ou JS bundles analisados.

**CVE Research:** Foram mapeados 26 CVEs aplicáveis ao stack, com destaque para:
- **CVE-2026-27590** (CVSS 9.8) — Caddy FastCGI path splitting → RCE
- **CVE-2019-19919** (CVSS 9.8) — Handlebars Prototype Pollution → RCE
- **CVE-2026-27587** (CVSS 9.1) — Caddy path matcher bypass → bypass de admin

## Tabela de Findings

| ID | Severidade | Host | Tipo | Descrição | Status |
|----|-----------|------|------|-----------|--------|
| F-006 | **Crítica** | api-beta.stormapplications.com | Information Disclosure | Endpoint `/status` vaza 28.664 usuários, 643 apps, 106+ bot IDs Discord, preços, redirect_uri OAuth | **Confirmado** |
| F-001 | **Alta** | mng.stormapplications.com | CORS Misconfiguration | `Access-Control-Allow-Origin: *` com headers internos de autenticação expostos | **Confirmado** |
| F-002 | **Alta** | mng.stormapplications.com | Authentication Bypass | 403 bypass via headers `Authorization`/`x-storm-admin-key` com qualquer valor | **Confirmado** |
| F-007 | **Alta** | api-beta.stormapplications.com | Admin Panel Exposed | Painel admin em `/admin/*` retorna `ADMIN_AUTH_REQUIRED` — acessoível via bypass 403 | **Confirmado** |
| F-003 | **Média** | mng.stormapplications.com | Info Disclosure | AWS instance IDs vazados: `i-0a06f4c3917127575`, `i-028e90aad8ec2bb5f` (eu-central-1) | **Confirmado** |
| F-009 | **Média** | www.stormapplications.com | Route Mapping | Mapeamento completo de 15+ rotas Next.js, incluindo rotas protegidas (/dashboard, /apps, /wallet) | **Confirmado** |
| F-005 | **Média** | stormapplications.com | Subdomain Enumeration | 13 subdomínios identificados, 10 hosts vivos, infraestrutura mapeada | **Confirmado** |
| F-010 | **Baixa** | wallet.stormapplications.com | Health Endpoint | `/health` expõe versão da API `1.0.0` sem autenticação | **Confirmado** |
| F-004 | **Info** | mng.stormapplications.com | Fingerprinting | Stack identificado: discloud.com + Caddy + Cloudflare | **Confirmado** |
| F-008 | **Info** | blob.stormapplications.com | CDN Static | CDN estático (Cloudflare R2), sem vetor de SSRF | **Confirmado** |

## Acessos Obtidos

| Tipo | Detalhe | Status |
|------|---------|--------|
| Bypass 403 | Headers `Authorization: Bearer <qualquer>` → acesso ao backend | ✅ |
| Painel Admin | `/admin` → `ADMIN_AUTH_REQUIRED` (autenticação adicional necessária) | ❌ |
| Discord OAuth | Client ID conhecido (`1479423351880683551`), redirect_uri conhecido, client_secret NÃO encontrado | ❌ |
| API Key Wallet | Nenhuma chave válida encontrada (brute force básico sem sucesso) | ❌ |
| Shell/DB Access | Nenhum acesso interativo ao backend | ❌ |

## Objetivos de Alto Valor — Progresso

| Objetivo | Status | Observação |
|----------|--------|------------|
| Acesso interno (foothold) | ❌ Não alcançado | Nenhum RCE ou shell obtido |
| Acesso administrativo (admin/RCE) | ❌ Não alcançado | Painel admin confirmado mas protegido por auth adicional |
| Acesso financeiro (Wallet/payments) | ❌ Não alcançado | API Wallet documentada, sem chave válida |
| Acesso a dados/PII | ⚠️ Parcial | F-006 expõe metadados de usuários e bots, sem dados PII diretos |

## Attack Surface Consolidada

### Subdomínios (13)
| Subdomínio | IPs | Tech | Status |
|------------|-----|------|--------|
| `www.stormapplications.com` | 172.67.150.146, 104.21.39.240 | Cloudflare + Vercel + Next.js | **200** — Site principal |
| `mng.stormapplications.com` | 172.67.150.146, 104.21.39.240 | Cloudflare + Caddy + Discloud/AWS | **403** — Painel admin |
| `api-beta.stormapplications.com` | 75.2.96.173, 99.83.186.151 | AWS/Discloud + Caddy | **403** — API beta |
| `wallet.stormapplications.com` | 172.67.150.146, 104.21.39.240 | Cloudflare + Node.js/Express | **401** — API de pagamentos |
| `auth.stormapplications.com` | 172.67.150.146, 104.21.39.240 | Cloudflare | **302** → mng/api/login |
| `marketplacee.stormapplications.com` | 76.76.21.98, 66.33.60.67 | Vercel + Next.js | **200** — Marketplace |
| `blob.stormapplications.com` | 172.67.150.146, 104.21.39.240 | Cloudflare R2 | **404** — CDN estático |
| `apitesteeee.stormapplications.com` | 75.2.96.173, 99.83.186.151 | AWS/Caddy/Go | **308** — Teste |
| `discord.stormapplications.com` | 172.67.150.146, 104.21.39.240 | Cloudflare | **301** → Discord |
| `manager.stormapplications.com` | 172.67.150.146, 104.21.39.240 | Cloudflare | **301** → mng |
| `status.stormapplications.com` | 167.235.220.62 | BetterUptime/Hetzner | **302** — Status |
| `beta.stormapplications.com` | — | — | Sem resposta |
| `stormapplications.com` (apex) | 76.76.21.21 | Vercel | **307** → www |

### Infraestrutura AWS
- **Provider**: discloud.com (plataforma de hospedagem bots Discord)
- **Região**: eu-central-1 (Frankfurt)
- **Instâncias**: `i-0a06f4c3917127575`, `i-028e90aad8ec2bb5f`
- **Serviços**: Caddy reverse proxy → Node.js/Express/Handlebars → MongoDB
- **Headers internos**: `x-aws-instance-id`, `x-aws-region`, `x-powered-by: discloud.com`

### API Endpoints Mapeados
| Host | Endpoints |
|------|-----------|
| mng.stormapplications.com | `/api/login` (Handlebars OAuth page), `/admin`, `/admin/login`, `/admin/dashboard`, `/admin/users`, `/admin/config`, `/admin/settings`, `/admin/bots`, `/admin/logs` |
| api-beta.stormapplications.com | `/status` (data leak), `/admin`, `/admin/*`, endpoints internos |
| wallet.stormapplications.com | `/health`, `/api/v1/account`, `/api/v1/payments/create`, `/api/v1/payments/:id`, `/api/v1/payments`, `/api/v1/withdrawals/create`, `/api/v1/withdrawals/:id` |
| www.stormapplications.com | `/login`, `/dashboard`, `/planos`, `/servicos`, `/wallet`, `/apps`, `/tutoriais/*`, `/privacidade`, `/termos`, `/sitemap.xml`, `/_next/static/*` |
| blob.stormapplications.com | `/blobs/{discord_id}/{hash}.png`, `/bot-emojis/*` |

### Discord OAuth Flow
```
auth.stormapplications.com (302) → mng.stormapplications.com/api/login
  → Discord OAuth Authorize (client_id: 1479423351880683551)
  → redirect_uri: https://mng.stormapplications.com/api/login
  → Para o público: discord.gg/kKf8yjfb56
```

### CVEs Prioritários para Exploração
| CVE | CVSS | Serviço | Tipo | Prioridade |
|-----|------|---------|------|------------|
| CVE-2026-27590 | **9.8** | Caddy (Discloud) | FastCGI path splitting → RCE | **1** |
| CVE-2019-19919 | **9.8** | Handlebars (Discloud) | Prototype Pollution → RCE | **2** |
| CVE-2026-27587 | **9.1** | Caddy | Path matcher bypass → auth bypass | **3** |
| CVE-2026-27588 | **9.1** | Caddy | Host matcher bypass | **4** |
| CVE-2026-27586 | **9.1** | Caddy | mTLS silent fail → auth bypass | **5** |
| CVE-2025-29927 | **9.1** | Next.js | Middleware bypass (protegido por Vercel) | **6** |
| CVE-2021-32820 | **8.6** | Express-Handlebars | File disclosure via layout | **7** |
| CVE-2026-44574 | **8.1** | Next.js | Middleware bypass v2 | **8** |
| CVE-2024-34351 | **7.5** | Next.js | SSRF via Server Actions | **9** |

## Recomendações Técnicas

### Imediatas (Críticas/Altas)
1. **Proteger endpoint `/status`** em api-beta.stormapplications.com — autenticação obrigatória, remover dados internos (preços, bot IDs, configurações)
2. **Validar headers de autenticação** no middleware Caddy — não aceitar valores arbitrários em `Authorization: Bearer`
3. **Restringir CORS** — `Access-Control-Allow-Origin` deve listar origens confiáveis, não `*`; remover headers internos de `access-control-allow-headers`
4. **Remover headers internos** (`x-aws-instance-id`, `x-aws-region`, `x-powered-by: discloud.com`) das respostas HTTP

### Curto Prazo (Médias)
5. **Adicionar DMARC** no DNS para prevenir email spoofing
6. **Implementar rate limiting** na API Wallet e endpoints de login
7. **Proteger endpoint `/admin`** com autenticação forte (não apenas verificação de presença de header)

### Longo Prazo (Baixas/Info)
8. **Remover `/health`** público ou limitar info exposta
9. **Implementar security.txt** válido em `/.well-known/security.txt`

## Evidências

| ID | Arquivo |
|----|---------|
| F-001 | `evidence/F-001.md` — CORS Misconfiguration |
| F-002 | `evidence/F-002.md` — 403 Auth Bypass via Custom Headers |
| F-003 | `evidence/F-003.md` — AWS Internal Infrastructure Disclosure |
| F-004 | `evidence/F-004.md` — Backend Platform Fingerprinting |
| F-005 | `evidence/F-005.md` — Subdomain Enumeration |
| F-006 | `evidence/F-006.md` — api-beta/status Information Disclosure (Crítica) |
| F-007 | `evidence/F-007.md` — Admin Panel Exposed |
| F-008 | `evidence/F-008.md` — blob CDN Static |
| F-009 | `evidence/F-009.md` — Next.js Route Mapping |
| F-010 | `evidence/F-010.md` — Wallet API Health Endpoint |

## Cronologia

Ver `timeline.log` para registro completo ISO8601 das atividades.

## Checklist de Progresso

| Fase | Status | Entregável |
|------|--------|------------|
| 1. Escopo | ✅ | `SCOPE.md`, `PLAN.md`, `REPORT.md`, `timeline.log` |
| 2. Recon passivo + OSINT | ✅ | `recon/passive/PASSIVE.md`, 42 artefatos |
| 3. Recon ativo | 🔴 Cancelado | Pivoteado para mng.stormapplications.com |
| 4. Attack surface | ✅ | `recon/SUMMARY.md` (embutido neste relatório) |
| 5. Enumeração profunda | ✅ | mng, api-beta, wallet, blob, www — endpoints mapeados |
| 6. Ataque webapp | ✅ | 10 findings (F-001 a F-010) |
| 7. CVE research | ✅ | `exploit/cve_research.md` — 26 CVEs mapeados |
| 8. Pós-exploração | 🔴 Não iniciado | Sem foothold obtido |
| 9. Relatório | ✅ | Este documento + `timeline.log` |

## Próximos Passos Recomendados

1. **Validar CVE-2026-27587** (Caddy path matcher bypass) em mng.stormapplications.com — tentar acessar `/admin` com variações case/encoding
2. **Testar NoSQLi** via JSON content-type nos endpoints de login (mng, api-beta)
3. **Buscar Discord client_secret** em JS bundles do www e marketplacee (análise mais profunda dos 15+ chunks não examinados)
4. **SSRF via api-beta** — testar parâmetros de URL/webhook em endpoints internos
5. **Brute force** `x-storm-admin-key` com wordlist específica (seguindo formato dos headers expostos)
6. **Wallet API brute force** com wordlist de API keys (sk_live_*)
7. **Verificar origem do email** stormappsrecebimentos@gmail.com — possível vetor de phishing
8. **Cloudflare WAF bypass** via HTTP/2 request smuggling