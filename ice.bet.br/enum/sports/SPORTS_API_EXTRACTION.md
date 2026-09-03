# Sports API Extraction — sports.ice.bet.br

**Data:** 2026-09-03  
**Proxy:** `http://201.20.42.46:3127`  
**Output directory:** `/home/ubuntu/red-team-operator/ice.bet.br/enum/sports/`

---

## 1. Endpoints Descobertos

| Endpoint | Método | Status | Descrição |
|----------|--------|--------|-----------|
| `/` | GET | ✅ 200 | `{"service":"sports-management","ok":true}` |
| `/sports` | GET | ✅ 200 | Lista de 25 esportes (3.3KB) |
| `/events` | GET | ✅ 200 | Eventos com odds, mercados, participantes |
| `/leagues` | GET | ✅ 200 | 504-530 ligas (92KB) |
| `/events?isLive=true` | GET | ✅ 200 | Filtro live — 10 events (180KB) |
| `/events?isLive=true&take=200` | GET | ✅ 200 | Live events: 100 events (837KB) |
| `/events?take=500` | GET | ✅ 200 | 100 eventos (4.3MB — cap automatico) |
| `/leagues?sportId=1` | GET | ✅ 200 | 276 ligas de futebol |
| `/leagues?sportId=2` | GET | ✅ 200 | 23 ligas de basquete |
| `/leagues?sportId=6` | GET | ✅ 200 | 63 ligas de tenis |
| `/sports/{id}` | GET | ❌ 404 | Nao ha endpoint individual |
| `/events/{id}` | GET | ❌ 404 | Nao ha endpoint individual |
| `/leagues/{id}` | GET | ❌ 404 | Nao ha endpoint individual |
| POST/PUT/DELETE/PATCH em qualquer endpoint | ❌ 404 | Read-only |
| `/graphql`, `/swagger.json`, `/openapi.json`, `/api-docs` | ❌ 404 | Nao existem |

---

## 2. Esportes (25)

| ID | Nome | Eventos Totais | Eventos Live |
|-----|------|----------------|---------------|
| 1 | Futebol | 1662 | 0 |
| 2 | Basquete | 112 | 0 |
| 3 | Futebol Americano | 87 | 0 |
| 6 | Tenis | 243 | 0 |
| 7 | Beisebol | 13 | 0 |
| 8 | Hoquei no gelo | 121 | 0 |
| 10 | Handebol | 96 | 0 |
| 11 | Liga de Rugby | 12 | 0 |
| 12 | Golfe | 1 | 0 |
| 13 | Sinuca & Bilhar | 2 | 0 |
| 14 | Automobilismo | 21 | 0 |
| 15 | Dardos | 34 | 0 |
| 16 | Ciclismo | 0 | 0 |
| 19 | Volei | 20 | 0 |
| 20 | Boxe | 84 | 0 |
| 26 | Tenis de mesa | 206 | 0 |
| 31 | Polo aquatico | 0 | 0 |
| 34 | Badminton | 6 | 0 |
| 35 | Rugby | 44 | 0 |
| 41 | Futebol Australiano | 2 | 0 |
| 43 | MMA | 74 | 0 |
| 59 | Cricket | 5 | 0 |
| 64 | E-Sports | — | — |
| 224 | Lacrosse | 2 | 0 |
| 239 | Tenis de Mesa B | 18 | 0 |
| esports | E-Sports | 45 | 0 |
| virtual-sports | Virtual Sports | — | — |

---

## 3. Eventos

### Estatisticas
- **Total disponivel (TotalCount):** 3599 eventos
- **Live (TotalCount):** 128 eventos
- **Max por request:** 100 eventos (limitacao interna — `take` aceita valores maiores mas cap em 100)

### Filtros que funcionam
| Parametro | Exemplo | Efeito |
|-----------|---------|--------|
| `isLive=true` | `/events?isLive=true` | Filtra apenas eventos ao vivo |
| `sportId=X` | `/events?sportId=1` | Filtra por esporte (apenas Futebol) |
| `isLive=true&sportId=X` | `/events?isLive=true&sportId=1` | Live + esporte especifico (22 live football) |
| `take=N` | `/events?take=50` | Controla quantidade (max 100) |

### Filtros que NAO funcionam
- `from=` / `page=` / `offset=` / `skip=` — ignorados (sempre top 100)
- `status=live` / `status=upcoming` — ignorados
- `LeagueId=X` — ignorado
- `date=` — ignorado
- `limit=` — ignorado

---

## 4. Ligas

- **Total:** 504-530 (variacao por req)
- **Filtro `sportId`:** Funciona! Ex: `/leagues?sportId=1` retorna 276 ligas
- **Filtro `take`:** Funciona mas maximo e o proprio total do esporte

### Distribuicao por Esporte (amostra)
| Esporte | ID | Ligas |
|---------|----|-------|
| Futebol | 1 | 276 |
| Basquete | 2 | 23 |
| Tenis | 6 | 63 |
| Volei | 19 | 11 |
| Beisebol | 7 | 4 |
| Tenis de Mesa B | 239 | 1 |
| E-Sports | esports | 0 |

---

## 5. Estrutura dos Dados

