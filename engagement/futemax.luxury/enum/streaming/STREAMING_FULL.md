# STREAMING FULL REPORT — futemax.luxury

**Data:** 2026-08-26
**Fase:** Enumeração profunda de streaming (reidosembeds.online + embedflix.autos)
**Coordenador:** pentest (Red Team Operator)

---

## 1. reidosembeds.online — "Rei dos Embeds"

**URL:** https://reidosembeds.online/
**Título:** Rei dos Embeds
**Servidor:** Cloudflare (não bloqueia, sem challenge JWT)
**Status:** ✅ ACESSÍVEL

### Função
Diretório/agregador de **305 canais de TV ao vivo**. Não hospeda vídeo — redireciona para `v1.rdse.lat/{slug}`.

### Páginas descobertas
| Path | Função |
|------|--------|
| `/` | Home com grade de 305 canais + busca |
| `/agenda` | Agenda de programação |
| `/guia` | Guia de TV |
| `/doc` | **API Docs** (documentação REST completa) |

### API REST Descoberta (documentada em /doc)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api` | Base da API (retorna 404) |
| GET | `/api/channels` | **Lista TODOS os 305+ canais** |
| GET | `/api/channels/{id}` | Canal específico (ex: `/api/channels/combate`) |
| GET | `/api/channels/categories` | Lista as 18 categorias |
| GET | `/api/channels?category=Noticias` | Filtra por categoria |
| GET | `/api/eventos` | Lista eventos esportivos |
| GET | `/api/eventos/{slug}` | Evento específico |
| GET | `/api/eventos/categories` | Categorias de eventos |
| GET | `/api/eventos?category=Futebol&status=live` | Filtra eventos |
| GET | `/api/pesquisa?q=gremio` | Pesquisa global |
| GET | `/api/guia` | Guia XMLTV |

### Formato de Resposta (ex: /api/channels/combate)
```json
{
  "success": true,
  "data": {
    "id": "combate",
    "name": "Combate",
    "embed_url": "https://v1.rdse.lat/combate",
    "logo_url": "https://d1muf25xaso8hp.cloudfront.net/.../combate.png",
    "preview_url": "https://uk-cristosalva-cavalo-6d2.useseulivrearbitrio.sbs/combate/preview.jpg",
    "category": "Esportes",
    "is_active": true,
    "now_playing_title": "Programação Combate",
    "now_playing_progress": 74,
    "now_playing_has_guide": true,
    "now_playing_next_programmes": [...]
  }
}
```

### API Pública — Sem Autenticação
- ✅ **Nenhum JWT ou API key necessária**
- ✅ Acessível via Cloudflare sem challenge
- ✅ URLs de embed expostas diretamente
- ⚠️ Risco: scraping em massa de 305+ canais

### Domínios Relacionados
- Principal: `v1.rdse.lat` (verde/Funcionando)
- Alternativo: `v1.rdse.site` (amarelo/Pode oscilar)
- Bloqueados: `v3.rdse.site`, `v4.rdse.site`, `v2.rdse.site`, `rdse.site`, `rde.lat`, `rde.buzz` (vermelho)
- Funcionando: `w1.rdse.lat`, `rdse.lat`

### Assets
- Logos: `https://d1muf25xaso8hp.cloudfront.net/https://reidosembeds.online/img/{slug}.png`
- Previews: `https://uk-cristosalva-cavalo-6d2.useseulivrearbitrio.sbs/{slug}/preview.jpg`

---

## 2. embedflix.autos — "Embedflix"

**URL:** https://embedflix.autos/
**Título:** Embedflix - Streaming de TV ao Vivo
**Servidor:** Cloudflare (sem challenge)
**Status:** ✅ ACESSÍVEL

### Função
Plataforma de streaming com **76+ canais**. Landing page moderna com:
- Load balancing inteligente
- Qualidade adaptativa (480p-1080p)
- Player Clappr com Chromecast
- Recuperação automática
- Tecnologia P2P

### Endpoints Descobertos

| Path | Função | Status |
|------|--------|--------|
| `/` | Landing page | ✅ 200 |
| `/tv/` | **Página de canais** (lista todos os 76+ canais com embed code) | ✅ 200 |
| `/tv/index.php` | IDEM ao /tv/ | ✅ 200 |
| `/tv/player.php?id=combate` | **Player ofuscado** com JS base64 | ✅ 200 |
| `/tv/player.php?id=band-sports` | Player ofuscado | ✅ 200 |
| `/tv/player.php?id=globo-sp` | Player ofuscado | ✅ 200 |
| `/player.php?id=combate` | 404 | ❌ |
| `/play.php?id=combate` | 404 | ❌ |
| `/embed.php?channel=combate` | 404 | ❌ |
| `/api/channels` | 404 | ❌ |
| `/channels` | 404 | ❌ |

