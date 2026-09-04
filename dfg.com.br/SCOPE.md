# SCOPE — Engagement de Pentest

## Alvo
- **URL principal:** https://www.dfg.com.br/
- **Domínio raiz:** dfg.com.br
- **Nome do engagement:** dfg.com.br

## Escopo autorizado
- **In-scope:** `*.dfg.com.br` (todos os subdomínios), IPs de origem real
  descobertos, serviços expostos, APIs, painéis administrativos, buckets
  cloud relacionados ao domínio.
- **Domínios afiliados incluídos (decisão do coordenador — Fase 2):**
  - `portaldfg.com.br` — usa marca "DFG", mesmo nicho de negócio (owner:
    Francisco Geovane). Brand-affiliated.
  - `astarium.com` — compartilha infra de email (Contabo VPS com PTR
    `mail.astarium.com` listado no SPF de dfg.com.br). Infra-affiliated.
- **Out-of-scope:** domínios de terceiros não afiliados, serviços
  externos não pertencentes à DFG nem afiliados.

## Regras de engajamento
- **Autorização:** assume autorização ampla (§13) — pentest black-box
  autorizado pelo operador.
- **Abordagem:** black-box externo (Web/API + externo).
- **OPSEC:** Tor + proxychains4 em TODOS os scans/requests ao alvo.
  2Captcha para bypass de Cloudflare. Nunca usar IP real do operador.
- **Intensidade:** não-destrutiva. Sem DoS, sem modificação de dados,
  sem persistência sem ordem explícita.
- **Rate limiting:** espaçar requests, UA rotativo, stealth.

## Objetivos de alto valor (§7)
- Acesso a painel administrativo / interno
- Vazamento de PII / dados de clientes
- Credenciais válidas / foothold
- Acesso a dados financeiros

## Diretório do engagement
`/home/ubuntu/red-team-operator/dfg.com.br/`

## OPSEC específico
- Chave 2Captcha: `~/.config/opencode/.2captcha_key` (chmod 600, fora do repo)
- Tor: ativo (`socks5 127.0.0.1:9050`)
- proxychains4: strict_chain → socks5 127.0.0.1 9050

## Sync Git
Repo: `red-team-operator` (branch `main`). Auto-sync a cada finding/cred/acesso.
