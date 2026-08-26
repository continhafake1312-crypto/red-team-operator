# Enumeração Profunda — fc-static.s3.amazonaws.com

## Resumo Executivo

O bucket S3 `fc-static.s3.amazonaws.com` é o CDN público da plataforma **FanCentro (mySocials)** — um serviço de conteúdo adulto por assinatura. O bucket contém **82.706 objetos** entre JS bundles, assets estáticos e HTML de SPA (Single Page Application).

**Risco: MÉDIO-ALTO** — bucket público com listagem habilitada. Embora não contenha secrets hardcoded, a exposição da estrutura completa de canais/deployments e os endpoints internos mapeados facilitam ataques à plataforma principal.

---

## 1. Bucket Discovery

### Informações do Bucket
| Propriedade | Valor |
|-------------|-------|
| Bucket | `fc-static.s3.amazonaws.com` |
| Região | `sa-east-1` (São Paulo) |
| ACL | **READ público** para `AllUsers` + `READ_ACP` |
| Bucket Policy | Bloqueado (AccessDenied) |
| Versioning | Bloqueado (AccessDenied) |
| CORS | Não configurado |
| Listagem via HTTP | ✅ Habilitada (XML) |
| Listagem via AWS CLI | ✅ Funciona sem autenticação |

### ACL Detalhada
```xml
<AccessControlPolicy>
  <Owner>
    <ID>90bb2c92d7633d74ba4d504f28001092de22cf52a9a5f26f9ca8e076429480d9</ID>
  </Owner>
  <AccessControlList>
    <Grant><Grantee xsi:type="CanonicalUser">...OWNER...</Grantee><Permission>FULL_CONTROL</Permission></Grant>
    <Grant><Grantee xsi:type="Group"><URI>http://acs.amazonaws.com/groups/global/AllUsers</URI></Grantee><Permission>READ</Permission></Grant>
    <Grant><Grantee xsi:type="Group"><URI>http://acs.amazonaws.com/groups/global/AllUsers</URI></Grantee><Permission>READ_ACP</Permission></Grant>
  </AccessControlList>
</AccessControlPolicy>
```

---

## 2. Estrutura do Bucket

### Prefixo Único
```
fcrct/
  └── channel{N}/
       └── {hash}/
            ├── index.html
            └── rstatic/
                 ├── assets/   (imagens, fonts, SVGs)
                 └── js/       (React chunks + bundles)
```

### Canais/Deployments (17 encontrados)

| Channel | Objetos | Observação |
|---------|---------|------------|
| channel1 | 571 | |
| channel2 | 9.298 | |
| channel4 | 553 | |
| channel8 | 556 | Usado no índice principal |
| channel10 | 14.459 | Maior volume de JS |
| channel11 | 17.744 | Maior volume total |
| channel12 | 553 | |
| channel13 | 558 | |
| channel14 | 539 | |
| channel15 | 1.106 | |
| channel16 | 553 | |
| channel17 | 553 | |
| channel18 | 15.892 | Segundo maior |
| channel20 | 6.124 | |
| channel25 | 12.523 | |
| channel26 | 553 | |
| channel40 | 571 | |
| **Total** | **82.706** | |

### Distribuição por Tipo
| Tipo | Quantidade |
|------|-----------|
| JS (bundles/chunks) | ~44.807 |
| Imagens/assets | ~28.166 |
| HTML (SPA entry) | 150 |
| CSS | 0 |
| JSON | 0 |

---

## 3. Conteúdos Sensíveis

### Arquivos Sensíveis
**Nenhum** arquivo sensível encontrado no bucket:
- ✅ Sem `.env`, `.env.example`
- ✅ Sem `.git/`, `config/`, `backup/`, `dump/`
- ✅ Sem `credentials`, `passwords`, `keys`
- ✅ Sem `database`, `sql`, `wp-config`
- ✅ Sem `robots.txt`, `sitemap.xml`
- ✅ Sem `.well-known/`
- ✅ Sem Swagger/OpenAPI specs

### Secrets Hardcoded em JS
- ✅ **Nenhum JWT token** hardcoded
- ✅ **Nenhuma AWS Key** (`AKIA*`)
- ✅ **Nenhuma Stripe Key** (`sk_live`, `pk_live`)
- ✅ **Nenhum GitHub token**
- ✅ **Nenhuma Base64 string longa** suspeita

---

## 4. Endpoints e Rotas Descobertas nos JS

### Domínios Relacionados ao Ecossistema FanCentro

