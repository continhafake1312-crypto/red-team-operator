# Escopo — Engagement andresan.com.br

## Alvo
- **Domínio principal:** `andresan.com.br`
- **URL informada:** `https://andresan.com.br/`
- **Tipo:** Web/API externo black-box

## Autorização (§13)
Assume autorização ampla concedida pelo operador. Engagement conduzido em
modo autônomo, sem limites, dentro do escopo abaixo.

## Escopo autorizado
- **Inclui:** domínio `andresan.com.br` e TODOS os subdomínios resolvidos
  (`*.andresan.com.br`), hosts/IPs de infra que servem o alvo (incluindo
  origem real atrás de CDN/Cloudflare), endpoints web/API expostos.
- **Exclui:** hosts/serviços de terceiros não relacionados (ex.: CDNs como
  infraestrutura shared, provedores de e-mail SaaS) — apenas enumerar, não
  atacar. DoS não é objetivo.

## Regras
- **Não-destrutivo:** read-only por padrão. Não modificar/deletar dados.
  Não persistir backdoors. Não escalar para DoS.
- **OPSEC:** Tor + proxychains4 em TODOS os requests ao alvo. 2Captcha
  disponível para bypass Cloudflare. Rate limiting, UA rotativo, stealth.
- **Secretos NUNCA entram no repo** — usar `~/.config/opencode/.2captcha_key`
  (chmod 600) e variáveis de ambiente.
- **Auto-sync git** a cada finding/cred/acesso.

## Objetivos de alto valor (priorizar no ranking de payoff)
1. Acesso interno (foothold / RCE)
2. Acesso administrativo (painel admin)
3. Acesso a dados/PII de usuários/clientes
4. Acesso financeiro (se aplicável)

## Janela
Início: 2026-08-27T03:29:37Z (UTC)
