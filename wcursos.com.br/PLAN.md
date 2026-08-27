# PLAN — wcursos.com.br

## Status: FASE 3 — Recon ativo em andamento

## Fases (§5)
- [x] F1 Escopo + estrutura
- [x] F2 Recon passivo + OSINT → 6 subs, 3 vivos, Sistema Tutor, 74 endpoints /portal/, mail/webmail
- [ ] F3 Recon ativo → recon-active
- [ ] F4 Consolidar attack surface (recon/SUMMARY.md + ranking payoff)
- [ ] F5 Enumeração profunda → enum
- [ ] F6 Ataque webapp → webapp
- [ ] F7 CVE research + exploit → cve + exploit
- [ ] F8 Pós-ex (se foothold) → postex
- [ ] F9 Relatório final → report

## Ranking de payoff (atualizado a cada finding)
| Host/Vetor | Payoff | Notas |
|---|---|---|
| 74 endpoints /portal/* (id=/token=) | CRÍTICO | IDOR/BOLA → PII alunos + financeiro (boleto/pix). Alvo nº1 do webapp |
| /portal/validar-login (CPF+senha) | ALTO | auth bypass / brute / cred default |
| mail/webmail 34.204.156.206 | ALTO | portscan → webmail + Postfix CVEs |
| Sistema Tutor vendor (sistematutor.com.br) | MÉDIO | CVE research do build 1_445 |
| centraldeconcursos.com.br | MÉDIO | infra compartilhada = pivot (fora escopo direto) |
| DMARC p=none + SPF ~all | BAIXO | spoofing possível |

## Backlog de vetores (§19)
| Vetor | Status | Motivo pausa | Gatilho retorno |
|---|---|---|---|
| Cloud buckets (S3/Azure/GCP) | pausado | 0 públicos em 22 variações | nova naming pattern |
| Subdomain takeover | pausado | 0 CNAMEs dangling | novo CNAME |
| OSINT breaches (HIBP) | pausado | sem API key | obter key |

## Notas
- Stack: Sistema Tutor (Java servlet/Struts), AWS EC2 us-east-1 atrás de ALB.
- Soft-404 catch-all: recon/enum/webapp DEVEM diferenciar por hash de conteúdo, não status code.
- Favicon mmh3: -1690780178. reCAPTCHA v3 sitekey: 6Lf9XikaAAAAAIwrj6kpicX6mQhvC6MpkRpJOqC-.
- 2Captcha disponível para bypass Cloudflare/reCAPTCHA.
