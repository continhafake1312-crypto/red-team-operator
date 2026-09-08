# Enumeração - integration.focusconcursos.com.br

## Info
- **URL**: https://integration.focusconcursos.com.br/
- **Server**: Nginx
- **Stack**: Laravel (PHP) com Sanctum Auth
- **Status**: `{"status":"ok"}` na raiz (health check)

---

## Endpoints Descobertos

### Públicos
| Endpoint | Método | Status | Resposta |
|----------|--------|--------|----------|
| `/` | GET | 200 | `{"status":"ok"}` - Laravel API Health |
| `/sanctum/csrf-cookie` | GET | 204 | Seta cookies XSRF-TOKEN + laravel_session |
| `/.htaccess` | GET | 200 | Laravel .htaccess exposto (config rewrite) |
| `/robots.txt` | GET | 200 | `User-agent: *\nDisallow:` |

### Laravel Debug Paths (Todos 404)
- `/_debugbar/` - 404
- `/_ignition/` - 404
- `/telescope/` - 404
- `/routes` - 404
- `/clockwork` - 404

### API Paths Testados (Todos 404)
- `/api/`, `/api/v1/`, `/api/v1/users`, `/v1/`, `/api/user`, `/health`, `/status`, `/.env`
- Extensivos testes de API paths comuns: todos 404 (Laravel route não definida)

### Content Discovery
- `.htaccess` - encontrado (exposto)
- Wordlist SecLists common.txt e api/* - sem hits adicionais (todos 404)

---

## Cookies (Laravel Sanctum)
- `XSRF-TOKEN`: Token CSRF (protegido, HttpOnly não setado)
- `laravel_session`: Session ID (HttpOnly, SameSite=lax)
- Access-Control-Allow-Origin: *

---

## Análise de Métodos HTTP
- OPTIONS `/api/` - 404 (mas retorna `access-control-allow-origin: *` e `vary: Access-Control-Request-Method`)
- OPTIONS `/api/v1/` - 404 (com headers CORS)
- PUT/DELETE/PATCH `/api/v1/users/1` - 404 (rota não existe)

---

## API Schema
Não foi possível determinar schema pois rotas retornam 404. Provavelmente usa prefixo diferente de `/api/v1` ou as rotas são definidas apenas para consumo interno.

---

## Recomendações

1. **.htaccess exposto** - Risco baixo, mas expõe configuração do rewrite do Laravel
2. **robots.txt** - Permite rastreamento de tudo (Disallow: vazio)
3. **Sanctum CSRF ativo** - CSRF cookie liberado sem autenticação
4. **Headers CORS** - `Access-Control-Allow-Origin: *` habilita CORS aberto
5. **Aparentemente API não expõe endpoints REST** - Pode usar GraphQL ou estar configurada apenas para consumo interno/integration com outros serviços
6. **Próximo passo**: Testar GraphQL (`/graphql`), testar parâmetros query, testar métodos POST com payload