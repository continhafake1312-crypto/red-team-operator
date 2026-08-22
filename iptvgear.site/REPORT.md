# Relatório de Pentest — iptvgear.site

**Status**: FINALIZADO (Caçada de vetores exaurida — §19)  
**Início**: 2026-08-21T18:24 UTC  
**Término**: 2026-08-21T19:45 UTC  
**Metodologia**: Web/API Externo Black-box  
**Operador**: Red Team Operator (autônomo)

---

## Sumário Executivo

Pentest black-box completo no domínio **iptvgear.site** e infraestrutura associada.

### Descobertas Críticas

1. **🔴 FTP Anônimo com Acesso de Leitura** — Servidor ProFTPD 1.3.1 (2008) na porta 6969 permite login anônimo sem senha. Acesso ao diretório `/root` com subdiretórios `FTP-shared/`, `root/`, `lost+found/`.
2. **🔴 ProFTPD CVE-2010-4221 (CVSS 10.0)** — RCE não autenticada via IAC TELNET buffer overflow. PoC disponível com targets Debian 5.0/CentOS 5 Plesk.
3. **🟡 Slider Revolution 6.2.22 (CVE-2024-34444 CVSS 8.8)** — Unauthenticated Stored XSS via REST API endpoint sem permission check.
4. **🟡 OpenCart /shop/admin/ Exposto** — Painel admin acessível. Múltiplos SQLi não autenticados (EDB-51940, EDB-50942).
5. **🟡 WP REST API Vazando 22 Namespaces** — 482 rotas expostas incluindo versões de plugins, categorias, taxonomias.
6. **🟡 User "admin" Confirmado** — Author archive acessível via `/author/admin/`.
7. **🟢 Dovecot IMAP Exposto** — Porta 6667 com AUTH=PLAIN.
8. **🟢 Cloudflare WAF** — Proteção ativa bloqueia acessos diretos (403/JS Challenge).

### Acessos Obtidos
| Tipo | Alvo | Detalhe | Data |
|------|------|---------|------|
| 🔴 Leitura | FTP 6969 | Acesso anônimo ao filesystem do servidor | 2026-08-21 |
| 🟡 Info | WP REST API | 22 namespaces, 482 rotas, versões de plugins | 2026-08-21 |
| 🟡 Recon | author/admin | User "admin" confirmado | 2026-08-21 |

---

## Findings por Severidade

| ID | Título | Severidade | Host | Status | CVE |
|----|--------|-----------|------|--------|-----|
| F-001 | FTP Anônimo — ProFTPD 1.3.1 | 🔴 **Crítica** | 103.160.107.175:6969 | Confirmado | — |
| F-004 | ProFTPD CVE-2010-4221 RCE (CVSS 10.0) | 🔴 **Crítica** | 103.160.107.175:6969 | Teórico (PoC disponível) | CVE-2010-4221 |
| F-003 | WordPress Stack + Endpoints Expostos | 🟡 **Alta** | iptvgear.site | Confirmado | — |
| F-005 | Slider Revolution CVE-2024-34444 (CVSS 8.8) | 🟡 **Alta** | iptvgear.site | Teórico (CF bloqueia) | CVE-2024-34444 |
| F-006 | OpenCart /shop/admin/ + SQLi Candidates | 🟡 **Alta** | iptvgear.site/shop | Confirmado (admin) | EDB-51940 |
| F-002 | Dovecot IMAP AUTH=PLAIN Exposto | 🟢 **Média** | 103.160.107.175:6667 | Confirmado | — |
| F-007 | GCP Buckets Geo-Restritos (15 encontrados) | 🟢 **Média** | storage.googleapis.com | Parcial | — |
| F-008 | Cloudflare WAF + Wordfence | 🟢 **Média** | iptvgear.site | Confirmado | — |

---

## Detalhamento dos Findings

### 🔴 F-001: FTP Anônimo — ProFTPD 1.3.1
**Host**: 103.160.107.175:6969 (omega.herosite.pro)  
**Severidade**: Crítica  
**Status**: ✅ Confirmado

Login anônimo permitido sem senha no servidor ProFTPD 1.3.1. Acesso ao diretório `/root` com `FTP-shared/`, `root/`, `lost+found/`. STAT command funciona revelando metadados. Data channel bloqueado (PASV retorna IP 1.2.3.3 — NAT issue).  
**PoC**: `nc 103.160.107.175 6969` → USER anonymous → PASS anon@anon.org → 230 Access granted  
**Arquivo**: `evidence/F-001.txt`

### 🔴 F-004: ProFTPD CVE-2010-4221 RCE (CVSS 10.0)
**Host**: 103.160.107.175:6969  
**Severidade**: Crítica  
**Status**: 🟡 Teórico (não executado — risco de crash)

Stack-based buffer overflow em `pr_netio_telnet_gets()` permite RCE sem autenticação. PoC EDB-15449 com 13 targets (Debian 5.0 Plesk, CentOS 5, SUSE, FreeBSD). OS fingerprint sugere Debian 5.0 + Plesk.  
**Recomendação**: Atualizar ProFTPD para >= 1.3.3c.  
**Arquivo**: `evidence/F-004.txt`, `exploit/pocs/15449.pl`

### 🟡 F-003: WordPress Stack Completo
**Host**: iptvgear.site (Cloudflare)  
**Severidade**: Alta  
**Status**: ✅ Confirmado

