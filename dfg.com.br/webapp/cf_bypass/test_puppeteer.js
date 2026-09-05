const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: [
      '--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--proxy-server=socks5://127.0.0.1:9050',
      '--window-size=1920,1080'
    ]
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
  await page.setViewport({width:1920,height:1080});
  try {
    const resp = await page.goto('https://www.dfg.com.br/', {waitUntil:'domcontentloaded', timeout:60000});
    console.log('INITIAL status:', resp ? resp.status() : 'null', 'url:', page.url());
    // wait for challenge to resolve
    await new Promise(r=>setTimeout(r,15000));
    console.log('AFTER 15s status: url=', page.url());
    const title = await page.title().catch(()=>'<err>');
    console.log('TITLE:', title);
    const bodyLen = (await page.content()).length;
    console.log('BODY len:', bodyLen);
    const cookies = await page.cookies();
    console.log('COOKIES:', JSON.stringify(cookies.map(c=>c.name+'='+c.value.slice(0,12)+'...')));
  } catch(e) { console.log('ERR', e.message); }
  await browser.close();
})();
