# Attack Surface — bagy.com.br

**Consolidado em:** 2026-08-20T06:30:00Z
**Baseado em:** Recon passivo + OSINT + Recon ativo + CVE Research

---

## Ranking de Payoff (§16)

### Nível 1 — CRÍTICO (Explorar IMEDIATAMENTE)

| # | Vetor | Tipo | Payoff | Próximo Passo |
|---|-------|------|--------|---------------|
| 1 | **pixel.bagy.com.br** → pixel.hotmart.com | **Takeover (CRÍTICO)** | Domínio bagy.com.br controlável por terceiros | F-001 — validar registro Hotmart |
| 2 | **staging.bagy.com.br** → Elastic Beanstalk | **Takeover (ALTO)** | Subdomínio staging controlável por terceiros | F-002 — criar EB environment AWS |

### Nível 2 — ALTA (Explorar em paralelo)

| # | Vetor | Tipo | Payoff | Próximo Passo |
|---|-------|------|--------|---------------|
| 3 | **server.bagy.com.br** (35.199.71.234) | **Golang HTTP oculto + Traefik** | Serviço GCP sem CDN; Traefik default cert exposto; pode conter dashboard/API | Fuzzing de paths; testar /dashboard/ /healthz/ /api/ |
| 4 | **on.bagy.com.br** (WordPress 7.0.4) | **CMS público** | WordPress + Elementor 3.23.1 + Oxygen (versão desconhecida) | WPScan; CVE-2024-4662 (Oxygen RCE 8.8); enum de plugins/users |
| 5 | **api-lb.bagy.com.br** (35.244.147.218) | **API Load Balancer** | GCP LB com Google Frontend (403) | Vhost discovery; fuzzing endpoints com Host headers internos |
| 6 | **painel.bagy.com.br** (IP origem 198.202.211.1) | **Painel admin** | IP real conhecido (Locaweb) | Bypass Cloudflare via IP direto; testar creds default; login brute force |
| 7 | **OpenID Configuration** (/.well-known/openid-configuration) | **SSO exposto** | Endpoints de autenticação abertos | Extrair client IDs, scopes, redirect URIs; testar SSRF/OAuth misconfig |

### Nível 3 — MÉDIA

| # | Vetor | Tipo | Payoff | Próximo Passo |
|---|-------|------|--------|---------------|
| 8 | **homolog*.bagy.com.br** (GoCache) | **Staging exposto** | Ambientes sem Cloudflare | Fuzzing vhosts; buscar endpoints admin |
| 9 | **minhaassinatura.bagy.com.br** | **Portal de assinantes** | Apache + Bootstrap | Creds default; IDOR em assinaturas |
| 10 | **updates.bagy.com.br** (AWS ALB) | **AnnounceKit** | AWS ALB público | Testar API AnnounceKit |
| 11 | **temas.bagy.com.br** (nginx/Azion) | **Loja de temas** | Nginx | Fuzzing endpoints; upload themes? |
| 12 | **DMARC p=quarantine pct=20** | **Email spoofing** | 80% emails aceitos sem DMARC | Spoofing de email de suporte@bagy.com.br |
| 13 | **CAA não configurado** | **TLS misconfig** | Qualquer CA pode emitir certs para bagy.com.br | Emissão não-autorizada de certificados |
| 14 | **Traefik default cert** (35.199.71.234) | **Info disclosure** | Nome interno do cluster Kubernetes/Traefik vazado | Mapeamento de infra |

### Nível 4 — BAIXA / INFO

| # | Vetor | Tipo | Payoff | Próximo Passo |
|---|-------|------|--------|---------------|
| 15 | **ig.bagy.com.br** (Firebase) | **App Firebase** | Config Firebase exposta? | Verificar Firestore/DB aberto |
| 16 | **manuais.bagy.com.br** (GitHub Pages) | **Docs interno** | VuePress | Procurar info sensible em docs |
| 17 | **basedeconhecimento.bagy.com.br** (Zendesk) | **KB pública** | Zendesk | IDOR em tickets? |
| 18 | **materiais.bagy.com.br** (HubSpot) | **Marketing** | HubSpot CMS | Testar upload/forms |

---

## Tabela de Hosts Vivos (38)

