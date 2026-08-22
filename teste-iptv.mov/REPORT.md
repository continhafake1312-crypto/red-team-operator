# Relatório de Pentest — teste-iptv.mov

**Engagement:** teste-iptv.mov
**Alvo:** https://teste-iptv.mov/
**Tipo:** Landing page SPA estática para IPTV (serviço de streaming)
**Início:** 2026-08-22T00:00:00Z
**Término:** 2026-08-22T21:30:00Z
**Status:** ✅ Finalizado
**Operador:** Red Team Operator (autônomo)
**OPSEC:** Todo tráfego via Tor + proxychains4. IP real nunca exposto ao alvo.

---

## Sumário Executivo

O engagement no domínio `teste-iptv.mov` (landing page IPTV) identificou **zero vulnerabilidades exploráveis** em 27 findings, todos de severidade **Info ou Baixa**. O principal fator limitante foi o **Cloudflare Full Proxy** com **Turnstile JS Challenge** que bloqueou 100% das tentativas de autenticação e enumeração nos 3 domínios analisados. O alvo principal (`teste-iptv.mov`) é uma **SPA estática** sem processamento server-side. O domínio terceiro `cliquex.click`, que processa leads WhatsApp, possui um painel de login (`/clk`, `/login`) totalmente protegido por Cloudflare — nenhuma ferramenta de automação conseguiu obter `cf_clearance`. O domínio irmão `playbrasil.top` é um site estático de conteúdo (70+ páginas de guias IPTV) sem vetores de injeção confirmados. **Nenhum acesso foi obtido, nenhum objetivo de alto valor foi atingido.** Recomenda-se encerramento do engagement por superfície mínima e risco baixo.

---

## Findings por Severidade

### Crítica (0)
*Nenhum*

### Alta (0)
*Nenhum*

### Média (0)
*Nenhum — Todos os candidatos listados como Médio durante enumeração foram reclassificados para Info após testes de exploração negativos ou bloqueio por Cloudflare Turnstile.*

### Baixa (3)

| ID | Título | Alvo | Evidência |
|----|--------|------|-----------|
| F-006 | SSL Validade Curta (45 dias) | teste-iptv.mov | `recon/active/ACTIVE.md` §4.3 |
| F-007 | Sem OCSP Stapling | teste-iptv.mov | `recon/active/ACTIVE.md` §4.3 |
| F-102 | WhatsApp Redirect Hardcoded — Parâmetros Ignorados | cliquex.click | `evidence/F-102.txt` |

### Informativo (24)

| ID | Título | Alvo | Evidência |
|----|--------|------|-----------|
| F-001 | Wildcard SSL `*.teste-iptv.mov` sem subdomínios resolvendo | teste-iptv.mov | `recon/passive/PASSIVE.md` §3 |
| F-002 | Cloudflare Full Proxy — IP real oculto, WAF ativo | teste-iptv.mov | `recon/active/ACTIVE.md` §1 |
| F-003 | OSINT WhatsApp +55 21 97544-4978 (LGPD/CDC) | teste-iptv.mov | `recon/passive/PASSIVE.md` §5 |
| F-004 | SPA Anchor Navigation — navegação client-side apenas | teste-iptv.mov | `recon/passive/PASSIVE.md` §4 |
| F-005 | IP Real Não Descoberto — recon ativo exaustivo falhou | teste-iptv.mov | `recon/active/ACTIVE.md` §5 |
| F-008 | Tracking Terceiro — cliquex.click como intermediário WhatsApp | teste-iptv.mov | `recon/active/ACTIVE.md` §8 |
| E-001 | Info Disclosure — `/cdn-cgi/trace` expõe IP cliente | cliquex.click | `enum/ENUM.md` §2.8 |
| E-002 | Auth Bypass Candidate — `/clk` requer login (não explorável) | cliquex.click | `enum/ENUM.md` §2.8 |
| E-003 | Open Redirect — `/clk?next=` pós-login (não testável sem auth) | cliquex.click | `enum/ENUM.md` §2.8 |
| E-004 | Credential Stuffing — `/login` sem rate limiting (bloqueado Turnstile) | cliquex.click | `enum/ENUM.md` §2.8 |
| E-005 | Lead Enum — WhatsApp endpoints confirmam leads (sem IDOR) | cliquex.click | `enum/ENUM.md` §2.8 |
| E-006 | Info Disclosure — `/cdn-cgi/trace` expõe IP cliente | playbrasil.top | `enum/ENUM.md` §3.8 |
| E-007 | Rate Limit Bypass — Cloudflare 429 (não bypassado) | playbrasil.top | `enum/ENUM.md` §3.8 |
| E-008 | Path Enum — 429 vs 404 diferenciação (mapeamento básico) | playbrasil.top | `enum/ENUM.md` §3.8 |
| E-009 | XSS/Injection — Parâmetro `action=solicitar-teste` (não refletido) | playbrasil.top | `enum/ENUM.md` §3.8 |
| E-010 | WAF Bypass — Headers browser real permitem homepage (não content discovery) | teste-iptv.mov | `enum/ENUM.md` §4.6 |
| E-011 | Rate Limit — 429 em paths (não bypassado) | teste-iptv.mov | `enum/ENUM.md` §4.6 |
| E-012 | Info Disclosure — `/cdn-cgi/trace` expõe IP cliente | teste-iptv.mov | `enum/ENUM.md` §4.6 |
| F-101 | Cloudflare Turnstile — bloqueia 100% auth bypass | cliquex.click | `evidence/F-101.txt` |
| F-103 | `action=` Parameter Ignorado — playbrasil.top estático | playbrasil.top | `evidence/F-103.txt` |
| F-104 | SPA Estática Catch-All — mesmo HTML p/ todos paths | teste-iptv.mov | `evidence/F-104.txt` |
| F-105 | CONFIG.whatsapp Hardcoded no JS inline (+5521975444978) | teste-iptv.mov | `evidence/F-105.txt` |
| F-106 | Dalfox 0 XSS — playbrasil.top sem reflecção | playbrasil.top | `evidence/F-106.txt` |
| F-107 | WAF Turnstile — impenetrável via automação | cliquex.click | `evidence/F-107.txt` |

