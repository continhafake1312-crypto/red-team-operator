# REPORT — Pentest nerix.com.br

**Início**: 2026-08-23
**Tipo**: Web/API externo black-box
**Metodologia**: OWASP WSTG + caçada de vetores contínua
**Status**: EM ANDAMENTO — Fase 6 (Webapp) concluída

---

## Resumo Executivo

O pentest em nerix.com.br revelou **1 vulnerabilidade Crítica** (Host Header Injection), **1 Alta** (Admin SPA exposta), **2 Médias** e **2 Baixas**. O principal achado é a **F-001 (Crítica)**: o endpoint `/api/admin/*` valida o domínio através do header HTTP `Host`, que é facilmente manipulado pelo cliente. Ao injetar `Host: admin.nerix.com.br`, um atacante contorna a restrição de domínio, obtendo acesso aos endpoints administrativos — restando apenas a autenticação JWT como barreira.

Além disso, 100+ endpoints de API foram mapeados, a infraestrutura usa Cloudflare (R2 + CDN), e há falhas de postura como DMARC p=none (permitindo email spoofing).

## Estatísticas

| Métrica | Valor |
|---------|-------|
| Subdomínios descobertos | 10 |
| Hosts vivos | 10 (100%) |
| Portas abertas (IPs reais) | 2 (80/tcp, 443/tcp — apenas CloudFront) |
| Serviços identificados | 7 React/Vite SPA, 1 API Node.js, 1 Mintlify docs, 1 Resend |
| Endpoints de API mapeados | 200+ (38 documentados, 39 admin, 31 auth) |
| Findings críticos | 1 |
| Findings altos | 1 |
| Findings médios | 2 |
| Findings baixos | 2 |
| Findings informativos | 2 |

## Findings por Severidade

| ID | Título | Severidade | Host | Status | Data |
|----|--------|-----------|------|--------|------|
| F-001 | Host Header Injection — Bypass de Restrição de Domínio | **Crítico** | api.nerix.com.br | ✅ Confirmado | 2026-08-23 |
| F-002 | Painel Administrativo SPA Exposto | **Alto** | admin.nerix.com.br | ✅ Confirmado | 2026-08-23 |
| F-003 | Health Endpoint Expõe Status do Banco de Dados | **Médio** | api.nerix.com.br | ✅ Confirmado | 2026-08-23 |
| F-004 | Enumeração de Formato de Chave de API | **Médio** | api.nerix.com.br | ✅ Confirmado | 2026-08-23 |
| F-005 | Rate Limit Information Exposure | **Baixo** | api.nerix.com.br | ✅ Confirmado | 2026-08-23 |
| F-006 | CSP Revela Infraestrutura (R2, CDN) | **Baixo** | api.nerix.com.br | ✅ Confirmado | 2026-08-23 |
| F-007 | SQLi/NoSQLi — Endpoints Públicos Seguros | **Info** | api.nerix.com.br | ✅ Testado | 2026-08-23 |
| F-008 | Socket.IO Endpoint Ativo | **Info** | api.nerix.com.br | ✅ Confirmado | 2026-08-23 |

## Detalhamento dos Findings

### F-001 — Host Header Injection (Crítico) 🔴

**Endpoint**: `https://api.nerix.com.br/api/admin/*`
**Método**: GET/POST
**Vetor**: Host Header Injection

O endpoint `/api/admin` valida o domínio de origem através do header HTTP `Host`. Um atacante pode contornar essa verificação simplesmente alterando o header:

```http
GET /api/admin HTTP/1.1
Host: admin.nerix.com.br
```

**Resposta original (sem bypass)**:
```json
{"error":"Acesso negado","message":"O painel administrativo só pode ser acessado via domínio autorizado"}
```
HTTP 403

**Resposta com Host Header Injection**:
```json
{"error":"Token não fornecido"}
```
HTTP 401

**Impacto**: A primeira barreira de segurança (restrição de domínio) é completamente removida. Um atacante com um token JWT válido teria acesso total a todos os 39 endpoints administrativos, incluindo:
- `GET /api/v1/admin/accounts` — Listar contas
- `GET /api/v1/admin/stores` — Listar lojas
- `GET /api/v1/admin/sales` — Vendas financeiras
- `GET /api/v1/admin/finance/overview` — Financeiro
- `GET /api/v1/admin/impersonation/start` — Impersonar usuários
- `GET /api/v1/admin/inspect/http` — HTTP inspector
- `POST /api/v1/admin/wallets/reset-all` — Reset de carteiras

