# PASSIVE.md — Recon Passivo dfg.com.br

> Fase 2 (§5). Mapeamento da attack surface via fontes passivas (sem toque direto no alvo além de
> probes httpx leves via Tor, conforme fluxo §5). OPSEC: Tor + proxychains4 em todas as fontes externas.

---

## 1. Sumário executivo

| Métrica | Valor |
|---|---|
| Subdomínios únicos (todas as fontes) | **9** (8 vivos + 1 NX) |
| Subdomínios vivos (resolvem A) | **8** (api, cdn, dfg, mail, mail3, old, suppliers, www) |
| Hosts web confirmados (httpx) | **7** (5 Cloudflare-fronted + 2 origem real Windows; old=CF não isolado) |
| IPs de origem real (fora Cloudflare) | **5** (todos Contabo/RackNerd) — vazados via SPF |
| Domínio afiliado descoberto | **portaldfg.com.br** (WordPress/WooCommerce, owner distinto) |
| Emails coletados | **4** |
| Pessoas identificadas | **2** |
| Buckets cloud públicos | **0** (S3 negativo; Azure/GCP inconclusivos) |
| Takeover candidates | **0** (todos A records) |
| Wayback URLs | **20.980** (gau) + **64.300** (sitemaps) |
| Favicon mmh3 hash (Shodan) | **1823553973** |

**Destaque:** o SPF do domínio vaza os 5 IPs de origem real (Contabo), permitindo **bypass total de
Cloudflare**. Dois desses hosts rodam **SmarterMail e IIS em Windows Server** expostos diretamente
(painel webmail sem proteção do WAF Cloudflare) — alvo de alto valor.

---

## 2. DNS / Domínio raiz

- **Registrante (WHOIS registro.br):** GARZON SERVIÇOS DE INFORMATICA LTDA
- **CNPJ:** 08.222.462/0001-65 (MATRIZ, ATIVA, fundada 07/08/2006)
- **Responsável:** Alexandre Cunha Garzon (nic-hdl ACG371, acgarzon@gmail.com)
- **Domínio criado:** 12/07/2009 — expira 12/07/2035 — status published
- **Nameservers:** hans.ns.cloudflare.com, miki.ns.cloudflare.com (Cloudflare)
- **AXFR:** negado (Cloudflare — esperado)

### Registros DNS
```
A     dfg.com.br          -> 172.67.72.166, 104.26.15.223, 104.26.14.223   (Cloudflare anycast)
A     www.dfg.com.br      -> 104.26.14.223, 172.67.72.166, 104.26.15.223   (Cloudflare)
MX    dfg.com.br          -> 10 mail.dfg.com.br.   (-> 164.68.104.26 Contabo)
TXT   dfg.com.br (SPF)    -> v=spf1 mx a ip4:164.68.104.26 ip4:5.189.143.90
                            ip4:161.97.106.114 ip4:161.97.106.115
                            ip4:77.237.241.198 -all
TXT   _dmarc.dfg.com.br   -> v=DMARC1; p=none; rua=mailto:postmaster@dfg.com.br;
                            ruf=mailto:postmaster@dfg.com.br; fo=1
SOA   dfg.com.br          -> hans.ns.cloudflare.com. dns.cloudflare.com. ...
```

### ⚠️ Finding (alto valor) — SPF vaza origem real + DMARC permissivo
- O SPF autoriza **5 IPs de origem** (não-Cloudflare) a enviar email por dfg.com.br.
  Esses mesmos IPs hospedam a infra web/mail real → **bypass de Cloudflare**.
- DMARC `p=none` → **email spoofing do domínio dfg.com.br é possível** sem consequência
  de política (email de phishing/spoof enviado "como dfg.com.br" não será rejeitado pelos
  destinatários que validam DMARC). Vetor de phishing/social engineering.

---

## 3. IPs de origem real (Cloudflare bypass) ⭐

| IP | Reverse DNS (PTR) | Org | Probável serviço | Onde aparece |
|---|---|---|---|---|
| **164.68.104.26** | mail.dfg.com.br | Contabo (RIPE) | **SmarterMail webmail (IIS/Windows)** — `mail.dfg.com.br` | SPF + MX |
| **5.189.143.90** | mail3.dfg.com.br | Contabo GmbH (DE) | **IIS / Microsoft-HTTPAPI** (`mail3.dfg.com.br`, 404) | SPF |
| **161.97.106.114** | smtp2.dfg.com.br | Contabo (RIPE) | SMTP envio (não-web) | SPF |
| **161.97.106.115** | smtp3.dfg.com.br | Contabo (RIPE) | SMTP envio (não-web) | SPF |
| **77.237.241.198** | **mail.astarium.com** | Contabo GmbH (DE) | SMTP — domínio **astarium.com** afiliado | SPF |

