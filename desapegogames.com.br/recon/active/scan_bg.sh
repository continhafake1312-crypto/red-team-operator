#!/bin/bash
cd /home/ubuntu/red-team-operator/desapegogames.com.br/recon/active
for IP in 186.226.60.53 186.226.60.54 186.226.60.56; do
  SUFFIX=$(echo $IP | tr '.' '_')
  echo "=== RUSTSCAN $IP start $(date -u +%H:%M:%S) ==="
  proxychains4 -q rustscan -a $IP -b 150 -t 2500 --ulimit 65535 -- -sT -Pn -n -sV --version-intensity 5 --max-retries 1 --host-timeout 40m -p 1-65535 > "nmap_${SUFFIX}.txt" 2>&1
  echo "=== RUSTSCAN $IP done $(date -u +%H:%M:%S) ==="
done
echo "=== ALL RUSTSCAN DONE $(date -u +%H:%M:%S) ==="
