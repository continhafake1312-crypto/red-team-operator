# Escopo do Engagement — fernandapessoa.com.br

## Alvo
- **Domínio principal:** `fernandapessoa.com.br`
- **URL:** `https://fernandapessoa.com.br/`
- **Tipo:** Web/API externo black-box

## Autorização
Engagement autorizado pelo operador. Assume autorização ampla (§13 do
AGENTS.md) para todo o domínio `fernandapessoa.com.br` e seus
subdomínios. Nenhuma ação técnica dentro do escopo requer confirmação.

## Fora de escopo
- Hosts/serviços que não pertençam ao domínio `fernandapessoa.com.br`
  ou à infra identificada do alvo.
- DoS / degradação do alvo não é objetivo (§13).

## Objetivos de alto valor (§7)
1. Acesso interno (foothold)
2. Acesso administrativo (admin/RCE)
3. Acesso financeiro (pagamentos/transações)
4. Acesso a dados/PII (usuários/clientes)

## Regras de engajamento
- **OPSEC:** Tor + proxychains4 em TODOS os scans/requests ao alvo.
  Rotação de IP via Tor NEWNYM se bloqueado. User-agent rotativo,
  rate limiting, stealth. 2Captcha para bypass Cloudflare (chave em
  `~/.config/opencode/.2captcha_key`, chmod 600, fora do repo).
- **Exploração não-destrutiva:** read-only, não modificar dados,
  não persistir sem ordem explícita.
- **Secretos:** NUNCA entram no repo — variáveis de ambiente ou
  arquivos chmod 600 fora do repo.

## Artefatos
- `PLAN.md` — backlog de vetores + status
- `REPORT.md` — relatório incremental
- `timeline.log` — cronologia ISO8601
- `recon/SUMMARY.md` — attack surface + ranking de payoff
- `evidence/F-XXX.txt` — evidências de findings

## Diretório do engagement
`/home/ubuntu/fernandapessoa.com.br/`
