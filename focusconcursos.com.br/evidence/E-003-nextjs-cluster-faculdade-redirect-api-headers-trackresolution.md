# E-003 — Cluster Next.js grupofocus + loja — JS leaks + faculdadefocus migration + API internals
Data: 2026-09-08 (enum, via Tor)

Fontes: index.html(489361B) de loja/ead/apex/focus/media/static/prod/s3/apilms.grupofocus + www3(build variant), chunks baixados:
- loja: /_next/static/chunks/{1255,1356,2619,3456,4bd1b696,8720,...}+app/{layout,not-found,redirect,global-error}+main-app+webpack+polyfills (total 14 assets, 237KB css)
- www3: build variante (chunks 18720/31255/4bd1b696/hash dif) — mesma app.

Achados por chunk:
1. chunk app/redirect/page-4c1c5f345e719e08.js: `(0,s.redirect)(a.env.NEXT_PUBLIC_DEFAULT_SITE||"https://faculdadefocus.com.br")` — REDIRECIONAMENTO DE TODA A MARKA GRUPOFOCUS PARA faculdadefocus.com.br (migração de marca ativa).
2. rotas de API interna vazadas nos chunks (loja+www3+ead idênticos): /api/headers e /api/track-resolution
3. Live:
   - GET /api/headers → 200 {"domain":"","appToken":"","token":"","ip":"185.220.101.27","gRepatch":"a8b4cbe6..."} — ecoa IP requester + checksum sha256 "gRepatch"; CORS Allow-Headers: Content-Type, Authorization, Token, g-repatch (header custom do SSR client-side)
   - POST /api/track-resolution {"url":"https://example.com/x"} → 204 No Content (aceita JSON arbitrário silencioso — candidato SSRF/abuse)
   - POST /api/headers → 405
4. apilms.grupofocus.com.br agora responde no MESMO cluster Next (x-middleware-rewrite: /redirect) — re-classificação do host (antes atrás de Traefik default-cert 404/19B em 15:xx).
5. middleware next x-middleware-rewrite: /redirect presente em todo o cluster → candidato CVE-2025-29927 (probe pelo webapp).
6. manifest.webmanifest: name "Grupo Focus", start_url "/".
7. Old wayback API do prod principal (/api/cart/{uuid}, /api/person/sellers, /api/product/{id}/subjects) — hoje 404 SPA (app migrada; API interna por outra rota).

Arquivos: enum/nextjs.grupofocus.com.br/, enum/nextjs.focusconcursos.com.br/, enum/loja.grupofocus.com.br/.
