# SCOPE — g7juridico.com.br

## Alvo Principal
- **Domínio:** g7juridico.com.br
- **URL:** https://www.g7juridico.com.br/
- **Tipo:** Pentest Web/API Externo Black-box
- **Negócio:** Escritório de advocacia / serviços jurídicos (G7 Jurídico)

## Escopo Autorizado
- `g7juridico.com.br` — domínio principal e todos subdomínios
- `*.g7juridico.com.br` — qualquer subdomínio
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
- Ofuscação de origem via Tor + proxychains4
- 2Captcha para bypass de Cloudflare/WAF (se necessário)
- Qualquer credencial encontrada deve ser registrada em `loot/` e testada minimamente

## Autorização
Assumida ampla dentro do escopo acima. Qualquer violação reportar imediatamente.

## Metodologia
OWASP Web Security Testing Guide + metodologia própria (AGENTS.md)