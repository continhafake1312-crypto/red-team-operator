#!/bin/bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
while read h; do
  echo "===== $h ====="
  # DNS
  ip=$(dig +short $h A @1.1.1.1 | head -1)
  echo "DNS A: ${ip:-NXDOMAIN}"
  # HTTPS probe
  resp=$(curl -sS -m 30 -k --proxy socks5://127.0.0.1:9050 -A "$UA" -D /tmp/hdr_$$ -o /tmp/body_$$ -w "HTTPCODE=%{http_code} SIZE=%{size_download} REDIR=%{redirect_url}" "https://$h/" 2>&1)
  echo "HTTPS: $resp"
  echo "--- headers ---"
  grep -iE '^(server|x-powered|set-cookie|location|cf-ray|content-type|www-authenticate)' /tmp/hdr_$$ 2>/dev/null | head -8
  echo "--- title ---"
  grep -oiE '<title>[^<]*</title>' /tmp/body_$$ 2>/dev/null | head -1
  sleep 2
done < /tmp/dso_subdomains.txt
rm -f /tmp/hdr_$$ /tmp/body_$$
