# WebApp Pentest Results — 2026-08-23 (Round 2)

## Resumo

| Vetor | Status | Resultado |
|-------|--------|-----------|
| Auth: /auth/register | ❌ Fechado | FORBIDDEN/NOT_FOUND |
| Auth: /auth/login | 🔴 Captcha barrier | FORBIDDEN (requer Turnstile) |
| Auth: /auth/email | 🔴 Captcha barrier | INVALID_CAPTCHA |
| Auth: /auth/me | 🔴 Precisa token | FORBIDDEN (sem auth), NOT_FOUND (token inválido) |
| Auth: /auth/password/request-reset | ❌ Fechado | FORBIDDEN |
| Storefront: /public/storefront/storm | ✅ Público | Dados completos da loja visíveis |
| Storefront: /public/storefront/storm/carts | ❌ Auth required | GUEST_DISABLED (código JS confirma) |
| Storefront: /public/storefront/storm/orders/{id} | ❌ Auth required | FORBIDDEN |
| Storefront: Discord OAuth | ⚠️ Funcional | 302 redirect → discord.com/oauth2/authorize |
| Webhook: /apps/{id}/webhooks/outbound | ❌ Não acessível | NOT_FOUND |
| Webhook: /apps/{id}/webhooks/outbound/secret | ❌ Auth required | FORBIDDEN |
| Admin: /apps/{id}/storefront | ❌ Auth required | FORBIDDEN (ID 4 diferente) |
| NoSQLi (auth endpoints) | ❌ Todos FORBIDDEN | 12 payloads testados |
| Turnstile bypass (headless) | ❌ Bloqueado | erro 110200 (bot detectado) |
| Cred-stuffing | ❌ FORBIDDEN genérico | Captcha barrier impede confirmação |

## Descobertas

### 🔴 Alta
1. **Storefront público expõe dados completos** — 31 produtos com preço/estoque, 12 painéis, categorias, método de pagamento (crypto), redes sociais. `require_login: false` confirma intenção pública.
2. **Discord OAuth client_id exposto** — `1376624710002937856` com redirect para `mng.stormapplications.com/api/login`. Possível ataque de client_secret brute force ou authorization code interception.
3. **Auth flow mapeado** — email → Turnstile captcha → code verification → storm_token. Discord OAuth como alternativa.

### 🟡 Média
4. **Turnstile site key obtida** — `0x4AAAAAACKSTFyIPdWMxVoP`. Headless browsers bloqueados (err 110200). Bypass requer serviço de captcha solving ou fingerprint real.
5. **App ID 4 identificado como válido** — Resposta diferente dos demais IDs. Potencial admin storefront.
6. **Headers de debug vazados** — `x-aws-instance-id`, `x-aws-region`, `x-powered-by: discloud.com`, CORS com headers customizados.

## Itens de Loot

- **storm_token**: ❌ NÃO OBTIDO
- **Turnstile site key**: ✅ `0x4AAAAAACKSTFyIPdWMxVoP`
- **Discord client_id**: ✅ `1376624710002937856`
- **Storefront slug válido**: ✅ `storm`
- **App ID candidate**: ✅ `4`
- **AWS instance**: ✅ `i-028e90aad8ec2bb5f` (eu-central-1)

## Recomendações para Próximos Passos

1. **Obter storm_token** via:
   - 2Captcha para resolver Turnstile → /auth/email → /auth/email/verify
   - Discord OAuth com conta real (precisa de browser + usuário Discord)
   - Se token obtido: testar IDOR em carts, orders, admin storefront

2. **Com token, testar**:
   - `/apps/4/storefront` — admin storefront
   - `/apps/4/webhooks/outbound` — webhook SSRF
   - `/auth/me` — próprio perfil
   - `/public/storefront/me/orders` — pedidos
   - IDOR em carts (sequencial ObjectId)
   - Cred-stuffing nos /auth/login

3. **Discord OAuth attack**:
   - Tentar client_secret genérico / comum
   - Se houver authorization code interceptável via mng redirect

4. **Mapear wallet.stormapplications.com**:
   - Wallet API key necessária para acesso