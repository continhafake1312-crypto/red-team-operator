# ENUM.md — Enumeração Profunda ArkodeX

**Alvo:** arkodex.com.br | **Data:** 2026-08-26 | **Fase:** Enumeração

---

## Sumário

| Categoria | Qtd Encontrada | Detalhes |
|-----------|----------------|----------|
| Endpoints API (públicos) | **6** | /api/site-config, /api/services, /api/docs, /api/products, /api/categories, /api/sources |
| Endpoints API (auth) | **43** | /api/me, /api/trials, /admin/api/*, etc. |
| Endpoints de template (dinâmicos) | **72** | Com placeholders de parâmetros (ID, slug, etc.) |
| Parâmetros POST | **22** | {content, prompt, productId, plan, token, etc.} |
| Chaves/tokens hardcoded | **0** | Nenhum hardcoded no bundle JS |
| Caminhos admin | **5+** | /admin, /admin/analytics, /admin/applications, /admin/config |
| Stack traces vazados | **0** | reqId exposto, mas sem stack |
| Subdomínios | **4** | arkodex.com.br, cloud.arkodex.com, arkanostore.com.br, arksteam.mginex.site |
| Produtos no sitemap | **65** | Discord bots, checkers, tools |
| Documentos públicos | **5** | Guias de ajuda (com contador de views) |

---

## Ranking de Prioridade para Webapp Attack

| # | Vetor | Payoff | Endpoints | Técnica |
|---|-------|--------|-----------|---------|
| 🔴 1 | **IDOR em Admin APIs** | Dados de clientes, pedidos, billing | `/admin/api/clients/:id`, `/admin/api/orders/:id/approve`, `/admin/api/orders/:id/provision`, `/admin/api/revenue`, `/admin/api/analytics/*`, `/admin/api/bumpy-tokens/:id` | Trocar `:id` após obter sessão admin |
| 🔴 2 | **Auth Bypass em /api/me** | Acesso a perfil, bots, trials | `/api/me`, `/api/me/bots/:id`, `/api/me/services`, `/api/me/trial` | Força bruta de JWT, token manipulation |
| 🔴 3 | **Support System Exploit** | Acesso a tickets, mensagens | `/api/support/conversations/:id`, `/api/support/conversations/:id/messages`, `/api/support/admin/conversations/*`, SSE `/api/sse/notifications` | IDOR em conversations, SSRF em image upload |
| 🔴 4 | **Product CRUD Abuse** | Modificar/ver produtos admin | `/admin/api/products/:id/commit-all`, `/admin/api/products/:id/ai-generate`, `/admin/api/products/:id/commit-status` | Acesso admin necessário |
| 🟡 5 | **RCE via JSON parsing 500** | Server-side injection | `/api/products` (POST with crafted JSON) | Erro 500 interno com reqId — testar SSTI, NoSQLi |
| 🟡 6 | **Source Download Abuse** | Código fonte de bots | `/api/products/:id/source-download?txid=:txid`, `/admin/api/applications/:id/source-download` | IDOR em source download |
| 🟡 7 | **Payment/Billing Bypass** | Acesso a pagamentos | `/admin/api/payment`, `/admin/api/payment/cert`, `/admin/api/payment/test`, `/api/checkout/:id/status` | Verificar lógica de pagamento |
| 🟡 8 | **Gallery/Upload Abuse** | Upload de arquivos maliciosos | `/admin/api/gallery/upload`, `/admin/api/gallery/scan`, `/admin/api/gallery/migrate` | Upload de Web Shell, SSRF via scan |
| 🟡 9 | **Trial Abuse** | Trials ilimitados | `/api/trials/start`, `/api/trials/:id/convert`, `/api/trials/check/:id` | Lógica de trials |
| 🟢 10 | **Info Disclosure via reqId** | Rastreamento interno | Todos endpoints com erro 500/404 | reqId pode ser usado para tracking |

---

## Detalhamento dos Endpoints por Risco

### 🔴 ALTA PRIORIDADE — IDOR / Auth Bypass

**Admin APIs com ID de recurso (IDOR candidates):**
```
/admin/api/clients/:id               → Ver dados do cliente
/admin/api/clients/:id/ban           → Banir cliente
/admin/api/clients/:id/unban         → Desbanir cliente
/admin/api/orders/:id/approve        → Aprovar pedido
/admin/api/orders/:id/provision      → Provisionar pedido
/admin/api/coupons/:id               → Ver/editar cupom
/admin/api/bumpy-tokens/:id          → Ver/editar token
/admin/api/products/:id              → Ver/editar produto
/admin/api/products/:id/commit-all   → Commitar produto
/admin/api/products/:id/commit-status → Status do commit
/admin/api/products/:id/ai-generate  → Gerar descrição via AI
/admin/api/applications/:id          → Ver aplicação
/admin/api/applications/:id/restart  → Reiniciar aplicação
/admin/api/applications/:id/extend   → Estender aplicação
/admin/api/applications/:id/activate → Ativar aplicação
/admin/api/hosting/apps/:id/action   → Ação em app hosting
/admin/api/hosting/apps/:id/commit   → Commit app hosting
/admin/api/pool/:id/recycle          → Reciclar pool
/admin/api/updates/:id/publish       → Publicar update
/admin/api/docs/:id                  → Ver/editar documento
/admin/api/gallery/:id               → Ver/editar mídia
/admin/api/gallery/:id/redownload    → Redownload de mídia
/admin/api/services/:id              → Ver/editar serviço
/admin/api/sources/:id               → Ver/editar source
```

**Admin APIs com payload POST:**
```
/admin/api/products/:id/ai-generate  → {prompt, generate}
/admin/api/email/test                → Testar email
/admin/api/gallery/import            → Importar galeria
/admin/api/gallery/scan              → Escanear (SSRF pot.)
/admin/api/gallery/migrate/:id       → Migrar mídia
/admin/api/hosting/apps/upload       → Upload de app
/admin/api/hosting/apps/:id/action   → Ação em hosting
/admin/api/pool/sync-hosting         → Sync hosting
/admin/api/pool/recycle-stale        → Reciclar stale
/admin/api/updates/:id/publish       → Publicar update
/admin/api/updates/:id/ai-generate   → Gerar update via AI
/admin/api/sources/upload            → Upload source
/admin/api/docs/reorder              → Reordenar docs
/admin/api/products/reorder          → Reordenar produtos
/admin/api/products/semi-automatic/bulk → Bulk semi-auto
```

### 🟡 MÉDIA PRIORIDADE

**APIs públicas com parâmetros:**
```
/api/products/:id                    → Detalhe do produto (público!)
/api/docs/:id                        → Documento público (contador de views)
/api/docs/search?q=                  → Busca em docs
/api/updates                         → Lista de updates (público!)
/api/updates/:id                     → Detalhe do update
/api/pages/:id                       → Página (requer auth?)
/api/site-config                     → Config do site (público)
/api/services                        → Info do serviço (público)
/api/categories                      → Categorias (público)
/api/sources                         → Sources (público, vazio)
```

**APIs de checkout/pagamento:**
```
/api/services/checkout/:id/status    → Status do checkout
/api/checkout/:id/status             → Status do checkout
```

**APIs de trial:**
```
/api/trials/start                    → Iniciar trial
/api/trials/:id                      → Ver trial
/api/trials/:id/convert              → Converter trial
/api/trials/check/:id                → Verificar trial
/api/me/trial                        → Meu trial
```

### 🟢 BAIXA PRIORIDADE

**APIs de suporte (requerem auth):**
```
/api/support/conversations                     → Listar conversas
/api/support/conversations/:id                 → Ver conversa
/api/support/conversations/:id/messages        → Ver mensagens
/api/support/conversations/:id/attachments     → Anexos
/api/support/conversations/:id/close           → Fechar conversa
/api/support/settings                          → Config suporte
/api/support/admin/knowledge                   → Knowledge base admin
/api/support/admin/knowledge/:id               → Ver artigo KB
/api/support/admin/learning                    → Learning admin
/api/support/admin/settings                    → Settings admin
/api/support/admin/conversations               → Conversas admin
/api/support/admin/conversations/:id           → Conversa admin
/api/support/admin/conversations/:id/messages  → Mensagens admin
/api/support/admin/conversations/:id/attachments → Anexos admin
```

**APIs de aplicações:**
```
/api/me/bots                          → Meus bots
/api/me/bots/:id                      → Detalhe do bot
/api/me/bots/:id/logs                 → Logs do bot
/api/me/bots/:id/restart              → Reiniciar bot
/api/me/services                      → Meus serviços
/api/sources/:id/buy                  → Comprar source
/api/sources/:id/delivery/:did        → Delivery
/api/sources/:id/download/:did        → Download
```

---

## Parâmetros Sensíveis Encontrados

| Parâmetro | Onde |
|-----------|------|
| `productId` | POST /api/products/:id/commit-all, POST /checkout |
| `plan` | POST checkout |
| `txid` | POST checkout, GET /api/products/:id/source-download |
| `token` | POST /api/me/bots/:id (connector) |
| `botId` | POST connector |
| `username` | POST connector |
| `guildId`, `guildName` | POST admin (Discord) |
| `prompt`, `generate` | POST AI generate endpoints |
| `content`, `internal` | POST support/knowledge |
| `categoryId`, `subcategoryId` | POST admin categories |
| `label`, `icon` | POST admin category/subcategory |
| `reason` | POST ban/unban |
| `days` | POST analytics |
| `sourceVersion` | POST source |
| `url` | POST gallery/migrate |
| `ids` | POST bulk operations |
| `orders` | POST bulk ordering |
| `userToken` | POST support (Discord user token?!) |

> **⚠️ Atenção:** `userToken` aparece como parâmetro de requisição. Se for token de usuário Discord, é gravíssimo.

---

## Observações para Webapp Attack

1. **Autenticação via JWT** — Confirmado pelo comportamento "Sessão expirada" vs "Não autenticado". Tentar JWT none attack, alg=none, algoritmo confusão RS256→HS256.

2. **SSRF Candidates** — `/admin/api/gallery/scan`, `/admin/api/gallery/import`, `/admin/api/gallery/migrate` (recebem URL como parâmetro).

3. **Upload Abuse** — `/admin/api/gallery/upload`, `/admin/api/hosting/apps/upload`, `/admin/api/sources/upload`.

4. **AI-generation endpoints** — `/admin/api/products/:id/ai-generate`, `/admin/api/updates/:id/ai-generate` — possível prompt injection.

5. **Source download** — `/api/products/:id/source-download?txid=` — se TXID for previsível, IDOR em source code.

6. **Rate limit** — 120 req/min/endpoint, per-window tracking. Evitar 429.

7. **Discord tokens vazados** — Produtos têm `emoji` field com IDs de emoji Discord (ex: `1477455809293062256`). Confirmar se são tokens de bot.

---

## Arquivos de Evidência

- `js_analysis.txt` — 72+ endpoints, 22 param structures, 0 keys
- `content_discovery.txt` — robots, sitemap, SPA routes, media
- `api_fuzzing.txt` — HTTP methods, auth behavior, param fuzz
- `error_analysis.txt` — error messages, disclosure, auth behavior
- `cloud_discovery.txt` — GCP, CDN, subdomain takeover