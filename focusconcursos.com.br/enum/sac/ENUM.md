# ENUM.md — sac.focusconcursos.com.br

## Stack
| Component | Detalhe |
|-----------|---------|
| **Framework** | Express.js (x-powered-by: Express) |
| **CDN/WAF** | Cloudflare (HTTP/2, Bot Management, __cf_bm cookie) |
| **Backend** | Google App Engine Standard (1st gen) |
| **GCP Services** | Cloud Trace, Channel API, Blobstore API |
| **Deploy** | GAE Standard (Express.js runtime) |
| **TLS** | HTTP/2 via Cloudflare, HSTS max-age=2592000 |
| **CORS** | **Wildcard (*)** — critical finding |

## Endpoints Descobertos

| Método | Path | Status | Resposta | Notas |
|--------|------|--------|----------|-------|
| GET | `/` | 200 | `OK!` (3B) | Health check — handler principal |
| GET | `/api/` | 200 | `OK!` (3B) | Mesmo handler de health check |
| GET | `/robots.txt` | 200 | `Disallow: /` (68B) | Bloqueia crawlers |
| GET | `/_ah/start` | 200 | `OK!` (3B) | GAE Warmup |
| GET | `/_ah/stop` | 200 | `OK!` (3B) | GAE Shutdown |
| GET | `/_ah/channel/jsapi` | 302 | → talkgadget.google.com | GAE Channel API — confirma GAE Standard |
| POST | `/_ah/upload/default` | 303 | → blobstore-error + x-guploader-uploadid | GAE Blobstore — vaza upload ID |
| GET | `/_ah/login` | 500 | Server Error | GAE Users API — não configurada |
| GET | `*` (qualquer outro) | 404 | `{"msg":"Not found"}` | Express 404 handler customizado |
| OPTIONS | `/` | 200 | CORS headers | **access-control-allow-origin: \*** |
| PUT | `/` | 411 | Google Error | Requer Content-Length |
| HEAD | `/` | 200 | (sem body) | Headers idênticos ao GET |

## JS Analysis
- **Nenhum JS servido** — root retorna apenas "OK!" (texto puro)
- Nenhum arquivo .js encontrado em `/js/`, `/assets/`, `/static/`, `/public/`, `/src/`
- Único JS externo: `https://talkgadget.google.com/talkgadget/channel.js` (GAE Channel API)

## API Discovery
- **Nenhuma API REST/SAC funcional** — todos endpoints `/api/*` retornam 404
- Endpoints testados: `/api/tickets`, `/api/messages`, `/api/users`, `/api/chat`, `/api/v1/*`, `/api/v2/*`, `/api/v3/*`, `/graphql`, `/swagger`, `/api-docs`, `/socket.io`
- CORS permite: GET, HEAD, PUT, PATCH, POST, DELETE

## CMS Detection
- **Não se aplica** — Express.js customizado, não CMS

## Findings de Vulnerabilidade

### F-003 (Confirmado) — CORS Wildcard — CRÍTICO
- `access-control-allow-origin: *` em todas as respostas
- Qualquer site pode fazer requisições cross-origin
- Risco reduzido (sem sessão/cookies atualmente), mas é gap de segurança

### F-017 (Novo) — GAE Internal Endpoints Expostos — MÉDIO
- `_ah/start`, `_ah/stop`, `_ah/channel/jsapi`, `_ah/login`, `_ah/upload` expostos publicamente
- Revela stack: Google App Engine Standard (1st gen)
- Vetor de reconhecimento de infraestrutura

### F-018 (Novo) — Blobstore Upload ID Leak — MÉDIO
- `POST /_ah/upload/default` retorna 303 + header `x-guploader-uploadid`
- ID de upload vazado em cada requisição
- Potencial para upload não autorizado se configurado incorretamente

### F-019 (Novo) — Sem Proteção CSRF — MÉDIO
- Nenhum token CSRF, nenhum cookie de sessão
- Se sessão for adicionada, estará vulnerável a CSRF

### F-020 (Novo) — Aplicação Placeholder — BAIXO
- SAC.focusconcursos.com.br é um placeholder/health-check
- Aplicação real de SAC não está neste subdomínio
- Pode estar em desenvolvimento, em outra rota, ou ser mobile-only

## Observações Técnicas

### Arquitetura
```
Cliente → Cloudflare (CDN/WAF) → Google App Engine Standard (Express.js)
```
- Cloudflare adiciona Bot Management (__cf_bm cookie)
- GAE adiciona Cloud Trace (x-cloud-trace-context header)
- Express.js gerencia roteamento (health check + 404 handler)

### Comportamento do 404 Handler
- O Express app tem um middleware catch-all que retorna `{"msg":"Not found"}` (19B) com status 404
- Inclui headers: `x-powered-by: Express`, `access-control-allow-origin: *`, `x-content-type-options: nosniff`, `etag`
- Consistente em todos os paths não mapeados

### Rate Limiting
- Cloudflare impõe desafios (JS challenge) após múltiplas requisições
- ffuf com `-t 5 -p 1.0 -rate 10` processa ~5 req/s via Tor
- Necessário cuidado para não ser bloqueado

## Recomendações para Próximos Passos no Webapp
1. **Verificar se o SAC real está em outra rota**: testar `sac/api`, `sac/v1`, `sac/v2`, com sufixos
2. **Escaneamento de subdomínio**: buscar `api.sac.*`, `sac-api.*`, `sac-backend.*`
3. **Testar User-Agent específico**: apps mobile podem usar rotas separadas
4. **Verificar Blobstore upload**: testar upload real via `/_ah/upload/`
5. **Monitorar**: este subdomínio pode ganhar funcionalidade no futuro
6. **Verificar CDN.focusconcursos.com.br (S3)**: assets JS podem conter rotas do SAC
