# Relatório de Pentest — sharpify.com.br

**Status**: EM ANDAMENTO
**Início**: 2026-08-20T05:00:00Z
**Alvo**: https://sharpify.com.br/

## Sumário Executivo

Engagement concluído — todas as fases executadas. 15 findings documentados (2 Críticos, 4 Altos, 5 Médios, 4 Informativos). Cloudflare WAF protegeu o alvo contra CVE-2025-29927 e acesso direto ao MinIO. Nenhum CVE confirmado aplicável. Acesso não foi obtido (auth com RBAC, sem credenciais vazadas). A documentação privada exposta (F-001) foi o finding mais crítico, revelando 57 endpoints privados, schemas TypeScript e modelo de autenticação completo.

## Tabela de Findings

| ID | Título | Severidade | Host | Status | Data |
|----|--------|-----------|------|--------|------|
| F-001 | Documentação da API Privada Exposta | 🔴 Crítica | docs.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-002 | MinIO/S3 Acessível via CDN | 🔴 Alta | cdn.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-003 | API Express Pública | 🟡 Média | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-004 | Subdomínios Não Resolvem | 🔵 Info | *.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-005 | CORS Permissivo na API | 🟡 Média | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-006 | API Roblox Users Exposta | 🟡 Média | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-007 | 57 Endpoints API Mapeados (Documentação Exposta) | 🔴 Alta | docs.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-008 | Auth verify-code retorna 500 ISE com código válido | 🔴 Alta | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-009 | Checkout place-order retorna 500 ISE | 🔴 Alta | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-010 | Analytics session/create-session retorna 500 ISE | 🟡 Média | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-011 | WebSocket endpoints indisponíveis (404) | 🟡 Média | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-012 | Endpoints de feedback públicos sem auth | 🔵 Info | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-013 | Rate limiting no envio de código de verificação | 🔵 Info | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-014 | Credenciais de API são env vars | 🔵 Info | docs.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-018 | CVE Research — Nenhum CVE Confirmado Aplicável | 🔵 Info | - | ❌ Concluído | 2026-08-20 |

## Detalhamento dos Findings

### F-001 — Documentação da API Privada Exposta [CRÍTICO]

**Alvo**: `https://docs.sharpify.com.br/docs/api-reference-privado/`
**Severidade**: Crítica
**Timestamp**: 2026-08-20T05:30:00Z

**Descrição**: A documentação completa da API privada da Sharpify está publicamente acessível sem qualquer autenticação. A documentação revela:

- **18 endpoints privados documentados** incluindo Catálogo (12), Checkout (4), Financeiro (2), Webhook (3)
- **Headers de autenticação**: `x-sharpify-client-id` e `x-sharpify-client-secret` (nomes dos campos, formato exposto)
- **Schema de permissões RBAC**: níveis de acesso (ex: `CATALOG_PRODUCT_LIST`, `CATALOG_PRODUCT_WRITE`)
- **Endpoints de gateway de pagamento**: criação de transações, reembolso, consulta de saldo
- **Endpoints de saque**: retirada de fundos
- **WebSocket de loja**: tempo real de pedidos
- **CRUD de catálogo**: produtos, categorias, inventário
- **Rotas server-to-server**: comunicação interna entre microsserviços
- **Export IA**: `/docs/ai` expõe 267k chars de documentação markdown com schemas TypeScript completos, tipos, e auth schema

**Impacto**: Qualquer atacante consegue mapear TODA a superfície da API, entender o modelo de autenticação, endpoints sensíveis (financeiros), e planejar ataques direcionados. Isso elimina o trabalho de enumeração cega. O export IA permite download completo de toda a especificação.

**Recomendação**: Imediatamente restringir o acesso à documentação com autenticação (basic auth, SSO, ou IP whitelist). Remover `/docs/api-reference-privado/` do roteamento público ou adicionar middleware de autenticação.

**Próximo passo**: Extrair todos os endpoints documentados e testar contra api.sharpify.com.br para validar se aceitam requests sem autenticação ou com headers genéricos.

---

### F-002 — MinIO/S3 Acessível via CDN [ALTO]

**Alvo**: `https://cdn.sharpify.com.br/`
**Severidade**: Alta
**Timestamp**: 2026-08-20T05:30:00Z

**Descrição**: O subdomínio `cdn.sharpify.com.br` redireciona para a porta **9001** (console web do MinIO). MinIO é um storage S3-compatible open-source. A presença do console web sugere que é possível:

