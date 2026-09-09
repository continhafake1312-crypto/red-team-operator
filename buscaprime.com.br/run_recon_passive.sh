#!/bin/bash
# Recon Passivo + OSINT - buscaprime.com.br
set -e
cd /home/ubuntu/red-team-operator/buscaprime.com.br/recon/passive/

echo "=== Step 1: WHOIS ==="
whois buscaprime.com.br > dns_whois.txt 2>&1
echo "WHOIS done."

echo "=== Step 2: DNS Records ==="
echo "=== NS Records ===" > dns_records.txt
dig NS buscaprime.com.br +short >> dns_records.txt 2>&1
echo "=== MX Records ===" >> dns_records.txt
dig MX buscaprime.com.br +short >> dns_records.txt 2>&1
echo "=== TXT Records ===" >> dns_records.txt
dig TXT buscaprime.com.br +short >> dns_records.txt 2>&1
echo "=== A Records ===" >> dns_records.txt
dig A buscaprime.com.br +short >> dns_records.txt 2>&1
echo "=== AAAA Records ===" >> dns_records.txt
dig AAAA buscaprime.com.br +short >> dns_records.txt 2>&1
echo "=== CNAME Records ===" >> dns_records.txt
dig CNAME buscaprime.com.br +short >> dns_records.txt 2>&1
echo "=== AXFR (zone transfer) ===" >> dns_records.txt
for ns in $(dig NS buscaprime.com.br +short); do
  echo "Trying $ns..." >> dns_records.txt
  dig AXFR buscaprime.com.br @$ns +short >> dns_records.txt 2>&1
done
echo "DNS done."

echo "=== Step 3: Subdomains ==="
echo "Running subfinder..."
proxychains4 -q subfinder -d buscaprime.com.br -o subfinder.txt 2>&1
echo "Running assetfinder..."
assetfinder --subs-only buscaprime.com.br > assetfinder.txt 2>&1
echo "Running crt.sh..."
# Add protocol for crt.sh
curl -sS --max-time 30 "https://crt.sh/?q=%25.buscaprime.com.br&output=json" | jq -r '.[].name_value' | sort -u > crtsh.txt 2>&1
echo "Merging all subdomains..."
cat subfinder.txt assetfinder.txt crtsh.txt 2>/dev/null | sed 's/^\*\.//' | sort -u > subdomains_all.txt
echo "Total unique subdomains found: $(wc -l < subdomains_all.txt)"
echo "Resolving live subdomains..."
dnsx -l subdomains_all.txt -o subdomains_live.txt 2>&1
echo "Live subdomains: $(wc -l < subdomains_live.txt)"
echo "HTTP probe on live subdomains..."
proxychains4 -q httpx -l subdomains_live.txt -title -tech-detect -status-code -o httpx_live.txt 2>&1
echo "Subdomains done."

echo "=== Step 4: Tech Stack ==="
echo "=== WhatWeb buscaprime.com.br ===" > tech_stack.txt
proxychains4 -q whatweb https://buscaprime.com.br --log-verbose=/dev/stdout 2>&1 | head -50 >> tech_stack.txt
echo "" >> tech_stack.txt
echo "=== WAFW00F ===" >> tech_stack.txt
proxychains4 -q wafw00f https://buscaprime.com.br 2>&1 >> tech_stack.txt
echo "Tech stack done."

echo "=== Step 5: OSINT ==="
echo "Running theHarvester..."
proxychains4 -q theHarvester -d buscaprime.com.br -b all -f osint_theharvester.html 2>&1 | tee osint_emails.txt
echo "GitHub OSINT..."
curl -sS --max-time 15 "https://api.github.com/search/code?q=buscaprime.com.br" > osint_github.txt 2>&1
echo "OSINT done."

echo "=== Step 6: Wayback Machine ==="
echo "Fetching Wayback URLs..."
curl -sS --max-time 60 "https://web.archive.org/cdx/search/cdx?url=*.buscaprime.com.br&fl=original&collapse=urlkey&output=text" | sort -u > wayback_urls.txt 2>&1
echo "Total Wayback URLs: $(wc -l < wayback_urls.txt)"
grep -Ei '(api|admin|login|cpf|cnpj|backup|\.env|\.json|\.sql|senha|token|cred|user|password|secret|key|dados|consulta|search|query|export|download)' wayback_urls.txt > wayback_interesting.txt 2>&1
echo "Interesting Wayback URLs: $(wc -l < wayback_interesting.txt)"
echo "Wayback done."

echo "=== Step 7: Cloud Buckets ==="
echo "Testing cloud buckets..." > cloud_buckets.txt
for nome in buscaprime buscaprime-data buscaprime-backup buscaprime-prod buscaprime-dev buscaprime-app buscaprime-logs buscaprime-uploads buscaprime-assets buscaprime-storage buscaprime-public buscaprime-private; do
  echo -n "S3 $nome: " >> cloud_buckets.txt
  curl -sI --max-time 5 "https://$nome.s3.amazonaws.com" 2>&1 | head -1 >> cloud_buckets.txt
  echo "" >> cloud_buckets.txt
  echo -n "Azure $nome: " >> cloud_buckets.txt
  curl -sI --max-time 5 "https://$nome.blob.core.windows.net" 2>&1 | head -1 >> cloud_buckets.txt
  echo "" >> cloud_buckets.txt
done
echo "Cloud buckets done."

echo "=== Step 8: Subdomain Takeover Check ==="
echo "Checking SUBdomain takeover candidates..." > takeover_candidates.txt
cat subdomains_all.txt 2>/dev/null | grep -E '(s3|heroku|github|unbounce|tumblr|wordpress|squarespace|cloudfront|azureedge|netlify|amplify|firebase|pages\.dev|fly\.dev|render|railway)' >> takeover_candidates.txt 2>&1
echo "Takeover check done."

echo "=== ALL RECON PASSIVE COMPLETE ==="
