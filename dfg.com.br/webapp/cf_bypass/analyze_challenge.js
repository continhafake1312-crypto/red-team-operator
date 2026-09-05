const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--proxy-server=socks5://127.0.0.1:9050','--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
  await page.setViewport({width:1920,height:1080});
  await page.goto('https://www.dfg.com.br/', {waitUntil:'networkidle2', timeout:60000}).catch(e=>console.log('goto err',e.message));
  await new Promise(r=>setTimeout(r,8000));
  const html = await page.content();
  require('fs').writeFileSync('challenge_full.html', html);
  // find turnstile sitekey
  const m1 = html.match(/data-sitekey="([^"]+)"/);
  const m2 = html.match(/turnstile[\s\S]{0,200}sitekey["':\s]+([0-9a-zA-Z_-]+)/i);
  const m3 = html.match(/0x[0-9a-zA-Z_-]{20,}/);
  console.log('sitekey data-sitekey:', m1?m1[1]:'none');
  console.log('sitekey turnstile:', m2?m2[1]:'none');
  console.log('sitekey 0x:', m3?m3[0]:'none');
  // iframes
  const frames = page.frames().map(f=>f.url());
  console.log('FRAMES:', JSON.stringify(frames,null,1));
  // look for cf-challenge script
  const scripts = await page.evaluate(()=>Array.from(document.scripts).map(s=>s.src).filter(Boolean));
  console.log('SCRIPTS:', JSON.stringify(scripts));
  console.log('TITLE:', await page.title());
  await browser.close();
})();
