#!/bin/bash
# Scan Contabo /24 ranges for a host serving the Nuxt (www.dfg.com.br)
# Look for Nuxt markers in response when Host: www.dfg.com.br is sent.
ranges="161.97.106 77.237.240 77.237.241 5.189.143 164.68.104"
for base in $ranges; do
  for host in $(seq 1 254); do
    ip="$base.$host"
    # quick: 5s timeout, via proxychains, Host header www.dfg.com.br, look for nuxt
    out=$(timeout 6 proxychains4 -q curl -ks --resolve www.dfg.com.br:443:$ip https://www.dfg.com.br/ -o /tmp/scan_$ip.html -w "%{http_code}|%{size_download}" 2>/dev/null)
    if [ -f /tmp/scan_$ip.html ]; then
      if head -c 4000 /tmp/scan_$ip.html 2>/dev/null | grep -qiE "__nuxt|nuxt-link|window.__NUXT|<div id=\"__nuxt\"|vue|dfg.*marketplace|_nuxt/"; then
        echo ">>> NUXT at $ip : $out"
        head -c 200 /tmp/scan_$ip.html | tr -d '\n' | head -c 150
        echo
      elif head -c 200 /tmp/scan_$ip.html 2>/dev/null | grep -qiE "Just a moment|cloudflare"; then
        : # CF fronted, skip (means IP doesn't directly serve)
      fi
    fi
    rm -f /tmp/scan_$ip.html
  done
done
echo "scan done"
