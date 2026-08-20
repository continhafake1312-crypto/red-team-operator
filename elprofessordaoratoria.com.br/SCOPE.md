# SCOPE — elprofessordaoratoria.com.br

## Alvo Principal
- **Domínio**: elprofessordaoratoria.com.br
- **URL**: https://elprofessordaoratoria.com.br/
- **Tipo**: Pentest Web/API externo black-box

## Escopo Autorizado
- Domínio principal e todos os subdomínios descobertos
- Todos os serviços web expostos nas portas TCP/UDP dos IPs de origem
- APIs, endpoints, paineis administrativos, CMS
- Serviços de nuvem associados (buckets, CDN)
- Repositórios GitHub e assets associados ao domínio

## Fora de Escopo
- Ataques de negação de serviço (DoS/DDoS)
- Engenharia social contra funcionários/clientes
- Ataques físicos
- Modificação ou destruição de dados reais

## Regras de Engajamento
- **Modo autônomo total**: todas as ações dentro do escopo são autorizadas
- **Não-destrutivo**: read-only em dados sensíveis, sem persistência
- **OPSEC**: Tor + proxychains4 obrigatório em todos os contatos com o alvo
- **2Captcha**: chave configurada para bypass de Cloudflare
- **Rate limiting**: respeitar limites dos serviços para evitar bloqueio
- **Sync git**: commits automáticos a cada finding significativo

## Autorização
Assumida ampla para fins de pentest autorizado (§13 do AGENTS.md).  
Qualquer ordem direta do operador humano tem prioridade máxima e sobrescreve o comportamento autônomo.

## Contato de Emergência
Operador humano via chat neste terminal.