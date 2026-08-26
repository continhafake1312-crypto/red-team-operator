# RELATÓRIO DE PENTEST — focusconcursos.com.br

**Início:** 2026-08-26  
**Fim:** Em andamento  
**Alvo:** https://focusconcursos.com.br  
**Tipo:** Web/API Externo Black-Box  
**Modo:** Autônomo (§13) — Reset do zero por ordem do operador  
**Metodologia:** AGENTS.md + pentest-methodology skill  
**OPSEC:** Tor + proxychains4 ativo (IP: 107.189.30.236)  
**2Captcha:** Configurado

---

## Resumo Executivo

Pentest black-box em andamento contra o ecossistema focusconcursos.com.br. Fases 1-4 concluídas (Escopo, Recon Passivo, Recon Ativo, Attack Surface). Fase 5 (Enumeração Profunda) em andamento.

**Até o momento:** 70 subdomínios mapeados, 28 vivos, 13 IPs de origem real. Três hosts críticos sem WAF identificados. Um bucket S3 público encontrado. 16 findings catalogados (3 Críticos, 6 Altos, 4 Médios, 3 Info).

---

## Resumo por Severidade

### 🔴 Crítica (3)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-001 | SSH Exposto (Porta 22) + Caddy sem WAF | 38.211.129.213 (pxa) | ✅ Confirmado |
| F-002 | JWT Cookie sem HttpOnly/Secure | focusconcursos.com.br | ✅ Confirmado |
| F-003 | CORS Wildcard (Access-Control-Allow-Origin: *) | www3, sac, focusconcursos, pagina | ✅ Confirmado |

### 🟠 Alta (6)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-004 | Backend Golang Exposto sem WAF | 18.233.104.160 | ✅ Confirmado |
| F-005 | Caddy + pxa sem WAF | 38.211.129.213 | ✅ Confirmado |
| F-006 | nginx/1.31.1 Versão Exposta | vc.focusconcursos.com.br | ✅ Confirmado |
| F-007 | 6 Hosts sem Security Headers | admin, lms, www3, payment, focusconcursos, mobile | ✅ Confirmado |
| F-008 | XSRF-TOKEN sem HttpOnly | admin, lms, pxa, integration | ✅ Confirmado |
| F-009 | Certificado TLS Expirado (*.focusonline.com.br) | AWS ALB | ✅ Confirmado |

### 🟡 Média (4)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-010 | Traefik DEFAULT CERT | apilms.focusconcursos.com.br | ✅ Confirmado |
| F-011 | 3 Painéis Admin Expostos | admin, lms, pxa | ✅ Confirmado |
| F-012 | HSTS Ausente no ALB (10 IPs) | AWS ALB Pool | ✅ Confirmado |
| F-013 | Info Leak via Headers | vário | ✅ Confirmado |

### 🟢 Baixa / Info (3)
| ID | Título | Host | Status |
|----|--------|------|--------|
| F-014 | Domínios Extras via SANs | cursosfocus.com.br, focusonline.com.br | ✅ Confirmado |
| F-015 | Takeover Candidates | manutencao, promocao, link | ✅ Confirmado |
| F-016 | ALB DNS Exposto | loadbalancer-concursos-...elb.amazonaws.com | ✅ Confirmado |

---

## Detalhamento dos Findings

### 🔴 F-001: SSH Exposto (Porta 22) + Caddy sem WAF
**Host:** 38.211.129.213 (pxa.focusconcursos.com.br)  
**Severidade:** Crítica  
**Detalhe:** Servidor Caddy que hospeda o Pixel X App (pxa.focusconcursos.com.br) tem porta SSH (22) aberta publicamente. Sem WAF ou CDN na frente. Acesso direto ao servidor via IP real.  
**Vetores:** SSH brute-force, CVE OpenSSH, enumeração de usuários, acesso shell potencial.  
**Evidência:** `recon/active/nmap_webports_38.211.129.213.*`

### 🔴 F-002: JWT Cookie sem HttpOnly/Secure
**Host:** focusconcursos.com.br (principal)  
**Severidade:** Crítica  
**Detalhe:** Cookie `@focusconcursos:appToken` contém JWT (`eyJ...`) sem flags HttpOnly, Secure ou SameSite. Acessível via JavaScript no frontend. Validade de 1 ano.  
**Impacto:** Qualquer XSS no domínio pode extrair o token JWT e comprometer sessões.  
**Evidência:** `recon/active/headers_focusconcursos.com.br.txt`

