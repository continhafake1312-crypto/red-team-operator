#!/bin/bash
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
python3 portscan_socks.py ports 54.86.140.91 top1000.txt 20   > scan_alb1.log 2>&1
python3 portscan_socks.py ports 18.233.104.160 top1000.txt 20 > scan_go.log 2>&1
python3 portscan_socks.py ports 38.211.129.213 top1000.txt 20 > scan_pxa.log 2>&1
python3 portscan_socks.py ports 98.84.85.83 top1000.txt 20    > scan_alb2.log 2>&1
python3 portscan_socks.py ports 34.230.151.3 top1000.txt 20   > scan_ec2.log 2>&1
echo "ALL PORTSCANS DONE $(date -u +%FT%TZ)" >> scans_status.log
