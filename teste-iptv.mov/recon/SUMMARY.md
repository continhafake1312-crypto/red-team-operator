# Attack Surface Summary — teste-iptv.mov

**Engagement:** teste-iptv.mov
**Data de consolidação:** 2026-08-22T18:55:00Z
**Fases concluídas:** 1 (Escopo), 2 (Recon Passivo), 3 (Recon Ativo)
**Próxima fase:** 5 (Enumeração Profunda)

---

## 1. Panorama Geral

| Aspecto | Status |
|---------|--------|
| **Domínio base** | teste-iptv.mov |
| **Subdomínios públicos** | 1 (apex apenas) |
| **Hosts vivos** | 1 (`https://teste-iptv.mov`) |
| **IPs de origem real** | **0** (Cloudflare Full Proxy total) |
| **IPs Cloudflare edge** | 104.21.71.23, 172.67.142.73 (+ 2 IPv6) |
| **Portas expostas (edge)** | 13 portas padrão Cloudflare (80, 443, 8080, 8443, 8880, 2052, 2053, 2082, 2083, 2086, 2087, 2095, 2096) |
| **Serviços de origem** | **Nenhum descoberto** |
| **WAF** | Cloudflare (Full Proxy, managed rules ativas) |
| **TLS** | TLS 1.2/1.3, HSTS preload, Google Trust Services (WR1/WE1), 45 dias |
| **Cloud buckets** | 0 (18 variações testadas) |
| **Takeover candidates** | 0 |
| **Wayback endpoints** | 0 |

---

## 2. Attack Surface por Camada

### 2.1 Camada DNS
- **Registros**: A/AAAA → Cloudflare edge; NS → Cloudflare nameservers
- **Wildcard SSL**: `*.teste-iptv.mov` ativo (7 certificados CT)
- **Subdomínios resolvendo**: 0 além do apex
- **MX/SPF/DMARC**: Ausentes
- **Zone transfer**: Bloqueada

### 2.2 Camada Rede (Cloudflare Edge)
| IP | Portas | Serviços | Notas |
|----|--------|----------|-------|
| 104.21.71.23 | 13 | Cloudflare http proxy / nginx SSL | Edge padrão |
| 172.67.142.73 | 13 | Cloudflare http proxy / nginx SSL | Edge padrão |

**Observação:** Nenhuma porta expõe serviço de origem real. Todas são portas padrão Cloudflare para HTTP/HTTPS proxy, Spectrum, Workers.

### 2.3 Camada Aplicação Web
| Host | Tipo | Tech Stack | Superfície |
|------|------|------------|------------|
| https://teste-iptv.mov | SPA Estática | Cloudflare, Google Analytics/GTM, Google Fonts, JS inline | Landing page + redirect WhatsApp via `cliquex.click` |

