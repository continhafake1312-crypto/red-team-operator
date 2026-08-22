# ACTIVE.md — Recon Ativo iptvgear.site

## Resumo

### Hosts Diretos (fora CDN)

| Host | IP | Notas |
|------|-----|-------|
| **iptvgear.net** | **103.160.107.175** | 🔥 **SEM Cloudflare** — Servidor real `omega.herosite.pro` |
| iptvgear.site | 104.21.45.182 / 172.67.218.28 | Cloudflare (WAF detectado) |
| iptvgear.com | 104.21.40.170 | Cloudflare (301 redirect) |

### Portscan — 103.160.107.175 (omega.herosite.pro)

| Porta | Estado | Serviço | Versão |
|-------|--------|---------|--------|
| 6667 | ✅ Open | Dovecot IMAP | AUTH=PLAIN |
| **6969** | **✅ Open** | **ProFTPD** | **1.3.1 — ANONYMOUS LOGIN ✅ CRÍTICO** |
| 80/tcp | ❌ Closed | — | — |
| 443/tcp | ❌ Closed | — | — |
| 8080/tcp | ❌ Closed | — | — |
| 8000/tcp | ❌ Closed | — | — |
| 8443/tcp | ❌ Closed | — | — |
| Demais ports | ❌ Closed/Filtered | — | — |

### Descobertas Críticas

#### 🔴 F-001: FTP Anônimo (ProFTPD 1.3.1) — CRÍTICO
- Login anonymous ALLOWED
- Acesso a diretórios: `/`, `FTP-shared/`, `root/`, `lost+found/`
- Versão antiga (~2014) — potencial RCE via CVE
- PASV mode retorna IP inválido (1.2.3.3) — NAT misconfig

#### 🟡 F-002: Dovecot IMAP exposto (porta 6667)
- AUTH=PLAIN
- Porta não padrão
- Potencial para brute force / credential stuffing

### Cloudflare

| Alvo | WAF | Bypass |
|------|-----|--------|
| iptvgear.site | ✅ Cloudflare WAF | Tentar Host header injection para IP real |
| iptvgear.com | ✅ Cloudflare | 301 redirect |

### Vhosts — 103.160.107.175
- **Hostname**: `omega.herosite.pro` (SolidHosting — provedor de hospedagem)
- Web ports (80/443) fechados — site served via Cloudflare apenas

### TLS
- Sem TLS diretamente no IP real (porta 443 fechada)
- Cloudflare gerencia SSL/TLS para iptvgear.site

### Ranking de Payoff (§16)

| Prioridade | Alvo | Vetor | Payoff |
|------------|------|-------|--------|
| 🔥 **ALTO** | 103.160.107.175:6969 | FTP Anônimo — leitura/escrita + CVE | Acesso a arquivos, potencial RCE |
| 🔥 **ALTO** | iptvgear.site | WordPress/WooCommerce | Admin, DB, dados financeiros |
| 🟡 **MÉDIO** | 103.160.107.175:6667 | Dovecot IMAP AUTH=PLAIN | Cred stuffing, emails |
| 🟡 **MÉDIO** | GCP Buckets | Geo-restritos | Dados backup/assets |
| 🟢 **BAIXO** | iptvgear.com | WordPress via Cloudflare | Info adicional |

### Próximos Passos
1. **CRÍTICO**: Enumerar FTP via PORT mode custom server — tentar baixar arquivos
2. **CRÍTICO**: CVE research para ProFTPD 1.3.1
3. **ALTO**: Bypass Cloudflare + enumerar WordPress (/wp-json, /wp-admin)
4. **ALTO**: WPScan em iptvgear.site
5. **MÉDIO**: Brute force IMAP com email info@iptvgear.com
6. **MÉDIO**: Verificar buckets GCP com diferentes regiões