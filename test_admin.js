const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  let popupOpened = false;
  page.on('popup', p => { popupOpened = true; console.log('[POPUP!]', p.url()); });
  await page.goto('http://localhost:8899/', {waitUntil:'networkidle2', timeout:60000}).catch(()=>{});
  // Ouvrir le modal admin via le lien/navbar "admin"
  const found = await page.evaluate(() => {
    const els = [...document.querySelectorAll('a,button')];
    const el = els.find(e => /admin/i.test(e.textContent) || /admin/i.test(e.getAttribute('href')||''));
    if (el) { el.click(); return el.textContent.trim() || el.getAttribute('href'); }
    return null;
  });
  console.log('admin trigger:', found);
  await new Promise(r=>setTimeout(r,1500));
  // taper le mot de passe
  const typed = await page.evaluate(() => {
    const inp = document.querySelector('input[type="password"]');
    if (!inp) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(inp, '@48#57a@rak!');
    inp.dispatchEvent(new Event('input',{bubbles:true}));
    return true;
  });
  console.log('typed password:', typed);
  await page.evaluate(() => { const f=document.querySelector('form'); if(f) f.requestSubmit(); });
  await new Promise(r=>setTimeout(r,6000));
  console.log('URL after submit:', page.url());
  console.log('popup opened:', popupOpened);
  const body = await page.evaluate(()=>document.body.innerText.slice(0,400));
  console.log('BODY:', body.replace(/\n+/g,' | ').slice(0,300));
  await browser.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
