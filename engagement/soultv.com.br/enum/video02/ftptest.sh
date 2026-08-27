#!/bin/bash
# Non-destructive: test FTP anon write with canary, then remove
CANARY="zzz_enum_canary_$(date +%s)"
URL="ftp://anonymous:enum@160.202.130.243/"
echo "=== mkdir $CANARY ==="
proxychains4 -q curl -s --max-time 25 -v --ftp-method singlecwd -Q "MKD /$CANARY" "$URL" 2>&1 | grep -iE "< [0-9]|MKD"
echo "=== STOR canary file in / (PUT) ==="
echo "enum-canary-$(date)" | proxychains4 -q curl -s --max-time 25 -v -T - "$URL$CANARY.txt" 2>&1 | grep -iE "< [0-9]|STOR|226|550|553"
echo "=== LIST / (see if canary appears) ==="
proxychains4 -q curl -s --max-time 25 "$URL" 2>&1 | head -20
echo "=== cleanup: DELE + RMD ==="
proxychains4 -q curl -s --max-time 25 -Q "DELE /$CANARY.txt" "$URL" 2>&1 | grep -iE "< [0-9]"
proxychains4 -q curl -s --max-time 25 -Q "RMD /$CANARY" "$URL" 2>&1 | grep -iE "< [0-9]"
