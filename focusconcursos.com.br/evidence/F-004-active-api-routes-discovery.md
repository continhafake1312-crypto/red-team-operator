# F-004 Active API Routes Discovery
Alvo: payment.focusconcursos.com.br (54.152.191.245 via AWS ELB)
Severidade: Alta
Timestamp: 2026-08-22T02:16:30Z

## Endpoints Ativos Descobertos

### API v1 Endpoints
| Método | Endpoint | Status | Descrição |
|--------|----------|--------|-----------|
| GET, POST | `/api/v1/transactions` | 500 (GET), 400 (POST) | CRUD de transações |
| GET, POST | `/api/v1/transactions/{id}` | 500 | Transação específica |
| GET, POST | `/api/v1/subscriptions` | 500 (GET), 400 (POST) | CRUD de assinaturas |
| GET, POST | `/api/v1/subscriptions/{id}` | 500 | Assinatura específica |
| GET, POST | `/api/v1/plans` | 500 (GET), 400 (POST) | CRUD de planos |
| GET, POST | `/api/v1/plans/{id}` | 500 | Plano específico |
| GET | `/index.php/api/v1/transactions` | 500 | Routing alternativo |
| GET | `/index.php/api/v1/transactions/search?q=` | 500 | Search endpoint |
| GET | `/index.php/api/v1/transactions/paginate?page=` | 500 | Pagination |

### Endpoints de Erro
| Método | Endpoint | Status | Descrição |
|--------|----------|--------|-----------|
| ANY | `/docs` | 500 | Symfony FatalErrorException |
| ANY | `/{health,status,_profiler/*,_wdt/*,_errors/*,login,logout,admin}` | 404 | Symfony NotFoundHttpException |

### Endpoints de Config
| Endpoint | Status | Tamanho | Conteúdo |
|----------|--------|---------|----------|
| `/.htaccess` | 200 | 553 bytes | Apache rewrite rules |
| `/web.config` | 200 | 914 bytes | IIS rewrite rules |
| `/robots.txt` | 200 | 24 bytes | `Disallow:` (vazio) |
| `/favicon.ico` | 200 | 0 bytes | Vazio |
| `/index.php` | 200 | 15 bytes | `{"status":"ok"}` |

## Framework Detection
- **Symfony Componentes**: `symfony/debug`, `symfony/http-kernel`
- **Laravel**: via `Prettus\Validator\Exceptions\ValidatorException`
- **Nginx**: server header
- **AWS ELB**: `server: awselb/2.0` em erro 405

## Impacto
- Superfície de ataque mapeada: 3 endpoints POST ativos
- Possibilidade de criar transações, assinaturas e planos
- Sem autenticação aparente nos endpoints
- Config files expostos confirmam stack PHP

## Recomendação
- Implementar autenticação em todos os endpoints
- Remover config files expostos (.htaccess, web.config)
- Desabilitar index.php routing
- Implementar rate limiting
- Mover docs rotas para ambiente interno