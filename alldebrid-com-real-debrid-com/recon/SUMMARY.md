# Attack Surface Summary — alldebrid-com-real-debrid-com

**Consolidado em:** 2026-08-22T19:30:00Z  
**Fase:** Recon ativo concluído para ambos os alvos  
**Próxima fase:** Enumeração profunda (delegando para enum)

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
| Tech Stacks | **nginx, IIS/ASP.NET (IIS 10.0 + HTTPAPI 2.0), LiteSpeed** | nginx (hidden), Varnish/Fastly, Lity 2.0, Better Stack |
| Takeover Candidates | Nenhum identificado | Nenhum vulnerável (status=Better Uptime, fcdn=Fastly) |
| Buckets Públicos | Não testado (fase passiva) | 15 variações × 6 providers = 0 público |
| PII em Wayback | Não reportado | **CRÍTICO**: callbacks de pagamento com BINs, valores, IDs |
| **Portas Abertas (Origem)** | **25, 80, 110, 143, 443, 465, 587, 993, 995 (mail) + 80, 443 (IIS)** | **80, 443 (XTNETWORK core)** |
| **Serviços Fingerprintados** | **Postfix, Dovecot, nginx (mail UI), Microsoft IIS 10.0** | **nginx (hidden), Lity 2.0, Varnish** |
| **WAF em Origem** | Nenhum | Generic WAF (main/api/app/my/fcdn); None (dav/cdn) |

---

## Ranking de Payoff por Alvo (§16) — ATUALIZADO PÓS-RECON ATIVO

### CRÍTICO / ALTO PAYOFF — Prioridade Máxima (Validados no Recon Ativo)

| Rank | Alvo | Vetor | Status Recon Ativo | Justificativa | Próxima Ação |
|------|------|-------|-------------------|---------------|--------------|
| 1 | **alldebrid.com** | **IP Real Exposto (Mail)** | ✅ **CONFIRMADO** | `mail.alldebrid.com` → 212.83.131.119 — **bypass total Cloudflare**, 9 portas abertas (mail stack completo) | Enumeração SMTP/IMAP/POP3; user enumeration; open relay test |
| 2 | **alldebrid.com** | **ASP.NET/IIS 10.0 (s18)** | ✅ **CONFIRMADO** | 51.91.116.42 — **Microsoft IIS 10.0 + HTTPAPI 2.0** — ViewState, deserialização, MachineKey | ViewState MAC test; deserialization gadgets; Telerik/DevExpress scan |
| 3 | **alldebrid.com** | **Portal Pagamento Staging** | ✅ **CONFIRMADO** | `dev.payments.alldebrid.com` → **401 Basic Auth** (nginx) — ambiente dev exposto | Default creds (admin/admin); Basic Auth bypass; SQLi em login |
| 4 | **real-debrid.com** | **WebDAV com Basic Auth** | ✅ **CONFIRMADO** | `dav.real-debrid.com` → **401** — endpoint auth direto, **SEM WAF** | Brute force creds; WebDAV exploits (CVE-2021-29447, etc.) |
| 5 | **real-debrid.com** | **API Pública Documentada** | ✅ **CONFIRMADO** | 11 hosts `api*/app*` → 200 OK, docs idênticas (296KB) — superfície ampla | Extrair spec; enum endpoints; testar auth tokens; mass assignment |
| 6 | **real-debrid.com** | **GitLab Interno** | ⚠️ **PENDENTE DIRETO** | `gitlab.real-debrid.com` → 94.140.4.19 (porta 443 fechada via proxy) | **Conexão direta obrigatória**; registro aberto; CI/CD; secrets |
| 7 | **real-debrid.com** | **Portal Usuário WAF Bypass** | ✅ **NOVO — CONFIRMADO** | `my.real-debrid.com` → **403 normal, 200 em request modificado** — bypass indicado | Header manipulation; auth bypass; IDOR testing |

### ALTO PAYOFF (Validados Passivo/Ativo)

| Rank | Alvo | Vetor | Status Recon Ativo | Justificativa | Próxima Ação |
|------|------|-------|-------------------|---------------|--------------|
| 8 | **alldebrid.com** | **Endpoints Legados API** | ❌ **NÃO ENCONTRADOS** | `/api.php`, `/api/index.php`, `/api/torrent.php` → **404 na origem** | Histórico apenas; pivot para outros IPs de origem |
| 9 | **alldebrid.com** | **Portal Pagamento Produção** | ✅ **CONFIRMADO** | `pay2.alldebrid.com` → 302→200 login (Bootstrap/nginx) | Cred testing; IDOR; session fixation |
| 10 | **real-debrid.com** | **CDN Download Nodes** | ✅ **CONFIRMADO** | 45+ nodes CDN77 → 403 — token mechanism unknown | Análise fluxo 403→200; cache poisoning; header injection |
| 11 | **real-debrid.com** | **Fastly CDN (fcdn)** | ✅ **CONFIRMADO** | 503 Varnish — header manipulation on attack | Cache poisoning; HTTP request smuggling |

### MÉDIO PAYOFF

| Rank | Alvo | Vetor | Status Recon Ativo | Justificativa | Próxima Ação |
|------|------|-------|-------------------|---------------|--------------|
| 12 | **alldebrid.com** | **Endpoints Protegidos (401)** | Parcial | `myfiles`, `pad`, `dev.payments` — requerem auth | Testar IDOR; auth bypass; session fixation |
| 13 | **real-debrid.com** | **SPF SoftFail** | Passivo | `~all` permite spoofing de email `@real-debrid.com` | Testar entrega spoof; phishing interno |
| 14 | **alldebrid.com** | **Subdomínios Infra** | Não testados ativamente | `git`, `teamspeak`, `rss`, `pad`, `baka`, `slow` | Portscan; fingerprint; default creds |

