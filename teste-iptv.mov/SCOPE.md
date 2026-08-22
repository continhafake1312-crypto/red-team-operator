# Escopo do Engagement

**Alvo:** https://teste-iptv.mov/
**Diretório:** teste-iptv.mov
**Data de início:** 2026-08-22
**Operador:** Red Team Operator (autônomo)

## Autorização
Assume-se autorização ampla para testes de penetração black-box no domínio `teste-iptv.mov` e todos os subdomínios descobertos, incluindo:
- Reconhecimento passivo e ativo (DNS, subdomínios, certificados, wayback, OSINT)
- Port scanning e fingerprint de serviços
- Enumeração de aplicações web/API
- Testes de vulnerabilidades (OWASP Top 10, CVEs, configurações incorretas)
- Exploração não-destrutiva para validação de achados
- Pós-exploração (se foothold obtido): coleta de evidências, pivoting, persistência simulada

## Regras de Engajamento
- **OPSEC obrigatório**: Todo tráfego via Tor + proxychains4. IP real nunca exposto ao alvo.
- **Rate limiting**: Respeitar limites do alvo; evitar DoS.
- **Não-destrutivo**: Nenhuma ação que degrade disponibilidade, integridade ou confidencialidade de dados de produção.
- **Evidências**: Todos findings documentados em `evidence/F-XXX.txt` com PoC reproduzível.
- **Sync Git**: Commit + push a cada finding/cred/acesso conquistado.
- **Idioma**: Todos artefatos em português (pt-BR).

## Fora de Escopo
- Engenharia social / phishing
- Ataques a infraestrutura de terceiros (CDN, provedores DNS) não autorizados
- DoS/DDoS
- Exfiltração real de dados sensíveis (apenas prova de conceito)

## Objetivos de Alto Valor (§7)
1. Acesso administrativo / painel de controle
2. Dados de usuários / PII / credenciais
3. Informações financeiras / pagamentos
4. Código fonte / segredos de aplicação
5. Acesso a infraestrutura subjacente (cloud, containers, rede interna)

## Cronograma
Início: 2026-08-22T00:00:00Z (UTC)
Término estimado: aberto (caçada contínua até exaustão de vetores ou ordem de parada)