**Endpoints conhecidos:**
- `/` — Homepage (SPA com anchors: #hero, #catalogo, #dispositivos, #como-funciona, #depoimentos, #faq)
- `/termos-de-uso.html` — Estático
- `/politica-de-privacidade.html` — Estático
- `/reembolso.html` — Estático
- Assets: favicon.*, site.webmanifest, imagens .webp

**Endpoints NÃO descobertos (bloqueados por WAF):**
- `/admin/`, `/api/`, `/internal/`, `/wp-admin/`, `/phpmyadmin/`, etc. (todos 403)
- VHosts internos (todos 403)

### 2.4 Camada JavaScript / Client-Side
- **Framework**: Nenhum (vanilla JS inline)
- **Analytics**: Google Analytics 4 (G-EN9WN676XZ) + GTM
- **Tracking WhatsApp**: `cliquex.click/whatsapp-movie` (redirect para wa.me)
- **Eventos GA**: `whatsapp_click` com 10 `button_location` valores
- **APIs/Endpoints internos**: **Nenhum** descoberto no JS

### 2.5 Camada Externa / Terceiros
| Serviço | Domínio | Risco |
|---------|---------|-------|
| WhatsApp Redirect | cliquex.click | **MÉDIO** — Processa leads, possível IDOR/open redirect/vazamento |
| Google Analytics | google-analytics.com | Baixo |
| Google Tag Manager | googletagmanager.com | Baixo |
| Google Fonts | fonts.googleapis.com | Baixo |

---

## 3. Ranking de Payoff (§16)

| Rank | Alvo | Payoff | Justificativa | Vetores Prioritários |
|------|------|--------|---------------|---------------------|
| **1** | **IP Real de Origem (desconhecido)** | **ALTO** | Se descoberto, expõe servidor de origem completo: painéis admin, DBs, SSH, RDP, serviços internos, código fonte | DNS histórico, CT logs com IPs em SAN, email headers, passive DNS (SecurityTrails/Farsight), Shodan/Censys histórico, subdomínios não-proxied |
| **2** | **cliquex.click/whatsapp-movie** | **MÉDIO** | Terceiro que processa leads IPTV. Possível: IDOR em leads, open redirect, vazamento de PII/telefones, enumeração de parâmetros | Enumeração profunda de parâmetros, teste IDOR, análise de fluxo redirect, busca por endpoints admin no domínio |
| **3** | **https://teste-iptv.mov (Cloudflare Edge)** | **BAIXO** | Apenas landing page estática. WAF bloqueia enumeração ativa. Sem vetores óbvios de OWASP Top 10 | Bypass WAF (cookie challenge, header evasão), content discovery pós-bypass, análise de CSP/HSTS para misconfig |
| **4** | **Google Analytics / GTM** | **BAIXO** | Apenas tracking. Sem superfície explorável direta | — |
| **5** | **Certificados SSL (CT Logs)** | **BAIXO** | Monitorar renovação (expira 2026-10-07). Verificar se novos certs incluem IPs em SAN | Monitor CT logs contínuo |

---

## 4. Findings Confirmados (Consolidados)

| ID | Severidade | Tipo | Resumo |
|----|------------|------|--------|
| F-001 | Info | Wildcard SSL | `*.teste-iptv.mov` existe mas 0 subs resolvem |
| F-002 | Info | Cloudflare Full Proxy | IP real oculto, WAF ativo, headers sanitizados |
| F-003 | Info | OSINT WhatsApp | +55 21 97544-4978 — Brasil (LGPD/CDC) |
| F-004 | Info | SPA Anchors | Navegação client-side apenas |
| F-005 | Info | IP Real Não Descoberto | Recon ativo exaustivo falhou |
| F-006 | Baixa | SSL 45 dias | Renovação automática Google Trust Services |
| F-007 | Baixa | Sem OCSP Stapling | TLS performance/privacidade |
| F-008 | Info | Tracking Terceiro | `cliquex.click` intermediário WhatsApp |

---

## 5. Gaps & Limitações

| Gap | Impacto | Mitigação Planejada |
|-----|---------|---------------------|
| IP real de origem não descoberto | Não é possível atacar infraestrutura subjacente | OSINT avançado, monitor CT logs, tentar acesso a painel Cloudflare (fora de escopo) |
| WAF bloqueia enumeração ativa | Content discovery/vhost fuzzing ineficazes | Tentar bypass (Fase 5), focar em endpoint externo `cliquex.click` |
| Aplicação puramente estática | Sem OWASP Top 10 surface (sem auth, sem input, sem API) | Validar se há endpoints ocultos pós-bypass; foco em terceiros |
| Zero subdomínios técnicos | Superfície DNS mínima | Wordlists maiores, permutation, monitor CT logs contínuo |

---

## 6. Vetores de Ataque Prioritários (Próximas Fases)

### Fase 5 — Enumeração Profunda (Especialista `enum`)
1. **`cliquex.click/whatsapp-movie`** — Enumeração completa:
   - Parâmetros de query string, path, headers
   - Testes IDOR (sequencial, UUID, etc.)
   - Análise de fluxo redirect (open redirect chain)
   - Busca por endpoints admin/painel no domínio `cliquex.click`
   - Verificar se expõe API de leads (GET/POST)
2. **Bypass Cloudflare WAF** (tentativa controlada):
   - Cookie challenge solving
   - Header evasão (X-Forwarded-For spoofing, etc.)
   - Rate limiting evasion
   - Se bem-sucedido: content discovery real em `teste-iptv.mov`

### Fase 6 — Ataque WebApp (Especialista `webapp`)
- Baixa prioridade para `teste-iptv.mov` (superfície mínima)
- Foco em `cliquex.click` se enumeração revelar superfície

### Fase 7 — CVE Research (Especialista `cve`)
- **Baixa prioridade**: nginx nas portas Cloudflare SSL (2053, 2083, 2087, 2096) — versões não expostas
- Cloudflare edge — sem CVEs conhecidos exploráveis remotamente

---

## 7. Recomendação Estratégica

**O engagement atingiu o limite prático da superfície web exposta.** A aplicação alvo (`teste-iptv.mov`) é uma **landing page estática** protegida por **Cloudflare Full Proxy** com **zero superfície de ataque web explorável** no estado atual.

**O único vetor com payoff real é:**
1. **Descoberta do IP de origem real** (fora de escopo ativo sem autorização para ataques à infraestrutura Cloudflare)
2. **Enumeração profunda do `cliquex.click`** (terceiro que processa leads)

**Decisão recomendada:** Prosseguir com Fase 5 focada exclusivamente em `cliquex.click` e monitoramento passivo contínuo para IP de origem. Se `cliquex.click` não renderizar findings médios/altos, o engagement pode ser encerrado com relatório de "superfície mínima, risco baixo".

---

## 8. Artefatos de Referência

```
/home/ubuntu/teste-iptv.mov/recon/passive/
  ├── PASSIVE.md, dns_full.txt, subdomains_*.txt, wayback_urls.txt, osint_findings.txt

/home/ubuntu/teste-iptv.mov/recon/active/
  ├── ACTIVE.md, nmap_cf_*.txt, waf_detection.txt, tls_scan.txt
  ├── vhost_fuzz.json, content_discovery.json, certspotter_api.json
  ├── homepage.html, technical_subdomains.txt
```

---

*Gerado automaticamente pelo Red Team Operator — Fase 4 (Consolidação)*