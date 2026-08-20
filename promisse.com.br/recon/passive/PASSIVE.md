# Reconn Passive + OSINT — promisse.com.br

**Data:** 2026-08-20T05:30 UTC  
**Alvo:** promisse.com.br (PromissePay)  
**Classificação:** Gateway de Pagamentos Brasileira (PIX, boleto, cartão)  
**Infra:** Vercel (hosting) + Cloudflare (DNS/WAF) + GoDaddy (registro)

---

## 1. DNS Enumeration

### Name Servers
| NS | IPs |
|---|---|
| `anuj.ns.cloudflare.com` | 173.245.59.65, 108.162.193.65, 172.64.33.65 |
| `jean.ns.cloudflare.com` | 173.245.58.121, 108.162.192.121, 172.64.32.121 |

**Bind Version:** 2026.8.0 (Cloudflare)

### A Records (apex)
- `216.150.16.129` (Vercel)
- `216.150.1.129` (Vercel)

### Wildcard DNS Detection
Wildcard resolution ativo: subdomínios não-cadastrados resolvem para `104.21.20.114` / `172.67.192.97` (Cloudflare proxy).

### Subdomínios Únicos (Não-Wildcard)

| Subdomínio | Tipo | Resolve para | Tech |
|---|---|---|---|
| `www.promisse.com.br` | CNAME | `aa642ab3368865f0.vercel-dns-017.com` → 216.150.1.65, 216.150.16.65 | Vercel |
| `api.promisse.com.br` | A | 104.21.20.114, 172.67.192.97 (Cloudflare) | Next.js API |
| `status.promisse.com.br` | CNAME | `d5fa15b69abe5cff.vercel-dns-016.com` → 216.150.16.1, 216.150.1.1 | Vercel |

### Subdomínios Wildcard (Cloudflare proxy - potencialmente roteados)
admin, app, backup, beta, billing, blog, broker, calendar, cdn, cloud, dashboard, data, dev, docs, exchange, files, gateway, git, helpdesk, imap, intranet, mail, monitor, mx, ns1-ns4, owa, payments, pop, portal, remote, sharepoint, smtp, ssh, staging, support, test, vpn, web, wiki

### Outros Registros
| Tipo | Valor |
|---|---|
| TXT | `google-site-verification=u_0LFq_a6ZeVYLPA6P79n8raowcrQ9FC5Se26LxAAC0` |
| SOA | `anuj.ns.cloudflare.com. dns.cloudflare.com. 2411572320 10000 2400 604800 1800` |
| MX | Nenhum |
| AAAA | Nenhum |
| CNAME (apex) | Nenhum |

---

## 2. Certificate Transparency (CRT.sh)

**Status:** 502 Bad Gateway do CRT.sh (nginx). O rate limiting do CRT.sh impediu a consulta ao vivo.  

**Subdomínios conhecidos via CRT:**
- N/A (consulta falhou)

---

## 3. Wayback Machine / Historical Data

**Status:** Nenhum resultado. O domínio `promisse.com.br` foi registrado em **2025-12-05**, portanto é muito recente para ter histórico no Wayback Machine ou gau/waybackurls.

---

## 4. Tech Stack Fingerprinting

| Camada | Tecnologia | Versão/Detalhes |
|---|---|---|
| **Framework** | Next.js (App Router, RSC) | `/_next/static/chunks/*.js` (Turbopack chunks) |
| **Hosting** | Vercel | Headers: `x-vercel-id`, `x-vercel-cache`, `x-nextjs-prerender`, `server: Vercel` |
| **DNS/WAF** | Cloudflare | NS: `*.ns.cloudflare.com`, Bind 2026.8.0 |
| **CDN** | Cloudflare + Vercel Edge | Dual front |
| **Linguagem** | TypeScript / JavaScript | Next.js chunks |
| **CSS** | Tailwind CSS | Classes: `font-sans antialiased` |
| **UI Framework** | Radix UI / Tailwind Components | Inferido de estrutura |
| **Captcha** | Google reCAPTCHA Enterprise | Site Key: `6LffCt4sAAAAAI5Ft_mB-V4SVxdggrUMFnPGNeqa` |
| **Google** | reCAPTCHA, Search Console | TXT verification, recaptcha/enterprise.js |
| **HSTS** | Ativo | `max-age=63072000` |
| **CORS** | Permissivo (api subdomain) | `Access-Control-Allow-Origin: *` com credenciais |

