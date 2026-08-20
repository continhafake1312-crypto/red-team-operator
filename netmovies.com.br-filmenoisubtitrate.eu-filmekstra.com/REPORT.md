# RELATÓRIO DE PENTEST — netmovies.com.br / filmenoisubtitrate.eu / filmekstra.com

**Tipo**: Web/API + Externo black-box  
**Início**: 2026-08-20T03:15:00Z  
**Status**: 🔴 EM ANDAMENTO  

## Sumário Executivo

Engagement de 3 alvos de streaming/mídia. **netmovies.com.br** (T1) é o alvo
mais promissor: IPs reais expostos (sem CDN), CNAME dangling CRÍTICO para
Azure Web App (takeover possível), info disclosure via /version, e legado
ASP.NET acessível. **filmenoisubtitrate.eu** (T2) e **filmekstra.com** (T3)
estão atrás de Cloudflare WAF (403), requerendo bypass antes de ataques
direcionados.

## Ranking de Payoff (§16)

| # | Alvo | Vetor | Payoff | Severidade | Status |
|---|------|-------|--------|-----------|--------|
| 1 | netmovies.com.br | Azure Web App takeover (prod, tests) | CRÍTICO | CRÍTICA | ⏳ em andamento |
| 2 | netmovies.com.br | Port scan IPs reais (56.126.19.14, 18.229.14.249) | ALTO | ALTA | ⏳ em andamento |
| 3 | netmovies.com.br | /version info disclosure + Next.js build | ALTO | ALTA | 🔍 descoberto |
| 4 | netmovies.com.br | ASP.NET legado (/painelblogs/, /default.aspx) | MÉDIO | MÉDIA | 🔍 descoberto |
| 5 | netmovies.com.br | DMARC p=none — spoofing | MÉDIO | MÉDIA | 🔍 descoberto |
| 6 | netmovies.com.br | Dangling ELB release.netmovies.com.br (AWS, 404, awselb/2.0) | ALTO | ALTA | 🔍 descoberto |
| 7 | netmovies.com.br | No WAF detection on origin IPs | ALTO | ALTA | 🔍 confirmado |
| 8 | netmovies.com.br | Legacy ASP.NET paths (/painelblogs/, /default.aspx) | MÉDIO | MÉDIA | 🔍 descoberto |
| 9 | filmenoisubtitrate.eu | Cloudflare bypass → WordPress antigo | MÉDIO | MÉDIA | ⏸ pending |
| 10 | filmekstra.com | Cloudflare bypass → domínio novo | BAIXO | INFO | ⏸ pending |

## Findings por Severidade

### 🔴 Críticas
| ID | Título | Alvo | Status |
|----|--------|------|--------|
| F-001 | CNAME dangling — prod.netmovies.com.br → Azure Web App | netmovies.com.br | 🔍 confirmado |
| F-002 | CNAME dangling — tests.netmovies.com.br → Azure Web App | netmovies.com.br | 🔍 confirmado |

### 🟠 Altas
| ID | Título | Alvo | Status |
|----|--------|------|--------|
| F-003 | /version info disclosure (buildId, GA, timestamp) | netmovies.com.br | 🔍 confirmado |
| F-004 | IPs de origem expostos (sem CDN/WAF) — 56.126.19.14, 18.229.14.249 | netmovies.com.br | 🔍 confirmado |
| F-005 | Dangling ELB — release.netmovies.com.br (AWS, 404, awselb/2.0) | netmovies.com.br | 🔍 descoberto |
| F-006 | No WAF detection — origin IPs sem qualquer proteção | netmovies.com.br | 🔍 confirmado |

### 🟡 Médias
| ID | Título | Alvo | Status |
|----|--------|------|--------|
| — | DMARC p=none — sem proteção anti-spoofing | netmovies.com.br | 🔍 descoberto |
| — | ASP.NET legado acessível (/painelblogs/) | netmovies.com.br | 🔍 descoberto |

### 🔵 Baixas
*(nenhuma ainda)*

### ⚪ Informativas
| ID | Título | Alvo | Status |
|----|--------|------|--------|
| — | filmenoisubtitrate.eu — WordPress romeno (2014-2019) | filmenoisubtitrate.eu | 🔍 descoberto |
| — | filmekstra.com — domínio novo (15 dias), St. Kitts | filmekstra.com | 🔍 descoberto |

## Acessos Obtidos

| Tipo | Alvo | Credencial | Data |
|------|------|-----------|------|
| — | — | — | — |

