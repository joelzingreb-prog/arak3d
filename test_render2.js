const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  page.on('console', m => console.log('[console]', m.type(), m.text().slice(0,200)));
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0,300)));
  page.on('requestfailed', r => console.log('[reqfail]', r.url().slice(0,120), r.failure()?.errorText));
  await page.goto('http://localhost:8899/', {waitUntil:'load', timeout:60000});
  await new Promise(r=>setTimeout(r,4000));
  const htmlLen = await page.evaluate(()=>document.documentElement.outerHTML.length);
  const rootHtml = await page.evaluate(()=>document.getElementById('root')?.innerHTML.slice(0,300));
  console.log('HTML len:', htmlLen, 'ROOT:', rootHtml);
  await browser.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
