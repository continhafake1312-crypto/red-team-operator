# PLAN — bagy.com.br

## Estratégia Geral

Alvo é uma plataforma de e-commerce SaaS brasileira, hospedada em Webflow
com Cloudflare + Azion Edge. A superfície de ataque principal:

1. **Site institucional** (Webflow) — baixo payoff, mas pode revelar endpoints
2. **Subdomínios** — basedeconhecimento, app, admin, api, painel, etc.
3. **API da plataforma e-commerce** — provavelmente o backend real
4. **Mobile apps** — Android APK, iOS IPA (cracking para análise)
5. **Infra AWS/DigitalOcean** — possíveis buckets S3, IPs reais

## Estado Atual
- **Fase atual:** Escopo (criação)
- **Última ação:** 2026-08-20 — Início do engagement

## Backlog de Vetores (Re-priorizado)

| # | Vetor | Prioridade | Status | Notas |
|---|-------|-----------|--------|-------|
| V1 | **Takeover pixel.bagy.com.br** | **CRÍTICA** | PENDENTE | pixel.hotmart.com NXDOMAIN — registrar subdomínio Hotmart imediatamente |
| V2 | **Takeover staging.bagy.com.br** | **CRÍTICA** | PENDENTE | Elastic Beanstalk NXDOMAIN — tentar takeover via AWS |
| V3 | **WordPress on.bagy.com.br** | **ALTA** | PENDENTE | WP 7.0.4 + Elementor 3.23.1 + Oxygen — CVE research + brute force |
| V4 | **API Load Balancer (api-lb)** | **ALTA** | PENDENTE | 35.244.147.218 Google Cloud — port scan + endpoint enum |
| V5 | **Elasticsearch (elastic.bagy.com.br)** | **ALTA** | PENDENTE | 35.247.248.40 — testar acesso público |
| V6 | **OpenID Configuration** | **ALTA** | PENDENTE | /.well-known/openid-configuration — SSO endpoints |
| V7 | **Zendesk (basedeconhecimento)** | **ALTA** | PENDENTE | IDOR, SSRF, privilege escalation |
| V8 | **Port scan IPs reais** | **ALTA** | PENDENTE | Azion (179.191.x), Google Cloud (35.244.x, 35.247.x), GoCache, Zendesk |
| V9 | **Webflow main.bundle.js** | **MÉDIA** | PENDENTE | Análise JS para endpoints/API keys |
| V10 | **Firebase (ig.bagy.com.br)** | **MÉDIA** | PENDENTE | Firestore aberto? Auth config exposta? |
| V11 | **Mobile APK (com.converta.bagy)** | **MÉDIA** | PENDENTE | Decompilar para API keys/endpoints |
| V12 | **HubSpot (materiais.bagy.com.br)** | **MÉDIA** | PENDENTE | CMS Hub — teste auth bypass |
| V13 | **DMARC spoofing** | **MÉDIA** | PENDENTE | p=quarantine pct=20 — 80% dos emails aceitos sem DMARC |
| V14 | **Google Workspace OAuth** | **BAIXA** | PENDENTE | Testar SSO/OAuth misconfig |
| V15 | **Cred-stuffing** | **ALTA** | PENDENTE | Usar emails + breaches coletados contra painéis de login |
| V16 | **Webflow CMS** | **BAIXA** | PENDENTE | /slug pages, Webflow forms, endpoints |

## Estado Atual
- **Fase atual:** Recon passivo + OSINT COMPLETO
- **Fase seguinte:** Recon ativo + Validação de Takeovers
- **Última ação:** 2026-08-20 — Passive recon concluído com 76 subs, 56 IPs, 2 takeovers

## Especialistas a Acionar (Próximos)

| Ordem | Fase | Especialista | Contexto |
|-------|------|-------------|----------|
| 1 | Validar takeovers | exploit | pixel.bagy.com.br + staging.bagy.com.br (CRÍTICOS) |
| 2 | Recon ativo | recon-active | Port scan + fingerprint + vhosts em IPs reais |
| 3 | Enumeração profunda | enum | Content discovery + JS analysis + API enum |
| 4 | CVE research | cve | WordPress 7.0.4, Elementor 3.23.1 |
| 5 | Ataque webapp | webapp | Painéis, API, WordPress, Zendesk |
| 6 | Mobile app | exploit | APK decompile (com.converta.bagy) |
| 7 | Relatório | report | Atualização após fases |

## Regras de Pivot (§19)
- Se Cloudflare bloqueia → tentar bypass via IP real (Azion/Google Cloud)
- Se Webflow não renderiza vetores → pivota para subdomínios/API
- Se subdomínios sem resposta → pivota para API/mobile
- Se takeover funcionar → pivota para pós-ex (loot no domínio takeoverado)
- Se encontrar creds → pivota para auth testing imediatamente
- Se WordPress vulnerável → pivota para CVE + exploit RCE

---
*Última atualização: 2026-08-20T05:36:00Z*