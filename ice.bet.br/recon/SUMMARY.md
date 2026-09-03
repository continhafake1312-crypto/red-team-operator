# Attack Surface Summary — ice.bet.br

**Data:** 2026-09-03  
**Fase atual:** 3 — Recon Ativo (iniciando)

---

## Ranking de Payoff (§16)

| # | Alvo | Vetor | Payoff Esperado | Prioridade |
|---|------|-------|-----------------|------------|
| 1 | **admin.ice.bet.br** | Basic Auth — creds default/fracas | 🔴 Acesso a painel admin | **CRÍTICO** |
| 2 | **S3 ice-game** (sa-east-1) | Objetos públicos — dados sensíveis? | 🔴 Vazamento de dados/creds | **CRÍTICO** |
| 3 | **Grafana/Loki EKS** (54.232.x.x) | Serviços de monitoração expostos | 🔴 Acesso a infra/k8s | **CRÍTICO** |
| 4 | **Popok EKS** (18.229.x.x) | Aplicação interna em Kubernetes | 🔴 RCE/foothold interno | **CRÍTICO** |
| 5 | **Kong Gateway** (216.238.112.42) | Admin API (8001/8444) | 🔴 Controle do gateway | **ALTO** |
| 6 | **api.ice.bet.br** | Tenant bypass/IDOR/injection | 🟠 Dados de usuários/apostas | **ALTO** |
| 7 | **sports.ice.bet.br** | API management — fuzz endpoints | 🟠 Dados esportivos/apostas | **ALTO** |
| 8 | **slots.ice.bet.br** | Tenant bypass + game logic | 🟠 Manipulação de jogos | **ALTO** |
| 9 | **DNS dead entries** (proxy-dev, unsubscribe, unsubscribed) | Subdomain takeover | 🟠 Controle de subdomínio | **MÉDIO** |
| 10 | **CORS wildcard** (bet-hint, betslip) | Exfiltração cross-origin | 🟠 Vazamento de dados | **MÉDIO** |
| 11 | **Next.js data routes** (/_next/data/*) | Endpoints internos expostos | 🟡 Rotas admin ocultas | **MÉDIO** |
| 12 | **develop.ice.bet.br** | Staging environment — bypass | 🟡 Creds/versões antigas | **MÉDIO** |
| 13 | **imgix.ice.bet.br** | Image processing SSRF? | 🟡 SSRF/leitura de arquivos | **MÉDIO** |
| 14 | **slots-euro.ice.bet.br** (76.223.121.6) | Serviço desconhecido | 🔵 Descoberta adicional | **BAIXO** |
| 15 | **track.ice.bet.br** | Kong proxy — fuzz paths | 🔵 Descoberta adicional | **BAIXO** |
| 16 | **Sem CAA/DNSSEC** | Emissão não autorizada de certs | 🔵 Potencial MITM | **BAIXO** |

---

## Próximos passos (Recon Ativo)

1. 🔴 **Portscan IPs AWS EKS** (54.232.x.x, 177.71.x.x, 18.229.x.x, 52.67.x.x)
2. 🔴 **Portscan Kong Gateway** (216.238.112.42)
3. 🔴 **Portscan slots-euro** (76.223.121.6, 166.117.85.175)
4. 🟠 **S3 bucket ice-game** — listar objetos (awscli --no-sign-request)
5. 🟠 **admin.ice.bet.br** — testar creds default (Basic Auth)
6. 🟠 **develop.ice.bet.br** — testar bypass auth
7. 🟠 **api.ice.bet.br** — fuzz endpoints com tenant header
8. 🟡 **Vhost fuzzing** em IPs AWS
9. 🟡 **TLS scan** em todos os hosts HTTPS
10. 🟡 **Next.js _buildManifest.js** — extrair rotas internas

---

## Anexos

- `recon/passive/PASSIVE.md` — Recon passivo completo (38 subdomínios, IPs, OSINT)
- `recon/passive/subdomains_all.txt` — Lista completa de subdomínios
- `recon/passive/subdomains_live.txt` — Subdomínios vivos