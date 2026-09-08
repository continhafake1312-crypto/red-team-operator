#!/bin/bash
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
# wait until member re-scan (11 IPs x DONE) finishes
for i in $(seq 1 60); do [ $(grep -c "^DONE" scan_members.log 2>/dev/null) -ge 11 ] && break; sleep 15; done
echo "[$(date -u +%FT%TZ)] chain4: members done -> banner grab over all portmaps" >> phase3_chain.log
python3 banner_socks.py portmap_*.txt > banner_run.log 2>&1
echo "[$(date -u +%FT%TZ)] chain4: banner done" >> phase3_chain.log
echo "CHAIN4 COMPLETE $(date -u +%FT%TZ)" >> scans_status.log
