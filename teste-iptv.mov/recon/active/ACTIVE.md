# Fase 3 — Recon Ativo: teste-iptv.mov

**Data/Hora:** 2026-08-22T18:55:00Z  
**Operador:** recon-active agent  
**Alvo:** https://teste-iptv.mov/ (domínio base: teste-iptv.mov)  
**Diretório:** /home/ubuntu/teste-iptv.mov/recon/active/

---

## 1. Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Hosts diretos (fora CDN) descobertos | 0 |
| IPs Cloudflare (edge) analisados | 104.21.71.23, 172.67.142.73 |
| Portas abertas nos edge IPs | 13 portas (80, 443, 8080, 8443, 8880, 2052, 2053, 2082, 2083, 2086, 2087, 2095, 2096) |
| WAF detectado | Cloudflare (Full Proxy) |
| TLS | TLS 1.2/1.3, HSTS preload, cert. Google Trust Services (WR1/WE1) |
| VHosts descobertos | 0 (apenas 403 via Cloudflare) |
| Endpoints de conteúdo descobertos | 0 (apenas 403/404) |
| Subdomínios técnicos resolvendo | 0 |
| IP real de origem | **NÃO ENCONTRADO** — totalmente oculto por Cloudflare |

---

## 2. Portscan + Service Enum (Cloudflare Edge IPs)

### 2.1 Host: 104.21.71.23 (Cloudflare Edge)

| Porta | Estado | Serviço | Versão |
|-------|--------|---------|--------|
| 80 | open | http | Cloudflare http proxy |
| 443 | open | ssl/https | cloudflare |
| 2052 | open | http | Cloudflare http proxy |
| 2053 | open | ssl/http | nginx |
| 2082 | open | http | Cloudflare http proxy |
| 2083 | open | ssl/http | nginx |
| 2086 | open | http | Cloudflare http proxy |
| 2087 | open | ssl/http | nginx |
| 2095 | open | http | Cloudflare http proxy |
| 2096 | open | ssl/http | nginx |
| 8080 | open | http | Cloudflare http proxy |
| 8443 | open | ssl/https-alt | cloudflare |
| 8880 | open | http | Cloudflare http proxy |

### 2.2 Host: 172.67.142.73 (Cloudflare Edge)

| Porta | Estado | Serviço | Versão |
|-------|--------|---------|--------|
| 80 | open | http | Cloudflare http proxy |
| 443 | open | ssl/https | cloudflare |
| 2052 | open | http | Cloudflare http proxy |
| 2053 | open | ssl/http | nginx |
| 2082 | open | http | Cloudflare http proxy |
| 2083 | open | ssl/http | nginx |
| 2086 | open | http | Cloudflare http proxy |
| 2087 | open | ssl/http | nginx |
| 2095 | open | http | Cloudflare http proxy |
| 2096 | open | ssl/http | nginx |
| 8080 | open | http | Cloudflare http proxy |
| 8443 | open | ssl/https-alt | cloudflare |
| 8880 | open | http | Cloudflare http proxy |

**Observação:** Ambas as IPs Cloudflare expõem exatamente as mesmas 13 portas — portas padrão do Cloudflare (HTTP/HTTPS proxy + portas específicas Cloudflare para Spectrum/Workers). Nenhuma porta expõe serviço de origem real.

---

## 3. WAF Detection

**Ferramenta:** wafw00f via proxychains4

```
[+] The site https://teste-iptv.mov is behind Cloudflare (Cloudflare Inc.) WAF.
```

**Configuração Cloudflare detectada:**
- Full Proxy (orange cloud) ativo
- WAF managed rules ativas
- Challenge/Bot fight mode provável (rate limiting observado em scans)

---

## 4. TLS/SSL Deep Scan

**Ferramenta:** testssl.sh via proxychains4

### 4.1 Protocolos
| Protocolo | Status |
|-----------|--------|
| TLS 1.0 | Não oferecido |
| TLS 1.1 | Não oferecido |
| TLS 1.2 | Oferecido (OK) |
| TLS 1.3 | Oferecido (OK) |

