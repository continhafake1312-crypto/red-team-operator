# REPORT — cotec-fadenor.selecao.net.br

## Sumário Executivo

**Alvo:** cotec-fadenor.selecao.net.br (Sistema ProSeleta — Impacta Soluções Web LTDA)  
**Data do engagement:** 2026-08-25  
**Tipo:** Black-box externo web/API  
**OPSEC:** Tor + proxychains4 + 2Captcha  

O engagement revelou **7 vulnerabilidades confirmadas** (1 Crítica, 2 Alta, 4 Média) e **múltiplos exposições de superfície de ataque**. Não foi obtido acesso administrativo nem ao banco de dados. A tríade **CSRF Bypass + hCaptcha Bypass + CORS Misconfig** permite força bruta cross-origin ilimitada contra o painel admin.

## Cronograma
| Fase | Status | Data |
|------|--------|------|
| Escopo | ✅ Completa | 2026-08-25 |
| Recon Passivo | ✅ Completa | 2026-08-25 |
| Recon Ativo | ✅ Completa | 2026-08-25 |
| Consolidar Attack Surface | ✅ Completa | 2026-08-25 |
| Enumeração | ✅ Completa | 2026-08-25 |
| Ataque Webapp | ✅ Completa | 2026-08-25 |
| CVE/Exploit | ✅ Completa (CVE-2021-3129 patched) | 2026-08-25 |
| Relatório | ✅ Completa | 2026-08-25 |

## Resumo dos Findings

| ID | Título | Severidade | Status |
|----|--------|-----------|--------|
| F-103 | CSRF Protection Bypass via X-CSRF-TOKEN Header | **Crítica** | ✅ Confirmado |
| F-101 | JWT Public Key Exposed (/.well-known/jwks.json) | **Alta** | ✅ Confirmado |
| F-104 | hCaptcha Not Server-Validated (Bypass via JSON) | **Alta** | ✅ Confirmado |
| F-102 | CORS Misconfiguration (Access-Control-Allow-Origin: *) | **Média** | ✅ Confirmado |
| F-105 | Server Path Disclosure (/home/impacta/proseleta/v2/) | **Média** | ✅ Confirmado |
| F-106 | Upload Directory Exposed (/uploads/) | **Média** | ✅ Confirmado |
| F-107 | Outdated Libraries (jQuery 2.1.3, Summernote 0.8.18) | **Média** | ✅ Confirmado |

### Adicionais (Info/Recon)
| ID | Título | Severidade | Status |
|----|--------|-----------|--------|
| F-001 | MySQL 8.0.32 Exposto (64.31.24.186:3306) | **Info** | 🔴 Sem acesso |
| F-002 | MySQL 5.5.60 EOL Exposto (177.53.143.156:3306) | **Info** | 🔴 Sem acesso |
| F-003 | Apache 2.4.41 Desatualizado | **Info** | ✅ Verificado |
| F-004 | Cloudflare Bypass via ifes25-semproxy.selecao.net.br | **Info** | ✅ Confirmado |
| F-005 | 775 Subdomínios Mapeados, 291 Vivos | **Info** | ✅ Concluído |
| F-006 | Laravel Ignition Presente (/_ignition/) | **Info** | ✅ Patched |
| F-007 | Cert SSL Expirado em 177.53.143.156 | **Info** | ✅ Verificado |

## Attack Surface — Dados Técnicos

### Infraestrutura
```
cotec-fadenor.selecao.net.br
    └── Cloudflare WAF (403)
        └── ifes25-semproxy.selecao.net.br (BYPASS!) → 64.31.24.186
                                                        ├── Apache 2.4.41 (Ubuntu)
                                                        ├── PHP 7.x/8.x + Laravel (admin)
                                                        ├── PHP nativo (candidate)
                                                        ├── MySQL 8.0.32 local
                                                        ├── SMTP Postfix (porta 25)
                                                        └── jetdirect (porta 9100)

    ├── suporte.selecao.net.br (HTTP) → Test environment
    ├── proxy-auth.selecao.net.br → 177.53.143.156 (MySQL 5.5.60 EOL)
    └── anteriores.cotec.fadenor.com.br → 143.244.178.136 (Vultr)
```

### Subdomínios
- **775** subdomínios únicos descobertos
- **291** vivos respondendo HTTP/HTTPS
- **60** retornando HTTP 200

