const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs=require('fs'), https=require('https');
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6723.70 Safari/537.36';
const KEY=fs.readFileSync('/home/ubuntu/.config/opencode/.2captcha_key','utf8').trim();
function post(h,p,b){return new Promise((res,rej)=>{const r=https.request({host:h,path:p,method:'POST',headers:{'Content-Type':'application/json'}},x=>{let d='';x.on('data',c=>d+=c);x.on('end',()=>{try{res(JSON.parse(d))}catch(e){res({raw:d})}})});r.on('error',rej);r.write(JSON.stringify(b));r.end();});}
async function solve(url,sk,act,dat,pd,ua){const t={type:'TurnstileTaskProxyless',websiteURL:url,websiteKey:sk,action:act,data:dat,pagedata:pd,userAgent:ua};const c=await post('api.2captcha.com','/createTask',{clientKey:KEY,task:t});console.log('  [2cap] create:',JSON.stringify(c).slice(0,200));if(c.errorId)throw new Error('create:'+c.errorDescription);const t0=Date.now();while(Date.now()-t0<200000){await new Promise(r=>setTimeout(r,4000));const g=await post('api.2captcha.com','/getTaskResult',{clientKey:KEY,taskId:c.taskId});if(g.status==='ready')return g.solution;if(g.errorId)throw new Error('get:'+g.errorCode+':'+g.errorDescription);}throw new Error('timeout');}

