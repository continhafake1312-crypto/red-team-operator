# PASSIVE.md — Recon Passivo + OSINT — centraldeconcursos.com.br

> Fase 2 do framework (§5). Engajamento black-box Web/API + serviços expostos.
> Data: 2026-08-27. Especialista: recon-passive (+ subagente osint).
> OPSEC: Tor + proxychains4 em todos os requests ao alvo (IP saída 45.66.35.28).

---

## 1. Resumo executivo

Mapeei a superfície de ataque passiva do alvo `centraldeconcursos.com.br`
de forma exaustiva, combinando 4 fontes de subdomínios, resolução DNS,
fingerprint HTTP de 54 hosts, wayback (50.418 URLs únicas), OSINT de
empresa/pessoas/emails/GitHub, e caça a buckets cloud + takeover.

**Alvo real (apex + www + subdomínios Cloudflare-fronted):** aplicação
**Nuxt.js (Vue.js/Node.js)** migrada do legado ASP Classic (4.972 paths
.asp no wayback) + .NET WebForms (carrinho `.aspx`), servida via
**Cloudflare** (WAF/CDN). Backend da plataforma é um **API Express
multi-tenant hospedado em Render** (`api.centraldeconcursos.com.br`),
parte do **LMS white-label "Seducar"** (CNPJ 53.979.887/0001-78, dono
Gabriel Moraes). Vários subdomínios do alvo rodam instâncias Seducar em
**Vercel** (crm, dashboard, homolog, questoes, pagamento, staging).

**Empresa alvo:** EDITORA CENTRAL DE CONCURSOS LTDA — CNPJ
**61.632.659/0001-55** (SP/República). Novo sócio-administrador
**Igor Muniz Paez Velazquez** entrou em **2025-06-04** (provável
aquisição recente — investigar histórico societário).

**Relação cross-tenant:** o subdomínio `concursos.centraldeconcursos.com.br`
redireciona para `degraucultural.com.br` (concorrente/parceiro, outro
cliente Seducar — família Martins, CNPJ 28.060.747/0001-54), e o
`nuxt.config` do staging do alvo vaza
`appDomain=homolog.degraucultural.com.br` — **candidato a IDOR/BOLA
cross-tenant** no backend Seducar multi-tenant (validar em Fase 5/6).

**Hosts de alto valor identificados (para recon ativo):**
1. `webmail/mail/pda/pop.centraldeconcursos.com.br` → **Exchange OWA
   on-prem exposto** (`/owa/`) atrás de Cloudflare — cred-stuffing +
   CVE (ProxyShell/ProxyNotShell) + enumeração ativa de versão.
2. `api.centraldeconcursos.com.br` / `api-hml.*` → backend Express
   multi-tenant (Render) com `/health` exposto (info disclosure) e
   `{"error":"Escola não encontrada"}` na raiz → **IDOR/BOLA
   cross-tenant** (testar contexto de tenant Degrau/Central).
3. `crm/crm-hml/dashboard/homolog/staging/questoes/pagamento.*` →
   painéis Seducar (Vercel, Nuxt.js) — auth bypass, IDOR de tenant,
   enumeração de rotas via `_buildManifest.js`.
4. `centraldeconcursos.com.br` (apex) + `blog/ead/loja/noticias/presencial` →
   Nuxt.js principal (área do aluno, carrinho) — enumeração profunda.
5. `demo.centraldeconcursos.com.br` → 500 Server Error (debug/erro
   exposto atrás de Cloudflare) — investigar.

### Contagem rápida
| Métrica | Valor |
|---|---|
| Subdomínios únicos (4 fontes + dedup) | **54** |
| Hosts vivos (httpx 200/3xx/4xx/5xx) | **44** |
| Hosts com 200 OK (aplicações ativas) | **10** |
| IPs de origem real (não-Cloudflare) | **13** distintos |
| Emails confirmados (domínio alvo) | **7** (+ 6 inferidos) |
| Pessoas mapeadas | **8** |
| Orgs GitHub | **4** (Seducar, Seducar-EAD, Seducar-V3, maisquestoes) |
| Breaches confirmados | **0** (sem API HIBP/DeHashed) |
| URLs wayback+gau únicas | **50.418** |
| Paths únicos (wayback) | **30.343** |
| Arquivos JS (wayback) | **1.958** |
| Buckets cloud confirmados existentes | **6** (4 GCP + 2 Azure) |
| Takeover confirmado (NXDOMAIN dangling) | **0** (subjack = falso positivo) |

