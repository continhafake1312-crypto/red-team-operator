#!/bin/bash
# resolve all subdomains via DoH (Cloudflare) through Tor.
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/passive || exit 9
UA="Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
doh_resolve() {
  local name="$1"
  local O C
  O=$(curl -s --socks5-hostname 127.0.0.1:9050 --max-time 40 \
      -H "accept: application/dns-json" -A "$UA" \
      "https://cloudflare-dns.com/dns-query?name=${name}&type=A")
  C=$(echo "$O" | jq -r 'if .Status==0 then ((.Answer // []) | map(if .type==5 then .data + " [CNAME]" elif .type==1 then .data end) | join(" ")) else "NXDOMAIN/status:"+(.Status|tostring) end' 2>/dev/null)
  echo "${name} :: $C"
}
export -f doh_resolve
export UA
xargs -a subdomains_all.txt -P 12 -I '{}' bash -c 'doh_resolve "$@"' _ '{}' > dns_raw/research_resolved.txt 2>/dev/null
sort dns_raw/research_resolved.txt -o dns_raw/research_resolved.txt
wc -l dns_raw/research_resolved.txt
