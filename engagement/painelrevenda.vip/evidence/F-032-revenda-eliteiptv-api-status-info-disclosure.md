# F-032 revenda-eliteiptv.online — /api/status Information Disclosure
**Alvo:** revenda-eliteiptv.online (104.21.71.180 via Cloudflare)
**Severidade:** Baixa
**Timestamp:** 2026-09-03T16:22:00Z
**Status:** CONFIRMADO

## Reprodução

```bash
$ proxychains4 curl -sk "https://revenda-eliteiptv.online/api/status"
<load>1.20</load>
<uptime>307 Days 05:17:18</uptime>
```

### Headers HTTP
```
HTTP/2 200
server: cloudflare
content-type: text/html; charset=UTF-8
access-control-allow-origin: *          ← CORS misconfiguration!
cache-control: no-cache, private
x-frame-options: SAMEORIGIN
x-xss-protection: 1; mode=block
x-content-type-options: nosniff
referrer-policy: same-origin
content-security-policy: default-src 'self' http: https: ws: wss: data: blob: 'unsafe-inline' 'unsafe-eval'
cf-cache-status: DYNAMIC
```

## Interpretação

O endpoint `/api/status` do Laravel expõe informações do servidor:

1. **Server load** (1.20) — Carga atual do CPU
2. **Uptime** (307 days ~10 months) — Tempo desde último reboot
3. **Server banner** — Cloudflare (nginx upstream)
4. **CORS misconfiguration** — `Access-Control-Allow-Origin: *` permite qualquer site acessar a API

### Problemas
- **Information Disclosure**: System load e uptime ajudam fingerprinting
- **CORS aberto**: Qualquer site pode fazer chamadas AJAX para esta API
- **Sem autenticação**: Endpoint público sem rate limiting
- **Tecnologias expostas**: Laravel PHP, Cloudflare

### Endpoints Bloqueados pelo Cloudflare (403)
```
/api/login, /api/register, /api/auth, /admin/login, /login, /register
```
Apenas `/api/status` está acessível — os demais são protegidos pelo WAF.

## Impacto

**Severidade: Baixa**
- Informações de sistema expostas (load, uptime)
- CORS aberto permite abuso de confiança (mas sem auth, impacto limitado)
- Não há dados sensíveis no response atual
- Confirma stack tecnológica: Laravel + Cloudflare

## Recomendação

1. Remover endpoint `/api/status` público ou autenticá-lo
2. Restringir CORS para origens específicas
3. Implementar rate limiting

## Próximo passo

Buscar por outros endpoints públicos no Laravel via fuzzing com wordlist de rotas comuns. Explorar CORS em combinação com outras APIs.