### Canais Disponíveis (parcial — via /tv/)
**Abertos:** Globo SP, Globo RJ, Globo MG, SBT, Record TV, Band, RedeTV!, TV Cultura
**Esportes:** SporTV, SporTV 2, SporTV 3, ESPN, ESPN 2, ESPN 3, ESPN 4, Fox Sports, Fox Sports 2, Premiere FC, Premiere 2-7, Band Sports, Combate, Ei Plus, Fish TV
**Notícias:** CNN Brasil, GloboNews, BandNews TV, Record News, SBT News
**Infantil:** Cartoon Network, Disney Channel, Disney Junior, Nickelodeon, Nick Jr, Discovery Kids
**Documentários:** Discovery Channel, Animal Planet, History Channel, National Geographic
**Filmes:** Telecine Action, Telecine Cult, Telecine Fun, Telecine Pipoca, Telecine Premium, Telecine Touch, Megapix, Studio Universal, Paramount, Sony, AXN, etc

### Proteção: Ofuscação JS com Base64
O player.php retorna UM script com arrays gigantes de strings base64:
- `var pza = ["V0ZUNTkxNzg1MzBmWGs=", "SFVHNTkxNzg1ODB4Ums=", ...]` — centenas de entradas base64
- `var trf = "";` — variável vazia que é preenchida pela decodificação
- Como strings base64 mudam a cada request (diferentes tamanhos observados)

**Mecanismo:** O JavaScript decodifica as strings base64 em runtime para montar o HTML do player e a URL do stream M3U8. Isso impede scraping simples.

### Embed Code Exposto
```html
<iframe src="https://embedflix.autos/tv/player.php?id=combate" allow="encrypted-media" allowfullscreen frameborder="0" width="100%" height="400"></iframe>
```

### Outros Domínios Embedflix
- `embedflix.mom` — usava /tv/player.php?id=band-sports
- `embedflix.gold` — usava /tv/player.php?id=combate
- `embedflix.lat` — usava /tv/player.php?id=premiere-2
- `embedflix.cv` — usava /tv/player.php?id=premiere-5
- `embedflix.autos` — NOVO domínio, mesmo sistema

---

## 3. v1.rdse.lat — Backend Unificado

**URL:** https://v1.rdse.lat/{slug}
**Servidor:** Cloudflare
**Proteção:** JWT duplo (pt + pc tokens)
**Status:** ✅ ACESSÍVEL (retorna página "Combate" sem tokens)

### Mecanismo
- v1.rdse.lat/{slug} retorna HTML com info do canal (não o vídeo em si)
- O vídeo real está em `/__play/{slug}?pt=<JWT>&pc=<JWT>`
- Requer 2 tokens JWT HMAC-SHA256 gerados dinamicamente:
  - `pt` token: `{"jti":"...","exp":...,"dom":"v1.rdse.lat","slg":"{slug}","pth":"/{slug}","rnd":"..."}`
  - `pc` token: `{"tok":"...","slg":"{slug}","dom":"v1.rdse.lat","exp":...}`

---

## 4. Análise de Vulnerabilidades

### 🔴 Crítica — API do rei dos embeds totalmente exposta
- **Alvo:** reidosembeds.online/api/channels
- **Severidade:** Média (exposição de dados)
- **Detalhe:** API REST pública SEM autenticação expõe 305+ canais com embed_urls diretos
- **Impacto:** Qualquer um pode scrapear a lista completa de canais e URLs de embed
- **Evidência:** Endpoints funcionam sem qualquer token/cookie

### 🟡 Média — Embed URLs expostos no HTML
- **Alvo:** embedflix.autos/tv/
- **Detalhe:** Todos os embed codes (iframes) estão no HTML público
- **Cada canal tem iframe embutido:** `<iframe src="https://embedflix.autos/tv/player.php?id=X"...>`
- **Isso permite:** Scrapear todos os IDs de canal e embed URLs

