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
| 6 | filmenoisubtitrate.eu | Cloudflare bypass → WordPress antigo | MÉDIO | MÉDIA | ⏸ pending |
| 7 | filmekstra.com | Cloudflare bypass → domínio novo | BAIXO | INFO | ⏸ pending |

## Findings por Severidade

### 🔴 Críticas
| ID | Título | Alvo | Status |
|----|--------|------|--------|
| F-001 | CNAME dangling — prod.netmovies.com.br → Azure | netmovies.com.br | 🔍 confirmado |
| F-002 | CNAME dangling — tests.netmovies.com.br → Azure | netmovies.com.br | 🔍 confirmado |

### 🟠 Altas
| ID | Título | Alvo | Status |
|----|--------|------|--------|
| F-003 | /version info disclosure (buildId, GA, timestamp) | netmovies.com.br | 🔍 confirmado |
| F-004 | IPs de origem expostos (sem CDN/WAF) | netmovies.com.br | 🔍 confirmado |

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

## Detalhamento das Evidências

| ID | Título | Severidade | Alvo | Link |
|----|--------|-----------|------|------|
| F-001 | CNAME dangling prod.netmovies.com.br → Azure | CRÍTICA | netmovies.com.br | evidence/F-001-takeover-prod-netmovies.txt |
| F-002 | CNAME dangling tests.netmovies.com.br → Azure | CRÍTICA | netmovies.com.br | evidence/F-002-takeover-tests-netmovies.txt |
| F-003 | /version info disclosure (Next.js build) | ALTA | netmovies.com.br | evidence/F-003-info-disclosure-version.txt |
| F-004 | IPs de origem expostos (AWS, sem CDN) | ALTA | netmovies.com.br | evidence/F-004-ips-expostos.txt |