| Domínio | Finalidade |
|---------|-----------|
| `fancentro.com` | Plataforma principal |
| `ht-st.centrofiles.com` | CDN estático alternativo |
| `help.fancentro.com` | Central de ajuda |
| `support.fancentro.com` | Suporte |
| `centrohelp.com/` | Site de ajuda |
| `translate.modelcentro.com/api` | API de tradução |
| `centroprofits.com/fancentro` | Programa de afiliados |
| `agency.fancentro.com/` | Portal de agências |
| `blog.fancentro.com/` | Blog |
| `el.fancentro.com/track/fcste` | Tracking de email |
| `d3aevasvptpofc.cloudfront.net` | CloudFront CDN |

### Domínios de Terceiros (Tracking/Ads)

| Domínio | Finalidade |
|---------|-----------|
| `ads.trafficjunky.net/tj_ads_pt` | Ads (TrafficJunky) |
| `ctrack.trafficjunky.net/ctrack` | Tracking de conversão |
| `ic.am/st/fbPixel.html` | Facebook Pixel |
| `ic.am/st/iframe.html` | Iframe tracking |

### Rotas Internas do Aplicativo (encontradas no bundle principal)

#### Páginas Públicas
```
/login              /registration       /passrecovery
/age-verification   /subscribe          /subscription-success
/cart               /payment            /payment/other
```

#### Feed e Descoberta
```
/discover           /discover/creators  /discover/influencers
/feed               /following          /stories
/creators           /influencers        /profiles
/search-result
```

#### Perfil e Conteúdo
```
/profile            /aboutme            /clips
/media              /timeline           /tips
/my-posts           /my-posts/recommended
/my-posts/trending  /my-clips/trending
/older-posts
```

#### Mensagens e Social
```
/dm                 /messages           /activity
/contacts           /achievements       /quests
/ranks
```

#### Comercial/Vendas
```
/sell               /whitelabel         /user-import
/subscriptions      /purchases          /library
/tips               /content-removal
```

#### Admin/Dashboard
```
/admin              /dashboard          /account
/settings
```

#### Páginas Legais
```
/terms              /privacy            /dmca
/2257               /cookie-policy      /cookie-table
/california-privacy-rights               /agreement
/fan-creator-agreement                   /fan-influencer-agreement
/jugendschutzbeauftragter
```

#### Promocionais/Temporários
```
/supportukraine     /nowar              /eurofloods
/hasselt2023        /twl2023            /venus2023
/xbiz2023           /our-history        /press
```

#### API/Tracking Endpoints
```
/frontendEvent/logError          — Error logging (POST)
/statisticWriter/logUsersAction/ — User activity tracking
/userStatus/counters             — User status counters
/trck-v1                         — Tracking API v1
```

### Pagamento/Checkout
```
/payment
/payment/other
/cart
/subscribe
/subscription-success
/subscriptions
/purchases
```

---

## 5. Análise de JavaScript

### Frameworks Identificados
- **React** (versão moderna com Hooks/Fiber)
- **MobX** (state management)
- **React Router** (rotas SPA)
- **Webpack** (code splitting com chunks numerados: `30.xxx.js`, `432.xxx.js`)
- **UploadCare** (upload de arquivos)
- **Centrifuge** (WebSocket/realtime)

### Chunks Baixados e Analisados

| Arquivo | Tamanho | Conteúdo |
|---------|---------|----------|
| `main.2d068dc2.js` | 1.027.971 | Bundle principal (React + MobX + Router + utils) |
| `runtime~main.2d068dc2.js` | 353 | Runtime chunk (vazio - 404 real) |
| `30.7cd3804a.js` | 592.915 | Chunk de utilities/state |
| `432.d580b090.js` | 89.558 | Chunk de componentes |
| `profile_root.d785430c.js` | 167.767 | Página de perfil |
| `promo_messages_page.a4ad265a.js` | 968.832 | Página de mensagens (maior chunk) |
| `promo_payment_page.fb134602.js` | 250.608 | Página de pagamento |
| `promo_settings_page.536c1216.js` | 157.748 | Página de configurações |
| `5396.4150fafe.js` | 40.852 | Chunk de utilidades |

### Hallazgos de Seguridad en JS
- **Nenhuma credencial hardcoded** encontrada
- API calls são abstraídas (provavelmente via service layer)
- Tracking endpoints expostos no frontend: `/frontendEvent/logError`, `/statisticWriter/logUsersAction/`, `/trck-v1`
- Possível endpoint de admin: `/admin`, `/dashboard`

---

## 6. Configuração de Segurança do Bucket

### ACHOU CRÍTICO: Bucket Público com Listagem Habilitada
- ✅ Qualquer pessoa pode **listar** todos os objetos do bucket
- ✅ Qualquer pessoa pode **ler** qualquer objeto
- ❌ Bucket Policy bloqueia acesso a `?policy`, `?versioning`, `?location`
- ❌ CORS não configurado (padrão AWS)
- ✅ ACL explicitamente define `AllUsers: READ`

