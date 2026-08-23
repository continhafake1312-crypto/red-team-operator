# Recon Ativo — genhubs.com

**Data:** 2026-08-23  
**Metodologia:** Port scan, service discovery, web fingerprint, WAF detection, TLS/SSL, vhost fuzzing, Cloudflare bypass  
**OPSEC:** proxychains4 (Tor) em requests via Cloudflare; scans diretos no IP de origem (fora CDN)

---

## 1. Resumo dos Hosts

### IP de Origem Real (fora Cloudflare)

| Host | IP | ASN | Hosting |
|------|----|-----|---------|
| **genhubs.com (origin)** | **156.67.222.30** | AS47583 Hostinger | Hostinger, Singapura |

### Cloudflare (proxy)

| Subdomínio | IPs Cloudflare |
|------------|----------------|
| genhubs.com | 104.26.12.132, 104.26.13.132, 172.67.73.143 |
| beta.genhubs.com | 104.26.12.132, 104.26.13.132, 172.67.73.143 |
| rb.genhubs.com | 104.26.12.132, 104.26.13.132, 172.67.73.143 |
| z.genhubs.com | 104.26.12.132, 104.26.13.132, 172.67.73.143 |

---

## 2. Port Scan — IP de Origem (156.67.222.30)

| Porta | Estado | Serviço | Versão | Observação |
|-------|--------|---------|--------|------------|
| **21/tcp** | OPEN | FTP | ProFTPD ou KnFTPD (TLS) | Anonymous login NEGADO (530) |
| **80/tcp** | OPEN | HTTP | LiteSpeed httpd | Retorna 403 Forbidden |
| **443/tcp** | OPEN | HTTPS | LiteSpeed httpd | Retorna 403 Forbidden; TLS v1 alert (internal error) |
| **3306/tcp** | OPEN | MySQL | **MariaDB 11.8.8-log** | **EXPOSTO PUBLICAMENTE!** Proxy header rejeita conexões |

### UDP Scan
- Necessita root — não executado

### Scan Completo (RustScan)
- Apenas 4 portas abertas (21, 80, 443, 3306)

---

## 3. Scan de Range (156.67.222.0/24)

**251 hosts UP** — todos parte da mesma infraestrutura Hostinger.

| Host | Portas abertas | Serviços |
|------|---------------|----------|
| 156.67.222.2 | 21, 80, 443, 3306 | FTP, HTTP, HTTPS, MySQL |
| 156.67.222.3 | 21, 80, 443, 3306 | FTP, HTTP, HTTPS, MySQL |
| 156.67.222.4 | 21, 80, 443, 3306 | FTP, HTTP, HTTPS, MySQL |
| 156.67.222.5 | 21, 80, 443, 3306 | FTP, HTTP, HTTPS, MySQL |
| 156.67.222.10 | 21, 80, 443, 3306 | FTP, HTTP, HTTPS, MySQL |
| 156.67.222.15 | 21, 80, 443, 3306 | FTP, HTTP, HTTPS, MySQL |
| 156.67.222.20 | 21, 80, 443, 3306 | FTP, HTTP, HTTPS, MySQL |
| 156.67.222.25 | 21, 80, 443, 3306 | FTP, HTTP, HTTPS, MySQL |
| 156.67.222.30 | 21, 80, 443, 3306 | FTP, HTTP, HTTPS, MySQL (alvo) |
| 156.67.222.50 | 21, 80, 443, 3306 | FTP, HTTP, HTTPS, MySQL |

**Conclusão:** Range inteiro é shared hosting Hostinger com o mesmo perfil de serviços. Não há hosts vizinhos com serviços expostos diferentes.

---

## 4. Web Fingerprint

### Via Cloudflare (genhubs.com)
- **Status:** 200 OK
- **Tech Stack:** Next.js + React + Node.js (Turbopack)
- **Título:** "Genhubs - Roblox Cookie & Tools"
- **Server:** cloudflare
- **X-Powered-By:** Next.js
- **Tamanho:** 54.66 KB (página cheia SPA)

### Via IP de Origem Direto (156.67.222.30)
- **HTTP (80):** 403 Forbidden — LiteSpeed httpd
- **HTTPS (443):** 403 Forbidden — LiteSpeed httpd
- **Headers adicionais:** `platform: hostinger`, `panel: hpanel`
- **Conteúdo:** Página 403 padrão Hostinger (787 bytes)
- **TLS:** Certificado *.hstgr.io (Sectigo, válido até 2026-09-01)

### WhatWeb (origin)
- LiteSpeed, HTML5, HTTPServer, 403 Forbidden
- Headers: `platform`, `panel` (hpanel)

### Conclusão
**Origin server retorna conteúdo DIFERENTE do Cloudflare.** O LiteSpeed no origin bloqueia acesso direto (403). O conteúdo real (Next.js) só é servido via Cloudflare. O origin parece usar regra de IP/proxy para restringir acesso.

---

## 5. Cloudflare Bypass

| Método | Resultado |
|--------|-----------|
| **cloudscraper (Python)** | ✅ **SUCESSO** — página completa recebida (54.66 KB) |
| curl direto via Tor | ✅ 200 OK (Cloudflare challenge resolvido automaticamente) |
| curl com Host header no origin | ❌ 403 Forbidden |