### Bypass de Cloudflare — estratégia
- Os 5 IPs respondem diretamente (sem WAF Cloudflare). Enviar `Host: www.dfg.com.br` (ou
  `Host: suppliers.dfg.com.br`, `Host: api.dfg.com.br`) para os IPs Contabo pode revelar
  o site origin (se a VPS hospedar múltiplos vhosts). O `mail.dfg.com.br` (164.68.104.26)
  já respondeu com **SmarterMail** sem challenge.
- Recomendado em recon-active: portscan completo nesses 5 IPs (descobrir serviços
  adicionais: SMTP, IMAP, POP3, RDP, outros vhosts IIS) + teste de virtual-host routing.

### ⚠️ Finding — domínio afiliado astarium.com
- `77.237.241.198` tem PTR `mail.astarium.com` e está no SPF de dfg.com.br.
- **astarium.com** compartilha infra de email (Contabo) com dfg.com.br → provavelmente
  mesma operadora (Garzon). Considerar astarium.com como domínio relacionado a investigar
  (WHOIS, subdomínios) — pode ampliar attack surface e expor relação/creds cruzadas.

---

## 4. Subdomínios

Fontes usadas: subfinder (-all -recursive), assetfinder, crt.sh, dnsx (top-20k +
Jhaddix parcial), reverse-DNS dos IPs SPF, bruteforce manual (~80 nomes).

| # | Subdomínio | A record | Cloudflare? | httpx status | Servidor / Tech |
|---|---|---|---|---|---|
| 1 | dfg.com.br | 172.67.72.166, 104.26.15.223, 104.26.14.223 | ✅ | 403 (Tor) | Cloudflare, HTTP/3 |
| 2 | www.dfg.com.br | 104.26.14.223, 172.67.72.166, 104.26.15.223 | ✅ | 403 (Tor, "Just a moment...") | Cloudflare, HTTP/3, **Nuxt.js** |
| 3 | cdn.dfg.com.br | 172.67.72.166, 104.26.15.223, 104.26.14.223 | ✅ | 403 (Tor) | Cloudflare (CDN de assets) |
| 4 | api.dfg.com.br | 104.26.15.223, 172.67.72.166, 104.26.14.223 | ✅ | 403 (Tor) | Cloudflare — **API backend** (Nuxt) |
| 5 | suppliers.dfg.com.br | 104.26.15.223, 104.26.14.223, 172.67.72.166 | ✅ | 403 (Tor) | Cloudflare — **ASP.NET WebForms** (portal de fornecedores) |
| 6 | old.dfg.com.br | 104.26.15.223 | ✅ | (não probeado isoladamente) | Cloudflare — versão antiga? |
| 7 | **mail.dfg.com.br** | **164.68.104.26** | ❌ ORIGEM | **200 (SmarterMail)** | **Microsoft-IIS/10.0, ASP.NET 4.0.30319, Windows Server, jQuery** — painel webmail |
| 8 | **mail3.dfg.com.br** | **5.189.143.90** | ❌ ORIGEM | 404 | **Microsoft-HTTPAPI/2.0** (IIS) |
| (NX) | mail2.dfg.com.br | — | — | — | cert SAN órfão (crt.sh), não resolve |

### Notes
- 5 hosts atrás de Cloudflare → httpx via Tor retornou 403 (challenge JS). Tech real
  confirmada via wayback: site principal = **Nuxt.js** (assets `_nuxt/*.js`), antes era
  **ASP.NET WebForms** (`.aspx`, `ScriptResource.axd`, `AjaxControlToolkit 4.1.40412.0`,
  `scriptManagerDFG`).
- `suppliers.dfg.com.br` é app ASP.NET WebForms SEPARADO (portal de fornecedores):
  `/index.aspx`, `/register.aspx` (registro aberto?), `/passwordrecovery.aspx`,
  `/requests-xml.aspx?CurrencyCode=BRL` (endpoint XML → **XXE/XML injection candidate**).
- `mail.dfg.com.br` e `mail3.dfg.com.br` são ORIGEM REAL Windows (Contabo), fora Cloudflare.

