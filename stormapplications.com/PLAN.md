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

*Ordem ativa do operador: "faça todos" (2026-08-23T05:05Z). Últimos ciclos: 4 especialistas concluídos.*

### 🏁 Concluídos / Exauridos
| # | Vetor | Especialista | Resultado |
|---|-------|-------------|-----------|
| 1 | CVE-2026-27590 (Caddy FastCGI RCE) | exploit | ❌ Não confirmado — sem endpoint de upload |
| 2 | CVE-2026-27587 (Caddy path bypass) | exploit | ⚠️ Parcial (case variations bypassam 403→404, backend não reconhece maiúsculo) |
| 3 | CVE-2026-27588 (Caddy host bypass) | exploit | ✅ **CONFIRMADO** — `Host: localhost` → default vhost Discloud |
| 4 | CVE-2019-19919 (Handlebars proto pollution) | exploit | ❌ Não confirmado |
| 5 | SSRF api-beta (40+ params) | webapp | ❌ Nenhum SSRF confirmado |
| 6 | Brute x-storm-admin-key (200+) | webapp | ❌ Nenhuma key válida |
| 7 | Wallet sk_live_* brute (200+) | webapp | ❌ Nenhuma key válida |
| 8 | Discord client_secret JS chunks (71 chunks) | enum | ❌ Server-side config — não está nos bundles |
| 9 | OSINT stormappsrecebimentos@gmail.com | osint | ✅ 3 emails, 3 pessoas (Kauan/Guilherme/Yuri) |
| 10 | HTTP/2 request smuggling | webapp | ❌ Não confirmado |
| 11 | CVE-2026-27586 (mTLS fail) | exploit | ⏸ Pausado — fora do escopo HTTP |

### 🔄 Ativos
| # | Vetor | Prioridade | Especialista | Nota |
|---|-------|-----------|-------------|------|
| 12 | **CVE-2026-27588 + CVE-2026-27587 combi** (Host bypass + path bypass) | 🔴 **CRÍTICA** | exploit | Host: localhost revela vhost Discloud. Combinar com variações path para acessar painel admin nesse vhost. IPs diretos api-beta. |
| 13 | **Auth endpoints descobertos** (30+ novos) | 🔴 **CRÍTICA** | webapp | `/auth/login`, `/auth/register`, `/auth/me` — NUNCA testados! OAuth real da plataforma. |
| 14 | **Marketplacee storefront API** IDOR | 🔴 **CRÍTICA** | webapp | `/public/storefront/{slug}/carts/`, `/orders/{id}` — IDOR em carrinhos/pedidos/produtos. PII+financeiro. |
| 15 | **storm_token auth** | 🔴 **ALTA** | webapp | Mecanismo de auth via localStorage + cookie. Obter token via `/auth/register` → acesso autenticado. |
| 16 | **Admin storefront endpoints** | 🟡 **ALTA** | webapp | `/apps/{id}/storefront/*` — requer auth mas talvez sem validação de app ownership |
| 17 | **Webhook SSRF via /apps/{id}/webhooks/outbound** | 🟡 **MÉDIA** | webapp | SSRF via outbound webhook testing |
| 18 | **Cred-stuffing emails+senhas prováveis** | 🟡 **MÉDIA** | webapp | contato@ + stormapplicationsltda@ + senhas padrão nos pains login |
| 19 | **Caddy default vhost exploration** (Host: localhost) | 🟡 **MÉDIA** | exploit | Página "Configuration in Progress" do Discloud — explorar mais paths nesse vhost |
| 20 | **Wallet API endpoints descobertos** | ⏸ Baixa | webapp | wallet.storm — endpoints documentados no JS

## Ranking de Payoff (Atualizado após recon) — `recon/SUMMARY.md`