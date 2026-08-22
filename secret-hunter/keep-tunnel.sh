#!/usr/bin/env bash
# Secret Hunter — Mantém túnel localtunnel ativo 24h com auto-reconexão
set -u
while true; do
    # Mata qualquer lt cliente antigo para evitar duplicados
    pkill -f "bin/lt --port 8080" 2>/dev/null || true
    sleep 1
    echo "[$(date)] 🔄 Iniciando localtunnel na porta 8080..."
    npx --yes localtunnel --port 8080 --local-host 127.0.0.1 > /tmp/lt.log 2>&1
    # Salva URL atual
    URL=$(grep -o 'https://[^ ]*' /tmp/lt.log | tail -1)
    if [ -n "$URL" ]; then
        echo "$URL" > /home/ubuntu/secret-hunter/data/tunnel_url.txt
    fi
    echo "[$(date)] ⚠️  Túnel caiu. Reconectando em 3s... ($URL)"
    sleep 3
done
