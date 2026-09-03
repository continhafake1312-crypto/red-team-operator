# Attack Surface Summary — ice.bet.br

**Data:** 2026-09-03  
**Fase atual:** 3 — Recon Ativo ✅ CONCLUÍDO

---

## Ranking de Payoff (§16) — Atualizado

| # | Alvo | Vetor | Payoff Esperado | Status | Prioridade |
|---|------|-------|-----------------|--------|------------|
| 1 | **Sports API** (sports.ice.bet.br) | Endpoints /sports, /events, /leagues com dados reais sem auth | 🔴 Dados de apostas/eventos | **DESCOBERTO** | **CRÍTICO** |
| 2 | **Develop (Vercel)** (develop.ice.bet.br) | Protection Bypass via cookie/token — bypass documentado na página de erro | 🔴 Acesso a staging | **IDENTIFICADO** | **CRÍTICO** |
| 3 | **admin.ice.bet.br** | Basic Auth — creds default testadas (falharam) | 🔴 Acesso a painel admin | **TESTADO** (sem sucesso) | **CRÍTICO** |
| 4 | **Kong Gateway** (216.238.112.42) | SSH/Proxy exposto, admin API filtrada | 🔴 Acesso interno | **PARCIAL** (SSH exposto, admin API filtrada) | **ALTO** |
| 5 | **API Tenant** (api.ice.bet.br) | Formato de Tenant header desconhecido — precisa fuzz | 🔴 Bypass de tenant | **IDENTIFICADO** | **ALTO** |
| 6 | **S3 ice-game** (sa-east-1) | Objetos públicos — pendente enumeração | 🔴 Vazamento de dados | **PENDENTE** | **ALTO** |
| 7 | **Grafana/Loki EKS** (54.232.x.x) | Security groups bloqueiam tudo | 🟠 Sem acesso direto | **BLOQUEADO** | **MÉDIO** |
| 8 | **Popok EKS** (18.229.x.x) | Security groups bloqueiam | 🟠 Sem acesso direto | **BLOQUEADO** | **MÉDIO** |
| 9 | **Next.js data routes** (/_next/data/*) | Rotas do Wayback — verificar se ativas | 🟡 Rotas admin/API internas | **IDENTIFICADO** | **MÉDIO** |
| 10 | **Slots-euro** (76.223.121.6) | AWS Global Accelerator — só 443 | 🔵 Apenas ELB | **Mapeado** | **BAIXO** |
| 11 | **Track (Kong)** (216.238.112.42) | /disabled.html — rota única | 🔵 Kong proxy limitado | **Mapeado** | **BAIXO** |
| 12 | **Dead subdomains** (proxy-dev, etc.) | NXDOMAIN — sem CNAME visível | 🔵 Monitorar takeover | **IDENTIFICADO** | **BAIXO** |
| 13 | **docs.ice.bet.br** | Cloudflare Access SSO | 🔵 Requer credenciais válidas | **IDENTIFICADO** | **BAIXO** |

---

## Resumo de Hosts

### Hosts com Acesso Direto (sem Cloudflare/CDN)
- **Kong Gateway** — 216.238.112.42 — SSH + Kong proxy (4 portas)
- **Status Page** — 142.132.149.97 — UptimeRobot (Caddy, PHP)
- **AWS EKS** — 9 IPs — TODOS bloqueados por security groups
- **Slots-euro** — 76.223.121.6, 166.117.85.175 — AWS Global Accelerator
- **CDN Blog** — 3.174.83.x — CloudFront origins

### Hosts Cloudflare (requerem bypass)
- **API** — api.ice.bet.br (400 — Tenant required)
- **Sports API** — sports.ice.bet.br (200 — dados expostos) ✅
- **Admin** — admin.ice.bet.br (401 — Basic Auth)
- **Develop** — develop.ice.bet.br (401 — Vercel Protection)
- **Blog** — blog.ice.bet.br (200 — Payload CMS)
- **Docs** — docs.ice.bet.br (302 — Cloudflare Access)

---

## Artefatos da Fase 3 (recon/active/)

- `ACTIVE.md` — Consolidação completa
- `nmap_eks.txt` — Portscan AWS EKS
- `nmap_kong.txt` / `nmap_kong_full.txt` — Portscan Kong
- `nmap_slots_euro.txt` — Portscan slots-euro
- `nmap_cdnblog.txt` — Portscan CDN blog
- `httpx_probe.txt` — HTTP probe
- `whatweb_results.txt` — whatweb fingerprint
- `vhosts_aws.txt` — Vhost fuzzing
- `waf.txt` — WAF detection
- `tls.txt` — TLS scan
- `auth_tests.txt` — Auth tests
- `buildmanifest.txt` — Next.js manifest
- `headers_detail.txt` — Headers detalhados
- `takeover_check.txt` — Subdomain takeover
- `sports_api.txt` — Sports API endpoints

---

## Próximos Passos (Fase 4 — Enum + Fase 5 — Webapp)

1. 🔴 **Sports API** — Extrair dados de `/sports`, `/events`, `/leagues` (enum)
2. 🔴 **Develop** — Bypass Vercel Protection (webapp)
3. 🟠 **API Tenant bypass** — Fuzz Tenant header format (enum)
4. 🟠 **S3 ice-game** — Listar objetos (cloud)
5. 🟠 **Admin** — Wordlist de creds mais extensa (webapp)
6. 🟠 **Next.js data routes** — Testar rotas do Wayback (enum)
7. 🟡 **Blog (Payload CMS)** — Procurar /admin, /payload (enum)
8. 🟡 **Kong path fuzzing** — Rotas backend (enum)
9. 🟡 **face-recognition** — Upload/KYC abuse (webapp)
