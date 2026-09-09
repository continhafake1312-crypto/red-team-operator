# PLAN.md — BuscaPrime

## Meta
Teste de intrusão black-box completo em buscaprime.com.br

## Status Atual
**Fase Atual:** 1 — Escopo criado. Iniciando Fase 2 (Recon Passivo + OSINT).

## Fases e Especialistas

| Fase | Especialista | Status | Observação |
|------|-------------|--------|-----------|
| 1. Escopo | — | ✅ Concluído | SCOPE.md criado |
| 2. Recon Passivo + OSINT | `recon-passive` + `osint` | 🔄 Pendente | Subdelega para osint |
| 3. Recon Ativo | `recon-active` | ⏳ Pendente | Aguardar Fase 2 |
| 4. Consolidar Attack Surface | — | ⏳ Pendente | Após Fase 2+3 |
| 5. Enumeração Profunda | `enum` | ⏳ Pendente | Após Fase 4 |
| 6. Ataque Webapp | `webapp` | ⏳ Pendente | Após Fase 5 |
| 7. CVE Research + Exploit | `cve` + `exploit` | ⏳ Pendente | Após Fase 6 |
| 8. Pós-Exploração | `postex` | ⏳ Pendente | Se foothold |
| 9. Relatório | `report` | ⏳ Pendente | Final |

## Backlog de Vetores (caçada contínua §19)

### Ativos
- [ ] **VD-01**: painel.buscaprime.com.br — painel de login/admin
- [ ] **VD-02**: API endpoints de consulta de dados
- [ ] **VD-03**: Subdomínios não catalogados
- [ ] **VD-04**: Buckets cloud (S3/Azure) com dados
- [ ] **VD-05**: Wayback endpoints vazando dados sensíveis
- [ ] **VD-06**: Possível vulnerabilidade em Next.js (se identificado)
- [ ] **VD-07**: SQLi/NoSQLi nos endpoints de busca

### Pausados (motivo + gatilho de retorno)
- (nenhum)

### Exauridos
- (nenhum)

## Priorização de Payoff (§16)
| Rank | Alvo | Payoff | Nota |
|------|------|--------|------|
| 1 | painel.buscaprime.com.br | 🔴 Crítico | Painel admin — acesso a todos os dados |
| 2 | API de consulta | 🔴 Crítico | Endpoints com dados sensíveis (CPF, nome, tel) |
| 3 | Subdomínios ocultos | 🟠 Alto | Pode revelar ambientes dev/staging |
| 4 | Buckets cloud | 🟠 Alto | Vazamento de dados |
| 5 | Wayback data | 🟡 Médio | Endpoints antigos, JS, chaves |
| 6 | CMS/tecnologias | 🟢 Baixo | Info para direcionar ataques |

## Credenciais / Acessos Obtidos
(nenhum até o momento)

## Evidências
(nenhuma até o momento)

---
**Última atualização:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")