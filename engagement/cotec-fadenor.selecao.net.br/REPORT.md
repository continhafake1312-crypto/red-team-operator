# REPORT — cotec-fadenor.selecao.net.br

## Sumário Executivo
*Engagement iniciado em 2026-08-25. Relatório incremental — atualizado a cada finding.*

## Cronograma
| Fase | Status | Data |
|------|--------|------|
| Escopo | ✅ Completa | 2026-08-25 |
| Recon Passivo | ✅ Completa | 2026-08-25 |
| Recon Ativo | ✅ Completa | 2026-08-25 |
| Consolidar Attack Surface | ✅ Completa | 2026-08-25 |
| Enumeração | ✅ Completa | 2026-08-25 |
| Ataque Webapp | ✅ Completa | 2026-08-25 |
| Relatório | ✅ Completa | 2026-08-25 |

## Resumo dos Findings

| ID | Título | Severidade | Status |
|----|--------|-----------|--------|
| F-101 | JWT Public Key Exposed (/.well-known/jwks.json) | **Alta** | ✅ Confirmado |
| F-102 | CORS Misconfiguration (Access-Control-Allow-Origin: *) | **Média** | ✅ Confirmado |
| F-103 | CSRF Protection Bypass via X-CSRF-TOKEN Header | **Crítica** | ✅ Confirmado |
| F-104 | hCaptcha Not Server-Validated | **Alta** | ✅ Confirmado |
| F-105 | Server Path Disclosure | **Média** | ✅ Confirmado |
| F-106 | Upload Directory Exposed (/uploads/) | **Média** | ✅ Confirmado |
| F-107 | Outdated Libraries (jQuery 2.1.3, Summernote 0.8.18) | **Média** | ✅ Confirmado |
| F-108 | Apache Version Disclosure | **Baixa** | ✅ Confirmado |

## Findings Detalhados

### 🔴 F-103 — CSRF Protection Bypass (Crítica)
O endpoint `/admin/login/` aceita o header `X-CSRF-TOKEN` como substituto do campo `_token` no body. Isso permite que um atacante (via CORS + CSRF) force requests de login sem token CSRF no body. Combinado com CORS aberto (F-102), permite ataque completo de cross-origin.

**Payload:**
```bash
curl -sk -X POST https://ifes25-semproxy.selecao.net.br/admin/login/ \
  -H "X-CSRF-TOKEN: TOKEN" \
  -b cookies.txt \
  -d "email=admin@admin.com&password=admin"
# HTTP 302 (sem CSRF token no body) vs HTTP 419 sem header
```

### 🔴 F-104 — hCaptcha Not Server-Validated (Alta)
Requisições JSON ao `/admin/login/` são processadas sem validação do token hCaptcha, permitindo força bruta automatizada ilimitada.

**Payload:**
```bash
curl -sk -X POST https://ifes25-semproxy.selecao.net.br/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"test"}'
# Responde com 422 "senha inválidos" — captcha NÃO validado
```

## Recomendações Imediatas (Prioridade)
1. 🔴 Remover `Access-Control-Allow-Origin: *` do admin/login
2. 🔴 Validar hCaptcha server-side para todas requisições
3. 🔴 Exigir CSRF token em BOTH header AND body
4. 🔴 Remover /.well-known/jwks.json do acesso público
5. 🟡 Atualizar jQuery 2.1.3 e Summernote 0.8.18

## Anexos
- `evidence/F-101_JWT_Public_Key_Exposed.txt`
- `evidence/F-102_CORS_Misconfiguration.txt`
- `evidence/F-103_CSRF_Bypass_X-CSRF-TOKEN.txt`
- `evidence/F-104_hCaptcha_Bypass.txt`
- `evidence/F-105_Server_Path_Disclosure.txt`
- `evidence/F-106_Upload_Directory_Exposed.txt`
- `evidence/F-107_Outdated_Libraries.txt`