#!/usr/bin/env python3
"""Cloudflare bypass via 2Captcha + cloudscraper."""
import sys, json, time, os
sys.path.insert(0, '/home/ubuntu/tools-venv/lib/python3.12/site-packages')

from twocaptcha import TwoCaptcha
import cloudscraper

API_KEY = open(os.path.expanduser('~/.config/opencode/.2captcha_key')).read().strip()
solver = TwoCaptcha(API_KEY)

def solve_cf(url, sitekey=None, pageurl=None):
    """Resolve Cloudflare Turnstile / reCAPTCHA via 2Captcha."""
    try:
        if sitekey:
            result = solver.turnstile(
                sitekey=sitekey,
                url=pageurl or url,
            )
        else:
            # Try reCAPTCHA v2
            result = solver.recaptcha(
                sitekey=sitekey or '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
                url=pageurl or url,
            )
        return result
    except Exception as e:
        print(f"[!] Erro solve_cf: {e}", file=sys.stderr)
        return None

def test_bypass():
    scraper = cloudscraper.create_scraper(
        browser={'browser': 'chrome', 'platform': 'windows', 'mobile': False}
    )
    url = 'https://nerix.com.br/'
    r = scraper.get(url, timeout=30, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    })
    print(f"Status: {r.status_code}")
    print(f"Server: {r.headers.get('server','?')}")
    print(f"CF-Ray: {r.headers.get('cf-ray','?')}")
    print(f"Body length: {len(r.text)}")
    if 'Just a moment' in r.text or 'Checking your browser' in r.text:
        print("[!] Cloudflare challenge detectado — precisa de 2Captcha Turnstile")
    elif r.status_code == 200:
        print("[+] Bypass OK! Acessou o conteúdo.")
        with open('/tmp/cf_bypass_test.html', 'w') as f:
            f.write(r.text)
        return True
    return False

if __name__ == '__main__':
    print(f"2Captcha Balance: ${solver.balance():.2f}")
    test_bypass()
