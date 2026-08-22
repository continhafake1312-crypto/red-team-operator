# Attack Surface Summary — teste-iptv.mov

**Última atualização:** 2026-08-22T18:55:00Z  
**Fase concluída:** 3/10 (Recon Ativo)

---

## Ranking de Payoff (Atualizado Pós-Fase 3)

| Rank | Alvo | Payoff | Status | Próxima Ação |
|------|------|--------|--------|--------------|
| 1 | **IP Real de Origem (desconhecido)** | **ALTO** | Não descoberto | Tentar bypass CDN via OSINT avançado, email headers, CT logs históricos |
| 2 | **cliquex.click/whatsapp-movie** | **MÉDIO** | Descoberto (JS analysis) | Enumeração profunda: parâmetros, IDOR, open redirect, vazamento leads |
| 3 | **https://teste-iptv.mov (Cloudflare Edge)** | **BAIXO** | Mapeado (Fase 2+3) | Bypass WAF para content discovery real; verificar subpaths |
| 4 | **Google Analytics / GTM (G-EN9WN676XZ)** | **BAIXO** | Identificado | Nenhuma ação — apenas tracking |

---

## Superfície de Ataque Consolidada

### Hosts Diretos (Fora CDN)
**Nenhum descoberto.** Cloudflare Full Proxy oculta IP de origem completamente.

### Cloudflare Edge IPs
| IP | Portas Abertas | Serviços | WAF | TLS |
|----|---------------|----------|-----|-----|
| 104.21.71.23 | 13 (80,443,8080,8443,8880,2052,2053,2082,2083,2086,2087,2095,2096) | Cloudflare http proxy / nginx SSL | Ativo | TLS 1.2/1.3, HSTS preload |
| 172.67.142.73 | 13 (mesmas) | Cloudflare http proxy / nginx SSL | Ativo | TLS 1.2/1.3, HSTS preload |

### Aplicação Web (https://teste-iptv.mov)
| Componente | Detalhes |
|------------|----------|
| Tipo | SPA estática (HTML/CSS/JS inline) |
| Navegação | Anchors: #hero, #catalogo, #dispositivos, #como-funciona, #depoimentos, #faq |
| Páginas estáticas | termos-de-uso.html, politica-de-privacidade.html, reembolso.html |
| Backend/API | **Nenhum descoberto** |
| Painel Admin | **Nenhum descoberto** |
| Auth | **Nenhuma** (apenas redirect WhatsApp) |
| Tracking | GA4 (G-EN9WN676XZ), GTM, cliquex.click (WhatsApp) |

### Subdomínios
| Subdomínio | Status | IP | Notas |
|------------|--------|-----|-------|
| teste-iptv.mov (apex) | Vivo (200) | Cloudflare Edge | Único subdomínio público |
| *.teste-iptv.mov (wildcard) | Certificado existe | N/A | Zero subdomínios resolvem publicamente |

### Certificados SSL (CT Logs)
- 7 certificados no CertSpotter (maio-jul/2026)
- Todos wildcard `*.teste-iptv.mov` + apex
- CA: Google Trust Services (WR1/WE1)
- Validade: 90 dias (expiram ~out/2026)
- **Nenhum IP de origem em SANs**

---

## Findings por Severidade

| Severidade | Count | IDs |
|------------|-------|-----|
| Crítica | 0 | — |
| Alta | 0 | — |
| Média | 1 | cliquex.click endpoint |
| Baixa | 3 | F-003 (cert validity), F-004 (no OCSP stapling), F-006 (3rd party tracking) |
| Info | 5 | F-001, F-002, F-005, F-007, F-008 |

---

## Gaps Críticos

1. **IP Real de Origem** — Desconhecido. Sem ele, não há acesso a: painéis admin, SSH, DBs, APIs internas, arquivos de configuração, logs.
2. **WAF Cloudflare** — Bloqueia enumeração ativa (vhosts, content discovery). Requer técnicas de evasão ou autorização para testes mais profundos.
3. **Superfície Web Mínima** — Landing page estática apenas. Vetores limitados a XSS reflected (CSP bloqueia), open redirect (cliquex), ou IDOR no tracking.

---

## Próximas Fases (Roadmap)

| Fase | Agente | Foco | Estimativa |
|------|--------|------|------------|
| 4 | enum | Deep enum: cliquex.click, bypass WAF, param mining | 1-2h |
| 5 | webapp | Testes OWASP Top 10 no que for exposto | 2-4h |
| 6 | cve | Mapear CVEs por versões (nginx Cloudflare, etc.) | 1h |
| 7 | exploit | Validar PoCs (se houver) | TBD |
| 8 | postex | N/A (sem foothold esperado) | — |
| 9 | report | Relatório final | 1h |

---

## Notas Operacionais

- **OPSEC:** Todos scans via proxychains4 + Tor (exit IP rotacionado)
- **Rate limiting:** 5 req/s em ffuf, delays em nmap
- **Scope:** Apenas teste-iptv.mov e infraestrutura diretamente associada
- **Autorização:** Assumida ampla (§13 metodologia)