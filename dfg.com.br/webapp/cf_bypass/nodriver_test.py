import nodriver as uc
import asyncio
async def main():
  browser = await uc.start(
    browser_executable_path='/usr/bin/chromium-browser',
    browser_args=['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage',
      '--proxy-server=socks5://127.0.0.1:9050','--lang=en-US,en','--window-size=1920,1080']
  )
  page = await browser.get('https://www.dfg.com.br/', new_tab=True)
  await asyncio.sleep(8)
  print('title:', await page.evaluate('document.title'))
  print('url:', page.url)
  cookies = await browser.cookies.get_all()
  print('cookies:', [(c.name,c.value[:15]) for c in cookies])
  await browser.stop()
asyncio.run(main())
