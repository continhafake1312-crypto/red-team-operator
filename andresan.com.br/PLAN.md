# Plano — andresan.com.br

## Objetivo de alto valor (ordem do operador)
**Conseguir ACESSO** — interno, administrativo ou foothold. Prioridade MÁXIMA.
Caçar vetores de acesso continuamente (§19). Não parar no primeiro vetor falho.

## Fases (status)
- [x] F1 — Escopo (estrutura + SCOPE.md)
- [x] F2 — Recon passivo + OSINT  → `recon-passive`
- [ ] F3 — Recon ativo  → `recon-active`
- [ ] F4 — Consolidar SUMMARY.md (coordenador)
- [ ] F5 — Enumeração profunda  → `enum`
- [ ] F6 — Ataque webapp  → `webapp`
- [ ] F7 — CVE + exploit  → `cve`/`exploit`
- [ ] F8 — Pós-ex (se foothold)  → `postex`
- [ ] F9 — Relatório final  → `report`

## Ranking de payoff — FOCO EM ACESSO (atualizado após F2)
1. 🔴 **`painel.andresan.com.br/auth`** — painel admin Laravel. Default creds, auth bypass, SQLi no login, enumeração de usuários. Foothold direto no admin.
2. 🔴 **`blog.andresan.com.br` WordPress 4.8.30 (DESPRONTO)** — wp-login, xmlrpc brute, CVEs 4.8.x, enum users. RCE via plugin/theme se dessincronizado.
3. 🔴 **`www.andresan.com.br/admin/login`** — painel admin LEGADO. Mais fraco que o atual. Default creds + bypass.
4. 🔴 **`/admin/var/` exposto (www)** — directory listing/IDOR em uploads admin. Pode vazar dados + caminho para path traversal/RCE.
5. 🟠 **`areadoaluno.andresan.com.br/index/login`** — área do aluno. Auth bypass, SQLi, session hijack.
6. 🟠 **`sala.andresan.com.br/entrar`** — sala de aula Laravel. Auth bypass, IDOR em /api/, param mining `?q=`, `?aid=`.
7. 🟠 **`cdn.andresan.com.br` PDFs token40** — enumeração de tokens = acesso a materiais pagos (IDOR).
8. 🟡 **Google Workspace** (`atendimento@andresan.com.br` + padrões) — credential stuffing pós-breach.
9. 🟡 **`materiais.andresan.com.br` takeover** (RD Station Pages) — subdomain takeover = controle de subdomínio confiável (phishing/ATO indireto).
10. 🟡 **`concursos.andresan.com.br`** (Laravel edustore) — explorar auth/IDOR.

## Backlog de vetores (§19) — caçada contínua
- [pendente] SQLi em /auth do painel Laravel → se falhar, tentar /api/, /search, headers, NoSQLi
- [pendente] Default creds painel admin (admin/admin, admin/password, andresan/andresan)
- [pendente] wp-login brute + xmlrpc no blog WP 4.8.30
- [pendente] Directory listing em /admin/var/banner/, /admin/var/file/, /admin/var/filemanager/image/
- [pendente] Token enumeration no cdn.andresan.com.br/curso/<token40>.pdf
- [pendente] Auth bypass em areadoaluno (/index/login, /cadastro/senha, /cadastro/authface)
- [pendente] .well-known/openid-configuration — mapear OAuth endpoints/keys
- [pendente] Param mining em sala.andresan.com.br (?q=, ?aid=)
- [pendente] Credential stuffing Google Workspace (atendimento@andresan.com.br + breach dumps)
- [pendente] Takeover materiais.andresan.com.br (verificar RD Station Pages não-reivindicada)

## Notas de delegação aninhada
- recon-passive → osint (após subdomínios), cloud (buckets/takeover)
- enum → webapp (ao achar endpoint vulnável)
- webapp → exploit/cve (ao confirmar vuln)
- cve → exploit (PoC não-destrutivo)
- exploit → postex (após foothold)
