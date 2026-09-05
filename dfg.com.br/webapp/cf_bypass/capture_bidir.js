const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs=require('fs');
(async () => {
  const browser = await puppeteer.launch({
    headless:'new', executablePath:'/usr/bin/chromium-browser',
    args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-blink-features=AutomationControlled','--disable-features=site-per-process,IsolateOrigins','--proxy-server=socks5://127.0.0.1:9050','--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6723.70 Safari/537.36');
  await page.evaluateOnNewDocument(()=>{
    window.__in=[]; window.__out=[];
    window.addEventListener('message',e=>{ let d;try{d=JSON.stringify(e.data)}catch(x){d=String(e.data)} window.__in.push({origin:e.origin,data:d.slice(0,3000)}); },true);
    // hook parent->iframe by wrapping contentWindow.postMessage on all iframes (poll)
    const wrapIframes=()=>{
      for (const f of document.querySelectorAll('iframe')){
        if (f.__wrapped) continue;
        f.__wrapped=true;
        try {
          const cw=f.contentWindow;
          if (cw && cw.postMessage && !cw.__pmWrapped){
            cw.__pmWrapped=true;
            const orig=cw.postMessage.bind(cw);
            cw.postMessage=function(data,origin){ let s;try{s=JSON.stringify(data)}catch(e){s=String(data)} window.__out.push({targetOrigin:origin,data:s.slice(0,3000)}); return orig(data,origin); };
          }
        }catch(e){}
      }
    };
    setInterval(wrapIframes, 10);
  });
  await page.goto('https://www.dfg.com.br/', {waitUntil:'domcontentloaded', timeout:60000}).catch(e=>console.log('goto',e.message));
  await new Promise(r=>setTimeout(r,9000));
  const o = await page.evaluate(()=>window._cf_chl_opt).catch(()=>({}));
  // dump nested objects
  for (const k of Object.keys(o||{})){
    const v=o[k];
    if (v && typeof v==='object'){ console.log(`### nested ${k}:`, JSON.stringify(v).slice(0,800)); }
  }
  const dat = await page.evaluate(()=>({in:window.__in, out:window.__out})).catch(()=>({in:[],out:[]}));
  console.log('=== IN (iframe->parent): '+dat.in.length+' ===');
  for (const m of dat.in) console.log('IN ['+m.origin+'] '+m.data);
  console.log('=== OUT (parent->iframe): '+dat.out.length+' ===');
  for (const m of dat.out) console.log('OUT ['+m.targetOrigin+'] '+m.data);
  fs.writeFileSync('bidir_msgs.json', JSON.stringify(dat,null,2));
  fs.writeFileSync('cf_chl_opt_obj2.json', JSON.stringify(o,null,1));
  await browser.close();
})();
