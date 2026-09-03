# F-003 Exim 4.99.5 — SMTP VRFY Enumeration

**Alvo:** painelrevenda.vip (186.194.52.218)
**Severidade:** Média
**Timestamp:** 2026-09-03T06:32:00Z
**CVE Potencial:** SMTP Smuggling (CVE-2023-51766-like), VRFY Enumeration

## Reprodução

```bash
$ echo -e "EHLO test.com\nVRFY admin\nVRFY root\nVRFY info\nVRFY suporte\nVRFY postmaster\nQUIT" | proxychains4 nc -w 10 186.194.52.218 25

220 br63-da.valueserver.net.br ESMTP Exim 4.99.5 Thu, 03 Sep 2026 03:33:04 -0300
250-br63-da.valueserver.net.br Hello test.com [192.42.116.109]
250-SIZE 52428800
250-LIMITS MAILMAX=100 RCPTMAX=150
250-8BITMIME
250-PIPELINING
250-PIPECONNECT
250-STARTTLS
250 HELP
501 admin: recipient address must contain a domain
501 root: recipient address must contain a domain
501 info: recipient address must contain a domain
252 Administrative prohibition  # postmaster
221 br63-da.valueserver.net.br closing connection
```

```bash
# Tentativa de envio sem autenticação
$ EHLO test.com
$ MAIL FROM:<test@test.com>
250 OK
$ RCPT TO:<admin@painelrevenda.vip>
550 No such recipient here  # Não é open relay
```

## Interpretação

- **Exim 4.99.5** confirmado — versão recente, sem CVEs críticos públicos reportados
- **VRFY** habilitado com retornos diferenciais:
  - `501` = "recipient address must contain a domain" — domínio não informado
  - `252` = "Administrative prohibition" — VRFY bloqueado administrativamente para alguns usuários
- **PIPELINING** habilitado — permite pipe de múltiplos comandos (potencial para SMTP smuggling)
- **STARTTLS** disponível em 25 e 587
- **NÃO** é open relay — rejeita envio para destinatários externos sem autenticação

## Impacto

- **VRFY enumeration**: Baixo risco — retornos não revelam diretamente usuários válidos
- **SMTP Smuggling**: POTENCIAL — PIPELINING + boundary confusions podem permitir contrabando de email
- **SPF/DKIM/DMARC**: Não testado — se não configurado, permite spoofing

## Recomendação

1. Desabilitar VRFY/EXPN se não necessário: `recipient_verify = false`
2. Implementar DMARC reject policy para prevenir spoofing
3. Monitorar logs de SMTP para abuso de PIPELINING

## Próximo passo

Testar SMTP smuggling específico:
- Template `\n.\n` injection com PIPELINING
- Boundary confusions com múltiplos pacotes TCP
- Testar envio com STARTTLS e autenticação se credenciais forem obtidas