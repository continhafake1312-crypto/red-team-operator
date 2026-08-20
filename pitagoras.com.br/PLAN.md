# PLAN — Pitágoras (pitagoras.com.br)

## Estado atual
- **Fase**: 7 — CVE research + exploit
- **Última atualização**: 2026-08-20T08:00:00Z

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

### Fase 6 — Ataque webapp ✓
- [x] Delegar ao especialista `webapp`
- [x] AEM publish instance: `.infinity.json` content disclosure CRÍTICO, GraphQL ativo
- [x] WordPress: Cloudflare WAF bloqueia tudo (403), bypass falhou
- [x] API Gateway Policoders: 404 para todos métodos
- [x] Adobe Campaign: `/ee`, `/id`, `/live` ativos
- [x] Author instance descoberta: author-p136102-e1403896.adobeaemcloud.com
- [x] 6 novos findings: F-007 a F-012

### Fase 7 — CVE research + exploit (⬅️ EM ANDAMENTO)
- [x] Cloudflare bypass CONFIRMADO (conexão direta, proxychains bloqueado)
- [x] Login pages lps/blog acessíveis
- [x] User enumeration: 3 (lps) + 10 (blog)
- [x] Elementor 4.1.3 (lps) + 3.35.7 (blog) — versões confirmadas
- [x] Elementor Pro 4.1.1 (lps) + 4.1.3 (blog) — versões confirmadas
- [x] REST API: 253 rotas (lps), snippet "Integration" exposto
- [x] dev.blog takeover: CNAME dangling confirmado
- [x] Golang EC2: scan 60+ paths, todos 404
- [ ] F-013: WordPress Cloudflare Bypass — criado
- [ ] F-014: dev.blog ELB Takeover — criado
- [ ] F-015: Elementor API Exposure — criado
- [ ] Credential brute force — não obtido (rate limit)
- [ ] 2Captcha para bypass Cloudflare — não testado
- [ ] Elementor CVE exploitation — pesquisar CVEs pós-4.1.3

### Fase 8 — Pós-exploração (se foothold)
- [ ] Pendente: aguardando credenciais

### Fase 9 — Relatório final
- [ ] Pendente

## Notas
- 2Captcha key disponível para bypass Cloudflare — não utilizado ainda
- Tor + proxychains4 bloqueados pelo Cloudflare (todas requests 403)
- Conexão direta bypassa Cloudflare com sucesso
- WP Engine WAF bloqueia XML-RPC, admin-ajax, Elementor AJAX, reset de senha
- Login rate limiting: ~11 tentativas antes de bloqueio 429/502
- Credential stuffing requer IP rotation ou 2Captcha