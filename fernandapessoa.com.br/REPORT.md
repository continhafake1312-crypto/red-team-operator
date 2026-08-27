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
| F-013 | Info | ShellShock (negativo) + CVE-2025-29927 (NEGADO — versão patcheada) | envio/app.fernandapessoa.com.br | ✅ registrado |
| F-014 | Info | CVE-2024-4577 PHP-CGI RCE — NEGADO (mod_php, não CGI) | wpp.fernandapessoa.com.br | ✅ negativo |
| F-015 | Info | CVE-2026-48842 Roundcube SQLi — INCONCLUSIVO (host inacessível HTTP) | webmail.fernandapessoa.com.br | 🔁 reteste |
| F-016 | Info | CVE-2024-47011 Mautic RCE — INCONCLUSIVO (origem 503/down) | mautic.fernandapessoa.com.br | 🔁 reteste |
| F-017 | Info | CVE-2025-29927 Next.js middleware bypass — NEGADO (15.2+ patcheado) | app.fernandapessoa.com.br | ✅ negativo |
| F-018 | Info | Mass assignment /signup — NEGADO (Rails strong params) | api.youbiz.com.br | ✅ negativo |
| F-019 | Média | **Serviços VoIP (SIP 5060 + SCCP 2000) expostos à Internet no host Windows** | 177.44.191.252 (wpp) | ✅ confirmado |
| F-020 | Info | FTP 21 filtrado; SMTP 587/465/25 + IMAP exigem auth/STARTTLS — sem open relay/anon | 187.45.185.33 / 54.165.96.105 | ✅ negativo |

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
  **RESOLVIDO em F-017 — NEGADO** (revisita o "inconclusivo" anterior). Cloudflare
  passou o header de bypass (sem 403 edge); respostas byte-idênticas (404) com/sem
  `x-middleware-subrequest`. App usa Turbopack prod = Next.js 15.2+ (patcheado).
  (F-013/F-017)

### F-014 — CVE-2024-4577 PHP-CGI RCE — NEGADO (Info) ✅
Alvo `wpp.fernandapessoa.com.br` (177.44.191.252, Apache/2.4.54 Win64 + PHP 7.4.33
EOL). CVE exige `php-cgi.exe`; o alvo roda **mod_php** (o soft-hyphen `%ad` não é
convertido a `-d`: controle `%ADd+display_errors=1` manteve a resposta 302
idêntica). O `STATUS:000` observado com `php://input` é WAF/ModSecurity
descartando esse padrão, não RCE. Evidência: `evidence/F-014_cve_2024_4577_rce.txt`.
Recomendação: upgrade PHP para 8.2+ (7.4 EOL); confirmar uso de mod_php.

### F-015 — CVE-2026-48842 Roundcube SQLi — INCONCLUSIVO (Info) 🔁
`webmail.fernandapessoa.com.br` (187.45.185.33, cPanel fpessoacloud) aceita TCP em
21/80/2095 mas **reseta/ignora HTTP** (Connection reset by peer / timeout em
443). Sem resposta HTTP para fingerprint de versão ou PoC SQLi (virtuser_query).
Não validável pela nossa origem. Evidência:
`evidence/F-015_cve_2026_48842_sqli.txt`. Retestar de outra origem; delegar enum
de FTP (porta 21 aberta) ao network agent.

### F-016 — CVE-2024-47011 Mautic RCE — INCONCLUSIVO (Info) 🔁
`mautic.fernandapessoa.com.br` atrás de Cloudflare: **origem fora do ar** — 503
persistente em todos os paths (sem cache CF). IPs conhecidos não servem o Mautic
(177.44.191.252 é catch-all ScriptCase). Origem real não encontrada no recon.
Evidência: `evidence/F-016_cve_2024_47011_mautic_rce.txt`. Monitorar até a origem
voltar (200); caçar IP de origem via crt.sh/wayback/scan dos ranges Locaweb.

