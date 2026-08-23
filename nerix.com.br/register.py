#!/usr/bin/env python3
"""Attempt to register on nerix.com.br"""
import asyncio, json, sys, os
sys.path.insert(0, '/home/ubuntu/tools-venv/lib/python3.12/site-packages')
from twocaptcha import TwoCaptcha
from playwright.async_api import async_playwright

API_KEY = open(os.path.expanduser('~/.config/opencode/.2captcha_key')).read().strip()
solver = TwoCaptcha(API_KEY)
SITEKEY = '0x4AAAAAACDTiti-ppzGwnYb'

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        ctx = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        )
        page = await ctx.new_page()
        resp = await page.goto('https://api.nerix.com.br/api/v1', wait_until='load', timeout=30000)
        print(f'Session: {resp.status}')
        
        try:
            result = solver.turnstile(sitekey=SITEKEY, url='https://nerix.com.br/register')
            token = result['code']
            print(f'Turnstile token: {token[:60]}...')
        except Exception as e:
            print(f'Turnstile error: {e}')
            return
        
        register_data = {
            'name': 'PentestFinal',
            'username': 'pentestfinal',
            'email': 'pentest_final_17395@proton.me',
            'password': 'P3nt3st!2026#Strong',
            'password_confirmation': 'P3nt3st!2026#Strong',
            'whatsapp': '5521999999999',
            'turnstile_token': token
        }
        
        js_code = """
        async () => {
            const params = %s;
            const resp = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(params)
            });
            return {
                status: resp.status,
                body: await resp.text(),
                headers: Object.fromEntries(resp.headers.entries())
            };
        }
        """ % json.dumps(register_data)
        
        result = await page.evaluate(js_code)
        
        print(f'Status: {result["status"]}')
        print(f'Body: {result["body"][:500]}')
        
        headers = result.get('headers', {})
        print(f'RateLimit-Remaining: {headers.get("ratelimit-remaining", "?")}')
        
        if result['status'] in [200, 201]:
            data = json.loads(result['body'])
            print(f'\nSUCCESS! Token: {data.get("token", "N/A")[:80]}')
            print(f'Full response:\n{json.dumps(data, indent=2)[:1000]}')
        elif result['status'] == 429:
            data = json.loads(result['body'])
            print(f'RATE LIMITED: {data}')
        
        await browser.close()

asyncio.run(main())