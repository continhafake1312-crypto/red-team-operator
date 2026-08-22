# Plano de Engagement — teste-iptv.mov

**Última atualização:** 2026-08-22T18:18:00Z
**Fase atual:** 2 - Recon Passivo (concluída) → 3 - Recon Ativo (próxima)

## Fases do Engagement

| Fase | Status | Especialista | Descrição |
|------|--------|--------------|-----------|
| 1. Escopo | ✅ Concluída | — | Criação de SCOPE.md, estrutura de pastas |
| 2. Recon Passivo + OSINT | ✅ Concluída | `recon-passive` | DNS, subdomínios, certs, wayback, tech stack, OSINT — **1 subdomínio vivo, Cloudflare full proxy, IP real oculto, zero buckets/takeover** |
| 3. Recon Ativo | 🔄 Próxima | `recon-active` | Portscan full, fingerprint serviços, vhosts, WAF detection, TLS, IP real (bypass CDN) |
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
| Bypass Cloudflare / Origin IP Discovery | 🔄 Ativo (Fase 3) | Cloudflare proxy total — IP real oculto | Descoberta de IP real via subdomínios não-proxied, SSL certs históricos, zone transfer, VHost fuzzing |
| Subdomain brute-force massivo | 🔄 Ativo (Fase 3) | Apenas domínio apex resolvido passivamente | Wordlists maiores, DNS bruteforce ativo, permutation |
| VHost Fuzzing | ⏳ Pendente | Aguardando IPs edge | IPs Cloudflare edge conhecidos |
| Content Discovery (ffuf/feroxbuster) | ⏳ Pendente | Aguardando Fase 3 | Hosts vivos confirmados |

## Findings Confirmados (Fase 2)

| ID | Severidade | Tipo | Descrição | Evidência |
|----|------------|------|-----------|-----------|
| F-001 | Informativo | Wildcard SSL | Certificado wildcard `*.teste-iptv.mov` emitido mas zero subdomínios resolvem publicamente | `recon/passive/PASSIVE.md` §3.2 |
| F-002 | Informativo | Cloudflare Full Proxy | Domínio totalmente protegido por Cloudflare — IP real de origem não exposto via DNS | `recon/passive/PASSIVE.md` §2 |
| F-003 | Informativo | OSINT: WhatsApp BR | Contato WhatsApp +55 21 97544-4978 exposto no site — jurisdição Brasil (LGPD/CDC) | `recon/passive/osint_findings.txt` |
| F-004 | Informativo | SPA Anchor Navigation | Aplicação usa navegação por anchors (#catalogo, #dispositivos, #faq) — páginas estáticas separadas | `recon/passive/PASSIVE.md` §4.2 |

## Acessos Obtidos

*Nenhum acesso obtido ainda.*

## Objetivos de Alto Valor Atingidos

*Nenhum objetivo atingido ainda.*

## Próximas Ações Imediatas
1. Delegar Fase 3 (Recon Ativo) ao especialista `recon-active`
2. Foco principal: bypass Cloudflare para descobrir IP real de origem
3. Portscan + service enum nos 2 IPs Cloudflare edge
4. VHost fuzzing e content discovery