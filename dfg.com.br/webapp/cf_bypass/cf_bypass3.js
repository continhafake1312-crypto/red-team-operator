const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const https = require('https');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6723.70 Safari/537.36';
const KEY = fs.readFileSync('/home/ubuntu/.config/opencode/.2captcha_key','utf8').trim();
function httpPost(host,path,body){return new Promise((res,rej)=>{const r=https.request({host,path,method:'POST',headers:{'Content-Type':'application/json'}},x=>{let d='';x.on('data',c=>d+=c);x.on('end',()=>{try{res(JSON.parse(d))}catch(e){res({raw:d})}})});r.on('error',rej);r.write(JSON.stringify(body));r.end();});}
async function solve(url,sk,act,dat,pd,ua){const t={type:'TurnstileTaskProxyless',websiteURL:url,websiteKey:sk,action:act,data:dat,pagedata:pd,userAgent:ua};const c=await httpPost('api.2captcha.com','/createTask',{clientKey:KEY,task:t});console.log('  [2cap] create:',JSON.stringify(c).slice(0,180));if(c.errorId)throw new Error('create:'+c.errorDescription);const t0=Date.now();while(Date.now()-t0<200000){await new Promise(r=>setTimeout(r,4000));const g=await httpPost('api.2captcha.com','/getTaskResult',{clientKey:KEY,taskId:c.taskId});if(g.status==='ready')return g.solution;if(g.errorId)throw new Error('get:'+g.errorDescription);}throw new Error('timeout');}

const FAKE_API = (onload) => `
window.__tsParams=null; window.__tsCallback=null; window.__tsLog=[];
window.turnstile = {
  render: function(a,b){
    window.__tsParams = {sitekey:b&&b.sitekey, cData:b&&b.cData, chlPageData:b&&b.chlPageData, action:b&&b.action, callback:b&&b.callback};
    window.__tsCallback = b&&b.callback;
    window.__tsLog.push('RENDER sitekey='+(b&&b.sitekey)+' cData.len='+((b&&b.cData||'').length)+' chlPageData.len='+((b&&b.chlPageData||'').length)+' action='+(b&&b.action));
    console.log('TS_RENDER:'+JSON.stringify(window.__tsParams));
    return 'foo';
  },
  execute: function(){window.__tsLog.push('execute called');},
  getResponse: function(){return window.__tsToken||'';},
  reset: function(){},
  remove: function(){},
  isExpired: function(){return false;},
  renderContainer: function(){}
};
window.__tsLog.push('fake turnstile installed, onload='+onload);
if (onload && typeof window[onload]==='function'){ try{ window[onload](); window.__tsLog.push('onload invoked'); }catch(e){ window.__tsLog.push('onload err:'+e); } }
console.log('TS_READY');
`;

(async () => {
  const browser = await puppeteer.launch({
    headless:'new', executablePath:'/usr/bin/chromium-browser',
    args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-blink-features=AutomationControlled','--proxy-server=socks5://127.0.0.1:9050','--window-size=1920,1080','--lang=en-US,en']
  });
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({width:1920,height:1080});
  await page.evaluateOnNewDocument(()=>{ Object.defineProperty(navigator,'webdriver',{get:()=>undefined}); });
  page.on('console', m => { const t=m.text(); if (t.startsWith('TS_')) console.log('  [page]', t.slice(0,400)); });
  // request interception: replace turnstile api.js with fake
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.includes('challenges.cloudflare.com/turnstile/v0/') && u.includes('api.js')) {
      const m = u.match(/onload=([a-zA-Z0-9_]+)/);
      const onload = m ? m[1] : '';
      console.log('  [intercept] replacing api.js onload='+onload);
      req.respond({status:200, contentType:'application/javascript', body: FAKE_API(onload)});
      return;
    }
    req.continue();
  });

  console.log('[1] Loading challenge page...');
  try { await page.goto('https://www.dfg.com.br/', {waitUntil:'domcontentloaded', timeout:60000}); }
  catch(e){ console.log('  goto warn:', e.message); }
  let params=null;
  for (let i=0;i<40;i++){
    params = await page.evaluate(()=>window.__tsParams).catch(()=>null);
    if (params) { console.log('  PARAMS:', JSON.stringify(params).slice(0,300)); break; }
    if (i%5===0) console.log(`  t=${i}s waiting for render...`);
    await new Promise(r=>setTimeout(r,1000));
  }
  if (!params){
    const log = await page.evaluate(()=>window.__tsLog).catch(()=>[]);
    console.log('  NO params. log:', JSON.stringify(log).slice(0,500));
    fs.writeFileSync('debug3.html', await page.content());
    await browser.close(); process.exit(2);
  }
  const fullURL = page.url();
  console.log('[3] 2Captcha solve:', fullURL.slice(0,80));
  let sol; try { sol = await solve(fullURL, params.sitekey, params.action, params.cData, params.chlPageData, UA); }
  catch(e){ console.log('  2cap err:', e.message); await browser.close(); process.exit(3); }
  console.log('  token:', sol.token.slice(0,50)+'...', 'ua:', sol.userAgent);
  fs.writeFileSync('last_token.txt', sol.token);
  console.log('[4] Callback...');
  const rv = await page.evaluate((tok)=>{ try{ window.__tsCallback(tok); return 'ok'; }catch(e){return 'err:'+e;} }, sol.token);
  console.log('  callback rv:', rv);
  let solved=false;
  for (let i=0;i<30;i++){
    await new Promise(r=>setTimeout(r,1200));
    const cookies = await page.cookies();
    if (cookies.find(c=>c.name==='cf_clearance')){ console.log(`  cf_clearance SET! url=${page.url()}`); solved=true; break; }
  }
  const cookies=await page.cookies(); fs.writeFileSync('cookies.json', JSON.stringify(cookies,null,2));
  console.log('[5] cookies:', JSON.stringify(cookies.map(c=>c.name+'='+c.value.slice(0,12))));
  if (solved){
    console.log('[6] TEST /api/public/users/1 ...');
    const r = await page.goto('https://api.dfg.com.br/api/public/users/1', {waitUntil:'domcontentloaded', timeout:30000}).catch(e=>{console.log('  nav err',e.message);return null;});
    console.log('  status:', r?r.status():'null', 'url:', page.url());
    const text = await page.evaluate(()=>document.body.innerText).catch(()=>'');
    console.log('  body:', text.slice(0,800));
    fs.writeFileSync('users_1.json', text);
  } else { console.log('[6] no cf_clearance.'); fs.writeFileSync('final3.html', await page.content()); }
  await browser.close();
})();
