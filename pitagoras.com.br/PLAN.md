# PLAN — Pitágoras (pitagoras.com.br)

## Estado atual
- **Fase**: 1 — Escopo (iniciando)
- **Última atualização**: 2026-08-20T05:37:00Z

## Backlog de vetores
| # | Vetor | Status | Motivo pausa | Gatilho retorno |
|---|-------|--------|--------------|-----------------|
| — | — | — | — | — |

## Fases planejadas

### Fase 1 — Escopo ✓
- [x] SCOPE.md criado
- [x] Estrutura de diretórios criada
- [x] PLAN.md criado
- [x] REPORT.md criado
- [x] timeline.log criado

### Fase 2 — Recon passivo + OSINT ✓
- [x] Delegar ao especialista `recon-passive`
- [x] DNS, subdomínios, certificados (crt.sh)
- [x] Wayback machine, OSINT, breaches
- [x] Cloud buckets, takeover candidates
- [x] Consolidar em `recon/passive/PASSIVE.md`
- [x] Resultado: 58 subs, 34 resolvidos, 21 vivos, WordPress/AEM/CloudFront/O365

### Fase 3 — Recon ativo ✓
- [x] Delegar ao especialista `recon-active`
- [x] Portscan nos IPs reais (76.223.91.9, 13.58.247.178, 141.193.213.10/11, 200.209.69.0/24)
- [x] Fingerprint de versões, WAF, vhosts
- [x] Verificar takeover candidates ativamente
- [x] Consolidar em `recon/active/ACTIVE.md`
- [x] Resultado: awselb/2.0 redirect → anhanguera.com, WP Engine cPanel-like ports, Golang EC2 404, Cloudflare/Cloudfront/Akamai. TLS SANs +50 domínios Ânima.

### Fase 4 — Consolidar attack surface ✓
- [x] Criar `recon/SUMMARY.md` com ranking de payoff
- [x] Top priority: WordPress+Elementor (lps/blog), Adobe AEM (rematricula), Mail2Easy EC2

### Fase 5 — Enumeração profunda ✓
- [x] Delegar ao especialista `enum`
- [x] WPScan em lps/blog.pitagoras.com.br — WP 7.0.4 (lps), Elementor 4.1.3/3.35.7, WP Rocket 3.21.1, users
- [x] Adobe AEM endpoints — publish instance `publish-p136102-e1403896.adobeaemcloud.com` exposta
- [x] CloudFront/S3 — bucket `gestao-lp-sp-assets-1f0f2b2a1e` + API Gateway leak
- [x] Análise JS — endpoints AWS descobertos
- [x] Adobe Campaign — `/ee`, `/id`, `/live` endpoints com ID vazado
- [x] Content discovery com ffuf/gobuster
- [x] Resultado: AEM publish exposta (CRÍTICO), WP+Elementor (CRÍTICO), takeover dev.blog CONFIRMADO (ALTO)

### Fase 6 — Ataque webapp (⬅️ PRÓXIMA)
- [ ] Delegar ao especialista `webapp`
- [ ] AEM publish instance: path traversal, GraphQL, SSRF
- [ ] WordPress: CVE Elementor 4.1.3, XML-RPC brute-force
- [ ] API Gateway Policoders: fuzzing com params
- [ ] Adobe Campaign: `/nl/jsp/`, `/rest/head/`, SOAP

### Fase 7 — CVE research + exploit (⬅️ PRÓXIMA)
- [ ] Delegar ao especialista `cve`
- [ ] Elementor 4.1.3 — CVE research
- [ ] Elementor 3.35.7 + WP Rocket 3.21.1 — CVE research
- [ ] Adobe AEM — CVE research para versão as a Cloud Service
- [ ] Exploit para takeover dev.blog
- [ ] Exploit para Elementor CVEs confirmados

### Fase 5 — Enumeração profunda
- [ ] Delegar ao especialista `enum`

### Fase 6 — Ataque webapp
- [ ] Delegar ao especialista `webapp`

### Fase 7 — CVE + exploit
- [ ] Delegar aos especialistas `cve`/`exploit`

### Fase 8 — Pós-exploração (se foothold)
- [ ] Delegar ao especialista `postex`

### Fase 9 — Relatório final
- [ ] Delegar ao especialista `report`

## Notas
- 2Captcha key disponível para bypass Cloudflare.
- Tor + proxychains4 ativos e verificados.
- Adaptar conforme findings emergirem (§19 — caçada contínua).