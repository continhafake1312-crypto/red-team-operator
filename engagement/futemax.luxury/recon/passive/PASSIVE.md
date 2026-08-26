# PASSIVE.md — Recon Passivo + OSINT

**Alvo:** futemax.luxury
**Data:** 2026-08-26
**Especialista:** recon-passive

---

## Sumário Executivo

| Métrica | Valor |
|---------|-------|
| Subdomínios encontrados (DNS) | 0 (domínio muito recente) |
| Subdomínios por vhost (origem) | 8 |
| Subdomínios vivos confirmados | 1 (futemax.luxury via Cloudflare) |
| IPs de origem real | 1 (172.241.213.98) |
| IPs Cloudflare | 2 (104.21.48.87, 172.67.183.8) |
| Domínios relacionados | 15+ (futemax.com, .net, .org, .lol, .live, .stream, etc.) |
| CMS | WordPress (Canais Play theme v1.2.9) |
| CDN | Cloudflare |
| Emails encontrados | 0 (privacidade WHOIS) |
| Usuários identificados | paulodbs (Facebook admin) |
| Buckets cloud | Nenhum público |
| Takeover candidates | Nenhum |

---

## 1. DNS Completo

### futemax.luxury (ALVO PRINCIPAL)
- **Registrar:** Dynadot Inc
- **Criação:** 2026-08-21 (5 DIAS atrás) — domínio extremamente recente
- **Privacidade:** Super Privacy Service LTD c/o Dynadot (California, US)
- **Name Servers:** `imani.ns.cloudflare.com`, `jack.ns.cloudflare.com`
- **A Records:** 104.21.48.87, 172.67.183.8 (ambos Cloudflare proxy)
- **AAAA:** 2606:4700:3036::6815:3057, 2606:4700:3034::ac43:b708
- **MX:** Nenhum — sem servidor de email
- **TXT:** Nenhum — sem SPF, DMARC ou DKIM
- **Status:** serverTransferProhibited, clientTransferProhibited, addPeriod

### futemax.lol (DOMÍNIO ANTIGO — ORIGEM REAL)
- **Registrar:** NameCheap, Inc
- **Criação:** 2025-03-11 (1.5 anos)
- **IP:** 172.241.213.98 (SEM Cloudflare — acesso direto)
- **Name Servers:** `ns1.brainydns.com`, `ns2.brainydns.com`
- **DNSSEC:** signedDelegation

### Rede de Domínios futemax.*
Foram identificados **15+ domínios** relacionados, sugerindo uma operação em larga escala de streaming ilegal:

| Domínio | IP | Provider | Notas |
|---------|-----|----------|-------|
| futemax.com | 172.237.146.x | Linode | Estacionado (parklogic.com) |
| futemax.net | 172.237.146.x | Linode | Estacionado |
| futemax.org | 172.237.146.x | Linode | Estacionado |
| futemax.live | 172.236.114.x | - | Ativo? |
| futemax.stream | 157.90.33.x | Hetzner | Ativo? |
| futemax.biz | 44.232.173.x | AWS | Ativo? |
| futemax.online | 192.64.119.113 | - | Ativo? |
| futemax.site | 104.21.78.30 | Cloudflare | Ativo? |
| futemax.top | 104.21.49.32 | Cloudflare | Ativo? |
| futemax.fun | 104.21.47.107 | Cloudflare | Ativo? |
| futemax.xyz | 76.223.54.x | AWS | Ativo? |
| futemax.shop | 76.223.54.x | AWS | Ativo? |
| futemax.club | 103.224.212.214 | - | Ativo? |

---

## 2. Subdomínios

### Via Fontes Passivas (DNS)
- **crt.sh:** 0 resultados (domínio sem certificados emitidos ainda)
- **subfinder:** 0 resultados
- **assetfinder:** 1 (futemax.luxury — apenas o próprio domínio)
- **DNS bruteforce (180+ palavras):** 0 resultados

### Via VHOST Scan no Servidor de Origem
O servidor de origem `172.241.213.98` possui **8 virtual hosts** configurados que NÃO têm registros DNS públicos mas respondem a requisições:

```
admin.futemax.luxury     → Painel administrativo (potencial)
api.futemax.luxury       → API (potencial)
www.futemax.luxury       → WWW redirect
static.futemax.luxury    → Arquivos estáticos
stream.futemax.luxury    → Streaming de conteúdo
help.futemax.luxury      → Ajuda/suporte
shop.futemax.luxury      → Loja/checkout
cdn.futemax.luxury       → CDN interna
api.futemax.lol          → API do domínio antigo
```

