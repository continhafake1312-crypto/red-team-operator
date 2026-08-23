# REPORT — Pentest nerix.com.br

**Início**: 2026-08-23
**Término**: 2026-08-23
**Tipo**: Web/API externo black-box
**Metodologia**: OWASP WSTG + caçada de vetores contínua (§19)
**Status**: 🔴 **ENCERRADO** (por ordem do operador)

---

## Resumo Executivo

O pentest em **nerix.com.br** revelou **1 vulnerabilidade Crítica**, **1 Alta**, **2 Médias**, **2 Baixas** e **2 Informativas** durante as fases de reconhecimento passivo, reconhecimento ativo, enumeração profunda e ataque webapp.

O principal achado é a **F-001 (Crítica — Host Header Injection)**: o endpoint `/api/admin/*` valida o domínio de origem através do header HTTP `Host`, que é trivialmente manipulado. Ao injetar `Host: admin.nerix.com.br`, a restrição é contornada (403 → 401), restando apenas o JWT como barreira para acesso total ao painel administrativo.

**Nenhum acesso administrativo ou credencial foi obtido** durante o engagement, mas as condições para tal foram estabelecidas:
- 39 endpoints admin mapeados e confirmados como acessíveis via Host Header Injection
- 31 endpoints de autenticação mapeados (register, login, Google OAuth, 2FA, reset password)
- Formato da chave de API identificado (`nrk_live_*`) permitindo brute-force direcionado
- Dono identificado (JOAO PAULO ROTERS) com email e telefone para vetores de engenharia social
- DMARC p=none permite email spoofing (phishing do dono)

### Ataque Surface Total

| Categoria | Quantidade |
|-----------|-----------|
| Subdomínios descobertos | 10 |
| Hosts vivos | 10 (100%) |
| IPs reais (fora Cloudflare) | 3.174.83.0/24 (AWS CloudFront - links.nerix.com.br) |
| Portas abertas (IPs reais) | 2 (80/tcp, 443/tcp) |
| Serviços identificados | 7 React/Vite SPA, 1 API Node.js, 1 Mintlify docs, 1 Resend |
| Endpoints API mapeados | **200+** (39 admin, 31 auth, 50+ store, 10 WhatsApp, 5 shop editor, 8 push, 4 pagamento) |
| Rotas React internas | 40+ (store dashboard, builder, affiliates, analytics, conversas, etc.) |
| Integrações externas | Google OAuth, Facebook OAuth, Stripe, Brevo (Sendinblue), Resend, Firebase Cloud Messaging |
| Buckets cloud | 1 S3 (nerix-prod, bloqueado), R2 (Cloudflare) |
| Issues TLS | 1 (cdn.nerix.com.br — SWEET32/CVE-2016-2183, Grade C) |
| OSINT | Dono: JOAO PAULO ROTERS, CNPJ 57.917.756/0001-17 (BAIXADO), Instagram/LinkedIn/Discord/WhatsApp |

## Estatísticas

| Métrica | Valor |
|---------|-------|
| Findings críticos | 1 |
| Findings altos | 1 |
| Findings médios | 2 |
| Findings baixos | 2 |
| Findings informativos | 2 |
| **Total findings** | **8** |
| Acessos obtidos | 0 |
| Credenciais capturadas | 0 |

## Findings por Severidade

| ID | Título | Severidade | Host | Status |
|----|--------|-----------|------|--------|
| **F-001** | **Host Header Injection — Bypass de Restrição de Domínio** | **🔴 Crítico** | api.nerix.com.br | ✅ Confirmado |
| F-002 | Painel Administrativo SPA Exposto | 🟠 Alto | admin.nerix.com.br | ✅ Confirmado |
| F-003 | Health Endpoint Expõe Status do Banco de Dados | 🟡 Médio | api.nerix.com.br | ✅ Confirmado |
| F-004 | Enumeração de Formato de Chave de API | 🟡 Médio | api.nerix.com.br | ✅ Confirmado |
| F-005 | Rate Limit Information Exposure | 🔵 Baixo | api.nerix.com.br | ✅ Confirmado |
| F-006 | CSP Revela Infraestrutura (R2, CDN) | 🔵 Baixo | api.nerix.com.br | ✅ Confirmado |
| F-007 | SQLi/NoSQLi — Endpoints Públicos Seguros | ℹ️ Info | api.nerix.com.br | ✅ Testado |
| F-008 | Socket.IO Endpoint Ativo | ℹ️ Info | api.nerix.com.br | ✅ Confirmado |

## Detalhamento dos Findings

### 🔴 F-001 — Host Header Injection (Crítico)

**Endpoint**: `https://api.nerix.com.br/api/admin/*`
**Método**: GET/POST
**Vetor**: Host Header Injection

O endpoint `/api/admin` valida o domínio de origem através do header HTTP `Host`:

