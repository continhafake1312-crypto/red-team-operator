# F-003 API Tenant — Tenant Header Discovered (X-Tenant-ID)
**Alvo:** `api.ice.bet.br`, `slots.ice.bet.br`
**Severidade:** Média
**Timestamp:** 2026-09-03T06:53:00Z

## Reprodução
```bash
# Sem tenant header — HTTP 400
curl -s https://api.ice.bet.br/
# Resposta: {"statusCode":400,"error":"Bad Request","message":"Tenant identification is required"}

# Com X-Tenant-ID: ice — HTTP 404
curl -s -H "X-Tenant-ID: ice" https://api.ice.bet.br/
# Resposta: {"message":"Cannot GET /","error":"Not Found","statusCode":404}

# Health check com tenant — HTTP 200 (vazio)
curl -s -H "X-Tenant-ID: ice" https://api.ice.bet.br/health

# V1 endpoint com tenant — HTTP 200 (vazio)
curl -s -H "X-Tenant-ID: ice" https://api.ice.bet.br/v1
```

### Headers testados — NENHUM retornou 200 (com conteúdo)
- Usando `X-Tenant-ID` com valores `ice`, `icebet`, `oig`, `default`, `public`, `web`, `test`, `admin`, `sports`, `slots`, `blog` — todos 404
- Usando outros headers (`X-Tenant`, `Tenant`, `Tenant-ID`, `X-Organization`, etc.) — todos 400

### Slots API
```bash
curl -s -H "X-Tenant-ID: ice" https://slots.ice.bet.br/
# Resposta: {"message":"Cannot GET /","error":"Not Found","statusCode":404}
```

## Interpretação
- **O header `X-Tenant-ID` é o formato correto** — sem ele, retorna 400 "Tenant identification is required"; com ele, retorna 404 "Cannot GET /" (reconhecido mas sem rota)
- O valor `ice` foi aceito sintaticamente, indicando que qualquer string pode ser válida como tenant ID
- A API reconhece o tenant mas **não expõe endpoints de descoberta** — todos os endpoints comuns retornam 404
- `/health` e `/v1` retornam 200 vazio confirmando que o tenant funciona
- A API pode estar configurada em modo multi-tenant onde o tenant ID precisa corresponder a um cliente específico

## Impacto
- Usuários maliciosos podem descobrir o formato do tenant header via brute force (400 vs 404)
- Se o tenant ID correto for descoberto (ex: via vazamento ou enumeração), toda a API fica acessível
- A API pode conter dados sensíveis de clientes/transações

## Próximo passo
- Fuzz de valores de tenant via wordlist (nomes de clientes, parceiros, países)
- Investigar se há diferença entre respostas 404 para diferentes valores de tenant
- Testar `/v1/*` endpoints com o tenant header