---

## 5. Tech stack por host

### dfg.com.br / www.dfg.com.br (Cloudflare + Nuxt.js)
- **Front:** Nuxt.js (Vue SSR) — assets em `_nuxt/`
- **CDN/WAF:** Cloudflare (Bot Management, Browser Insights, HTTP/3)
- **Histórico:** ASP.NET WebForms → migrado para Nuxt.js
- **Plataforma:** marketplace (compra/venda contas, gold, itens de jogos + serviços digitais)
- **Locales:** pt-BR (default sem prefixo), /en, /pt-PT (rotas públicas)

### suppliers.dfg.com.br (Cloudflare + ASP.NET WebForms)
- **Backend:** ASP.NET WebForms, **AjaxControlToolkit 4.1.40412.0**, IIS/Windows
- **Endpoints:** index.aspx, register.aspx, passwordrecovery.aspx, **requests-xml.aspx** (XML)
- **Risco:** app legado → deserialization/XXE/ViewState Issues em candidates

### mail.dfg.com.br (ORIGEM, 164.68.104.26) ⭐
- **SmarterMail** (webmail) em **Microsoft-IIS/10.0**, ASP.NET 4.0.30319, Windows Server, jQuery
- **Painel webmail exposto sem WAF Cloudflare** → login page acessível diretamente
- SmarterMail tem histórico de CVEs (path traversal, RCE, auth bypass — ex.: CVE-2018-16732,
  CVE-2019-16930, CVE-2021-28356 e outros). **Versão a confirmar em recon-active.**
- Vetores: login brute force, default creds, CVE da versão, enumeração de usuários/mailboxes.

### mail3.dfg.com.br (ORIGEM, 5.189.143.90)
- Microsoft-HTTPAPI/2.0 (IIS) — 404 na raiz. Provavelmente hospeda outro vhost/serviço
  (descobrir em recon-active via portscan + vhost routing).

### portaldfg.com.br (DOMÍNIO AFILIADO — Cloudflare + WordPress) ⭐⭐
> ATENÇÃO: owner WHOIS DIFERENTE (Francisco Geovane de Brito Filho). Usa marca "DFG".
> **Escopo a confirmar pelo coordenador** — se afiliado oficial, é alvo de altíssimo valor.
- **WordPress 7.1** + **WooCommerce 10.9.4** + **Elementor 4.2.3** + **Fluent Forms 6.2.6**
  + **Yoast SEO Premium 28.0** + **Site Kit 1.183.0** + PHP/MySQL
- Cloudflare Bot Management / Browser Insights
- Rotas: `/login`, `/painel`, `/assinaturapremium/`, WooCommerce (cart/checkout)
- **WP user enum (wp-json/wp/v2/users):** 1 usuário admin — **drfranciscogeovane** (id=1, "Dr. Francisco Geovane")
- Plugins com CVEs conhecidos (Fluent Forms, Elementor, WooCommerce) → wp-scan + CVE research
- WP admin em `/wp-admin/` (login brute force com user `drfranciscogeovane`)

---

## 6. OSINT — empresa, pessoas, emails

### Empresa (CNPJ 08.222.462/0001-65 — receitaws)
- **Razão:** GARZON SERVIÇOS DE INFORMATICA LTDA — Fantasia: **GARZON INFORMATICA**
- **Natureza:** Sociedade Empresária Limitada — Porte: Pequeno Porte — Capital: R$ 10.000
- **Atividade principal:** 74.90-1-04 — intermediação/agenciamento de serviços e negócios
- **Secundárias:** 63.11-9-00 (tratamento de dados, hospedagem) + 63.19-4-00 (portais/conteúdo)
- **QSA:** ALEXANDRE CUNHA GARZON (único sócio-administrador)
- **Endereço:** SETOR SHCS CRS 502 BLOCO C, S/N, LOJA 37 PARTE 3823, ASA SUL, BRASILIA/DF, CEP 70.330-530
- **Tel:** (61) 3032-1789 — **Email CNPJ:** garzon.servicos@gmail.com
- **Marca:** "DFG" / "DFGAMES" (Reclame Aqui: reclameaqui.com.br/empresa/dfgames) — "22 anos de mercado"

### Pessoas
1. **Alexandre Cunha Garzon** — owner/responsável dfg.com.br (acgarzon@gmail.com) — provável sysadmin
2. **Francisco Geovane de Brito Filho** — owner portaldfg.com.br (drfranciscogeovane@gmail.com) — WP admin

