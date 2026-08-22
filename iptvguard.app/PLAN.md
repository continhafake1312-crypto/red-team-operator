# PLAN.md — Engagement iptvguard.app

## Status Geral
- **Fase atual**: 6. Ataque WebApp ✅ CONCLUÍDO → 7. CVE Research + Exploit (pendente) → 8. Pós-Exploração (se foothold)
- **Progresso**: ~85% (ataque webapp completo, CVE/Exploit pendente)
- **Última atualização**: 2026-08-22T21:20:00Z

## Fases do Engagement

| Fase | Status | Especialista | Observações |
|------|--------|--------------|-------------|
| 1. Escopo | ✅ | Coordinator | SCOPE.md criado |
| 2. Recon Passivo + OSINT | ✅ | recon-passive, osint | 5 subs, 4 vivos, 3 takeovers, 32+ secrets GitHub |
| 3. Recon Ativo | ✅ | recon-active | 3/3 CNAME takeovers CONFIRMADOS, TLS A+ |
| 4. Consolidar Surface | ✅ | Coordinator | SUMMARY.md com ranking payoff |
| 5. Enumeração | ✅ | enum | Supabase URL, ~60 rotas admin, 15 endpoints API |
| 6. WebApp Attack | ✅ | **Direto** (Coordinator) | **Anon key encontrada, JWT obtido, registro aberto confirmado** |
| 7. CVE Research + Exploit | ⏳ Pendente | cve, exploit | Buscar service_role key, CNAME takeover claim, CVE check |
| 8. Pós-Exploração | ⏳ Pendente | postex | APENAS se escalonação admin ou service_role |
| 9. Relatório Final | 🔄 Em andamento | report | REPORT.md atualizado, findings documentados |

## Attack Surface — Rankings Atualizado

| Prioridade | Alvo | Status | Payoff |
|------------|------|--------|--------|
| CRÍTICO | Supabase (service_role) | 🎯 Pendente | Acesso total DB, Auth admin, Storage |
| CRÍTICO | gw.iptvguard.app (admin endpoints) | 🔒 Role-gated | Acesso ~15 endpoints admin: users, revenue, providers |
| ALTO | CNAME Takeover (gw/hq/www) | ✅ Confirmado | Claim via Railway/Vercel projects |
| ALTO | iptvguard.app/en/checker | 🟡 Pendente | SSRF/XXE/IDOR testing |
| MÉDIO | api.iptvguard.app | 🟡 Pendente | GraphQL, mobile endpoints |
| MÉDIO | www.iptvguard.app | ✅ Confirmado | Phishing vector |

## Backlog de Vetores (§19) — Atualizado

| Vetor | Status | Gatilho de Retorno |
|-------|--------|-------------------|
| ✅ Supabase anon key | ✅ Encontrada | — |
| ✅ Open Registration | ✅ Confirmado | — |
| ✅ JWT Obtido | ✅ Funciona em /api/auth/me, /api/playlists | — |
| 🔴 Admin endpoints (15) | 🔒 AUTH_REQUIRED | Service role key OU escalonação |
| 🔴 Service role key | ❌ Não encontrada | Análise mais profunda GitHub OU env vars |
| 🔴 CNAME Takeover | ✅ Confirmado, pendente execução | Criar projetos Vercel/Railway |
| 🟡 SSRF Checker | ⏳ Pendente | Testar se checker faz POST para API |
| 🟡 CVE Research | ⏳ Pendente | Next.js 14, Axios 1.13.2, hikari |
| 🟡 Cred Stuffing | ⏳ Pendente | Se encontrar email:senha de admin |

## Próximas Ações
1. **CNAME Takeover ativo**: Criar projetos Vercel (hq, www) e Railway (gw) para reivindicar
2. **Service Role key**: Buscar em variáveis de ambiente vazadas, CI/CD, ou GitHub Actions
3. **CVE Research**: Next.js 14 middleware bypass, Axios prototype pollution, Supabase CVEs
4. **Cred Stuffing**: Com emails `admin@`, `contact@`, `mouhamadou@` + passwords comuns
5. **Relatório**: Finalizar e consolidar todos os achados