- Acessar o dashboard do MinIO sem autenticação (se não configurado)
- Realizar operações CRUD nos buckets S3
- Possivelmente escalar para outros serviços internos

**Impacto**: Acesso não autorizado ao storage de arquivos (uploads, assets, backups) pode levar a vazamento de dados sensíveis dos clientes, upload de arquivos maliciosos, e potencial pivoting para infraestrutura interna.

**Recomendação**: Restringir acesso ao console MinIO com autenticação forte. Usar Cloudflare Access ou VPN. Desabilitar console público se não necessário.

**Próximo passo**: Testar portas 9000 (API S3) e 9001 (console) do MinIO para verificar autenticação.

---

### F-003 — API Express Pública [MÉDIO]

**Alvo**: `https://api.sharpify.com.br/`
**Severidade**: Média
**Timestamp**: 2026-08-20T05:30:00Z

**Descrição**: API Express/Node.js exposta publicamente. Endpoints operacionais (respostas HTTP com conteúdo dinâmico).

**Impacto**: API pública sem documentação de segurança visível. Pode conter endpoints vulneráveis a IDOR, SQLi, ou autenticação fraca.

**Próximo passo**: Testar endpoints da API documentada no F-001.

---

### F-004 — Subdomínios Não Resolvem [INFO]

**Alvo**: `*.sharpify.com.br`
**Severidade**: Info
**Timestamp**: 2026-08-20T05:30:00Z

**Descrição**: Vários subdomínios (admin, app, dev, stage, blog, portal) não resolvem em DNS, mas podem existir como CNAMEs não propagados ou serviços em IPs alternativos. Possível candidato a subdomain takeover.

**Próximo passo**: Verificar CNAMEs dos subdomínios que não resolvem para possíveis dangling DNS (takeover).

---

### F-005 — CORS Permissivo na API [MÉDIO]

**Alvo**: `https://api.sharpify.com.br/`
**Severidade**: Média
**Timestamp**: 2026-08-20T05:35:00Z

**Descrição**: A API Express em api.sharpify.com.br possui configuração CORS permissiva, permitindo requisições de qualquer origem e expondo headers customizados sensíveis.

**Headers expostos via Access-Control-Expose-Headers**: `games-admin-token`, `2fa-temporary-token`

**Interpretação**: A presença de headers `games-admin-token` e `2fa-temporary-token` indica que o sistema utiliza tokens de administração para um módulo "games" e tokens temporários para autenticação 2FA. Isso sugere funcionalidades de admin expostas na API.

**Impacto**: Um atacante pode criar uma página maliciosa que faz requests cross-origin para a API, potencialmente capturando tokens de admin ou 2FA nas respostas. Combinado com a documentação vazada (F-001), permite ataques direcionados.

**Recomendação**: Restringir origens permitidas no CORS. Não expor headers de autenticação via Access-Control-Expose-Headers.

**Próximo passo**: Verificar se o endpoint `/api/v1/checkout/payment-link/get` (que retorna 400, não 401) aceita parâmetros públicos para criar links de pagamento.

---

### F-006 — API Roblox Users Exposta [MÉDIO]

**Alvo**: `https://api.sharpify.com.br/api/v1/commom-services/roblox/users/{username}`
**Severidade**: Média
**Timestamp**: 2026-08-20T05:50:00Z

**Descrição**: Endpoint público que permite consultar dados de qualquer usuário Roblox sem qualquer autenticação. Retorna ID numérico, displayName, avatar URL.

**Reprodução**:
```
GET /api/v1/commom-services/roblox/users/testuser
→ {"id":155,"name":"testuser","displayName":"testuser","avatarUrl":"https://tr.rbxcdn.com/..."}
```

**Impacto**: Permite enumeração de usuários Roblox, associação de contas, e potencial abuse para scraping de dados de usuários.

**Recomendação**: Implementar rate limiting e/ou autenticação para este endpoint, ou remover se não for necessário publicamente.

---

### F-007 — 57 Endpoints API Mapeados via Documentação Exposta [ALTA]

**Alvo**: `https://docs.sharpify.com.br/`
**Severidade**: Alta
**Timestamp**: 2026-08-20T05:50:00Z

**Descrição**: A partir da documentação exposta (F-001), foi possível extrair 57 endpoints completos da API, incluindo schemas TypeScript, métodos HTTP, parâmetros, e sistema de autenticação.