---

## Detalhamento de Findings

### F-006 — SSL Validade Curta (45 dias)
- **Severidade:** Baixa
- **Alvo:** teste-iptv.mov (Cloudflare edge)
- **Descrição:** Certificados TLS emitidos por Google Trust Services (WR1/WE1) com validade de 45 dias (2026-07-09 → 2026-10-07). Renovação automática observada (múltiplos certificados em CT logs). Sem impacto de segurança — prática padrão do Google CA.
- **Impacto:** Baixo. Renovação frequente é, na verdade, uma boa prática (reduz janela de exposição pós-comprometimento de chave).

### F-007 — Sem OCSP Stapling
- **Severidade:** Baixa
- **Alvo:** teste-iptv.mov (Cloudflare edge)
- **Descrição:** O servidor não oferece OCSP Stapling nas respostas TLS. Clientes precisam consultar o OCSP responder diretamente, aumentando latência e potencialmente vazando histórico de navegação.
- **Impacto:** Baixo. Performance e privacidade TLS levemente impactadas. Não configura vulnerabilidade explorável.

### F-102 — WhatsApp Redirect Hardcoded
- **Severidade:** Baixa
- **Alvo:** cliquex.click
- **Descrição:** Os endpoints `/whatsapp-movie` e `/whatsapp-playbrasil` redirecionam para `wa.me` via 302. O redirect é **hardcoded** — nenhum parâmetro de query string (`id`, `phone`, `ref`, `utm_*`, etc.) altera o comportamento. Testes IDOR (sequencial 1-20, UUID, hash) sem efeito.
- **Impacto:** Baixo. Não há vetor de open redirect via parâmetros. O redirect é fixo.
- **Evidência:** `evidence/F-102.txt`

---

## Attack Surface Consolidada

| Camada | Descobertas | Risco |
|--------|-------------|-------|
| **DNS** | 1 host vivo (apex), 0 subdomínios resolvendo, wildcard SSL sem subs, sem MX/SPF/DMARC | Baixo |
| **Rede (Cloudflare Edge)** | 2 IPs edge, 13 portas padrão Cloudflare, 0 serviços de origem expostos | Baixo |
| **Aplicação Web** | SPA estática (4 páginas), zero processamento server-side, zero APIs, zero formulários | Baixo |
| **Terceiros** | cliquex.click (tracking/redirect WhatsApp com login protegido), playbrasil.top (site irmão estático 70+ páginas) | Médio (potencial) |
| **WAF** | Cloudflare Full Proxy + Turnstile — bloqueia 100% enumeração/auth automatizada | N/A (defesa) |

**Infraestrutura Cloudflare detectada:**
- Nameservers: `garrett.ns.cloudflare.com`, `autumn.ns.cloudflare.com` (teste-iptv.mov)
- Nameservers: `paige.ns.cloudflare.com`, `tanner.ns.cloudflare.com` (cliquex.click)
- IPs edge: 104.21.71.23, 172.67.142.73 (teste-iptv.mov); 104.26.4.201, 104.26.5.201, 172.67.75.55 (cliquex.click)
- Certificados: Google Trust Services (WR1/WE1), wildcard, 45-90 dias
- HSTS: preload ativo, `includeSubDomains`

---

## Acessos Obtidos

