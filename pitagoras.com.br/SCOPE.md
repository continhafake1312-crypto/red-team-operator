# SCOPE — Pitágoras (pitagoras.com.br)

## Alvo
- **Domínio principal**: www.pitagoras.com.br
- **URL base**: https://www.pitagoras.com.br/
- **Tipo**: Web/API — Externo black-box
- **Setor**: Educação (Rede de ensino Pitágoras — grupo Ânima Educação)

## Escopo
- Domínio principal e todos os seus subdomínios.
- Endpoints web, APIs, serviços expostos na superfície.
- Infraestrutura de nuvem associada (buckets S3, CDN, DNS).
- Sistemas terceiros integrados visíveis externamente.

## Fora de escopo
- Engenharia social, ataques físicos, DoS/DDoS.
- Funcionários ou clientes da organização.
- Sistemas de terceiros não pertencentes à infraestrutura do alvo.

## Regras de engajamento
- **Autorização**: Pentest autorizado para fins de avaliação de segurança.
  Assume-se autorização ampla conforme §13 do AGENTS.md.
- **Ações proibidas**: DoS, destruição de dados, modificação não autorizada,
  ataques que degradem a produção.
- **OPSEC obrigatório**: Tor + proxychains4 em todos os contatos ao alvo.
- **Rate limiting**: Respeitar limites do alvo para evitar bloqueio.

## Contato
- Operador: Red Team Operator (autônomo)
- Reportar findings críticos imediatamente.

## Timeline
- Início: 2026-08-20
- Status: EM ANDAMENTO

---
*Este documento define o escopo autorizado do engagement. Qualquer descoberta
fora deste escopo será reportada e requer autorização adicional antes de
prosseguir.*