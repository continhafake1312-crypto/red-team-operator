# SUMMARY — Attack Surface Ranking — kuromangas.com

Consolidação das fases 2 (passiva) + 3 (ativa). Re-priorização por payoff (§16).
Atualizado: 2026-08-20T16:52Z.

## §16 — Ranking de payoff

### ALTO (priorizar fases 5-6)
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
| 5 — Enum | pendente | — |
| 6 — Webapp | pendente | — |
