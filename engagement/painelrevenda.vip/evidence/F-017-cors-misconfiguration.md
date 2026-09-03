# F-005 CORS Misconfiguration — revenda-eliteiptv.online

**Severidade:** Média
**Alvo:** revenda-eliteiptv.online
**Data:** 2026-09-03

## Descrição
O endpoint `/api/status` possui `Access-Control-Allow-Origin: *`, 
permitindo que qualquer site leia as respostas da API.

## Evidência
```
OPTIONS /api/status
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD
```

## Impacto
- Qualquer站点 pode ler dados do endpoint via request cross-origin
- Possível uso em ataques de script cross-site (XSS) combinado
- Vazamento de informações de monitoramento do servidor

## Recomendação
- Restringir CORS a origins específicas e confiáveis
- Nunca usar `*` em produção, especialmente em APIs internas
- Implementar validação de origin no backend