---

## 2. DNS completo

(`dns_full.txt`, `dnsx_resolved.{json,txt}`, `crt.json`)

- **NS:** `johnny.ns.cloudflare.com`, `paloma.ns.cloudflare.com` (Cloudflare)
- **MX:** `antispam04.pensomail.com.br` (Pensomail — antispam/SMTP brasileiro)
- **A (apex):** `104.26.2.50`, `104.26.3.50`, `172.67.73.3` (Cloudflare)
- **AAAA:** `2606:4700:20::681a:232`, `...:332`, `...:ac43:4903` (Cloudflare)
- **TXT/SPF:** `include:censpf.centraldeconcursos.com.br`,
  `spf.maiex13.com.br`, `_spf.rdstation.com.br`, `spf.plugcrm.net`,
  `mailgun.org`, `spf.ecentry.io` → RD Station, PlugCRM, Mailgun, ecentry
- **DKIM:** `default._domainkey` (RSA 1024 ativo)
- **DMARC:** `v=DMARC1; p=none` — **PERMISSIVO** (não enforce → spoofable)
- **Verificações:** Facebook (`nyeen5kck4udcoejw5oc5b3c0vsf2p`),
  Google (`zhdyUs1k...`, `t-fIP9Hk...`), Microsoft
  (`MS=4AA3A3DA7A50639FFBDCDE1B4C000212F61366E3`)
- **AXFR:** negado em ambos os NS Cloudflare (esperado).

### IPs de origem real (fora Cloudflare) — para bypass CDN em recon ativo
| IP | Hosts |
|---|---|
| `3.132.6.138` (AWS) | cenlink, censpf (→ dnzdns.com) |
| `3.133.227.151` (AWS) | cenimage, landingpage (→ dnzdns.com) |
| `34.68.161.129` (GCP) | concurso, mkt (→ RD Station) |
| `34.151.202.32` (GCP) | gtm (Google Tag Manager Server) |
| `216.150.1.1 / 216.150.16.1` | crm-hml, demo.concursos (Vercel) |
| `216.150.1.65 / 216.150.16.65` | crm, staging (Vercel) |
| `216.150.1.129 / 216.150.16.129` | concursos, staging (Vercel) |
| `216.150.1.193 / 216.150.16.193` | questoes, homolog.questoes (Vercel) |
| `66.33.60.34/66/193`, `76.76.21.142/164` | dashboard, homolog, pagamento (Vercel) |
| `13.110.196.1/200.1/204.16` | click.email/cloud.email/view.email (Salesforce MC) |
| `23.73.208.64`, `2.19.10.207/218` | image.email (Akamai/edgekey) |
| `104.17.94.19/95.19` | load.gtm (Stape.io via Cloudflare) |
| `200.219.219.142` | (registro amass — investigar) |

> **Nota:** os IPs Vercel (`216.150.x`, `66.33.60.x`, `76.76.21.x`) são
> compartilhados/edge — não permitem bypass CDN útil. Os AWS/GCP
> (`3.x`, `34.x`) são do dnzdns/RD Station — terceiros, fora de escopo
> para bypass. O Exchange OWA (mail/pda/pop/webmail → `/owa/`) é
> roteado via Cloudflare (proxy on) — descobrir IP real do Exchange em
> recon ativo (histórico DNS, Censys, Shodan por favicon/hash de OWA).

---

## 3. Subdomínios vivos — tabela completa

(`subdomains_live.txt`, `httpx_live.json`)

Legenda: HOST | STATUS | TITLE | SERVER | TECH | LOCATION | CNAME

