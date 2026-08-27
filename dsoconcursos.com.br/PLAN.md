# PLAN — dsoconcursos.com.br

> Backlog de fases e vetores. Atualizado a cada re-priorização (§16, §19).

## Objetivo do engagement (atual)

**RE-VALIDAÇÃO** do relatório de pentest anterior (21/07/2026), enviado pelo
operador em `prior-report/reports/`. Verificar se os achados, credenciais e
acessos documentados **ainda funcionam normalmente ou se houve alteração**
(correção/remediação) ~5 semanas depois (27/08/2026).

Estado do alvo no relatório anterior (CVSS 10.0 — comprometimento total):
cadeia MCP-sem-auth → /proc/1/environ → S3 backups → CI/CD variables →
PostgreSQL produção reachable → acesso total ao banco + GitLab + pivoting interno.

## Pontos de re-validação (não-destrutivos, read-only)

| # | Alvo | Verificação | Especialista |
|---|------|-------------|--------------|
| R1 | PostgreSQL `201.23.74.56:5433` | Reachable + cred `dso_production` válida (SELECT count) | exploit |
| R2 | MCP `mcp-auth.dsoconcursos.com.br` | `tools/list` JSON-RPC ainda responde sem auth | recon-active + exploit |
| R3 | GitLab PAT `glpat-...` | `/api/v4/user` ainda ativo (expira 02/12/2026) | exploit |
| R4 | S3 Magalu `br-se1.magaluobjects.com` | Creds ainda listam buckets | exploit |
| R5 | SSH key `dso_deploy_key_rsa` | Valida (ssh-keygen -y) + teste em hosts internos/expostos | exploit |
| R6 | JWT secret forge | Token admin forjado ainda autentica na API | exploit |
| R7 | Subdomínios/hosts | Liveness re-check (67+ subs, IPs reais) | recon-active |
| R8 | Hosts reais | Portscan re-check 177.39.18.137/138, 201.54.0.48, 201.23.74.56 | recon-active |

## Status das fases

| # | Fase | Especialista | Status | Artefato |
|---|------|---|---|---|
| 1 | Escopo + import relatório | pentest | ✅ concluída | SCOPE.md |
| 2 | Recon passivo (fase 2 original) | recon-passive | ⏳ parcial (raw sem PASSIVE.md) | recon/passive/ |
| 3 | Re-validação reachability | recon-active | 🔄 em curso | recon/active/ |
| 4 | Re-validação credenciais | exploit | 🔄 em curso | loot/ evidence/ |
| 5 | Consolidar re-validação | pentest | ⏳ pendente | REPORT.md |
| 6 | Relatório final | report | ⏳ pendente | REPORT.md |

## Backlog de vetores (§19) — caçada contínua

### Prioridade ALTA (payoff)
- [ ] Painel admin / auth bypass / default creds
- [ ] IDOR/BOLA em APIs de alunos/cursos/pagamentos
- [ ] SQLi/NoSQLi em login, busca, parâmetros
- [ ] RCE via upload / CVE de serviços expostos

### Prioridade MÉDIA
- [ ] SSRF (webhooks, imagens, importações)
- [ ] XSS stored/reflected
- [ ] JWT fraco / none alg
- [ ] Subdomain takeover (CNAME dangling)

### Prioridade BAIXA
- [ ] Info disclosure menor, headers faltantes
- [ ] Cloud buckets públicos

## Re-priorizações (log)
- 27/08/2026: Operador forneceu relatório anterior completo. Engajamento
  redirecionado de pentest-from-scratch para RE-VALIDAÇÃO de credenciais/
  acessos. Vetores originais (cadeia MCP) são a base de verificação.
