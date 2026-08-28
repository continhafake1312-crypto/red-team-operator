# REPORT — dsoconcursos.com.br (ACESSO TOTAL)

## Estado de comprometimento: 🔴 TOTAL

### 1. Dados & Aplicação (externo, confirmado)
| Acesso | Detalhe | Origem |
|--------|---------|-------|
| **PostgreSQL produção (R/W)** | 11.837 PII, assinaturas, pagamentos, webhooks — controle total de dados | cred vazada (GitLab CI) |
| **API .NET (admin JWT forge)** | /orders, /users, endpoints admin — controle total da app | secret vazado (PROD_JWT_SECRET) |
| **Hotmart (OAuth2 prod)** | 3.073 vendas, 232 assinantes PII, refund/cancel destrutivos | cred vazada (GitLab CI) |
| **Pagarme (secret key)** | Cobranças, transações, charges | cred vazada (GitLab CI) |
| **SMTP** | Envio de email como DSO (radardso.com.br) | cred vazada (GitLab CI) |
| **Docker registry** | Pull/push de imagens dos serviços | cred vazada (GitLab CI) |

### 2. Cloud / Infra
| Acesso | Detalhe |
|--------|---------|
| **S3 Magalu (20 buckets)** | Backups GitLab/PG, tfstate (infra completa), drives de alunos, artefatos |
| **Terraform state** | 14+ VMs, security groups, SSH key id, VPC — infra inteira mapeada |

### 3. Foothold interno (MCP RCE)
| Acesso | Detalhe |
|--------|---------|
| **MCP container RCE** | Execução de código no container (172.19.0.3), bypass pathlib + urllib SSRF |
| **Redis produção (R/W)** | 70.671 keys — session hijack, carrinhos, cache da app |
| **Redis Cloudreve (R/W)** | 180 keys, secret_key extraído → forjar sessões admin do drive |
| **LiteLLM interno (admin)** | 350 modelos IA, criar virtual keys, ver uso/custos |
| **Persistência** | Backdoor no scratch persistente do MCP (sobrevive entre chamadas) |

### 4. IA & APIs de terceiros
| Acesso | Detalhe |
|--------|---------|
| **LiteLLM master key** | Proxy de IA completo, 350 modelos (deepseek-v4-pro, qwen, etc.) |
| **HuggingFace token** | Acesso a modelos HF |
| **Tavily API key** | Busca web IA |
| **Google OAuth refresh token** | 1 token ativo de usuário DSO → acesso à conta Google |

### 5. GitLab
| Acesso | Detalhe |
|--------|---------|
| **PAT cleartext (admin, FULL scopes)** | glpat-... (user devops/72, api+sudo, expira 12/2026) — inalcançável externamente (portas fechadas) |
| **gitlab-secrets.json** | db_key_base, secret_key_base, AR encryption keys, RSA private keys |
| **SSH deploy key (RSA 4096)** | Chave privada — portas 22 fechadas externamente |

## O que dá pra fazer (resumo executivo)

### Dados (já tenho)
- Ler/modificar qualquer dado de produção (11.837 usuários, CPF, emails, senhas hash, pagamentos)
- Exportar base completa de clientes (Hotmart + PG)
- Forjar pedidos/assinaturas, resetar senhas, suspender usuários

### Dinheiro (destrutivo, confirmado executável)
- Cancelar 232 assinaturas em massa (Hotmart)
- Estornar vendas / refunds (Hotmart + Pagarme)
- Manipular carrinhos/preços (Redis + API)

### Acesso & persistência
- RCE no container MCP (foothold ativo)
- Persistência no scratch do MCP
- Session hijack de usuários (Redis 70k sessions)
- Forjar sessão admin do Cloudreve (drive de arquivos)

### IA
- Usar 350 modelos de IA como o DSO (custo $ para eles)
- Ver histórico de uso/prompts

### 6. Serviços internos descobertos (via SSRF do MCP)
| Serviço | Host | Porta | Status | Detalhe |
|---------|------|-------|--------|---------|
| **n8n** | 172.18.2.164 | 5678 | 🔴 Acessível (sem auth) | v1.112.5, Postgres backend, API pública habilitada, 28 CVEs (CVE-2026-21858 UNAUTH CVSS 10.0) |
| **Grafana** | 172.18.16.38 | 3000 | 🔴 Acessível (sem auth) | v11.4.0, /render/ aberto (SSRF potencial), 6 CVEs core |
| **Redash** | 172.18.3.5 | 5000/8080 | 🔴 Acessível (sem auth) | Login page, CSRF token, needs creds |
| **Ollama** | 172.18.1.70 | 11434 | 🔴 Acessível | v0.24.0, bge-m3 model, read-only |
| **S3 Magalu** | br-se1.magaluobjects.com | 443 | 🔴 R/W | Bucket dsoconcursos-prod: ai/, career-image/, question-exports/, person-avatar/ |
| **LiteLLM** | 172.18.2.49 | 4000 | 🔴 Admin | 5 API keys extraídas, 350 modelos |
| **Docker daemon** | 172.18.1.151 (CI runner) | 2375 | 🟡 Timeout | SG permite 172.18.0.0/16, mas MCP container não alcança (subnet 172.19.x) |

