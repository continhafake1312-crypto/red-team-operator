# OSINT Report — vumpe.com

**Data:** 2026-08-26
**Agente:** osint
**Alvo:** vumpe.com (https://www.vumpe.com/)

---

## 1. Domínio

| Item | Valor |
|------|-------|
| Domínio | vumpe.com |
| Registrado em | 2026-06-22 (~2 meses atrás) |
| Registrador | GoDaddy.com, LLC |
| Expira em | 2028-06-22 |
| DNS | Cloudflare (achiel.ns.cloudflare.com, katja.ns.cloudflare.com) |
| WHOIS | Rate limited — detalhes do registrante não obtidos |

---

## 2. Empresa / Organização

- **Nome:** Vumpe Tecnologia Ltda (mencionado no footer do site)
- **País:** Brasil (site em português, pagamento via Pix)
- **Descrição:** Plataforma que conecta marcas, criadores e clipadores. Usuários postam vídeos prontos (clips) em redes sociais e são pagos por visualização via Pix.
- **Modelo:** Campanhas de marcas/influenciadores pagam por CPM (custo por mil views)
- **Valor já pago divulgado:** R$ 822.289,46

---

## 3. Pessoas Encontradas

| Nome | Fonte | Detalhes |
|------|-------|----------|
| **Reiner Sauer** | Twitter/X (@vumpe) | Conta criada em maio/2009, 0 posts, 0 seguindo, 1 seguidor. Provável fundador/sócio. |
| vumperhq | GitHub | Criado 2026-03-23, nome "Vumper", 0 repositórios públicos |
| Vumper | GitHub | Criado 2019-10-20, 0 repositórios públicos |
| Vumpel | GitHub | Criado 2024-03-17, 0 repositórios públicos |
| Vumpel98, Vumpel981, Vumpel982, vumperera-svg | GitHub | Contas variantes, nenhuma com repositórios públicos |

---

## 4. Emails Encontrados

| Email | Fonte | Status |
|-------|-------|--------|
| `contato@vumpe.com` | Footer do site (protegido por Cloudflare) | Confirmado |
| `dmarc_rua@onsecureserver.net` | Registro TXT `_dmarc.vumpe.com` (DMARC RUA) | Confirmado |

**Padrão de email provável:** `{nome}@vumpe.com`
**Serviço de email:** Mailgun (MX: mx{a,b}.mailgun.org)

---

## 5. DNS / Registros

```
A:    104.21.68.192, 172.67.198.10 (Cloudflare proxy)
AAAA: 2606:4700:3031::ac43:c60a, 2606:4700:3033::6815:44c0
NS:   achiel.ns.cloudflare.com, katja.ns.cloudflare.com
MX:   mxb.mailgun.org, mxa.mailgun.org
TXT:  "v=spf1 include:mailgun.org ~all"
DMARC: v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;
```

---

## 6. Subdomínios Descobertos

| Subdomínio | Resolve | Tecnologia |
|------------|---------|------------|
| `www.vumpe.com` | ✅ 104.21.68.192 | Next.js / Cloudflare |
| `clipador.vumpe.com` | ✅ (Vercel: 216.150.1.65) | Next.js / Vercel — painel do clipador (login) |
| `mcl.vumpe.com` | ✅ (Vercel: 216.150.16.193) | Next.js / Vercel — marketplace de campanhas |

**Não resolvem:** api, app, admin, mail, webmail, dashboard, cdn, static, dev, blog, help, support, docs, status, test, stage

---

## 7. Tech Stack

- **Frontend:** Next.js (SSR/SSG) + Stitches (CSS-in-JS) + React
- **Hospedagem:** Vercel (clipador/mcl) + Cloudflare (www)
- **Email:** Mailgun (MX + SPF)
- **Monitoramento:** Sentry (exposed: `sentry-release=cb96e609e674c722ce040c16f65fb3facc8af665`, `sentry-environment=vercel-production`)
- **Storage:** AWS S3 (`social-tracker-bucket-production.s3.us-east-1.amazonaws.com` — bucket não encontrado ou privado)
- **CDN/WAF:** Cloudflare
- **Embed:** TikTok, Instagram

---

## 8. Redes Sociais

| Plataforma | Handle | Status |
|------------|--------|--------|
| Twitter/X | @vumpe (Reiner Sauer) | ✅ Existe — 0 posts |
| Instagram | @vumpe | ✅ Existe |
| Facebook | @vumpe | ✅ Existe |
| TikTok | @vumpe | ✅ Existe |

---

## 9. GitHub OSINT

**Busca por "vumpe" (usuários):**
- Vumper, vumperhq, Vumpel, Vumpel98, Vumpel981, Vumpel982, vumperera-svg
- Nenhum com repositórios públicos

**Busca por "vumpe.com" (issues/code):** 0 resultados
**Busca por repositórios:** Apenas projetos não-relacionados ("vumper" é outro conceito)

---

## 10. Vazamentos / Breaches

- Nenhum vazamento público encontrado em pastebin, GitHub ou fontes abertas
- Domínio muito recente (junho/2026) — pouco tempo de exposição
- Sem credenciais vazadas encontradas

---

## 11. Informações Sensíveis Expostas

| Tipo | Detalhe | Risco |
|------|---------|-------|
| **Sentry DSN exposure** | `sentry-release=cb96e609e674c722ce040c16f65fb3facc8af665`, `sentry-trace_id=521095b4020e4b74a18603bfc4cddad9` | Médio — expõe versão, trace IDs |
| **Client IP** | IP do requisitante exposto em `clipador.vumpe.com/login` (`ipAddress: 204.8.96.86`) | Baixo |
| **DMARC externo** | Relatórios vão para `onsecureserver.net` | Baixo |
| **S3 bucket** | `social-tracker-bucket-production` — retorna NoSuchBucket | Bucket pode ter sido deletado ou nome alterado |

---

## 12. Google Dorks

(Google bloqueou requisições automatizadas — resultados limitados)

**Dorks sugeridas para enumeração manual:**
```
site:vumpe.com
site:vumpe.com intitle:index.of
site:vumpe.com ext:xml | ext:conf | ext:env
site:vumpe.com inurl:wp-admin | inurl:admin | inurl:api
site:vumpe.com "vumpe" "cnpj"
site:vumpe.com intitle:"dashboard" | intitle:"login"
site:pastebin.com vumpe.com
"vumpe.com" email
"vumpe.com" password
"vumpe tecnologia" cnpj
```

---

## 13. Campanhas Identificadas (Contexto do Negócio)

- Campanha Coringa
- Campanha Ruyter
- Campanha Maiara & Maraisa
- Campanha João Brásio
- Campanha Chrys Dias & Debora Paixão
- AtivaCC — Cortes Caio Signoretti (R$ 6,00/mil views)
- AtivaCF — Creatina Fúria 2.0 (R$ 5,00/mil views)
- AtivaC- — Cortes PlayTruco 1.0 (R$ 5,00/mil views)
- AtivaCR — Competição Rodrigo Andrade (R$ 4,00/mil views)

---

## 14. Resumo de Payoff para Próximas Fases

| Vetor | Prioridade | Justificativa |
|-------|------------|---------------|
| **clipador.vumpe.com (login panel)** | 🔴 ALTA | Painel de login exposto, possibility de brute-force, default creds, IDOR |
| **mcl.vumpe.com (marketplace)** | 🔴 ALTA | Marketplace de campanhas — possível IDOR, mass assignment |
| **API endpoints** | 🟡 MÉDIA | Next.js API routes podem existir em `/api/*` |
| **Sentry leak** | 🟡 MÉDIA | sentry-release exposto — possível exploração de versão |
| **S3 bucket** | 🟡 MÉDIA | Nome do bucket exposto no frontend |
| **Email enumeration** | 🟢 BAIXA | Mailgun — possibilidade de email spoofing (SPF ~all) |
| **Subdomain takeover** | 🟢 BAIXA | Subdomínios via Vercel — verificar CNAME dangling |

---

## 15. Artefatos Salvos

| Arquivo | Descrição |
|---------|-----------|
| `whois_vumpe.txt` | WHOIS do domínio |
| `theharvester_vumpe.txt` | Saída do theHarvester |
| `crtsh_vumpe.txt` | Certificados (erro 502) |
| `github_repos_vumpe.txt` | Repositórios GitHub |
| `github_users_vumpe.txt` | Usuários GitHub |
| `github_code_vumpe.txt` | Código no GitHub |
| `github_issues_vumpe.txt` | Issues no GitHub |
| `github_vumperhq.txt` | Perfil vumperhq |
| `github_Vumper.txt` | Perfil Vumper |
| `github_Vumpel.txt` | Perfil Vumpel |
| `github_vumperhq_repos.txt` | Repos de vumperhq |
| `subdomains_common.txt` | Subdomínios testados |
| `google_dorks_vumpe.txt` | Google dorks |
| `wayback_vumpe.txt` | Wayback Machine |
| `instagram_vumpe.txt` | Instagram |
| `pastebin_vumpe.txt` | Pastebin search |

---

*Fim do relatório OSINT — 2026-08-26*