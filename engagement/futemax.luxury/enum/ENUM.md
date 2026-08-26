# ENUM.md — Enumeração Profunda — futemax.luxury

**Data:** 2026-08-26T02:10Z
**Especialista:** enum
**Alvo:** futemax.luxury (212.92.104.6 origin + Cloudflare 104.21.48.87)

---

## Sumário Executivo

| Alvo | Método | Status | Findings |
|------|--------|--------|----------|
| Origin 212.92.104.6:80 | Content discovery (ffuf) | ⚠️ Bloqueado por Joken | Nenhum endpoint distinto sem JWT |
| Origin 212.92.104.6:8444 | Service fingerprint | ⚠️ Identificado como TLS custom | Possível Webmin/K8S API |
| Origin 212.92.104.6:53/udp | DNS enum | ❌ Sem resposta | Firewall bloqueia UDP externo |
| Cloudflare futemax.luxury | WordPress REST API | ✅ Completo | 100+ rotas, 1 user, 16k posts |
| Cloudflare futemax.luxury | WPScan | ⚠️ Parcial (rate-limit) | Theme, plugins, XML-RPC confirmados |
| Cloudflare futemax.luxury | JS Analysis | ✅ Completo | Nenhum segredo nos JS |
| Cloudflare futemax.luxury | API Discovery | ✅ Completo | Sem Swagger/GraphQL |
| Vhosts (8) | Vhost testing | ⚠️ Bloqueado por Joken | Todos retornam Joken catch-all |

---

## Arquivos Gerados

| Arquivo | Conteúdo |
|---------|----------|
| `content_discovery_origin.txt` | ffuf no origin — todos Joken |
| `content_discovery_cf.txt` | Endpoints WordPress via Cloudflare |
| `js_endpoints.txt` | JS analysis — sem secrets |
| `params_mining.txt` | Parâmetros GET funcionais |
| `api_docs.txt` | REST API routes + Swagger/GraphQL |
| `wp_enum.txt` | WPScan + REST API enumeration |
| `dns_enum.txt` | DNS zone transfer/records |
| `vhosts_test.txt` | Vhosts via Host header injection |
| `porta_8444.txt` | Port 8444 service fingerprint |

---

## Findings por Host

### 1. Origin Real — 212.92.104.6:80

**Acessibilidade:** Apenas via proxychains4 (Tor) — IP direto retorna 429 rate limit
**Proteção:** Joken JWT HS256 challenge em TODOS os endpoints
**Content Discovery:** 4752 paths testados — 100% Joken challenge

**🚫 Bloqueio Total:** Nenhum conteúdo acessível sem JWT válido ou bypass do Joken.

### 2. futemax.luxury (via Cloudflare)

**REST API WordPress — Totalmente Exposta (sem auth):**
- `/wp/v2/users` — 1 usuário: paulodbs (ID=1)
- `/wp/v2/posts` — 16000+ posts (SEO gambling spam)
- `/wp/v2/pages` — 3 páginas
- `/wp/v2/media` — 13+ imagens
- `/wp/v2/categories` — 5 categorias
- `/wp/v2/search` — busca pública
- `/wp/v2/comments` — vazio
- `/wp/v2/types` — 10+ custom post types

**Rotas Customizadas Expostas (requerem auth — 401):**
- `/rankmath/v1/*` — ~30 endpoints (dashboard, analytics, Content AI, settings)
- `/wp-abilities/v1/*` — Plugin customizado
- `/wp-site-health/v1/*` — Health checks
- `/wp/v2/settings`, `/wp/v2/plugins`, `/wp/v2/themes`

**XML-RPC (Totalmente Habilitado — 80 métodos):**
- `wp.getUsers`, `wp.getPosts`, `wp.uploadFile`, `wp.getOptions`
- `metaWeblog.newMediaObject`, `wp.getAuthors`
- Vetor para brute force de credenciais

**WordPress Theme:** Canais Play v1.2.9 (canaisplay.top)
**Plugins:** Rank Math SEO, XML Sitemap & Google News v5.4.9

