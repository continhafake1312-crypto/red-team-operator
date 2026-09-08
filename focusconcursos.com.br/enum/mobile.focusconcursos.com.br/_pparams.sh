#!/usr/bin/env bash
# mobile.focusconcursos.com.br — /docs + /register param mining (enum phase)
# All traffic via Tor socks5h; UA rotated; evidence saved into enum/engdir
E=/home/ubuntu/red-team-operator/focusconcursos.com.br/enum
D=$E/mobile.focusconcursos.com.br
P="socks5h://127.0.0.1:9050"
UA="Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0"
H="mobile.focusconcursos.com.br"
OUT="$D/params_probe.txt"
: > "$OUT"
req(){ # method url data outfile
  m=$1; u=$2; d=$3; f=$4
  L=$(curl -sk --proxy "$P" -m 15 -A "$UA" -X "$m" -H 'Content-Type: application/json' -H 'Accept: application/json' ${d:+--data-raw "$d"} -o "$f" -w '%{http_code}|%{size_download}' "$u" 2>/dev/null)
  B=$(head -c 200 "$f" | tr '\n' ' ')
  echo "$m $u data=${d:-none} -> $L | $B" >> "$OUT"
  sleep 0.3
}
req POST "https://$H/register" '{}' "$D/p_register.json"
req POST "https://$H/register" '{"email":"teste@teste.com","password":"x"}' "$D/p_register2.json"
req POST "https://$H/docs" '{"page":1}' "$D/p_docs_page.json"
req POST "https://$H/docs" '{"search":"admin"}' "$D/p_docs_search.json"
req POST "https://$H/docs" '{"preview":true}' "$D/p_docs_preview.json"
req POST "https://$H/logout" '{}' "$D/p_logout.json"
q(){ # url outfile
  L=$(curl -sk --proxy "$P" -m 15 -A "$UA" -o "$2" -w '%{http_code}|%{size_download}' "$1" 2>/dev/null)
  echo "GET $1 -> $L | $(head -c 150 "$2" | tr '\n' ' ')" >> "$OUT"
  sleep 0.25
}
q "https://$H/docs?page=2" "$D/q_docs_page.out"
q "https://$H/docs?search=admin" "$D/q_docs_search.out"
q "https://$H/docs?version=1" "$D/q_docs_version.out"
q "https://$H/docs?format=json" "$D/q_docs_format.out"
q "https://$H/docs?pretty=1" "$D/q_docs_pretty.out"
curl -sk --proxy "$P" -m 15 -A "$UA" -X OPTIONS -D "$D/optiones.txt" -o /dev/null "https://$H/docs" -w 'OPTIONS %{http_code}\n' > /dev/null 2>&1
grep -i -E '^allow|^access-control' "$D/optiones.txt" | sed 's/^/OPTIONS \/docs: /' >> "$OUT"
echo "--- params_probe done ---"
cat "$OUT"