| Host | St | Title | Srv | Tech | CNAME/Note |
|---|---|---|---|---|---|
| `antispam.*` | 200 | - | cloudflare | CF,CFBI,HSTS,HTTP/3 | antispam gate |
| `api.*` | 401 | - | cloudflare | CF,HSTS,HTTP/3,Render | Express multi-tenant — `{"error":"Escola não encontrada"}` |
| `api-hml.*` | 401 | - | cloudflare | CF,HSTS,HTTP/3,Render | HML do API |
| `blog.*` | 301 | 301 Moved | cloudflare | CF,CFBI,HTTP/3 | → https |
| `cenimage.*` | 302 | - | - | HSTS | → apex (`dl.dnzdns.com`) |
| `cenlink.*` | 404 | - | - | HSTS | `lk.dnzdns.com` (Go 404) |
| `censpf.*` | 404 | - | - | HSTS | `centraldeconcursos.com.br.dnzdns.com` |
| `click.email.*` | 403 | 403 Forbidden | - | HSTS | Salesforce MC `click.s12.exacttarget.com` |
| `cloud.email.*` | 404 | - | - | - | `pub.s12.exacttarget.com` |
| `concurso.*` | 404 | - | - | HSTS | RD Station `pages.rdstation.com.br` (decommissioned) |
| `concursos.*` | 302 | - | Vercel | HSTS,Vercel | **→ `https://degraucultural.com.br/`** (cross-tenant!) |
| `crm.*` | 200 | **Seducar - CRM** | Vercel | HSTS,Vercel | `eb5cd3687017d8ee.vercel-dns-016.com` |
| `crm-hml.*` | 200 | **Seducar - CRM** | Vercel | HSTS,Vercel | HML do CRM |
| `dashboard.*` | 200 | **Seducar** | Vercel | HSTS,Vercel | `cname.vercel-dns.com` (30KB) |
| `demo.*` | 500 | Server error | cloudflare | CF,CFBI,HSTS,HTTP/3 | erro exposto — investigar |
| `demo.concursos.*` | 302 | - | Vercel | HSTS,Vercel | **→ `demo.degraucultural.com.br/`** |
| `ead.*` | 301 | 301 Moved | cloudflare | CF,CFBI,HTTP/2 | → https (área do aluno EAD) |
| `emkt.*` | 301 | - | cloudflare | CF,HSTS,HTTP/3,**PHP** | → `www.akna.com.br` (Akna) |
| `gtm.*` | 400 | - | - | - | Google GTM Server (GCP `34.151.202.32`) |
| `homolog.*` | 200 | **Seducar** | Vercel | HSTS,Vercel | HML Seducar |
| `homolog.questoes.*` | 200 | - | Vercel | HSTS,Node,Nuxt,Vercel,Vue | HML questões |
| `image.email.*` | 403 | Access Denied | AkamaiGHost | - | `edgekey.net` (email image) |
| `landingpage.*` | 302 | - | - | HSTS | → apex (`lp.dnzdns.com`) |
| `livraria.*` | 301 | 301 Moved | cloudflare | CF,CFBI,HTTP/3 | → https (livraria/loja) |
| `load.gtm.*` | 400 | - | cloudflare | CF,CF Bot Mgmt,HSTS,HTTP/3 | `lsam.stape.io` (Stape.io GTM) |
| `loja.*` | 301 | 301 Moved | cloudflare | CF,CFBI,HTTP/3 | → https (loja) |
| `mail.*` | 302 | - | cloudflare | CF,HSTS,HTTP/3 | **→ `/owa/` (Exchange on-prem!)** |
| `mkt.*` | 404 | - | - | HSTS | RD Station (decommissioned) |
| `mx1.*` / `mx2.*` | 301 | 301 Moved | cloudflare | CF,CFBI,HTTP/3 | → https |
| `noticias.*` | 301 | 301 Moved | cloudflare | CF,CFBI,HSTS,HTTP/3 | → `/noticias` (apex) |
| `pagamento.*` | 200 | - | Vercel | HSTS,Node,Nuxt,Vercel,Vue | **página de pagamento** (Seducar) |
| `passei.*` | 301 | 301 Moved | cloudflare | CF,CFBI,HTTP/3 | → https ("passei" = área do aluno) |
| `pda.*` | 302 | - | cloudflare | CF,HSTS,HTTP/3 | **→ `/owa/` (Exchange on-prem!)** |
| `pop.*` | 302 | - | cloudflare | CF,HSTS,HTTP/3 | **→ `/owa/` (Exchange on-prem!)** |
| `presencial.*` | 301 | 301 Moved | cloudflare | CF,CFBI,HTTP/3 | → https (presencial) |
| `questoes.*` | 200 | - | Vercel | HSTS,Node,Nuxt,Vercel,Vue | Seducar questões |
| `staging.*` | 200 | **Central de Concursos - Preparatório para concursos públicos** | Vercel | HSTS,Node,Nuxt,Vercel,Vue | STAGING (502KB) — vaza config Nuxt |
| `view.email.*` | 302 | Object moved | - | HSTS | Salesforce MC `view.s12.exacttarget.com` |
| `webmail.*` | 302 | - | cloudflare | CF,HSTS,HTTP/3 | **→ `/owa/` (Exchange on-prem!)** |
| `www.*` | 301 | 301 Moved | cloudflare | CF,CFBI,HSTS,HTTP/3 | → apex |
| `www.blog.*` / `www.ead.*` / `www.loja.*` / `www.presencial.*` / `www.demo.*` | 301 | - | cloudflare | CF,CFBI | → https variantes |

