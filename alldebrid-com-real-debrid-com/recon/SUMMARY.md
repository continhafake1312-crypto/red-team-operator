# Attack Surface Summary — alldebrid-com-real-debrid-com

**Consolidado em:** 2026-08-22T19:00:00Z  
**Fase:** Recon passivo concluído para ambos os alvos  
**Próxima fase:** Recon ativo (delegando para recon-active)

---

## Visão Geral Comparativa

| Métrica | alldebrid.com | real-debrid.com |
|---------|---------------|-----------------|
| Subdomínios enumerados | 44 | 80 |
| Hosts vivos (HTTP/HTTPS) | 30 | 73 |
| IPs de origem únicos | 30+ | 35+ |
| ASNs únicos | 5 | 8 |
| CDN Principal | Cloudflare | CDN77 |
| IP Real Exposto | **mail.alldebrid.com → 212.83.131.119** (Online SAS) | Múltiplos (HITS, XTNETWORK, CDNEXT) |
| Tech Stacks | nginx, IIS/ASP.NET, LiteSpeed, Cloudflare+jQuery | nginx (hidden), Varnish/Fastly, Lity 2.0, Better Stack |
| Takeover Candidates | Nenhum identificado | Nenhum vulnerável (status=Better Uptime, fcdn=Fastly) |
| Buckets Públicos | Não testado (fase passiva) | 15 variações × 6 providers = 0 público |
| PII em Wayback | Não reportado | **CRÍTICO**: callbacks de pagamento com BINs, valores, IDs |

---

## Ranking de Payoff por Alvo (§16)

### ALTO PAYOFF — Prioridade Máxima

| Rank | Alvo | Vetor | Justificativa | Próxima Ação |
|------|------|-------|---------------|--------------|
| 1 | **alldebrid.com** | **IP Real Exposto** | `mail.alldebrid.com` resolve para 212.83.131.119 (Online SAS, França) — **bypass total do Cloudflare** | Portscan direto no IP real + fingerprint de serviços |
| 2 | **alldebrid.com** | **Painéis Admin Históricos** | Wayback revela `/admin`, `/administration/phpmyadmin` — phpMyAdmin exposto historicamente | Testar endpoints ativos; buscar bypass de auth |
| 3 | **alldebrid.com** | **Portal Pagamento Staging** | `dev.payments.alldebrid.com` com Basic Auth — ambiente de dev exposto | Testar creds default; bypass auth; IDOR |
| 4 | **real-debrid.com** | **WebDAV com Basic Auth** | `dav.real-debrid.com` retorna 401 — endpoint de autenticação direta | Brute force creds; testar WebDAV exploits (CVE-2021-29447, etc.) |
| 5 | **real-debrid.com** | **API Pública Documentada** | 11 hosts `api*/app*` servem docs idênticas (296KB) — superfície de API ampla | Extrair spec OpenAPI/Swagger; enum endpoints; testar auth tokens |
| 6 | **real-debrid.com** | **GitLab Interno** | `gitlab.real-debrid.com` → 94.140.4.19 (porta 443 fechada via proxy) | Conexão direta; testar registro aberto; pipeline CI/CD; secrets |
| 7 | **alldebrid.com** | **Stack ASP.NET (s18, pay2)** | Microsoft IIS/10.0 + ASP.NET 4.0 — viewstate, deserialização, paddings oracle | Fingerprint ASP.NET; testar viewstate MAC; deserialization gadgets |

### MÉDIO PAYOFF

| Rank | Alvo | Vetor | Justificativa | Próxima Ação |
|------|------|-------|---------------|--------------|
| 8 | **alldebrid.com** | **Endpoints Legados API** | `/api.php`, `/api/index.php`, `/api/torrent.php` — rotas antigas | Testar parâmetros; SQLi; auth bypass |
| 9 | **real-debrid.com** | **Portal Usuário (my)** | `my.real-debrid.com` retorna 403 — painel de usuário autenticado | Tentar bypass 403; IDOR; enumeração pós-auth |
| 10 | **real-debrid.com** | **CDN Download Nodes** | 45+ nodes CDN77 retornam 403 — mecanismo de token desconhecido | Análise de fluxo auth 403→200; cache poisoning |
| 11 | **alldebrid.com** | **Endpoints Protegidos (401)** | `myfiles`, `pad`, `dev.payments` — requerem auth | Testar IDOR; auth bypass; session fixation |
| 12 | **real-debrid.com** | **Fastly CDN (fcdn)** | 503 Varnish — possível cache poisoning, header injection | Investigar headers; testar cache poisoning |
| 13 | **alldebrid.com** | **Subdomínios de Infra** | `git`, `teamspeak`, `rss`, `pad`, `baka`, `slow` — serviços diversos | Portscan; fingerprint; default creds |
| 14 | **real-debrid.com** | **SPF SoftFail** | `~all` permite spoofing de email `@real-debrid.com` | Testar entrega de email spoofado; phishing interno |

