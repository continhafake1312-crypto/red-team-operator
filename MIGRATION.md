# Guia de Migração — Red Team Operator Framework

> Como clonar, configurar e executar este framework de pentest autônomo em qualquer ambiente Linux.

---

## 📋 Pré-requisitos

### Hardware Mínimo
| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Disco | 20 GB | 50+ GB |
| Internet | 10 Mbps | 50+ Mbps |

### Sistema Operacional
- **Linux** (Ubuntu 22.04+ / Debian 12+ recomendado)
- **macOS** (com Homebrew)
- **Windows** (via WSL2 + Ubuntu)

### Dependências Essenciais

```bash
# Sistema
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential python3 python3-pip python3-venv \
    tor proxychains4 nmap masscan jq whois netcat-openbsd dnsutils

# Go (para ferramentas Go)
wget https://go.dev/dl/go1.22.5.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

# Node.js (para alguns scripts)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Ferramentas adicionais
pip3 install --user pipx
pipx ensurepath
```

---

## 🚀 Instalação Rápida

### 1. Clonar o Repositório

```bash
git clone https://github.com/<SEU_USER>/red-team-operator.git
cd red-team-operator
```

### 2. Instalar OpenCode (Obrigatório)

```bash
# Instalar OpenCode CLI
curl -fsSL https://opencode.ai/install.sh | bash

# Verificar instalação
opencode --version
```

### 3. Configurar OpenCode

```bash
# Criar diretório de configuração
mkdir -p ~/.config/opencode

# Copiar configuração do framework
cp -r .opencode/* ~/.opencode/

# Configurar agentes
cp .opencode/agent/* ~/.opencode/agent/
cp .opencode/skills/* ~/.opencode/skills/
cp .opencode/command/* ~/.opencode/command/

# Verificar estrutura
ls -la ~/.opencode/
```

### 4. Configurar OPSEC

```bash
# Configurar Tor
sudo systemctl enable tor
sudo systemctl start tor

# Verificar funcionamento do proxy
curl --proxy socks5://127.0.0.1:9050 ifconfig.me

# Configurar proxychains4
sudo sed -i 's/^socks4.*/socks5 127.0.0.1 9050/' /etc/proxychains4.conf

# Testar proxychains
proxychains4 curl ifconfig.me
```

### 5. (Opcional) Configurar 2Captcha

```bash
# Criar arquivo com sua chave 2Captcha
echo "SUA_CHAVE_2CAPTCHA_AQUI" > ~/.config/opencode/.2captcha_key
chmod 600 ~/.config/opencode/.2captcha_key
```

### 6. Instalar Ferramentas de Pentest

```bash
# O script pode ser executado automaticamente pelo framework,
# mas é recomendado pré-instalar:

# Subfinder
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest

# Amass
go install -v github.com/owasp-amass/amass/v4/...@master

# Httpx
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest

# Dnsx
go install -v github.com/projectdiscovery/dnsx/cmd/dnsx@latest

# FFUF
go install github.com/ffuf/ffuf/v2@latest

# Nuclei
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

# Ferramentas Python
pip3 install --user waybackpy theHarvester truffleHog shodan

# SecLists (wordlists)
git clone https://github.com/danielmiessler/SecLists.git /opt/SecLists
```

---

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente

Adicione ao `~/.bashrc` ou `~/.zshrc`:

```bash
# OpenCode
export PATH="$HOME/.opencode/bin:$PATH"

# Go
export PATH="$PATH:/usr/local/go/bin:$HOME/go/bin"

# Python
export PATH="$PATH:$HOME/.local/bin"

# Tor
export TOR_PROXY="socks5://127.0.0.1:9050"

# Shodan (opcional)
export SHODAN_API_KEY="sua_chave_aqui"

# Censys (opcional)
export CENSYS_API_ID="sua_id"
export CENSYS_API_SECRET="seu_secret"

# 2Captcha (opcional)
export CAPTCHA_KEY="$(cat ~/.config/opencode/.2captcha_key 2>/dev/null)"
```

### Validar Setup

```bash
# Testar se Tor está funcionando
proxychains4 curl -s ifconfig.me | grep -v "^$"

# Testar se OpenCode reconhece os agentes
opencode agent list

# Testar um scan simples
proxychains4 nmap -sn -n 8.8.8.8
```

---

## 📁 Estrutura Esperada

