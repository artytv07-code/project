import puppeteer from 'puppeteer-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://127.0.0.1:5173';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
});

async function pageAt(width, height, mobile = true) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  page.on('pageerror', (e) => console.log('PAGEERROR', String(e)));
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  return page;
}

const page = await pageAt(390, 844);

for (const [scene, ms] of [['intrigue', 3000], ['panel', 2000], ['final', 4000], ['invitation', 3500], ['city', 4300]]) {
  await page.goto(`${BASE}/?scene=${scene}`, { waitUntil: 'networkidle2' });
  await wait(ms);
  await page.screenshot({ path: `tools/shots/check-390-${scene}.png` });
}

const panelMetrics = await page.evaluate(() => {
  const scroll = document.querySelector('.scene__scroll');
  const cta = document.querySelector('.panel__actions .btn');
  return {
    scrollHeight: scroll?.scrollHeight,
    clientHeight: scroll?.clientHeight,
    ctaBottom: cta?.getBoundingClientRect().bottom,
    viewport: innerHeight,
  };
});
console.log('PANEL', panelMetrics);

await page.goto(BASE, { waitUntil: 'networkidle2' });
await page.waitForFunction(() => document.body.innerText.includes('Посмотреть, что дальше'), { timeout: 10000 });
const box = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Посмотреть, что дальше'));
  const r = btn.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
await page.mouse.click(box.x, box.y);
await wait(2500);
const audio = await page.evaluate(() => {
  const btn = document.querySelector('.audio-control');
  return {
    pressed: btn?.getAttribute('aria-pressed'),
    label: btn?.getAttribute('aria-label'),
    scene: document.querySelector('.scene')?.className,
  };
});
console.log('AUDIO', audio);
await page.screenshot({ path: 'tools/shots/check-390-audio.png' });
await page.close();

const small = await pageAt(320, 568);
await small.goto(`${BASE}/?scene=intro`, { waitUntil: 'networkidle2' });
await wait(3200);
await small.screenshot({ path: 'tools/shots/check-320-intro.png' });
const introMetrics = await small.evaluate(() => {
  const scroll = document.querySelector('.scene__scroll');
  const title = document.querySelector('.intro__center .display')?.getBoundingClientRect();
  const lead = document.querySelector('.intro__center .lead')?.getBoundingClientRect();
  return {
    scrollHeight: scroll?.scrollHeight,
    clientHeight: scroll?.clientHeight,
    titleBottom: title?.bottom,
    leadTop: lead?.top,
    gap: lead && title ? lead.top - title.bottom : null,
  };
});
console.log('INTRO 320', introMetrics);
await small.close();

await browser.close();
