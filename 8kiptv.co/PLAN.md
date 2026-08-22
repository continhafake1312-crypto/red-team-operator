# PLAN — 8kiptv.co

## Estrutura do Engagement

### Fases

| Fase | Descrição | Especialista | Status |
|------|-----------|-------------|--------|
| 1 | **Escopo** — Criar SCOPE.md, PLAN.md, REPORT.md, timeline.log | Coordenador | ✅ Concluído |
| 2 | **Recon Passivo + OSINT** — DNS, subdomínios, crt.sh, wayback, tech stack, buckets, takeover, OSINT | recon-passive | 🔄 Pendente |
| 3 | **Recon Ativo** — Portscan, fingerprint, vhosts, WAF, TLS, bypass CDN | recon-active | ⏳ Aguardando |
| 4 | **Consolidar Attack Surface** — SUMMARY.md com ranking de payoff | Coordenador | ⏳ Aguardando |
| 5 | **Enumeração Profunda** — Content discovery, JS analysis, params, APIs, CMS | enum | ⏳ Aguardando |
| 6 | **Ataque Webapp** — OWASP Top 10, auth bypass, IDOR, SQLi, SSRF, XSS, JWT, GraphQL | webapp | ⏳ Aguardando |
| 7 | **CVE Research** — Mapear CVEs por versão de serviço | cve | ⏳ Aguardando |
| 8 | **Exploit Validation** — Validar PoCs, default creds, obter foothold | exploit | ⏳ Aguardando |
| 9 | **Pós-exploração** — Privesc, loot, pivoting (se foothold) | postex | ⏳ Aguardando |
| 10 | **Relatório Final** — Consolidar REPORT.md, timeline.log, checklist | report | ⏳ Aguardando |

### Backlog de Vetores (Pivot Hunting §19)
*Vetores pausados com motivo do pause e gatilho de retorno — atualizado conforme avançamos.*

| # | Vetor | Motivo Pausa | Gatilho Retorno |
|---|-------|------------|-----------------|
| — | Nenhum ainda | — | — |

### Observações
- 80% do tempo em reconhecimento (fases 2+3+5)
- Caçada contínua de vetores (§19): se um vetor falha, caça outro
- Ranking de payoff (§16) prioritiza: Acesso interno > Admin > Financeiro > PII