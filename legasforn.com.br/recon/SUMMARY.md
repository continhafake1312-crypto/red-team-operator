# SUMMARY — Attack Surface Prioritization

## Ranking de Payoff Atualizado (Recon Ativo)

| # | Alvo | Payoff | Descrição | Fase |
|---|------|--------|-----------|------|
| 1 | **API Coupons (/api/v1/coupons)** | 🔴 **ALTO** | CRUD de cupons sem auth adequada? Testar criação/deleção/uso. Impacto financeiro direto. | enum |
| 2 | **Purchase Flow (/api/v1/purchase)** | 🔴 **ALTO** | POST para compra de contas. Testar tampering de preço, replay, IDOR de pedidos. | webapp |
| 3 | **Fluxo PIX (MisticPay)** | 🔴 **ALTO** | Gateway de pagamento. Testar integridade de valor, PIX copia e cola, confirmação. | webapp |
| 4 | **IDOR em /api/v1/orders/* e /api/v1/accounts/* ** | 🔴 **ALTO** | Acesso a pedidos/contas de outros usuários via ID numérico. | webapp |
| 5 | **Auth Bypass (/auth/login, /auth/sign-up)** | 🟠 **MÉDIO-ALTO** | SQLi, NoSQLi, Mass Assignment na autenticação. Supabase Auth pode ter misconfig. | webapp |
| 6 | **Rate Limit Bypass** | 🟠 **MÉDIO-ALTO** | 120 req/min é baixo. Bypass via X-Forwarded-For ou rotação de IP (Tor). | enum |
| 7 | **Supabase Misconfig** | 🟠 **MÉDIO-ALTO** | Project ID, anon key exposta no JS. Testar RLS bypass, SQL injection nas queries. | enum |
| 8 | **Next.js Middleware Bypass** | 🟡 **MÉDIO** | Acesso direto a _next/static, _next/data, rotas internas. | enum |
| 9 | **Security Headers (Info)** | ℹ️ **INFO** | HSTS, CSP, XFO configurados. Sem issues. | — |
| 10 | **TLS Weakness (Info)** | ℹ️ **INFO** | Apenas ciphers fortes, grade A. Certificado Railway (esperado). | — |
| 11 | **Subdomínios (Info)** | ℹ️ **INFO** | Nenhum subdomínio encontrado via recons passivo+ativo. Domínio único. | — |

## Resumo do Attack Surface

| Categoria | Descobertas |
|-----------|-------------|
| IPs | 1 (69.46.46.84 - Railway edge) |
| Portas abertas | 2 (80, 443) |
| Domínios | 1 (legasforn.com.br) |
| Subdomínios | 0 |
| Vhosts | 0 |
| WAF | Nenhum |
| TLS Grade | A |
| API Endpoints | 17 mapeados (11 protegidos, 6 públicos) |
| Painéis | /dashboard (protegido), /vip (público) |
| Backup exposto | Nenhum |
| Git exposto | Falso positivo (Next.js catch-all) |

## Prioridade Próximas Fases

1. **Enumeração profunda** → Análise de bundle JS (Supabase keys), fuzz de parâmetros, rate limit test
2. **Ataque Webapp** → Testar IDOR em orders/accounts, auth bypass, purchase flow tampering, coupon abuse, MisticPay PIX flow