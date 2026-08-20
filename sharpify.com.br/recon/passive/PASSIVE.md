# Recon Passivo — sharpify.com.br

**Data**: 2026-08-20T05:30:00Z
**Status**: COMPLETE

## 1. DNS / WHOIS

| Item | Valor |
|------|-------|
| Domínio | sharpify.com.br |
| Criado | 2025-09-18 |
| Titular | SHARK SOFTWARES LTDA |
| Contato | Edson Fernandes |
| DNS1 | nero.ns.cloudflare.com |
| DNS2 | kim.ns.cloudflare.com |

### Registros DNS
- NS: nero.ns.cloudflare.com / kim.ns.cloudflare.com
- MX: (não configurado)
- SPF: (não configurado)
- DMARC: (não configurado)
- AXFR: negado

## 2. Subdomínios Encontrados

**Total**: 15 encontrados / 8 resolvem / 2 vivos (HTTP 200)

### Vivos (resolvem + HTTP)
| Subdomínio | IP | Status | Stack |
|------------|-----|--------|-------|
| sharpify.com.br | 109.70.100.5 (CDN) | 200 | Next.js, React, Webpack, Cloudflare WAF |
| docs.sharpify.com.br | 109.70.100.5 (CDN) | 200 | Next.js, Cloudflare Browser Insights |
| api.sharpify.com.br | 109.70.100.5 (CDN) | 200 | Express, Node.js, Cloudflare |
| cdn.sharpify.com.br | 109.70.100.5 (CDN) | redirect 302 → 9001 | S3-compatible (MinIO), Cloudflare |
| vpn.sharpify.com.br | 109.70.100.5 | 522 timeout | (possivelmente offline) |

### Não resolvem (DNS fail mas podem existir)
- www.sharpify.com.br
- admin.sharpify.com.br
- app.sharpify.com.br
- blog.sharpify.com.br
- mail.sharpify.com.br
- dev.sharpify.com.br
- stage.sharpify.com.br
- test.sharpify.com.br
- portal.sharpify.com.br
- help.sharpify.com.br

## 3. IPs de Origem Real (candidatos)

- **109.70.100.5** (AS208323) — IP do Cloudflare proxy, não é IP real
- IP real NÃO descoberto (todos os subdomínios apontam para Cloudflare)

## 4. Tech Stack por Host

| Host | Tecnologias |
|------|------------|
| sharpify.com.br | Next.js, React, Webpack, Cloudflare WAF |
| docs.sharpify.com.br | Next.js, Cloudflare Browser Insights |
| api.sharpify.com.br | Express.js, Node.js, Cloudflare |
| cdn.sharpify.com.br | MinIO / S3-compatible storage |

## 5. OSINT

### Empresa
- **Razão Social**: SHARK SOFTWARES LTDA
- **Domínio criado**: 2025-09-18
- **GitHub**: Sharpify (user), Sharpify-company (org), SharpifyOfficial (org), Sharpify-io (org)

### Emails
- Contato: Edson Fernandes (nos WHOIS)
- Nenhum email funcional descoberto em fontes públicas

### Vazamentos/Breaches
- Nenhum vazamento confirmado para o domínio sharpify.com.br

## 6. Cloud Buckets

| Bucket | Resultado |
|--------|-----------|
| sharpify-public | ✅ Confirmado (visto nas docs assets) |
| sharpify-assets | 403 (existe mas restrito) |
| sharpify-backup | 403 (existe mas restrito) |
| sharpify-dev | 403 (existe mas restrito) |
| sharpify-storage | Inexistente |
| sharpify-media | Inexistente |

**GCP Buckets**: Existem mas retornam 403 (restritos)

## 7. Wayback Machine Highlights

- Documentação da **API privada** encontrada em docs.sharpify.com.br

## 8. Findings Preliminares

### 🔴 F-001: Documentação de API Privada Exposta [CRÍTICO]
**Alvo**: `docs.sharpify.com.br/docs/api-reference-privado/`
**Descrição**: A documentação da API privada interna está publicamente acessível sem autenticação. Expõe:
- Headers de autenticação (`x-sharpify-client-id`, `x-sharpify-client-secret`)
- Endpoints de gateway de pagamento (criar/reembolsar transações)
- Endpoints de saque
- WebSocket de loja
- CRUD de catálogo completo
- Lista de permissões RBAC
- Rotas server-to-server

### 🔴 F-002: MinIO/S3 Accessível via CDN [ALTO]
**Alvo**: `cdn.sharpify.com.br`
**Descrição**: Subdomínio cdn.sharpify.com.br redireciona para porta 9001 (console MinIO/S3). O storage S3-compatible está atrás de Cloudflare mas pode ser acessível sem autenticação.

### 🟡 F-003: API Express Pública [MÉDIO]
**Alvo**: `api.sharpify.com.br`
**Descrição**: API Express/Node.js exposta publicamente. Endpoints não testados ainda.

### 🟡 F-004: Subdomínios Não-Resolvem [INFO]
**Descrição**: Vários subdomínios (admin, app, dev, stage, blog) não resolvem em DNS — mas podem existir como registros CNAME não propagados ou serviços em IPs alternativos.

## 9. Limitações
- Todos os subdomínios vivos estão atrás de Cloudflare — IP real não descoberto
- Cloudflare blocking Tor exit nodes na maioria das requests
- 2Captcha necessário para bypassar challenge do Cloudflare
- APIs Shodan/Censys sem chave disponível

## 10. Próximos Passos
1. Força bruta de subdomínios adicionais
2. Port scanning no IP 109.70.100.5 e AS208323
3. Explorar MinIO (cdn.sharpify.com.br:9001/9000)
4. Testar endpoints da API documentada
5. Analisar JS bundles do Next.js por API keys hardcoded
6. Verificar takeover em subdomínios que não resolvem