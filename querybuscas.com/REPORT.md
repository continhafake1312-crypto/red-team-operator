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
endereço, parentes, nome dos pais, score de crédito, placa/RENAVAM, BIN de cartão,
TÍTULO DE ELEITOR, CNS, CHAVE PIX, RENDA, RAÇA, ÓBITO e mais (70+ módulos).
Pagamento via PIX, ativação na hora. Contato exclusivamente via Telegram. Domínio
jovem (2026-05), registrante no Peru com WHOIS privacy. Tudo atrás de Cloudflare.

**Arquitetura:** 2 apps separados com mesmo user DB:
- **apex** (querybuscas.com) — marketing SPA + consultas PII + Telegram + pagamento
- **api** (api.querybuscas.com) — painel admin/cliente + `/api/admin` + `/health`

**Status:** Fases 2+3 (recon passivo+ativo) concluídas. 4 subdomínios vivos mapeados,
painel admin + API login confirmados. IP de origem real não descoberto (Cloudflare
bem configurado). **Login da API não tem Turnstile** (só rate limit 5/window) —
alvo #1 para auth brute force. IDOR oracle confirmado em `/api/telegram/data/<md5>`.

## Tabela de findings (22 total — 11 passivos + 12 ativos)

| ID | Severidade | Título | Host | Fase |
|----|-----------|--------|------|------|
| F-P1/F-A1 | Crítica | Plataforma de consultas PII (70+ módulos: CPF/RG/CNH/score/renda/parentes/PIX/TITULO_ELEITOR/RACA/OBITO) | apex+api | 2+3 |
| F-P2 | Alta | `/pages/admin` existe (HTTP 302 auth) — painel admin | querybuscas.com | 2 |
| F-P3 | Alta | `api.querybuscas.com` — app de API separado com login | api | 2 |
| F-P4 | Alta | `bot2.querybuscas.com` — 401 (API/bot autenticado) | bot2 | 2 |
| F-P6 | Alta | `/api/telegram/data/<md5>` — possível IDOR/vazamento | apex | 2 |
| F-A2 | Alta | `/api/admin` endpoint existe no api host (401) | api | 3 |
| F-A3 | Alta | `/api/telegram/data/<md5>` IDOR oracle confirmado (invalid_id vs not_found_or_expired) | apex | 3 |
| F-A4 | Alta | api login sem Turnstile (melhor alvo p/ brute force, rate 5/window) | api | 3 |
| F-P5/F-A8 | Info | `bot.querybuscas.com` — 502 (origin down) | bot | 2+3 |
| F-P7 | Média | Endpoints de pagamento PIX (`/api/gerar-pix`, `/api/pagamento/verificar`) | apex | 2 |
| F-A5 | Média | `/health` info disclosure (`{"ok":true,"clients":13}`) | api | 3 |
| F-A6 | Média | bot2 401 global (auth middleware, origin vivo) | bot2 | 3 |
| F-A7 | Média | gerar-pix rate limit GLOBAL (30/window — DoS de cota) | apex | 3 |
| F-P8/F-A9 | Baixa | Ausência de HSTS no apex | apex | 2+3 |
| F-P9 | Baixa | Sem SPF/DMARC/MX | apex | 2 |
| F-P10 | Info | Favicon hash `-491867804` (Shodan correlation) | — | 2 |
| F-P11 | Info | Bots Telegram (@QueryBuscas3Bot etc.) | — | 2 |
| F-A10 | Info | `api_painel_token` cookie (session, não JWT) | api | 3 |
| F-A11 | Info | 2 apps separados c/ user DB compartilhado | apex+api | 3 |
| F-A12 | Info | IP origem real não descoberto (Cloudflare bem configurado) | — | 3 |

## Acessos obtidos

(nenhum até o momento)

## Cronologia

(ver `timeline.log`)