**Endpoints por categoria**:
| Categoria | Qtd | Exemplos |
|-----------|-----|----------|
| Catálogo (privado) | 12 | CRUD de produtos, categorias, stock |
| Checkout (privado) | 4 | Payment links, orders, refunds |
| Financeiro (privado) | 2 | Withdrawals (saques) |
| Webhook (privado) | 2 | Local webhooks, eventos |
| Catálogo (público) | 4 | Listar/consultar produtos |
| Checkout (público) | 10 | Orders, feedback, live chat |
| Autenticação (público) | 6 | OAuth, verificação de código |
| Preços (público) | 7 | Cupons, afiliados, saques |
| Gateway | 7 | Pagamento, reembolso, saque |
| **Total** | **57** | |

**Auth Schema**: `x-sharpify-client-id` + `x-sharpify-client-secret` + `x-access-token` + permissões RBAC

**Schemas TypeScript**: ProductProps, OrderProps, PaymentLinkProps, UserProps, CouponProps, GatewayCreatePaymentInput, etc.

**Gateway Methods**: PIX, EFI_PAY_PREFERENCE, STRIPE_PREFERENCE, CUSTOMER_BALANCE, LITECOIN

**Impacto**: Atacante tem visão completa da superfície de ataque da API, permitindo ataques direcionados (IDOR, mass assignment, SSRF, injeção) sem necessidade de enumeração cega.

**Próximo passo**: Testar endpoints de autenticação, mass assignment em POST, e SSRF em parâmetros de URL/webhook.

---

### F-008 — Auth verify-code retorna 500 ISE com código válido [ALTA]

**Alvo**: `https://api.sharpify.com.br/api/v1/management/auth/default/verify-code`
**Severidade**: Alta
**Timestamp**: 2026-08-20T07:10:00Z

**Descrição**: O endpoint de verificação de código retorna 500 Internal Server Error quando recebe um código de verificação válido, em vez de retornar um access token. Códigos inválidos retornam 400 `InvalidCodeError` (comportamento esperado), mas códigos válidos causam crash.

**Reprodução**: Enviar código de 6 dígitos recebido por email para o endpoint verify-code → HTTP 500 com `Internal Server Error` em HTML.

**Impacto**: Fluxo de autenticação primário completamente quebrado. Usuários não conseguem criar conta ou fazer login. A única alternativa seria OAuth (que também retorna erro para todas as plataformas).

---

### F-009 — Checkout place-order retorna 500 ISE [ALTA]

**Alvo**: `https://api.sharpify.com.br/checkout/order/place-order`
**Severidade**: Alta
**Timestamp**: 2026-08-20T07:15:00Z

**Descrição**: POST /checkout/order/place-order retorna 500 Internal Server Error para qualquer payload enviado.

**Reprodução**: Qualquer POST com corpo JSON → HTTP 500.

**Impacto**: Usuários não conseguem finalizar compras. Fluxo de e-commerce completamente quebrado.

---

### F-010 — Analytics session/create-session retorna 500 ISE [MÉDIO]

**Alvo**: `https://api.sharpify.com.br/api/v1/e-commerce/analytics/session/create-session`
**Severidade**: Média
**Timestamp**: 2026-08-20T07:18:00Z

**Descrição**: Endpoint de criação de sessão de analytics retorna 500 ISE.

**Impacto**: Analytics e afiliados não funcionais.

---

### F-011 — WebSocket endpoints indisponíveis (404) [MÉDIO]

**Alvo**: `https://api.sharpify.com.br/api/v1/commom-services/local-webhook`, `https://api.sharpify.com.br/api/v1/checkout/order/live-chat`
**Severidade**: Média
**Timestamp**: 2026-08-20T07:17:00Z

**Descrição**: Tentativa de conexão WebSocket resulta em 404. Express.js trata upgrade como GET comum.

**Impacto**: Funcionalidades em tempo real (webhook events, live chat) não operacionais.

---

### F-012 — Endpoints de feedback públicos sem auth [INFO]

**Alvo**: `https://api.sharpify.com.br/api/v1/checkout/feedback/`
**Severidade**: Info
**Timestamp**: 2026-08-20T07:20:00Z

**Descrição**: Endpoints de listagem de feedback funcionam sem autenticação, retornando arrays vazios.

---

### F-013 — Rate limiting no envio de código de verificação [INFO]

**Alvo**: `https://api.sharpify.com.br/api/v1/management/auth/default/send-verification-code-to-email`
**Severidade**: Info
**Timestamp**: 2026-08-20T07:11:00Z

**Descrição**: Rate limiting com cooldown de ~10-15s implementado no endpoint de envio de código.

---

### F-014 — Credenciais de API são env vars [INFO]

