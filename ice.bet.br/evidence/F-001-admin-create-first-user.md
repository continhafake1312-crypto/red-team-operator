# F-001: /admin/create-first-user — Bloqueado por Cloudflare

**Alvo:** `https://blog.ice.bet.br/admin/create-first-user`
**Severidade:** 🔴 Crítica (se exposto)
**Timestamp:** 2026-09-03T07:17:41Z

## Reprodução

```bash
# GET request
$ proxychains4 curl -sk -o /dev/null -w '%{http_code}' 'https://blog.ice.bet.br/admin/create-first-user'
403

# POST request com payload de criação
$ proxychains4 curl -sk -o /dev/null -w '%{http_code}' -X POST https://blog.ice.bet.br/admin/create-first-user \
  -H "Content-Type: application/json" \
  -d '{"email":"pentest@test.com","password":"Pentest123!","confirmPassword":"Pentest123!","name":"Pentest"}'
403
```

## Interpretação

O endpoint `/admin/create-first-user` retorna **HTTP 403 Forbidden** tanto para GET quanto para POST. A resposta inclui headers de Cloudflare (`server: cloudflare`, `cf-ray`), indicando que a proteção Cloudflare está bloqueando o acesso direto ao admin.

### Headers de resposta:
- `server: cloudflare`
- `cf-ray: a352f9e4cdbbb44a-TXL`
- `cache-control: private, max-age=0, no-store, no-cache`
- `referrer-policy: same-origin`
- `x-frame-options: SAMEORIGIN`
- `strict-transport-security: max-age=31536000; includeSubDomains; preload`

## Impacto

🔴 **CRÍTICO se acessível** — O endpoint `create-first-user` no Payload CMS permite criar um usuário admin inicial. Se exposto sem autenticação, qualquer atacante poderia criar uma conta administrativa e tomar controle total do CMS.

✅ **Mitigado por Cloudflare** — No momento, o Cloudflare está bloqueando acesso direto, impedindo exploração externa.

## Próximo passo

- Verificar se há bypass do Cloudflare via IP real do servidor
- Verificar se o endpoint está exposto internamente via Kong (track.ice.bet.br)
- Testar com headers de bypass (X-Forwarded-For, X-Real-IP, etc.)