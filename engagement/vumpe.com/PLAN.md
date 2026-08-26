# PLAN — vumpe.com

**Alvo:** vumpe.com
**Criado:** 2026-08-25
**Status:** ATIVO

---

## Backlog de Vetores

| # | Vetor | Fase | Status | Prioridade | Notas |
|---|-------|------|--------|------------|-------|
| 1 | Recon passivo: DNS, subdomínios, certs, wayback, tech stack | recon-passive | PENDING | ALTA | Delegar recon-passive |
| 2 | OSINT: emails, pessoas, breaches, GitHub | osint | PENDING | ALTA | Delegar osint (paralelo) |
| 3 | Recon ativo: portscan, fingerprint, vhosts, WAF | recon-active | PENDING | ALTA | Após recon passivo |
| 4 | Consolidar attack surface + ranking payoff | coordinator | PENDING | ALTA | Escrever SUMMARY.md |
| 5 | Enumeração profunda: content discovery, JS, API | enum | PENDING | ALTA | Após SUMMARY |
| 6 | Ataque webapp: OWASP Top 10 | webapp | PENDING | ALTA | Após enum |
| 7 | CVE research por versões | cve | PENDING | MÉDIA | Após fingerprint |
| 8 | Exploit validation | exploit | PENDING | MÉDIA | Se CVE/cred encontrado |
| 9 | Pós-exploração | postex | PENDING | BAIXA | Se foothold |
| 10 | Relatório final | report | PENDING | MÉDIA | Após todas as fases |

---

## Gatilhos de Retorno

- Se subdomínio admin encontrado → priorizar enum + webapp
- Se credencial vazada encontrada → priorizar exploit
- Se API descoberta → priorizar enum de API
- Se Cloudflare detectado → buscar IP real (bypass CDN)
- Se bucket/takeover → priorizar cloud

## Histórico de Priorização

| Timestamp | Ação |
|-----------|------|
| 2026-08-25T00:00:00Z | Início do engagement |

---

## Matriz de Fallback (§19)

Se um vetor não renderiza, tentar na ordem:
1. Próximo vetor na mesma fase (e.g., outro host/porta)
2. Vetor de fase adjacente
3. Vetor de menor payoff não explorado
4. Revisitar fase anterior com novos dados
5. Se todos explorados → engagement completo