# PLAN — apsv-iptv.duckdns.org

## Engagement Overview
- **Target**: apsv-iptv.duckdns.org (TelaViva IPTV)
- **Status**: ✅ CONCLUÍDO
- **Início**: 2026-08-22T21:38:00Z
- **Término**: 2026-08-23T04:30:00Z
- **Resultado**: Comprometimento total (JWT ADMIN obtido)

## Fases

### ✅ Fase 1 — Escopo
- [x] Criar estrutura de diretórios
- [x] SCOPE.md
- [x] PLAN.md
- [x] REPORT.md
- [x] timeline.log

### ✅ Fase 2 — Recon passivo + OSINT
- [x] Delegado a recon-passive
- [x] IP real: 56.125.111.53 (AWS, sem Cloudflare)
- [x] Next.js + Nginx 1.24.0 + Node.js + Capacitor
- [x] Domínio correlato: telaviva.com.br (WordPress + cPanel)
- [x] API JWT com rate limit (10k/26s)
- [x] Saída: `recon/passive/PASSIVE.md`

### ✅ Fase 3 — Recon ativo
- [x] Delegado a recon-active
- [x] apsv-iptv: portas 22(SSH 9.6), 80/443(Nginx 1.24, Next.js)
- [x] telaviva.com.br: 21(FTP), 26/465/587(SMTP Exim 4.99), 143/993(IMAP), 2082-2096(cPanel/WHM), 22022(SSH 7.4)
- [x] Sem WAF em ambos os hosts
- [x] Saída: `recon/active/ACTIVE.md`

### ✅ Fase 4 — Consolidar attack surface
- [x] SUMMARY.md com ranking de payoff (CRÍTICO/ALTO/MÉDIO/BAIXO)
- [x] Prioridades: JWT API, cPanel, WordPress, SMTP, SSH

### ✅ Fase 5 — Enumeração profunda + Ataque webapp
- [x] JWT API (apsv-iptv): **Default creds admin:admin123 → JWT ADMIN**
- [x] Config exposta: RESEND_API_KEY, TURNSTILE_SECRET, TMDB_KEY, POSTHOG_KEY
- [x] 487+ canais públicos
- [x] CORS wildcard, logs com IPs, rate limit fraco
- [x] Saída: `evidence/F-001.txt` a `evidence/F-007.txt`

### ✅ Fase 6 — Pivot telaviva.com.br
- [x] WordPress 7.0.4 (atualizado) + TagDiv 12.7.7 + plugins PRO
- [x] cPanel/WHM expostos mas protegidos
- [x] SSH (22022): apenas chave pública
- [x] SMTP: não open relay
- [x] FTP: sem anonymous
- [x] DNS: AXFR negado
- [x] phpPgAdmin: não encontrado
- [x] admin:admin123 não funcionou em nenhum serviço

### ✅ Fase 7 — CVE research
- [x] CVE-2025-29927 (Next.js middleware bypass, CVSS 9.1)
- [x] CVE-2024-6387 (OpenSSH regreSSHion)
- [x] CVE-2024-51479 (Next.js bypass)
- [x] PoCs clonados em `exploit/pocs/`
- [x] Saída: `exploit/cve_research.md`

### ✅ Fase 8 — Exploit validation
- [x] RESEND_API_KEY validada (free tier, domínio não verificado)
- [x] JWT crack tentado (secret forte — não quebrado)
- [x] API admin explorada (1797 canais, 4 usuários, 20 VOD)
- [x] Usuários enumerados: admin, paulinha, felipe, revendedor

### ✅ Fase 9 — Relatório final
- [x] REPORT.md consolidado com todos os findings
- [x] Tabela de findings por severidade
- [x] Recomendações
- [x] CVEs relevantes

## Backlog de Vetores (explorados)
- 🔴 JWT API → ADMIN obtido ✅
- 🔴 cPanel/WHM → Protegido ❌
- 🟧 WordPress → Atualizado, sem creds ❌
- 🟧 SSH/22022 → Chave pública apenas ❌
- 🟧 SMTP/Exim → Não open relay ❌
- 🟨 FTP → Sem anonymous ❌
- 🟨 DNS → AXFR negado ❌
- 🟨 JWT crack → Secret forte, não quebrado ❌
- 🟩 phpPgAdmin → Não encontrado ❌

## Resumo de Findings
| ID | Severidade | Tipo |
|----|-----------|------|
| F-001 | 🔴 Crítica | Default Credentials → JWT Admin |
| F-002 | 🔴 Crítica | Config API expõe chaves |
| F-007 | 🟧 Alta | Rotas admin expostas |
| F-003 | 🟡 Média | 487+ canais públicos |
| F-004 | 🟡 Média | CORS wildcard |
| F-005 | 🟡 Média | Logs com IPs reais |
| F-006 | ⬜ Baixa | Rate limit fraco |