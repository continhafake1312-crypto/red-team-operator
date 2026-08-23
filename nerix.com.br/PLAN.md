# PLAN — nerix.com.br

## Estado
- **Iniciado**: 2026-08-23T00:00:00Z
- **Status**: EM ANDAMENTO
- **Fase atual**: 3 — Recon ativo
- **Última atualização**: 2026-08-23T01:00:00Z

## Fases

| # | Fase | Especialista | Status | Notas |
|---|------|-------------|--------|-------|
| 1 | Escopo | — | ✅ CONCLUÍDO | SCOPE.md, estrutura criada |
| 2 | Recon passivo + OSINT | recon-passive | ✅ CONCLUÍDO | 10 subdomínios, 10 vivos, 1 IP real AWS, S3 bucket, OSINT completo |
| 3 | Recon ativo | recon-active | ✅ CONCLUÍDO | Port scan IPs reais (apenas 80/443 CloudFront), WAF/TLS, vhost/content discovery, S3 enum. ACTIVE.md consolidado |
| 4 | Consolidar attack surface | — | ✅ CONCLUÍDO | SUMMARY.md criado e atualizado com ranking de payoff |
| 5 | Enumeração profunda | enum | 🔄 EM ANDAMENTO | Source maps, JS analysis, docs scraping, API endpoint discovery, WebSocket |
| 6 | Ataque webapp | webapp | 🔲 PENDENTE | Aguarda enum |
| 7 | CVE research | cve | 🔲 PENDENTE | Aguarda fingerprint de versões |
| 8 | Exploit | exploit | 🔲 PENDENTE | Aguarda CVE/Cred |
| 9 | Pós-exploração | postex | 🔲 PENDENTE | Aguarda foothold |
| 10 | Relatório | report | 🔲 PENDENTE | Ao final |

## Backlog de vetores

### 🔴 Alta prioridade
| Vetor | Alvo | Motivo | Gatilho |
|-------|------|--------|---------|
| Port scan IPs reais | links.nerix.com.br (3.174.83.0/24) | Único host fora do Cloudflare | Recon ativo |
| Content discovery | admin.nerix.com.br | Painel admin | Recon ativo |
| S3 bucket enum | nerix-prod | Bucket existe (403) | Recon ativo |
| API testing | api.nerix.com.br | 83 endpoints REST documentados | Pós-recon ativo |
| Stripe key check | JS bundles | `sk_live_*` pattern | Pós-recon ativo |
| Email spoofing | DNS (DMARC p=none) | Sem proteção | Recon ativo/OSINT |

### 🟡 Média prioridade
| Vetor | Alvo | Motivo | Gatilho |
|-------|------|--------|---------|
| WebSocket analysis | nerix.com.br (socket.io) | Dados tempo-real | Pós-recon ativo |
| Auth bypass | admin/app/pay | Default creds, OAuth | Pós-recon ativo |
| Vhost fuzzing | IPs CF | Hosts virtuais ocultos | Recon ativo |
| PWA manifest | /manifest.json | Rotas adicionais | Recon ativo |
| Docs enum | docs.nerix.com.br sitemap | 83 páginas, endpoints ocultos | Pós-recon ativo |

### 🔵 Baixa prioridade
| Vetor | Alvo | Motivo | Gatilho |
|-------|------|--------|---------|
| CSP/CORS | api.nerix.com.br | Security headers | Recon ativo |
| Subdomain takeover | nerix.com/.net/.org/.io | Domínios similares | Recon ativo |

## Observações
- 2Captcha key configurada em ~/.config/opencode/.2captcha_key
- Tor rodando, exit IP: 91.208.75.153
- Proxychains4 ativo na porta 9052
- S3 bucket nerix-prod existe (us-east-1) — investigar
- CNPJ 57.917.756/0001-17 — BAIXADO desde 11/02/2026