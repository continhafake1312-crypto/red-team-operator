# Plano de Engagement — teste-iptv.mov

**Última atualização:** 2026-08-22T00:00:00Z
**Fase atual:** 1 - Escopo (concluída) → 2 - Recon Passivo (próxima)

## Fases do Engagement

| Fase | Status | Especialista | Descrição |
|------|--------|--------------|-----------|
| 1. Escopo | ✅ Concluída | — | Criação de SCOPE.md, estrutura de pastas |
| 2. Recon Passivo + OSINT | 🔄 Próxima | `recon-passive` | DNS, subdomínios, certs (crt.sh), wayback, tech stack, Shodan, OSINT empresa/emails/vazamentos |
| 3. Recon Ativo | ⏳ Pendente | `recon-active` | Portscan full, fingerprint serviços, vhosts, WAF detection, TLS, IP real (bypass CDN) |
| 4. Consolidar Attack Surface | ⏳ Pendente | — | Escrever `recon/SUMMARY.md` com ranking de payoff (§16) |
| 5. Enumeração Profunda | ⏳ Pendente | `enum` | Content discovery, JS analysis, param mining, API endpoints, CMS detection |
| 6. Ataque WebApp | ⏳ Pendente | `webapp` | OWASP Top 10: auth bypass, injeção, IDOR/BOLA, SSRF, XSS, upload, JWT, GraphQL |
| 7. CVE Research | ⏳ Pendente | `cve` | Mapear CVEs por serviço/versão, clonar PoCs, avaliar aplicabilidade |
| 8. Exploit Validation | ⏳ Pendente | `exploit` | Executar PoCs não-destrutivas, validar creds default, obter foothold |
| 9. Pós-Exploração | ⏳ Pendente | `postex` | Privesc, loot, pivoting, persistência (após foothold confirmado) |
| 10. Relatório Final | ⏳ Pendente | `report` | Consolidar REPORT.md final |

## Backlog de Vetores (Pivot Hunting §19)

*Vetores pausados com motivo e gatilho de retorno — atualizado conforme findings surgem.*

| Vetor | Status | Motivo da Pausa | Gatilho de Retorno |
|-------|--------|-----------------|-------------------|
| — | — | — | — |

## Findings Confirmados

*Nenhum finding confirmado ainda.*

## Acessos Obtidos

*Nenhum acesso obtido ainda.*

## Objetivos de Alto Valor Atingidos

*Nenhum objetivo atingido ainda.*

## Próximas Ações Imediatas
1. Delegar Fase 2 (Recon Passivo) ao especialista `recon-passive`
2. Aguardar retorno e consolidar em `recon/SUMMARY.md`
3. Delegar Fase 3 (Recon Ativo)