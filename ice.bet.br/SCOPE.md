# SCOPE.md — Escopo do Pentest

## Alvo
- **Domínio principal:** ice.bet.br
- **URL base:** https://ice.bet.br/
- **Tipo:** Web/API — plataforma de apostas online (iGaming/betting)

## Autorização
Engagement autorizado em modo black-box externo. Sem credenciais prévias.
Sem acesso interno. Sem acesso ao código-fonte.

## Regras de Engajamento
- **Não realizar ataques de negação de serviço (DoS/DDoS)**
- **Não modificar/excluir dados do alvo**
- **Não realizar engenharia social contra funcionários**
- **Não acessar dados de usuários reais** (apenas contas de teste se criadas)
- **Rate limiting obrigatório** em todas as ferramentas de brute force
- **Tráfego sempre via Tor** (proxychains4) para ofuscar origem
- **2Captcha** para bypass de Cloudflare quando necessário
- Qualquer vulnerabilidade encontrada deve ser registrada como evidência
  antes de qualquer exploração adicional

## Objetivos de Alto Valor (Ranking de Payoff)
1. **Acesso interno** (foothold na infraestrutura)
2. **Acesso administrativo** (painel admin/RCE)
3. **Acesso financeiro** (sistemas de pagamento/saque/depósito)
4. **Acesso a dados/PII** (vazamento de dados de usuários)

## Contato em Caso de Emergência
- Operador responsável: via canal de comunicação do Red Team Operator

## Datas
- Início: 2026-09-03
- Status: **EM ANDAMENTO**