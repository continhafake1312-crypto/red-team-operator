# SCOPE — marketroblox.store

## Escopo

- **Alvo principal**: https://marketroblox.com/ (marketroblox.store redireciona para .com)
- **Domínios**: marketroblox.store, marketroblox.com
- **Tipo**: Pentest Externo Black-Box Web/API
- **Autorização**: Engagamento autorizado para teste de intrusão. Ações não-destrutivas permitidas. DoS/Não autorizado.

## Regras de Engajamento

- **Janela de testes**: Contínua até conclusão de todos os vetores ou ordem de parada do operador.
- **Ações proibidas**: DoS/DDoS, destruição de dados, modificação de registros sem autorização, social engineering contra funcionários.
- **Ações permitidas**: Port scanning, fuzzing, brute force com rate limiting (respeitando termos de uso), exploração de vulnerabilidades (read-only/não-destrutiva), uso de credenciais padrão/fracas.
- **OPSEC**: Tor + proxychains4 em todas as requisições. Rotação de circuito Tor se bloqueado. User-agent rotativo. 2Captcha para bypass de Cloudflare.
- **Notificação**: Findings críticos reportados imediatamente.

## Datas

- **Início**: 2026-08-24T04:11:00Z
- **Fim**: A definir

## Critérios de Sucesso

- Mapeamento completo da attack surface
- Identificação de TODAS as vulnerabilidades exploráveis
- Acesso a objetivos de alto valor: admin, financeiro, dados de usuários
- Relatório final consolidado com evidências

## Contato

- Operador via chat