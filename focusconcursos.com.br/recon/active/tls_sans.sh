#!/bin/bash
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/active
echo "==TLS/SAN capture $(date -u +%FT%TZ) — openssl s_client -proxy 127.0.0.1:8118 (privoxy->Tor)" > tls_summary.txt
pairs="54.86.140.91 admin.focusconcursos.com.br
54.86.140.91 lms.focusconcursos.com.br
54.86.140.91 mobile.focusconcursos.com.br
54.86.140.91 payment.focusconcursos.com.br
54.86.140.91 integration.focusconcursos.com.br
54.86.140.91 crm.focusconcursos.com.br
54.86.140.91 apilms.focusconcursos.com.br
54.86.140.91 focusonline.com.br
54.86.140.91 none-sni
98.84.85.83 www3.focusconcursos.com.br
98.84.85.83 apex.grupofocus.com.br
98.84.85.83 focus.grupofocus.com.br
98.84.85.83 media.grupofocus.com.br
98.84.85.83 static.grupofocus.com.br
98.84.85.83 prod.grupofocus.com.br
98.84.85.83 s3.grupofocus.com.br
98.84.85.83 ead.grupofocus.com.br
98.84.85.83 noticias.grupofocus.com.br
18.233.104.160 noticias.focusconcursos.com.br
18.233.104.160 vc.focusconcursos.com.br
18.233.104.160 apilms.focusconcursos.com.br
18.233.104.160 grupofocus.com.br
34.230.151.3 wwwdev.focusconcursos.com.br
38.211.129.213 pxa.focusconcursos.com.br
13.227.47.21 focusconcursos.com.br
170.82.173.30 cdn.focusconcursos.com.br
170.82.173.30 cdn.grupofocus.com.br"
while read -r ip sni; do
  [ -z "$ip" ] && continue
  echo "---- $ip SNI=$sni ----" >> tls_summary.txt
  if [ "$sni" = "none-sni" ]; then
    timeout 25 openssl s_client -proxy 127.0.0.1:8118 -connect ${ip}:443 -brief </dev/null 2>&1 | head -12 >> tls_summary.txt
  else
    timeout 25 openssl s_client -proxy 127.0.0.1:8118 -connect ${ip}:443 -servername "$sni" -brief </dev/null 2>&1 | head -12 >> tls_summary.txt
  fi
  echo "" >> tls_summary.txt
done <<< "$pairs"
# Full cert dump w/ SAN
: > tls_full_san.txt
while read -r ip sni; do
  [ -z "$ip" ] && continue
  echo "===== $ip / $sni =====" >> tls_full_san.txt
  if [ "$sni" = "none-sni" ]; then
    timeout 25 openssl s_client -proxy 127.0.0.1:8118 -connect ${ip}:443 </dev/null 2>&1 | grep -E '^subject=|^issuer=|Alternative|^  [[:space:]]*DNS:' | head -10 >> tls_full_san.txt
  else
    timeout 25 openssl s_client -proxy 127.0.0.1:8118 -connect ${ip}:443 -servername "$sni" </dev/null 2>&1 | grep -E '^subject=|^issuer=|Alternative|^  [[:space:]]*DNS:' | head -14 >> tls_full_san.txt
  fi
done <<< "$pairs"
echo "TLS DONE $(date -u +%FT%TZ)" >> scans_status.log
