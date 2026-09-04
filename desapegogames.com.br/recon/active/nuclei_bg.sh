#!/bin/bash
# nuclei (fixed flags) on origin .54 via bypass CF — exposures + misconfig
cd /home/ubuntu/red-team-operator/desapegogames.com.br/recon/active
echo "=== NUCLEI .54 (bypass CF) start $(date -u +%H:%M:%S) ===" > nuclei_results.txt
/home/ubuntu/go/bin/nuclei -u "https://186.226.60.54" -H "Host: desapegogames.com.br" \
  -proxy socks5://127.0.0.1:9050 -severity medium,high,critical \
  -t /home/ubuntu/nuclei-templates/http/exposures/ \
  -t /home/ubuntu/nuclei-templates/http/misconfiguration/ \
  -timeout 25 -c 10 -silent -nc 2>&1 >> nuclei_results.txt
echo "=== NUCLEI .54 done $(date -u +%H:%M:%S) ===" >> nuclei_results.txt

echo "" >> nuclei_results.txt
echo "=== NUCLEI webhook vhost .53 start $(date -u +%H:%M:%S) ===" >> nuclei_results.txt
/home/ubuntu/go/bin/nuclei -u "https://186.226.60.53" -H "Host: webhook.desapegogames.com.br" \
  -proxy socks5://127.0.0.1:9050 -severity medium,high,critical \
  -t /home/ubuntu/nuclei-templates/http/exposures/ \
  -t /home/ubuntu/nuclei-templates/http/misconfiguration/ \
  -timeout 25 -c 10 -silent -nc 2>&1 >> nuclei_results.txt
echo "=== NUCLEI webhook done $(date -u +%H:%M:%S) ===" >> nuclei_results.txt
echo "=== ALL NUCLEI DONE ===" > nuclei_done.flag