### Headers de Segurança HTTP (promisse.com.br)
- Strict-Transport-Security: max-age=63072000
- Access-Control-Allow-Origin: *
- X-Matched-Path: presente
- X-Vercel-Cache: presente
- X-Vercel-Id: presente

### Stack da API (api.promisse.com.br)
- CORS: `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Headers: Authorization, App, Content-Type`
- `Access-Control-Allow-Methods: OPTIONS, GET, POST, PUT, PATCH, DELETE`
- `Server: cloudflare`

**Risco:** CORS permissivo com credenciais habilitado no endpoint da API.

---

## 5. OSINT — Emails, Pessoas, Vazamentos

### Pessoas Identificadas
| Nome | Papel | Fonte |
|---|---|---|
| **Joãozinho Figueiredo Neves** | Owner / Registrant | Whois Registro.br |
| **João Pedro Figueiredo Neves** | Tech Contact | Whois Registro.br |

### Mídias Sociais
- Twitter: `@promissepay`
- Site: `https://promisse.com.br`

### Emails
- **Nenhum email encontrado** via theHarvester (engines: bing, linkedin, yahoo, baidu, crtsh - todos falharam ou retornaram vazio)
- Sugere-se pesquisa adicional em redes sociais e Google dorks

### Vazamentos (HaveIBeenPwned / IntelX)
- API rate-limited. Recomenda-se consulta manual.

---

## 6. Buckets / Cloud Storage

### Buckets S3 Testados (28 variações)

| Bucket | Status |
|---|---|
| `promisse.com.br` | 000 (erro DNS via Tor) |
| `promisse-backup` | 404 |
| `promisse-app` | 404 |
| `promisse-api` | 404 |
| `promisse-data` | 404 |
| `promisse-dev` | 404 |
| `promisse-prod` | 404 |
| `promisse-staging` | 404 |
| `promisse-assets` | 404 |
| `promisse-files` | 404 |
| `promisse-media` | 404 |
| `promisse-static` | 404 |
| `promisse-www` | 404 |
| `promisse-payments` | 404 |
| `promisse-logs` | 404 |
| `promisse-config` | 404 |
| `promisse-cdn` | 404 |
| `promisse-dashboard` | 404 |
| `promisse-billing` | 404 |
| `promisse-monitor` | 404 |
| `promisse-backups` | 404 |
| `promisse-tfstate` | 404 |
| `promisse-secrets` | 404 |
| `promisse` | 404 |

**Nenhum bucket público aberto encontrado.** O bucket `promisse.com.br` apresentou erro de resolução DNS (provavelmente devido ao Tor).

---

## 7. Subdomain Takeover Check

| Subdomínio | CNAME | Resolve | Takeover? |
|---|---|---|---|
| `www.promisse.com.br` | `aa642ab3368865f0.vercel-dns-017.com` | Sim (216.150.1.65) | Não |
| `status.promisse.com.br` | `d5fa15b69abe5cff.vercel-dns-016.com` | Sim (216.150.1.1) | Não |

**Nenhum candidato a takeover encontrado.** Todos os CNAMEs Vercel resolvem ativamente.

---

## 8. Whois / Registro

```
domain:      promisse.com.br
owner:       Joãozinho Figueiredo Neves
created:     20251205 #30556959
changed:     20251208
expires:     20261205
status:      published
provider:    GODADDY (86)
nserver:     anuj.ns.cloudflare.com
nserver:     jean.ns.cloudflare.com
```

---

## 9. Informações do Aplicativo

- **Nome:** PromissePay (Promisse Pay)
- **Tipo:** Gateway de Pagamentos
- **Métodos:** PIX, boleto, cartão de crédito
- **Funcionalidades:** Cobranças PIX com QR Code, saques para qualquer chave, consulta de saldo, infrações do MED, webhooks assinados
- **SDKs/Exemplos:** cURL, Node.js, Python, PHP
- **Público-alvo:** Brasil

---

## 10. Achados Relevantes para Ataque

### 🔴 ALTA PRIORIDADE