### Esporte (`/sports`)
```json
{"SportId": "1", "SportName": "Futebol", "SportOrder": 1,
 "EventCounts": {"Total": {"EventsTotalCount": 1662}, "Live": {"EventsTotalCount": 0}}}
```

### Liga (`/leagues`)
```json
{"LeagueId": "868120290461564928", "LeagueName": "Especiais do Dia",
 "LeagueOrder": 190000400, "SportId": "1", "RegionCode": "ZZ",
 "IsTopLeague": false, "EventCounts": {"Total": {"EventsTotalCount": 21}}}
```

### Evento (`/events`)
```json
{"_id": "883043016422731776", "IsLive": false, "IsSuspended": false,
 "IsTeamSwap": false, "IsTopLeague": false, "LeagueGroupId": "671813368474357761",
 "LeagueId": "868120290461564928", "LeagueOrder": 190000400,
 "LiveGameState": {"ClockRunning": false, "ClockDirection": 0, "GameTimeBFFGotAt": ...},
 "MarketGroups": ["Todos", "Especiais"], "MasterLeagueId": "...",
 "RegionCode": "ZZ", "Score": {"AwayScore": "", "HomeScore": ""},
 "SportId": "1", "SportOrder": 1, "StartEventDate": ..., "Status": ...,
 "Tags": [...], "TotalActiveMarketsCount": 84, "TotalMarketsCount": 86,
 "Type": "...", "EventName": "...", "BetslipLine": "...",
 "SportName": "Futebol", "RegionName": "...", "LeagueName": "...",
 "Participants": {...}, "IsEarlyPayout": false,
 "Markets": [{"MarketId": "...", ...}]}
```

### Market (dentro do evento)
```json
{"MarketId": "0HC880851332096192607",
 "Selections": [{"SelectionId": "...", "SelectionName": "...", "Price": 1.50, ...}]}
```

---

## 6. Vulnerabilidades Identificadas

### V-01: CORS Misconfiguration (Alta)
- **Endpoint:** `/events`, `/sports`, `/leagues`
- **Header:** `access-control-allow-origin: *`
- **Impact:** Qualquer site pode fazer requests cross-origin e ler dados da API.
  Permite exfiltracao de odds em tempo real por sites maliciosos.
- **Evidencia:**
  ```
  HTTP/2 200
  access-control-allow-origin: *
  access-control-allow-methods: GET,OPTIONS
  ```

### V-02: Mass Assignment / Information Disclosure via Query Params (Media)
- **Endpoint:** `/events?take=100`
- **Descricao:** API expoe todos os campos do evento, incluindo:
  - IDs internos (`_id`, `LeagueGroupId`, `MasterLeagueId`)
  - Dados de precificacao (`MarketId`, `Selections.Price`)
  - Timestamps internos (`LiveGameState.GameTimeBFFGotAt`)
- **Impact:** Informacoes internas de modelagem de dados expostas sem auth.

### V-03: No Rate Limiting / Mass Data Extraction (Media)
- **Endpoint:** `/events?take=100`
- **Descricao:** NAO ha limitacao de taxa no endpoint. Respostas de ate 4.3MB
  sao retornadas sem autenticacao.
- **Impact:** Possivel extrair dados do sistema inteiro com requests
  sequenciais (custo de banda para o provider).

### V-04: Cache Pública (Baixa)
- **Headers:** `cache-control: public, s-maxage=300, stale-while-revalidate=600`
- **Descricao:** Cache publico com stale-while-revalidate pode servir dados
  desatualizados.

### V-05: Missing Auth on All Endpoints (Info)
- Nenhum endpoint requer autenticacao — toda a base de odds e eventos e
  publica. Por design da aplicacao, mas relevante notar.

---

## 7. Arquivos Gerados

| Arquivo | Tamanho | Descricao |
|---------|---------|-----------|
| `root.json` | 41 B | `{"service":"sports-management","ok":true}` |
| `sports_full.json` | 3.3 KB | 25 esportes |
| `leagues_full.json` | 98 KB | 504+ ligas |
| `events_full.json` | 36 KB | 10 eventos (default) |
| `events_live_default.json` | 181 KB | 10 eventos live |
| `events_live.json` | 181 KB | Live events (isLive=true) |
| `events_live_all.json` | 837 KB | 100 live events |
| `events_live_football.json` | 181 KB | 10 live football events |
| `events_page0_100.json` | 4.3 MB | First 100 events |
| `SPORTS_API_EXTRACTION.md` | — | Este documento |

**Total armazenado:** ~9.9 MB

---

## 8. Conclusão

### Dados extraiveis
- **25 esportes** mapeados (incluindo E-Sports e Virtual Sports)
- **504+ ligas** filtraveis por esporte
- **3599 eventos** totais estimados
- **128 eventos ao vivo** no momento da extracao
- Mercados com odds para cada evento

### Informacoes de seguranca
1. **CORS aberto (`*`)** — risco de exfiltracao cross-site (V-01)
2. **Sem autenticacao** — toda a base de odds e publica
3. **Mass extraction** — possivel baixar todos os eventos sem rate limit
4. **Exposicao de IDs internos** — estrutura de dados do dominio vazada
5. **Sem SQLi/NoSQLi** — parametros de injecao foram ignorados/sanitizados
6. **Sem XSS** — nomes de eventos/ligas parecem sanitizados