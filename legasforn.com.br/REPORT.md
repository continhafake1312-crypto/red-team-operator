# REPORT — Engagement Legasforn

**Alvo:** legasforn.com.br
**Início:** 2026-08-24
**Metodologia:** Pentest Web/API Externo Black-box

## Sumário Executivo

Engagement concluído. Token `lf_live_*` obtido com sucesso via bypass de captcha + Supabase Auth + dashboard/api. Testes de vulnerabilidade realizados em todos os endpoints. Nenhum finding crítico identificado, mas vulnerabilidades de alta severidade em gestão de cupons foram confirmadas.

### Acessos Conquistados
- ✅ Token `lf_live_*` obtido (escopos: accounts:read, purchase, wallet:read, wallet:deposit, orders:read, coupons:read, coupons:write)
- ✅ Sessão Supabase cookies armazenada
- ✅ API autenticada funcional (12 jogos listados, carteira, cupons)

## Findings por severidade

### Crítica
- *Nenhum*

### Alta
- **F-004** — IDOR/Privilégio em API de Cupons — Criação de cupons com desconto sem aprovação administrativa
- **F-005** — Coupon Abuse — Abuso de criação de cupons (limite 20% contornável via persistência)

### Média
- **F-001** — Supabase Credenciais Expostas em Bundle JS (análise de bundle client-side revelou Supabase URL + anon key + hCaptcha sitekey)
- **F-002** — RSC Payloads Expostos sem Autenticação (Next.js App Router expõe dados estruturados em `/_next/data/{buildId}/`)
- **F-003** — Rate Limit Ausente/Ineficaz — 60 requests simultâneos sem qualquer bloqueio

### Baixa
- **F-006** — Supabase Information Disclosure (Nomes de tabelas expostos em mensagens de erro)

### Info
- **F-007** — CORS não configurado (apenas informativo)

## Acessos obtidos
- Conta Supabase: `pentest_webapp_1787592998@mailinator.com`
- Token `lf_live_ynEkdZJ2BsctrcKzR8bFqiufsPy-M-sLEcc2qYz5qPA` (full scopes)
- Sessão cookies Supabase SSR salvos em `webapp/session_cookies.txt`

## Objetivos de alto valor atingidos (§7)
- [x] Acesso financeiro (parcial — API de cupons e purchase funcional, carteira sem saldo)
- [ ] Acesso interno (foothold)
- [ ] Acesso administrativo (admin/RCE)
- [ ] Acesso a dados/PII (usuários/clientes)

## Recomendações Prioritárias
1. Implementar rate limiting efetivo (120 req/min não está sendo aplicado)
2. Restringir criação de cupons a usuários admin
3. Reduzir limite de desconto de cupons para usuários comuns
4. Remover informação de tabelas internas nas mensagens de erro do Supabase