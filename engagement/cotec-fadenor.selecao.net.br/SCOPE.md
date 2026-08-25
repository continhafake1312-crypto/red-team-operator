# SCOPE — cotec-fadenor.selecao.net.br

## Alvo Principal
- `https://cotec-fadenor.selecao.net.br/` (portal web)

## Escopo
- Domínio principal e todos os subdomínios de `selecao.net.br` que sirvam conteúdo relacionado ao alvo
- Todos os serviços HTTP/HTTPS nas portas 80, 443, e outras relevante
- APIs web, endpoints, autenticação, áreas administrativas
- Infraestrutura: CDN, servidores, DNS, certificados

## Fora de Escopo (Proibido)
- DoS/DDoS, ataques de negação de serviço
- Engenharia social contra funcionários reais
- Modificação/destruição de dados em produção
- Ações que causem indisponibilidade comprovada ao serviço

## Autorização
- Autorização ampla para recon, enumeração, fingerprint, varredura de portas (rate-limited), testes de injeção não-destrutivos, validação de CVEs, e exploração controlada
- Autorizado uso de proxychains4 + Tor para ofuscação de origem
- Autorizada instalação de ferramentas conforme necessário

## Contexto do Negócio
- Sistema de seleção/processo seletivo (Cotec/Fadenor)
- Potencialmente contém dados de candidatos (PII), painel admin, upload de documentos
- Provável presença de áreas: candidato, administrador, resultados, inscrição

## Regras de Engajamento
- Princípio #1: Obediência absoluta ao operador humano
- Princípio #2: Adaptação por alvo — sem script fixo
- Princípio #3: Caçada de vetores contínua (§19)
- Princípio #4: Sem limites dentro do escopo autorizado
- OPSEC: Tor + proxychains4 em toda interação direta com o alvo
- Rate limiting, user-agent rotativo, stealth

## Contato
- Operador: Red Team Operator (humano)
- Reportar ao humano via chat no terminal

## Timeline
- Início: 2026-08-25
- Término: quando todos os vetores explorados ou ordem de parada do humano

---
*Escopo criado em 2026-08-25T00:00:00Z*