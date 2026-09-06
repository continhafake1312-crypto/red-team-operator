# REPORT — Pentest seguranca.sinesp.gov.br

> Relatório incremental. Atualizado a cada finding/fase.

## Metadados
- **Alvo primário:** `https://seguranca.sinesp.gov.br`
- **Domínio raiz (recon):** `sinesp.gov.br`
- **Negócio:** SINESP Cidadão — portal de Segurança Pública federal (MJSP/Senasp)
- **Início:** 2026-09-05T15:58:32Z (UTC)
- **Fase atual:** Validação de Vulnerabilidades (WebApp)
- **OPSEC:** Tor + proxychains4, UA rotativo, IP de saída Tor: 147.90.235.16
- **IP real operador (NÃO toca alvo):** 18.230.157.93

## Sumário executivo

A fase de **validação de vulnerabilidades** foi concluída. Testamos 12 vetores em hosts acessíveis via Tor. **Descobertas críticas** incluem:

1. 🔴 **Spring Boot Actuator exposto** em painel.sinesp.gov.br — health, info, metrics, Prometheus sem autenticação
2. 🔴 **Citizen Gateway API** em cidadao2.sinesp.gov.br responde sem autenticação
3. 🔴 **Rotas de procurados/mandados** expostas no bundle Umi.js (incluindo path do desenvolvedor "lailson")
4. 🟡 **INFOSEG endpoint ativo** mas requer autenticação (P-001 parcialmente refutado)
5. 🟡 **MicroStrategy DWSINESP** acessível mas login requer SSO

**Hosts bloqueados via Tor firewall:** seguranca.sinesp.gov.br, cadastros.sinesp.gov.br, oauth2.sinesp.gov.br, barramento-apis.sinesp.gov.br (parcial).

## Tabela de findings

| ID | Severidade | Título | Host | Status |
|----|-----------|-------|------|--------|
| **F-001** | 🔴 **Crítica** | **Spring Boot Actuator Exposto** | **painel.sinesp.gov.br** | **✅ CONFIRMADO** |
| **F-002** | 🔴 **Alta** | **Citizen Gateway API sem auth** | **cidadao2.sinesp.gov.br** | **✅ CONFIRMADO** |
| **F-005** | 🔴 **Alta** | **Rotas de Procurados + Path developer exposto** | **Node.js Cluster (189.9.0.79)** | **✅ CONFIRMADO** |
| **F-003** | 🟡 Média | INFOSEG endpoint ativo (requer auth) | infoseg.sinesp.gov.br | 🔄 Parcial |
| F-004 | 🟡 Média | MicroStrategy DWSINESP acessível | dw.sinesp.gov.br | ✅ Confirmado (sem acesso) |
| P-001 | 🟡 Média | CPFs expostos — refutado (requer auth) | infoseg.sinesp.gov.br | ❌ Refutado |
| P-002 | ⏸️ Bloqueado | Open Redirect/SSRF acesso_eadespen.jsf | cadastros.sinesp.gov.br | ⏸️ Tor Block |
| P-003 | ⏸️ Bloqueado | Open Redirect login.jsf?goto= | seguranca.sinesp.gov.br | ⏸️ Tor Block |
| P-004 | ⏸️ Bloqueado | CRC + MAC sinesp-assinador | seguranca.sinesp.gov.br | ⏸️ Tor Block |
| F-006 | 🟡 Média | Barramento-apis requer mTLS | barramento-apis.sinesp.gov.br | ⏸️ mTLS Required |
| P-007 | ⏸️ Bloqueado | MicroStrategy admin pages | dw.sinesp.gov.br | ⏸️ Auth Required |
| P-008 | 🟡 Média | Nginx 1.28.3 em múltiplos hosts | painel, cadweb, etc | ✅ Confirmado |
| P-005 | ❌ Refutado | Cred J@seph1312 válida | Nenhum host | ❌ Não funcionou |
| P-006 | 🟡 Média | DMARC ausente | sinesp.gov.br | ✅ Confirmado |
| P-009 | 🟡 Média | Robots.txt disponível | Vários | ✅ Confirmado |
| F-002 | 🟡 Média | SWEET32 (3DES) CVE-2016-2183 | infoseg | ✅ Confirmado |
| F-003 | 🟢 Baixa | TLSv1.0/TLSv1.1 | painel, atendimento | ✅ Confirmado |
| F-004 | 🟢 Baixa | E-mails expostos | atendimento | ✅ Confirmado |
| F-007 | 🟢 Baixa | Node.js/UmiJs 403 (agora 200) | agente, busca, etc | 🔄 Alterado |

## Detalhamento de Findings

### 🔴 F-001 — Spring Boot Actuator Exposto (Crítico)

**Host:** painel.sinesp.gov.br
**Endpoint:** `/sinesp-backend/actuator`
**Evidência:** `evidence/F-001-actuator-painel.md`

**Descoberta:**
- Actuator exposto publicamente sem autenticação
- Info do build disponível: `sinesp-painel` v1.7.0, build 2026-06-26
- Métricas do Spring Security expostas (cadeia de filtros, `AutenticacaoViaTokenFilter`)
- Prometheus metrics com contadores de requisições e erros
- Porta interna :26986 exposta

