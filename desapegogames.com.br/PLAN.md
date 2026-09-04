# PLAN.md — Backlog de Vetores & Plano de Engagement

> **Alvo:** `desapegogames.com.br` | **Início:** 2026-09-04T22:43:13Z

## Fases do Engagement (§5)

| # | Fase | Especialista | Status | Notas |
|---|------|-------------|--------|-------|
| 1 | Escopo + estrutura | pentest (coordenador) | CONCLUÍDO | SCOPE.md, pastas criadas |
| 2 | Recon Passivo + OSINT | `recon-passive` | EM ANDAMENTO | — |
| 3 | Recon Ativo | `recon-active` | PENDENTE | — |
| 4 | Consolidar Attack Surface | pentest | PENDENTE | recon/SUMMARY.md |
| 5 | Enumeração Profunda | `enum` | PENDENTE | — |
| 6 | Ataque Webapp | `webapp` | PENDENTE | — |
| 7 | CVE Research + Exploit | `cve` + `exploit` | PENDENTE | — |
| 8 | Pós-Exploração | `postex` | PENDENTE | Se foothold |
| 9 | Relatório Final | `report` | PENDENTE | — |

## Backlog de Vetores (§19 — Caçada Contínua)

> Vetores pausados/pendentes com motivo da pausa e gatilho de retorno.
> Atualizado conforme findings surgem.

| ID | Vetor | Host/Endpoint | Status | Motivo/Gatilho |
|----|-------|---------------|--------|----------------|
| V-001 | Cloudflare bypass (IP real) | desapegogames.com.br | PENDENTE | Aguardar recon passivo identificar IP real |
| V-002 | Subdomain takeover | *.desapegogames.com.br | PENDENTE | Aguardar recon passivo (CNAMEs) |
| V-003 | Cloud buckets (S3/Azure/GCP) | desapegogames-* | PENDENTE | Aguardar recon passivo |
| V-004 | Painel admin default creds | TBD | PENDENTE | Aguardar enum descobrir painéis |
| V-005 | IDOR/BOLA em API | TBD | PENDENTE | Aguardar enum descobrir endpoints |
| V-006 | SQLi/NoSQLi | TBD | PENDENTE | Aguardar enum descobrir parâmetros |
| V-007 | SSRF | TBD | PENDENTE | Aguardar enum descobrir params de URL |
| V-008 | XSS | TBD | PENDENTE | Aguardar enum descobrir inputs |
| V-009 | Upload bypass | TBD | PENDENTE | Aguardar enum descobrir upload endpoints |
| V-010 | JWT attacks | TBD | PENDENTE | Aguardar enum/webapp |
| V-011 | GraphQL introspection | TBD | PENDENTE | Aguardar enum |
| V-012 | Next.js middleware bypass (CVE-2025-29927) | TBD | PENDENTE | Aguardar fingerprint Next.js |
| V-013 | Mass assignment | TBD | PENDENTE | Aguardar enum descobrir API |
| V-014 | Wayback endpoints vazados | desapegogames.com.br | PENDENTE | Aguardar recon passivo |
| V-015 | OSINT creds (breaches/GitHub) | desapegogames.com.br | PENDENTE | Aguardar recon passivo |

## Ranking de Payoff (§16 — Atualizado dinamicamente)

> Ranking reordenado conforme findings surgem. Top = maior probabilidade
> de payoff.

| Rank | Vetor/Alvo | Justificativa |
|------|-----------|---------------|
| 1 | Cloudflare bypass → IP real | Se Cloudflare, bypass é pré-requisito para quase tudo |
| 2 | Painel admin auth bypass | Acesso direto a gestão |
| 3 | IDOR/BOLA em API de pedidos/clientes | PII + dados financeiros |
| 4 | Cloud buckets públicos | Vazamento de dados/backups |
| 5 | Subdomain takeover | Tomada de subdomínio |
| 6 | SQLi | Dump de DB |
| 7 | Default creds em painéis | Acesso rápido |
| 8 | Next.js middleware bypass | Se stack = Next.js |
| 9 | SSRF | Acesso interno |
| 10 | XSS | Client-side |

## Decisões de Delegação Aninhada

| Especialista | Pode delegar para | Gatilho |
|-------------|------------------|---------|
| recon-passive | osint, cloud | Após mapear subdomínios |
| enum | webapp | Ao encontrar endpoint vulnerável |
| webapp | exploit, cve | Ao confirmar vuln |
| cve | exploit | Após mapear CVEs aplicáveis |
| exploit | postex | Após obter foothold |