### 🟡 Média — Ofuscação JS base64 quebra fácil
- **Alvo:** embedflix.autos/tv/player.php
- **Detalhe:** A "proteção" é apenas base64 encode de strings JS
- **Ataque:** Executar `atob()` em cada string do array `pza`/`gvy` para revelar o conteúdo real
- **Proposta:** Fazer decode em Node.js ou browser para extrair URLs M3U8

### 🟡 Média — JWT duplo no v1.rdse.lat
- **Alvo:** v1.rdse.lat/__play/{slug}
- **Detalhe:** Requer 2 tokens JWT, mas estes são gerados pela camada 2 (rdse.site/rde.lat)
- **Tokens expiram rápido, mas são reutilizáveis até expiração**
- **Vetor:** Capturar tokens frescos e reusar em outros slugs

### 🔴 Alta — IDOR em IDs de canais
- **Alvo:** embedflix.autos/tv/player.php?id={channel}
- **Testar IDs sequenciais:** id=1, id=2, id=3... ou tentar combinações de nomes
- **embedflix retorna conteúdo mesmo com IDs inválidos?** (testar)

### 🔴 Alta — LFI/SQLi
- **Alvo:** embedflix.autos/tv/player.php?id=../../../etc/passwd
- **Alvo:** embedflix.autos/tv/player.php?id=' OR 1=1 --
- **Status:** Pendente de teste

---

## 5. URLs de Stream (Camada 3 — v1.rdse.lat JWT protegido)

| Canal | Player URL | Tipo |
|-------|-----------|------|
| Globo SP | `https://embedflix.autos/tv/player.php?id=globo-sp` | embedflix obfuscated |
| SBT | `https://embedflix.autos/tv/player.php?id=sbt` | embedflix obfuscated |
| Band Sports | `https://embedflix.autos/tv/player.php?id=band-sports` | embedflix obfuscated |
| Combate | `https://embedflix.autos/tv/player.php?id=combate` | embedflix obfuscated |
| ESPN | `https://embedflix.autos/tv/player.php?id=espn` | embedflix obfuscated |
| Premiere 2 | `https://embedflix.autos/tv/player.php?id=premiere-2` | embedflix obfuscated |
| A&E | `https://v1.rdse.lat/ae` | rdse JWT backend |
| Combate | `https://v1.rdse.lat/combate` | rdse JWT backend |
| Globo SP | `https://v1.rdse.lat/globosp` | rdse JWT backend |
| Band Sports | `https://v1.rdse.lat/bandsports` | rdse JWT backend |
| Sportv | `https://v1.rdse.lat/sportv` | rdse JWT backend |

---

## 6. Próximos Passos Recomendados

### Imediatos (🔴 Alta Prioridade)

1. **Decodificar embedflix base64** — Usar Node.js para executar `atob()` em cada entrada dos arrays `pza`/`gvy` e extrair M3U8 URLs
2. **Testar LFI/SQLi em embedflix** — player.php?id=../../../etc/passwd e injeções SQL
3. **Testar IDOR em IDs** — Tentar IDs sequenciais e nomes de canais admin
4. **Capturar JWT fresco do v1.rdse.lat** — Usar proxy (mitmproxy) para interceptar tokens ao carregar um canal via v3.rdse.site

### Médio Prazo (🟡)

5. **Testar reuso de tokens JWT** — Pegar tokens de um slug e usar em outro
6. **API channels scrape** — Baixar lista completa de 305 canais via `/api/channels`
7. **embedflix.autos/tv/player.php?id= sem parâmetros** — Testar o que retorna
8. **Subdomínios embedflix** — Procurar admin.embedflix.autos, api.embedflix.autos

### Longo Prazo (🟢)

9. **Decodificar o JS runtime do embedflix** — Pode conter endpoints de API para gerar tokens M3U8
10. **Análise de tráfego** — Se possível, carregar um player no browser e monitorar requests WebSocket/XHR

---

## 7. Cronologia

| Data/Hora | Evento |
|-----------|--------|
| 2026-08-26 | Início análise streaming embeds |
| 2026-08-26 | reidosembeds.online: Home + API docs + sitemap descobertos |
| 2026-08-26 | embedflix.autos: Landing page + /tv/ + player.php descobertos |
| 2026-08-26 | embedflix.autos: Ofuscação JS base64 identificada |
| 2026-08-26 | reidosembeds.online: API REST pública documentada em /doc |
| 2026-08-26 | v1.rdse.lat confirmado como backend JWT duplo |
| 2026-08-26 | STREAMING_FULL.md consolidado |