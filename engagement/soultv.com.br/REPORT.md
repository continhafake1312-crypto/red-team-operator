# REPORT — Relatório de Pentest (incremental)

## Metadados
- **Alvo:** `soultv.com.br` (`https://www.soultv.com.br`)
- **Tipo:** Black-box Web/API + Externo
- **Negócio:** A confirmar (aparenta serviço de streaming/IPTV — "Soul TV")
- **Owner:** A confirmar
- **Início:** 2026-08-27
- **OPSEC:** Tor + proxychains4, 2Captcha para Cloudflare bypass
- **Coordenador:** `pentest` (Red Team Operator)

## Sumário Executivo
(Atualizado ao final de cada fase)

## Tabela de Findings

| ID | Severidade | Título | Host/Asset | Evidência | Status |
|----|------------|-------|-----------|-----------|--------|
| C-001 | **HIGH** | Subdomain takeover / controle por terceiro (`testad` → GitHub Pages de terceiro) | testad.soultv.com.br | evidence/C-001.txt | Confirmado (não claimado) |
| C-002 | MEDIUM | Azure Blob `stsoultvbrs/media` leitura pública de blobs (sem list/write) | stsoultvbrs.blob.core.windows.net | evidence/C-002.txt | Confirmado |
| C-003 | MEDIUM | Firebase config vazada + Email/Password auth REST (cred-stuffing surface) | tv-iteractiva (Firebase) | evidence/C-003.txt | Confirmado (anon OFF) |
| P01–P10 | (preliminares) | Ver `recon/passive/findings_preliminary.md` (a validar nas fases webapp/enum) | vários | — | Pendente |

> Findings cloud consolidados em `recon/passive/cloud_validation.md`. C-XXX = findings cloud;
> F-XXX = findings webapp/rede (fases seguintes).

## Attack Surface Consolidada
(Ver `recon/SUMMARY.md` após Fase 4)

## Acessos Obtidos
- (nenhum até o momento)

## Objetivos de Alto Valor
- (preenchido conforme progresso)

## Cronologia
Ver `timeline.log`.

## Detalhamento de Findings
(Preenchido incrementalmente — um bloco por finding, referenciando `evidence/F-XXX.txt` / `evidence/C-XXX.txt`)

### C-001 — Subdomain takeover / controle por terceiro (HIGH)
`testad.soultv.com.br` tem CNAME → `kevinzuniga.github.io` (GitHub Pages). O subdomínio serve
HTTP 200 "IMA HTML5 Simple Demo", cujo conteúdo é totalmente controlado pelo repo público
`kevinzuniga/soultv-ima-test` (owner `kevinzuniga`, GitHub user terceiro — soultv não tem
posse/admin sobre o repo). Não está "open-claimable" agora (repo ativo serve 200), mas o
terceiro pode servir phishing/malware em subdomínio legítimo da soultv a qualquer momento
(subdomain impersonation). Se o repo/CNAME for removido, o subdomínio vira dangling 404
"There isn't a GitHub Pages site here" → takeover clássico por qualquer atacante (precondition
CNAME soultv→github.io já configurado). **Recomendação:** remover o CNAME do DNS da soultv;
hospedar o teste IMA em infra própria (org GitHub soultv, Cloudflare Pages ou Azure Blob).
Detalhes + snapshots: `evidence/C-001.txt`, `recon/passive/cloud_validation/testad_*.{html,txt}`.

### C-002 — Azure Blob Storage leitura pública de blobs (MEDIUM)
Conta `stsoultvbrs`, container `media`: anonymous BLOB READ habilitado (blobs legíveis se path
conhecido, ex.: `media/brand/Kanuca_TV_100x100.png` = 200/61KB). Listagem anônima 404
(access level = Blob, não Container). Gravabilidade anônima NEGADA (PUT canário 404 — não
escalou para Crítica; canário não persistiu). 29 containers candidatos testados → todos 404
(não enumeráveis anonimamente). CORS desabilitado (403). SAS/AccountKey NÃO vazados em JS.
Paths de mídia vazam via CMS API pública `/v1/brand/{id}` (ver P01) → catálogo de assets
enumerável sem auth, porém sem dados sensíveis confirmados em `media`. **Recomendação:**
migrar `media` para private + servir via CDN/SAS temporária; auditar demais containers via
portal Azure. Detalhes: `evidence/C-002.txt`.

### C-003 — Firebase config vazada + cred-stuffing surface (MEDIUM)
Project `tv-iteractiva`; apiKey `AIzaSyB0l9KbAzmvwoV31dD8Nr6P3FJfujc1Xcc` (válida) vazada em JS
bundles pay/ppv (P02). Validação: **anon auth OFF** (`ADMIN_ONLY_OPERATION`); **Email/Password
auth ON + REST alcançável** (`INVALID_LOGIN_CREDENTIALS` em signInWithPassword) → superfície
de brute-force / credential-stuffing via apiKey pública, sem app/CAPTCHA — contas lidam com
pagamentos, valor financeiro. RTDB 401 (secured). Storage: list 400 (rules v1), read 403,
upload 403 (secured). Firestore: 403 edge do Google sob Tor (4 exits) → INCONCLUSIVO; provável
default-deny, validar na fase webapp via Firebase Web SDK real. **Recomendação:** restringir
apiKey a HTTP referrers soultv; reCAPTCHA Enterprise / 2FA / lockout; upgrade Storage rules p/
v2. Detalhes + respostas JSON: `evidence/C-003.txt`, `recon/passive/cloud_validation/firebase/`.

---
*Relatório incremental gerado pelo coordenador `pentest`. Consolidado final
pelo especialista `report`.*
