# PLAN.md — stormapplications.com

## Plano de Engagement

### Fase 1: Escopo ✅
- [x] Criar diretório `stormapplications.com/`
- [x] Criar `SCOPE.md`, `PLAN.md`, `REPORT.md`, `timeline.log`
- [x] Verificar OPSEC (Tor, proxychains)
- [x] Verificar ferramentas disponíveis

### Fase 2: Recon Passivo + OSINT ⏳
- [ ] Delegar ao subagente `recon-passive`
  - DNS/subdomínios: subfinder, amass, assetfinder, crt.sh, dnsx
  - OSINT: theHarvester, GitHub, Google dorks, WHOIS, breaches
  - Cloud: buckets S3/Azure/GCP, takeover candidates
  - Wayback: endpoints, JS, parâmetros
  - Tech stack: httpx, whatweb
  - Entregável: `recon/passive/PASSIVE.md`

### Fase 3: Recon Ativo ⏳
- [ ] Delegar ao subagente `recon-active`
  - Portscan (rustscan + nmap) nos IPs de origem real
  - Web fingerprint (httpx, whatweb, wafw00f)
  - Vhost fuzzing
  - TLS enumeration
  - Entregável: `recon/active/ACTIVE.md`

### Fase 4: Consolidar Attack Surface ⏳
- [ ] Criar `recon/SUMMARY.md` com ranking de payoff

### Fase 5: Enumeração Profunda ⏳
- [ ] Delegar ao subagente `enum`
  - Content discovery, JS analysis, param mining
  - API endpoints (Swagger/GraphQL)
  - CMS enum
  - Entregável: `enum/ENUM.md`

### Fase 6: Ataque Webapp ⏳
- [ ] Delegar ao subagente `webapp`
  - OWASP Top 10 por host prioritário
  - Auth bypass, default creds, IDOR, SQLi, SSRF, XSS, etc.
  - Evidências em `evidence/F-XXX.txt`

### Fase 7: CVE Research + Exploit ⏳
- [ ] Delegar ao subagente `cve`
  - Mapear CVEs por versão
  - Clonar PoCs
- [ ] Delegar ao subagente `exploit`
  - Validar PoCs e creds
  - Obter foothold se possível

### Fase 8: Pós-exploração ⏳ (se foothold)
- [ ] Delegar ao subagente `postex`

### Fase 9: Relatório ⏳
- [ ] Delegar ao subagente `report`
- [ ] `REPORT.md` final + `timeline.log` completo
- [ ] Commit + push final

---

## Backlog de Vetores (Caçada Contínua §19)

*Ordem ativa do operador: "faça todos" (2026-08-23T05:05Z). Última pausa 05:35Z.*

| # | Vetor | Status | Especialista | Nota |
|---|-------|--------|--------------|------|
| 1 | CVE-2026-27590 (Caddy FastCGI RCE, 9.8) | 🔄 em execução | exploit | PoC em `exploit/pocs/CVE-2026-27590.md` |
| 2 | CVE-2026-27587 (Caddy path bypass, 9.1) | 🔄 em execução | exploit | Lançado 05:05Z, resultados não registrados — completar |
| 3 | CVE-2026-27588 (Caddy host bypass, 9.1) | 🔄 em execução | exploit | Via IPs de origem direto (bypass CF) |
| 4 | CVE-2019-19919 (Handlebars proto pollution, 9.8) | 🔄 em execução | exploit | 1ª tentativa NOT_FOUND; retestar payloads alternativos |
| 5 | SSRF api-beta (parâmetros URL/webhook) | 🔄 em execução | webapp | Lançado 05:05Z, resultados não registrados — completar |
| 6 | Brute force `x-storm-admin-key` (wordlist dedicada) | 🔄 em execução | webapp | Rate limited, wordlist curta-alvo |
| 7 | Wallet API brute force (`sk_live_*`) | 🔄 em execução | webapp | Formato confirmado em documentacao-wallet |
| 8 | Discord `client_secret` em JS chunks (www + marketplacee) | 🔄 em execução | enum | 15+ chunks não examinados |
| 9 | OSINT `stormappsrecebimentos@gmail.com` + pessoas | 🔄 em execução | osint | Breaches → cred-stuffing candidates |
| 10 | HTTP/2 request smuggling (WAF bypass) | ⏸ pausado | webapp | Exige payload H2 específico; retorno se 1-7 renderizarem |
| 11 | CVE-2026-27586 (Caddy mTLS fail, 9.1) | ⏸ pausado | exploit | Baixa probabilidade via HTTP externo; retorno se Caddy confirmar |
| 12 | Cloudflare WAF double-encoding (params ignorados) | ⏸ pausado | webapp | Bypass parcial existente; retorno se vetor de payload achar |

## Ranking de Payoff (Atualizado após recon) — `recon/SUMMARY.md`