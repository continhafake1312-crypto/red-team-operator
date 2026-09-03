# Recon Passivo + OSINT — painelrevenda.vip

**Data:** 2026-09-03T05:00Z  
**Alvo primário:** painelrevenda.vip (186.194.52.218)  
**Especialista:** recon-passive  
**OPSEC:** proxychains4 via Tor (127.0.0.1:9050)

---

## Sumário Executivo

O alvo **painelrevenda.vip** é um **painel de revenda IPTV** ("Elite IPTV") hospedado no Brasil, atrás de Cloudflare. O negócio é a venda de créditos para revenda de IPTV (conteúdo pirata), operando via PIX. A infraestrutura é complexa: servidor web LiteSpeed + React SPA + Roundcube webmail + MySQL + FTP + mail services (Dovecot) — TUDO exposto no mesmo IP real.

**4 domínios relacionados** foram descobertos no mesmo servidor: eliteiptv.one, revendaiptv.pro, iptvrevenda.org, smartplay.club — expandindo significativamente a superfície de ataque.

---

## 1. DNS Completo

| Tipo | Valor |
|------|-------|
| A | 186.194.52.218 |
| MX | mail.painelrevenda.vip (priority 10) |
| NS | ns1.valueserver.net.br, ns2.valueserver.net.br |
| TXT | `v=spf1 a mx ip4:186.194.52.218 include:relay.mailbaby.net include:spf.antispamcloud.com ~all` |
| SOA | ns1.valueserver.net.br / hostmaster.painelrevenda.vip |
| DMARC | Não configurado |
| AXFR | Bloqueado |
| DNSSEC | Não habilitado |
| WHOIS Privacy | Super Privacy Service LTD c/o Dynadot (California) |
| ASN | AS53107 (EVEO S.A., Brasil) |

**IP owner:** EVEO S.A. (CNPJ: 07.358.108/0001-08) — provedor de hospedagem  
**Contato:** nicbr@eveo.com.br, security@eveo.com.br, Lucas Vanzin, Vicente de Moura Neto

---

## 2. Subdomínios

### Totais Encontrados: 27 subdomínios (3 fontes: subfinder, assetfinder, crt.sh)

### Vivos (resolvem + respondem HTTP): 8 hosts

| Subdomínio | IP | Serviço |
|------------|----|---------|
| painelrevenda.vip | 186.194.52.218 | Web App (React SPA) |
| www.painelrevenda.vip | 186.194.52.218 | Web App (React SPA) |
| webmail.painelrevenda.vip | 186.194.52.218 | Roundcube Webmail |
| mail.painelrevenda.vip | 186.194.52.218 | Mail server |
| pop.painelrevenda.vip | 186.194.52.218 | POP3 mail |
| smtp.painelrevenda.vip | 186.194.52.218 | SMTP mail |
| ftp.painelrevenda.vip | 186.194.52.218 | ProFTPD FTP |
| painelrevenda.vip.smmbrasil.net | 54.84.240.235 / 44.208.83.180 | DropCatch (parking/takeover) |

### Não resolvidos (mas com DNS entries):
autodiscover, club, cpanel, cpcalendars, cpcontacts, eliteiptv.one.*, iptvrevenda.org.*, pro, smartplay.club.*, webdisk, www.*.smartplay.club (15 hosts)

---

## 3. Port Scan (186.194.52.218)

| Porta | Serviço | Software |
|------|---------|----------|
| 21/tcp | **FTP** | ProFTPD |
| 25/tcp | **SMTP** | - |
| 80/tcp | **HTTP** | LiteSpeed |
| 110/tcp | **POP3** | Dovecot |
| 143/tcp | **IMAP** | Dovecot DA |
| 443/tcp | **HTTPS** | LiteSpeed + Cloudflare |
| 587/tcp | **Submission** | - |
| 993/tcp | **IMAPS** | Dovecot |
| 995/tcp | **POP3S** | Dovecot |
| 3306/tcp | **MySQL** | MySQL/MariaDB |

**⚠️ CRÍTICO:** MySQL (3306) e FTP (21) EXPOSOS diretamente na internet.  
**⚠️ ALTO RISCO:** IMAP, SMTP, POP3 acessíveis sem proteção adicional aparente.

---

## 4. Tech Stack

| Componente | Tecnologia |
|------------|-----------|
| Web Server | LiteSpeed (HTTP/3) |
| Frontend | React SPA (Vite, ESM) |
| State/Query | TanStack Query |
| UI | Bootstrap (Roundcube), custom UI |
| Webmail | Roundcube (PHP) |
| Analytics | Google Analytics (G-WXM0W94JF7) |
| CDN/WAF | Cloudflare |
| SSL/TLS | Let's Encrypt (YE2) |
| FTP | ProFTPD |
| IMAP/POP3 | Dovecot |
| Database | MySQL/MariaDB |
| Mail relays | relay.mailbaby.net, antispamcloud.com |
| DNS | ValueServer (valueserver.net.br) |
| Hosting | EVEO S.A. (AS53107) |

---

## 5. Domínios Relacionados (mesmo IP: 186.194.52.218)

