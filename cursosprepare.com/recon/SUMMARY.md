# recon/SUMMARY.md — Attack Surface Consolidada — cursosprepare.com

> Fase 4 (consolidação preliminar após Fase 2; atualizada após Fase 3). Ranking de payoff §16.

## Hosts vivos
| Host | IP | Origem | Server | Stack |
|---|---|---|---|---|
| cursosprepare.com (apex) | 185.230.63.171/.186/.107 | Wix (ASN 58182) | Pepyaka | Wix managed, React, Google Cloud CDN, HSTS, HTTP/3 |
| www.cursosprepare.com | 34.149.87.45 | Google Cloud (via CNAME cdn1.wixdns.net) | Pepyaka | Wix managed, React, Google Cloud CDN, HSTS, HTTP/3 |

- **Wix site ID (live):** metaSiteId `dcffb6fe-b153-4b2e-bd44-5de8281fcb28`, siteId `874f21d1-94df-4a61-ab4b-4b1fd286f157`
- **Wix site ID (histórico):** metaSiteId `4efed923-849a-4ac1-89ee-6da911368879` (possível migração/config exposta)
- **TPA apps:** Wix Stores, Wix Bookings, Wix Members, Wix Members Area, Wix Online Programs, Wix Pricing Plans
- **Sentry DSN exposto:** `0fd2930120484402ac9adfb9e05cacd5@o37417.ingest.sentry.io`
- **WWW bloqueia Tor exit (403)** — bypass necessário (2Captcha / UA real / proxy residencial).

## OSINT (alto valor)
- **Empresa:** Prepare Cursos Preparatórios LTDA — CNPJ 48.908.380/0001-93 — Santa Maria/RS — Tel/WhatsApp (55) 99100-9544
- **Dono:** Luis Guilherme Leite Martins (registrante WHOIS, Coordenador Pedagógico). Diretora Ana Paula Martins.
- **Equipe:** 17 pessoas com funções (`recon/passive/osint_people.txt`)
- **Email confirmado:** `cursoprepare@cursoprepare.com` (domínio de email relacionado `cursoprepare.com`, Google Workspace)
- **40 emails candidatos** não validados (`recon/passive/osint_emails.txt`)
- **Domínio relacionado:** `pgfconcursos.com` (estacionado)

## Endpoints/rotas sensíveis (wayback + sitemaps)
- 30 `/challenge-page/<UUID>` (Wix Online Programs — cursos pagos; UUIDs em `sm_online-programs.xml`) — **IDOR potential HIGH**
- `/payment-request-page` — Wix Payment Request (IDOR de cobrança)
- `/cursosead` — portal EAD (HIGH VALUE, conteúdo autenticado)
- `/afiliados`, `/inscricao`, `/inscreva-se`, `/agenda`, `/book-online`
- 9 `/product-page/<slug>` (Wix Stores), 7 `/category/`, `/service-page/<cidade>`
- Wix APIs: `/_api/wix-ecommerce-storefront-web/`, `/_api/wix-bookings-web/`, `/_api/members/v1/`

## Cloud / Takeover
- S3: nenhum bucket. GCP: inconclusivo (Tor geo-block). Azure: nenhum. Takeover: nenhum.

## Ranking de PAYOFF (re-priorizado §16)
| Rank | Payoff | Vetor | Especialista | Status |
|---|---|---|---|---|
| 1 | ALTO | IDOR Online Programs — 30 challenge-page/<UUID> (acesso a conteúdo pago) | webapp | pendente |
| 2 | ALTO | Wix Stores/Bookings/Members API — IDOR pedidos/membros/agendamentos | webapp | pendente |
| 3 | ALTO | /payment-request-page — IDOR cobrança | webapp | pendente |
| 4 | ALTO | /cursosead portal EAD — auth bypass | webapp | pendente |
| 5 | MÉDIO | Wix CVEs (Stores/Bookings/Members por revisão) | cve | pendente |
| 6 | MÉDIO | OSINT cred-stuffing (17 pessoas + email Google Workspace) | exploit | pendente |
| 7 | MÉDIO | Breaches de emails (HIBP/DeHashed) | osint | pendente |
| 8 | MÉDIO | Wix Members login — auth bypass / JWT | webapp | pendente |
| 9 | BAIXO | DMARC ausente (hardening) | report | pendente |
| 10 | BAIXO | Sentry DSN exposto (info) | report | pendente |
| 11 | BAIXO | Cloud GCP buckets (re-teste sem Tor) | cloud | pendente |

## Próximas fases
- Fase 3 (recon ativo): portscan dos 2 IPs, WAF, TLS, vhost brute (valor limitado — Wix managed). Bypass Tor block em www.
- Fase 5 (enum): Wix APIs schema, content discovery, JS analysis, params.
- Fase 6 (webapp): IDOR ranking 1-4, auth bypass.
- OSINT paralelo: validar 40 emails (SMTP RCPT), breaches, GitHub.