**Todos protegem com sistema JWT anti-bot.** Estes vhosts devem ser priorizados na fase de enumeração ativa (tentar acessar via proxy com JWT válido).

---

## 3. Tech Stack

### WordPress
- **CMS Detectado:** WordPress (versão informada "7.1" — provavelmente falsificada, WP real está em 6.x)
- **Theme:** "Canais Play" v1.2.9 (https://canaisplay.top)
  - Tema customizado para streaming IPTV/futebol
  - CSS Versioning sugere atualizações frequentes (versões: 1742226528, 1742231604, 1742234144, 1742249301)
- **Plugins:**
  - Rank Math SEO (plugin de SEO completo)
  - XML Sitemap & Google News v5.4.9
  - Google Analytics (G-65MQTT185Q) via Google Tag Manager

### Servidor de Origem (172.241.213.98)
- **Web Server:** nginx
- **Portas Abertas:** 80 (nginx), 443 (tcpwrapped), 8080 (tcpwrapped)
- **Portas Filtradas:** 21 (FTP), 22 (SSH), 3306 (MySQL), 8081, 8443
- **Sistema Anti-Bot:** "Joken" — sistema JWT proprietário
  - Algoritmo: HS256
  - Payload: `aud`, `exp`, `iat`, `iss` ("Joken"), `js` (1), `jti` (UUID), `nbf`, `ts`
  - Provável bypass de Cloudflare via validação JS
- **Provider:** NetRange 172.241.88.0-172.241.215.255 (LU — Luxemburgo)

### CDN/Proxy
- **Cloudflare:** DNS e proxy HTTP em futemax.luxury
- **Tracking Externo:**
  - histats.com (ID: 4943580) — analytics
  - acscdn.com — anti-adblock
  - waust.at — tracking
  - Google Tag Manager / Google Analytics G-65MQTT185Q

### Favicon
- **Hash mmh3:** 1142489731 (fingerprint para Shodan/Censys)

---

## 4. OSINT

### Pessoas
- **paulodbs** — identificado como Facebook admin via meta tag `fb:admins`
  - Possível operador/desenvolvedor do site
  - Potencial username em outras plataformas

### Redes Sociais
- Facebook: domínio associado (fb:admins)

### Breaches
- Nenhum breach encontrado para futemax.luxury (domínio muito recente)
- futemax.lol (1.5 anos) pode ter histórico — verificar em fontes pagas (DeHashed, IntelX)

### GitHub
- Nenhum repositório ou código vazado contendo "futemax.luxury"
- "futemax" como termo geral pode revelar repositórios do tema Canais Play

### Google Dorks
- `site:futemax.luxury` — apenas o domínio principal indexado
- `inurl:futemax.luxury` — poucos resultados (domínio novo)

### Domínios Adicionais
- **canaisplay.top** — site do tema WordPress (provavelmente mesmo operador)
- **parklogic.com** — serviço de estacionamento para futemax.com/.net/.org

---

## 5. Cloud

### Buckets S3
- Nenhum bucket público encontrado (futemax, futemax-luxury, futemaxluxury, variações com -assets, -backup, -dev, -staging)
- Todos retornaram 404 ou AccessDenied

### Subdomain Takeover
- Nenhum CNAME dangling identificado
- Todos os vhosts estão ativos no servidor de origem

### Provedores de Nuvem Identificados
| Provedor | Domínios | Uso |
|----------|----------|-----|
| Cloudflare | futemax.luxury, .site, .top, .fun | CDN/Proxy/DNS |
| Linode | futemax.com, .net, .org | Servidores de estacionamento |
| Hetzner | futemax.stream | Servidor potencial de streaming |
| AWS | futemax.biz, .xyz, .shop | Servidores diversos |
| Luxembourg DC | 172.241.213.98 | Servidor de origem principal |

---

## 6. Wayback Machine

### Endpoints Extraídos do HTML
Devido à idade do domínio (5 dias), waybackurls retornou apenas a homepage. Endpoints foram manualmente extraídos do HTML:

#### Parâmetros GET Funcionais
- `?channel=NOME` — 22 canais disponíveis (globo, espn, sportv, combate, tnt, etc.)
- `?event=SLUG` — Eventos UFC ao vivo
- `?match=SLUG` — Partidas de futebol ao vivo
- `?match_category=SLUG` — 20+ campeonatos (libertadores, brasileirao, la-liga, etc.)
- `?team=SLUG` — 18 times (flamengo, corinthians, palmeiras, real-madrid, etc.)
- `?page_id=ID` — IDs 3, 68, 70
- `?p=ID` — Post ID 16077
- `?post_type=event` — Listagem de eventos
- `?s=TERMO` — Busca (via Rank Math)

#### Endpoints WordPress Acessíveis
- **/wp-login.php** → HTTP 200 (tela de login funcional — vetor de brute force)
- **/xmlrpc.php** → HTTP 405 (acessível — brute force de credenciais)
- **/wp-admin/** → HTTP 301 (redirect para login)
- **/wp-content/** → HTTP 200 (upload dir listável?)
- **/wp-includes/** → HTTP 403
- **/robots.txt** → HTTP 200 (contém sitemap apontando para futemax.lol)
- **/index.php?rest_route=/** → REST API (WP JSON)

#### Tracking/Analytics
- histats.com (gif tracking)
- Google Analytics (G-65MQTT185Q)
- Multiple gambling affiliate links (stake, gangbob, spinpolo, kenspin, etc.)

---

## 7. Sistema de Autenticação JWT ("Joken")

### Decodificação do JWT
```
Header: {"alg":"HS256","typ":"JWT"}
Payload: {"aud":"Joken","exp":1787712727,"iat":1787705527,"iss":"Joken",
          "js":1,"jti":"337j9d5e7jhganmo7s5fobt1","nbf":1787705527,
          "ts":1787705527711312}
```

### Funcionamento
1. Usuário faz request → servidor retorna página "Loading..." com JWT
2. JavaScript valida o JWT no cliente
3. Se válido, redireciona para `/?ch=1&js=JWT&sid=SID`
4. Sistema "Joken" provalvemente verifica integridade via HMAC-SHA256 (HS256)
5. JWT contém timestamp, session ID, e flag JS (proteção anti-bot)

### Implicações
- **Chave HS256 pode ser fraca** — tentativa de cracking com hashcat (rockyou)
- **JWT "none" attack** — testar se aceita algoritmo `none`
- **JWT reuso** — tokens podem ser reutilizados entre vhosts
- **Session fixation** — SID pode ser previsível

---

## 8. Limitações e Observações

### Domínio Extremamente Recente
- Criado há apenas **5 dias** (21/08/2026)
- Nenhum certificado SSL em CT logs (crt.sh vazio)
- Nenhum histórico em Wayback Machine
- Nenhum dado em urlscan.io ou AlienVault OTX

### Cloudflare
- Toda a comunicação passa por Cloudflare, ocultando IP real
- Desafio Cloudflare ao acessar via proxy (dehashed, etc.)
- Sistema "Joken" provavelmente é um bypass customizado para Cloudflare

### Próximos Passos Recomendados
1. **Recon Ativo:** Escanear IP de origem (172.241.213.98) com nmap completo + portas UDP. Verificar portas 21, 22, 3306 (filtradas — podem estar acessíveis com parâmetros corretos)
2. **Enumeração:** Explorar vhosts (admin, api, stream, shop) via JWT. Tentar bypass do sistema Joken (none algorithm, weak secret cracking)
3. **Webapp:** Brute force wp-login.php com users comuns (admin, paulodbs, etc.). Testar xmlrpc.php para ataques de autenticação. Verificar upload em wp-content/uploads/
4. **Domínios Relacionados:** Investigar futemax.live, futemax.stream, futemax.site (podem estar rodando infraestrutura de streaming backend)
5. **CVE Research:** Pesquisar CVEs para WordPress 6.x + plugins (Rank Math, XML Sitemap)
6. **OSINT Adicional:** Pesquisar "paulodbs" em redes sociais, fóruns, GitHub. Pesquisar "canaisplay.top" por temas vulneráveis
7. **Cloud:** Testar buckets com variações dos 15+ domínios relacionados

---

## 9. Artefatos Gerados

| Arquivo | Descrição |
|---------|-----------|
| `dns_full.txt` | WHOIS completo + registros DNS de futemax.luxury e .lol |
| `subdomains_all.txt` | Lista de subdomínios (DNS + vhost na origem) |
| `subdomains_live.txt` | Subdomínios vivos confirmados |
| `wayback_endpoints.txt` | Endpoints extraídos + parâmetros GET |
| `wayback_js.txt` | Arquivos JS + CDNs externas |
| `osint_emails.txt` | Emails e contatos encontrados |
| `osint_github.txt` | GitHub/breaches |
| `tech_stack.txt` | Tech stack por host |
| `cloud_buckets.txt` | Cloud buckets testados + takeover check |

---

**Fim do relatório de reconhecimento passivo.**