**Alvo**: `https://docs.sharpify.com.br/docs/sdk/autenticacao`
**Severidade**: Info
**Timestamp**: 2026-08-20T07:14:00Z

**Descrição**: Documentação do SDK revela que `SHARPIFY_CLIENT_ID` e `SHARPIFY_CLIENT_SECRET` são variáveis de ambiente, indicando credenciais server-to-server.

---

## Acessos Obtidos

*(nenhum)*

## Cronologia

| Data | Evento |
|------|--------|
| 2026-08-20T05:00:00Z | Início do engagement sharpify.com.br |
| 2026-08-20T05:30:00Z | Fase 2 (Recon passivo) concluída — 4 findings descobertos |
| 2026-08-20T05:32:00Z | F-001: Documentação API Privada Exposta (Crítico) |
| 2026-08-20T05:32:00Z | F-002: MinIO/S3 Acessível (Alto) |
| 2026-08-20T05:32:00Z | F-003: API Express Pública (Médio) |
| 2026-08-20T05:35:00Z | Fase 3 (Recon ativo) concluída — F-005, MinIO |
| 2026-08-20T05:35:00Z | F-005: CORS Permissivo (Médio) |
| 2026-08-20T05:50:00Z | Fase 5 (Enumeração) concluída — 57 endpoints mapeados |
| 2026-08-20T05:50:00Z | F-006: API Roblox Users Exposed (Médio) |
| 2026-08-20T05:50:00Z | F-007: 57 Endpoints Mapeados (Alta) |
| 2026-08-20T07:00:00Z | Fase 6 (Ataque webapp) concluída — 500 ISEs, auth bypass falhou |
| 2026-08-20T07:00:00Z | F-008 a F-014: diversos findings de webapp |
| 2026-08-20T07:40:00Z | Fase 7 (CVE Research) concluída — nenhum CVE confirmado |
| 2026-08-20T07:40:00Z | F-018: CVE Research completo |
| 2026-08-20T08:00:00Z | Engagement concluído — 15 findings documentados |
| 2026-08-20T05:32:00Z | F-004: Subdomínios Não Resolvem (Info) |
| 2026-08-20T05:35:00Z | Fase 3 (Recon ativo) concluída — F-005 criado, F-001 elevado a Crítico |
| 2026-08-20T05:35:00Z | F-005: CORS Permissivo com headers de admin/2FA expostos (Médio) |
| 2026-08-20T07:40:00Z | Fase 7 (CVE research) concluída — nenhum CVE confirmado aplicável |
| 2026-08-20T07:40:00Z | F-018: CVE Research — Nenhum CVE Confirmado Aplicável (Info) |

---

### F-018 — CVE Research — Nenhum CVE Confirmado Aplicável [INFO]

**Alvo**: Todos os hosts
**Severidade**: Informativa
**Timestamp**: 2026-08-20T07:40:00Z

**Descrição**: Pesquisa de CVEs conduzida para todas as tecnologias identificadas na stack. Nenhum CVE pôde ser confirmado como explorável devido ao Cloudflare WAF e à proteção dos serviços.

**CVEs Pesquisados**:
- **CVE-2025-29927** (CRITICAL 9.1): Next.js Middleware Bypass — Bloqueado pelo Cloudflare (403). Não confirmado.
- **CVE-2024-34351** (HIGH): Next.js SSRF — Não testado (requer Server Actions).
- **CVE-2024-34350** (HIGH): Next.js XSS — Impróvavel (versão >= 13.5.1).
- **CVE-2024-47831** (MEDIUM): Next.js Image DoS — Não testado.
- **CVE-2023-28432** (HIGH): MinIO Info Disclosure — 403 Access Denied. Patched/bloqueado.
- **CVE-2024-24747** (HIGH): MinIO Key Inheritance — Sem acesso.
- **CVE-2023-28434** (HIGH): MinIO SSRF — Sem acesso.
- **CVE-2024-29041** (MEDIUM): Express Open Redirect — Sem endpoint confirmado.

**Artefatos**:
- `exploit/cve_research.md` — Lista completa de CVEs pesquisados e status
- `exploit/minio_test.txt` — Resultados dos testes MinIO
- `exploit/nextjs_cve_test.txt` — Resultados dos testes CVE-2025-29927
- `exploit/pocs/CVE-2025-29927-poc/` — PoC clonado para referência

**Recomendação**: Encontrar IP real do servidor para bypass do Cloudflare e re-testar CVE-2025-29927 e MinIO.

---
*Documento incremental — atualizado a cada fase/finding.*