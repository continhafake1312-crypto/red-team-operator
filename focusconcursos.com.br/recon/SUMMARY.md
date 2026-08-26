# SUMMARY.md — Attack Surface & Ranking de Payoff

## Alvo: focusconcursos.com.br
**Atualizado:** 2026-08-26 (pós recon ativo)

---

## Ranking de Payoff (ALTA → BAIXA)

| # | Alvo | Vetor | Payoff Estimado | Fase |
|---|------|-------|-----------------|------|
| 1 | **38.211.129.213** — Caddy + SSH (pxa) | SSH brute-force/creds, CVE Caddy, auth bypass pxa, **sem WAF** | **Crítico** | Webapp / Exploit |
| 2 | **18.233.104.160** — Golang backend (apilms/noticias) | Golang/InfluxDB/IPFS API enum, CVE research, **sem WAF**, Traefik default cert | **Crítico** | Enum / CVE |
| 3 | **admin.focusconcursos.com.br** — Painel Admin (ALB) | Auth bypass, default creds Laravel, IDOR, **sem security headers** | **Alto** | Webapp |
| 4 | **lms.focusconcursos.com.br** — LMS (ALB) | Auth bypass, default creds Laravel, IDOR alunos, **sem security headers** | **Alto** | Webapp |
| 5 | **pxa.focusconcursos.com.br** — Pixel X App (Caddy) | Auth bypass, session hijack, IDOR, TLSv1.3 only | **Alto** | Webapp |
| 6 | **www3.focusconcursos.com.br** — Next.js | **CORS wildcard** + Next.js middleware rewrite `/redirect` exposto | **Alto** | Webapp |
| 7 | **focusconcursos.com.br** — Site principal | **JWT (`appToken`) sem HttpOnly/Secure** + CORS wildcard, CloudFront WAF | **Alto** | Webapp |
| 8 | **integration.focusconcursos.com.br** — API | Laravel API endpoints, IDOR, mass assignment, XSRF-TOKEN sem HttpOnly | **Alto** | Webapp |
| 9 | **payment.focusconcursos.com.br** — API Pagamento | Nginx API JSON, IDOR financeiro | **Alto** | Webapp |
| 10 | **fc-static.s3.amazonaws.com** — S3 bucket público | Leitura de assets, JS analysis, path traversal | **Médio** | Enum / Cloud |
| 11 | **sac.focusconcursos.com.br** — SAC (Express.js) | CORS wildcard, Cloudflare behind GCP, info disclosure | **Médio** | Webapp |
| 12 | **pagina.focusconcursos.com.br** — Express | CORS wildcard, Express/Cloudflare | **Médio** | Webapp |
| 13 | **noticias.focusconcursos.com.br** — Next.js | Next.js CVE, middleware bypass, API endpoints | **Médio** | Webapp |
| 14 | **cdn.focusconcursos.com.br** — GoCache + S3 | XSS, CORS misconfig, cache poisoning, S3 region leak (sa-east-1) | **Médio** | Webapp |
| 15 | **vc.focusconcursos.com.br** — Video aulas | **nginx/1.31.1** versão exposta (mainline CVE research) | **Médio** | CVE |
| 16 | **crm.focusconcursos.com.br** — CRM (503) | Aguardar disponibilidade / verificar | **Baixo** | Monitor |
| 17 | **apilms.focusconcursos.com.br** — API LMS (503) | Aguardar disponibilidade / verificar, Traefik default cert | **Baixo** | Monitor |
| 18 | **manutencao.focusconcursos.com.br** — Vercel takeover | Subdomain takeover (Vercel) | **Médio** | Cloud |
| 19 | **promocao.focusconcursos.com.br** — clkdmg takeover | Subdomain takeover (clkdmg) | **Médio** | Cloud |
| 20 | **link.focusconcursos.com.br** — short.io takeover | Subdomain takeover (short.io) | **Médio** | Cloud |
| 21 | **ALB DNS** | Certificado **`*.focusonline.com.br` expirado** (2024→2025) | **Médio** | CVE |
| 22 | **Domínios extras (SANs)** | `cursosfocus.com.br`, `focusonline.com.br` — superfície adicional | **Info** | Recon |

---

## Superfície de Ataque Consolidada

