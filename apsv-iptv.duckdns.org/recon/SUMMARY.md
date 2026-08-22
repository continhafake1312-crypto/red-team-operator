# Attack Surface Summary — apsv-iptv.duckdns.org

## Ranking de Payoff (§16)

### 🟥 CRÍTICO
| # | Vetor | Alvo | Payoff | Status |
|---|-------|------|--------|--------|
| 1 | **cPanel/WHM exposto** | cpanel.telaviva.com.br (162.214.99.39:2083/2087) | Acesso admin total ao servidor | 🔴 PENDENTE |
| 2 | **phpPgAdmin exposto** | telaviva.com.br (162.214.99.39) | Acesso ao banco PostgreSQL | 🔴 PENDENTE |
| 3 | **xmlrpc.php** | telaviva.com.br | Brute-force WP creds → admin WordPress | 🔴 PENDENTE |

### 🟧 ALTO
| # | Vetor | Alvo | Payoff | Status |
|---|-------|------|--------|--------|
| 4 | **JWT API — auth bypass** | apsv-iptv.duckdns.org/api/* | Acesso a canais/VOD/pagamentos (2k+ usuários) | 🟡 PENDENTE |
| 5 | **Rate limiting fraco (26s reset)** | apsv-iptv.duckdns.org | Brute-force JWT tokens / bypass | 🟡 PENDENTE |
| 6 | **Exim 4.99.5 SMTP** | 162.214.99.39:26/465/587 | Open relay / CVE → RCE | 🟡 PENDENTE |
| 7 | **OpenSSH 7.4 (porta 22022)** | 162.214.99.39 | CVE-2024-6387 (regreSSHion) → RCE | 🟡 PENDENTE |
| 8 | **Pure-FTPd com TLS** | 162.214.99.39:21 | Acesso anônimo / CVE | 🟡 PENDENTE |
| 9 | **WordPress dirs expostos** | telaviva.com.br/wp-content/ | Plugin/themes com CVE, info disclosure | 🟡 PENDENTE |
| 10 | **BunnyCDN pull zone 2489850** | telaviva.b-cdn.net | Origin bypass, cache poisoning | 🟡 PENDENTE |

### 🟦 MÉDIO
| # | Vetor | Alvo | Payoff | Status |
|---|-------|------|--------|--------|
| 11 | **Dovecot IMAP/POP3** | 162.214.99.39:143/993/110/995 | Cred stuffing → email access | 🟡 PENDENTE |
| 12 | **Next.js wildcard DNS** | apsv-iptv.duckdns.org | Subdomain takeover se DNS abandonado | 🟡 PENDENTE |
| 13 | **WP Rocket 3.21.3** | telaviva.com.br | Cache poisoning / info disclosure | 🟡 PENDENTE |
| 14 | **Sem WAF** | Ambos os hosts | Scanning irrestrito, sem proteção | ✅ VERIFICADO |
| 15 | **Sentry/PostHog tracking** | apsv-iptv.duckdns.org | Info disclosure via error tracking | 🟡 PENDENTE |

### ⬜ BAIXO
| # | Vetor | Alvo | Payoff | Status |
|---|-------|------|--------|--------|
| 16 | **Banner disclosure (nginx 1.24.0)** | apsv-iptv.duckdns.org | OS fingerprint | 🔵 INFO |
| 17 | **TLS sem vulnerabilidades** | apsv-iptv.duckdns.org | Nada reportado | ✅ OK |
| 18 | **Email OSINT** | contato@telaviva.com.br + staff | Social engineering candidates | 🔵 INFO |

## Infrastructure Map

```
apsv-iptv.duckdns.org (TelaViva IPTV App)
  ├── IP: 56.125.111.53 (AWS)
  ├── Next.js + Nginx 1.24.0
  ├── JWT API (/api/channels, /api/vod, /api/payments, /api/epg)
  ├── Portas: 22(SSH), 80(HTTP→443), 443(HTTPS)
  └── No WAF/Cloudflare — ORIGEM DIRETA

telaviva.com.br (TelaViva News — WordPress)
  ├── IP: 162.214.99.39 (Bluehost/Unified Layer)
  ├── WordPress + cPanel/WHM
  ├── Portas: 21(FTP), 26/465/587(SMTP), 53(DNS), 110/143/993/995(IMAP/POP3), 443(HTTPS), 2082-2096(cPanel/WHM)
  ├── CDN: telaviva.b-cdn.net (BunnyCDN pull zone 2489850)
  └── DNS/Infra: Teletime (teletime.com.br)

telaviva.net
  └── IP: 51.116.99.197 (GoDaddy) — OUT OF SCOPE (MS IIS, cert não-TelaViva)
```

## Attack Plan (Priorizado)

### Fase A — JWT API Attack (apsv-iptv.duckdns.org)
1. Testar `alg=none`, `alg=HS256` com chave pública
2. Brute-force JWT secret (john/hashcat com wordlist)
3. Testar IDOR em `/api/channels`, `/api/vod`, `/api/payments`
4. Explorar rate limiting (26s reset) para brute-force

### Fase B — cPanel/WHM Pivot (telaviva.com.br)
1. Default creds (admin/admin, root/password, etc.)
2. CVE research para versão do cPanel
3. phpPgAdmin — default creds, SQL injection
4. xmlrpc.php — brute-force WP users

### Fase C — Wordpress Attack (telaviva.com.br)
1. wpscan enum completo (users, plugins, themes, vulns)
2. Plugin/themes CVE research
3. WP config disclosure (/wp-config.php backup?)

### Fase D — CVE Research
1. Exim 4.99.5 — CVEs conhecidos (CVE-2024-39929?)
2. OpenSSH 7.4 — CVE-2024-6387 (regreSSHion)
3. Pure-FTPd — versão e CVEs
4. Dovecot — CVEs por versão
5. WP Rocket 3.21.3 — CVEs
6. Node.js/Next.js — versão e CVEs

### Fase E — Network Services
1. FTP anonymous access
2. SMTP open relay test
3. DNS zone transfer
4. IMAP/POP3 cred stuffing