# Relatório de Pentest — teste-iptv.mov

**Engagement:** teste-iptv.mov
**Início:** 2026-08-22T00:00:00Z
**Status:** Em andamento — Fase 6 (Ataque WebApp) concluída

---

## Sumário Executivo
Fase 6 (Ataque WebApp) concluída sem acessos obtidos. O principal fator
limitante foi o Cloudflare WAF com Turnstile JS Challenge no domínio
**cliquex.click**, que impediu todos os testes de autenticação, injeção
e IDOR.

Nenhum payload de XSS, SQLi, SSTI, Command Injection ou Open Redirect
foi confirmado em nenhum alvo. Os domínios teste-iptv.mov e playbrasil.top
foram confirmados como sites estáticos (SPA/sitemap) sem processamento
server-side.

---

## Findings por Severidade

### Crítico
*Nenhum*

### Alto
*Nenhum*

### Médio
*Nenhum — Cloudflare Turnstile impediu testes de auth em cliquex.click*

### Baixo
*Nenhum novo — F-102 (Open Redirect) confirmado como hardcoded*

### Informativo
| ID | Título | Alvo |
|----|--------|------|
| F-101 | Cloudflare Turnstile Blocking Auth Access | cliquex.click |
| F-102 | WhatsApp Endpoint Hardcoded Redirect | cliquex.click |
| F-103 | Action Parameter Inerte | playbrasil.top |
| F-104 | Static SPA — Zero Server-Side Processing | teste-iptv.mov |
| F-105 | WhatsApp Number in Client-Side Config | teste-iptv.mov |
| F-106 | No XSS/Injection Vectors Confirmed | playbrasil.top |
| F-107 | Cloudflare WAF Impenetrável via Automação | cliquex.click |

---

## Acessos Obtidos
*Nenhum — Cloudflare Turnstile intransponível via automação*

---

## Evidências Coletadas
| Evidência | Host | Severidade | Arquivo |
|-----------|------|-----------|---------|
| F-101 Turnstile Blocking | cliquex.click | Info | `evidence/F-101.txt` |
| F-102 Redirect Hardcoded | cliquex.click | Baixa | `evidence/F-102.txt` |
| F-103 Action Parameter Inerte | playbrasil.top | Info | `evidence/F-103.txt` |
| F-104 Static SPA | teste-iptv.mov | Info | `evidence/F-104.txt` |
| F-105 WhatsApp Disclosure | teste-iptv.mov | Info | `evidence/F-105.txt` |
| F-106 No XSS | playbrasil.top | Info | `evidence/F-106.txt` |
| F-107 WAF Impenetrável | cliquex.click | Info | `evidence/F-107.txt` |

---

## Objetivos de Alto Valor
| Objetivo | Status | Evidência |
|----------|--------|-----------|
| Acesso administrativo / painel de controle | ❌ Não atingido — CF bloqueia /login | F-101, F-107 |
| Dados de usuários / PII / credenciais | ❌ Não atingido — sem acesso ao backend | F-101 |
| Informações financeiras / pagamentos | ❌ Não atingido | — |
| Código fonte / segredos de aplicação | ❌ Não atingido — tudo estático | F-104 |
| Acesso a infraestrutura subjacente | ❌ Não atingido — IP real oculto | F-107 |

---

## Log de Atividades
*Ver `timeline.log` para cronologia detalhada.*