### Infraestrutura AWS
| Componente | IPs | Função |
|------------|-----|--------|
| **ALB Cluster** | 34.232.87.139, 34.195.7.174, 34.204.242.158, 98.86.135.135, 3.226.152.82 | Admin/LMS/CRM/Payment/Integration |
| **ALB Cluster** | 54.146.63.32, 44.213.166.252, 18.214.43.51, 3.232.97.233, 52.87.39.184 | Site Principal |
| **ALB DNS** | `loadbalancer-concursos-2093882467.us-east-1.elb.amazonaws.com` | Load Balancer único |
| **Golang Backend** | 18.233.104.160 | noticias / apilms (Next.js?) |
| **EC2 Fechado** | 34.230.151.3 | Sem portas públicas |
| **CloudFront** | focusconcursos.com.br (CDN) | WAF + Cache |

### Infraestrutura BR (E-Consulters)
| Componente | IP | Função |
|------------|-----|--------|
| **Caddy + SSH** | 38.211.129.213 (AS275714) | pxa.focusconcursos.com.br (Pixel X App) |

### Cloudflare
| Domínio | IPs |
|---------|-----|
| sac.focusconcursos.com.br | 104.18.36.48, 172.64.151.208 |
| lp.focusconcursos.com.br | 104.18.35.90, 172.64.152.166 |
| sites.ludicrous.cloud | 104.18.35.90, 172.64.152.166 |
| brand.ludicrous.cloud | 104.18.36.48, 172.64.151.208 |

### Subdomínios Críticos
| Subdomínio | HTTP | Tech | Portas |
|-----------|------|------|--------|
| admin.focusconcursos.com.br | 302 → /login | Nginx/Laravel (via ALB) | 80, 443 |
| lms.focusconcursos.com.br | 302 → /login | Nginx/Laravel (via ALB) | 80, 443 |
| pxa.focusconcursos.com.br | 302 → /login | Caddy (38.211.129.213) | **22** (SSH), 80, 443 |
| integration.focusconcursos.com.br | 200 | AWS (via ALB) | 80, 443 |
| noticias.focusconcursos.com.br | 200 | Next.js (18.233.104.160) | 80, 443 |
| sac.focusconcursos.com.br | 200 | Express.js (via Cloudflare) | 80, 443 |
| cdn.focusconcursos.com.br | 403 | GoCache + S3 | 80, 443 |

### Buckets S3
| Bucket | Acesso | Conteúdo |
|--------|--------|----------|
| **fc-static** | **PÚBLICO (listável)** | Assets JS/CSS/images/fonts |
| fc-backup | Privado (existe) | - |
| fc-uploads | Privado (existe) | - |

### Takeover Candidates
| Subdomínio | Serviço | Risco |
|-----------|---------|-------|
| manutencao.focusconcursos.com.br | Vercel | ⚠️ |
| promocao.focusconcursos.com.br | clkdmg | ⚠️ |
| link.focusconcursos.com.br | short.io | ⚠️ |
| vip.focusconcursos.com.br | Great Pages/SSL | ⚠️ |

---

## Próximos Passos (Fase 5 — Enumeração)

### Imediatos (payoff mais alto)
1. **Enum 38.211.129.213** — Provar SSH + fingerprint Caddy + endpoints pxa
2. **Enum 18.233.104.160** — Descobrir servidor exato (InfluxDB? IPFS?), endpoints API
3. **Enum admin.focusconcursos.com.br** — ffuf content discovery, /login bypass
4. **Enum lms.focusconcursos.com.br** — ffuf content discovery, /login bypass

### Médio prazo
5. **Enum pxa.focusconcursos.com.br** (via Caddy) — endpoints, API
6. **Cloud — fc-static** — Baixar assets, analisar JS por chaves/endpoints
7. **Cloud — Takeover** — Verificar dangling CNAMEs (manutencao, promocao, link)

---

## Payoff Score
| Critério | Score |
|----------|-------|
| Hosts com RCE potencial | 3 (Caddy, Go, SSH) |
| Painéis admin expostos | 3 (admin, lms, pxa) |
| Buckets públicos | 1 (fc-static) |
| Takeover candidates | 4 |
| Subdomínios totais vivos | ~30 |
| IPs de origem real | 13 |

---

*Atualizado em 2026-08-26 — Próxima fase: Enumeração Profunda*