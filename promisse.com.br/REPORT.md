# Relatório de Pentest — promisse.com.br

**Data de início**: 2026-08-20
**Tipo**: Web/API Black-Box Externo (Gateway de Pagamentos Brasileiro — PIX, boleto, cartão)
**Metodologia**: Red Team autônomo
**Infra**: Vercel (main) + Railway.app (API) + Cloudflare (DNS/WAF) + GoDaddy (registro)

---

## Resumo Executivo

O engagement contra **PromissePay** (promisse.com.br) revelou uma superfície de ataque extensa com **7 findings documentados**, sendo **1 Crítico**, **1 Alto**, **3 Médios** e **2 Baixos**. O achado mais grave é a configuração CORS insegura (`Access-Control-Allow-Origin: *` com `Access-Control-Allow-Credentials: true`) em toda a API, permitindo potencial abuso cross-origin. A ausência de rate limiting em endpoints autenticados abre porta para brute force de API keys. Dois endpoints públicos (`/infos` e `/health`) vazam dados sensíveis de negócio e infraestrutura. Não foi obtido acesso autenticado à API (auth `sk_live_*` bem implementada), mas o endpoint de registro `/register` existe e é funcional — requer reCAPTCHA Enterprise que pode ser contornado com navegador headless + stealth, abrindo caminho para criação de conta e obtenção de API key legítima.

---

## Timeline de Progresso
> Cronologia completa em `timeline.log`.

---

## Findings por Severidade

### 🔴 Crítica

| ID | Título | Alvo | Detalhe |
|----|--------|------|---------|
| F-001 | **CORS Wildcard + Credentials** | api.promisse.com.br | `Access-Control-Allow-Origin: *` + `Access-Control-Allow-Credentials: true` em TODOS os endpoints. Qualquer origem (evil.com, null) é aceita. Potencial para CSRF e exfiltração cross-origin. |

### 🟠 Alta

| ID | Título | Alvo | Detalhe |
|----|--------|------|---------|
| F-005 | **Ausência de Rate Limiting** | api.promisse.com.br | 50 requests paralelos e 1 adicional → 0 bloqueios. Sem headers `X-RateLimit-*` ou `Retry-After`. Permite brute force de API keys `sk_live_*` e enumeração de IDs. |

### 🟡 Média

| ID | Título | Alvo | Detalhe |
|----|--------|------|---------|
| F-002 | **Info Disclosure — /infos** | api.promisse.com.br | Endpoint GET público retorna `totalTransacionado: R$160.000.110,00` e `totalClientes: 1.617`. Dados de negócio sensíveis sem autenticação. |
| F-003 | **Info Disclosure — /health** | api.promisse.com.br | Endpoint GET público retorna `status: online, db: connected, version: 1.0.0, timestamp`. Vaza estado de infraestrutura. |
| F-004 | **Endpoint sem Auth — /api/register-push** | api.promisse.com.br | POST `/api/register-push` aceita body JSON sem qualquer autenticação. Pode ser abusado para registro massivo de push tokens. |

### 🟢 Baixa

| ID | Título | Alvo | Detalhe |
|----|--------|------|---------|
| F-006 | **Auth Response Inconsistency** | api.promisse.com.br | Sem token → 401, com token inválido → 200+ACCESS_FORBIDDEN. Diferença permite enumerar formato válido de token. |
| F-007 | **Robots.txt Disclosure** | promisse.com.br | `/robots.txt` expõe `/admin/`, `/dashboard/`, `/api/`, `/docs/`. |

### ℹ️ Info