### Subdomínios NÃO vivos (10 — não resolveram HTTP)
`app`, `crm-html`, `demo.dashboard`, `demo2`, `image.email`(vive mas 403),
`lp1`, `materiais`, `noticias.email`(sem), `sys`, `ww`, `app` — marcar
para re-teste em recon ativo (alguns podem responder só HTTP/80 ou
terem registros apenas MX/TXT).

---

## 4. Tech stack (ver `tech_fingerprint.txt`)

- **Edge/CDN/WAF:** Cloudflare (apex + maioria). Akamai (image.email).
  Google CDN (gtm, RD Station).
- **App principal:** **Nuxt.js** (Vue.js + Node.js) — confirmado pelo
  JSON 404 Nuxt (`{"error":true,"url":...,"statusCode":404}`) e pelo
  `nuxt.config` vazado no staging. Legado ASP Classic (4.972 paths
  `.asp` no wayback) + .NET WebForms (`.aspx/.ashx` em `/Carrinho`).
- **Backend API:** Express on **Render** (`api.*` →
  `x-render-origin-server: Render`). Multi-tenant Seducar.
- **Favicon mmh3 hash:** `-458515647` (Shodan correlation pendente key).
- **Subdomínios Seducar:** Vercel (Nuxt.js + Vue.js + Node.js).
- **Email:** Salesforce MC (ExactTarget s12) + Pensomail (MX) +
  **Exchange OWA on-prem** (`/owa/` em mail/pda/pop/webmail) + Akna
  (emkt) + Mailgun (SPF).
- **CRM/Marketing:** RD Station, PlugCRM (SPF).
- **Analytics/Tag:** Google Tag Manager Server (Stape.io em load.gtm).
- **DNS/redirect:** dnzdns.com (privado, AWS) para cenimage/cenlink/
  censpf/landingpage.

---

## 5. OSINT — empresa, pessoas, emails, GitHub

(`osint_company.txt`, `osint_emails.txt`, `osint_people.txt`,
`osint_github.txt`, `osint_breaches.txt` — gerados pelo subagente
`osint` via BrasilAPI/Receita + homepage + GitHub API + DuckDuckGo.)

### Empresa alvo
- **EDITORA CENTRAL DE CONCURSOS LTDA** — CNPJ **61.632.659/0001-55**
- Endereço: Barão de Itapetininga 163, andares 5/6, República,
  São Paulo/SP, CEP 01042-001
- Tels: (11) 3017-8852 / 3017-8842 / Fax 3257-0027 / site 3017-8800
- Capital: R$ 38.000 | CNAE 8599605 (ensino) + 4761001 (varejo livros)
- **Sócio-Administrador: IGOR MUNIZ PAEZ VELAZQUEZ** (entrou
  **2025-06-04**, faixa 31-40) → **provável AQUISIÇÃO recente** —
  investigar histórico societário para identificar antigos donos
  (BrasilAPI expõe apenas QSA vigente).

### Plataforma vendor (achado-chave)
- **SEDUCAR PLATAFORMA DE ENSINO LTDA** — CNPJ 53.979.887/0001-78
  (RJ/Barra da Tijuca). Sócio **GABRIEL MORAES SODRE PINTO**
  (2024-02-20) = dono da org GitHub `Seducar`
  (`gabriel.moraes@seducar.com.br`). É o **LMS white-label** que roda
  o CRM/dashboard/questões/pagamento/staging do alvo (Vercel + Render).
- `nuxt.config` do staging do alvo expõe:
  - `apiUrl = https://seducar-api-website.onrender.com`
  - `appDomain = https://homolog.degraucultural.com.br` ← **cross-tenant**
  - `mainApiUrl = https://api.maisquestoes.com.br`

