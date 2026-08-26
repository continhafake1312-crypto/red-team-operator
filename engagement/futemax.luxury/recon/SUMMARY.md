# Attack Surface — futemax.luxury

**Gerado em:** 2026-08-26
**Fases concluídas:** Recon Passivo (Fase 2) + Recon Ativo (Fase 3)

---

## Topologia da Infraestrutura

```
USUÁRIO → Cloudflare (104.21.48.87 / 172.67.183.8)
            ↓
         Joken JWT Challenge (JS anti-bot HS256)
            ↓
         ORIGEM REAL: 212.92.104.6 (Rússia, sem WAF)
            ↓
         nginx + WordPress + 8 vhosts + SSHD:1022 + DNS:53
```

### Descoberta Crítica
- **IP Real Antigo:** 172.241.213.98 (Luxemburgo) → agora redireciona para survey-smiles.com
- **IP Real Atual:** 212.92.104.6 (Rússia, Moscow) — **SEM Cloudflare, SEM WAF** ← Acesso direto
- `futemax.lol` → agora aponta para 212.92.104.6 (NS: koaladns.com)

---

## Ranking de Payoff (Prioridade de ataque)

| Prioridade | Alvo/Vetor | Motivação | Próximo Passo |
|-----------|-------------|-----------|---------------|
| 🔴 **CRÍTICO** | **Origin 212.92.104.6:80** (HTTP direto) | Sem Cloudflare, sem WAF. Apenas Joken JWT. Bypass via proxy direto ou JWT crack = acesso a TODOS os vhosts | Testar acesso direto com JWT válido; ffuf content discovery sem WAF |
| 🔴 **CRÍTICO** | **Origin 212.92.104.6:1022** (SSH OpenSSH 8.9p1) | CVE-2023-38408 (RCE pre-auth via SSH agent), CVE-2023-48795 (Terrapin). Serviço exposto sem Cloudflare | Verificar CVE applicability; testar creds padrão |
| 🔴 **ALTO** | **futemax.luxury/wp-login.php** | WordPress login acessível. User `paulodbs` conhecido. Brute force + wpscan | WPScan enumerar users/plugins; brute force xmlrpc |
| 🔴 **ALTO** | **futemax.luxury/xmlrpc.php** | Acessível (405). Clássico para brute force e DoS | Testar system.listMethods; brute force com wpscan |
| 🔴 **ALTO** | **Joken JWT (HS256)** | Chave pode ser fraca. Ataques: none algorithm, hashcat rockyou, session fixation, reuso entre vhosts | Capturar JWT; testar alg:none; crack secret |
| 🟡 **MÉDIO** | **Vhosts internos** (admin, api, stream, shop) | 8 vhosts no origin. Acessíveis com JWT válido. admin = painel, api = backend, shop = checkout | Após bypass JWT, explorar cada vhost |
| 🟡 **MÉDIO** | **Origin 212.92.104.6:53/udp** (DNS) | DNS aberto? Pode permitir zone transfer, enumeração de subdomínios | Testar zone transfer; enumerar registros |
| 🟡 **MÉDIO** | **Origin 212.92.104.6:8444** | Serviço desconhecido (pcsync-http?) | nmap -sV -sC aprofundado; tentar HTTP |
| 🟡 **MÉDIO** | **IDOR nos parâmetros GET** (?page_id=, ?p=, ?channel=, ?match=) | Parâmetros numéricos diretos | Testar sequenciais por enum |
| 🟡 **MÉDIO** | **WordPress REST API** (/index.php?rest_route=/) | Pode expor dados de usuários/posts/config | Enumerar rotas disponíveis |
| 🟡 **MÉDIO** | **Domínios relacionados** (futemax.live, .stream, .site) | Infraestrutura de streaming backend. Podem compartilhar servidor | Scan básico; verificar relação |
| 🟡 **MÉDIO** | **survey-smiles.com** (208.91.196.145) | Redirecionamento suspeito do origin antigo. Mesmo operador? | Investigar conteúdo e relação |
| 🟢 **BAIXO** | **Origin antigo 172.241.213.98** | Fora de uso (302 → survey-smiles.com) | Esgotado — apenas confirmar redirecionamento |
| 🟢 **BAIXO** | **Cloudflare bypass** | Origin já descoberto diretamente (212.92.104.6) | Bypass não necessário para acessar origin |
| 🟢 **BAIXO** | **CVE Rank Math / XML Sitemap** | Plugins comuns, baixo risco comparado aos demais | Pesquisar se há CVE recente aplicável |

---

## Hosts e Serviços Mapeados

### 1. futemax.luxury (via Cloudflare)
| Atributo | Valor |
|----------|-------|
| IPs | 104.21.48.87, 172.67.183.8 (Cloudflare) |
| Portas | 80 (HTTP→HTTPS redirect), 443 (HTTPS) |
| CMS | WordPress 7.1 (falsificada) / provavelmente 6.x |
| Theme | Canais Play v1.2.9 (canaisplay.top) |
| Plugins | Rank Math SEO, XML Sitemap & Google News, Google Analytics |
| WAF | Cloudflare (protegido) |
| Anti-bot | Joken JWT HS256 (JS challenge anti-bot) |

