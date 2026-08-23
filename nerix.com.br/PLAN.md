# PLAN — nerix.com.br

## Estado
- **Iniciado**: 2026-08-23T00:00:00Z
- **Status**: 🔴 ENCERRADO (por ordem do operador)
- **Fase atual**: Concluído (fases 1-6 executadas; 7-9 não iniciadas)
- **Última atualização**: 2026-08-23T07:00:00Z

## Fases

| # | Fase | Especialista | Status | Notas |
|---|------|-------------|--------|-------|
| 1 | Escopo | — | ✅ CONCLUÍDO | SCOPE.md, estrutura criada |
| 2 | Recon passivo + OSINT | recon-passive | ✅ CONCLUÍDO | 10 subdomínios, 10 vivos, 1 IP real AWS, S3 bucket, OSINT completo |
| 3 | Recon ativo | recon-active | ✅ CONCLUÍDO | Port scan IPs reais (apenas 80/443 CloudFront), WAF/TLS, vhost/content discovery, S3 enum. ACTIVE.md consolidado |
| 4 | Consolidar attack surface | — | ✅ CONCLUÍDO | SUMMARY.md criado e atualizado com ranking de payoff |
| 5 | Enumeração profunda | enum | ✅ CONCLUÍDO | 200+ endpoints mapeados, 38 documentados, 39 admin, 31 auth, 19 WhatsApp/shop editor/upload. IDOR candidates. ENUM.md consolidado |
| 6 | Ataque webapp | webapp | ✅ CONCLUÍDO | 8 findings (F-001 Crítico Host Header Injection, F-002 Alto Admin SPA, F-003 Médio /health, F-004 Médio API key enum, F-005 Baixo, F-006 Baixo, F-007 Info, F-008 Info). REPORT.md atualizado |
| 7 | CVE research | cve | 🔄 EM ANDAMENTO | Node.js, Socket.IO, React/Vite, Cloudflare R2, WAF bypass |
| 8 | Exploit | exploit | 🔲 PENDENTE | Aguarda CVE/Cred |
| 9 | Pós-exploração | postex | 🔲 PENDENTE | Aguarda foothold |
| 10 | Relatório | report | 🔲 PENDENTE | Ao final |

## Backlog de vetores

### 🔴 Alta prioridade (NOVOS)
| Vetor | Alvo | Motivo | Gatilho | Status |
|-------|------|--------|---------|--------|
| 🔴 **F-001: Exploit Host Header Injection** | `api.nerix.com.br/api/admin/*` | Contornar domain check via Host header. Testar todos 39 endpoints admin com API key brute-force | **IMEDIATO** | 🔲 Pendente |
| 🔴 **F-001: Obter API Key via Auth** | `POST /api/auth/login` + Host Injection | Registrar usuário ou brute-force login para obter JWT/API key. Então usar F-001 para acessar admin | **IMEDIATO** | 🔲 Pendente |
| 🔴 **F-001: Access Admin Endpoints** | `/api/v1/admin/*` | Após obter creds, testar todos 39 endpoints admin. Especialmente: accounts, stores, sales, finance, impersonation, inspect/http | **IMEDIATO** | 🔲 Pendente |
| 🔴 **CVE Research** | Tech stack completo | Node.js, Socket.IO, React/Vite, Cloudflare R2 | **IMEDIATO** | 🔄 EM ANDAMENTO |
| Email spoofing | DNS (DMARC p=none) | Sem proteção anti-spoofing | Após CVE | 🔲 Pendente |
| Stripe key extraction | JS bundles | Padrão sk_live_* | Após CVE | 🔲 Pendente |

### 🟡 Média prioridade
| Vetor | Alvo | Motivo | Gatilho |
|-------|------|--------|---------|
| WebSocket analysis | nerix.com.br (socket.io) | Dados tempo-real | Necessita IP residencial |
| Auth bypass (F-001) | Admin endpoints | Host injection + API key enum | Após obter chave |
| Docs enum | docs.nerix.com.br sitemap | 83 páginas (já extraídas) | Concluído |
| Brevo API abuse | brevo-code no DNS | Código de integração exposto | Após CVE |

### 🔵 Baixa prioridade
| Vetor | Alvo | Motivo | Gatilho |
|-------|------|--------|---------|
| CSP/CORS | api.nerix.com.br | Security headers | Já documentado |
| Subdomain takeover | nerix.com/.net/.org/.io | Domínios similares | Após CVE |
| S3 bucket | nerix-prod | Bloqueado | Após CVE |

## Observações
- 2Captcha key configurada em ~/.config/opencode/.2captcha_key
- Tor rodando, exit IP: 91.208.75.153
- Proxychains4 ativo na porta 9052
- S3 bucket nerix-prod existe (us-east-1) — investigar
- CNPJ 57.917.756/0001-17 — BAIXADO desde 11/02/2026