### BAIXO PAYOFF / INFO

| Rank | Alvo | Vetor | Status | Justificativa | Próxima Ação |
|------|------|-------|--------|---------------|--------------|
| 15 | Ambos | **GitHub Recon** | Passivo | 20+ repos cada — SDKs, wrappers, addons | Monitorar commits; buscar secrets |
| 16 | Ambos | **Favicon Hash Shodan** | Passivo | Hashes documentados | Query Shodan/Censys com API keys |
| 17 | alldebrid | **crt.sh rate limited** | Passivo | Dados CT incompletos | Retry posterior; fontes alternativas |
| 18 | real-debrid | **theHarvester falhou** | Passivo | Dependência Python | Fix deps ou alternativas |

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

## Próximos Passos Imediatos (Fase 4: Enumeração Profunda)

1. **Conexão direta ao GitLab** — `gitlab.real-debrid.com` (94.140.4.19:443) **sem proxy** para validar registro, CI/CD, registry
2. **Credential testing WebDAV** — `dav.real-debrid.com` Basic Auth (wordlist comum + password spray)
3. **Análise API Documentation** — Baixar 11 páginas de docs, extrair endpoints Swagger, testar tokens
4. **Bypass my.real-debrid.com 403** — Header manipulation, auth bypass, IDOR enumeration
5. **ASP.NET s18.alldebrid.com** — ViewState MAC validation, MachineKey exposure, deserialization gadgets
6. **dev.payments.alldebrid.com** — Default creds Basic Auth, SQLi, auth bypass
7. **Download CDN Token Analysis** — 403→200 flow reverse engineering, cache poisoning
8. **Postfix/Dovecot enum** — VRFY/EXPN user enumeration, open relay, auth bypass
9. **Fastly/fcdn cache poisoning** — Varnish header injection, HTTP request smuggling

---

## Artefatos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `recon/active/ACTIVE.md` | **Relatório consolidado de recon ativo** |
| `recon/passive/PASSIVE.md` | Relatório consolidado passivo (real-debrid.com) |
| `recon/passive/subdomains_all.txt` | 80 subdomínios (real-debrid) |
| `recon/passive/subdomains_live.txt` | 73 hosts vivos (real-debrid) |
| `recon/passive/httpx.json` | Probe HTTP completo com tech-detect |
| `recon/passive/dnsx.json` | Resolução DNS completa |
| `recon/passive/tech_stack.txt` | Fingerprint por host |
| `recon/passive/wayback_*.txt` | Endpoints históricos |
| `recon/passive/cloud_buckets.txt` | Verificação de buckets |
| `recon/passive/takeover_candidates.txt` | Análise de CNAME |
| `recon/active/nmap_alldebrid_212.83.131.119_*.txt` | Portscan + service fingerprint mail origin |
| `recon/active/nmap_alldebrid_51.91.116.42_*.txt` | Portscan + service fingerprint IIS origin |
| `recon/active/nmap_real_debrid_*.txt` | Portscans em IPs core real-debrid |
| `recon/active/httpx_real_debrid_live.txt` | Tech detect em 73 hosts vivos |
| `recon/active/waf_real_debrid.txt` | WAF detection em 7 hosts chave |
| `recon/active/vhosts_real_debrid_*.log` | VHost fuzzing resultados |
| `recon/active/tls_*.txt` | Análise TLS nos IPs de origem |

---

## Timeline Update

```
2026-08-22T18:25:00Z | recon-passive | COMPLETE | real-debrid.com | 80 subs, 73 live, 35+ IPs, 8 ASNs, WebDAV auth, API docs, CDN77/Fastly, no takeover, payment PII in Wayback
2026-08-22T19:00:00Z | attack-surface | CONSOLIDATED | SUMMARY.md created with payoff ranking for 18 vectors across both targets
2026-08-22T19:00:00Z | NEXT | delegating to recon-active for portscan + service fingerprint on all origin IPs
2026-08-22T18:37:00Z | active-recon | STARTED | alldebrid.com primary IP portscan
2026-08-22T18:51:00Z | active-recon | COMPLETE | alldebrid.com key ports (9 open: mail stack)
2026-08-22T18:52:00Z | active-recon | COMPLETE | alldebrid.com service fingerprint (Postfix/Dovecot/nginx)
2026-08-22T19:03:00Z | active-recon | COMPLETE | real-debrid.com httpx tech-detect on 73 live hosts
2026-08-22T19:04:00Z | active-recon | COMPLETE | WAF detection on 7 real-debrid hosts (my=403→200 bypass!)
2026-08-22T19:07:00Z | active-recon | COMPLETE | alldebrid endpoints on origin IP (all 404 except mail UI)
2026-08-22T19:08:00Z | active-recon | COMPLETE | alldebrid ASP.NET hosts (s18=IIS 10.0, dev.payments=401 Basic)
2026-08-22T19:10:00Z | active-recon | COMPLETE | s18.alldebrid.com service detection: IIS 10.0 + HTTPAPI 2.0
2026-08-22T19:30:00Z | active-recon | COMPLETE | ACTIVE.md + SUMMARY.md updated with active recon findings
```