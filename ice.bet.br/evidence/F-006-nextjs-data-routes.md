# F-006 Next.js Data Routes — Build ID Outdated + RSC Mode Detected
**Alvo:** `ice.bet.br`
**Severidade:** Baixa
**Timestamp:** 2026-09-03T06:53:00Z

## Reprodução
```bash
# Build ID antigo do Wayback (ysCDFWcoE-_61e5-SbE5P)
# Todas as rotas retornam 404 com HTML (Next.js SPA fallback)
curl -s "https://ice.bet.br/_next/data/ysCDFWcoE-_61e5-SbE5P/pt.json"
# HTTP 404 - 133KB (HTML)

curl -s "https://ice.bet.br/_next/data/ysCDFWcoE-_61e5-SbE5P/pt/sports/soccer-1.json"
# HTTP 404 - 133KB (HTML)
```

### Vercel Deploy ID (novo)
O HTML do site contém:
```html
<html data-dpl-id="dpl_GHzb3uZZNEELPKXMU4coQHNizyxG" ...>
```

### RSC (React Server Components)
O site usa streaming RSC, não `__NEXT_DATA__`. Não foi possível extrair build ID diretamente.

## Interpretação
- O build ID `ysCDFWcoE-_61e5-SbE5P` do Wayback está **desatualizado**
- O site usa **Vercel + RSC** com Deploy ID: `dpl_GHzb3uZZNEELPKXMU4coQHNizyxG`
- Rotas `/api/users`, `/api/wallet`, `/api/transactions` retornam 200 vazio (potencialmente requerem auth)

## Impacto
- Baixo — sem acesso a dados internos via rotas de dados
- Mas routes internas do JavaScript podem conter endpoints sensíveis

## Próximo passo
- Extrair JavaScript bundles e analisar por rotas/endpoints
- Tentar acessar dados RSC diretamente via `_rsc` param
- Monitorar mudanças no build ID para novo ataque de data routes