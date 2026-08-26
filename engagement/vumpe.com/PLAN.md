# PLAN — vumpe.com

**Alvo:** vumpe.com
**Criado:** 2026-08-25
**Status:** ATIVO

---

## Backlog de Vetores

| # | Vetor | Fase | Status | Prioridade | Notas |
|---|-------|------|--------|------------|-------|
| 1 | Recon passivo: DNS, subdomínios, certs, wayback, tech stack | recon-passive | ✅ DONE | ALTA | PASSIVE.md gerado — Cloudflare, Vercel, Next.js, S3 bucket exposto |
| 2 | OSINT: emails, pessoas, breaches, GitHub | osint | ✅ DONE | ALTA | OSINT.md gerado — Vumpe Tecnologia Ltda, Reiner Sauer, contato@vumpe.com |
| 3 | Recon ativo: portscan, fingerprint, vhosts, WAF | recon-active | IN PROGRESS | ALTA | Encontrar IP real bypass Cloudflare, escanear Vercel edges |
| 4 | Consolidar attack surface + ranking payoff | coordinator | PENDING | ALTA | Escrever SUMMARY.md |
| 5 | Enumeração profunda: content discovery, JS, API | enum | PENDING | ALTA | Após SUMMARY — foco em /api/*, JS bundle, clipador |
| 6 | Ataque webapp: OWASP Top 10 | webapp | PENDING | ALTA | Após enum — foco em auth bypass, IDOR, bucket S3 |
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
| 2026-08-26T00:00:00Z | RECON_PASSIVO + OSINT concluído — ver PASSIVE.md / OSINT.md |
| 2026-08-26T00:00:00Z | Attack surface: Cloudflare+Next.js+Vercel; subdomínios ativos: clipador, anunciante, mcl, up-mcl; bucket S3 exposto social-tracker-bucket-production; Sentry DSN vazado |

---

## Matriz de Fallback (§19)

Se um vetor não renderiza, tentar na ordem:
1. Próximo vetor na mesma fase (e.g., outro host/porta)
2. Vetor de fase adjacente
3. Vetor de menor payoff não explorado
4. Revisitar fase anterior com novos dados
5. Se todos explorados → engagement completo