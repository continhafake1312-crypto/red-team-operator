#!/bin/bash
ip="$1"
# try Host www.dfg.com.br
for hdr in "www.dfg.com.br" "api.dfg.com.br" ""; do
  if [ -n "$hdr" ]; then
    out=$(timeout 7 proxychains4 -q curl -ks --resolve $hdr:443:$ip "https://$hdr/" -o /tmp/s3_$ip.html -w "%{http_code}|%{size_download}" 2>/dev/null)
  else
    out=$(timeout 7 proxychains4 -q curl -ks "https://$ip/" -o /tmp/s3_$ip.html -w "%{http_code}|%{size_download}" 2>/dev/null)
  fi
  if [ -f /tmp/s3_$ip.html ]; then
    if head -c 8000 /tmp/s3_$ip.html 2>/dev/null | grep -qiE "dfg|DFGames|dfgames|criptomoeda|marketplace dfg|vender-bitcoin|comprar-bitcoin|tibia coins|albion online|dfg\.com\.br"; then
      echo ">>> DFG at $ip (Host:$hdr) : $out"
      head -c 300 /tmp/s3_$ip.html | tr -d '\n' | head -c 250; echo
    fi
    rm -f /tmp/s3_$ip.html
  fi
done