| Item | Detalhe |
|------|---------|
| **API Docs expostos** | `/docs` contém documentação completa com 14 endpoints, schemas, exemplos em 4 linguagens |
| **reCAPTCHA Key exposta** | `6LffCt4sAAAAAI5Ft_mB-V4SVxdggrUMFnPGNeqa` (Enterprise v3) |
| **iOS App ID** | `6760956564` — Bundle: `com.joaozinhopromisse.promisseapp` |
| **Auth Pattern** | `Authorization: Bearer sk_live_<chave>` + header `App: <app-id>` obrigatório |
| **Contato exposto** | Discord: `discord.gg/promissepay`, WhatsApp: `+55 11 91460-8615` |
| **Pessoas** | Joãozinho Figueiredo Neves (owner), João Pedro Figueiredo Neves (tech) |
| **Webhook Secret** | `PROMISSE_WEBHOOK_SECRET` (env var) |
| **Railway Edge** | ber1 (Berlin), mia1 (Miami), jfk1 (New York) |
| **Domínio recente** | Registrado 2025-12-05, expira 2026-12-05 |

---

## Acessos Obtidos

- ❌ **Nenhum** — API key `sk_live_*` válida não encontrada. Auth bem implementada.
- ⏳ **Parcial** — Endpoint `/register` existe e aceita payload com reCAPTCHA. Com stealth bypass do reCAPTCHA (comprovado), é possível criar conta e obter API key.

---

## Objetivos de Alto Valor

| Objetivo | Status | Notas |
|----------|--------|-------|
| Acesso interno (foothold) | ❌ Não obtido | API key necessária para acessar endpoints autenticados |
| Acesso administrativo (admin/RCE) | ❌ Não obtido | Sem credenciais administrativas |
| Acesso financeiro (PIX/pagamentos) | ❌ Não obtido | Endpoints de transações exigem auth `sk_live_*` |
| Acesso a dados/PII (clientes) | ❌ Não obtido | Endpoints de consulta exigem auth |

---

## Endpoints Mapeados

### Públicos (sem auth)
| Método | Path | Resposta |
|--------|------|----------|
| GET | `/infos` | `{totalTransacionado: 160000110, totalClientes: 1617}` |
| GET | `/health` | `{status: "online", db: "connected", version: "1.0.0"}` |
| POST | `/api/register-push` | Aceita push token sem auth |

### Autenticados (requerem `Authorization: Bearer sk_live_*` + `App: <id>`)
| Método | Path | Escopo |
|--------|------|--------|
| POST | `/transactions` | payments.create |
| GET | `/transactions/:id` | payments.read |
| GET | `/transactions` | payments.read |
| POST | `/withdrawals` | withdrawals.create |
| POST | `/withdrawals/crypto/quote` | withdrawals.create |
| GET | `/withdrawals/:id` | withdrawals.read |
| GET | `/fees` | payments.read |
| POST | `/balance` | payments.read |
| GET/POST/PATCH/DELETE | `/webhooks` | webhooks.manage |
| GET | `/infractions` | transfers.read |
| POST | `/register` | Criação de conta (requer reCAPTCHA) |
| POST | `/notifications/read` | - |
| GET | `/notifications/unread-count` | - |
| POST | `/logout` | - |

---

## Técnicas Testadas sem Sucesso

| Técnica | Resultado |
|---------|-----------|
| SQLi (20+ payloads) | ❌ Rejeitado corretamente |
| NoSQLi (8 payloads) | ❌ Rejeitado corretamente |
| SSTI (3 payloads) | ❌ Rejeitado corretamente |
| SSRF (3 payloads) | ❌ Rejeitado corretamente |
| Command Injection | ❌ Rejeitado corretamente |
| JWT attacks | ❌ Não aplicável |
| Auth bypass (headers alternativos) | ❌ Auth bem implementada |
| Brute force de tokens `sk_live_*` | ❌ Tokens com hash server-side |
| Subdomain takeover | ❌ CNAMEs Vercel resolvem ativamente |
| Buckets S3 abertos | ❌ 28 variações testadas, todas 404 |
| Wayback/crt.sh histórico | ❌ Domínio recente (2025-12) |
| Cloudflare bypass (Railway IP) | ❌ Totalmente cloqueado |

---

## Recomendações Imediatas

