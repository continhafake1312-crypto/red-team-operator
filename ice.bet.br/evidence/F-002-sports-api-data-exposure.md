# F-002 Sports API — Unauthenticated Data Exposure + IDOR Candidates
**Alvo:** `sports.ice.bet.br`
**Severidade:** Alta
**Timestamp:** 2026-09-03T06:53:00Z

## Reprodução
A API REST de esportes está completamente acessível sem autenticação:

```bash
# Endpoints públicos
curl -s https://sports.ice.bet.br/sports     # 200 - 3.3KB
curl -s https://sports.ice.bet.br/events     # 200 - 36KB
curl -s https://sports.ice.bet.br/leagues    # 200 - 92KB

# Base
curl -s https://sports.ice.bet.br/           # 200 - {"service":"sports-management","ok":true}
```

## Output — Dados Extraídos
```json
// sports.json — 23 categorias, 3029 eventos totais
{
  "Sports": [
    { "SportId": "1", "SportName": "Futebol", "EventCounts": { "Total": { "EventsTotalCount": 1554 } } },
    { "SportId": "2", "SportName": "Basquete", "EventCounts": { "Total": { "EventsTotalCount": 109 } } },
    { "SportId": "6", "SportName": "Tênis", "EventCounts": { "Total": { "EventsTotalCount": 314 } } },
    { "SportId": "19", "SportName": "Vôlei", "EventCounts": { "Total": { "EventsTotalCount": 16 } } },
    { "SportId": "3", "SportName": "Futebol Americano", "EventCounts": { "Total": { "EventsTotalCount": 87 } } },
    { "SportId": "esports", "SportName": "E-Sports", "EventCounts": { "Total": { "EventsTotalCount": 55 } } },
    ... (23 sports)
  ]
}

// events.json — 10 eventos retornados, 3029 total
{ "Events": [...], "TotalCount": 3029 }
// Cada evento contém: _id, EventName, SportId, SportName, LeagueId, LeagueName,
// RegionCode, Markets, Selections, Odds, Status, etc.

// leagues.json — 474 ligas
{ "Leagues": [474 items], "TotalCount": 474 }
// Ex: Brasileirão Série A, Premier League, Copa Libertadores, etc.
```

### IDOR Test — Endpoints Individuais
```bash
/sports/{id} -> 404 (todos)
/leagues/{id} -> 404 (todos)
/events/{id} -> 404 (todos)
```
IDs são strings longas (ex: `883043016422731776`), não sequenciais simples.

### SQLi Test — Bloqueados por WAF
```bash
/events?name=1' OR '1'='1 -> 000 (connection dropped - WAF)
```

### HTTP Method Tampering
```bash
POST  /events -> 404
PUT   /events -> 404
PATCH /events -> 404
DELETE/events -> 404
```

## Interpretação
- **Exposição completa de dados**: todos os eventos esportivos, mercados, odds, ligas, times — sem autenticação
- **3029 eventos no total**, 23 esportes, 474 ligas
- Dados incluem mercados de apostas, odds (formato Decimal/Americano/Fractional/HK/Malay/Indo), status, scores
- **IDs não-sequenciais** (ex: `883043016422731776`) mitigam IDOR simples mas não impedem enumeração via `/events?sportId=X`
- **WAF** bloqueia SQLi (conexão dropada)
- **Sem proteção de rate-limit** aparente

## Impacto
- Concorrentes podem extrair todos os mercados, odds e eventos em tempo real
- Informações sobre ligas, times e participantes expostas sem restrição
- Potencial para scraping massivo de odds para arbitragem

## Próximo passo
- Extrair dados paginados de eventos: `/events?page=2&limit=50`
- Verificar se existe `/events/:id/markets` ou `/events/:id/odds`
- Testar rate-limit real com scraping contínuo