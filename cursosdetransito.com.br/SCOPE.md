# SCOPE.md — cursosdetransito.com.br

## Escopo
- **Alvo principal**: https://cursosdetransito.com.br/
- **Domínio**: cursosdetransito.com.br
- **Subdomínios**: todos os subdomínios descobertos durante o recon
- **Infraestrutura**: IPs, CDNs, clouds associadas

## Autorização
- **Tipo**: Black-box externo
- **Autorização**: Assumida como ampla para este engagement (§13)
- **Regras**: Sem ataques destrutivos (DoS), sem engenharia social contra usuários finais,
  sem exfiltração de dados reais de terceiros

## Limites
- 🚫 Sem ataques de negação de serviço (DoS/DDoS)
- 🚫 Sem engenharia social (phishing, spear-phishing)
- 🚫 Sem modificação não-autorizada de conteúdo em produção
- 🟡 Rate limiting ativo para evitar bloqueio (delay 1-3s entre requests)
- 🟡 Rotação de IP via Tor/proxychains

## Objetivos
1. Mapear attack surface completo (subdomínios, IPs, portas abertas)
2. Identificar vulnerabilidades web (OWASP Top 10)
3. Buscar vazamentos de dados, credenciais, tokens
4. Identificar CPEs/CVEs relevantes
5. Explorar vetores de autenticação, autorização e injeção