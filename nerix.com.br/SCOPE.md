# SCOPE — Engagement: nerix.com.br

## Alvo
- **Domínio principal**: nerix.com.br
- **URL**: https://nerix.com.br/
- **Tipo de teste**: Pentest Web/API externo black-box
- **Modo**: Autônomo sem limites, não-destrutivo

## Escopo autorizado
- **Subdomínios wildcard**: *.nerix.com.br (todos)
- **Serviços**: Qualquer serviço HTTP/HTTPS exposto na porta pública
- **APIs**: Qualquer endpoint API sob o domínio
- **Infraestrutura**: Qualquer recurso associado (CDN, cloud, DNS, email)

## Fora de escopo
- Ataques de negação de serviço (DoS/DDoS)
- Engenharia social contra funcionários/clientes
- Destruição ou modificação de dados reais (read-only em injeções)
- Acessos físicos

## Regras
- Proxychains4 + Tor obrigatório em todos os requests ao alvo
- Rate limiting e stealth (user-agent rotativo)
- 2Captcha para bypass de Cloudflare/challenge
- Findings reportados incrementalmente no REPORT.md
- Evidências salvas em evidence/F-*.txt

## Autorização
- Assumida autorização ampla para testes de intrusão não-destrutivos
- Alvo público, sem acordo de confidencialidade restritivo identificado

## Cronograma
- Início: 2026-08-23
- Fluxo contínuo até exaustão de vetores ou ordem de parada