**Recomendação**: Validar o domínio através de mecanismos mais seguros como verificação do TLS/SNI ou configuração no Cloudflare (WAF custom rule), em vez de confiar no header `Host` que é facilmente manipulado.

---

### F-002 — Painel Administrativo SPA Exposto (Alto) 🟠

**Host**: `https://admin.nerix.com.br/`

O painel administrativo é uma SPA completa (React/Vite) servida publicamente sem qualquer autenticação no Cloudflare. Qualquer pessoa pode baixar os bundles JS e analisar a arquitetura interna.

**Informações expostas**:
- **Framework**: Vite + React (modulepreload chunks)
- **Google OAuth**: Client ID exposto nos assets (`@react-oauth/google`)
- **Socket.IO**: Cliente para comunicação em tempo real
- **PWA**: Manifest v2.0.1, notificações push, GCM Sender ID: `103953800507`
- **CDN**: cdn.nerix.com.br (Cloudflare Pages)
- **Módulos**: charts, router, i18n, DnD, OAuth vendors

**Recomendação**: Restringir o acesso ao admin.nerix.com.br por IP/VPN ou exigir autenticação básica no Cloudflare antes de servir a SPA.

---

### F-003 — Health Endpoint Expõe DB Status (Médio) 🟡

**Endpoint**: `https://api.nerix.com.br/health`

Resposta:
```json
{
  "status": "healthy",
  "database": { "connected": true, "responseTime": 3 },
  "timestamp": "2026-08-23T05:37:43.002Z",
  "uptime": 13158.27992015
}
```

Expõe status da conexão com o banco de dados, tempo de resposta, timestamp preciso e uptime. Pode ser usado para fingerprint do servidor e planejamento de ataques.

**Recomendação**: Restringir o endpoint `/health` com autenticação ou remover informações do banco de dados da resposta pública.

---

### F-004 — Enumeração de Formato de Chave de API (Médio) 🟡

**Endpoint**: `https://api.nerix.com.br/api/v1/admin/accounts`

O sistema diferencia entre:
- `"API key obrigatoria"` — quando nenhum header é enviado
- `"API key invalida ou inativa"` — quando o formato é reconhecido mas a chave é inválida

Isso permite enumerar o formato válido das chaves: `nrk_live_*`, `nrk_test_*`, `nerix_builder_*`.

**Recomendação**: Usar resposta genérica independente do formato da chave.

---

### F-005 — Rate Limit Exposure (Baixo) 🔵

Rate limits documentados (1200 req/900s global, 120 req/60s categories). Headers de rate limit expostos nas respostas. Tentativas de bypass com `X-Forwarded-For` e `X-Real-IP` não funcionaram. `CF-Connecting-IP` bloqueado pelo WAF.

---

### F-006 — CSP Revela Infraestrutura (Baixo) 🔵

A CSP revela uso de Cloudflare R2 (`*.r2.dev`, `*.r2.cloudflarestorage.com`), CDN `cdn.nerix.com.br`, e integrações com Facebook e Google.

---

## Acessos Conquistados

Nenhum acesso administrativo ou credencial válida obtida até o momento. Os vetores de autenticação testados não produziram credenciais válidas.

## Pendências / Próximos Passos

1. **🔴 CVE Research** — Pesquisar CVEs para Node.js, Socket.IO, React, Vite, Cloudflare R2
2. **🔴 Exploit F-001** — Usar Host Header Injection + brute-force de API key nos endpoints admin
3. **🔴 Auth brute-force** — Testar `/api/auth/login` com wordlists de senhas comuns
4. **🟡 Email spoofing PoC** — Enviar email como admin@nerix.com.br (DMARC p=none)
5. **🟡 Brevo API abuse** — Testar brevo-code contra API Sendinblue
6. **🟡 Resend API abuse** — Testar links.nerix.com.br para envio não autorizado
7. **🟡 WhatsApp admin** — Testar endpoints sem auth via Host Header Injection

## Recomendações Prioritárias

1. **Corrigir F-001 (Crítico)**: Validar domínio via Cloudflare WAF rule baseada em TLS/SNI, não no header Host
2. **Corrigir F-002 (Alto)**: Exigir autenticação no Cloudflare antes de servir o admin SPA
3. **Corrigir F-003 (Médio)**: Remover informações do banco de dados do /health público
4. **Configurar DMARC p=quarantine/reject**: Proteger contra email spoofing
5. **Remover brevo-code do DNS TXT**: Código de integração exposto publicamente