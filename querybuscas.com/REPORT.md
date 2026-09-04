# REPORT.md — Pentest querybuscas.com

## Metadados

| Campo | Valor |
|-------|-------|
| **Alvo** | `querybuscas.com` (`https://querybuscas.com/`) |
| **Tipo** | Web/API + Externo (black-box) |
| **Início** | 2026-09-04T03:14Z |
| **Operador** | Red Team Operator (autônomo) |
| **OPSEC** | Tor + proxychains4, 2Captcha, UA rotativo |
| **Autorização** | Amplamente autorizada (§13) |

## Sumário executivo

**querybuscas.com** é uma plataforma de consultas PII (data-broker brasileiro)
que vende lookups de dados sensíveis de terceiros: CPF, RG, CNH, CNPJ, telefone,
endereço, parentes, nome dos pais, score de crédito, placa/RENAVAM, BIN de cartão
e "CPF para consultar o PIX". 40+ módulos ativos, pagamento via PIX, ativação na
hora. Contato exclusivamente via Telegram. Domínio jovem (2026-05), registrante
no Peru com WHOIS privacy. Tudo atrás de Cloudflare (CDN/WAF/Turnstile).

**Status:** Fase 2 (recon passivo) concluída. 4 subdomínios vivos mapeados, painel
admin e API com login confirmados. IP de origem real não descoberto (todas as
técnicas passivas esgotadas — requer recon ativo).

## Tabela de findings preliminares (recon passivo)

| ID | Severidade | Título | Host | Status |
|----|-----------|--------|------|--------|
| F-P1 | Crítica | Plataforma de consultas PII (40+ módulos: CPF/RG/CNH/score/BIN/PIX) | querybuscas.com | Confirmado (passivo) |
| F-P2 | Alta | `/pages/admin` existe (HTTP 302 auth) — painel admin | querybuscas.com | Confirmado (passivo) |
| F-P3 | Alta | `api.querybuscas.com` — app de API separado com login | api.querybuscas.com | Confirmado (passivo) |
| F-P4 | Alta | `bot2.querybuscas.com` — 401 (API/bot autenticado) | bot2.querybuscas.com | Confirmado (passivo) |
| F-P5 | Média | `bot.querybuscas.com` — 502 (origin down) | bot.querybuscas.com | Confirmado (passivo) |
| F-P6 | Alta | `/api/telegram/data/<md5>` — possível IDOR/vazamento (token observado) | apex/api | Confirmado (passivo) |
| F-P7 | Média | Endpoints de pagamento PIX (`/api/gerar-pix`, `/api/pagamento/verificar`) | apex | Confirmado (passivo) |
| F-P8 | Baixa | Ausência de HSTS no apex (inconsistente com api) | querybuscas.com | Confirmado (passivo) |
| F-P9 | Baixa | Sem SPF/DMARC/MX | querybuscas.com | Confirmado (passivo) |

## Detalhamento de findings preliminares

### F-P1 (Crítica) — Plataforma de consultas PII
- **Host:** querybuscas.com (apex)
- **Stack:** Node.js + Express + Cloudflare (CDN/WAF/Turnstile)
- **Catálogo de módulos (40+):** BIN (cartão), CPF, CNPJ, CNH, RG, EMAIL/EMAILS,
  EMPRESAS, ENDERECOS, PARENTES, NOME/NOME_FANTASIA/NOME_MAE/NOME_PAI, PLACA/
  Placa Nacional, RENAVAM, PROFISSAO, SCORE, Socios, TELEFONE/TELEFONES, INSS,
  "CPF para consultar o PIX".
- **Impacto:** Acesso a estes dados = vazamento massivo de PII (objetivo de alto valor).
- **Próximo passo:** enum → webapp (IDOR/BOLA em /api/user/modulos, /pages/consultas/*)

### F-P2 (Alta) — Painel admin exposto
- **Host:** querybuscas.com
- **Endpoint:** `/pages/admin` → HTTP 302 (auth-protected)
- **Próximo passo:** webapp — auth bypass / default creds no painel admin

### F-P3 (Alta) — API com login
- **Host:** api.querybuscas.com (app separado, HSTS preload)
- **Título:** "QueryBuscas API — Login"
- **Assets:** `/assets/js/login.js?v=2`, `/assets/js/common.js?v=2`
- **Próximo passo:** enum JS, webapp auth bypass, JWT, mass-assignment

### F-P4 (Alta) — bot2 autenticado
- **Host:** bot2.querybuscas.com → HTTP 401 (origin retorna 401 sem auth)
- **Próximo passo:** descobrir esquema de auth, IDOR, token brute

### F-P6 (Alta) — Endpoint Telegram com token
- **Endpoint:** `/api/telegram/data/<md5>` (token `61e7e973214471da2fe33fb992745fef`)
- **Próximo passo:** webapp — IDOR no token, enumeration, vazamento de dados

## Attack surface consolidada

(ver `recon/SUMMARY.md` após conclusão do recon ativo — Fase 4)

## Attack surface preliminar (recon passivo)

| Host | Stack | Status | Notas |
|------|-------|--------|-------|
| querybuscas.com (apex) | Node.js/Express + Cloudflare | 200 | Marketing SPA, /pages/admin (302), /pages/consultas/* |
| api.querybuscas.com | Node.js (oculto) + Cloudflare | 200 | "QueryBuscas API — Login", HSTS preload |
| bot.querybuscas.com | Cloudflare (origin down) | 502 | Origin backend down/misconfig |
| bot2.querybuscas.com | Cloudflare (origin 401) | 401 | API/bot autenticado (Telegram webhook?) |

**Endpoints de auth mapeados:** `/api/auth/{login,verify,pre-register,complete-reset,logout}`, `/api/user/modulos`, `/api/gerar-pix`, `/api/pagamento/verificar`, `/api/telegram/data/<token>`

**IP de origem real:** NÃO descoberto (todos atrás de Cloudflare 104.21.91.102 / 172.67.215.155)

**Favicon hash (Shodan):** `-491867804`

## Acessos obtidos

(nenhum até o momento)

## Cronologia

(ver `timeline.log`)
