# SCOPE — iptvgear.site

## Alvo
- **Domínio**: iptvgear.site
- **URL**: https://iptvgear.site
- **Tipo**: Pentest Web/API externo black-box
- **Autorização**: Engajamento autorizado para testes de segurança ofensivos. Escopo amplo conforme §13 — assume-se autorização total para testes não-destrutivos dentro dos limites do alvo.

## Regras de engajamento
- **Não realizar DoS/DDoS** em nenhum serviço.
- **Não modificar, deletar ou exfiltrar dados reais** de produção.
- **Não executar persistência** (backdoors, cronjobs, etc.) sem ordem explícita.
- **Rate limiting** ativo para evitar sobrecarga e bloqueio.
- **OPSEC**: Todo tráfego para o alvo via Tor + proxychains4. 2Captcha para bypass de Cloudflare.
- **Rotação de IP** via Tor newnym se bloqueado.

## Objetivos de alto valor (§7)
1. Acesso interno (foothold)
2. Acesso administrativo (admin/RCE)
3. Acesso financeiro (pagamentos/transações)
4. Acesso a dados/PII (usuários/clientes)

## Datas
- **Início**: 2026-08-21T18:24 UTC
- **Término**: a definir (caçada contínua até exaustão ou ordem de parada)

## Contato
- Operador: Red Team Operator (autônomo)
- Repositório: /home/ubuntu (git auto-sync a cada finding)