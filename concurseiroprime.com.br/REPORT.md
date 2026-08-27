# REPORT — Pentest concurseiroprime.com.br

## Metadados
- **Alvo:** concurseiroprime.com.br
- **Negócio:** Plataforma de cursos para concursos (educação)
- **Stack:** Laravel + Inertia.js + Cloudflare + gateways de pagamento (Pagar.me, Asaas, Getnet, Rede, Mercado Pago)
- **Owner:** (a identificar via OSINT/WHOIS)
- **OPSEC:** Tor + proxychains4, UA rotativo, 2Captcha para Cloudflare
- **Tipo:** Black-box / Red Team
- **Início:** 2026-08-27T03:25:00Z

## Sumário Executivo
> Em andamento. Fase de escopo concluída; recon passivo em fila.

## Tabela de Findings

| ID | Severidade | Título | Host | Status |
|----|-----------|--------|------|--------|
| (a preencher) | | | | |

## Cronologia (resumo)
- 2026-08-27T03:25:00Z — Engagement iniciado. SCOPE/PLAN/REPORT/timeline criados. Pré-recon: Laravel + Inertia + Cloudflare, gateways de pagamento detectados. Tor OK (exit 185.220.101.14).

## Attack Surface (preliminar)
- Servidor: Cloudflare (HTTP/2, h3, cf-ray)
- App: Laravel (XSRF-TOKEN, laravel_session), Inertia.js (Vary: X-Inertia)
- Cookies: SRVGROUP=common (load balancer hint)
- CSP extensa (report-only) — múltiplas fontes de script permitidas
- Pagamentos: Pagar.me, Asaas, Getnet, Rede, Mercado Pago
- VSL: Pandavideo, ConverteAI, VTurb
- CRM: Hubspot

## Acessos Obtidos
(nenhum ainda)

## Objetivos de Alto Valor
- [ ] Acesso admin
- [ ] PII de alunos
- [ ] Dados financeiros/transações
- [ ] Credenciais BD/API/SMTP/Cloud
- [ ] RCE
- [ ] Account takeover

---
*Relatório incremental — atualizado a cada finding. Fase atual: recon passivo.*
