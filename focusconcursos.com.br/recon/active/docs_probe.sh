#!/bin/bash
# docs_probe.sh — probe Swagger/OpenAPI/GraphQL em todos os hosts web via socks5h (UA rotativo)
UAS=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.126 Safari/537.36" \
"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15" \
"Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0" \
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.144")
EPATHS=("docs" "openapi.json" "swagger" "swagger/index.html" "swagger.json" "api-docs" "api/documentation" "api/docs" "graphql" "api/graphql" ".well-known/openapi.json" "api/openapi.json" "v1/docs" "v3/api-docs")
OUT=docs_api_probe.txt
echo "# docs_probe $(date -u +%FT%TZ) via Tor socks5h UA-rotativo start" > $OUT
while read -r h; do
  [ -z "$h" ] && continue
  ua=${UAS[$((RANDOM % 4))]}
  for ep in "${EPATHS[@]}"; do
    for scheme in "https"; do
      r=$(timeout 20 curl -sk -x socks5h://127.0.0.1:9050 -A "$ua" -m 18 -o /tmp/oner -w '%{http_code}' "$scheme://$h/$ep" 2>/dev/null)
      sz=$(stat -c%s /tmp/oner 2>/dev/null || echo 0)
      if [ "$r" != "404" ] && [ "$r" != "000" ] && [ "$sz" != "0" ]; then
        sniff=$(head -c 220 /tmp/oner | tr '\n' ' ' | tr -s ' ' | cut -c1-200)
        echo "$h | /$ep | $r | len=$sz | $sniff" >> $OUT
        grep -qiE 'openapi|swagger|paths|graphql|docTitle|api-log|documentation' /tmp/oner && echo "  >>> MATCH-API-SIG on $h/$ep (size $sz)" >> $OUT
      elif [ "$r" == "000" ]; then
        echo "$h | /$ep | TIMEOUT/ERR" >> $OUT
      fi
      sleep 0.5
    done
  done
  echo "== done $h $(date -u +%FT%TZ)" >> probe_progress.log
done < hosts_33.txt
echo "# docs_probe done $(date -u +%FT%TZ)" >> $OUT