**Nenhum.** Cloudflare Turnstile bloqueou todas as tentativas de autenticação em `cliquex.click`. Os domínios `teste-iptv.mov` e `playbrasil.top` são estáticos, sem formulários de login ou áreas restritas.

---

## Objetivos de Alto Valor — Progresso

| Objetivo | Status | Observação |
|----------|--------|------------|
| Acesso administrativo / painel de controle | ❌ Não atingido | `/login` protegido por Turnstile (F-101, F-107) |
| Dados de usuários / PII / credenciais | ❌ Não atingido | Sem acesso a backend (F-101) |
| Informações financeiras / pagamentos | ❌ Não atingido | Sem superfície financeira detectada |
| Código fonte / segredos de aplicação | ❌ Não atingido | Tudo estático/client-side (F-104) |
| Acesso a infraestrutura subjacente | ❌ Não atingido | IP real oculto por Cloudflare (F-005) |

---

## Cronologia

Ver `timeline.log` para cronologia completa. Resumo:

| Data/Hora (UTC) | Evento |
|-----------------|--------|
| 2026-08-22T00:00:00Z | Engagement iniciado, SCOPE.md, PLAN.md criados |
| 2026-08-22T18:18:00Z | Fase 2 (Recon Passivo + OSINT) concluída |
| 2026-08-22T18:55:00Z | Fase 3 (Recon Ativo) concluída |
| 2026-08-22T19:30:00Z | Fase 5 (Enumeração Profunda) concluída |
| 2026-08-22T20:54:00Z | Fase 6 (Ataque WebApp) concluída — 0 acessos |
| 2026-08-22T21:00:00Z | Fase 7 (CVE Research) concluída — nenhum CVE |
| 2026-08-22T21:00:00Z | Fase 8 (Exploit) — Pulada (sem CVEs) |
| 2026-08-22T21:30:00Z | Fase 9 (Relatório Final) concluída |

---

## Evidências

| Arquivo | Descrição |
|---------|-----------|
| `evidence/F-101.txt` | Cloudflare Turnstile bloqueia auth em cliquex.click |
| `evidence/F-102.txt` | WhatsApp redirect hardcoded — parâmetros ignorados |
| `evidence/F-103.txt` | Parâmetro `action=` ignorado em playbrasil.top |
| `evidence/F-104.txt` | SPA estática catch-all em teste-iptv.mov |
| `evidence/F-105.txt` | WhatsApp number exposto no JS inline |
| `evidence/F-106.txt` | Dalfox 0 XSS em playbrasil.top |
| `evidence/F-107.txt` | WAF Turnstile impenetrável via automação |

Artefatos complementares em:
- `recon/passive/` — DNS, subdomínios, OSINT, wayback
- `recon/active/` — Portscan, WAF, TLS, vhost fuzzing, content discovery
- `enum/` — Enumeração cliquex.click, playbrasil.top, teste-iptv.mov
- `webapp/` — Testes OWASP Top 10 por alvo
- `exploit/cve_research.md` — Pesquisa CVE (zero aplicáveis)
- `screenshots/` — Bloqueios Cloudflare

---

## Checklist de Conclusão

| Item | Status |
|------|--------|
| Fase 1 (Escopo) | ✅ Concluída |
| Fase 2 (Recon Passivo + OSINT) | ✅ Concluída |
| Fase 3 (Recon Ativo) | ✅ Concluída |
| Fase 4 (Consolidar Attack Surface) | ✅ Concluída |
| Fase 5 (Enumeração Profunda) | ✅ Concluída |
| Fase 6 (Ataque WebApp) | ✅ Concluída |
| Fase 7 (CVE Research) | ✅ Concluída |
| Fase 8 (Exploit Validation) | ⏭️ Pulada (sem CVEs aplicáveis) |
| Fase 9 (Pós-Exploração) | ⏭️ Pulada (sem foothold) |
| Fase 10 (Relatório Final) | ✅ Concluída |
| `REPORT.md` final | ✅ Atualizado |
| `timeline.log` completo | ✅ Atualizado |
| `evidence/` com todas evidências | ✅ 7 arquivos |
| `recon/SUMMARY.md` com ranking | ✅ Atualizado |

---

## Recomendação de Encerramento

**Engagement pode ser encerrado.** A superfície web é mínima: landing page estática protegida por Cloudflare Full Proxy. O único vetor com payoff potencial (cliquex.click) está totalmente protegido por Turnstile, intransponível via automação. Nenhum CVE aplicável foi identificado. Nenhum acesso foi obtido. Risco geral: **Baixo**.

Para reabertura futura:
- Descoberta de IP real de origem (via CT logs, passive DNS, email headers)
- Subdomínio não-proxied exposto
- Bypass de Turnstile via browser headful com 2Captcha
- Novo endpoint/dashboard em cliquex.click