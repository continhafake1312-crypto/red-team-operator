# Attack Surface — fernandapessoa.com.br

**Gerado:** 2026-08-27T04:59Z (após Fase 3 — Recon Ativo)

## IPs de Origem Real (não-Cloudflare)

| IP | Hosts | Serviços Descobertos | Notas |
|----|-------|----------------------|-------|
| **187.45.185.33** | cpanel, whm, webmail, mail, envio, fpessoacloud, cpcalendars, cpcontacts, webdisk, acaorelampago | nginx, Exim 4.99.5, Dovecot pop3d/imapd, cPanel/WHM login | Servidor cPanel completo |
| **187.45.187.194** | envio (alternate) | nginx | IP balanceamento do envio |
| **54.165.96.105** | smtp01 | Postfix, Dovecot imapd | AWS us-east-1 (EC2) |
| **177.44.191.252** | wpp | Portas 2000, 5060 (SIP?) | Windows, sem HTTP aberto |
| **198.49.75.243** | fpessoacloud2, ns2 | **Nenhuma porta aberta** | Firewall stateful, bloqueia tudo |

## Port Scan Summary

### 187.45.185.33 — 8 portas abertas
| Porta | Serviço | Versão | Detalhe |
|-------|---------|--------|---------|
| 80 | HTTP | nginx | 403 Forbidden |
| 110 | POP3 | Dovecot pop3d | Let's Encrypt TLS |
| 143 | IMAP | Dovecot imapd | Let's Encrypt TLS |
| 443 | HTTPS | nginx | Redirect → acaorelampago |
| 587 | SMTP | Exim 4.99.5 | Auth required, NOT open relay |
| 995 | POP3S | Dovecot pop3d | SSL |
| 2083 | HTTPS cPanel | nginx | **cPanel Login** |
| 2096 | HTTPS cPanel | nginx | cPanel alternativa |

### 54.165.96.105 — 3 portas abertas
| Porta | Serviço | Versão |
|-------|---------|--------|
| 143 | IMAP | Dovecot imapd (STARTTLS) |
| 587 | SMTP | Postfix (NOT open relay, STARTTLS required) |
| 993 | IMAPS | Dovecot imapd (SSL) |

### 177.44.191.252 — 2 portas abertas
| Porta | Serviço | Notas |
|-------|---------|-------|
| 2000 | cisco-sccp? | Serviço desconhecido |
| 5060 | SIP | Conexão TCP, não responde OPTIONS |

### 198.49.75.243 — 0 portas abertas (firewall total)

## WAF Detection

| Alvo | WAF | Notas |
|------|-----|-------|
| `cpanel.fernandapessoa.com.br` | **Firewall nível conexão** | Bloqueio detectado |
| `whm.fernandapessoa.com.br` | **Nenhum WAF** ✅ | Painel WHM sem proteção! |
| `webmail.fernandapessoa.com.br` | Provável firewall | Similar ao cpanel |
| `fernandapessoa.com.br` | **Cloudflare** | WAF Cloudflare |
| `wpp.fernandapessoa.com.br` | Fora do ar | 502/403 |

## TLS Findings
- **187.45.185.33**: Let's Encrypt YR1, RSA 2048, TLS 1.2/1.3, Forward Secrecy OK
- **54.165.96.105**: Let's Encrypt YE1, EC-256 (ECDSA), TLS 1.2/1.3
- **fernandapessoa.com.br**: Cloudflare, TLS 1.2/1.3

## Ranking de Payoff (Atualizado pós-Fase 3)

### 🔴 CRÍTICO (ataque direto, sem proteção)
1. **whm.fernandapessoa.com.br (187.45.185.33)** — **SEM WAF!** Painel WHM exposto. Cred-stuffing prioritário.
2. **cpanel.fernandapessoa.com.br (187.45.185.33)** — Painel admin cPanel, firewall detectado mas testável.
3. **webmail.fernandapessoa.com.br (187.45.185.33)** — Roundcube exposto, CVEs conhecidos.

### 🟡 ALTO
4. **envio.fernandapessoa.com.br (187.45.185.33)** — **Directory listing ativo.** Arquivos expostos.
5. **mail.fernandapessoa.com.br (187.45.185.33)** — Directory listing (redirect HTTPS).
6. **194.45.185.33:587 — Exim 4.99.5** — MTA exposto, CVE research necessário.
7. **app.fernandapessoa.com.br** — Next.js → API endpoints.
8. **loja.fernandapessoa.com.br** — WooCommerce 10.7.
9. **fernandapessoa.com.br** — WP 7.1.

### 🟡 MÉDIO
10. **smtp01 (54.165.96.105)** — Postfix + Dovecot AWS.
11. **GitHub org** — trufflehog scan.
12. **emails dev** — breach check.
13. **177.44.191.252** — SIP/VoIP appliance.

### 🟢 BAIXO
14. **198.49.75.243** — Sem portas abertas.

## Ações Imediatas Recomendadas (Atualizado)

1. ✅ **Port scan completo** — REALIZADO em todos os 5 hosts
2. 🔲 **Cred-stuffing WHM** (prioridade máxima — SEM WAF)
3. 🔲 **Cred-stuffing cPanel** (segundo WHM)
4. 🔲 **Cred-stuffing Roundcube/Webmail**
5. 🔲 **Enum directory listing envio** — buscar arquivos/configs expostos
6. 🔲 **CVE research Exim 4.99.5** — RCE candidates
7. 🔲 **GitHub trufflehog** nos 19 repos
8. 🔲 **Enum Next.js app.fernandapessoa.com.br** — rotas internas via _buildManifest.js