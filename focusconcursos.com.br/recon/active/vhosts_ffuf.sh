#!/bin/bash
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
WL=vhost_wordlist.txt
PY=http://127.0.0.1:8118
# ALB-1 (admin/alvo) HTTP:80 Host-based vhost fuzz
ffuf -w $WL -u http://54.86.140.91/ -H "Host: FUZZ.focusconcursos.com.br" -x $PY -t 3 -mc all -ac -fc 503,000 -o vhosts_alb1.json -maxtime 1200 2>/dev/null > ffuf_alb1.log
echo "ffuf alb1 done $(date -u +%FT%TZ)" >> scans_status.log
# Go backend IP vhost fuzz
ffuf -w $WL -u http://18.233.104.160/ -H "Host: FUZZ.focusconcursos.com.br" -x $PY -t 3 -mc all -ac -o vhosts_go18.json -maxtime 900 2>/dev/null > ffuf_go18.log
echo "ffuf go18 done $(date -u +%FT%TZ)" >> scans_status.log
# ALB-2 Next.js cluster IP vhost fuzz (grupofocus)
ffuf -w $WL -u http://98.84.85.83/ -H "Host: FUZZ.grupofocus.com.br" -x $PY -t 3 -mc all -ac -o vhosts_alb2.json -maxtime 900 2>/dev/null > ffuf_alb2.log
echo "ffuf alb2 done $(date -u +%FT%TZ)" >> scans_status.log
