# E-007 — mobile.focusconcursos.com.br — API stub + register reCAPTCHA + logout token-guard
Data: 2026-09-08 (enum, via Tor)

- GET / → 301 /docs; GET/POST /docs (+ params page/search/preview/version/format/pretty) → {"status":"ok"} 15B — stub. Nenhum swagger.
- 405 (rota existe, método errado): /register (POST), /logout (POST)
- POST /register {} → 400 {"errors":{"recaptcha-error":"Erro ao validar captcha"}}
- POST /register {email,password} → 400 idem — **reCAPTCHA required server-side** no cadastro de aluno.
- POST /logout → 401 {"message":"Unauthenticated."} — guard stateless token (não cookie Laravel).
- Todos demais GET (/api,...) → 404 {"message":""} 15B JSON (catch-all app API puro).

Hand-off webapp: (1) reCAPTCHA bypass teste (null response/secret reuse), (2) /logout enum de token-model, (3) rotas do mobile are the "app API" (mesma do app mobile — candidates p/ token brute/undocumented routes regex no js não disponível pois tudo server-side).

Arquivo: enum/mobile.focusconcursos.com.br/{params_probe.txt,p_*.json,q_*.out,api_sweep.txt}
