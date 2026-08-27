# PLAN — Backlog de Vetores & Fases

## Fases (§5)

| # | Fase | Especialista | Status | Notas |
|---|------|-------------|--------|-------|
| 1 | Escopo | pentest (coordinator) | ✅ done | SCOPE.md criado |
| 2 | Recon passivo + OSINT | recon-passive | ⏳ em fila | subdelega osint/cloud |
| 3 | Recon ativo | recon-active | ⏳ em fila | portscan, fingerprint, vhosts |
| 4 | Consolidar SUMMARY.md | pentest | ⏳ em fila | ranking de payoff (§16) |
| 5 | Enumeração profunda | enum | ⏳ em fila | content discovery, JS, API, params |
| 6 | Ataque webapp | webapp | ⏳ em fila | OWASP Top 10 — Laravel/Inertia |
| 7 | CVE research + exploit | cve + exploit | ⏳ em fila | Laravel CVEs, Ignition, etc |
| 8 | Pós-exploração | postex | ⏳ condicional | se foothold |
| 9 | Relatório | report | ⏳ em fila | REPORT.md final |

## Hipóteses Iniciais do Alvo (a confirmar/refinar pelo recon)
- **Laravel** (XSRF-TOKEN + laravel_session) → vetores: `.env` disclosure, `/storage/logs/laravel.log`, `_ignition` (CVE-2021-3129), debug mode (`APP_DEBUG=true`), `.git`, IDOR em rotas `/api/`.
- **Inertia.js** → SSR/rotas Vue expostas, `_buildManifest` se Next (não é o caso — é Laravel).
- **Cloudflare** → bypass origem real (subdomínios não-proxied, DNS history), WAF challenge (2captcha).
- **Gateways de pagamento** → endpoints `/api/` de checkout, webhooks de pagamento, IDOR em pedidos/assinaturas, mass assignment em planos.
- **Pandavideo/ConverteAI/VTurb** → vídeos de VSL podem estar expostos sem auth.
- **Hubspot** → integração pode expor contatos.

## Backlog de Vetores (§19) — caçada contínua
> Atualizado conforme findings. Vetores pausados com motivo + gatilho de retorno.

| Vetor | Host/Path | Status | Motivo pausa | Gatilho retorno |
|-------|-----------|--------|--------------|-----------------|
| .env disclosure | / | pendente | — | enum |
| Laravel log leak | /storage/logs | pendente | — | enum |
| Ignition CVE-2021-3129 | /_ignition | pendente | — | enum/webapp |
| Debug mode | / | pendente | — | webapp |
| API IDOR | /api/ | pendente | — | enum/webapp |
| Cloudflare bypass | origem real | pendente | — | recon-active |
| WP scan | — | pausado | não é WP | — |
| Default creds admin | /admin /login | pendente | — | webapp |
| Payment webhook abuse | /webhook | pendente | — | webapp |
| JWT/session flaws | cookies | pendente | — | webapp |

## Ranking de Payoff (§16) — atualizado após recon
> Será preenchido em `recon/SUMMARY.md` após fases 2-4.

1. (a definir)
2. (a definir)

---
*Última atualização: 2026-08-27T03:26:00Z*