### Marca irmã / outro cliente Seducar
- **EDITORA DEGRAU CULTURAL LTDA** — CNPJ 28.060.747/0001-54 (RJ),
  família Martins (Adolfo, Andrea, Marizete). É **concorrente E outro
  cliente Seducar** — mesmo template white-label. O redirect
  `concursos.centraldeconcursos.com.br → degraucultural.com.br` +
  `appDomain=homolog.degraucultural.com.br` no config do alvo sugere
  **possível issue de isolamento de tenant (cross-tenant)** → finding
  candidato para Fase 5/6.

### Emails confirmados (domínio alvo) — `osint_emails.txt`
```
atendimento@centraldeconcursos.com.br
consultoriarepublica@centraldeconcursos.com.br
faleconosco@centraldeconcursos.com.br
suporteead@centraldeconcursos.com.br
informatica@centraldeconcursos.com.br   ← priorizar (TI)
dmarc@centraldeconcursos.com.br
postmaster@centraldeconcursos.com.br    ← priorizar (TI)
```
Inferidos (cred-stuffing): `contato@`, `financeiro@`, `comercial@`,
`rh@`, `ti@`, `suporte@`. Relacionados: `gabriel.moraes@seducar.com.br`,
`hnri_mxel@hotmail.com` (Henri Cavalcante, org maisquestoes),
`atendimento@degraucultural.com.br`, `faleconosco@degraucultural.com.br`.

### Pessoas — `osint_people.txt` (8)
- Igor Muniz Paez Velazquez (sócio alvo, 2025-06-04)
- Gabriel Moraes Sodre Pinto (founder Seducar)
- Adolfo Martins de Oliveira, Andrea Ribeiro Martins, Marizete Ribeiro
  Castanheira Martins (sócios Degrau Cultural)
- Henri Cavalcante (dev maisquestoes)

### GitHub — `osint_github.txt`
- Orgs: `Seducar` (public_repos=0), `Seducar-EAD` (=0), `Seducar-V3`
  (=0, criada 2026-05-29 — nova versão), `maisquestoes` (10 repos
  antigos 2015-17, não relacionados ao código atual).
- Users: `degraucultural` (sem repos), `henricavalcante` (99 repos,
  nenhum ligado ao alvo).
- **Nenhum hardcoded secret** encontrado (grep em 9.7M URLs wayback/gau
  + dorks = nada). Code search requer auth (sem token).

### Breaches — `osint_breaches.txt`
- **0 confirmados** (sem API HIBP/DeHashed/IntelX configurada).
- 7 emails confirmados + 6 inferidos = candidatos a cred-stuffing.

---

## 6. Cloud buckets — `cloud_buckets.txt`, `cloud_buckets_validated.txt`

Validados por HTTP direto (fonte terceira, não alvo):
- **GCP Storage (401 = existe, privado):** `gs://cdc`, `gs://cdc-prod`,
  `gs://cdc-dev`, `gs://concursos`
- **Azure Blob (400 = conta existe):** `cdc.blob.core.windows.net`,
  `concursos.blob.core.windows.net`
- **AWS S3:** nenhum bucket encontrado para qualquer variação de nome.
- **Nota:** "cdc" e "concursos" são nomes genéricos — podem pertencer a
  outras entidades. Delegar ao subagente `cloud` (Fase 3) para
  enumeração de objetos públicos, signed URLs, verificação de
  ownership. GCP geo-bloqueia Tor (validação precisou conexão direta).

---

## 7. Subdomain takeover — `takeover_candidates.txt`, `subjack_results.txt`

- **subjack** sinalizou 4 hosts como `[UPTIMEROBOT]`: `concurso`,
  `mkt` (→ RD Station), `cenlink`, `censpf` (→ dnzdns).
- **Verificação manual:** todos retornam `404 page not found` (Go
  server genérico). cenlink/censpf — dnzdns seta CSP `frame-ancestors`
  dinamicamente com o Host da requisição → serviço **ainda ciente** do
  subdomínio (não é dangling/unclaimed). concurso/mkt — RD Station
  404 (decommissioned, mas não permite claim arbitrário de CNAME).
- **Conclusão:** subjack UPTIMEROBOT = **FALSO POSITIVO** (padrão
  404+CSP). **Nenhum takeover CNAME-dangling confirmado** na fase
  passiva. CNAME targets todos resolvem (nenhum NXDOMAIN).
- **Recomendação Fase 3:** re-test com `nuclei -t takeovers/`;
  probe subdomínios Vercel com Host arbitrário (verificar se projeto
  Vercel está unclaimed — `concursos` → `degraucultural` sugere projeto
  de OUTRA empresa mapeado, possível CNAME confusion se projeto deletado).

