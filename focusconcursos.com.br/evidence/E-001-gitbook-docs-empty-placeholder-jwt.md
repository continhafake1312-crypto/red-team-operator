# E-001 — docs.grupofocus.com.br (GitBook "API docs oficial") — enumerado como PLACEHOLDER
Data: 2026-09-08 (enum fase 5, via Tor)
Quebra de hipótese do plano (SUMMARY §7 #1): o site de docs GitBook NÃO contém rotas/parâmetros/HMAC/staging — é um placeholder nunca escrito.

Artefatos:
- robots.txt (gitbook standalone) + sitemap.xml→sitemap-pages.xml: UMA página só.
- page.md / llms.txt / llms-full.txt = "# Page" vazio.
- GET https://docs.grupofocus.com.br/api.grupofocus.com.br/ → 307 → subpath /api.grupofocus.com.br/ (GitBook v2 hosting).
- Página real (276082B SSR: page-root.html) tem zero conteúdo técnico — apenas shell.

GitBook content-API JWT (visitor, público no HTML RSC — exp 7d):
- header/alg HS512; sub=content_807b91c3c50f70e3d22a61e06840d2a5b9ba33a3; organização=2czSUJTtZyqXOyI3dYVt; space=Opaq9Di8Nj8MptgIccEp; site=site_Q5v4k; siteSpace=sitesp_2azHG; visitorType=human; rateLimitMultiplier=1000000.
- Arquivado em enum/docs.grupofocus.com.br/gitbook_content_jwt.txt (chmod 600; NÃO subir ao relatório — token rotativo público GitBook).

api.gitbook.com (com o token visitante):
- GET /v1/spaces/Opaq9Di8Nj8MptgIccEp → 200 (space "api.grupofocus.com.br", public, editMode locked, criado 2024-10-25)
- GET /v1/orgs/2czSUJTtZyqXOyI3dYVt → 200: título "grupofocus.com.br", useCase internalDocs, plan free_2024, trial ended 2024-11-08, emailDomains ["grupofocus.com.br"], permissions viewer-only.
- /contents,/pages,/revisions → 404 API operation not found.

Endpoints ~gitbook (público):
- POST /~gitbook/mcp → 405 (MCP server endpoint ativo)
- ~gitbook/visitor, ~gitbook/__evt, ~gitbook/ogimage/<rev>, /rss.xml, /llms.txt, /page.md

Conclusão: nada de rotas internas aqui; payoff REAL veio dos JS bundles (E-005/E-003). gitbook_org.json salvo.
