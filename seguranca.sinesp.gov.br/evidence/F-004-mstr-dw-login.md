# F-004 — MicroStrategy DWSINESP Login — Credenciais não confirmadas

**Severidade:** 🟡 Média
**Host:** dw.sinesp.gov.br
**Endpoint:** https://dw.sinesp.gov.br/DWSINESP/servlet/mstrWeb?pg=login
**Data:** 2026-09-06

## Descrição

O portal MicroStrategy de BI do SINESP está acessível. Foram realizados testes de autenticação com credenciais default e a credencial candidata `J@seph1312`, mas nenhum login foi confirmado.

## Observações

- **Servidor:** Apache com JSP/2.3
- **Aplicação:** MicroStrategy Web com customizações SINESP
- **Seamless Login:** Habilitado (`seamlessLoginEnabled: '1'`)
- **Plugins:** _SSO (Single Sign-On), HeaderFooter
- **Menu SINESP:** Carregado via `https://seguranca.sinesp.gov.br/sinesp-menu/init/js`
- **Logout:** Redireciona para `seguranca.sinesp.gov.br/sinesp-seguranca/logout?goto=DWSINESP`

## Credenciais testadas
| Username | Password | Resultado |
|----------|----------|-----------|
| Administrator | Administrator | Página de login (sem redirect) |
| Administrator | J@seph1312 | Página de login (sem redirect) |
| admin | J@seph1312 | Página de login (sem redirect) |
| admin | admin | Página de login (sem redirect) |

## Endpoints adicionais
- `mstrWeb?evt=4010` — Página de admin (requer auth)
- `mstrWeb?evt=3040` — Lista projetos (provavelmente requer auth)
- `taskAdmin` — API de tarefas admin (requer auth)

## Impacto
- O MicroStrategy requer autenticação e as credenciais testadas não funcionaram
- O `seamlessLoginEnabled` sugere integração com SSO (provavelmente OAuth2)
- **Recomendação**: Continuar monitorando; testar com outras credenciais

## Próximos passos
- [ ] Testar credential stuffing com lista de senhas comuns
- [ ] Verificar se há IDOR em tarefas do MicroStrategy
- [ ] Investigar integração SSO com oauth2.sinesp.gov.br