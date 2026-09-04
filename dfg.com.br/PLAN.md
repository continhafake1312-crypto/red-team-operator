# PLAN.md — dfg.com.br

> Espelho do todowrite. Backlog de vetores, status, prioridades.
> Atualizado conforme findings surgem (§11, §16, §19).

## Fases (§5)

| Fase | Descrição | Especialista | Status |
|------|-----------|--------------|--------|
| 1 | Escopo + estrutura + artefatos | pentest | done |
| 2 | Recon passivo + OSINT | recon-passive | done |
| 3 | Recon ativo | recon-active | in_progress |
| 4 | Consolidar SUMMARY.md + ranking payoff | pentest | pending |
| 5 | Enumeração profunda | enum | pending |
| 6 | Ataque webapp | webapp | pending |
| 7 | CVE research + exploit | cve + exploit | pending |
| 8 | Pós-exploração (se foothold) | postex | pending |
| 9 | Relatório final | report | pending |

## Ranking de payoff (§16) — refinado após Fase 2
> Ordenado por probabilidade de impacto × esforço.

1. **mail.dfg.com.br — SmarterMail/IIS origem real sem WAF** (F-P2): brute force login, default creds, CVE da versão, enum mailboxes → foothold/PII. **Top payoff.**
2. **suppliers.dfg.com.br — ASP.NET WebForms legado** (F-P4): XXE em `requests-xml.aspx`, ViewState, `register.aspx`, deserialization.
3. **portaldfg.com.br — WordPress + WooCommerce + Elementor + Fluent Forms** (F-P5): admin `drfranciscogeovane` conhecido, wpscan, CVE plugins, wp-login brute force.
4. **Vhost routing nos IPs Contabo** (F-P1): bypass Cloudflare — confirmar qual IP hospeda www/api/suppliers/old → acessar origin diretamente.
5. **Credential stuffing** (F-P10): 4 emails (acgarzon, garzon.servicos, drfranciscogeovane, postmaster) contra SmarterMail/wp-login/Nuxt `/user/login`.
6. **SmarterMail CVE** (versão a confirmar em Fase 3): path traversal, RCE, auth bypass históricos.
7. **/user/{id} IDOR + enum users** (F-P7) no Nuxt marketplace.
8. **/user/login?ReturnUrl= open-redirect** (F-P6).
9. **DMARC p=none spoofing** (F-P3) — vetor social.
10. **astarium.com afiliado** (F-P8) — investigar infra/creds cruzadas.

## Backlog de vetores (§19)
> Vetores pausados com motivo da pausa e gatilho de retorno.

- **Shodan correlation (F-P9):** pausado — sem API key. Gatilho: obter key.
- **Breaches (HIBP/DeHashed):** pausado — sem API key. Gatilho: obter key.
- **Azure/GCP buckets:** inconclusivo (Tor geo-block). Gatilho: re-testar com outro exit.

## Matriz de fallback (§19)
- Cloudflare bloqueia → já temos bypass via IPs de origem real (F-P1). Usar vhost routing nos IPs Contabo.
- SmarterMail brute force falha → default creds, CVE da versão, enum mailboxes via SMTP/IMAP.
- WP atualizado → plugins custom (Fluent Forms/Elementor), wp-json PII, xmlrpc, ai1wm export.
- SQLi/XXE falha em suppliers → ViewState, deserialization, outros endpoints .aspx.
- Credential stuffing falha → password reset flows, OAuth, API token leak em JS.
