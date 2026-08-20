# PLAN.md — engagement/kuromangas.com

Espelho do todowrite. Fases em ordem (§5). Re-priorizado conforme findings.

## Fases

- [x] F1 — Escopo (estrutura + SCOPE.md) — 2026-08-20T16:05Z
- [x] F2 — Recon passivo + OSINT (subagente `recon-passive`)
- [x] F3 — Recon ativo (subagente `recon-active`)
- [x] F4 — Consolidar `recon/SUMMARY.md` (ranking de payoff §16)
- [x] F5 — Enumeração profunda (subagente `enum`)
- [x] F6 — Ataque webapp (subagente `webapp) — 2026-08-20T17:46Z
- [ ] F7 — CVE + exploit (subagentes `cve`/`exploit`) — backend opaco (sem versão de framework); baixo payoff
- [ ] F8 — Pós-ex (subagente `postex`) — N/A (sem foothold/admin)
- [ ] F9 — Relatório final (subagente `report`)

## Ranking de payoff (§16) — atualizado conforme findings

| Vetor | Payoff | Status | Notas |
|------|--------|--------|-------|
| Bypass Cloudflare / IP real | ALTO | pendente | site provável CF |
| Subdomínios não-proxied | ALTO | pendente | |
| Painel admin exposto | ALTO | pendente | |
| Credenciais vazadas (OSINT) | MÉDIO | pendente | |
| Takeover de subdomínio | MÉDIO | pendente | |
| API não-autorizada (mangás/users) | MÉDIO | pendente | |
| Wayback JS/rotas sensíveis | MÉDIO | pendente | |

## Backlog de vetores (§19)

Vetores pausados / gatilho de retorno:

- **SSRF origin fuzzing (F-013 deep)** — fuzz de paths no origin `127.0.0.1:5000` via
  `/api/proxy/image?url=` buscando rotas só-origin não-autenticadas (`/api/internal/*`,
  `/api/dev/*`, debug/health sem auth). Gatilho: tempo livre; alta payoff se achar rota interna sem auth.
- **SSRF via redirect-chain** — host externo retorna 302 -> interno; testar se servidor
  segue redirects (bypass de allowlist de host se adicionada). Gatilho: antes de mitigação F-013.
- **SSRF gopher/redis exploit** — gopher:// rejeitado pelo Node fetch, mas testar
  `http://127.0.0.1:6379/` com payload HTTP-pipelining para Redis (sem auth). Gatilho: se
  Redis não tiver AUTH (provável em dev). Médio payoff.
- **XSS no /dev hub** — renderizar sub-cards (Editor Demo, Comments V2, Offline/Downloads)
  e testar XSS nos campos do playground (menções, spoilers, bio, descrição de mangá).
  Gatilho: tempo livre; Médio payoff (stored XSS no reader).
- **Upload abuse (C-11)** — requer role uploader (não conquistado). Re-testar se privesc
  uploader encontrado por outra via. Gatilho: obter uploader.
- **Open redirect (C-6) pós-login** — testar `/login?redirect=` APÓS login (o redirect é
  consumido só depois do auth). Gatilho: revalidar com sessão ativa + redirect param.
- **Rotas DEV `/dev/*` e `/read/*-preview`** — re-renderizar com cf_clearance válida por path
  (re-triggeraram CF challenge). Gatilho: bypass CF por path.
- **payments callback forgery** — inspecionar `/supporters?payment=success&txid=...` (client-side)
  e webhook do livepix (server-side); testar se concessão de supporter depende só do query param.
  Gatilho: capturar callback real.
- **anilist oauth state confusion (C-10)** — `anilist/oauth/start` state; testar CSRF/state.
  Gatilho: tempo livre; Baixo payoff.
- **2FA SMS** — componente `Sms` presente; se habilitado para admin, SMS-flooding/interception.
  Gatilho: se conta admin comprometida (não).
- **dev.kuromangas.com / cdn.kuromangas.com** — repetir probes com `--hostname dev.kuromangas.com`
  (chave xk2 difere); pode expor endpoints menos restritos. Gatilho: acessar dev subdomínio.

## F6 — vetores testados e resultado

| Vetor | Resultado | Finding |
|------|-----------|---------|
| C-1 SSRF proxy/image | confirmado | F-013 |
| C-2 privesc admin role | 403 (mitigado) | F-017 |
| C-3 payments mass-assign/replay | mitigado | F-016 |
| C-4 profile mass-assignment | 400 allowlist | F-017 |
| C-5 IDOR conteúdo/PII | parcial (perfis públicos) | F-014 |
| C-6 open redirect | não confirmado | — |
| C-7 dev routes | /dev exposto | F-015 |
| C-8 admin RBAC bypass | 403 (mitigado) | F-017 |
| C-9 staff privesc | 403 (mitigado) | F-017 |
| C-10 anilist/pay replay | não testado a fundo | backlog |
| C-11 upload abuse | bloqueado (sem uploader) | backlog |
