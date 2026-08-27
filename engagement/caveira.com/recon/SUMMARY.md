# recon/SUMMARY.md — Attack Surface Consolidada (caveira.com)

> Consolidado das Fases 2 (passiva/OSINT) + 3 (ativa). Mantém o ranking de payoff que orienta as próximas fases (§16).

## Attack surface — hosts vivos (11)

| # | Host | IP / Backend | Origem direta? | Stack | WAF | Payoff |
|---|------|-------------|----------------|-------|-----|--------|
| 1 | **teste.caveira.com** | 165.227.4.115 (DO droplet) | **SIM** | Apache 2.4.58, WordPress 7.1, Elementor 3.32.2, PHP/MySQL; OpenSSH 9.6p1 (22); HTTP-only | **NENHUM** | **ALTO** |
| 2 | **app2.caveira.com** (origem orca-app-aznfk.ondigitalocean.app) | DO App Platform | bypassável | SPA "Projeto Caveira" (app Caveira Pass) | Cloudflare (front only) | **MÉDIO-ALTO** |
| 3 | loja.caveira.com | Cloudflare→Loja Nuvem | não | E-commerce Loja Nuvem (financeiro) | Cloudflare | **MÉDIO** |
| 4 | caveira.com (apex) | Cloudflare (104.26.4.188/172.67.74.203) | não | WordPress 7.1, Elementor 4.2.2, Yoast 28.3, Site Kit 1.186.0 | Cloudflare + Wordfence | **MÉDIO** |
| 5 | panel.caveira.com | Netlify (54.232.119.62) | não | SPA "Painel Caveira" (login Caveira Pass) | — | **MÉDIO-BAIXO** |
| 6 | app.caveira.com | Netlify | não | SPA "Projeto Caveira" | — | BAIXO |
| 7 | plataforma.caveira.com | Netlify | não | SPA "Projeto Caveira" | — | BAIXO |
| 8 | aplicativo.caveira.com | Cloudflare→Netlify | não | SPA "Projeto Caveira" | Cloudflare | BAIXO |
| 9 | stape.caveira.com | saf.stape.io (GCP) | não | Stape.io server-side GTM | — | BAIXO |
| 10 | skull.homo.caveira.com | Netlify (404) | não | — (takeover candidate) | — | BAIXO (takeover) |
| 11 | panel-homo.caveira.com | Cloudflare→Netlify | não | — | Cloudflare | BAIXO |

## Ranking de payoff (Fase 3 — atualizado)

1. **ALTO — teste.caveira.com (165.227.4.115):** origem direta, sem CDN/WAF/TLS, WordPress exposto (wp-login.php, xmlrpc.php, readme.html), usuários enumerados (diogoscota, leotavares, lionstone), OpenSSH 9.6p1. Vetor principal do engagement.
2. **MÉDIO-ALTO — app2.caveira.com origem (orca-app-aznfk.ondigitalocean.app):** bypass CDN confirmado, SPA do app Caveira Pass acessível direto.
3. **MÉDIO — loja.caveira.com:** e-commerce (objetivo financeiro).
4. **MÉDIO — caveira.com (apex):** WordPress + plugins atrás de Cloudflare+Wordfence (exige bypass).
5. **MÉDIO-BAIXO — panel.caveira.com:** login do app Caveira Pass (Netlify).
6. **BAIXO —** app/plataforma/aplicativo (SPAs idênticos), stape (terceiro), skull.homo (takeover).

## Credenciais/usuarios candidatos (loot/creds.txt)

- Usuários WordPress enumerados: **diogoscota** (author=1, fase ativa), **leotavares**, **lionstone** (fase passiva).
- Breaches/OSINT: ver recon/passive/osint_breaches.txt, osint_github.txt (trufflehog/gitleaks).
- Brute/credential-stuffing com threshold recomendado em wp-login (teste.caveira.com) e SSH 22 (165.227.4.115).

## Versões → CVE research (delegar cve)

OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 · Apache 2.4.58 · WordPress 7.1 · Elementor 3.32.2/4.2.2 · Yoast 28.3 · Site Kit 1.186.0 · miniOrange API Authentication (plugin).

## Próximas fases

- **enum:** content discovery + JS/API em teste.caveira.com e na origem app2 (orca-app-aznfk.ondigitalocean.app).
- **webapp:** auth bypass/brute wp-login (3 users) + xmlrpc (pingback/system) em teste.caveira.com; auth bypass app Caveira Pass (panel + app2 origem); bypass Cloudflare (2Captcha) no apex/loja.
- **cve + exploit:** validar CVEs das versões acima (priorizar UNAUTH RCE/SSRF).
- **network:** SSH brute com threshold em 165.227.4.115:22.

## Referências de artefatos

- Passiva: `recon/passive/PASSIVE.md` (+ 24 artefatos brutos).
- Ativa: `recon/active/ACTIVE.md` (+ 9+ artefatos brutos: nmap_*, httpx_all, vhosts_165*, waf_results, tls_*, ip_real, teste_probe, app2_origin_probe, favicon_hash).
