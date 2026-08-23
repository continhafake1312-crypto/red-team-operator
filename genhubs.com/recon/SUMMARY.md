# Attack Surface Summary — genhubs.com
**Data:** 2026-08-23

---

## Ranking de Payoff (§16)

| Prioridade | Vetor | Alvo | Descrição | Status |
|------------|-------|------|-----------|--------|
| 🔴 **CRÍTICO** | **MariaDB 11.8.8 exposto** | 156.67.222.30:3306 | Database público sem restrição IP | 🔍 Em exploração (hydra) |
| 🔴 **CRÍTICO** | **Força bruta MySQL** | 156.67.222.30:3306 | Tentativa de senhas fracas no MariaDB | 🔄 Em andamento |
| 🟠 **ALTO** | **FTP exposto** | 156.67.222.30:21 | ProFTPD/KnFTPD com TLS | 🔍 Próximo alvo |
| 🟠 **ALTO** | **Cloudflare bypass** | genhubs.com (via cloudscraper) | Bypass funcional para webapp testing | ✅ Disponível |
| 🟠 **ALTO** | **API /api/shop** | genhubs.com/api/shop | POST com CSRF — possível IDOR/fraud | 📋 Pendente |
| 🟠 **ALTO** | **Dashboard SPA** | genhubs.com/dashboard/* | Múltiplos endpoints sensíveis | 📋 Pendente |
| 🟡 **MÉDIO** | **Painel hpanel** | 156.67.222.30:80 (header) | Painel de hosting Hostinger exposto | 📋 Pendente |
| 🟡 **MÉDIO** | **Subdomínios Cloudflare** | *.genhubs.com | 3 subdomínios com erros (526, 520, 502) | 🔍 Investigar bypass |
| 🟡 **MÉDIO** | **JS do SPA análise** | genhubs.com/_next/static/chunks/ | API keys, rotas internas, tokens | 📋 Pendente |
| 🟡 **MÉDIO** | **Discord Gen Hub** | discord.gg/RaSp35KHbf | OSINT social, engenharia social | 📋 Pendente |
| 🟢 **BAIXO** | **GitHub users** | instantsx, Instantxs | Possível vazamento de credenciais | 📋 Pendente |
| 🟢 **BAIXO** | **Range AS47583** | 156.67.222.0/24 | 251 hosts Hostinger com mesmo perfil | 🔍 Scan rápido feito |
| 🟢 **INFO** | **Certificado *.hstgr.io** | 156.67.222.30:443 | Cert compartilhado Hostinger | 📋 Documentado |

---

## Topologia

```
[Atacante]
    │
    ├──► Cloudflare (104.26.12.132, etc.)
    │       └──► genhubs.com (Next.js SPA)
    │              ├── /dashboard/* (Cookies/Account tools)
    │              └── /api/shop (JSON API c/ CSRF)
    │
    └──► IP Real (156.67.222.30 — Hostinger, Singapura)
            ├── :21  FTP (ProFTPD)
            ├── :80  HTTP (LiteSpeed, 403)
            ├── :443 HTTPS (LiteSpeed, cert *.hstgr.io)
            └── :3306 🔴 MariaDB 11.8.8 EXPOSTO
```

## Próximas ações (ordenadas por payoff)

1. ✅ ~~MariaDB: confirmar exposição~~ (F-001 criado)
2. 🔄 MariaDB: força bruta com hydra (em andamento)
3. 📋 FTP: brute force se MySQL falhar
4. 📋 Enumeração web (cloudscraper bypass): content discovery, JS analysis, API mapping
5. 📋 Webapp attack: IDOR no /api/shop, auth bypass no dashboard, CSRF analysis
6. 📋 CVE research: MariaDB 11.8.8, ProFTPD, LiteSpeed
7. 📋 Discord OSINT: infiltrar server Gen Hub
8. 📋 GitHub recon: instantsx, Instantxs