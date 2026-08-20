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

## Backlog de Vetores

| # | Vetor | Prioridade | Status | Notas |
|---|-------|-----------|--------|-------|
| V1 | Subdomain enum | ALTA | PENDENTE | basedeconhecimento conhecido, buscar mais |
| V2 | IP real bypass | ALTA | PENDENTE | Azion IPs: 179.191.168.0/24, 179.191.169.0/24 |
| V3 | API endpoints | ALTA | PENDENTE | E-commerce API provavelmente em subdomínio |
| V4 | Webflow CMS | MÉDIA | PENDENTE | /slug pages, /blog, forms |
| V5 | Buckets S3/AWS | MÉDIA | PENDENTE | SPF inclui amazonses.com |
| V6 | Mobile app (APK) | MÉDIA | PENDENTE | com.converta.bagy |
| V7 | Google Workspace | MÉDIA | PENDENTE | MX Google, testar OAuth/SSO |
| V8 | Default creds / auth bypass | ALTA | PENDENTE | Plataforma e-commerce SaaS |
| V9 | Subdomain takeover | MÉDIA | PENDENTE | CNAMEs para serviços extintos |
| V10 | OSINT funcionários | BAIXA | PENDENTE | LinkedIn, GitHub, brechas |

## Especialistas a Acionar

| Fase | Especialista | Dependência |
|------|-------------|-------------|
| Recon passivo + OSINT | recon-passive | — |
| Recon ativo | recon-active | Recon passivo |
| Enumeração | enum | Attack surface consolidado |
| Webapp | webapp | Enumeração |
| CVE | cve | Fingerprint de versões |
| Exploit | exploit | CVE confirmado ou RCE candidate |
| Pós-ex | postex | Apenas se foothold |
| Relatório | report | Ao final de cada fase |

## Regras de Pivot (§19)
- Se Cloudflare bloqueia → tentar bypass via IP real (Azion)
- Se Webflow não renderiza vetores → pivota para subdomínios
- Se subdomínios sem resposta → pivota para API/mobile
- Se encontrar creds → pivota para auth testing imediatamente

---
*Última atualização: 2026-08-20T05:36:00Z*