#!/bin/bash
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
WL=vhost_wordlist2.txt
PY=http://127.0.0.1:8118
UA="Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0"
run() { # ip domain out
  ip=$1; dom=$2; out=$3
  echo "[$(date -u +%FT%TZ)] ffuf3 $ip Host=FUZZ.$dom" >> vhosts_ffuf3_run.log
  ffuf -w $WL -u "http://$ip/" -H "Host: FUZZ.$dom" -H "User-Agent: $UA" \
    -x $PY -t 2 -p 0.3-1.0 -mc all -timeout 12 -maxtime 720 \
    -o "vhosts3_$out.json" 2>/dev/null > "vhosts3_$out.log"
  echo "[$(date -u +%FT%TZ)] ffuf3 done $out" >> vhosts_ffuf3_run.log
}
run 44.215.153.56 focusconcursos.com.br alb2 &
run 98.84.85.83 grupofocus.com.br nextjs_gf &
run 98.84.85.83 focusconcursos.com.br nextjs_fc &
wait
run 18.233.104.160 focusconcursos.com.br go18_fc &
run 98.84.85.83 focusconcursos.com.br nextjs_fc2 &   # retry if first was partial
wait
run 18.233.104.160 grupofocus.com.br go18_gf &
run 34.230.151.3 focusconcursos.com.br ec2_fc &
wait
run 38.211.129.213 focusconcursos.com.br pxa_fc &
run 170.82.173.30 focusconcursos.com.br gocache_fc &
wait
run 170.82.173.30 grupofocus.com.br gocache_gf &
run 34.230.151.3 grupofocus.com.br ec2_gf &
wait
echo "ALL VHOST FFUF3 DONE $(date -u +%FT%TZ)" >> vhosts_ffuf3_run.log
