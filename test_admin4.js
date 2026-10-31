const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  let popupOpened = false;
  page.on('popup', p => { popupOpened = true; console.log('[POPUP!]', p.url()); });
  page.on('framenavigated', f => { if (f === page.mainFrame() && /base44\.app/.test(f.url())) console.log('[NAV to base44!]', f.url()); });
  await page.goto('http://localhost:8899/', {waitUntil:'load', timeout:60000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,2500));
  // 4 clics sur le logo ARAK3D (déclencheur secret admin)
  for (let i=0;i<4;i++){
    const ok = await page.evaluate(() => {
      const els=[...document.querySelectorAll('span,a,h1')];
      const el=els.find(e=>/ARAK/i.test(e.textContent||''));
      if(el){el.click();return true;} return false;
    });
    if(!ok){console.log('logo not found');break;}
    await new Promise(r=>setTimeout(r,200));
  }
  await new Promise(r=>setTimeout(r,800));
  const hasModal = await page.evaluate(()=>!!document.querySelector('input[type="password"]'));
  console.log('modal open:', hasModal);
  if(hasModal){
    await page.evaluate(() => {
      const inp=document.querySelector('input[type="password"]');
      const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(inp,'@48#57a@rak!'); inp.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.evaluate(()=>{const f=document.querySelector('form');if(f)f.requestSubmit();});
    await new Promise(r=>setTimeout(r,10000));
    console.log('URL after submit:', page.url());
    console.log('popup opened:', popupOpened);
    const hint = await page.evaluate(()=>document.body.innerText.match(/.{0,160}(Mot de passe correct|Erreur réseau|ACCESS_DENIED).{0,160}/)?.[0]||'(aucun message erreur)');
    console.log('HINT:', hint.replace(/\n+/g,' | '));
  }
  await browser.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
