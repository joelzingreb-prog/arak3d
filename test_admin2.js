const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  let popupOpened = false;
  page.on('popup', p => { popupOpened = true; console.log('[POPUP!]', p.url()); });
  await page.goto('http://localhost:8899/', {waitUntil:'load', timeout:60000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,3000));
  // Forcer l'ouverture du modal via dispatch d'un event custom ou clic sur le footer
  const trigger = await page.evaluate(() => {
    // chercher un élément qui ouvre AdminModal (Footer "Admin" ou lien caché)
    const all=[...document.querySelectorAll('a,button,[role=button]')];
    const el=all.find(e=>/accès admin|admin/i.test((e.textContent||'')+(e.getAttribute('aria-label')||'')));
    if(el){el.click();return 'clicked:'+el.textContent.trim().slice(0,30);}
    return 'notfound';
  });
  console.log('trigger:',trigger);
  await new Promise(r=>setTimeout(r,1000));
  const hasModal = await page.evaluate(()=>!!document.querySelector('input[type="password"]'));
  console.log('modal password field:',hasModal);
  if(hasModal){
    await page.evaluate(() => {
      const inp=document.querySelector('input[type="password"]');
      const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(inp,'@48#57a@rak!'); inp.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.evaluate(()=>{const f=document.querySelector('form');if(f)f.requestSubmit();});
    await new Promise(r=>setTimeout(r,8000));
    console.log('URL after submit:',page.url());
    console.log('popup opened:',popupOpened);
    const txt=await page.evaluate(()=>document.body.innerText.slice(0,200).replace(/\n+/g,' | '));
    console.log('BODY:',txt);
  }
  await browser.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
