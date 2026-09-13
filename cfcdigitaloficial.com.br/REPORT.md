# REPORT.md — cfcdigitaloficial.com.br

## Metadados
- **Alvo:** cfcdigitaloficial.com.br
- **Data de início:** 2026-09-13
- **Tipo:** Pentest black-box externo
- **Status:** EM ANDAMENTO

## Sumário Executivo
Engagement em andamento. Alvo é WordPress (Astra theme) com HostGator, Elementor + Pro, LiteSpeed Cache, Wordfence, File Manager Advanced, e MetForm. REST API expõe 346 rotas. Subdomínio com potencial takeover identificado (pixel.cfcdigitaloficial.com.br → pixel.hotmart.com — NXDOMAIN).

## Tabela de Findings

| ID | Severidade | Tipo | Descoberta | Data | Status |
|----|-----------|------|------------|------|--------|
| F-001 | 🔴 **CRÍTICA** | Subdomain Takeover | pixel.cfcdigitaloficial.com.br CNAME→pixel.hotmart.com NXDOMAIN. Dangling DNS pode permitir takeover total do subdomínio. | 2026-09-13 | ⏳ Verificando |
| F-002 | 🟡 **MÉDIA** | Email Spoofing | DMARC p=none, SPF ~all. Domínio vulnerável a phishing por email spoofing. | 2026-09-13 | ✅ Confirmado |
| F-003 | 🟡 **MÉDIA** | REST API Exposure | 346 rotas REST expostas via WP JSON. Namespaces incluem file-manager-advanced, elementor, metform, litespeed, wordfence. | 2026-09-13 | ⚠️ Parcial |
| F-004 | 🟡 **MÉDIA** | No CDN / Direct IP | IP real 108.179.241.231 exposto diretamente. Sem Cloudflare. Vulnerável a ataques diretos. | 2026-09-13 | ✅ Confirmado |
| F-005 | 🟡 **MÉDIA** | ModSecurity Bypass | Cookie `humans_21909=1` + prefixo `index.php/` permitem bypass do ModSecurity para acessar wp-json e outros endpoints. | 2026-09-13 | ✅ Confirmado |
| F-006 | 🟢 **BAIXA** | WHOIS Info Disclosure | Dados pessoais do responsável expostos: Rafael Felipe de Almeida, cfcdigital@outlook.com.br | 2026-09-13 | ✅ Confirmado |

## Attack Surface Consolidada

### Stack Tecnológica
- **CMS:** WordPress (Astra Theme)
- **Servidor:** Apache + ModSecurity
- **Cache:** LiteSpeed Cache + WP Super Cache
- **Firewall:** Wordfence + ModSecurity
- **Page Builder:** Elementor + Elementor Pro
- **Formulários:** MetForm
- **Anti-bot:** Cookie challenge (humans_NNNN)
- **Email:** api-mail.com (MX)
- **Plugins:** File Manager Advanced, Akismet, Google Site Kit, NPS Survey, ElementsKit

### Hosts/Subdomínios
| Host | IP | Descrição |
|------|------|-----------|
| cfcdigitaloficial.com.br | 108.179.241.231 | Site principal (HostGator) |
| www.cfcdigitaloficial.com.br | 108.179.241.231 | CNAME para principal |
| mail.cfcdigitaloficial.com.br | 108.179.241.231 | Mail server |
| email.cfcdigitaloficial.com.br | 104.236.254.28 | CNAME → api-mail.com |
| stape.cfcdigitaloficial.com.br | 35.199.71.234 | GTM Server-Side (GCP) |
| **pixel.cfcdigitaloficial.com.br** | **NXDOMAIN** | **TAKEOVER CANDIDATE** CNAME→pixel.hotmart.com |

### Rotas Expostas (346 rotas REST)
- `file-manager-advanced/v1` — potencial RCE/LFI
- `elementor/v1` — form-submissions, user, post
- `metform/v1/forms` e `metform/v1/entries` — upload de arquivos
- `wordfence/v1` — scan issues
- `litespeed/v1`, `litespeed/v3` — cache
- `elementskit/v1/*` — múltiplas sub-rotas
- `wp/v2` — conteúdo padrão WP

## Acessos Obtidos
*Nenhum até o momento.*

## Objetivos de Alto Valor
- Painel administrativo WordPress (/wp-admin)
- Credenciais de acesso
- Informações financeiras/PII de clientes
- Painéis de gestão financeira
- Subdomínio takeover para campanhas de phishing

## Cronologia
- 2026-09-13T17:35:00Z — Início do engagement
- 2026-09-13T17:38:00Z — Recon passivo concluído: 6 subdomínios, WP, Elementor
- 2026-09-13T17:40:00Z — REST API mapeada: 346 rotas, File Manager Advanced exposto
- 2026-09-13T17:41:00Z — ModSecurity bypass encontrado (cookie humans_* + index.php/)
- 2026-09-13T17:42:00Z — Takeover candidate: pixel.cfcdigitaloficial.com.br CNAME dangling
- 2026-09-13T17:43:00Z — Recon ativo + CVE Research + Takeover check em andamento

## Evidências
- `recon/passive/PASSIVE.md` — Relatório consolidado de recon passivo
- `recon/passive/subdomains_live.txt` — Subdomínios com IPs