#!/usr/bin/env python3
import sys, json, time, urllib.request, urllib.parse
KEY=open('/home/ubuntu/.config/opencode/.2captcha_key').read().strip()
API='https://api.2captcha.com'
def post(path, data):
  req=urllib.request.Request(API+path, data=json.dumps(data).encode(),
    headers={'Content-Type':'application/json'})
  try:
    return json.load(urllib.request.urlopen(req, timeout=60))
  except Exception as e:
    return {'error':str(e)}
def create_turnstile(url, sitekey, action=None, useragent=None):
  task={'type':'TurnstileTaskProxyless','websiteURL':url,'websiteKey':sitekey}
  if action: task['action']=action
  if useragent: task['userAgent']=useragent
  return post('/createTask', {'clientKey':KEY,'task':task})
def result(id, timeout=180):
  t0=time.time()
  while time.time()-t0<timeout:
    r=post('/getTaskResult', {'clientKey':KEY,'taskId':id})
    if r.get('status')=='ready': return r
    if r.get('errorId'): return r
    time.sleep(4)
  return {'error':'timeout'}
if __name__=='__main__':
  op=sys.argv[1] if len(sys.argv)>1 else 'solve'
  url='https://www.dfg.com.br/'
  sk='0x4AAAAAAADnPIDROrmt1Wwj'
  ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6723.70 Safari/537.36'
  if op=='solve':
    c=create_turnstile(url, sk, useragent=ua)
    print('CREATE:', json.dumps(c)[:400])
    if c.get('taskId'):
      r=result(c['taskId'], timeout=180)
      print('RESULT:', json.dumps(r)[:600])
  elif op=='balance':
    print(post('/getBalance', {'clientKey':KEY}))
