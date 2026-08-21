# SCOPE — redecanaisvip.club

## Alvo Principal
- **Domínio**: redecanaisvip.club
- **URL**: https://redecanaisvip.club/
- **Setor**: Streaming / entretenimento (provável)

## Autorização
- **Tipo**: Pentest externo black-box
- **Perímetro**: Domínio principal e todos os subdomínios associados
- **Métodos autorizados**: Qualquer técnica de reconhecimento passivo/ativo,
  enumeração, varredura, exploração não-destrutiva, brute force controlado
  (rate limiting), bypass de WAF/CDN
- **Limitações**: Não realizar DoS, não deletar dados, não modificar
  conteúdo produtivo

## OPSEC
- Tráfego ao alvo via Tor + proxychains4
- 2Captcha para bypass de Cloudflare
- Rate limiting e user-agent rotativo

## Contato
- Operador: Red Team Operator (autônomo)

## Regras de Engajamento
- Qualquer finding → commit imediato ao repositório
- Acessos/credenciais → registrar em loot/
- Ao final → relatório consolidado em REPORT.md