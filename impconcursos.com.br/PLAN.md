# PLAN — Backlog de Vetores e Fases

## Fases (§5)
- [x] 1. Escopo — `SCOPE.md` criado
- [ ] 2. Recon passivo + OSINT — delegar `recon-passive` (+ sub `osint`, `cloud`)
- [ ] 3. Recon ativo — delegar `recon-active`
- [ ] 4. Consolidar attack surface — `recon/SUMMARY.md` (ranking de payoff)
- [ ] 5. Enumeração profunda — delegar `enum`
- [ ] 6. Ataque webapp — delegar `webapp` (vetores Shopify-specific)
- [ ] 7. CVE + exploit — delegar `cve`/`exploit` (se versões próprias encontradas)
- [ ] 8. Pós-ex — delegar `postex` (se foothold)
- [ ] 9. Relatório — delegar `report`

## Perfil do alvo (emergente do recon inicial)
- **Shopify-hosted** (CNAME `shops.myshopify.com`). IPs `23.227.38.32/74`.
- Vetores server-side clássicos (RCE/SQLi no core) NÃO se aplicam ao core
  Shopify. Foco em:
  - Subdomínio takeover (CNAME dangling em subdomínios não-Shopify)
  - Admin `.myshopify.com` discovery / cred default
  - Storefront API GraphQL (introspection, IDOR de produtos/customer)
  - AJAX Cart / checkout / account endpoints
  - Theme/apps exposition, exposed Liquid, app proxies
  - Customer account IDOR, order tracking IDOR
  - Exposed `/products.json`, `/collections.json`, `/sitemap.xml`,
    `/search?q=`, `/cart.js`, `/pages.json`
  - OSINT: empresa, admins, emails vazados, repos GitHub

## Ranking de payoff inicial (preliminar — re-priorizar após recon)
| Vetor | Payoff | Notas |
|---|---|---|
| Subdomínio takeover | ALTO | CNAME dangling em subdomínios não-Shopify |
| Admin `.myshopify.com` + cred vazada | ALTO | Acesso admin loja |
| Storefront API / customer IDOR | ALTO | PII de clientes |
| Checkout/cart bypass, price tampering | MÉDIO | Financeiro |
| `/products.json`, `/collections.json` info | INFO | Padrão Shopify |
| OSINT cred stuffing | ALTO | Login de customers/admins |
| Subdomínios próprios (VPS, dev, staging) | ALTO | Vetor foothold real |

## Backlog de vetores (pausados / gatilho de retorno)
- (a preencher conforme recon)

## Especialistas acionados
- (a preencher)