### 2. Origin Real — 212.92.104.6 (Rússia)
| Atributo | Valor |
|----------|-------|
| IP | 212.92.104.6 (Moscow, Rússia) |
| ISP | Serveroid, LLC (AS50749) |
| Portas abertas | **80** (nginx), **443** (SSL error, Cloudflare whitelist), **1022** (OpenSSH 8.9p1), **8080** (nginx), **8444** (desconhecido, SSL error), **53/udp** (DNS) |
| WAF | **Nenhum** (apenas Joken) |
| Serviços | nginx, OpenSSH, DNS |
| Acessibilidade | **Direta** — sem Cloudflare, sem WAF |

### 3. Origin Antigo — 172.241.213.98 (Luxemburgo)
| Atributo | Valor |
|----------|-------|
| Portas | 80 (nginx → 302 survey-smiles.com), 443 (nginx), 8080 |
| Status | Legado, redirecionando para survey-smiles.com |

### 4. survey-smiles.com — 208.91.196.145
| Atributo | Valor |
|----------|-------|
| IP | 208.91.196.145 |
| WAF | Google Cloud App Armor |

---

## Vhosts no Origin 212.92.104.6

| Vhost | Prioridade | Notas |
|-------|-----------|-------|
| admin.futemax.luxury | 🔴 Alta | Painel administrativo |
| api.futemax.luxury | 🔴 Alta | API backend |
| www.futemax.luxury | 🟡 Média | WWW redirect |
| static.futemax.luxury | 🟡 Média | Estáticos |
| stream.futemax.luxury | 🟡 Média | Streaming |
| help.futemax.luxury | 🟢 Baixa | Suporte |
| shop.futemax.luxury | 🟡 Média | Loja/checkout |
| cdn.futemax.luxury | 🟡 Média | CDN interna |
| api.futemax.lol | 🔴 Alta | API domínio antigo |

> **Nota:** Todos retornam Joken catch-all. Requerem JWT válido para acesso real.

---

## Domínios Relacionados

| Domínio | IP | Provedor | Status |
|---------|-----|----------|--------|
| futemax.lol | 212.92.104.6 | KoalaDNS/Same server | **Origin** |
| futemax.com | 172.237.146.x | Linode | Estacionado |
| futemax.net | 172.237.146.x | Linode | Estacionado |
| futemax.live | 172.236.114.x | — | Ativo? |
| futemax.stream | 157.90.33.x | Hetzner | Potencial backend streaming |
| futemax.biz | 44.232.173.x | AWS | Ativo? |
| futemax.site | 104.21.78.30 | Cloudflare | Ativo? |
| futemax.top | 104.21.49.32 | Cloudflare | Ativo? |
| futemax.fun | 104.21.47.107 | Cloudflare | Ativo? |

---

## Potenciais CVEs para Exploração

| Serviço/Versão | CVE | Tipo | Severidade |
|---------------|-----|------|-----------|
| OpenSSH 8.9p1 Ubuntu | CVE-2023-38408 | RCE pre-auth via ssh-agent | 🔴 Crítica |
| OpenSSH 8.9p1 Ubuntu | CVE-2023-48795 (Terrapin) | Prefix truncation | 🟡 Média |
| WordPress (qualquer 6.x) | Vários | RCE/XSS/SQLi via plugins | Variável |
| jQuery 3.7.1 | CVE-2020-11023 | XSS via HTML | 🟢 Baixa |
| JWT HS256 custom | — | Weak secret / none algorithm | 🔴 Crítica |

---

## Resumo de Achados Preliminares

1. **🔴 CRÍTICO — Origin real exposto sem WAF**: 212.92.104.6 é acessível diretamente sem Cloudflare. Apenas Joken JWT protege.
2. **🔴 CRÍTICO — SSH na porta 1022**: OpenSSH 8.9p1 exposto sem WAF/rate limit, potencial RCE (CVE-2023-38408).
3. **🔴 ALTO — WordPress login acessível**: wp-login.php + xmlrpc.php acessíveis, usuário paulodbs conhecido.
4. **🔴 ALTO — Joken JWT pode ser fraco**: HS256 com secret potencialmente crackeável ou none algorithm.
5. **🟡 MÉDIO — 8 vhosts internos**: admin/api/stream/shop protegidos por JWT — acesso total se JWT bypassado.
6. **🟡 MÉDIO — DNS na 53/udp**: Possível enumeração de subdomínios.
7. **🟡 MÉDIO — IDOR em parâmetros**: ?page_id=, ?p=, ?channel= sequenciais.

---

## Próximos Passos Imediatos

1. **Enumeração Profunda (Fase 5):** Content discovery no origin 212.92.104.6 (ffuf sem WAF); Joken JS analysis; SSL/8444 probe
2. **Ataque Webapp (Fase 6):** WPScan; brute force wp-login; testar xmlrpc; IDOR em parâmetros GET; JWT none alg + crack
3. **CVE Research (Fase 7):** CVE-2023-38408 (SSH); WordPress 6.x CVEs; Rank Math CVEs
4. **Exploit (Fase 7):** Validar SSH RCE; JWT bypass; creds padrão admin/api