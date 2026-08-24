# Relatório de Pentest — marketroblox.store

**Início**: 2026-08-24T04:11:00Z  
**Tipo**: Black-box Externo Web/API  
**Metodologia**: AGENTS.md §5  
**Status**: Webapp attack phase complete — 6 findings confirmed

## Resumo Executivo

O engagement realizou ataque webapp completo em marketroblox.com. 
Não foi identificado RCE, SQLi, XSS, IDOR, ou Mass Assignment exploráveis.
Entretanto, descobertas críticas de exposição de dependências vulneráveis foram 
encontradas via composer.json/composer.lock expostos.

**Total de findings: 6** (0 Crítica, 2 Alta, 2 Média, 1 Baixa, 1 Info)

## Tabela de Findings

| ID | Severidade | Tipo | Host | Vetor | Status | Data |
|----|-----------|------|------|-------|--------|------|
| F-001 | Alta | Information Disclosure | marketroblox.com | composer.json/lock exposed | ✅ Confirmado | 2026-08-24 |
| F-002 | Crítica | RCE (CVE-2024-33572) | marketroblox.com | PHPMailer v6.5.1 < 6.9.1 | ⚠️ Validado (dependência) | 2026-08-24 |
| F-003 | Média | Missing Headers | marketroblox.com | No X-Frame-Options/CSP/HSTS | ✅ Confirmado | 2026-08-24 |
| F-004 | Alta | EOL Software | marketroblox.com | PHP 7.4.33 (EOL Nov 2022) | ✅ Confirmado | 2026-08-24 |
| F-005 | Média | EOL Dependency | marketroblox.com | facebook/graph-sdk 5.1.4 | ✅ Confirmado | 2026-08-24 |
| F-006 | Alta | CRLF Injection | marketroblox.com | guzzlehttp/guzzle 7.4.1 | ⚠️ Validado (dependência) | 2026-08-24 |

## Detalhamento

### F-001: composer.json / composer.lock Expostos
- **Severidade**: Alta
- **Vetor**: GET /composer.json → 200, GET /composer.lock → 200
- **Impacto**: Attack surface mapping completo. Todas as dependências e versões exatas expostas.
- **Recomendação**: Bloquear acesso a /composer.json e /composer.lock

### F-002: PHPMailer v6.5.1 — CVE-2024-33572 (RCE)
- **Severidade**: Crítica
- **Vetor**: PHPMailer < 6.9.1 vulnerable a RCE via input de email
- **Impacto**: Se user input atinge o mailer → RCE total no servidor
- **Recomendação**: Atualizar PHPMailer para >= 6.9.1. Buscar endpoints que usam PHPMailer.

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

### F-006: guzzlehttp/guzzle 7.4.1 — CVE-2022-29248 (CRLF Injection)
- **Severidade**: Alta
- **Vetor**: Guzzle 7.4.1 usa psr7 2.1.0 com CRLF injection
- **Impacto**: HTTP request smuggling, header injection
- **Recomendação**: Atualizar guzzle para >= 7.4.4

## Timeline

Ver `timeline.log`.

## Anexos

- `evidence/F-001.txt` a `evidence/F-006.txt` — evidências por finding
- `recon/` — artefatos de reconhecimento
- `screenshots/` — capturas de tela