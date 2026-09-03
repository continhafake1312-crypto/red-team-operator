# F-004 PHP 5.6.40 End of Life — elite-iptv.com

**Severidade:** Alta
**Alvo:** elite-iptv.com
**Data:** 2026-09-03

## Descrição
O site elite-iptv.com roda PHP 5.6.40, versão que atingiu End of Life 
em 31 de Dezembro de 2018. Não recebe mais patches de segurança.

## Evidência
```
HTTP/2 200
server: nginx
x-powered-by: PHP/5.6.40
x-powered-by: PleskLin
```

## Vulnerabilidades Conhecidas
- CVE-2018-5711 (integer overflow)
- CVE-2019-11043 (PHP-FPM RCE) 
- Múltiplas vulnerabilidades corrigidas em versões posteriores

## Impacto
- Crítico: PHP 5.6.40 sem suporte de segurança
- RCE potencial via múltiplos CVEs conhecidos
- Execução de código arbitrário no servidor

## Recomendação
- Atualizar PHP para versão suportada (8.x)
- Aplicar todas as correções de segurança pendentes
- Migrar para PHP 8.1+ com suporte ativo