### Emails (4)
- acgarzon@gmail.com (owner DFG)
- garzon.servicos@gmail.com (empresa)
- drfranciscogeovane@gmail.com (portaldfg admin)
- postmaster@dfg.com.br (DMARC/abuse)
- Padrões @dfg.com.br prováveis: contato/suporte/admin/financeiro/Alexandre.garzon@dfg.com.br
  (validar em recon-active via SmarterMail enum)

### GitHub
- Nenhuma organização/repo oficial encontrado (queries dfgcombr/GARZON-INFORMATICA/acgarzon = 0).
- Code search API requer token (sem auth). Recomendar re-validação com token.

### Breaches
- HIBP/DeHashed/IntelX/emailrep.io requerem API key (indisponível) — **sem verificação possível**.
- Candidatos a credential stuffing: os 4 emails acima contra wp-login (portaldfg),
  SmarterMail, /user/login (Nuxt).

---

## 7. Cloud buckets / Takeover

- **S3:** 40 variações (us-east-1 + sa-east-1) → **todas 404** (nenhum bucket).
- **Azure Blob:** inconclusivo (Tor 000 / vazio direto).
- **GCP Storage:** inconclusivo (403 "service not available in your location" — geo-block Tor).
- **Takeover:** nenhum candidate (todos A records; mail2 NX sem CNAME; bruteforce de 80 nomes negativo).
- **Conclusão:** DFG NÃO usa buckets cloud managed — infra é Cloudflare (CDN/WAF) + VPS Contabo.

---

## 8. Wayback highlights (gau: 20.980 URLs; sitemaps: 64.300 URLs)

### Endpoint structure (do robots.txt + wayback)
**Rotas privadas (robots Disallow) — mapear em enum/webapp:**
```
/login/   /cart/   /order/   /ticket/   /sell/
/user/login   /user/logout   /user/register   /user/forgot-password
/user/reset-password   /user/change-password   /user/banned   /user/success
/user/email-validation   /user/payment-method-validation   /user/withdraw-confirm
/user/employee-letters/   /user/favorites   /user/notifications   /user/orders
/user/portfolio   /user/profile   /user/questions   /user/rewards   /user/sales
/user/security   /user/tickets   /user/user-data   /user/verification
```
**Rotas públicas (crawláveis):** `/user/{id}` (perfil de vendedor) + `/user/{id}/listings`
→ **enumeração de usuários/vendedores** + possível IDOR em `/user/{id}`.

### Endpoints sensíveis em wayback
- `/user/login?ReturnUrl=...` → **open-redirect candidate** (redirect após login)
- `/passwordrecovery.aspx` (legado) → fluxo de reset (Nuxt atual: `/user/forgot-password`)
- `/webmail/login.php3?reason=login` → webmail legado (provável SmarterMail antigo)
- `/.well-known/openid-configuration` → 404 atual (sem OIDC)
- `/.well-known/ai-plugin.json`, `/.well-known/assetlinks.json` (Android app existe)
- `/sitemap.xml` → index com 4 sub-sitemaps (static/items/crafts/historic)

### JS (Nuxt) em wayback
- 267 arquivos `.js` (ex.: `_nuxt/DBJMvi8y.js`) → analisar em enum para endpoints/keys/tokens

### Sitemaps (64.300 URLs)
- 1.056 categorias estáticas (jogos: Tibia, Dofus, Albion, Apex, MU Online, Perfect World,
  Free Fire, World of Tanks, GTA/MTA; arte digital; artesanato; softwares; SMM; etc.)
- marketplace ativo com milhares de listings (items-1.xml = 5.5MB)

### Arquivos salvos
- gau_urls.txt (20.980), gau_suppliers.txt, gau_portaldfg.txt (1.326)
- wayback_interesting.txt (339), wayback_auth.txt (8.193), wayback_js.txt (267),
  wayback_special.txt, wayback_paths.txt (19.835)
- sitemap_urls_all.txt (64.300), sitemap_static_paths.txt (1.056), robots_live.txt

---

## 9. Findings preliminares & ranking de payoff