### F-017 — CVE-2025-29927 Next.js middleware bypass — NEGADO (Info) ✅
`app.fernandapessoa.com.br` (Cloudflare). Resolvido: o header
`x-middleware-subrequest` agora passa pela CF (diferente do F-013 original),
chegando à origem — mas produz respostas **byte-idênticas** (404, size 61731)
com e sem o header, em todos os variantes (middleware, src/middleware,
pages/_middleware, repetidos). Nenhuma rota é gated por middleware de auth
(/dashboard, /admin, /api/me etc. → todas 404; /api/auth/session → 200 vazio).
App usa `/_next/static/chunks/turbopack-*.js` = **Next.js 15.2+** (Turbopack em
prod estabilizou em 15.x), versão corrigida. Evidência:
`evidence/F-017_nextjs_cve_2025_29927.txt`.

### F-018 — Mass assignment /signup — NEGADO (Info) ✅
`youbiz.onrender.com` está MORTO (`x-render-routing: no-server`); API real é
`api.youbiz.com.br` (`POST /signup` ativo). Testado com 4 contas (baseline +
3 mass assignment com `is_manager:true, is_dev:true, role:admin, scp:admin,
schools:[{id:1}], otp_enabled:false`). Resultados: `is_dev` permaneceu `false`
no `/me`; `scp` do JWT permaneceu `"user"`; o endpoint 403-gated
`/v1/manager/organizations` continuou `403 "Acesso negado"` para a conta com mass
assignment. **Rails strong parameters** filtra todos os campos de privilégio.
Evidência: `evidence/F-018_mass_assignment_signup.txt`. 6 contas de teste criadas
(registradas em `loot/creds.txt` para limpeza).

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
8. 🟡 **F-019 VoIP**: enumerar extensions SIP (svwar/svcrack) a partir de
   origem não-bloqueada ou em pós-exploração; identificar produto PBX
   (Asterisk/FreeSWITCH/3CX/Cisco) para mapear CVEs.

---

## Detalhamento — Fase Network (Serviços Não-Web)

### F-019 Serviços VoIP (SIP/SCCP) expostos (Média) ✅
Host Windows `177.44.191.252` (wpp.fernandapessoa.com.br) expõe à Internet:
- `2000/tcp` (cisco-sccp? — Skinny/CallManager, sinalização telefones Cisco)
- `5060/tcp` + `5060/udp` (SIP)

Nmap confirma estado `open` (syn-ack), porém probes SIP OPTIONS e banner
grab não retornaram resposta (timeout) a partir da origem do teste — o
serviço provavelmente responde apenas a peers autenticados / origens do
trunk VoIP. Mesmo assim, a mera exposição das portas de sinalização à
Internet é risco: alvo clássico de **toll fraud**, brute-force SIP
REGISTER, scanning de extensions (SIPVicious) e CVEs de PBX/softswitch.
Produto não pôde ser fingerprintado (sem banner). Evidência:
`evidence/F-019_voip_sip_sccp_exposed.txt`.

### F-020 SMTP/FTP — controles adequados (Info, NEGATIVO) ✅
- **FTP 21** (`187.45.185.33`): porta **filtered** — não exposta ao
  público. Anonymous login e cred-stuffing NÃO testáveis.
- **SMTP Exim 4.99.5** (`187.45.185.33:587/465`): submission exige auth
  (`550 SMTP AUTH is required`); **VRFY/EXPN desativados** (252/550
  "Administrative prohibition"); **NÃO é open relay**. Porta 25 filtered.
- **SMTP/IMAP AWS** (`54.165.96.105`): 143/993 Dovecot (AUTH=PLAIN/LOGIN
  + STARTTLS/TLS), 587 exige STARTTLS (`530 Must issue a STARTTLS command
  first`) — **NÃO é open relay**; 25 filtered (típico EC2/SES).

Configuração alinhada a boas práticas anti-relay/anti-spam. Único ponto de
atenção: padrão de senha fraca (`1234`) observado em outro contexto do
engagement — recomenda-se forçar senhas fortes + MFA no webmail. Evidência:
`evidence/F-020_smtp_ftp_negative.txt`.