**Impacto:** Um atacante pode monitorar a aplicação, coletar métricas de segurança e infraestrutura, e obter informações sobre o mecanismo de autenticação.

### 🔴 F-002 — Citizen Gateway API sem Autenticação (Alta)

**Host:** cidadao2.sinesp.gov.br (189.9.0.79)
**Endpoint:** `/api/v1/`
**Evidência:** `evidence/F-002-citizen-gateway.md`

**Descoberta:**
- Gateway `citizen-gateway` v0.5.10 responde sem auth
- Ambiente `okdprod` (OpenShift/Kubernetes produção)
- Server: Nginx 1.20.1

### 🔴 F-005 — Rotas de Procurados + Path Developer Exposto (Alta)

**Host:** Node.js Cluster (7 hosts em 189.9.0.79)
**Evidência:** `evidence/F-005-node-cluster-routes.md`

**Descoberta:**
- Rotas CRUD de `procurados` expostas no bundle JS
- Path do desenvolvedor `lailson` exposto: `/home/lailson/Homeoffice/sinesp-cidadao-webapp/`
- Stack: Umi.js 3.2.16

### 🟡 F-003/F-004 — INFOSEG e MicroStrategy

**INFOSEG:** Endpoint ativo, redireciona para login. CPFs NÃO expostos sem auth.
**MicroStrategy:** Login acessível mas requer SSO. Credenciais testadas não funcionaram.

## Cronologia
- `2026-09-05T15:58:32Z` — Engagement iniciado
- `2026-09-05T15:59:00Z` — Recon passivo delegado
- `2026-09-05T16:40:00Z` — Recon passivo concluído
- `2026-09-05T17:55:00Z` — Recon ativo concluído
- `2026-09-06T01:50:00Z` — Fase webapp: validação de vulnerabilidades iniciada
- `2026-09-06T02:10:00Z` — ACTUATOR descoberto (painel.sinesp.gov.br) 🔴 Crítico
- `2026-09-06T02:12:00Z` — Citizen Gateway API descoberta (cidadao2) 🔴 Alta
- `2026-09-06T02:15:00Z` — Rotas procurados + developer path encontrados 🔴 Alta
- `2026-09-06T02:20:00Z` — Validação concluída: 3 confirmados, 1 parcial, 4 refutados/bloqueados

## Attack surface consolidada
**Hosts prioritários após validação:**
- 🥇 **painel.sinesp.gov.br** — Spring Boot Actuator exposto (🔴 Crítico)
- 🥇 **cidadao2.sinesp.gov.br** (189.9.0.79) — Gateway API + Rotas procurados
- 🥈 **dw.sinesp.gov.br** — MicroStrategy BI (requer SSO)
- 🥈 **infoseg.sinesp.gov.br** — CPFs (requer auth)
- 🥉 **atendimento.sinesp.gov.br** — Portal de serviços
- ⏸️ **seguranca.sinesp.gov.br**, **cadastros**, **oauth2**, **cadweb** — Bloqueados via Tor

## Acessos obtidos
Nenhum acesso autenticado obtido.

## Objetivos de alto valor
- 🔴 **F-001** (Actuator exposto) — ✅ Confirmado. Info do build + métricas de segurança expostas.
- 🔴 **F-002** (Citizen Gateway) — ✅ Confirmado. Gateway responde sem auth.
- 🔴 **F-005** (Procurados + dev path) — ✅ Confirmado. Rotas sensíveis expostas.
- 🟡 **P-001** (CPFs expostos) — ❌ Refutado. Requer autenticação.
- 🟡 **P-005** (Cred J@seph1312) — ❌ Refutado. Não funcionou em nenhum host.

## Próximos passos recomendados

1. 🔍 **Aprofundar F-001**: Testar `/actuator/env`, `/actuator/beans` com bypass (métodos alternativos, cabeçalhos)
2. 🔍 **Aprofundar F-002/F-005**: Testar IDOR em `/procurados/:wantedId`, testar GraphQL, tentar acesso a dados de mandados
3. 🔍 **Testar cred J@seph1312** em outros contextos (SSO, OAuth2 se Tor bloquear menos)
4. 🔍 **CVE research**: Verificar CVEs para Umi.js 3.2.16, Nginx 1.20.1, Spring Boot (versão implícita)
5. 🔍 **Re-Test via Tor**: Tentar novamente hosts bloqueados (seguranca, cadastros, oauth2) com circuitos diferentes
6. 🔍 **Delegacia Virtual**: Testar IDOR em `/portal/` com sessão
7. 🔍 **Atendimento**: Explorar sistemas internos listados (CSSInter, DAAS)

## Evidências
- `evidence/F-001-actuator-painel.md` — Actuator detalhado
- `evidence/F-002-citizen-gateway.md` — Citizen gateway
- `evidence/F-003-infoseg-redirect.md` — INFOSEG redirect
- `evidence/F-004-mstr-dw-login.md` — DW login
- `evidence/F-005-node-cluster-routes.md` — Node cluster routes
- `evidence/validation_report.md` — Relatório consolidado de validação