### BAIXO PAYOFF / INFO

| Rank | Alvo | Vetor | Justificativa | Próxima Ação |
|------|------|-------|---------------|--------------|
| 15 | Ambos | **GitHub Recon** | 20+ repos cada — SDKs, wrappers, addons | Monitorar novos commits; buscar secrets acidentais |
| 16 | Ambos | **Favicon Hash Shodan** | Hashes documentados para correlação | Query Shodan/Censys quando API keys disponíveis |
| 17 | alldebrid | **crt.sh rate limited** | Dados de CT incompletos | Retry posterior; usar fontes alternativas |
| 18 | real-debrid | **theHarvester falhou** | Dependência Python (aiodns/pycares) | Fix deps ou usar alternativas (Hunter.io, etc.) |

---

## Matriz de Fallback / Pivot Hunting (§19)

> Se um vetor não renderiza, caça o próximo **sem perguntar**.

| Vetor Primário | Se Falhar → Pivote Para |
|----------------|-------------------------|
| IP Real (alldebrid) | Portscan nos outros 30+ IPs de origem descobertos |
| Admin panels (alldebrid) | `/administration/*` variants; `/phpmyadmin/*`; `/pma/*` |
| Staging payments (alldebrid) | `payments.alldebrid.com`, `pay2.alldebrid.com` (IIS/ASP.NET) |
| WebDAV (real-debrid) | `my.real-debrid.com` (403 bypass); `app.real-debrid.com` API auth |
| API docs (real-debrid) | JS analysis dos docs; GraphQL introspection; mass assignment |
| GitLab (real-debrid) | `pve-etix3`, `ns0-ns4` — infra exposta; Proxmox; DNS admin |
| ASP.NET stack (alldebrid) | ViewState deserialização; machineKey leak; Telerik/DevExpress exploits |
| Download CDN tokens (real-debrid) | Header injection; cache poisoning; SSRF via URL fetch |
| SPF spoof (real-debrid) | DMARC quarantine bypass; email enumeration via bounce |
| phpMyAdmin histórico (alldebrid) | Procure `/sqladmin`, `/mysql`, `/dbadmin`, `/adminer` |

---

## Próximos Passos Imediatos (Fase 3: Recon Ativo)

1. **Portscan massivo** nos IPs de origem reais de ambos os alvos:
   - alldebrid: 212.83.131.119 + 30+ IPs (Online SAS, Hetzner, etc.)
   - real-debrid: 35+ IPs (HITS, XTNETWORK, CDNEXT, CDN77, Linode, OVH)

2. **Fingerprint de serviços** nas portas abertas (nmap -sV -sC)

3. **VHost enumeration** nos IPs de origem (bypass CDN)

4. **WAF detection** (wafw00f) — ambos têm CDN (Cloudflare / CDN77/Fastly)

5. **TLS analysis** nos IPs reais

6. **Teste direto** nos findings CRÍTICOS/ALTOS:
   - alldebrid: `/admin`, `/administration/phpmyadmin`, `dev.payments`, ASP.NET endpoints
   - real-debrid: `dav` (WebDAV), `api` (Swagger), `gitlab` (direto), `my` (403 bypass)

---

## Artefatos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `recon/passive/PASSIVE.md` | Relatório consolidado (último: real-debrid.com) |
| `recon/passive/subdomains_all.txt` | 80 subdomínios (real-debrid) |
| `recon/passive/subdomains_live.txt` | 73 hosts vivos (real-debrid) |
| `recon/passive/httpx.json` | Probe HTTP completo com tech-detect |
| `recon/passive/dnsx.json` | Resolução DNS completa |
| `recon/passive/tech_stack.txt` | Fingerprint por host |
| `recon/passive/wayback_*.txt` | Endpoints históricos |
| `recon/passive/cloud_buckets.txt` | Verificação de buckets |
| `recon/passive/takeover_candidates.txt` | Análise de CNAME |

---

## Timeline Update

```
2026-08-22T19:00:00Z | recon-passive | COMPLETE | BOTH TARGETS | alldebrid: 44 subs, 30 live, 30+ IPs, real IP exposed, admin panels, ASP.NET stack | real-debrid: 80 subs, 73 live, 35+ IPs, WebDAV auth, API docs, CDN77/Fastly, payment PII in Wayback
2026-08-22T19:00:00Z | attack-surface | CONSOLIDATED | SUMMARY.md created with payoff ranking for 18 vectors across both targets
2026-08-22T19:00:00Z | NEXT | delegating to recon-active for portscan + service fingerprint on all origin IPs
```