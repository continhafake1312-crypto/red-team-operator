# F-003 API Schema Disclosure via Validator Error Messages
Alvo: payment.focusconcursos.com.br (54.152.191.245 via AWS ELB)
Severidade: Alta
Timestamp: 2026-08-22T02:16:31Z

## Reprodução
POST request vazio para o endpoint de transações:
```bash
proxychains4 curl -i -X POST -H "Content-Type: application/json" -d '{}' \
  https://payment.focusconcursos.com.br/api/v1/transactions
```

## Output
```json
HTTP/2 400
{
  "type":"user_data",
  "exception":"Prettus\\Validator\\Exceptions\\ValidatorException",
  "message":{
    "amount":["Valor é obrigatório."],
    "payment_method":["Meio de pagamento é obrigatório."],
    "customer":["customer é obrigatório."],
    "customer.id":["ID do aluno é obrigatório."],
    "customer.name":["Nome é obrigatório."],
    "customer.email":["customer.email é obrigatório."],
    "customer.phone":["Telefone/Celular é obrigatório."],
    "customer.document":["CPF é obrigatório."],
    "address.street_name":["address.street name é obrigatório."],
    "address.street_number":["address.street number é obrigatório."],
    "address.neighborhood":["address.neighborhood é obrigatório."],
    "address.zipcode":["address.zipcode é obrigatório."],
    "address.city":["address.city é obrigatório."],
    "address.federal_unit":["address.federal unit é obrigatório."],
    "items":["items é obrigatório."]
  }
}
```

## Endpoints e Schemas Descobertos

### POST /api/v1/transactions
| Campo | Tipo | Descrição |
|-------|------|-----------|
| amount | number | Valor da transação |
| payment_method | string | credit_card, boleto, pix |
| installments | number | Nr de parcelas (requerido para credit_card) |
| card_hash | string | Hash do cartão (requerido para credit_card) |
| customer.id | number | ID do aluno |
| customer.name | string | Nome do cliente |
| customer.email | string | Email do cliente |
| customer.phone | string | Telefone/Celular |
| customer.document | string | CPF |
| address.street_name | string | Logradouro |
| address.street_number | string | Número |
| address.neighborhood | string | Bairro |
| address.zipcode | string | CEP |
| address.city | string | Cidade |
| address.federal_unit | string | UF |
| items[].product_id | string | ID do produto |
| items[].name | string | Nome do produto |
| items[].amount | number | Valor |
| items[].price | number | Preço |
| items[].quantity | number | Quantidade |

### POST /api/v1/subscriptions
| Campo | Descrição |
|-------|-----------|
| payment_method | Meio de pagamento |
| customer | Objeto customer (mesmo schema) |
| address | Objeto address (mesmo schema) |
| plan_id | ID do plano (quando payment_method=credit_card) |
| metadata | Dados adicionais (obrigatório) |

### POST /api/v1/plans
| Campo | Descrição |
|-------|-----------|
| amount | Valor |
| days | Período de recorrência em dias |
| name | Nome do plano |
| installments | Quantidade de parcelas |

## Impacto
- **CRÍTICO**: Schema completo da API de pagamentos exposto
- **CRÍTICO**: IDs de alunos expostos via campo `customer.id`
- Validação server-side revela estrutura completa de dados
- Permite crafting de requests maliciosos com conhecimento da estrutura interna
- Informações sobre meios de pagamento aceitos (credit_card, boleto)

## Recomendação
- Retornar mensagens de erro genéricas (ex: "Dados inválidos")
- Não expor campos de validação individuais
- Implementar rate limiting no endpoint
- Validar autenticação antes da validação dos dados

## Próximo passo
- Tentar criar transações reais
- Testar IDOR enumerando IDs de transações
- Testar mass assignment com campos extras
- Verificar se há autenticação requerida