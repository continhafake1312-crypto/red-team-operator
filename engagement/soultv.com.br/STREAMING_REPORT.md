# 📡 RELATÓRIO DE STREAMING — soultv.com.br

> Provedores (Wowza) + Canais (CMS) + Playlists (HLS)
> Data: 2026-08-27

---

## 1. INFRAESTRUTURA DE STREAMING

### Servidor de Origem — video02 (160.202.130.243)
```
Wowza Streaming Engine 4.8.0 (LICENÇA CRACKEADA — zedays.co)
AlmaLinux 9.7, kernel 5.14.0-611.36.1
Portas: 1935 (RTMP), 554 (RTSP), 80 (HTTP HLS)
REST API: 8087 (Digest, admin:9iXBLX0cw5HXYoX)
Manager: 8088 (Spring Security, mesma cred)
JMX RMI: 8084/8085 (admin:admin, read-only)
```

### CDNs de Distribuição
| CDN | Domínio | Função |
|-----|---------|--------|
| **smartplay.pe** | cdn-tiva-*.smartplay.pe | Cache HLS principal |
| **samcast.com.br** | stmv*.samcast.com.br | Cache HLS secundário |
| **logicahost.com.br** | video*.logicahost.com.br / srt.logicahost.com.br | Origem + cache |
| **streamingdevideo.com.br** | br*.streamingdevideo.com.br | Cache HLS |
| **brascast.com** | video01.brascast.com | Cache HLS |
| **uniquetv.com.br** | pop.uniquetv.com.br | Cache HLS |
| **transmissaodigital.com** | stmv*.transmissaodigital.com | Cache HLS |
| **jmvstream.com** | cdn.jmvstream.com / cdn.live.br1.jmvstream.com | Cache HLS |
| **nuvemplay.live** | *.nuvemplay.live | Cache HLS |
| **ecast.com.br** | stream.ecast.com.br / acesso.ecast.site | Cache HLS |
| **zas.media** | tv*.zas.media | Cache HLS |
| **streamlock.net** | *.streamlock.net | Cache RTMP/HLS |
| **Azure Blob** | stsoultvbrs.blob.core.windows.net | Imagens/logos |
| **Cloudflare** | cdn-front.smartplay.pe | Front CDN |

---

## 2. PROVEDORES (Wowza — 46 Operadores)

### Operadores de Telecomunicações (América Latina)

| Operador | Apps | Provável País | Tipo |
|----------|------|---------------|------|
| **cableoperadorantel** | 01, 02, 03 | 🇺🇾 Uruguai (Antel) | Telecom estatal |
| **cableoperadoratenea** | 01, 02, 03 | 🇪🇨 Equador | Cabo TV |
| **cableoperadorcolombia** | 01, 02, 03 | 🇨🇴 Colômbia | Cabo TV |
| **cableoperadorlinktv** | 01, 02, 03 | 🌎 América Latina | Link TV |
| **cableoperadormegatel** | 01, 02, 03 | 🇧🇷 Brasil (Megatel) | Telecom |
| **cableoperadornetwin** | 01, 02, 03 | 🌎 | Netwin |
| **cableoperadorpowervision** | 01, 02, 03 | 🌎 | Power Vision |
| **cableoperadortelevip** | 01, 02, 03 | 🌎 | Tele VIP |
| **cableoperadortvecuador** | 01, 02, 03 | 🇪🇨 Equador | TV Ecuador |
| **cableoperadortvnegrete** | 01, 02, 03 | 🇲🇽 México (Negrete) | TV |
| **cableoperadorwgcomunicaciones** | 01, 02, 03 | 🌎 | WG Comunicaciones |

### Operadores de Streaming / Conteúdo

| Operador | Apps | Provável | Tipo |
|----------|------|----------|------|
| **aretroplustv** | 01, 02, 03 | 🇧🇷 Brasil | A Retro Plus TV |
| **retroplustv** / retropluspre2 / retroplussenal2-3 | diverso | 🇧🇷 | Retro Plus (canais) |
| **roraimatv** | 1 | 🇧🇷 Roraima | TV Regional |
| **gh1** | 1 | 🌎 | GH1 |
| **midiaseven** | 1 | 🌎 | Media Seven |
| **radionn** | 1 | 🌎 | Rádio NN (só HLS) |
| **tvparaguay.com** | 1 | 🇵🇾 Paraguai | TV |
| **tvturismo** | 1 | 🌎 | TV Turismo |
| **demo** | 1 | — | Testes |
| **live** | 1 | — | App live padrão Wowza |
| **vod** | 1 | — | Video on demand |

