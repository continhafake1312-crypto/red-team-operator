#!/bin/bash
# docs_probe2.sh — refined API docs discovery: checks content-type + real swagger/openapi body markers
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
UAS=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.126 Safari/537.36" \
"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15" \
"Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0" \
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.144")
EPATHS=("docs" "openapi.json" "swagger.json" "swagger/index.html" "api-docs" "api/documentation.json" "api/documentation" "api/docs" "api/openapi.json" "v1/openapi.json" "v2/openapi.json" "graphql" "api/graphql" "swagger-ui/index.html" "swagger-ui" "docs/swagger.json" "docs/index.html" "api-api" "redoc" "swagger-ui.html" "swagger-resources")
OUT=docs_refined.txt
echo "# docs_refined $(date -u +%FT%TZ) — content-type-sniff, via Tor socks5h, UA-rotativo" > $OUT
while read -r h; do
  [ -z "$h" ] && continue
  for ep in "${EPATHS[@]}"; do
    ua=${UAS[$((RANDOM % 4))]}
    hdr=$(timeout 22 curl -sk -D - -x socks5h://127.0.0.1:9050 -A "$ua" -m 20 -o /tmp/dp2 -w '%{http_code}' "https://$h/$ep" 2>/dev/null)
    code=$(echo "$hdr" | tail -1)
    ct=$(echo "$hdr" | grep -i '^content-type:' | head -1 | tr -d '\r')
    server=$(echo "$hdr" | grep -i '^server:' | head -1 | tr -d '\r')
    if [ "$code" = "404" ] || [ "$code" = "000" ]; then
      continue
    fi
    sig="no-match"
    if head -c 4000 /tmp/dp2 2>/dev/null | grep -qiE '"openapi"|"swagger"|swagger-ui|api-description|definitions:|paths:|info.normalize'; then
      sig="API-SPEC-MATCH"
    fi
    if [ "$sig" = "API-SPEC-MATCH" ]; then
      echo "$h | /$ep | $code | $ct | $server | SPEC-${sig} | size=$(stat -c%s /tmp/dp2 2>/dev/null)" >> $OUT
    elif [ "$code" != "404" ]; then
      echo "$h | /$ep | $code | $ct | $server | size=$(stat -c%s /tmp/dp2 2>/dev/null)" >> $OUT
    fi
    sleep 0.4
  done
  echo "== done $h $(date -u +%FT%TZ)" >> probe_progress2.log
done < hosts_33.txt
echo "# docs_probe2 done $(date -u +%FT%TZ)" >> $OUT
