# SUMMARY.md — Attack Surface Consolidada + Ranking de Payoff

**Alvo:** vumpe.com
**Data:** 2026-08-26
**Fontes:** recon-passive (PASSIVE.md), OSINT.md, recon-active (ACTIVE.md)

---

## Infraestrutura

```
Internet
├── Cloudflare (WAF/CDN)
│   └── www.vumpe.com → Vercel (Next.js 15)
│
├── Vercel Edge (SEM WAF — EXPOSTO)
│   ├── clipador.vumpe.com ← PAINEL PRINCIPAL (login/dashboard/gestão)
│   ├── anunciante.vumpe.com → redirect para www
│   ├── mcl.vumpe.com ← CORS wildcard, estático
│   └── up-mcl.vumpe.com ← CORS wildcard, estático
│
├── AWS Global Accelerator (histórico, ainda vivo)
│   └── 13.248.243.5 → GoDaddy DPS (antigo site)
│
└── AWS S3
    └── social-tracker-bucket-production.s3.us-east-1.amazonaws.com (403)
```

## Subdomínios Ativos (6)

| Domínio | IP | WAF | Tech | Notas |
|---------|-----|-----|-------|-------|
| www.vumpe.com | 104.21.68.192 (CF) | ✅ Cloudflare | Next.js, Vercel | Landing page |
| vumpe.com | 104.21.68.192 (CF) | ✅ Cloudflare | Redirect → www | |
| clipador.vumpe.com | 216.150.x.x (Vercel) | ❌ NENHUM | Next.js, SSR | 🔴 APP PRINCIPAL — 100+ rotas vazadas |
| anunciante.vumpe.com | 216.150.x.x (Vercel) | ❌ NENHUM | Next.js | Portal anunciante |
| mcl.vumpe.com | 216.150.x.x (Vercel) | ❌ NENHUM | Estático | CORS wildcard |
| up-mcl.vumpe.com | 216.150.x.x (Vercel) | ❌ NENHUM | Estático | CORS wildcard |

## Ranking de Payoff

### 🔴 CRÍTICA — Prioridade Máxima

| # | Vetor | Fase | Descrição |
|---|-------|------|-----------|
| 1 | **Impersonation via manager-login** | webapp | Rota `/manager-login/[impersonatedBy]/[uuid]/[code]` permite login como QUALQUER usuário. Se uuid/code forem previsíveis ou enumeráveis → FULL ACCOUNT TAKEOVER de qualquer conta. |
| 2 | **IDOR em /offerings/[id]/\*** | webapp | Ofertas, membros, pagamentos, checkouts expostos via ID sequencial. Sem WAF para bloquear. |
| 3 | **Auth bypass no clipador** | webapp | Login sem WAF. Testar default creds (admin:admin, test:test), SQLi, NoSQLi, SSTI, JWT none alg. |
| 4 | **IDOR em /orders, /subscriptions, /buys** | webapp | Rotas autenticadas com parâmetros UUID/ID — testar se pertencem ao usuário correto. |

### 🟡 ALTA

| # | Vetor | Fase | Descrição |
|---|-------|------|-----------|
| 5 | **CORS wildcard (mcl, up-mcl)** | webapp | `Access-Control-Allow-Origin: *` permite exfiltração de dados cross-origin. |
| 6 | **JS Bundle Analysis** | enum | Chunks Next.js em `/_next/static/chunks/` — extrair endpoints API, chaves, tokens AWS, URLs internas |
| 7 | **PostHog endpoints** | enum | `/ingest/*` self-hosted — possíveis info leaks, analytics data exposure |
| 8 | **TikTok OAuth callback CSRF** | webapp | `/auth/[platformId]/callback` — testar CSRF/lack of state param |
| 9 | **S3 bucket social-tracker-bucket-production** | enum | Bucket existe (403). Testar permissões via presigned URLs, ACLs, policy |
| 10 | **Sentry DSN / release vazado** | info | `sentry-release=cb96e609e674c722ce040c16f65fb3facc8af665` — possível mapeamento de versões |

### 🟢 MÉDIA

| # | Vetor | Fase | Descrição |
|---|-------|------|-----------|
| 11 | **AWS GA IP histórico** | cloud | 13.248.243.5 — verificar se ainda serve dados residuais |
| 12 | **Cache poisoning (Vercel HIT)** | webapp | Vercel com cache HIT em páginas estáticas — cache poisoning via headers |
| 13 | **Mass assignment** | webapp | Tentar escalar privilégio via parâmetros role, isAdmin, isPartner |
| 14 | **Next.js middleware bypass** | cve | CVE-2025-29927 ou similar para Next.js 14/15 |
| 15 | **Mailgun painel** | enum | MX aponta para Mailgun — verificar se há painel administrativo exposto |

### 🔵 BAIXA

| # | Vetor | Fase | Descrição |
|---|-------|------|-----------|
| 16 | **IP cliente exposto no login** | info | IP do requisitante retornado na resposta do login |
| 17 | **DMARC externo** | info | Relatórios para `onsecureserver.net` |
| 18 | **Subdomínios cPanel legado** | info | DNS fantasma do antigo dono |

---

## Acessos Conhecidos

*Nenhum até o momento.*

## Objetivos de Alto Valor

- ❌ Acesso interno (foothold)
- ❌ Acesso administrativo (dashboard admin / manager)
- ❌ Acesso financeiro (pagamentos, pedidos, assinaturas)
- ❌ Acesso a dados/PII (usuários, clipadores, anunciantes)

---

## Próximos Passos Imediatos

1. **Enum:** Baixar e analisar JS chunks do clipador, endpoints de API, parâmetros
2. **Webapp:** Testar manager-login impersonation (CRÍTICO), auth bypass, IDOR em offerings/orders
3. **Webapp:** Testar CORS exploit em mcl + up-mcl
4. **CVE:** Pesquisar CVEs para Next.js 14/15, PostHog, GoDaddy DPS