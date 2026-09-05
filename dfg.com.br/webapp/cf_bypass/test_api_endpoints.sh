#!/bin/bash
# Test all known API endpoints via Tor. Categorize responses.
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
endpoints=(
  "/api/public/users/1" "/api/public/users/2" "/api/public/users/5" "/api/public/users/10"
  "/api/public/items/" "/api/public/item-questions/1" "/api/public/"
  "/api/items/featured" "/api/items/last-visited" "/api/items/publish"
  "/api/search/autocomplete?q=a" "/api/search/listings?q=a"
  "/api/banners/" "/api/banners/home" "/api/categories/menu"
  "/api/user/header-summary" "/api/users/favorites" "/api/users/notifications"
  "/api/admin/impersonation-status" "/api/cart/verify" "/api/cart"
  "/api/analytics/eligibility" "/api/_auth/session" "/api/auth/login"
  "/api/client-log" "/api/telemetry/web-vitals"
  "/api/public/users/1/details" "/api/public/users/100" "/api/public/users/500" "/api/public/users/1000"
)
for host in www.dfg.com.br api.dfg.com.br dfg.com.br; do
  echo "=== host: $host ==="
  for ep in "${endpoints[@]}"; do
    out=$(timeout 20 proxychains4 -q curl -ks -A "$UA" "https://$host$ep" -o /tmp/api_test.html -w "%{http_code}|%{size_download}|%{content_type}" 2>/dev/null)
    # skip CF challenge (403 + "Just a moment") and CF WAF block (403 + "Your request was blocked")
    body=$(head -c 200 /tmp/api_test.html 2>/dev/null | tr -d '\n')
    flag=""
    if echo "$body" | grep -qi "just a moment"; then flag="CF_CHALLENGE"
    elif echo "$body" | grep -qi "request was blocked"; then flag="CF_WAF"
    elif [ "${out%%|*}" = "200" ]; then flag="ACCESSIBLE_200"
    elif [ "${out%%|*}" = "401" ]; then flag="AUTH_401"
    elif [ "${out%%|*}" = "404" ]; then flag="NOTFOUND_404"
    elif [ "${out%%|*}" = "500" ]; then flag="ERROR_500"
    elif [ "${out%%|*}" = "302" ]; then flag="REDIRECT_302"
    fi
    if [ -n "$flag" ] && [ "$flag" != "CF_CHALLENGE" ]; then
      echo "  $flag $ep -> $out | ${body:0:120}"
    fi
    rm -f /tmp/api_test.html
  done
done
