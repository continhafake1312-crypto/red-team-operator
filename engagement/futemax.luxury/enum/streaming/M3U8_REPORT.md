# Relatório de Streaming — futemax.luxury

**Data:** 2026-08-26
**Canais scapeados:** 305 (via reidosembeds.online API)
**M3U8 extraídos:** 9 canais principais (30 sources)

---

## 1. Arquitetura de Streaming

```
futemax.luxury/?channel=globosp
  → reidosembeds.online (API pública REST, 305 canais)
    → v1.rdse.lat/{slug} (player page com anti-bot)
      → v1.rdse.lat/__play/{slug}?pt=<JWT>&pc=<JWT> (play endpoint)
        → drpneumoultramicocobambu.lat/docs/{hash}/__index.txt?token=<JWT2> (CDN auth)
          → cdn####.up-cdn.com.br/docs/{hash}/{chunk}.{js,ico,csv,etc} (CDN chunks)
```

### Camadas de Proteção
| Camada | Proteção | Status |
|--------|----------|--------|
| futemax.luxury | Cloudflare + Joken JWT HS256 | ✅ Bypassado via player page |
| reidosembeds.online | Cloudflare (sem challenge) | 🟢 Acesso total público |
| v1.rdse.lat | Cloudflare + JWT duplo pt/pc | 🟢 Acessível com JWT fresco |
| drpneumoultramicocobambu.lat | JWT token no __index.txt | 🟢 Acessível com token |
| up-cdn.com.br | Cloudflare | 🟢 Acessível com token |

---

## 2. API reidosembeds.online

**URL:** `https://reidosembeds.online/api/channels`
**Método:** GET (público, sem auth)
**Resposta:** JSON com 305 canais

### Endpoints descobertos
| Endpoint | Descrição |
|----------|-----------|
| `/api/channels` | Lista completa (305 canais) |
| `/api/channels/{slug}` | Detalhes do canal individual |
| `/api/eventos` | Eventos ao vivo (UFC, jogos) |
| `/api/pesquisa?q=termo` | Busca por nome |
| `/doc` | Documentação da API |
| `/sitemap.xml` | Sitemap com todos os canais |

### Campos do JSON
- `id` — slug do canal (ex: `globosp`)
- `name` — nome (ex: `Globo SP`)
- `embed_url` — `https://v1.rdse.lat/{slug}`
- `preview_url` — preview thumbnail (CDN, referrer-restrita)
- `category` — categoria (Esportes, Séries, etc.)
- `is_active` — booleano
- `now_playing_title` — programa atual
- `now_playing_progress` — progresso em %
- `now_playing_next_programmes` — programação seguinte

---

## 3. M3U8 Extraídos

### Globo SP (globosp) — 5 sources
| Label | M3U8 URL |
|-------|----------|
| Globo SP | `https://dufuceruto.drpneumoultramicocobambu.lat/docs/pinhal15/__index.txt?token=...` |
| Globo SP (alt) | `https://melotese.drpneumoultramicocobambu.lat/docs/dourado71/__index.txt?token=...` |
| Globo DF | `https://pasebapive.drpneumoultramicocobambu.lat/docs/riacho14/__index.txt?token=...` |
| Globo MG | `https://vosugogafa.drpneumoultramicocobambu.lat/docs/lacuna35/__index.txt?token=...` |
| Globo RJ | `https://vunucucomo.drpneumoultramicocobambu.lat/docs/bruma88/__index.txt?token=...` |

### SporTV (sportv) — 4 sources
| Label | M3U8 URL |
|-------|----------|
| SporTV | `https://bodilozaca.drpneumoultramicocobambu.lat/docs/palermo32/__index.txt?token=...` |
| SporTV 2 | `https://pemupomo.drpneumoultramicocobambu.lat/docs/valente39/__index.txt?token=...` |
| SporTV 3 | `https://bisazudati.drpneumoultramicocobambu.lat/docs/granito55/__index.txt?token=...` |
| SporTV 4 | `https://sipobapo.drpneumoultramicocobambu.lat/docs/orvalho66/__index.txt?token=...` |

