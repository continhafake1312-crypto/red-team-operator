# PLAN — promisse.com.br

## Metodologia
Framework pentest autônomo black-box Web/API externo.

## Fases

| # | Fase | Especialista | Status | Notas |
|---|------|-------------|--------|-------|
| 1 | Escopo | Coordenador | ✅ Completo | SCOPE.md criado |
| 2 | Recon passivo + OSINT | recon-passive | ✅ Completo | api.promisse.com.br, /docs, reCAPTCHA key, Next.js/Vercel/CF |
| 3 | Recon ativo | recon-active | ✅ Completo | Vercel IPs bypass CF, Railway API, CORS, status DEPLOYMENT_NOT_FOUND |
| 4 | Consolidar attack surface | Coordenador | ✅ Completo | SUMMARY.md com ranking de payoff |
| 5 | Enumeração profunda | enum | ✅ Completo | /infos público, /health público, 14 endpoints API, CORS crítico, sk_live_* |
| 6 | Ataque webapp | webapp | ✅ Completo | 7 findings (F-001 a F-007). CORS crítico, sem rate limiting, info disclosure. Auth bypass falhou. |
| 7 | CVE research + exploit | cve + osint + exploit | ✅ Completo | iOS App info obtida. /register descoberto. Stealth bypass reCAPTCHA comprovado. CVE research não identificou CVEs aplicáveis ao stack. |
| 8 | Pós-exploração | postex | ❌ Não executado | Sem foothold (API key não obtida) |
| 9 | Relatório | report | ✅ Completo | REPORT.md final consolidado |
| 8 | Pós-exploração | postex | ⏳ Pendente | Se foothold |
| 9 | Relatório | report | ⏳ Pendente | REPORT.md final |

## Backlog de Vetores
> Vetores pausados com motivo e gatilho de retorno.

| Vetor | Status | Motivo | Gatilho |
|-------|--------|--------|---------|
| API docs abuse | ⏸ Pausado | Aguardando fingerprint completo da API | Após enum profunda |
| reCAPTCHA abuse | ⏸ Pausado | Aguardando confirmação de endpoints que usam reCAPTCHA | Após enum do frontend |
| Wildcard fuzzing | ⏸ Pausado | Aguardando confirmação de quais wildcards são válidos | Após recon ativo (vhosts) |

## Ranking de Payoff (Atualizado a cada finding)
| Alvo | Host | Vetor | Payoff Estimado | Descrição |
|------|------|-------|-----------------|-----------|
| API | api.promisse.com.br | IDOR/BOLA/Auth bypass | 🔴 ALTO | CORS permissivo, docs expostos, endpoints PIX/saques/webhooks |
| API docs | promisse.com.br/docs | Information Disclosure | 🔴 ALTO | Documentação completa da API exposta |
| reCAPTCHA | promisse.com.br | Cross-site abuse | 🟡 MÉDIO | Site key exposta pode ser usada em outros sites |
| Status | status.promisse.com.br | Info disclosure | 🟡 MÉDIO | Página de status Vercel retornando 404 |
| Next.js | promisse.com.br | JS analysis | 🟡 MÉDIO | Chunks podem conter endpoints/chaves embutidas |
| Pessoas | João Figueiredo | OSINT/Social | 🟢 BAIXO | Possível engenharia social ou credential stuffing |