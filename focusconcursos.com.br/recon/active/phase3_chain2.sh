#!/bin/bash
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
# wait for top300 scans (marker from paz_scan3.sh)
for i in $(seq 1 200); do grep -q "CLUSTER MEMBERS DONE" scans_status.log && break; sleep 15; done
echo "[$(date -u +%FT%TZ)] chain2: portscans done -> banner grab" >> phase3_chain.log
python3 banner_socks.py portmap_*.txt > banner_run.log 2>&1
echo "[$(date -u +%FT%TZ)] chain2: banners done -> vhost ffuf" >> phase3_chain.log
bash vhosts_ffuf2.sh > vhost_chain.log 2>&1
echo "[$(date -u +%FT%TZ)] chain2: vhost ffuf done -> waf scan" >> phase3_chain.log
bash waf_scan.sh > waf_chain.log 2>&1
echo "PHASE3 CHAIN2 COMPLETE $(date -u +%FT%TZ)" >> scans_status.log
