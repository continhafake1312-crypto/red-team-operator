# F-002 — Citizen Gateway API Exposta (Node.js Cluster 189.9.0.79)

**Severidade:** 🟡 Média  
**Host:** cidadao2.sinesp.gov.br (189.9.0.79)  
**Endpoint:** https://cidadao2.sinesp.gov.br/api/v1/  
**Data:** 2026-09-06  

## Descrição

O gateway da API do cidadão (`citizen-gateway`) está exposto e responde sem autenticação no endpoint `/api/v1/`, retornando informações sobre o gateway.

## Resposta
```json
{
  "gateway": "citizen-gateway",
  "status": "It works! 🔪💀",
  "version": "0.5.10",
  "env": "okdprod"
}
```

## Headers expostos
- `Server: nginx/1.20.1`
- `Set-Cookie: 548993c9f6b17214b9881563f31239c4=...; HttpOnly`
- `trace-id: 800613992faf874d`
- `Request-Id: cfb88aa0-041f-48cd-8589-c97e0a22602e`

## Rotas descobertas no Umi.js (aplicação frontend)
Do arquivo `umi.b115d8ab.js`:

### `/procurados` (Procurados/Pessoas procuradas)
- `/procurados` — Lista de procurados
- `/procurados/:wantedId` — Detalhes de um procurado
- `/procurados/:wantedId/historico` — Histórico
- `/procurados/:wantedId/historico/:historyId` — Detalhe do histórico
- `/procurados/:wantedId/historico/adicionar` — Adicionar ao histórico
- `/procurados/:wantedId/mandados` — Mandados
- `/procurados/:wantedId/mandados/:warrantId` — Detalhe do mandado
- `/procurados/:wantedId/mandados/adicionar` — Adicionar mandado
- `/procurados/:wantedId/noticias` — Notícias
- `/procurados/:wantedId/noticias/:newsId` — Detalhe da notícia
- `/procurados/:wantedId/noticias/adicionar` — Adicionar notícia
- `/procurados/adicionar` — Adicionar procurado

### Informações de desenvolvimento
Path interno exposto:
```
/home/lailson/Homeoffice/sinesp-cidadao-webapp/
```
Isto revela o desenvolvedor (`lailson`) e o caminho de projeto local.

## Comando usado
```bash
curl -s -k -H "Host: cidadao2.sinesp.gov.br" https://189.9.0.79/api/v1/
curl -s -k -H "Host: cidadao2.sinesp.gov.br" https://189.9.0.79/umi.b115d8ab.js | grep -oP 'path:\s*["'"'"'][^"'"'"']*["'"'"']'
```

## Impacto
- A API `/api/v1/` confirma o ambiente `okdprod` (OpenShift/Kubernetes em produção)
- As rotas `/procurados` expõem a estrutura completa de dados de pessoas procuradas (mandados, histórico, notícias)
- O nome do desenvolvedor e caminho local (`lailson`) podem ser usados em ataques de engenharia social ou password spraying
- **Recomendação**: Colocar autenticação no gateway API, remover informações de debug, e revisar a exposição de dados de procurados

## Próximos passos
- [ ] Testar IDOR em `/procurados/:wantedId` (tentar acessar sem auth)
- [ ] Testar injeção em parâmetros das rotas
- [ ] Verificar se `/api/v1/` tem outros endpoints (swagger, docs, graphql)