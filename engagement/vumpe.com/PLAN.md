# PLAN — vumpe.com

**Alvo:** vumpe.com
**Criado:** 2026-08-25
**Status:** ATIVO

---

## Backlog de Vetores

| # | Vetor | Fase | Status | Prioridade | Notas |
|---|-------|------|--------|------------|-------|
| 1 | Recon passivo: DNS, subdomínios, certs, wayback, tech stack | recon-passive | ✅ DONE | ALTA | PASSIVE.md gerado — Cloudflare, Vercel, Next.js, 18 subs, S3 bucket |
| 2 | OSINT: emails, pessoas, breaches, GitHub | osint | ✅ DONE | ALTA | OSINT.md — Vumpe Tecnologia, Reiner Sauer, contato@vumpe.com |
| 3 | Recon ativo: portscan, fingerprint, vhosts, WAF | recon-active | ✅ DONE | ALTA | ACTIVE.md — 5 Vercel IPs sem WAF, CORS wildcard, 100+ rotas |
| 4 | Consolidar attack surface + ranking payoff | coordinator | ✅ DONE | ALTA | SUMMARY.md gerado — 18 vetores ranqueados |
| 5 | Enumeração profunda: JS, API, chunks | enum | ✅ DONE | ALTA | 107 chunks, PostHog, manager-route, staging mcl4.ruyter.com |
| 6 | Ataque webapp: OWASP Top 10 | webapp | ✅ DONE | ALTA | F-004 a F-008 confirmados — manager impersonation, CORS, PostHog |
| 7 | CVE research por versões | cve | ✅ DONE | MÉDIA | CVE-2025-29927 (testado, não funcional), 12 CVEs mapeados |
| 8 | 🎯 Exploit validation — Manager Impersonation | exploit | IN PROGRESS | 🔴 CRÍTICA | JS bundle analysis da manager-login page, testar uuid/code bypass |
| 9 | 🤖 Exploit validation — CORS PoC + CSRF | exploit | PENDING | ALTA | Criar PoC de exfiltração cross-origin |
| 10 | ☁️ Exploit validation — S3 bucket | exploit | PENDING | MÉDIA | Tentar acesso a objetos específicos via nomes previsíveis |
| 11 | 📸 Screenshots | screenshots | PENDING | BAIXA | Capturar evidências visuais |
| 12 | 📋 Relatório final | report | PENDING | MÉDIA | Consolidar todos os findings |

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