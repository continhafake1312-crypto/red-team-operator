# Relatório de Pentest — sharpify.com.br

**Status**: EM ANDAMENTO
**Início**: 2026-08-20T05:00:00Z
**Alvo**: https://sharpify.com.br/

## Sumário Executivo

Engagement em andamento — Fase 2 (Recon passivo) concluída. Documentação de API privada exposta publicamente (CRÍTICO) e MinIO/S3 storage acessível (ALTO) já identificados. Fase 3 (Recon ativo) em progresso.

## Tabela de Findings

| ID | Título | Severidade | Host | Status | Data |
|----|--------|-----------|------|--------|------|
| F-001 | Documentação da API Privada Exposta | 🔴 Crítica | docs.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-002 | MinIO/S3 Acessível via CDN | 🔴 Alta | cdn.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-003 | API Express Pública | 🟡 Média | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-004 | Subdomínios Não Resolvem | 🔵 Info | *.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |
| F-005 | CORS Permissivo na API | 🟡 Média | api.sharpify.com.br | 🔍 Descoberto | 2026-08-20 |

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
| 2026-08-20T05:32:00Z | F-004: Subdomínios Não Resolvem (Info) |
| 2026-08-20T05:35:00Z | Fase 3 (Recon ativo) concluída — F-005 criado, F-001 elevado a Crítico |
| 2026-08-20T05:35:00Z | F-005: CORS Permissivo com headers de admin/2FA expostos (Médio) |

---
*Documento incremental — atualizado a cada fase/finding.*