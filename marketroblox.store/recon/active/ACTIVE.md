# ACTIVE Recon Report — marketroblox.com / marketroblox.store

**Date:** 2026-08-24 UTC
**OPSEC:** proxychains4 → Tor (exit 107.189.7.168)
**Engagement Dir:** /home/ubuntu/marketroblox.store/recon/active/

---

## 1. Origin IP Discovery (Tentativas de Bypass Cloudflare)

**Resultado: ❌ NÃO DESCOBERTO** — Nenhum IP real encontrado atrás do Cloudflare.

### Técnicas testadas

| Técnica | Resultado |
|---------|-----------|
| `--resolve` com IPs Cloudflare (104.21.24.108, 172.67.218.86) | Conexão bem-sucedida via Cloudflare (não bypass) |
| Conexão direta SSL/TLS nos IPs Cloudflare (portas não-80/443) | `sslv3 alert handshake failure` — Cloudflare bloqueia |
| Conexão HTTP nos IPs Cloudflare (porta 80) | 301 redirect → HTTPS (Cloudflare) |
| IPv6 direto (2606:4700:3035::6815:186c, etc.) | Cloudflare reject |
| Conexão sem SNI | `ssl3 ext invalid servername` — Cloudflare drops |
| TLS 1.0/1.1 downgrade | Cloudflare não permite |
| Checagem de subdomínios alternativos (bot, shopclonev7) | Também Cloudflare (526 SSL error) |
| DNS brute force (50+ subdomínios) | Todos resolvem para Cloudflare ou NXDOMAIN |
| ViewDNS.info DNS history | 104.26.12.118 (outro IP Cloudflare edge) |
| Shodan web search | 88.80.26.2 (nosso Tor exit), 104.18.12.238 (Cloudflare) |
| Censys | Sem API key — não foi possível consultar |
| crt.sh | 502 Bad Gateway (Tor bloqueado por Cloudflare) |
| Favicon hash | 879667294 (calculado localmente) |
| Historical DNS | Impossível — domínios < 2 meses |
| CloudFlair | Não instalado (restrição pip system) |

### IPs Cloudflare Confirmados

| Host | IPs Cloudflare | CDN |
|------|---------------|-----|
| marketroblox.com | 104.21.24.108, 172.67.218.86 | Cloudflare (AS13335) |
| www.marketroblox.com | 104.21.24.108, 172.67.218.86 | Cloudflare (AS13335) |
| marketroblox.store | 104.21.95.93, 172.67.144.20 | Cloudflare (AS13335) |
| bot.marketroblox.store | 104.21.95.93, 172.67.144.20 | Cloudflare (AS13335) |
| shopclonev7.marketroblox.store | 104.21.95.93, 172.67.144.20 | Cloudflare (AS13335) |

**Observação:** O header `x-turbo-charged-by: LiteSpeed` indica que o servidor de origem roda LiteSpeed (comum com cPanel). O `/cpanel` acessível (HTTP 200) confirma cPanel presente. O IP real provavelmente pertence a uma rede de hospedagem compartilhada LiteSpeed/cPanel.

---

## 2. Port Scanning

### Cloudflare IPs (104.21.24.108, 172.67.218.86)

Apenas portas 80/443 respondem (Cloudflare proxy). Todas as outras portas (8080, 8443, 2053, 2083, 2087, 2096, etc.) retornam `connection refused` ou `sslv3 alert handshake failure`.

```
PORT    STATE SERVICE  VERSION
80/tcp  open  http     Cloudflare proxy (301 → HTTPS)
443/tcp open  https    Cloudflare proxy (TLS 1.3 / ECDSA)
```

### 88.80.26.2 (Tor exit node — falso positivo)

```
PORT   STATE SERVICE  VERSION
22/tcp open  ssh      OpenSSH 9.2p1 Debian
80/tcp open  http     Tor built-in httpd (DirPortFrontPage)
```

Descartado — é o próprio nó de saída Tor.

---

## 3. WAF Detection