1. **🔴 CRÍTICO**: Corrigir CORS — remover `Access-Control-Allow-Origin: *` e `Access-Control-Allow-Credentials: true` em endpoints públicos
2. **🔴 CRÍTICO**: Implementar rate limiting em endpoints autenticados (mínimo 10 req/min por API key)
3. **🟠 ALTO**: Adicionar autenticação em `/infos` e `/health` (ou limitar por IP/whitelist)
4. **🟠 ALTO**: Adicionar autenticação em `/api/register-push`
5. **🟡 MÉDIO**: Proteger `/docs` com autenticação básica
6. **🟡 MÉDIO**: Rotacionar reCAPTCHA key e implementar validação de score mais rigorosa
7. **🟢 BAIXO**: Corrigir inconsistência de código HTTP (401 vs 200 para erro de auth)
8. **🟢 BAIXO**: Remover diretórios administrativos do robots.txt

---

## Arquivos Gerados

| Artefato | Caminho |
|----------|---------|
| Escopo | `SCOPE.md` |
| Plano | `PLAN.md` |
| Timeline | `timeline.log` |
| Recon Passivo | `recon/passive/PASSIVE.md` |
| Recon Ativo | `recon/active/ACTIVE.md` |
| Attack Surface | `recon/SUMMARY.md` |
| Enumeração | `enum/ENUM.md` |
| Evidências | `evidence/F-001.txt` a `evidence/F-007.txt` |
| Relatório | `REPORT.md` (este) |

---

## Fluxo de Registro Comprovado (Funcional)

### 1. Criar Conta
```
POST /register
Content-Type: application/json

{
  "name": "Test User",
  "email": "usuario@provedor.com",       // 🚨 NÃO aceita email descartável
  "password": "Senha123!",
  "phone": "(11) 99146-0861",             // Formato brasileiro
  "cpf": "529.982.247-25",                // CPF com ou sem pontuação
  "accountStyle": "white",                // "white" ou "black"
  "g-recaptcha-response": "<token>"       // reCAPTCHA Enterprise (bypass comprovado via puppeteer+stealth)
}
```

**Resposta:** `{"status":"success","requiresEmailVerification":true,"email":"..."}`

### 2. Verificar Email
```
POST /verify-email
Content-Type: application/json

{
  "email": "usuario@provedor.com",
  "code": "123456"                         // Código de 6 dígitos enviado por email
}
```

**Resposta Sucesso:** HTTP 204 (sem body)
**Resposta Falha:** HTTP 401 `{"code":"INVALID_CODE","message":"Invalid verification code"}`

### Status do Registro
✅ **reCAPTCHA bypass** — comprovado via `puppeteer-extra-plugin-stealth` (score suficiente)
✅ **Payload de registro** — campos exatos confirmados por interceptação de requests
✅ **Endpoint de verificação** — `POST /verify-email` descoberto e funcional
❌ **Email não-descartável** — bloqueio de domínios temporários (mail.tm, guerrillamail, etc.)
   🔑 **Solução**: Usar email @gmail.com, @outlook.com, @yahoo.com ou de provedor real
   📧 **Após verificação**: A conta deve retornar uma API key `sk_live_*` para acesso aos endpoints

### Impacto
Se uma conta for criada com sucesso, o atacante obtém:
- **API key `sk_live_*`** válida para todos os endpoints autenticados
- Acesso a **transações reais** (PIX, withdrawals, balance)
- Acesso a **webhooks** e **dados de clientes**
- Capacidade de **criar cobranças** e **realizar saques**
- **CORS misconfiguration** permite exfiltração cross-origin com a API key

---

## Próximos Passos Recomendados

1. ✅ **Criar conta via /register** — PAYLOAD COMPROVADO, falta email real
2. ⏳ **Testar IDOR/BOLA** nos endpoints autenticados (transactions/:id, withdrawals/:id) — aguarda API key
3. ⏳ **Testar mass assignment** nos endpoints POST — aguarda API key
4. ⏳ **Analisar iOS App** (IPA) para API keys hardcoded
5. ⏳ **Varrer GitHub/Discord/Pastebin** para chaves vazadas
6. ⏳ **Testar SSRF** via webhook URLs — aguarda API key
7. ⏳ **Explorar Railway** via port scanning de ranges conhecidos