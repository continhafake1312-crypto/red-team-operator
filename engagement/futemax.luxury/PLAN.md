# PLAN.md — futemax.luxury

## Status do Engagement
- **Início:** 2026-08-26
- **Status:** EM ANDAMENTO
- **Coordenador:** Red Team Operator

## Fases

| # | Fase | Status | Especialista | Notas |
|---|------|--------|-------------|-------|
| 1 | Escopo + Estrutura | ✅ CONCLUÍDO | pentest | pastas criadas, SCOPE.md, PLAN.md, REPORT.md, timeline.log |
| 2 | Recon Passivo + OSINT | ✅ CONCLUÍDO | recon-passive + osint | 8 vhosts, IP real 172.241.213.98, WP/Canais Play, JWT HS256, usuário paulodbs |
| 3 | Recon Ativo | ✅ CONCLUÍDO | recon-active | IP real 212.92.104.6 (Rússia), sem WAF, SSH:1022, DNS:53, 8 vhosts |
| 4 | Consolidar Attack Surface | ✅ CONCLUÍDO | pentest | recon/SUMMARY.md — ranking de payoff |
| 5 | Enumeração Profunda | ⏳ EM ANDAMENTO | enum | Delegado — content discovery no origin, JS analysis, vhosts |
| 6 | Ataque Webapp | ⏳ EM ANDAMENTO | webapp | JWT bypass ❌ — próximo: WPScan + wp-login brute + IDOR |
| 7 | CVE Research + Exploit | ✅ CONCLUÍDO | cve + exploit | SSH ❌, JWT ❌ — nenhum exploit viável |
| 8 | Pós-Exploração | ⏳ PENDENTE | postex | Se houver foothold |
| 9 | Relatório | ⏳ PENDENTE | report | Ao final |

## Vetores Identificados (Atualizado conforme findings)

| Vetor | Prioridade | Status | Notas |
|-------|-----------|--------|-------|
| WP-admin login (wp-login.php) | 🔴 ALTA | Pendente | Acessível — brute force admin/paulodbs |
| xmlrpc.php | 🔴 ALTA | Pendente | 405 — possível brute force creds WP |
| JWT Joken HS256 weak secret | 🔴 ALTA | ❌ ESGOTADO | hashcat 5M+ senhas, nenhuma chave encontrada |
| JWT "none" algorithm bypass | 🔴 ALTA | ❌ ESGOTADO | Server rejeita alg:none em todas variações |
| JWT reuso entre vhosts | 🟡 MÉDIA | ❌ ESGOTADO | Todos vhosts retornam challenge |
| JWT algorithm confusion | 🟡 MÉDIA | ❌ ESGOTADO | Sem JWKS/public key exposta |
| vhost admin.futemax.luxury | 🔴 ALTA | Pendente | Painel admin protegido por JWT |
| vhost api.futemax.luxury | 🔴 ALTA | Pendente | API back-end |
| vhost stream.futemax.luxury | 🟡 MÉDIA | Pendente | Streaming |
| vhost shop.futemax.luxury | 🟡 MÉDIA | Pendente | Loja/checkout |
| IDOR em ?page_id=, ?p=, ?channel=, ?match= | 🟡 MÉDIA | Pendente | Parâmetros GET numéricos |
| SQLi em parâmetros GET | 🔴 ALTA | Pendente | channel, match, event, page_id, p |
| WordPress REST API (/index.php?rest_route=/) | 🟡 MÉDIA | Pendente | WP JSON endpoints |
| Upload dir (/wp-content/uploads/) | 🟡 MÉDIA | Pendente | Verificar listagem + upload |
| CVE plugins (Rank Math, XML Sitemap) | 🟡 MÉDIA | Pendente | Pesquisar CVEs recentes |
| CVE theme (Canais Play v1.2.9) | 🟡 MÉDIA | Pendente | Tema custom streaming |
| futemax.lol (domínio antigo, IP real) | 🔴 ALTA | Pendente | IP direto sem Cloudflare |
| Domínios relacionados (futemax.stream, .live, etc.) | 🟡 MÉDIA | Pendente | Infraestrutura backend |