# ACTIVE.md — Recon Ativo

> Gerado por: recon-active  
> Data: 2026-08-26  
> Alvo: vumpe.com + subdomínios

---

## 1. Bypass CDN — Descoberta de IPs Reais

### IP Real Histórico (AWS Global Accelerator)
- **13.248.243.5** (a16e665f42988324c.awsglobalaccelerator.com)
  - Fonte: URLScan.io — scan de 2026-06-24 mostrava vumpe.com resolvendo para este IP
  - Servia o site Vumpe diretamente sem Cloudflare
  - Atualmente: retorna 200 com `Server: DPS/2.0.0+sha-9ac0622` (GoDaddy Website Builder)
  - Provável que a migração para Cloudflare + Vercel tenha ocorrido recentemente
  - O IP ainda responde com conteúdo (GoDaddy DPS parked/default site)

### Cloudflare IPs (www.vumpe.com, vumpe.com)
| IP | CDN |
|---|---|
| 104.21.68.192 | Cloudflare |
| 172.67.198.10 | Cloudflare |
| 2606:4700:3033::6815:44c0 | Cloudflare (IPv6) |
| 2606:4700:3031::ac43:c60a | Cloudflare (IPv6) |

### Vercel Edge IPs (NÃO atrás de Cloudflare)
| Domínio | IPs Vercel |
|---|---|
| clipador.vumpe.com | 216.150.1.1, 216.150.16.1 |
| anunciante.vumpe.com | 216.150.1.65, 216.150.16.65 |
| mcl.vumpe.com | 216.150.1.193, 216.150.16.193 |
| up-mcl.vumpe.com | 216.150.1.129, 216.150.16.129 |

> **Conclusão:** Todos os subdomínios (clipador, anunciante, mcl, up-mcl) estão EXPOSTOS diretamente na Vercel, sem Cloudflare. O único domínio protegido por Cloudflare é www.vumpe.com.

---

## 2. Port Scan — Resultados por IP

### Cloudflare (104.21.68.192, 172.67.198.10)
| Porta | Estado | Serviço | Versão |
|---|---|---|---|
| 80/tcp | open | http | Cloudflare http proxy |
| 443/tcp | open | ssl/https | Cloudflare |
| 8080/tcp | open | http | Cloudflare http proxy |
| 8443/tcp | open | ssl/https-alt | Cloudflare |

### Vercel Edge (216.150.1.x, 216.150.16.x)
| Porta | Estado | Serviço | Versão |
|---|---|---|---|
| 80/tcp | open | http | Vercel (redirect → 443) |
| 443/tcp | open | ssl/https | Vercel (Next.js) |
| *Outras* | filtered | — | — |

### AWS Global Accelerator (13.248.243.5)
| Porta | Estado | Serviço | Versão |
|---|---|---|---|
| 80/tcp | open | http | DPS/2.0.0+sha-9ac0622 |
| 443/tcp | open | ssl/https | DPS/2.0.0+sha-9ac0622 |

---

## 3. Web Fingerprint

### www.vumpe.com (via Cloudflare)
- **Server:** Cloudflare (CDN)
- **Status:** 200 OK
- **Title:** "Vumpe - Corta. Posta. Pix na conta."
- **Tech:** Next.js (x-powered-by), Cloudflare WAF, strict-transport-security
- **Headers:** x-matched-path, x-vercel-cache, x-vercel-id (backend Vercel)
- **SSL:** Cloudflare edge cert

### clipador.vumpe.com (Vercel direto)
- **Server:** Vercel
- **Status:** 307 Redirect → /login
- **Login page:** 200 OK
- **Title:** "Vumpe"
- **Tech:** Next.js (buildId: f38PtoqtgBHA12_uIMJrq), stitches CSS-in-JS, SSR
- **Fontes:** Red Hat Display, Allison, Ms Madi, Inter, WindSong, Qwitcher Grypen

### anunciante.vumpe.com (Vercel direto)
- **Server:** Vercel
- **Status:** 307 Redirect → https://vumpe.com/ → www.vumpe.com
- **Anunciante portal redireciona para o site principal**

### mcl.vumpe.com (Vercel direto)
- **Server:** Vercel
- **Status:** 200 OK
- **Title:** "Método Clipador Lucrativo (MCL)"
- **Tech:** HTML5 estático, Google Fonts (Syne, Inter), CSS animations
- **Cache:** HIT (página estática)

### up-mcl.vumpe.com (Vercel direto)
- **Server:** Vercel
- **Status:** 200 OK
- **Title:** "Upsell"
- **Tech:** HTML5 estático, módulos JavaScript
- **Cache:** HIT