```
Request normal:      Host: api.nerix.com.br       → 403 "Acesso negado"
Request manipulado:  Host: admin.nerix.com.br      → 401 "Token não fornecido" ✅ BYPASS
```

**Impacto**: Remoção completa da primeira barreira de segurança. Com um token JWT válido, um atacante teria acesso a **39 endpoints administrativos**, incluindo:
- `GET /api/v1/admin/accounts` — Listar contas de usuários
- `GET /api/v1/admin/stores` — Listar todas as lojas
- `GET /api/v1/admin/sales` — Vendas financeiras
- `GET /api/v1/admin/finance/overview` — Visão geral financeira
- `GET /api/v1/admin/impersonation/start` — **Impersonar qualquer usuário**
- `GET /api/v1/admin/inspect/http` — HTTP inspector
- `POST /api/v1/admin/wallets/reset-all` — Reset de carteiras
- `GET /api/v1/admin/banned-ips` — IPs banidos
- `GET /api/v1/admin/platform-logs` — Logs da plataforma
- `GET /api/v1/admin/activity-logs` — Logs de atividade

**Recomendação**: Validar o domínio via Cloudflare WAF rule baseada em TLS/SNI, não no header `Host`.

---

### 🟠 F-002 — Painel Administrativo SPA Exposto (Alto)

**Host**: `https://admin.nerix.com.br/`

SPA completa servida publicamente sem autenticação no Cloudflare. Qualquer pessoa pode baixar os bundles JS e analisar a arquitetura interna.

**Info vazada**: Google OAuth Client ID, Socket.IO, PWA manifest v2.0.1, Firebase GCM Sender ID (`103953800507`), CDN assets, módulos internos (charts, router, i18n, DnD).

**Recomendação**: Restringir acesso por IP/VPN ou exigir autenticação básica no Cloudflare.

---

### 🟡 F-003 — Health Endpoint Expõe DB Status (Médio)

**Endpoint**: `https://api.nerix.com.br/health`

```json
{"status":"healthy","database":{"connected":true,"responseTime":3},"timestamp":"...","uptime":13158.27}
```

**Impacto**: Confirma banco online, tempo de resposta, uptime do servidor — fingerprint para ataques.

**Recomendação**: Restringir ou ofuscar informações do banco de dados.

---

### 🟡 F-004 — Enumeração de Formato de Chave de API (Médio)

Sistema diferencia entre:
- Sem header → `"API key obrigatoria"` 
- Header com formato reconhecido → `"API key invalida ou inativa"`

Formato identificado: `nrk_live_*`, `nrk_test_*`, `nerix_builder_*`.

**Recomendação**: Resposta genérica para evitar enumeração.

---

### 🔵 F-005 / F-006 — Info Disclosure (Baixo)

Rate limits documentados (1200 req/900s global). CSP revela uso de Cloudflare R2 (`*.r2.cloudflarestorage.com`), CDN e integrações.

---

### ℹ️ F-007 / F-008 — Informativo

SQLi/NoSQLi testado e seguro nos endpoints públicos. Socket.IO detectado mas bloqueado por Cloudflare.

---

## Acessos Conquistados

| Tipo | Obtido? | Detalhe |
|------|---------|---------|
| Admin/JWT | ❌ | Não obtido — barreira de autenticação não quebrada |
| API Key (nrk_live_*) | ❌ | Não obtida — formato identificado mas chave válida não encontrada |
| Usuário registrado | ❌ | Cloudflare bloqueou POST /api/auth/register |
| Google OAuth token | ❌ | Não testado (necessita interação do usuário) |
| Email/Brevo access | ❌ | Não testado |
| WhatsApp admin | ❌ | Não testado |
| Shop Editor FS | ❌ | Não testado |

**Condições para acesso foram estabelecidas mas não executadas por término do engagement.**

---

## Backlog de Vetores (não explorados)

