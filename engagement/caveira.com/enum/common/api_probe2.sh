#!/bin/bash
B="https://api.caveira.com"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"
probe() {
  local path="$1"; local method="${2:-GET}"
  local code=$(proxychains4 -q curl -s -o /dev/null -m 20 -w '%{http_code} %{size_download}' -A "$UA" -X "$method" "$B$path" 2>/dev/null)
  echo "$method $code  $path"
}
# Auth endpoints - try POST
for p in /api/v1/auth/login /api/v1/auth/logout /api/v1/auth/refresh /api/v1/auth/register /api/v1/auth/me /api/v1/auth/forgot-password /api/v1/auth/reset-password /api/v1/auth/verify /api/v1/auth/user; do
  probe "$p" POST
done
# Resource endpoints - GET (may need auth)
for p in /api/v1/users /api/v1/users/me /api/v1/accounts /api/v1/products /api/v1/courses /api/v1/dashboard /api/v1/config /api/v1/me /api/v1/health /api/v1/version /api/v1/swagger /api/v1/docs /api/v1/api-docs; do
  probe "$p" GET
  probe "$p" POST
done
# Top-level
for p in / /api /api/v1 /api/v2 /swagger /api-docs /openapi.json /docs /health /status /version /actuator /sanctum/csrf-cookie /login /register; do
  probe "$p" GET
done
