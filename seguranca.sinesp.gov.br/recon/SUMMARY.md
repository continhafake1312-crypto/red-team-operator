# Attack Surface Summary & Ranking de Payoff

**Alvo:** seguranca.sinesp.gov.br  
**Data:** 2026-09-05  
**Fase:** Recon Ativo concluída

---

## Hosts Diretos (Origem Real - SERPRO)

| Host | IP | Serviço | Porta | Stack |
|------|-----|---------|-------|-------|
| seguranca.sinesp.gov.br | 189.9.194.69 | Login principal | 443 | Apache/JSP 2.2, Bootstrap, jQuery |
| dw.sinesp.gov.br | 161.148.238.97 | MicroStrategy DWSINESP | 443 | Apache/JSP 2.3, MicroStrategy |
| painel.sinesp.gov.br | 189.9.176.250 | Painel Acompanhamento | 443 | Nginx 1.28.3, Angular SPA |
| cadweb.sinesp.gov.br | 161.148.117.246 | CAD Ocorrências | 443 | Nginx 1.28.3, BigIP F5 |
| cadweb2.sinesp.gov.br | 161.148.220.x | CAD Ocorrências réplica | 443 | Nginx 1.28.3, BigIP F5 |
| delegaciavirtual.sinesp.gov.br | 161.148.220.x | Delegacia Virtual | 443 | Nginx 1.28.3 |
| oauth2.sinesp.gov.br | 189.9.0.79 | OAuth2 | 443 | Nginx 1.20.1, reCAPTCHA |
| ppe.sinesp.gov.br | 161.148.220.x | Sinesp PPe | 443 | OpenResty 1.31.1.1 |
| atendimento.sinesp.gov.br | 189.9.176.127 | Atendimento | 443 | OpenResty, Bootstrap 4.6, jQuery 3.6, Java/JSP (JSF), WAF detectado |
| integracaobo.sinesp.gov.br | 189.9.194.240 | Integração BO | 443 | Apache (health check "OK") |
| mais.sinesp.gov.br | 161.148.117.167 | Sinesp+ | 443 | Nginx, Bootstrap |
| agente.sinesp.gov.br | 189.9.0.79 | Agente (403) | 443 | Nginx 1.20.1, Node.js/UmiJs |
| busca.sinesp.gov.br | 189.9.0.79 | Busca (403) | 443 | Nginx 1.20.1, Node.js/UmiJs |
| cidadao2.sinesp.gov.br | 189.9.0.79 | Cidadão2 (403) | 443 | Nginx 1.20.1, Node.js/UmiJs |
| ead.sinesp.gov.br | 189.9.0.79 | EAD (403) | 443 | Nginx 1.20.1, Node.js/UmiJs |
| geo.sinesp.gov.br | 189.9.0.79 | Geo (403) | 443 | Nginx 1.20.1, Node.js/UmiJs |
| studio-ead.sinesp.gov.br | 189.9.0.79 | Studio EAD (403) | 443 | Nginx 1.20.1, Node.js/UmiJs |
| temporeal.sinesp.gov.br | 189.9.0.79 | Tempo Real (403) | 443 | Nginx 1.20.1, Node.js/UmiJs |
| infoseg.sinesp.gov.br | 189.9.194.136 | INFOSEG | 443 | Apache, redirect login |
| infoseg-servico.sinesp.gov.br | 189.9.194.140 | INFOSEG Service | 443 | Apache (403) |
| cadastros.sinesp.gov.br | 189.9.194.234 | Cadastros | 443 | Apache, RHEL |
| barramento-apis.sinesp.gov.br | 189.9.194.26 | ESB APIs | 443 | Apache/ESB |

---

## Ranking de Payoff

### 🥇 Crítico - Prioridade Máxima
1. **seguranca.sinesp.gov.br** - Login principal, acesso a PII. Vetores: SQLi, bypass auth, JWT
2. **infoseg.sinesp.gov.br** - P-001: CPFs expostos. Confirmar e explorar
3. **dw.sinesp.gov.br** - MicroStrategy DW. Vetores: SQLi, IDOR, creds default

### 🥈 Alto - Prioridade Alta
4. **painel.sinesp.gov.br** - SPA Angular. Vetores: API IDOR, token leakage
5. **cadweb.sinesp.gov.br** - CAD Ocorrências. Vetores: IDOR, file upload, path traversal
6. **delegaciavirtual.sinesp.gov.br** - Delegacia Virtual. Vetores: BOLA, SQLi
7. **oauth2.sinesp.gov.br** - OAuth2 server. Vetores: SSO bypass, token interception
8. **barramento-apis.sinesp.gov.br** - ESB API. Vetores: Swagger/OpenAPI, API vulns

### 🟡 Médio
9. **atendimento.sinesp.gov.br** - Helpdesk. Vetores: IDOR, XSS, IP disclosure, WAF bypass. **Alcançável via Tor**
10. **agente/busca/cidadao2/ead/geo/studio-ead/temporeal** - Node.js/UmiJs 403. Vetores: 403 bypass, route discovery
11. **mais.sinesp.gov.br** - Sinesp+. Vetores: Cloudflare bypass
12. **cadastros.sinesp.gov.br** - RHEL test page. Vetores: info disclosure

### 🟢 Baixo
13. **infoseg-servico, auditoria** - Apache 403
14. **integracaobo.sinesp.gov.br** - Health check endpoint "OK". Vetor: info disclosure leve
15. **sinesp.gov.br, www.sinesp.gov.br** - Domínios raiz

---

## Findings Prioritários

| ID | Tipo | Severidade | Descrição |
|----|------|-----------|-----------|
| P-001 | Info Disclosure | 🔴 Crítico | CPFs expostos no INFOSEG |
| F-002 | Crypto | 🟡 Médio | SWEET32 (3DES) em infoseg/infoseg-servico |
| F-003 | Protocolo | 🟡 Médio | TLSv1.0/1.1 em painel e atendimento |
| F-004 | Info Disclosure | 🟢 Baixo | E-mails expostos no atendimento |
| F-005 | Security Header | 🟢 Baixo | X-XSS-Protection:0 no dw |
| F-006 | Info Disclosure | 🟢 Baixo | RHEL test page no cadastros |
| F-009 | Info Disclosure | 🟡 Médio | IP do usuário exposto no atendimento (inclusive IPs de Tor) |
| F-010 | WAF | 🟢 Baixo | WAF detectado no atendimento |
| F-011 | Info Disclosure | 🟢 Baixo | Painel SPA expõe config.json com urlMenu externo |
| F-012 | Config | 🟢 Baixo | BigIP F5 load balancer confirmado no cadweb |

---

## Próximos Passos Recomendados

1. **Enum (content discovery + JS):** seguranca, dw, painel, cadweb, atendimento (alcançável), oauth2
2. **CVE Research:** Apache 2.2/2.3, Nginx 1.20.1/1.28.3, OpenResty 1.31.1.1, reCAPTCHA, BigIP F5
3. **Webapp Attack:** Login bypass, IDOR, SQLi nos hosts prioritários
4. **INFOSEG validation:** Confirmar e extrair CPFs expostos (requer autenticação)
5. **mais.sinesp.gov.br:** IP direto SERPRO 161.148.117.167 (sem Cloudflare). Enumeração web direta.
6. **Análise do painel SPA:** Extrair rotas de main.js e config.json
7. **Verificar CSS Inter Portal:** https://cssinter.serpro.gov.br/SCCDPortalWEB/pages/dynamicPortal.jsf?ITEMNUM=2719