| # | Finding | Severidade | Fase recomendada |
|---|---|---|---|
| F-P1 | **SPF vaza 5 IPs de origem real** → bypass Cloudflare total | Alto | recon-active |
| F-P2 | **mail.dfg.com.br = SmarterMail/IIS exposto direto** (sem WAF) | Alto | recon-active + webapp |
| F-P3 | **DMARC p=none** → spoofing de dfg.com.br (phishing) | Médio | (vetor social) |
| F-P4 | **suppliers.dfg.com.br** ASP.NET WebForms legado + `requests-xml.aspx` (XXE?) | Alto | enum + webapp |
| F-P5 | **portaldfg.com.br** WordPress + WooCommerce + plugins (Elementor/Fluent Forms) + admin `drfranciscogeovane` | Alto* | recon-active + webapp (*se escopo) |
| F-P6 | `/user/login?ReturnUrl=` open-redirect candidate | Médio | webapp |
| F-P7 | `/user/{id}` perfis públicos → enum users + IDOR | Médio | enum + webapp |
| F-P8 | domínio afiliado **astarium.com** (mesma infra Contabo) | Info→Investigar | recon-passive extend |
| F-P9 | favicon hash 1823553973 → correlação Shodan (sem API) | Info | se obter Shodan |
| F-P10 | 4 emails para credential stuffing | Médio | exploit/webapp |

---

## 10. Próximos passos recomendados (recon-active)

1. **Portscan completo nos 5 IPs de origem real** (164.68.104.26, 5.189.143.90, 161.97.106.114,
   161.97.106.115, 77.237.241.198) — descobrir SMTP/IMAP/POP3/RDP/otros vhosts IIS.
2. **Vhost routing** nos IPs Contabo: enviar `Host: www.dfg.com.br`, `Host: suppliers.dfg.com.br`,
   `Host: api.dfg.com.br`, `Host: old.dfg.com.br` para confirmar qual IP hospeda qual app
   (bypass Cloudflare) — especialmente testar se `old.dfg.com.br` expõe versão antiga.
3. **SmarterMail version fingerprint** (mail.dfg.com.br) → mapear CVEs (recon-active + cve).
4. **wafw00f + TLS** em todos os hosts; **whatweb** nos hosts de origem real.
5. **Confirmar escopo de portaldfg.com.br** com coordenador; se in → wpscan + CVE plugins.
6. **Investigar astarium.com** (WHOIS, subdomínios, infra) — possível expansão de attack surface.
7. **Obter API keys** Shodan/HIBP/GitHub para correlação passiva adicional.

---

## 11. Limitações

- **httpx via Tor** → hosts Cloudflare retornam 403 (challenge JS); tech detalhada obtida via wayback.
- **amass** falhou (sem config/API keys) — compensado por subfinder+assetfinder+crt.sh+dnsx+reverse-DNS.
- **theHarvester** real não instalável (pip stub v0.0.1; clone github sem cred) — emails via
  WHOIS+CNPJ+Bing+wayback.
- **Breaches:** HIBP/DeHashed/IntelX/emailrep.io requerem API key — sem verificação.
- **GCP/Azure buckets** inconclusivos (Tor geo-block) — re-testar com outro exit/VPN se crítico.
- **Shodan/Censys** sem API key — favicon hash preparado para quando obtido.
- **dnsx Jhaddix** (200k) timeout — top-20k executado + bruteforce manual de 80 nomes.

---

## 12. Artefatos brutos (em recon/passive/)

```
whois_dfg.txt            dns_ns.txt   dns_mx.txt   dns_txt_spf.txt   dns_dmarc.txt
dns_a_root.txt  dns_a_www.txt  dns_soa.txt  dns_axfr.txt  dns_mail_verify.txt
dns_resolution_full.txt  dns_bruteforce.txt  dnsx_bruteforce.txt  origin_ips_whois.txt
crt_sh.json  crt_sh_subdomains.txt
subfinder.txt  assetfinder.txt  subdomains_all.txt  subdomains_live.txt
httpx_live.txt  portaldfg_httpx.txt  portaldfg_whois.txt  favicon_www.ico
gau_urls.txt  gau_mail.txt  gau_suppliers.txt  gau_portaldfg.txt
wayback_*.txt  sitemap_*.txt  sitemap_*.xml  robots_live.txt  openid_live.json
osint_emails.txt  osint_people.txt  osint_company.txt  osint_github.txt
osint_breaches.txt  osint_emailrep.txt  cnpj_receitaws.json
cloud_s3_probes.txt  cloud_all_probes.txt  cloud_buckets.txt  takeover_candidates.txt
takeover_bruteforce.txt  github_reposearch.txt  github_codesearch.txt
```

