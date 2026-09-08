# E-009 — apilms re-classificação + cdn GoCache blocked + misc (crm/focusonline/faculdadefocus/novolms)
Data: 2026-09-08 (enum, via Tor)

apilms.grupofocus.com.br:
- Træfik "default cert 404/19B" de 15:xxNÃO permanece — agora responde pela app Next.js do cluster (200 489K SPA shell, header x-middleware-rewrite: /redirect + mesma CORS do cluster loja).
- Todos os paths testados (30) = 200 SPA shell EXCETO /api/v1* → 404 490431B (real 404 dentro da app).
- Conclusão: apilms faz parte do roteamento Host do ALB Next hoje; sem API separada.

cdn.focusconcursos.com.br (GoCache): 403/263B em TODOS os 14 paths testados (bucket-path fail).
cdn.grupofocus.com.br: 404/311-331B em TODOS os 14 paths.

crm.focusconcursos.com.br: 503 ELB target-down persistente em /,/login,/docs (retry futura).
focusonline.com.br: catch-all CloudFront → redireciona para focusconcursos.com.br prod (/ → 200 1,062,306B; /login → 200 643,433B — mesma SPA).
faculdadefocus.com.br: VIVO! /login 200 750,077B (Laravel faculdade), / 200 1,044,481B, produtos idênticos sitemap do teste (produto/-produto pos-graduação, /produtos,/faqs,/recuperar-senha,/recuperar-email).
wwwdev.focusconcursos.com.br (34.230.151.3): fallback SNI+resolve via Tor → 000 (SYN-blackhole anti-Tor reativado) — blocked phase; retry cooldown.
novolms.focusconcursos.com.br (descobrimento wayback: Next.js app/login/chunk[]): DOWN 000 — decomissionado/origem-bloqueada; record p/ IP-different probe.
novoblog (wayback) = WordPress antigo (wp-content/uploads).

sistemaead.com.br: _next/static/chunks guess retornou 403 CloudFront (path apply not valid).

Arquivos: enum/apilms.grupofocus.com.br/apilms_probe.txt; enum/cdn.gocache.com.br/paths_probe.txt; enum/cdn.gocache.com.br/m_*.out
