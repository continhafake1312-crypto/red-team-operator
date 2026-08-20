#!/bin/bash
# Helpers de OPSEC — rate limit + UA rotativo + Tor
UAS=(
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0"
"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15"
)
rand_ua() { echo "${UAS[$((RANDOM % ${#UAS[@]}))]}"; }
# curl rate-limited via Tor
tcurl() {
  local ua; ua=$(rand_ua)
  proxychains4 -q curl -s --compressed --max-time 25 -A "$ua" \
    -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
    -H "Accept-Language: pt-BR,pt;q=0.9,en;q=0.8" "$@"
  sleep 1
}
