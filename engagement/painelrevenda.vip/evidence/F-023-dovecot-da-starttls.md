# F-004 Dovecot DA — IMAP com STARTTLS, Autenticação Restrita

**Alvo:** painelrevenda.vip (186.194.52.218)
**Severidade:** Baixa (Info)
**Timestamp:** 2026-09-03T06:33:00Z
**CVE Potencial:** CVE-2022-30550 (Dovecot 2.3.x RCE via auth)

## Reprodução

```bash
# Banner IMAP (porta 143)
$ echo "" | proxychains4 nc -w 5 186.194.52.218 143
* OK [CAPABILITY IMAP4rev1 LOGIN-REFERRALS ID ENABLE IDLE SASL-IR LITERAL+ STARTTLS LOGINDISABLED] Dovecot DA ready.

# IMAP over SSL (porta 993)
$ echo -e "a1 CAPABILITY\na2 LOGOUT" | openssl s_client -connect 186.194.52.218:993 -quiet
* OK [CAPABILITY IMAP4rev1 LOGIN-REFERRALS ID ENABLE IDLE SASL-IR LITERAL+ AUTH=PLAIN] Dovecot DA ready.
* CAPABILITY IMAP4rev1 LOGIN-REFERRALS ID ENABLE IDLE SASL-IR LITERAL+ AUTH=PLAIN

# ID command — versão não exposta
$ echo -e 'a1 ID ("name" "Dovecot" "version" "details")\r\na2 LOGOUT\r\n' | openssl s_client -connect 186.194.52.218:993 -quiet
* ID ("name" "Dovecot")
```

```bash
# STARTTLS funciona
$ a1 CAPABILITY
* CAPABILITY IMAP4rev1 LOGIN-REFERRALS ID ENABLE IDLE SASL-IR LITERAL+ STARTTLS LOGINDISABLED
$ a2 STARTTLS
* OK Begin TLS negotiation now.
```

```bash
# Tentativa de login cleartext — bloqueada
$ a1 LOGIN admin admin
* BAD [ALERT] cleartext authentication not allowed without SSL/TLS, but your client did it anyway.
a1 NO [PRIVACYREQUIRED] Cleartext authentication disallowed on non-secure (SSL/TLS) connections.
```

## Interpretação

- **Dovecot DA**: Build do Dovecot para DirectAdmin — versão exata não exposta
- **LOGINDISABLED** na porta 143 (antes de STARTTLS): Boa prática — impede credenciais em texto claro
- **AUTH=PLAIN** na porta 993: Autenticação PLAIN disponível sobre SSL (padrão)
- Certificado Let's Encrypt para `br63-da.valueserver.net.br`

**CVE-2022-30550** (CVSS 8.8, RCE via autenticação): versão exata necessária para confirmar.

## Impacto

- Sem credenciais válidas, não é possível testar CVE-2022-30550
- Configuração de segurança razoável (LOGINDISABLED, STARTTLS)
- Risco principal: brute-force de senhas se usuários forem enumerados

## Recomendação

1. Manter Dovecot atualizado
2. Implementar fail2ban para proteção contra brute-force
3. Usar sempre conexões SSL/TLS

## Próximo passo

Se credenciais de email forem obtidas (via cred-stuffing, vazamentos), testar:
- Login IMAP com `AUTH=PLAIN` na porta 993
- CVE-2022-30550: testar autenticação com payload malicioso
- Enumeração de mailboxes e dados sensíveis