# ACTIVE.md — Recon Ativo | futemax.luxury

## Metadados
| Campo | Valor |
|-------|-------|
| Alvo | futemax.luxury (futemax.lol) |
| Data | 2026-08-26T01:00Z |
| Ferramentas | rustscan, nmap, whatweb, wafw00f, curl |
| OPSEC | Tor + proxychains4 (exit: 109.70.100.3) |
| Duração | ~45 min |

---

## Topologia Descoberta

```
                         +-- Cloudflare WAF (104.21.48.87 / 172.67.183.8)
                         |
futemax.luxury ----------+-- Origin REAL: 212.92.104.6 (Rússia, Moscow)
  (WordPress 7.1)       |       |-- nginx (port 80/8080)
                         |       |-- OpenSSH 8.9p1 (port 1022)
                         |       |-- SSL (port 443 - Cloudflare whitelist)
                         |       |-- pcsync-http? (port 8444 - SSL fail)
                         |       |-- DNS (port 53/udp)
                         |       |-- Joken JWT HS256 anti-bot
                         |       |-- Vhosts: ALL catch-all -> Joken
                         |
futemax.lol -------------+ 212.92.104.6 (mesmo servidor)
  (Joken anti-bot)       

172.241.213.98 ----------+ ORIGEM ANTIGA (Luxemburgo)
  (302 -> survey-smiles.com)   |-- nginx
                               |-- Google Cloud App Armor WAF
                               |-- portas: 80,443,8080 (abertas)

survey-smiles.com -------+ 208.91.196.145 (Ilhas Virgens Britânicas)
  (nginx 1.28.0 fake)    |-- Via-Proxy: 1.1 google
                               |-- "Error. Page cannot be displayed."
```

---

## 1. Portscan — IP Real: 212.92.104.6

### TCP (rustscan)
| Porta | Estado | Serviço | Versão | Notas |
|-------|--------|---------|--------|-------|
| 80/tcp | open | http (nginx) | n/a | Redirect/Joken anti-bot |
| 443/tcp | open | ssl/https | n/a | Apenas Cloudflare (SSL fail externo) |
| 1022/tcp | open | ssh | **OpenSSH 8.9p1 Ubuntu 3ubuntu0.13** | 🔴 CVE candidate |
| 8080/tcp | open | tcpwrapped (nginx) | n/a | Mesmo que porta 80 |
| 8444/tcp | open | ssl/pcsync-http? | n/a | SSL_ERROR_SYSCALL |

### UDP
| Porta | Estado | Serviço |
|-------|--------|---------|
| 53/udp | open | domain (DNS) |

### Portscan — IP Antigo: 172.241.213.98
| Porta | Estado | Serviço |
|-------|--------|---------|
| 80/tcp | open | nginx (302 -> survey-smiles.com) |
| 443/tcp | open | tcpwrapped |
| 8080/tcp | open | tcpwrapped |

---

## 2. Web Fingerprint

### futemax.luxury (via Cloudflare)
| Tecnologia | Versão |
|------------|--------|
| CMS | **WordPress 7.1** |
| Theme | Canais Play v1.2.9 / FuteMAX Oficial |
| jQuery | 3.7.1 |
| SEO | Rank Math SEO |
| WAF | Cloudflare |
| TLS | 1.3, AES_256_GCM_SHA384, X25519 |
| Cert | futemax.luxury (Google Trust, exp 2026-11-21) |
| Anti-Bot | **Joken JWT HS256** (JS challenge) |
| Title | "FuteMAX Oficial - Futebol Ao Vivo - UFC - Esportes - NBA" |
| OG Tags | paulodbs (admin user) |

### 212.92.104.6 (Origin - sem Host header)
- **302 Found** → `http://survey-smiles.com`
- Server: nginx
- Cookie: `sid=` (longa expiração ~68 anos)

### 212.92.104.6 (Origin - com Host: futemax.luxury)
- **200 OK**
- Server: nginx
- **Joken JWT JS challenge** (window.location.replace com JWT)
- Accept-CH headers

### survey-smiles.com (208.91.196.145)
- **200 OK**
- nginx/1.28.0 (versão falsa - estável atual é 1.26.x)
- Via-Proxy: 1.1 google (Google Cloud)
- Conteúdo: "Error. Page cannot be displayed."

### 172.241.213.98 (Legacy Origin)
- **302 Found** → `http://survey-smiles.com`
- nginx, Google Cloud App Armor WAF

### Vhosts (todos via 212.92.104.6)
**Todos os vhosts.*** `.futemax.luxury` retornam **200** (nginx catch-all):
- admin, api, www, static, stream, help, shop, cdn, dev, test, app, portal, beta, mail, webhook, dashboard, backoffice, manage, panel, intranet, staging, demo, vpn, docs, status, payment, billing

**NENHUM vhost tem conteúdo distinto** — todos servem Joken anti-bot challenge.

---

## 3. WAF Detection

| Host | WAF |
|------|-----|
| futemax.luxury | **Cloudflare** ✅ |
| 172.241.213.98 | **Google Cloud App Armor** |
| 212.92.104.6 | **Nenhum** (apenas Joken anti-bot) |
| futemax.lol | **Nenhum** (acesso direto) |

---

## 4. Joken Anti-Bot Analysis

JWT HS256 capturado:
```json
{
  "aud": "Joken",
  "exp": 1787713607,
  "iat": 1787706407,
  "iss": "Joken",
  "js": 1,
  "jti": "337jb0bhsuv1lpmp0c8cl002",
  "nbf": 1787706407,
  "ts": 1787706407167364
}
```

