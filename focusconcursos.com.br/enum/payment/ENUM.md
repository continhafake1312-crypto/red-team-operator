# Enumeração - payment.focusconcursos.com.br

## Info
- **URL**: https://payment.focusconcursos.com.br/
- **Server**: Nginx
- **Stack**: Laravel (PHP) com Prettus Repository Pattern
- **Status**: `{"status":"ok"}` na raiz (health check)

---

## Endpoints de API Descobertos

### 🟢 CRÍTICO - API Transaction exposta
| Endpoint | Método | Status | Resposta |
|----------|--------|--------|----------|
| `POST /api/v1/transactions` | POST | 400 | **Validator leak - schema completo exposto!** |
| `GET /api/v1/transactions` | GET | 500 | ErrorException (rota existe) |
| `GET /api/v1/transactions/1` | GET | 500 | ErrorException (rota existe) |
| `GET /api/v1/transactions/2` | GET | 500 | ErrorException |
| `GET /api/v1/transactions/1000` | GET | 500 | ErrorException |
| `PUT /api/v1/transactions/1` | PUT | 405 | Method Not Allowed (rota existe) |
| `PATCH /api/v1/transactions/1` | PATCH | 405 | Method Not Allowed (rota existe) |
| `PUT /api/v1/transactions/1/refund` | PUT | 405 | Method Not Allowed (rota existe) |
| `GET /api/v1/transactions/create` | GET | 500 | ErrorException (rota existe) |
| `GET /api/v1/transactions/store` | GET | 500 | ErrorException (rota existe) |
| `GET /api/v1/transactions/list` | GET | 500 | ErrorException (rota existe) |
| `GET /api/v1/transactions/` | GET | 500 | ErrorException (trailing slash) |

### 🟢 Outros Endpoints
| Endpoint | Método | Status | Resposta |
|----------|--------|--------|----------|
| `GET /api/v1/plans` | GET | 500 | ErrorException (rota existe) |
| `GET /api/v1/subscriptions` | GET | 500 | ErrorException (rota existe) |

### 🟡 Públicos
| Endpoint | Método | Status | Resposta |
|----------|--------|--------|----------|
| `/` | GET | 200 | `{"status":"ok"}` |
| `/.htaccess` | GET | 200 | Laravel .htaccess exposto |
| `/.gitignore` | GET | 200 | `.gitignore` exposto |
| `/robots.txt` | GET | 200 | `User-agent: *\nDisallow:` |

### ❌ API Docs (Não encontrados)
- `/docs` - 404
- `/swagger` - 404
- `/openapi.json` - 404
- `/swagger-ui` - 404
- `/api/documentation` - 404

---

## 🔥 DESCOBERTA CRÍTICA: Schema da API de Transações

A validação do **POST /api/v1/transactions** retorna erros de validação que EXPÕEM o schema completo:

```json
{
  "amount": ["Valor é obrigatório."],
  "payment_method": ["Meio de pagamento é obrigatório."],
  "customer": ["customer é obrigatório."],
  "customer.id": ["ID do aluno é obrigatório."],
  "customer.name": ["Nome é obrigatório."],
  "customer.email": ["customer.email é obrigatório."],
  "customer.phone": ["Telefone/Celular é obrigatório."],
  "customer.document": ["CPF é obrigatório."],
  "address.street_name": ["address.street name é obrigatório."],
  "address.street_number": ["address.street number é obrigatório."],
  "address.neighborhood": ["address.neighborhood é obrigatório."],
  "address.zipcode": ["address.zipcode é obrigatório."],
  "address.city": ["address.city é obrigatório."],
  "address.federal_unit": ["address.federal unit é obrigatório."],
  "items": ["items é obrigatório."]
}
```

### Quando payment_method = "credit_card" (adicional):
```json
{
  "installments": ["Nr de parcelas é obrigatório"],
  "card_hash": ["card hash é obrigatório"],
  "items.0.product_id": ["product_id é obrigatório"],
  "items.0.name": ["name é obrigatório"],
  "items.0.price": ["price é obrigatório"]
}
```

### Observações
- `payment_method` pode ser "pix" (não pede parcelas/card_hash)
- Usa `Prettus\Validator\Exceptions\ValidatorException` (Laravel)
- API aceita POST **sem autenticação** (sem token Bearer)
- HTTP 400 na validação, não 401

---

## Análise de Métodos HTTP

| Endpoint | OPTIONS | GET | POST | PUT | PATCH | DELETE |
|----------|---------|-----|------|-----|-------|--------|
| `/api/v1/transactions` | 404 | 500 | 400 | - | - | - |
| `/api/v1/transactions/1` | - | 500 | - | 405 | 405 | - |
| `/api/v1/transactions/1/refund` | - | - | - | 405 | - | - |

---

## Arquivos Expostos

### `.htaccess` - Laravel Rewrite Rules
- Expõe configuração completa de rewrite (padrão Laravel)
- Confirma PHP + Laravel

### `.gitignore` - Arquivos ignorados
```gitignore
*
*/
!.gitignore
!.htaccess
!index.php
!robots.txt
!web.config
```
- Confirma que `.env` NÃO está exposto via web (protegido pelo .htaccess)

### `robots.txt`
- `Disallow:` - Permite tudo (padrão)

---

## Recomendações Imediatas

### 🔴 Crítico
1. **POST /api/v1/transactions sem autenticação** - API sem proteção de autenticação, permite criar transações financeiras sem token
2. **Information Disclosure via Validator** - Schema completo da transação exposto via erros de validação
3. **GET endpoints retornando 500 (ErrorException)** - Debug info pode revelar detalhes em ambiente de produção

### 🟡 Médio
4. **.htaccess exposto** - Informação de configuração do servidor
5. **.gitignore exposto** - Confirma estrutura do projeto Laravel
6. **CORS aberto** - Access-Control-Allow-Origin: * em alguns endpoints

### 🟢 Baixo
7. **robots.txt público** - Permissivo (mas padrão)

### Próximos Passos
1. Tentar criar transação real com dados válidos
2. Testar Mass Assignment (enviar campos extras como `is_admin`, `role`)
3. Testar IDOR em transações (GET /api/v1/transactions/{id} com diferentes IDs)
4. Tentar SQLi/NoSQLi nos campos de validação
5. Fuzzing de parâmetros na query string
6. Testar `/api/v1/users/me`, `/api/v1/auth/login` com dados válidos
7. Verificar se GET /api/v1/plans funciona com token de autenticação