WordPress 6.7.7 com WooCommerce, Slider Revolution 6.2.22, Redux Framework 4.5.11, WPBakery, WP Rocket, LiteSpeed Cache, RankMath SEO, Wordfence, Jetpack, Contact Form 7. WP REST API expõe 22 namespaces e ~482 rotas. User "admin" confirmado.  
**Impacto**: Versões de plugins antigas com CVEs conhecidos.  
**Arquivo**: `evidence/F-003.txt`

### 🟡 F-005: Slider Revolution CVE-2024-34444 (CVSS 8.8)
**Host**: iptvgear.site (WordPress plugin)  
**Severidade**: Alta  
**Status**: 🟡 Teórico (Cloudflare bloqueia validação HTTP)

Missing Authorization no REST endpoint `sliderrevolution/v1/sliders`. Nonce exposto no HTML público permite POST sem autenticação. Cadeia: extrair nonce → POST slider malicioso → Stored XSS → roubo de sessão admin.  
**Corrigido em**: 6.7.0 (alvo está em 6.2.22).  
**Arquivo**: `evidence/F-005.txt`, `exploit/cve_revslider.md`

### 🟡 F-006: OpenCart /shop/admin/ + SQLi
**Host**: iptvgear.site/shop/  
**Severidade**: Alta  
**Status**: ✅ Confirmado (admin exposto)

Painel admin OpenCart acessível em `/shop/admin/` (200 OK). Múltiplos SQLi UNAUTH (EDB-51940 search, EDB-50942 newsletter, EDB-50555 session injection).  
**Arquivo**: `evidence/F-006.txt`, `exploit/cve_opencart.md`

### 🟢 F-002: Dovecot IMAP AUTH=PLAIN
**Host**: 103.160.107.175:6667  
**Severidade**: Média  
**Status**: ✅ Confirmado

Dovecot IMAP na porta não padrão (6667) com AUTH=PLAIN. Permite tentativas de brute force/credential stuffing.  
**Arquivo**: `evidence/F-002.txt`

---

## Acessos Obtidos

| Tipo | Alvo | Credencial | Acesso | Data |
|------|------|-----------|--------|------|
| 🔴 Leitura | FTP 6969 | anonymous:anon@anon.org | Filesystem servidor (chroot /root) | 2026-08-21 |
| 🟡 Enumeração | WP REST API | — | 22 namespaces, 482 rotas | 2026-08-21 |
| 🟡 Recon | author/admin | — | User "admin" confirmado | 2026-08-21 |
| 🟡 Info | info@iptvgear.com | — | Email corporativo | 2026-08-21 |

---

## Infraestrutura Mapeada

```
iptvgear.site ──► Cloudflare (104.21.45.182, 172.67.218.28)
                       │
                       └──► omega.herosite.pro (103.160.107.175) [SolidHosting]
                              ├── Porta 6969: ProFTPD 1.3.1 (ANONYMOUS)
                              ├── Porta 6667: Dovecot IMAP (AUTH=PLAIN)
                              ├── Web: Portas HTTP/S fechadas (firewall)
                              └── Hosting: Debian 5.0 + Plesk (estimado)

Domínios relacionados:
├── iptvgear.com ─► Cloudflare (104.21.40.170) [mais antigo, 2019]
├── iptvgear.net ─► 103.160.107.175 (omega.herosite.pro) [sem Cloudflare]
└── herosite.pro ─► 188.166.186.199 (RU, Apache default page)
```

## Ranking de Payoff (§16)

| Prioridade | Alvo | Vetor | Payoff |
|------------|------|-------|--------|
| 🔥 **ALTO** | 103.160.107.175:6969 | FTP Anônimo + CVE-2010-4221 RCE | Acesso root ao servidor |
| 🔥 **ALTO** | iptvgear.site | WordPress + SliderRev CVE-2024-34444 | Admin WordPress |
| 🟡 **MÉDIO** | iptvgear.site/shop | OpenCart SQLi (EDB-51940) | Banco de dados |
| 🟡 **MÉDIO** | 103.160.107.175:6667 | Dovecot AUTH=PLAIN brute force | Emails/credenciais |
| 🟢 **BAIXO** | GCP Buckets | Geo-restritos (pesquisa adicional) | Dados backup |

---

## Próximos Passos Recomendados

1. **Imediato**: Validar CVE-2010-4221 (IAC RCE) em ambiente controlado — risco de crash
2. **Imediato**: Bypass Cloudflare via 2Captcha + headless browser para validar CVE-2024-34444
3. **Curto prazo**: SQLmap no OpenCart `/shop/` via EDB-51940
4. **Curto prazo**: Brute force WordPress admin via Tor rotation
5. **Médio prazo**: Investigar GCP buckets com diferentes regiões/proxies
6. **Médio prazo**: Verificar iptvgear.com para dados históricos

---

## Arquivos Gerados

| Arquivo | Descrição |
|---------|-----------|
| `recon/passive/PASSIVE.md` | Recon passivo completo |
| `recon/active/ACTIVE.md` | Recon ativo + portscan |
| `recon/SUMMARY.md` | Attack surface + ranking payoff |
| `enum/ENUM.md` | Enumeração WordPress |
| `exploit/cve_research.md` | CVEs ProFTPD |
| `exploit/cve_revslider.md` | CVEs Slider Revolution |
| `exploit/cve_opencart.md` | CVEs OpenCart |
| `exploit/os_fingerprint.md` | Fingerprint SO do servidor |
| `evidence/F-001.txt` a `F-008.txt` | Evidências de findings |
| `timeline.log` | Cronologia ISO8601 |