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
  await page.evaluateOnNewDocument(()=>{
    window.__msgs=[];
    window.addEventListener('message',e=>{
      let d; try { d=JSON.stringify(e.data); } catch(x){ d=String(e.data); }
      window.__msgs.push({origin:e.origin, dir:'recv', data:d.slice(0,2000)});
    }, true);
  });
  // also enable CDP to capture console from iframe
  await page.goto('https://www.dfg.com.br/', {waitUntil:'domcontentloaded', timeout:60000}).catch(e=>console.log('goto',e.message));
  await new Promise(r=>setTimeout(r,7000));
  const chlopt = await page.evaluate(()=>{ try { return window._cf_chl_opt; } catch(e){ return {err:String(e)}; } }).catch(()=>({}));
  fs.writeFileSync('cf_chl_opt_obj.json', JSON.stringify(chlopt,null,1));
  // print full values of long string fields (candidates for cData/chlPageData/md)
  const o = chlopt;
  for (const k of Object.keys(o||{})){
    const v = o[k];
    if (typeof v==='string' && v.length>30) console.log(`### ${k} (len=${v.length}): ${v}`);
  }
  const msgs = await page.evaluate(()=>window.__msgs).catch(()=>[]);
  console.log('=== postMessages: '+msgs.length+' ===');
  for (const m of msgs) console.log(`[${m.origin}] ${m.data}`);
  fs.writeFileSync('postmessages.json', JSON.stringify(msgs,null,2));
  await browser.close();
})();
