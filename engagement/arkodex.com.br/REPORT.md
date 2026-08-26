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

## Acessos Obtidos
*Nenhum ainda*

## Objetivos de Alto Valor
| Objetivo | Status | Nota |
|----------|--------|------|
| Acesso admin (painel /admin/*) | Pendente | Rotas SPA detectadas, endpoints API auth |
| Acesso a billing/pagamentos | Pendente | `/api/checkout/*`, `/api/payment/*`, `/api/orders/*` |
| Acesso a dados de clientes | Pendente | `/api/clients/*` |
| Acesso interno (SSRF) | Pendente | `/api/gallery`, `/api/sources` |
| Credenciais via cred-stuffing | Pendente | Email: contato.luan.david@gmail.com |

## Cronologia
- 2026-08-26T12:00:00Z — Início do engagement
- 2026-08-26T12:05:00Z — Recon Passivo: IP real descoberto (34.46.128.254), 48 endpoints API, OSINT completo
- 2026-08-26T12:08:00Z — Recon Ativo: PowerDNS, Python 3.12, Caddy, TLS broken confirmados
- 2026-08-26T12:10:00Z — Attack Surface consolidado, iniciando Enumeração Profunda