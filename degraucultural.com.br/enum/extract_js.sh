#!/usr/bin/env bash
# Extrai endpoints, chaves, hosts, rotas, env vars de bundles JS (minificados)
# Uso: extract_js.sh <dir> <bundle_file> [label]
set -u
DIR="$1"; BUNDLE="$2"; LABEL="${3:-$BUNDLE}"
cd "$DIR" 2>/dev/null || exit 1
B="$(basename "$BUNDLE")"

# 1. Endpoints API: paths absolutos/relativos com /api, /v1, /auth, /admin, /jwt, /school, /opportunities
rg -oN '"/[a-zA-Z0-9_/.{}\$:-]{3,}"' "$BUNDLE" 2>/dev/null | tr -d '"' | sort -u > "endpaths_raw_$B.txt"
# Endpoints com contexto de chamada: axios.get/post/put/delete("path"...)
rg -oN '\.(get|post|put|delete|patch)\("(/[a-zA-Z0-9_/.{}\$:-]+)"' "$BUNDLE" 2>/dev/null | \
  awk -F'[()]' '{print $2}' | tr -d '"' | sort -u > "apicalls_$B.txt"

# 2. Hosts / URLs http(s)
rg -oN 'https?://[a-zA-Z0-9._/-]{5,}' "$BUNDLE" 2>/dev/null | sort -u > "hosts_$B.txt"

# 3. Chaves/tokens/secrets
rg -oiN '(Bearer [A-Za-z0-9._-]+|eyJ[A-Za-z0-9._-]{15,}|AKIA[A-Z0-9]{16}|sk_[A-Za-z0-9]{20,}|pk_[A-Za-z0-9]{20,}|api[_-]?key["'"'"']?\s*[:=]\s*["'"'"'][A-Za-z0-9]{10,}|secret["'"'"']?\s*[:=]\s*["'"'"'][A-Za-z0-9]{8,}|x-vindi-api-key|token["'"'"']?\s*[:=]\s*["'"'"'][A-Za-z0-9]{15,})' "$BUNDLE" 2>/dev/null | sort -u > "secrets_$B.txt"

# 4. Env vars (VUE_APP_, VITE_, NUXT_, import.meta.env, process.env)
rg -oN '(VUE_APP_[A-Z0-9_]+|VITE_[A-Z0-9_]+|NUXT_[A-Z0-9_]+|process\.env\.[A-Z0-9_]+|import\.meta\.env\.[A-Z0-9_]+)' "$BUNDLE" 2>/dev/null | sort -u > "envvars_$B.txt"

# 5. Rotas SPA (vue-router / react-router) path:"/..."
rg -oN 'path:"/[a-zA-Z0-9_/:{}.()\-]*"' "$BUNDLE" 2>/dev/null | sort -u > "routes_$B.txt"

# 6. Headers custom (X-*, Authorization, school, domain)
rg -oiN '["'"'"'](X-[A-Za-z0-9-]+|Authorization|School|Domain|x-tenant|x-school)["'"'"']' "$BUNDLE" 2>/dev/null | sort -u > "headers_$B.txt"

# 7. JWT / token storage keys
rg -oiN '(accessToken|refreshToken|userData|userAbilityRules|token|jwt)["'"'"']?\s*[:=]' "$BUNDLE" 2>/dev/null | sort -u > "tokenkeys_$B.txt"

echo "=== $LABEL ($B) ==="
echo "endpaths: $(wc -l < endpaths_raw_$B.txt) | apicalls: $(wc -l < apicalls_$B.txt) | hosts: $(wc -l < hosts_$B.txt)"
echo "secrets: $(wc -l < secrets_$B.txt) | envvars: $(wc -l < envvars_$B.txt) | routes: $(wc -l < routes_$B.txt)"
echo "headers: $(wc -l < headers_$B.txt) | tokenkeys: $(wc -l < tokenkeys_$B.txt)"