### Config Padrão de Cada Operador
- **StreamType:** live
- **Storage:** `/home/streaming/{operador}/`
- **Packetizers:** Apple HLS (cupertino), MPEG-DASH, Adobe HDS (sanjose), MS Smooth Streaming
- **Auth:** publish.password = `tvstation` (compartilhado entre todos!)
- **StreamTarget:** habilitado (envia para CDNs smartplay/samcast)

---

## 3. CANAIS (CMS — 129+ canais)

### Distribuição por Número de Canal

| Faixa | Qtd | Exemplos |
|-------|-----|----------|
| 01-50 | ~15 | TV Meio (150), ISTV (16), TV MAX (25) |
| 51-100 | ~20 | Play TV (161), TV Judaica (121) |
| 101-200 | ~35 | TV Marataizes (300), RIT TV (400) |
| 201-300 | ~20 | TV 24 HORAS (420), TV DA QUEBRADA (423) |
| 301-500 | ~10 | SBC (500), TV PAMPA (504) |
| 501-900 | ~5 | Masper TV (575), Viva e Eduque (897) |

### Amostra de Canais Ativos

| # | Canal | URL HLS | Status |
|---|-------|---------|--------|
| 423 | TV DA QUEBRADA | `https://stmv2.samcast.com.br/davi2252/davi2252/playlist.m3u8` | ✅ LIVE |
| 420 | TV 24 HORAS | `https://stmv8.samcast.com.br/newswire7636/newswire7636/playlist.m3u8` | ✅ LIVE |
| 421 | TV METROPOLES | `https://stmv8.samcast.com.br/newswire4876/newswire4876/playlist.m3u8` | ✅ LIVE |
| 422 | TV Protagonistas | `https://Stmv1.samcast.com.br/tvprotagonistasdo2603/...m3u8` | ✅ LIVE |
| 209 | Bitt TV | `https://srt.logicahost.com.br/memfs/f3d27992-.../playlist.m3u8` | ✅ LIVE |
| 300 | TV Marataizes | `https://cdn-origin.smartplay.pe/tv-marataizes/index.m3u8` | ✅ LIVE |
| 121 | TV Judaica | `https://br5093.streamingdevideo.com.br/tvjudaica/...m3u8` | ✅ LIVE |
| 150 | TV Meio | `https://cdn-tiva-maystreaming-.../redemeio/...m3u8` | ❌ Not found |

### Formato das Playlists (HLS)

```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:2483
#EXT-X-TARGETDURATION:9
#EXTINF:7.973, no desc
davi2252-2483.ts
#EXTINF:8.003, no desc
davi2252-2484.ts
...
```
- **Tipo:** Live HLS (TS segments)
- **Target Duration:** 9s
- **Codec:** H.264 video + AAC audio (provável)
- **Resolução:** SD (provavelmente 480p/720p)
- **Segmentos:** .TS (MPEG-TS), ~8s cada

---

## 4. VULNERABILIDADES DESCOBERTAS

### 🔴 Paywall Bypass Total (F-018)
TODOS os 129+ canais são acessíveis SEM token de autenticação. A CDN (smartplay.pe, etc.) NÃO valida `content_token`. Qualquer pessoa com a URL HLS pode assistir qualquer canal ao vivo.

**Impacto:** Perda total de receita de assinaturas (assinantes vs não-assinantes não distinguíveis).

### 🔴 publish.password Compartilhado (F-030)
Todos os 46 operadores usam a mesma senha de publicação: `tvstation`. Isso significa que qualquer operador pode transmitir no lugar de outro (source spoofing).

**Impacto:** Injection de conteúdo malicioso em qualquer operador.

### 🔴 Licença Crackeada (F-030)
Wowza 4.8.0 rodando com licença crackeada (zedays.co). `/etc/hosts` redireciona wowzalicense*.wowzamedia.com para 127.0.0.1.

**Impacto:** Violação de direitos autorais (Art. 184 CP). Risco de supply chain (crack pode conter backdoor).

### 🔴 Sem Auth CDN
As CDNs (smartplay.pe, samcast, logicahost) não exigem qualquer validação de origem. URLs HLS uma vez descobertas são acessíveis globalmente.

---

## 5. DADOS EXTRAÍDOS

| Item | Quantidade | Fonte |
|------|------------|-------|
| Operadores Wowza | 46 | REST API /v2/servers/applications |
| Canais de TV | 129+ | CMS /v1/brand |
| URLs HLS | 129 | CMS /v1/brand | | URLs HLS | 129+ | CMS /v1/brand */
| CDNs diferentes | 12+ | Extraído das URLs |
| Categorias | 19 | CMS /v1/categories |
| Credenciais comprometidas | 4 (admin, jmx, publish, shadow) | JMX file-read |

---

*Relatório gerado em 2026-08-27* | *Engagement soultv.com.br*
