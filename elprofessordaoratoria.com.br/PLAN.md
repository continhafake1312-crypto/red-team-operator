# PLAN — elprofessordaoratoria.com.br

## Plano de Execução (ordem emergente)

| Fase | Especialista | Status | Notas |
|------|-------------|--------|-------|
| 1. Escopo + Setup | Coordenador | ✅ Concluído | Estrutura criada |
| 2. Recon Passivo + OSINT | recon-passive | ⏳ Pendente | DNS/subdomínios/wayback/OSINT/cloud |
| 3. Recon Ativo | recon-active | ⏳ Pendente | Portscan/fingerprint/vhosts/WAF |
| 4. Consolidar Attack Surface | Coordenador | ⏳ Pendente | recon/SUMMARY.md + ranking payoff |
| 5. Enumeração Profunda | enum | ⏳ Pendente | Content discovery/JS/API/CMS |
| 6. Ataque Webapp | webapp | ⏳ Pendente | OWASP Top 10 |
| 7. CVE Research | cve | ⏳ Pendente | Mapear CVEs por versão |
| 8. Exploit Validation | exploit | ⏳ Pendente | Validar PoCs/creds |
| 9. Pós-Exploração | postex | ⏳ Pendente | Se foothold |
| 10. Relatório | report | ⏳ Pendente | REPORT.md final |

## Ranking de Payoff (atualizado dinamicamente)

| # | Vetor | Payoff | Status |
|---|-------|--------|--------|
| 1 | Acesso admin (painéis/creds) | ALTO | Pendente |
| 2 | Acesso interno (foothold) | ALTO | Pendente |
| 3 | Acesso financeiro | ALTO | Pendente |
| 4 | SQLi / NoSQLi | ALTO | Pendente |
| 5 | IDOR / BOLA | ALTO | Pendente |
| 6 | SSRF | MÉDIO | Pendente |
| 7 | XSS | MÉDIO | Pendente |
| 8 | Info disclosure | BAIXO | Pendente |

## Backlog de Vetores (pausados com gatilho)

(Nenhum ainda)

## Decisões de Pivot

(Nenhuma ainda)

## Chave 2Captcha
Armazenada em `~/.config/opencode/.2captcha_key` (fora do repo, chmod 600).