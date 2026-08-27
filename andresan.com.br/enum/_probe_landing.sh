#!/bin/bash
# Probe landing pages de todos os hosts prioritários via Tor
OUT=/home/ubuntu/andresan.com.br/enum/_landing
mkdir -p $OUT
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

probe() {
  local url=$1
  local name=$2
  echo "=== $url ==="
  curl -sS -m 30 --retry 1 --retry-delay 2 \
    -A "$UA" \
    -D "$OUT/${name}.headers" \
    -o "$OUT/${name}.body" \
    -w "HTTP:%{http_code} SIZE:%{size_download} TIME:%{time_total} URL:%{url_effective}\n" \
    -L --max-redirs 3 \
    "$url" 2>&1
}

probe "https://andresan.com.br/" apex
probe "https://www.andresan.com.br/" www
probe "https://painel.andresan.com.br/" painel_root
probe "https://painel.andresan.com.br/auth" painel_auth
probe "https://blog.andresan.com.br/" blog
probe "https://areadoaluno.andresan.com.br/" areadoaluno
probe "https://sala.andresan.com.br/" sala
probe "https://cdn.andresan.com.br/" cdn
probe "https://concursos.andresan.com.br/" concursos
echo "--- DONE ---"