---

## 4. WAF Detection

| Domínio | WAF Detectado | Provider |
|---|---|---|
| www.vumpe.com | ✅ Sim | Cloudflare |
| clipador.vumpe.com | ❌ Não | — |
| mcl.vumpe.com | ❌ Não | — |
| anunciante.vumpe.com | ❌ Não | — |
| up-mcl.vumpe.com | ❌ Não | — |

> **Ponto crítico:** Nenhum subdomínio Vercel está protegido por WAF. Ataques diretos (SQLi, path traversal, IDOR) podem ser feitos sem medo de bloqueio.

---

## 5. TLS/SSL Scan

### Vercel Edge (todos os IPs)
- **Certificado:** Let's Encrypt (YR1/YR2)
- **SAN:** no-sni.vercel-infra.com (certificado genérico Vercel)
- **Validade:** 2026-07-22 → 2026-10-20
- **TLS 1.2:** ✅ ECDHE-RSA-AES128-GCM-SHA256, ECDHE-RSA-AES256-GCM-SHA384, ECDHE-RSA-CHACHA20-POLY1305
- **TLS 1.3:** ✅ TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256
- **Cipher preference:** Server (TLS 1.2: client, TLS 1.3: server)
- **DH params:** Não suportado (certificado RSA 2048)
- **Perfect Forward Secrecy:** ✅ Sim (ECDHE)

### AWS Global Accelerator (13.248.243.5)
- **Servidor:** DPS/2.0.0+sha-9ac0622 (GoDaddy Website Builder)
- **Issuer:** GoDaddy TLS Intermediate CA DV - R1v1
- **Validade:** 2026-06-22 → 2026-09-20

---

## 6. CORS Misconfiguration

### mcl.vumpe.com
```
Access-Control-Allow-Origin: *
```
### up-mcl.vumpe.com
```
Access-Control-Allow-Origin: *
```
> **CRÍTICO:** Wildcard CORS permite qualquer site de origem fazer requisições cross-origin. Potencial para data exfiltration via CSRF + CORS.

---

## 7. Rate Limiting Test

| Domínio | 10 reqs concorrentes | Resultado |
|---|---|---|
| www.vumpe.com | 10/10 ✅ 200 OK | Sem bloqueio |
| clipador.vumpe.com | 10/10 ✅ 307 Redirect | Sem bloqueio |

> Cloudflare não bloqueou requisições paralelas via Tor. Vercel não apresentou rate limiting.

---

## 8. Rotas Descobertas (clipador.vumpe.com)

Build ID: `f38PtoqtgBHA12_uIMJrq`

Fonte: `_buildManifest.js` (Next.js route disclosure)

### Rotas Públicas
- `/login` — Página de login
- `/register` — Registro
- `/signup` — Cadastro
- `/recover-password` — Recuperação de senha
- `/reset-password/[token]` — Reset de senha
- `/privacy-policy` — Política de privacidade
- `/terms-of-use` — Termos de uso
- `/help-center` — Central de ajuda
- `/help-center/articles/[slug]` — Artigos de ajuda
- `/help-center/categories/[categorySlug]/articles` — Artigos por categoria
- `/choose-platform` — Escolha de plataforma

### Rotas Autenticadas (alto valor)
- `/dashboard` — Dashboard principal
- `/profile` — Perfil do usuário
- `/buys` — Compras realizadas
- `/buys/[token]` — Detalhe da compra
- `/buys/subscription/[...slug]` — Assinaturas de compra
- `/orders` — Pedidos
- `/order/[id]` — Detalhe do pedido
- `/subscriptions` — Assinaturas
- `/subscriptions/details/[uuid]` — Detalhe da assinatura
- `/offerings` — Lista de ofertas/produtos
- `/offerings/[id]` — Gestão de oferta
- `/offerings/[id]/settings` — Configurações da oferta
- `/offerings/[id]/contents` — Conteúdos da oferta
- `/offerings/[id]/members` — Membros
- `/offerings/[id]/partner` — Parceiros
- `/offerings/[id]/checkouts` — Checkouts
- `/offerings/[id]/discounts` — Descontos
- `/offerings/[id]/payment-links` — Links de pagamento
- `/offerings/[id]/payments-page` — Página de pagamento
- `/offerings/[id]/pixels` — Pixels de tracking
- `/offerings/[id]/strategies` — Estratégias
- `/offerings/[id]/summary` — Resumo
- `/offerings/[id]/co-producer` — Co-produtor
- `/offerings/[id]/co-producer/payment-links` — Links de pagamento co-produtor
- `/offerings/[id]/co-producer/pixels` — Pixels co-produtor
- `/offerings/[id]/coproducers` — Lista de coprodutores
- `/offerings/[id]/partners` — Lista de parceiros
- `/offerings/[id]/partnerships` — Parcerias
- `/offerings/[id]/members/[moduleUuid]/add-content` — Adicionar conteúdo a membro
- `/offerings/[id]/partner/affiliation` — Afiliação
- `/offerings/[id]/partner/payment-links` — Links de pagamento parceiro
- `/offerings/[id]/partner/pixels` — Pixels parceiro

