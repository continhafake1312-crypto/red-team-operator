# recon/SUMMARY.md — Attack Surface + Ranking de Payoff

**Alvo:** wcursos.com.br (Sistema Tutor — plataforma EAD/concursos)
**Fases cobertas:** F1 (escopo) · F2 (recon passivo + OSINT) · F3 (recon ativo)

---

## Attack Surface Consolidada

### Hosts diretos (fora de CDN)
| Host / IP | Portas | Serviço | Stack | Tenant |
|-----------|-------|---------|-------|--------|
| `www.wcursos.com.br` / `wcursos.com.br` (ALB `3.225.216.40`, `52.72.235.47`) | 80, 443 | HTTP/HTTPS awselb/2.0 → Sistema Tutor | Java servlet/Struts build `1_445`, JSESSIONID, ISO-8859-1, Bootstrap 4.6.2, jQuery 3.6.4, reCAPTCHA v3 | **PROD** principal (site + portal do aluno) |
| `www.wcursosead.com.br` / `wcursosead.com.br` (mesmo ALB) | 80, 443 | idem | idem | **PROD** tenant WEAD ("Loja Virtual - WEAD") |
| `wcursos.sistematutor.com.br` (mesmo ALB) | 80, 443 | idem | idem | **TESTE** ("PARA TESTE Loja Virtual") — alto valor |
| `34.204.156.206` (mail/webmail) | **0 (firewalled total 1-65535)** | nenhum | — | mail — inacessível publicamente |
| `lp.wcursos.com.br`, `materiais.wcursos.com.br` | — | RD Station 404 / GCP | — | fora da infraestrutura Tutor |
| `216.59.16.232` | não scanneado | SPF legacy Immedion | — | terceiro, fora do domínio |

### WAF / TLS / Defesas
- **WAF:** AWS WAF (ALB) — bloqueia payloads de ataque (XSS→403) e Host headers não-allowlistados (vhost fuzz 3780 → todos 403).
- **TLS:** Amazon RSA 2048, SANs = 5 hosts (3 tenants). Válido.
- **Backend mascarado:** nenhum header `Server`/`X-Powered-By` do backend; versão Tomcat/Jetty/Struts não vazou.
- **Auth:** `POST /portal/validar-login` (CPF+senha) com reCAPTCHA v3.
- **Catch-all soft-404:** hash `2e40045efe5134ada9942798c090d269` — diferenciar respostas reais por **hash**, não status.

### API / Portal (74 endpoints `/portal/*`)
- ~40 endpoints GET-auth-gated (302→login): `getAlunos`, `getDocumentoAluno`, `getContratoPadrao`, `getDeclaracoes`, `getCursos`, `getProfessor`, `media?token=`, `getEbookAI?token=` — **IDOR/BOLA candidates (requerem sessão)**.
- POST-only / WAF-blocked (403 catch-all): `salvar*`, `set*`, `delete*`, `RecebeArquivo`, `validar-login`.
- Unauth: `/portal/checkOnline` (POST 200 vazio — health-check).
- Upload real: `/portal/RecebeArquivo` (POST 403/655 erro custom).
- **Nenhum vazamento de dados sem auth** confirmado via probe por hash.

### OSINT (passivo)
- 4 emails: `contato@wcursos.com.br`, `julianoduarteprojetista@gmail.com`, `daniugf@uol.com.br`, `dmarc@wcursos.com.br`.
- 3 pessoas: Waldimir Coelho Jr (owner), Juliano Duarte, Danielle Coelho.
- 7 domínios relacionados: `sistematutor.com.br` (VENDOR da plataforma), `centraldeconcursos.com.br` (mesma equipe).
- 0 buckets cloud públicos, 0 subdomain takeover. DMARC `p=none` (fraco).
- GitHub: sem credenciais vazadas relevantes.

---

## Ranking de Payoff (atualizado pós-F3)

| # | Vetor | Severidade/Probabilidade | Próxima fase | Notas |
|---|-------|--------------------------|-------------|-------|
| 1 | **Auth bypass / cred-stuffing em `/portal/validar-login`** | **ALTO** | webapp (2Captcha p/ reCAPTCHA v3) | Acesso libera TODOS os endpoints IDOR — ponto único de entrada. Testar CPFs default/numerados. |
| 2 | **Ambiente de TESTE `wcursos.sistematutor.com.br`** | **ALTO** | enum + webapp | Instância separada do prod; potenciais contas de teste, dados sintéticos, features debug, proteções mais fracas. |
| 3 | **IDOR/BOLA em `/portal/get*` com sessão** | **MÉDIO-ALTO** | webapp (após foothold auth) | 19+ `get*` expõem PII/financeiro: alunos, documentos, contratos, declarações, boletos, PIX, media por token. |
| 4 | **Upload bypass `/portal/RecebeArquivo`** | **MÉDIO** | webapp | Endpoint real de upload (erro custom 403/655) — possível RCE via upload malicioso. |
| 5 | **Struts2 CVE (OGNL) em `/portal/*`** | **MÉDIO** | cve + exploit | Backend Java servlet/Struts build `1_445`; testar S2-045 (CVE-2017-5638) e S2-057 (CVE-2018-11776) genéricos. |
| 6 | Enum JS/wayback (`portal.js` 147KB) — rotas/chaves/tokens ocultos | MÉDIO | enum | 74 endpoints + JS grandes podem revelar rotas internas, tokens, params. |
| 7 | Tenant WEAD `www.wcursosead.com.br` | MÉDIO-BAIXO | enum + webapp | Mesma stack, loja distinta — contas/creds diferentes. |
| 8 | DMARC `p=none` (spoofing de email) | BAIXO | report | Fora de escopo técnico direto. |
| 9 | Mail `34.204.156.206` | — | — | Firewalled — sem superfície explorável. |

---

## Próximas fases

1. **enum:** content discovery em `/portal/*` (por hash), análise JS (`portal.js`, `ecommerce-min.js`, `jquery.validate.tutor.js`), param mining nos `get*`/`set*`, sondar endpoints admin do Sistema Tutor.
2. **webapp:** (a) auth bypass `/portal/validar-login` (2Captcha); (b) sondar `wcursos.sistematutor.com.br` com mesmos vetores; (c) com sessão, IDOR/BOLA em `get*` e `media?token=`; (d) upload bypass `RecebeArquivo`.
3. **cve:** mapear CVEs Apache Struts 2 + Tomcat → testar PoCs não-destrutivos S2-045/S2-057 em `/portal/*`.

*Atualizado por recon-active após Fase 3 (2026-08-27).*
