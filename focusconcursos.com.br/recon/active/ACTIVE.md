# Recon Ativo - focusconcursos.com.br

**Data:** 2026-08-21

## Port Scan (nmap via proxychains4)

Realizado scan via Tor (proxychains4) — comum que IPs AWS/cloud não respondam a scans SYN via Tor exit nodes.

| IP | Tipo | Resultado |
|----|------|-----------|
| 54.152.191.245 | Full (-p- -sV -sC) | Nenhuma porta retornada (bloqueio Tor) |
| 18.233.104.160 | Top 1000 (-sV -sC) | Nenhuma porta retornada (bloqueio Tor) |
| 34.232.87.139 | Top 1000 (-sV -sC) | Nenhuma porta retornada (bloqueio Tor) |
| 44.213.166.252 | Top 1000 (-sV -sC) | Nenhuma porta retornada (bloqueio Tor) |
| 18.233.104.160 | Web ports (80,443,8080,8443,3000,8000,5000,9000) | Nenhuma porta retornada |
| 34.232.87.139 | Web ports (80,443,8080,8443,3000,8000,5000,9000) | Nenhuma porta retornada |

**Nota:** Scan sem proxychains4 seria necessário para portas completas, mas violaria OPSEC. Priorizamos ataque web via aplicação.

## WAF Detection

| Host | WAF Detectado | Tipo |
|------|--------------|------|
| admin.focusconcursos.com.br | ❌ Nenhum | — |
| lms.focusconcursos.com.br | ❌ Nenhum | — |
| payment.focusconcursos.com.br | ❌ Nenhum | — |
| www3.focusconcursos.com.br | ❌ Nenhum | — |
| integration.focusconcursos.com.br | ❌ Nenhum | — |
| vc.focusconcursos.com.br | ❌ Nenhum | — |
| mobile.focusconcursos.com.br | ❌ Nenhum | — |
| pxa.focusconcursos.com.br | ❌ Nenhum | — |
| noticias.focusconcursos.com.br | ❌ Nenhum | — |
| webmail.focusconcursos.com.br | ❌ Nenhum | — |
| email.focusconcursos.com.br | ❌ Nenhum | — |
| sac.focusconcursos.com.br | ✅ Cloudflare | Cloudflare (Bot Management) |
| pagina.focusconcursos.com.br | ✅ Cloudflare | Cloudflare (Bot Management) |
| lps.focusconcursos.com.br | ✅ Cloudflare | Cloudflare (Bot Management) |
| cdn.focusconcursos.com.br | ✅ AWS ELB | AWS Elastic Load Balancer |

**Conclusão:** Hosts prioritários (admin, lms, integration, payment, www3) **NÃO têm WAF** — ataque direto possível.

## Hosts Web Diretos (sem WAF) — Prioridade de Ataque

| Host | Tech | Response | Observação |
|------|------|----------|------------|
| **integration.focusconcursos.com.br** | Laravel/PHP | `{"status":"ok"}` | API Laravel — rota raiz exposta, debug mode potencial |
| **admin.focusconcursos.com.br** | Laravel/PHP | /login (302) | Painel admin com CSRF token + /mix-manifest.json |
| **lms.focusconcursos.com.br** | Laravel/PHP | /login (302) | LMS com CSRF token |
| **payment.focusconcursos.com.br** | Nginx | `{"status":"ok"}` | API de pagamento |
| **www3.focusconcursos.com.br** | Next.js (TailwindCSS 3.4.19) | 200 | Site principal com API routes |
| **vc.focusconcursos.com.br** | Nginx 1.31.1 | 301 → /produtos | Nginx version exposed |
| **mobile.focusconcursos.com.br** | Nginx | 301 → /docs | Docs API mobile |
| **pxa.focusconcursos.com.br** | PixelX | 302 → /login | Dashboard PixelX |
| **noticias.focusconcursos.com.br** | Next.js | 200 | Blog de notícias |
| **webmail.focusconcursos.com.br** | Microsoft HTTPAPI | 301 → /mail | Outlook Webmail |

## TLS Findings

| Host | TLS Version | Cipher | Issues |
|------|------------|--------|--------|
| admin.focusconcursos.com.br | TLS 1.2/1.3 | ECDHE+AES-GCM | OK |
| lms.focusconcursos.com.br | TLS 1.2/1.3 | ECDHE+AES-GCM | OK |
| www3.focusconcursos.com.br | TLS 1.2/1.3 | ECDHE+AES-GCM | Cloudfront CDN |
| integration.focusconcursos.com.br | TLS 1.2/1.3 | ECDHE+AES-GCM | OK |
| pxa.focusconcursos.com.br | TLS 1.3 | TLS_AES_256_GCM_SHA384 | HSTS |
| noticias.focusconcursos.com.br | TLS 1.3 | ECDHE+AES-GCM | Cloudfront CDN |
| webmail.focusconcursos.com.br | TLS 1.2 | ECDHE+AES-GCM | Outlook/Office365 |

## Probes Críticas

| Host | Endpoint | Status | Response |
|------|----------|--------|----------|
| integration.fc | / | 200 | `{"status":"ok"}` |
| integration.fc | /_debugbar | — | Pendente |
| integration.fc | /_ignition | — | Pendente |
| admin.fc | /login | 302 | Login page HTML |
| admin.fc | / | 302 | Redirect to /login |
| lms.fc | /login | 302 | Login page HTML |
| payment.fc | / | 200 | `{"status":"ok"}` |
| www3.fc | / | 200 | Full Next.js/TailwindCSS |

## Detalhes dos Painéis

### admin.focusconcursos.com.br
- **Título:** "Administrativo"
- **Framework:** Laravel (CSRF token, mix-manifest.json)
- **CSRF Token:** `OCy2P27ltcqH6UZaJzsqwHt3Ar54udrAzkZiuka7`
- **Estilo:** MaterializeCSS
- **Favicon:** /images/favicon-32x32.png, /images/apple-touch-icon.png
- **Assets:** /images/idea.jpg (background), /images/dot.png (pattern), /mix-manifest.json

### lms.focusconcursos.com.br
- **Título:** "LMS Focus Concursos"
- **Framework:** Laravel (CSRF token)
- **CSRF Token:** `6jaB5Ig1niAQMVyx705beKxy9i48rDKNLoTUWOWu`
- **Estilo:** MaterializeCSS (mesmo template do admin)

## Attack Surface Atualizado

```
Hosts sem WAF e com alto payoff:
┌─ integration.focusconcursos.com.br (Laravel API) ← TOP #1
├─ admin.focusconcursos.com.br (Laravel Admin) ← TOP #2
├─ lms.focusconcursos.com.br (Laravel LMS) ← TOP #3
├─ payment.focusconcursos.com.br (Payment API) ← TOP #4
├─ www3.focusconcursos.com.br (Next.js) ← TOP #5
├─ pxa.focusconcursos.com.br (PixelX) ← #6
└─ webmail.focusconcursos.com.br (OWA) ← #7
```

## Recomendações

1. **Enumeração profunda em integration.fc** — endpoints do Laravel (/_debugbar, /_ignition, /routes, /clockwork, /.env, /storage)
2. **Content discovery** em admin.fc e lms.fc — descobrir rotas pós-login
3. **JS analysis** em www3.fc — buscar API keys, endpoints Next.js
4. **IDOR testing** em payment.fc — parâmetros de transação
5. **Cred stuffing** nos painéis admin/lms/webmail com emails do OSINT