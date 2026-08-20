# Recon Ativo — promisse.com.br

**Data**: 2026-08-20T05:46 UTC  
**Alvo**: promisse.com.br (PromissePay)  
**Infra**: Vercel (main+status) + Railway.app (api) + Cloudflare (DNS/WAF)  
**OPSEC**: Tor (proxychains4) em todas as requisições externas

---

## Sumário Executivo

### Hosts Ativos
| Host | Backend | WAF | Status |
|---|---|---|---|
| promisse.com.br | Vercel (Next.js) | Nenhum | 200 OK |
| www.promisse.com.br | Vercel (Next.js) | Nenhum | 307 → promisse.com.br |
| api.promisse.com.br | Railway.app | **Cloudflare** | 404 (endpoint exists) |
| status.promisse.com.br | Vercel | Nenhum | 404 (DEPLOYMENT_NOT_FOUND) |

### Portas Abertas
| IP | Portas | Serviço |
|---|---|---|
| 216.150.16.129 | 80/tcp, 443/tcp | Vercel HTTP/HTTPS |
| 216.150.1.129 | 80/tcp, 443/tcp | Vercel HTTP/HTTPS |
| 216.150.1.65 | 80/tcp, 443/tcp | Vercel HTTP/HTTPS |
| 216.150.16.65 | 80/tcp, 443/tcp | Vercel HTTP/HTTPS |
| 216.150.1.1 | 80/tcp, 443/tcp | Vercel HTTP/HTTPS |
| 216.150.16.1 | 80/tcp, 443/tcp | Vercel HTTP/HTTPS |
| 104.21.20.114 | 80/tcp, 443/tcp | Cloudflare proxy |
| 172.67.192.97 | 80/tcp, 443/tcp | Cloudflare proxy |

**Nenhuma outra porta aberta encontrada** nos IPs Vercel (somente 80 e 443).

---

## 1. Port Scanning

### Metodologia
- Scan inicial: `nmap -sT -Pn -n --top-ports 1000 --min-rate 500 -T4`
- Scan de versão via HTTP/TLS fingerprinting (nmap -sV via Tor timeout)

### Resultados por IP

#### Vercel Edge (IPs Reais)
| IP | Porta | Serviço | Banner/Info |
|---|---|---|---|
| **216.150.16.129** | 80/tcp | HTTP | Vercel - 308 Redirect → https://vercel.com |
| | 443/tcp | HTTPS | Vercel Edge - SNI: promisse.com.br → 200 |
| **216.150.1.129** | 80/tcp | HTTP | Vercel - 308 Redirect → https://vercel.com |
| | 443/tcp | HTTPS | Vercel Edge - SNI: promisse.com.br → 200 |
| **216.150.1.65** | 80/tcp | HTTP | Vercel - 308 Redirect → https://vercel.com |
| | 443/tcp | HTTPS | Vercel Edge - SNI: www.promisse.com.br → 307 |
| **216.150.16.65** | 80/tcp | HTTP | Vercel - 308 Redirect → https://vercel.com |
| | 443/tcp | HTTPS | Vercel Edge - SNI: www.promisse.com.br → 307 |
| **216.150.1.1** | 80/tcp | HTTP | Vercel - 308 Redirect → https://vercel.com |
| | 443/tcp | HTTPS | Vercel Edge - SNI: status.promisse.com.br → 404 |
| **216.150.16.1** | 80/tcp | HTTP | Vercel - 308 Redirect → https://vercel.com |
| | 443/tcp | HTTPS | Vercel Edge - SNI: status.promisse.com.br → 404 |

#### Cloudflare (WAF)
| IP | Porta | Serviço |
|---|---|---|
| 104.21.20.114 | 80/tcp, 443/tcp | Cloudflare proxy (api, wildcard) |
| 172.67.192.97 | 80/tcp, 443/tcp | Cloudflare proxy (api, wildcard) |
| 173.245.59.65 | 53/tcp | Cloudflare DNS (anuj.ns.cloudflare.com) |
| 108.162.193.65 | 53/tcp | Cloudflare DNS (anuj.ns.cloudflare.com) |
| 172.64.33.65 | 53/tcp | Cloudflare DNS (anuj.ns.cloudflare.com) |
| 173.245.58.121 | 53/tcp | Cloudflare DNS (jean.ns.cloudflare.com) |
| 108.162.192.121 | 53/tcp | Cloudflare DNS (jean.ns.cloudflare.com) |
| 172.64.32.121 | 53/tcp | Cloudflare DNS (jean.ns.cloudflare.com) |

---

## 2. Cloudflare Bypass — IPs Reais

### ✅ SUCESSO: Vercel IPs Bypass
Todos os 6 IPs Vercel confirmados como reais. Teste via `--resolve`:
```
curl --resolve "promisse.com.br:443:216.150.16.129" https://promisse.com.br/
```
Retorna HTTP 200 com o conteúdo real do site. Bypass completo do Cloudflare.

