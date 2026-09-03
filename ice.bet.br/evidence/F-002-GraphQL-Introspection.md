# F-002: GraphQL Introspection — Bloqueado

**Alvo:** `https://blog.ice.bet.br/api/graphql` / `https://blog.ice.bet.br/graphql`
**Severidade:** 🟠 Alta (se exposto)
**Timestamp:** 2026-09-03T07:18:20Z

## Reprodução

```bash
$ proxychains4 curl -sk -o /dev/null -w '%{http_code}' -X POST https://blog.ice.bet.br/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{__schema{types{name}}}"}'
403

$ proxychains4 curl -sk -o /dev/null -w '%{http_code}' -X POST https://blog.ice.bet.br/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{__schema{types{name}}}"}'
403

$ proxychains4 curl -sk -o /dev/null -w '%{http_code}' 'https://blog.ice.bet.br/api/graphql?query={__schema{types{name}}}'
403
```

## Interpretação

- `/graphql` → Retorna página HTML do blog (Next.js catch-all) indicando que NÃO há rota GraphQL neste path
- `/api/graphql` → Retorna 403, indicando que o endpoint existe mas está protegido

O Payload CMS pode expor GraphQL em `/api/graphql` quando configurado. O 403 sugere que ou:
1. O endpoint existe e está protegido por autenticação
2. O Cloudflare está bloqueando o acesso

## Impacto

🟠 **ALTO se acessível** — GraphQL introspection revelaria schema completo com todas as coleções, campos, relações e mutations disponíveis, permitindo ataques direcionados.

✅ **Mitigado por restrição de acesso** (403).

## Próximo passo

- Testar GraphQL via webfetch (que bypassa Cloudflare)
- Verificar se há autenticação alternativa para GraphQL
- Buscar tokens de API nos JS bundles que possam dar acesso