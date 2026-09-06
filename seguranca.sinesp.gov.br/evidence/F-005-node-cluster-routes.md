# F-005 — Node.js Cluster — Rotas e Informações de Desenvolvimento Expostas

**Severidade:** 🔴 Alta
**Host:** agente.sinesp.gov.br, busca.sinesp.gov.br, cidadao2.sinesp.gov.br, ead.sinesp.gov.br, geo.sinesp.gov.br, studio-ead.sinesp.gov.br, temporeal.sinesp.gov.br (todos 189.9.0.79)
**Data:** 2026-09-06

## Descrição

Sete subdomínios compartilham o mesmo IP (189.9.0.79) e servem a mesma aplicação Umi.js (v3.2.16). A análise do JS revelou rotas de negócio sensíveis e informações de desenvolvimento.

## Rotas Descobertas

### Negócio
- `/procurados` — Pessoas procuradas (CRUD completo)
- `/procurados/:wantedId` — Detalhes
- `/procurados/:wantedId/historico` — Histórico (inclui adicionar)
- `/procurados/:wantedId/mandados` — Mandados (inclui adicionar)
- `/procurados/:wantedId/noticias` — Notícias (inclui adicionar)
- `/procurados/adicionar` — Adicionar procurado

### API Gateway
- `/api/v1/` — citizen-gateway (responde sem auth!)
- `/api/` — Mensagem de erro de segurança
- `/admin/` — Admin (retorna aplicação Umi)

### Informações de Desenvolvimento
```
/home/lailson/Homeoffice/sinesp-cidadao-webapp/
/home/lailson/Homeoffice/sinesp-cidadao-webapp/node_modules/umi-plugin-antd-icon-config/lib/app.js
/home/lailson/Homeoffice/sinesp-cidadao-webapp/src/.umi-production/plugin-dva/runtime.tsx
/home/lailson/Homeoffice/sinesp-cidadao-webapp/src/app.ts
```

## Impacto
- O desenvolvedor "lailson" está referenciado nos paths — possível alvo de engenharia social
- A estrutura completa da aplicação de Procurados está mapeada
- O gateway API `/api/v1/` responde sem autenticação
- A stack é Umi.js 3.2.16 / Nginx 1.20.1

## Recomendação
- Remover paths de desenvolvimento dos bundles de produção
- Autenticar acesso à API gateway
- Revisar segurança da rota `/procurados`