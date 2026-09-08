#!/bin/bash
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
# 1) wait for top1000 rescans + cluster-member probes
for i in $(seq 1 150); do grep -q "CLUSTER MEMBERS DONE" scans_status.log && break; sleep 15; done
echo "[$(date -u +%FT%TZ)] chain: portscans done -> banner grab" >> phase3_chain.log
# 2) banner grab (soft, recv-only)
python3 banner_socks.py portmap_*.txt > banner_run.log 2>&1
echo "[$(date -u +%FT%TZ)] chain: banners done -> vhost ffuf" >> phase3_chain.log
# 3) vhost ffuf on remaining targets
bash vhosts_ffuf2.sh > vhost_chain.log 2>&1
echo "[$(date -u +%FT%TZ)] chain: vhost ffuf done -> waf scan" >> phase3_chain.log
# 4) WAF detection all alive hosts
bash waf_scan.sh > waf_chain.log 2>&1
echo "PHASE3 CHAIN COMPLETE $(date -u +%FT%TZ)" >> scans_status.log