### Rotas de Clips/Marketplace
- `/clips/marketplace` — Marketplace de clipes
- `/clips/marketplace/[id]` — Campanha específica
- `/clips/marketplace/[id]/clips` — Clipes da campanha
- `/clips/marketplace/[id]/ranking` — Ranking da campanha
- `/clips/my-clips` — Meus clipes
- `/clips/my-clips/social-accounts` — Contas sociais
- `/clips/championships` — Campeonatos
- `/clips/championships/[id]` — Campeonato específico
- `/clips/championships/[id]/clips` — Clipes do campeonato
- `/clips/championships/[id]/ranking` — Ranking do campeonato
- `/clips/championships/clipper-reports/[[...id]]` — Reports clipper
- `/clips/championships/reports/[[...id]]` — Reports
- `/clips/ranking` — Ranking geral
- `/clips/calculadora-cpm` — Calculadora CPM

### Rotas de Anunciante/Auth
- `/advertiser/analyze` — Análise de anunciante
- `/auth/advertiser/login` — Login de anunciante
- `/auth/[platformId]/callback` — OAuth callback (TikTok/Instagram)
- `/manager-login/[impersonatedBy]/[uuid]/[code]` — Login como manager (IMPERSONATION!)

### Rotas de Conteúdo Estático
- `/` — Home
- `/404`, `/500` — Páginas de erro
- `/_error` — Error page
- `/acesso-pendente` — Acesso pendente
- `/start-profiting` — Comece a lucrar
- `/referral-program` — Programa de indicação
- `/support` — Suporte
- `/plans` — Planos
- `/plan-cancel` — Cancelamento de plano
- `/funds` — Fundos
- `/payment-channels` — Canais de pagamento
- `/refund-requests` — Solicitações de reembolso
- `/reports` — Relatórios
- `/organizations` — Organizações
- `/certificate/[uuid]` — Certificado
- `/partner/[uuid]` — Página de parceiro
- `/contact-update/email-validation/[uuid]` — Validação de email
- `/email-confirmation/[uuid]` — Confirmação de email
- `/sections/[uuid]` — Seções
- `/plugins` — Plugins
- `/plugins/[slug]` — Plugin específico
- `/plugins/[slug]/logs/[productUuid]/[id]` — Logs de plugin

### Rotas Especiais
- `/tiktok-verification-vumpe` — TikTok domain verification (200 OK)
- `/tiktokxwgqmeTyIkpnFQUJ23ofA5ic52PwTArG.txt` — TikTok verification file (200 OK, conteúdo: `tiktok-developers-site-verification=xwgqmeTyIkpnFQUJ23ofA5ic52PwTArG`)
- `/ingest/decide` — PostHog analytics endpoint (200 OK)
- `/ingest/static/:path*` — PostHog static assets
- `/ingest/:path*` — PostHog ingestion
- `/:id` → redirect to `/campaigns/marketplace/:id` (catch-all)
- `/campaigns/*` → rewrite to marketplace

---

## 9. Observações Críticas

### Sem Cloudflare nos Subdomínios
clipador, anunciante, mcl, up-mcl estão todos diretamente expostos na Vercel. Qualquer ataque pode ser feito sem preocupação com WAF.

### CORS Wildcard (mcl e up-mcl)
`Access-Control-Allow-Origin: *` permite leitura de dados via browser de qualquer origem.

### TikTok Verification Exposta
Arquivo de verificação do TikTok (`tiktokxwgqmeTyIkpnFQUJ23ofA5ic52PwTArG.txt`) acessível publicamente — verificação legítima, mas expõe que a plataforma integra com TikTok API.

### Manager Login Impersonation
Rota `/manager-login/[impersonatedBy]/[uuid]/[code]` — permite que um manager faça login como outro usuário. Potencial vetor de IDOR se o código/uuid for adivinhado.

### PostHog Self-Hosted
Endpoints de ingestão PostHog expostos (`/ingest/*`) — analytics self-hosted no mesmo domínio.

