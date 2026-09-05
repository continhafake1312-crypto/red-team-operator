const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const https = require('https');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6723.70 Safari/537.36';
const KEY = fs.readFileSync('/home/ubuntu/.config/opencode/.2captcha_key','utf8').trim();
function httpPost(host,path,body){return new Promise((res,rej)=>{const r=https.request({host,path,method:'POST',headers:{'Content-Type':'application/json'}},x=>{let d='';x.on('data',c=>d+=c);x.on('end',()=>{try{res(JSON.parse(d))}catch(e){res({raw:d})}})});r.on('error',rej);r.write(JSON.stringify(body));r.end();});}
async function solve(url,sk,act,dat,pd,ua){const t={type:'TurnstileTaskProxyless',websiteURL:url,websiteKey:sk,action:act,data:dat,pagedata:pd,userAgent:ua};const c=await httpPost('api.2captcha.com','/createTask',{clientKey:KEY,task:t});console.log('  [2cap] create:',JSON.stringify(c).slice(0,180));if(c.errorId)throw new Error('create:'+c.errorDescription);const t0=Date.now();while(Date.now()-t0<200000){await new Promise(r=>setTimeout(r,4000));const g=await httpPost('api.2captcha.com','/getTaskResult',{clientKey:KEY,taskId:c.taskId});if(g.status==='ready')return g.solution;if(g.errorId)throw new Error('get:'+g.errorDescription);}throw new Error('timeout');}

(async () => {
  const browser = await puppeteer.launch({
    headless:'new', executablePath:'/usr/bin/chromium-browser',
    args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-blink-features=AutomationControlled','--proxy-server=socks5://127.0.0.1:9050','--window-size=1920,1080','--lang=en-US,en']
  });
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({width:1920,height:1080});
  await page.evaluateOnNewDocument(()=>{
    Object.defineProperty(navigator,'webdriver',{get:()=>undefined});
    // robust interceptor: poll + defineProperty on turnstile.render
    window.__tsParams=null; window.__tsCallback=null; window.__tsLog=[];
    let installed=false;
    const tryInstall=()=>{
      if (installed) return;
      if (window.turnstile && window.turnstile.render) {
        installed=true;
        const orig=window.turnstile.render;
        Object.defineProperty(window.turnstile,'render',{configurable:true,writable:true,value:function(a,b){
          window.__tsParams={sitekey:b&&b.sitekey,cData:b&&b.cData,chlPageData:b&&b.chlPageData,action:b&&b.action};
          window.__tsCallback=b&&b.callback;
          window.__tsLog.push('render called sitekey='+(b&&b.sitekey)+' cData='+((b&&b.cData||'').slice(0,20))+' action='+(b&&b.action));
          return 'foo';
        }});
        window.__tsLog.push('turnstile.render overridden');
      }
    };
    setInterval(tryInstall, 5);
    // also intercept via the api.js onload callback name (khCN8) - hook global func creation
  });
  page.on('console', m => { const t=m.text(); if (t.includes('TS_')||t.includes('turnstile')) console.log('  [page]', t.slice(0,250)); });
  page.on('requestfailed', r => { if (r.url().includes('dfg')) console.log('  [reqfail]', r.url().slice(0,80), r.failure().errorText); });

  console.log('[1] Loading challenge page...');
  try { await page.goto('https://www.dfg.com.br/', {waitUntil:'domcontentloaded', timeout:60000}); }
  catch(e){ console.log('  goto warn:', e.message); }
  // wait + diagnostics
  let params=null;
  for (let i=0;i<40;i++){
    params = await page.evaluate(()=>window.__tsParams).catch(()=>null);
    const log = await page.evaluate(()=>window.__tsLog).catch(()=>[]);
    const hasTS = await page.evaluate(()=>!!(window.turnstile)).catch(()=>false);
    if (i%5===0) console.log(`  t=${i}s turnstile=${hasTS} params=${!!params} logLen=${log.length}`);
    if (params) { console.log('  PARAMS captured:', JSON.stringify(params).slice(0,250)); break; }
    await new Promise(r=>setTimeout(r,1000));
  }
  if (!params){
    const log = await page.evaluate(()=>window.__tsLog).catch(()=>[]);
    const frames = page.frames().map(f=>f.url());
    console.log('  NO params. log:', JSON.stringify(log).slice(0,400));
    console.log('  frames:', JSON.stringify(frames).slice(0,400));
    const scripts = await page.evaluate(()=>Array.from(document.scripts).map(s=>s.src).filter(Boolean)).catch(()=>[]);
    console.log('  scripts:', JSON.stringify(scripts).slice(0,300));
    fs.writeFileSync('debug_no_params.html', await page.content());
    await browser.close(); process.exit(2);
  }
  const fullURL = page.url();
  console.log('[3] 2Captcha solve for url:', fullURL);
  let sol; try { sol = await solve(fullURL, params.sitekey, params.action, params.cData, params.chlPageData, UA); }
  catch(e){ console.log('  2cap err:', e.message); await browser.close(); process.exit(3); }
  console.log('  token:', sol.token.slice(0,50)+'...', 'ua:', sol.userAgent);
  fs.writeFileSync('last_token.txt', sol.token);
  console.log('[4] Executing callback...');
  const rv = await page.evaluate((tok)=>{ try{ window.__tsCallback(tok); return 'ok'; }catch(e){return 'err:'+e;} }, sol.token);
  console.log('  callback rv:', rv);
  let solved=false;
  for (let i=0;i<25;i++){
    await new Promise(r=>setTimeout(r,1200));
    const cookies = await page.cookies();
    if (cookies.find(c=>c.name==='cf_clearance')){ console.log(`  cf_clearance SET! url=${page.url()}`); solved=true; break; }
  }
  const cookies=await page.cookies(); fs.writeFileSync('cookies.json', JSON.stringify(cookies,null,2));
  console.log('[5] cookies:', JSON.stringify(cookies.map(c=>c.name+'='+c.value.slice(0,12))));
  if (solved){
    console.log('[6] TEST /api/public/users/1 ...');
    const r = await page.goto('https://www.dfg.com.br/api/public/users/1', {waitUntil:'domcontentloaded', timeout:30000}).catch(e=>{console.log('  nav err',e.message);return null;});
    console.log('  status:', r?r.status():'null', 'url:', page.url());
    const text = await page.evaluate(()=>document.body.innerText).catch(()=>'');
    console.log('  body:', text.slice(0,700));
    fs.writeFileSync('users_1.json', text);
  } else { console.log('[6] no cf_clearance. final title:', await page.title().catch(()=>'')); fs.writeFileSync('final.html', await page.content()); }
  await browser.close();
})();
