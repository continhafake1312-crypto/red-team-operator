# REPORT — vumpe.com

**Alvo:** https://www.vumpe.com/
**Tipo:** Web/API externo black-box
**Início:** 2026-08-25
**Status:** EM ANDAMENTO

---

## Sumário Executivo

Engagement de pentest externo black-box contra **vumpe.com** — plataforma
brasileira que paga via Pix para usuários postarem vídeos (clips).

**Stack identificada:** Cloudflare + Vercel + Next.js 15 + React + Node.js.
**Subdomínios ativos:** clipador.vumpe.com (login), anunciante.vumpe.com,
mcl.vumpe.com (marketplace), up-mcl.vumpe.com.
**Bucket S3 exposto no source:** social-tracker-bucket-production.
**Sentry DSN vazado:** sentry-release exposto.

Recon passivo + OSINT concluídos. Fase de recon ativo em andamento.

---

## Tabela de Findings

| ID | Severidade | Título | Status | Fase |
|----|-----------|--------|--------|------|
| F-001 | 🟡 Média | Bucket S3 exposto no source (social-tracker-bucket-production) | Pendente validação | recon-passive |
| F-002 | 🟡 Média | Sentry DSN/release vazado (cb96e609e674c722ce040c16f65fb3facc8af665) | Pendente validação | recon-passive |
| F-003 | 🟢 Baixa | IP do cliente exposto na resposta de login (clipador) | Pendente validação | recon-passive |

---

## Attack Surface Consolidada

*Pendente — aguardando recon passivo + ativo.*

---

## Acessos Obtidos

*Nenhum até o momento.*

---

## Objetivos de Alto Valor

- [ ] Acesso interno (foothold)
- [ ] Acesso administrativo (admin/RCE)
- [ ] Acesso financeiro (pagamentos/transações)
- [ ] Acesso a dados/PII (usuários/clientes)

---

## Cronologia

| Data | Evento |
|------|--------|
| 2026-08-25 | Início do engagement |
| 2026-08-26 | Recon passivo concluído — PASSIVE.md + OSINT.md |
| 2026-08-26 | 3 findings registrados: F-001 (bucket S3), F-002 (Sentry DSN), F-003 (IP leak) |

---

## Evidências

*Pendentes.*