```
Ferramenta: wafw00f v2.4.2
Alvo: https://marketroblox.com
Resultado: Cloudflare (Cloudflare Inc.) WAF detected
Requests: 7
```

**WAF ativo:** Cloudflare WAF em ambos os domínios (.com e .store).

---

## 4. Vhost Fuzzing

### marketroblox.com (ffuf, 5000 palavras)

| Vhost | Status | Tamanho | Notas |
|-------|--------|---------|-------|
| www.marketroblox.com | 200 | 91.573 bytes | Único vhost encontrado |
| ... (demais 4999) | filtrado | — | Todos 301/302/403/404/526 |

**Nenhum vhost não documentado descoberto.**

### marketroblox.store (ffuf, 5000 palavras)

Nenhum vhost adicional além do próprio domínio (redireciona para .com).

---

## 5. TLS Deep Dive

### nmap ssl-* scripts — marketroblox.com:443

**Certificado:**
| Campo | Valor |
|-------|-------|
| Subject | CN = marketroblox.com |
| SAN | DNS:marketroblox.com, DNS:*.marketroblox.com |
| Emissor | Google Trust Services / WE1 |
| Validade | 2026-08-01 → 2026-10-30 (~90 dias) |
| Algoritmo | ECDSA (P-256) |
| Assinatura | ecdsa-with-SHA256 |

**Ciphers suportados:**
| Versão TLS | Ciphers | Nota |
|------------|---------|------|
| TLS 1.0 | ECDHE-ECDSA-AES128-SHA, ECDHE-ECDSA-AES256-SHA | Grade A (fraco mas presente) |
| TLS 1.1 | ECDHE-ECDSA-AES128-SHA, ECDHE-ECDSA-AES256-SHA | Grade A |
| TLS 1.2 | ECDHE-ECDSA-AES128-GCM-SHA256, ECDHE-ECDSA-AES256-GCM-SHA384, ECDHE-ECDSA-CHACHA20-POLY1305 + 4 outros | Grade A |
| TLS 1.3 | TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256 | Grade A |

**Vulnerabilidades testadas (nmap):**
- Heartbleed: ❌ Não vulnerável
- POODLE (SSLv3): ❌ Não aplicável (SSLv3 não suportado)
- Weak DH params: ❌ Não aplicável (ECDSA, sem DH)

**Nota:** Cloudflare termina o TLS — o certificado é do Cloudflare (Google Trust Services), não do servidor de origem.

---

## 6. HTTP Fingerprint Consolidado

### httpx (tech-detect)

| Host | Status | Tecnologias |
|------|--------|-------------|
| marketroblox.com | 200 OK | Bootstrap, Cloudflare, Cloudflare NEL, Google Font API, PHP |
| www.marketroblox.com | 200 OK | Bootstrap, Cloudflare, Cloudflare NEL, Google Font API, PHP |
| marketroblox.store | 301 → .com | Cloudflare, Cloudflare NEL |
| www.marketroblox.store | 302 → .com | Cloudflare, Cloudflare NEL |
| bot.marketroblox.store | 526 SSL Error | Cloudflare |
| shopclonev7.marketroblox.store | 526 SSL Error | Cloudflare |

### whatweb

| Host | Detalhes |
|------|----------|
| marketroblox.com | PHP 7.4.33, Bootstrap, jQuery 1.12.4/3.6.0, Cookies[PHPSESSID], X-Powered-By: PHP/7.4.33, Title (marketplace), HTML5 |
| bot.marketroblox.store | 526, Cloudflare, Title: "marketroblox.store \| 526: Invalid SSL certificate" |
| shopclonev7.marketroblox.store | 526, Cloudflare, Title: "marketroblox.store \| 526: Invalid SSL certificate" |

### Headers (curl -I)

**marketroblox.com (200):**
```
server: cloudflare
x-powered-by: PHP/7.4.33
x-turbo-charged-by: LiteSpeed
set-cookie: PHPSESSID=...; HttpOnly; SameSite=Lax
cf-cache-status: DYNAMIC
```