### 4.2 Cifras
- Server cipher order: **Sim** (OK)
- TLS 1.3: Cifras modernas (AES-GCM, ChaCha20-Poly1305)
- TLS 1.2: Cifras seguras apenas (sem NULL, sem 3DES, sem RC4)
- Forward Secrecy: **Sim** (ECDHE)

### 4.3 Certificados (2 certificados servidos — RSA + ECDSA)

| Campo | Cert #1 (RSA) | Cert #2 (ECDSA) |
|-------|---------------|-----------------|
| CN / SAN | teste-iptv.mov | teste-iptv.mov |
| Key Size | RSA 2048 bits | EC 256 bits (P-256) |
| Signature Alg | SHA256withRSA | ECDSAwithSHA256 |
| Issuer | WR1 (Google Trust Services) | WE1 (Google Trust Services) |
| Validade | 2026-07-09 → 2026-10-07 (45 dias) | 2026-07-09 → 2026-10-07 (45 dias) |
| CT Logs | Sim | Sim |
| OCSP Stapling | Não oferecido | Não oferecido |

### 4.4 Security Headers (via TLS handshake + HTTP)
| Header | Valor |
|--------|-------|
| HSTS | max-age=31536000; includeSubDomains; preload |
| X-Frame-Options | SAMEORIGIN |
| X-Content-Type-Options | nosniff |
| Content-Security-Policy | frame-ancestors 'self'; object-src 'none'; base-uri 'self' |
| Permissions-Policy | geolocation=(), camera=(), microphone=(), payment=(), usb=() |
| Referrer-Policy | strict-origin-when-cross-origin |
| Access-Control-Allow-Origin | * |
| Cache-Control | public, max-age=0, must-revalidate |

### 4.5 Vulnerabilidades TLS Testadas
| Vulnerabilidade | Status |
|----------------|--------|
| Heartbleed (CVE-2014-0160) | Não vulnerável |
| CCS Injection (CVE-2014-0224) | Não vulnerável |
| Ticketbleed (CVE-2016-9244) | Não vulnerável |
| POODLE, BEAST, CRIME, BREACH | Não testadas (TLS 1.0/1.1 desabilitado) |

---

## 5. Origin IP Discovery (Bypass CDN) — **FALHOU**

### 5.1 DNS Bruteforce em Subdomínios Técnicos (328 alvos)
**Wordlist:** mail, ftp, cpanel, webmail, direct, origin, backend, api, staging, dev, test, admin, ssh, vpn, rdp, mysql, db, database, redis, mongo, k8s, kube, ci, cd, jenkins, git, gitlab, github, bitbucket, jira, confluence, wiki, monitor, grafana, prometheus, alertmanager, kibana, elastic, logstash, filebeat, metricbeat, packetbeat, heartbeat, auditbeat, smtp, pop, imap, autodiscover, ns1-4, dns, mx1-2, owa, exchange, remote, sslvpn, citrix, vdi, workspace, apps, portal, intranet, extranet, partner, vendor, supplier, customer, client, user, users, account, accounts, profile, profiles, settings, config, dashboard, panel, control, manage, management, console, adminpanel, administrator, root, superadmin, master, operator, support, helpdesk, ticket, tickets, status, health, ping, uptime, monitor, metrics, logs, logging, log, debug, trace, profiler, swagger, api-docs, apidocs, openapi, graphql, playground, graphiql, redoc, swagger-ui, postman, insomnia, webhook, webhooks, callback, callbacks, notify, notification, notifications, event, events, stream, streams, ws, wss, socket, sockets, realtime, push, pubsub, queue, queues, job, jobs, worker, workers, cron, schedule, scheduler, task, tasks, rabbitmq, kafka, redis, mongo, elasticsearch, solr, sphinx, meilisearch, typesense, algolia, search, index, indices, analytics, tracking, pixel, beacon, collect, collector, telemetry, stats, statistics, report, reports, export, import, backup, restore, snapshot, snapshots, archive, archives, dump, dumps, seed, seeds, fixture, fixtures, migration, migrations, schema, schemas, model, models, entity, entities, repository, repositories, service, services, controller, controllers, middleware, guard, guards, policy, policies, permission, permissions, role, roles, acl, rbac, abac, auth, authentication, authorization, login, logout, register, registration, signup, signin, password, reset, forgot, recover, verify, verification, confirm, confirmation, activate, activation, deactivate, deactivation, suspend, ban, unban, block, unblock, lock, unlock, enable, disable, active, inactive, pending, approved, rejected, draft, published, archived, deleted, trash, spam, ham, inbox, sent, drafts, templates, template, campaign, campaigns, newsletter, newsletters, email, emails, mailer, mailers, sms, push, integration, integrations, connector, connectors, plugin, plugins, extension, extensions, module, modules, addon, addons, feature, features, flag, flags, toggle, toggles, experiment, experiments, abtest, abtests, rollout, rollouts, canary, canaries, blue, green, preview, staging, production, prod, live, dev, development, local, localhost, test, testing, qa, uat, preprod, sandbox, demo, playground

