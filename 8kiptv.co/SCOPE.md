# SCOPE — 8kiptv.co

## Alvo Principal
- **Domínio**: 8kiptv.co
- **URL base**: https://8kiptv.co
- **Tipo**: Pentest Web/API Externo Black-box
- **Metodologia**: OWASP WSTG + OSSTMM adaptado

## Autorização
Escopo autorizado amplo conforme §13 do AGENTS.md:
- Qualquer subdomínio/domínio pertencente ao mesmo proprietário
- Qualquer serviço/porta exposto nos IPs de origem real
- Exploração não-destrutiva (read-only, sem modificação de dados reais)
- Sem DoS/degradação de serviço
- Sem exfiltração de dados para terceiros

## Regras de Engajamento
- **NÃO** modificar dados reais (apenas read-only)
- **NÃO** causar DoS ou degradação
- **NÃO** exfiltrar dados coletados para serviços externos
- **NÃO** instalar persistência sem ordem explícita
- Rate limiting obrigatório (requests/s moderado)
- Proxychains + Tor obrigatórios em todos os requests ao alvo
- 2Captcha para bypass de Cloudflare/captcha quando necessário

## Datas
- **Início**: 2026-08-22
- **Status**: Em andamento

## Contato
- Operador: Red Team Operator (autônomo)