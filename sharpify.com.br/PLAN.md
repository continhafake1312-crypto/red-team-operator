# PLAN — Engagement sharpify.com.br

## Plano Mestre

| Fase | Descrição | Especialista | Status | Achados |
|------|-----------|-------------|--------|---------|
| 1 | Escopo + estrutura | Coordenador | ✅ COMPLETE | - |
| 2 | Recon passivo + OSINT | recon-passive | ⏳ PENDENTE | - |
| 3 | Recon ativo | recon-active | ⏳ PENDENTE | - |
| 4 | Consolidar attack surface | Coordenador | ⏳ PENDENTE | - |
| 5 | Enumeração profunda | enum | ⏳ PENDENTE | - |
| 6 | Ataque webapp | webapp | ⏳ PENDENTE | - |
| 7 | CVE research + exploit | cve / exploit | ⏳ PENDENTE | - |
| 8 | Pós-exploração | postex | ⏳ PENDENTE | - |
| 9 | Relatório final | report | ⏳ PENDENTE | - |

## Ranking de Payoff (Atualizado em: nunca)
*ALTO*:
- Acesso interno (foothold)
- Acesso administrativo (admin/RCE)
- Acesso financeiro (pagamentos/transações)
- Acesso a dados/PII (usuários/clientes)

*MÉDIO*:
- Painéis admin expostos
- Credenciais default/fracas
- Vulnerabilidades HIGH (SQLi, IDOR, SSRF)

*BAIXO*:
- Info disclosure
- Headers faltantes

## Backlog de Vetores
*(nenhum ainda — aguardando recon)*

## Observações
- Cloudflare detectado (cf-mitigated: challenge) — usar 2Captcha para bypass
- Tor + proxychains4 obrigatório
- 2Captcha key disponível em `~/.opencode/.2captcha_key`