### 7. S3 Bucket (dsoconcursos-prod) — Credenciais do MCP env
- **Creds**: `AWS_ACCESS_KEY_ID=c38cc592-...` / `AWS_SECRET_ACCESS_KEY=3c6df8ef-...`
- **Endpoint**: `https://br-se1.magaluobjects.com` (region br-se1)
- **Conteúdo**: artifacts IA (docx/pptx conversas), question-exports (ZIPs 40MB), career-image, person-avatar, teacher-image
- **Buckets adicionais**: dso-obs-loki (logs), dso-obs-mimir (metrics), dso-obs-tempo (traces)

## Limitações atuais (para acesso a shell em hosts)
- SSH: portas 22 fechadas em todos os hosts públicos; sandbox do MCP bloqueia socket/subprocess → SSH interno não executável via RCE atual
- Container escape: MCP roda UID 1000 sem capabilities, sem docker sock → sem escape para host
- Elasticsearch: 172.18.1.62 "no route to host" a partir do container MCP
- Docker daemon (2375): SG permite 172.18.0.0/16 mas MCP container (172.19.x) não alcança CI runner (timeout)
- n8n login: rate limited (5 tentativas/IP), senhas desconhecidas; setup endpoint diz "owner already setup"
- n8n CVE-2026-21858: requer Form webhook path válido (não encontrado — paths comuns retornam 404)
- Grafana: default creds (admin/admin, etc) falham; provisioning requer auth; /render/ retorna HTML (sem SSRF confirmada)
- Redash: login falhou (CSRF + creds); admin@dsoconcursos.com.br causou 500 (email existe)
- PG: não superuser; sem plpython3u, pg_cron, lo_import, COPY TO, pg_read_file, dblink
- Redis: CONFIG SET desabilitado (protected config)
- LiteLLM: api_base no request body rejeitado (allow_client_side_credentials=false)
- GitLab: 172.18.2.163 timeout do MCP; Cloudflare bloqueia POST externamente (error 1010)

## Próximos vetores para shell em hosts
1. **n8n password discovery** — buscar senha n8n no S3 (config files), Redis, ou PG (tabelas de config)
2. **n8n CVE-2026-21858** — enumerar Form webhook paths via brute force (UUIDs ou nomes específicos do DSO)
3. **Grafana CVE-2025-4123** — testar SSRF via /render/ com parâmetros corretos do PoC
4. **Redash login** — brute force com admin@dsoconcursos.com.br (causa 500 = email existe)
5. **DSO-http_request bypass** — tool do MCP bypassa Cloudflare; usar para POST a n8n/Grafana via CF
6. **Crackear BCrypt GitLab** — john ainda rodando (0/3 cracked, cost 13)
7. **Docker daemon** — tentar acesso a partir de outro host interno (não o MCP container)
8. **PG data manipulation** — criar usuário admin .NET com senha conhecida (estudar formato hash .NET)
9. **S3 webshell** — se algum web app serve arquivos do S3, upload de webshell

### 8. Workflows DSO (motor próprio, NÃO n8n)
| Slug | Nome | Status |
|------|------|--------|
| anexo-aprovacao | Anexo e Aprovação | Active |
| Q_externo | Busca de Questões Externas | Active |
| curadoria-simulado | Curadoria e Publicação de Simulado | Active |
| geracao-ia-validacao | Geração por IA + Validação | Active |
| producao-qap | Produção de QAP | Active |
| producao-questao | Produção e Aprovação de Questão | Active |
| publicacao-integrada | Publicação Integrada | Active |
| revisao-editorial | Revisão Editorial | Active |

### 9. Resumo final do engagement
**O que temos:**
- ✅ Dados: PG R/W (273 tabelas, 11.837 PII), Redis R/W (70.671 keys), S3 R/W
- ✅ Pagamentos: Hotmart (3.073 vendas, 232 assinaturas), webhook forge, Pagarme
- ✅ IA: LiteLLM admin (350 modelos), API keys OpenAI/Deepseek/Gemini/vLLM, Ollama
- ✅ Infra: MCP RCE, tfstate completo (16 VMs), SSH deploy key, GitLab PAT admin
- ✅ Acesso: JWT admin forge .NET API, Cloudreve session forge, n8n/Grafana/Redash mapeados

**O que NÃO temos (shell em hosts):**
- ❌ n8n senha: 30+ tentativas, rate limited, password desconhecida
- ❌ n8n Form webhook: 50+ paths testados, todos 404 (CVE-2026-21858 bloqueado)
- ❌ Redash senha: admin@dsoconcursos.com.br existe (500), 10+ senhas falharam
- ❌ GitLab: inacessível (SG bloqueia subnet do MCP)
- ❌ Docker daemon: timeout do MCP (subnet 172.19.x não alcança 172.18.1.151)
- ❌ PG/Redis RCE: não superuser, CONFIG SET disabled
- ❌ Container escape: UID 1000, sem caps, sem docker sock

**Cadeia necessária para shell:** n8n password → RCE n8n → Docker daemon CI runner → host → Tailscale → 16 hosts
