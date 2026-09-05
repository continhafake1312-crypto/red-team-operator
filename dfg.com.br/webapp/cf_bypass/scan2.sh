#!/bin/bash
ip="$1"
out=$(timeout 7 proxychains4 -q curl -ks --resolve www.dfg.com.br:443:$ip https://www.dfg.com.br/ -o /tmp/scan_$ip.html -w "%{http_code}|%{size_download}" 2>/dev/null)
if [ -f /tmp/scan_$ip.html ]; then
  if head -c 5000 /tmp/scan_$ip.html 2>/dev/null | grep -qiE "__nuxt|nuxt-link|window.__NUXT|<div id=.__nuxt.|_nuxt/|dfg.*market"; then
    echo ">>> NUXT at $ip : $out"
    head -c 200 /tmp/scan_$ip.html | tr -d '\n' | head -c 180
    echo
  fi
  rm -f /tmp/scan_$ip.html
fi
