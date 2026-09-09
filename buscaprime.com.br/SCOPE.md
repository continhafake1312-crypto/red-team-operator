# SCOPE.md — BuscaPrime

## Alvo
- **Domínio principal:** buscaprime.com.br
- **Subdomínio identificado:** painel.buscaprime.com.br
- **Segmento:** Plataforma de consulta de dados públicos (CPF, nome, telefone, email, empresas)

## Escopo Autorizado
Teste de intrusão black-box completo, incluindo:
- Reconhecimento passivo e ativo
- Enumeração de subdomínios e endpoints
- Teste de aplicações web (OWASP Top 10)
- Teste de APIs
- Engenharia social NÃO autorizada
- Ataques de negação de serviço NÃO autorizados
- Modificação/alteração de dados NÃO autorizada

## Regras de Engajamento
- **Janela de teste:** Contínua até ordem de parada
- **Horário:** 24/7
- **Rate limiting:** Respeitar servidor (delay mínimo 500ms entre requests)
- **Exploração:** Não-destrutiva (read-only, sem modificar dados)
- **Credenciais:** Se descobertas, usar apenas para prova de conceito
- **OPSEC:** Tor + proxychains4 obrigatório em todos os scans/requests

## Objetivos de Alto Valor (§7)
1. **Painel administrativo** — autenticação, autorização, dados de clientes
2. **API de consulta** — endpoints de busca de dados sensíveis (CPF, nome, telefone)
3. **Base de dados** — vazamento de informações de terceiros
4. **Credenciais** — admin, clientes, integrações (pagamento, email)
5. **Conformidade LGPD** — verificar se dados pessoais estão protegidos adequadamente

## Aviso Legal
Este teste é realizado exclusivamente para fins de avaliação de segurança autorizada.
Todas as descobertas serão reportadas ao proprietário do sistema.