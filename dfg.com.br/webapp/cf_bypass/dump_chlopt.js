const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs=require('fs');
(async () => {
  const browser = await puppeteer.launch({
    headless:'new', executablePath:'/usr/bin/chromium-browser',
    args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-blink-features=AutomationControlled','--proxy-server=socks5://127.0.0.1:9050','--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6723.70 Safari/537.36');
  // capture all postMessages and the iframe url
  await page.evaluateOnNewDocument(()=>{
    window.__msgs=[]; window.__origPM=window.postMessage;
    window.addEventListener('message',e=>{ window.__msgs.push({origin:e.origin,data:String(e.data).slice(0,300)}); }, true);
  });
  await page.goto('https://www.dfg.com.br/', {waitUntil:'domcontentloaded', timeout:60000}).catch(e=>console.log('goto',e.message));
  await new Promise(r=>setTimeout(r,6000));
  const chlopt = await page.evaluate(()=>{ try { return JSON.stringify(window._cf_chl_opt); } catch(e){ return 'ERR:'+e; } }).catch(()=>'<err>');
  fs.writeFileSync('cf_chl_opt_full.json', chlopt);
  console.log('_cf_chl_opt len:', chlopt.length);
  // print keys + short values
  try {
    const o = JSON.parse(chlopt);
    for (const k of Object.keys(o)) {
      let v = String(o[k]); if (v.length>120) v=v.slice(0,120)+'...('+v.length+')';
      console.log(`  ${k} = ${v}`);
    }
  } catch(e){ console.log('parse err', e.message, chlopt.slice(0,400)); }
  const msgs = await page.evaluate(()=>window.__msgs).catch(()=>[]);
  console.log('=== postMessages ('+msgs.length+') ===');
  for (const m of msgs.slice(0,15)) console.log('  ', m.origin, '|', m.data);
  const frames = page.frames().map(f=>f.url());
  console.log('=== frames ===');
  for (const f of frames) console.log('  ', f.slice(0,150));
  fs.writeFileSync('iframe_urls.txt', frames.join('\n'));
  await browser.close();
})();
