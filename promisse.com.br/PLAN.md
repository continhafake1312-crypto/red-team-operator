# PLAN — promisse.com.br

## Metodologia
Framework pentest autônomo black-box Web/API externo.

## Fases

| # | Fase | Especialista | Status | Notas |
|---|------|-------------|--------|-------|
| 1 | Escopo | Coordenador | ✅ Completo | SCOPE.md criado |
| 2 | Recon passivo + OSINT | recon-passive | ✅ Completo | api.promisse.com.br, /docs, reCAPTCHA key, Next.js/Vercel/CF |
| 3 | Recon ativo | recon-active | 🔄 Em andamento | Portscan IPs reais, bypass CF, vhosts, WAF |
| 4 | Consolidar attack surface | Coordenador | ⏳ Pendente | SUMMARY.md com ranking de payoff |
| 5 | Enumeração profunda | enum | ⏳ Pendente | Content discovery, JS, API, CMS |
| 6 | Ataque webapp | webapp | ⏳ Pendente | OWASP Top 10 |
| 7 | CVE research + exploit | cve / exploit | ⏳ Pendente | PoCs |
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