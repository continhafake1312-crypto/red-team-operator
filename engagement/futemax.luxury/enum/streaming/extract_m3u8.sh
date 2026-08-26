#!/bin/bash
# Script para extrair M3U8 de canais via reidosembeds + v1.rdse.lat
# Uso: ./extract_m3u8.sh <slug>
# Ex: ./extract_m3u8.sh globosp

SLUG="$1"
if [ -z "$SLUG" ]; then
    echo "Uso: $0 <slug>"
    exit 1
fi

OUTDIR="/home/ubuntu/engagement/futemax.luxury/enum/streaming/m3u8_samples"
mkdir -p "$OUTDIR"

echo "=== [$SLUG] Passo 1: Player page v1.rdse.lat/$SLUG ==="
PLAYER_HTML=$(curl -s --max-time 15 \
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" \
    -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
    "https://v1.rdse.lat/$SLUG")

# Extrair URL do iframe com pt/pc
IFRAME_SRC=$(echo "$PLAYER_HTML" | grep -oP 'src="https://v1\.rdse\.lat/__play/[^"]*"' | head -1 | sed 's/src="//;s/"//')

if [ -z "$IFRAME_SRC" ]; then
    echo "ERRO: Não foi possível extrair iframe src"
    echo "$PLAYER_HTML" | head -5
    exit 1
fi

echo "Iframe URL encontrada"
PT=$(echo "$IFRAME_SRC" | grep -oP 'pt=[^&]+')
PC=$(echo "$IFRAME_SRC" | grep -oP 'pc=[^&]+')
echo "PT: ${PT:0:50}..."
echo "PC: ${PC:0:50}..."

echo ""
echo "=== [$SLUG] Passo 2: Play endpoint ==="
PLAY_HTML=$(curl -s --max-time 15 \
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" \
    -H "Referer: https://v1.rdse.lat/$SLUG" \
    "$IFRAME_SRC")

# Extrair array sources
SOURCES_JSON=$(echo "$PLAY_HTML" | grep -oP 'var sources = \[.*?\];' | head -1 | sed 's/var sources = //;s/;$//')

if [ -z "$SOURCES_JSON" ]; then
    echo "ERRO: Não foi possível extrair sources array"
    echo "$PLAY_HTML" | grep -o 'sources\|m3u8\|__index' | head -5
    exit 1
fi

echo "Sources encontrados!"
echo "$SOURCES_JSON" | python3 -c "
import json, sys
sources = json.loads(sys.stdin.read())
print(f'Número de sources: {len(sources)}')
for i, s in enumerate(sources):
    print(f'  Source {i}: {s.get(\"label\",\"?\")} | {s.get(\"src\",\"\")[:80]}...')
    print(f'           mpegts: {s.get(\"mpegtsFallbackSrc\",\"(none)\")}')
" 2>&1

echo ""
echo "=== [$SLUG] Passo 3: Baixando M3U8 ==="
echo "$SOURCES_JSON" | python3 -c "
import json, sys, subprocess, os
sources = json.loads(sys.stdin.read())
outdir = '$OUTDIR'
for i, s in enumerate(sources):
    src = s.get('src', '')
    label = s.get('label', f'source_{i}')
    if not src:
        continue
    # Extrair slug e token para nome do arquivo
    slug = '$SLUG'
    safe_label = label.replace(' ', '_').replace('/', '_')
    outfile = os.path.join(outdir, f'{slug}_{safe_label}.m3u8')
    print(f'Baixando {label} -> {outfile}')
    # Usar curl para baixar
    result = subprocess.run(
        ['curl', '-s', '--max-time', '15',
         '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
         '-H', 'Referer: https://v1.rdse.lat/',
         '-o', outfile,
         '-w', '%{http_code}',
         src],
        capture_output=True, text=True
    )
    http_code = result.stdout.strip()
    if http_code == '200':
        print(f'  OK ({http_code})')
        # Mostrar primeiras linhas
        with open(outfile) as f:
            content = f.read().strip()
            print(f'  Conteúdo ({len(content)} bytes):')
            for line in content.split(chr(10))[:6]:
                print(f'    {line}')
    else:
        print(f'  ERRO HTTP {http_code}')
" 2>&1