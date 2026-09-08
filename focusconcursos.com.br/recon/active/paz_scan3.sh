#!/bin/bash
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
TOP=top300.txt
TMO=6; CONNS=4
python3 portscan_socks.py ports 54.86.140.91   $TOP $CONNS $TMO > scan_alb1.log 2>&1 &
python3 portscan_socks.py ports 98.84.85.83    $TOP $CONNS $TMO > scan_alb2.log 2>&1 &
python3 portscan_socks.py ports 18.233.104.160 $TOP $CONNS $TMO > scan_go.log 2>&1 &
python3 portscan_socks.py ports 34.230.151.3   $TOP $CONNS $TMO > scan_ec2.log 2>&1 &
wait
python3 portscan_socks.py ports 44.215.153.56  $TOP $CONNS $TMO > scan_alb2b.log 2>&1 &
python3 portscan_socks.py ports 38.211.129.213 $TOP $CONNS $TMO > scan_pxa.log 2>&1 &
python3 portscan_socks.py ports 170.82.173.30  $TOP $CONNS $TMO > scan_gocache_fc.log 2>&1 &
python3 portscan_socks.py ports 170.82.174.30  $TOP $CONNS $TMO > scan_gocache_gf.log 2>&1 &
wait
echo "TOP300 PORTSCANS DONE $(date -u +%FT%TZ)" >> scans_status.log
printf '50.16.232.142\n52.20.101.235\n3.208.58.6\n13.216.227.217\n98.94.147.72\n100.52.7.228\n100.57.155.22\n52.2.151.71\n44.217.112.44\n13.227.47.21\n13.227.47.104\n' > albmembers.txt
python3 portscan_socks.py list albmembers.txt "80,443,22,8443,3306,6379,27017,9200,11211" 4 $TMO > scan_members.log 2>&1
echo "CLUSTER MEMBERS DONE $(date -u +%FT%TZ)" >> scans_status.log