(async () => {
  const browser = await puppeteer.launch({
    headless:'new', executablePath:'/usr/bin/chromium-browser',
    args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-blink-features=AutomationControlled','--disable-features=site-per-process,IsolateOrigins','--proxy-server=socks5://127.0.0.1:9050','--window-size=1920,1080','--lang=en-US,en']
  });
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({width:1920,height:1080});
  let widgetId=null, initNextRcV=null;
  await page.evaluateOnNewDocument(()=>{
    Object.defineProperty(navigator,'webdriver',{get:()=>undefined});
    window.__in=[]; window.__widgetId=null;
    window.addEventListener('message',e=>{ let d;try{d=JSON.stringify(e.data)}catch(x){d=String(e.data)} window.__in.push({origin:e.origin,data:d.slice(0,1500)}); if(e.data&&e.data.event==='init'){window.__widgetId=e.data.widgetId;window.__initNextRcV=e.data.nextRcV||'';} },true);
  });
  console.log('[1] load page + capture _cf_chl_opt + widgetId...');
  await page.goto('https://www.dfg.com.br/', {waitUntil:'domcontentloaded', timeout:60000}).catch(e=>console.log('goto',e.message));
  await new Promise(r=>setTimeout(r,7000));
  const o = await page.evaluate(()=>window._cf_chl_opt).catch(()=>({}));
  widgetId = await page.evaluate(()=>window.__widgetId).catch(()=>null);
  initNextRcV = await page.evaluate(()=>window.__initNextRcV).catch(()=>null);
  // map candidate fields by length
  const fields={};
  for (const k of Object.keys(o||{})){ const v=o[k]; if(typeof v==='string' && v.length>100) fields[k]={len:v.length, val:v}; }
  console.log('  widgetId:', widgetId, 'nextRcV:', initNextRcV?initNextRcV.slice(0,40)+'...':'null');
  console.log('  long string fields:', Object.keys(fields).map(k=>k+':'+fields[k].len).join(', '));
  // Heuristic: oPhMk5(1301)=md, OPMWq7(639)=candidate chlPageData. cData maybe empty or nextRcV.
  // Find by length: ~1301 -> md (pagedata candidate), ~639 -> cData candidate
  let md='', cd='';
  for (const k of Object.keys(fields)){ if(fields[k].len>1000) md=fields[k].val; else if(fields[k].len>400 && fields[k].len<900) cd=fields[k].val; }
  console.log('  md(len='+md.length+')=', md.slice(0,40)+'...', ' cd(len='+cd.length+')=', cd.slice(0,40)+'...');
  const fullURL = page.url();
  // Try combo: action=managed, data=cd, pagedata=md
  console.log('[2] 2Captcha solve (action=managed, data=cd, pagedata=md)...');
  let sol=null;
  try { sol = await solve(fullURL, '0x4AAAAAAADnPIDROrmt1Wwj', 'managed', cd, md, UA); }
  catch(e){ console.log('  combo1 err:', e.message); }
  if (!sol){
    // try combo2: data=nextRcV, pagedata=md
    console.log('[2b] retry with data=nextRcV...');
    try { sol = await solve(fullURL, '0x4AAAAAAADnPIDROrmt1Wwj', 'managed', initNextRcV||'', md, UA); }
    catch(e){ console.log('  combo2 err:', e.message); }
  }
  if (!sol){ console.log('  NO token. Aborting.'); fs.writeFileSync('inject_debug.json', JSON.stringify({widgetId,initNextRcV,fields:Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.len]))})); await browser.close(); process.exit(4); }
  console.log('  TOKEN:', sol.token.slice(0,50)+'...', 'ua:', sol.userAgent);
  fs.writeFileSync('last_token2.txt', sol.token);
  console.log('[3] Inject via synthetic postMessage (event:complete)...');
  const rv = await page.evaluate((wid, tok)=>{
    const ifr = document.querySelector('iframe[src*="challenges.cloudflare.com"]');
    const src = ifr?ifr.contentWindow:null;
    const events = ['complete','success','verify'];
    let results=[];
    for (const ev of events){
      try {
        const evt = new MessageEvent('message', { source: src, origin:'https://challenges.cloudflare.com',
          data: {source:'cloudflare-challenge', widgetId:wid, event:ev, token:tok, rcV:tok} });
        window.dispatchEvent(evt);
        results.push(ev+':dispatched');
      } catch(e){ results.push(ev+':err:'+e.message); }
    }
    return results;
  }, widgetId, sol.token);
  console.log('  injection results:', rv);
  // also try direct POST to cUPMDTk
  let cUPMDTk='';
  for (const k of Object.keys(o||{})){ const v=o[k]; if(typeof v==='string' && v.startsWith('/en?__cf_chl_tk=')) cUPMDTk=v; }
  console.log('  cUPMDTk:', cUPMDTk.slice(0,60));
  if (cUPMDTk){
    console.log('[4] direct POST to cUPMDTk with token+md...');
    const postRv = await page.evaluate(async (url, tok, mdv)=>{
      try {
        const body = new URLSearchParams(); body.set('v', tok); body.set('md', mdv);
        const r = await fetch('https://www.dfg.com.br'+url, {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: body.toString(), credentials:'include'});
        return 'status='+r.status+' ct='+r.headers.get('content-type');
      } catch(e){ return 'err:'+e.message; }
    }, cUPMDTk, sol.token, md);
    console.log('  POST result:', postRv);
  }
  // wait + check cf_clearance
  let solved=false;
  for (let i=0;i<20;i++){
    await new Promise(r=>setTimeout(r,1200));
    const cookies=await page.cookies();
    if (cookies.find(c=>c.name==='cf_clearance')){ console.log('  cf_clearance SET @ '+(i*1.2)+'s!'); solved=true; break; }
  }
  const cookies=await page.cookies(); fs.writeFileSync('cookies_inject.json', JSON.stringify(cookies,null,2));
  console.log('[5] solved='+solved+' cookies:', cookies.map(c=>c.name).join(','));
  if (solved){
    console.log('[6] TEST /api/public/users/1');
    await page.goto('https://www.dfg.com.br/api/public/users/1',{waitUntil:'domcontentloaded',timeout:30000}).catch(e=>console.log('nav',e.message));
    const t=await page.evaluate(()=>document.body.innerText).catch(()=>'');
    console.log('  body:', t.slice(0,600));
    fs.writeFileSync('users_1_inject.json', t);
  }
  await browser.close();
})();
