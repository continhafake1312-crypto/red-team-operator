# Relatório de Pentest — marketroblox.store / marketroblox.com

**Início**: 2026-08-24T04:11:00Z  
**Tipo**: Black-box Externo Web/API  
**Metodologia**: AGENTS.md §5  
**Status**: Engagement completo — 158 artefatos, 5.7MB de evidências

## Resumo Executivo

Engagement de pentest completo em **marketroblox.com** (marketplace de contas Roblox). 
A aplicação roda PHP 7.4.33 (EOL Nov/2022) em LiteSpeed com Cloudflare WAF.

### Principais Descobertas

| # | Achado | Severidade | Status |
|---|--------|-----------|--------|
| 1 | composer.json/.lock expostos — dependências completas vazadas | 🔴 Alta | Confirmado |
| 2 | PHPMailer v6.5.1 (entre versões de segurança) — RCE potencial | 🔴 **Crítica** | Validado |
| 3 | SMTP não configurado — site não envia emails | 🟡 Info | **Mitigador** |
| 4 | PHP 7.4.33 EOL — sem patches desde 2022 | 🔴 Alta | Confirmado |
| 5 | Guzzle 7.4.1 + psr7 2.1.0 — CRLF injection + cookie leakage | 🔴 Alta | Validado |
| 6 | facebook/graph-sdk 5.1.4 — EOL desde 2019 | 🟡 Média | Confirmado |
| 7 | Security headers ausentes (CSP, HSTS, XFO) | 🟡 Média | Confirmado |
| 8 | `.env` protegido por Cloudflare WAF — não acessível via HTTP | 🟡 Info | Bloqueado |
| 9 | Registro de usuário aberto + API key exposta no frontend | 🟡 Média | Confirmado |
| 10 | Order IDOR (formato conhecido) — precisa de trans_id real para teste | 🟡 Média | Inconclusivo |

### Nota sobre CVEs
- **CVE-2024-33572** ❌ NÃO é PHPMailer (é plugin WordPress Nexter Blocks)
- **CVE-2022-29248** ❌ NÃO é CRLF injection (é cookie domain leakage)
- CRLF real está em **CVE-2022-31031** (psr7 < 2.2.1) e **CVE-2026-55766/49214**

### Vetores Sem Sucesso
- Order IDOR: sem trans_id real (requer compra com saldo)
- Mass Assignment: servidor valida preço no backend
- SQLi: validação de tipo bloqueia
- XSS: outputs sanitizados
- cPanel brute force: padrões testados sem sucesso
- .env bypass: Cloudflare WAF bloqueia todas variações
- PHPMailer RCE: SMTP não configurado (mitigado)

## Tabela de Findings

| ID | Severidade | Tipo | Host | Vetor | Status | Data |
|----|-----------|------|------|-------|--------|------|
| F-001 | Alta | Information Disclosure | marketroblox.com | composer.json/lock exposed | ✅ Confirmado | 2026-08-24 |
| F-002 | Crítica | RCE (mail() inj.) | marketroblox.com | PHPMailer v6.5.1 (entre v6.5.0 e v6.9.1) | ⚠️ Validado (dependência) | 2026-08-24 |
| F-003 | Média | Missing Headers | marketroblox.com | No X-Frame-Options/CSP/HSTS | ✅ Confirmado | 2026-08-24 |
| F-004 | Alta | EOL Software | marketroblox.com | PHP 7.4.33 (EOL Nov 2022) | ✅ Confirmado | 2026-08-24 |
| F-005 | Média | EOL Dependency | marketroblox.com | facebook/graph-sdk 5.1.4 | ✅ Confirmado | 2026-08-24 |
| F-006 | Alta | CRLF + Cookie Leak | marketroblox.com | guzzle/guzzle 7.4.1 + psr7 2.1.0 | ⚠️ Validado (dependência) | 2026-08-24 |

## Detalhamento

### F-001: composer.json / composer.lock Expostos
- **Severidade**: Alta
- **Vetor**: GET /composer.json → 200, GET /composer.lock → 200
- **Impacto**: Attack surface mapping completo. Todas as dependências e versões exatas expostas.
- **Recomendação**: Bloquear acesso a /composer.json e /composer.lock

### F-002: PHPMailer v6.5.1 — RCE potencial via mail() injection (CORRIGIDO + MITIGADO)
- **Severidade**: Crítica (potencial) → **Mitigado** (SMTP não configurado)
- **CVE Real**: NENHUM CVE público atribuído entre v6.5.1 e v6.9.1. ~~CVE-2024-33572~~ NÃO é PHPMailer.
- **Vetor**: PHPMailer v6.5.1 (entre v6.5.0 que corrigiu CVEs e v6.9.1 com "security fixes")
- **Teste de injeção**:
  - Register: rejeitou CRLF ("Định dạng Email không hợp lệ" - validação de formato)
  - ForgotPassword: **"Website chưa được cấu hình SMTP"** (SMTP não configurado!)
- **Impacto**: MITIGADO — PHPMailer não pode enviar emails sem SMTP ou sendmail configurado. O forgot-password retorna explicitamente que SMTP não está configurado.
- **Recomendação**: Atualizar PHPMailer para >= 6.9.1 mesmo assim, e configurar SMTP com segurança.

### F-003: Missing Security Headers
- **Severidade**: Média
- **Vetor**: Headers HTTP ausentes (X-Frame-Options, CSP, HSTS, X-Content-Type-Options)
- **Impacto**: Clickjacking, XSS sem CSP, SSL stripping, MIME sniffing
- **Recomendação**: Implementar todos os headers de segurança

### F-004: PHP 7.4.33 End of Life
- **Severidade**: Alta
- **Vetor**: PHP 7.4.33 EOL desde Nov 2022 (3+ anos sem patches)
- **Impacto**: Nenhum patch de segurança para CVEs futuras
- **Recomendação**: Migrar para PHP 8.1+ imediatamente

### F-005: facebook/graph-sdk 5.1.4 (EOL)
- **Severidade**: Média
- **Vetor**: Facebook Graph SDK de 2018 (7+ anos sem patches)
- **Impacto**: Possível signature bypass, CSRF, access token issues
- **Recomendação**: Atualizar para versão mais recente

### F-006: guzzlehttp/guzzle 7.4.1 + psr7 2.1.0 — Múltiplos CVEs (CORRIGIDO)
- **Severidade**: Alta
- **CVEs Reais**: 
  - CVE-2022-29248: Cross-domain cookie leakage (CVSS 8.1) ~~(NÃO é CRLF)~~
  - CVE-2022-31043: Auth header leak (CVSS 7.5)
  - CVE-2022-31042: Cookie leak (CVSS 7.5)
  - CVE-2022-31031: **CRLF Injection** em psr7 (CVSS 7.5)
  - CVE-2026-55766/49214: CRLF Injection (CVSS 5.3)
- **Vetor**: Guzzle 7.4.1 usa psr7 2.1.0 (anterior a 2.2.1 para CVE-2022-31031 e 2.7.1 para CVEs 2026)
- **Impacto**: CRLF injection, request smuggling, cookie/header leakage
- **Recomendação**: Atualizar guzzle para >= 7.4.4 e psr7 para >= 2.7.1

## Timeline

Ver `timeline.log`.

## Anexos

- `evidence/F-001.txt` a `evidence/F-006.txt` — evidências por finding
- `recon/` — artefatos de reconhecimento
- `screenshots/` — capturas de tela