### Sentry Monitoring
SDK Sentry ativo com tracing (`sentry-trace-id`, `sentry-baggage`) — erros do lado servidor são reportados.

### Historic AWS GA IP
O IP 13.248.243.5 (AWS Global Accelerator) pode ainda conter dados ou configs residuais. Atualmente serve GoDaddy DPS (Website Builder).

---

## 10. Recomendações para Próximas Fases

### enum (alta prioridade)
1. **Fuzz em clipador.vumpe.com** — 100+ rotas identificadas, testar IDOR em `/offerings/[id]/*`, `/orders`, `/subscriptions`
2. **Fuzz em mcl.vumpe.com** — landing page estática, testar parâmetros ocultos
3. **Fuzz em up-mcl.vumpe.com** — upsell page, testar parâmetros
4. **Content discovery** em www.vumpe.com (via Cloudflare - usar rate limiting baixo)
5. **JS analysis** — Baixar chunks JS do clipador (`_next/static/chunks/`) e extrair endpoints de API, chaves, tokens
6. **PostHog endpoints** — Investigar `/ingest/decide` para possíveis info leaks

### webapp (alta prioridade)
1. **Login bypass** — Testar default creds, SQLi, NoSQLi no formulário de login do clipador
2. **IDOR/BOLA** — `/offerings/[id]/*` operations, `/orders`, `/buys/[token]`
3. **Manager login impersonation** — Testar `/manager-login/[impersonatedBy]/[uuid]/[code]` com UUIDs enumeráveis
4. **CORS exploitation** — mcl/up-mcl com CORS wildcard (CSRF + data read)
5. **JWT analysis** — Verificar tokens JWT usados na autenticação
6. **TikTok OAuth callback** — Testar CSRF em `/auth/[platformId]/callback`
7. **Mass assignment** — Tentar manipular roles/permissions via `isAdmin`, `role` parameters
8. **Cache poisoning** — Vercel cache HIT nos sites estáticos

### cve (média prioridade)
1. Vercel Next.js — Verificar CVEs para Next.js 14/15 (middleware bypass, path traversal)
2. GoDaddy DPS — Verificar CVEs para GoDaddy Website Builder (AWS GA IP)
3. PostHog — Verificar versão e CVES associadas

### cloud (média prioridade)
1. **AWS Global Accelerator** (13.248.243.5) — Verificar se há backend exposto
2. **S3 bucket** (`social-tracker-bucket-production`) — Validar permissões

---

## Artefatos Gerados

| Arquivo | Descrição |
|---|---|
| `nmap_quick_cloudflare.txt` | Scan rápido Cloudflare (100 portas) |
| `nmap_quick_vercel1.txt` | Scan rápido Vercel IPs (100 portas) |
| `nmap_vercel_216_150_1_129.txt` | Scan Vercel 216.150.1.129 (1000 portas) |
| `nmap_vercel_216_150_16_129.txt` | Scan Vercel 216.150.16.129 (1000 portas) |
| `nmap_vercel_216_150_1_65.txt` | Scan Vercel 216.150.1.65 (1000 portas) |
| `nmap_vercel_216_150_16_65.txt` | Scan Vercel 216.150.16.65 (1000 portas) |
| `nmap_vercel_216_150_1_193.txt` | Scan Vercel 216.150.1.193 (1000 portas) |
| `nmap_vercel_216_150_16_193.txt` | Scan Vercel 216.150.16.193 (1000 portas) |
| `nmap_13_248_243_5.txt` | Scan AWS GA IP (1000 portas) |
| `whatweb_www_vumpe.txt` | WhatWeb www.vumpe.com |
| `whatweb_clipador_vumpe.txt` | WhatWeb clipador.vumpe.com |
| `whatweb_anunciante_vumpe.txt` | WhatWeb anunciante.vumpe.com |
| `whatweb_mcl_vumpe.txt` | WhatWeb mcl.vumpe.com |
| `whatweb_up_mcl_vumpe.txt` | WhatWeb up-mcl.vumpe.com |
| `waf_www_vumpe.txt` | WAF detection www |
| `waf_clipador_vumpe.txt` | WAF detection clipador |
| `waf_mcl_vumpe.txt` | WAF detection mcl |
| `tls_216_150_16_129.txt` | TLS scan Vercel 216.150.16.129 |
| `tls_216_150_16_193.txt` | TLS scan Vercel 216.150.16.193 |
| `tls_216_150_1_65.txt` | TLS scan Vercel 216.150.1.65 |
| `routes_clipador_vumpe.txt` | Rotas Next.js extraídas (100 rotas) |