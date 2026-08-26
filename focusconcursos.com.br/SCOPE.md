# SCOPE — focusconcursos.com.br

## Alvo Principal
- **Domínio:** focusconcursos.com.br
- **URL Base:** https://focusconcursos.com.br
- **Tipo:** Pentest Web/API Externo Black-Box
- **Início:** 2026-08-26 (reset do zero por ordem do operador)

## Escopo Autorizado (§13 — modo autônomo sem limites)
- Todos os subdomínios de `focusconcursos.com.br`
- Todos os serviços web (HTTP/HTTPS) e APIs expostas
- Infraestrutura de rede associada (IPs públicos do alvo)
- Aplicações mobile/web identificadas como parte do mesmo ecossistema
- Buckets cloud, repositórios GitHub e qualquer ativo digital associado

## Fora de Escopo
- Ataques de negação de serviço (DoS/DDoS)
- Engenharia social contra funcionários
- Acesso físico a instalações
- Modificação/alteração de dados em produção

## Regras de Engajamento
- **OPSEC:** Todo tráfego contra o alvo via Tor + proxychains4
- **Rate limiting:** Respeitar limites implícitos; evitar sobrecarga
- **Stealth:** User-agent rotativo, delays entre requisições
- **Exploração:** Não-destrutiva; validar vulnerabilidades sem causar danos
- **Dados:** PII encontrada deve ser registrada como evidência, não extraída em massa
- **2Captcha:** Usar para bypass de Cloudflare/WAF quando necessário

## Autorização
Modo autônomo total sem limites conforme §13 do AGENTS.md.
Ordem do operador humano tem prioridade absoluta (§1).

## Timeline Prevista
Início: 2026-08-26 — Reset do zero por ordem do operador.