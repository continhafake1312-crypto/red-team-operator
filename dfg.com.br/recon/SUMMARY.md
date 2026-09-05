# SUMMARY.md — Attack Surface Consolidada dfg.com.br

> Consolidação das Fases 2 (recon-passive) + 3 (recon-active). Atualizado após recon-active.
> Ranking de payoff (§16) — prioriza o que dá acesso/expo com menor esforço e OPSEC.

---

## Attack surface em uma tela

### Hosts de ORIGEM REAL (fora Cloudflare, SEM WAF) — alvo principal ⭐
| IP | Serviço | Portas | Versão | Payoff |
|---|---|---|---|---|
| 164.68.104.26 | **SmarterMail webmail** | 25,80,443 | SmarterMail Free 15.7 (build 6970), IIS/10.0, ASP.NET 4.0.30319 | ⭐⭐⭐ |
| 161.97.106.115 | **DFGames Suppliers Central** (ASP.NET WebForms) | 25,80,443 | IIS/10.0, AjaxControlToolkit 4.1.40412.0 | ⭐⭐⭐ |
| 161.97.106.114 | **DFGames Admin login** + old.dfg legado | 25,80,443 | IIS/10.0, ASP.NET 4.0.30319 | ⭐⭐ |
| 77.237.241.198 | **Mailcow** (mail.astarium.com) + SOGo + /admin/ | 25,80,443 | Mailcow (v?), nginx, TLS1.3 | ⭐⭐ |
| 5.189.143.90 | SMTP relay (mail3, sem app web) | 25,80,443 | IIS HTTPAPI (404) | ⭐ |

### Hosts Cloudflare-fronted (WAF ativo, Tor 403)
| Host | Tech | Payoff |
|---|---|---|
| dfg.com.br / www | Nuxt.js marketplace | ⭐⭐ (Cloudflare) |
| api.dfg.com.br | Nuxt API | ⭐⭐ |
| suppliers.dfg.com.br | ASP.NET WebForms (= 161.97.106.115, bypassável) | ⭐⭐⭐ via IP |
| old.dfg.com.br | ASP.NET login legado (= 161.97.106.114, bypassável) | ⭐⭐ via IP |
| cdn.dfg.com.br | CDN assets | ⭐ |
| portaldfg.com.br | WordPress 7.1 + WooCommerce/Elementor/Fluent Forms | ⭐⭐ (Cloudflare) |
| astarium.com | Cloudflare web (mail origin = 77.237.241.198) | ⭐⭐ via Mailcow |

### Credenciais/identidades para credential stuffing (passive+active)
- `acgarzon@gmail.com` / `Alexandre Garzon` — owner DFG (sysadmin provável)
- `garzon.servicos@gmail.com` — email empresa
- `drfranciscogeovane@gmail.com` / `drfranciscogeovane` (WP admin id=1 portaldfg)
- `salesmgr@dfgames.com` — vazado no body do suppliers
- `postmaster@dfg.com.br`
- Padrões @dfg.com.br: contato/suporte/admin/financeiro/alexandre.garzon
- Mailcow default: `admin`/`moohoo` (astarium.com)

---

## Ranking de payoff (§16) — ordenado por esforço×impacto

| Rank | Alvo / Vetor | Por quê | Fase |
|---|---|---|---|
| 1 | **SmarterMail 15.7 direto** (164.68.104.26) | Versão antiga, sem WAF, `/Services/` expõe 10 .asmx SOAP admin (WSDL público), CVEs conhecidos (path traversal/auth-bypass/RCE). Login `/Login.aspx` credential stuffing (acgarzon@dfg). | cve → exploit |
| 2 | **Suppliers portal direto** (161.97.106.115) | Sem WAF. `register.aspx` aberto (cria conta fornecedor). `requests-xml.aspx` XML endpoint (XXE/inj). ViewState + AjaxControlToolkit 4.1.40412.0 antigo (deserialization se machineKey). `.aspx` legado. | webapp + cve |
| 3 | **DFGames Admin login direto** (161.97.106.114 / old.dfg) | Sem WAF. Painel admin ASP.NET. Credential stuffing direto (acgarzon/salesmgr@dfgames). Senha via seleção de letras (anti-keylogger) dificulta brute mas não impede cred vazada. | webapp (auth) |
| 4 | **Mailcow admin direto** (77.237.241.198/admin/) | Sem WAF. Default creds `admin`/`moohoo` comum. SOGo exposto. Mailcow/SOGo CVEs. Controle de mail de astarium.com (e talvez dfg). | webapp (auth) + cve |
| 5 | **portaldfg WordPress** (Cloudflare) | Core 7.1 latest, mas plugins WooCommerce 10.9.4 / Elementor 4.2.3 / Fluent Forms 6.2.6 → CVE research. Admin `drfranciscogeovane`. XML-RPC habilitado. Cloudflare exige 2Captcha. | cve + webapp |
| 6 | **Bypass Cloudflare via SPF** (vetor transversal) | 5 IPs de origem (164.68.104.26, 5.189.143.90, 161.97.106.114/115, 77.237.241.198) acessíveis direto, sem WAF — sustenta todos os ranks 1-4. | (transversal) |
| 7 | **Nuxt marketplace** (dfg/www/api, Cloudflare) | JS/enum para endpoints API, IDOR `/user/{id}`, open-redirect `/user/login?ReturnUrl=`. Cloudflare bloqueia Tor. | enum + webapp |
| 8 | **DMARC p=none + SPF permissivo** (dfg.com.br) | Spoofing de dfg.com.br para phishing (social). | (social) |
| 9 | **astarium.com** (afiliado) | Mesma infra Contabo + NS Cloudflare iguais. Mailcow compartilhado. Expande attack surface (creds cruzadas dfg↔astarium). | webapp |
| 10 | **mail3 SMTP relay** (5.189.143.90:25) | Open-relay/SMTP enum (VRFY/EXPN, user enumeration). Baixo. | network |

---

## Versões candidates para CVE research (delegar a `cve`)
- **SmarterMail Free 15.7 build 6970** (SmarterTools) — path traversal, XSS, auth bypass, RCE históricos
- **Mailcow** (versão a obter) + **SOGo** (versão a obter) — CVEs groupware/mail
- **WordPress 7.1** (core latest) + plugins: WooCommerce 10.9.4, Elementor 4.2.3, Fluent Forms 6.2.6,
  Yoast SEO Premium 28.0, Site Kit 1.183.0, tema TutorStarter 4.0.3
- **Microsoft-IIS/10.0** + **ASP.NET 4.0.30319** (ViewState deserialization, WebResource/ScriptResource)
- **AjaxControlToolkit 4.1.40412.0** (2010 — deserialization histórico)
- **nginx** (Mailcow) — versão a obter

---

## Próxima fase recomendada: **enum + webapp (paralelo) + cve**
- `enum`: content discovery nos 4 hosts de origem; JS Nuxt via wayback; enum mailboxes SmarterMail/Mailcow.
- `webapp`: validar XXE (requests-xml), ViewState deserialization, auth bypass/cred stuffing (SmarterMail/admin/Mailcow), registro+IDOR suppliers.
- `cve`: mapear CVEs das versões acima.
- `network`: SMTP enum/open-relay no mail3 e demais portas 25.
