#!/bin/bash
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
echo "# wafw00f all-alive-hosts scan $(date -u +%FT%TZ) via privoxy->Tor proxy" > waf_wafw00f.txt
wafw00f -a -T 30 -p http://127.0.0.1:8118 -H waf_headers.txt -i waf_hosts.txt \
  --no-colors -o waf_wafw00f.csv -f csv 2>&1 | tee -a waf_wafw00f_stdout.log >/dev/null
echo "# waf scan end $(date -u +%FT%TZ)" >> waf_wafw00f.txt
echo "WAF SCAN DONE $(date -u +%FT%TZ)" >> scans_status.log
