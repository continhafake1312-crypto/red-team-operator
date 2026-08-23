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

*Nenhum vetor pendente ainda.*

## Ranking de Payoff (Atualizado após recon) — `recon/SUMMARY.md`