**Headers-chave:**
- `x-turbo-charged-by: LiteSpeed` → **Origem roda LiteSpeed**
- `x-powered-by: PHP/7.4.33` → PHP 7.4 (EOL Nov 2022)
- `cf-cache-status: DYNAMIC` → Conteúdo dinâmico, não cacheado pelo Cloudflare

---

## 7. Subdomínios 526 SSL Error

**bot.marketroblox.store** e **shopclonev7.marketroblox.store** retornam HTTP 526 (Cloudflare não consegue validar certificado da origem).

```http
HTTP/2 526
server: cloudflare
content-type: text/plain; charset=UTF-8
content-length: 16
cache-control: private, max-age=0, no-store, no-cache, must-revalidate
x-frame-options: SAMEORIGIN
Body: "526"
```

**Interpretação:** A origem atrás do Cloudflare para estes subdomínios tem um certificado SSL inválido/expirado. Cloudflare está configurado para "Full SSL (Strict)" mas o certificado de origem não é válido. Isso confirma que:
- Existe um servidor de origem separado para `.store`
- O certificado SSL desse servidor expirou ou é inválido
- O IP de origem é DIFERENTE dos IPs Cloudflare

**Não foi possível determinar o IP de origem** — Cloudflare ainda faz proxy e bloqueia conexões diretas.

---

## 8. Sumário de Artefatos

| Arquivo | Conteúdo |
|---------|----------|
| `nmap_cloudflare_ips.txt` | nmap -sV -sC ports 80,443,8080,8443+ nos IPs Cloudflare |
| `nmap_88.80.26.2.txt` | nmap no potencial IP (Tor exit — falso positivo) |
| `tls_results.txt` | nmap ssl-cert + ssl-enum-ciphers + ssl-heartbleed |
| `httpx_live.txt` | httpx -tech-detect -title -status-code (JSON) |
| `vhosts_results.txt` / `.json` | ffuf vhost fuzzing (.com) |
| `vhosts_store_results.txt` / `.json` | ffuf vhost fuzzing (.store) |
| `waf_detection.txt` | wafw00f output |
| `whatweb_all.txt` | whatweb consolidado (todos hosts) |
| `headers_all.txt` | curl -I para todos hosts |
| `origin_ip_attempts.txt` | Log completo de tentativas de bypass Cloudflare |
| `dns_bruteforce_subdomains.txt` | DNS brute force de subdomínios comuns |
| `crtsh_output.txt` | crt.sh query (502 — bloqueado) |

---

## 9. Ranking de Payoff Atualizado

| Prioridade | Alvo | Host | Vetor | Payoff | Notas |
|------------|------|------|-------|--------|-------|
| 🔴 **CRÍTICO** | `/.env` | marketroblox.com | Força bruta | Credenciais DB | 403 exists — tentar bypass |
| 🔴 **CRÍTICO** | `/.git/config` | marketroblox.com | Git exposure | Código fonte | 403 exists — tentar bypass |
| 🔴 **CRÍTICO** | `/cpanel` (200) | marketroblox.com | cPanel login | Acesso hosting | Página de login acessível |
| 🔴 **ALTO** | `/admin` (302) | marketroblox.com | Auth bypass | Admin marketplace | Redireciona para login |
| 🔴 **ALTO** | PHP 7.4.33 (EOL) | marketroblox.com | CVE pesquisa | RCE | EOL Nov 2022, CVEs conhecidos |
| 🔴 **ALTO** | LiteSpeed | marketroblox.com | CVE pesquisa | RCE/Info | Header `x-turbo-charged-by` |
| 🟡 **MÉDIO** | `/api` (301) | marketroblox.com | Enum endpoints | Dados usuários | Redireciona |
| 🟡 **MÉDIO** | `/administrator` (302) | marketroblox.com | Auth bypass | Admin secundário | |
| 🟡 **MÉDIO** | bot/shopclonev7 (526) | .store | SSL misconfig | Info disclosure | Certificado origem inválido |
| 🟡 **MÉDIO** | Descoberta IP real | Ambos | Cloudflare bypass | Acesso direto à origem | Prioridade #1 não resolvida |
| 🟢 **BAIXO** | `/mod/` | marketroblox.com | Directory listing | Módulos source | |
| 🟢 **BAIXO** | `/logs`, `/error`, `/debug` | marketroblox.com | Info disclosure | Debug info | |
| 🟢 **BAIXO** | SweetAlert2 10.15.6 | marketroblox.com | XSS | DOM XSS | CVE-2024-XXXX? |
| 🟢 **BAIXO** | JS analysis | marketroblox.com | API keys | Endpoints | JS retornou vazio (Cloudflare) |

