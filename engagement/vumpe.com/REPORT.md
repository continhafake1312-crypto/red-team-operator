# REPORT — vumpe.com

**Alvo:** https://www.vumpe.com/
**Tipo:** Web/API externo black-box
**Início:** 2026-08-25
**Status:** EM ANDAMENTO — Fase de Exploit

---

## Sumário Executivo

Engagement de pentest externo black-box contra **vumpe.com** — plataforma
brasileira que paga via Pix para usuários postarem vídeos (clips).

**Stack identificada:** Cloudflare + Vercel + Next.js 15 + React + Node.js.
**Subdomínios ativos:** clipador.vumpe.com (login), anunciante.vumpe.com,
mcl.vumpe.com (marketplace), up-mcl.vumpe.com.
**Bucket S3 exposto no source:** social-tracker-bucket-production.
**Sentry DSN vazado:** sentry-release exposto.

Recon passivo + OSINT + Recon ativo + Enum + Webapp + CVE research concluídos. Fase de exploit em andamento — foco em F-004 (manager impersonation).

---

## Tabela de Findings

| ID | Severidade | Título | Status | Fase |
|----|-----------|--------|--------|------|
| F-001 | 🟡 Média | Bucket S3 exposto no source (social-tracker-bucket-production) | Pendente validação | recon-passive |
| F-002 | 🟡 Média | Sentry DSN/release vazado (cb96e609e674c722ce040c16f65fb3facc8af665) | Pendente validação | recon-passive |
| F-003 | 🟢 Baixa | IP do cliente exposto na resposta de login (clipador) | ✅ Confirmado | recon-passive |
| F-004 | 🔴 Crítica | Manager Login Impersonation Route Exposta Publicamente | ✅ Confirmado | webapp |
| F-005 | 🟡 Alta | CORS Wildcard no clipador.vumpe.com (e subdomínios) | ✅ Confirmado | webapp |
| F-006 | 🟡 Média | PostHog Self-Hosted API Exposta (Info Disclosure) | ✅ Confirmado | webapp |
| F-007 | 🟡 Média | OAuth Callback Exposto como Página Estática (CSRF) | ✅ Confirmado | webapp |
| F-008 | 🟢 Baixa | IP do Cliente Vazado na Resposta do Login (evidência adicional) | ✅ Confirmado | webapp |

---

## Attack Surface Consolidada

### Hosts Sem WAF (Ataque Direto)
| Domínio | IP | Risco |
|---------|-----|-------|
| clipador.vumpe.com | 216.150.1.129/16.129 | 🔴 APP PRINCIPAL — manager-login, auth, offerings |
| mcl.vumpe.com | 216.150.1.193/16.193 | 🟡 CORS wildcard |
| up-mcl.vumpe.com | 216.150.1.65/16.65 | 🟡 CORS wildcard |

### Rotas Críticas Expostas (clipador.vumpe.com)
| Rota | Risco | Descrição |
|------|-------|-----------|
| `/manager-login/[impersonatedBy]/[uuid]/[code]` | 🔴 CRÍTICO | Impersonação pública sem auth, HTTP 200 p/ qualquer uuid/code |
| `/auth/[platformId]/callback` | 🟡 ALTO | Callback OAuth estático, sem state validation server-side |
| `/login` | 🟡 ALTO | Login sem WAF, IP do cliente vazado |
| `/offerings/[id]/*` | 🟡 ALTO | Requer auth (307 redirect), sem IDOR público confirmado |
| `/ingest/decide` | 🟡 MÉDIO | PostHog self-hosted exposto |

### Findings Resumo
- 1 🔴 Crítico, 2 🟡 Alta, 3 🟡 Média, 2 🟢 Baixa

---

## Acessos Obtidos

*Nenhum acesso autenticado confirmado.*
- Rota de manager impersonation descoberta (F-004) sem autenticação
- PageProps vazio — validação provavelmente client-side (via JS bundle)
- Em análise: JS chunks da manager-login page para lógica de uuid/code

---

## Objetivos de Alto Valor

- ❌ Acesso interno (foothold) — Não alcançado
- ⚠️ **Acesso administrativo (admin/RCE)** — Rota de manager impersonation descoberta (F-004) — potencial via de acesso
- ❌ Acesso financeiro (pagamentos/transações) — Rotas descobertas (/orders, /subscriptions, /buys) mas requerem auth
- ❌ Acesso a dados/PII (usuários/clientes) — IP de clientes exposto (F-008) mas sem dados PII completos

---

## Cronologia

| Data | Evento |
|------|--------|
| 2026-08-25 | Início do engagement |
| 2026-08-26 | Recon passivo concluído — PASSIVE.md + OSINT.md |
| 2026-08-26 | 3 findings registrados: F-001 (bucket S3), F-002 (Sentry DSN), F-003 (IP leak) |
| 2026-08-26 | Recon ativo concluído — ACTIVE.md |
| 2026-08-26 | Attack surface consolidada — SUMMARY.md |
| 2026-08-26 | Enum + Webapp + CVE research concluídos |
| 2026-08-26 | **F-004 (Crítica):** Manager Login Impersonation descoberta |
| 2026-08-26 | **F-005 (Alta):** CORS Wildcard (clipador, mcl, up-mcl) |
| 2026-08-26 | **F-006 (Média):** PostHog Self-Hosted exposto |
| 2026-08-26 | **F-007 (Média):** OAuth Callback estático |
| 2026-08-26 | **F-008 (Baixa):** IP + Geo do cliente vazados |
| 2026-08-26 | Webapp attack iniciado — clipador.vumpe.com sem WAF |
| 2026-08-26 | F-004: Manager-login impersonation route exposta (Crítica) |
| 2026-08-26 | F-005: CORS wildcard confirmado em clipador, mcl, up-mcl (Alta) |
| 2026-08-26 | F-006: PostHog self-hosted API exposta (Média) |
| 2026-08-26 | F-007: OAuth callback estático sem state validation (Média) |
| 2026-08-26 | F-008: IP leak confirmado no login (Baixa) |

---

## Evidências

| ID | Arquivo | Descrição |
|----|---------|-----------|
| F-001 | `evidence/F-001.txt` | Bucket S3 exposto no source code |
| F-002 | `evidence/F-002.txt` | Sentry DSN/release vazado |
| F-003 | `evidence/F-003.txt` | IP do cliente exposto (inicial) |
| F-004 | `evidence/F-004.txt` | Manager-login route details + CORS |
| F-005 | `evidence/F-005.txt` | CORS wildcard em todos os subdomínios Vercel |
| F-006 | `evidence/F-006.txt` | PostHog /ingest/decide — info disclosure |
| F-007 | `evidence/F-007.txt` | OAuth callback estático exportado |
| F-008 | `evidence/F-008.txt` | IP client leak no login |