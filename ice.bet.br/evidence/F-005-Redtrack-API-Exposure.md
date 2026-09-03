# F-005: Redtrack API — Swagger/OpenAPI Schema Exposto Publicamente

**Alvo:** `https://api.redtrack.io/v1/doc.json`
**Severidade:** 🔴 **CRÍTICA**
**Timestamp:** 2026-09-03T07:30:18Z

## Descoberta

A **Redtrack API** (plataforma de tracking de afiliados) está exposta publicamente com o **schema Swagger/OpenAPI completo** acessível sem qualquer autenticação.

## URLs

| URL | Status | Descrição |
|-----|--------|-----------|
| `https://api.redtrack.io/v1` | 200 | Swagger UI (página de documentação) |
| `https://api.redtrack.io/v1/doc.json` | 200 | Schema OpenAPI/Swagger completo (359KB) |
| `https://api.redtrack.io/v1/users` | 200 | Swagger UI (redireciona para docs) |
| `https://api.redtrack.io/v1/me` | 200 | Swagger UI (redireciona para docs) |
| `https://api.redtrack.io/campaigns` | 401 | Endpoint existe (requer `api_key`) |
| `https://api.redtrack.io/offers` | 401 | Endpoint existe (requer `api_key`) |

## Endpoints Expostos na Documentação

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/campaigns` | GET/POST | Campanhas de tracking (criar/listar) |
| `/campaigns/{id}` | GET/PUT/DELETE | Campanha individual |
| `/offers` | GET/POST | Ofertas (criar/listar) |
| `/offers/{id}` | GET/PUT/DELETE | Oferta individual |
| `/sources` | GET/POST | Fontes de tráfego |
| `/sources/{id}` | GET/PUT/DELETE | Fonte individual |
| `/landings` | GET | Landings pages |
| `/streams` | GET | Streams de tráfego |
| `/tracks` | GET | Tracking links |
| `/conversions` | GET | Conversões (dados financeiros!) |
| `/clicks` | GET | Cliques |
| `/report` | GET | Relatórios agregados |
| `/domains` | GET | Domínios de tracking |
| `/scripts` | GET | Scripts de tracking |
| `/networks` | GET | Redes de afiliados |
| `/countries`/`/cities`/`/regions` | GET | Geolocalização |
| `/browsers`/`/devices`/`/os` | GET | UA parsing |
| `/currencies`/`/languages`/`/timezones` | GET | Dicionários |
| `/categories`/`/isp`/`/connection_types`/`/proxy_types` | GET | Segmentação |

## Infraestrutura

- **Proxy:** Kong API Gateway 3.7.1 (`via: kong/3.7.1`)
- **Autenticação:** Query parameter `api_key` na maioria dos endpoints
- **Host:** `api.redtrack.io` (Kong upstream)

## Autenticação

Todos os endpoints de dados requerem um `api_key` passado como query parameter. Exemplo:
```
GET /campaigns?api_key=KEY_HERE
```

## Reprodução

```bash
# Acessar Swagger UI
$ curl -s https://api.redtrack.io/v1 | grep -oP 'url:\s*"[^"]+"'
url: "doc.json"

# Baixar schema completo
$ curl -s https://api.redtrack.io/v1/doc.json | jq '.info.title'
"Redtrack API"

# Listar endpoints
$ curl -s https://api.redtrack.io/v1/doc.json | jq '.paths | keys[]'
"/campaigns"
"/offers"
"/sources"
...
```

## Impacto

🔴 **CRÍTICO**
- Schema completo da API exposto permite mapeamento total da superfície de ataque
- Dados financeiros (conversões, receitas) documentados no schema
- 401 nos endpoints indica que a API está ativa mas requer autenticação
- Se uma `api_key` for obtida, TODOS os dados de tracking (campanhas, ofertas, afiliados, conversões) podem ser extraídos
- A plataforma Redtrack gerencia tracking de afiliados para iGaming, contendo dados financeiros sensíveis

## Próximo passo

- Buscar por `api_key` hardcoded em JS bundles, repositórios públicos, ou na aplicação
- Tentar brute force de api_key fraca/comum
- Verificar se há autenticação alternativa (JWT, Basic Auth)
- Testar endpoints de dicionário (/countries, /browsers) sem api_key
- Verificar se o Kong Admin API está exposto internamente