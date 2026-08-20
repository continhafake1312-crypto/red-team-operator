#!/usr/bin/env bash
# Secret Hunter — Rápido Start
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# ── Configurações (mude aqui ou exporte no .env) ──────────────────────
export GITHUB_TOKENS="${GITHUB_TOKENS:-}"              # Tokens separados por vírgula
export SCANNER_MIN_DATE="${SCANNER_MIN_DATE:-2026-01-01}"  # Só keys recentes
export SCAN_MODE="${SCAN_MODE:-both}"                  # code | commits | both
export DASHBOARD_PORT="${DASHBOARD_PORT:-8080}"        # Porta do dashboard
export DASHBOARD_HOST="${DASHBOARD_HOST:-0.0.0.0}"     # Host do dashboard

# ── Cores ──
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'

show_help() {
    echo -e "${CYAN}${BOLD}Secret Hunter — Automated Key Discovery & Validation${NC}"
    echo ""
    echo "  Uso: ./run.sh <comando> [opções]"
    echo ""
    echo "  Comandos:"
    echo "    scan          Executa scan único no GitHub"
    echo "    scan:watch    Scan contínuo (a cada 30min)"
    echo "    dashboard     Inicia servidor web"
    echo "    validate      Valida keys pendentes"
    echo "    stats         Mostra estatísticas no terminal"
    echo "    setup         Instala dependências"
    echo ""
    echo "  Exemplos:"
    echo "    GITHUB_TOKENS='ghp_xxx,ghp_yyy' ./run.sh scan"
    echo "    ./run.sh dashboard"
    echo "    ./run.sh validate"
    echo ""
}

# ── Setup ──
setup() {
    echo -e "${CYAN}${BOLD}📦 Instalando dependências...${NC}"
    pip install -r requirements.txt --quiet 2>/dev/null || pip3 install -r requirements.txt --quiet
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
}

# ── Main ──
case "${1:-help}" in
    scan)
        setup
        echo -e "${CYAN}${BOLD}🔍 Iniciando scan...${NC}"
        python main.py scan --mode "${2:-$SCAN_MODE}"
        ;;
    scan:watch)
        setup
        echo -e "${CYAN}${BOLD}🔄 Scan contínuo...${NC}"
        python main.py scan --mode "${2:-$SCAN_MODE}" --watch
        ;;
    dashboard)
        setup
        echo -e "${CYAN}${BOLD}🌐 Iniciando dashboard em http://${DASHBOARD_HOST}:${DASHBOARD_PORT}${NC}"
        python main.py dashboard
        ;;
    validate)
        setup
        echo -e "${CYAN}${BOLD}🔍 Validando keys pendentes...${NC}"
        python main.py validate --limit "${2:-50}"
        ;;
    stats)
        setup
        python main.py stats
        ;;
    setup)
        setup
        ;;
    help|--help|-h|*)
        show_help
        ;;
esac