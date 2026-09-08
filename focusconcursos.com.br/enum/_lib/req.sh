#!/usr/bin/env bash
# enum/_lib/req.sh — Tor-routed HTTP helper for enum phase (Ciclo 3, focusconcursos.com.br)
# Usage: req.sh METHOD URL [DATA] -> prints "method|url|status|type|size|loc"; body saved (path in _raw/last_body_path)
set -u
PROXY="socks5h://127.0.0.1:9050"
ENUMDIR="/home/ubuntu/red-team-operator/focusconcursos.com.br/enum"
mkdir -p "$ENUMDIR/_raw"
M="${1:-GET}"; U="${2:?url missing}"; D="${3:-}"
UAFILE="$ENUMDIR/_lib/uas.txt"
UA=$(awk 'BEGIN{srand()}!/^#/{a[NR]=$0}END{print a[int(rand()*NR)+1]}' "$UAFILE")
TMP=$(mktemp "$ENUMDIR/_raw/req.XXXXXXXX.body")
HDR=$(mktemp "$ENUMDIR/_raw/req.XXXXXXXX.hdr")
if [ -n "$D" ]; then
  curl -sk --proxy "$PROXY" -m 25 -A "$UA" -g -X "$M" --data-raw "$D" \
     -D "$HDR" -o "$TMP" -w '%{http_code}\t%{content_type}\t%{size_download}\t%{redirect_url}' "$U" >"$TMP.meta" 2>/dev/null < /dev/null
else
  curl -sk --proxy "$PROXY" -m 25 -A "$UA" -g \
     -D "$HDR" -o "$TMP" -w '%{http_code}\t%{content_type}\t%{size_download}\t%{redirect_url}' "$U" >"$TMP.meta" 2>/dev/null < /dev/null
fi
IFS=$'\t' read -r ST CT SZ LOC < "$TMP.meta"
LOC=${LOC:-}
printf '%s|%s|%s|%s|%s|%s\n' "$M" "$U" "${ST:-ERR}" "${CT:-}" "${SZ:-0}" "$LOC"
echo "$TMP" > "$ENUMDIR/_raw/last_body_path"
echo "$HDR" > "$ENUMDIR/_raw/last_hdr_path"
