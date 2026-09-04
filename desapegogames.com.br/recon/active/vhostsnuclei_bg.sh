#!/bin/bash
# Vhost fuzzing + nuclei via Tor on the origin (186.226.60.54)
cd /home/ubuntu/red-team-operator/desapegogames.com.br/recon/active
FFUF=/usr/bin/ffuf
WL=vhosts_wordlist.txt
PROXY="socks5://127.0.0.1:9050"

echo "=== VHOST FUZZ 186.226.60.54 (origin) start $(date -u +%H:%M:%S) ===" > vhosts_ffuf.txt
# Baseline on .54 default vhost = 301 size 277. Filter that to surface real vhosts.
$FFUF -u "https://186.226.60.54/" -H "Host: FUZZ.desapegogames.com.br" -w $WL \
  -x $PROXY -k -timeout 25 -t 8 -mc all -s -of csv \
  -o vhosts_54_raw.csv 2>&1 | tail -40 >> vhosts_ffuf.txt
echo "=== VHOST 54 done $(date -u +%H:%M:%S) ===" >> vhosts_ffuf.txt

echo "" >> vhosts_ffuf.txt
echo "=== VHOST FUZZ 186.226.60.53 (mail/DA) start $(date -u +%H:%M:%S) ===" >> vhosts_ffuf.txt
$FFUF -u "https://186.226.60.53/" -H "Host: FUZZ.desapegogames.com.br" -w $WL \
  -x $PROXY -k -timeout 25 -t 8 -mc all -s -of csv \
  -o vhosts_53_raw.csv 2>&1 | tail -40 >> vhosts_ffuf.txt
echo "=== VHOST 53 done $(date -u +%H:%M:%S) ===" >> vhosts_ffuf.txt

echo "" >> vhosts_ffuf.txt
echo "=== VHOST FUZZ 186.226.60.56 (mail3) start $(date -u +%H:%M:%S) ===" >> vhosts_ffuf.txt
$FFUF -u "https://186.226.60.56/" -H "Host: FUZZ.desapegogames.com.br" -w $WL \
  -x $PROXY -k -timeout 25 -t 8 -mc all -s -of csv \
  -o vhosts_56_raw.csv 2>&1 | tail -40 >> vhosts_ffuf.txt
echo "=== VHOST 56 done $(date -u +%H:%M:%S) ===" >> vhosts_ffuf.txt

echo "=== NUCLEI on origin .54 (bypass CF, Host header) start $(date -u +%H:%M:%S) ===" >> nuclei_results.txt
/home/ubuntu/go/bin/nuclei -u "https://186.226.60.54" -H "Host: desapegogames.com.br" \
  -proxy socks5://127.0.0.1:9050 -severity medium,high,critical \
  -t /home/ubuntu/nuclei-templates/http/exposures/ \
  -t /home/ubuntu/nuclei-templates/http/misconfiguration/ \
  -timeout 25 -c 8 -silent -nv 2>&1 | tail -60 >> nuclei_results.txt
echo "=== NUCLEI done $(date -u +%H:%M:%S) ===" >> nuclei_results.txt
echo "=== ALL BG DONE ===" > vhostsnuclei_done.flag
