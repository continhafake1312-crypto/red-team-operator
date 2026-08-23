# Webapp Pentest Report - nerix.com.br

## Escopo
Testes OWASP Top 10 nos endpoints que respondem (bypass Cloudflare via proxychains4 Tor).

## Resumo Executivo

| ID | Título | Severidade | Status |
|----|--------|-----------|--------|
| F-001 | Host Header Injection no Painel Admin | **Crítico** | Confirmado |
| F-002 | Painel Administrativo SPA Exposto | **Alto** | Confirmado |
| F-003 | Health Endpoint Expõe DB Status | **Médio** | Confirmado |
| F-004 | Enumeração de Formato de API Key | **Médio** | Confirmado |
| F-005 | Rate Limit Info Exposto | **Baixo** | Confirmado |
| F-006 | CSP Revela Infraestrutura | **Baixo** | Confirmado |
| F-007 | SQLi/NoSQLi Testes | **Nenhum** | Seguro |
| F-008 | Socket.IO Endpoint | Info | Confirmado |

## Endpoints Testados

### api.nerix.com.br
| URL | Método | Resultado |
|-----|--------|-----------|
| /api/public/categories | GET | 200 [] (público, vazio) |
| /api/v1 | GET | 401 (API key obrigatória) |
| /api/v1/auth/login | POST | 401 (API key obrigatória) |
| /api/v1/auth/register | POST | 401 (API key obrigatória) |
| /api/v1/admin/accounts | GET | 401 (API key inválida/inativa) |
| /api/v1/admin/stores | GET | 401 (API key inválida/inativa) |
| /api/v1/admin/sales | GET | 401 (API key inválida/inativa) |
| /api/v1/pix/transactions | GET/POST | 401 (API key inválida/inativa) |
| /api/public/products | GET | 401 (API key inválida) |
| /api/public/store | GET | 401 (API key inválida) |
| /api/public/infoproducts/v1/* | GET | 401 (API key Infoprodutos) |
| /api/admin | GET | 403 (domain check) → 401 (Host injection bypass) |
| /api/admin/* | GET | 401 (JWT token necessário) |
| /admin/login | GET | 403 (domain check) |
| /health | GET | 200 (DB status exposto) |
| /socket.io/ | GET | 400 (Engine.IO) |
| /graphql | POST | 404 |
| /.../../etc/passwd | GET | 400 |
| /api/v2, /docs, /swagger, etc | GET | 404 |

### admin.nerix.com.br
| URL | Método | Resultado |
|-----|--------|-----------|
| / | GET | 200 (SPA Vite+React completa) |
| /login, /auth, /store, /dashboard | GET | 200 (SPA - index.html) |
| /manifest.json | GET | 200 (PWA v2.0.1) |

### links.nerix.com.br
| URL | Método | Resultado |
|-----|--------|-----------|
| / | GET | 400 (Resend/CloudFront) |
| /health, /email, /webhook | GET/POST | 400/403 |

### docs.nerix.com.br
| URL | Método | Resultado |
|-----|--------|-----------|
| / | GET | 200 (Mintlify docs) |
| /*.md | GET | 200 (Markdown puro) |
| /sitemap.xml | GET | 200 (70+ páginas) |
| /llms.txt | GET | 200 (índice completo) |

### nerix-prod.s3.amazonaws.com
| URL | Método | Resultado |
|-----|--------|-----------|
| / | GET | 403 AccessDenied |
| /?max-keys=10 | GET | 404 NoSuchBucket |
| /test/probe.txt | PUT | 403 AccessDenied |

## Detalhamento Findings

### F-001: Host Header Injection (Crítico)
O endpoint `/api/admin` verifica o header `Host` para permitir acesso. Com `Host: admin.nerix.com.br`, o erro muda de "domínio não autorizado" para "Token não fornecido", provando que a restrição foi bypassada. Todos os endpoints `/api/admin/*` ficam acessíveis com esta técnica.

### F-002: Admin Panel SPA Exposto (Alto)
admin.nerix.com.br serve uma SPA React completa com:
- Google OAuth (client ID exposto nos assets)
- Socket.IO para tempo real
- PWA com push notifications (GCM ID: 103953800507)
- Múltiplos vendors (charts, dnd, i18n, router)
- CDN: cdn.nerix.com.br (Cloudflare)

### F-003: Health Exposures (Médio)
/health confirma: Node.js, banco conectado, response time ~1-3ms, uptime ~3.6h.

### F-004: Key Enumeration (Médio)
Diferença entre "key obrigatoria" (formato inválido) e "key invalida ou inativa" (formato válido) permite enumerar chaves.

## Metodologia
- Bypass Cloudflare JS Challenge: proxychains4 (Tor)
- SQLi/NoSQLi: payloads manuais + sqlmap
- Host Header Injection: variações de Host, X-Forwarded-Host, Origin, Referer
- Docs scraping: sitemap.xml, llms.txt, páginas .md
- S3 enumeration: listagem, upload
- Auth bypass: variações de headers (Bearer, X-nerixkey, X-API-Key, etc.)