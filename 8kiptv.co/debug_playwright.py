#!/usr/bin/env python3
"""Debug: o que o Playwright ve quando acessa o WHMCS admin"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage',
                  '--proxy-server=socks5://127.0.0.1:9050']
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
            ignore_https_errors=True,
        )
        page = await context.new_page()
        
        print("[*] Acessando WHMCS admin...")
        try:
            await page.goto("https://68.65.122.227/clients/admin/login.php",
                          wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(5000)
            
            title = await page.title()
            url = page.url
            print(f"[+] URL: {url}")
            print(f"[+] Title: {title}")
            
            # Screenshot
            await page.screenshot(path="/home/ubuntu/8kiptv.co/debug_admin_page.png", full_page=True)
            
            # HTML content (first 2000 chars)
            content = await page.content()
            print(f"[+] HTML size: {len(content)}")
            print(f"[+] First 1000 chars:")
            print(content[:1000])
            
            # Check for specific elements
            has_login_form = await page.query_selector('form[action*="dologin"]')
            print(f"\n[+] Has login form: {has_login_form is not None}")
            
            has_js_challenge = "Please wait" in content or "verification" in content.lower()
            print(f"[+] Has JS Challenge: {has_js_challenge}")
            
            has_banned = "banned" in content.lower()
            print(f"[+] Has banned: {has_banned}")
            
            has_imunify = "imunify" in content.lower()
            print(f"[+] Has Imunify: {has_imunify}")
            
            # Find all input fields
            inputs = await page.query_selector_all('input')
            print(f"[+] Input fields: {len(inputs)}")
            for inp in inputs:
                name = await inp.get_attribute('name')
                typ = await inp.get_attribute('type')
                print(f"    - name={name}, type={typ}")
            
        except Exception as e:
            print(f"[-] Error: {e}")
            # Try screenshot even on error
            try:
                await page.screenshot(path="/home/ubuntu/8kiptv.co/debug_error.png")
            except:
                pass
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())