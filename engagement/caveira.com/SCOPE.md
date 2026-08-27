# SCOPE.md — Engagement caveira.com

## Alvo
- **Domínio principal:** caveira.com
- **URL:** https://caveira.com
- **Tipo:** Web/API externo black-box

## Escopo
- **In-scope:** caveira.com e TODOS os subdomínios (*.caveira.com) resolvidos
- **Out-of-scope:** hosts de terceiros não pertencentes ao domínio (CDN edge nodes, analytics de terceiros, provedores de email externos)
- **Autorização:** Assume autorização ampla (§13) — engagement autorizado pelo operador

## Regras de engajamento
- **Não-destrutivo:** Nenhum DoS, modificação ou deleção de dados
- **OPSEC:** Tor + proxychains4 em TODOS os scans/requests ao alvo; IP real do operador NUNCA usado contra o alvo
- **Bypass Cloudflare:** 2Captcha habilitado (chave em ~/.config/opencode/.2captcha_key, chmod 600, fora do repo)
- **Stealth:** Rate limiting, user-agent rotativo, rotação de circuitos Tor (NEWNYM) se bloqueado
- **Secretos:** Nunca entram no repo (variáveis de ambiente ou arquivos chmod 600 fora do repo)

## Objetivos de alto valor (priorizar no ranking de payoff)
1. Acesso interno (foothold)
2. Acesso administrativo (admin/RCE)
3. Acesso financeiro (pagamentos/transações)
4. Acesso a dados/PII (usuários/clientes)

## Estado
- **Status:** EM ANDAMENTO
- **Início:** 2026-08-27T03:24Z
