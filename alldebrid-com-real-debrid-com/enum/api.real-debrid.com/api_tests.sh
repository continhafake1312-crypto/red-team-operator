#!/bin/bash
# API endpoint testing - run with proxychains4
# Usage: proxychains4 bash api_tests.sh

BASE="https://api.real-debrid.com"

echo "=== API Endpoint Testing ===" > /home/ubuntu/alldebrid-com-real-debrid-com/enum/api.real-debrid.com/api_test_results.txt

# OAuth2
echo "--- OAuth2 ---" >> /home/ubuntu/alldebrid-com-real-debrid-com/enum/api.real-debrid.com/api_test_results.txt
for endpoint in "/oauth/v2/" "/oauth/v2/auth" "/oauth/v2/device/code" "/oauth/v2/token"; do
    code=$(curl -sk -o /dev/null -w "%{http_code}" "$BASE$endpoint")
    echo "$endpoint → $code" >> /home/ubuntu/alldebrid-com-real-debrid-com/enum/api.real-debrid.com/api_test_results.txt
done

# REST API
echo "--- REST Endpoints (no auth) ---" >> /home/ubuntu/alldebrid-com-real-debrid-com/enum/api.real-debrid.com/api_test_results.txt
for endpoint in "/rest/1.0/hosts" "/rest/1.0/hosts/domains" "/rest/1.0/hosts/regex" "/rest/1.0/hosts/regexFolder" "/rest/1.0/hosts/status" "/rest/1.0/user" "/rest/1.0/traffic" "/rest/1.0/traffic/details" "/rest/1.0/downloads" "/rest/1.0/torrents" "/rest/1.0/torrents/activeCount" "/rest/1.0/settings" "/token" "/disable_access_token"; do
    code=$(curl -sk -o /dev/null -w "%{http_code}" "$BASE$endpoint")
    echo "$endpoint → $code" >> /home/ubuntu/alldebrid-com-real-debrid-com/enum/api.real-debrid.com/api_test_results.txt
done

# Unrestrict
echo "--- Unrestrict Endpoints ---" >> /home/ubuntu/alldebrid-com-real-debrid-com/enum/api.real-debrid.com/api_test_results.txt
for endpoint in "/unrestrict" "/unrestrict/check" "/unrestrict/containerFile" "/unrestrict/containerLink" "/unrestrict/folder" "/unrestrict/link"; do
    code=$(curl -sk -o /dev/null -w "%{http_code}" "$BASE$endpoint")
    echo "$endpoint → $code" >> /home/ubuntu/alldebrid-com-real-debrid-com/enum/api.real-debrid.com/api_test_results.txt
done

# GraphQL / Swagger
echo "--- API Spec Docs ---" >> /home/ubuntu/alldebrid-com-real-debrid-com/enum/api.real-debrid.com/api_test_results.txt
for endpoint in "/swagger.json" "/swagger.yaml" "/swagger/v1/swagger.json" "/openapi.json" "/api-docs" "/api/docs" "/graphql" "/api/graphql" "/v1/graphql" "/.well-known/openid-configuration" "/.well-known/oauth-authorization-server"; do
    code=$(curl -sk -o /dev/null -w "%{http_code}" "$BASE$endpoint" 2>/dev/null)
    echo "$endpoint → $code" >> /home/ubuntu/alldebrid-com-real-debrid-com/enum/api.real-debrid.com/api_test_results.txt
done

cat /home/ubuntu/alldebrid-com-real-debrid-com/enum/api.real-debrid.com/api_test_results.txt