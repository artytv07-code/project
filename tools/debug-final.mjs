import puppeteer from 'puppeteer-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
page.on('console', (m) => console.log('CONSOLE', m.type(), m.text()));
page.on('pageerror', (e) => console.log('PAGEERROR', String(e)));
await page.goto('http://127.0.0.1:5173/?scene=panel', { waitUntil: 'networkidle2' });
await wait(1500);
console.log('before', await page.evaluate(() => document.body.innerText.slice(0, 120)));
const clickInfo = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  const btn = btns.find((b) => b.textContent?.includes('Мне нравится эта идея'));
  if (!btn) return 'no button';
  const r = btn.getBoundingClientRect();
  return { text: btn.textContent, rect: r.toJSON(), top: document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.outerHTML?.slice(0, 200) };
});
console.log('button', clickInfo);
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Мне нравится эта идея'));
  btn?.click();
});
await wait(1200);
console.log('after 1.2s', await page.evaluate(() => document.body.innerText.slice(0, 200)));
await wait(2000);
console.log('after 3.2s', await page.evaluate(() => document.body.innerText.slice(0, 200)));
await page.screenshot({ path: 'tools/shots/debug-final.png' });
await browser.close();
