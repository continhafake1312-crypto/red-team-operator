#!/bin/bash
# Cloudflare bypass wrapper for tools
# Usage: ./cf_bypass.sh "https://target.com/path"
KEY=$(cat ~/.config/opencode/.2captcha_key)
python3 -c "
import sys
sys.path.insert(0, '/home/ubuntu/tools-venv/lib/python3.12/site-packages')
import cloudscraper, json
scraper = cloudscraper.create_scraper(
    browser={'browser': 'chrome', 'platform': 'windows', 'mobile': False},
    captcha={'provider': '2captcha', 'api_key': '$KEY'}
)
url = sys.argv[1]
r = scraper.get(url, timeout=60, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
})
print(json.dumps({'status': r.status_code, 'headers': dict(r.headers), 'body_len': len(r.text)}))
" "$@"
