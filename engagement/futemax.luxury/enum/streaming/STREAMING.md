# Streaming Analysis — futemax.luxury

**Data:** 2026-08-26
**Status:** CONCLUÍDO

---

## Arquitetura de Streaming (4 Camadas)

```
USUÁRIO
  │
  ├─ [1] futemax.luxury (WordPress + Cloudflare + Joken JWT)
  │    ├─ Página com channel list e .stream-option buttons
  │    ├─ data-url aponta para Layer 2
  │    └─ onclick → loadPlayer(url) → cria iframe com src=data-url
  │
  ├─ [2] Player Pages (Múltiplos Provedores)
  │    ├─ v3.rdse.site/{slug}          → iframe → v1.rdse.lat (JWT)
  │    ├─ v3.rde.lat/{slug}            → iframe → v1.rdse.lat (JWT)
  │    ├─ embedflix.{mom,gold,lat,cv}  → player.php obfuscated
  │    └─ hlsplus.pro                  → FingerprintJS + redirect
  │
  ├─ [3] v1.rdse.lat (Backend Unificado)
  │    └─ /__play/{slug}?pt=<JWT>&pc=<JWT>  → HTML com video iframe
  │
  └─ [4] CDN de Video (OCULTO)
       └─ M3U8/MP4 protegidos atrás de JWT — nunca expostos no frontend
```

## Como os Canais São Servidos

**Mecanismo:** IFRAME aninhado (não player JS, não M3U8 direto)

1. Usuário clica em "Assistir" → JS chama `loadPlayer(data-url)`
2. `loadPlayer()` cria um `<iframe id="channel-iframe">` com `src=data-url`
3. O iframe carrega uma página do player (ex: v3.rdse.site, embedflix.mom)
4. Essa página, por sua vez, carrega outro iframe apontando para `v1.rdse.lat`
5. `v1.rdse.lat` valida 2 tokens JWT (`pt` e `pc`) e serve o conteúdo de video
6. O video real (M3U8/HLS) NUNCA é exposto ao frontend

## URLs de Stream

Lista completa em `stream_urls.txt`

**Provedores de player:**
- `*.rdse.site` e `*.rde.lat` — Sistema "Rei dos Embeds" (JWT duplo)
- `embedflix.*` (mom, gold, lat, cv) — Sistema de player ofuscado com base64
- `hlsplus.pro` — Sistema com FingerprintJS
- `rdcanais.com` — ❌ DOMÍNIO APREENDIDO (Operation Offsides)

**Backend central:** `v1.rdse.lat` — Todos os canais convergem para este domínio com JWT

## Domínios CDN/Streaming

Lista completa em `domains_streaming.txt`

- Todos os domínios de streaming estão atrás de Cloudflare
- Nenhum IP real dos servidores de video foi descoberto
- A infraestrutura parece compartilhada com "Rei dos Embeds" (reidosembeds.online)

## Proteções

Detalhes em `protecoes.txt`

**Encontradas:**
- Cloudflare WAF em todos os domínios de streaming
- JWT duplo (pt + pc tokens) em v1.rdse.lat → HMAC-SHA256
- Ofuscação JS pesada no embedflix.* (base64 strings)
- FingerprintJS no hlsplus.pro
- Rate limiting agressivo no origin (212.92.104.6)

**NÃO encontradas:**
- M3U8 exposto em nenhuma camada
- Geoblock (todos os endpoints respondem globalmente)
- Hotlink/Referer check nos endpoints de player

## JWT Joken vs Stream Auth

**JWT Joken (Layer 1 - futemax.luxury):**
- Protege o site WordPress no origin 212.92.104.6
- Necessário para CARREGAR A PÁGINA com os botões dos canais
- **Não é necessário para os streams em si**
- Os data-urls nos canais estão no HTML da página

**JWT duplo (Layer 3 - v1.rdse.lat):**
- Protege o IFrame de video individual
- Gerado dinamicamente pela Layer 2 (player pages)
- Expira em minutos — mas novos tokens são gerados a cada refresh

## Resumo de Vulnerabilidades

### INFO — Data URLs Expostos no HTML
- Severidade: Info
- Os URLs de streaming estão visíveis no HTML (`data-url` attributes)
- Qualquer um pode copiar o data-url e abrir diretamente
- ❌ Mas isso só leva ao Layer 2, que está por trás de Cloudflare

### INFO — Domínios rdcanais.com Appreendido (Operation Offsides)
- Severidade: Info
- O domínio rdcanais.com (usado para sbt, tnt, ufc fight pass) foi apreendido
- Links quebrados nos canais sbt, tnt, ufc-fight-pass-hd

### MÉDIA — JWT duplo exposto no iframe parental
- Severidade: Média
- Os JWT tokens pt e pc estão expostos no HTML da Layer 2
- Tokens expiram, mas podem ser extraídos e reutilizados até expiração
- Possível: Se alguma Layer 2 não validar referer, tokens podem ser reusados

### BAIXA — Dependência de múltiplos provedores
- Severidade: Baixa
- futemax.luxury depende de 4+ provedores de player terceiros
- rdcanais.com já foi apreendido — outros podem cair também

## Próximos Passos Recomendados

1. 🔴 **Quebrar JWT duplo do v1.rdse.lat** — Capturar um par pt/pc fresco e tentar:
   - None algorithm attack
   - Hashcat com wordlist focada (secret pode estar relacionado ao sistema)
   - Reuse de tokens entre slugs (trocar "globosp" por "sportv")
2. 🔴 **Analisar ofuscação do embedflix** — Extrair M3U8 das strings base64
3. 🟡 **DNS/histórico de v1.rdse.lat** — Tentar encontrar IP real
4. 🟡 **Testar IDOR nos slugs** — globosp → globosp_admin, /__play/ → /__play/admin
5. 🟢 **Monitorar rdcanais.com** — Pode voltar ou revelar infra

---

## Cronologia
- 2026-08-26 05:46 UTC — Início análise streaming
- 2026-08-26 05:48 UTC — data-url descoberto: https://v3.rdse.site/globosp
- 2026-08-26 05:50 UTC — JWT duplo descoberto em v1.rdse.lat
- 2026-08-26 05:52 UTC — 22 canais mapeados com URLs completas
- 2026-08-26 05:55 UTC — rdcanais.com identificado como SEIZED
- 2026-08-26 06:00 UTC — Análise completa, STREAMING.md consolidado