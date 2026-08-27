# REPORT — Pentest cursosprepare.com

> Relatório incremental. Atualizado a cada finding/fase.

## Metadados
| Campo | Valor |
|---|---|
| Alvo | cursosprepare.com (https://www.cursosprepare.com/) |
| Negócio | Plataforma de cursos preparatórios (Wix Online Programs + Stores) |
| Stack | Wix managed (Pepyaka) + Google Cloud CDN (www) + Wix edge apex (185.230.63.171) |
| Owner | Luis Guilherme Leite Martins / Cursos Prepare (siteOwnerId f6283dba-6561-4bbc-873f-b2dcecda1f5d) |
| OPSEC | Tor + proxychains4, bypass App Armor via `--resolve www→185.230.63.171`, UA rotativo, 2Captcha standby |
| Início | 2026-08-27T03:25Z |
| Janela | Em andamento |

## Sumário executivo
Site Wix managed. A barreira de Google Cloud App Armor (403 em www via Tor) é contornada roteando o Host `www.cursosprepare.com` pelo edge Wix apex IP `185.230.63.171` (`--resolve`). O ponto de falha central do engagement é o **vazamento de tokens Wix (`/_api/v2/dynamicmodel`, `/_api/v1/access-tokens` → 200 sem auth)** — em particular os `instance` tokens dos TPA apps, que habilitam acesso a APIs internas sem auth de usuário. Isso produz dois achados críticos confirmados: (1) leak de PII de até 213 membros (F-001) e (2) leak de catálogo completo + métricas de negócio + PII do owner (F-004). O conteúdo pago das aulas (vídeos/PDFs) está corretamente protegido server-side (F-003 refutado como paywall bypass). Upload de arquivos via mediaAuthToken não foi explorável (F-002: token leak confirmado, upload bloqueado em rede/Wix sandbox).

## Findings
| ID | Severidade | Título | Host | Status |
|---|---|---|---|---|
| F-001 | **CRÍTICA** | Vazamento de PII de membros via Members API com instance token vazado (até 213 membros; nomes, slugs, fotos Google/Facebook, datas) | www.cursosprepare.com | ✅ Confirmado (webapp) |
| F-002 | ALTA | Tokens Wix vazados sem auth (mediaAuthToken JWT, svSession, 17+ app instance tokens) | www.cursosprepare.com | ✅ Confirmado (upload abuse refutado) |
| F-003 | BAIXA | challenge-pages (30 cursos) acessíveis sem auth — landing pages públicas (paywall de conteúdo NÃO bypassado) | www.cursosprepare.com | ⬇️ Downgraded (paywall intacto) |
| F-004 | **ALTA** | Catálogo completo de cursos + métricas de alunos (129 inscritos) + PII do owner vazados via challenge-service-web API | www.cursosprepare.com | ✅ Confirmado (novo) |
| F-005 | BAIXA | Info disclosure: Sentry DSNs Wix + schema GraphQL storefront + Apple Pay merchant domain assoc | www.cursosprepare.com | ✅ Confirmado (novo) |

## Attack surface consolidada
(see recon/SUMMARY.md)

## Acessos obtidos
- **Anônimo (sem credencial legítima), via instance token vazado:**
  - 100 membros da Members API (nomes, slugs, fotos Google/Facebook, datas) — metadata.total=213.
  - Catálogo de 30 cursos pagos com descrições, preços, nº de etapas, métricas de participantes (129 inscritos / 6 concluídos), e owner PII.
- **Não obtido**:
  - Email/telefone de membros (não expostos pela Members API a visitantes).
  - Conteúdo pago das aulas (vídeos/PDFs/steps) — protegido server-side, requer enrollment (`actionId`).
  - Upload de arquivos ao storage Wix — bloqueado em camada de rede (GAE firewall) e sandbox de visitantes.
  - Credenciais/conta admin — não há endpoint de login exposto explorável; svSession não autentica como membro.

## Cronologia
- 2026-08-27T03:25Z — Engagement iniciado; OPSEC verificado (Tor / proxychains / 2Captcha).
- 2026-08-27T03:26Z — Recon: Wix stack, site ID, MX Google Workspace, www bloqueia Tor (Google Cloud 403), bypass apex IP identificado.
- 2026-08-27T04:35Z — Fase 2 (recon-passive + OSINT) concluída: 30 challenge-page UUIDs, OSINT empresa/dono/equipe/email.
- 2026-08-27T05:00Z — Fase 3 (recon-active): portscan, WAF=Google Cloud App Armor, TLS forte, bypass App Armor RESOLVIDO via edge Wix apex IP.
- 2026-08-27T15:38Z — Fase 5 (enum) concluída: F-001/F-002/F-003 documentados, JS analysis, GraphQL schema.
- 2026-08-27T16:25Z — Fase 6 (webapp) iniciada: tokens re-obtidos; F-001 reproduzido via instance token do app Members; IDOR member individual testado (mesmo nível PII, sem email/phone).
- 2026-08-27T16:28Z — mediaAuthToken upload testado (F-002 aprofundado): files.wix.com 403 GAE firewall; upload abuse NÃO explorável.
- 2026-08-27T16:35Z — F-004 (NOVO): challenge-service-web API vazou catálogo 30 cursos + métricas (129 inscritos) + owner PII sem auth.
- 2026-08-27T16:40Z — F-003 refutado como paywall bypass: conteúdo pago protegido server-side (steps requer actionId de enrollment; participant-page gated). Downgraded para BAIXA.
- 2026-08-27T16:45Z — F-005 (NOVO): Sentry DSNs + GraphQL schema + Apple Pay merchant domain assoc (info disclosure).
- 2026-08-27T16:50Z — GraphQL storefront: endpoint não acessível anonimamente; sensitive queries exigem buyer session. Documentado em F-005.

## Detalhamento dos findings

### F-001 (CRÍTICA) — Vazamento de PII de membros via Members API
- `GET /_api/members/v1/members` → 403 sem auth; **200 com header `instance: <Wix Members app instance token>`** (vazado de `/_api/v2/dynamicmodel`).
- 100 membros por página (metadata.total=213); paginação via `offset` ignorada server-side.
- Campos: id, contactId, nickname (nome real), slug, photo.url (Google `lh3.googleusercontent.com` / Facebook `fbsbx.com`), createdDate, updatedDate, privacyStatus, activityStatus.
- IDOR em `/_api/members/v1/members/<UUID>` → mesmos campos (não expõe email/telefone).
- Ver `evidence/F-001.txt` + `webapp/members_all_fresh.json`, `webapp/m_test_inst.json`.

### F-002 (ALTA) — Tokens Wix vazados
- `/_api/v2/dynamicmodel` e `/_api/v1/access-tokens` → 200 (86KB) sem auth.
- Vaza: metaSiteId, visitorId, svSession, mediaAuthToken (JWT HS256 aud `file.upload` exp 24h), ctToken, hs, siteOwnerId, e 17+ app `instance` tokens (Members, Online Programs, Stores, Bookings, etc.).
- mediaAuthToken upload: `files.wix.com/v1/upload/*` → 403 GAE firewall via Tor; upload abuse não explorável. Visitor uploads sandboxed por design Wix.
- Os `instance` tokens habilitam F-001 (Members) e F-004 (Online Programs). Ver `evidence/F-002.txt` + `webapp/tokens_fresh.json`.

### F-003 (BAIXA) — challenge-pages acessíveis (landing pages públicas)
- 30 `challenge-page/<UUID>` retornam 200 (1.1-1.2MB) sem auth — comportamento pretendido (accessType=PUBLIC).
- HTML expõe apenas landing page de marketing (título, duração, etapas, ementa, preço). **Conteúdo das aulas NÃO exposto** (sem videoUrl/mediaUrl/mp4/pdf no HTML/viewerModel).
- `/participant-page/<UUID>` → "Você não tem acesso" (gated server-side).
- `POST /challenges/{id}/steps` → 400 "actionId is not a valid GUID" (requer enrollment).
- Paywall intacto. Ver `evidence/F-003.txt`.

### F-004 (ALTA) — Catálogo + métricas de alunos + owner PII via challenge-service-web
- `GET /_api/challenge-service-web/api/v1/challenges` (header `instance: <Online Programs app token>`) → 200, 30 cursos.
- Por curso: descrição completa, preço (R$ 40-280), nº etapas, `participantsSummary` (inscritos, em-andamento, concluídos, convites), e `owners` (siteOwnerId + "Cursos Prepare").
- Agregado: **129 inscritos, 109 em andamento, 6 concluídos** (taxa conclusão ~4,6%). Business intelligence vazada.
- `participants/{id}` → 403 PERMISSION_DENIED; steps requer actionId (conteúdo protegido).
- Ver `evidence/F-004.txt` + `webapp/challenges_catalog_full.json`, `webapp/catalog_summary.txt`.

### F-005 (BAIXA) — Info disclosure de config
- 4 Sentry DSNs Wix (Wixpress) em JS bundles públicos.
- Schema GraphQL Wix Stores storefront (325KB) — superfície de API (cart, checkout, order, orderHistory); endpoint GraphQL não acessível anonimamente; queries sensíveis exigem buyer session.
- `/.well-known/apple-developer-merchantid-domain-association` (200) — merchant Apple Pay confirmado.
- Ver `evidence/F-005.txt`.

## Evidências
- `evidence/F-001.txt` (CRÍTICA) — members leak
- `evidence/F-002.txt` (ALTA) — tokens leak
- `evidence/F-003.txt` (BAIXA, downgraded) — challenge-pages
- `evidence/F-004.txt` (ALTA, novo) — catalog + metrics + owner
- `evidence/F-005.txt` (BAIXA, novo) — config info disclosure
- Artefatos de ataque: `webapp/` (tokens_fresh.json, members_all_fresh.json, challenges_catalog_full.json, catalog_summary.txt, member_idor_*.json, tokens, etc.)

## Próximos passos sugeridos
- **CVE research**: nenhuma versão de software próprio exposta (Wix managed); CVEs aplicariam a falhas conhecidas da plataforma Wix (low yield).
- **Exploit validation**: F-001/F-004 já são exploração confirmada (não-destrutiva). Não há foothold de sistema (sem infra própria).
- **Postex**: N/A (sem RCE/foothold no host; todo ataque é contra a plataforma Wix managed).
- Vetores não exauridos por tempo/budget: GraphQL storefront via sessão de comprador autenticada (exigiria conta legítima); manipulação de checkout/coupon (destrutivo — fora do escopo não-destrutivo); `/cursosead` (catálogo público confirmado).