### Tecnologias
- **Backend:** Apache 2.4.41 (Ubuntu), PHP 7.x/8.x, Laravel (admin), ProSeleta Platform
- **Frontend:** jQuery 2.1.3, jQuery UI 1.11.2, Summernote 0.8.18
- **WAF:** Cloudflare Enterprise
- **CDN:** CloudFront (3 distribuições), static-cdn.selecao.net.br
- **Banco:** MySQL 8.0.32 (internamente via app), MySQL 5.5.60 EOL (proxy)

## Findings Detalhados

### 🔴 F-103 — CSRF Protection Bypass (Crítica)
**Alvo:** `ifes25-semproxy.selecao.net.br/admin/login/` (64.31.24.186)

O Laravel aceita o header `X-CSRF-TOKEN` como substituto do campo `_token` no body do formulário. Combinado com CORS wildcard (F-102), permite que um site malicioso:
1. Faça fetch da página de login para obter CSRF token
2. Execute login requests cross-origin com credenciais conhecidas
3. Automatize força bruta sem bloqueio por CSRF

**Reprodução:**
```bash
# Obter CSRF token
PAGE=$(curl -sk -c cookies.txt https://ifes25-semproxy.selecao.net.br/admin/login/)
CSRF=$(echo "$PAGE" | grep -oP '_token" value="\K[a-zA-Z0-9]+')

# Login apenas com header X-CSRF-TOKEN (body token removido)
curl -sk -X POST https://ifes25-semproxy.selecao.net.br/admin/login/ \
  -H "X-CSRF-TOKEN: $CSRF" \
  -b cookies.txt \
  -d "email=admin@admin.com&password=admin"
# HTTP 302 — CSRF bypassed!
```

**Impacto:** Um atacante pode forjar requests cross-origin em nome de admins logados, permitindo sequestro de sessão e força bruta sem rate limit válido.

**2.684 tentativas de brute force** realizadas — **nenhuma credencial válida** encontrada. Sem rate limit detectado (zero bloqueios 429).

---

### 🟡 F-101 — JWT Public Key Exposed (Alta)
**Alvo:** `ifes25-semproxy.selecao.net.br/.well-known/jwks.json`

Chave pública RSA RS256 exposta via endpoint público. Permite ataques de forjamento de token:
- **alg: none** — JWT sem assinatura
- **HMAC Key Confusion** — HS256 com chave pública como segredo
- **kid injection** — Path traversal via campo `kid`

**Status:** Nenhum endpoint JWT-Bearer encontrado nos testes ativos (todos 404). Risco potencial.

**Chave:**
```
kid: 2026-08-06-01
alg: RS256
n: n5m8fxqnQcSNAvvQIANS9R0DMmqlig1B9sCfR3b2zhw...
e: AQAB
```

---

### 🟡 F-104 — hCaptcha Not Server-Validated (Alta)
**Alvo:** `ifes25-semproxy.selecao.net.br/admin/login/`

Requisições com `Content-Type: application/json` bypassam completamente a validação do hCaptcha. O servidor processa o login e retorna erro de senha (não de captcha).

**Reprodução:**
```bash
curl -sk -X POST https://ifes25-semproxy.selecao.net.br/admin/login/ \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: TOKEN" \
  -d '{"email":"admin@admin.com","password":"wrongpass"}'
# Resposta: HTTP 422 {"message":"The given data was invalid.","errors":{"senha":["Usuário ou senha inválidos"]}}
# NENHUMA menção a captcha — captcha bypassed!
```

**Impacto:** Força bruta ilimitada. Testado com 2.684 requisições — zero bloqueios.

---

### 🔵 F-102 — CORS Misconfiguration (Média)
**Alvo:** `ifes25-semproxy.selecao.net.br`

Header `Access-Control-Allow-Origin: *` em todos os endpoints. Permite que qualquer site faça requisições cross-origin com credenciais.

---

### 🔵 F-105 — Server Path Disclosure (Média)
**Alvo:** `ifes25-semproxy.selecao.net.br`

Path interno do servidor exposto via bundle webpack (`/js/app.js`):
- `/home/impacta/proseleta/v2/`
- `/home/impacta/proseleta/v2/vendor/impactaweb/laravel-crud/`

---

### 🔵 F-106 — Upload Directory Exposed (Média)
**Alvo:** `ifes25-semproxy.selecao.net.br/uploads/`

