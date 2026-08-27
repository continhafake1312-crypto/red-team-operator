# REPORT.md — fernandapessoa.com.br

> Relatório incremental. Atualizado a cada finding pelo coordenador.

## Metadados

- **Alvo:** `fernandapessoa.com.br`
- **Tipo:** Web/API externo black-box
- **Owner do engagement:** Red Team Operator (coordenador)
- **OPSEC:** Tor + proxychains4 + 2Captcha (Cloudflare bypass)
- **Início:** 2026-08-27T03:22Z (UTC)

## Sumário executivo

Engagement iniciado. Fase 1 (Escopo) concluída. Fase 2 (Recon Passivo) concluída — achados críticos:

### 🔴 Achados Críticos Imediatos
1. **Painéis admin expostos SEM Cloudflare** (187.45.185.33): cPanel, WHM, Webmail — ataque direto possível
2. **Directory listing exposto**: `mail.fernandapessoa.com.br` e `envio.fernandapessoa.com.br`
3. **Servidor Windows exposto** (177.44.191.252): Apache 2.4.54, PHP 7.4.33 — sem Cloudflare
4. **Server SMTP AWS** (54.165.96.105) — vetor de SPF/email

### 🟡 Achados Altos
- **Next.js app** (`app.fernandapessoa.com.br`) — portal interno atrás de Cloudflare
- **WooCommerce 10.7** (`loja.fernandapessoa.com.br`) — e-commerce
- **WordPress 7.0.1** com matrículas em múltiplos subdomínios
- **Mautic** — marketing automation (503, pode ser indicador de CVE)
- **7 emails de desenvolvimento** expostos em GitHub
- **19 repositórios GitHub** da organização

## Findings por severidade

| ID | Severidade | Título | Host | Status |
|----|------------|--------|------|--------|
| F-001 | Crítica | Painéis admin (cPanel/WHM/Webmail) expostos SEM Cloudflare | cpanel/whm/webmail.fernandapessoa.com.br (187.45.185.33) | 🔍 recon ativo pendente |
| F-002 | Crítica | Directory listing exposto (mail/enviar) | mail/envio.fernandapessoa.com.br (187.45.185.33) | 🔍 recon ativo pendente |
| F-003 | Crítica | Servidor Windows com Apache/PHP exposto SEM Cloudflare | wpp.fernandapessoa.com.br (177.44.191.252) | 🔍 recon ativo pendente |
| F-004 | Alta | Next.js app com portal interno + _buildManifest.js vazando rotas | app.fernandapessoa.com.br | 🔍 enum pendente |
| F-005 | Alta | WooCommerce 10.7 — e-commerce com dados de pagamento | loja.fernandapessoa.com.br | 🔍 enum pendente |
| F-006 | Média | 7 emails de dev + 19 repos GitHub expostos (creds em commits?) | github.com/fernandapessoa | 🔍 OSINT pendente |
| F-007 | Média | Mautic marketing automation (503 — CVE candidates) | mautic.fernandapessoa.com.br | 🔍 cve pendente |
| F-008 | Info | Roundcube/cPanel webmail login exposto | webmail.fernandapessoa.com.br | ✅ capturado |
| F-009 | Info | Cred-stuffing WHM/cPanel/Webmail (20 creds) — SEM sucesso | whm/cpanel/webmail.fernandapessoa.com.br | ✅ negativo |
| F-010 | Alta | **IDOR/BOLA — Rails Active Storage unauth + signed IDs vazados via RSC** | api.youbiz.com.br | ✅ confirmado (3 blobs) |
| F-011 | Média | Swagger UI + OpenAPI spec completa exposta (26 endpoints, host prod) | api.youbiz.com.br | ✅ confirmado |
| F-012 | Baixa | GET /login vaza schema completo de User (PII + roles + 2FA) | api.youbiz.com.br | ✅ confirmado |
| F-013 | Info | ShellShock (negativo) + CVE-2025-29927 (inconclusivo/bloqueado por CF) | envio/app.fernandapessoa.com.br | ✅ registrado |

## Attack surface consolidada
(vide `recon/SUMMARY.md` após recon)

## Acessos obtidos
- [ ] Acesso interno (foothold) — não obtido
- [ ] Acesso administrativo (admin/RCE) — não obtido (creds default falharam)
- [x] Acesso não-autenticado a arquivos do storage (Active Storage IDOR F-010) —
      3 blobs baixados (logo + 2 imagens de conteúdo) — read-only, sem auth
