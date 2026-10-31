const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  let popupOpened = false;
  page.on('popup', p => { popupOpened = true; console.log('[POPUP!]', p.url()); });
  await page.goto('http://localhost:8899/', {waitUntil:'load', timeout:60000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,2500));
  // ouvrir le modal via React fiber (le trigger est peut-etre un clic long / logo)
  const opened = await page.evaluate(() => {
    const inp = document.querySelector('input[type="password"]');
    if (inp) return 'already';
    // remonter la racine react et trouver AdminModal via ses props? fallback: declencher tous onClick contenant 'admin'
    return 'need-manual';
  });
  console.log('opened:', opened);
  // Injecter directement le state du modal en simulant sur le footer "ACCES"
  const clicked = await page.evaluate(() => {
    const all=[...document.querySelectorAll('*')];
    const el=all.find(e=>e.childElementCount===0 && /accès|access|⌘|admin/i.test(e.textContent||''));
    if(el){el.click();return el.tagName+':'+(el.textContent||'').trim().slice(0,40);}
    return null;
  });
  console.log('clicked:', clicked);
  await new Promise(r=>setTimeout(r,1200));
  let hasModal = await page.evaluate(()=>!!document.querySelector('input[type="password"]'));
  console.log('modal after click:', hasModal);
  if(!hasModal){
    // dernier recours: verifier le code bundle pour le mecanisme d'ouverture
    const html = await page.content();
    console.log('footer snippet:', html.match(/.{80}cc[èe]s.{80}/i)?.[0]);
  } else {
    await page.evaluate(() => {
      const inp=document.querySelector('input[type="password"]');
      const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(inp,'@48#57a@rak!'); inp.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.evaluate(()=>{const f=document.querySelector('form');if(f)f.requestSubmit();});
    await new Promise(r=>setTimeout(r,8000));
    console.log('URL after submit:',page.url());
    console.log('popup opened:',popupOpened);
    const txt=await page.evaluate(()=>document.body.innerText.slice(0,250).replace(/\n+/g,' | '));
    console.log('BODY:',txt);
  }
  await browser.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
