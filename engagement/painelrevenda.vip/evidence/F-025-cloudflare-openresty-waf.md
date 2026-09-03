# F-006 Web Application — openresty/1.31.1.1 com Cloudflare

**Alvo:** painelrevenda.vip (186.194.52.218)
**Severidade:** Informativa
**Timestamp:** 2026-09-03T06:35:00Z

## Reprodução

```bash
# HTTP — Cloudflare Challenge Page
$ proxychains4 curl -sk -D- "http://painelrevenda.vip/"
HTTP/1.1 200 OK
Server: openresty/1.31.1.1
cf-edge-cache: no-cache

<!DOCTYPE html>
<title>One moment, please...</title>
<!-- Cloudflare challenge page — JS-based browser verification -->

# HTTPS
$ proxychains4 curl -sk -D- "https://painelrevenda.vip/"
HTTP/2 200
server: openresty/1.31.1.1
```

```bash
# Conexão direta pelo IP (via proxy)
$ proxychains4 curl -sk -D- "http://186.194.52.218/"
HTTP/1.1 400 Bad Request
Server: openresty/1.31.1.1
# Requer virtual host específico

$ proxychains4 curl -sk -D- "https://186.194.52.218/"
HTTP/1.1 400 Bad Request
Server: openresty/1.31.1.1
```

## Interpretação

- **openresty/1.31.1.1**: Nginx com LuaJIT — versão recente (Jan 2025+). openresty é a base do Cloudflare WAF.
- **Cloudflare**: Challenge page com JavaScript e CAPTCHA protector. Requer browser real com JS habilitado.
- **Virtual host**: O servidor web responde apenas a `painelrevenda.vip` como Host header.

## Impacto

O Cloudflare Challenge impede enumeração direta:
- Sem bypass de Cloudflare, não é possível escanear a aplicação web
- WAF protege contra SQLi, XSS, path traversal
- Cabeçalhos `cf-edge-cache` confirmam Cloudflare proxy ativo

## Recomendação

N/A (proteção do cliente). Para bypass durante pentest:
1. Encontrar IP real do servidor via DNS históricos (SecurityTrails, Censys, Shodan)
2. Verificar se há subdomínios não-protegidos pelo Cloudflare
3. Testar autenticação SMTP/IMAP/FTP como vetor de entrada alternativo

## Próximo passo

- Verificar SecurityTrails/Censys por IPs históricos
- Testar bypass via HTTP/2, HTTP/1.0, ou protocolos diferentes
- Se o IP real for confirmado como 186.194.52.218, testar diretamente sem Cloudflare