**IPs confirmados:**
1. 216.150.16.129 (apex A)
2. 216.150.1.129 (apex A)
3. 216.150.1.65 (www CNAME)
4. 216.150.16.65 (www CNAME)
5. 216.150.1.1 (status CNAME)
6. 216.150.16.1 (status CNAME)

### ❌ FALHA: Railway.app (API)
O endpoint `api.promisse.com.br` NÃO está no Vercel. Está no **Railway.app** atrás do Cloudflare. Headers identificados:
- `x-railway-request-id`
- `x-railway-edge: ber1` (região Berlin)
- `x-hikari-trace`
- `server: cloudflare`

O IP real do Railway não foi descoberto. Técnicas tentadas:
- Subdomínios bruteforce (todos wildcard → Cloudflare)
- Certificates (apenas Cloudflare)
- DNS history (crt.sh 502, SecurityTrails sem API key)
- Sem MX records

---

## 3. WAF Detection

### Resultados (wafw00f v2.4.2)

| Host | WAF Detectado | Tipo |
|---|---|---|
| https://promisse.com.br | ❌ Nenhum | - |
| https://api.promisse.com.br | ✅ **Cloudflare** | Cloudflare Inc. |
| https://status.promisse.com.br | ❌ Nenhum | - |

**Implicações:**
- O site principal pode ser atacado diretamente via Vercel IPs sem WAF
- A API está protegida pelo Cloudflare WAF (rate limiting, challenge, etc.)
- Bypass WAF para API requer Railway IP real

---

## 4. TLS/SSL Analysis

### promisse.com.br (Vercel)
| Parâmetro | Valor |
|---|---|
| TLS Protocolos | TLSv1.2, TLSv1.3 (SSLv2/3, TLSv1.0/1.1 desativados) |
| Cipher preferido (TLS 1.3) | TLS_AES_128_GCM_SHA256 (Curve 25519 DHE) |
| Cipher preferido (TLS 1.2) | ECDHE-RSA-AES128-GCM-SHA256 (Curve 25519 DHE) |
| Certificado | RSA 2048, sha256WithRSAEncryption |
| Emissor | YR2 (Vercel edge cert) |
| Validade | 2026-08-17 → 2026-11-15 |
| SAN | promisse.com.br |
| HSTS | max-age=63072000 |
| Heartbleed | Não vulnerável |

### api.promisse.com.br (Cloudflare)
| Parâmetro | Valor |
|---|---|
| TLS Protocolos | TLSv1.0, TLSv1.1, TLSv1.2, TLSv1.3 (TODOS habilitados) |
| Cipher preferido (TLS 1.3) | TLS_AES_128_GCM_SHA256 |
| Cipher preferido (TLS 1.2) | ECDHE-ECDSA-CHACHA20-POLY1305 |
| Certificado | ECDSA prime256v1, ecdsa-with-SHA256 |
| Emissor | WE1 (Cloudflare) |
| Validade | 2026-08-02 → 2026-10-31 |
| SAN | promisse.com.br, *.promisse.com.br (wildcard!) |
| Heartbleed | Não vulnerável |

### status.promisse.com.br (Vercel)
| Parâmetro | Valor |
|---|---|
| TLS Protocolos | TLSv1.2, TLSv1.3 |
| Cipher preferido (TLS 1.3) | TLS_AES_128_GCM_SHA256 |
| Certificado | RSA 2048, sha256WithRSAEncryption |
| Emissor | YR2 (Vercel) |
| Validade | 2026-07-13 → 2026-10-11 |
| SAN | status.promisse.com.br |

---

## 5. HTTP Fingerprint

### Headers de Resposta

#### promisse.com.br (via Vercel)
```
HTTP/2 200
server: Vercel
strict-transport-security: max-age=63072000
access-control-allow-origin: *
x-vercel-cache: HIT
x-vercel-id: fra1::<id>
x-nextjs-prerender: 1
x-nextjs-stale-time: 300
x-matched-path: /
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch
content-type: text/html; charset=utf-8
etag: "bb8d149a06573f7cbdd827a0306b128e"
```

#### www.promisse.com.br (via Vercel)
```
HTTP/2 307
location: https://promisse.com.br/
server: Vercel
strict-transport-security: max-age=63072000
```

#### api.promisse.com.br (via Cloudflare → Railway)
```
HTTP/2 404
server: cloudflare
access-control-allow-origin: *
access-control-allow-credentials: true
access-control-allow-methods: OPTIONS, GET, POST, PUT, PATCH, DELETE
access-control-allow-headers: Authorization, App, Content-Type
x-railway-request-id: <uuid>
x-railway-edge: ber1
x-hikari-trace: ber1.<id>
x-robots-tag: noindex
cf-cache-status: DYNAMIC
```

