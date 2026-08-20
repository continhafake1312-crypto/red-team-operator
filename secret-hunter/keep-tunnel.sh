#!/usr/bin/env bash
# Secret Hunter — Mantém túnel localtunnel ativo 24h com auto-reconexão
set -euo pipefail
while true; do
    echo "[$(date)] 🔄 Iniciando localtunnel na porta 8080..."
    npx --yes localtunnel --port 8080 > /tmp/lt.log 2>&1
    echo "[$(date)] ⚠️  Túnel caiu. Reconectando em 5s..."
    sleep 5
done