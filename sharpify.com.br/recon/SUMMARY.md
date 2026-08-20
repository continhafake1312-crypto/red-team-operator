# Attack Surface Summary — sharpify.com.br

**Atualizado**: 2026-08-20T05:35:00Z

---

## Ranking de Payoff (§16)

### 🔴 ALTO (ações imediatas)
| # | Vetor | Host | Payoff | Status |
|---|-------|------|--------|--------|
| 1 | **Documentação API privada exposta** (F-001) | docs.sharpify.com.br | Mapeamento total de endpoints + auth schema + schemas TS — prepara todos os ataques seguintes | 🔍 Descoberto |
| 2 | **Export IA /docs/ai** (F-001) | docs.sharpify.com.br | 267k chars de documentação com schemas completos, tipos, endpoints | 🔍 Descoberto |
| 3 | **MinIO S3 storage** (F-002) | cdn.sharpify.com.br | Bucket público `sharpify-public` + admin API responde. Potencial acesso a dados de clientes/uploads | 🔍 Descoberto |
| 4 | **CORS permissivo + headers expostos** (F-005) | api.sharpify.com.br | `games-admin-token`, `2fa-temporary-token` expostos — indica tokens de admin/2FA | 🔍 Descoberto |
| 5 | **Endpoint checkout/payment-link/get** | api.sharpify.com.br | Retorna 400 (não 401) — endpoint financeiro potencialmente público | 🔍 Descoberto |

### 🟡 MÉDIO
| # | Vetor | Host | Payoff | Status |
|---|-------|------|--------|--------|
| 6 | **API Express pública** | api.sharpify.com.br | Endpoints REST descobertos por fuzzing podem levar a IDOR/SSRF | ⏳ Pendente |
| 7 | **Buckets S3 restritos** | sharpify-assets, backup, dev | 403 agora — podem ter permissão incorreta em paths específicos | ⏳ Pendente |
| 8 | **JS bundles Next.js** | sharpify.com.br, docs.sharpify.com.br | API keys, rotas internas, secrets hardcoded | ⏳ Pendente |
| 9 | **Subdomínios não resolvem** | admin, app, dev, stage, blog, portal | Possível CNAME dangling para takeover | 🔍 Descoberto (F-004) |

### 🔵 BAIXO / INFO
| # | Vetor | Host | Payoff | Status |
|---|-------|------|--------|--------|
| 10 | **Cloudflare bypass** | sharpify.com.br | IP real do servidor — permitiria ataques diretos sem WAF | ⏳ Pendente |
| 11 | **MinIO HostId vazado** | dd9025bab4... | Shodan/Censys search pelo HostId pode revelar IP real | 🔍 Descoberto |
| 12 | **Favicon hash** | -211306992 | Correlação Shodan | 🔍 Descoberto |

---

## Resumo da Attack Surface

| Categoria | Total | Notas |
|-----------|-------|-------|
| Subdomínios encontrados | 15 | 8 resolvem, 2 vivos |
| Hosts vivos | 4 | sharpify.com.br, docs.*, api.*, cdn.* |
| Serviços web | 4 | Next.js (x2), Express, MinIO |
| Buckets S3 | 4 | 1 público, 3 restritos 403 |
| Endpoints API documentados | 18 | Catálogo, Checkout, Financeiro, Webhook |
| Portas abertas (via Cloudflare) | 1 | 443 (todos os hosts) |
| IP real do servidor | ❌ Não encontrado | Todos mascados por Cloudflare |
| WAF | Cloudflare | JS challenge + rate limit |
| TLS Grade | A | Válido |

## Próximas Ações Imediatas

1. 🔴 **Extrair** URLs completas dos 18 endpoints da documentação/export IA
2. 🔴 **Fuzzear** api.sharpify.com.br com wordlist REST baseada nos endpoints documentados
3. 🔴 **Testar** `/api/v1/checkout/payment-link/get` com parâmetros de payload
4. 🟡 **Analisar** JS bundles do Next.js (docs e main) por hardcoded secrets
5. 🟡 **Tentar** acesso ao MinIO via S3 API assinada no bucket `sharpify-public`
6. 🟡 **Verificar** CNAMEs de subdomínios não-resolvidos para takeover