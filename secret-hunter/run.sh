#!/usr/bin/env bash
# Secret Hunter — Launcher
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Carrega .env se existir
[ -f .env ] && set -a && . ./.env && set +a

# Venv
if [ ! -d venv ]; then
    echo "📦 Criando venv..."
    python3 -m venv venv
fi
source venv/bin/activate

# Instala deps se faltar
if ! python -c "import flask, httpx" 2>/dev/null; then
    echo "📦 Instalando dependências..."
    pip install -r requirements.txt --quiet
fi

C="\033[0;36m"; G="\033[0;32m"; Y="\033[1;33m"; B="\033[1m"; N="\033[0m"

case "${1:-help}" in
    scan)
        echo -e "${C}${B}🔍 Iniciando scan...${N}"
        python main.py scan --mode "${2:-both}"
        ;;
    scan:watch)
        echo -e "${C}${B}🔄 Scan contínuo...${N}"
        python main.py scan --mode "${2:-both}" --watch
        ;;
    dashboard)
        echo -e "${C}${B}🌐 Dashboard: http://${DASHBOARD_HOST:-0.0.0.0}:${DASHBOARD_PORT:-8080}${N}"
        python main.py dashboard
        ;;
    validate)
        echo -e "${C}${B}✓ Validando keys...${N}"
        python main.py validate --limit "${2:-50}"
        ;;
    stats)
        python main.py stats
        ;;
    setup)
        echo -e "${C}${B}📦 Instalando dependências...${N}"
        pip install -r requirements.txt
        echo -e "${G}✅ Pronto!${N}"
        ;;
    *)
        echo -e "${C}${B}Secret Hunter — Automated Key Discovery & Validation${N}"
        echo ""
        echo "  Uso: ./run.sh <comando>"
        echo ""
        echo "  Comandos:"
        echo "    scan          Executa scan único no GitHub"
        echo "    scan:watch    Scan contínuo (a cada 30min)"
        echo "    dashboard     Inicia dashboard web"
        echo "    validate      Valida keys pendentes"
        echo "    stats         Estatísticas no terminal"
        echo "    setup         Instala dependências"
        echo ""
        echo "  Configure GITHUB_TOKENS no .env antes de usar."
        echo ""
        ;;
esac