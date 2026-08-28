#!/bin/bash
# Vhost fuzz em TODOS IPs de origem real — soultv.com.br
# Testa cada IP com cada Host header, compara com baseline (sem Host)
OUTDIR="/home/ubuntu/engagement/soultv.com.br/recon/active/vhost_results"
mkdir -p "$OUTDIR"

IPS=(
  "160.202.130.243|video02.soultv.com.br"
  "189.1.168.171|srt01.soultv.com.br"
  "198.178.126.25|video.soultv.com.br"
  "34.95.200.150|video01.soultv.com.br"
  "185.199.108.111|testad.soultv.com.br"
  "185.199.109.153|testad-alt.soultv.com.br"
  "185.199.110.153|testad-alt2.soultv.com.br"
  "185.199.111.153|testad-alt3.soultv.com.br"
)

HOSTS=(
  "soultv.com.br"
  "www.soultv.com.br"
  "app.soultv.com.br"
  "web.soultv.com.br"
  "stage.soultv.com.br"
  "cms.soultv.com.br"
  "api-tcommerce.soultv.com.br"
  "tcommerce.soultv.com.br"
  "pay.soultv.com.br"
  "ppv.soultv.com.br"
  "grade.soultv.com.br"
  "interaction.soultv.com.br"
  "legendas.soultv.com.br"
  "ads-policy.soultv.com.br"
  "reports.soultv.com.br"
  "tv.soultv.com.br"
  "media.soultv.com.br"
  "video.soultv.com.br"
  "video01.soultv.com.br"
  "video02.soultv.com.br"
  "srt01.soultv.com.br"
  "player.soultv.com.br"
  "cast.soultv.com.br"
  "logicahost.com.br"
  "video06.logicahost.com.br"
  "www.logicahost.com.br"
  "*.logicahost.com.br"
)

echo "[+] Vhost fuzz iniciado: $(date)" | tee -a "$OUTDIR/summary.txt"

for ip_entry in "${IPS[@]}"; do
  IP="${ip_entry%%|*}"
  LABEL="${ip_entry##*|}"
  
  echo "--- Testing IP: $IP ($LABEL) ---" | tee -a "$OUTDIR/summary.txt"
  
  # Get baseline (no Host header)
  BASELINE=$(proxychains4 curl -s -o /dev/null -w "%{http_code}:%{size_download}:%{content_type}" --connect-timeout 5 --max-time 10 "http://$IP/" 2>/dev/null)
  BASELINE_HTTPS=$(proxychains4 curl -sk -o /dev/null -w "%{http_code}:%{size_download}:%{content_type}" --connect-timeout 5 --max-time 10 "https://$IP/" 2>/dev/null)
  echo "Baseline HTTP: $BASELINE | HTTPS: $BASELINE_HTTPS" | tee -a "$OUTDIR/summary.txt"
  
  for HOST in "${HOSTS[@]}"; do
    # HTTP test
    RESULT_HTTP=$(proxychains4 curl -s -o /dev/null -w "%{http_code}:%{size_download}" -H "Host: $HOST" --connect-timeout 5 --max-time 10 "http://$IP/" 2>/dev/null)
    HTTP_CODE="${RESULT_HTTP%%:*}"
    HTTP_SIZE="${RESULT_HTTP##*:}"
    
    # HTTPS test
    RESULT_HTTPS=$(proxychains4 curl -sk -o /dev/null -w "%{http_code}:%{size_download}" -H "Host: $HOST" --connect-timeout 5 --max-time 10 "https://$IP/" 2>/dev/null)
    HTTPS_CODE="${RESULT_HTTPS%%:*}"
    HTTPS_SIZE="${RESULT_HTTPS##*:}"
    
    # Check if different from baseline
    if [[ "$HTTP_CODE" != "000" && "$HTTP_CODE" != "404" && "$RESULT_HTTP" != "$BASELINE" ]]; then
      echo "VHOST FOUND [HTTP] $IP -> $HOST: $RESULT_HTTP" | tee -a "$OUTDIR/summary.txt"
      echo "VHOST FOUND [HTTP] $IP -> $HOST: $RESULT_HTTP" >> "$OUTDIR/vhost_found.txt"
      # Save body for analysis
      proxychains4 curl -s -H "Host: $HOST" --connect-timeout 5 --max-time 10 "http://$IP/" 2>/dev/null | head -c 2000 > "$OUTDIR/vhost_${IP}_${HOST}_http.html" &
    fi
    
    if [[ "$HTTPS_CODE" != "000" && "$HTTPS_CODE" != "404" && "$RESULT_HTTPS" != "$BASELINE_HTTPS" ]]; then
      echo "VHOST FOUND [HTTPS] $IP -> $HOST: $RESULT_HTTPS" | tee -a "$OUTDIR/summary.txt"
      echo "VHOST FOUND [HTTPS] $IP -> $HOST: $RESULT_HTTPS" >> "$OUTDIR/vhost_found.txt"
      proxychains4 curl -sk -H "Host: $HOST" --connect-timeout 5 --max-time 10 "https://$IP/" 2>/dev/null | head -c 2000 > "$OUTDIR/vhost_${IP}_${HOST}_https.html" &
    fi
  done
  echo "" | tee -a "$OUTDIR/summary.txt"
done

echo "[+] Vhost fuzz completo: $(date)" | tee -a "$OUTDIR/summary.txt"

# Consolidate unique findings
if [ -f "$OUTDIR/vhost_found.txt" ]; then
  echo "=== CONSOLIDATED VHOST FINDINGS ===" | tee -a "$OUTDIR/vhost_found.txt"
  sort -u "$OUTDIR/vhost_found.txt" | tee -a "$OUTDIR/vhost_found.txt"
fi