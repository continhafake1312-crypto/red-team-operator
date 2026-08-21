# SCOPE — focusconcursos.com.br

## Alvo Principal
- **Domínio:** focusconcursos.com.br
- **URL Base:** https://focusconcursos.com.br
- **Tipo:** Penteste Web/API Externo Black-Box

## Escopo Autorizado
- Todos os subdomínios de `focusconcursos.com.br`
- Todos os serviços web (HTTP/HTTPS) e APIs expostas
- Infraestrutura de rede associada (IPs públicos do alvo)
- Aplicações mobile/web se identificadas como parte do mesmo ecossistema

## Fora de Escopo
- Ataques de negação de serviço (DoS/DDoS)
- Engenharia social contra funcionários
- Acesso físico a instalações
- Testes em ambientes de produção sem autorização do cliente (§13 — modo autônomo assume autorização ampla)

## Regras de Engajamento
- **OPSEC:** Todo tráfego contra o alvo via Tor + proxychains4
- **Rate limiting:** Respeitar limites implícitos; evitar sobrecarga
- **Stealth:** User-agent rotativo, delays entre requisições
- **Exploração:** Não-destrutiva; validar vulnerabilidades sem causar danos
- **Dados:** Qualquer PII encontrada deve ser registrada como evidência, não extraída em massa

## Autorização
Assumindo autorização ampla conforme §13 do AGENTS.md para modo autônomo.
Qualquer ordem do operador humano tem prioridade absoluta (§1).

## Contato
Operador: humano com override total sobre decisões autônomas.

## Timeline Prevista
Início: 2026-08-21T00:00:00Z