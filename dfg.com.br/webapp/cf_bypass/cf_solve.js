const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6723.70 Safari/537.36';
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled','--disable-features=IsolateOrigins,site-per-process',
      '--proxy-server=socks5://127.0.0.1:9050','--window-size=1920,1080',
      '--lang=en-US,en']
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(()=>{ Object.defineProperty(navigator,'webdriver',{get:()=>undefined}); });
  await page.setUserAgent(UA);
  await page.setViewport({width:1920,height:1080});
  page.on('console', m=>console.log('CONSOLE:', m.type(), m.text().slice(0,200)));
  const t0=Date.now();
  try {
    const resp = await page.goto('https://www.dfg.com.br/', {waitUntil:'domcontentloaded', timeout:60000});
    console.log('INITIAL:', resp?resp.status():'null','url:',page.url());
    // poll for challenge resolution up to 40s
    let solved=false;
    for (let i=0;i<20;i++){
      await new Promise(r=>setTimeout(r,2000));
      const title = await page.title().catch(()=>'<err>');
      const url = page.url();
      if(!title.includes('Just a moment') && !title.includes('moment')){
        console.log(`SOLVED at ${Date.now()-t0}ms title="${title}" url=${url}`);
        solved=true; break;
      }
      // try clicking turnstile checkbox if present
      try {
        const frames = page.frames();
        for (const f of frames){
          if (f.url().includes('challenges.cloudflare.com')){
            try {
              const cb = await f.$('input[type="checkbox"]');
              if (cb){ await cb.click({delay:100}); console.log('clicked turnstile checkbox'); }
            } catch(e){}
          }
        }
      } catch(e){}
      if (i%5===4) console.log(`wait ${Date.now()-t0}ms title="${title}"`);
    }
    if(!solved){
      console.log('NOT solved after 40s. title=', await page.title());
    }
    const cookies = await page.cookies();
    console.log('COOKIES:', JSON.stringify(cookies.map(c=>({n:c.name,v:c.value.slice(0,20),dom:c.domain}))));
    require('fs').writeFileSync('page_after_solve.html', await page.content());
    await browser.close();
  } catch(e){ console.log('ERR',e.message); await browser.close(); }
})();
