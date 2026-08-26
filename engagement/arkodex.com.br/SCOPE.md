# SCOPE — arkodex.com.br

## Alvo Principal
- **Domínio:** arkodex.com.br
- **URL:** https://arkodex.com.br/
- **Tipo:** Pentest Web/API Externo Black-box

## Escopo Autorizado
- `*.arkodex.com.br` — todos subdomínios
- Todos os serviços HTTP/HTTPS expostos na internet
- APIs, endpoints e serviços auxiliares

## Fora de Escopo
- Ataques de negação de serviço (DoS/DDoS)
- Engenharia social contra funcionários
- Ataques físicos
- Modificação ou destruição de dados

## Regras de Engajamento
- Exploração **não-destrutiva** (read-only sempre que possível)
- Rate limiting ativo para evitar sobrecarga
- Ofuscação de origem via Tor + proxychains
- 2Captcha para bypass de Cloudflare/WAF
- Qualquer credencial encontrada deve ser registrada em `loot/` e testada minimamente

## Autorização
Assumida ampla dentro do escopo acima. Qualquer violação reportar imediatamente.

## Metodologia
OWASP Web Security Testing Guide + metodologia própria (AGENTS.md)