#!/bin/bash
# Usage: pcurl.sh <url> [extra curl opts]
URL="$1"; shift
UA_LIST=("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0")
UA="${UA_LIST[$((RANDOM % 3))]}"
timeout 40 proxychains4 -q curl -s -A "$UA" --max-time 25 "$@" "$URL"