- [ ] Acesso financeiro/PII direto — não obtido (endpoints admin/manager exigem JWT)

## Objetivos de alto valor
- [ ] Acesso interno (foothold)
- [ ] Acesso administrativo (admin/RCE)
- [ ] Acesso financeiro
- [ ] Acesso a dados/PII

## Cronologia
(vide `timeline.log`)

## Detalhamento — Fase 6 (Ataque Webapp)

### F-010 IDOR/BOLA — Active Storage unauth (Alta) ✅
Endpoint `https://api.youbiz.com.br/rails/active_storage/blobs/redirect/<signed_id>/`
**não exige autenticação**: retorna 302 para URL pré-assinada do bucket Cloudflare R2
(`youbiz-storage...r2.cloudflarestorage.com`) e entrega o arquivo. Os `signed_id`
(HMAC-SHA1) são vazados via payload RSC da home pública de
`app.fernandapessoa.com.br` (Next.js). 3 signed_ids extraídos e **todos baixados
sem auth**:
- `3a9694ba-...` → logo FPGE (PNG 140 KB)
- `841e3301-...` → "ChatGPT Image 16_09_2025" (PNG 1536x1024)
- `ebf2cfd8-...` → "Estudo em grupo na universidade" (PNG 1536x1024)

Os 3 arquivos são imagens de conteúdo, mas o **padrão** permite acesso a qualquer
arquivo (certificados/documentos/PII) cujo signed_id apareça em qualquer resposta
RSC/HTML pública. Evidência: `evidence/F-010_active_storage_idor.txt`.

### F-011 Swagger UI + OpenAPI exposto (Média) ✅
`/api-docs` (Swagger UI) e `/api-docs/v1/swagger.yaml` (spec 29 KB, OpenAPI 3.0.1)
expostos sem auth. Documenta **26 endpoints** (schools, enrollments, users,
learning_units, contents, trails, payment_plans, revenue_shares, fee_configs,
refund_policies). Revela host de produção `https://youbiz.onrender.com` (Render
free tier, dorme quando ocioso). Namespaces `/v1/admin/*` e `/v1/manager/*`
confirmados existentes (retornam 401 "faça login"). Evidência:
`evidence/F-011_swagger_exposed.txt`.

### F-012 /login vaza schema de User (Baixa) ✅
`GET /login` retorna JSON com schema completo (cpf, cellphone, birthdate,
endereço, `is_manager`, `is_dev`, `otp_secret`, `otp_enabled`, `jti`, `schools`).
Facilita mass assignment e revela escopo de PII (LGPD). Evidência:
`evidence/F-012_login_schema_leak.txt`.

### F-009 / F-013 — Vetores negativos (Info) ✅
- Cred-stuffing WHM/cPanel/Webmail: 20 creds default testadas, todas 401
  `invalid_login`. Sem lockout detectado. (F-009)
- ShellShock CVE-2014-6271 em envio/cgi-bin/: scripts CGI inexistentes (500),
  sem execução do payload. (F-013)
- CVE-2025-29927 (Next.js middleware bypass) em app.fernandapessoa.com.br:
  Cloudflare bloqueia no edge (403 com/sem header de bypass) — não testável
  via CF; origem real do Next.js não determinada (187.45.185.33 é host cPanel).
  (F-013)

## Próximos passos
1. 🔴 **F-010 deep-dive**: enumerar páginas públicas do app.fernandapessoa.com.br
   (quando CF permitir / via bypass) para coletar MAIS signed_ids (cursos,
   certificados) e testar acesso a documentos sensíveis — possível escalar para
   Crítica.
2. 🔴 **F-012 mass assignment**: testar POST /signup com `is_manager:true`,
   `is_dev:true` (após confirmar não-destrutividade / via youbiz.onrender.com
   ativo) — vetor de privilege escalation.
3. 🟡 CVE research Exim 4.99.5 (smtp01, 54.165.96.105) — RCE candidates.
4. 🟡 Re-testar `youbiz.onrender.com` (acorda sob tráfego) — fuzzar /v1/admin/*,
   /v1/manager/* com JWT se obtido.
5. 🟡 WooCommerce 10.7 (loja) + WordPress CVEs (matrículas).
6. 🟡 GitHub trufflehog nos 19 repos (creds em commits → cred-stuffing real).
7. 🟡 Descobrir origem real do Next.js app (bypass de CF) para testar
   CVE-2025-29927.
