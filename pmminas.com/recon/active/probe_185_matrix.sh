#!/bin/bash
# Probe matrix 185.158.133.1 — portas cPanel/LS com Host headers (via proxychains4/Tor)
OUT=/home/ubuntu/pmminas.com/recon/active
IP=185.158.133.1
PORTS="80 443 2052 2053 2082 2083 2086 2087 2095 2096 8080 8443 8880 7080 8090"
HOSTS="cpanel.pmminas.com webmail.pmminas.com provaoral.pmminas.com simuladosoba.pmminas.com pmminas.com 185.158.133.1 localhost"
UAS=(
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
"Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0"
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0"
)
i=0
HDRS=$OUT/.hdrs.$$
BODY=$OUT/.body.$$
: > "$OUT/probe_185_matrix.txt"

probe() {
  local scheme=$1 port=$2 host=$3 tag=$4
  local url="$scheme://$IP:$port/"
  local ua="${UAS[$((i++ % ${#UAS[@]}))]}"
  local code size
  if [ "$scheme" = "https" ]; then
    code=$(proxychains4 curl -sk --max-time 12 -A "$ua" ${host:+-H "Host: $host"} -D "$HDRS" -o "$BODY" -w "%{http_code} %{size_download}" "$url" 2>/dev/null)
  else
    code=$(proxychains4 curl -s --max-time 12 -A "$ua" ${host:+-H "Host: $host"} -D "$HDRS" -o "$BODY" -w "%{http_code} %{size_download}" "$url" 2>/dev/null)
  fi
  local server title
  server=$(grep -i '^server:' "$HDRS" 2>/dev/null | head -1 | tr -d '\r' | awk '{print $2}')
  code=$(echo "$code" | awk '{print $1}')
  size=$(echo "$code" | awk '{print $2}')
  if [ -s "$BODY" ]; then
    title=$(grep -oiE '<title[^>]*>[^<]{0,200}' "$BODY" 2>/dev/null | head -1 | sed 's/<title[^>]*>//i')
  fi
  echo "$tag $scheme://$IP:$port Host:${host:-<none>} -> $code size=${size:-0} server=${server:-?} title=${title:-}" >> "$OUT/probe_185_matrix.txt"
  if [ "$code" = "200" ] && [ -n "$size" ] && [ "$size" -lt 51200 ] && [ -n "$host" ]; then
    cp "$BODY" "$OUT/probe_185_body_${port}_${host//./_}.html"
  fi
  rm -f "$HDRS" "$BODY"
  sleep 1.5
}

echo "=== FASE A: mapeamento porta x scheme (sem Host header) $(date -u) ===" >> "$OUT/probe_185_matrix.txt"
LIVE=""
for p in $PORTS; do
  for s in http https; do
    probe "$s" "$p" "" "faseA"
    # se respondeu (código != 000), marca p/ fase B
    last=$(tail -1 "$OUT/probe_185_matrix.txt")
    code=$(echo "$last" | sed -E 's/.* -> ([0-9]+) .*/\1/')
    if [ "$code" != "000" ] && [ -n "$code" ]; then
      LIVE="$LIVE $p:$s"
    fi
  done
done

echo "" >> "$OUT/probe_185_matrix.txt"
echo "=== FASE B: matrix Host headers nas portas vivas: $LIVE $(date -u) ===" >> "$OUT/probe_185_matrix.txt"
for combo in $LIVE; do
  p=${combo%%:*}; s=${combo##*:}
  for h in $HOSTS; do
    probe "$s" "$p" "$h" "faseB"
  done
done

echo "=== FIM $(date -u) ===" >> "$OUT/probe_185_matrix.txt"