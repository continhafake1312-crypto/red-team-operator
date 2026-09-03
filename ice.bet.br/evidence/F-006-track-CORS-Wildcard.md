# F-006: track.ice.bet.br — CORS Wildcard e Kong Gateway Exposto

**Alvo:** `https://track.ice.bet.br/`
**Severidade:** 🟠 Alta
**Timestamp:** 2026-09-03T07:19:13Z

## Descoberta

O subdomínio `track.ice.bet.br` expõe um **Kong API Gateway** com **CORS wildcard** (`Access-Control-Allow-Origin: *`) e headers de infraestrutura interna.

## 1. CORS Wildcard

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *           # ← WILDCARD!
Access-Control-Allow-Headers: DNT,User-Agent,X-Requested-With,If-Modified-Since,Content-Type,Cache-Control,Range
Access-Control-Allow-Methods: GET,POST,OPTIONS
Access-Control-Expose-Headers: Content-Length,Content-Range
```

**Impacto:** Qualquer site pode fazer requisições cross-origin arbitrárias.

## 2. Kong API Gateway Headers

Todos os responses expõem headers de infraestrutura:

```
via: kong/3.7.1
X-Kong-Upstream-Latency: <ms>
X-Kong-Proxy-Latency: <ms>
X-Kong-Request-Id: <uuid>
X-App-Name: http-echo
X-App-Version: 1.0.0
```

## 3. Health Endpoint Público

```
GET /health → 200 OK
{"status":"healthy"}
```

## 4. Host Header Bypass

Com `Host: localhost`, o Kong roteia para um serviço interno `http-echo`:

```
# Sem Host header → 403 Forbidden
$ curl -sk https://track.ice.bet.br/
<a href="/disabled.html">Forbidden</a>

# Com Host: localhost → 200 OK
$ curl -sk -H "Host: localhost" https://track.ice.bet.br/
echo
```

## 5. Endpoints Restritos

| Path | Status | Resposta |
|------|--------|----------|
| `/users` | 403 | redirect to /disabled.html |
| `/posts` | 403 | redirect to /disabled.html |
| `/admin` | 403 | redirect to /disabled.html |
| `/.env` | 403 | redirect to /disabled.html |
| `/redtrack` | 403 | redirect to /disabled.html |

## Impacto

🟠 **ALTO**
- CORS wildcard permite CSRF e exfiltração de dados
- Host header bypass indica roteamento interno explorável
- Headers de infraestrutura expõem tecnologia (Kong 3.7.1) e latências

## Reprodução

```bash
# Testar CORS
curl -sk -X OPTIONS -H "Origin: https://evil.com" -H "Access-Control-Request-Method: GET" \
  "https://track.ice.bet.br/" -D -

# Health check
curl -sk "https://track.ice.bet.br/health"

# Host header bypass
curl -sk -H "Host: localhost" "https://track.ice.bet.br/"
```