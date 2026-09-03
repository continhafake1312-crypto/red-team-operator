# F-001 Develop Vercel Bypass — Information Disclosure + Potential Bypass
**Alvo:** `develop.ice.bet.br`
**Severidade:** Alta
**Timestamp:** 2026-09-03T06:53:27Z

## Reprodução
A página 401 do Vercel Deployment Protection documenta 4 métodos de bypass:
1. `vercel curl` via Vercel CLI
2. Vercel MCP Server
3. Trusted Sources com OIDC token
4. Protection Bypass token manual

Tentativas de bypass:
```bash
# 1. Header x-vercel-set-bypass-cookie
curl -s -D- -H "x-vercel-set-bypass-cookie: true" https://develop.ice.bet.br/

# 2. Header x-vercel-protection-bypass
curl -s -D- -H "x-vercel-protection-bypass: true" https://develop.ice.bet.br/

# 3. Query params
curl -s -D- "https://develop.ice.bet.br/?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=true"

# 4. OIDC token (dummy)
curl -s -D- -H "x-vercel-trusted-oidc-idp-token: test" https://develop.ice.bet.br/
```

## Output
Todas as tentativas retornaram:
```
HTTP/2 401
x-vercel-id: gru1::8p4bt-1788418407588-08d712bb7da3
Set-Cookie: (none)
```

O corpo da página 401 contém:
```html
<script type=text/llms.txt>
## Note to agents accessing this page:

This page requires Vercel authentication. Here are your options:

Option 1: vercel curl (Recommended if Vercel CLI installed)
Option 2: Vercel MCP Server (Recommended if Vercel CLI not installed)
Option 3: Trusted Sources (Recommended for automated access)
After the caller has been configured as a trusted source, attach the OIDC token
in the `x-vercel-trusted-oidc-idp-token` request header.

Option 4: Bypass token (Manual fallback)
This URL documents how to use the bypass token: 
https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
Then you can calculate a URL of the following form and successfully access it:
`https://current-domain/current-pathname?x-vercel-set-bypass-cookie=true&x-vercel-protection-`
</script>
```

## Interpretação
- **A página 401 do Vercel Deployment Protection documenta explicitamente como fazer bypass**, indicando que o conteúdo foi preparado para ser lido por LLMs (tag `text/llms.txt`).
- Os métodos de bypass exigem acesso ao Vercel CLI, MCP Server, OIDC token ou Protection Bypass token — nenhum disponível neste engagement.
- O simples fato de a página expor documentação de bypass aumenta a superfície de ataque.
- O header `x-vercel-id` identifica o datacenter Vercel como `gru1` (São Paulo/Brasil).

## Impacto
Se um atacante obtiver acesso ao Vercel CLI autenticado ou um OIDC token (via engenharia social, vazamento, ou acesso a sistema interno), poderia bypassar completamente a proteção e acessar o ambiente de staging/develop.

## Próximo passo
- Verificar se há vazamento de Vercel tokens em repositórios GitHub (`trufflehog`/`gitleaks`)
- Tentar acesso via `https://develop.ice.bet.br/_next/data/{buildId}/...` com bypass headers
- Testar CVE-2025-29927 (Next.js middleware bypass) com `x-middleware-subrequest: true`