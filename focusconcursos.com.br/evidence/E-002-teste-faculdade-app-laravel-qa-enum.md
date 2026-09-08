# E-002 — teste.grupofocus.com.br = QA da app "Faculdade Focus" (Laravel) + assets/manifests expostos
Data: 2026-09-08 (enum, via Tor)

Vivos:
- GET /                      → 302 https://www.faculdadefocus.com.br/
- GET /login                 → 200 24212B (form action POST /login, _token CSRF Laravel, cookies XSRF-TOKEN+laravel_session)
- GET /robots.txt            → 200 "User-agent: * Disallow:" (vazio!)
- GET /sitemap.xml           → 200 4119B — TODO o mapa aponta para https://faculdadefocus.com.br (produtos.../howedas/produtos faqs/recuperar-senha/recuperar-email)
- GET /mix-manifest.json     → 200 12327B SEM AUTH — 87 assets:
    grupos admin: tinymce (plugins/visualblocks), iesde.js, order-zipcode.js, dashboard.js, manifest, vendor, e-commerce.css, tiny.css
    tema: /themes/faculdade-focus/* (images/payment-brands/{amex,boleto,diners,elo,hiper,hipercard,master_card}, home banners, favicon emec, app-store/google-play)
- GET /_debugbar             → 302 →/ (rota debugbar ativa)
- GET /horizon               → 403 25643B HTML w/GTM (Horizon dashboard bloqueado não-missing)
- GET /.env, /.env.backup    → 403 162B (nginx deny)
- GET /admin                 → 302 /admin/login (existe); /admin/login 200
- /telescope,/storage,/api,/register,/dashboard, /user, /password/* → 302 370B catch-all (auth redirect)

Routes existentes por método (405): /logout, /register (POST)
Live visão: XSRF-TOKEN + laravel_session ambos On httpOnly.

Interpretação: **teste.grupofocus.com.br é o ambiente QA do app Laravel da faculdade (faculdadefocus.com.br)** — checkout/pagamento multi-gateway (payment-brands) já presente. Rotas da API do e-commerce (order-zipcode) visíveis.

Evidência bruta: enum/teste.grupofocus.com.br/ (g_*.out, h_*.withhdr, mix_manifest_full.json).