### 🔴 F-003: CORS Wildcard (*)
**Hosts:** www3.focusconcursos.com.br, sac.focusconcursos.com.br, focusconcursos.com.br, pagina.focusconcursos.com.br  
**Severidade:** Crítica  
**Detalhe:** Headers `Access-Control-Allow-Origin: *` permitem que qualquer site faça requisições cross-origin e leia respostas.  
**Impacto:** Exfiltração de dados via requisições cross-site. CSRF em APIs.  
**Evidência:** `recon/active/HEADERS_ANALYSIS.md`

### 🟠 F-004: Backend Golang Exposto sem WAF
**Host:** 18.233.104.160 (noticias, apilms, vc)  
**Severidade:** Alta  
**Detalhe:** Servidor Golang direto (Traefik) sem CDN, WAF ou proxy reverso. IP real exposto. Roteamento real de vhosts (blog, noticias, vc).  
**Vetores:** Ataque direto ao backend, bypass de restrições do CloudFront, descoberta de APIs internas.  
**Evidência:** `recon/active/ACTIVE.md`

---

## Tabela de Hosts e Stack (Atualizado)

| Host | Stack | WAF | Status | Prioridade |
|------|-------|-----|--------|------------|
| **38.211.129.213** (pxa) | Caddy/Go + SSH | ❌ | 🔴 Crítico | 🔴 #1 |
| **18.233.104.160** (noticias/apilms/vc) | Golang/Traefik | ❌ | 🔴 Crítico | 🔴 #2 |
| **admin.focusconcursos.com.br** | Laravel/Nginx | ❌ | 302 → /login | 🟠 #3 |
| **lms.focusconcursos.com.br** | Laravel/Nginx | ❌ | 302 → /login | 🟠 #4 |
| **pxa.focusconcursos.com.br** | Pixel X App (Caddy) | ❌ | 302 → /login | 🟠 #5 |
| **www3.focusconcursos.com.br** | Next.js | ❌ | 200 | 🟠 #6 |
| **focusconcursos.com.br** | Next.js/CloudFront | ✅ CloudFront | 200 | 🟠 #7 |
| **integration.focusconcursos.com.br** | Laravel API/Nginx | ❌ | 200 JSON | 🟠 #8 |
| **payment.focusconcursos.com.br** | Nginx API | ❌ | 200 JSON | 🟠 #9 |
| **sac.focusconcursos.com.br** | Express.js/Node | ✅ Cloudflare | 200 | 🟡 Média |
| **noticias.focusconcursos.com.br** | Next.js | ❌ | 200 | 🟡 Média |
| **vc.focusconcursos.com.br** | nginx/1.31.1 | ✅ CloudFront | 301 | 🟡 Média |
| **webmail.focusconcursos.com.br** | Microsoft Exchange | ❌ | 301 → /mail | 🟢 Baixa |
| **cdn.focusconcursos.com.br** | GoCache + S3 | 🟡 ELB | 403 | 🟡 Média |

---

## Vetores Explorados (até agora)

| Vetor | Host | Resultado |
|-------|------|-----------|
| Recon passivo (subdomínios, OSINT, wayback) | Todos | ✅ 70 subs, 28 vivos, 4 emails, 1 bucket público, 3 takeover candidates |
| Recon ativo (portscan, WAF, TLS, vhosts) | 13 IPs | ✅ 2 hosts diretos (Caddy+SSH, Golang), 9 hosts sem WAF |
| DNS enum + cert SANs | Todos | ✅ Domínios extras: cursosfocus.com.br, focusonline.com.br |

---

## Cronologia

| Data | Evento |
|------|--------|
| 2026-08-26 | Reset do engagement (ordem do operador) |
| 2026-08-26 | Fase 1: Escopo — estrutura, SCOPE, PLAN, REPORT, timeline |
| 2026-08-26 | Fase 2: Recon Passivo — 70 subdomínios, 28 vivos, fc-static S3 público |
| 2026-08-26 | Fase 3: Recon Ativo — 13 IPs, SSH exposto, JWT leak, CORS wildcard |
| 2026-08-26 | Fase 4: Attack Surface Consolidado — SUMMARY.md com 22 entradas |
| 2026-08-26 | **Fase 5: Enumeração Profunda — EM ANDAMENTO** |

---

## Próximos Passos

1. ✅ Recon Passivo + OSINT
2. ✅ Recon Ativo
3. ✅ Attack Surface Consolidado
4. 🔄 **Enumeração Profunda** — content discovery, JS analysis, API endpoints
5. ⬜ Ataque Webapp — auth bypass, IDOR, SQLi, CORS exploit
6. ⬜ CVE Research + Exploit
7. ⬜ Pós-Exploração (se foothold)
8. ⬜ Relatório Final

---

*Relatório incremental — atualizado ao final de cada fase.*