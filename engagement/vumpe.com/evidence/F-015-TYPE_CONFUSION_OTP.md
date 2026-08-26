================================================================================
F-015: TYPE CONFUSION / DENIAL OF SERVICE via Non-String Token
================================================================================
Severidade: 🟡 MÉDIA — DoS parcial + indicação de lógica insegura
Status:    ✅ Confirmado
Fase:      exploit
Data:      2026-08-26

================================================================================
DESCRIÇÃO
================================================================================
O endpoint POST /api/auth/user espera um token string de 6 dígitos,
mas não valida o tipo antes de processar. Enviar tipos não-string
(boolean `true`, object `{}`, array `[]`) causa HTTP 500 com body
vazio (`content-length: 0`) — provável Null Pointer Exception ou
TypeError no servidor.

================================================================================
DETALHES TÉCNICOS
================================================================================

Endpoint: POST https://marcas.keoto.com/api/auth/user
Headers:  Content-Type: application/json

Payloads testados e resultados:

| Payload                | HTTP  | Body                          | Set-Cookie |
|------------------------|-------|-------------------------------|------------|
| {"token":"000000"}     | 401   | Token invalido                | ❌         |
| {"token":"true"}       | 400   | Token obrigatorio (falsy via type coercion?) | ❌ |
| {"token":true}         | 500   | 0 bytes (crash)               | ❌         |
| {"token":false}        | 400   | Token obrigatorio             | ❌         |
| {"token":0}            | 400   | Token obrigatorio             | ❌         |
| {"token":null}         | 400   | Token obrigatorio             | ❌         |
| {"token":{}}           | 500   | 0 bytes (crash)               | ❌         |
| {"token":[]}           | 500   | 0 bytes (crash)               | ❌         |

Header comum a todos: x-vercel-id, server: Vercel, x-matched-path: /api/auth/user

================================================================================
ANÁLISE
================================================================================

- `false`, `0`, `null` são tratados como "falsy" em JS antes da validação
  do tipo → "Token obrigatorio"
- `true` (truthy), `{}`, `[]` passam pelo check de truthy mas quebram no
  acesso ao método .length ou .match() (esperado em string) → crash
- NENHUM payload estabelece sessão (sem Set-Cookie, cookie jar vazio)
- O crash NÃO vaza info adicional — body retorna 0 bytes

================================================================================
IMPACTO
================================================================================

1. DoS parcial: enviar payloads não-string repetidamente causa HTTP 500,
   consumindo recursos do servidor
2. Indicador de código inseguro: a lógica não valida que `token` é string
   antes de chamar métodos de string
3. NÃO é bypass de autenticação — nenhuma sessão é criada

================================================================================
EVIDÊNCIA
================================================================================

$ proxychains4 curl -s -D- -X POST "https://marcas.keoto.com/api/auth/user" \
  -H "Content-Type: application/json" \
  -d '{"token":true}'

HTTP/2 500
cache-control: public, max-age=0, must-revalidate
date: Wed, 26 Aug 2026 04:58:26 GMT
...
content-length: 0

(no body, no Set-Cookie, empty cookie jar)

================================================================================
RECOMENDAÇÃO
================================================================================

Validar tipo do campo `token` como string antes de processar:
  if (typeof token !== 'string' || token.length !== 6) { return error; }

Se o servidor Next.js está em modo dev ou com error handling exposto,
tentar forçar stack trace via header Accept: text/html ou erro 500
com detalhes.

================================================================================