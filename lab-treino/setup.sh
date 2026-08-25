#!/bin/bash
# 🧪 Lab Treino Pentest - Setup Automático
# Uso: bash setup.sh

echo "=== 🧪 Iniciando Laboratório de Pentest ==="

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instalando..."
    sudo apt-get update -qq && sudo apt-get install -y -qq docker.io docker-compose-v2
    sudo systemctl enable docker --now
fi

# Subir os containers
echo "🚀 Iniciando containers..."
sudo docker compose up -d

# Aguardar inicialização
sleep 5

# Verificar status
echo ""
echo "=== 📡 Laboratórios Ativos ==="
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== ✅ Acesse ==="
echo "DVWA:       http://localhost:8001  (admin:password)"
echo "Juice Shop: http://localhost:8002"
echo "WebGoat:    http://localhost:8003/WebGoat (guest:guest)"
echo "BWAPP:      http://localhost:8004  (bee:bug)"
echo "VulnPHP:    http://localhost:8007"
echo ""
echo "=== 📚 Guia de Treino ==="
echo "cat GUIA_TREINO.md"