---

## 8. Wayback highlights — para Fase 5 (enumeração profunda)

(`wayback_all.txt` 50.418 URLs, `wayback_js.txt` 1.958 JS,
`wayback_params.txt` 23.300 URLs com params, `wayback_unique_paths.txt`
30.343 paths, `wayback_interesting_filtered.txt` 969 endpoints)

### Endpoints/admin/autenticação de alto valor
- **`/SCCAdmin/`** — caminho de admin (wayback: `/SCCAdmin/_js/funcoes.js`,
  `/SCCAdmin/_js/Imagens/urlcentral.ico`) → enumerar conteúdo ativamente.
- **`/.well-known/openid-configuration`** — referenciado no wayback
  (retorna 404 hoje, mas era exposto) → re-test.
- `/usuario/minha_conta/login/login_func.asp`, `/usuario/cadastro/`
  `cadastro.asp`, `/usuario/cadastro/form_cadastro_func.asp`,
  `/usuario/cadastro/termo_servico.asp`, `/usuario/minha_conta/`
  `minha_conta.asp` → área do usuário legada (login/cadastro ASP).
- `/_auxiliary/acao/cadastro_flutuante/form_acao.asp`,
  `/_auxiliary/reserva_aula/login_func.asp`,
  `/_auxiliary/reserva_curso_especial/form_verifica.asp`,
  `/_auxiliary/reserva_evento/...` → funções auxiliares de
  reserva/inscrição (ASP clássico — possivelmente ainda acessíveis).
- `/aluno/recurso/recurso.asp`, `/aluno/simulado/resultado_simulado.asp`,
  `/aluno/gabarito/extra_oficial.asp` → área do aluno (recursos,
  simulados, gabaritos).
- `/Carrinho/CarrinhoCompras.aspx`, `/Carrinho/Identificacao.aspx`,
  `/Carrinho/AtualizaCarrinho.ashx`, `/Carrinho/CrAddCAr.ashx` →
  carrinho .NET (pagamentos — testar IDOR/price manipulation).
- `/amigo/enviar.asp`, `/amigo/envio.asp` → indicação de amigo.
- `/PaginaNaoEncontrada.aspx`, `/Concursos.asp`, `/Cadastro.asp`,
  `/Aluno.asp`, `/apostilas.asp` → endpoints legados.
- `/ar/edital_carteiro*.exe`, `/ar/edital_oficialcartorio_pc_rj.exe` →
  **binários .exe servidos** (wayback) — possível diretório `/ar/`
  aberto (directory listing / path traversal).

### APIs leaked (do Nuxt config do staging)
- `https://seducar-api-website.onrender.com` (Render, Express) —
  enumerar rotas (`/health`, `/api/*`, OpenAPI/Swagger).
- `https://api.maisquestoes.com.br` (Render, Express, JSON 404) —
  enumerar rotas; é o `mainApiUrl` do alvo.

### API ativa do alvo
- `https://api.centraldeconcursos.com.br` (Render+CF):
  - `/health` → 200 `{"healthy":true,"report":{"env":{...},"appKey":{...}}}`
    (info disclosure — confirma Node + appKey env).
  - `/` → 401 `{"error":"Escola não encontrada"}` (multi-tenant —
    resolve "Escola" por Host header).

### Tipos de arquivo
- `.asp`: 4.972 paths (legado ASP clássico — conteúdo possivelmente
  ainda acessível em subpaths não migrados).
- `.aspx`: 8 paths (.NET WebForms — carrinho).
- `.php`: 2 paths (mínimo — emkt?).
- `.json`: 4 paths.
- `.js`: 1.958 arquivos (enumerar endpoints/chaves/tokens em Fase 5).

### Parâmetros (23.300 URLs com params em `wayback_params.txt`)
Destaque: `id_opcao` (login_cadastro.asp), `id` (variações), parâmetros
de carrinho, parâmetros de busca/filtro. Mina de parâmetros para
`ffuf` em Fase 5 (param mining).

---

## 9. Ranking preliminar de hosts promissores (§16)