| Host | IP Real | CDN/WAF | Tech Stack |
|------|---------|---------|------------|
| bagy.com.br | 104.21.65.25, 172.67.139.221 | Cloudflare | Redireciona para www |
| www.bagy.com.br | 179.191.169.81 (Azion) | Azion Edge + Cloudflare | Webflow |
| painel.bagy.com.br | 198.202.211.1 (origem) | Cloudflare | Webflow Dashboard |
| loja.bagy.com.br | 179.191.169.57 (Azion) | Azion Edge | Dooca/Tray |
| temas.bagy.com.br | 179.191.169.* (Azion) | Azion Edge | Nginx (Loja de Temas) |
| on.bagy.com.br | 104.21.65.25 | Cloudflare | WordPress 7.0.4 + Elementor 3.23.1 + Oxygen |
| status.bagy.com.br | 13.227.110.x | CloudFront + Cloudflare | Atlassian Statuspage |
| ig.bagy.com.br | 151.101.1.195 | Fastly | Firebase + Mapbox |
| basedeconhecimento.bagy.com.br | 216.198.53.2 | Cloudflare → Zendesk | Zendesk Guide |
| manuais.bagy.com.br | 185.199.110.153 | Fastly → GitHub Pages | VuePress |
| updates.bagy.com.br | 3.234.124.213 | AWS ALB | AnnounceKit |
| api-lb.bagy.com.br | 35.244.147.218 | Google Cloud LB | Google Frontend |
| server.bagy.com.br | 35.199.71.234 | Nenhum (GCP) | Golang net/http + Traefik |
| elastic.bagy.com.br | 35.247.248.40 | Nenhum (GCP) | (Filtrado) |
| metabagy.bagy.com.br | 35.227.98.237 | Nenhum (GCP) | (Filtrado) |
| homolog.bagy.com.br | 170.82.173.x | GoCache | OpenResty |
| homolog-assine.bagy.com.br | 170.82.174.x | GoCache | OpenResty |
| minhaassinatura.bagy.com.br | Cloudflare IP | Apache | Apache + Bootstrap |
| materiais.bagy.com.br | 199.60.103.x | Cloudflare → HubSpot | HubSpot CMS |
| ajuda.bagy.com.br | 104.18.40.47 | Cloudflare → GitBook | GitBook |
| suporte.bagy.com.br | 104.18.40.47 | Cloudflare → GitBook | GitBook |
| blog.bagy.com.br | 104.21.65.25 | Cloudflare | Redireciona? |
| checkout.bagy.com.br | 104.21.65.25 | Cloudflare | Checkout |
| promo.bagy.com.br | 104.21.65.25 | Cloudflare | Página promocional |
| comprar.bagy.com.br | 216.239.x.x | Google Services | Google |
| comprar2.bagy.com.br | 216.239.x.x | Google Services | Google |
| bagyshop.bagy.com.br | 216.239.x.x | Google Services | Google |
| assine.bagy.com.br | 104.21.65.25 | Cloudflare | Página de assinatura |
| bio.bagy.com.br | 104.21.65.25 | Cloudflare | Bio page |
| sites.bagy.com.br | 104.21.65.25 | Cloudflare | |
| site.bagy.com.br | 104.21.65.25 | Cloudflare | |
| soureicdn.bagy.com.br | 104.18.26.21 | Cloudflare → SoureCDN | CDN |
| waster-server.bagy.com.br | 104.18.26.21 | Cloudflare → Waster | CDN |
| tm.bagy.com.br | 216.239.x.x | Google Services | |
| www.tm.bagy.com.br | 172.217.29.243 | Google Hosted | |
| testimonial.bagy.com.br | 104.21.65.25 | Cloudflare | |
| helium.bagy.com.br | 142.251.133.83 | Google Hosted | |
| teste-api.bagy.com.br | 142.251.133.83 | Google Hosted | |
| temas-staging.bagy.com.br | 179.191.169.* | Azion Edge | Azion default |
| maratona.bagy.com.br | 162.241.217.99 | GoDaddy | Página estática |

---

## Findings Confirmados

| ID | Título | Severidade | Status |
|----|--------|-----------|--------|
| F-001 | Takeover pixel.bagy.com.br (pixel.hotmart.com NXDOMAIN) | **Crítica** | ✅ Confirmado |
| F-002 | Takeover staging.bagy.com.br (Elastic Beanstalk NXDOMAIN) | **Alta** | ✅ Confirmado |
| — | WordPress 7.0.4 exposto (on.bagy.com.br) | **Alta** | 🔍 Em análise |
| — | OpenID Configuration exposto | **Alta** | 🔍 Em análise |
| — | Traefik default cert + nome interno vazado | **Média** | 🔍 Em análise |
| — | DMARC p=quarantine pct=20 (80% spoofável) | **Média** | 🔍 Em análise |
| — | CAA não configurado | **Média** | 🔍 Em análise |
| — | Elementor 3.23.1 desatualizado (7 CVEs XSS) | **Média** | 🔍 Em análise |

---

## Próximos Passos Imediatos

### Fase 5 — Enumeração Profunda (delegar enum)
1. **server.bagy.com.br** — fuzzing paths (wordlist comum + API + Kubernetes)
2. **api-lb.bagy.com.br** — fuzzing vhosts + endpoints
3. **on.bagy.com.br** — WPScan + detalhamento de plugins/versões
4. **painel.bagy.com.br** — testar IP origem direto (198.202.211.1)
5. **homolog*.bagy.com.br** — fuzzing vhosts GoCache
6. **ig.bagy.com.br** — análise Firebase (database aberto? auth config?)
7. **openid-configuration** — extrair endpoints e testar

### Fase 6 — Ataque Webapp (delegar webapp)
8. **WordPress** — brute force xmlrpc, CVE-2024-4662 Oxygen RCE
9. **Painel** — creds default, auth bypass
10. **API** — GraphQL introspection, SSRF, IDOR
11. **Zendesk** — IDOR, ticket enumeration
12. **Firebase** — database regras abertas

### Fase 7 — Pós-exploração (se foothold)
13. **Loot** — creds, sessions, tokens
14. **Pivoting** — interno

---

*Ataque surface consolidado em 2026-08-20T06:30:00Z*