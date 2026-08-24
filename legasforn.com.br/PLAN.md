# PLAN — Engagement Legasforn

## Metodologia
Pentest Web/API Externo Black-box conforme AGENTS.md.

Fases e especialistas delegados:

| Fase | Especialista | Status | Notas |
|------|-------------|--------|-------|
| 1. Escopo | Coordenador | ✅ Concluído | SCOPE.md criado |
| 2. Recon passivo + OSINT | recon-passive | ✅ Concluído | Ver PASSIVE.md — Next.js/Railway/Supabase/MisticPay. API REST completa docs. Coupon CRUD, purchase, wallet endpoints. Sem subdomínios adicionais. |
| 3. Recon ativo | recon-active | ✅ Concluído | ACTIVE.md criado. IP 69.46.46.84:80/443 apenas. Sem WAF. Sem vhosts. TLS grade A. |
| 4. Consolidar attack surface | Coordenador | ✅ Concluído | SUMMARY.md com ranking de payoff criado/revisado. |
| 5. Enumeração profunda | enum | ✅ Concluído | ENUM.md criado. RSC payloads expostos em /_next/data/. Build ID: hv73pRcFZE5UedoOmEjHt. Novas rotas: /loja/valorant/cheats, /ganhar/painel, etc. Rate limit: por token (120 req/min). |
| 5.b Supabase Creds Discovery | Coordenador | ✅ Concluído | Supabase URL: https://ahfviyykpaljzxcmdyfh.supabase.co | Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (extraído do bundle JS 0z8w843khguw0.js) |
| 6. Ataque webapp | webapp | ✅ Concluído | Token lf_live_* obtido. 7 findings: F-001 a F-007. Rate limit ausente. Coupon abuse (20%). Supabase info disclosure. |
| 6.b Pivot: Purchase Flow + IDOR + Supabase Escalation | webapp + exploit | ✅ Concluído | Purchase testado (insufficient_balance). IDOR não confirmado (contas públicas, 0 orders). Supabase Session JWT ampliado (F-008). api_audit_log exposto (F-009). SQLi/NoSQLi bloqueados. Admin panel não encontrado. CVE-2025-29927 não vulnerável (F-010). Wallet deposit com erro `invalid_name`. |
| 7. CVE research + exploit | cve | ✅ Concluído | 30 CVEs pesquisadas. 3 candidatas Turbopack (não testadas). CVE-2025-29927 confirmado não vulnerável. CVE_report.md criado. |
| 8. Pós-exploração | postex | ⏳ Pendente (não aplicável) | Nenhum foothold admin/RCE obtido. Acesso: apenas API com token lf_live. |
| 9. Relatório final | report | ✅ Concluído | REPORT.md consolidado com 10 findings (1-10), CVE report, timeline.md atualizada. |

## Backlog de vetores (Pivot Hunting §19)
*Vetores pausados com motivo e gatilho de retorno.*
- (vazio — início do engagement)

## Ranking de payoff (atualizado em SUMMARY.md)
- Pendente — aguardando recon passivo/ativo.