**Resultado:** **Zero subdomínios resolvem** — todos retornam NXDOMAIN ou apontam para Cloudflare.

### 5.2 Certificate Transparency (CertSpotter API)
**7 certificados** encontrados para `teste-iptv.mov` e `*.teste-iptv.mov`:

| ID | Not Before | Not After | SANs |
|----|------------|-----------|------|
| 15095370191 | 2026-05-27 | 2026-08-25 | teste-iptv.mov |
| 15743015416 | 2026-07-07 | 2026-10-05 | *.teste-iptv.mov, teste-iptv.mov |
| 15756955587 | 2026-07-08 | 2026-10-06 | *.teste-iptv.mov, teste-iptv.mov |
| 15756957029 | 2026-07-08 | 2026-10-06 | *.teste-iptv.mov, teste-iptv.mov |
| 15760127764 | 2026-07-09 | 2026-10-07 | *.teste-iptv.mov, teste-iptv.mov |
| 15760129417 | 2026-07-09 | 2026-10-07 | *.teste-iptv.mov, teste-iptv.mov |
| 16083938419 | 2026-07-25 | 2026-10-23 | *.teste-iptv.mov, teste-iptv.mov |

**Análise:** Todos os certificados são wildcard (`*.teste-iptv.mov`) emitidos por Google Trust Services (WR1/WE1). **Nenhum IP de origem aparece nos SANs**. Certificados renovados aproximadamente a cada 90 dias (Let's Encrypt / Google CA padrão).

### 5.3 Zone Transfer (AXFR)
- Nameservers: `garrett.ns.cloudflare.com`, `autumn.ns.cloudflare.com`
- AXFR: **Falhou** (Cloudflare bloqueia)

### 5.4 Headers de Erro (403, 404, 500, 502, 503)
Verificados via requests diretos: **Nenhum header `X-Forwarded-For`, `CF-Connecting-IP`, `X-Real-IP`, `Server` vazando versão de origem**. Cloudflare sanitiza completamente.

### 5.5 Histórico DNS / Passive DNS
- Recon passivo (Fase 2): Zero resultados em Censys, SecurityTrails, Farsight, DNSDB
- Nenhum registro histórico de IP não-Cloudflare

---

## 6. VHost Fuzzing

**Ferramenta:** ffuf via proxychains4  
**Target:** `https://teste-iptv.mov` com header `Host: FUZZ.teste-iptv.mov`  
**Wordlist:** 328 subdomínios técnicos

**Resultado:** **328 resultados com Status 403, Size 151 bytes** — todos retornam página de bloqueio Cloudflare idêntica. **Nenhum vhost interno descoberto**.

---

## 7. Content Discovery

**Ferramenta:** ffuf via proxychains4  
**Target:** `https://teste-iptv.mov/FUZZ`  
**Wordlist:** SecLists raft-small-words (43.007 palavras)  
**Filter:** -fs 37674 (tamanho da homepage)

**Resultado:** **Zero endpoints com status ≠ 403/404**. Todos os paths testados retornam 403 (Cloudflare block) ou 404.

**Endpoints conhecidos (do recon passivo + homepage):**
- `/` — Homepage (SPA)
- `/termos-de-uso.html` — Estático
- `/politica-de-privacidade.html` — Estático
- `/reembolso.html` — Estático
- Anchors SPA: `#hero`, `#catalogo`, `#dispositivos`, `#como-funciona`, `#depoimentos`, `#faq`
- Assets: `teste-iptv-movie-hero.webp`, `teste-iptv-movie-ogg.webp`, `favicon.svg`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`, `site.webmanifest`

---

## 8. JavaScript Analysis

**Homepage:** SPA com **scripts inline apenas** (zero JS externo exceto Google Analytics/GTM).

### 8.1 Endpoints Hardcoded no JS Inline
```javascript
// CONFIG object
const CONFIG = {
  nome: "IPTV MOVIE",
  whatsapp: "5521975444978",
  mensagem: "Quero um teste IPTV MOVIE gratuito",
};

// WhatsApp redirect URL
var waURL = "https://cliquex.click/whatsapp-movie";
```

### 8.2 Tracking / Analytics
- Google Analytics 4: `G-EN9WN676XZ`
- Google Tag Manager: presente
- Eventos customizados: `whatsapp_click` com `button_location` (hero, final_cta, faq_cta, devices_cta, how_cta, testimonials_cta, catalog_cta, stats_cta, header, footer)

### 8.3 APIs / Endpoints Internos
**Nenhum endpoint de API, GraphQL, ou backend descoberto no JS.** A aplicação é puramente estática/client-side com redirect para WhatsApp via `cliquex.click`.

---

## 9. Tech Stack Consolidado (Host Vivo: https://teste-iptv.mov)

| Camada | Tecnologia | Versão/Detalhes |
|--------|------------|-----------------|
| CDN/WAF | Cloudflare | Full Proxy, WAF managed rules |
| Edge Server | nginx (portas SSL Cloudflare) | Via headers `server: cloudflare` |
| TLS | Google Trust Services (WR1/WE1) | RSA 2048 + ECDSA P-256, 90 dias |
| Analytics | Google Analytics 4 + GTM | G-EN9WN676XZ |
| Fonts | Google Fonts | Space Grotesk, Inter |
| Tracking Redirect | cliquex.click | WhatsApp tracking |
| Frontend | SPA HTML/CSS/JS inline | Sem framework JS detectado |
| Security Headers | HSTS preload, CSP, XFO, XCTO, Permissions-Policy | Configuração robusta |

---

## 10. Findings Preliminares

| ID | Título | Severidade | Descrição |
|----|--------|------------|-----------|
| F-001 | **IP Real de Origem Oculto por Cloudflare** | Info | Cloudflare Full Proxy impede descoberta de IP de origem. Superfície de ataque reduzida a edge IPs. |
| F-002 | **WAF Cloudflare Ativo** | Info | Bloqueia scans ativos (403 em vhost fuzzing/content discovery). Requer evasão para enumeração profunda. |
| F-003 | **Certificados SSL com Validade Curta (45 dias)** | Baixa | Renovação automática via Google Trust Services. Monitorar expiração (2026-10-07). |
| F-004 | **Ausência de OCSP Stapling** | Baixa | Performance/privacidade TLS levemente impactada. |
| F-005 | **SPA Estática sem Backend Exposto** | Info | Nenhuma API, painel admin, ou endpoint dinâmico descoberto. Aplicação serve apenas landing page + redirect WhatsApp. |
| F-006 | **Tracking WhatsApp via Terceiro (cliquex.click)** | Info | Redirecionamento intermediário para `wa.me`. Possível vazamento de referrer/UTM. |
| F-007 | **HSTS Preload Ativo** | Info (Positivo) | Força HTTPS, previne SSL stripping. |
| F-008 | **CSP Restritiva** | Info (Positivo) | `frame-ancestors 'self'; object-src 'none'; base-uri 'self'` — mitiga XSS/clickjacking. |

---

## 11. Ranking de Payoff Atualizado (para recon/SUMMARY.md)

| Alvo | Payoff | Justificativa |
|------|--------|---------------|
| **Origem Real (IP desconhecido)** | **ALTO** | Se descoberto, expõe servidor de origem, painéis admin, DBs, SSH, etc. Prioridade #1. |
| **https://teste-iptv.mov (Cloudflare Edge)** | **BAIXO** | Apenas landing page estática + redirect WhatsApp. WAF bloqueia enumeração. Sem vetores óbvios. |
| **cliquex.click (WhatsApp redirect)** | **MÉDIO** | Terceiro que processa leads. Possível IDOR, open redirect, ou vazamento de dados de leads. |
| **Google Analytics / GTM** | **BAIXO** | Apenas tracking. Sem superfície explorável. |

---

## 12. Próximos Passos Recomendados (Enum/Webapp)

1. **Enumeração Profunda (Fase 4)** — Focar em:
   - `cliquex.click/whatsapp-movie` — analisar parâmetros, possíveis IDORs em leads
   - Tentar bypass Cloudflare WAF para content discovery real (cookies, headers, challanges)
   - Verificar se `teste-iptv.mov` tem subpaths não-bloqueados (ex: `/api/`, `/admin/` com bypass)

2. **CVE Research (Fase 7)** — Baixa prioridade:
   - nginx nas portas Cloudflare SSL (2053, 2083, 2087, 2096) — versões não expostas
   - Cloudflare edge — sem CVEs conhecidos exploráveis remotamente

3. **OSINT Adicional** — Tentar descobrir IP real via:
   - Email headers (se houver MX/email corporativo)
   - Subdomínios não-proxied via DNS histórico (SecurityTrails, Farsight - se acesso)
   - SSL certs de subdomínios wildcard em CT logs com IPs em SAN (nenhum encontrado)
   - Shodan/Censys nos IPs Cloudflare (já feito — apenas edge)

---

## 13. Artefatos Gerados

```
/home/ubuntu/teste-iptv.mov/recon/active/
├── nmap_cf_104.21.71.23_full.txt      # Nmap completo IP 1
├── nmap_cf_172.67.142.73_full.txt     # Nmap completo IP 2
├── rustscan_cf_104.21.71.23.txt       # Rustscan rápido IP 1
├── rustscan_cf_172.67.142.73.txt      # Rustscan rápido IP 2
├── waf_detection.txt                  # wafw00f output
├── tls_scan.txt                       # testssl.sh output completo
├── vhost_fuzz.json / vhost_fuzz.log   # VHost fuzzing (328x 403)
├── content_discovery.json / .log      # Content discovery (43k paths, all 403/404)
├── dns_bruteforce_results.txt         # DNS bruteforce (vazio)
├── certspotter_api.json               # 7 certificados CT
├── certspotter_results.json           # crt.sh 502 error
├── homepage.html                      # HTML completo da homepage
├── technical_subdomains.txt           # Wordlist usada (328 entries)
├── masscan_origin.log / .xml          # Masscan origin IPs (falhou)
└── ACTIVE.md                          # Este relatório
```

---

## 14. Timeline Log Entry

```
2026-08-22T18:55:00Z — Fase 3 (Recon Ativo) concluída para teste-iptv.mov
```

---

## 15. Conclusão da Fase 3

**Superfície de ataque ativa extremamente limitada** devido a Cloudflare Full Proxy:

1. **Zero hosts de origem diretos** descobertos — IP real completamente oculto
2. **Apenas 2 IPs Cloudflare edge** com 13 portas padrão (sem serviços de origem)
3. **WAF bloqueia vhost fuzzing e content discovery** (403 uniforme)
4. **Aplicação web é SPA estática** — sem backend, API, painel admin, ou endpoints dinâmicos expostos
5. **Único vetor externo:** `cliquex.click/whatsapp-movie` (tracking/redirect WhatsApp)

**Recomendação:** Avançar para **Fase 4 (Enumeração Profunda)** focando no endpoint `cliquex.click` e tentativas de bypass WAF para enumeração real, mas com expectativa baixa de findings críticos na camada web. O **alto payoff permanece na descoberta do IP de origem real** (fora de escopo ativo sem autorização para ataques de infraestrutura Cloudflare).