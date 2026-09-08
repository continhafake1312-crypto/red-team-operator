#!/usr/bin/env bash
# Next.js asset re-fetch with retry + validation. Args: HOST HOSTDIR [ASSETSFILE]
# usage: bash nextjs_assets.sh <host> <outdir> <assetsfile>
set -u
E=/home/ubuntu/red-team-operator/focusconcursos.com.br/enum
H=${1:?host}
D=${2:?outdir}
A=${3:?assetsfile}
P="socks5h://127.0.0.1:9050"
UA="Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0"
mkdir -p "$D/js"
: > "$D/assets_sizes.txt"
while IFS= read -r a; do
  [ -z "$a" ] && continue
  case "$a" in /*) a=${a#/};; esac
  f=$(printf '%s' "$a" | tr '/?' '__')
  ok=0
  for try in 1 2 3; do
    code=$(curl -sk --proxy "$P" -m 30 -A "$UA" -o "$D/js/$f.tmp" -w '%{http_code}' "https://$H/$a" 2>/dev/null)
    if [ "$code" = "200" ] && [ "$(stat -c%s "$D/js/$f.tmp" 2>/dev/null || echo 0)" -gt 200 ]; then mv "$D/js/$f.tmp" "$D/js/$f"; ok=1; break; fi
    sleep 1
  done
  printf '%s %s %s %s\n' "$code" "$(stat -c%s "$D/js/$f" 2>/dev/null || echo fail)" "$try" "$a" >> "$D/assets_sizes.txt"
  sleep 0.2
done < "$A"
echo "=== sizes ==="; cat "$D/assets_sizes.txt"