| Payoff | Host/Vetor | Justificativa | Próxima fase |
|---|---|---|---|
| **ALTO** | `api.centraldeconcursos.com.br` (Render, multi-tenant) | `/health` info disclosure + `{"error":"Escola não encontrada"}` → IDOR/BOLA cross-tenant (testar contexto Degrau). Backend de toda a app. | enum (rotas Express) + webapp (IDOR/auth bypass) |
| **ALTO** | `webmail/mail/pda/pop.*` → `/owa/` (Exchange on-prem) | Exchange OWA exposto — cred-stuffing + ProxyShell/ProxyNotShell CVE + enumeração de versão. Foothold potencial. | recon-active (fingerprint versão) + exploit (CVE) |
| **ALTO** | `crm/crm-hml/dashboard/homolog/staging` (Vercel, Seducar Nuxt) | Painéis Seducar — auth bypass, IDOR de tenant, `_buildManifest.js` vaza rotas. `staging` vaza `nuxt.config` com `appDomain=homolog.degraucultural`. | enum (JS/routes) + webapp (auth bypass) |
| **ALTO** | `centraldeconcursos.com.br` apex (Nuxt.js) | App principal — área do aluno, carrinho .aspx, login. Legado ASP em subpaths. | enum profunda + webapp (OWASP) |
| **ALTO** | `concursos.*` → `degraucultural.com.br` (cross-tenant) | Redirect para empresa concorrente + `appDomain` cruzado — validar isolamento de tenant Seducar. | webapp (IDOR cross-tenant) |
| **MÉDIO** | `questoes/homolog.questoes/pagamento.*` (Vercel, Nuxt) | Seducar questões + pagamento — IDOR, param mining, auth. | enum + webapp |
| **MÉDIO** | `demo.*` (500 Server Error) | Erro exposto — investigar stack trace / info disclosure. | recon-active (probe) |
| **MÉDIO** | `loja/livraria/ead/presencial/noticias/blog.*` (Nuxt, CF) | Áreas funcionais do site — enum de conteúdo + param mining. | enum |
| **MÉDIO** | Cloud buckets (GCP `cdc*`/`concursos`, Azure `cdc`/`concursos`) | Privados mas existem — object-level misconfig / signed URL. | cloud subagent |
| **MÉDIO** | Cred-stuffing nos 7 emails (webmail/OWA + CRM Seducar) | Emails confirmados + DMARC p=none (spoofable). | exploit (cred test com threshold) |
| **BAIXO** | `cenimage/cenlink/censpf/landingpage.*` (dnzdns) | 404/302 — dnzdns privado; baixo payoff. | recon-active (probe) |
| **BAIXO** | `*.email.*` (Salesforce MC/Akamai) | Terceiro — email tracking, fora de escopo (apenas fingerprint). | n/a |
| **BAIXO** | `gtm/load.gtm.*` (Stape.io / Google GTM Server) | GTM Server — baixo payoff direto, mas pode vazar config/containers. | recon-active (probe container) |
| **BAIXO** | `emkt.*` → Akna | Terceiro (email marketing) — fora de escopo. | n/a |
| **BAIXO** | `concurso/mkt.*` → RD Station 404 | Decommissioned — sem payoff. | n/a |

---

## 10. Limitações / ferramentas não rodadas

- **Shodan/Censys:** sem API key — favicon hash (`-458515647`)
  preparado para correlação quando obtiver key. Deixar anotado para
  descobrir IP real do Exchange/OWA via busca por favicon/hash.
- **HIBP/DeHashed/IntelX:** sem API key — breaches não verificados
  automaticamente. 7 emails + 6 inferidos = candidatos a verificação
  manual.
- **GitHub code search:** sem token — hardcoded secrets não buscados
  via API. Dorks via DuckDuckGo não retornaram. Recomendado obter
  token para re-scan.
- **securitytrails/chaos:** sem API key — não usados (subfinder já
  cobriu bem com fontes públicas).
- **theHarvester:** 0 emails/0 pessoas (apenas hosts) — suprido por
  webfetch do site + CNPJ via BrasilAPI.
- **amass:** timeout em 300s (saiu com 152 linhas, parcial) — mas
  output foi rico em CNAMEs/A records. Re-run opcional com mais tempo.
- **hackertarget:** quota excedida ("API count exceeded").
- **gospider/hakrawler/katana:** não usados (waybackurls+gau já
  renderizaram 50k URLs — suficiente para Fase 5). Pode rodar em
  recon-active se necessário.
- **GCP bucket probing via Tor:** geo-bloqueado (403 genérico);
  validado via conexão direta (fonte terceira, OPSEC ok). Cloud
  subagent deve usar conexão direta para GCP.
