# Enumeração Profunda — sharpify.com.br

**Data**: 2026-08-20T05:50:00Z
**Status**: COMPLETE

## 1. Endpoints Extraídos da Documentação

**Total**: 57 endpoints documentados (20 privados + 30 públicos + 7 gateway)

### Categorias
| Categoria | Privados | Públicos | Gateway |
|-----------|----------|----------|---------|
| Catálogo | 12 | 4 | - |
| Checkout | 4 | 10 | - |
| Gestão Financeira | 2 | - | - |
| Webhook | 2 | - | - |
| Loja e Autenticação | - | 6 | - |
| Preços e Afiliados | - | 7 | - |
| E-commerce | - | 2 | - |
| Serviços | - | 1 | - |
| Gateway Pagamento | - | - | 7 |

### Auth Schema
- `x-sharpify-client-id` (obrigatório endpoints privados)
- `x-sharpify-client-secret` (obrigatório endpoints privados)
- `x-access-token` (autenticação de sessão)
- `customer-access-token` (cookie/header de cliente)
- Permissões RBAC: CATALOG_PRODUCT_LIST, CHECKOUT_ORDER_READ, etc.

## 2. Endpoints Testados

### Endpoints Públicos (sem auth — HTTP 200)
| Endpoint | Resposta |
|----------|----------|
| `GET /api/v1/catalog/product/list-products` | `{"products":[],"lastPage":1,...}` (banco vazio) |
| `GET /api/v1/commom-services/roblox/users/{username}` | Dados do usuário Roblox (ID, avatar, displayName) |

### Endpoints com Erro Específico (HTTP 400)
| Endpoint | Erro |
|----------|------|
| `GET /api/v1/checkout/payment-link/get?paymentLinkId=val` | `PaymentLinkNotFoundError` |
| `GET /api/v1/catalog/product/get-product?productId=val` | `ProductNotFoundError` |
| `GET /api/v1/checkout/order/get-order?orderId=val` | `OrderNotFoundError` |

### Endpoints que Requerem Auth (HTTP 401)
| Endpoint | Resposta |
|----------|----------|
| `GET /api/v1/catalog/product/list` | 401 |
| `GET /api/v1/management/withdrawal/data` | 401 |
| `GET /api/v1/checkout/order/list-my-orders` | 401 |
| `GET /api/v1/management/auth/session/current-session` | 401 |
| `POST /api/v1/catalog/product/create` | 401 |
| `POST /api/v1/checkout/payment-link/create` | 401 |

### Não Encontrados (HTTP 404)
- `/api/v1/pricing/coupon/validate-coupon`
- `/api/v1/management/auth/default/send-verification-code-to-email`
- `/api/v1/e-commerce/analytics/session/create-session`

## 3. Análise de Vulnerabilidades Preliminar

### NoSQLi/SQLi Testados
- Testados payloads em `paymentLinkId`, `productId`, `orderId`
- Comportamento consistente (mesmo erro para payloads normais)
- Payloads JSON/objects causam timeout (000)
- **Provável**: parâmetros são string escapadas ou validadas como UUID/ObjectId

### IDOR/BOLA Candidates
- `paymentLinkId` — enumerável, mas não retorna dados sem auth
- `productId` — enumerável
- `orderId` — enumerável
- `GET /api/v1/management/withdrawal/data` — pode expor dados financeiros
- `GET /api/v1/gateway/payment/get-payment?paymentLinkId=VAL` — gateway

### CORS
- API retorna `Access-Control-Allow-Origin: *` (permissivo)
- Headers expostos: `games-admin-token`, `2fa-temporary-token`

## 4. Schemas TypeScript Extraídos
- StoreProps, ProductProps, ProductItemProps, CategoryProps
- OrderProps, PaymentLinkProps, PaymentLinkPayment
- UserProps, AffiliateOrderProps, AffiliateWithdrawProps
- CouponProps, FeedbackProps, LiveChatMessageProps
- GatewayCreatePaymentInput, GatewayRefundInput
- ProductViewType, ProductVisibilityType, ProductStockType
- **GatewayMethod**: PIX, EFI_PAY_PREFERENCE, STRIPE_PREFERENCE, CUSTOMER_BALANCE, LITECOIN

## 5. Próximos Passos (Ataque Webapp)
1. **Auth bypass**: Testar registro de usuário, criação de sessão, endpoints auth
2. **IDOR**: Enumerar IDs em endpoints públicos com erro específico
3. **SSRF**: Verificar se há parâmetros de URL/webhook que aceitem URL externa
4. **Mass Assignment**: Enviar campos `role`, `isAdmin`, `permissions` em POST
5. **Gateway Payment**: Tentar criar pagamento sem auth ou com parâmetros mínimos
6. **Webhook endpoints**: Tentar POST em webhook com payload arbitrário
7. **Rate limiting**: Testar brute force em login/registro
8. **JWT**: Se usar tokens, testar `none` algorithm, weak secret