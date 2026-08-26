# PLAN — arkodex.com.br

## Status Atual
- **Fase:** 5 — Enumeração Profunda / CVE Research
- **Progresso:** 65%
- **Última atualização:** 2026-08-26T12:45:00Z

## Vetores Prioritários (Ranking de Payoff)
| # | Vetor | Prioridade | Status | Notas |
|---|-------|-----------|--------|-------|
| 1 | **IDOR em APIs auth** (`/api/orders/*`, `/api/clients/*`, `/api/analytics/*`) | 🔴 ALTA | Pendente | Enviar para enum/webapp |
| 2 | **Auth bypass** (`/api/me`, `/api/payment`, `/api/checkout`) | 🔴 ALTA | Pendente | JWT none alg, null token, SQLi |
| 3 | **JS analysis profundo** do bundle SPA (334KB) | 🔴 ALTA | Pendente | Extrair mais endpoints/param |
| 4 | **PowerDNS 4.9.3 enumeração** (porta 53) | 🟡 MÉDIA | Pendente | Zone walk, brute force |
| 5 | **CVE Research** Python 3.12.13, PowerDNS, Caddy, discloud.com | 🟡 MÉDIA | ✅ Concluído | 9+ CVEs PowerDNS, 1 CVE Caddy (PoC baixado), 0 CVEs discloud |
| 6 | **SSRF** em `/api/gallery`, `/api/sources` | 🟡 MÉDIA | Pendente | Se aceitarem URLs |
| 7 | **CRED-stuffing** contato.luan.david@gmail.com | 🟡 MÉDIA | Pendente | Senha reutilizada |
| 8 | **Dados expostos via APIs públicas** | 🟢 BAIXA | Confirmado | F-001 |
| 9 | **AWS Instance ID exposto** | 🟢 BAIXA | Confirmado | F-004 |

## Backlog de Vetores Pausados
| Vetor | Motivo da Pausa | Gatilho de Retorno |
|-------|-----------------|-------------------|
| TCP scan completo na origem | GCP firewall restritivo (apenas 3 portas) | Se encontrar bypass para Caddy |
| arkanostore.com.br | Cloudflare bloqueia requests | Se encontrar IP real |
| arksteam.mginex.site | Cloudflare JS challenge | Se encontrar bypass |
| Cred-stuffing | Aguardar encontrar painel de login | Após enum/webapp encontrar endpoints de auth |

## Gatilhos de Retorno
- Se encontrar credencial válida → pivotar para exploit
- Se encontrar endpoint de login → testar cred-stuffing
- Se encontrar IDOR confirmado → escalar para admin/billing
- Se encontrar SSRF funcional → pivotar para cloud/rede interna