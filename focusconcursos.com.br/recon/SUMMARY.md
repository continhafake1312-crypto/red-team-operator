# Attack Surface Summary — focusconcursos.com.br

**Data:** 2026-08-21T00:00:00Z  
**Alvo:** focusconcursos.com.br  
**Tipo:** Web/API Black-Box  
**Infra:** AWS (Route53/ELB/EC2) + Cloudflare + GoCache + Vercel + Microsoft 365

---

## Ranking de Payoff (§16)

Priorização baseada em valor do ativo, acessibilidade e potencial de dano.

### 🔴 ALTA PRIORIDADE

| # | Host | Tech | Razão | Vetores |
|---|------|------|-------|---------|
| 1 | **integration.focusconcursos.com.br** | Laravel (PHP 8.x, Nginx) | Laravel com debug/app_key conhecido → RCE, env vazado, route enumeration | /_debugbar, /routes, /_ignition, .env, CVE-2021-3129, mass assignment |
| 2 | **admin.focusconcursos.com.br** | Nginx → /login | Painel administrativo — chave do reino | Auth bypass, cred stuffing, SQLi, IDOR |
| 3 | **lms.focusconcursos.com.br** | Nginx → /login | LMS (Learning Management System) — dados de alunos, sessões | Auth bypass, cred stuffing, session hijack, IDOR |
| 4 | **payment.focusconcursos.com.br** | Nginx | Sistema de pagamento — transações financeiras | IDOR, parameter tampering, SSRF, mass assignment |
| 5 | **www3.focusconcursos.com.br** | Next.js (React/Node/Webpack) | Site principal — API routes, SSR | API routes enumeration, Next.js misconfig, SSRF |

### 🟡 MÉDIA PRIORIDADE

| # | Host | Tech | Razão | Vetores |
|---|------|------|-------|---------|
| 6 | **pxa.focusconcursos.com.br** | PixelX App → /login | Dashboard interno PixelX | Auth bypass, default creds, JWT manipulation |
| 7 | **sac.focusconcursos.com.br** | Express (Node.js) + Cloudflare | Sistema de atendimento — dados de clientes | IDOR, NoSQLi, mass assignment |
| 8 | **pagina.focusconcursos.com.br** | Express (Node.js) + Cloudflare | Landing pages, possivelmente mesmo SAC | IDOR, NoSQLi |
| 9 | **webmail.focusconcursos.com.br** | Microsoft HTTPAPI → /mail | Outlook Webmail — acesso a emails corporativos | Cred stuffing, password spray, MFA bypass |
| 10 | **oauth.focusconcursos.com.br** | (não identificado, DNS resolve) | OAuth provider — chaves de autenticação | OAuth misconfig, token leak, redirect URI validation |
| 11 | **vc.focusconcursos.com.br** | Nginx 1.31.1 (versão exposta) | Versão do Nginx vazada | CVE search para Nginx 1.31.1 |
| 12 | **noticias.focusconcursos.com.br** | Next.js | Blog de notícias | IDOR nos parâmetros `?pg=noticias&id=`, path traversal |
| 13 | **lps.focusconcursos.com.br** | Nuxt.js/Vue.js + HighLevel + Cloudflare | Landing pages HighLevel | HighLevel API key exposure, form injection |
| 14 | **email.focusconcursos.com.br** | Caddy | Serviço de email (MailerSend) | MailerSend API abuse, SPF/DKIM issues |

### 🟢 BAIXA PRIORIDADE

| # | Host | Tech | Razão | Vetores |
|---|------|------|-------|---------|
| 15 | **mobile.focusconcursos.com.br** | Nginx → /docs | Documentação mobile API | API docs leak, endpoints enumeration |
| 16 | **crm.focusconcursos.com.br** | AWS ELB (503) | CRM temporariamente indisponível | Monitorar quando voltar |
| 17 | **apilms.focusconcursos.com.br** | (503) | API LMS down | Monitorar |
| 18 | **cdn.focusconcursos.com.br** | GoCache (403) | CDN — cache | Bypass cache, origin discovery |
| 19 | **link.focusconcursos.com.br** | Short.io → redirect | Link shortener | SSRF via redirect, open redirect |
| 20 | **blog.focusconcursos.com.br** | → redirect para noticias | Redirecionamento | Open redirect |
| 21 | **metodo/lp/aprovacao.focusconcursos.com.br** | Vue.js + Cloudflare (404/302) | Landing pages | Forms, tracking parameters |
| 22 | **promocao.focusconcursos.com.br** | CLKDmg (redirect) | Landing page promocional | Open redirect |
| 23 | **manutencao.focusconcursos.com.br** | Vercel (404) | Manutenção — possivelmente staging | Vercel misconfig |

---

## IPs de Origem (fora CDN)

| IP | Hosts | Services |
|----|-------|---------|
| 18.233.104.160 | (vários AWS ELB) | AWS EC2/ELB |
| 54.152.191.245 | admin, lms, payment, mobile, vc, integration | AWS EC2/ELB |
| 34.232.87.139 | lms, payment, mobile | AWS EC2/ELB |
| 44.213.166.252 | focusconcursos.com.br (root) | AWS ELB |
| 3.232.97.233 | focusconcursos.com.br (root) | AWS ELB |
| 52.87.39.184 | focusconcursos.com.br (root) | AWS ELB |
| 54.146.63.32 | focusconcursos.com.br (root) | AWS ELB |
| 18.214.43.51 | focusconcursos.com.br (root) | AWS ELB |
| 52.207.129.5 | focusconcursos.com.br (root) | AWS ELB |

Hosts com Cloudflare (IP não direto): sac, pagina, lp, metodo, aprovacao, lps, vip

---

## Cred-stuffing Candidates

**Emails:** 7 emails corporativos (financeiro, sac, secretaria, luis)
**Painéis de login:** admin.fc, lms.fc, webmail.fc, oauth.fc
**Comuns de senha:** Focus@2024/2025/2026, focus123, grupofocus, Cascavel2024/2025

---

## Findings Preliminares

| # | Finding | Severidade | Host |
|---|---------|-----------|------|
| F-001 | Nginx version disclosure (1.31.1) | Baixa | vc.focusconcursos.com.br |
| F-002 | Painéis admin e LMS acessíveis publicamente | Info | admin.fc, lms.fc |
| F-003 | CORS aberto (Access-Control-Allow-Origin: *) | Média | www3.focusconcursos.com.br |
| F-004 | DMARC em quarantine com relatórios | Info | focusconcursos.com.br |
| F-005 | Bucket S3 "fc" existe mas com acesso negado | Info | AWS S3 |
| F-006 | Laravel (integration.fc) — potencial debug mode | Média | integration.focusconcursos.com.br |

---

## Próximos Passos (Recon Ativo)

1. **Port scan** nos IPs 18.233.104.160, 54.152.191.245, 34.232.87.139 (nmap all ports + service version)
2. **WAF detection** em todos os hosts (wafw00f)
3. **TLS audit** nos hosts HTTPS
4. **Vhost fuzzing** nos IPs de origem
5. **Foco inicial**: integration.fc (Laravel debug), admin.fc (auth bypass), lms.fc (creds)