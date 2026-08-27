# REPORT.md — Engagement caveira.com

> Relatório incremental. Atualizado a cada fase/finding.

## Metadados
- **Alvo:** caveira.com (https://caveira.com)
- **Negócio:** (a determinar no recon)
- **Owner/Operador:** Red Team Operator
- **Início:** 2026-08-27T03:24Z
- **Status:** EM ANDAMENTO
- **OPSEC:** Tor + proxychains4 (socks5), 2Captcha para bypass CF, UA rotativo

## Sumário executivo
- **1 finding cloud confirmado (Alta):** subdomain takeover em `skull.homo.caveira.com`
  via CNAME dangling para slug Netlify não-claimado (`strong-naiad-3ab1bd`).
  Fingerprint Netlify 404 "Not Found - Request ID:" (text/plain, `server: Netlify`)
  confirmado por comparação com slug aleatório inexistente (mesma resposta) e com
  site Netlify claimado (200 HTML). Subdomínio em ambiente de homologação trustado
  pela marca caveira.com — vetor de phishing/defacement credivel.

## Tabela de findings

| ID | Título | Host | Severidade | Status |
|----|--------|------|------------|--------|
| C-001 | Subdomain Takeover (Netlify dangling CNAME) | skull.homo.caveira.com | Alta | Confirmado (não-claimado) |

## Attack surface consolidada
(ver recon/SUMMARY.md após fase 4)

## Acessos obtidos
(nenhum ainda)

## Objetivos de alto valor
(nenhum atingido ainda)

## Cronologia
(ver timeline.log)
