# SCOPE.md — Engagement tempfiles.com.ar

## Alvo
- **URL**: https://tempfiles.com.ar/V8OoztG
- **Domínio base**: tempfiles.com.ar
- **Tipo**: Serviço de compartilhamento de arquivos (file sharing)

## Escopo Autorizado
Assume-se **autorização ampla** (§13 AGENTS.md) para:
- Reconhecimento passivo e ativo (DNS, subdomínios, portas, serviços)
- Enumeração de endpoints web, APIs, parâmetros
- Testes de vulnerabilidades OWASP Top 10 (não-destrutivos)
- Pesquisa de CVEs e validação de exploits (não-destrutivos)
- Pós-exploração apenas se foothold confirmado

## Fora de Escopo
- DoS/DDoS
- Modificação/destruição de dados
- Acesso a sistemas não relacionados ao domínio
- Engenharia social

## Regras de Engajamento
- **OPSEC obrigatório**: Tor + proxychains4 em todos os requests ao alvo
- Rate limiting em brute force/enumeração
- User-agent rotativo
- 2Captcha para bypass Cloudflare (se aplicável)
- Secretos **nunca** no repo (variáveis de ambiente/arquivos chmod 600 fora do repo)

## Objetivos de Alto Valor (ranking §7)
1. Acesso interno (foothold / RCE)
2. Acesso administrativo (painel admin, creds válidas)
3. Acesso financeiro (se houver pagamentos/assinaturas)
4. Acesso a dados/PII (arquivos de usuários, metadata)

## Diretório do Engagement
`tempfiles.com.ar/`

## Data de Início
2026-08-22T18:31:00Z