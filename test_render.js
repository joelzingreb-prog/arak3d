const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width:1280,height:900});
  const apiCalls = [];
  page.on('request', r => { if (r.url().includes('arak.base44.app')) apiCalls.push(r.url()); });
  await page.goto('http://localhost:8899/', {waitUntil:'networkidle2', timeout:60000});
  await new Promise(r=>setTimeout(r,3000));
  const text = await page.evaluate(()=>document.body.innerText.slice(0,600));
  console.log('--- VISIBLE TEXT ---'); console.log(text);
  console.log('--- API CALLS TO BASE44:', apiCalls.length, '---');
  console.log(apiCalls.slice(0,5).join('\n'));
  await page.screenshot({path:'/tmp/home.png'});
  await browser.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