### Recomendações Imediatas
1. **Desabilitar listagem pública** (remover permissão `READ` do `AllUsers`)
2. **Remover `READ_ACP`** do `AllUsers` na ACL
3. **Implementar CORS** com origens permitidas específicas
4. **Usar Block Public Access** da AWS S3
5. **Considerar migrar para CloudFront** com Origin Access Identity (OAI)

---

## 7. Artefatos Salvos

| Arquivo | Descrição |
|---------|-----------|
| `s3_listing_root.txt` | Listagem raiz do bucket |
| `s3_listing_recursive.txt` | Listagem recursiva completa (82.706 linhas) |
| `bucket_listing_http_root.txt` | XML da listagem HTTP root |
| `bucket_listing_http_js.txt` | Prefixo `js/` (vazio) |
| `bucket_listing_http_css.txt` | Prefixo `css/` (vazio) |
| `bucket_listing_http_assets.txt` | Prefixo `assets/` (vazio) |
| `bucket_listing_http_images.txt` | Prefixo `images/` (vazio) |
| `bucket_listing_http_fonts.txt` | Prefixo `fonts/` (vazio) |
| `channels_found.txt` | Lista de 17 canais/deployments |
| `html_files.txt` | Lista de 150 arquivos HTML |
| `cors_check.txt` | CORS headers (vazio - não configurado) |
| `bucket_policy.txt` | Resposta do `?policy` (AccessDenied) |
| `bucket_acl.txt` | ACL pública confirmada |
| `bucket_versioning.txt` | Versioning (AccessDenied) |
| `index_html_analysis.txt` | Conteúdo do index.html |
| `main_channel8.js` | Bundle principal (1MB) |
| `runtime_channel8.js` | Runtime (arquivo real 404) |
| `endpoints_from_main_js.txt` | Endpoints extraídos do JS |
| `all_endpoints_from_js.txt` | 122 endpoints únicos consolidados |
| `js_analysis_detailed.txt` | Análise detalhada dos JS baixados |
| `sensitive_files_search.txt` | Busca por arquivos sensíveis (vazio) |
| `base64_strings.txt` | Strings Base64 longas (vazio) |
| `all_urls_js.txt` | Todas as URLs encontradas nos JS |

---

## 8. Attack Surface — Próximos Passos

### Candidatos a Vulnerabilidade

| Alvo | Vetor | Prioridade |
|------|-------|-----------|
| `fancentro.com` | Webapp principal — testar todas as rotas mapeadas | **ALTA** |
| `fancentro.com/admin` | Admin panel — testar acesso não autorizado | **ALTA** |
| `fancentro.com/dashboard` | Dashboard — IDOR? | **ALTA** |
| `fancentro.com/api/*` | API não documentada — fuzzing | **ALTA** |
| `fancentro.com/payment` | Lógica de pagamento — testar bypass | **MÉDIA** |
| `fancentro.com/dm` | Mensagens diretas — IDOR? | **MÉDIA** |
| `fancentro.com/trck-v1` | Tracking API — injection? | **MÉDIA** |
| `fancentro.com/frontendEvent/logError` | Error logging — SSRF? log injection? | **MÉDIA** |
| `ht-st.centrofiles.com` | CDN alternativo — CORS aberto (`*`) | **BAIXA** |
| `translate.modelcentro.com/api` | Translation API — testar injection | **MÉDIA** |
| `d3aevasvptpofc.cloudfront.net` | CloudFront — testar configuração | **BAIXA** |
| `centroprofits.com/fancentro` | Affiliate — testar SSRF/Open Redirect | **BAIXA** |

### Rotas Críticas para Testar
```
GET  /admin                    — Acesso não autorizado?
GET  /dashboard                — IDOR em user IDs?
GET  /api/                     — Descoberta de API
GET  /graphql                  — GraphQL introspection
POST /frontendEvent/logError   — log injection/SSRF
POST /statisticWriter/logUsersAction/ — data injection
GET  /userStatus/counters      — Information disclosure
POST /trck-v1                  — Tracking injection
```

### Observações Finais

1. **Bucket é um mirror estático** — contém apenas assets de frontend (React SPA)
2. **Sem dados sensíveis no bucket** — mas a exposição da estrutura de canais permite entender o deployment pipeline
3. **A plataforma real está em `fancentro.com`** — todas as rotas mapeadas nos JS devem ser testadas lá
4. **CDN alternativo `ht-st.centrofiles.com`** tem CORS aberto (`*`) — possível para exfiltração
5. **Tracking/analytics endpoints expostos** podem ser explorados para injeção de dados ou SSRF

---

*Gerado em 2026-08-26 pelo agente enum — Enumeração Profunda*