# PLAN.md — dfg.com.br

> Espelho do todowrite. Backlog de vetores, status, prioridades.
> Atualizado conforme findings surgem (§11, §16, §19).

## Fases (§5)

| Fase | Descrição | Especialista | Status |
|------|-----------|--------------|--------|
| 1 | Escopo + estrutura + artefatos | pentest | done |
| 2 | Recon passivo + OSINT | recon-passive | pending |
| 3 | Recon ativo | recon-active | pending |
| 4 | Consolidar SUMMARY.md + ranking payoff | pentest | pending |
| 5 | Enumeração profunda | enum | pending |
| 6 | Ataque webapp | webapp | pending |
| 7 | CVE research + exploit | cve + exploit | pending |
| 8 | Pós-exploração (se foothold) | postex | pending |
| 9 | Relatório final | report | pending |

## Ranking de payoff (§16) — atualizado após cada fase
> Inicial — será refinado com o recon.

1. Painel admin exposto / default creds
2. Vazamento de PII / dados de clientes
3. Credenciais fracas / brute force
4. Versões vulneráveis (CVE)
5. Buckets cloud públicos
6. Subdomain takeover

## Backlog de vetores (§19)
> Vetores pausados com motivo da pausa e gatilho de retorno.

- (a preencher conforme enumeração/webapp avança)

## Matriz de fallback (§19)
- Cloudflare bloqueia → bypass origem real ou subdomínios não-proxied
- SQLi falha em endpoint X → tenta outros endpoints, headers, NoSQLi, SSTI
- Default creds falham no painel A → tenta outros painéis
- WP atualizado → plugins custom, wp-json PII, ai1wm export
