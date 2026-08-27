# REPORT.md — Engagement caveira.com

> Relatório incremental. Atualizado a cada fase/finding.

## Metadados
- **Alvo:** caveira.com (https://caveira.com)
- **Negócio:** Plataforma de educação/cursos (Projeto Caveira) + WordPress + e-commerce (Loja Nuvem) + app Caveira Pass. Pagamento via Efí Pay.
- **Owner/Operador:** Red Team Operator
- **Início:** 2026-08-27T03:24Z
- **Status:** EM ANDAMENTO
- **OPSEC:** Tor + proxychains4 (socks5), 2Captcha para bypass CF, UA rotativo

## Sumário executivo
- **1 finding cloud confirmado (Alta):** subdomain takeover em `skull.homo.caveira.com`
  via CNAME dangling para slug Netlify não-claimado (`strong-naiad-3ab1bd`).
  Fingerprint Netlify 404 "Not Found - Request ID:" (text/plain, `server: Netlify`)
  confirmado por comparação com slug aleatório inexistente (mesma resposta) e com
  site Netlify claimado (200 HTML). Subdomínio em ambiente de homologação trustado
  pela marca caveira.com — vetor de phishing/defacement credivel.
- **1 finding Crítica (potencial):** rota de personificação `/profile/personification/:access_token`
  na API Laravel — vetor de ATO se token for enumerável (F-004).
- **1 finding Crítica (vulnerável, exploit bloqueado):** CVE-2026-32475 Elementor Pro
  3.28.0 RCE confirmado vulnerável, mas WordPress DB error impede exploração (F-001).
- **1 finding Média:** API Laravel exposta em api.caveira.com com endpoint de login
  funcional revelando stack e regras de validação (F-003).
- **1 finding Baixa:** WordPress DB Error exposto publicamente em teste.caveira.com (F-002).
- **Attack surface expandida:** descoberta API Laravel (api.caveira.com) atrás de AWS ALB
  + nginx 1.18.0, SPAs Quasar/Vue.js em Netlify, integração de pagamento Efí Pay,
  Google Tag Manager (GTM-WNCHB9GD), DigitalOcean Spaces CDN.

## Tabela de findings

| ID | Título | Host | Severidade | Status |
|----|--------|------|------------|--------|
| C-001 | Subdomain Takeover (Netlify dangling CNAME) | skull.homo.caveira.com | Alta | Confirmado (não-claimado) |
| F-001 | CVE-2026-32475 Elementor Pro 3.28.0 RCE (DB down bloqueia exploit) | teste.caveira.com | Crítica | Vulnerável (exploração bloqueada) |
| F-002 | WordPress DB Error (info disclosure + indisponibilidade) | teste.caveira.com | Baixa | Confirmado |
| F-003 | API Laravel exposta com auth funcional (info disclosure) | api.caveira.com | Média | Confirmado |
| F-004 | Rota de personificação /profile/personification/:access_token (ATO potencial) | api.caveira.com | Crítica | A investigar |

## Attack surface consolidada
(ver recon/SUMMARY.md e enum/ENUM.md para detalhes completos)

### Infraestrutura
- **AWS ALB** → nginx 1.18.0 (Ubuntu) → Laravel (api.caveira.com)
- **Apache 2.4.58** → WordPress 7.1 (teste.caveira.com, 165.227.4.115, IP direto sem WAF)
- **Netlify** SPAs (panel, app, plataforma, aplicativo.caveira.com)
- **DigitalOcean App Platform** (orca-app-aznfk.ondigitalocean.app — origem do app2)
- **DigitalOcean Spaces CDN** (caveira.sfo3.cdn.digitaloceanspaces.com)
- **Cloudflare** (caveira.com apex)
- **Loja Nuvem** e-commerce (loja.caveira.com)

### Stack de Software
| Componente | Versão | Host |
|------------|--------|------|
| Laravel | (desconhecida) | api.caveira.com |
| nginx | 1.18.0 (Ubuntu) | api.caveira.com |
| WordPress | 7.1 (spoofed?) | teste.caveira.com, caveira.com |
| Apache httpd | 2.4.58 (Ubuntu) | teste.caveira.com |
| OpenSSH | 9.6p1 (Ubuntu patched) | teste.caveira.com:22 |
| Elementor Free | 3.32.0 | teste.caveira.com |
| Elementor Pro | 3.28.0 | teste.caveira.com |
| Advanced Custom Fields | 6.5.1 | teste.caveira.com |
| Code Snippets | 3.7.0 | teste.caveira.com |
| WP fail2ban | 5.4.1 | teste.caveira.com |
| Quasar (Vue.js) | (desconhecida) | plataforma/app.caveira.com |
| Efí Pay | (SDK payment-token-efi) | plataforma/app.caveira.com |

## Acessos obtidos
(nenhum ainda)

## Objetivos de alto valor
- **Personificação/ATO** (F-004): acesso a qualquer conta → PII, dados financeiros
- **RCE no WordPress** (F-001): comprometimento do host 165.227.4.115 → pivoting
- **Auth bypass na API Laravel** (F-003): acesso à plataforma sem credenciais
- **Registro habilitado** (a testar): conta autenticada → enumeração de IDOR em todos endpoints

## Cronologia
(ver timeline.log)