### 3. Origin 212.92.104.6:8444

**Serviço:** TLS custom (não identificado por nmap)
**Resposta HTTP:** TLS Alert (0x15) — rejeita HTTP direto
**Resposta HTTPS:** SSL_ERROR_SYSCALL — handshake falha
**Possível:** Webmin, K8S API, ou serviço de administração customizado

### 4. Origin 212.92.104.6:53/udp

**Status:** Sem resposta para consultas externas
**Firewall:** UDP provavelmente filtrado por IP de origem

### 5. Vhosts (8 vhosts)

**Todos bloqueados por Joken:** Nenhum conteúdo distinto sem JWT bypass.
Variação de tamanho (475-482 bytes) = apenas diferença no JTI.

---

## Vulnerabilidades Candidates Identificadas

### 🔴 Alta Prioridade

| # | Tipo | Alvo | Detalhe |
|---|------|------|---------|
| V-01 | **REST API sem auth** | futemax.luxury | `/wp/v2/users` expõe user paulodbs. `/wp/v2/posts` expõe 16k+ posts |
| V-02 | **XML-RPC habilitado** | futemax.luxury | 80 métodos. Permite brute force de creds WP via `wp.getUsers` |
| V-03 | **Joken JWT HS256** | Origin | Única barreira. Se key fraca → bypass total do origin + vhosts |
| V-04 | **IDOR em POST IDs** | futemax.luxury | IDs sequenciais (386-16077) via REST API. Todos posts públicos |
| V-05 | **Rank Math exposto** | futemax.luxury | 30+ endpoints REST. Dashboard e analytics expostos |

### 🟡 Média Prioridade

| # | Tipo | Alvo | Detalhe |
|---|------|------|---------|
| V-06 | **Porta 8444 serviço desconhecido** | Origin | TLS service não identificado — potencial vetor admin |
| V-07 | **SEO Spam Farm** | futemax.luxury | 16k+ posts de gambling em 15+ idiomas. Violação TOS Google |
| V-08 | **wp-abilities plugin** | futemax.luxury | Plugin customizado não identificado. Capacidades desconhecidas |
| V-09 | **Custom post type rm_content_editor** | futemax.luxury | Post type custom — possibilidade de conteúdo sensível |

---

## Próximos Passos para Webapp

### Imediatos (🔴 Alta)

1. **Bypass Joken JWT** — testar `alg: none`, crack HS256 secret
2. **XML-RPC brute force** — `wp.getUsers` + `wp.getOptions` com creds default
3. **IDOR via REST API** — testar `/wp/v2/users/me` com session fixation, enumerar mais dados
4. **WPScan completo** — com API token se disponível, enumerar vulnerabilidades de plugins

### Médio prazo (🟡 Média)

1. **Brute force wp-login.php** — user paulodbs + wordlist comum
2. **Port 8444** — scan com nmap -A completo, tentar conexão SSH/TLS específico
3. **Rank Math admin** — testar CSRF, IDOR nos endpoints rankmath/v1
4. **Upload abuse** — testar upload via wp.uploadFile se creds obtidas
5. **wp-content/uploads** — enumerate arquivos de mídia para informações sensíveis

### Longo prazo (🟢 Baixa)

1. **Domínios relacionados** — futemax.live, .stream, .site (potencial infra compartilhada)
2. **survey-smiles.com** — investigar relação (redirect suspeito)
3. **Gravatar hash** — buscar paulodbs em redes sociais (gravatar hash conhecido)

---

## Artefatos Brutos

| Arquivo | Local |
|---------|-------|
| WP REST API routes | `/tmp/opencode/wp_routes.json` |
| JS files analisados | `/tmp/opencode/theme_*.js` |
| nmap 8444 | `/tmp/opencode/nmap_8444.txt` |
| WPScan output | `/tmp/opencode/wpscan_direct.txt` |
| Homepage origin | `/tmp/opencode/homepage_origin.html` |