- **Tipo:** JS challenge (precisa executar JS no browser para gerar token válido)
- **Algoritmo:** HS256 (HMAC-SHA256)
- **Issuer:** "Joken"
- **Payload:** `js:1` indica desafio JS, `jti` é nonce único, `ts` timestamp microssegundo
- **Nota:** Se key for fraca, HS256 é vulnerável a brute-force offline

---

## 5. TLS Assessment

| Host:Port | TLS | Cipher | Cert |
|-----------|-----|--------|------|
| futemax.luxury:443 | TLS 1.3 | AES_256_GCM_SHA384 | ✅ válido (Google Trust) |
| 212.92.104.6:443 | - | Fallha (SSL_ERROR_SYSCALL) | - |
| 212.92.104.6:8444 | - | Fallha (SSL_ERROR_SYSCALL) | - |
| futemax.lol:443 | - | Fallha | - |

**Conclusão:** Porta 443 do origin só aceita conexões de IPs Cloudflare (origin-pull).

---

## 6. Findings Preliminares

### 🔴 Alta Prioridade

| # | Finding | Detalhe |
|---|---------|---------|
| F-001 | **OpenSSH 8.9p1 exposto** | Porta 1022 acessível. CVE-2023-38408 (RCE via SSH agent) / CVE-2023-51385 (double-free) |
| F-002 | **Origin sem WAF** | 212.92.104.6 não tem Cloudflare nem outro WAF - apenas Joken anti-bot |
| F-003 | **survey-smiles.com redirect** | Ambos os IPs redirecionam para survey-smiles.com (VG) - possível sequestro/redirecionamento malicioso |
| F-004 | **WordPress 7.1 + plugins** | Versão WP conhecida por vulnerabilidades; Canais Play theme pode ter falhas |

### 🟡 Média Prioridade

| # | Finding | Detalhe |
|---|---------|---------|
| F-005 | **Joken JWT HS256** | Se chave for fraca/deixada em código, permite forjar tokens |
| F-006 | **DNS exposto (53/udp)** | Servidor DNS na porta 53 do origin |
| F-007 | **Porta 8444 serviço desconhecido** | pcsync-http? com SSL falho |
| F-008 | **nginx versão falsa** | survey-smiles.com reporta nginx 1.28.0 (não existe) - possível backdoor |

### 🟢 Baixa Prioridade

| # | Finding | Detalhe |
|---|---------|---------|
| F-009 | **Cookie sid com expiração 68 anos** | Potencial tracking/fingerprinting |
| F-010 | **Vhost catch-all sem restrição** | Qualquer Host header retorna 200 |

---

## 7. Versões Vulneráveis Candidates

| Serviço | Versão | CVEs Potenciais |
|---------|--------|----------------|
| **OpenSSH** | 8.9p1 Ubuntu 3ubuntu0.13 | CVE-2023-38408 (RCE pre-auth), CVE-2023-51385, CVE-2023-48795 (Terrapin) |
| **WordPress** | 7.1 | Múltiplas CVEs (core + plugins/themes) |
| **jQuery** | 3.7.1 | CVE-2020-11023 (XSS via $.htmlPrefilter) |
| **nginx** | (desconhecida) | Verificar versão exata via enum |
| **Joken JWT** | HS256 custom | Se key fraca → forja de token |

---

## 8. Ranking de Payoff Atualizado

| Prioridade | Host/Vetor | Porquê |
|------------|-----------|--------|
| 🔴 **ALTO** | **212.92.104.6:1022 (SSH)** | Acesso direto, RCE potencial via CVE-2023-38408 |
| 🔴 **ALTO** | **212.92.104.6:80/8080 (nginx)** | Sem WAF, Joken bypassável, vhost catch-all |
| 🔴 **ALTO** | **futemax.luxury (WordPress)** | WPScan + admin panel enum; creds default |
| 🟡 **MÉDIO** | **212.92.104.6:53 (DNS)** | Zone transfer? Enum subdomínios |
| 🟡 **MÉDIO** | **survey-smiles.com** | Investigar relação (redirect suspeito) |
| 🟡 **MÉDIO** | **Joken JWT HS256 crack** | Se key fraca → bypass anti-bot |
| 🟢 **BAIXO** | **172.241.213.98 (Legacy)** | Provavelmente fora de uso |

---

## 9. Próximos Passos Recomendados

Para enumeração (Fase 5):
1. **WPScan** no futemax.luxury (users, plugins, themes, vulns)
2. **Content discovery** no origin 212.92.104.6 (ffuf com wordlists)
3. **SSH brute/CVE check** no port 1022
4. **DNS enumeration** (AXFR? subdomain brute?)
5. **Joken bypass** (resolver JS challenge, capturar token JWT)
6. **survey-smiles.com** — investigar domínio (possível infra compartilhada)

Para webapp (Fase 6):
1. **WordPress** — wp-admin, xmlrpc, REST API, default creds
2. **JWT analysis** — tentar HS256 key crack (rockyou)
3. **IDOR/BOLA** — API endpoints no futemax.luxury
4. **SQLi** — parâmetros no WordPress/core

---

## 10. Artefatos Gerados

| Arquivo | Conteúdo |
|---------|----------|
| `nmap_full_tcp.txt` | Port scan completo (212.92.104.6) |
| `nmap_services.txt` | Fingerprint serviços/versões |
| `nmap_udp.txt` | UDP scan (porta 53 aberta) |
| `nmap_udp_origin.txt` | UDP scan 212.92.104.6 |
| `tls_ssl.txt` | TLS assessment |
| `tls_ssl_origin.txt` | TLS origin scan |
| `waf_detection.txt` | WAF detection results |
| `httpx_hosts.txt` | Web probe todos hosts |
| `vhosts_ffuf.txt` | Vhost fuzzing |
| `tech_stack_detailed.txt` | whatweb detail |
| **`ACTIVE.md`** | Este arquivo |