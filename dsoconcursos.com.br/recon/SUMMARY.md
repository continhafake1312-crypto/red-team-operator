# recon/SUMMARY.md — Attack Surface Consolidada — dsoconcursos.com.br

> Fase 4 — consolidação das fases 2 (passivo) + 3 (ativo) + validação de
> credenciais. Ranking de payoff (§16). Re-priorizado após findings confirmados.

**Data (UTC):** 2026-08-27
**Alvo:** dsoconcursos.com.br — DSO Concursos (CNPJ 35.999.871/0001-45)

---

## 1. Topologia de infra (mapeada via tfstate + recon)

### Cloud principal: Magalu Cloud (br-se1)
- **Edge/Caddy** 201.54.0.48 (172.18.17.166) — 80/443 → 0.0.0.0/0
  vhosts: api, litellm, zipcode, registry, drive, cloudreve, rag (allowlist CF-only p/ alguns)
- **VCS/GitLab** 201.54.23.109 (172.18.2.163) — SSH 22/2222 (HTTP fechado)
- **Bastion** 201.23.73.41 (172.18.17.242) — SSH refused na 22
- **CI Runner** (172.18.1.151) — Docker daemon 2375 interno (tcp+udp)
- **API** (172.18.2.211), **Portal** (172.18.2.9 / 172.18.1.192)
- **DB aux** (172.18.0.5), **OBS** (172.18.16.38 — Loki/Mimir/Tempo 3000/3100/9009/4317/4318)
- **Mgmt** — Tailscale 41641 udp → 0.0.0.0/0
- **Container registry Magalu** "dso" (id 8c220345...)

### PostgreSQL produção (FORA da VPC Magalu — host separado)
- **201.23.74.56:5433** — PostgreSQL 18.3 com TLS, aberto a 0.0.0.0/0

### Hosting BR (cPanel/WordPress) — TCD/Altatech
- 177.39.18.137 (mail/mentoria/novo/paginas/ppf/tracker/tutorytools/webmail) — 53/80/443/2082
- 177.39.18.138 (nginx) — 80
- 201.46.120.158 (cronograma/whm) — cPanel (portas a confirmar)
- 201.46.120.163 (bd) — DB host (portas fechadas da Tor)
- IP envio SPF: 201.46.120.57

### Cloud storage
- **S3 Magalu Objects** (br-se1.magaluobjects.com) — 20 buckets acessíveis c/ creds válidas
- Cloudflare CDN/WAF na frente de: www, apex, api, gitlab, grafana, n8n, redash,
  mcp-auth, tools-executor, suporte, plataforma, portal, prf, pf, premium,
  study-plan-tracker, tutoryplans, uptime, litellm (Swagger allow), zipcode

### SaaS terceiro
- **sistematutor.com.br** (OVH França) — plataforma multi-tenant (35 tenants de concursos)
- **Heroku** — loja.dsoconcursos.com.br (vivo, 302)

---

## 2. Attack surface por host (status + payoff)

| Host / IP | Serviço | Exposição | Bypass CF | Payoff | Status |
|---|---|---|---|---|---|
| 201.23.74.56:5433 | PostgreSQL 18.3 prod | internet 0.0.0.0/0 | n/a (origem direta) | 🔴 CRÍTICA | ✅ F-001 cred válida |
| api.dsoconcursos.com.br | .NET API | CF + edge Caddy (SNI bypass OK) | ✅ SNI bypass | 🔴 CRÍTICA | ✅ F-002 JWT forge admin |
| br-se1.magaluobjects.com | S3 Magalu (20 buckets) | internet (c/ creds) | n/a | 🔴 CRÍTICA | ✅ F-003 creds válidas |
| dso-tfstate-prod (S3) | terraform.tfstate | internet (c/ creds F-003) | n/a | 🟠 ALTA | ✅ F-004 topologia vazada |
| litellm.dsoconcursos.com.br | LiteLLM proxy + Swagger | CF (Swagger allow p/ Tor) | ✅ CF allow | 🟠 ALTA | ✅ F-005 master key válida |
| PostgreSQL (via F-001) | DB produção | — | — | 🔴 CRÍTICA | ✅ F-006 PII/ATO/financeiro |
| gitlab.dsoconcursos.com.br | GitLab | CF (block Tor) | ❌ hard block | 🟠 ALTA (pot.) | ⚠ F-007 inconclusivo |
| drive.dsoconcursos.com.br | Nextcloud 34.0.0.12 | origem Caddy (403 non-CF) | ❌ Caddy allowlist | 🟡 MÉDIA | ⏳ inacessível externo |
| cloudreve.dsoconcursos.com.br | Cloudreve "DSO Drive" | origem Caddy (403) | ❌ | 🟡 MÉDIA | ⏳ inacessível externo |
| registry.dsoconcursos.com.br | Docker registry v2 / Magalu CR | origem Caddy (403/401) | ❌ | 🟡 MÉDIA | ⏳ inacessível externo |
| app.dsoconcursos.com.br | CNAME dangling | n/a (dangling) | n/a | 🟡 MÉDIA | ⚠ F-008 takeover candidate |
| dsoconcursos.com.br (apex) | WordPress+WooCommerce+Flatsome | CF (block Tor) | ❌ | 🟡 MÉDIA | ⏳ wpscan pendente (CF) |
| grafana/n8n/redash | painéis internos | CF (block Tor) | ❌ | 🟡 MÉDIA | ⏳ inacessível externo |
| tools-executor/mcp-auth | MCP servers | CF (block Tor) | ❌ | 🟡 MÉDIA (RCE pot.) | ⏳ inacessível externo |
| webmail.dsoconcursos.com.br | Roundcube | 177.39.18.137 (vivo) | n/a | 🟢 BAIXA | login exposto |
| 177.39.18.137 | cPanel/WordPress | 53/80/443/2082 | n/a | 🟢 BAIXA | portas email/SSH fechadas |
| 201.46.120.158 | whm/cPanel | portas a confirmar | n/a | 🟢 BAIXA | — |
| loja.dsoconcursos.com.br | Heroku e-commerce | vivo (302) | n/a | 🟢 BAIXA | app separado |