| # | Achado | Detalhe | Payoff |
|---|---|---|---|
| 1 | **API endpoint** | `api.promisse.com.br` com CORS permissivo (`*` + credentials). Métodos: GET, POST, PUT, PATCH, DELETE. Headers: `Authorization`, `App`, `Content-Type` | Explorar endpoints da API, testar IDOR/BOLA, autenticação |
| 2 | **docs endpoint** | `/docs` contém documentação detalhada da API incluindo endpoints PIX, saques, webhooks. Possível vazamento de spec | Mapear API surface |
| 3 | **Google reCAPTCHA Enterprise Key** | `6LffCt4sAAAAAI5Ft_mB-V4SVxdggrUMFnPGNeqa` (exposta no HTML) | Pode ser usada para bypass em outros sites que usam a mesma chave (ataque cross-site) |
| 4 | **Subdomínio status** | `status.promisse.com.br` (Vercel, retorna 404) | Verificar se há página de status interna |
| 5 | **www redireciona 307** | `www.promisse.com.br` → `promisse.com.br` com 307 | Possível manipulação de redirect |

### 🟡 MÉDIA PRIORIDADE

| # | Achado | Detalhe |
|---|---|---|
| 6 | **Wildcard DNS** | Todos subdomínios não-registrados resolvem para Cloudflare. Dificulta enumeração, mas também indica configuração preguiçosa |
| 7 | **Tecnologias** | Next.js (versões específicas nos chunks), Turbopack, Tailwind CSS, Radix UI |
| 8 | **Domínio novo** | Registrado 2025-12-05, expira 2026-12-05. Pouco histórico, pode ter sido transferido/apressado |
| 9 | **Vercel + Cloudflare** | Dual CDN — investigar bypass de WAF via IP real do Vercel |
| 10 | **Pessoas** | Joãozinho Figueiredo Neves e João Pedro Figueiredo Neves — possíveis alvos para engenharia social |

### 🟢 BAIXA PRIORIDADE

| # | Achado |
|---|---|
| 11 | HSTS ativo (mitiga SSL stripping) |
| 12 | Nenhum bucket S3 aberto |
| 13 | Nenhum takeover possível |
| 14 | Nenhum MX — sem ataque de email spoofing via SPF/DMARC |

---

## 11. Próximos Passos (Recon Active)

1. **Port scan** nos IPs reais: `216.150.16.129`, `216.150.1.129`, `216.150.1.65`, `216.150.16.65` (Vercel) e `104.21.20.114`, `172.67.192.97` (Cloudflare)
2. **Descobrir IP real** atrás do Cloudflare (bypass CDN)
3. **Fuzz** subdomínios e endpoints no domínio principal e api subdomínio
4. **Análise JS** dos chunks do Next.js (`/_next/static/chunks/`) para endpoints e chaves
5. **WAF detection** com wafw00f
6. **Testar API** endpoints documentados: cobranças PIX, saques, saldo, webhooks
7. **Verificar vazamentos** em HaveIBeenPwned (emails dos owners)
8. **Pesquisar GitHub** por `promissepay`, `promisse.com.br`, `joaozinho figueiredo`

---

## Arquivos Gerados

| Arquivo | Caminho |
|---|---|
| **PASSIVE.md** (este) | `recon/passive/PASSIVE.md` |
| Subdomínios brutos | `recon/passive/subdomains_raw.txt` |
| CRT.sh output | `recon/passive/crtsh_output.txt` |
| Wayback URLs | `recon/passive/wayback_urls.txt` |
| Tech stack | `recon/passive/tech_stack.txt` |
| OSINT emails | `recon/passive/osint_emails.txt` |
| Cloud buckets | `recon/passive/cloud_buckets.txt` |
| Takeover candidates | `recon/passive/takeover_candidates.txt` |
| Whois | `recon/passive/whois.txt` |
| Subfinder output | `recon/passive/subfinder_out.txt` |
| Assetfinder output | `recon/passive/assetfinder_out.txt` |
| Dnsrecon output | `recon/passive/dnsrecon_std.txt` |
| Dig subdomains | `recon/passive/dig_subdomains.txt` |
| gau URLs | `recon/passive/gau_urls.txt` |
| Wayback CDX | `recon/passive/wayback_cdx.txt` |
| theHarvester | `recon/passive/theharvester_out.txt` |
| CRT.sh parsed | `recon/passive/crtsh_parsed.txt` |
| CRT.sh domains | `recon/passive/crtsh_domains.txt` |