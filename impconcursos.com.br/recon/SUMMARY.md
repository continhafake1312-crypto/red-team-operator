# Attack Surface Consolidada — impconcursos.com.br

> Status: consolidado após Fase 2 (recon passivo). Re-priorizar a cada finding.

## Panorama
- **Apex:** Shopify-hosted (`shops.myshopify.com`, IPs 23.227.38.32/74).
- **33 subdomínios** totais | **17 vivos** | **15 NÃO-Shopify** (alvo de foothold real).
- **myshopify admin:** `https://imp-concursos.myshopify.com/admin` — Shop ID `82886885664`.
- **Empresa:** Instituto IMP de Educação Ltda — CNPJ 11.292.234/0001-76 — Brasília/DF.
- **Gestora técnica:** Unyleya (`ti_admin@unyleya.com.br`).

## Hosts prioritários (não-Shopify = infra própria do cliente)
| Host | IP/Infra | Stack | Notas |
|---|---|---|---|
| **mdlco01.impconcursos.com.br** | 54.207.91.194 (EC2 sa-east-1) | **Moodle + PHP 5.5.9 EOL** | `admin/cron.php` aberto (200 sem auth) |
| **blog.impconcursos.com.br** | 3.164.6.x (CloudFront) | **WordPress 7.1** + Apache | wp-json expõe admin `deploy`(id=1); xmlrpc ativo; wp-login aberto; readme.html |
| **chat.impconcursos.com.br** | 138.68.37.29 (DigitalOcean) | Typebot/Next.js | `/__ENV.js` vaza SMTP/Unsplash/Giphy keys; terceirizado core4.com.br |
| **antigo/ebook/online** | 54.207.36.58 (EC2 sa-east-1) | 403 Apache | sites PHP legados — `/ambiente-teste/login_*.php` no wayback |
| **portal/portalpos/gh/grade** | CloudFront/S3 | SPA "Portal do Aluno"/Grade | auth/IDOR a enumerar |
| **fabricadeprovas** | CloudFront/S3 | "Fábrica de Provas" | Sentry/Wootric — JS/API a analisar |
| **conteudo** | 85013ef12563.pages.rdstation.com.br | 404 | takeover candidate (RD Station) |
| **lp** | cname.greatpages.com.br | 404 | takeover candidate (Great Pages) |
| **tracking** | api.elasticemail.com | SaaS | Elastic Email |

## Findings preliminares (pré-Fase 6) — por payoff
| ID provisório | Severidade | Vetor | Host |
|---|---|---|---|
| F-001 (cand) | **CRÍTICA** | Shopify UCP/MCP `POST /api/ucp/mcp` `tools/list` sem auth → expõe `create_checkout`/`get_checkout` (IDOR `gid://shopify/Checkout/*` arbitrário, schemas de payment instruments) — CORS `*` em `/.well-known/ucp` | imp-concursos.myshopify.com |
| F-002 (cand) | ALTA | mdlco01 Moodle + PHP 5.5.9 EOL + `admin/cron.php` aberto | mdlco01 |
| F-003 (cand) | ALTA | blog WP wp-json expõe admin `deploy`(id=1) + xmlrpc + wp-login aberto | blog |
| F-004 (cand) | MÉDIA | Shopify meta leak `/meta.json`,`/products.json`,`/pages.json` | apex |
| F-005 (cand) | MÉDIA | chat Typebot `/__ENV.js` vaza config (SMTP/keys) | chat |
| F-006 (cand) | MÉDIA | DMARC `p=none` + sem DKIM default — spoofing `@impconcursos.com.br` | DNS |
| F-007 (cand) | MÉDIA | Takeover candidate `conteudo`/`lp` (SaaS 404) | DNS |

## Ranking de payoff (re-priorizado pós-Fase 2)
| # | Vetor | Payoff | Fase |
|---|---|---|---|
| 1 | **Shopify UCP/MCP IDOR/auth bypass** (`get_checkout`/`create_checkout` sem auth) | CRÍTICO (financeiro/PII) | webapp |
| 2 | **mdlco01 Moodle PHP 5.5.9 EOL** — CVE RCE + admin/cron exposto | ALTO (foothold RCE) | cve/exploit |
| 3 | **blog WordPress** — brute admin `deploy` + xmlrpc + wpscan | ALTO (admin/RCE) | webapp/cve |
| 4 | **antigo/ebook/online** (EC2 54.207.36.58) — 403 bypass + content discovery + logins PHP legados | ALTO (foothold) | enum/webapp |
| 5 | **portal/fabricadeprovas/gh/grade** — JS/API/IDOR/auth | MÉDIO (PII/conta) | enum/webapp |
| 6 | **chat Typebot** — env leak + core4.com.br terceirizado | MÉDIO | enum/cloud |
| 7 | **Takeover** conteudo/lp (RD Station/Great Pages) | MÉDIO | cloud |
| 8 | **OSINT cred stuffing** (HIBP/DeHashed + repos Unyleya) | ALTO | osint/exploit |
| 9 | **Mail servers** (195.246.239.30/31) — SMTP/IMAP/webmail | MÉDIO | network |

## Próximos passos (Fase 3 — recon ativo)
1. Portscan focado nos EC2 próprios: 54.207.36.58, 54.207.91.194 (+ DigitalOcean 138.68.37.29, mail servers 195.246.239.30/31).
2. Vhost brute nos EC2 (Host: FUZZ.impconcursos.com.br) — pode revelar dev/staging/admin/api.
3. wafw00f + TLS scan nos EC2.
4. Handoff Fase 5/6: UCP/MCP (webapp), mdlco01 (cve/exploit), blog (webapp/cve), EC2 54.207.36.58 (enum/webapp).