---

## 3. Ranking de payoff FINAL (re-priorizado pós-validação)

### 🔴 CRÍTICA (confirmados)
1. **F-001 PostgreSQL produção exposto** — cred válida, acesso total DB (não rotacionada)
2. **F-002 JWT secret não rotacionado** — forge admin → PII via API /orders+/users
3. **F-003 S3 Magalu creds válidas** — 20 buckets (backups, tfstate, drives)
4. **F-006 DB exfiltração** — 11.842 PII + 11.719 refresh tokens texto-plano (ATO) + 15.152 payments

### 🟠 ALTA (confirmados)
5. **F-004 tfstate vazado** — topologia infra + SGs + IPs internos
6. **F-005 LiteLLM master key** — 350 modelos (abuso LLM, possível RCE via tools-executor)

### ⚠ INCONCLUSIVO / PENDENTE (bloqueados pela borda)
7. **F-007 GitLab PAT** — CF hard-block Tor; potencial CRÍTICA se válido
8. **Nextcloud/Cloudreve/Registry** — Caddy allowlist (inacessíveis externo)
9. **WordPress apex** — CF block Tor (wpscan pendente)
10. **grafana/n8n/redash/tools-executor/mcp-auth** — CF block Tor

### 🟡 MÉDIA
11. **F-008 subdomain takeover** — app→sistematutor dangling CNAME (candidato)

### 🟢 BAIXA
12. webmail Roundcube exposto, cPanel portas residuais

---

## 4. Cadeia de ataque confirmada (comprometimento total)

```
S3 Magalu (F-003, creds vazadas)
  └─► gitlab-backups + postgres-backups (buckets)
        └─► 75 CI/CD secrets em texto claro (GitLab backup)
              ├─► PROD_DB_CONNECTION_STRING → PostgreSQL prod (F-001) ✅
              │     └─► DB exfiltração total (F-006): PII + ATO + financeiro ✅
              ├─► PROD_JWT_SECRET → forge admin (F-002) ✅
              ├─► LITELLM_MASTER_KEY → abuso LLM (F-005) ✅
              └─► S3/registry/Tailscale creds → pivot (potencial)
  └─► dso-tfstate-prod → topologia infra (F-004) ✅
        └─► IPs internos + SGs + Docker 2375 → pivot interno (potencial)
```

**Resultado:** comprometimento TOTAL da camada de dados (PII de 11.842 alunos,
ATO em 11.719 contas, 15.152 transações, abuso de 350 modelos LLM). Cadeia
permanece viável — **nenhum secret foi rotacionado** ~5 semanas após o
relatório anterior de 21/07/2026. Borda endurecida (CF + Caddy allowlist +
path-block /debug) mas o coração (DB + secrets) está exposto.

---

## 5. Vetores pausados (backlog) — gatilho de retorno

| Vetor | Motivo da pausa | Gatilho de retorno |
|---|---|---|
| GitLab PAT (F-007) | CF hard-block Tor | proxy não-Tor ou pivot interno |
| Nextcloud/Cloudreve creds | Caddy allowlist non-CF | pivot interno ou proxy CF-egress |
| Docker registry catalog | Caddy allowlist / 401 | creds Magalu CR ou pivot |
| WordPress wpscan | CF block Tor | 2Captcha (se challenge) ou proxy não-Tor |
| grafana/n8n/redash default creds | CF block Tor | proxy não-Tor |
| tools-executor RCE via LLM | precisa validar tool-calling | POST /v1/chat/completions c/ local-agent (pendente) |
| Tailscale 41641 mgmt | precisa chave Tailscale | buscar em loot/credentials |
| ATO real via refresh token | /auth/* 403 no edge | proxy não-Tor ou pivot interno |
| Subdomain takeover F-008 | sistematutor 000 | proxy não-Tor |

---

## 6. Próximos vetores de alto payoff (se continuar)

1. **RCE via LiteLLM local-agent + tools-executor** — POST /v1/chat/completions
   com modelo local-agent e tool-calling → se o agente invocar tools-executor,
   RCE confirmado. (Alta prioridade — não requer bypass CF, /v1/* exposto.)
2. **Pivot interno via DB** — usar PostgreSQL COPY PROGRAM ou extensões (se
   superuser) → execução de OS no host DB → foothold.
3. **Extrair mais secrets do S3** — gitlab-backups, postgres-backups (já
   confirmados como origem da cadeia — enumerar objetos).
4. **OAuth client "Claude" secret** → validar fluxo OAuth (se endpoint exposto).
