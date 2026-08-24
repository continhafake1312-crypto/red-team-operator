# Recon Passivo + OSINT — legasforn.com.br

**Data:** 2026-08-24T16:20-16:40 UTC  
**Operador:** especialista recon-passive  
**Alvo:** legasforn.com.br (https://legasforn.com.br)  
**Cobertura:** WHOIS, DNS, Subdomínios, Tech Fingerprint, OSINT, Cloud, Wayback

---

## Resumo Executivo

| Item | Valor |
|---|---|
| Subdomínios descobertos | 1 (apenas legasforn.com.br) |
| Subdomínios vivos | 1 |
| IP de origem real | 69.46.46.84 (Railway edge proxy) |
| Tech Stack | Next.js (RSC + Turbopack) → Railway → Supabase + MisticPay |
| Emails encontrados | 0 |
| Buckets Cloud | 0 |
| Takeover candidates | 0 |

**Conclusão:** Domínio muito recente (2026-05-19), sem histórico em Wayback/crt.sh, sem subdomínios enumeráveis via fontes passivas. A aplicação é uma loja de contas gaming (reseller/white-label) hospedada na Railway com Supabase como backend e MisticPay como gateway PIX.

---

## 1. WHOIS

- **Criação:** 2026-05-19
- **Expiração:** 2027-05-19
- **País:** BR (Brasil)
- **Status:** published
- **Nameservers:** orbit.dns-parking.com / horizon.dns-parking.com (HostGator DNS parking)
- **DNSSEC:** não configurado
- **Registrante:** Não identificado (informação oculta no .br)
- **Observação:** Nameservers de DNS parking não correspondem à hospedagem real (Railway)

## 2. DNS

### Registros encontrados
| Tipo | Valor |
|---|---|
| A | 69.46.46.84 |
| NS | orbit.dns-parking.com, horizon.dns-parking.com |

### Ausentes
- AAAA (sem IPv6)
- MX (sem email corporativo)
- TXT (sem SPF, DMARC, DKIM)
- CNAME (sem redirecionamentos)
- SOA (resposta RFC8482)

### AXFR
- Falhou para ambos os nameservers (transferência não autorizada)

## 3. Subdomínios

### Fontes consultadas (0 subdomínios além do principal)
- **subfinder** (v2.6.6): erro de versão/sem resultados
- **assetfinder**: apenas legasforn.com.br
- **crt.sh**: 502 Bad Gateway / 404 Not Found (domínio muito recente)
- **amass enum -passive**: timeout sem resultados
- **theHarvester (crtsh, etc.)**: sem hosts encontrados
- **DNS brute force manual**: www, api, app, admin, mail, ftp, blog, dev, cdn, static, assets, staging, etc. — nenhum resolve

### Lista final
```
legasforn.com.br (69.46.46.84)
```

### Subdomínios vivos
```
https://legasforn.com.br [200] - Railway/Next.js
```

## 4. Tech Stack

### Identificação por host (todas as páginas)

| Componente | Tecnologia |
|---|---|
| **Frontend Framework** | Next.js (App Router, React Server Components) |
| **Bundler** | Turbopack |
| **Hosting/Edge** | Railway (railway.app) — server: `railway-hikari` |
| **Edge Locations** | `mia1` (Miami?), `iah1` (Houston?) |
| **Database** | Supabase (CSP: `*.supabase.co`, `wss://*.supabase.co`) |
| **Payment Gateway** | MisticPay (CSP: `*.misticpay.com`) |
| **CAPTCHA** | hCaptcha (js.hcaptcha.com, newassets.hcaptcha.com, api.hcaptcha.com) |
| **Analytics** | Google Analytics (G-3HWDPFXDQF), Facebook Analytics |
| **Font Icons** | Lucide React |
| **Fonts** | Inter, Geist Mono, Bricolage Grotesque, Instrument Serif |
| **Security** | HSTS, CSP restritivo, X-Frame-Options DENY, X-Content-Type-Options nosniff |
| **Auth Provider** | Supabase Auth (implícito pelo uso de Supabase) |
| **CDN** | Railway built-in CDN (edge proxy no IP 69.46.46.84) |

### CSP `connect-src` revela dependências:
- `*.supabase.co` + `wss://*.supabase.co` — Supabase (DB realtime)
- `api.hcaptcha.com`, `newassets.hcaptcha.com`, `js.hcaptcha.com` — hCaptcha
- `*.misticpay.com` — gateway de pagamento PIX
- `www.googletagmanager.com`, `*.google-analytics.com`, `*.analytics.google.com` — GA4
- `www.facebook.com` — Facebook Pixel

## 5. Mapeamento de Endpoints

### Descobertos via sitemap.xml, robots.txt e crawling

#### Páginas públicas (200):
| Rota | Descrição |
|---|---|
| `/` | Home - Landing page da loja |
| `/loja` | Catálogo de jogos |
| `/loja/lovable` | Loja específica (Lovable) |
| `/loja/valorant` | Contas Valorant |
| `/loja/fortnite` | Contas Fortnite (636 contas, 27 páginas) |
| `/loja/roblox` | Contas Roblox |
| `/loja/steam` | Contas Steam (inclui CS2/CS:GO) |
| `/loja/league-of-legends` | Contas LoL |
| `/loja/genshin-impact` | Contas Genshin Impact |
| `/loja/clash-royale` | Contas Clash Royale |
| `/loja/brawl-stars` | Contas Brawl Stars |
| `/loja/rocket-league` | Contas Rocket League |
| `/loja/epic-games` | Contas Epic Games |
| `/loja/ea` | Contas EA |
| `/loja/ubisoft` | Contas Ubisoft |
| `/termos` | Termos de uso |
| `/ganhar` | Programa de afiliados/revenda |
| `/ranking` | Ranking de revendedores |
| `/docs/api` | Documentação completa da API REST |
| `/sitemap.xml` | Sitemap XML |
| `/robots.txt` | Robots.txt |
| `/api/v1` | API root (público) |
| `/api/health` | Health check |
| `/api/v1/openapi.json` | OpenAPI spec |

#### Páginas com redirect (307/308):
| Rota | Destino | Observação |
|---|---|---|
| `/dashboard` | `/auth/login?redirect=/dashboard` | Requer auth |
| `/dashboard/api` | `/auth/login?redirect=/dashboard/api` | Geração de chave API |
| `/carteira` | (200 - client-side render) | Wallet/carteira |
| `/painel/` | `/painel` (308) | Admin panel? (404 sem auth) |
| `/pedido/` | `/pedido` (308) | Order tracking |
| `/checkout/` | `/checkout` (308) | Checkout |

#### Páginas de auth:
| Rota | Descrição |
|---|---|
| `/auth/login` | Login (200, client-side rendered) |
| `/auth/sign-up` | Registro |

#### API Endpoints (v1):
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/v1` | Não | Root com docs da API |
| GET | `/api/v1/games` | Bearer | Lista jogos disponíveis |
| GET | `/api/v1/accounts?game={slug}` | Bearer | Lista contas (paginado) |
| GET | `/api/v1/accounts/{id}` | Bearer | Detalhe da conta |
| GET | `/api/v1/accounts/{id}/skins` | Bearer | Skins da conta |
| POST | `/api/v1/verify` | Bearer | Verificar conta |
| POST | `/api/v1/purchase` | Bearer | Comprar conta |
| GET | `/api/v1/wallet` | Bearer | Saldo da carteira |
| GET | `/api/v1/stats` | Bearer | Estatísticas |
| POST | `/api/v1/wallet/deposit` | Bearer | Criar depósito PIX |
| GET | `/api/v1/wallet/deposit/{id}` | Bearer | Status do depósito |
| GET | `/api/v1/orders` | Bearer | Listar pedidos |
| GET | `/api/v1/orders/{id}` | Bearer | Detalhe do pedido |
| POST | `/api/v1/orders/{id}/refund` | Bearer | Reembolso |
| GET | `/api/v1/coupons` | Bearer | Listar cupons |
| POST | `/api/v1/coupons` | Bearer | Criar cupom |
| GET | `/api/v1/coupons/{code}` | Bearer | Consultar cupom |
| DELETE | `/api/v1/coupons/{code}` | Bearer | Deletar cupom |

#### Rate limit: 120 req/min por chave  
#### Auth: Bearer token (formato: `lf_live_`)

## 6. OSINT

### Mídias Sociais
- **Instagram:** @legasforn (instagram.com/legasforn)
- **Discord:** discord.gg/p2v7Z2e79z (comunidade principal)
- **Discord Suporte:** discord.gg/rJxmA3EEBW
- **Google Analytics:** G-3HWDPFXDQF
- **Facebook Pixel:** 1520907099677757

### GitHub
- **Repositórios públicos:** 0
- **Código vazado:** Não encontrado

### Emails
- **Nenhum email corporativo encontrado** (domínio sem MX)
- **Nenhum email em breaches públicos** (domínio recente)

### Pessoas
- Nenhuma identificada (registro .br oculta dados do proprietário)

## 7. Cloud Buckets

### S3 (AWS)
Todas as variações testadas (legasforn, legasforn-assets, legasforn-backup, etc.) retornam 404/NoSuchBucket.

### Azure Blob
Todas as variações testadas retornam 404.

### Google Cloud Storage
Todas as variações testadas retornam 404.

### Conclusão
A aplicação usa **Supabase Storage** para assets, não buckets cloud públicos. Assets do site estão em `/_next/static/` e `/brand/`.

## 8. Wayback Machine / Internet Archive

- **Nenhum snapshot arquivado.** O domínio foi criado em 2026-05-19 e não tem histórico no Wayback Machine.
- `waybackurls`: 0 URLs encontradas
- `web.archive.org/cdx`: timeout sem resultados

## 9. CDN / Origem Real

- **IP público:** 69.46.46.84
- **Tipo:** Edge proxy da Railway (não é CDN tradicional)
- **Edge locations observadas:** mia1 (Miami?), iah1 (Houston?)
- **Origem real:** Não identificada (oculta pela Railway)
- **Não é Cloudflare** — Railway usa sua própria infraestrutura de edge

## 10. Takeover Candidates

- **Nenhum CNAME dangling encontrado**
- **Nenhum subdomínio com serviço externo não-configurado**
- Nameservers de DNS Parking indicam configuração estática de zona

## 11. Limitações e Observações

1. **Domínio recente** (2026-05-19) — limita severamente fontes históricas (crt.sh, Wayback, breaches)
2. **Cobertura de subdomínios limitada** — sem subdomínios públicos identificados; possível que existam subdomínios não públicos (DNS privado, service discovery via cliente)
3. **Subfinder desatualizado** (v2.6.6) — pode não suportar fontes mais recentes
4. **crt.sh retornando 502** — pode ser bloqueio temporário
5. **Supabase e Railway são plataformas gerenciadas** — a origem real (banco, backend API) está atrás dessas plataformas
6. **Shodan API key não configurada** — não foi possível fazer consulta detalhada ao IP
7. **GitHub API sem autenticação** — repositórios privados não são pesquisáveis
8. **Nenhum CNPJ encontrado** — empresa pode não ter cadastro formal ou não expõe publicamente

## 12. Próximos Passos Recomendados (Recon Ativo)

1. **Fuzz de subdomínios** (DNS brute force com wordlist grande via dnsx/ffuf) — dnsx com wordlist de subdomínios comuns
2. **Fuzz de diretórios** nas rotas identificadas (/api/v1/, /admin, /painel, /dashboard)
3. **Fuzz de parâmetros** nos endpoints API (especialmente /api/v1/coupons, /api/v1/accounts)
4. **Testar rate limiting** nas APIs públicas
5. **Investigar Supabase** — tentar identificar project ID via JS bundles ou subdomínios
6. **Testar autenticação** — tentar bypass via SQLi, NoSQLi, Mass Assignment em /auth/*
7. **Analisar o fluxo de pagamento PIX** (MisticPay) — busca por falhas de integridade
8. **Analisar o bundle JS** extraindo URLs de websocket Supabase (wss://*.supabase.co)
9. **Verificar se o openapi.json revela mais endpoints/documentação**
10. **Testar os endpoints de cupom** (criar/listar/deletar cupons sem auth ou com escalação de privilégio)