### ESPN (espn) — 6 sources
| Label | M3U8 URL |
|-------|----------|
| ESPN | `https://ticeticazu.drpneumoultramicocobambu.lat/docs/tridente49/__index.txt?token=...` |
| ESPN 2 | `https://pinosafane.drpneumoultramicocobambu.lat/docs/nobreza80/__index.txt?token=...` |
| ESPN 3 | `https://nadetomo.drpneumoultramicocobambu.lat/docs/cacto96/__index.txt?token=...` |
| ESPN 4 | `https://tagigobe.drpneumoultramicocobambu.lat/docs/navio49/__index.txt?token=...` |
| espn5 | `https://comivamitu.drpneumoultramicocobambu.lat/docs/cedro15/__index.txt?token=...` |
| ESPN 6 | `https://gezorurupu.drpneumoultramicocobambu.lat/docs/domino29/__index.txt?token=...` |

### Combate (combate) — 2 sources
| Label | M3U8 URL |
|-------|----------|
| Combate | `https://gobutecimu.drpneumoultramicocobambu.lat/docs/ambar90/__index.txt?token=...` |
| UFC Fight Pass | `https://macebocure.drpneumoultramicocobambu.lat/docs/quartzo12/__index.txt?token=...` |

### Premiere (premiere-2) — 8 sources
| Label | M3U8 URL |
|-------|----------|
| Premiere 1 | `https://caniteledi.drpneumoultramicocobambu.lat/docs/sincero92/__index.txt?token=...` |
| Premiere 2 | `https://zozutano.drpneumoultramicocobambu.lat/docs/zimbro70/__index.txt?token=...` |
| Premiere 3 | `https://zocifobide.drpneumoultramicocobambu.lat/docs/guarita44/__index.txt?token=...` |
| Premiere 4 | `https://cigeluci.drpneumoultramicocobambu.lat/docs/esmeril25/__index.txt?token=...` |
| Premiere 5 | `https://puletivemu.drpneumoultramicocobambu.lat/docs/sereno83/__index.txt?token=...` |
| Premiere 6 | `https://nasirice.drpneumoultramicocobambu.lat/docs/veludo87/__index.txt?token=...` |
| Premiere 7 | `https://lezefosa.drpneumoultramicocobambu.lat/docs/botanico33/__index.txt?token=...` |
| Premiere 8 | `https://cucerobi.drpneumoultramicocobambu.lat/docs/tridente48/__index.txt?token=...` |

### TNT (tnt) — 1 source
| Label | M3U8 URL |
|-------|----------|
| TNT | `https://notirifuda.drpneumoultramicocobambu.lat/docs/estelar42/__index.txt?token=...` |

### Band Sports (bandsports) — 1 source
| Label | M3U8 URL |
|-------|----------|
| Band Sports | `https://cisugevo.drpneumoultramicocobambu.lat/docs/kiwi53/__index.txt?token=...` |

### Multishow (multishow) — 1 source
| Label | M3U8 URL |
|-------|----------|
| Multishow | `https://mivumicitu.drpneumoultramicocobambu.lat/docs/cacto50/__index.txt?token=...` |

### SBT (sbt) — 2 sources
| Label | M3U8 URL |
|-------|----------|
| SBT | `https://zoginiguru.drpneumoultramicocobambu.lat/docs/turquesa67/__index.txt?token=...` |
| **SBT PI** | **`https://6836041ea1117.streamlock.net/cverde/cverde/playlist.m3u8`** 🔓 |

---

## 4. Análise de Tokens

### JWT duplo (pt + pc) — v1.rdse.lat/__play/{slug}
- **Algoritmo:** HS256
- **Claims pt:** `jti`, `exp`, `dom` (v1.rdse.lat), `slg` (slug), `pth`, `rnd`
- **Claims pc:** `tok` (hash), `slg`, `dom`, `exp`
- **Expiração:** ~9 minutos
- **Proteção anti-replay:** Validado por IP/User-Agent/Referer/Cookie

