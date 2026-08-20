# Recon Ativo — sharpify.com.br

**Data**: 2026-08-20T05:35:00Z
**Status**: COMPLETE

## 1. Hosts Diretos (fora CDN)

**Nenhum encontrado.** Todos os subdomínios vivos estão por trás de Cloudflare.

| IP | Função |
|----|--------|
| 104.26.2.14 | Cloudflare (sharpify.com.br) |
| 104.26.3.14 | Cloudflare (sharpify.com.br) |
| 172.67.68.180 | Cloudflare (sharpify.com.br) |
| 109.70.100.5 | Tor exit node (NÃO é o servidor real) |

## 2. Portscan (IP 109.70.100.5)

O IP 109.70.100.5 é um Tor exit node, não o servidor real. Nmap via Tor é bloqueado/CONNECT time out. Cloudflare mascara todos os IPs de origem.

## 3. Exploração de Serviços

### MinIO (cdn.sharpify.com.br)
| Item | Resultado |
|------|-----------|
| Porta 443 (Cloudflare) | ✅ Responde |
| Porta 9000 (S3 API) | ❌ Bloqueada por Cloudflare |
| Porta 9001 (Console) | ❌ Bloqueada por Cloudflare |
| Admin API | `/minio/admin/v3/` responde com `mode-server-xl-single` |
| Bucket sharpify-public | ✅ Acessível via docs (imagens estáticas) |
| Buckets sharpify-assets/backup/dev | ❌ 403 Forbidden |
| MinIO HostId vazado | `dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af9251148b658df7ac2e3e8` |

### API Docs (docs.sharpify.com.br)
| Item | Resultado |
|------|-----------|
| Documentação privada | ✅ Exposta em `/docs/api-reference-privado/` com 18 endpoints |
| Export IA | ✅ `/docs/ai` expõe documentação markdown completa (267k chars) |
| Auth schema | `x-sharpify-client-id` + `x-sharpify-client-secret` + permissão |
| Stack | Next.js (ISR + SSG), Cloudflare |
| TLS | Grade A (TLS 1.2/1.3, ECDHE + AES-GCM/CHACHA20) |

### API Express (api.sharpify.com.br)
| Item | Resultado |
|------|-----------|
| Endpoint discovery | `/api/v1/checkout/payment-link/get` retorna 400 (não 401) — pode ser público com parâmetros |
| CORS | Permissivo — origens abertas, headers expostos customizados |
| Headers expostos via CORS | `games-admin-token`, `2fa-temporary-token` |
| Stack | Express/Node.js (x-powered-by header) |

## 4. WAF Detection
- **Cloudflare WAF** (JS challenge, rate limiting, cf-mitigated)
- WAF ativo impede requests diretos para portas não-http
- 2Captcha necessário para bypass

## 5. TLS Assessment
- **Grade**: A
- **Protocolos**: TLS 1.2, TLS 1.3
- **Cifras**: ECDHE + AES-GCM/CHACHA20-POLY1305 (fortes)
- **Certificado**: Google Trust Services (GTS) — válido

## 6. Subdomain Takeover
- **Nenhum encontrado.** Todos os CNAMEs são válidos para Cloudflare.
- AXFR bloqueado (zonetransfer negado).

## 7. Findings

### F-001 (Elevado para CRÍTICO): Documentação API Privada Exposta
- **Alvo**: `docs.sharpify.com.br/docs/api-reference-privado/`
- **Severidade**: Crítica
- **18 endpoints privados documentados** incluindo Catálogo (12), Checkout (4), Financeiro (2), Webhook (3)
- **Export IA**: `/docs/ai` com 267k chars de documentação contendo schemas TypeScript e auth
- **Auth schema completo**: `x-sharpify-client-id` + `x-sharpify-client-secret` + nível de permissão

### F-002 (Confirmado MÉDIO): MinIO Exposto
- **Alvo**: `cdn.sharpify.com.br`
- **Severidade**: Média (não foi possível acesso direto)
- **Admin API**: `GET /minio/admin/v3/` responde com `mode-server-xl-single`
- **Bucket público**: `sharpify-public`
- **MinIO HostId**: `dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af9251148b658df7ac2e3e8`

### F-005 (NOVO MÉDIO): CORS Permissivo na API
- **Alvo**: `api.sharpify.com.br`
- **Severidade**: Média
- **Headers customizados expostos**: `games-admin-token`, `2fa-temporary-token`
- **Origem**: qualquer origem permitida (Access-Control-Allow-Origin: *)

## 8. Próximos Passos
1. Extrair e analisar endpoints documentados (F-001) — preparar ataque
2. Testar `/api/v1/checkout/payment-link/get` com parâmetros
3. Enumerar api.sharpify.com.br com wordlist REST
4. Cloudflare origin bypass via SecurityTrails/CriminalIP
5. Analisar JS bundles do Next.js (docs e main site)
6. Testar bucket sharpify-public via S3 API (signatures v2/v4)
7. Verificar MinIO HostId em Shodan/Censys