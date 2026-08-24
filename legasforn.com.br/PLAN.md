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
| 6. Ataque webapp | webapp | ⏳ Delegado (2ª tentativa) | Registrar via Supabase Auth API, obter token, testar IDOR/coupon/purchase/refund/RSC/hCaptcha bypass |
| 7. CVE research + exploit | cve / exploit | ⏳ Pendente | Conforme versões |
| 8. Pós-exploração | postex | ⏳ Pendente | Se foothold |
| 9. Relatório | report | ⏳ Pendente | REPORT.md final |

## Backlog de vetores (Pivot Hunting §19)
*Vetores pausados com motivo e gatilho de retorno.*
- (vazio — início do engagement)

## Ranking de payoff (atualizado em SUMMARY.md)
- Pendente — aguardando recon passivo/ativo.