---

## 10. Próximos Passos Recomendados

### Fase 5 — Enumeração/WebApp

1. **Content discovery** (dirsearch/gobuster/ffuf) em marketroblox.com:
   - `/admin/`, `/api/`, `/mod/`, `/client/`, `/ajaxs/`
   - Wordlist: `/usr/share/seclists/Discovery/Web-Content/common.txt`
   - Extensões: php, json, txt, env, bak, old

2. **/.env e /.git bypass:**
   - Tentar bypass de WAF/Cloudflare: `/.env.%00`, `/.env backup`, `/.env.old`
   - Method override: `PUT`, `PATCH`
   - Path traversal: `/....//....//.env`
   - Headers: `X-Forwarded-For: 127.0.0.1`, `X-Real-IP: 127.0.0.1`

3. **cPanel brute force:**
   - Testar credenciais padrão (admin:admin, root:root, etc.)
   - Procurar CVEs para versões específicas do cPanel

4. **Admin panel enum:**
   - Testar registro de usuário
   - IDOR em endpoints de usuário
   - Parâmetros expostos no JS

5. **API endpoints:**
   - Descobrir endpoints em `/api/`, `/ajaxs/`
   - Testar SQLi, IDOR, auth bypass

6. **PHP 7.4.33 CVE research:**
   - CVE-2024-XXXX (RCE), CVE-2023-XXXX (LFI)
   - Testar com ferramentas como `phpvuln` ou manual

7. **LiteSpeed CVE research:**
   - Verificar versão do LiteSpeed (não detectada diretamente)
   - CVE-2023-XXXX, CVE-2024-XXXX

8. **JS analysis (tentar bypass Cloudflare challenge):**
   - Usar `--user-agent` rotativo
   - Tentar via API headless (Playwright/Puppeteer)
   - Baixar JS via CDN alternativo se disponível

### Para descoberta de IP real (continuar tentando):

1. **Shodan API** (se key disponível) — buscar por favicon hash 879667294
2. **Censys API** (se key disponível) — buscar por certificado
3. **SecurityTrails** (se key disponível) — DNS histórico
4. **CloudBleed technique** — monitorar Shodan para novos hosts servindo marketroblox.com
5. **Email leak** — se um email for descoberto, rastrear headers SMTP
6. **DNS zone transfer** (improvável — Cloudflare bloqueia)
7. **CertSpotter / crtsh** — tentar com IP diferente (não Tor)
8. **Verificar se o servidor de origem tem IP em ranges de datacenters comuns** (Vietnã? — moeda VND presente)

---

## 11. Conclusão

**IP real não descoberto.** Cloudflare está configurado corretamente sem vazamentos de IP. Os únicos IPs identificados pertencem à edge network do Cloudflare (AS13335).

**Achados mais relevantes para a próxima fase:**
- PHP 7.4.33 (EOL) — alta prioridade para CVE research
- LiteSpeed server confirmado via header
- cPanel acessível em `/cpanel`
- `.env` e `.git/config` retornam 403 (existem, protegidos)
- 526 SSL errors em bot/shopclonev7 indicam certificado inválido na origem (mas IP não descoberto)
- Nenhum vhost escondido ou subdomínio não documentado encontrado
- TLS forte (Grade A, Cloudflare) — sem vulnerabilidades no edge