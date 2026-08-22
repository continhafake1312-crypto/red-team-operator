# PLAN.md — Engagement iptvguard.app

## Status Geral
- **Fase atual**: 1. Escopo (concluído) → 2. Recon Passivo + OSINT (próximo)
- **Progresso**: 0% (engagement novo)
- **Última atualização**: 2026-08-22T18:00:00Z

## Fases do Engagement (§5 AGENTS.md)

| Fase | Status | Especialista | Entregável | Observações |
|------|--------|--------------|------------|-------------|
| 1. Escopo | ✅ Concluído | Coordinator | SCOPE.md | Autorização ampla assumida |
| 2. Recon Passivo + OSINT | 🔄 Próximo | recon-passive + osint | recon/subdomains.txt, recon/certs.txt, recon/wayback.txt, recon/techstack.txt, recon/osint.txt | Exaustivo: TODOS subdomínios, certs, wayback, OSINT empresa/emails/vazamentos |
| 3. Recon Ativo | ⏳ Pendente | recon-active | recon/portscan.txt, recon/services.txt, recon/vhosts.txt, recon/waf.txt, recon/tls.txt | Exaustivo: TODAS portas, hosts, serviços, versões, vhosts, WAF, TLS, IP real |
| 4. Consolidar Attack Surface | ⏳ Pendente | Coordinator | recon/SUMMARY.md | Ranking de payoff (§16) |
| 5. Enumeração Profunda | ⏳ Pendente | enum | enum/endpoints.txt, enum/js.txt, enum/params.txt, enum/api.txt, enum/cms.txt | Exaustivo: TODOS endpoints, JS, parâmetros, APIs, CMS |
| 6. Ataque WebApp | ⏳ Pendente | webapp | webapp/findings.txt, evidence/F-*.txt | OWASP Top 10 + checker-specific |
| 7. CVE Research + Exploit | ⏳ Pendente | cve → exploit | cve/cves.txt, exploit/validated.txt | Se RCE/cred candidate |
| 8. Pós-Exploração | ⏳ Pendente | postex | loot/, postex/ | APENAS se foothold confirmado |
| 9. Relatório Final | ⏳ Pendente | report | REPORT.md final | Consolida tudo |

## Backlog de Vetores (§19) — Caçada Contínua
*Vetores pausados com motivo e gatilho de retorno*

| Vetor | Status | Motivo da Pausa | Gatilho de Retorno |
|-------|--------|-----------------|-------------------|
| — | — | — | — |

## Próximas Ações Imediatas
1. Delegar Fase 2 (Recon Passivo + OSINT) ao subagente `recon-passive` + `osint`
2. Aguardar retorno, consolidar em `recon/SUMMARY.md`
3. Delegar Fase 3 (Recon Ativo) ao subagente `recon-active`
4. Continuar conforme findings

## Notas de Adaptação por Alvo (§1, §13)
- Alvo aparenta ser serviço de "IPTV checker" — funcionalidade de validação/teste de listas M3U/credenciais IPTV
- Vetores prioritários: auth bypass no checker, IDOR em resultados, SSRF via URL de lista, upload de M3U malicioso, SQLi em parâmetros de busca
- Provável stack: Node.js/Python/Go backend, React/Vue frontend, possivelmente Cloudflare (comum em IPTV)
- Foco em funcionalidade "checker" — pode expor credenciais de terceiros, logs, APIs internas