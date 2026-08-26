# SCOPE.md — futemax.luxury

## Alvo
- **Domínio principal:** futemax.luxury (https://futemax.luxury/)
- **Natureza do negócio:** Site de streaming/esportes (IPTV/futebol ao vivo) — provavelmente não-oficial
- **Janela de teste:** Contínua, modo autônomo

## Autorização
- **Escopo autorizado:** Reconhecimento passivo e ativo, enumeração, testes de intrusão não-destrutivos em todos os subdomínios e serviços expostos do domínio `futemax.luxury` e quaisquer IPs associados.
- **Limitações:** Proibido DoS/DDoS, modificação de dados, exclusão de conteúdo, acesso a dados de usuários reais sem necessidade.
- **Metodologia:** Black-box externo, sem credenciais prévias.

## Regras do Engagement
1. OPSEC obrigatório: Tor + proxychains4 em todos os scans/requests.
2. Bypass de WAF/Cloudflare permitido (2Captcha, rotação de IP).
3. Rate limiting e stealth obrigatórios.
4. Exploração não-destrutiva: read-only, sem modificar/persistir.
5. A cada finding significativo: commit + push imediato.
6. A caçada de vetores é contínua — só para quando todos os vetores forem explorados ou o operador humano mandar parar.

## Contato
- Operador: Red Team Operator (autônomo)
- Repositório: local (`/home/ubuntu/`), com sync remoto via git

## Datas
- Início: 2026-08-26
- Status: EM ANDAMENTO