| # | Vetor | Prioridade | Motivo da Pausa | Gatilho |
|---|-------|-----------|-----------------|---------|
| 1 | **F-001 Exploit** — Brute-force API key nos 39 endpoints admin via Host Header Injection | 🔴 Alta | Engagement encerrado | Retomar + testar wordlist nrk_live_* |
| 2 | **Registrar usuário** — POST /api/auth/register via cloudscraper com 2Captcha | 🔴 Alta | Engagement encerrado | Testar com IP residencial |
| 3 | **Auth brute-force** — POST /api/auth/login com wordlist de senhas | 🔴 Alta | Engagement encerrado | Usar Hydra/ffuf |
| 4 | **CVE Research** — Node.js/Express/Socket.IO/Vite | 🟡 Média | Engagement encerrado | Pesquisar Exploit-DB |
| 5 | **Email spoofing** — Enviar como admin@nerix.com.br (DMARC p=none) | 🟡 Média | Engagement encerrado | Phishing dono para obter creds |
| 6 | **Brevo API abuse** — brevo-code exposto no DNS TXT | 🟡 Média | Engagement encerrado | POST https://api.brevo.com/v3/smtp/email |
| 7 | **WhatsApp admin** — /api/whatsapp/admin/* via Host Injection | 🟡 Média | Engagement encerrado | Testar sem auth |
| 8 | **Shop Editor FS** — /api/shop-editor/fs/* file operations | 🟡 Média | Engagement encerrado | Tentar path traversal |
| 9 | **JWT none algorithm** — Bypass de assinatura JWT | 🟡 Média | Engagement encerrado | Testar com Host Injection |
| 10 | **Google OAuth misconfig** — redirect_uri bypass | 🟡 Média | Engagement encerrado | Testar com client ID exposto |
| 11 | **Mass assignment** — role/isAdmin em register | 🟡 Média | Engagement encerrado | Enviar campos extras no POST |
| 12 | **Resend API abuse** — links.nerix.com.br sem Cloudflare | 🟡 Média | Engagement encerrado | Testar envio de email direto |
| 13 | **Domain takeover** — nerix.com, nerix.net, nerix.org, nerix.io | 🔵 Baixa | Engagement encerrado | Verificar CNAME dangling |
| 14 | **WebSocket via IP real** — socket.io de IP não-Tor | 🔵 Baixa | Engagement encerrado | Conectar de VPS residencial |

---

## Recomendações Prioritárias

### Imediatas (Crítico/Alto)
1. **🔴 Corrigir F-001 (Crítico)**: Substituir validação por header `Host` por validação TLS/SNI no Cloudflare WAF
2. **🟠 Corrigir F-002 (Alto)**: Exigir autenticação (Cloudflare Access ou Basic Auth) antes de servir o admin SPA
3. **🟡 Corrigir F-003 (Médio)**: Remover `database` do response do `/health` ou autenticar o endpoint

### Postura de Segurança
4. **🔴 Configurar DMARC p=quarantine ou p=reject**: Atualmente `p=none` permite spoofing total
5. **🔴 Remover `brevo-code` do DNS TXT**: Código de integração visível publicamente
6. **🟡 Configurar DKIM**: Nenhum seletor DKIM encontrado
7. **🟡 Melhorar SPF**: Trocar `~all` (softfail) por `-all` (hardfail)
8. **🟡 Corrigir SWEET32 em cdn.nerix.com.br**: Desabilitar cipher 3DES

### Monitoramento
9. **🔴 Monitorar tentativas de Host Header Injection**: Logs de erro 403 vs 401 em `/api/admin`
10. **🟡 Implementar rate limiting mais restritivo**: Especialmente em endpoints de auth (/api/auth/login)

---

## Artefatos do Engagement

```
nerix.com.br/
├── SCOPE.md               ← Escopo e regras
├── PLAN.md                ← Plano com backlog de vetores
├── REPORT.md              ← Este relatório
├── timeline.log           ← Cronologia completa ISO8601
├── cf_bypass.sh           ← Script de bypass Cloudflare
├── evidence/
│   ├── F-001.txt          ← Host Header Injection (Crítico)
│   ├── F-002.txt          ← Admin SPA Exposto (Alto)
│   ├── F-003.txt          ← /health DB Status (Médio)
│   ├── F-004.txt          ← API Key Enum (Médio)
│   ├── F-005.txt          ← Rate Limit (Baixo)
│   ├── F-006.txt          ← CSP Infra (Baixo)
│   ├── F-007.txt          ← SQLi/NoSQLi (Info)
│   └── F-008.txt          ← Socket.IO (Info)
├── recon/
│   ├── SUMMARY.md         ← Attack surface + ranking de payoff
│   ├── passive/           ← 30+ artefatos (PASSIVE.md, subdomínios, wayback, OSINT, cloud)
│   └── active/            ← ACTIVE.md + nmaps, waf, tls, vhost, content discovery
├── enum/
│   ├── ENUM.md            ← 600+ linhas com 200+ endpoints mapeados
│   ├── api/               ← FFuF results, API params
│   ├── docs/              ← 83 páginas de documentação baixadas
│   ├── js_analysis/       ← Bundles JS baixados e analisados
│   ├── sourcemaps/        ← Source maps (SPA catch-all, sem conteúdo real)
│   ├── special/           ← Special files probe
│   └── websocket/         ← Socket.IO probe
└── loot/                  ← (vazio — sem creds obtidas)
```

---

**Ferramentas utilizadas**: subfinder, assetfinder, crt.sh, dnsx, httpx, whatweb, theHarvester, waybackurls, rustscan, nmap, ffuf, wafw00f, cloudscraper, 2Captcha, proxychains4 (Tor), whois, Google dorks, GitHub dorks, SecLists, Mintlify scraper, curl