**Endpoints descobertos após bypass:**
- /dashboard/combo-fomatter
- /dashboard/cookie-checker
- /dashboard/cookie-ip-lock-bypass
- /dashboard/cookie-logout
- /dashboard/reactive
- /dashboard/account-recovery
- /dashboard/email-account
- /dashboard/account-face-unlock

---

## 6. Vhost Fuzzing (Origin IP — 156.67.222.30)

Todos os vhosts testados retornam **403 (787 bytes)** — nenhum vhost diferenciado encontrado.

| Vhost | Status | Tamanho |
|-------|--------|---------|
| genhubs.com | 403 | 787 |
| beta.genhubs.com | 403 | 787 |
| rb.genhubs.com | 403 | 787 |
| z.genhubs.com | 403 | 787 |
| www.genhubs.com | 403 | 787 |
| admin.genhubs.com | 403 | 787 |
| api.genhubs.com | 403 | 787 |
| cpanel.genhubs.com | 403 | 787 |
| localhost | 403 | 787 |

**ffuf** com wordlist SecLists/subdomains-top1million-5000.txt: **0 resultados** (todos 787 bytes)

---

## 7. WAF Detection

| Target | WAF Detectado |
|--------|---------------|
| https://genhubs.com | ✅ **Cloudflare** (Cloudflare Inc.) |
| http://156.67.222.30 | ❌ Host offline (via Tor) — LiteSpeed bloqueia |

---

## 8. TLS/SSL

| Item | Detalhe |
|------|---------|
| Certificado | `*.hstgr.io` |
| Emissor | Sectigo Public Server Authentication CA DV R36 |
| Validade | 2026-01-30 a 2026-09-01 |
| Key | RSA 4096 bits |
| SANs | *.hstgr.io, hstgr.io |
| ALPN (443) | h2, http/1.1 |
| ALPN (FTP) | ftp |
| Ciphers | TLS 1.2+ (não enumerado em detalhe) |
| openssl s_client | ❌ "tlsv1 alert internal error" — servidor rejeita handshake padrão |

---

## 9. MariaDB Exposto (3306)

**CRÍTICO — MariaDB 11.8.8 exposto publicamente!**

| Atributo | Valor |
|----------|-------|
| Versão | 11.8.8-MariaDB-log |
| Auth Plugin | mysql_native_password |
| SSL | Sim (cert *.hstgr.io) |
| Root login | ❌ Access denied (password: NO) |
| Credenciais comuns | ❌ Todas falharam (root/admin/user/mysql) |
| Conexão via Tor | ❌ Proxy header rejeita ("Proxy header is not accepted from 56.125.111.53") |
| Conexão direta | ✅ Acessível, responde ao handshake |

**Acesso:** `mysql -h 156.67.222.30 -u root -p` (força bruta necessária ou exploit)

---

## 10. FTP (Porta 21)

| Atributo | Valor |
|----------|-------|
| Serviço | ProFTPD ou KnFTPD (TLS) |
| Anonymous | ❌ Negado (530 Access denied) |
| SSL | Sim (mesmo cert *.hstgr.io) |

---

## 11. Próximos Passos Recomendados

### Imediatos (alta prioridade)
1. **Força bruta MariaDB** — testar senhas fracas no MySQL exposto (root, admin, user, genhubs)
2. **Força bruta FTP** — testar credenciais comuns no ProFTPD
3. **Webapp pentest via Cloudflare** — usar cloudscraper ou API bypass para testar:
   - /api/shop (POST)
   - /dashboard/* endpoints (auth bypass)
   - CSRF token analysis
4. **Directory fuzzing** via bypass (ffuf com cloudscraper ou headers Cloudflare)
5. **Vulnerability research** — MariaDB 11.8.8 CVEs, ProFTPD CVEs, LiteSpeed CVEs

### Médio prazo
6. **Subdomain enumeration** via DNS brute-force (todos atrás de Cloudflare)
7. **5k IP origin scan** — verificar range de IPs Hostinger AS47583 adjacentes
8. **Shodan/Censys** do IP de origem
9. **Git recon** — procurar tokens/creds no código JS do SPA

### Baixa prioridade
10. **Port scan UDP** (DNS, NTP, SNMP)
11. **SNMP enumeration** no origin
12. **Email recon** (SPF, DMARC, DKIM)

---

## 12. Findings Preliminares

| # | Finding | Severity | Detalhe |
|---|---------|----------|---------|
| 1 | **MariaDB 11.8.8 exposto publicamente** | 🔴 CRÍTICO | Database acessível de qualquer IP na porta 3306 |
| 2 | **FTP exposto** | 🟠 ALTO | ProFTPD na porta 21, tentativas de brute force possíveis |
| 3 | **Cloudflare bypass possível** | 🟠 ALTO | cloudscraper funciona sem bloqueio |
| 4 | **Hostinger hpanel detectado** | 🟡 MÉDIO | Painel de hosting exposto via header `panel: hpanel` |
| 5 | **Certificado *.hstgr.io** | 🟢 INFO | Cert compartilhado de hosting, sem exposição direta |
| 6 | **Origin IP não roda Next.js** | 🟢 INFO | LiteSpeed no origin vs Next.js via Cloudflare — proxy reverso |