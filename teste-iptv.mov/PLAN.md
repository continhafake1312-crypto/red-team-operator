# Plano de Engagement — teste-iptv.mov

**Última atualização:** 2026-08-22T18:55:00Z
**Fase atual:** 3 - Recon Ativo (concluída) → 4 - Consolidar Attack Surface (próxima)

## Fases do Engagement

| Fase | Status | Especialista | Descrição |
|------|--------|--------------|-----------|
| 1. Escopo | ✅ Concluída | — | Criação de SCOPE.md, estrutura de pastas |
| 2. Recon Passivo + OSINT | ✅ Concluída | `recon-passive` | DNS, subdomínios, certs, wayback, tech stack, OSINT — 1 subdomínio vivo, Cloudflare full proxy, IP real oculto, zero buckets/takeover |
| 3. Recon Ativo | ✅ Concluída | `recon-active` | Portscan full, fingerprint, vhosts, WAF, TLS, IP real (bypass CDN) — **0 hosts diretos, IP real NÃO ENCONTRADO, WAF bloqueia enum, SPA estática** |
| 4. Consolidar Attack Surface | 🔄 Próxima | — | Escrever `recon/SUMMARY.md` com ranking de payoff (§16) |
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
| Bypass Cloudflare / Origin IP Discovery | 🔄 Ativo (contínuo) | Cloudflare proxy total — IP real oculto | Descoberta de IP real via subdomínios não-proxied, SSL certs históricos, zone transfer, VHost fuzzing, email headers, passive DNS histórico |
| Subdomain brute-force massivo | 🔄 Ativo (contínuo) | Apenas domínio apex resolvido | Wordlists maiores, DNS bruteforce ativo, permutation, CT logs monitor |
| VHost Fuzzing | ⏳ Pausado | WAF bloqueia (403 uniforme) | Bypass WAF bem-sucedido (cookie challenge, header evasão) |
| Content Discovery (ffuf/feroxbuster) | ⏳ Pausado | WAF bloqueia (403/404 uniforme) | Bypass WAF bem-sucedido |
| cliquex.click/whatsapp-movie | 🔄 Ativo (Fase 4) | Endpoint externo descoberto no JS | Enumeração profunda no endpoint |

## Findings Confirmados

| ID | Severidade | Tipo | Descrição | Evidência |
|----|------------|------|-----------|-----------|
| F-001 | Informativo | Wildcard SSL | Certificado wildcard `*.teste-iptv.mov` emitido mas zero subdomínios resolvem publicamente | `recon/passive/PASSIVE.md` §3.2 |
| F-002 | Informativo | Cloudflare Full Proxy | Domínio totalmente protegido por Cloudflare — IP real de origem não exposto via DNS | `recon/passive/PASSIVE.md` §2, `recon/active/ACTIVE.md` §5 |
| F-003 | Informativo | OSINT: WhatsApp BR | Contato WhatsApp +55 21 97544-4978 exposto no site — jurisdição Brasil (LGPD/CDC) | `recon/passive/osint_findings.txt` |
| F-004 | Informativo | SPA Anchor Navigation | Aplicação usa navegação por anchors — páginas estáticas separadas | `recon/passive/PASSIVE.md` §4.2 |
| F-005 | Informativo | IP Real Oculto | Recon ativo falhou em descobrir IP de origem — Cloudflare sanitiza headers | `recon/active/ACTIVE.md` §5 |
| F-006 | Baixa | SSL Validade Curta | Certificados com 45 dias (Google Trust Services) — renovação automática | `recon/active/ACTIVE.md` §4.3 |
| F-007 | Baixa | Sem OCSP Stapling | Performance/privacidade TLS levemente impactada | `recon/active/ACTIVE.md` §4.3 |
| F-008 | Informativo | Tracking WhatsApp Terceiro | Redirect via `cliquex.click/whatsapp-movie` — possível vazamento referrer/UTM | `recon/active/ACTIVE.md` §8.1 |

## Acessos Obtidos

*Nenhum acesso obtido ainda.*

## Objetivos de Alto Valor Atingidos

*Nenhum objetivo atingido ainda.*

## Próximas Ações Imediatas
1. **Criar `recon/SUMMARY.md`** (Fase 4) consolidando attack surface + ranking de payoff
2. Delegar Fase 5 (Enumeração Profunda) ao especialista `enum` — foco em `cliquex.click` e tentativas de bypass WAF
3. Considerar CVE Research (baixa prioridade) para nginx nas portas Cloudflare SSL