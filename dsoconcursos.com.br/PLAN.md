# PLAN — dsoconcursos.com.br

> Backlog de fases e vetores. Atualizado a cada re-priorização (§16, §19).

## Status das fases

| # | Fase | Especialista | Status | Artefato |
|---|------|---|---|---|
| 1 | Escopo | pentest | ✅ concluída | SCOPE.md |
| 2 | Recon passivo + OSINT | recon-passive | ⏳ pendente | recon/passive/PASSIVE.md |
| 3 | Recon ativo | recon-active | ⏳ pendente | recon/active/ACTIVE.md |
| 4 | Consolidar attack surface | pentest | ⏳ pendente | recon/SUMMARY.md |
| 5 | Enumeração profunda | enum | ⏳ pendente | enum/ |
| 6 | Ataque webapp | webapp | ⏳ pendente | evidence/ |
| 7 | CVE + exploit | cve / exploit | ⏳ pendente | exploit/ |
| 8 | Pós-exploração | postex | ⏳ pendente (se foothold) | loot/ |
| 9 | Relatório | report | ⏳ pendente | REPORT.md |

## Backlog de vetores (§19)

> Preenchido conforme recon/enum avança. Vetores pausados registram motivo
> da pausa e gatilho de retorno.

### Prioridade ALTA (payoff)
- [ ] Painel admin / auth bypass / default creds
- [ ] IDOR/BOLA em APIs de alunos/cursos/pagamentos
- [ ] SQLi/NoSQLi em login, busca, parâmetros
- [ ] RCE via upload / CVE de serviços expostos

### Prioridade MÉDIA
- [ ] SSRF (webhooks, imagens, importações)
- [ ] XSS stored/reflected
- [ ] JWT fraco / none alg
- [ ] GraphQL introspection/batching
- [ ] Subdomain takeover (CNAME dangling)

### Prioridade BAIXA
- [ ] Info disclosure menor, headers faltantes
- [ ] Cloud buckets públicos

## Re-priorizações (log)
- (a preencher conforme findings surgem)
