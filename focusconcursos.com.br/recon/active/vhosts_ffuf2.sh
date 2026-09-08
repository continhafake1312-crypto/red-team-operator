#!/bin/bash
# vhosts_ffuf2.sh — vhost discovery on remaining direct-IP targets (previous run only did ALB1, results empty)
# OPSEC: all traffic via privoxy(8118)->Tor. 3 threads, autocalib, maxtime 900, UA default+UA-rotate manual in pre-run.
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
PY=http://127.0.0.1:8118
WL=vhost_wordlist2.txt

run() { # $1=IP $2=domain $3=outfile $4=extra_fc
  VA=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.126 Safari/537.36" "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15")
  ip=$1; dom=$2; out=$3; fcv=$4
  [ -z "$fcv" ] && fcv="000"
  UA=${VA[$((RANDOM % 3))]}
  echo "[$(date -u +%FT%TZ)] ffuf vhost $ip Host=FUZZ.$dom UA=$(echo $UA | cut -c1-20)" >> vhosts_ffuf2_run.log
  ffuf -w $WL -u "http://$ip/" -H "Host: FUZZ.$dom" \
    -H "User-Agent: $UA" \
    -x $PY -t 3 -p 0.2-0.8 -mc all -ac -fc "$fcv" -timeout 10 -maxtime 900 \
    -o vhosts_$out.json 2>/dev/null > vhosts_$out.log
  echo "[$(date -u +%FT%TZ)] done $out" >> vhosts_ffuf2_run.log
}

# ALB member 44.215.153.56 (same ELB as 54.86.140.91): Host *.focusconcursos.com.br
run 44.215.153.56 focusconcursos.com.br alb2 "000,503" & sleep 8
# Next.js cluster ALB 98.84.85.83: grupofocus + focusconcursos
( run 98.84.85.83 grupofocus.com.br nextjs_gf "000" ) & sleep 8
( run 98.84.85.83 focusconcursos.com.br nextjs_fc "000" ) & sleep 8
wait
# Go/traefik 18.233.104.160
( run 18.233.104.160 focusconcursos.com.br go18_fc "000" ) & sleep 8
( run 18.233.104.160 grupofocus.com.br go18_gf "000" ) & sleep 8
wait
# EC2 origin 34.230.151.3
( run 34.230.151.3 focusconcursos.com.br ec2_fc "000" ) & sleep 8
( run 34.230.151.3 grupofocus.com.br ec2_gf "000" ) & sleep 8
wait
# pxa Caddy 38.211.129.213
( run 38.211.129.213 focusconcursos.com.br pxa_fc "000" ) & sleep 8
wait
# GoCache edge 170.82.173.30
( run 170.82.173.30 focusconcursos.com.br gocache_fc "000" ) & sleep 8
( run 170.82.173.30 grupofocus.com.br gocache_gf "000" ) & sleep 8
wait
echo "ALL VHOST FFUF DONE $(date -u +%FT%TZ)" >> vhosts_ffuf2_run.log
