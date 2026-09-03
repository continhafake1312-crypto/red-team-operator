# F-007 CORS Wildcard — Multiple Subdomains with Access-Control-Allow-Origin: *
**Alvo:** `bet-hint.ice.bet.br`, `betslip.ice.bet.br`, `imgix.ice.bet.br`, `track.ice.bet.br`
**Severidade:** Média
**Timestamp:** 2026-09-03T06:53:00Z

## Reprodução
```bash
# bet-hint.ice.bet.br — CORS wildcard + 404
curl -s -D- -H "Origin: https://evil.com" https://bet-hint.ice.bet.br/
# access-control-allow-origin: *

# betslip.ice.bet.br — CORS wildcard + 404
curl -s -D- -H "Origin: https://evil.com" https://betslip.ice.bet.br/
# access-control-allow-origin: *

# imgix.ice.bet.br — CORS wildcard + 200 (CDN de imagens)
curl -s -D- -H "Origin: https://evil.com" https://imgix.ice.bet.br/
# access-control-allow-origin: *
# timing-allow-origin: *
# cross-origin-resource-policy: cross-origin

# track.ice.bet.br — CORS wildcard (Kong gateway)
curl -s -D- -H "Origin: https://evil.com" https://track.ice.bet.br/
# Access-Control-Allow-Origin: *
# X-Kong-Upstream-Latency: 2
# X-Kong-Proxy-Latency: 0
```

## Output
Todos os 4 hosts retornam:
```
Access-Control-Allow-Origin: *
```
**Nenhum** retorna `Access-Control-Allow-Credentials: true`.

## Interpretação
- CORS wildcard `*` permite que QUALQUER site leia as respostas via JavaScript
- Sem `Access-Control-Allow-Credentials: true`, **cookies não podem ser exfiltrados**
- **bet-hint** e **betslip**: subdomínios com função desconhecida (404), mas CORS ativo
- **imgix**: CDN de imagens — CORS wildcard é comum para CDNs, mas expõe metadados
- **track**: Kong gateway — CORS via Kong expõe endpoints upstream

## Impacto
- Médio — atacante pode fazer requests cross-origin e ler respostas
- Se algum desses endpoints retornar dados sensíveis (tokens, PII), podem ser exfiltrados por um site malicioso
- imgix: imagens podem ser carregadas em qualquer contexto (já é o propósito)

## Próximo passo
- Verificar se bet-hint/betslip retornam dados sensíveis em endpoints específicos
- Testar CORS com Origin refletida (`Origin: https://evil.com` → ACAO: `https://evil.com`)
- Testar se há outros endpoints em track.ice.bet.br via fuzzing