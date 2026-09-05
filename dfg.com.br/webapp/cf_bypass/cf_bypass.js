// Cloudflare managed-challenge bypass via 2Captcha Turnstile (proxyless).
// Flow: puppeteer loads page (Tor) -> intercept turnstile.render -> grab
// {sitekey,cData,chlPageData,action} + callback -> 2Captcha TurnstileTaskProxyless
// (with userAgent) -> execute callback(token) -> CF sets cf_clearance -> navigate to targets.
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const https = require('https');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6723.70 Safari/537.36';
const KEY = fs.readFileSync('/home/ubuntu/.config/opencode/.2captcha_key','utf8').trim();

function httpPost(host, path, body, headers={}) {
  return new Promise((res,rej)=>{
    const req = https.request({host, path, method:'POST', headers:{'Content-Type':'application/json',...headers}}, r=>{
      let d=''; r.on('data',c=>d+=c); r.on('end',()=>res(JSON.parse(d)));
    }); req.on('error',rej); req.write(JSON.stringify(body)); req.end();
  });
}
async function solveTurnstile(websiteURL, websiteKey, action, data, pagedata, userAgent) {
  const task={type:'TurnstileTaskProxyless', websiteURL, websiteKey, action, data, pagedata, userAgent};
  const c = await httpPost('api.2captcha.com','/createTask', {clientKey:KEY, task});
  console.log('  [2cap] createTask:', JSON.stringify(c).slice(0,200));
  if (c.errorId) throw new Error('createTask: '+c.errorDescription);
  const t0=Date.now();
  while (Date.now()-t0 < 200000) {
    await new Promise(r=>setTimeout(r,4000));
    const g = await httpPost('api.2captcha.com','/getTaskResult', {clientKey:KEY, taskId:c.taskId});
    if (g.status==='ready') return g.solution;
    if (g.errorId) throw new Error('getTask: '+g.errorDescription);
  }
  throw new Error('timeout');
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new', executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled','--proxy-server=socks5://127.0.0.1:9050',
      '--window-size=1920,1080','--lang=en-US,en']
  });
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({width:1920,height:1080});
  // Inject interceptor before any script runs
  await page.evaluateOnNewDocument(()=>{
    Object.defineProperty(navigator,'webdriver',{get:()=>undefined});
    window.__tsParams = null; window.__tsCallback = null;
    const i = setInterval(()=>{
      if (window.turnstile) {
        clearInterval(i);
        const orig = window.turnstile.render;
        window.turnstile.render = (a,b) => {
          window.__tsParams = {sitekey:b.sitekey, cData:b.cData, chlPageData:b.chlPageData, action:b.action};
          window.__tsCallback = b.callback;
          console.log('TS_PARAMS:'+JSON.stringify(window.__tsParams));
          return 'foo';
        };
      }
    }, 5);
  });
  page.on('console', m => { const t=m.text(); if (t.startsWith('TS_PARAMS:')) console.log('  [page]', t.slice(0,300)); });

  console.log('[1] Loading challenge page via Tor...');
  try {
    await page.goto('https://www.dfg.com.br/', {waitUntil:'domcontentloaded', timeout:60000});
  } catch(e){ console.log('  goto warn:', e.message); }
  // wait for params to appear
  let params=null;
  for (let i=0;i<30;i++){
    params = await page.evaluate(()=>window.__tsParams).catch(()=>null);
    if (params) break;
    await new Promise(r=>setTimeout(r,1000));
  }
  if (!params){ console.log('  NO turnstile params captured. Aborting.'); await browser.close(); process.exit(2); }
  console.log('[2] Captured turnstile params:', JSON.stringify(params).slice(0,300));
  const fullURL = page.url();
  console.log('  challenge url:', fullURL);

  console.log('[3] Submitting to 2Captcha...');
  let sol;
  try { sol = await solveTurnstile(fullURL, params.sitekey, params.action, params.cData, params.chlPageData, UA); }
  catch(e){ console.log('  2captcha err:', e.message); await browser.close(); process.exit(3); }
  console.log('  [2cap] token:', sol.token.slice(0,60)+'...', 'ua:', sol.userAgent);
  fs.writeFileSync('last_token.txt', sol.token);

  console.log('[4] Executing callback with token...');
  const rv = await page.evaluate((tok)=>{ try { window.__tsCallback(tok); return 'ok'; } catch(e){ return 'err:'+e; } }, sol.token);
  console.log('  callback rv:', rv);
  // wait for CF to set cf_clearance + redirect
  let solved=false;
  for (let i=0;i<20;i++){
    await new Promise(r=>setTimeout(r,1500));
    const title = await page.title().catch(()=>'');
    const cookies = await page.cookies();
    const has = cookies.find(c=>c.name==='cf_clearance');
    if (has){ console.log(`  cf_clearance SET at ${i*1.5}s! url=${page.url()}`); solved=true; break; }
    if (!title.includes('moment') && !title.includes('Just a')){ console.log(`  title changed to "${title}" url=${page.url()}`); }
  }
  const cookies = await page.cookies();
  fs.writeFileSync('cookies.json', JSON.stringify(cookies,null,2));
  console.log('[5] Final cookies:', JSON.stringify(cookies.map(c=>c.name+'='+c.value.slice(0,15))));
  console.log('  final url:', page.url(), 'title:', await page.title().catch(()=>''));
  fs.writeFileSync('final_page.html', await page.content());
  if (solved){
    console.log('[6] BYPASS SUCCESS. Testing /api/public/users/1 ...');
    await page.goto('https://www.dfg.com.br/api/public/users/1', {waitUntil:'domcontentloaded', timeout:30000}).catch(e=>console.log('  nav err',e.message));
    const body = await page.content();
    const text = await page.evaluate(()=>document.body.innerText).catch(()=>'');
    console.log('  /api/public/users/1 status url:', page.url());
    console.log('  body text (first 600):', text.slice(0,600));
    fs.writeFileSync('users_1.json', text);
  } else {
    console.log('[6] BYPASS FAILED (no cf_clearance).');
  }
  await browser.close();
})();
