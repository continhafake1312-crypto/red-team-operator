# F-017: GitHub OSINT - Descobertas de Repositórios e Pacotes

## Severidade: 🔴 ALTO

## Descrição
Pesquisa OSINT em GitHub, NPM e repositórios públicos revelou informações sobre a infraestrutura do RedTrack e ice.bet.br.

## Descobertas

### 1. mcp-redtrack - MCP Server para RedTrack API
**Pacote NPM**: `mcp-redtrack` v0.2.0
**Repositório**: `github.com/pijusz/mcp-redtrack`
**Código Fonte**: Baixado e analisado
**License**: MIT

#### API Base URL: `https://api.redtrack.io`
Confirmado no código fonte:
```typescript
// src/services/redtrack-api.ts
var BASE_URL = "https://api.redtrack.io";
```

#### Ferramentas Expostas (14)
| Tool | Description |
|------|-------------|
| `get_campaigns` | List campaigns with filtering |
| `get_campaign` | Get single campaign by ID |
| `get_campaigns_v2` | List campaigns via v2 endpoint |
| `get_clicks` | Click-level log with IP, country, device (max 10k/page) |
| `get_conversions` | Conversion log with payout, cost, revenue (max 10k/page) |
| `get_report` | Aggregated stats grouped by dimension |
| `get_offers` | List offers with filtering |
| `get_offer` | Single offer by ID |
| `get_sources` | List traffic sources |
| `get_source` | Single source by ID |
| `get_networks` | List affiliate networks |
| `get_landings` | List landing pages |
| `get_settings` | Account settings (timezone, currency, conversion types) |

#### Requer: `REDTRACK_API_KEY` (environment variable)

### 2. Configuração do Uniclick Tracking
Encontrado no HTML do frontend:
```javascript
https://att.trk.agency/uniclick.js?attribution=firstclick&cookiedomain=redtrack.io&cookieduration=90&defaultcampaignid=6348497d50da7d000124395c&regviewonce=false
```
- **Campaign ID**: `6348497d50da7d000124395c`
- **Cookie Domain**: `redtrack.io`
- **Cookie Duration**: 90 dias

### 3. Google Tag Manager
- **Container ID**: `GTM-NHDD75H`
- Permite acessar as tags e configurações do GTM para entender tracking

### 4. NPM - Outros Pacotes
- `icebet-de-casino` - landing page para icebet (não relacionado diretamente)
- `mcp-redtrack` - MCP server para RedTrack API ✅

### 5. API RedTrack
- **Base URL**: `https://api.redtrack.io`
- **Kong API Gateway**: Kong 3.7.1
- **Endpoints documentados**: Swagger schema em `/v1/doc.json`

## Impacto
1. **API RedTrack exposta**: Qualquer pessoa com `REDTRACK_API_KEY` pode acessar dados de campanhas, cliques (incluindo IPs), conversões, receitas
2. **mcp-redtrack**: Código aberto mostra como interagir com a API RedTrack
3. **Uniclick**: Configuração de tracking expõe campaign ID
4. **GTM**: Permite auditoria das tags de tracking

## Recomendações
- Rotacionar chaves de API comprometidas
- Restringir acesso à API RedTrack por IP
- Não expor campaign IDs no frontend
- Revisar configuração do GTM

## Evidência Crua
- `exploit/pocs/mcp-redtrack-source.js` - Código fonte completo do mcp-redtrack
- `exploit/pocs/mcp-redtrack-package.json` - Package.json
- `exploit/pocs/mcp-redtrack-README.md` - README com documentação completa