# E-004 — payment / integration focusconcursos — error-shape mapping (parâmetros e handlers)
Data: 2026-09-08 (enum, via Tor)

payment.focusconcursos.com.br (nginx Laravel API):
- GET /            → 200 {"status":"ok"}
- GET /docs        → 500 {"exception":"Symfony\\Component\\Debug\\Exception\\FatalErrorException","message":"Internal Server Error","track":null}
  com/sem params (?track=x), GET+POST idem.
- GET /api,/checkout,/invoice,/webhook,/iugu,/mercadopago,/paypal,/boleto,/pix,/graphql,/telescope,/horizon,.env
                   → 404 {"exception":"...\\NotFoundHttpException","message":"Not Found","track":null}
- POST /docs       → mesmo 500 FatalErrorException com track null (não é erro de rota — /docs existe, handler executa e morre fatal).

integration.focusconcursos.com.br:
- mesmíssimas rotas 404, MAS campo "trace":null (não "track") → formato custom do payment é diferencial do backend (2 apps distintas).

Rota /docs do payment existe (não 404) — internal fatal. Hand-off webapp: param enrichment ("track" field em POST? não aceito), nada de secrets no erro (só exception type).

Arquivo: enum/payment.focusconcursos.com.br/docs_params.txt (+k_*.out)
