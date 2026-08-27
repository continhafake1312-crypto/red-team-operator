#!/bin/bash
# Probe helper via Tor. Usage: probe.sh <label> <url> [curl args...]
UA_LIST=(
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
  "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0"
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)
UA="${UA_LIST[$RANDOM % ${#UA_LIST[@]}]}"
LABEL="$1"; URL="$2"; shift 2
echo "=== $LABEL ==="
proxychains4 -q curl -sk --max-time 40 -A "$UA" "$@" "$URL" \
  -D /tmp/opencode/hdr_$$ \
  -w '\n[HTTP %{http_code} | size %{size_download} | time %{time_total}s]\n' \
  -o /tmp/opencode/body_$$
echo "--- HEADERS ---"
cat /tmp/opencode/hdr_$$
echo "--- BODY ---"
cat /tmp/opencode/body_$$
echo
rm -f /tmp/opencode/hdr_$$ /tmp/opencode/body_$$
