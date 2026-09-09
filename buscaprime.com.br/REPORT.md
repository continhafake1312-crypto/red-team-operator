# Relatório de Pentest — BuscaPrime

## Metadados
- **Alvo:** buscaprime.com.br
- **Segmento:** Consulta de dados públicos (CPF, nome, telefone, empresas)
- **Tipo de teste:** Black-box
- **Status:** Em andamento
- **Início:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Sumário Executivo
Teste de intrusão em andamento. 6 findings identificados até o momento, sendo 1 crítico, 2 altos e 3 médios. O servidor de origem foi descoberto (seguro.buscaprime.com.br — IP 170.82.173.30) e está SEM proteção Cloudflare.

## Findings por Severidade
| Severidade | Quantidade | IDs |
|------------|------------|-----|
| 🔴 Crítico | 1 | F-001 |
| 🟠 Alto | 2 | F-002, F-003 |
| 🟡 Médio | 3 | F-004, F-005, F-006 |
| 🟢 Baixo | 0 | — |
| ℹ️ Info | 0 | — |

## Detalhamento de Findings

### 🔴 F-001: Servidor de Origem Exposto (sem Cloudflare)
**Host:** seguro.buscaprime.com.br → 170.82.173.30
**Servidor:** gocache + openresty (nginx/LuaJIT)
**Severidade:** Crítico
**Detalhes:** O subdomínio seguro.buscaprime.com.br NÃO está protegido pelo Cloudflare, expondo diretamente o IP real do servidor. Portas 80 (tcpwrapped) e 443 (SSL/gocache) abertas. Certificado Let's Encrypt. Permite ataque direto sem WAF.

### 🟠 F-002: Página de Login Exposta
**URL:** https://seguro.buscaprime.com.br/auth/login
**Severidade:** Alto
**Detalhes:** Página de autenticação Laravel exposta sem Cloudflare. CSRF token via `_token`. Validação de email no backend, password sem validação aparente. Resposta JSON `{"url":"/account/sales"}`.

### 🟠 F-003: API de Dados Públicos no Wayback
**URL:** https://app.buscaprime.com.br/api/public/dataset/v3/people/basic
**Severidade:** Alto
**Detalhes:** Endpoint de API de consulta de dados pessoais identificado via Wayback Machine. Parâmetros potenciais: name, document, cpf, email, phone. Atualmente protegido por Cloudflare.

### 🟡 F-004: Informações da Empresa Vazadas
**Severidade:** Médio
**Detalhes:** CNPJ: 37947000180 (LNXWEB TECNOLOGIA DA INFORMACAO LTDA), email: suporte@buscaprime.com.br, WhatsApp: (11) 95992-5251, Stack: Laravel/Metronic 7.0.5, Store ID Yampi: 596579.

### 🟡 F-005: Servidor de Email (cPanel) com Múltiplos Serviços
**Host:** mail.buscaprime.com.br (192.185.216.193)
**Severidade:** Médio
**Detalhes:** Apache/cPanel expõe FTP (21), MySQL (3306), IMAP (143), POP3 (110), SMTP (25,465,587), WHM (2083), Webmail (2096). Potencial para brute force e acesso indevido.

### 🟡 F-006: Yampi Checkout — Tokens Expostos
**Severidade:** Médio
**Detalhes:** Cookies criptografados expostos: XSRF-TOKEN, __goc_session__, bubbstore_checkout, lnxweb-tecnologia_cart. WebSocket Key: rwp2fhemqsrnovvjaai9 (reverb.yampi.io).

## Attack Surface Consolidada

### Hosts sem Cloudflare (Ataque Direto)
| Host | IP | Serviços |
|------|-----|----------|
| seguro.buscaprime.com.br | 170.82.173.30 | gocache + openresty |
| mail.buscaprime.com.br | 192.185.216.193 | Apache cPanel |

### Hosts com Cloudflare
| Host | Função | Tecnologia |
|------|--------|------------|
| buscaprime.com.br | Site principal | PHP, Bootstrap, jQuery |
| app.buscaprime.com.br | Dashboard/Admin | Metronic 7.0.5 |
| painel.buscaprime.com.br | Login | PHP |

### Endpoints Sensíveis
- `/api/public/dataset/v3/people/basic` (Wayback — possivelmente dados pessoais)
- `/auth/login` (Laravel — CSRF)
- `/cart` (Checkout Yampi)
- `/auth/register` (HTTP 404 com 78KB de conteúdo New Relic)
- `/account/sales` (HTTP 200 sem auth — página de vendas)

## Acessos Obtidos
Nenhum acesso até o momento. Tentativas de brute force no login em andamento.

## Cronologia
| Data/Hora | Evento |
|-----------|--------|
| $(date -u +"%Y-%m-%dT%H:%M:%SZ") | Início do engagement |
| $(date -u +"%Y-%m-%dT%H:%M:%SZ") | Descoberto servidor origem: seguro.buscaprime.com.br (sem Cloudflare) |
| $(date -u +"%Y-%m-%dT%H:%M:%SZ") | Identificados 12 subdomínios |
| $(date -u +"%Y-%m-%dT%H:%M:%SZ") | Encontrada API pública (/api/public/dataset/v3/people/basic) |
| $(date -u +"%Y-%m-%dT%H:%M:%SZ") | Descoberto cPanel com FTP/MySQL/IMAP/POP3 expostos |
| $(date -u +"%Y-%m-%dT%H:%M:%SZ") | Realizados testes de SQLi, SSTI, Command Injection no login |

---
*Relatório gerado automaticamente pelo Red Team Operator*