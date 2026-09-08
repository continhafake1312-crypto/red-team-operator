#!/bin/bash
# drive_scans.sh — fila serial de portscans via Tor (OPSEC: proxychains)
# topo1000 rustscan + nmap -sV --open em portas achadas; sem UDP (Tor TCP-only)
PC="proxychains4 -q -f /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active/proxychains_tor.conf"
D=/home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
scan_host() {
  local ip=$1 tag=$2
  echo "[`date -u +%FT%TZ`] rustscan top1000 -> $tag ($ip)"
  $PC rustscan -a $ip --ulimit 5000 -b 250 -t 4000 --top --scan-order Serial 2>&1 > $D/rustscan_${tag}.log
  # extrair portas abertas (formato rustscan: Open <ip>:<port>)
  ports=$(grep -oE '\b[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+' $D/rustscan_${tag}.log | cut -d: -f2 | sort -un | tr '\n' ',' | sed 's/,$//')
  echo "[`date -u +%FT%TZ`] OPEN ($tag): $ports"
  echo "$ports" > $D/ports_open_${tag}.txt
  if [ -n "$ports" ]; then
    echo "[`date -u +%FT%TZ`] nmap -sV --open -> $tag ports=$ports"
    $PC nmap -sT -Pn -T4 --max-rate 60 --open -n -oA $D/nmap_${tag} -p $ports $ip 2>&1 > $D/nmap_stdout_${tag}.txt
  fi
}
for pair in \
  "54.86.140.91 alb1_54.86.140.91" \
  "98.84.85.83 alb2_98.84.85.83" \
  "18.233.104.160 go_18.233.104.160" \
  "34.230.151.3 ec2_34.230.151.3" \
  "38.211.129.213 pxa_38.211.129.213" \
  "44.215.153.56 alb1_44.215.153.56" \
  "13.216.227.217 alb1_13.216.227.217" \
  "100.52.7.228 alb2_100.52.7.228" \
  ; do scan_host $pair; done
echo "[`date -u +%FT%TZ`] SCANS DONE"
