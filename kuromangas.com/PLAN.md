# PLAN.md — engagement/kuromangas.com

Espelho do todowrite. Fases em ordem (§5). Re-priorizado conforme findings.

## Fases

- [x] F1 — Escopo (estrutura + SCOPE.md) — 2026-08-20T16:05Z
- [x] F2 — Recon passivo + OSINT (subagente `recon-passive`)
- [x] F3 — Recon ativo (subagente `recon-active`)
- [x] F4 — Consolidar `recon/SUMMARY.md` (ranking de payoff §16)
- [x] F5 — Enumeração profunda (subagente `enum`)
- [x] F6 — Ataque webapp (subagente `webapp) — 2026-08-20T17:46Z
- [x] F6b — Pivot hunting via SSRF (webapp) — 2026-08-20T18:00Z
- [ ] F7 — CVE + exploit (subagentes `cve`/`exploit`) — backend opaco (sem versão de framework); baixo payoff
- [ ] F8 — Pós-ex (subagente `postex`) — N/A (sem foothold/admin; pivot esgotado F-020)
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

Vetores pausados / gatilho de retorno (atualizado pós-pivot hunting F-020):

- **SSRF origin fuzzing (P-1)** — ESGOTADO (F-020): 75 paths fuzzados no origin; só
  health/ping públicos; origin enforce auth. Sem rota interna sem auth. Gatilho de
  retorno: se novo path de framework surgir (wordlist maior) — baixo payoff.
- **SSRF Redis gopher/RESP (P-2)** — BLOQUEADO (F-020): parser URL do Node rejeita
  CRLF (Invalid URL); double-encoded = HTTP literal (socket hang up); gopher/dict
  rejeitados. Sem smuggling. Redis presente mas não-falável. Gatilho: se SSRF mudar
  de runtime (não-Node) ou permitir gopher.
- **SSRF PostgreSQL (P-3)** — INVIÁVEL (F-020): binário, ECONNRESET.
- **XSS no /dev hub (P-4)** — NEGATIVO (F-020): Slate sanitiza; "Comentar" local-only;
  sem stored XSS. innerHTML direto é trivial (não-vuln). Gatilho: testar fluxo real de
  comentários no reader (mutativo — cria comentário em mangá alheio; exigiria cleanup).
- **dev.kuromangas.com (P-5)** — MORTO (F-020): Cloudflare Tunnel Error 1033 (origin
  offline). Gatilho: se tunnel voltar.
- **Redirect-chain SSRF (P-6)** — N/A: sem allowlist no proxy/image (SSRF arbitrária);
  servidor local do operador inalcançável pelo fetch server-side do alvo. Gatilho: se
  allowlist de host for adicionada + tiver attacker server público.
- **DNS-rebinding (P-6)** — teórico: requer domínio rebind. Gatilho: se allowlist de
  host por hostname for adicionada (valida hostname mas resolve p/ 127.0.0.1).
- **Upload abuse (C-11)** — requer role uploader (não conquistado). Re-testar se
  privesc uploader encontrado por outra via. Gatilho: obter uploader.
- **Open redirect (C-6) pós-login** — testar `/login?redirect=` APÓS login (o redirect
  é consumido só depois do auth). Gatilho: revalidar com sessão ativa + redirect param.
- **Fluxo real de comentários no reader (stored XSS)** — POST `comments/chapter/<id>` ou
  `comments/manga/<id>` e inspecionar a renderização. Mutativo (cria comentário).
  Gatilho: autorização para criar comentário de teste + cleanup; baixo risco residual
  (Slate sanitiza no /dev, provavelmente igual no reader).
- **payments callback forgery** — inspecionar `/supporters?payment=success&txid=...`
  (client-side) e webhook do livepix (server-side); testar se concessão de supporter
  depende só do query param. Gatilho: capturar callback real.
- **anilist oauth state confusion (C-10)** — `anilist/oauth/start` state; testar
  CSRF/state. Gatilho: tempo livre; Baixo payoff.
- **2FA SMS** — componente `Sms` presente; se habilitado para admin, SMS-flooding.
  Gatilho: se conta admin comprometida (não).
- **Fuzzing ampliado de rotas só-backend via SSRF** — wordlist maior de paths de
  framework/admin no origin. Baixo payoff (50+ já testados, só health/ping públicos).

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

## F6b — Pivot hunting via SSRF (P-1..P-6) — testado e resultado

| Vetor | Resultado | Finding |
|------|-----------|---------|
| P-1 origin path fuzzing (75 paths) | NEGATIVO (origin enforce auth; só health/ping públicos) | F-019, F-020 |
| P-2 Redis via CRLF smuggling | BLOQUEADO (parser URL Node rejeita CRLF) | F-020 |
| P-3 PostgreSQL via SSRF | INVIÁVEL (binário, ECONNRESET) | F-020 |
| P-4 /dev hub XSS | NEGATIVO (Slate sanitiza; local-only; sem stored XSS) | F-020 |
| P-5 dev.kuromangas.com | MORTO (CF Tunnel Error 1033) | F-020 |
| P-6 misc (headers/crypto-version/datakey/redirect/dns) | NEGATIVO/N/A | F-020 |
