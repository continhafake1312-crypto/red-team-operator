# F-003 — INFOSEG Requer Autenticação (P-001 Refutada Parcialmente)

**Severidade:** 🟡 Média (Endpoint ativo, mas requer autenticação)
**Host:** infoseg.sinesp.gov.br
**Endpoint:** https://infoseg.sinesp.gov.br/infoseg2/?q=00741926202
**Data:** 2026-09-06

## Descrição

O endpoint `/infoseg2/` do INFOSEG está ativo e responde a consultas, mas redireciona para o login do SINESP (`seguranca.sinesp.gov.br`). Não há vazamento direto de dados de CPF sem autenticação.

## Teste realizado

```bash
proxychains4 curl -v -k -L "https://infoseg.sinesp.gov.br/infoseg2/?q=00741926202"
```

## Resposta
```
HTTP/1.1 302 Moved Temporarily
Location: https://seguranca.sinesp.gov.br/sinesp-seguranca/login.jsf?goto=INFOSEG
```

## Conclusão

O endpoint confirma que o gateway INFOSEG existe e redireciona para o login, mas **não expõe dados de CPF sem autenticação**. O P-001 (CPFs expostos em URLs públicas) é parcialmente refutado: embora haja URLs no Wayback com CPFs, o acesso direto requer sessão autenticada.

**Risco:** Se um usuário com sessão ativa no SINESP visitar `infoseg.sinesp.gov.br/infoseg2/?q=CPF`, os dados do CPF serão exibidos (potencial CSRF/IDOR via goto).