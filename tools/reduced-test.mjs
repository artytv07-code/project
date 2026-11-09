import puppeteer from 'puppeteer-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:5173';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const scenes = ['intro', 'city', 'details', 'intrigue', 'invitation', 'panel', 'final'];
for (const scene of scenes) {
  await page.goto(`${BASE}/?scene=${scene}`, { waitUntil: 'networkidle2' });
  await wait(1200);
  const state = await page.evaluate(() => ({
    reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scene: document.querySelector('.scene')?.className,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth,
    text: document.body.innerText.slice(0, 80).replace(/\s+/g, ' '),
    particles: Boolean(document.querySelector('canvas.particles')),
  }));
  console.log(scene, state);
}

await page.screenshot({ path: 'tools/shots/reduced-final.png' });
console.log('errors', errors);
await browser.close();
