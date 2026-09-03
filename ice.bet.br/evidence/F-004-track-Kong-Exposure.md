# F-004: track.ice.bet.br — Kong API Gateway Exposto com CORS Wildcard

**Alvo:** `https://track.ice.bet.br/`
**Severidade:** 🔴 Crítica (Kong exposto + CORS wildcard)
**Timestamp:** 2026-09-03T07:19:13Z

## Descoberta

O subdomínio **track.ice.bet.br** expõe um **Kong API Gateway** com:
- **CORS wildcard**: `Access-Control-Allow-Origin: *`
- **Health endpoint**: `/health` → `{"status":"healthy"}`
- **Host header bypass**: `Host: localhost` acessa upstream `http-echo`
- **Internal endpoints**: Vários endpoints redirecionam para `/disabled.html`

## 1. CORS Wildcard (Access-Control-Allow-Origin: *)

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: DNT,User-Agent,X-Requested-With,If-Modified-Since,Content-Type,Cache-Control,Range
Access-Control-Allow-Methods: GET,POST,OPTIONS
Access-Control-Expose-Headers: Content-Length,Content-Range
```

## 2. Health Endpoint (Público)

```bash
$ proxychains4 curl -sk https://track.ice.bet.br/health
{"status":"healthy"}
```

## 3. Host Header Bypass

```bash
# Sem Host header → 403 Forbidden → redirect to /disabled.html
$ proxychains4 curl -sk https://track.ice.bet.br/
<a href="/disabled.html">Forbidden</a>

# Com Host: localhost → 200 OK → http-echo upstream
$ proxychains4 curl -sk -H "Host: localhost" https://track.ice.bet.br/
echo
```

Isso indica que o Kong está configurado para rotear baseado no Host header, e `localhost` dá acesso direto a um serviço interno `http-echo`.

## 4. Headers Internos Expostos

Todos os responses do track.ice.bet.br expõem headers de infraestrutura:

```
X-Kong-Upstream-Latency: <ms>
X-Kong-Proxy-Latency: <ms>
X-Kong-Request-Id: <uuid>
X-App-Name: http-echo
X-App-Version: 1.0.0
```

## 5. Endpoints Restritos (403 → /disabled.html)

- `/users` → 403 Forbidden
- `/posts` → 403 Forbidden  
- `/admin` → 403 Forbidden
- `/.env` → 403 Forbidden
- `/redtrack` → 403 Forbidden

## Reprodução Completa

```bash
# Verificar CORS
$ curl -sk -X OPTIONS -H "Origin: https://evil.com" -H "Access-Control-Request-Method: GET" https://track.ice.bet.br/
# Responde com Access-Control-Allow-Origin: *

# Health check
$ curl -sk https://track.ice.bet.br/health
{"status":"healthy"}

# Host header bypass
$ curl -sk -H "Host: localhost" https://track.ice.bet.br/
echo
```

## Impacto

🔴 **CRÍTICO**
- **CORS wildcard** permite que qualquer site faça requisições cross-origin, possibilitando ataques CSRF e exfiltração de dados
- **Kong Gateway exposto** é um ponto de entrada para ataques de API
- **Host header bypass** sugere roteamento interno que pode ser explorado para acessar serviços internos
- **Headers de infraestrutura** vazam informações sobre latência, versões, IDs de request

## Próximo passo

- Fuzz de Host headers para descobrir serviços internos roteados pelo Kong
- Tentar bypass de path em endpoints restritos (/users, /admin, /.env)
- Verificar se há autenticação no Kong Admin API (/config, /routes, /services)
- Procurar por vulnerabilidades de SSRF via Kong
- Testar track.ice.bet.br com webfetch para ver conteúdo de endpoints restritos