- **nuclei (takeovers/):** não rodado (passivo) — agendar para
  recon-active confirmar takeover.

---

## 11. Próximos passos recomendados (para o coordenador)

1. **Delegar recon-active** (Fase 3) priorizando:
   - Portscan + fingerprint de versão no **Exchange OWA**
     (`webmail/mail/pda/pop.*` → `/owa/`) — buscar IP real (bypass CF)
     via Shodan/Censys (precisa API key) ou histórico DNS.
   - Fingerprint de versão dos Vercel apps Seducar (`crm`, `dashboard`,
     `homolog`, `staging`) via `_buildManifest.js` e headers.
   - wafw00f + vhost fuzzing no IP real (se descobrir) do Exchange e do
     apex Nuxt.
2. **Delegar enum** (Fase 5) para:
   - `api.centraldeconcursos.com.br` (Express multi-tenant) —
     enumerar rotas, Swagger/OpenAPI, testar IDOR cross-tenant
     (Header `Host: degraucultural*` / `X-Tenant` / param de escola).
   - `staging.centraldeconcursos.com.br` (vaza nuxt.config) —
     enumerar rotas via `_buildManifest.js` + JS analysis.
   - Apex Nuxt + legado ASP (`/SCCAdmin/`, `/usuario/`, `/aluno/`,
     `/Carrinho/`, `/_auxiliary/`, `/ar/`).
3. **Delegar cloud** (Fase 3) para os 6 buckets confirmados (4 GCP +
   2 Azure) — object-level enum, signed URL, ownership verification.
4. **Delegar webapp** (Fase 6) focando em:
   - Auth bypass / default creds no Exchange OWA + Seducar CRM/dashboard.
   - IDOR/BOLA cross-tenant no API Seducar multi-tenant.
   - Cred-stuffing (com threshold) nos 7 emails confirmados.
   - OWASP no Nuxt.js principal + legado ASP.
5. **Obter** API keys para Shodan/Censys (IP real do OWA), HIBP/DeHashed
   (breaches dos 7 emails), GitHub token (code search de secrets).

---

## 12. Artefatos brutos em `recon/passive/`

| Arquivo | Descrição |
|---|---|
| `dns_full.txt` | WHOIS + NS/MX/TXT/SPF/DMARC/DKIM + AXFR attempts |
| `dnsx_resolved.{json,txt}` | Resolução A/AAAA/CNAME dos 54 subdomínios |
| `crt.json` | JSON bruto do crt.sh (343KB) |
| `sub_subfinder.txt` / `sub_assetfinder.txt` / `sub_amass.txt` / `sub_crt.txt` / `sub_hackertarget.txt` | Subdomínios por fonte |
| `subdomains_all.txt` | 54 subdomínios únicos consolidados |
| `subdomains_live.txt` | Tabela dos 44 hosts vivos (host/status/title/server/tech/location/cname) |
| `httpx_live.json` | JSON bruto do httpx (44 entradas) |
| `cname_pairs.txt` / `cname_map.json` / `takeover_candidates.txt` / `takeover_bodies.txt` / `subjack_results.txt` | Análise de takeover |
| `tech_fingerprint.txt` | Fingerprint de tech stack |
| `favicon_main.ico` | Favicon do apex (mmh3 hash -458515647) |
| `wayback_all.txt` | 50.418 URLs wayback+gau únicas |
| `wayback_urls_raw.txt` / `gau_urls.txt` | Fontes wayback brutas |
| `wayback_js.txt` | 1.958 arquivos JS (wayback) |
| `wayback_params.txt` | 23.300 URLs com parâmetros |
| `wayback_interesting.txt` / `wayback_interesting_filtered.txt` | Endpoints admin/api/login/etc |
| `wayback_unique_paths.txt` | 30.343 paths únicos |
| `osint_company.txt` / `osint_emails.txt` / `osint_people.txt` / `osint_github.txt` / `osint_breaches.txt` | OSINT (subagente osint) |
| `theharvester_cc.{json,xml}` | Output theHarvester |
| `cloud_buckets.txt` / `cloud_buckets_raw.txt` / `cloud_buckets_validated.txt` | Buckets cloud |
| `amass_records.txt` / `sub_amass.log` | Auxiliares amass |

---

*PASSIVE.md gerado em 2026-08-27T04:30Z pelo especialista recon-passive.*