### Token CDN — drpneumoultramicocobambu.lat/docs/{hash}/__index.txt
- **Token no query:** `?token=eyJ2IjoyLCJzdCI6MSwicyI6InBpbmhhbDE1IiwicCI6...
- **Claims:** `v` (2), `st` (1), `s` (hash), `p` (v1.rdse.lat), `path` (/pinhal15/index.txt), `e` (exp), `j` (jti), `iat`, `rs` (slug)
- **Expiração:** Parece curta (minutos)
- **Acessível via rede:** Sim, sem restrição de IP/Referer aparente

---

## 5. Infraestrutura up-cdn.com.br

**Domínio:** `cdn{####}.up-cdn.com.br` (cdn1665, cdn4138, cdn2236, cdn6071, cdn8009)
**Servidor:** Cloudflare atrás
**Função:** CDN de chunks HLS (segmentos MPEG-TS)
**Ofuscação:** Extensões de arquivo disfarçadas (.js, .ico, .csv, .docx, .otf, .woff2, .eot, .ejs, .jar, .pict, .bin, .css, .xls, .doc, .ttf, .class, .xlsx)
**Conteúdo real:** Segmentos MPEG-TS/HLS com conteúdo de vídeo

### Exemplo de chunk:
```
https://cdn4138.up-cdn.com.br/docs/pinhal15/EhL6u2-Mtr.xlsx
```
> Extensão `.xlsx` mas conteúdo é MPEG-TS

### Hotlink:
Chunks parecem exigir token da playlist. Sem token → provavelmente 403/Cloudflare.

---

## 6. Descoberta Especial: Streamlock Direto

**SBT PI** (`sbt` canal) usa URL de stream direta sem proteção:
```
https://6836041ea1117.streamlock.net/cverde/cverde/playlist.m3u8
```
- **Servidor:** Wowza Streaming Engine (streamlock.net)
- **Porta:** 443 (HTTPS)
- **Proteção:** NENHUMA aparente — M3U8 acessível sem token
- **ISSO É UMA VULNERABILIDADE**: Stream sem auth exposto publicamente

---

## 7. Análise de Vulnerabilidades

| ID | Severidade | Descrição |
|----|-----------|-----------|
| **F-050** | 🔴 **Alta** | **API reidosembeds totalmente pública** — 305 canais com embed_urls expostos sem auth |
| **F-051** | 🔴 **Alta** | **CDN ofuscada mas acessível** — up-cdn.com.br serve chunks com extensões disfarçadas |
| **F-052** | 🟡 **Média** | **Streamlock exposto** — SBT PI direto sem auth: `6836041ea1117.streamlock.net` |
| **F-053** | 🟡 **Média** | **Token JWT curto** (~9min) mas renovável automaticamente sem challenge |
| **F-054** | 🟡 **Média** | **305 canais scapeáveis** — scraping massivo possível via API pública |
| **F-055** | 🟢 **Info** | **Extensões ofuscadas** — .js/.ico/.csv na verdade são MPEG-TS |

---

## 8. Artefatos Gerados

| Arquivo | Descrição |
|---------|-----------|
| `all_channels.txt` | Lista completa dos 305 canais |
| `m3u8_samples/` | 30 playlists M3U8 baixadas |
| `player_globosp.html` | HTML do player Globo SP |
| `STREAMING.md` | Análise de streaming anterior |

---

## 9. Próximos Passos

1. **Scapear 305 canais completos** — script que extrai M3U8 de todos
2. **Token reuso** — testar se token de um canal funciona em outro slug
3. **Up-cdn.com.br hotlink** — testar se chunks são acessíveis sem token
4. **Streamlock.br** — investigar `6836041ea1117.streamlock.net` (Wowza exposto)
5. **IP de up-cdn.com.br** — resolver IP real (burlar Cloudflare via CNAME/histórico)
6. **Automatizar** — pipeline que gera M3U8 atualizado de qualquer slug sob demanda