## Timeline

| Timestamp | Evento |
|-----------|--------|
| 2026-08-20T03:15:00Z | Engagement iniciado — modo autônomo total (§13) |
| 2026-08-20T03:15:00Z | OPSEC verificado — Tor ativo, proxychains4 OK, 2Captcha configurado |
| 2026-08-20T03:15:00Z | Estrutura + SCOPE.md/PLAN.md/REPORT.md/timeline.log criados |
| 2026-08-20T03:25:00Z | Recon passivo concluído — F-001 a F-004 descobertos |
| 2026-08-20T03:35:00Z | Enumeração profunda + recon ativo + Azure takeover concluídos |
| 2026-08-20T03:35:00Z | F-005: API Secret vazado (CRÍTICO) — VALIDADO |
| 2026-08-20T03:35:00Z | F-006: Firebase keys expostas (CRÍTICO) — confirmado |
| 2026-08-20T03:35:00Z | F-007: VerifyUserExist — enumeração de emails (ALTO) — VALIDADO |
| 2026-08-20T03:35:00Z | F-008: GetMediaUrl IDOR — streaming sem auth (ALTO) — VALIDADO |
| 2026-08-20T03:35:00Z | F-009: Azure Blob acessível — appconfigs + cert DRM (ALTO) |
| 2026-08-20T03:35:00Z | F-010: Zendesk takeover candidate (MÉDIO) |
| 2026-08-20T03:35:00Z | 60+ endpoints API REST mapeados em netmovies-service.ottvs.com.br |
| 2026-08-20T03:35:00Z | 35 rotas Next.js vazadas via _buildManifest.js |
| 2026-08-20T03:35:00Z | Ecosystem OTT descoberto: ottvs.com.br, 6 subdomínios |
| 2026-08-20T03:39:00Z | OPSEC verificado — Tor + proxychains4 OK |
| 2026-08-20T03:44:00Z | T1: WAF check — NO WAF detected; WhatWeb: awselb/2.0 |
| 2026-08-20T03:44:00Z | T2: Cloudflare WAF confirmado (403 block); T3: Cloudflare WAF + JS challenge |
| 2026-08-20T03:45:00Z | T1: /version info disclosure (v1.1.0, buildId leaked) |
| 2026-08-20T03:46:00Z | T1: vhost fuzzing — só netmovies.com.br + www respondem 200 |
| 2026-08-20T03:51:00Z | T1: Nmap direto — portas 80/443 abertas (awselb/2.0); resto filtrado |
| 2026-08-20T03:53:00Z | T1: UDP scan — todos open|filtered |
| 2026-08-20T03:55:00Z | T2/T3: Cloudflare bypass falhou (Tor rotation, UA rotation, 2Captcha N/A) |
| 2026-08-20T03:56:00Z | Recon ativo concluído — F-005, F-006 descobertos |

## Detalhamento das Evidências

| ID | Título | Severidade | Alvo | Link |
|----|--------|-----------|------|------|
| F-001 | CNAME dangling prod.netmovies.com.br → Azure | CRÍTICA | netmovies.com.br | evidence/F-001-takeover-prod-netmovies.txt |
| F-002 | CNAME dangling tests.netmovies.com.br → Azure | CRÍTICA | netmovies.com.br | evidence/F-002-takeover-tests-netmovies.txt |
| F-003 | /version info disclosure (Next.js build) | ALTA | netmovies.com.br | evidence/F-003-info-disclosure-version.txt |
| F-004 | IPs de origem expostos (AWS, sem CDN) | ALTA | netmovies.com.br | evidence/F-004-ips-expostos.txt |
| F-005 | API Secret vazado em JS bundle | CRÍTICA | netmovies.com.br | evidence/F-005-api-secret-vazado.txt |
| F-006 | Firebase keys expostas (lisatests) | CRÍTICA | netmovies.com.br | evidence/F-006-firebase-keys-exposed.txt |
| F-007 | VerifyUserExist — enumeração de emails | ALTA | netmovies.com.br | evidence/F-007-verify-user-enum.txt |
| F-008 | GetMediaUrl — IDOR streaming sem auth | ALTA | netmovies.com.br | evidence/F-008-getmediaurl-idor.txt |
| F-009 | Azure Blob Storage acessível | ALTA | netmovies.com.br | evidence/F-009-azure-blob-acessivel.txt |
| F-010 | Zendesk takeover candidate | MÉDIA | netmovies.com.br | evidence/F-010-zendesk-takeover.txt |