| Domínio | Subdomínios Encontrados |
|---------|------------------------|
| **eliteiptv.one** | mail, ftp, pop, webmail, www |
| **revendaiptv.pro** | autodiscover, cpanel, cpcalendars, cpcontacts, ftp, mail, pop, smtp, webdisk, webmail, www |
| **iptvrevenda.org** | smtp, www |
| **smartplay.club** | **app**, **player**, **revenda**, **seo**, **img**, **r**, autodiscover, cpanel, cpcalendars, cpcontacts, ftp, mail, pop, smtp, webdisk, webmail, www |

**Total de superfície expandida:** +40 subdomínios em domínios relacionados.

---

## 6. Cloud Buckets / Storage

- **10 variações de bucket testadas** (S3, Azure, GCP): ❌ Nenhum acessível
- GCP retornou 403 para alguns (pode ser existente mas sem permissão)
- Nenhum bucket público de dados encontrado

---

## 7. Subdomain Takeover Candidates

### 🔴 painelrevenda.vip.smmbrasil.net (ALTO RISCO)
- CNAME → `urlforward-https.namebright.com.` (NameBright)
- CNAME → `cdl-prd-https-247c6c9f427caacd.elb.us-east-1.amazonaws.com.` (AWS ELB)
- Resolve para: 54.84.240.235, 44.208.83.180
- HTTP: 200 "DropCatch.com"
- **Potencial takeover** se o registro NameBright ou o ELB da AWS forem removidos

### 🟡 www.painelrevenda.vip.smmbrasil.net
- Mesma configuração que acima

---

## 8. OSINT

### Contatos
- **WhatsApp:** +55-77-98112-3639 (Bahia, BR)
- **Email admin:** nicbr@eveo.com.br, security@eveo.com.br
- **Pessoas:** Lucas Vanzin, Vicente de Moura Neto

### Negócio
- Nome fantasia: **Elite IPTV**
- Produto: Painel de Revenda IPTV (créditos R$25-R$120)
- Pagamento: PIX
- Público-alvo: Brasil
- Rating declarado: 4.9/5 (1280 reviews)

### GitHub / Breaches
- Nenhum repositório público encontrado
- Nenhum vazamento público identificado (domínio novo — 2025)

---

## 9. Endpoints / Rotas Conhecidas

### Do frontend React (inferido)
- `/` — Página inicial (Landing page)
- `/login` — Login do painel
- `/dashboard` ou `/admin` — Painel administrativo
- `/api/` — API backend

### Do webmail Roundcube
- `/?_task=login` — Login webmail
- `/?_task=mail` — Caixa de entrada
- `/_task=settings` — Configurações
- `/README` — Documentação exposta
- `/CHANGELOG` — Changelog exposto
- `/INSTALL` — Instruções de instalação
- `/UPGRADING` — Instruções de upgrade
- `/config/config.inc.php` → redirect (protegido)

### Arquivos conhecidos
- `/sitemap.xml`
- `/robots.txt`
- `/.well-known/security.txt`

---

## 10. Limitações

1. **Cloudflare bloqueou TODAS as tentativas diretas** de baixar conteúdo real (inclusive com Googlebot UA e cloudscraper)
2. **Wayback Machine sem snapshots** — domínio registrado em out/2025
3. **theHarvester sem resultados** — Google CAPTCHA bloqueou consultas
4. **JS bundles não baixáveis** — retornam página de challenge do Cloudflare
5. **Shodan/Censys API keys não configuradas** — não foi possível consultar
6. **Sem acesso ao código fonte** — não há repositórios públicos

---

## 11. Recomendações para Recon Ativo (Próxima Fase)

1. **Port Scan completo** no IP real (186.194.52.218) — todas as 65535 portas
2. **FTP brute-force** ou autenticação anônima no ProFTPD
3. **MySQL externo** — testar credenciais padrão (root:root, etc.)
4. **Roundcube CVE check** — Roundcube tem CVEs conhecidos (RCE via CSRF, XSS, LFI)
5. **Fingerprint de versão** do Roundcube via `/README` e `/CHANGELOG`
6. **Credential stuffing** no webmail com combinações comuns
7. **VHOST discovery** no IP real por resolver nomes não-DNS
8. **Cloudflare bypass** via IP real: conectar diretamente ao 186.194.52.218 com Host header
9. **Enumeração dos domínios relacionados** (eliteiptv.one, revendaiptv.pro, iptvrevenda.org, smartplay.club)
10. **Smmbrasil.net takeover validation** — testar se o CNAME do NameBright pode ser registrado

---

## Artefatos Gerados

| Arquivo | Conteúdo |
|---------|----------|
| `dns_full.txt` | DNS records completos + whois |
| `subdomains_all.txt` | 27 subdomínios (brutos) |
| `subdomains_live.txt` | 8 subdomínios vivos |
| `tech_stack.txt` | Fingerprint completo |
| `wayback_urls.txt` | Wayback Machine (vazio) |
| `wayback_endpoints.txt` | Endpoints/rotas conhecidos |
| `osint_emails.txt` | Emails encontrados |
| `osint_people.txt` | Pessoas/contatos |
| `osint_breaches.txt` | Vazamentos |
| `osint_github.txt` | GitHub findings |
| `cloud_buckets.txt` | Cloud bucket scan |
| `takeover_candidates.txt` | Subdomain takeover |
| `PASSIVE.md` | Este documento (consolidação) |

---

**Fase concluída:** 2026-09-03T05:15Z  
**Próxima fase:** recon-active — port scanning, fingerprint de serviços, bypass CDN