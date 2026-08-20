# SUMMARY — Attack Surface Ranking — kuromangas.com

Consolidação das fases 2 (passiva) + 3 (ativa) + 5 (enum) + 6 (webapp + pivot). Re-priorização por
payoff (§16). Atualizado: 2026-08-20T18:00Z.

## §16 — Ranking de payoff (pós-F6)

### ALTO (priorizar fases 5-6)

## Findings F6 (webapp) — ranking atualizado

| ID | Sev | Vetor | Status |
|----|-----|-------|--------|
| F-001 | Crítica | Chave crypto API hardcoded (`VITE_API_ENCRYPTION_KEY`) | confirmado |
| F-002 | Crítica | Crypto response-only Rabbit quebrado | confirmado |
| F-012 | Crítica | Decriptor Rabbit validado vs respostas reais | confirmado |
| F-013 | **Alta** | SSRF `/api/proxy/image?url=` + mapeia infra interna (backend :5000, PG :5432, Redis :6379), atinge origin bypassando CF | confirmado |
| F-014 | Média | IDOR/PII `users/<id>` + `users/<id>/library` (histórico/biblioteca, perfis públicos) | confirmado |
| F-015 | Média | Rota DEV `/dev` (Kuro Dev Hub) exposta sem auth | confirmado |
| F-016 | Info | Pagamentos livepix.gg; mass-assignment mitigada; verify por polling | confirmado |
| F-017 | Info | RBAC admin/staff enforced (privesc C-2/C-4/C-8/C-9 mitigados) | confirmado |
| F-018 | Baixa | Bypass Turnstile (2Captcha + browser) → conta automatizada | confirmado |
| F-019 | Baixa | Endpoint público não-documentado `/api/ping` (server time epoch ms) | confirmado |
| F-020 | Info | Pivot hunting via SSRF esgotado — sem RCE/foothold (origin auth enforced, Node CRLF bloqueado) | confirmado |

### Objetivos de alto valor — resultado
1. **Privesc admin / RBAC bypass (C-2/C-8/C-9)**: NÃO alcançado. RBAC server-side sólido
   (403 consistente em admin/* e staff/*; allowlist em profile). → F-017.
2. **Financeiro (C-3/C-4)**: NÃO alcançado. Provedor livepix.gg; amount server-side;
   verify por polling; mass-assignment ignorada. → F-016, F-017.
3. **PII / Conteúdo (C-5)**: parcial. PII de perfis públicos exposta por enumeração de ID
   (recentHistory, library, stats). Conteúdo private (mangá id=42) protegido (sem leak de
   chapter_id). E-mail não vazado. → F-014.
4. **Foothold/RCE via pivot interno (P-1..P-6)**: **NÃO alcançado**. SSRF (F-013) não escala:
   origin enforce auth (401 em tudo); Redis CRLF bloqueado pelo parser URL do Node (Invalid URL);
   PG binário inviável; /dev hub sem stored XSS (Slate sanitiza); dev.kuromangas.com tunnel down.
   Defesa em profundidade confirmada (auth no origin + parser URL moderno). → F-020.

## §16 — Ranking de payoff (legado, F2-F3)
1. **F-001 — Chave de criptografia de API hardcoded no client** (`VITE_API_ENCRYPTION_KEY` em `/assets/index-CBRSqHNC.js`).
   Reproduzir `xk2()` (key + MD5(date+"kuromangas.com::v2"+"x9_4v2_b")[0:8]),
   decriptar respostas `_v_secure` (CryptoJS Rabbit). Permite inversão total da
   API e forjar payloads. → Desbloqueia todo o ataque à API.
2. **F-002 — Crypto response-only Rabbit (obscuridade quebrada)** — decorre de F-001.
3. **F-003 — Painel admin completo** (`/admin/*`, 32 rotas: users, grants, logs,
   bot-tokens, settings, gamification, mangas, scans). Validar RBAC da API,
   IDOR em `/api/admin/users/{id}`, default/misconfigured roles, JWT claims.
4. **F-004 — Rotas DEV expostas** (`/dev/*`, `/read/dev`, `/read/error-preview`,
   `/read/novel-preview`) — debug UI, dados de teste, possível bypass paywall.
5. **F-006 — IDOR/BOLA** em `/read/{manga}/{chapter}`, `/manga/{id}`,
   `/profile/{id}` (IDs numéricos sequenciais) — conteúdo = produto (payoff alto).
6. **F-008 — Stripe** (pagamentos) — mass-assignment checkout, promo abuse,
   webhook replay. Acesso financeiro = objetivo alto valor.

### MÉDIO
7. **F-005 — Open Redirect** `/login?redirect=` — validar `//evil.com`,
   `javascript:`, backslash; cookie-theft/SSRF callback.
8. **Bypass Turnstile** (site keys públicos `0x4AAAAAAB4bmY_nVKCLa6xx` /
   `0x4AAAAAACHqmOixyAt5OjJM`) com 2Captcha → desbloqueia brute/enum da API.
9. **Credential-stuffing** `daviscardi1@gmail.com` (dev identity do passivo) —
   verificar breaches (HIBP/leak-lookup) e tentar login.

### BAIXO / Info
10. **F-009 — Legacy TLS 1.0/1.1** habilitado no CF — info postura.
11. **F-010 — HSTS** não observado nos headers do origin.
12. **IP real não descoberto** — sem API keys Shodan/Censys; toda interação via CF.

## Bloqueadores ativos (a resolver na fase webapp)
- **Cloudflare WAF**: hard block Tor ASN; managed challenge (Turnstile) em rotas
  dinâmicas; `/api/*` exige token Turnstile por-request (cf_clearance não basta).
  → Solver Turnstile (2Captcha) + browser real (Playwright) ou replicação de
  headers (`x-crypto-version: v4.8`, Turnstile token).
- **IP-bound cf_clearance**: capturado em `recon/active/bypass_cf_cookies.json`,
  não reutilizável via Tor. Repassar via mesmo IP/UA do bypass (local).

## Próximas fases (recomendação ao coordenador)
- **Fase 5 (enum)**: minerar bundle completo (6.2 MB) por mais endpoints/keys;
  mapear todos `/api/*` (auth, mangas, chapters, users, admin, scans, shop);
  analisar `/sw.js` (Workbox) por rotas cacheadas; mapear schema de cripto.
- **Fase 6 (webapp)**: implementar decriptor Rabbit (F-001/002) → bypass Turnstile
  (2Captcha) → auth flow → validar F-003/004/005/006/008.
- **Opcional**: adquirir API key Shodan/Censys para localizar IP real (descobrir
  origin = bypass total do WAF e portscan direto).

## Resumo de fases
| Fase | Status | Entregável |
|---|---|---|
| 2 — Passiva | ✅ | `recon/passive/PASSIVE.md` |
| 3 — Ativa | ✅ | `recon/active/ACTIVE.md` |
| 4 — Consolidar | ✅ | este `recon/SUMMARY.md` |
| 5 — Enum | ✅ | `enum/ENUM.md` |
| 6 — Webapp | ✅ | `evidence/F-013..F-020.txt`, `webapp/`, `REPORT.md` |
| 7 — CVE+exploit | pendente | framework não revelado (backend opaco; sem versão) |
| 8 — Pós-ex | não se aplica | sem foothold/admin (pivot esgotado) |
| 9 — Relatório final | pendente | — |