```
~/
├── .opencode/
│   ├── agent/          # Agentes especialistas (14 arquivos .md)
│   ├── skills/         # Skills (pentest-methodology)
│   ├── command/        # Comandos (pentest.md)
│   ├── .2captcha_key   # Chave 2Captcha (NUNCA commitar)
│   └── .gitignore      # Proteção de segredos
│
├── projetos/           # Seus engagements
│   └── <alvo>/
│       ├── SCOPE.md
│       ├── PLAN.md
│       ├── REPORT.md
│       ├── timeline.log
│       ├── recon/
│       ├── enum/
│       ├── evidence/
│       ├── exploit/
│       ├── loot/
│       └── screenshots/
│
└── AGENTS.md           # Documentação dos agentes
└── README.md           # Este arquivo
```

---

## 🎯 Primeiro Engagamento

### Pelo OpenCode CLI

```bash
# Iniciar OpenCode no diretório do framework
cd ~/red-team-operator
opencode

# Dentro do OpenCode, digite:
> pentest https://exemplo.com.br

# O framework vai:
# 1. Criar a estrutura de diretórios
# 2. Executar recon passivo → ativo → enum → webapp
# 3. Relatar findings em tempo real
# 4. Fazer commit + push automático (se configurado)
```

### Ou via Comando Direto

```bash
opencode pentest https://exemplo.com.br
```

---

## 🔐 Configuração do Git (Opcional para Auto-Sync)

```bash
# Configurar seu remote (crie um repositório vazio no GitHub)
git remote add origin https://github.com/<SEU_USER>/red-team-operator.git

# Se usar token:
git remote set-url origin https://<TOKEN>@github.com/<SEU_USER>/red-team-operator.git

# Verificar
git remote -v
```

---

## ⚠️ Troubleshooting

### Tor não funciona
```bash
# Verificar status
sudo systemctl status tor

# Verificar porta
netstat -tlnp | grep 9050

# Testar proxy
curl --proxy socks5://127.0.0.1:9050 http://ifconfig.me
```

### proxychains4 não encontrado
```bash
# No Ubuntu/Debian
sudo apt install proxychains4

# Verificar config
cat /etc/proxychains4.conf | grep -E "^socks"
```

### Ferramentas não encontradas
O framework tenta instalar ferramentas automaticamente, mas pode precisar de permissão sudo. Se falhar:
```bash
# Instalar manualmente
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
```

### OpenCode não reconhece os agentes
```bash
# Verificar se os arquivos estão no lugar
ls ~/.opencode/agent/

# Se vazio, copiar novamente
cp -r .opencode/agent/* ~/.opencode/agent/
cp -r .opencode/skills/* ~/.opencode/skills/
```

---

## 📦 Docker (Alternativa)

```dockerfile
FROM ubuntu:22.04

RUN apt update && apt install -y \
    sudo curl wget git build-essential python3 python3-pip \
    tor proxychains4 nmap masscan jq whois netcat-openbsd dnsutils \
    && rm -rf /var/lib/apt/lists/*

# Instalar Go
RUN curl -fsSL https://go.dev/dl/go1.22.5.linux-amd64.tar.gz | tar -C /usr/local -xz
ENV PATH=$PATH:/usr/local/go/bin

# Instalar OpenCode
RUN curl -fsSL https://opencode.ai/install.sh | bash
ENV PATH=$PATH:/root/.opencode/bin

# Copiar framework
COPY . /opt/red-team-operator
RUN cp -r /opt/red-team-operator/.opencode/* /root/.opencode/

WORKDIR /opt/red-team-operator
CMD ["opencode"]
```

Build:
```bash
docker build -t red-team-operator .
docker run -it red-team-operator
```

---

## 🔄 Atualização

```bash
cd red-team-operator
git pull origin main
cp -r .opencode/agent/* ~/.opencode/agent/
cp -r .opencode/skills/* ~/.opencode/skills/
```

---

## 📚 Referências

- [AGENTS.md](AGENTS.md) — Documentação completa dos agentes
- [ANALISE_PENTESTS.md](ANALISE_PENTESTS.md) — Análise de todos os pentests realizados
- [DOCUMENTACAO.md](DOCUMENTACAO.md) — Análise técnica do framework
- [OpenCode Documentation](https://docs.opencode.ai)
- [Tor Project](https://www.torproject.org)
- [proxychains-ng](https://github.com/rofl0r/proxychains-ng)

---

*Red Team Operator — Framework de Pentest Autônomo*
*Migração e configuração — 2026-08-25*