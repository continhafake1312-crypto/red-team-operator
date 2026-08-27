# REPORT — degraucultural.com.br

> Relatório incremental. Atualizado a cada finding (§9).

## Metadados
- **Alvo:** degraucultural.com.br
- **URL:** https://degraucultural.com.br/
- **Tipo:** Web/API externo black-box
- **Owner:** Red Team Operator (pentest)
- **Início:** 2026-08-27T03:25Z UTC
- **OPSEC:** Tor + proxychains4, 2Captcha (Cloudflare bypass)
- **Janela:** em andamento

## Sumário executivo

Engagement black-box de `degraucultural.com.br` (Editora Degrau Cultural /
plataforma white-label **Seducar**). Recon passivo + ativo concluídos.

**Vetor-chave (CRÍTICO):** Os backends AdonisJS em `*.onrender.com` foram
vazados via header CSP + bundles JS dos SPAs. Eles **bypassam o WAF
Cloudflare** do cliente, expondo endpoints de autenticação (`auth/user/login`,
`auth/users/login`, `auth/teacher/Login`, `auth/customer`, `auth/user/school`
multi-tenant, `auth/user/logs`). Alvo #1 para auth bypass / default creds /
JWT none-weak / mass-assignment `role=admin`.

**Ambientes de homologação/staging expostos diretos** (sem Cloudflare):
`homolog`, `staging`, `crm`, `crm-hml`, `dashboard`, `pagamento`.

**App de pagamento** + Vindi (financeiro) exposto direto. **Site antigo**
Joomla/jQuery 1.11.1 legado com `/administrator`. **Painel admin**
(`admin.degraucultural.com.br`) existe mas origin está DOWN (522) — re-testar.

Fases 2-3 concluídas. Próximas: enum JS profunda → webapp (auth bypass nos
backends Render) → CVE/exploit → pós-ex.

## Findings por severidade

| ID | Severidade | Título | Host | Status |
|----|-----------|--------|------|--------|
| F-A1 | CRÍTICA | Backends Render vazados bypass CF + endpoints auth expostos | *.onrender.com | confirmado |
| F-A2 | ALTA | CRM auth/user/school multi-tenant + auth/user/logs 401 + CASL RBAC | api-crm-h4ww.onrender.com | confirmado |
| F-A3 | ALTA | Stack traces AdonisJS + error dump vazando paths /opt/render | seducar-api-website*.onrender.com | confirmado |
| F-A4 | ALTA | Ambientes homolog/staging expostos diretos (sem CF) | homolog/staging/crm/crm-hml/dashboard | confirmado |
| F-A5 | ALTA | Bundles JS expõem API surface completa | crm/homolog SPAs | confirmado |
| F-A6 | ALTA | Auth cross-domain maisquestões vazada no CSP | auth-v2.maisquestoes.com.br | confirmado |
| F-A7 | ALTA | App de pagamento + Vindi exposto direto | pagamento.degraucultural.com.br | confirmado |
| F-A8 | MÉDIA | Site antigo Joomla + jQuery 1.11.1 legado (/administrator, /admin2, .asp) | antigo.degraucultural.com.br | confirmado |
| F-A9 | MÉDIA | Painel admin.degraucultural.com.br (origin 522 DOWN) | admin.degraucultural.com.br | re-testar |
| F-A10 | MÉDIA | Sister brand centraldeconcursos.com.br vazada no CSP | centraldeconcursos.com.br | info |

## Attack surface
Ver `recon/SUMMARY.md` (ranking de payoff completo).

## Acessos obtidos
(nenhum até o momento)

## Objetivos de alto valor
- [ ] Acesso interno (foothold)
- [ ] Acesso administrativo (admin/RCE)
- [ ] Acesso financeiro
- [ ] Acesso a dados/PII

## Cronologia
Ver `timeline.log`.

## Evidências
Ver `evidence/F-XXX.txt`.