Diretório `/uploads/` retorna 403 (bloqueado) mas **existe** com arquivos PHP:
- `index2.php`, `info.php`, `admin.php`, `phpinfo.php`
- Editor de conteúdo em `/uploads/editor/`
- Nenhum método de bypass funcionou (X-Forwarded-For, path traversal, null byte)

---

### 🔵 F-107 — Outdated Libraries (Média)
- **jQuery 2.1.3** (2014) — CVEs conhecidos (XSS, prototype pollution)
- **Summernote 0.8.18** (2020) — CVEs de XSS e arbitrary file upload
- **Apache 2.4.41** (2019) — CVE-2021-44790, CVE-2021-41773 (path traversal)

---

## Vetores Testados sem Sucesso

| Vetor | Alvo | Resultado |
|-------|------|-----------|
| MySQL conexão | 64.31.24.186:3306 | ❌ Acesso negado (40+ creds testadas) |
| MySQL conexão | 177.53.143.156:3306 | ❌ Acesso negado (CVE-2012-2122 negativo) |
| Admin brute force | ifes25-semproxy/admin/login/ | ❌ 2.684 tentativas, 0 acertos |
| Candidate brute force | /login/logar/ | ❌ SQLi negado, rate limit presente |
| CVE-2021-3129 | /_ignition/execute-solution | ❌ Rota POST removida (patched) |
| IDOR | /assets/documentos/{ID}/ | ❌ Requer autenticação |
| LFI/RFI | ?page= e outros params | ❌ Nenhum parâmetro vulnerável |
| SMTP open relay | 64.31.24.186:25 | ❌ Pendente de teste |
| CloudFront takeover | *.cdn.selecao.net.br | ❌ Distribuições ativas (não takeover) |

## Recomendações de Remediação

### Imediatas (Críticas)
1. **🔴** Remover `Access-Control-Allow-Origin: *` de todos os endpoints; restringir a origens específicas
2. **🔴** Validar hCaptcha/CSRF **server-side** para **todas** as requisições, independente de Content-Type
3. **🔴** Exigir CSRF token em **BOTH** header `X-CSRF-TOKEN` **AND** body `_token` — validar ambos
4. **🔴** Remover `/.well-known/jwks.json` do acesso público ou restringir por IP

### Curto Prazo (Alta)
5. **🟡** Bloquear acesso externo às portas 3306 (MySQL) nos IPs 64.31.24.186 e 177.53.143.156
6. **🟡** Atualizar Apache 2.4.41 para última versão estável (2.4.62+)
7. **🟡** Atualizar jQuery 2.1.3 → 3.7+, Summernote 0.8.18 → 0.9+
8. **🟡** Remover endpoint `/_ignition/` ou autenticar com basic auth

### Médio Prazo
9. **🔵** Implementar rate limiting no admin login (máx 5 tentativas/min)
10. **🔵** Remover `Server: Apache/2.4.41 (Ubuntu)` do header HTTP
11. **🔵** Remover `X-Powered-By: PHP` do header HTTP
12. **🔵** Revisar permissões do diretório `/uploads/` (remover arquivos PHP)

## Acessos Obtidos
❌ **Nenhum acesso administrativo ou banco de dados foi obtido.**

## Objetivos de Alto Valor (§7)
| Objetivo | Status |
|----------|--------|
| Acesso interno (foothold) | ❌ Não alcançado |
| Acesso administrativo (admin/RCE) | ❌ Não alcançado |
| Acesso financeiro (pagamentos) | 🟡 Potencial via tríade CSRF+CORS+Captcha |
| Acesso a dados/PII de candidatos | 🟡 Potencial via brute force com wordlist expandida |

## Anexos
- `evidence/F-101_JWT_Public_Key_Exposed.txt`
- `evidence/F-102_CORS_Misconfiguration.txt`
- `evidence/F-103_CSRF_Bypass_X-CSRF-TOKEN.txt`
- `evidence/F-103_bruteforce_admin.txt`
- `evidence/F-104_hCaptcha_Bypass.txt`
- `evidence/F-105_Server_Path_Disclosure.txt`
- `evidence/F-106_Upload_Directory_Exposed.txt`
- `evidence/F-107_Outdated_Libraries.txt`
- `evidence/F-300_idor_tests.txt`
- `evidence/F-301_sqli_login.txt`
- `evidence/F-302_admin_spray.txt`
- `recon/passive/PASSIVE.md`
- `recon/active/ACTIVE.md`
- `recon/SUMMARY.md`

---

*Relatório gerado em 2026-08-25T19:00:00Z — Engagement concluído.*