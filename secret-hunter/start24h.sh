#!/usr/bin/env bash
# Secret Hunter — Inicia scan contínuo 24h + dashboard público
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Carrega .env
[ -f .env ] && set -a && . ./.env && set +a

export GITHUB_TOKENS="${GITHUB_TOKENS:-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}"
export SCANNER_MIN_DATE="${SCANNER_MIN_DATE:-2026-01-01}"
export DASHBOARD_HOST="${DASHBOARD_HOST:-0.0.0.0}"
export DASHBOARD_PORT="${DASHBOARD_PORT:-8080}"

# Venv
source venv/bin/activate 2>/dev/null || { python3 -m venv venv && source venv/bin/activate; }
pip install -r requirements.txt --quiet 2>/dev/null

LOG="$DIR/data"
mkdir -p "$LOG"

# Mata processos antigos
ps aux | grep -E "main.py (scan|dashboard)" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true
sleep 1

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   🔍 Secret Hunter — Modo 24h Iniciado                       ║"
echo "║                                                              ║"
echo "║   🌐 Dashboard: http://$(curl -s -m3 ifconfig.me 2>/dev/null || echo 'SEU_IP'):${DASHBOARD_PORT}     ║"
echo "║   🔄 Scan contínuo: a cada 20 minutos                        ║"
echo "║   📅 Filtro: keys a partir de ${SCANNER_MIN_DATE}            ║"
echo "║   🔑 Tokens: $(echo $GITHUB_TOKENS | tr ',' '\n' | wc -l) GitHub token(s)            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Scan contínuo em background (survive logout via setsid)
setsid nohup python3 -u main.py scan --mode both --watch --interval 20 > "$LOG/scan.log" 2>&1 &
SCAN_PID=$!
echo "🔄 Scan contínuo iniciado (PID $SCAN_PID)"
echo "   Log: $LOG/scan.log"

# 2. Dashboard em background
setsid nohup python3 -u main.py dashboard > "$LOG/dashboard.log" 2>&1 &
DASH_PID=$!
echo "🌐 Dashboard iniciado (PID $DASH_PID)"
echo "   Log: $LOG/dashboard.log"

sleep 3

# Verifica se estão rodando
if kill -0 $SCAN_PID 2>/dev/null; then
    echo "✅ Scan: rodando"
else
    echo "❌ Scan: falhou — veja $LOG/scan.log"
fi
if kill -0 $DASH_PID 2>/dev/null; then
    echo "✅ Dashboard: rodando"
else
    echo "❌ Dashboard: falhou — veja $LOG/dashboard.log"
fi

echo ""
echo "Para parar: ps aux | grep main.py | grep -v grep | awk '{print \$2}' | xargs kill -9"