#### status.promisse.com.br (via Vercel)
```
HTTP/2 404
server: Vercel
strict-transport-security: max-age=63072000
x-vercel-error: DEPLOYMENT_NOT_FOUND
```

---

## 6. Vhost Discovery

### Hosts que Respondem no IP 216.150.16.129 (Vercel)
| Host | HTTP | Resposta |
|---|---|---|
| promisse.com.br | 308 | Redirect → https://promisse.com.br/ |
| www.promisse.com.br | 308 | Redirect → https://www.promisse.com.br/ |
| status.promisse.com.br | 308 | Redirect → https://status.promisse.com.br/ |
| api.promisse.com.br | 404 | Vercel edge reconhece mas sem deployment |

### Direct SNI Test (Porta 443)
| SNI | Resposta | Conclusão |
|---|---|---|
| promisse.com.br | 200 OK | Site principal ativo |
| www.promisse.com.br | 307 Redirect | Redireciona para apex |
| status.promisse.com.br | 404 (DEPLOYMENT_NOT_FOUND) | Deployment removido/suspenso |
| api.promisse.com.br | Timeout (000) | Não está no Vercel |

---

## 7. IPs Reais Descobertos (Bypass Cloudflare)

```
216.150.16.129  - Vercel Edge (apex)
216.150.1.129   - Vercel Edge (apex)
216.150.1.65    - Vercel Edge (www)
216.150.16.65   - Vercel Edge (www)
216.150.1.1     - Vercel Edge (status)
216.150.16.1    - Vercel Edge (status)
```

---

## 8. Anomalias e Observações

### 🔴 ALTA PRIORIDADE

1. **API em Railway.app (não Vercel)**
   - `api.promisse.com.br` está no Railway.app (x-railway-request-id, x-railway-edge)
   - Protegido por Cloudflare WAF
   - IP real não descoberto — Railway usa Cloudflare como CDN
   - Railway edge em Berlin (`ber1`)

2. **Status deployment removido/suspenso**
   - `status.promisse.com.br` retorna `DEPLOYMENT_NOT_FOUND`
   - Possível takeover candidate se o deployment for recriado
   - DNS ainda aponta para Vercel

3. **CORS Excessivamente Permissivo (API)**
   - `Access-Control-Allow-Origin: *` com `Access-Control-Allow-Credentials: true`
   - Métodos: OPTIONS, GET, POST, PUT, PATCH, DELETE
   - Headers: Authorization, App, Content-Type
   - Vulnerabilidade clássica de CSRF + CORS

### 🟡 MÉDIA PRIORIDADE

4. **6 IPs Vercel bypassam Cloudflare completamente**
   - Site principal acessível sem WAF
   - Permite scanning direto, fuzzing, e ataques sem rate limiting do Cloudflare

5. **TLS 1.0 e 1.1 habilitados na API**
   - Cloudflare permite protocolos antigos no backend Railway
   - PCI DSS non-compliant

6. **Sem MX/SPF/DMARC**
   - Nenhum servidor de email configurado
   - Impossível spoofing via email
   - Mas também impossível vazar IP via registros MX

7. **Domínio Recente (2025-12-05)**
   - Pouco histórico em Wayback Machine, crt.sh, etc.
   - Dificulta enumeração histórica

### 🟢 BAIXA PRIORIDADE

8. HSTS ativo (mitiga SSL stripping)
9. Nenhum bucket S3 aberto
10. Nenhum subdomain takeover possível

---

## 9. Arquivos Gerados

| Arquivo | Caminho |
|---|---|
| **ACTIVE.md** (este) | `recon/active/ACTIVE.md` |
| Nmap Summary | `recon/active/nmap_summary.txt` |
| Nmap top1000 scans | `recon/active/nmap_top1000_*.txt` |
| Nmap version scans | `recon/active/nmap_versions_*.txt` |
| WAF Detection | `recon/active/waf_detection.txt` |
| TLS Report | `recon/active/tls_report.txt` |
| HTTP Headers | `recon/active/http_headers.txt` |
| Vhosts FFuF | `recon/active/vhosts_ffuf.txt` |
| Real IPs | `recon/active/ip_reals.txt` |
| Cloudflare Bypass | `recon/active/cloudflare_bypass_attempts.txt` |

---

## 10. Próximos Passos Recomendados

1. **Enumeração profunda da API**: testar endpoints documentados em `/docs`, fuzzing de rotas, autenticação
2. **Testar IDOR/BOLA** na API com CORS permissivo
3. **Fuzzing de subdomínios Railway** para descobrir IP real
4. **Análise JS** dos chunks Next.js (`/_next/static/chunks/`) para endpoints e chaves
5. **Testar bypass Cloudflare** via SSRFs internos (se Railway permite)
6. **Verificar GitHub/Leaks** por chaves de API, tokens Railway