# F-007 Sensitive Files Protegidos (mas existem)

**Severidade:** Média
**Alvos:** revenda-eliteiptv.online, elite-iptv.com, panel.elite-iptv.com
**Data:** 2026-09-03

## Descrição
Arquivos sensíveis retornam 403 (existem) nos seguintes domínios:
- `/.env` - 403 em revenda-eliteiptv.online, elite-iptv.com, panel.elite-iptv.com
- `/.git/config` - 403 em revenda-eliteiptv.online, elite-iptv.com, panel.elite-iptv.com
- `/composer.json` - 403 em elite-iptv.com

Arquivos .env e .git expõem a existência de frameworks e 
potencialmente credenciais de banco de dados se acessados.

## Impacto
- Confirma uso de Laravel (composer.json), Node.js/PHP no servidor
- Indica possíveis vulnerabilidades de configuração
- Se proteção for removida acidentalmente, expõe credenciais

## Recomendação
- Remover completamente arquivos .env e .git de diretórios públicos
- Configurar nginx para retornar 404 em vez de 403 para arquivos sensíveis
- Usar variáveis de ambiente em vez de arquivos .env em produção
