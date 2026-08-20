#!/usr/bin/env python3
"""2captcha helpers — Turnstile (visible + invisible) solving.
Key is read from ~/.config/opencode/.2captcha_key (chmod 600). NEVER print it.
"""
import sys, os, time, json, urllib.request, urllib.parse

KEY_FILE = os.path.expanduser("~/.config/opencode/.2captcha_key")
def _key():
    return open(KEY_FILE).read().strip()

API = "https://2captcha.com/in.php"
RES = "https://2captcha.com/res.php"

def submit_turnstile(sitekey, pageurl, action=None, cdata=None, invisible=False, useragent=None):
    """Submit a Turnstile task. Returns captcha_id."""
    task = {
        "type": "TurnstileTaskProxyless" if not invisible else "TurnstileTaskProxyless",
        "websiteURL": pageurl,
        "websiteKey": sitekey,
    }
    if action: task["action"] = action
    if cdata: task["cData"] = cdata
    if useragent: task("userAgent", useragent)  # noqa
    data = {"clientKey": _key(), "task": task}
    req = urllib.request.Request("https://api.2captcha.com/createTask",
                                 data=json.dumps(data).encode(),
                                 headers={"Content-Type":"application/json"})
    r = json.loads(urllib.request.urlopen(req, timeout=30).read())
    if r.get("errorId"):
        raise RuntimeError("2captcha createTask error: %s" % r.get("errorDescription", r))
    return r["taskId"]

def poll_turnstile(task_id, timeout=180, interval=4):
    t0 = time.time()
    while time.time() - t0 < timeout:
        data = {"clientKey": _key(), "taskId": task_id}
        req = urllib.request.Request("https://api.2captcha.com/getTaskResult",
                                     data=json.dumps(data).encode(),
                                     headers={"Content-Type":"application/json"})
        r = json.loads(urllib.request.urlopen(req, timeout=30).read())
        if r.get("errorId"):
            raise RuntimeError("2captcha getTaskResult error: %s" % r.get("errorDescription", r))
        if r.get("status") == "ready":
            return r["solution"]["token"]
        time.sleep(interval)
    raise TimeoutError("2captcha timeout for task %s" % task_id)

def solve_turnstile(sitekey, pageurl, action=None, cdata=None, invisible=False, useragent=None,
                    timeout=180):
    tid = submit_turnstile(sitekey, pageurl, action=action, cdata=cdata, invisible=invisible,
                           useragent=useragent)
    return poll_turnstile(tid, timeout=timeout)

if __name__ == "__main__":
    ap=sys.argv
    if len(ap)<3:
        print("usage: twocaptcha.py <sitekey> <pageurl> [action] [cdata]"); sys.exit(1)
    sitekey, pageurl = ap[1], ap[2]
    action = ap[3] if len(ap)>3 else None
    cdata = ap[4] if len(ap)>4 else None
    tok = solve_turnstile(sitekey, pageurl, action=action, cdata=cdata)
    print(tok)
