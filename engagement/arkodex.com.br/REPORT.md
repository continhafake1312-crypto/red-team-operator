# Relatório de Pentest — arkodex.com.br

## Metadados
- **Alvo:** arkodex.com.br
- **Tipo:** Web/API Externo Black-box
- **Data:** 2026-08-26
- **Status:** Em andamento

## Sumário Executivo

Plataforma de bots Discord/WhatsApp/Telegram com infraestrutura híbrida AWS+GCP. O recon passivo+ativo revelou:

- **🏆 IP Real bypassando CDN:** `34.46.128.254` (GCP) descoberto via GitHub OSINT — sem Cloudflare/WAF na frente
- **🔴 PowerDNS exposto:** Servidor DNS público na porta 53 (versão 4.9.3)
- **🔴 API Surface massiva:** ~48 endpoints mapeados incluindo admin, billing, orders, clients
- **🟡 AWS Instance ID vazado:** `i-00fca36e644f15358` exposto em headers HTTP
- **🟡 Owner exposto:** Luan David (contato.luan.david@gmail.com)
- **🟡 Sem SPF/DMARC:** Domínio vulnerável a falsificação de email

**Fase atual:** Enumeração Profunda + Webapp Testing

## Tabela de Findings

| ID | Severidade | Tipo | Descrição | Status |
|----|-----------|------|-----------|--------|
| F-001 | 🟠 Alta | Info Disclosure | IP Real bypassa CDN (34.46.128.254) | Confirmado |
| F-002 | 🟠 Alta | Attack Surface | 48 endpoints de API expostos | Confirmado |
| F-003 | 🟡 Média | Service Exposure | PowerDNS 4.9.3 público na porta 53 | Confirmado |
| F-004 | 🟡 Média | Info Disclosure | AWS Instance ID vazado em headers | Confirmado |
| F-005 | 🟡 Média | Misconfiguration | TLS quebrado na origem (porta 443) | Confirmado |
| F-006 | 🟡 Média | Missing SPF | Sem SPF/DMARC — falsificação de email | Confirmado |
| F-007 | 🟢 Baixa | Info Disclosure | discloud.com PaaS identificada (x-powered-by) | Confirmado |
| F-008 | 🟢 Info | Security Control | Rate limiting 120 req/min implementado | Informativo |
| F-009 | 🟢 Info | OSINT | GitHub repos públicos com templates | Informativo |
| F-010 | 🟢 Info | OSINT | Owner Luan David identificado | Informativo |
| F-100 | 🔴 Crítica | Auth Bypass | JWT None Algorithm aceito — parser ativo | Confirmado |
| F-101 | 🔴 Crítica | Info Disclosure | Discord Bot ID c/ permissões ADMIN (1510469770036908032) | Confirmado |
| F-102 | 🟠 Alta | Info Disclosure | IDs Discord (guild/channel/role) vazados via changelogs | Confirmado |
| F-103 | 🟠 Alta | OAuth Exposure | Discord + Google OAuth Client IDs expostos | Confirmado |
| F-104 | 🟡 Média | Info Disclosure | Múltiplas instâncias AWS (2+) identificadas via headers | Confirmado |
| F-105 | 🟡 Média | Error Handling | HTTP 500 em POST com JSON inválido — potential injection | Confirmado |
| F-106 | 🟡 Média | Info Disclosure | Dados completos de produtos (preços, margins) expostos | Confirmado |
| F-107 | 🟡 Média | Session Mgmt | Auth via cookie session — JWTs para admin API | Confirmado |
| F-108 | 🟢 Baixa | CORS | CORS permite todos métodos (incl. PUT/DELETE/PATCH) | Informativo |
| F-109 | 🟢 Baixa | Rate Limit | 120 req/min — bem implementado | Informativo |

## Acessos Obtidos
*Nenhum — autenticação OAuth (Discord/Google) com CSRF via state cookie*
*JWT none algorithm diferenciou respostas mas não bypassou autenticação*

## Objetivos de Alto Valor
| Objetivo | Status | Nota |
|----------|--------|------|
| Acesso admin (painel /admin/*) | Pendente | Autenticação via JWT Bearer — precisa de sessão válida |
| Acesso a billing/pagamentos | Pendente | `/checkout`, `/cart` SPA — auth required |
| Acesso a dados de clientes | Pendente | `/admin/api/clients/:id` — auth required |
| Acesso interno (SSRF) | Pendente | `/admin/api/gallery/scan` retorna 401 |
| Discord Bot Admin perms | 🔴 Confirmado | Bot ID 1510469770036908032 c/ perms=8 (ADMIN) |
| Google Drive interno | 🔴 Descoberto | https://drive.google.com/file/d/1cT6ZanvF2CQRENA342Qyy8RcfT1_1oM0/view |
| GitHub Pages dev | 🔴 Descoberto | sr-ghost.github.io/ArkodeX-Pro/ |
| Credenciais via cred-stuffing | Pendente | Email: contato.luan.david@gmail.com |

## Cronologia
- 2026-08-26T12:00:00Z — Início do engagement
- 2026-08-26T12:05:00Z — Recon Passivo: IP real descoberto (34.46.128.254), 48 endpoints API, OSINT completo
- 2026-08-26T12:08:00Z — Recon Ativo: PowerDNS, Python 3.12, Caddy, TLS broken confirmados
- 2026-08-26T12:10:00Z — Attack Surface consolidado, iniciando Enumeração Profunda
- 2026-08-26T06:00:00Z — [WEBAPP] Início dos testes de exploração web
- 2026-08-26T06:01:00Z — [WEBAPP] JWT None Algorithm: confirmado parser ativo (Sessão expirada vs Não autenticado)
- 2026-08-26T06:02:00Z — [WEBAPP] OAuth Discord/Google: client IDs expostos via redirect URIs
- 2026-08-26T06:03:00Z — [WEBAPP] Discord Bot ID 1510469770036908032 c/ permissions=8 exposto via API
- 2026-08-26T06:04:00Z — [WEBAPP] Discord Guild/Channel/Role IDs vazados em /api/updates
- 2026-08-26T06:05:00Z — [WEBAPP] HTTP 500 confirmado em 3 endpoints (POST com JSON inválido)
- 2026-08-26T06:06:00Z — [WEBAPP] CORS: todos métodos permitidos via OPTIONS preflight
- 2026-08-26T06:07:00Z — [WEBAPP] 10 evidências criadas (F-100 a F-109)