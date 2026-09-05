const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs=require('fs');
(async () => {
  const browser = await puppeteer.launch({
    headless:'new', executablePath:'/usr/bin/chromium-browser',
    args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-blink-features=AutomationControlled',
      '--disable-features=site-per-process,IsolateOrigins',
      '--proxy-server=socks5://127.0.0.1:9050','--window-size=1920,1080','--lang=en-US,en']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6723.70 Safari/537.36');
  await page.setViewport({width:1920,height:1080});
  await page.evaluateOnNewDocument(()=>{ Object.defineProperty(navigator,'webdriver',{get:()=>undefined}); });
  page.on('console', m=>{ const t=m.text(); if(t.includes('TS_')||t.includes('cf_')||t.includes('challenge')) console.log('  [page]',t.slice(0,200)); });
  console.log('[1] loading...');
  await page.goto('https://www.dfg.com.br/', {waitUntil:'domcontentloaded', timeout:60000}).catch(e=>console.log('goto',e.message));
  await new Promise(r=>setTimeout(r,4000));
  let solved=false;
  for (let i=0;i<30;i++){
    // find turnstile iframe and click checkbox
    try {
      const frames = page.frames();
      for (const f of frames){
        if (f.url().includes('challenges.cloudflare.com')){
          // try to find clickable element (checkbox shadow dom or label)
          try {
            const box = await f.boundingBox();
            // click center of the iframe
            if (box){ await page.mouse.move(box.x+box.width/2, box.y+box.height/2); await page.mouse.click(box.x+box.width/2, box.y+box.height/2); console.log('  clicked iframe center @ t='+i+'s'); }
          } catch(e){}
          // also try clicking inside the frame directly
          try {
            const el = await f.$('input[type=checkbox]') || await f.$('[type=checkbox]') || await f.$('#challenge-stage') || await f.$('label');
            if (el){ await el.click({delay:80}); console.log('  clicked element in frame @ t='+i+'s'); }
          } catch(e){}
        }
      }
    } catch(e){}
    await new Promise(r=>setTimeout(r,1500));
    const cookies = await page.cookies();
    if (cookies.find(c=>c.name==='cf_clearance')){ console.log('  cf_clearance SET @ t='+(i*1.5)+'s!'); solved=true; break; }
    if (i%4===3){ const title=await page.title().catch(()=>''); console.log('  t='+(i*1.5)+'s title="'+title+'"'); }
  }
  const cookies=await page.cookies(); fs.writeFileSync('cookies_click.json', JSON.stringify(cookies,null,2));
  console.log('[2] solved='+solved+' cookies:', cookies.map(c=>c.name).join(','));
  if (solved){
    console.log('[3] test /api/public/users/1');
    const r=await page.goto('https://www.dfg.com.br/api/public/users/1',{waitUntil:'domcontentloaded',timeout:30000}).catch(e=>{console.log('nav',e.message);return null;});
    const t=await page.evaluate(()=>document.body.innerText).catch(()=>'');
    console.log('  ['+(r?r.status():'?')+'] '+t.slice(0,500));
    fs.writeFileSync('users_1_click.json', t);
  }
  await browser.close();
})();
